/**
 * Contact Data Mappers
 *
 * Functions to map API response data to section-specific data types.
 * Used by both wizard and workspace to transform contact data for sections.
 *
 * Supports both Person and Company contact categories.
 */

import type {
  BasicInfoSectionData,
  EmploymentSectionData,
  CommunicationSectionData,
  SocialSectionData,
  SkillsSectionData,
  CandidateSectionData,
  LeadSectionData,
  AddressesSectionData,
  NotesSectionData,
  TeamSectionData,
  CompanyProfileSectionData,
  ContactAddress,
  ContactSkill,
  ContactCategory,
} from './types'
import { DEFAULT_PHONE } from './types'
import type { PhoneInputValue } from '@/components/ui/phone-input'

/**
 * Parse phone value from string or object format
 */
function parsePhone(phone: unknown): PhoneInputValue {
  if (!phone) return { ...DEFAULT_PHONE }

  // If already an object with the right shape
  if (typeof phone === 'object' && phone !== null) {
    const p = phone as Record<string, unknown>
    return {
      countryCode: ((p.countryCode as string) || (p.country_code as string) || 'US') as PhoneInputValue['countryCode'],
      number: (p.number as string) || '',
    }
  }

  // If it's a string, assume US country code
  if (typeof phone === 'string') {
    return {
      countryCode: 'US',
      number: phone.replace(/^\+1\s?/, ''), // Remove +1 prefix if present
    }
  }

  return { ...DEFAULT_PHONE }
}

/**
 * Map contact data to BasicInfoSectionData
 */
export function mapToBasicInfoData(contact: Record<string, unknown>): BasicInfoSectionData {
  // Determine category
  const category = (contact.category as ContactCategory) || 'person'

  // Parse types array
  let types: string[] = []
  if (Array.isArray(contact.types)) {
    types = contact.types as string[]
  } else if (contact.type) {
    types = [contact.type as string]
  }

  return {
    category,
    // Person identity
    firstName: (contact.firstName as string) || (contact.first_name as string) || '',
    lastName: (contact.lastName as string) || (contact.last_name as string) || '',
    middleName: (contact.middleName as string) || (contact.middle_name as string) || '',
    preferredName: (contact.preferredName as string) || (contact.preferred_name as string) || '',
    suffix: (contact.suffix as string) || '',
    pronouns: (contact.pronouns as string) || '',
    // Company identity
    companyName: (contact.companyName as string) || (contact.company_name as string) || '',
    // Contact methods
    email: (contact.email as string) || '',
    emailSecondary: (contact.emailSecondary as string) || (contact.email_secondary as string) || '',
    phone: parsePhone(contact.phone),
    mobile: parsePhone(contact.mobile || contact.mobile_phone),
    // Profile
    avatarUrl: (contact.avatarUrl as string) || (contact.avatar_url as string) || '',
    photoUrl: (contact.photoUrl as string) || (contact.photo_url as string) || '',
    linkedinUrl: (contact.linkedinUrl as string) || (contact.linkedin_url as string) || '',
    // Classification
    types,
    subtype: (contact.subtype as string) || 'general',
    status: (contact.status as string) || 'active',
    // Owner
    ownerId: (contact.ownerId as string) || (contact.owner_id as string) || '',
  }
}

/**
 * Map contact data to EmploymentSectionData (Person only)
 */
export function mapToEmploymentData(contact: Record<string, unknown>): EmploymentSectionData {
  // Handle nested company object
  const company = contact.company as Record<string, unknown> | undefined

  return {
    currentTitle: (contact.currentTitle as string) || (contact.current_title as string) || (contact.title as string) || '',
    currentDepartment: (contact.currentDepartment as string) || (contact.current_department as string) || (contact.department as string) || '',
    currentCompanyId: company?.id as string || (contact.currentCompanyId as string) || (contact.company_id as string) || '',
    currentCompanyName: company?.name as string || (contact.currentCompanyName as string) || '',
    title: (contact.title as string) || '',
    department: (contact.department as string) || '',
    companyId: company?.id as string || (contact.companyId as string) || (contact.company_id as string) || '',
  }
}

