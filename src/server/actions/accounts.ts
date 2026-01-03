'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullAccountData,
  AccountData,
  AccountContact,
  AccountJob,
  AccountPlacement,
  AccountAddress,
  AccountMeeting,
  AccountEscalation,
  AccountActivity,
  AccountNote,
  AccountDocument,
  HistoryEntry,
  WorkspaceWarning,
} from '@/types/workspace'

/**
 * Fetches all account data in ONE database round-trip.
 * This is the reference implementation for the ONE DB CALL pattern.
 *
 * All section data is fetched in parallel using Promise.all,
 * so we get maximum performance with a single network round-trip.
 */
export async function getFullAccount(id: string): Promise<FullAccountData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Get org_id from context
  let orgId: string
  try {
    // Use getById to verify access and get the account with org context
    const account = await caller.crm.accounts.getById({ id })
    if (!account) return null
    orgId = (account as { org_id?: string }).org_id || ''
  } catch {
    return null
  }

  // Fetch all data in parallel
  const [
    accountResult,
    contactsResult,
    jobsResult,
    placementsResult,
    addressesResult,
    meetingsResult,
    escalationsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
  ] = await Promise.all([
    // Core account data
    adminClient
      .from('companies')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url),
        client_details:company_client_details(*)
      `)
      .eq('id', id)
      .in('category', ['client', 'prospect'])
      .is('deleted_at', null)
      .single(),

    // Contacts linked to this account
    adminClient
      .from('contacts')
      .select(`
        id, first_name, last_name, title, email, phone, mobile, department, is_primary, company_id,
        linkedin_url, decision_authority, preferred_contact_method, notes
      `)
      .eq('company_id', id)
      .is('deleted_at', null)
      .order('is_primary', { ascending: false })
      .order('first_name')
      .limit(100),

    // Jobs for this account (expanded for premium detail panel)
    // Jobs can be linked via company_id OR client_company_id
    adminClient
      .from('jobs')
      .select(`
        id, title, status, posted_date, company_id, job_type, location,
        rate_min, rate_max, rate_type, intake_data,
        positions_count, positions_filled, priority, priority_rank,
        sla_days, target_fill_date, target_start_date, target_end_date, created_at, description,
        owner:user_profiles!jobs_owner_id_fkey(id, full_name, avatar_url),
        hiring_manager:contacts!jobs_hiring_manager_contact_id_fkey(id, first_name, last_name, email, phone)
      `)
      .or(`company_id.eq.${id},client_company_id.eq.${id}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Placements for this account
    adminClient
      .from('placements')
      .select(`
        id, start_date, end_date, status, billing_rate, pay_rate,
        candidate:contacts!placements_candidate_id_fkey(id, first_name, last_name),
        job:jobs!placements_job_id_fkey(id, title)
      `)
      .eq('company_id', id)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })
      .limit(50),

    // Account addresses (polymorphic)
    // Note: addresses table doesn't have deleted_at column
    adminClient
      .from('addresses')
      .select('*')
      .eq('entity_type', 'account')
      .eq('entity_id', id)
      .order('is_primary', { ascending: false }),

    // Meetings (enhanced with all fields)
    adminClient
      .from('meeting_notes')
      .select(`
        id, title, meeting_type, status, scheduled_at, started_at, ended_at, duration_minutes,
        location_type, location_details, agenda, discussion_notes, key_takeaways,
        action_items, follow_up_notes, client_satisfaction, client_feedback,
        contact_ids, related_job_ids, next_meeting_scheduled, created_at,
        creator:user_profiles!created_by(id, full_name, avatar_url)
      `)
      .eq('account_id', id)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false })
      .limit(50),

    // Escalations (enhanced with all SLA and resolution fields)
    adminClient
      .from('escalations')
      .select(`
        id, escalation_number, escalation_type, severity, status,
        issue_summary, detailed_description, related_entities, client_impact,
        root_cause, immediate_actions, resolution_plan,
        sla_response_due, sla_resolution_due, sla_response_met, sla_resolution_met,
        resolved_at, resolution_summary, resolution_actions, time_to_resolve,
        client_satisfaction, lessons_learned, preventive_measures,
        created_at, updated_at,
        created_by:user_profiles!created_by(id, full_name, avatar_url),
        assigned_to:user_profiles!assigned_to(id, full_name, avatar_url),
        escalated_to:user_profiles!escalated_to(id, full_name, avatar_url),
        resolved_by:user_profiles!resolved_by(id, full_name, avatar_url)
      `)
      .eq('account_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Activities (polymorphic) - query both 'account' and 'company' entity types for compatibility
    adminClient
      .from('activities')
      .select(`
        id, activity_type, subject, due_date, status, created_at,
        priority, pattern_code, description,
        assigned_to:user_profiles!assigned_to(id, full_name)
      `)
      .in('entity_type', ['account', 'company'])
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Notes (polymorphic)
    adminClient
      .from('notes')
      .select(`
        id, title, content, note_type, visibility, is_pinned, is_starred, reply_count, tags, created_at, updated_at,
        creator:user_profiles!created_by(id, full_name, avatar_url)
      `)
      .eq('entity_type', 'account')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .is('parent_note_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents/Contracts (from unified contracts table with entity_type='account')
    adminClient
      .from('contracts')
      .select(`
        id, contract_name, contract_type, contract_number, category, status,
        effective_date, expiry_date, contract_value, currency, document_url,
        auto_renew, renewal_term_months, renewal_notice_days, terms,
        created_at, updated_at,
        owner:user_profiles!owner_id(id, full_name),
        creator:user_profiles!created_by(id, full_name)
      `)
      .eq('org_id', orgId)
      .eq('entity_type', 'account')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // History/Audit trail
    adminClient
      .from('audit_logs')
      .select(`
        id, action, field_name, old_value, new_value, created_at,
        user:user_profiles!user_id(id, full_name)
      `)
      .eq('entity_type', 'account')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Return null if account not found
  if (accountResult.error || !accountResult.data) {
    return null
  }

  const account = accountResult.data
  const contactsList = contactsResult.data || []

  // Get job IDs and contact IDs for additional queries
  const jobIds = (jobsResult.data || []).map((j: { id: string }) => j.id)
  const contactIds = contactsList.map((c: { id: string }) => c.id)
  
  const submissionCounts: Record<string, number> = {}
  const interviewCounts: Record<string, number> = {}

  // Fetch job stats and contact addresses in parallel
  const [jobStatsResult, contactAddressesResult] = await Promise.all([
    // Job stats (submissions + interviews)
    jobIds.length > 0 
      ? Promise.all([
          adminClient.from('submissions').select('job_id').in('job_id', jobIds).is('deleted_at', null),
          adminClient.from('interviews').select('job_id').in('job_id', jobIds).is('deleted_at', null),
        ])
      : Promise.resolve([{ data: [] }, { data: [] }]),
    
    // Contact addresses (addresses table doesn't have deleted_at column)
    contactIds.length > 0
      ? adminClient
          .from('addresses')
          .select('*')
          .eq('org_id', orgId)
          .eq('entity_type', 'contact')
          .in('entity_id', contactIds)
          .order('is_primary', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  // Process job stats
  const [submissionsResult, interviewsResult] = jobStatsResult as [{ data: { job_id: string }[] | null }, { data: { job_id: string }[] | null }]
  for (const sub of submissionsResult.data || []) {
    submissionCounts[sub.job_id] = (submissionCounts[sub.job_id] || 0) + 1
  }
  for (const interview of interviewsResult.data || []) {
    interviewCounts[interview.job_id] = (interviewCounts[interview.job_id] || 0) + 1
  }

  // Group contact addresses by contact ID
  const addressResult = contactAddressesResult as { data: Record<string, unknown>[] | null; error?: { message: string } | null }
  if (addressResult.error) {
    console.error('[getFullAccount] Error fetching contact addresses:', addressResult.error)
  }
  const contactAddresses = addressResult.data || []
  console.log('[getFullAccount] Contact IDs:', contactIds)
  console.log('[getFullAccount] Fetched', contactAddresses.length, 'addresses for contacts')
  const addressesByContact: Record<string, Record<string, unknown>[]> = {}
  for (const addr of contactAddresses) {
    const contactId = addr.entity_id as string
    console.log('[getFullAccount] Address found for contact', contactId, ':', addr.address_line_1, addr.city)
    if (!addressesByContact[contactId]) {
      addressesByContact[contactId] = []
    }
    addressesByContact[contactId].push(addr)
  }
  console.log('[getFullAccount] Addresses by contact:', Object.keys(addressesByContact))

  // Transform and return data
  return {
    account: transformAccount(account),
    contacts: transformContacts(contactsList, addressesByContact),
    jobs: transformJobs(jobsResult.data || [], submissionCounts, interviewCounts),
    placements: transformPlacements(placementsResult.data || []),
    addresses: transformAddresses(addressesResult.data || []),
    meetings: transformMeetings(meetingsResult.data || []),
    escalations: transformEscalations(escalationsResult.data || []),
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(account, contactsResult.data || [], documentsResult.data || []),
  }
}

// Transform functions to normalize data shapes

function transformAccount(data: Record<string, unknown>): AccountData {
  return {
    id: data.id as string,
    name: data.name as string,
    industry: data.industry as string | null,
    industries: data.industries as string[] | null,
    status: data.status as string,
    segment: data.segment as string | null,
    website: data.website as string | null,
    phone: data.phone as string | null,
    fax: data.fax as string | null,
    description: data.description as string | null,
    headquarters_city: data.headquarters_city as string | null,
    headquarters_state: data.headquarters_state as string | null,
    headquarters_country: data.headquarters_country as string | null,
    employee_count: data.employee_count as number | null,
    annual_revenue: data.annual_revenue as string | null,
    tier: data.tier as string | null,
    nps_score: data.nps_score as number | null,
    last_contacted_date: data.last_contacted_date as string | null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string | null,
    owner: data.owner as { id: string; full_name: string; avatar_url: string | null } | null,
    client_details: data.client_details as Record<string, unknown> | null,
    // Health and financial metrics (Phase 2)
    health_score: data.health_score as number | null,
    health_status: data.health_status as string | null,
    churn_risk: data.churn_risk as number | null,
    account_score: data.account_score as number | null,
    account_grade: data.account_grade as string | null,
    lifetime_revenue: typeof data.lifetime_revenue === 'string' 
      ? parseFloat(data.lifetime_revenue) 
      : data.lifetime_revenue as number | null,
    revenue_ytd: typeof data.revenue_ytd === 'string' 
      ? parseFloat(data.revenue_ytd) 
      : data.revenue_ytd as number | null,
    revenue_last_12m: typeof data.revenue_last_12m === 'string' 
      ? parseFloat(data.revenue_last_12m) 
      : data.revenue_last_12m as number | null,
    avg_margin_percentage: typeof data.avg_margin_percentage === 'string' 
      ? parseFloat(data.avg_margin_percentage) 
      : data.avg_margin_percentage as number | null,
    lifetime_placements: data.lifetime_placements as number | null,
    placements_ytd: data.placements_ytd as number | null,
    active_jobs_count: data.active_jobs_count as number | null,
    active_placements_count: data.active_placements_count as number | null,
  }
}

function transformContacts(
  data: Record<string, unknown>[],
  addressesByContact: Record<string, Record<string, unknown>[]>
): AccountContact[] {
  return data.map((c) => {
    const contactId = c.id as string
    const contactAddresses = addressesByContact[contactId] || []
    
    return {
      id: contactId,
      name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
      title: c.title as string | null,
      email: c.email as string | null,
      phone: c.phone as string | null,
      mobile: c.mobile as string | null,
      department: c.department as string | null,
      isPrimary: (c.is_primary as boolean) || false,
      linkedinUrl: c.linkedin_url as string | null,
      decisionAuthority: c.decision_authority as string | null,
      preferredContactMethod: c.preferred_contact_method as string | null,
      notes: c.notes as string | null,
      roles: [], // Roles are fetched separately if needed
      addresses: contactAddresses.map((a) => ({
        id: a.id as string,
        type: (a.address_type as string) || 'work',
        street: (a.address_line_1 as string) || '',
        city: (a.city as string) || '',
        state: (a.state_province as string) || '',
        zip: (a.postal_code as string) || '',
        country: (a.country_code as string) || 'US',
        isPrimary: (a.is_primary as boolean) || false,
      })),
    }
  })
}

function transformJobs(
  data: Record<string, unknown>[],
  submissionCounts: Record<string, number>,
  interviewCounts: Record<string, number>
): AccountJob[] {
  return data.map((j) => {
    // Extract owner data from joined query
    const ownerData = j.owner as { id?: string; full_name?: string; avatar_url?: string } | null
    const owner = ownerData?.id ? {
      id: ownerData.id,
      name: ownerData.full_name || 'Unknown',
      avatarUrl: ownerData.avatar_url || null,
    } : null

    // Extract hiring manager data from joined query
    const hmData = j.hiring_manager as { id?: string; first_name?: string; last_name?: string; email?: string; phone?: string } | null
    const hiringManager = hmData?.id ? {
      id: hmData.id,
      name: [hmData.first_name, hmData.last_name].filter(Boolean).join(' ') || 'Unknown',
      email: hmData.email || null,
      phone: hmData.phone || null,
    } : null

    // Extract data from intake_data JSONB field (for rates and dates that might be stored there)
    const intakeData = j.intake_data as { 
      payRateMin?: number
      payRateMax?: number
      targetStartDate?: string
      targetEndDate?: string
    } | null

    return {
      id: j.id as string,
      title: j.title as string,
      status: j.status as string,
      submissionCount: submissionCounts[j.id as string] || 0,
      interviewCount: interviewCounts[j.id as string] || 0,
      postedDate: j.posted_date as string | null,
      // Extended fields for detail panel (using correct column names from schema)
      jobType: j.job_type as string | null,
      location: j.location as string | null,
      billingRate: null, // Not available in this schema
      billRateMin: j.rate_min ? parseFloat(j.rate_min as string) : null,
      billRateMax: j.rate_max ? parseFloat(j.rate_max as string) : null,
      payRateMin: intakeData?.payRateMin ?? null,
      payRateMax: intakeData?.payRateMax ?? null,
      positionsAvailable: j.positions_count as number | null,
      positionsFilled: j.positions_filled as number | null,
      priority: j.priority as string | null,
      priorityRank: j.priority_rank as number | null,
      slaDays: j.sla_days as number | null,
      targetStartDate: (j.target_start_date as string | null) || intakeData?.targetStartDate || null,
      targetEndDate: (j.target_end_date as string | null) || (j.target_fill_date as string | null) || intakeData?.targetEndDate || null,
      createdAt: j.created_at as string,
      description: j.description as string | null,
      owner,
      hiringManager,
    }
  })
}

function transformPlacements(data: Record<string, unknown>[]): AccountPlacement[] {
  return data.map((p) => {
    const candidate = p.candidate as { first_name?: string; last_name?: string } | null
    const job = p.job as { title?: string } | null
    return {
      id: p.id as string,
      consultantName: candidate
        ? [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
        : 'Unknown',
      jobTitle: job?.title || 'Unknown',
      startDate: p.start_date as string,
      endDate: p.end_date as string | null,
      status: p.status as string,
      billRate: p.billing_rate as number | null,
      payRate: p.pay_rate as number | null,
    }
  })
}

function transformAddresses(data: Record<string, unknown>[]): AccountAddress[] {
  return data.map((a) => ({
    id: a.id as string,
    type: (a.address_type as string) || 'Other',
    street: (a.address_line_1 as string) || '',
    suite: a.address_line_2 as string | null,
    city: (a.city as string) || '',
    state: (a.state_province as string) || '',
    zip: (a.postal_code as string) || '',
    country: (a.country_code as string) || 'USA',
    isPrimary: (a.is_primary as boolean) || false,
  }))
}

function transformMeetings(data: Record<string, unknown>[]): AccountMeeting[] {
  return data.map((m) => {
    const creator = m.creator as { id?: string; full_name?: string; avatar_url?: string } | null
    const actionItems = m.action_items as Array<{
      id?: string
      description?: string
      assignedTo?: string
      dueDate?: string
      completed?: boolean
    }> | null
    
    return {
      id: m.id as string,
      subject: (m.title as string) || 'No Title',
      date: m.scheduled_at as string,
      time: null, // Extracted from scheduled_at if needed
      location: m.location_details as string | null,
      locationType: m.location_type as 'video' | 'phone' | 'in_person' | 'other' | null,
      attendees: [], // Would need a separate query for attendees
      status: (m.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled') || 'scheduled',
      organizer: creator?.full_name || 'Unknown',
      // Enhanced fields
      meetingType: (m.meeting_type as 'check_in' | 'qbr' | 'kick_off' | 'project_review' | 'escalation_review' | 'sales_pitch' | 'other') || 'other',
      agenda: m.agenda as string | null,
      discussionNotes: m.discussion_notes as string | null,
      keyTakeaways: m.key_takeaways as string[] | null,
      actionItems: actionItems?.map(item => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || '',
        assignedTo: item.assignedTo || null,
        dueDate: item.dueDate || null,
        completed: item.completed || false,
      })) || null,
      clientSatisfaction: m.client_satisfaction as 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied' | null,
      clientFeedback: m.client_feedback as string | null,
      contactIds: m.contact_ids as string[] | null,
      relatedJobIds: m.related_job_ids as string[] | null,
      nextMeetingScheduled: m.next_meeting_scheduled as string | null,
      followUpNotes: m.follow_up_notes as string | null,
      durationMinutes: m.duration_minutes as number | null,
      startedAt: m.started_at as string | null,
      endedAt: m.ended_at as string | null,
      createdBy: creator?.id ? {
        id: creator.id,
        name: creator.full_name || 'Unknown',
        avatarUrl: creator.avatar_url || null,
      } : null,
      createdAt: m.created_at as string,
    }
  })
}

function transformEscalations(data: Record<string, unknown>[]): AccountEscalation[] {
  return data.map((e) => {
    const createdBy = e.created_by as { id?: string; full_name?: string; avatar_url?: string } | null
    const assignedTo = e.assigned_to as { id?: string; full_name?: string; avatar_url?: string } | null
    const escalatedTo = e.escalated_to as { id?: string; full_name?: string; avatar_url?: string } | null
    const resolvedBy = e.resolved_by as { id?: string; full_name?: string; avatar_url?: string } | null
    const severity = (e.severity as string) || 'medium'
    
    return {
      id: e.id as string,
      escalationNumber: (e.escalation_number as string) || `ESC-${(e.id as string).slice(0, 4).toUpperCase()}`,
      subject: (e.issue_summary as string) || 'No Subject',
      priority: severity as 'low' | 'medium' | 'high' | 'critical',
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      escalationType: (e.escalation_type as 'service_issue' | 'billing_dispute' | 'quality_concern' | 'communication_breakdown' | 'contract_violation' | 'resource_issue' | 'timeline_delay' | 'other') || 'other',
      status: (e.status as 'open' | 'in_progress' | 'pending_client' | 'resolved' | 'closed') || 'open',
      createdAt: e.created_at as string,
      createdBy: {
        id: createdBy?.id || '',
        name: createdBy?.full_name || 'Unknown',
        avatarUrl: createdBy?.avatar_url || null,
      },
      assignedTo: assignedTo?.id ? {
        id: assignedTo.id,
        name: assignedTo.full_name || 'Unknown',
        avatarUrl: assignedTo.avatar_url || null,
      } : null,
      escalatedTo: escalatedTo?.id ? {
        id: escalatedTo.id,
        name: escalatedTo.full_name || 'Unknown',
        avatarUrl: escalatedTo.avatar_url || null,
      } : null,
      description: e.detailed_description as string | null,
      // Enhanced fields
      issueSummary: (e.issue_summary as string) || '',
      detailedDescription: e.detailed_description as string | null,
      clientImpact: e.client_impact as string[] | null,
      rootCause: e.root_cause as string | null,
      immediateActions: e.immediate_actions as string | null,
      resolutionPlan: e.resolution_plan as string | null,
      // SLA tracking
      slaResponseDue: e.sla_response_due as string | null,
      slaResolutionDue: e.sla_resolution_due as string | null,
      slaResponseMet: e.sla_response_met as boolean | null,
      slaResolutionMet: e.sla_resolution_met as boolean | null,
      // Resolution
      resolvedAt: e.resolved_at as string | null,
      resolvedBy: resolvedBy?.id ? {
        id: resolvedBy.id,
        name: resolvedBy.full_name || 'Unknown',
        avatarUrl: resolvedBy.avatar_url || null,
      } : null,
      resolutionSummary: e.resolution_summary as string | null,
      resolutionActions: e.resolution_actions as string | null,
      timeToResolve: e.time_to_resolve as string | null,
      clientSatisfaction: e.client_satisfaction as 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied' | null,
      lessonsLearned: e.lessons_learned as string | null,
      preventiveMeasures: e.preventive_measures as string | null,
      // Related entities
      relatedEntityIds: (e.related_entities as { id?: string }[])?.map(r => r.id).filter(Boolean) as string[] | null,
      updatedAt: e.updated_at as string | null,
    }
  })
}

function transformActivities(data: Record<string, unknown>[]): AccountActivity[] {
  return data.map((a) => {
    const assignee = a.assigned_to as { full_name?: string } | null
    return {
      id: a.id as string,
      type: (a.activity_type as string) || 'task',
      subject: (a.subject as string) || 'No Subject',
      dueDate: a.due_date as string | null,
      assignedTo: assignee?.full_name || 'Unassigned',
      status: (a.status as string) || 'pending',
      createdAt: a.created_at as string,
      priority: a.priority as string | null,
      patternCode: a.pattern_code as string | null,
      checklist: null, // Not stored in activities table - checklist is in activity_patterns
      checklistProgress: null, // Not stored in activities table
      description: a.description as string | null,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): AccountNote[] {
  return data.map((n) => {
    const creator = n.creator as { id?: string; full_name?: string; avatar_url?: string | null } | null
    return {
      id: n.id as string,
      title: (n.title as string) || null,
      content: (n.content as string) || '',
      noteType: (n.note_type as AccountNote['noteType']) || 'general',
      visibility: (n.visibility as AccountNote['visibility']) || 'team',
      createdAt: n.created_at as string,
      updatedAt: (n.updated_at as string) || null,
      creator: creator?.id ? {
        id: creator.id,
        full_name: creator.full_name || 'Unknown',
        avatar_url: creator.avatar_url || null,
      } : null,
      isPinned: (n.is_pinned as boolean) || false,
      isStarred: (n.is_starred as boolean) || false,
      replyCount: (n.reply_count as number) || 0,
      tags: (n.tags as string[]) || null,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): AccountDocument[] {
  return data.map((d) => {
    const creator = d.creator as { full_name?: string } | null
    const terms = d.terms as { notes?: string } | null
    return {
      id: d.id as string,
      name: (d.contract_name as string) || 'Untitled',
      type: (d.contract_type as string) || 'other',
      size: 0, // Contracts don't store file size directly
      uploadedAt: d.created_at as string,
      uploadedBy: creator?.full_name || 'Unknown',
      url: (d.document_url as string) || '',
      // Extended contract fields
      category: d.category as string | undefined,
      status: d.status as string | undefined,
      expirationDate: d.expiry_date as string | null,
      // Additional contract data for enhanced display
      contractNumber: d.contract_number as string | undefined,
      contractValue: d.contract_value as number | undefined,
      currency: d.currency as string | undefined,
      effectiveDate: d.effective_date as string | undefined,
      autoRenew: d.auto_renew as boolean | undefined,
      renewalTermMonths: d.renewal_term_months as number | undefined,
      renewalNoticeDays: d.renewal_notice_days as number | undefined,
      notes: terms?.notes as string | undefined,
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

/**
 * Compute warnings based on account data
 */
function computeWarnings(
  account: Record<string, unknown>,
  contacts: Record<string, unknown>[],
  documents: Record<string, unknown>[]
): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []

  // Check for missing required fields
  if (!account.industry) {
    warnings.push({
      id: 'missing-industry',
      message: 'Required field "Industry" is missing.',
      severity: 'warning',
      field: 'industry',
      section: 'summary',
    })
  }

  // Check for primary contact without email
  const primaryContact = contacts.find((c) => c.is_primary)
  if (primaryContact && !primaryContact.email) {
    warnings.push({
      id: 'primary-no-email',
      message: 'Primary contact has no email address.',
      severity: 'warning',
      section: 'contacts',
    })
  }

  // Check for MSA document
  const hasMSA = documents.some(
    (d) =>
      (d.document_type as string)?.toLowerCase().includes('msa') ||
      (d.name as string)?.toLowerCase().includes('msa')
  )
  if (!hasMSA) {
    warnings.push({
      id: 'no-msa',
      message: 'No active MSA document on file.',
      severity: 'warning',
      section: 'documents',
    })
  }

  // Check for no contacts
  if (contacts.length === 0) {
    warnings.push({
      id: 'no-contacts',
      message: 'No contacts associated with this account.',
      severity: 'info',
      section: 'contacts',
    })
  }

  return warnings
}
