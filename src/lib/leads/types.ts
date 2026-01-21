/**
 * Lead Types - Enterprise-grade staffing lead data types
 *
 * Following Account architecture pattern with 7 main sections:
 * 1. Identity - Contact & company info
 * 2. Classification - Lead type, opportunity type, business model
 * 3. Requirements - Contract types, rates, skills, positions
 * 4. Qualification - BANT + staffing-specific criteria
 * 5. Client Profile - VMS/MSP, payment terms, compliance
 * 6. Source - Attribution & campaign tracking
 * 7. Team - Owner assignment
 */

import type { PhoneInputValue } from '@/components/ui/phone-input'

// ============ MODE TYPES ============

export type SectionMode = 'create' | 'view' | 'edit'

// ============ BASE SECTION PROPS ============

export interface UnifiedSectionProps<TData = Record<string, unknown>> {
  mode: SectionMode
  data: TData
  onChange?: (field: string, value: unknown) => void
  onBatchChange?: (changes: Partial<TData>) => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  onEdit?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

// ============ SECTION 1: IDENTITY ============

/**
 * Identity section - Contact and company information
 */
export interface IdentitySectionData {
  // Contact Info
  firstName: string
  lastName: string
  email: string
  phone: PhoneInputValue
  mobile: PhoneInputValue
  title: string
  department: string
  linkedinUrl: string
  // Company Info
  companyName: string
  companyWebsite: string
  industry: string
  companySize: string
  companyLocation: string
  companyLinkedinUrl: string
  // Lead Status
  status: string
}

// ============ SECTION 2: CLASSIFICATION ============

/**
 * Classification section - Lead type and opportunity classification
 */
export interface ClassificationSectionData {
  // Lead Type
  leadType: string          // 'client' | 'bench_marketing' | 'vendor_partnership' | 'subcontracting' | 'direct_hire' | 'rpo_sow'
  leadCategory: string      // 'new_business' | 'expansion' | 'reactivation' | 'referral'
  // Opportunity Type
  opportunityType: string   // 'contract_staffing' | 'contract_to_hire' | 'direct_hire' | 'sow_project' | 'msp_enrollment' | 'vendor_partnership'
  // Business Model
  businessModel: string     // 'staff_augmentation' | 'managed_services' | 'rpo' | 'payrolling' | 'direct_sourcing'
  engagementType: string    // 'single_role' | 'multiple_roles' | 'ongoing_relationship' | 'project_based' | 'msa_blanket'
  // Relationship
  relationshipType: string  // 'direct_client' | 'prime_vendor' | 'subcontractor' | 'msp_supplier' | 'implementation_partner'
  existingRelationship: boolean
  previousEngagementNotes: string
  // Priority & Urgency
  priority: string          // 'low' | 'medium' | 'high' | 'critical'
  temperature: string       // 'cold' | 'warm' | 'hot'
}

// ============ SECTION 3: REQUIREMENTS ============

/**
 * Requirements section - Staffing-specific requirements
 */
export interface RequirementsSectionData {
  // Contract Types Accepted
  contractTypes: string[]   // ['w2', 'c2c', '1099', 'corp_to_corp']
  primaryContractType: string
  // Rate Information
  billRateMin: string
  billRateMax: string
  billRateCurrency: string
  targetMarkupPercentage: string
  // Position Details
  positionsCount: number
  positionsUrgency: string  // 'immediate' | 'within_30_days' | 'within_60_days' | 'within_90_days' | 'flexible'
  estimatedDuration: string // '3_months' | '6_months' | '12_months' | '18_months' | 'indefinite'
  remotePolicy: string      // 'onsite' | 'hybrid' | 'remote' | 'flexible'
  // Skills & Requirements
  primarySkills: string[]
  secondarySkills: string[]
  requiredCertifications: string[]
  experienceLevel: string   // 'entry' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive'
  yearsExperienceMin: string
  yearsExperienceMax: string
  // Security & Compliance
  securityClearanceRequired: boolean
  securityClearanceLevel: string // 'public_trust' | 'secret' | 'top_secret' | 'ts_sci'
  backgroundCheckRequired: boolean
  drugTestRequired: boolean
  // Notes
  technicalNotes: string
  hiringManagerPreferences: string
}

// ============ SECTION 4: QUALIFICATION ============

/**
 * Qualification section - BANT scoring + staffing criteria
 */
export interface QualificationSectionData {
  // BANT Scores (0-25 each, total 100)
  bantBudget: number | null
  bantAuthority: number | null
  bantNeed: number | null
  bantTimeline: number | null
  // BANT Notes
  bantBudgetNotes: string
  bantAuthorityNotes: string
  bantNeedNotes: string
  bantTimelineNotes: string
  // Staffing-Specific Qualification
  budgetConfirmed: boolean
  budgetRange: string       // 'under_50k' | '50k_100k' | '100k_250k' | '250k_500k' | '500k_1m' | 'over_1m'
  decisionMakerIdentified: boolean
  decisionMakerTitle: string
  decisionMakerName: string
  competitorInvolved: boolean
  competitorNames: string
  // Volume & Value
  estimatedAnnualValue: string
  estimatedPlacements: string
  volumePotential: string   // 'single_role' | 'small_volume' | 'medium_volume' | 'high_volume' | 'enterprise'
  // Qualification Result
  qualificationResult: string  // 'pending' | 'qualified' | 'nurture' | 'disqualified'
  qualificationNotes: string
  disqualificationReason: string
  // Probability & Forecast
  probability: string
  expectedCloseDate: string | null
  nextSteps: string
  nextStepDate: string | null
}

// ============ SECTION 5: CLIENT PROFILE ============

/**
 * Client Profile section - VMS/MSP, payment terms, compliance
 */
export interface ClientProfileSectionData {
  // VMS/MSP Information
  usesVms: boolean
  vmsPlatform: string       // 'fieldglass' | 'beeline' | 'iqnavigator' | 'pontoon' | 'prounlimited' | 'other'
  vmsOther: string
  vmsAccessStatus: string   // 'not_started' | 'in_progress' | 'active' | 'pending_renewal'
  // MSP/Program Information
  hasMsp: boolean
  mspName: string
  programType: string       // 'direct' | 'tier1' | 'tier2' | 'preferred_vendor'
  // Contract & Legal
  msaStatus: string         // 'none' | 'draft' | 'in_negotiation' | 'pending_signature' | 'active' | 'expired'
  msaExpirationDate: string | null
  ndaRequired: boolean
  ndaStatus: string         // 'none' | 'pending' | 'signed'
  // Payment Terms
  paymentTerms: string      // 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90'
  poRequired: boolean
  invoiceFormat: string     // 'standard' | 'consolidated' | 'per_placement' | 'custom'
  billingCycle: string      // 'weekly' | 'biweekly' | 'semi_monthly' | 'monthly'
  // Compliance Requirements
  insuranceRequired: boolean
  insuranceTypes: string[]  // ['general_liability', 'professional_liability', 'workers_comp', 'cyber']
  minimumInsuranceCoverage: string
  // Account Classification
  accountTier: string       // 'standard' | 'preferred' | 'strategic' | 'enterprise'
  industryVertical: string
  companyRevenue: string
  employeeCount: string
}

// ============ SECTION 6: SOURCE ============

/**
 * Source section - Lead attribution and marketing tracking
 */
export interface SourceSectionData {
  // Primary Source
  source: string            // 'linkedin' | 'referral' | 'cold_outreach' | 'inbound' | 'event' | 'website' | 'campaign' | 'job_board' | 'partner' | 'other'
  sourceDetails: string
  // Campaign Association
  campaignId: string
  campaignName: string
  // Referral Information
  referralType: string      // 'employee' | 'client' | 'candidate' | 'partner' | 'other'
  referredBy: string
  referralContactId: string
  referralRewardStatus: string // 'pending' | 'qualified' | 'paid' | 'not_applicable'
  // Marketing Attribution
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  landingPage: string
  // Engagement
  firstContactDate: string | null
  firstContactMethod: string // 'email' | 'phone' | 'linkedin' | 'in_person' | 'website'
  totalTouchpoints: number
  lastTouchpointDate: string | null
}

// ============ SECTION 7: TEAM ============

/**
 * Team section - Ownership and assignments
 */
export interface TeamSectionData {
  // Primary Owner
  ownerId: string
  ownerName: string
  assignedAt: string | null
  // Secondary Assignments
  salesRepId: string
  salesRepName: string
  accountManagerId: string
  accountManagerName: string
  recruiterId: string
  recruiterName: string
  // Routing & Territory
  territory: string
  region: string
  businessUnit: string
  // Communication Preferences
  preferredContactMethod: string  // 'email' | 'phone' | 'linkedin' | 'text'
  bestTimeToContact: string       // 'morning' | 'afternoon' | 'evening' | 'any'
  timezone: string
  doNotContact: boolean
  doNotContactReason: string
  // Internal Notes
  internalNotes: string
  strategyNotes: string
}

// ============ COMBINED LEAD DATA ============

export interface LeadWizardData {
  identity: IdentitySectionData
  classification: ClassificationSectionData
  requirements: RequirementsSectionData
  qualification: QualificationSectionData
  clientProfile: ClientProfileSectionData
  source: SourceSectionData
  team: TeamSectionData
}

// ============ DEFAULT VALUES ============

export const DEFAULT_PHONE: PhoneInputValue = {
  countryCode: 'US',
  number: '',
}

export const DEFAULT_IDENTITY_DATA: IdentitySectionData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: { ...DEFAULT_PHONE },
  mobile: { ...DEFAULT_PHONE },
  title: '',
  department: '',
  linkedinUrl: '',
  companyName: '',
  companyWebsite: '',
  industry: '',
  companySize: '',
  companyLocation: '',
  companyLinkedinUrl: '',
  status: 'new',
}

