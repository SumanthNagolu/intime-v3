/**
 * Candidate Types - Unified data types for 6-section candidate architecture
 *
 * Single source of truth for candidate data shapes used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 *
 * Section IDs match exactly between wizard and detail view:
 *   1. identity    - Contact info, headline, summary
 *   2. experience  - Work history, education
 *   3. skills      - Technical skills, certifications
 *   4. authorization - Work authorization, visa, availability
 *   5. compensation  - Rate preferences, employment types
 *   6. resume       - Resume upload, source tracking
 */

import type { PhoneInputValue } from '@/components/ui/phone-input'

// ============ MODE TYPES ============

export type SectionMode = 'create' | 'view' | 'edit'

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
  /** Handler to enter edit mode (view mode only) */
  onEdit?: () => void
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
}

// ============ SUB-ENTITY TYPES ============

export interface WorkHistoryEntry {
  id: string
  companyName: string
  jobTitle: string
  employmentType: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  location: string | null
  isRemote: boolean
  description: string | null
  achievements: string[]
}

export interface EducationEntry {
  id: string
  institutionName: string
  degreeType: string | null
  degreeName: string | null
  fieldOfStudy: string | null
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
  gpa: number | null
  honors: string | null
}

export interface SkillEntry {
  id: string
  skillId: string
  skillName: string
  skillCategory: string | null
  proficiencyLevel: number // 1-5
  yearsExperience: number | null
  isPrimary: boolean
  source: string | null
}

export interface CertificationEntry {
  id: string
  name: string
  acronym: string | null
  issuingOrganization: string | null
  credentialId: string | null
  credentialUrl: string | null
  issueDate: string | null
  expiryDate: string | null
  isLifetime: boolean
}

export interface ResumeEntry {
  id: string
  version: number
  isLatest: boolean
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  label: string | null
  targetRole: string | null
  source: 'uploaded' | 'parsed' | 'manual' | 'ai_generated'
  notes: string | null
  isPrimary: boolean
  resumeType: string
  uploadedAt: string
}

// ============ SECTION DATA TYPES ============

/**
 * Section 1: Identity
 * Contact info, headline, and professional summary
 */
export interface IdentitySectionData {
  // Core identity
  firstName: string
  lastName: string
  email: string
  phone: PhoneInputValue
  mobile: PhoneInputValue | null
  linkedinUrl: string
  // Location
  city: string
  state: string
  country: string
  // Professional
  title: string
  headline: string
  professionalSummary: string
  currentCompany: string
  yearsExperience: number | null
}

/**
 * Section 2: Experience
 * Work history and education
 */
export interface ExperienceSectionData {
  workHistory: WorkHistoryEntry[]
  education: EducationEntry[]
}

/**
 * Section 3: Skills
 * Technical skills and certifications
 */
export interface SkillsSectionData {
  skills: SkillEntry[]
  certifications: CertificationEntry[]
}

/**
 * Section 4: Authorization
 * Work authorization, visa status, and availability
 */
export interface AuthorizationSectionData {
  // Work Authorization
  workAuthorization: string | null
  visaStatus: string | null
  visaExpiryDate: string | null
  requiresSponsorship: boolean
  currentSponsor: string | null
  isTransferable: boolean
  clearanceLevel: string | null
  // Availability
  availability: string | null
  availableFrom: string | null
  noticePeriod: string | null
  noticePeriodDays: number | null
  // Location preferences
  willingToRelocate: boolean
  relocationPreferences: string | null
  isRemoteOk: boolean
}

/**
 * Section 5: Compensation
 * Rate preferences and employment types
 */
export interface CompensationSectionData {
  // Rate info
  rateType: string | null // 'hourly' | 'annual'
  desiredRate: number | null
  minimumRate: number | null
  desiredSalary: number | null
  rateCurrency: string
  isNegotiable: boolean
  compensationNotes: string | null
  // Employment preferences
  employmentTypes: string[]
  workModes: string[]
}

