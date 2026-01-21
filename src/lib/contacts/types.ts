/**
 * Contact Types - Unified data types and field definitions
 *
 * Single source of truth for contact data shapes used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 *
 * Supports both Person and Company contact categories
 */

import type { LucideIcon } from 'lucide-react'
import type { PhoneInputValue } from '@/components/ui/phone-input'

// ============ MODE TYPES ============

export type SectionMode = 'create' | 'view' | 'edit'

export type ContactCategory = 'person' | 'company'

// ============ BASE SECTION PROPS ============

export interface UnifiedSectionProps<TData = Record<string, unknown>> {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: TData
  /** Handler for individual field changes (field name, new value) */
  onChange?: (field: string, value: unknown) => void
  /** Handler for batch field changes */
  onBatchChange?: (changes: Partial<TData>) => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
  /** Rendering variant */
  variant?: 'full' | 'compact'
}

// ============ SUB-ENTITY TYPES ============

export interface ContactAddress {
  id: string
  type: string  // 'home' | 'work' | 'mailing' | 'other'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary: boolean
}

export interface ContactSkill {
  name: string
  isPrimary?: boolean
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  isCertified?: boolean
  lastUsed?: string
}

export interface ContactExperience {
  id: string
  company: string
  title: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  description?: string
  location?: string
}

export interface ContactEducation {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  graduationYear?: number
  gpa?: string
}

// ============ SECTION DATA TYPES ============

/**
 * Basic Info Section - Core identity and contact details
 * Used for both Person and Company contacts
 */
export interface BasicInfoSectionData {
  // Contact Type
  category: ContactCategory
  // Core Identity (Person)
  firstName: string
  lastName: string
  middleName: string
  preferredName: string
  suffix: string
  pronouns: string
  // Core Identity (Company)
  companyName: string
  // Contact Methods
  email: string
  emailSecondary: string
  phone: PhoneInputValue
  mobile: PhoneInputValue
  // Profile
  avatarUrl: string
  photoUrl: string
  linkedinUrl: string
  // Classification
  types: string[]  // ['candidate', 'lead', 'prospect', 'client_contact', 'vendor_contact']
  subtype: string
  status: string
  // Owner
  ownerId: string
}

/**
 * Employment Section - Current job and company (Person only)
 */
export interface EmploymentSectionData {
  currentTitle: string
  currentDepartment: string
  currentCompanyId: string
  currentCompanyName: string  // Display name
  title: string  // Legacy field
  department: string
  companyId: string
}

/**
 * Communication Section - Contact preferences and restrictions
 */
export interface CommunicationSectionData {
  preferredContactMethod: string  // 'email' | 'phone' | 'text' | 'linkedin'
  bestTimeToContact: string
  timezone: string
  language: string
  // Communication opt-outs
  doNotCall: boolean
  doNotEmail: boolean
  doNotText: boolean
  doNotCallBefore: string
  doNotCallAfter: string
  // Marketing preferences
  marketingEmailsOptIn: boolean
  newsletterOptIn: boolean
  productUpdatesOptIn: boolean
  // Meetings
  preferredMeetingPlatform: string
  meetingDuration: number
  communicationFrequency: string
}

/**
 * Social Section - Social profiles and web presence
 */
export interface SocialSectionData {
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  portfolioUrl: string
  personalWebsite: string
}

/**
 * Skills Section - Professional skills and expertise (Candidate type)
 */
export interface SkillsSectionData {
  skills: ContactSkill[]
  candidateProfessionalHeadline: string
  candidateProfessionalSummary: string
  candidateCareerObjectives: string
}

/**
 * Candidate Section - Candidate-specific information
 */
export interface CandidateSectionData {
  candidateStatus: string
  candidateResumeUrl: string
  candidateSkills: string[]
  candidateExperienceYears: number | null
  candidateCurrentVisa: string
  candidateVisaExpiry: string | null
  candidateHourlyRate: string
  candidateMinimumHourlyRate: string
  candidateDesiredSalaryAnnual: string
  candidateMinimumAnnualSalary: string
  candidateDesiredSalaryCurrency: string
  candidateAvailability: string
  candidateWillingToRelocate: boolean
  candidatePreferredLocations: string[]
  candidateCurrentEmploymentStatus: string
  candidateNoticePeriodDays: number | null
  candidateEarliestStartDate: string | null
  candidatePreferredEmploymentType: string[]
  candidateBenefitsRequired: string[]
  candidateCompensationNotes: string
  candidateRecruiterRating: number | null
  candidateRecruiterRatingNotes: string
  candidateIsOnHotlist: boolean
  candidateHotlistNotes: string
}

/**
 * Lead Section - Lead-specific qualification and scoring
 */
