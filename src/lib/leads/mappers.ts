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

  // If it's a string, parse it
  if (typeof phone === 'string') {
    // Handle various formats:
    // "+1 6025553210" -> { countryCode: 'US', number: '6025553210' }
    // "US 6025553210" -> { countryCode: 'US', number: '6025553210' } (legacy bad format)
    // "6025553210" -> { countryCode: 'US', number: '6025553210' }
    let cleanedNumber = phone
    let countryCode: PhoneInputValue['countryCode'] = 'US'

    // Remove +1 prefix
    if (cleanedNumber.startsWith('+1 ') || cleanedNumber.startsWith('+1')) {
      cleanedNumber = cleanedNumber.replace(/^\+1\s?/, '')
    }
    // Remove "US " prefix (legacy bad format)
    else if (cleanedNumber.startsWith('US ')) {
      cleanedNumber = cleanedNumber.replace(/^US\s+/, '')
    }

    return {
      countryCode,
      number: cleanedNumber,
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
 * Also converts numbers to strings for numeric DB columns
 */
function getString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value !== '') return value
    // Convert numbers to strings (for numeric DB columns like bill_rate_min)
    if (typeof value === 'number') return String(value)
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
    firstName: getString(lead, 'first_name', 'firstName'),
    lastName: getString(lead, 'last_name', 'lastName'),
    email: getString(lead, 'email'),
    phone: parsePhone(lead.phone),
    mobile: parsePhone(lead.mobile),
    title: getString(lead, 'title'),
    department: getString(lead, 'department'),
    linkedinUrl: getString(lead, 'linkedin_url', 'linkedinUrl'),
    // Company Info - DB uses website_url not company_website
    companyName: getString(lead, 'company_name', 'companyName'),
    companyWebsite: getString(lead, 'website_url', 'company_website', 'companyWebsite'),
    industry: getString(lead, 'industry'),
    companySize: getString(lead, 'company_size', 'employee_count_range', 'companySize'),
    // Location fields
    companyCity: getString(lead, 'city', 'company_city', 'companyCity'),
    companyState: getString(lead, 'state', 'company_state', 'companyState'),
    companyCountry: getString(lead, 'country', 'company_country', 'companyCountry'),
    companyLinkedinUrl: getString(lead, 'company_linkedin_url', 'companyLinkedinUrl'),
    // Status
    status: getString(lead, 'lead_status', 'status'),
  }
}

// ============ SECTION 2: CLASSIFICATION ============

/**
 * Map lead data to ClassificationSectionData
 */
export function mapToClassificationData(lead: Record<string, unknown>): ClassificationSectionData {
  return {
    // Lead Type - DB uses lead_ prefix
    leadType: getString(lead, 'lead_type', 'leadType'),
    leadCategory: getString(lead, 'lead_category', 'leadCategory'),
    // Opportunity Type
    opportunityType: getString(lead, 'lead_opportunity_type', 'opportunity_type', 'opportunityType'),
    // Business Model
    businessModel: getString(lead, 'lead_business_model', 'business_model', 'businessModel'),
    engagementType: getString(lead, 'lead_engagement_type', 'engagement_type', 'engagementType'),
    // Relationship
    relationshipType: getString(lead, 'lead_relationship_type', 'relationship_type', 'relationshipType'),
    existingRelationship: getBoolean(lead, 'lead_existing_relationship', 'existing_relationship', 'existingRelationship'),
    previousEngagementNotes: getString(lead, 'lead_previous_engagement_notes', 'previous_engagement_notes', 'previousEngagementNotes'),
    // Priority & Urgency
    priority: getString(lead, 'lead_priority', 'priority'),
    temperature: getString(lead, 'lead_temperature', 'temperature'),
  }
}

// ============ SECTION 3: REQUIREMENTS ============

/**
 * Map lead data to RequirementsSectionData
 */
