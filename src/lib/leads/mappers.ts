/**
 * Lead Data Mappers - Enterprise-grade staffing lead data transformation
 *
 * Functions to map API response data (snake_case) to section-specific data types (camelCase).
 * Used by both wizard and workspace to transform lead data for sections.
 * Supports the 7-section architecture defined in types.ts.
 */

import type {
  IdentitySectionData,
  ClassificationSectionData,
  RequirementsSectionData,
  QualificationSectionData,
  ClientProfileSectionData,
  SourceSectionData,
  TeamSectionData,
  LeadWizardData,
} from './types'
import {
  DEFAULT_PHONE,
  DEFAULT_IDENTITY_DATA,
  DEFAULT_CLASSIFICATION_DATA,
  DEFAULT_REQUIREMENTS_DATA,
  DEFAULT_QUALIFICATION_DATA,
  DEFAULT_CLIENT_PROFILE_DATA,
  DEFAULT_SOURCE_DATA,
  DEFAULT_TEAM_DATA,
} from './types'
import type { PhoneInputValue } from '@/components/ui/phone-input'

// ============ UTILITY FUNCTIONS ============

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
 * Parse array field from API data
 */
function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      return JSON.parse(value) as T[]
    } catch {
      return []
    }
  }
  return []
}

/**
 * Safe string extraction with fallback
 */
function getString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value !== '') return value
  }
  return ''
}

/**
 * Safe number extraction with null support
 */
function getNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string' && value !== '') {
      const num = parseFloat(value)
      if (!isNaN(num)) return num
    }
  }
  return null
}

/**
 * Safe boolean extraction
 */
function getBoolean(obj: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'boolean') return value
  }
  return false
}

// ============ SECTION 1: IDENTITY ============

/**
 * Map lead data to IdentitySectionData
 */
export function mapToIdentityData(lead: Record<string, unknown>): IdentitySectionData {
  return {
    // Contact Info
    firstName: getString(lead, 'first_name', 'firstName') || DEFAULT_IDENTITY_DATA.firstName,
    lastName: getString(lead, 'last_name', 'lastName') || DEFAULT_IDENTITY_DATA.lastName,
    email: getString(lead, 'email') || DEFAULT_IDENTITY_DATA.email,
    phone: parsePhone(lead.phone),
    mobile: parsePhone(lead.mobile),
    title: getString(lead, 'title') || DEFAULT_IDENTITY_DATA.title,
    department: getString(lead, 'department') || DEFAULT_IDENTITY_DATA.department,
    linkedinUrl: getString(lead, 'linkedin_url', 'linkedinUrl') || DEFAULT_IDENTITY_DATA.linkedinUrl,
    // Company Info
    companyName: getString(lead, 'company_name', 'companyName') || DEFAULT_IDENTITY_DATA.companyName,
    companyWebsite: getString(lead, 'company_website', 'companyWebsite') || DEFAULT_IDENTITY_DATA.companyWebsite,
    industry: getString(lead, 'industry') || DEFAULT_IDENTITY_DATA.industry,
    companySize: getString(lead, 'company_size', 'companySize') || DEFAULT_IDENTITY_DATA.companySize,
    companyLocation: getString(lead, 'company_location', 'companyLocation') || DEFAULT_IDENTITY_DATA.companyLocation,
    companyLinkedinUrl: getString(lead, 'company_linkedin_url', 'companyLinkedinUrl') || DEFAULT_IDENTITY_DATA.companyLinkedinUrl,
    // Status
    status: getString(lead, 'lead_status', 'status') || DEFAULT_IDENTITY_DATA.status,
  }
}

// ============ SECTION 2: CLASSIFICATION ============

/**
 * Map lead data to ClassificationSectionData
 */
