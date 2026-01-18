'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { getServerCaller } from '@/server/trpc/server-caller'
import type {
  FullCandidateData,
  CandidateData,
  CandidateSkill,
  CandidateWorkHistory,
  CandidateEducation,
  CandidateCertification,
  CandidateScreening,
  CandidateProfile,
  CandidateSubmission,
  CandidateActivity,
  CandidateNote,
  CandidateDocument,
  CandidateResume,
  CandidateStats,
  SubmissionInterview,
  ScreeningScorecard,
  ResumeSource,
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
    workHistoryResult,
    educationResult,
    certificationsResult,
    screeningsResult,
    profilesResult,
    submissionsResult,
    activitiesResult,
    notesResult,
    documentsResult,
    resumesResult,
    resumeUsageResult,
    historyResult,
  ] = await Promise.all([
    // Full candidate data (owner fetched separately - no FK constraint exists)
    adminClient
      .from('candidates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single(),

    // Skills (from candidate_skills table - matches wizard write)
    adminClient
      .from('candidate_skills')
      .select(`
        id,
        skill_id,
        skill_name,
        proficiency_level,
        years_of_experience,
        is_primary,
        is_certified,
        certification_name,
        source,
        created_at
      `)
      .eq('candidate_id', id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false }),

    // Work History
    adminClient
      .from('candidate_work_history')
      .select(`
        id,
        company_name,
        job_title,
        employment_type,
        start_date,
        end_date,
        is_current,
        location_city,
        location_state,
        is_remote,
        description,
        achievements,
        created_at
      `)
      .eq('candidate_id', id)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false }),

    // Education
    adminClient
      .from('candidate_education')
      .select(`
        id,
        institution_name,
        degree_type,
        degree_name,
        field_of_study,
        start_date,
        end_date,
        is_current,
        gpa,
        honors,
        created_at
      `)
      .eq('candidate_id', id)
      .order('end_date', { ascending: false, nullsFirst: true }),

    // Certifications
    adminClient
      .from('candidate_certifications')
      .select(`
        id,
        certification_type,
        name,
        acronym,
        issuing_organization,
        credential_id,
        credential_url,
        issue_date,
        expiry_date,
        is_lifetime,
        created_at
      `)
      .eq('candidate_id', id)
      .order('expiry_date', { ascending: false, nullsFirst: true }),

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
        file_name,
        document_type,
        file_size_bytes,
        public_url,
        storage_path,
        storage_bucket,
        description,
        created_at,
        uploader:user_profiles!documents_uploaded_by_fkey(id, full_name)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),

    // Resumes (versioned - from candidate_resumes table)
    adminClient
      .from('candidate_resumes')
      .select(`
        id,
        version,
        is_latest,
        previous_version_id,
        bucket,
        file_path,
        file_name,
        file_size,
        mime_type,
        resume_type,
        title,
        target_role,
        source,
        notes,
        is_primary,
        parsed_content,
        parsed_skills,
        parsed_experience,
        ai_summary,
        is_archived,
        created_at,
        uploader:user_profiles!candidate_resumes_uploaded_by_fkey(id, full_name, avatar_url)
      `)
      .eq('candidate_id', id)
      .eq('is_archived', false)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20),

    // Resume usage counts (which submissions used which resume)
    adminClient
      .from('submissions')
      .select('client_resume_file_id, submitted_at')
      .eq('candidate_id', id)
      .not('client_resume_file_id', 'is', null),

    // History/Audit trail (from entity_history - comprehensive biography)
    adminClient
      .from('entity_history')
      .select(`
        id, change_type, field_name, old_value, new_value,
        old_value_label, new_value_label, reason, comment,
        is_automated, time_in_previous_state, metadata, changed_at,
        changed_by_user:user_profiles!changed_by(id, full_name, avatar_url)
      `)
      .eq('entity_type', 'candidate')
      .eq('entity_id', id)
      .order('changed_at', { ascending: false })
      .limit(200),
  ])

  // Return null if candidate not found
  if (candidateResult.error || !candidateResult.data) {
    console.error('[getFullCandidate] Candidate not found:', candidateResult.error)
    return null
  }

  const candidate = candidateResult.data

  // Build resume usage lookup (resumeId -> { count, lastUsed })
  const resumeUsage: Record<string, { count: number; lastUsed: string | null }> = {}
  for (const row of resumeUsageResult.data || []) {
    const resumeId = row.client_resume_file_id as string
    if (!resumeUsage[resumeId]) {
      resumeUsage[resumeId] = { count: 0, lastUsed: null }
    }
    resumeUsage[resumeId].count++
    const submittedAt = row.submitted_at as string | null
    if (submittedAt && (!resumeUsage[resumeId].lastUsed || submittedAt > resumeUsage[resumeId].lastUsed!)) {
      resumeUsage[resumeId].lastUsed = submittedAt
    }
  }

  // Transform and compute data
  const skills = transformSkills(skillsResult.data || [])
  const workHistory = transformWorkHistory(workHistoryResult.data || [])
  const education = transformEducation(educationResult.data || [])
  const certifications = transformCertifications(certificationsResult.data || [])
  const screenings = transformScreenings(screeningsResult.data || [])
  const profiles = transformProfiles(profilesResult.data || [])
  const submissions = transformSubmissions(submissionsResult.data || [])
  const activities = transformActivities(activitiesResult.data || [])
  const notes = transformNotes(notesResult.data || [])
  const documents = transformDocuments(documentsResult.data || [])
  const resumes = transformResumes(resumesResult.data || [], resumeUsage)
  const history = transformHistory(historyResult.data || [])

  // Compute stats
  const stats = computeStats(submissions, screenings, profiles)

  // Compute warnings
  const warnings = computeWarnings(candidate, skills, resumes)

  return {
    candidate: transformCandidate(candidate),
    skills,
    workHistory,
    education,
    certifications,
    screenings,
    profiles,
    submissions,
    activities,
    notes,
    documents,
    resumes,
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

  // Get structured location fields (new columns)
  const city = (data.location_city as string | null) || (data.city as string | null)
  const state = (data.location_state as string | null) || (data.state as string | null)
  const country = (data.location_country as string | null) || (data.country as string | null)

  // Compute location string - prefer location field, else construct from parts
  let location = data.location as string | null
  if (!location && (city || state)) {
    if (city && state) {
      location = `${city}, ${state}`
    } else if (city && country) {
      location = `${city}, ${country}`
    } else if (city) {
      location = city
    }
  }

  // Map visa status to work authorization label if work_authorization not set
  const visaStatus = data.visa_status as string | null
  let workAuthorization = data.work_authorization as string | null
  if (!workAuthorization && visaStatus) {
    const visaLabels: Record<string, string> = {
      us_citizen: 'US Citizen',
      green_card: 'Green Card / Permanent Resident',
      h1b: 'H1B Visa',
      l1: 'L1 Visa',
      tn: 'TN Visa',
      opt: 'OPT (F1)',
      cpt: 'CPT (F1)',
      ead: 'EAD Card',
      other: 'Other',
    }
    workAuthorization = visaLabels[visaStatus] || visaStatus
  }

  // Format notice period from days if not set as text
  const noticePeriodDays = data.notice_period_days as number | null
  let noticePeriod = data.notice_period as string | null
  if (!noticePeriod && noticePeriodDays !== null && noticePeriodDays !== undefined) {
    if (noticePeriodDays === 0) {
      noticePeriod = 'Immediate'
    } else if (noticePeriodDays === 14) {
      noticePeriod = '2 weeks'
    } else if (noticePeriodDays === 30) {
      noticePeriod = '1 month'
    } else if (noticePeriodDays === 60) {
      noticePeriod = '2 months'
    } else {
      noticePeriod = `${noticePeriodDays} days`
    }
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
    professionalSummary: data.professional_summary as string | null,
    // Location
    city,
    state,
    country,
    location,
    willingToRelocate: (data.willing_to_relocate as boolean) || false,
    relocationPreferences: data.relocation_preferences as string | null,
    isRemoteOk: (data.is_remote_ok as boolean) || false,
    // Professional
    currentCompany: data.current_company as string | null,
    yearsExperience: data.years_experience as number | null,
    // Employment Preferences
    employmentTypes: data.employment_types as string[] | null,
    workModes: data.work_modes as string[] | null,
    // Rate/Compensation
    rateType: data.rate_type as string | null,
    desiredRate: data.desired_rate as number | null,
    minimumRate: data.minimum_rate as number | null,
    desiredSalary: data.desired_salary as number | null,
    rateCurrency: (data.currency as string) || (data.rate_currency as string) || 'USD',
    isNegotiable: data.is_negotiable as boolean | null,
    compensationNotes: data.compensation_notes as string | null,
    // Work Authorization
    workAuthorization,
    visaStatus,
    visaExpiryDate: data.visa_expiry_date as string | null,
    requiresSponsorship: data.requires_sponsorship as boolean | null,
    currentSponsor: data.current_sponsor as string | null,
    isTransferable: data.is_transferable as boolean | null,
    clearanceLevel: data.clearance_level as string | null,
    // Availability
    availability: data.availability as string | null,
    availableDate: data.available_date as string | null,
    availableFrom: data.available_from as string | null,
    noticePeriod,
    noticePeriodDays,
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
    source: (data.lead_source as string | null) || (data.source as string | null),
    sourceDetails: (data.lead_source_detail as string | null) || (data.source_details as string | null),
    referredBy: data.referred_by as string | null,
    campaignId: data.campaign_id as string | null,
    // Tags & Notes
    tags: data.tags as string[] | null,
    internalNotes: data.internal_notes as string | null,
    hotlistNotes: data.hotlist_notes as string | null,
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
    // Map proficiency_level text to number (candidate_skills uses text like 'beginner', 'intermediate', 'expert')
    const proficiencyText = (s.proficiency_level as string) || 'intermediate'
    const proficiencyMap: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    }
    const proficiencyLevel = proficiencyMap[proficiencyText.toLowerCase()] || 2

    return {
      id: s.id as string,
      skillId: (s.skill_id as string) || s.id as string,
      skillName: (s.skill_name as string) || 'Unknown Skill',
      skillCategory: null, // candidate_skills doesn't have category
      proficiencyLevel,
      yearsExperience: s.years_of_experience as number | null,
      isPrimary: (s.is_primary as boolean) || false,
      isRequired: false, // candidate_skills doesn't have is_required
      isVerified: (s.is_certified as boolean) || false,
      verifiedBy: null,
      verifiedAt: null,
      source: s.source as string | null,
      createdAt: s.created_at as string,
    }
  })
}

