'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullLeadData,
  LeadData,
  LeadContactInfo,
  LeadEngagement,
  LeadDeal,
  LeadCampaign,
  LeadMeeting,
  LeadActivity,
  LeadNote,
  LeadDocument,
} from '@/types/lead'
import type { HistoryEntry, WorkspaceWarning } from '@/types/workspace'

/**
 * Fetches all lead data in ONE database round-trip.
 * Follows the ONE DB CALL pattern established by Account workspace.
 */
export async function getFullLead(id: string): Promise<FullLeadData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Verify access and get lead via tRPC (respects org_id filtering)
  let leadRecord: Record<string, unknown>
  try {
    const result = await caller.unifiedContacts.leads.getById({ id })
    if (!result) return null
    leadRecord = result as Record<string, unknown>
  } catch {
    return null
  }

  // Fetch all related data in parallel
  const [
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
    dealResult,
    allDealsResult,
    meetingsResult,
    campaignsResult,
  ] = await Promise.all([
    // Activities (for both engagement timeline and activities section)
    adminClient
      .from('activities')
      .select(`
        id, activity_type, subject, description, due_date, status, created_at,
        assigned_to:user_profiles!activities_assigned_to_fkey(id, full_name),
        creator:user_profiles!activities_created_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Notes
    adminClient
      .from('notes')
      .select(`
        id, content, is_pinned, created_at,
        creator:user_profiles!notes_created_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents
    adminClient
      .from('documents')
      .select(`
        id, name, document_type, file_size, file_url, created_at,
        uploader:user_profiles!documents_uploaded_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false })
      .limit(50),

    // History/Audit trail
    adminClient
      .from('audit_logs')
      .select(`
        id, action, field_name, old_value, new_value, created_at,
        user:user_profiles!audit_logs_user_id_fkey(id, full_name)
      `)
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    // Deal (if converted) - for singular deal reference
    leadRecord.lead_converted_to_deal_id
      ? adminClient
          .from('deals')
          .select(`
            id, name, stage, amount, probability, expected_close_date, next_step,
            owner:user_profiles!deals_owner_id_fkey(id, full_name)
          `)
          .eq('id', leadRecord.lead_converted_to_deal_id as string)
          .is('deleted_at', null)
          .single()
      : Promise.resolve({ data: null, error: null }),

    // All deals associated with this lead (via lead_contact_id)
    adminClient
      .from('deals')
      .select(`
        id, name, stage, amount, probability, expected_close_date, next_step, created_at,
        owner:user_profiles!deals_owner_id_fkey(id, full_name)
      `)
      .eq('lead_contact_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20),

    // Meetings (activities with type = 'meeting')
    adminClient
      .from('activities')
      .select(`
        id, subject, activity_type, status, scheduled_at, scheduled_for, duration_minutes,
        outcome, outcome_notes, description, created_at,
        assigned_to:user_profiles!activities_assigned_to_fkey(id, full_name, email),
        creator:user_profiles!activities_created_by_fkey(id, full_name, email)
      `)
      .eq('entity_type', 'lead')
      .eq('entity_id', id)
      .eq('activity_type', 'meeting')
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Campaigns (source campaign via campaign_enrollments)
    adminClient
      .from('campaign_enrollments')
      .select(`
        id, enrolled_at, converted_to_lead_at,
        campaign:campaigns!campaign_enrollments_campaign_id_fkey(id, name, status, type, channel)
      `)
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('enrolled_at', { ascending: false })
      .limit(10),
  ])

  return {
    lead: transformLead(leadRecord),
    contact: transformContact(leadRecord),
    engagement: transformEngagement(activitiesResult.data || []),
    deal: dealResult.data ? transformDeal(dealResult.data as Record<string, unknown>) : null,
    deals: transformDeals(allDealsResult.data || []),
    meetings: transformMeetings(meetingsResult.data || []),
    campaigns: transformCampaigns(campaignsResult.data || []),
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(leadRecord),
  }
}

// Transform functions
function transformLead(data: Record<string, unknown>): LeadData {
  const owner = data.owner as { id?: string; full_name?: string; avatar_url?: string } | null
  return {
    id: data.id as string,
    firstName: (data.first_name as string) || '',
    lastName: (data.last_name as string) || '',
    fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: data.email as string | null,
    phone: data.phone as string | null,
    title: data.title as string | null,
    companyName: data.company_name as string | null,
    industry: data.industry as string | null,
    // Lead-specific
    status: (data.lead_status as string) || 'new',
    source: data.lead_source as string | null,
    score: data.lead_score as number | null,
    estimatedValue: data.lead_estimated_value as number | null,
    estimatedCloseDate: data.lead_estimated_close_date as string | null,
    probability: data.lead_probability as number | null,
    // BANT
    bantBudget: data.bant_budget as number | null,
    bantAuthority: data.bant_authority as number | null,
    bantNeed: data.bant_need as number | null,
    bantTimeline: data.bant_timeline as number | null,
    bantTotalScore: data.bant_total_score as number | null,
    bantBudgetNotes: data.bant_budget_notes as string | null,
    bantAuthorityNotes: data.bant_authority_notes as string | null,
    bantNeedNotes: data.bant_need_notes as string | null,
    bantTimelineNotes: data.bant_timeline_notes as string | null,
    // Qualification
    qualificationResult: data.qualification_result as string | null,
    qualificationNotes: data.qualification_notes as string | null,
    qualifiedAt: data.qualified_at as string | null,
    qualifiedBy: data.qualified_by as string | null,
    // Timestamps
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
    lastContactedAt: data.last_contacted_at as string | null,
    // Related
    owner: owner ? {
      id: owner.id || '',
      fullName: owner.full_name || 'Unknown',
      avatarUrl: owner.avatar_url || null
    } : null,
    convertedToDealId: data.lead_converted_to_deal_id as string | null,
    convertedAt: data.lead_converted_at as string | null,
  }
}

function transformContact(data: Record<string, unknown>): LeadContactInfo {
  const company = data.company as Record<string, unknown> | null
  return {
    id: data.id as string,
    firstName: (data.first_name as string) || '',
    lastName: (data.last_name as string) || '',
    fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: data.email as string | null,
    phone: data.phone as string | null,
    mobile: data.mobile as string | null,
    title: data.title as string | null,
    department: data.department as string | null,
    linkedinUrl: data.linkedin_url as string | null,
    companyId: company?.id as string | null,
    companyName: (data.company_name as string) || (company?.name as string | null),
    companyIndustry: data.industry as string | null,
    companySize: data.company_size as number | null,
    companyRevenue: data.company_revenue as string | null,
    companyWebsite: data.company_website as string | null,
    companyLocation: data.company_location as string | null,
  }
}

function transformEngagement(data: Record<string, unknown>[]): LeadEngagement[] {
  return data.map((a) => {
    const creator = a.creator as { full_name?: string } | null
    return {
      id: a.id as string,
      type: (a.activity_type as string) || 'task',
      subject: (a.subject as string) || 'No Subject',
      description: a.description as string | null,
      outcome: a.status as string | null,
      createdAt: a.created_at as string,
      createdBy: creator?.full_name || 'Unknown',
    }
  })
}

function transformDeal(data: Record<string, unknown>): LeadDeal {
  const owner = data.owner as { id?: string; full_name?: string } | null
  return {
    id: data.id as string,
    name: (data.name as string) || 'Untitled Deal',
    stage: (data.stage as string) || 'discovery',
    value: data.amount as number | null,
    probability: data.probability as number | null,
    expectedCloseDate: data.expected_close_date as string | null,
    owner: owner ? { id: owner.id || '', fullName: owner.full_name || 'Unknown' } : null,
    nextStep: data.next_step as string | null,
  }
}

function transformDeals(data: Record<string, unknown>[]): LeadDeal[] {
  return data.map((d) => transformDeal(d))
}

function transformMeetings(data: Record<string, unknown>[]): LeadMeeting[] {
  return data.map((m) => {
    const assignedTo = m.assigned_to as { id?: string; full_name?: string; email?: string } | null
    const creator = m.creator as { id?: string; full_name?: string; email?: string } | null

    // Build attendees list from assigned_to and creator
    const attendees: { id: string; name: string; email: string | null }[] = []
    if (assignedTo?.id) {
      attendees.push({
        id: assignedTo.id,
        name: assignedTo.full_name || 'Unknown',
        email: assignedTo.email || null,
      })
    }
    if (creator?.id && creator.id !== assignedTo?.id) {
      attendees.push({
        id: creator.id,
        name: creator.full_name || 'Unknown',
        email: creator.email || null,
      })
    }

    // Map activity status to meeting status
    const activityStatus = (m.status as string) || 'open'
    const meetingStatus = activityStatus === 'completed' ? 'completed'
      : activityStatus === 'cancelled' ? 'cancelled'
      : activityStatus === 'skipped' ? 'no_show'
      : 'scheduled'

    return {
      id: m.id as string,
      subject: (m.subject as string) || 'No Subject',
      type: (m.activity_type as string) || 'meeting',
      status: meetingStatus,
      scheduledAt: (m.scheduled_at as string) || (m.scheduled_for as string) || (m.created_at as string),
      duration: m.duration_minutes as number | null,
      location: m.description as string | null, // Using description for location
      attendees,
      notes: m.outcome_notes as string | null,
      outcome: m.outcome as string | null,
      createdAt: m.created_at as string,
    }
  })
}

function transformCampaigns(data: Record<string, unknown>[]): LeadCampaign[] {
  return data.map((ce) => {
    const campaign = ce.campaign as { id?: string; name?: string; status?: string; type?: string; channel?: string } | null
    return {
      id: campaign?.id || (ce.id as string),
      name: campaign?.name || 'Unknown Campaign',
      status: campaign?.status || 'unknown',
      type: campaign?.type || null,
      channel: campaign?.channel || null,
      enrolledAt: ce.enrolled_at as string,
      convertedAt: ce.converted_to_lead_at as string | null,
    }
  })
}

function transformActivities(data: Record<string, unknown>[]): LeadActivity[] {
  return data.map((a) => {
    const assignee = a.assigned_to as { full_name?: string } | null
    return {
      id: a.id as string,
      type: (a.activity_type as string) || 'task',
      subject: (a.subject as string) || 'No Subject',
      description: a.description as string | null,
      dueDate: a.due_date as string | null,
      status: (a.status as string) || 'pending',
      assignedTo: assignee?.full_name || null,
      createdAt: a.created_at as string,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): LeadNote[] {
  return data.map((n) => {
    const creator = n.creator as { full_name?: string } | null
    return {
      id: n.id as string,
      content: (n.content as string) || '',
      createdAt: n.created_at as string,
      createdBy: creator?.full_name || 'Unknown',
      isPinned: (n.is_pinned as boolean) || false,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): LeadDocument[] {
  return data.map((d) => {
    const uploader = d.uploader as { full_name?: string } | null
    return {
      id: d.id as string,
      name: (d.name as string) || 'Untitled',
      type: (d.document_type as string) || 'other',
      size: (d.file_size as number) || 0,
      uploadedAt: d.created_at as string,
      uploadedBy: uploader?.full_name || 'Unknown',
      url: (d.file_url as string) || '',
    }
  })
}

function transformHistory(data: Record<string, unknown>[]): HistoryEntry[] {
  return data.map((h) => {
    const changedByUser = h.changed_by_user as { id?: string; full_name?: string; avatar_url?: string } | null
    const changeType = (h.change_type as string) || 'custom'
    const metadata = h.metadata as Record<string, unknown> | null

    return {
      id: h.id as string,
      changeType,
      field: h.field_name as string | null,
      oldValue: h.old_value as string | null,
      newValue: h.new_value as string | null,
      oldValueLabel: h.old_value_label as string | null,
      newValueLabel: h.new_value_label as string | null,
      reason: h.reason as string | null,
      comment: h.comment as string | null,
      isAutomated: (h.is_automated as boolean) || false,
      timeInPreviousState: h.time_in_previous_state as string | null,
      metadata,
      changedAt: h.changed_at as string,
      changedBy: changedByUser?.id ? {
        id: changedByUser.id,
        name: changedByUser.full_name || 'Unknown',
        avatarUrl: changedByUser.avatar_url || null,
      } : null,
      action: changeType === 'status_change' ? 'status_updated'
        : changeType === 'owner_change' ? 'owner_changed'
        : (metadata?.action as string) || 'update',
    }
  })
}

function computeWarnings(lead: Record<string, unknown>): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []

  // Missing email
  if (!lead.email) {
    warnings.push({
      id: 'missing-email',
      message: 'No email address for this lead.',
      severity: 'warning',
      field: 'email',
      section: 'contact',
    })
  }

  // No BANT score
  if (!lead.bant_total_score && lead.lead_status !== 'new') {
    warnings.push({
      id: 'no-bant',
      message: 'Lead has not been qualified (no BANT score).',
      severity: 'info',
      section: 'summary',
    })
  }

  // Qualified but no deal
  if (lead.lead_status === 'qualified' && !lead.lead_converted_to_deal_id) {
    warnings.push({
      id: 'qualified-no-deal',
      message: 'Lead is qualified but no deal has been created.',
      severity: 'warning',
      section: 'deal',
    })
  }

  return warnings
}
