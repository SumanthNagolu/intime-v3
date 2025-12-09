import { LucideIcon } from 'lucide-react'
import { z } from 'zod'

// ============================================
// FIELD DEFINITIONS
// ============================================

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'date-range'
  | 'select'
  | 'multi-select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'skills'
  | 'rich-text'
  | 'file'

export interface SelectOption {
  value: string
  label: string
  icon?: LucideIcon
  color?: string
}

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  description?: string
  required?: boolean
  readOnly?: boolean
  options?: SelectOption[]

  // Layout
  columns?: 1 | 2 | 3
  section?: string

  // Conditional rendering
  dependsOn?: { field: string; value: unknown; operator?: 'eq' | 'neq' | 'in' }
  visibleWhen?: <T>(data: T) => boolean

  // Formatting
  formatValue?: (value: unknown) => string
  currencySymbol?: string
  currency?: string

  // Number fields
  min?: number
  max?: number
  step?: number
}

// ============================================
// STATUS CONFIGURATION
// ============================================

export interface StatusConfig {
  label: string
  color: string      // Tailwind classes: 'bg-green-100 text-green-800'
  bgColor?: string   // For badges with separate bg
  textColor?: string // Text color class (optional)
  icon?: LucideIcon
  description?: string
}

// ============================================
// LIST VIEW CONFIGURATION
// ============================================

/**
 * ListViewVariant - Enables page reusability from a single config
 *
 * Use cases:
 * - "All Jobs" vs "My Jobs" vs "Active Jobs"
 * - Workspace "My X" tables vs full entity lists
 * - Embedded lists in other pages
 *
 * Example usage:
 *   <EntityListView
 *     config={jobsListConfig}
 *     variant={{
 *       title: "My Jobs",
 *       presetFilters: { assigned_to: userId },
 *       hideFilters: ['assigned_to'],
 *       hideStats: true
 *     }}
 *   />
 */
export interface ListViewVariant {
  title?: string                           // Override: "My Jobs"
  description?: string                     // Override description
  presetFilters?: Record<string, unknown>  // { assigned_to: userId }
  hideFilters?: string[]                   // ['assigned_to'] - hide applied filter
  hideStats?: boolean                      // Compact view for embedded lists
  hideHeader?: boolean                     // For embedded lists without title
  hidePrimaryAction?: boolean              // Hide create button
  pageSize?: number                        // Override default page size
  compact?: boolean                        // Reduced padding/fonts for embedded contexts
}

export interface StatCardConfig {
  key: string
  label: string
  icon?: LucideIcon
  color?: string     // Icon background color
  format?: 'number' | 'currency' | 'percent' | ((value: number) => string)
}

export interface FilterConfig {
  key: string
  type: 'search' | 'select' | 'multi-select' | 'date-range' | 'toggle'
  label: string
  placeholder?: string
  options?: SelectOption[]
  width?: string     // Tailwind width class
}

export interface ColumnConfig<T = unknown> {
  key: string
  header?: string
  label?: string     // Alias for header
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  icon?: LucideIcon  // Optional icon before column name
  type?: 'text' | 'date' | 'currency' | 'number' | 'status'
  render?: (value: unknown, item: T) => React.ReactNode
  format?: 'date' | 'relative-date' | 'currency' | 'number' | 'status'
}

export interface RowAction<T = unknown> {
  key: string
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
  condition?: (item: T) => boolean
}

export interface EmptyStateConfig {
  icon: LucideIcon
  title: string
  description: string | ((filters: Record<string, unknown>) => string)
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export interface ListViewConfig<T = unknown> {
  // Entity info
  entityType: string
  entityName: { singular: string; plural: string }
  baseRoute: string

  // Header
  title: string
  description?: string
  icon?: LucideIcon

  // Primary action
  primaryAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }

  // Stats
  statsCards?: StatCardConfig[]

  // Filters
  filters?: FilterConfig[]

  // Rendering
  renderMode: 'table' | 'cards'
  columns?: ColumnConfig<T>[]
  cardRenderer?: (item: T, onClick: () => void) => React.ReactNode

  // Status
  statusConfig?: Record<string, StatusConfig>
  statusField?: keyof T

  // Empty state
  emptyState: EmptyStateConfig

  // Row actions
  rowActions?: RowAction<T>[]

  // Bulk actions
  bulkActions?: Array<{
    key: string
    label: string
    icon?: LucideIcon
    onClick: (selectedIds: string[]) => void
  }>

  // Pagination
  pageSize?: number

  /**
   * Data Hooks Pattern (G4: Hydration Safety)
   *
   * IMPORTANT: These hook functions MUST be defined inline or in a component context.
   * Do NOT import configs at module level if hooks reference tRPC/React Query directly.
   *
   * CORRECT - Define inline:
   *   useListQuery: (filters) => trpc.ats.jobs.list.useQuery({...})
   *
   * CORRECT - Use inside component:
   *   const config = useMemo(() => ({ ...jobsListConfig }), [])
   *
   * WRONG - Will cause hydration issues:
   *   // jobs.config.ts (module level)
   *   export const jobsListConfig = {
   *     useListQuery: (filters) => trpc.ats.jobs.list.useQuery({...}) // Called at import!
   *   }
   *   // page.tsx
   *   import { jobsListConfig } from './jobs.config' // Hydration error!
   *
   * Alternative: Use factory pattern for configs imported at module level:
   *   getListQueryOptions: (filters) => ({
   *     queryKey: ['jobs', 'list', filters],
   *     trpcPath: 'ats.jobs.list',
   *     input: filters,
   *   })
   */
  useListQuery: (filters: Record<string, unknown>) => {
    data: { items: T[]; total: number } | undefined
    isLoading: boolean
    error: unknown
  }
  useStatsQuery?: () => {
    data: Record<string, number | string> | undefined
    isLoading: boolean
  }
}

