/**
 * Job Data Mappers
 *
 * Functions to map API response data to section-specific data types.
 * Used by both wizard and workspace to transform job data for sections.
 */

import type {
  BasicInfoSectionData,
  RequirementsSectionData,
  RoleDetailsSectionData,
  LocationSectionData,
  CompensationSectionData,
  InterviewProcessSectionData,
  TeamSectionData,
  SkillEntry,
  InterviewRound,
} from './types'

import {
  DEFAULT_BASIC_INFO_DATA,
  DEFAULT_REQUIREMENTS_DATA,
  DEFAULT_ROLE_DETAILS_DATA,
  DEFAULT_LOCATION_DATA,
  DEFAULT_COMPENSATION_DATA,
  DEFAULT_INTERVIEW_PROCESS_DATA,
  DEFAULT_TEAM_DATA,
} from './types'

// Type for raw API/database job data
type JobRecord = Record<string, unknown>

/**
 * Map job data to BasicInfoSectionData
 */
export function mapToBasicInfoData(job: JobRecord): BasicInfoSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  return {
    // Account & Contact
    accountId: (job.company_id as string) || (job.account_id as string) || '',
    accountName: (job.company as { name?: string })?.name || (job.account as { name?: string })?.name || '',
    clientCompanyId: (job.client_company_id as string) || null,
    endClientCompanyId: (job.end_client_company_id as string) || null,
    vendorCompanyId: (job.vendor_company_id as string) || null,
    hiringManagerContactId: (job.hiring_manager_contact_id as string) || null,
    hrContactId: (job.hr_contact_id as string) || null,
    intakeMethod: (intakeData.intakeMethod as string) || 'phone_video',
    // Position Info
    title: (job.title as string) || '',
    description: (job.description as string) || '',
    positionsCount: (job.positions_count as number) || 1,
    externalJobId: (job.external_job_id as string) || '',
    // Employment Type
    jobType: (job.job_type as BasicInfoSectionData['jobType']) || 'contract',
    // Priority
    priority: (job.priority as BasicInfoSectionData['priority']) || 'normal',
    urgency: (job.urgency as BasicInfoSectionData['urgency']) || 'medium',
    // Dates
    targetStartDate: (job.target_start_date as string) || (intakeData.targetStartDate as string) || '',
    targetEndDate: (job.target_end_date as string) || (intakeData.targetEndDate as string) || '',
    targetFillDate: (job.target_fill_date as string) || '',
    // Status
    status: (job.status as string) || 'draft',
  }
}

/**
 * Map job data to RequirementsSectionData
 */
export function mapToRequirementsData(job: JobRecord): RequirementsSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  // Parse skills from requiredSkillsDetailed or fallback to simple array
  let requiredSkills: SkillEntry[] = []
  const detailedSkills = intakeData.requiredSkillsDetailed as Array<{ name?: string; years?: string; proficiency?: string }> | undefined
  const simpleSkills = job.required_skills as string[] | undefined

  if (detailedSkills && Array.isArray(detailedSkills)) {
    requiredSkills = detailedSkills.map((s) => ({
      name: s.name || '',
      years: s.years || '',
      proficiency: (s.proficiency as SkillEntry['proficiency']) || 'proficient',
    }))
  } else if (simpleSkills && Array.isArray(simpleSkills)) {
    requiredSkills = simpleSkills.map((name) => ({
      name,
      years: '',
      proficiency: 'proficient' as const,
    }))
  }

  return {
    requiredSkills,
    preferredSkills: (intakeData.preferredSkills as string[]) || (job.nice_to_have_skills as string[]) || [],
    minExperience: job.min_experience_years ? String(job.min_experience_years) : (intakeData.minExperience as string) || '',
    maxExperience: job.max_experience_years ? String(job.max_experience_years) : (intakeData.maxExperience as string) || '',
    experienceLevel: (intakeData.experienceLevel as RequirementsSectionData['experienceLevel']) || '',
    education: (intakeData.education as string) || '',
    certifications: (intakeData.certifications as string[]) || [],
    industries: (intakeData.industries as string[]) || [],
    visaRequirements: (job.visa_requirements as string[]) || (intakeData.workAuthorizations as string[]) || [],
  }
}

/**
 * Map job data to RoleDetailsSectionData
 */
export function mapToRoleDetailsData(job: JobRecord): RoleDetailsSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  return {
    roleSummary: (job.role_summary as string) || (intakeData.roleSummary as string) || '',
    responsibilities: (job.responsibilities as string) || (intakeData.responsibilities as string) || '',
    roleOpenReason: (intakeData.roleOpenReason as RoleDetailsSectionData['roleOpenReason']) || '',
    teamName: (intakeData.teamName as string) || '',
    teamSize: (intakeData.teamSize as string) || '',
    reportsTo: (intakeData.reportsTo as string) || '',
    directReports: (intakeData.directReports as string) || '',
    keyProjects: (intakeData.keyProjects as string) || '',
    successMetrics: (intakeData.successMetrics as string) || '',
  }
}

/**
 * Map job data to LocationSectionData
 */