/**
 * Map contact data to CommunicationSectionData
 */
export function mapToCommunicationData(contact: Record<string, unknown>): CommunicationSectionData {
  return {
    preferredContactMethod: (contact.preferredContactMethod as string) || (contact.preferred_contact_method as string) || 'email',
    bestTimeToContact: (contact.bestTimeToContact as string) || (contact.best_time_to_contact as string) || '',
    timezone: (contact.timezone as string) || 'America/New_York',
    language: (contact.language as string) || 'en',
    // Communication opt-outs
    doNotCall: (contact.doNotCall as boolean) ?? (contact.do_not_call as boolean) ?? false,
    doNotEmail: (contact.doNotEmail as boolean) ?? (contact.do_not_email as boolean) ?? false,
    doNotText: (contact.doNotText as boolean) ?? (contact.do_not_text as boolean) ?? false,
    doNotCallBefore: (contact.doNotCallBefore as string) || (contact.do_not_call_before as string) || '',
    doNotCallAfter: (contact.doNotCallAfter as string) || (contact.do_not_call_after as string) || '',
    // Marketing preferences
    marketingEmailsOptIn: (contact.marketingEmailsOptIn as boolean) ?? (contact.marketing_emails_opt_in as boolean) ?? true,
    newsletterOptIn: (contact.newsletterOptIn as boolean) ?? (contact.newsletter_opt_in as boolean) ?? true,
    productUpdatesOptIn: (contact.productUpdatesOptIn as boolean) ?? (contact.product_updates_opt_in as boolean) ?? true,
    // Meetings
    preferredMeetingPlatform: (contact.preferredMeetingPlatform as string) || (contact.preferred_meeting_platform as string) || '',
    meetingDuration: (contact.meetingDuration as number) || (contact.meeting_duration as number) || 30,
    communicationFrequency: (contact.communicationFrequency as string) || (contact.communication_frequency as string) || '',
  }
}

/**
 * Map contact data to SocialSectionData
 */
export function mapToSocialData(contact: Record<string, unknown>): SocialSectionData {
  return {
    linkedinUrl: (contact.linkedinUrl as string) || (contact.linkedin_url as string) || '',
    twitterUrl: (contact.twitterUrl as string) || (contact.twitter_url as string) || '',
    githubUrl: (contact.githubUrl as string) || (contact.github_url as string) || '',
    portfolioUrl: (contact.portfolioUrl as string) || (contact.portfolio_url as string) || '',
    personalWebsite: (contact.personalWebsite as string) || (contact.personal_website as string) || (contact.website as string) || '',
  }
}

/**
 * Map contact data to SkillsSectionData (Candidate type)
 */
export function mapToSkillsData(contact: Record<string, unknown>): SkillsSectionData {
  const rawSkills = contact.skills as unknown[] | undefined
  const candidateSkills = contact.candidateSkills as string[] || contact.candidate_skills as string[] || []

  // Parse skills array - could be strings or skill objects
  let skills: ContactSkill[] = []
  if (rawSkills && Array.isArray(rawSkills)) {
    skills = rawSkills.map((s) => {
      if (typeof s === 'string') {
        return { name: s }
      }
      const skill = s as Record<string, unknown>
      return {
        name: (skill.name as string) || '',
        isPrimary: skill.isPrimary as boolean ?? skill.is_primary as boolean ?? false,
        proficiency: skill.proficiency as ContactSkill['proficiency'],
        yearsOfExperience: skill.yearsOfExperience as number ?? skill.years_of_experience as number,
        isCertified: skill.isCertified as boolean ?? skill.is_certified as boolean ?? false,
        lastUsed: (skill.lastUsed as string) || (skill.last_used as string),
      }
    })
  } else if (candidateSkills.length > 0) {
    skills = candidateSkills.map((name) => ({ name }))
  }

  return {
    skills,
    candidateProfessionalHeadline: (contact.candidateProfessionalHeadline as string) || (contact.candidate_professional_headline as string) || '',
    candidateProfessionalSummary: (contact.candidateProfessionalSummary as string) || (contact.candidate_professional_summary as string) || '',
    candidateCareerObjectives: (contact.candidateCareerObjectives as string) || (contact.candidate_career_objectives as string) || '',
  }
}