export function mapToClassificationData(lead: Record<string, unknown>): ClassificationSectionData {
  return {
    // Lead Type
    leadType: getString(lead, 'lead_type', 'leadType') || DEFAULT_CLASSIFICATION_DATA.leadType,
    leadCategory: getString(lead, 'lead_category', 'leadCategory') || DEFAULT_CLASSIFICATION_DATA.leadCategory,
    // Opportunity Type
    opportunityType: getString(lead, 'opportunity_type', 'opportunityType') || DEFAULT_CLASSIFICATION_DATA.opportunityType,
    // Business Model
    businessModel: getString(lead, 'business_model', 'businessModel') || DEFAULT_CLASSIFICATION_DATA.businessModel,
    engagementType: getString(lead, 'engagement_type', 'engagementType') || DEFAULT_CLASSIFICATION_DATA.engagementType,
    // Relationship
    relationshipType: getString(lead, 'relationship_type', 'relationshipType') || DEFAULT_CLASSIFICATION_DATA.relationshipType,
    existingRelationship: getBoolean(lead, 'existing_relationship', 'existingRelationship'),
    previousEngagementNotes: getString(lead, 'previous_engagement_notes', 'previousEngagementNotes'),
    // Priority & Urgency
    priority: getString(lead, 'priority') || DEFAULT_CLASSIFICATION_DATA.priority,
    temperature: getString(lead, 'temperature', 'lead_temperature') || DEFAULT_CLASSIFICATION_DATA.temperature,
  }
}

// ============ SECTION 3: REQUIREMENTS ============

/**
 * Map lead data to RequirementsSectionData
 */
export function mapToRequirementsData(lead: Record<string, unknown>): RequirementsSectionData {
  return {
    // Contract Types
    contractTypes: parseArray<string>(lead.contract_types || lead.contractTypes) || DEFAULT_REQUIREMENTS_DATA.contractTypes,
    primaryContractType: getString(lead, 'primary_contract_type', 'primaryContractType') || DEFAULT_REQUIREMENTS_DATA.primaryContractType,
    // Rate Information
    billRateMin: getString(lead, 'bill_rate_min', 'billRateMin'),
    billRateMax: getString(lead, 'bill_rate_max', 'billRateMax'),
    billRateCurrency: getString(lead, 'bill_rate_currency', 'billRateCurrency') || DEFAULT_REQUIREMENTS_DATA.billRateCurrency,
    targetMarkupPercentage: getString(lead, 'target_markup_percentage', 'targetMarkupPercentage'),
    // Position Details
    positionsCount: getNumber(lead, 'positions_count', 'positionsCount') ?? DEFAULT_REQUIREMENTS_DATA.positionsCount,
    positionsUrgency: getString(lead, 'positions_urgency', 'positionsUrgency') || DEFAULT_REQUIREMENTS_DATA.positionsUrgency,
    estimatedDuration: getString(lead, 'estimated_duration', 'estimatedDuration') || DEFAULT_REQUIREMENTS_DATA.estimatedDuration,
    remotePolicy: getString(lead, 'remote_policy', 'remotePolicy') || DEFAULT_REQUIREMENTS_DATA.remotePolicy,
    // Skills & Requirements
    primarySkills: parseArray<string>(lead.primary_skills || lead.primarySkills),
    secondarySkills: parseArray<string>(lead.secondary_skills || lead.secondarySkills),
    requiredCertifications: parseArray<string>(lead.required_certifications || lead.requiredCertifications),
    experienceLevel: getString(lead, 'experience_level', 'experienceLevel') || DEFAULT_REQUIREMENTS_DATA.experienceLevel,
    yearsExperienceMin: getString(lead, 'years_experience_min', 'yearsExperienceMin'),
    yearsExperienceMax: getString(lead, 'years_experience_max', 'yearsExperienceMax'),
    // Security & Compliance
    securityClearanceRequired: getBoolean(lead, 'security_clearance_required', 'securityClearanceRequired'),
    securityClearanceLevel: getString(lead, 'security_clearance_level', 'securityClearanceLevel'),
    backgroundCheckRequired: getBoolean(lead, 'background_check_required', 'backgroundCheckRequired'),
    drugTestRequired: getBoolean(lead, 'drug_test_required', 'drugTestRequired'),
    // Notes
    technicalNotes: getString(lead, 'technical_notes', 'technicalNotes'),
    hiringManagerPreferences: getString(lead, 'hiring_manager_preferences', 'hiringManagerPreferences'),
  }
}

