'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullContactData,
  ContactData,
  ContactAccount,
  ContactSubmission,
  ContactCampaign,
  ContactActivity,
  ContactNote,
  ContactDocument,
  ContactJob,
  JobContactRole,
  ContactPlacement,
  ContactAddressEntry,
  ContactMeeting,
  ContactEscalation,
  ContactRelatedContact,
  HistoryEntry,
  WorkspaceWarning,
} from '@/types/workspace'

/**
 * Fetches all contact data in ONE database round-trip.
 * This follows the ONE DB CALL pattern established in GW-020.
 *
 * All section data is fetched in parallel using Promise.all,
 * so we get maximum performance with a single network round-trip.
 */
export async function getFullContact(id: string): Promise<FullContactData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Verify access via tRPC (handles auth + org context)
  let contactBase: Record<string, unknown> | null = null
  try {
    contactBase = await caller.unifiedContacts.getById({ id }) as Record<string, unknown>
    if (!contactBase) return null
  } catch {
    return null
  }

  // Fetch all data in parallel
  const [
    contactResult,
    accountsResult,
    primaryCompanyResult,
    submissionsAsCandidateResult,
    submissionsAsPocResult,
    campaignsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
    // New queries for Phase 3
    jobContactsResult,
    placementsResult,
    addressesResult,
    meetingsResult,
    escalationsResult,
    relatedContactsResult,
  ] = await Promise.all([
    // Full contact data with related info
    adminClient
      .from('contacts')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single(),

    // Linked accounts (via company_contacts junction table for many-to-many)
    adminClient
      .from('company_contacts')
      .select(`
        id,
        job_title,
        department,
        decision_authority,
        is_primary,
        is_active,
        created_at,
        company:companies!company_contacts_company_id_fkey(
          id, name, industry, status, category
        )
      `)
      .eq('contact_id', id)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .limit(50),

    // Primary company from contacts.company_id FK (legacy/primary way)
    contactBase.company_id
      ? adminClient
          .from('companies')
          .select('id, name, industry, status, category')
          .eq('id', contactBase.company_id as string)
          .is('deleted_at', null)
          .single()
      : Promise.resolve({ data: null, error: null }),

    // Submissions where contact is candidate
    adminClient
      .from('submissions')
      .select(`
        id, status, stage, submitted_at,
        job:jobs!submissions_job_id_fkey(id, title),
        account:companies!submissions_company_id_fkey(id, name)
      `)
      .eq('candidate_id', id)
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false })
      .limit(50),

    // Submissions where contact is hiring manager/POC
    adminClient
      .from('submissions')
      .select(`
        id, status, stage, submitted_at,
        job:jobs!submissions_job_id_fkey(id, title),
        account:companies!submissions_company_id_fkey(id, name),
        candidate:contacts!submissions_candidate_id_fkey(id, first_name, last_name)
      `)
      .eq('hiring_manager_id', id)
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false })
      .limit(50),

    // Campaign enrollments (for prospects/leads)
    adminClient
      .from('campaign_enrollments')
      .select(`
        id, enrolled_at, sequence_step, sequence_status, engagement_score, converted_to_lead_at, status,
        campaign:campaigns!campaign_enrollments_campaign_id_fkey(id, name, status)
      `)
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('enrolled_at', { ascending: false })
      .limit(50),

    // Activities (polymorphic)
    adminClient
      .from('activities')
      .select(`
        id, activity_type, subject, description, due_date, status, priority, pattern_code, checklist, checklist_progress, created_at,
        assigned_to:user_profiles!assigned_to(id, full_name)
      `)
      .eq('entity_type', 'contact')
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
      .eq('entity_type', 'contact')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents (polymorphic)
    adminClient
      .from('documents')
      .select(`
        id, name, document_type, file_size, file_url, created_at,
        uploader:user_profiles!uploaded_by(id, full_name)
      `)
      .eq('entity_type', 'contact')
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
      .eq('entity_type', 'contact')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    // Jobs via job_contacts junction table (many-to-many with roles)
    adminClient
      .from('job_contacts')
      .select(`
        id, role, is_primary, created_at,
        job:jobs!job_contacts_job_id_fkey(
          id, title, status, job_type, bill_rate_min, bill_rate_max,
          positions_available, positions_filled, priority, created_at,
          owner:user_profiles!jobs_owner_id_fkey(id, first_name, last_name),
          account:companies!jobs_company_id_fkey(id, name)
        )
      `)
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Placements where contact is the candidate
    adminClient
      .from('placements')
      .select(`
        id, start_date, end_date, status, bill_rate, pay_rate, extension_count, created_at,
        job:jobs!placements_job_id_fkey(id, title, company_id, account:companies!jobs_company_id_fkey(id, name)),
        candidate:contacts!placements_candidate_id_fkey(id, first_name, last_name)
      `)
      .eq('candidate_id', id)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })
      .limit(50),

    // Addresses (polymorphic) - note: addresses table has no deleted_at column
    adminClient
      .from('addresses')
      .select('*')
      .eq('entity_type', 'contact')
      .eq('entity_id', id)
      .order('is_primary', { ascending: false })
      .limit(20),

    // Meetings where this contact was a participant
    adminClient
      .from('meeting_notes')
      .select(`
        id, title, meeting_type, meeting_date, location_type, location_details,
        agenda, discussion_notes, key_takeaways, action_items, created_at,
        creator:user_profiles!meeting_notes_created_by_fkey(id, first_name, last_name)
      `)
      .contains('contact_ids', [id])
      .is('deleted_at', null)
      .order('meeting_date', { ascending: false })
      .limit(50),

    // Escalations related to this contact
    adminClient
      .from('escalations')
      .select(`
        id, title, priority, status, category, description,
        sla_response_due, sla_resolution_due, sla_response_met, sla_resolution_met,
        resolved_at, resolution_summary, client_satisfaction, created_at,
        owner:user_profiles!escalations_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Related contacts (other contacts at the same company)
    contactBase.company_id ? adminClient
      .from('contacts')
      .select('id, first_name, last_name, title, email, phone, is_primary, decision_authority')
      .eq('company_id', contactBase.company_id as string)
      .neq('id', id)  // Exclude self
      .is('deleted_at', null)
      .order('is_primary', { ascending: false })
      .limit(50) : Promise.resolve({ data: [], error: null }),
  ])

  // Return null if contact not found
  if (contactResult.error || !contactResult.data) {
    return null
  }

  const contact = contactResult.data

  // Combine submissions from both queries
  const allSubmissions = [
    ...transformSubmissions(submissionsAsCandidateResult.data || [], 'candidate'),
    ...transformSubmissions(submissionsAsPocResult.data || [], 'hiring_manager'),
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  // Transform and return data
  return {
    contact: transformContact(contact),
    accounts: transformAccounts(
      accountsResult.data || [],
      primaryCompanyResult.data as Record<string, unknown> | null,
      (contact.is_primary as boolean) || false,
      (contact.created_at as string) || null
    ),
    submissions: allSubmissions,
    campaigns: transformCampaigns(campaignsResult.data || []),
    // Jobs via junction table with roles
    jobs: transformJobsFromJunction(jobContactsResult.data || []),
    placements: transformPlacements(placementsResult.data || []),
    addresses: transformAddresses(addressesResult.data || []),
    meetings: transformMeetings(meetingsResult.data || []),
    escalations: transformEscalations(escalationsResult.data || []),
    relatedContacts: transformRelatedContacts(relatedContactsResult.data || []),
    // Universal tools
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(contact),
  }
}

// Transform functions

function transformContact(data: Record<string, unknown>): ContactData {
  const owner = data.owner as { id: string; full_name: string; avatar_url: string | null } | null

  // Derive types from subtype
  const subtype = (data.subtype as string) || 'person_general'
  const types: string[] = []
  if (subtype.includes('candidate')) types.push('candidate')
  if (subtype.includes('lead')) types.push('lead')
  if (subtype.includes('prospect')) types.push('prospect')
  if (subtype.includes('client_contact') || subtype.includes('hiring_manager') || subtype.includes('hr_contact')) types.push('client_poc')
  if (subtype.includes('vendor_contact')) types.push('vendor_poc')
  if (subtype.includes('employee')) types.push('employee')
  if (types.length === 0) types.push('general')

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
    // Classification
    types,
    category: (data.category as string) || 'person',
    subtype,
    status: (data.status as string) || 'active',
    // Address
    street: data.address_line_1 as string | null,
    city: data.city as string | null,
    state: data.state_province as string | null,
    zip: data.postal_code as string | null,
    country: data.country_code as string | null,
    // Contact preferences
    preferredContactMethod: data.preferred_contact_method as string | null,
    bestTimeToContact: data.best_time_to_contact as string | null,
    linkedinUrl: data.linkedin_url as string | null,
    // Candidate fields
    candidateStatus: data.candidate_status as string | null,
    candidateResumeUrl: data.candidate_resume_url as string | null,
    candidateSkills: data.candidate_skills as string[] | null,
    candidateExperienceYears: data.candidate_experience_years as number | null,
    candidateCurrentVisa: data.candidate_current_visa as string | null,
    candidateHourlyRate: data.candidate_hourly_rate as number | null,
    // Lead fields
    leadStatus: data.lead_status as string | null,
    leadScore: data.lead_score as number | null,
    leadSource: data.lead_source as string | null,
    // Timestamps
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
    // Related
    owner: owner ? {
      id: owner.id,
      fullName: owner.full_name,
      avatarUrl: owner.avatar_url,
    } : null,
    company: data.company_name ? {
      id: (data.company_id as string) || '',
      name: data.company_name as string,
    } : null,
  }
}

function transformAccounts(
  junctionData: Record<string, unknown>[],
  primaryCompany: Record<string, unknown> | null,
  contactIsPrimary: boolean,
  contactCreatedAt: string | null
): ContactAccount[] {
  // Build accounts from company_contacts junction table
  const junctionAccounts = junctionData
    .map((link) => {
      const company = link.company as {
        id: string
        name: string
        industry: string | null
        status: string
        category: string | null
      } | null

      if (!company) return null

      return {
        id: company.id,
        name: company.name,
        industry: company.industry || null,
        status: company.status || 'active',
        role: (link.job_title as string) || null,
        isPrimary: (link.is_primary as boolean) || false,
        sinceDate: (link.created_at as string) || null,
      }
    })
    .filter((a): a is ContactAccount => a !== null)

  // Check if primary company from contacts.company_id is already in junction table
  const junctionCompanyIds = new Set(junctionAccounts.map((a) => a.id))

  // Add primary company if it exists and isn't already in the list
  if (primaryCompany && !junctionCompanyIds.has(primaryCompany.id as string)) {
    const primaryAccount: ContactAccount = {
      id: primaryCompany.id as string,
      name: primaryCompany.name as string,
      industry: (primaryCompany.industry as string) || null,
      status: (primaryCompany.status as string) || 'active',
      role: contactIsPrimary ? 'Primary Contact' : null,
      isPrimary: contactIsPrimary,
      sinceDate: contactCreatedAt,
    }
    // Add primary company first
    return [primaryAccount, ...junctionAccounts]
  }

  return junctionAccounts
}

function transformSubmissions(
  data: Record<string, unknown>[],
  role: 'candidate' | 'hiring_manager'
): ContactSubmission[] {
  return data.map((s) => {
    const job = s.job as { id: string; title: string } | null
    const account = s.account as { id: string; name: string } | null
    const candidate = s.candidate as { first_name?: string; last_name?: string } | null

    return {
      id: s.id as string,
      jobTitle: job?.title || 'Unknown Job',
      accountName: account?.name || 'Unknown Account',
      stage: (s.stage as string) || 'submitted',
      status: (s.status as string) || 'pending',
      submittedAt: s.submitted_at as string,
      role: role === 'hiring_manager' ? 'hiring_manager' : 'candidate',
      candidateName: candidate
        ? [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')
        : null,
    }
  })
}

function transformCampaigns(data: Record<string, unknown>[]): ContactCampaign[] {
  return data.map((e) => {
    const campaign = e.campaign as { id: string; name: string; status: string } | null
    return {
      id: e.id as string,
      campaignName: campaign?.name || 'Unknown Campaign',
      campaignStatus: campaign?.status || 'unknown',
      enrolledAt: e.enrolled_at as string,
      sequenceStep: (e.sequence_step as number) || 0,
      sequenceStatus: (e.sequence_status as string) || 'pending',
      engagementScore: e.engagement_score as number | null,
      convertedAt: e.converted_to_lead_at as string | null,
    }
  })
}

function transformActivities(data: Record<string, unknown>[]): ContactActivity[] {
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
      checklist: a.checklist as Array<{ id: string; text: string }> | null,
      checklistProgress: a.checklist_progress as Record<string, boolean> | null,
      description: a.description as string | null,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): ContactNote[] {
  return data.map((n) => {
    const creator = n.creator as { id?: string; full_name?: string; avatar_url?: string | null } | null
    return {
      id: n.id as string,
      title: n.title as string | null,
      content: (n.content as string) || '',
      noteType: (n.note_type as ContactNote['noteType']) || 'general',
      visibility: (n.visibility as ContactNote['visibility']) || 'team',
      createdAt: n.created_at as string,
      updatedAt: n.updated_at as string | null,
      creator: creator ? {
        id: creator.id || '',
        full_name: creator.full_name || 'Unknown',
        avatar_url: creator.avatar_url || null,
      } : null,
      isPinned: (n.is_pinned as boolean) || false,
      isStarred: (n.is_starred as boolean) || false,
      replyCount: (n.reply_count as number) || 0,
      tags: n.tags as string[] | null,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): ContactDocument[] {
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

// Phase 3 transform functions

/**
 * Transform job_contacts junction table data into ContactJob array.
 * Groups by job ID and collects all roles the contact has on each job.
 */
function transformJobsFromJunction(data: Record<string, unknown>[]): ContactJob[] {
  const jobMap = new Map<string, ContactJob & { roles: JobContactRole[] }>()

  for (const row of data) {
    const job = row.job as Record<string, unknown> | null
    if (!job) continue

    const jobId = job.id as string
    const role = row.role as JobContactRole

    if (!jobMap.has(jobId)) {
      const owner = job.owner as { id: string; first_name: string; last_name: string } | null
      const account = job.account as { id: string; name: string } | null

      jobMap.set(jobId, {
        id: jobId,
        title: (job.title as string) || 'Untitled Job',
        status: (job.status as string) || 'draft',
        jobType: job.job_type as string | null,
        rateMin: job.bill_rate_min as number | null,
        rateMax: job.bill_rate_max as number | null,
        positionsCount: (job.positions_available as number) || 1,
        positionsFilled: (job.positions_filled as number) || 0,
        priority: job.priority as string | null,
        createdAt: job.created_at as string,
        owner: owner ? { id: owner.id, name: [owner.first_name, owner.last_name].filter(Boolean).join(' ') } : null,
        account: account ? { id: account.id, name: account.name } : null,
        roles: [],
      })
    }

    // Add this role to the job's roles array (avoid duplicates)
    const jobEntry = jobMap.get(jobId)!
    if (!jobEntry.roles.includes(role)) {
      jobEntry.roles.push(role)
    }
  }

  // Sort by createdAt descending
  return Array.from(jobMap.values()).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function transformPlacements(data: Record<string, unknown>[]): ContactPlacement[] {
  return data.map((p) => {
    const job = p.job as { id: string; title: string; account: { id: string; name: string } | null } | null

    return {
      id: p.id as string,
      startDate: p.start_date as string,
      endDate: p.end_date as string | null,
      status: (p.status as string) || 'active',
      billingRate: p.bill_rate as number | null,
      payRate: p.pay_rate as number | null,
      extensionCount: (p.extension_count as number) || 0,
      createdAt: p.created_at as string,
      job: job ? {
        id: job.id,
        title: job.title,
        account: job.account,
      } : null,
    }
  })
}

function transformAddresses(data: Record<string, unknown>[]): ContactAddressEntry[] {
  return data.map((a) => ({
    id: a.id as string,
    addressType: (a.address_type as string) || 'home',
    street: a.address_line_1 as string | null,
    city: a.city as string | null,
    state: a.state_province as string | null,
    zip: a.postal_code as string | null,
    country: a.country_code as string | null,
    isPrimary: (a.is_primary as boolean) || false,
  }))
}

function transformMeetings(data: Record<string, unknown>[]): ContactMeeting[] {
  return data.map((m) => {
    const creator = m.creator as { id: string; first_name: string; last_name: string } | null

    return {
      id: m.id as string,
      title: (m.title as string) || 'Untitled Meeting',
      meetingType: (m.meeting_type as string) || 'other',
      meetingDate: m.meeting_date as string,
      locationType: m.location_type as string | null,
      locationDetails: m.location_details as string | null,
      agenda: m.agenda as string | null,
      discussionNotes: m.discussion_notes as string | null,
      keyTakeaways: m.key_takeaways as string[] | null,
      actionItems: m.action_items as Record<string, unknown>[] | null,
      createdAt: m.created_at as string,
      creator: creator ? { id: creator.id, name: [creator.first_name, creator.last_name].filter(Boolean).join(' ') } : null,
    }
  })
}

function transformEscalations(data: Record<string, unknown>[]): ContactEscalation[] {
  return data.map((e) => {
    const owner = e.owner as { id: string; first_name: string; last_name: string } | null

    return {
      id: e.id as string,
      title: (e.title as string) || 'Untitled Escalation',
      priority: (e.priority as string) || 'medium',
      status: (e.status as string) || 'open',
      category: e.category as string | null,
      description: e.description as string | null,
      slaResponseDue: e.sla_response_due as string | null,
      slaResolutionDue: e.sla_resolution_due as string | null,
      slaResponseMet: e.sla_response_met as boolean | null,
      slaResolutionMet: e.sla_resolution_met as boolean | null,
      resolvedAt: e.resolved_at as string | null,
      resolutionSummary: e.resolution_summary as string | null,
      clientSatisfaction: e.client_satisfaction as number | null,
      createdAt: e.created_at as string,
      owner: owner ? { id: owner.id, name: [owner.first_name, owner.last_name].filter(Boolean).join(' ') } : null,
    }
  })
}

function transformRelatedContacts(data: Record<string, unknown>[]): ContactRelatedContact[] {
  return data.map((c) => ({
    id: c.id as string,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
    title: c.title as string | null,
    email: c.email as string | null,
    phone: c.phone as string | null,
    isPrimary: (c.is_primary as boolean) || false,
    decisionAuthority: c.decision_authority as string | null,
  }))
}

/**
 * Compute warnings based on contact data
 */
function computeWarnings(contact: Record<string, unknown>): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []
  const subtype = (contact.subtype as string) || ''

  // Check for missing email
  if (!contact.email) {
    warnings.push({
      id: 'missing-email',
      message: 'Contact has no email address.',
      severity: 'warning',
      field: 'email',
      section: 'summary',
    })
  }

  // Check for missing phone
  if (!contact.phone && !contact.mobile) {
    warnings.push({
      id: 'missing-phone',
      message: 'Contact has no phone number.',
      severity: 'info',
      section: 'summary',
    })
  }

  // Candidate-specific warnings
  if (subtype.includes('candidate')) {
    if (!contact.candidate_resume_url) {
      warnings.push({
        id: 'candidate-no-resume',
        message: 'Candidate has no resume on file.',
        severity: 'warning',
        section: 'documents',
      })
    }
  }

  // Lead-specific warnings
  if (subtype.includes('lead')) {
    if (!contact.lead_score) {
      warnings.push({
        id: 'lead-no-score',
        message: 'Lead has not been scored.',
        severity: 'info',
        section: 'qualification',
      })
    }
  }

  return warnings
}
