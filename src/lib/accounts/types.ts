/**
 * Account Types - Unified data types and field definitions
 *
 * Single source of truth for account data shapes used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 */

import type { LucideIcon } from 'lucide-react'
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

export interface AccountAddress {
  id: string
  type: string  // 'headquarters' | 'billing' | 'mailing' | 'office' | 'shipping'
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isPrimary: boolean
}

export interface AccountContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: PhoneInputValue
  mobile?: PhoneInputValue
  title: string
  department: string
  role: string  // 'primary' | 'billing' | 'executive_sponsor' | 'hiring_manager' | 'hr' | 'procurement'
  decisionAuthority: string  // 'decision_maker' | 'influencer' | 'champion' | 'gatekeeper'
  influenceLevel?: 1 | 2 | 3 | 4 | 5
  isPrimary: boolean
  linkedInUrl?: string
  twitterUrl?: string
  timezone?: string
  preferredContactMethod?: string  // 'email' | 'phone' | 'slack' | 'teams'
  bestTimeToContact?: string
  doNotCall?: boolean
  notes?: string
}

export interface AccountContract {
  id: string
  type: string  // 'msa' | 'nda' | 'sow' | 'rate_agreement' | 'subcontract'
  name: string
  number: string
  status: string  // 'draft' | 'active' | 'pending_signature'
  effectiveDate: Date | string | null
  expiryDate: Date | string | null
  autoRenew: boolean
  contractValue?: string
  currency: string
  fileUrl?: string
  filePath?: string
  fileData?: string
  fileName?: string
  fileMimeType?: string
}

export interface AccountCompliance {
  insurance: {
    generalLiability: boolean
    professionalLiability: boolean
    workersComp: boolean
    cyberLiability: boolean
  }
  backgroundCheck: {
    required: boolean
    level: string
  }
  drugTest: {
    required: boolean
  }
  certifications: string[]
}

export interface TeamAssignment {
  ownerId: string
  ownerName?: string
  accountManagerId: string
  accountManagerName?: string
  recruiterId?: string
  recruiterName?: string
  salesLeadId?: string
  salesLeadName?: string
  isStrategic?: boolean
  requiresApprovalForSubmission?: boolean
}

// ============ SECTION DATA TYPES ============

export interface IdentitySectionData {
  // Account Type
  accountType: 'company' | 'person'
  // Core Identity
  name: string
  legalName: string
  dba: string
  taxId: string
  email: string
  phone: PhoneInputValue
  website: string
  linkedinUrl: string
  description: string
  // Classification
  industries: string[]
  companyType: string  // 'direct_client' | 'implementation_partner' | 'staffing_vendor'
  tier: string  // 'standard' | 'preferred' | 'strategic' | 'exclusive'
  segment: string  // 'enterprise' | 'mid_market' | 'smb' | 'startup'
  status: string  // 'prospect' | 'active' | 'inactive'
  // Corporate Profile
  foundedYear: string
  employeeRange: string
  revenueRange: string
  ownershipType: string
}

export interface LocationsSectionData {
  addresses: AccountAddress[]
}

export interface BillingSectionData {
  billingEntityName: string
  billingEmail: string
  billingPhone: PhoneInputValue
  billingFrequency: string  // 'weekly' | 'biweekly' | 'monthly'
  paymentTermsDays: string
  poRequired: boolean
  currentPoNumber: string
  poExpirationDate: string | null
  currency: string
  invoiceFormat: string
  invoiceDeliveryMethod: string
  // Credit info
  creditStatus: string
  creditLimit: string
  // Rates
  defaultMarkupPercentage: string
  defaultFeePercentage: string
  requiresApprovalForSubmission: boolean
}

export interface ContactsSectionData {
  contacts: AccountContact[]
}

export interface ContractsSectionData {
  contracts: AccountContract[]
}

export interface ComplianceSectionData {
  compliance: AccountCompliance
}