function transformWorkHistory(data: Record<string, unknown>[]): CandidateWorkHistory[] {
  return data.map((w) => {
    // Format employment type label
    const employmentType = w.employment_type as string | null
    const employmentTypeLabels: Record<string, string> = {
      full_time: 'Full-Time',
      contract: 'Contract',
      part_time: 'Part-Time',
      internship: 'Internship',
    }

    // Build location string
    const city = w.location_city as string | null
    const state = w.location_state as string | null
    const isRemote = (w.is_remote as boolean) || false
    let location: string | null = null
    if (isRemote) {
      location = city && state ? `${city}, ${state} (Remote)` : 'Remote'
    } else if (city && state) {
      location = `${city}, ${state}`
    } else if (city) {
      location = city
    }

    return {
      id: w.id as string,
      companyName: (w.company_name as string) || '',
      jobTitle: (w.job_title as string) || '',
      employmentType,
      employmentTypeLabel: employmentType ? employmentTypeLabels[employmentType] || employmentType : null,
      startDate: w.start_date as string | null,
      endDate: w.end_date as string | null,
      isCurrent: (w.is_current as boolean) || false,
      location,
      locationCity: city,
      locationState: state,
      isRemote,
      description: w.description as string | null,
      achievements: (w.achievements as string[]) || [],
      createdAt: w.created_at as string,
    }
  })
}

