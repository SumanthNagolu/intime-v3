'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullCandidateData,
  CandidateData,
  CandidateSkill,
  CandidateScreening,
  CandidateProfile,
  CandidateSubmission,
  CandidateActivity,
  CandidateNote,
  CandidateDocument,
  CandidateStats,
  SubmissionInterview,
  ScreeningScorecard,
} from '@/types/candidate-workspace'
import type { WorkspaceWarning, HistoryEntry } from '@/types/workspace'

/**
 * Fetches all candidate data in ONE database round-trip.
 * This follows the ONE DB CALL pattern established in GW-020 and GW-021.
 *
 * All section data is fetched in parallel using Promise.all,
 * so we get maximum performance with a single network round-trip.
 */
export async function getFullCandidate(id: string): Promise<FullCandidateData | null> {
  const caller = await getServerCaller()
  const adminClient = getAdminClient()

  // Verify access via tRPC (handles auth + org context)
  let candidateBase: Record<string, unknown> | null = null
  try {
    candidateBase = await caller.ats.candidates.getById({ id }) as Record<string, unknown>
    if (!candidateBase) return null
  } catch {
    return null
  }

  // Fetch all data in parallel
  const [
    candidateResult,
    skillsResult,
    screeningsResult,
    profilesResult,
    submissionsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    historyResult,
  ] = await Promise.all([
    // Full candidate data with owner
    adminClient
      .from('candidates')
      .select(`
        *,
        owner:user_profiles!owner_id(id, full_name, avatar_url),
        company:companies!company_id(id, name)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single(),

    // Skills (polymorphic entity_skills table)
    adminClient
      .from('entity_skills')
      .select(`
        id,
        skill_id,
        proficiency_level,
        years_experience,
        is_primary,
        is_required,
        is_verified,
        verified_by,
        verified_at,
        source,
        created_at,
        skill:skills!entity_skills_skill_id_fkey(id, name, category)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('is_primary', { ascending: false })
      .order('proficiency_level', { ascending: false }),

    // Screenings
    adminClient
      .from('candidate_screenings')
      .select(`
        id,
        screening_type,
        status,
        result,
        overall_score,
        started_at,
        completed_at,
        scorecard,
        notes,
        created_at,
        job:jobs!candidate_screenings_job_id_fkey(id, title),
        screener:user_profiles!candidate_screenings_screener_id_fkey(id, full_name, avatar_url)
      `)
      .eq('candidate_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Marketing profiles
    adminClient
      .from('candidate_prepared_profiles')
      .select(`
        id,
        name,
        template_type,
        content,
        status,
        usage_count,
        last_used_at,
        finalized_at,
        created_at,
        updated_at,
        created_by:user_profiles!candidate_prepared_profiles_created_by_fkey(id, full_name)
      `)
      .eq('candidate_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Submissions with job, account, recruiter, and interviews
    adminClient
      .from('submissions')
      .select(`
        id,
        status,
        stage,
        submitted_at,
        updated_at,
        submitted_rate,
        bill_rate,
        ai_match_score,
        recruiter_match_score,
        outcome,
        outcome_reason,
        job:jobs!submissions_job_id_fkey(id, title),
        account:companies!submissions_company_id_fkey(id, name),
        recruiter:user_profiles!submissions_owner_id_fkey(id, full_name, avatar_url),
        interviews:interviews!interviews_submission_id_fkey(
          id,
          interview_type,
          scheduled_at,
          status,
          interviewer_name,
          rating,
          feedback
        ),
        feedback:submission_feedbacks!submission_feedbacks_submission_id_fkey(
          id,
          rating
        )
      `)
      .eq('candidate_id', id)
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false })
      .limit(100),

    // Activities (polymorphic)
    adminClient
      .from('activities')
      .select(`
        id,
        activity_type,
        subject,
        description,
        due_date,
        status,
        priority,
        created_at,
        completed_at,
        assigned_to:user_profiles!activities_assigned_to_fkey(id, full_name)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),

    // Notes (polymorphic)
    adminClient
      .from('notes')
      .select(`
        id,
        content,
        is_pinned,
        created_at,
        creator:user_profiles!notes_created_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),

    // Documents (polymorphic)
    adminClient
      .from('documents')
      .select(`
        id,
        name,
        document_type,
        file_size,
        file_url,
        created_at,
        uploader:user_profiles!documents_uploaded_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // History/Audit trail
    adminClient
      .from('audit_logs')
      .select(`
        id,
        action,
        field_name,
        old_value,
        new_value,
        created_at,
        user:user_profiles!audit_logs_user_id_fkey(id, full_name)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Return null if candidate not found
  if (candidateResult.error || !candidateResult.data) {
    console.error('[getFullCandidate] Candidate not found:', candidateResult.error)
    return null
  }

  const candidate = candidateResult.data

  // Transform and compute data
  const skills = transformSkills(skillsResult.data || [])
  const screenings = transformScreenings(screeningsResult.data || [])
  const profiles = transformProfiles(profilesResult.data || [])
  const submissions = transformSubmissions(submissionsResult.data || [])
  const activities = transformActivities(activitiesResult.data || [])
  const notes = transformNotes(notesResult.data || [])
  const documents = transformDocuments(documentsResult.data || [])
  const history = transformHistory(historyResult.data || [])

  // Compute stats
  const stats = computeStats(submissions, screenings, profiles)

  // Compute warnings
  const warnings = computeWarnings(candidate, skills, documents)

  return {
    candidate: transformCandidate(candidate),
    skills,
    screenings,
    profiles,
    submissions,
    activities,
    notes,
    documents,
    history,
    warnings,
    stats,
  }
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

function transformCandidate(data: Record<string, unknown>): CandidateData {
  const owner = data.owner as { id: string; full_name: string; avatar_url: string | null } | null
  const company = data.company as { id: string; name: string } | null

  // Compute location string
  const city = data.city as string | null
  const state = data.state as string | null
  const country = data.country as string | null
  let location: string | null = null
  if (city && state) {
    location = `${city}, ${state}`
  } else if (city && country) {
    location = `${city}, ${country}`
  } else if (city) {
    location = city
  }

  return {
    id: data.id as string,
    firstName: (data.first_name as string) || '',
    lastName: (data.last_name as string) || '',
    fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: data.email as string | null,
    phone: data.phone as string | null,
    mobile: data.mobile as string | null,
    title: data.title as string | null,
    headline: data.headline as string | null,
    // Location
    city,
    state,
    country,
    location,
    willingToRelocate: (data.willing_to_relocate as boolean) || false,
    // Professional
    currentCompany: data.current_company as string | null,
    yearsExperience: data.years_experience as number | null,
    // Rate/Compensation
    desiredRate: data.desired_rate as number | null,
    desiredSalary: data.desired_salary as number | null,
    rateCurrency: (data.rate_currency as string) || 'USD',
    // Work Authorization
    workAuthorization: data.work_authorization as string | null,
    visaStatus: data.visa_status as string | null,
    visaExpiryDate: data.visa_expiry_date as string | null,
    clearanceLevel: data.clearance_level as string | null,
    // Availability
    availability: data.availability as string | null,
    availableDate: data.available_date as string | null,
    noticePeriod: data.notice_period as string | null,
    // Status
    status: (data.status as string) || 'active',
    candidateStatus: data.candidate_status as string | null,
    isOnHotlist: (data.is_on_hotlist as boolean) || false,
    hotlistAddedAt: data.hotlist_added_at as string | null,
    // Resume
    resumeUrl: data.resume_url as string | null,
    resumeUpdatedAt: data.resume_updated_at as string | null,
    // LinkedIn
    linkedinUrl: data.linkedin_url as string | null,
    // Source
    source: data.source as string | null,
    sourceDetails: data.source_details as string | null,
    // Timestamps
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
    // Related
    owner: owner ? {
      id: owner.id,
      fullName: owner.full_name,
      avatarUrl: owner.avatar_url,
    } : null,
    company: company ? {
      id: company.id,
      name: company.name,
    } : null,
  }
}

function transformSkills(data: Record<string, unknown>[]): CandidateSkill[] {
  return data.map((s) => {
    const skill = s.skill as { id: string; name: string; category: string | null } | null
    return {
      id: s.id as string,
      skillId: s.skill_id as string,
      skillName: skill?.name || 'Unknown Skill',
      skillCategory: skill?.category || null,
      proficiencyLevel: (s.proficiency_level as number) || 1,
      yearsExperience: s.years_experience as number | null,
      isPrimary: (s.is_primary as boolean) || false,
      isRequired: (s.is_required as boolean) || false,
      isVerified: (s.is_verified as boolean) || false,
      verifiedBy: s.verified_by as string | null,
      verifiedAt: s.verified_at as string | null,
      source: s.source as string | null,
      createdAt: s.created_at as string,
    }
  })
}

function transformScreenings(data: Record<string, unknown>[]): CandidateScreening[] {
  return data.map((s) => {
    const job = s.job as { id: string; title: string } | null
    const screener = s.screener as { id: string; full_name: string; avatar_url: string | null } | null
    const scorecardData = s.scorecard as Record<string, unknown> | null

    let scorecard: ScreeningScorecard | null = null
    if (scorecardData) {
      scorecard = {
        categories: (scorecardData.categories as unknown[])?.map((c: unknown) => {
          const cat = c as Record<string, unknown>
          return {
            name: (cat.name as string) || '',
            score: (cat.score as number) || 0,
            weight: (cat.weight as number) || 1,
            notes: cat.notes as string | null,
          }
        }) || [],
        overallNotes: scorecardData.overall_notes as string | null,
        recommendation: scorecardData.recommendation as string | null,
      }
    }

    return {
      id: s.id as string,
      screeningType: (s.screening_type as string) || 'general',
      status: (s.status as string) || 'pending',
      result: s.result as string | null,
      overallScore: s.overall_score as number | null,
      startedAt: s.started_at as string | null,
      completedAt: s.completed_at as string | null,
      job: job ? { id: job.id, title: job.title } : null,
      screener: screener ? {
        id: screener.id,
        fullName: screener.full_name,
        avatarUrl: screener.avatar_url,
      } : null,
      scorecard,
      notes: s.notes as string | null,
      createdAt: s.created_at as string,
    }
  })
}

function transformProfiles(data: Record<string, unknown>[]): CandidateProfile[] {
  return data.map((p) => {
    const createdBy = p.created_by as { id: string; full_name: string } | null
    return {
      id: p.id as string,
      name: (p.name as string) || 'Untitled Profile',
      templateType: p.template_type as string | null,
      content: p.content as string | null,
      usageCount: (p.usage_count as number) || 0,
      lastUsedAt: p.last_used_at as string | null,
      createdBy: createdBy ? {
        id: createdBy.id,
        fullName: createdBy.full_name,
      } : null,
      createdAt: p.created_at as string,
      updatedAt: p.updated_at as string | null,
    }
  })
}

function transformSubmissions(data: Record<string, unknown>[]): CandidateSubmission[] {
  return data.map((s) => {
    const job = s.job as { id: string; title: string } | null
    const account = s.account as { id: string; name: string } | null
    const recruiter = s.recruiter as { id: string; full_name: string; avatar_url: string | null } | null
    const interviewsData = (s.interviews as Record<string, unknown>[]) || []
    const feedbackData = (s.feedback as Record<string, unknown>[]) || []

    const interviews: SubmissionInterview[] = interviewsData.map((i) => ({
      id: i.id as string,
      interviewType: (i.interview_type as string) || 'general',
      scheduledAt: i.scheduled_at as string | null,
      status: (i.status as string) || 'scheduled',
      interviewer: i.interviewer_name as string | null,
      rating: i.rating as number | null,
      feedback: i.feedback as string | null,
    }))

    // Calculate average rating from feedback
    const ratings = feedbackData
      .map((f) => f.rating as number | null)
      .filter((r): r is number => r !== null)
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null

    return {
      id: s.id as string,
      status: (s.status as string) || 'sourced',
      stage: (s.stage as string) || 'sourced',
      submittedAt: s.submitted_at as string | null,
      updatedAt: s.updated_at as string | null,
      job: job ? { id: job.id, title: job.title } : null,
      account: account ? { id: account.id, name: account.name } : null,
      recruiter: recruiter ? {
        id: recruiter.id,
        fullName: recruiter.full_name,
        avatarUrl: recruiter.avatar_url,
      } : null,
      submittedRate: s.submitted_rate as number | null,
      billRate: s.bill_rate as number | null,
      aiMatchScore: s.ai_match_score as number | null,
      recruiterMatchScore: s.recruiter_match_score as number | null,
      interviews,
      interviewCount: interviews.length,
      feedbackCount: feedbackData.length,
      averageRating,
      outcome: s.outcome as string | null,
      outcomeReason: s.outcome_reason as string | null,
    }
  })
}

function transformActivities(data: Record<string, unknown>[]): CandidateActivity[] {
  return data.map((a) => {
    const assignedTo = a.assigned_to as { id: string; full_name: string } | null
    return {
      id: a.id as string,
      type: (a.activity_type as string) || 'task',
      subject: a.subject as string | null,
      description: a.description as string | null,
      dueDate: a.due_date as string | null,
      status: (a.status as string) || 'pending',
      priority: a.priority as string | null,
      assignedTo: assignedTo ? {
        id: assignedTo.id,
        fullName: assignedTo.full_name,
      } : null,
      createdAt: a.created_at as string,
      completedAt: a.completed_at as string | null,
    }
  })
}

function transformNotes(data: Record<string, unknown>[]): CandidateNote[] {
  return data.map((n) => {
    const creator = n.creator as { id: string; full_name: string } | null
    return {
      id: n.id as string,
      content: (n.content as string) || '',
      isPinned: (n.is_pinned as boolean) || false,
      createdAt: n.created_at as string,
      createdBy: creator ? {
        id: creator.id,
        fullName: creator.full_name,
      } : null,
    }
  })
}

function transformDocuments(data: Record<string, unknown>[]): CandidateDocument[] {
  return data.map((d) => {
    const uploader = d.uploader as { id: string; full_name: string } | null
    return {
      id: d.id as string,
      name: (d.name as string) || 'Untitled',
      documentType: (d.document_type as string) || 'other',
      fileSize: (d.file_size as number) || 0,
      fileUrl: (d.file_url as string) || '',
      uploadedAt: d.created_at as string,
      uploadedBy: uploader ? {
        id: uploader.id,
        fullName: uploader.full_name,
      } : null,
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

// =============================================================================
// COMPUTE FUNCTIONS
// =============================================================================

function computeStats(
  submissions: CandidateSubmission[],
  screenings: CandidateScreening[],
  profiles: CandidateProfile[]
): CandidateStats {
  const activeStatuses = ['sourced', 'screening', 'submission_ready', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage']
  const activeSubmissions = submissions.filter((s) => activeStatuses.includes(s.status))
  const interviews = submissions.reduce((count, s) => count + s.interviewCount, 0)
  const offers = submissions.filter((s) => s.status === 'offer_stage').length
  const placements = submissions.filter((s) => s.status === 'placed').length
  const completedScreenings = screenings.filter((s) => s.status === 'completed').length

  // Calculate conversion rate
  const conversionRate = submissions.length > 0
    ? (placements / submissions.length) * 100
    : null

  return {
    totalSubmissions: submissions.length,
    activeSubmissions: activeSubmissions.length,
    interviews,
    offers,
    placements,
    screeningsCompleted: completedScreenings,
    profilesCreated: profiles.length,
    conversionRate,
    averageTimeInPipeline: null, // Would need more data to compute
  }
}

function computeWarnings(
  candidate: Record<string, unknown>,
  skills: CandidateSkill[],
  documents: CandidateDocument[]
): WorkspaceWarning[] {
  const warnings: WorkspaceWarning[] = []

  // Check for missing email
  if (!candidate.email) {
    warnings.push({
      id: 'missing-email',
      message: 'Candidate has no email address.',
      severity: 'warning',
      field: 'email',
      section: 'summary',
    })
  }

  // Check for missing phone
  if (!candidate.phone && !candidate.mobile) {
    warnings.push({
      id: 'missing-phone',
      message: 'Candidate has no phone number.',
      severity: 'info',
      section: 'summary',
    })
  }

  // Check for missing resume
  const hasResume = candidate.resume_url || documents.some((d) => d.documentType === 'resume')
  if (!hasResume) {
    warnings.push({
      id: 'no-resume',
      message: 'Candidate has no resume on file.',
      severity: 'warning',
      section: 'documents',
    })
  }

  // Check for expiring visa
  const visaExpiry = candidate.visa_expiry_date as string | null
  if (visaExpiry) {
    const expiryDate = new Date(visaExpiry)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      warnings.push({
        id: 'visa-expired',
        message: 'Work authorization has expired.',
        severity: 'error',
        section: 'summary',
      })
    } else if (daysUntilExpiry <= 60) {
      warnings.push({
        id: 'visa-expiring',
        message: `Work authorization expires in ${daysUntilExpiry} days.`,
        severity: 'warning',
        section: 'summary',
      })
    }
  }

  // Check for no skills
  if (skills.length === 0) {
    warnings.push({
      id: 'no-skills',
      message: 'Candidate has no skills on profile.',
      severity: 'info',
      section: 'summary',
    })
  }

  return warnings
}