/**
 * Map contact data to CandidateSectionData
 */
export function mapToCandidateData(contact: Record<string, unknown>): CandidateSectionData {
  // Parse arrays
  const candidateSkills = (contact.candidateSkills as string[]) || (contact.candidate_skills as string[]) || []
  const preferredLocations = (contact.candidatePreferredLocations as string[]) || (contact.candidate_preferred_locations as string[]) || []
  const employmentTypes = (contact.candidatePreferredEmploymentType as string[]) || (contact.candidate_preferred_employment_type as string[]) || []
  const benefitsRequired = (contact.candidateBenefitsRequired as string[]) || (contact.candidate_benefits_required as string[]) || []

  return {
    candidateStatus: (contact.candidateStatus as string) || (contact.candidate_status as string) || 'available',
    candidateResumeUrl: (contact.candidateResumeUrl as string) || (contact.candidate_resume_url as string) || '',
    candidateSkills,
    candidateExperienceYears: (contact.candidateExperienceYears as number) ?? (contact.candidate_experience_years as number) ?? null,
    candidateCurrentVisa: (contact.candidateCurrentVisa as string) || (contact.candidate_current_visa as string) || '',
    candidateVisaExpiry: (contact.candidateVisaExpiry as string) || (contact.candidate_visa_expiry as string) || null,
    candidateHourlyRate: contact.candidateHourlyRate ? String(contact.candidateHourlyRate) : (contact.candidate_hourly_rate ? String(contact.candidate_hourly_rate) : ''),
    candidateMinimumHourlyRate: contact.candidateMinimumHourlyRate ? String(contact.candidateMinimumHourlyRate) : (contact.candidate_minimum_hourly_rate ? String(contact.candidate_minimum_hourly_rate) : ''),
    candidateDesiredSalaryAnnual: contact.candidateDesiredSalaryAnnual ? String(contact.candidateDesiredSalaryAnnual) : (contact.candidate_desired_salary_annual ? String(contact.candidate_desired_salary_annual) : ''),
    candidateMinimumAnnualSalary: contact.candidateMinimumAnnualSalary ? String(contact.candidateMinimumAnnualSalary) : (contact.candidate_minimum_annual_salary ? String(contact.candidate_minimum_annual_salary) : ''),
    candidateDesiredSalaryCurrency: (contact.candidateDesiredSalaryCurrency as string) || (contact.candidate_desired_salary_currency as string) || 'USD',
    candidateAvailability: (contact.candidateAvailability as string) || (contact.candidate_availability as string) || '',
    candidateWillingToRelocate: (contact.candidateWillingToRelocate as boolean) ?? (contact.candidate_willing_to_relocate as boolean) ?? false,
    candidatePreferredLocations: preferredLocations,
    candidateCurrentEmploymentStatus: (contact.candidateCurrentEmploymentStatus as string) || (contact.candidate_current_employment_status as string) || '',
    candidateNoticePeriodDays: (contact.candidateNoticePeriodDays as number) ?? (contact.candidate_notice_period_days as number) ?? null,
    candidateEarliestStartDate: (contact.candidateEarliestStartDate as string) || (contact.candidate_earliest_start_date as string) || null,
    candidatePreferredEmploymentType: employmentTypes,
    candidateBenefitsRequired: benefitsRequired,
    candidateCompensationNotes: (contact.candidateCompensationNotes as string) || (contact.candidate_compensation_notes as string) || '',
    candidateRecruiterRating: (contact.candidateRecruiterRating as number) ?? (contact.candidate_recruiter_rating as number) ?? null,
    candidateRecruiterRatingNotes: (contact.candidateRecruiterRatingNotes as string) || (contact.candidate_recruiter_rating_notes as string) || '',
    candidateIsOnHotlist: (contact.candidateIsOnHotlist as boolean) ?? (contact.candidate_is_on_hotlist as boolean) ?? false,
    candidateHotlistNotes: (contact.candidateHotlistNotes as string) || (contact.candidate_hotlist_notes as string) || '',
  }
}