// ============================================
// DETAIL VIEW CONFIGURATION
// ============================================

export interface MetricConfig {
  key: string
  label: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  getValue: (entity: unknown) => string | number
  getTotal?: (entity: unknown) => number | undefined
  format?: (value: number | string) => string
  tooltip?: string | ((entity: unknown) => string)
}

export interface SectionConfig {
  id: string
  label: string
  icon?: LucideIcon
  showCount?: boolean
  getCount?: (entity: unknown) => number
  alertOnCount?: boolean
  component?: React.ComponentType<{ entityId: string; entity?: unknown }>
}

export interface JourneyStepConfig {
  id: string
  label: string
  icon?: LucideIcon
  completedStatuses: string[]
  activeStatuses: string[]
  /** Component to render when this journey step is active (PCF pattern) */
  component?: React.ComponentType<{ entityId: string; entity?: unknown }>
}

export interface QuickActionConfig {
  id: string
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'outline' | 'premium' | 'destructive'
  onClick: (entity: unknown) => void
  isVisible?: (entity: unknown) => boolean
  isDisabled?: (entity: unknown) => boolean
}

export interface DetailViewConfig<T = unknown> {
  // Entity info
  entityType: string
  baseRoute: string

  // Header
  breadcrumbs?: Array<{ label: string; href: string }>
  titleField: keyof T
  titleFormatter?: (entity: T) => string
  subtitleFields?: Array<{
    key: keyof T
    icon?: LucideIcon
    format?: (value: unknown, entity?: unknown) => string
  }>
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>

  // Metrics bar
  metrics?: MetricConfig[]
  showProgressBar?: {
    label: string
    getValue: (entity: T) => number
    getMax: (entity: T) => number
  }

  // Navigation mode
  navigationMode: 'sections' | 'journey' | 'both'
  defaultSection?: string

  // Sections (for section-based navigation)
  sections?: SectionConfig[]

  // Journey steps (for journey-based navigation)
  journeySteps?: JourneyStepConfig[]

  // Quick actions
  quickActions?: QuickActionConfig[]
  dropdownActions?: Array<{
    label: string
    icon?: LucideIcon
    onClick?: (entity: T) => void
    href?: string
    separator?: boolean
    variant?: 'default' | 'destructive'
    isVisible?: (entity: T) => boolean
    isDisabled?: (entity: T) => boolean
  }>

  // Event System (G3: For sidebar quick action communication)
  /**
   * Event namespace for sidebar communication.
   * Pattern: 'open{EntityType}Dialog' events are dispatched from sidebar quick actions.
   *
   * Example: eventNamespace: 'campaign'
   * - Listens for: 'openCampaignDialog' events
   * - Event payload: { dialogId: string } (e.g., 'editCampaign', 'addProspect')
   *
   * The component will call the matching handler from dialogHandlers.
   */
  eventNamespace?: string
  dialogHandlers?: Record<string, (entity: T, setDialogState: (open: boolean) => void) => void>

  // Data hooks
  useEntityQuery: (id: string) => {
    data: T | undefined
    isLoading: boolean
    error: unknown
  }
}

// ============================================
// WIZARD CONFIGURATION
// ============================================

export interface WizardStepConfig<T = unknown> {
  id: string
  number: number
  label: string
  description?: string
  icon?: LucideIcon

  // Fields for auto-generated form
  fields?: FieldDefinition[]

  // Or custom component
  component?: React.ComponentType<{
    formData: Partial<T>
    setFormData: (data: Partial<T>) => void
    errors: Record<string, string>
  }>

  // Validation
  validation?: z.ZodSchema
  validateFn?: (formData: Partial<T>) => string[]
}

export interface WizardConfig<T = unknown> {
  // Wizard info
  title: string
  description?: string
  entityType: string

  // Steps
  steps: WizardStepConfig<T>[]

  // Navigation
  allowFreeNavigation?: boolean
  stepIndicatorStyle?: 'numbers' | 'icons'

  // Review step
  reviewStep?: {
    title: string
    sections: Array<{
      label: string
      fields: (keyof T)[]
      stepNumber?: number
    }>
  }

  // Actions
  submitLabel?: string
  saveDraftLabel?: string
  cancelRoute?: string

  // Store
  storeName: string
  defaultFormData: T

  // Submission
  onSubmit: (formData: T) => Promise<unknown>
  onSuccess?: (result: unknown) => void
}

// ============================================
// FORM CONFIGURATION
// ============================================

export interface FormSectionConfig {
  id?: string
  title?: string
  description?: string
  columns?: 1 | 2 | 3
  fields: FieldDefinition[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface FormConfig<T = unknown> {
  // Form info
  title?: string
  description?: string
  entityName: string
  variant?: 'card' | 'bare'

  // Fields layout
  sections?: FormSectionConfig[]
  fields?: FieldDefinition[]
  defaultColumns?: 1 | 2 | 3
  defaultValues?: Partial<T>

  // Validation
  validation?: z.ZodSchema
  validateFn?: (data: T) => Record<string, string>

  // Actions
  submitLabel?: string
  cancelLabel?: string
  successMessage?: string
  hideActions?: boolean
  actionsPosition?: 'bottom' | 'top' | 'sticky'
  showDelete?: boolean

  // Handlers
  onSubmit: (data: T) => Promise<unknown>
  onDelete?: (data: T) => Promise<void>
}