// ============ SECTION 4: QUALIFICATION ============

/**
 * Map lead data to QualificationSectionData
 */
export function mapToQualificationData(lead: Record<string, unknown>): QualificationSectionData {
  return {
    // BANT Scores
    bantBudget: getNumber(lead, 'bant_budget', 'bantBudget'),
    bantAuthority: getNumber(lead, 'bant_authority', 'bantAuthority'),
    bantNeed: getNumber(lead, 'bant_need', 'bantNeed'),
    bantTimeline: getNumber(lead, 'bant_timeline', 'bantTimeline'),
    // BANT Notes
    bantBudgetNotes: getString(lead, 'bant_budget_notes', 'bantBudgetNotes'),
    bantAuthorityNotes: getString(lead, 'bant_authority_notes', 'bantAuthorityNotes'),
    bantNeedNotes: getString(lead, 'bant_need_notes', 'bantNeedNotes'),
    bantTimelineNotes: getString(lead, 'bant_timeline_notes', 'bantTimelineNotes'),
    // Staffing-Specific Qualification
    budgetConfirmed: getBoolean(lead, 'budget_confirmed', 'budgetConfirmed'),
    budgetRange: getString(lead, 'budget_range', 'budgetRange'),
    decisionMakerIdentified: getBoolean(lead, 'decision_maker_identified', 'decisionMakerIdentified'),
    decisionMakerTitle: getString(lead, 'decision_maker_title', 'decisionMakerTitle'),
    decisionMakerName: getString(lead, 'decision_maker_name', 'decisionMakerName'),
    competitorInvolved: getBoolean(lead, 'competitor_involved', 'competitorInvolved'),
    competitorNames: getString(lead, 'competitor_names', 'competitorNames'),
    // Volume & Value
    estimatedAnnualValue: lead.lead_estimated_value
      ? String(lead.lead_estimated_value)
      : lead.estimated_annual_value
        ? String(lead.estimated_annual_value)
        : getString(lead, 'estimatedAnnualValue'),
    estimatedPlacements: getString(lead, 'estimated_placements', 'estimatedPlacements'),
    volumePotential: getString(lead, 'volume_potential', 'volumePotential') || DEFAULT_QUALIFICATION_DATA.volumePotential,
    // Qualification Result
    qualificationResult: getString(lead, 'qualification_result', 'qualificationResult') || DEFAULT_QUALIFICATION_DATA.qualificationResult,
    qualificationNotes: getString(lead, 'qualification_notes', 'qualificationNotes'),
    disqualificationReason: getString(lead, 'disqualification_reason', 'disqualificationReason'),
    // Probability & Forecast
    probability: lead.lead_probability
      ? String(lead.lead_probability)
      : getString(lead, 'probability'),
    expectedCloseDate: getString(lead, 'lead_estimated_close_date', 'expected_close_date', 'expectedCloseDate') || null,
    nextSteps: getString(lead, 'next_steps', 'nextSteps'),
    nextStepDate: getString(lead, 'next_step_date', 'nextStepDate') || null,
  }
}

// ============ SECTION 5: CLIENT PROFILE ============

/**
 * Map lead data to ClientProfileSectionData
 */