function transformEducation(data: Record<string, unknown>[]): CandidateEducation[] {
  const degreeTypeLabels: Record<string, string> = {
    high_school: 'High School / GED',
    associate: "Associate's Degree",
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    phd: 'Doctorate / PhD',
    other: 'Other Credential',
  }

  return data.map((e) => {
    const degreeType = e.degree_type as string | null
    const degreeName = e.degree_name as string | null
    const fieldOfStudy = e.field_of_study as string | null

    // Build degree display string
    let degreeDisplay: string | null = null
    if (degreeName && fieldOfStudy) {
      degreeDisplay = `${degreeName} in ${fieldOfStudy}`
    } else if (degreeName) {
      degreeDisplay = degreeName
    } else if (degreeType) {
      degreeDisplay = degreeTypeLabels[degreeType] || degreeType
      if (fieldOfStudy) {
        degreeDisplay += ` in ${fieldOfStudy}`
      }
    }

    return {
      id: e.id as string,
      institutionName: (e.institution_name as string) || '',
      degreeType,
      degreeTypeLabel: degreeType ? degreeTypeLabels[degreeType] || degreeType : null,
      degreeName,
      fieldOfStudy,
      degreeDisplay,
      startDate: e.start_date as string | null,
      endDate: e.end_date as string | null,
      isCurrent: (e.is_current as boolean) || false,
      gpa: e.gpa as number | null,
      honors: e.honors as string | null,
      createdAt: e.created_at as string,
    }
  })
}