/**
 * Map contact data to LeadSectionData
 */
export function mapToLeadData(contact: Record<string, unknown>): LeadSectionData {
  // Parse arrays
  const skillsNeeded = (contact.leadSkillsNeeded as string[]) || (contact.lead_skills_needed as string[]) || []
  const contractTypes = (contact.leadContractTypes as string[]) || (contact.lead_contract_types as string[]) || []

  return {
    leadStatus: (contact.leadStatus as string) || (contact.lead_status as string) || 'new',
    leadScore: (contact.leadScore as number) ?? (contact.lead_score as number) ?? null,
    leadSource: (contact.leadSource as string) || (contact.lead_source as string) || '',
    leadEstimatedValue: contact.leadEstimatedValue ? String(contact.leadEstimatedValue) : (contact.lead_estimated_value ? String(contact.lead_estimated_value) : ''),
    // BANT Qualification
    leadBantBudget: (contact.leadBantBudget as number) || (contact.lead_bant_budget as number) || 0,
    leadBantAuthority: (contact.leadBantAuthority as number) || (contact.lead_bant_authority as number) || 0,
    leadBantNeed: (contact.leadBantNeed as number) || (contact.lead_bant_need as number) || 0,
    leadBantTimeline: (contact.leadBantTimeline as number) || (contact.lead_bant_timeline as number) || 0,
    leadBantBudgetNotes: (contact.leadBantBudgetNotes as string) || (contact.lead_bant_budget_notes as string) || '',
    leadBantAuthorityNotes: (contact.leadBantAuthorityNotes as string) || (contact.lead_bant_authority_notes as string) || '',
    leadBantNeedNotes: (contact.leadBantNeedNotes as string) || (contact.lead_bant_need_notes as string) || '',
    leadBantTimelineNotes: (contact.leadBantTimelineNotes as string) || (contact.lead_bant_timeline_notes as string) || '',
    // Lead Details
    leadBudgetStatus: (contact.leadBudgetStatus as string) || (contact.lead_budget_status as string) || '',
    leadEstimatedMonthlySpend: contact.leadEstimatedMonthlySpend ? String(contact.leadEstimatedMonthlySpend) : (contact.lead_estimated_monthly_spend ? String(contact.lead_estimated_monthly_spend) : ''),
    leadAuthorityLevel: (contact.leadAuthorityLevel as string) || (contact.lead_authority_level as string) || '',
    leadBusinessNeed: (contact.leadBusinessNeed as string) || (contact.lead_business_need as string) || '',
    leadUrgency: (contact.leadUrgency as string) || (contact.lead_urgency as string) || '',
    leadTargetStartDate: (contact.leadTargetStartDate as string) || (contact.lead_target_start_date as string) || null,
    leadPositionsCount: (contact.leadPositionsCount as number) || (contact.lead_positions_count as number) || 1,
    leadSkillsNeeded: skillsNeeded,
    leadContractTypes: contractTypes,
    // Qualification
    leadQualificationResult: (contact.leadQualificationResult as string) || (contact.lead_qualification_result as string) || '',
    leadQualificationNotes: (contact.leadQualificationNotes as string) || (contact.lead_qualification_notes as string) || '',
    leadInterestLevel: (contact.leadInterestLevel as string) || (contact.lead_interest_level as string) || '',
    leadHiringNeeds: (contact.leadHiringNeeds as string) || (contact.lead_hiring_needs as string) || '',
    leadPainPoints: (contact.leadPainPoints as string) || (contact.lead_pain_points as string) || '',
    leadNextAction: (contact.leadNextAction as string) || (contact.lead_next_action as string) || '',
    leadNextActionDate: (contact.leadNextActionDate as string) || (contact.lead_next_action_date as string) || null,
  }
}

/**
 * Map contact data to AddressesSectionData
 */