export function mapToRequirementsData(lead: Record<string, unknown>): RequirementsSectionData {
  return {
    // Contract Types - DB uses lead_ prefix
    contractTypes: parseArray<string>(lead.lead_contract_types || lead.contract_types || lead.contractTypes),
    primaryContractType: getString(lead, 'lead_primary_contract_type', 'primary_contract_type', 'primaryContractType'),
    // Rate Information
    billRateMin: getString(lead, 'lead_bill_rate_min', 'bill_rate_min', 'billRateMin'),
    billRateMax: getString(lead, 'lead_bill_rate_max', 'bill_rate_max', 'billRateMax'),
    billRateCurrency: getString(lead, 'lead_bill_rate_currency', 'bill_rate_currency', 'billRateCurrency'),
    targetMarkupPercentage: getString(lead, 'lead_target_markup', 'target_markup_percentage', 'targetMarkupPercentage'),
    // Position Details - DB uses lead_ prefix
    positionsCount: getNumber(lead, 'lead_positions_count', 'positions_count', 'positionsCount') ?? 1,
    positionsUrgency: getString(lead, 'lead_positions_urgency', 'positions_urgency', 'positionsUrgency'),
    estimatedDuration: getString(lead, 'lead_estimated_duration', 'estimated_duration', 'estimatedDuration'),
    remotePolicy: getString(lead, 'lead_remote_policy', 'remote_policy', 'remotePolicy'),
    // Skills & Requirements
    primarySkills: parseArray<string>(lead.lead_skills_needed || lead.primary_skills || lead.primarySkills),
    secondarySkills: parseArray<string>(lead.lead_secondary_skills || lead.secondary_skills || lead.secondarySkills),
    requiredCertifications: parseArray<string>(lead.lead_required_certifications || lead.required_certifications || lead.requiredCertifications),
    experienceLevel: getString(lead, 'lead_experience_level', 'experience_level', 'experienceLevel'),
    yearsExperienceMin: getString(lead, 'lead_years_experience_min', 'years_experience_min', 'yearsExperienceMin'),
    yearsExperienceMax: getString(lead, 'lead_years_experience_max', 'years_experience_max', 'yearsExperienceMax'),
    // Security & Compliance
    securityClearanceRequired: getBoolean(lead, 'lead_security_clearance_required', 'security_clearance_required', 'securityClearanceRequired'),
    securityClearanceLevel: getString(lead, 'lead_security_clearance_level', 'security_clearance_level', 'securityClearanceLevel'),
    backgroundCheckRequired: getBoolean(lead, 'lead_background_check_required', 'background_check_required', 'backgroundCheckRequired'),
    drugTestRequired: getBoolean(lead, 'lead_drug_test_required', 'drug_test_required', 'drugTestRequired'),
    // Notes
    technicalNotes: getString(lead, 'lead_technical_notes', 'technical_notes', 'technicalNotes'),
    hiringManagerPreferences: getString(lead, 'lead_hiring_manager_preferences', 'hiring_manager_preferences', 'hiringManagerPreferences'),
  }
}

// ============ SECTION 4: QUALIFICATION ============

/**
 * Map lead data to QualificationSectionData
 */
