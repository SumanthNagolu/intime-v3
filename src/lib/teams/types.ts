/**
 * Team Types - Unified data types and field definitions
 *
 * Single source of truth for team data shapes used in:
 * - Wizard (create mode)
 * - Detail view (view mode)
 * - Edit panels (edit mode)
 */

import type { PhoneInputValue } from '@/components/ui/phone-input'

// ============ MODE TYPES ============

export type SectionMode = 'create' | 'view' | 'edit'

// ============ GROUP TYPES ============

export type GroupType = 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer'
export type LoadPermission = 'normal' | 'reduced' | 'exempt'
export type VacationStatus = 'available' | 'vacation' | 'sick' | 'leave'

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
  /** Handler to enter edit mode (view mode) */
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
  /** Rendering variant */
  variant?: 'full' | 'compact'
}

// ============ SUB-ENTITY TYPES ============

export interface TeamMember {
  id: string
  userId: string
  fullName: string
  email: string | null
  avatarUrl: string | null
  title?: string
  isManager: boolean
  isActive: boolean
  loadFactor: number
  loadPermission: LoadPermission
  vacationStatus: VacationStatus
  backupUserId: string | null
  backupUserName?: string
  joinedAt: string | null
  leftAt: string | null
}

export interface TeamRegion {
  id: string
  regionId: string
  name: string
  code: string | null
  isPrimary: boolean
}

// ============ SECTION DATA TYPES ============

/**
 * Identity section data for team creation/editing
 */
export interface TeamIdentitySectionData {
  // Core identity
  name: string
  code: string
  description: string
  groupType: GroupType
  // Status
  isActive: boolean
  // Hierarchy
  parentGroupId: string
  parentGroupName?: string
  securityZone: string
  // Contact info
  email: string
  phone: PhoneInputValue
  fax: string
  // Configuration
  loadFactor: number
}

/**
 * Location section data
 */
export interface TeamLocationSectionData {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  regions: TeamRegion[]
}

/**
 * Members section data
 */
export interface TeamMembersSectionData {
  members: TeamMember[]
  managerId: string
  managerName?: string
  supervisorId: string
  supervisorName?: string
}

/**
 * Settings section data (roles & permissions)
 */
export interface TeamSettingsSectionData {
  requiresApprovalForSubmission: boolean
  autoAssignNewJobs: boolean
  defaultLoadPermission: LoadPermission
  allowSelfService: boolean
  notifyOnNewAssignment: boolean
  notifyOnCapacityChange: boolean
}

// ============ DEFAULT VALUES ============

export const DEFAULT_PHONE: PhoneInputValue = {
  countryCode: 'US',
  number: '',
}

export const DEFAULT_IDENTITY_DATA: TeamIdentitySectionData = {
  name: '',
  code: '',
  description: '',
  groupType: 'team',
  isActive: true,
  parentGroupId: '',
  securityZone: 'default',
  email: '',
  phone: { ...DEFAULT_PHONE },
  fax: '',
  loadFactor: 100,
}

export const DEFAULT_LOCATION_DATA: TeamLocationSectionData = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  regions: [],
}

export const DEFAULT_MEMBERS_DATA: TeamMembersSectionData = {
  members: [],
  managerId: '',
  supervisorId: '',
}

export const DEFAULT_SETTINGS_DATA: TeamSettingsSectionData = {
  requiresApprovalForSubmission: false,
  autoAssignNewJobs: false,
  defaultLoadPermission: 'normal',
  allowSelfService: true,
  notifyOnNewAssignment: true,
  notifyOnCapacityChange: true,
}

// ============ FULL TEAM DATA ============

/**
 * Combined data from all sections - used for complete team object
 */
export interface TeamFormData {
  identity: TeamIdentitySectionData
  location: TeamLocationSectionData
  members: TeamMembersSectionData
  settings: TeamSettingsSectionData
}