export interface LeadSectionData {
  leadStatus: string
  leadScore: number | null
  leadSource: string
  leadEstimatedValue: string
  // BANT Qualification
  leadBantBudget: number
  leadBantAuthority: number
  leadBantNeed: number
  leadBantTimeline: number
  leadBantBudgetNotes: string
  leadBantAuthorityNotes: string
  leadBantNeedNotes: string
  leadBantTimelineNotes: string
  // Lead Details
  leadBudgetStatus: string
  leadEstimatedMonthlySpend: string
  leadAuthorityLevel: string
  leadBusinessNeed: string
  leadUrgency: string
  leadTargetStartDate: string | null
  leadPositionsCount: number
  leadSkillsNeeded: string[]
  leadContractTypes: string[]
  // Qualification
  leadQualificationResult: string
  leadQualificationNotes: string
  leadInterestLevel: string
  leadHiringNeeds: string
  leadPainPoints: string
  leadNextAction: string
  leadNextActionDate: string | null
}

/**
 * Addresses Section - Multiple addresses
 */
export interface AddressesSectionData {
  addresses: ContactAddress[]
}

/**
 * Notes Section - Internal notes and relationship notes
 */
export interface NotesSectionData {
  notes: string
  internalNotes: string
  relationshipNotes: string
}

/**
 * Team Section - Ownership and assignments
 */
export interface TeamSectionData {
  ownerId: string
  ownerName?: string
}

// ============ COMPANY-SPECIFIC SECTION DATA ============

/**
 * Company Profile Section - Company identity (Company category only)
 */
export interface CompanyProfileSectionData {
  companyName: string
  legalName: string
  dba: string
  taxId: string
  email: string
  phone: PhoneInputValue
  website: string
  linkedinUrl: string
  description: string
  // Corporate Profile
  industry: string
  industrySecondary: string
  foundedYear: string
  employeeCount: number | null
  employeeCountRange: string
  annualRevenue: string
  annualRevenueRange: string
  // Classification
  companyType: string
  tier: string
  segment: string
}

// ============ FIELD DEFINITION TYPES ============

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'select'
  | 'multiSelect'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'user'
  | 'skills'
  | 'rating'

export type ViewRenderer =
  | 'text'
  | 'badge'
  | 'link'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'array'
  | 'phone'
  | 'user'
  | 'rating'
  | 'skills'

export interface FieldOption {
  value: string
  label: string
  icon?: string
  description?: string
  color?: string
}

export interface FieldDefinition {
  /** Field key (camelCase) - used in form data */
  name: string
  /** Database column name (snake_case) - auto-derived if not set */
  dbName?: string
  /** Display label */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** Help text shown below field */
  helpText?: string
  /** Icon for field */
  icon?: LucideIcon
  /** Field input type */
  type: FieldType
  /** Options for select/multiSelect fields */
  options?: readonly FieldOption[] | FieldOption[]
  /** Required in all modes */
  required?: boolean
  /** How to render in view mode */
  viewRenderer?: ViewRenderer
  /** Grid column span (1 or 2) */
  colSpan?: 1 | 2
  /** Group name for organization */
  group?: string
  /** Conditional visibility function */
  showWhen?: (data: Record<string, unknown>) => boolean
  /** Hide in specific modes */
  hideIn?: SectionMode[]
  /** Only show for specific contact categories */
  categoryOnly?: ContactCategory
  /** Only show for specific contact types */
  typeOnly?: string[]  // e.g., ['candidate', 'lead']
}

export interface FieldGroupDefinition {
  /** Unique group identifier */
  id: string
  /** Group title */
  title: string
  /** Group subtitle */
  subtitle?: string
  /** Icon for group header */
  icon?: LucideIcon
  /** Fields in this group */
  fields: FieldDefinition[]
  /** Conditional visibility function */
  showWhen?: (data: Record<string, unknown>) => boolean
  /** Only show for specific contact categories */
  categoryOnly?: ContactCategory
  /** Only show for specific contact types */
  typeOnly?: string[]
}

// ============ DATA MAPPING HELPERS ============

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// ============ DEFAULT VALUES ============

export const DEFAULT_PHONE: PhoneInputValue = {
  countryCode: 'US',
  number: '',
}

export const DEFAULT_BASIC_INFO_DATA: BasicInfoSectionData = {
  category: 'person',
  firstName: '',
  lastName: '',
  middleName: '',
  preferredName: '',
  suffix: '',
  pronouns: '',
  companyName: '',
  email: '',
  emailSecondary: '',
  phone: { ...DEFAULT_PHONE },
  mobile: { ...DEFAULT_PHONE },
  avatarUrl: '',
  photoUrl: '',
  linkedinUrl: '',
  types: [],
  subtype: 'general',
  status: 'active',
  ownerId: '',
}

export const DEFAULT_EMPLOYMENT_DATA: EmploymentSectionData = {
  currentTitle: '',
  currentDepartment: '',
  currentCompanyId: '',
  currentCompanyName: '',
  title: '',
  department: '',
  companyId: '',
}