export function mapToQualificationData(lead: Record<string, unknown>): QualificationSectionData {
  // DB stores BANT as 0-25, UI expects 0-100 - scale up by 4
  const scaleFromDb = (val: number | null) => val != null ? val * 4 : null

  return {
    // BANT Scores - DB uses lead_ prefix and 0-25 scale
    bantBudget: scaleFromDb(getNumber(lead, 'lead_bant_budget', 'bant_budget', 'bantBudget')),
    bantAuthority: scaleFromDb(getNumber(lead, 'lead_bant_authority', 'bant_authority', 'bantAuthority')),
    bantNeed: scaleFromDb(getNumber(lead, 'lead_bant_need', 'bant_need', 'bantNeed')),
    bantTimeline: scaleFromDb(getNumber(lead, 'lead_bant_timeline', 'bant_timeline', 'bantTimeline')),
    // BANT Notes - DB uses lead_ prefix
    bantBudgetNotes: getString(lead, 'lead_bant_budget_notes', 'bant_budget_notes', 'bantBudgetNotes'),
    bantAuthorityNotes: getString(lead, 'lead_bant_authority_notes', 'bant_authority_notes', 'bantAuthorityNotes'),
    bantNeedNotes: getString(lead, 'lead_bant_need_notes', 'bant_need_notes', 'bantNeedNotes'),
    bantTimelineNotes: getString(lead, 'lead_bant_timeline_notes', 'bant_timeline_notes', 'bantTimelineNotes'),
    // Staffing-Specific Qualification
    budgetConfirmed: getBoolean(lead, 'lead_budget_confirmed', 'budget_confirmed', 'budgetConfirmed'),
    budgetRange: getString(lead, 'lead_budget_range', 'budget_range', 'budgetRange'),
    decisionMakerIdentified: getBoolean(lead, 'lead_decision_maker_identified', 'decision_maker_identified', 'decisionMakerIdentified'),
    decisionMakerTitle: getString(lead, 'lead_decision_maker_title', 'decision_maker_title', 'decisionMakerTitle'),
    decisionMakerName: getString(lead, 'lead_decision_maker_name', 'decision_maker_name', 'decisionMakerName'),
    competitorInvolved: getBoolean(lead, 'lead_competitor_involved', 'competitor_involved', 'competitorInvolved'),
    competitorNames: getString(lead, 'lead_competitor_names', 'competitor_names', 'competitorNames'),
    // Volume & Value - DB uses lead_ prefix
    estimatedAnnualValue: lead.lead_estimated_value
      ? String(lead.lead_estimated_value)
      : lead.estimated_annual_value
        ? String(lead.estimated_annual_value)
        : getString(lead, 'estimatedAnnualValue'),
    estimatedPlacements: getString(lead, 'lead_estimated_placements', 'estimated_placements', 'estimatedPlacements'),
    volumePotential: getString(lead, 'lead_volume_potential', 'volume_potential', 'volumePotential'),
    // Qualification Result - DB uses lead_ prefix
    // Map DB values to UI values: qualified_convert->qualified, qualified_nurture->nurture, not_qualified->disqualified
    qualificationResult: (() => {
      const val = getString(lead, 'lead_qualification_result', 'qualification_result', 'qualificationResult')
      if (val === 'qualified_convert') return 'qualified'
      if (val === 'qualified_nurture') return 'nurture'
      if (val === 'not_qualified') return 'disqualified'
      return val || 'pending'
    })(),
    qualificationNotes: getString(lead, 'lead_qualification_notes', 'qualification_notes', 'qualificationNotes'),
    disqualificationReason: getString(lead, 'lead_disqualification_reason', 'disqualification_reason', 'disqualificationReason'),
    // Probability & Forecast
    probability: lead.lead_probability
      ? String(lead.lead_probability)
      : getString(lead, 'probability'),
    expectedCloseDate: getString(lead, 'lead_estimated_close_date', 'expected_close_date', 'expectedCloseDate') || null,
    nextSteps: getString(lead, 'lead_next_steps', 'next_steps', 'nextSteps'),
    nextStepDate: getString(lead, 'lead_next_step_date', 'next_step_date', 'nextStepDate') || null,
  }
}

// ============ SECTION 5: CLIENT PROFILE ============

/**
 * Map lead data to ClientProfileSectionData
 */
export function mapToClientProfileData(lead: Record<string, unknown>): ClientProfileSectionData {
  return {
    // VMS/MSP Information - DB uses lead_ prefix
    usesVms: getBoolean(lead, 'lead_uses_vms', 'client_uses_vms', 'uses_vms', 'usesVms'),
    vmsPlatform: getString(lead, 'lead_vms_platform', 'client_vms_system', 'vms_platform', 'vmsPlatform'),
    vmsOther: getString(lead, 'lead_vms_other', 'vms_other', 'vmsOther'),
    vmsAccessStatus: getString(lead, 'lead_vms_access_status', 'vms_access_status', 'vmsAccessStatus'),
    // MSP/Program Information
    hasMsp: getBoolean(lead, 'lead_has_msp', 'client_has_msp', 'has_msp', 'hasMsp'),
    mspName: getString(lead, 'lead_msp_name', 'client_msp_name', 'msp_name', 'mspName'),
    programType: getString(lead, 'lead_program_type', 'program_type', 'programType'),
    // Contract & Legal
    msaStatus: getString(lead, 'lead_msa_status', 'msa_status', 'msaStatus'),
    msaExpirationDate: getString(lead, 'lead_msa_expiration_date', 'msa_expiration_date', 'msaExpirationDate') || null,
    ndaRequired: getBoolean(lead, 'lead_nda_required', 'nda_required', 'ndaRequired'),
    ndaStatus: getString(lead, 'lead_nda_status', 'nda_status', 'ndaStatus'),
    // Payment Terms
    paymentTerms: getString(lead, 'lead_payment_terms', 'client_payment_terms', 'payment_terms', 'paymentTerms'),
    poRequired: getBoolean(lead, 'lead_po_required', 'po_required', 'poRequired'),
    invoiceFormat: getString(lead, 'lead_invoice_format', 'invoice_format', 'invoiceFormat'),
    billingCycle: getString(lead, 'lead_billing_cycle', 'billing_cycle', 'billingCycle'),
    // Compliance Requirements
    insuranceRequired: getBoolean(lead, 'lead_insurance_required', 'insurance_required', 'insuranceRequired'),
    insuranceTypes: parseArray<string>(lead.lead_insurance_types || lead.insurance_types || lead.insuranceTypes),
    minimumInsuranceCoverage: getString(lead, 'lead_minimum_insurance_coverage', 'minimum_insurance_coverage', 'minimumInsuranceCoverage'),
    // Account Classification
    accountTier: getString(lead, 'lead_account_tier', 'client_tier', 'account_tier', 'accountTier'),
    industryVertical: getString(lead, 'lead_industry_vertical', 'industry_vertical', 'industryVertical'),
    companyRevenue: getString(lead, 'lead_company_revenue', 'company_revenue', 'companyRevenue'),
    employeeCount: lead.employee_count ? String(lead.employee_count) : getString(lead, 'employeeCount'),
  }
}

