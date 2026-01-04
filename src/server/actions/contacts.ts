'use server'

import { unstable_noStore } from 'next/cache'
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
  // Opt-out of caching to ensure fresh data on router.refresh()
  unstable_noStore()

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
          id, title, status, job_type, rate_min, rate_max,
          positions_count, positions_filled, priority, created_at,
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
        id, title, meeting_type, scheduled_at, location_type, location_details,
        agenda, discussion_notes, key_takeaways, action_items, created_at,
        creator:user_profiles!meeting_notes_created_by_fkey(id, first_name, last_name)
      `)
      .contains('contact_ids', [id])
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: false })
      .limit(50),

    // Escalations related to this contact (full fields like AccountEscalation)
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
      .eq('contact_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Related contacts: placeholder - query is done after Promise.all using account IDs
    Promise.resolve({ data: null, error: null }), // Not used, kept for array index alignment
  ])

  // Unused result from placeholder
  void relatedContactsResult

  // Return null if contact not found
  if (contactResult.error || !contactResult.data) {
    return null
  }

  const contact = contactResult.data

  // Collect all account IDs for this contact (from junction table + primary company)
  const accountIds = new Set<string>()

  // Add accounts from junction table
  if (accountsResult.data) {
    for (const link of accountsResult.data) {
      const company = link.company as unknown as { id: string } | null
      if (company?.id) {
        accountIds.add(company.id)
      }
    }
  }

  // Add primary company if exists
  if (primaryCompanyResult.data) {
    const primaryId = (primaryCompanyResult.data as { id: string }).id
    if (primaryId) {
      accountIds.add(primaryId)
    }
  }

  // Query for related contacts through shared accounts
  // Find contacts linked via: 1) company_contacts junction table, 2) contacts.company_id
  let relatedContactsData: ContactRelatedContact[] = []

  if (accountIds.size > 0) {
    const accountIdsArray = Array.from(accountIds)

    // Build a map of account ID -> account name for lookup
    const accountNameMap = new Map<string, string>()

    // Get account names from accountsResult (junction table)
    if (accountsResult.data) {
      for (const link of accountsResult.data) {
        const company = link.company as unknown as { id: string; name: string } | null
        if (company?.id && company?.name) {
          accountNameMap.set(company.id, company.name)
        }
      }
    }

    // Get account name from primaryCompanyResult
    if (primaryCompanyResult.data) {
      const pc = primaryCompanyResult.data as unknown as { id: string; name: string }
      if (pc?.id && pc?.name) {
        accountNameMap.set(pc.id, pc.name)
      }
    }

    // Query 1: Get contacts via company_contacts junction table
    const { data: sharedContactLinks } = await adminClient
      .from('company_contacts')
      .select(`
        contact_id,
        is_primary,
        decision_authority,
        contact:contacts!company_contacts_contact_id_fkey(
          id, first_name, last_name, title, email, phone, deleted_at
        ),
        company:companies!company_contacts_company_id_fkey(
          id, name
        )
      `)
      .in('company_id', accountIdsArray)
      .neq('contact_id', id) // Exclude current contact
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .limit(100)

    // Query 2: Get contacts via contacts.company_id (primary company FK)
    const { data: primaryCompanyContacts } = await adminClient
      .from('contacts')
      .select('id, first_name, last_name, title, email, phone, company_id, is_primary, decision_authority')
      .in('company_id', accountIdsArray)
      .neq('id', id) // Exclude current contact
      .is('deleted_at', null)
      .limit(100)

    // Group by contact and aggregate shared accounts
    const contactMap = new Map<string, {
      contact: Record<string, unknown>
      isPrimary: boolean
      decisionAuthority: string | null
      sharedAccounts: Array<{ id: string; name: string }>
    }>()

    // Process junction table results
    for (const link of sharedContactLinks || []) {
      const contactData = link.contact as unknown as { id: string; first_name: string | null; last_name: string | null; title: string | null; email: string | null; phone: string | null; deleted_at: string | null } | null
      const companyData = link.company as unknown as { id: string; name: string } | null

      // Skip deleted contacts
      if (!contactData || !companyData || contactData.deleted_at) continue

      const existing = contactMap.get(contactData.id)
      if (existing) {
        // Add this account to the shared accounts list
        if (!existing.sharedAccounts.some(a => a.id === companyData.id)) {
          existing.sharedAccounts.push({ id: companyData.id, name: companyData.name })
        }
        // Update isPrimary to true if any link is primary
        if (link.is_primary) {
          existing.isPrimary = true
        }
      } else {
        contactMap.set(contactData.id, {
          contact: contactData as Record<string, unknown>,
          isPrimary: (link.is_primary as boolean) || false,
          decisionAuthority: (link.decision_authority as string) || null,
          sharedAccounts: [{ id: companyData.id, name: companyData.name }],
        })
      }
    }

    // Process primary company FK results
    for (const contactData of primaryCompanyContacts || []) {
      const companyId = contactData.company_id as string
      const companyName = accountNameMap.get(companyId) || 'Unknown Account'

      const existing = contactMap.get(contactData.id as string)
      if (existing) {
        // Add this account to the shared accounts list if not already there
        if (!existing.sharedAccounts.some(a => a.id === companyId)) {
          existing.sharedAccounts.push({ id: companyId, name: companyName })
        }
        // Update isPrimary based on contact's is_primary flag
        if (contactData.is_primary) {
          existing.isPrimary = true
        }
      } else {
        contactMap.set(contactData.id as string, {
          contact: contactData as Record<string, unknown>,
          isPrimary: (contactData.is_primary as boolean) || false,
          decisionAuthority: (contactData.decision_authority as string) || null,
          sharedAccounts: [{ id: companyId, name: companyName }],
        })
      }
    }

    // Transform to ContactRelatedContact array
    relatedContactsData = Array.from(contactMap.values()).map(({ contact, isPrimary, decisionAuthority, sharedAccounts }) => ({
      id: contact.id as string,
      name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown',
      title: contact.title as string | null,
      email: contact.email as string | null,
      phone: contact.phone as string | null,
      isPrimary,
      decisionAuthority,
      sharedAccounts,
    }))

    // Sort: primary contacts first, then by number of shared accounts
    relatedContactsData.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
      return b.sharedAccounts.length - a.sharedAccounts.length
    })
  }

  // Combine submissions from both queries
  const allSubmissions = [
    ...transformSubmissions(submissionsAsCandidateResult.data || [], 'candidate'),
    ...transformSubmissions(submissionsAsPocResult.data || [], 'hiring_manager'),
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  // Transform and return data
  return {
    contact: transformContact(contact, primaryCompanyResult.data as Record<string, unknown> | null),
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
    relatedContacts: relatedContactsData,
    // Universal tools
    activities: transformActivities(activitiesResult.data || []),
    notes: transformNotes(notesResult.data || []),
    documents: transformDocuments(documentsResult.data || []),
    history: transformHistory(historyResult.data || []),
    warnings: computeWarnings(contact),
  }
}

// Transform functions

function transformContact(data: Record<string, unknown>, primaryCompany: Record<string, unknown> | null): ContactData {
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
    company: primaryCompany ? {
      id: (primaryCompany.id as string) || '',
      name: (primaryCompany.name as string) || '',
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
        rateMin: job.rate_min as number | null,
        rateMax: job.rate_max as number | null,
        positionsCount: (job.positions_count as number) || 1,
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
      meetingDate: m.scheduled_at as string,  // DB column is scheduled_at
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
    const createdBy = e.created_by as { id: string; full_name: string; avatar_url: string | null } | null
    const assignedTo = e.assigned_to as { id: string; full_name: string; avatar_url: string | null } | null
    const escalatedTo = e.escalated_to as { id: string; full_name: string; avatar_url: string | null } | null
    const resolvedBy = e.resolved_by as { id: string; full_name: string; avatar_url: string | null } | null

    // Handle related_entities which is JSONB - could be array of IDs or objects
    const relatedEntities = e.related_entities as unknown
    const relatedEntityIds = Array.isArray(relatedEntities)
      ? relatedEntities.map((r: unknown) =>
          typeof r === 'string' ? r : (r as { id?: string })?.id
        ).filter(Boolean) as string[]
      : null

    // Handle client_impact which is text[] in DB
    const clientImpact = e.client_impact as string[] | null

    // Severity defaults to medium if missing
    const severity = (e.severity as string) || 'medium'

    return {
      id: e.id as string,
      escalationNumber: (e.escalation_number as string) || '',
      subject: (e.issue_summary as string) || 'No Subject',
      priority: severity as 'low' | 'medium' | 'high' | 'critical',
      severity: severity as ContactEscalation['severity'],
      escalationType: ((e.escalation_type as string) || 'other') as ContactEscalation['escalationType'],
      status: ((e.status as string) || 'open') as ContactEscalation['status'],
      createdAt: e.created_at as string,
      createdBy: createdBy
        ? { id: createdBy.id, name: createdBy.full_name || 'Unknown', avatarUrl: createdBy.avatar_url }
        : { id: '', name: 'Unknown', avatarUrl: null },
      assignedTo: assignedTo
        ? { id: assignedTo.id, name: assignedTo.full_name || 'Unknown', avatarUrl: assignedTo.avatar_url }
        : null,
      escalatedTo: escalatedTo
        ? { id: escalatedTo.id, name: escalatedTo.full_name || 'Unknown', avatarUrl: escalatedTo.avatar_url }
        : null,
      description: e.detailed_description as string | null,
      issueSummary: (e.issue_summary as string) || '',
      detailedDescription: e.detailed_description as string | null,
      clientImpact,
      rootCause: e.root_cause as string | null,
      immediateActions: e.immediate_actions as string | null,
      resolutionPlan: e.resolution_plan as string | null,
      slaResponseDue: e.sla_response_due as string | null,
      slaResolutionDue: e.sla_resolution_due as string | null,
      slaResponseMet: e.sla_response_met as boolean | null,
      slaResolutionMet: e.sla_resolution_met as boolean | null,
      resolvedAt: e.resolved_at as string | null,
      resolvedBy: resolvedBy
        ? { id: resolvedBy.id, name: resolvedBy.full_name || 'Unknown', avatarUrl: resolvedBy.avatar_url }
        : null,
      resolutionSummary: e.resolution_summary as string | null,
      resolutionActions: e.resolution_actions as string | null,
      timeToResolve: e.time_to_resolve as string | null,
      clientSatisfaction: e.client_satisfaction as ContactEscalation['clientSatisfaction'],
      lessonsLearned: e.lessons_learned as string | null,
      preventiveMeasures: e.preventive_measures as string | null,
      relatedEntityIds,
      updatedAt: e.updated_at as string | null,
    }
  })
}

// Note: This function is kept for backward compatibility but is no longer used
// Related contacts are now processed inline with shared accounts info
function _transformRelatedContacts(data: Record<string, unknown>[]): ContactRelatedContact[] {
  return data.map((c) => ({
    id: c.id as string,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
    title: c.title as string | null,
    email: c.email as string | null,
    phone: c.phone as string | null,
    isPrimary: (c.is_primary as boolean) || false,
    decisionAuthority: c.decision_authority as string | null,
    sharedAccounts: [], // Legacy - no account info available
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