export function mapToClientProfileData(lead: Record<string, unknown>): ClientProfileSectionData {
  return {
    // VMS/MSP Information
    usesVms: getBoolean(lead, 'uses_vms', 'usesVms'),
    vmsPlatform: getString(lead, 'vms_platform', 'vmsPlatform'),
    vmsOther: getString(lead, 'vms_other', 'vmsOther'),
    vmsAccessStatus: getString(lead, 'vms_access_status', 'vmsAccessStatus') || DEFAULT_CLIENT_PROFILE_DATA.vmsAccessStatus,
    // MSP/Program Information
    hasMsp: getBoolean(lead, 'has_msp', 'hasMsp'),
    mspName: getString(lead, 'msp_name', 'mspName'),
    programType: getString(lead, 'program_type', 'programType') || DEFAULT_CLIENT_PROFILE_DATA.programType,
    // Contract & Legal
    msaStatus: getString(lead, 'msa_status', 'msaStatus') || DEFAULT_CLIENT_PROFILE_DATA.msaStatus,
    msaExpirationDate: getString(lead, 'msa_expiration_date', 'msaExpirationDate') || null,
    ndaRequired: getBoolean(lead, 'nda_required', 'ndaRequired'),
    ndaStatus: getString(lead, 'nda_status', 'ndaStatus') || DEFAULT_CLIENT_PROFILE_DATA.ndaStatus,
    // Payment Terms
    paymentTerms: getString(lead, 'payment_terms', 'paymentTerms') || DEFAULT_CLIENT_PROFILE_DATA.paymentTerms,
    poRequired: getBoolean(lead, 'po_required', 'poRequired'),
    invoiceFormat: getString(lead, 'invoice_format', 'invoiceFormat') || DEFAULT_CLIENT_PROFILE_DATA.invoiceFormat,
    billingCycle: getString(lead, 'billing_cycle', 'billingCycle') || DEFAULT_CLIENT_PROFILE_DATA.billingCycle,
    // Compliance Requirements
    insuranceRequired: getBoolean(lead, 'insurance_required', 'insuranceRequired'),
    insuranceTypes: parseArray<string>(lead.insurance_types || lead.insuranceTypes),
    minimumInsuranceCoverage: getString(lead, 'minimum_insurance_coverage', 'minimumInsuranceCoverage'),
    // Account Classification
    accountTier: getString(lead, 'account_tier', 'accountTier') || DEFAULT_CLIENT_PROFILE_DATA.accountTier,
    industryVertical: getString(lead, 'industry_vertical', 'industryVertical'),
    companyRevenue: getString(lead, 'company_revenue', 'companyRevenue'),
    employeeCount: getString(lead, 'employee_count', 'employeeCount'),
  }
}

// ============ SECTION 6: SOURCE ============

/**
 * Map lead data to SourceSectionData
 */
export function mapToSourceData(lead: Record<string, unknown>): SourceSectionData {
  return {
    // Primary Source
    source: getString(lead, 'lead_source', 'source') || DEFAULT_SOURCE_DATA.source,
    sourceDetails: getString(lead, 'source_details', 'sourceDetails'),
    // Campaign Association
    campaignId: getString(lead, 'campaign_id', 'campaignId'),
    campaignName: getString(lead, 'campaign_name', 'campaignName'),
    // Referral Information
    referralType: getString(lead, 'referral_type', 'referralType'),
    referredBy: getString(lead, 'referred_by', 'referredBy'),
    referralContactId: getString(lead, 'referral_contact_id', 'referralContactId'),
    referralRewardStatus: getString(lead, 'referral_reward_status', 'referralRewardStatus') || DEFAULT_SOURCE_DATA.referralRewardStatus,
    // Marketing Attribution
    utmSource: getString(lead, 'utm_source', 'utmSource'),
    utmMedium: getString(lead, 'utm_medium', 'utmMedium'),
    utmCampaign: getString(lead, 'utm_campaign', 'utmCampaign'),
    utmContent: getString(lead, 'utm_content', 'utmContent'),
    utmTerm: getString(lead, 'utm_term', 'utmTerm'),
    landingPage: getString(lead, 'landing_page', 'landingPage'),
    // Engagement
    firstContactDate: getString(lead, 'first_contact_date', 'firstContactDate') || null,
    firstContactMethod: getString(lead, 'first_contact_method', 'firstContactMethod'),
    totalTouchpoints: getNumber(lead, 'total_touchpoints', 'totalTouchpoints') ?? DEFAULT_SOURCE_DATA.totalTouchpoints,
    lastTouchpointDate: getString(lead, 'last_touchpoint_date', 'lastTouchpointDate') || null,
  }
}

