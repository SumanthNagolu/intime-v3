/**
 * Deal Types - Unified data types and field definitions
 *
 * Single source of truth for deal data shapes used in:
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
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
  /** Rendering variant */
  variant?: 'full' | 'compact'
}

// ============ DEAL STAGE TYPE ============

export type DealStage =
  | 'discovery'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'verbal_commit'
  | 'closed_won'
  | 'closed_lost'

// ============ SUB-ENTITY TYPES ============

export interface DealStakeholder {
  id: string
  contactId: string | null
  name: string
  title: string
  email: string
  phone: string
  role: string // 'champion' | 'decision_maker' | 'influencer' | 'blocker' | 'end_user'
  influenceLevel: string // 'high' | 'medium' | 'low'
  sentiment: string // 'positive' | 'neutral' | 'negative'
  engagementNotes: string
  isPrimary: boolean
  isActive: boolean
}

export interface DealRoleBreakdown {
  id?: string
  title: string
  count: number
  billRate: number | null
  startDate: string | null
}

export interface DealConfirmedRole {
  id?: string
  title: string
  count: number
  billRate: number
  startDate: string | null
}

export interface DealBillingContact {
  name: string
  email: string
  phone: string
  address: string
}

export interface DealMilestone {
  id?: string
  title: string
  dueDate: string | null
  completed: boolean
  completedAt: string | null
}

// ============ SECTION DATA TYPES ============

/**
 * Overview Section - Summary dashboard data
 * Not editable, computed from other sections
 */
export interface OverviewSectionData {
  // Value metrics
  value: number
  probability: number
  weightedValue: number
  // Stage info
  stage: DealStage
  daysInStage: number
  healthStatus: string
  // Key dates
  expectedCloseDate: string | null
  nextStep: string | null
  nextStepDate: string | null
  // Counts
  stakeholderCount: number
  championCount: number
  blockerCount: number
}

/**
 * Details Section - Core deal information
 */
export interface DetailsSectionData {
  // Core Identity
  title: string
  description: string
  // Value & Revenue
  value: number
  probability: number
  valueBasis: string // 'one_time' | 'annual' | 'monthly'
  currency: string
  // Pipeline
  stage: DealStage
  expectedCloseDate: string | null
  // Staffing details
  estimatedPlacements: number | null
  avgBillRate: number | null
  contractLengthMonths: number | null
  hiringNeeds: string
  servicesRequired: string[]
  // Health
  healthStatus: string
}

/**
 * Stakeholders Section - Decision makers and contacts
 */
export interface StakeholdersSectionData {
  stakeholders: DealStakeholder[]
}

/**
 * Timeline Section - Dates, milestones, and next steps
 */
export interface TimelineSectionData {
  // Next Steps
  nextStep: string
  nextStepDate: string | null
  // Key Dates
  expectedCloseDate: string | null
  actualCloseDate: string | null
  // Contract dates (when closed_won)
  contractSignedDate: string | null
  contractStartDate: string | null
  // Milestones
  milestones: DealMilestone[]
}

/**
 * Competitors Section - Competitive landscape
 */
export interface CompetitorsSectionData {
  // Active competitors
  competitors: string[]
  competitiveAdvantage: string
  // Win analysis (if closed_won)
  winReason: string
  winDetails: string
  competitorsBeat: string[]
  // Loss analysis (if closed_lost)
  lossReason: string
  lossReasonCategory: string
  lossDetails: string
  competitorWon: string
  competitorPrice: number | null
  // Future potential
  futurePotential: string // 'yes' | 'maybe' | 'no'
  reengagementDate: string | null
  lessonsLearned: string
}

/**
 * Proposal Section - Pricing, terms, and scope
 */
export interface ProposalSectionData {
  // Roles breakdown
  rolesBreakdown: DealRoleBreakdown[]
  // Contract terms
  contractType: string // 'msa' | 'sow' | 'po' | 'email'
  contractDurationMonths: number | null
  paymentTerms: string // 'net_15' | 'net_30' | 'net_45' | 'net_60'
  billingFrequency: string // 'weekly' | 'biweekly' | 'monthly'
  // Billing contact
  billingContact: DealBillingContact
  // Confirmed roles (after close)
  confirmedRoles: DealConfirmedRole[]
}

/**
 * Team Section - Ownership and assignments
 */
export interface TeamSectionData {
  ownerId: string
  ownerName: string
  podManagerId: string
  podManagerName: string
  secondaryOwnerId: string
  secondaryOwnerName: string
}

// ============ DEFAULT VALUES ============

export const DEFAULT_DETAILS_DATA: DetailsSectionData = {
  title: '',
  description: '',
  value: 0,
  probability: 20,
  valueBasis: 'one_time',
  currency: 'USD',
  stage: 'discovery',
  expectedCloseDate: null,
  estimatedPlacements: null,
  avgBillRate: null,
  contractLengthMonths: null,
  hiringNeeds: '',
  servicesRequired: [],
  healthStatus: 'on_track',
}

export const DEFAULT_STAKEHOLDER: Omit<DealStakeholder, 'id'> = {
  contactId: null,
  name: '',
  title: '',
  email: '',
  phone: '',
  role: 'influencer',
  influenceLevel: 'medium',
  sentiment: 'neutral',
  engagementNotes: '',
  isPrimary: false,
  isActive: true,
}

export const DEFAULT_STAKEHOLDERS_DATA: StakeholdersSectionData = {
  stakeholders: [],
}

export const DEFAULT_TIMELINE_DATA: TimelineSectionData = {
  nextStep: '',
  nextStepDate: null,
  expectedCloseDate: null,
  actualCloseDate: null,
  contractSignedDate: null,
  contractStartDate: null,
  milestones: [],
}

export const DEFAULT_COMPETITORS_DATA: CompetitorsSectionData = {
  competitors: [],
  competitiveAdvantage: '',
  winReason: '',
  winDetails: '',
  competitorsBeat: [],
  lossReason: '',
  lossReasonCategory: '',
  lossDetails: '',
  competitorWon: '',
  competitorPrice: null,
  futurePotential: '',
  reengagementDate: null,
  lessonsLearned: '',
}

export const DEFAULT_BILLING_CONTACT: DealBillingContact = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

export const DEFAULT_PROPOSAL_DATA: ProposalSectionData = {
  rolesBreakdown: [],
  contractType: '',
  contractDurationMonths: null,
  paymentTerms: 'net_30',
  billingFrequency: 'monthly',
  billingContact: { ...DEFAULT_BILLING_CONTACT },
  confirmedRoles: [],
}

export const DEFAULT_TEAM_DATA: TeamSectionData = {
  ownerId: '',
  ownerName: '',
  podManagerId: '',
  podManagerName: '',
  secondaryOwnerId: '',
  secondaryOwnerName: '',
}

// ============ WIZARD STEP DEFINITION ============

export interface WizardStep {
  id: string
  label: string
  description: string
}

export const DEAL_WIZARD_STEPS: WizardStep[] = [
  { id: 'details', label: 'Deal Details', description: 'Value, stage, and basic information' },
  { id: 'stakeholders', label: 'Stakeholders', description: 'Key contacts and decision makers' },
  { id: 'timeline', label: 'Timeline', description: 'Dates, milestones, and next steps' },
  { id: 'competitors', label: 'Competitors', description: 'Competitive landscape' },
  { id: 'proposal', label: 'Proposal', description: 'Pricing, terms, and scope' },
  { id: 'team', label: 'Team', description: 'Ownership and assignments' },
]

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