export const DEFAULT_CLASSIFICATION_DATA: ClassificationSectionData = {
  leadType: 'client',
  leadCategory: 'new_business',
  opportunityType: 'contract_staffing',
  businessModel: 'staff_augmentation',
  engagementType: 'single_role',
  relationshipType: 'direct_client',
  existingRelationship: false,
  previousEngagementNotes: '',
  priority: 'medium',
  temperature: 'warm',
}

export const DEFAULT_REQUIREMENTS_DATA: RequirementsSectionData = {
  contractTypes: ['w2'],
  primaryContractType: 'w2',
  billRateMin: '',
  billRateMax: '',
  billRateCurrency: 'USD',
  targetMarkupPercentage: '',
  positionsCount: 1,
  positionsUrgency: 'within_30_days',
  estimatedDuration: '6_months',
  remotePolicy: 'hybrid',
  primarySkills: [],
  secondarySkills: [],
  requiredCertifications: [],
  experienceLevel: 'mid',
  yearsExperienceMin: '',
  yearsExperienceMax: '',
  securityClearanceRequired: false,
  securityClearanceLevel: '',
  backgroundCheckRequired: false,
  drugTestRequired: false,
  technicalNotes: '',
  hiringManagerPreferences: '',
}

export const DEFAULT_QUALIFICATION_DATA: QualificationSectionData = {
  bantBudget: null,
  bantAuthority: null,
  bantNeed: null,
  bantTimeline: null,
  bantBudgetNotes: '',
  bantAuthorityNotes: '',
  bantNeedNotes: '',
  bantTimelineNotes: '',
  budgetConfirmed: false,
  budgetRange: '',
  decisionMakerIdentified: false,
  decisionMakerTitle: '',
  decisionMakerName: '',
  competitorInvolved: false,
  competitorNames: '',
  estimatedAnnualValue: '',
  estimatedPlacements: '',
  volumePotential: 'single_role',
  qualificationResult: 'pending',
  qualificationNotes: '',
  disqualificationReason: '',
  probability: '',
  expectedCloseDate: null,
  nextSteps: '',
  nextStepDate: null,
}