export const DEFAULT_COMMUNICATION_DATA: CommunicationSectionData = {
  preferredContactMethod: 'email',
  bestTimeToContact: '',
  timezone: 'America/New_York',
  language: 'en',
  doNotCall: false,
  doNotEmail: false,
  doNotText: false,
  doNotCallBefore: '',
  doNotCallAfter: '',
  marketingEmailsOptIn: true,
  newsletterOptIn: true,
  productUpdatesOptIn: true,
  preferredMeetingPlatform: '',
  meetingDuration: 30,
  communicationFrequency: '',
}

export const DEFAULT_SOCIAL_DATA: SocialSectionData = {
  linkedinUrl: '',
  twitterUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  personalWebsite: '',
}

export const DEFAULT_SKILLS_DATA: SkillsSectionData = {
  skills: [],
  candidateProfessionalHeadline: '',
  candidateProfessionalSummary: '',
  candidateCareerObjectives: '',
}

export const DEFAULT_CANDIDATE_DATA: CandidateSectionData = {
  candidateStatus: 'available',
  candidateResumeUrl: '',
  candidateSkills: [],
  candidateExperienceYears: null,
  candidateCurrentVisa: '',
  candidateVisaExpiry: null,
  candidateHourlyRate: '',
  candidateMinimumHourlyRate: '',
  candidateDesiredSalaryAnnual: '',
  candidateMinimumAnnualSalary: '',
  candidateDesiredSalaryCurrency: 'USD',
  candidateAvailability: '',
  candidateWillingToRelocate: false,
  candidatePreferredLocations: [],
  candidateCurrentEmploymentStatus: '',
  candidateNoticePeriodDays: null,
  candidateEarliestStartDate: null,
  candidatePreferredEmploymentType: [],
  candidateBenefitsRequired: [],
  candidateCompensationNotes: '',
  candidateRecruiterRating: null,
  candidateRecruiterRatingNotes: '',
  candidateIsOnHotlist: false,
  candidateHotlistNotes: '',
}

export const DEFAULT_LEAD_DATA: LeadSectionData = {
  leadStatus: 'new',
  leadScore: null,
  leadSource: '',
  leadEstimatedValue: '',
  leadBantBudget: 0,
  leadBantAuthority: 0,
  leadBantNeed: 0,
  leadBantTimeline: 0,
  leadBantBudgetNotes: '',
  leadBantAuthorityNotes: '',
  leadBantNeedNotes: '',
  leadBantTimelineNotes: '',
  leadBudgetStatus: '',
  leadEstimatedMonthlySpend: '',
  leadAuthorityLevel: '',
  leadBusinessNeed: '',
  leadUrgency: '',
  leadTargetStartDate: null,
  leadPositionsCount: 1,
  leadSkillsNeeded: [],
  leadContractTypes: [],
  leadQualificationResult: '',
  leadQualificationNotes: '',
  leadInterestLevel: '',
  leadHiringNeeds: '',
  leadPainPoints: '',
  leadNextAction: '',
  leadNextActionDate: null,
}

export const DEFAULT_ADDRESSES_DATA: AddressesSectionData = {
  addresses: [],
}

export const DEFAULT_NOTES_DATA: NotesSectionData = {
  notes: '',
  internalNotes: '',
  relationshipNotes: '',
}

export const DEFAULT_TEAM_DATA: TeamSectionData = {
  ownerId: '',
}

export const DEFAULT_COMPANY_PROFILE_DATA: CompanyProfileSectionData = {
  companyName: '',
  legalName: '',
  dba: '',
  taxId: '',
  email: '',
  phone: { ...DEFAULT_PHONE },
  website: '',
  linkedinUrl: '',
  description: '',
  industry: '',
  industrySecondary: '',
  foundedYear: '',
  employeeCount: null,
  employeeCountRange: '',
  annualRevenue: '',
  annualRevenueRange: '',
  companyType: '',
  tier: '',
  segment: '',
}

// ============ CONTACT TYPE OPTIONS ============

export const CONTACT_TYPE_OPTIONS: FieldOption[] = [
  { value: 'candidate', label: 'Candidate', description: 'Job seeker or consultant' },
  { value: 'lead', label: 'Lead', description: 'Sales lead or prospect' },
  { value: 'client_contact', label: 'Client Contact', description: 'Contact at a client company' },
  { value: 'vendor_contact', label: 'Vendor Contact', description: 'Contact at a vendor company' },
  { value: 'employee', label: 'Employee', description: 'Internal employee' },
]

export const CONTACT_STATUS_OPTIONS: FieldOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
]

export const CANDIDATE_STATUS_OPTIONS: FieldOption[] = [
  { value: 'available', label: 'Available' },
  { value: 'placed', label: 'Placed' },
  { value: 'on_assignment', label: 'On Assignment' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'not_looking', label: 'Not Looking' },
  { value: 'unavailable', label: 'Unavailable' },
]

export const LEAD_STATUS_OPTIONS: FieldOption[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

export const PREFERRED_CONTACT_METHOD_OPTIONS: FieldOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Text/SMS' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export const TIMEZONE_OPTIONS: FieldOption[] = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
]

export const EMPLOYMENT_TYPE_OPTIONS: FieldOption[] = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'freelance', label: 'Freelance' },
]