export interface TeamSectionData {
  team: TeamAssignment
  preferredContactMethod: string  // 'email' | 'phone' | 'slack' | 'teams'
  meetingCadence: string  // 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed'
  submissionMethod: string
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
  | 'taxId'
  | 'user'

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
  /** Alternative label for create mode */
  labelCreate?: string
  /** Placeholder text */
  placeholder?: string
  /** Alternative placeholder for create mode */
  placeholderCreate?: string
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
  /** Required only in create mode */
  requiredCreate?: boolean
  /** How to render in view mode */
  viewRenderer?: ViewRenderer
  /** Custom format function for view mode */
  viewFormat?: (value: unknown) => string
  /** Grid column span (1 or 2) */
  colSpan?: 1 | 2
  /** Group name for organization */
  group?: string
  /** Conditional visibility function */
  showWhen?: (data: Record<string, unknown>) => boolean
  /** Hide in specific modes */
  hideIn?: SectionMode[]
  /** Min value for number fields */
  min?: number
  /** Max value for number fields */
  max?: number
  /** Step for number fields */
  step?: number
  /** Rows for textarea */
  rows?: number
  /** Max length for text/textarea */
  maxLength?: number
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
  /** Card background color class (for view mode) */
  cardColor?: string
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

/**
 * Map form data (camelCase) to API data (snake_case)
 */
export function mapFormToApi<T extends Record<string, unknown>>(
  formData: T,
  fields: FieldDefinition[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    const value = formData[field.name]
    if (value !== undefined && value !== '') {
      const dbName = field.dbName ?? camelToSnake(field.name)
      result[dbName] = value
    }
  }

  return result
}

/**
 * Map API data (snake_case) to form data (camelCase)
 */
export function mapApiToForm<T extends Record<string, unknown>>(
  apiData: Record<string, unknown>,
  fields: FieldDefinition[]
): Partial<T> {
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    const dbName = field.dbName ?? camelToSnake(field.name)
    const value = apiData[dbName]
    if (value !== undefined) {
      result[field.name] = value
    }
  }

  return result as Partial<T>
}

// ============ DEFAULT VALUES ============

export const DEFAULT_PHONE: PhoneInputValue = {
  countryCode: 'US',
  number: '',
}

export const DEFAULT_IDENTITY_DATA: IdentitySectionData = {
  accountType: 'company',
  name: '',
  legalName: '',
  dba: '',
  taxId: '',
  email: '',
  phone: { ...DEFAULT_PHONE },
  website: '',
  linkedinUrl: '',
  description: '',
  industries: [],
  companyType: 'direct_client',
  tier: '',
  segment: '',
  status: 'prospect',
  foundedYear: '',
  employeeRange: '',
  revenueRange: '',
  ownershipType: '',
}

export const DEFAULT_BILLING_DATA: BillingSectionData = {
  billingEntityName: '',
  billingEmail: '',
  billingPhone: { ...DEFAULT_PHONE },
  billingFrequency: 'monthly',
  paymentTermsDays: '30',
  poRequired: false,
  currentPoNumber: '',
  poExpirationDate: null,
  currency: 'USD',
  invoiceFormat: 'standard',
  invoiceDeliveryMethod: 'email',
  creditStatus: '',
  creditLimit: '',
  defaultMarkupPercentage: '',
  defaultFeePercentage: '',
  requiresApprovalForSubmission: false,
}

export const DEFAULT_COMPLIANCE_DATA: ComplianceSectionData = {
  compliance: {
    insurance: {
      generalLiability: false,
      professionalLiability: false,
      workersComp: false,
      cyberLiability: false,
    },
    backgroundCheck: {
      required: false,
      level: '',
    },
    drugTest: {
      required: false,
    },
    certifications: [],
  },
}

export const DEFAULT_TEAM_DATA: TeamSectionData = {
  team: {
    ownerId: '',
    accountManagerId: '',
    recruiterId: '',
    salesLeadId: '',
  },
  preferredContactMethod: 'email',
  meetingCadence: 'weekly',
  submissionMethod: 'email',
}