export const DEFAULT_CLIENT_PROFILE_DATA: ClientProfileSectionData = {
  usesVms: false,
  vmsPlatform: '',
  vmsOther: '',
  vmsAccessStatus: 'not_started',
  hasMsp: false,
  mspName: '',
  programType: 'direct',
  msaStatus: 'none',
  msaExpirationDate: null,
  ndaRequired: false,
  ndaStatus: 'none',
  paymentTerms: 'net_30',
  poRequired: false,
  invoiceFormat: 'standard',
  billingCycle: 'biweekly',
  insuranceRequired: false,
  insuranceTypes: [],
  minimumInsuranceCoverage: '',
  accountTier: 'standard',
  industryVertical: '',
  companyRevenue: '',
  employeeCount: '',
}

export const DEFAULT_SOURCE_DATA: SourceSectionData = {
  source: 'website',
  sourceDetails: '',
  campaignId: '',
  campaignName: '',
  referralType: '',
  referredBy: '',
  referralContactId: '',
  referralRewardStatus: 'not_applicable',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  utmTerm: '',
  landingPage: '',
  firstContactDate: null,
  firstContactMethod: '',
  totalTouchpoints: 0,
  lastTouchpointDate: null,
}

export const DEFAULT_TEAM_DATA: TeamSectionData = {
  ownerId: '',
  ownerName: '',
  assignedAt: null,
  salesRepId: '',
  salesRepName: '',
  accountManagerId: '',
  accountManagerName: '',
  recruiterId: '',
  recruiterName: '',
  territory: '',
  region: '',
  businessUnit: '',
  preferredContactMethod: 'email',
  bestTimeToContact: 'any',
  timezone: '',
  doNotContact: false,
  doNotContactReason: '',
  internalNotes: '',
  strategyNotes: '',
}

// ============ UTILITY FUNCTIONS ============

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Calculate BANT total score from individual scores
 */
export function calculateBANTScore(data: QualificationSectionData): number {
  const budget = data.bantBudget ?? 0
  const authority = data.bantAuthority ?? 0
  const need = data.bantNeed ?? 0
  const timeline = data.bantTimeline ?? 0
  return budget + authority + need + timeline
}

/**
 * Get lead temperature from BANT score
 */
export function getLeadTemperature(bantScore: number): 'cold' | 'warm' | 'hot' {
  if (bantScore >= 70) return 'hot'
  if (bantScore >= 40) return 'warm'
  return 'cold'
}