// ============ SECTION 7: TEAM ============

/**
 * Map lead data to TeamSectionData
 */
export function mapToTeamData(lead: Record<string, unknown>): TeamSectionData {
  // Extract owner info from nested object or flat fields
  const owner = lead.owner as Record<string, unknown> | null
  const ownerId = owner?.id as string || getString(lead, 'owner_id', 'ownerId')
  const ownerName = owner?.full_name as string || owner?.fullName as string || getString(lead, 'owner_name', 'ownerName')

  return {
    // Primary Owner
    ownerId,
    ownerName,
    assignedAt: getString(lead, 'assigned_at', 'assignedAt') || null,
    // Secondary Assignments
    salesRepId: getString(lead, 'sales_rep_id', 'salesRepId'),
    salesRepName: getString(lead, 'sales_rep_name', 'salesRepName'),
    accountManagerId: getString(lead, 'account_manager_id', 'accountManagerId'),
    accountManagerName: getString(lead, 'account_manager_name', 'accountManagerName'),
    recruiterId: getString(lead, 'recruiter_id', 'recruiterId'),
    recruiterName: getString(lead, 'recruiter_name', 'recruiterName'),
    // Routing & Territory
    territory: getString(lead, 'territory'),
    region: getString(lead, 'region'),
    businessUnit: getString(lead, 'business_unit', 'businessUnit'),
    // Communication Preferences
    preferredContactMethod: getString(lead, 'preferred_contact_method', 'preferredContactMethod') || DEFAULT_TEAM_DATA.preferredContactMethod,
    bestTimeToContact: getString(lead, 'best_time_to_contact', 'bestTimeToContact') || DEFAULT_TEAM_DATA.bestTimeToContact,
    timezone: getString(lead, 'timezone'),
    doNotContact: getBoolean(lead, 'do_not_contact', 'doNotContact'),
    doNotContactReason: getString(lead, 'do_not_contact_reason', 'doNotContactReason'),
    // Internal Notes
    internalNotes: getString(lead, 'internal_notes', 'internalNotes'),
    strategyNotes: getString(lead, 'strategy_notes', 'strategyNotes'),
  }
}

// ============ COMBINED MAPPER ============

/**
 * Map complete lead data to all wizard sections
 */
export function mapToLeadWizardData(lead: Record<string, unknown>): LeadWizardData {
  return {
    identity: mapToIdentityData(lead),
    classification: mapToClassificationData(lead),
    requirements: mapToRequirementsData(lead),
    qualification: mapToQualificationData(lead),
    clientProfile: mapToClientProfileData(lead),
    source: mapToSourceData(lead),
    team: mapToTeamData(lead),
  }
}

// ============ API MAPPERS (camelCase -> snake_case) ============

/**
 * Format phone for API storage
 */
function formatPhoneForApi(phone: PhoneInputValue): string | null {
  if (!phone.number) return null
  const cleaned = phone.number.replace(/\D/g, '')
  if (!cleaned) return null
  // Format based on country code
  if (phone.countryCode === 'US') {
    return `+1${cleaned}`
  }
  return `+${cleaned}`
}

/**
 * Map IdentitySectionData to API format
 */