export function mapToLocationData(job: JobRecord): LocationSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  // Determine work arrangement from flags
  let workArrangement: LocationSectionData['workArrangement'] = 'remote'
  if (intakeData.workArrangement) {
    workArrangement = intakeData.workArrangement as LocationSectionData['workArrangement']
  } else if (job.is_hybrid) {
    workArrangement = 'hybrid'
  } else if (job.is_remote === false) {
    workArrangement = 'onsite'
  }

  return {
    workArrangement,
    hybridDays: (job.hybrid_days as number) || (intakeData.hybridDays as number) || 3,
    isRemote: (job.is_remote as boolean) ?? (workArrangement === 'remote'),
    location: (job.location as string) || '',
    locationAddressLine1: (intakeData.locationAddressLine1 as string) || '',
    locationAddressLine2: (intakeData.locationAddressLine2 as string) || '',
    locationCity: (job.location_city as string) || (intakeData.locationCity as string) || '',
    locationState: (job.location_state as string) || (intakeData.locationState as string) || '',
    locationPostalCode: (intakeData.locationPostalCode as string) || '',
    locationCountry: (job.location_country as string) || (intakeData.locationCountry as string) || 'US',
    locationRestrictions: (intakeData.locationRestrictions as string[]) || [],
    workAuthorizations: (intakeData.workAuthorizations as string[]) || [],
  }
}

/**
 * Map job data to CompensationSectionData
 */
export function mapToCompensationData(job: JobRecord): CompensationSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  return {
    rateType: (job.rate_type as CompensationSectionData['rateType']) || 'hourly',
    currency: (job.currency as string) || 'USD',
    billRateMin: job.rate_min ? String(job.rate_min) : '',
    billRateMax: job.rate_max ? String(job.rate_max) : '',
    payRateMin: intakeData.payRateMin ? String(intakeData.payRateMin) : '',
    payRateMax: intakeData.payRateMax ? String(intakeData.payRateMax) : '',
    conversionSalaryMin: intakeData.conversionSalaryMin ? String(intakeData.conversionSalaryMin) : '',
    conversionSalaryMax: intakeData.conversionSalaryMax ? String(intakeData.conversionSalaryMax) : '',
    conversionFee: intakeData.conversionFee ? String(intakeData.conversionFee) : '',
    feeType: (job.fee_type as CompensationSectionData['feeType']) || 'percentage',
    feePercentage: job.fee_percentage ? String(job.fee_percentage) : '',
    feeFlatAmount: job.fee_flat_amount ? String(job.fee_flat_amount) : '',
    benefits: (intakeData.benefits as string[]) || [],
    weeklyHours: intakeData.weeklyHours ? String(intakeData.weeklyHours) : '40',
    overtimeExpected: (intakeData.overtimeExpected as CompensationSectionData['overtimeExpected']) || '',
    onCallRequired: (intakeData.onCallRequired as boolean) || false,
    onCallSchedule: (intakeData.onCallSchedule as string) || '',
  }
}

/**
 * Map job data to InterviewProcessSectionData
 */
export function mapToInterviewProcessData(job: JobRecord): InterviewProcessSectionData {
  const intakeData = (job.intake_data || job.intakeData || {}) as JobRecord

  // Parse interview rounds
  const rawRounds = intakeData.interviewRounds as Array<{
    id?: string
    name?: string
    format?: string
    duration?: number
    interviewer?: string
    focus?: string
  }> | undefined

  const interviewRounds: InterviewRound[] = (rawRounds || []).map((r, idx) => ({
    id: r.id || `round-${idx}`,
    name: r.name || '',
    format: (r.format as InterviewRound['format']) || 'video',
    duration: r.duration || 60,
    interviewer: r.interviewer || '',
    focus: r.focus || '',
  }))

  return {
    interviewRounds,
    decisionDays: (intakeData.decisionDays as string) || '',
    submissionRequirements: (intakeData.submissionRequirements as string[]) || [],
    submissionFormat: (intakeData.submissionFormat as string) || 'standard',
    submissionNotes: (intakeData.submissionNotes as string) || '',
    candidatesPerWeek: (intakeData.candidatesPerWeek as string) || '',
    feedbackTurnaround: intakeData.feedbackTurnaround ? String(intakeData.feedbackTurnaround) : '',
    screeningQuestions: (intakeData.screeningQuestions as string) || '',
    clientInterviewProcess: (job.client_interview_process as string) || '',
    clientSubmissionInstructions: (job.client_submission_instructions as string) || '',
  }
}

/**
 * Map job data to TeamSectionData
 */
export function mapToTeamData(job: JobRecord): TeamSectionData {
  const owner = job.owner as { id?: string; full_name?: string } | undefined

  return {
    ownerId: (job.owner_id as string) || '',
    ownerName: owner?.full_name || undefined,
    recruiterIds: (job.recruiter_ids as string[]) || [],
    recruiterNames: undefined, // Would need to be populated from assignments
    priorityRank: (job.priority_rank as TeamSectionData['priorityRank']) || 0,
    slaDays: (job.sla_days as number) || 30,
  }
}

/**
 * Map all section data from a job record
 */
export function mapJobToAllSections(job: JobRecord) {
  return {
    basicInfo: mapToBasicInfoData(job),
    requirements: mapToRequirementsData(job),
    roleDetails: mapToRoleDetailsData(job),
    location: mapToLocationData(job),
    compensation: mapToCompensationData(job),
    interviewProcess: mapToInterviewProcessData(job),
    team: mapToTeamData(job),
  }
}

/**
 * Get default data for all sections
 */
export function getDefaultJobSectionData() {
  return {
    basicInfo: { ...DEFAULT_BASIC_INFO_DATA },
    requirements: { ...DEFAULT_REQUIREMENTS_DATA },
    roleDetails: { ...DEFAULT_ROLE_DETAILS_DATA },
    location: { ...DEFAULT_LOCATION_DATA },
    compensation: { ...DEFAULT_COMPENSATION_DATA },
    interviewProcess: { ...DEFAULT_INTERVIEW_PROCESS_DATA },
    team: { ...DEFAULT_TEAM_DATA },
  }
}
