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
    submissionsAsCandidateResult,
    submissionsAsPocResult,
    campaignsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
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

    // Linked accounts (via company_id - references companies table)
    contactBase.company_id ? adminClient
      .from('companies')
      .select(`
        id, name, industry, status, category
      `)
      .eq('id', contactBase.company_id as string)
      .is('deleted_at', null)
      .limit(10) : Promise.resolve({ data: [], error: null }),

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
        id, activity_type, subject, due_date, status, created_at,
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
        id, content, is_pinned, created_at,
        creator:user_profiles!created_by(id, full_name)
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
    accounts: transformAccounts(accountsResult.data || [], contact),
    submissions: allSubmissions,
    campaigns: transformCampaigns(campaignsResult.data || []),
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
  data: Record<string, unknown>[],
  contact: Record<string, unknown>
): ContactAccount[] {
  // If contact has a company_id, that's their primary account
  const companyId = contact.company_id as string | null
  const isPrimary = (contact.is_primary as boolean) || false

  return data.map((a) => ({
    id: a.id as string,
    name: a.name as string,
    industry: a.industry as string | null,
    status: (a.status as string) || 'active',
    role: isPrimary ? 'Primary Contact' : 'Contact',
    isPrimary: a.id === companyId && isPrimary,
    sinceDate: contact.created_at as string | null,
  }))
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
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): ContactNote[] {
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