export function mapIdentityToApi(data: IdentitySectionData): Record<string, unknown> {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email || null,
    phone: formatPhoneForApi(data.phone),
    mobile: formatPhoneForApi(data.mobile),
    title: data.title || null,
    department: data.department || null,
    linkedin_url: data.linkedinUrl || null,
    company_name: data.companyName || null,
    company_website: data.companyWebsite || null,
    industry: data.industry || null,
    company_size: data.companySize || null,
    company_location: data.companyLocation || null,
    company_linkedin_url: data.companyLinkedinUrl || null,
    lead_status: data.status,
  }
}

/**
 * Map ClassificationSectionData to API format
 */
export function mapClassificationToApi(data: ClassificationSectionData): Record<string, unknown> {
  return {
    lead_type: data.leadType || null,
    lead_category: data.leadCategory || null,
    opportunity_type: data.opportunityType || null,
    business_model: data.businessModel || null,
    engagement_type: data.engagementType || null,
    relationship_type: data.relationshipType || null,
    existing_relationship: data.existingRelationship,
    previous_engagement_notes: data.previousEngagementNotes || null,
    priority: data.priority || null,
    temperature: data.temperature || null,
  }
}

/**
 * Map RequirementsSectionData to API format
 */
export function mapRequirementsToApi(data: RequirementsSectionData): Record<string, unknown> {
  return {
    contract_types: data.contractTypes.length > 0 ? data.contractTypes : null,
    primary_contract_type: data.primaryContractType || null,
    bill_rate_min: data.billRateMin ? parseFloat(data.billRateMin) : null,
    bill_rate_max: data.billRateMax ? parseFloat(data.billRateMax) : null,
    bill_rate_currency: data.billRateCurrency || null,
    target_markup_percentage: data.targetMarkupPercentage ? parseFloat(data.targetMarkupPercentage) : null,
    positions_count: data.positionsCount,
    positions_urgency: data.positionsUrgency || null,
    estimated_duration: data.estimatedDuration || null,
    remote_policy: data.remotePolicy || null,
    primary_skills: data.primarySkills.length > 0 ? data.primarySkills : null,
    secondary_skills: data.secondarySkills.length > 0 ? data.secondarySkills : null,
    required_certifications: data.requiredCertifications.length > 0 ? data.requiredCertifications : null,
    experience_level: data.experienceLevel || null,
    years_experience_min: data.yearsExperienceMin ? parseInt(data.yearsExperienceMin, 10) : null,
    years_experience_max: data.yearsExperienceMax ? parseInt(data.yearsExperienceMax, 10) : null,
    security_clearance_required: data.securityClearanceRequired,
    security_clearance_level: data.securityClearanceLevel || null,
    background_check_required: data.backgroundCheckRequired,
    drug_test_required: data.drugTestRequired,
    technical_notes: data.technicalNotes || null,
    hiring_manager_preferences: data.hiringManagerPreferences || null,
  }
}

/**
 * Map QualificationSectionData to API format
 */
export function mapQualificationToApi(data: QualificationSectionData): Record<string, unknown> {
  return {
    bant_budget: data.bantBudget,
    bant_authority: data.bantAuthority,
    bant_need: data.bantNeed,
    bant_timeline: data.bantTimeline,
    bant_budget_notes: data.bantBudgetNotes || null,
    bant_authority_notes: data.bantAuthorityNotes || null,
    bant_need_notes: data.bantNeedNotes || null,
    bant_timeline_notes: data.bantTimelineNotes || null,
    budget_confirmed: data.budgetConfirmed,
    budget_range: data.budgetRange || null,
    decision_maker_identified: data.decisionMakerIdentified,
    decision_maker_title: data.decisionMakerTitle || null,
    decision_maker_name: data.decisionMakerName || null,
    competitor_involved: data.competitorInvolved,
    competitor_names: data.competitorNames || null,
    lead_estimated_value: data.estimatedAnnualValue ? parseFloat(data.estimatedAnnualValue) : null,
    estimated_placements: data.estimatedPlacements ? parseInt(data.estimatedPlacements, 10) : null,
    volume_potential: data.volumePotential || null,
    qualification_result: data.qualificationResult || null,
    qualification_notes: data.qualificationNotes || null,
    disqualification_reason: data.disqualificationReason || null,
    lead_probability: data.probability ? parseInt(data.probability, 10) : null,
    lead_estimated_close_date: data.expectedCloseDate || null,
    next_steps: data.nextSteps || null,
    next_step_date: data.nextStepDate || null,
  }
}