export function mapToAddressesData(contact: Record<string, unknown>): AddressesSectionData {
  const rawAddresses = contact.addresses as Record<string, unknown>[] | undefined

  const addresses: ContactAddress[] = (rawAddresses || []).map((a) => ({
    id: (a.id as string) || crypto.randomUUID(),
    type: (a.type as string) || (a.address_type as string) || 'home',
    addressLine1: (a.addressLine1 as string) || (a.address_line_1 as string) || (a.street as string) || '',
    addressLine2: (a.addressLine2 as string) || (a.address_line_2 as string) || '',
    city: (a.city as string) || '',
    state: (a.state as string) || (a.state_province as string) || '',
    postalCode: (a.postalCode as string) || (a.postal_code as string) || (a.zip as string) || '',
    country: (a.country as string) || (a.country_code as string) || 'US',
    isPrimary: (a.isPrimary as boolean) ?? (a.is_primary as boolean) ?? false,
  }))

  // If no addresses array, try to build from flat fields
  if (addresses.length === 0) {
    const street = (contact.street as string) || ''
    const city = (contact.city as string) || ''
    if (street || city) {
      addresses.push({
        id: crypto.randomUUID(),
        type: 'home',
        addressLine1: street,
        addressLine2: '',
        city,
        state: (contact.state as string) || '',
        postalCode: (contact.zip as string) || (contact.postalCode as string) || '',
        country: (contact.country as string) || 'US',
        isPrimary: true,
      })
    }
  }

  return { addresses }
}

/**
 * Map contact data to NotesSectionData
 */
export function mapToNotesData(contact: Record<string, unknown>): NotesSectionData {
  return {
    notes: (contact.notes as string) || '',
    internalNotes: (contact.internalNotes as string) || (contact.internal_notes as string) || '',
    relationshipNotes: (contact.relationshipNotes as string) || (contact.relationship_notes as string) || '',
  }
}

/**
 * Map contact data to TeamSectionData
 */
export function mapToTeamData(contact: Record<string, unknown>): TeamSectionData {
  const owner = contact.owner as Record<string, unknown> | undefined

  return {
    ownerId: owner?.id as string || (contact.ownerId as string) || (contact.owner_id as string) || '',
    ownerName: owner?.name as string || owner?.full_name as string || (contact.ownerName as string) || undefined,
  }
}

/**
 * Map contact data to CompanyProfileSectionData (Company category only)
 */
export function mapToCompanyProfileData(contact: Record<string, unknown>): CompanyProfileSectionData {
  return {
    companyName: (contact.companyName as string) || (contact.company_name as string) || (contact.name as string) || '',
    legalName: (contact.legalName as string) || (contact.legal_name as string) || '',
    dba: (contact.dba as string) || (contact.dba_name as string) || '',
    taxId: (contact.taxId as string) || (contact.tax_id as string) || '',
    email: (contact.email as string) || '',
    phone: parsePhone(contact.phone),
    website: (contact.website as string) || '',
    linkedinUrl: (contact.linkedinUrl as string) || (contact.linkedin_url as string) || '',
    description: (contact.description as string) || '',
    // Corporate Profile
    industry: (contact.industry as string) || '',
    industrySecondary: (contact.industrySecondary as string) || (contact.industry_secondary as string) || '',
    foundedYear: contact.foundedYear ? String(contact.foundedYear) : (contact.founded_year ? String(contact.founded_year) : ''),
    employeeCount: (contact.employeeCount as number) ?? (contact.employee_count as number) ?? null,
    employeeCountRange: (contact.employeeCountRange as string) || (contact.employee_count_range as string) || '',
    annualRevenue: contact.annualRevenue ? String(contact.annualRevenue) : (contact.annual_revenue ? String(contact.annual_revenue) : ''),
    annualRevenueRange: (contact.annualRevenueRange as string) || (contact.annual_revenue_range as string) || '',
    // Classification
    companyType: (contact.companyType as string) || (contact.company_type as string) || '',
    tier: (contact.tier as string) || '',
    segment: (contact.segment as string) || '',
  }
}

// ============ REVERSE MAPPERS (Section Data -> API Payload) ============

