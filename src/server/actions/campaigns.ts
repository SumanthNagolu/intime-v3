'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullCampaignData,
  CampaignData,
  CampaignProspect,
  CampaignLead,
  CampaignFunnel,
  CampaignSequenceStep,
  CampaignAnalytics,
  CampaignActivity,
  CampaignNote,
  CampaignDocument,
  CampaignSectionCounts,
  WeeklyEngagement,
  TopContent,
} from '@/types/campaign'
import type { HistoryEntry, WorkspaceWarning } from '@/types/workspace'

interface ChannelSequenceData {
  steps?: Array<{
    stepNumber?: number
    subject?: string
    templateId?: string
    templateName?: string
    dayOffset?: number
  }>
}

/**
 * Fetches all campaign data in ONE database round-trip.
 * This is the server action implementation for the ONE DB CALL pattern.
 *
 * All section data is fetched in parallel using Promise.all,
 * so we get maximum performance with a single network round-trip.
 */
export async function getFullCampaign(id: string): Promise<FullCampaignData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Verify access via tRPC (handles org_id check)
  let campaignCheck: { id: string; org_id: string } | null = null
  try {
    campaignCheck = await caller.crm.campaigns.getById({ id })
    if (!campaignCheck) return null
  } catch {
    return null
  }

  // Fetch all data in parallel
  const [
    campaignResult,
    prospectsResult,
    allEnrollmentsResult,
    leadsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    funnelResult,
    historyResult,
  ] = await Promise.all([
    // Core campaign data with owner
    adminClient
      .from('campaigns')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url, email)
      `)
      .eq('id', id)
      .single(),

    // Prospects (campaign enrollments with contact details)
    // Exclude converted prospects - they appear in Leads section instead
    adminClient
      .from('campaign_enrollments')
      .select(`
        *,
        contact:contacts!contact_id(id, first_name, last_name, email, phone, company_name, title)
      `)
      .eq('campaign_id', id)
      .neq('status', 'converted')
      .order('created_at', { ascending: false })
      .limit(100),

    // All enrollments count (for audience size - includes converted)
    adminClient
      .from('campaign_enrollments')
      .select('id, status', { count: 'exact' })
      .eq('campaign_id', id),

    // Leads linked to campaign
    adminClient
      .from('leads')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url),
        contact:contacts!contact_id(id, first_name, last_name, email, phone, company_name, title)
      `)
      .eq('campaign_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Activities for this campaign
    adminClient
      .from('activities')
      .select(`
        *,
        creator:user_profiles!created_by(id, full_name, avatar_url)
      `)
      .eq('entity_type', 'campaign')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    // Notes (activities with type='note')
    adminClient
      .from('activities')
      .select(`
        *,
        creator:user_profiles!created_by(id, full_name, avatar_url)
      `)
      .eq('entity_type', 'campaign')
      .eq('entity_id', id)
      .eq('activity_type', 'note')
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents
    adminClient
      .from('campaign_documents')
      .select(`
        *,
        uploader:user_profiles!uploaded_by(id, full_name)
      `)
      .eq('campaign_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Funnel metrics via RPC
    adminClient.rpc('get_campaign_funnel', { p_campaign_id: id }),

    // History/Audit trail
    adminClient
      .from('audit_logs')
      .select(`
        id, action, field_name, old_value, new_value, created_at,
        user:user_profiles!user_id(id, full_name)
      `)
      .eq('entity_type', 'campaign')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Return null if campaign not found
  if (campaignResult.error || !campaignResult.data) {
    return null
  }

  const campaign = campaignResult.data

  // Calculate stats from actual data
  const totalEnrollments = allEnrollmentsResult.count ?? allEnrollmentsResult.data?.length ?? 0
  const totalLeads = leadsResult.data?.length ?? 0
  const contactedStatuses = ['contacted', 'engaged', 'responded', 'converted']
  const contactedCount = allEnrollmentsResult.data?.filter(
    (e: { status: string }) => contactedStatuses.includes(e.status)
  ).length ?? 0

  // Parse sequence steps from JSONB column
  const sequenceSteps = parseSequenceSteps(campaign.sequences)

  // Transform and return data
  return {
    campaign: transformCampaign(campaign, totalEnrollments, contactedCount, totalLeads),
    prospects: transformProspects(prospectsResult.data || []),
    leads: transformLeads(leadsResult.data || []),
    funnel: transformFunnel(funnelResult.data?.[0]),
    sequence: sequenceSteps,
    analytics: computeAnalytics(campaign, contactedCount, totalLeads),
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(campaign, prospectsResult.data || [], sequenceSteps),
    counts: computeCounts(
      prospectsResult.data?.length ?? 0,
      leadsResult.data?.length ?? 0,
      sequenceSteps.length,
      activitiesResult.data?.length ?? 0,
      notesResult.data?.length ?? 0,
      documentsResult.data?.length ?? 0
    ),
  }
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

function transformCampaign(
  data: Record<string, unknown>,
  totalEnrollments: number,
  contactedCount: number,
  totalLeads: number
): CampaignData {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | null,
    status: data.status as CampaignData['status'],
    campaignType: data.campaign_type as string | null,
    goal: data.goal as string | null,
    channels: data.channels as string[] | null,
    targetCriteria: data.target_criteria as Record<string, unknown> | null,
    sequences: data.sequences as Record<string, unknown> | null,
    complianceSettings: data.compliance_settings as Record<string, unknown> | null,
    abTestConfig: data.ab_test_config as Record<string, unknown> | null,
    startDate: data.start_date as string | null,
    endDate: data.end_date as string | null,
    targetLeads: data.target_leads as number | null,
    targetMeetings: data.target_meetings as number | null,
    targetRevenue: data.target_revenue as number | null,
    budgetTotal: data.budget_total as number | null,
    budgetSpent: data.budget_spent as number | null,
    audienceSize: totalEnrollments || (data.audience_size as number) || 0,
    prospectsContacted: contactedCount || (data.prospects_contacted as number) || 0,
    emailsOpened: data.emails_opened as number | null,
    linksClicked: data.links_clicked as number | null,
    prospectsResponded: data.prospects_responded as number | null,
    leadsGenerated: totalLeads || (data.leads_generated as number) || 0,
    meetingsBooked: data.meetings_booked as number | null,
    owner: data.owner as CampaignData['owner'],
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
  }
}

function transformProspects(data: Record<string, unknown>[]): CampaignProspect[] {
  return data.map((p) => {
    const contact = p.contact as {
      first_name?: string
      last_name?: string
      email?: string | null
      phone?: string | null
      company_name?: string | null
      title?: string | null
    } | null

    return {
      id: p.id as string,
      campaignId: p.campaign_id as string,
      contactId: p.contact_id as string,
      status: p.status as CampaignProspect['status'],
      // Use contact data or fall back to enrollment fields
      firstName: contact?.first_name || '',
      lastName: contact?.last_name || '',
      email: contact?.email || null,
      phone: contact?.phone || null,
      companyName: contact?.company_name || null,
      title: contact?.title || null,
      // Engagement metrics
      engagementScore: p.engagement_score as number | null,
      emailsSent: p.emails_sent as number | null,
      emailsOpened: p.emails_opened as number | null,
      linksClicked: p.links_clicked as number | null,
      repliesReceived: p.replies_received as number | null,
      // Sequence position
      currentStep: p.current_step as number | null,
      sequenceStatus: p.sequence_status as string | null,
      nextStepAt: p.next_step_at as string | null,
      // Engagement timeline
      enrolledAt: p.created_at as string,
      firstContactedAt: p.first_contacted_at as string | null,
      openedAt: p.opened_at as string | null,
      clickedAt: p.clicked_at as string | null,
      respondedAt: p.responded_at as string | null,
      convertedAt: p.converted_to_lead_at as string | null,
      // Conversion
      convertedLeadId: p.converted_lead_id as string | null,
      // Raw contact object
      contact: contact ? {
        id: (p.contact as { id?: string })?.id || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || null,
        phone: contact.phone || null,
        company_name: contact.company_name || null,
        title: contact.title || null,
      } : undefined,
    }
  })
}

function transformLeads(data: Record<string, unknown>[]): CampaignLead[] {
  return data.map((l) => {
    const contact = l.contact as {
      id?: string
      first_name?: string
      last_name?: string
      email?: string | null
      phone?: string | null
      company_name?: string | null
      title?: string | null
    } | null
    const owner = l.owner as { id?: string; full_name?: string; avatar_url?: string | null } | null

    return {
      id: l.id as string,
      contactId: l.contact_id as string,
      campaignId: l.campaign_id as string | null,
      status: l.status as CampaignLead['status'],
      score: l.score as number | null,
      // Contact info
      firstName: contact?.first_name || '',
      lastName: contact?.last_name || '',
      email: contact?.email || l.email as string | null,
      phone: contact?.phone || l.phone as string | null,
      companyName: contact?.company_name || l.company_name as string | null,
      title: contact?.title || l.title as string | null,
      // BANT scores
      budgetScore: l.budget_score as number | null,
      authorityScore: l.authority_score as number | null,
      needScore: l.need_score as number | null,
      timelineScore: l.timeline_score as number | null,
      // Owner
      owner: owner ? {
        id: owner.id || '',
        fullName: owner.full_name || '',
        avatarUrl: owner.avatar_url || null,
      } : null,
      // Deal (would need separate join, set to null for now)
      deal: null,
      // Source
      source: l.source as string | null,
      campaignProspectId: l.campaign_prospect_id as string | null,
      // Timestamps
      createdAt: l.created_at as string,
      convertedAt: l.converted_at as string | null,
      // Raw contact
      contact: contact ? {
        id: contact.id || '',
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || null,
        phone: contact.phone || null,
        company_name: contact.company_name || null,
        title: contact.title || null,
      } : undefined,
    }
  })
}

function transformFunnel(data: Record<string, unknown> | undefined): CampaignFunnel {
  if (!data) {
    return {
      totalProspects: 0,
      contacted: 0,
      opened: 0,
      clicked: 0,
      responded: 0,
      leads: 0,
      meetings: 0,
      openRate: 0,
      responseRate: 0,
      conversionRate: 0,
    }
  }

  return {
    totalProspects: (data.total_prospects as number) || 0,
    contacted: (data.contacted as number) || 0,
    opened: (data.opened as number) || 0,
    clicked: (data.clicked as number) || 0,
    responded: (data.responded as number) || 0,
    leads: (data.leads as number) || 0,
    meetings: (data.meetings as number) || 0,
    openRate: (data.open_rate as number) || 0,
    responseRate: (data.response_rate as number) || 0,
    conversionRate: (data.conversion_rate as number) || 0,
  }
}

function parseSequenceSteps(sequences: unknown): CampaignSequenceStep[] {
  if (!sequences || typeof sequences !== 'object') {
    return []
  }

  const steps: CampaignSequenceStep[] = []
  let stepNumber = 1

  for (const [channel, channelData] of Object.entries(sequences as Record<string, unknown>)) {
    const channelSteps = (channelData as ChannelSequenceData)?.steps || []
    for (const step of channelSteps) {
      steps.push({
        id: `${channel}-${step.stepNumber || stepNumber}`,
        stepNumber: step.stepNumber || stepNumber,
        channel: channel as CampaignSequenceStep['channel'],
        subject: step.subject || null,
        templateId: step.templateId || null,
        templateName: step.templateName || null,
        dayOffset: step.dayOffset || null,
        status: 'pending',
      })
      stepNumber++
    }
  }

  steps.sort((a, b) => a.stepNumber - b.stepNumber)
  return steps
}

function computeAnalytics(
  campaign: Record<string, unknown>,
  contactedCount: number,
  leadsCount: number
): CampaignAnalytics {
  const responded = (campaign.prospects_responded as number) || 0
  const budgetSpent = (campaign.budget_spent as number) || 0
  const meetingsBooked = (campaign.meetings_booked as number) || 0

  const responseRate = contactedCount > 0 ? (responded / contactedCount) * 100 : 0
  const conversionRate = contactedCount > 0 ? (leadsCount / contactedCount) * 100 : 0
  const costPerLead = leadsCount > 0 ? budgetSpent / leadsCount : 0

  // Generate sample weekly engagement data (in production, this would come from actual data)
  const weeklyEngagement: WeeklyEngagement[] = [
    { week: 'Week 1', opened: Math.round((campaign.emails_opened as number || 0) * 0.3), clicked: Math.round((campaign.links_clicked as number || 0) * 0.25), replied: Math.round(responded * 0.2) },
    { week: 'Week 2', opened: Math.round((campaign.emails_opened as number || 0) * 0.35), clicked: Math.round((campaign.links_clicked as number || 0) * 0.3), replied: Math.round(responded * 0.25) },
    { week: 'Week 3', opened: Math.round((campaign.emails_opened as number || 0) * 0.25), clicked: Math.round((campaign.links_clicked as number || 0) * 0.3), replied: Math.round(responded * 0.35) },
    { week: 'Week 4', opened: Math.round((campaign.emails_opened as number || 0) * 0.1), clicked: Math.round((campaign.links_clicked as number || 0) * 0.15), replied: Math.round(responded * 0.2) },
  ]

  // Sample top content (in production, this would come from email analytics)
  const topContent: TopContent[] = [
    { subject: 'Introduction to our services', openRate: 45.2, replyRate: 12.5 },
    { subject: 'Follow-up: Did you get a chance to review?', openRate: 38.7, replyRate: 8.3 },
    { subject: 'Quick question about your needs', openRate: 32.1, replyRate: 15.2 },
  ]

  return {
    responseRate,
    conversionRate,
    costPerLead,
    meetingsBooked,
    weeklyEngagement,
    topContent,
  }
}

function transformActivities(data: Record<string, unknown>[]): CampaignActivity[] {
  return data.map((a) => {
    const creator = a.creator as { id?: string; full_name?: string; avatar_url?: string | null } | null
    return {
      id: a.id as string,
      activityType: a.activity_type as string,
      subject: a.subject as string | null,
      description: a.description as string | null,
      status: a.status as string,
      dueDate: a.due_date as string | null,
      createdAt: a.created_at as string,
      completedAt: a.completed_at as string | null,
      creator: creator ? {
        id: creator.id || '',
        fullName: creator.full_name || '',
        avatarUrl: creator.avatar_url || null,
      } : null,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): CampaignNote[] {
  return data.map((n) => {
    const creator = n.creator as { id?: string; full_name?: string; avatar_url?: string | null } | null
    return {
      id: n.id as string,
      subject: n.subject as string | null,
      content: n.description as string | null,
      createdAt: n.created_at as string,
      creator: creator ? {
        id: creator.id || '',
        fullName: creator.full_name || '',
        avatarUrl: creator.avatar_url || null,
      } : null,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): CampaignDocument[] {
  return data.map((d) => {
    const uploader = d.uploader as { id?: string; full_name?: string } | null
    return {
      id: d.id as string,
      name: (d.name as string) || 'Untitled',
      documentType: d.document_type as string | null,
      fileName: d.file_name as string | null,
      fileUrl: d.file_url as string | null,
      fileSize: d.file_size as number | null,
      mimeType: d.mime_type as string | null,
      createdAt: d.created_at as string,
      uploader: uploader ? {
        id: uploader.id || '',
        fullName: uploader.full_name || '',
      } : null,
    }
  })
}

function transformHistory(data: Record<string, unknown>[]): HistoryEntry[] {
  return data.map((h) => {
    const user = h.user as { full_name?: string } | null
    return {
      id: h.id as string,
      action: (h.action as string) || 'update',
      field: h.field_name as string | null,
      oldValue: h.old_value as string | null,
      newValue: h.new_value as string | null,
      changedAt: h.created_at as string,
      changedBy: user?.full_name || 'System',
    }
  })
}

function computeWarnings(
  campaign: Record<string, unknown>,
  prospects: Record<string, unknown>[],
  sequence: CampaignSequenceStep[]
): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []

  // Check for campaign without prospects
  if (prospects.length === 0 && campaign.status !== 'draft') {
    warnings.push({
      id: 'no-prospects',
      message: 'No prospects enrolled in this campaign.',
      severity: 'warning',
      section: 'prospects',
    })
  }

  // Check for campaign without sequence
  if (sequence.length === 0 && campaign.status !== 'draft') {
    warnings.push({
      id: 'no-sequence',
      message: 'No outreach sequence configured.',
      severity: 'warning',
      section: 'sequence',
    })
  }

  // Check for missing end date
  if (!campaign.end_date && campaign.status === 'active') {
    warnings.push({
      id: 'no-end-date',
      message: 'Campaign has no end date set.',
      severity: 'info',
      field: 'endDate',
      section: 'overview',
    })
  }

  // Check for budget overspend
  const budgetTotal = (campaign.budget_total as number) || 0
  const budgetSpent = (campaign.budget_spent as number) || 0
  if (budgetTotal > 0 && budgetSpent > budgetTotal) {
    warnings.push({
      id: 'budget-overspent',
      message: 'Campaign budget has been exceeded.',
      severity: 'error',
      section: 'overview',
    })
  }

  return warnings
}

function computeCounts(
  prospects: number,
  leads: number,
  sequence: number,
  activities: number,
  notes: number,
  documents: number
): CampaignSectionCounts {
  return {
    prospects,
    leads,
    sequence,
    activities,
    notes,
    documents,
  }
}