/**
 * Section 6: Resume
 * Resume upload and source tracking
 */
export interface ResumeSectionData {
  resumes: ResumeEntry[]
  // Source tracking
  source: string | null
  sourceDetails: string | null
  referredBy: string | null
  campaignId: string | null
  // Status
  status: string
  candidateStatus: string | null
  isOnHotlist: boolean
  hotlistAddedAt: string | null
  hotlistNotes: string | null
  // Tags & Notes
  tags: string[]
  internalNotes: string | null
}

// ============ CONSTANTS ============

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'internship', label: 'Internship' },
] as const

export const WORK_MODES = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'annual', label: 'Annual Salary' },
] as const

export const VISA_STATUSES = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b', label: 'H-1B' },
  { value: 'h1b_transfer', label: 'H-1B Transfer' },
  { value: 'l1', label: 'L-1' },
  { value: 'opt', label: 'OPT' },
  { value: 'opt_stem', label: 'OPT STEM Extension' },
  { value: 'cpt', label: 'CPT' },
  { value: 'tn', label: 'TN Visa' },
  { value: 'e3', label: 'E-3' },
  { value: 'ead', label: 'EAD' },
  { value: 'other', label: 'Other' },
] as const

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2+ Months' },
  { value: 'specific_date', label: 'Specific Date' },
] as const

export const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Basic' },
  { value: 3, label: 'Intermediate' },
  { value: 4, label: 'Advanced' },
  { value: 5, label: 'Expert' },
] as const

export const DEGREE_TYPES = [
  { value: 'high_school', label: 'High School / GED' },
  { value: 'associate', label: "Associate's Degree" },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'Doctorate / PhD' },
  { value: 'other', label: 'Other Credential' },
] as const

export const LEAD_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'job_board', label: 'Job Board' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'career_fair', label: 'Career Fair' },
  { value: 'agency', label: 'Agency' },
  { value: 'internal', label: 'Internal Database' },
  { value: 'other', label: 'Other' },
] as const

export const CANDIDATE_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'passive', label: 'Passive' },
  { value: 'placed', label: 'Placed' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
  { value: 'archived', label: 'Archived' },
] as const

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
  mobile: null,
  linkedinUrl: '',
  city: '',
  state: '',
  country: 'United States',
  title: '',
  headline: '',
  professionalSummary: '',
  currentCompany: '',
  yearsExperience: null,
}

export const DEFAULT_EXPERIENCE_DATA: ExperienceSectionData = {
  workHistory: [],
  education: [],
}

export const DEFAULT_SKILLS_DATA: SkillsSectionData = {
  skills: [],
  certifications: [],
}

export const DEFAULT_AUTHORIZATION_DATA: AuthorizationSectionData = {
  workAuthorization: null,
  visaStatus: 'us_citizen',
  visaExpiryDate: null,
  requiresSponsorship: false,
  currentSponsor: null,
  isTransferable: false,
  clearanceLevel: null,
  availability: '2_weeks',
  availableFrom: null,
  noticePeriod: null,
  noticePeriodDays: null,
  willingToRelocate: false,
  relocationPreferences: null,
  isRemoteOk: false,
}

export const DEFAULT_COMPENSATION_DATA: CompensationSectionData = {
  rateType: 'hourly',
  desiredRate: null,
  minimumRate: null,
  desiredSalary: null,
  rateCurrency: 'USD',
  isNegotiable: true,
  compensationNotes: null,
  employmentTypes: ['full_time'],
  workModes: ['on_site'],
}

export const DEFAULT_RESUME_DATA: ResumeSectionData = {
  resumes: [],
  source: null,
  sourceDetails: null,
  referredBy: null,
  campaignId: null,
  status: 'active',
  candidateStatus: 'new',
  isOnHotlist: false,
  hotlistAddedAt: null,
  hotlistNotes: null,
  tags: [],
  internalNotes: null,
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