/**
 * Map BasicInfoSectionData to API payload
 */
export function mapBasicInfoToPayload(data: BasicInfoSectionData): Record<string, unknown> {
  return {
    category: data.category,
    first_name: data.firstName,
    last_name: data.lastName,
    middle_name: data.middleName || null,
    preferred_name: data.preferredName || null,
    suffix: data.suffix || null,
    pronouns: data.pronouns || null,
    company_name: data.companyName || null,
    email: data.email || null,
    email_secondary: data.emailSecondary || null,
    phone: data.phone.number ? data.phone : null,
    mobile: data.mobile.number ? data.mobile : null,
    avatar_url: data.avatarUrl || null,
    photo_url: data.photoUrl || null,
    linkedin_url: data.linkedinUrl || null,
    types: data.types,
    subtype: data.subtype,
    status: data.status,
    owner_id: data.ownerId || null,
  }
}

/**
 * Map EmploymentSectionData to API payload
 */
export function mapEmploymentToPayload(data: EmploymentSectionData): Record<string, unknown> {
  return {
    title: data.currentTitle || data.title,
    department: data.currentDepartment || data.department,
    company_id: data.currentCompanyId || data.companyId || null,
  }
}

/**
 * Map CommunicationSectionData to API payload
 */
export function mapCommunicationToPayload(data: CommunicationSectionData): Record<string, unknown> {
  return {
    preferred_contact_method: data.preferredContactMethod,
    best_time_to_contact: data.bestTimeToContact || null,
    timezone: data.timezone,
    language: data.language,
    do_not_call: data.doNotCall,
    do_not_email: data.doNotEmail,
    do_not_text: data.doNotText,
    do_not_call_before: data.doNotCallBefore || null,
    do_not_call_after: data.doNotCallAfter || null,
    marketing_emails_opt_in: data.marketingEmailsOptIn,
    newsletter_opt_in: data.newsletterOptIn,
    product_updates_opt_in: data.productUpdatesOptIn,
    preferred_meeting_platform: data.preferredMeetingPlatform || null,
    meeting_duration: data.meetingDuration,
    communication_frequency: data.communicationFrequency || null,
  }
}

/**
 * Map SocialSectionData to API payload
 */
export function mapSocialToPayload(data: SocialSectionData): Record<string, unknown> {
  return {
    linkedin_url: data.linkedinUrl || null,
    twitter_url: data.twitterUrl || null,
    github_url: data.githubUrl || null,
    portfolio_url: data.portfolioUrl || null,
    personal_website: data.personalWebsite || null,
  }
}

/**
 * Map CandidateSectionData to API payload
 */
export function mapCandidateToPayload(data: CandidateSectionData): Record<string, unknown> {
  return {
    candidate_status: data.candidateStatus,
    candidate_resume_url: data.candidateResumeUrl || null,
    candidate_skills: data.candidateSkills,
    candidate_experience_years: data.candidateExperienceYears,
    candidate_current_visa: data.candidateCurrentVisa || null,
    candidate_visa_expiry: data.candidateVisaExpiry,
    candidate_hourly_rate: data.candidateHourlyRate ? parseFloat(data.candidateHourlyRate) : null,
    candidate_minimum_hourly_rate: data.candidateMinimumHourlyRate ? parseFloat(data.candidateMinimumHourlyRate) : null,
    candidate_desired_salary_annual: data.candidateDesiredSalaryAnnual ? parseFloat(data.candidateDesiredSalaryAnnual) : null,
    candidate_minimum_annual_salary: data.candidateMinimumAnnualSalary ? parseFloat(data.candidateMinimumAnnualSalary) : null,
    candidate_desired_salary_currency: data.candidateDesiredSalaryCurrency,
    candidate_availability: data.candidateAvailability || null,
    candidate_willing_to_relocate: data.candidateWillingToRelocate,
    candidate_preferred_locations: data.candidatePreferredLocations,
    candidate_current_employment_status: data.candidateCurrentEmploymentStatus || null,
    candidate_notice_period_days: data.candidateNoticePeriodDays,
    candidate_earliest_start_date: data.candidateEarliestStartDate,
    candidate_preferred_employment_type: data.candidatePreferredEmploymentType,
    candidate_benefits_required: data.candidateBenefitsRequired,
    candidate_compensation_notes: data.candidateCompensationNotes || null,
    candidate_recruiter_rating: data.candidateRecruiterRating,
    candidate_recruiter_rating_notes: data.candidateRecruiterRatingNotes || null,
    candidate_is_on_hotlist: data.candidateIsOnHotlist,
    candidate_hotlist_notes: data.candidateHotlistNotes || null,
  }
}