/**
 * Map ClientProfileSectionData to API format
 */
export function mapClientProfileToApi(data: ClientProfileSectionData): Record<string, unknown> {
  return {
    uses_vms: data.usesVms,
    vms_platform: data.vmsPlatform || null,
    vms_other: data.vmsOther || null,
    vms_access_status: data.vmsAccessStatus || null,
    has_msp: data.hasMsp,
    msp_name: data.mspName || null,
    program_type: data.programType || null,
    msa_status: data.msaStatus || null,
    msa_expiration_date: data.msaExpirationDate || null,
    nda_required: data.ndaRequired,
    nda_status: data.ndaStatus || null,
    payment_terms: data.paymentTerms || null,
    po_required: data.poRequired,
    invoice_format: data.invoiceFormat || null,
    billing_cycle: data.billingCycle || null,
    insurance_required: data.insuranceRequired,
    insurance_types: data.insuranceTypes.length > 0 ? data.insuranceTypes : null,
    minimum_insurance_coverage: data.minimumInsuranceCoverage || null,
    account_tier: data.accountTier || null,
    industry_vertical: data.industryVertical || null,
    company_revenue: data.companyRevenue || null,
    employee_count: data.employeeCount || null,
  }
}

/**
 * Map SourceSectionData to API format
 */
export function mapSourceToApi(data: SourceSectionData): Record<string, unknown> {
  return {
    lead_source: data.source,
    source_details: data.sourceDetails || null,
    campaign_id: data.campaignId || null,
    campaign_name: data.campaignName || null,
    referral_type: data.referralType || null,
    referred_by: data.referredBy || null,
    referral_contact_id: data.referralContactId || null,
    referral_reward_status: data.referralRewardStatus || null,
    utm_source: data.utmSource || null,
    utm_medium: data.utmMedium || null,
    utm_campaign: data.utmCampaign || null,
    utm_content: data.utmContent || null,
    utm_term: data.utmTerm || null,
    landing_page: data.landingPage || null,
    first_contact_date: data.firstContactDate || null,
    first_contact_method: data.firstContactMethod || null,
    total_touchpoints: data.totalTouchpoints,
    last_touchpoint_date: data.lastTouchpointDate || null,
  }
}

/**
 * Map TeamSectionData to API format
 */
export function mapTeamToApi(data: TeamSectionData): Record<string, unknown> {
  return {
    owner_id: data.ownerId || null,
    sales_rep_id: data.salesRepId || null,
    account_manager_id: data.accountManagerId || null,
    recruiter_id: data.recruiterId || null,
    territory: data.territory || null,
    region: data.region || null,
    business_unit: data.businessUnit || null,
    preferred_contact_method: data.preferredContactMethod || null,
    best_time_to_contact: data.bestTimeToContact || null,
    timezone: data.timezone || null,
    do_not_contact: data.doNotContact,
    do_not_contact_reason: data.doNotContactReason || null,
    internal_notes: data.internalNotes || null,
    strategy_notes: data.strategyNotes || null,
  }
}

/**
 * Map complete LeadWizardData to API format
 */
export function mapLeadWizardDataToApi(data: LeadWizardData): Record<string, unknown> {
  return {
    ...mapIdentityToApi(data.identity),
    ...mapClassificationToApi(data.classification),
    ...mapRequirementsToApi(data.requirements),
    ...mapQualificationToApi(data.qualification),
    ...mapClientProfileToApi(data.clientProfile),
    ...mapSourceToApi(data.source),
    ...mapTeamToApi(data.team),
  }
}