function transformCertifications(data: Record<string, unknown>[]): CandidateCertification[] {
  return data.map((c) => {
    const expiryDate = c.expiry_date as string | null
    const isLifetime = (c.is_lifetime as boolean) || false

    // Calculate expiry status
    let expiryStatus: 'active' | 'expiring_soon' | 'expired' | 'lifetime' = 'active'
    if (isLifetime) {
      expiryStatus = 'lifetime'
    } else if (expiryDate) {
      const expiry = new Date(expiryDate)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry < 0) {
        expiryStatus = 'expired'
      } else if (daysUntilExpiry <= 90) {
        expiryStatus = 'expiring_soon'
      }
    }

    return {
      id: c.id as string,
      name: (c.name as string) || '',
      acronym: c.acronym as string | null,
      issuingOrganization: c.issuing_organization as string | null,
      credentialId: c.credential_id as string | null,
      credentialUrl: c.credential_url as string | null,
      issueDate: c.issue_date as string | null,
      expiryDate,
      isLifetime,
      expiryStatus,
      createdAt: c.created_at as string,
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

function transformDocuments(documentsData: Record<string, unknown>[]): CandidateDocument[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  // Transform regular documents (excluding resumes - those are in the separate resumes array)
  return documentsData
    .filter((d) => (d.document_type as string) !== 'resume')
    .map((d) => {
      const uploader = d.uploader as { id: string; full_name: string } | null
      // Construct URL from storage path if public_url not set
      let fileUrl = d.public_url as string | null
      if (!fileUrl && d.storage_path) {
        const bucket = (d.storage_bucket as string) || 'documents'
        fileUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${d.storage_path}`
      }

      return {
        id: d.id as string,
        name: (d.file_name as string) || 'Untitled',
        documentType: (d.document_type as string) || 'other',
        fileSize: (d.file_size_bytes as number) || 0,
        fileUrl: fileUrl || '',
        uploadedAt: d.created_at as string,
        uploadedBy: uploader ? {
          id: uploader.id,
          fullName: uploader.full_name,
        } : null,
      }
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

function transformResumes(
  resumesData: Record<string, unknown>[],
  resumeUsage: Record<string, { count: number; lastUsed: string | null }>
): CandidateResume[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  return resumesData.map((r) => {
    const uploader = r.uploader as { id: string; full_name: string; avatar_url: string | null } | null
    const bucket = (r.bucket as string) || 'resumes'
    const filePath = (r.file_path as string) || ''
    const usage = resumeUsage[r.id as string]

    // Generate public URL from storage path
    const fileUrl = filePath
      ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`
      : ''

    return {
      id: r.id as string,
      // Versioning
      version: (r.version as number) || 1,
      isLatest: (r.is_latest as boolean) ?? true,
      previousVersionId: r.previous_version_id as string | null,
      // File info
      filePath,
      fileName: (r.file_name as string) || 'Resume',
      fileSize: (r.file_size as number) || 0,
      mimeType: (r.mime_type as string) || 'application/pdf',
      bucket,
      fileUrl,
      // Metadata (title in DB maps to label in UI)
      label: r.title as string | null,
      targetRole: r.target_role as string | null,
      source: ((r.source as string) || 'uploaded') as ResumeSource,
      notes: r.notes as string | null,
      isPrimary: (r.is_primary as boolean) || false,
      // Parsed content (from AI)
      resumeType: (r.resume_type as string) || 'master',
      parsedContent: r.parsed_content as string | null,
      parsedSkills: r.parsed_skills as string[] | null,
      parsedExperience: r.parsed_experience as string | null,
      aiSummary: r.ai_summary as string | null,
      // Audit
      uploadedAt: r.created_at as string,
      uploadedBy: uploader ? {
        id: uploader.id,
        fullName: uploader.full_name,
        avatarUrl: uploader.avatar_url,
      } : null,
      // Archive status
      isArchived: false, // We filter out archived ones in the query
      // Submission usage
      submissionCount: usage?.count || 0,
      lastUsedAt: usage?.lastUsed || null,
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
  resumes: CandidateResume[]
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
  if (resumes.length === 0) {
    warnings.push({
      id: 'no-resume',
      message: 'Candidate has no resume on file.',
      severity: 'warning',
      section: 'resumes',
    })
  }

  // Check for no primary resume set (if they have resumes)
  if (resumes.length > 0 && !resumes.some((r) => r.isPrimary)) {
    warnings.push({
      id: 'no-primary-resume',
      message: 'No primary resume set. Set a default for submissions.',
      severity: 'info',
      section: 'resumes',
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