// ============ SECTION 6: SOURCE ============

/**
 * Map lead data to SourceSectionData
 */
export function mapToSourceData(lead: Record<string, unknown>): SourceSectionData {
  return {
    // Primary Source
    source: getString(lead, 'lead_source', 'source'),
    sourceDetails: getString(lead, 'lead_source_details', 'source_details', 'sourceDetails'),
    // Campaign Association
    campaignId: getString(lead, 'source_campaign_id', 'campaign_id', 'campaignId'),
    campaignName: getString(lead, 'lead_campaign_name', 'campaign_name', 'campaignName'),
    // Referral Information
    referralType: getString(lead, 'lead_referral_type', 'referral_type', 'referralType'),
    referredBy: getString(lead, 'lead_referred_by', 'referred_by', 'referredBy'),
    referralContactId: getString(lead, 'lead_referral_contact_id', 'referral_contact_id', 'referralContactId'),
    referralRewardStatus: getString(lead, 'referral_reward_status', 'referralRewardStatus'),
    // Marketing Attribution - DB uses lead_ prefix
    utmSource: getString(lead, 'lead_utm_source', 'utm_source', 'utmSource'),
    utmMedium: getString(lead, 'lead_utm_medium', 'utm_medium', 'utmMedium'),
    utmCampaign: getString(lead, 'lead_utm_campaign', 'utm_campaign', 'utmCampaign'),
    utmContent: getString(lead, 'lead_utm_content', 'utm_content', 'utmContent'),
    utmTerm: getString(lead, 'lead_utm_term', 'utm_term', 'utmTerm'),
    landingPage: getString(lead, 'lead_landing_page', 'landing_page', 'landingPage'),
    // Engagement
    firstContactDate: getString(lead, 'first_contact_date', 'firstContactDate') || null,
    firstContactMethod: getString(lead, 'lead_first_contact_method', 'first_contact_method', 'firstContactMethod'),
    totalTouchpoints: getNumber(lead, 'total_touchpoints', 'totalTouchpoints') ?? 0,
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
    // Secondary Assignments - DB uses lead_ prefix
    salesRepId: getString(lead, 'lead_sales_rep_id', 'sales_rep_id', 'salesRepId'),
    salesRepName: getString(lead, 'sales_rep_name', 'salesRepName'),
    accountManagerId: getString(lead, 'lead_account_manager_id', 'account_manager_id', 'accountManagerId'),
    accountManagerName: getString(lead, 'account_manager_name', 'accountManagerName'),
    recruiterId: getString(lead, 'lead_recruiter_id', 'recruiter_id', 'recruiterId'),
    recruiterName: getString(lead, 'recruiter_name', 'recruiterName'),
    // Routing & Territory - DB uses lead_ prefix
    territory: getString(lead, 'lead_territory', 'territory'),
    region: getString(lead, 'lead_region', 'region'),
    businessUnit: getString(lead, 'lead_business_unit', 'business_unit', 'businessUnit'),
    // Communication Preferences
    preferredContactMethod: getString(lead, 'preferred_contact_method', 'preferredContactMethod'),
    bestTimeToContact: getString(lead, 'best_time_to_contact', 'bestTimeToContact'),
    timezone: getString(lead, 'timezone'),
    doNotContact: getBoolean(lead, 'do_not_call', 'do_not_contact', 'doNotContact'),
    doNotContactReason: getString(lead, 'lead_do_not_contact_reason', 'do_not_contact_reason', 'doNotContactReason'),
    // Internal Notes
    internalNotes: getString(lead, 'internal_notes', 'internalNotes'),
    strategyNotes: getString(lead, 'lead_strategy_notes', 'strategy_notes', 'strategyNotes'),
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
    // Location fields
    city: data.companyCity || null,
    state: data.companyState || null,
    country: data.companyCountry || null,
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
