/**
 * Job Types - Unified data types and field definitions
 *
 * Single source of truth for job data shapes used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 */

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
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Edit handler (for view mode) */
  onEdit?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

// ============ SKILL TYPES ============

export interface SkillEntry {
  name: string
  years: string
  proficiency: 'beginner' | 'proficient' | 'expert'
}

export interface InterviewRound {
  id: string
  name: string
  format: 'phone' | 'video' | 'onsite' | 'panel' | 'technical' | 'behavioral'
  duration: number
  interviewer: string
  focus: string
}

// ============ SECTION DATA TYPES ============

export interface BasicInfoSectionData {
  // Account & Contact
  accountId: string
  accountName: string
  clientCompanyId: string | null
  endClientCompanyId: string | null
  vendorCompanyId: string | null
  hiringManagerContactId: string | null
  hrContactId: string | null
  intakeMethod: string
  // Position Info
  title: string
  description: string
  positionsCount: number
  externalJobId: string
  // Employment Type
  jobType: 'contract' | 'permanent' | 'contract_to_hire' | 'c2c' | 'temp' | 'sow'
  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  // Dates
  targetStartDate: string
  targetEndDate: string
  targetFillDate: string
  // Status (for workspace)
  status?: string
}

export interface RequirementsSectionData {
  requiredSkills: SkillEntry[]
  preferredSkills: string[]
  minExperience: string
  maxExperience: string
  experienceLevel: 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'director' | ''
  education: string
  certifications: string[]
  industries: string[]
  visaRequirements: string[]
}

export interface RoleDetailsSectionData {
  roleSummary: string
  responsibilities: string
  roleOpenReason: 'growth' | 'backfill' | 'new_project' | 'restructuring' | ''
  teamName: string
  teamSize: string
  reportsTo: string
  directReports: string
  keyProjects: string
  successMetrics: string
}

export interface LocationSectionData {
  workArrangement: 'remote' | 'hybrid' | 'onsite'
  hybridDays: number
  isRemote: boolean
  location: string
  locationAddressLine1: string
  locationAddressLine2: string
  locationCity: string
  locationState: string
  locationPostalCode: string
  locationCountry: string
  locationRestrictions: string[]
  workAuthorizations: string[]
}

export interface CompensationSectionData {
  rateType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'
  currency: string
  billRateMin: string
  billRateMax: string
  payRateMin: string
  payRateMax: string
  conversionSalaryMin: string
  conversionSalaryMax: string
  conversionFee: string
  feeType: 'percentage' | 'flat' | 'hourly_spread'
  feePercentage: string
  feeFlatAmount: string
  benefits: string[]
  weeklyHours: string
  overtimeExpected: 'never' | 'rarely' | 'sometimes' | 'often' | ''
  onCallRequired: boolean
  onCallSchedule: string
}

export interface InterviewProcessSectionData {
  interviewRounds: InterviewRound[]
  decisionDays: string
  submissionRequirements: string[]
  submissionFormat: string
  submissionNotes: string
  candidatesPerWeek: string
  feedbackTurnaround: string
  screeningQuestions: string
  clientInterviewProcess: string
  clientSubmissionInstructions: string
}

export interface TeamSectionData {
  ownerId: string
  ownerName?: string
  recruiterIds: string[]
  recruiterNames?: string[]
  priorityRank: 0 | 1 | 2 | 3 | 4
  slaDays: number
}

// ============ DEFAULT VALUES ============

export const DEFAULT_BASIC_INFO_DATA: BasicInfoSectionData = {
  accountId: '',
  accountName: '',
  clientCompanyId: null,
  endClientCompanyId: null,
  vendorCompanyId: null,
  hiringManagerContactId: null,
  hrContactId: null,
  intakeMethod: 'phone_video',
  title: '',
  description: '',
  positionsCount: 1,
  externalJobId: '',
  jobType: 'contract',
  priority: 'normal',
  urgency: 'medium',
  targetStartDate: '',
  targetEndDate: '',
  targetFillDate: '',
}

export const DEFAULT_REQUIREMENTS_DATA: RequirementsSectionData = {
  requiredSkills: [],
  preferredSkills: [],
  minExperience: '',
  maxExperience: '',
  experienceLevel: '',
  education: '',
  certifications: [],
  industries: [],
  visaRequirements: [],
}

export const DEFAULT_ROLE_DETAILS_DATA: RoleDetailsSectionData = {
  roleSummary: '',
  responsibilities: '',
  roleOpenReason: '',
  teamName: '',
  teamSize: '',
  reportsTo: '',
  directReports: '',
  keyProjects: '',
  successMetrics: '',
}

export const DEFAULT_LOCATION_DATA: LocationSectionData = {
  workArrangement: 'remote',
  hybridDays: 3,
  isRemote: true,
  location: '',
  locationAddressLine1: '',
  locationAddressLine2: '',
  locationCity: '',
  locationState: '',
  locationPostalCode: '',
  locationCountry: 'US',
  locationRestrictions: [],
  workAuthorizations: [],
}

export const DEFAULT_COMPENSATION_DATA: CompensationSectionData = {
  rateType: 'hourly',
  currency: 'USD',
  billRateMin: '',
  billRateMax: '',
  payRateMin: '',
  payRateMax: '',
  conversionSalaryMin: '',
  conversionSalaryMax: '',
  conversionFee: '',
  feeType: 'percentage',
  feePercentage: '',
  feeFlatAmount: '',
  benefits: [],
  weeklyHours: '40',
  overtimeExpected: '',
  onCallRequired: false,
  onCallSchedule: '',
}

export const DEFAULT_INTERVIEW_PROCESS_DATA: InterviewProcessSectionData = {
  interviewRounds: [],
  decisionDays: '',
  submissionRequirements: [],
  submissionFormat: 'standard',
  submissionNotes: '',
  candidatesPerWeek: '',
  feedbackTurnaround: '',
  screeningQuestions: '',
  clientInterviewProcess: '',
  clientSubmissionInstructions: '',
}

export const DEFAULT_TEAM_DATA: TeamSectionData = {
  ownerId: '',
  recruiterIds: [],
  priorityRank: 0,
  slaDays: 30,
}