/**
 * Map LeadSectionData to API payload
 */
export function mapLeadToPayload(data: LeadSectionData): Record<string, unknown> {
  return {
    lead_status: data.leadStatus,
    lead_score: data.leadScore,
    lead_source: data.leadSource || null,
    lead_estimated_value: data.leadEstimatedValue ? parseFloat(data.leadEstimatedValue) : null,
    lead_bant_budget: data.leadBantBudget,
    lead_bant_authority: data.leadBantAuthority,
    lead_bant_need: data.leadBantNeed,
    lead_bant_timeline: data.leadBantTimeline,
    lead_bant_budget_notes: data.leadBantBudgetNotes || null,
    lead_bant_authority_notes: data.leadBantAuthorityNotes || null,
    lead_bant_need_notes: data.leadBantNeedNotes || null,
    lead_bant_timeline_notes: data.leadBantTimelineNotes || null,
    lead_budget_status: data.leadBudgetStatus || null,
    lead_estimated_monthly_spend: data.leadEstimatedMonthlySpend ? parseFloat(data.leadEstimatedMonthlySpend) : null,
    lead_authority_level: data.leadAuthorityLevel || null,
    lead_business_need: data.leadBusinessNeed || null,
    lead_urgency: data.leadUrgency || null,
    lead_target_start_date: data.leadTargetStartDate,
    lead_positions_count: data.leadPositionsCount,
    lead_skills_needed: data.leadSkillsNeeded,
    lead_contract_types: data.leadContractTypes,
    lead_qualification_result: data.leadQualificationResult || null,
    lead_qualification_notes: data.leadQualificationNotes || null,
    lead_interest_level: data.leadInterestLevel || null,
    lead_hiring_needs: data.leadHiringNeeds || null,
    lead_pain_points: data.leadPainPoints || null,
    lead_next_action: data.leadNextAction || null,
    lead_next_action_date: data.leadNextActionDate,
  }
}

/**
 * Map AddressesSectionData to API payload
 */
export function mapAddressesToPayload(data: AddressesSectionData): Record<string, unknown> {
  return {
    addresses: data.addresses.map((a) => ({
      id: a.id,
      address_type: a.type,
      address_line_1: a.addressLine1,
      address_line_2: a.addressLine2 || null,
      city: a.city,
      state_province: a.state,
      postal_code: a.postalCode,
      country_code: a.country,
      is_primary: a.isPrimary,
    })),
  }
}

/**
 * Map CompanyProfileSectionData to API payload
 */
export function mapCompanyProfileToPayload(data: CompanyProfileSectionData): Record<string, unknown> {
  return {
    company_name: data.companyName,
    legal_name: data.legalName || null,
    dba_name: data.dba || null,
    tax_id: data.taxId || null,
    email: data.email || null,
    phone: data.phone.number ? data.phone : null,
    website: data.website || null,
    linkedin_url: data.linkedinUrl || null,
    description: data.description || null,
    industry: data.industry || null,
    industry_secondary: data.industrySecondary || null,
    founded_year: data.foundedYear ? parseInt(data.foundedYear) : null,
    employee_count: data.employeeCount,
    employee_count_range: data.employeeCountRange || null,
    annual_revenue: data.annualRevenue ? parseFloat(data.annualRevenue) : null,
    annual_revenue_range: data.annualRevenueRange || null,
    company_type: data.companyType || null,
    tier: data.tier || null,
    segment: data.segment || null,
  }
}
