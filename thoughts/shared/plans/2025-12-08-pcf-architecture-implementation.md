# Guidewire-Inspired PCF Architecture Implementation Plan

## Overview

Build a **configuration-driven Page Configuration Framework (PCF)** that centralizes and standardizes UI patterns across InTime v3. This replaces 8+ scattered list implementations, 2+ detail view patterns, and 2 wizard implementations with reusable, config-driven components.

**Core Deliverables:**
- 4 PCF Components: `EntityListView`, `EntityDetailView`, `EntityWizard`, `EntityForm`
- 3 Polymorphic Section Components: `ActivitiesSection`, `DocumentsSection`, `NotesSection`
- Entity configurations for **12 root entities** (Jobs, Accounts, Leads, Campaigns, Candidates, Deals, Contacts, Submissions, Interviews, Placements, Vendors, Prospects)
- `ListViewVariant` support for page reusability (My Jobs vs All Jobs)
- Shared utilities and sub-components

**Estimated Timeline:** ~4.5 weeks (with 30% risk buffer)
- Phases 1-6 (Core PCF): 9 days
- Phase 7 (12 Entity Configs): 6 days
- Phase 7 (12 Entity Migrations): 3 days

## Current State Analysis

### Existing Implementations (Scattered)

| Pattern | Count | Examples | Issues |
|---------|-------|----------|--------|
| **ListView** | 8 | AccountsListClient, JobsListClient, LeadsListClient, CandidatesListClient, PlacementsListClient | Similar code duplicated, inconsistent layouts (table vs cards), varying filter patterns |
| **DetailView** | 2+ | CampaignDetailPage, AccountDetailPage | Different header structures, inconsistent section navigation, mixed patterns |
| **Wizard** | 2 | JobIntakeWizard (5 steps), AccountOnboardingWizard (6 steps) | Separate stores, duplicated step indicator UI, similar validation patterns |
| **Polymorphic Sections** | 10+ | AccountActivitiesSection, CampaignActivitiesSection, etc. | Same functionality reimplemented per parent entity |

### Key Discoveries from Research

1. **ListView Patterns** (`src/components/recruiting/*/ListClient.tsx`):
   - Common structure: Header → Stats Cards → Filters → List → Empty State
   - Two rendering modes: Table (Accounts) vs Cards (Jobs, Leads)
   - Stats cards: 4-5 cards with icon, label, value
   - Filters: Search input + 1-2 Select dropdowns
   - URL-based filter state management

2. **DetailView Patterns** (`src/components/crm/campaigns/CampaignDetailPage.tsx`):
   - Header: Breadcrumbs → Title + Status Badge → Meta Info → Quick Actions
   - Sticky metrics bar with key KPIs
   - Section navigation via URL `?section=X`
   - Section rendering via switch statement
   - Event-based communication with sidebar

3. **Wizard Patterns** (`src/app/employee/recruiting/jobs/intake/page.tsx`):
   - URL-based step navigation `?step=N`
   - Zustand store with persist middleware
   - Step indicator with completed/current/future states
   - Per-step validation before navigation
   - Auto-save on field change

4. **Form Field Patterns** (`src/components/ui/editable-info-card.tsx`):
   - `FieldDefinition` interface with 10 field types
   - `FieldInput` renderer for all types
   - `formatDisplayValue` for read-only display
   - `validateFields` for required + type-specific validation

### Files to Extract/Reuse

| File | Reusable Pattern | Action |
|------|------------------|--------|
| `src/components/ui/editable-info-card.tsx` | FieldDefinition, FieldInput, formatDisplayValue | Extract utilities |
| `src/components/ui/form-field.tsx` | FormField wrapper with label, error, hint | Use directly |
| `src/components/ui/inline-panel.tsx` | InlinePanel, InlinePanelSection | Use directly |
| `src/lib/navigation/entity-sections.ts` | SectionDefinition interface | Extend for PCF |
| `src/lib/navigation/entity-journeys.ts` | JourneyStep interface | Extend for PCF |

## Desired End State

### Architecture

```
src/
├── components/
│   └── pcf/                              # Core PCF Components
│       ├── list-view/
│       │   ├── EntityListView.tsx        # Main component
│       │   ├── ListHeader.tsx
│       │   ├── ListStats.tsx
│       │   ├── ListFilters.tsx
│       │   ├── ListTable.tsx
│       │   ├── ListCards.tsx
│       │   ├── ListEmptyState.tsx
│       │   ├── ListPagination.tsx
│       │   └── index.ts
│       ├── detail-view/
│       │   ├── EntityDetailView.tsx      # Main component
│       │   ├── DetailHeader.tsx
│       │   ├── DetailMetrics.tsx
│       │   ├── DetailSections.tsx
│       │   ├── DetailJourney.tsx
│       │   └── index.ts
│       ├── wizard/
│       │   ├── EntityWizard.tsx          # Main component
│       │   ├── WizardProgress.tsx
│       │   ├── WizardStep.tsx
│       │   ├── WizardNavigation.tsx
│       │   └── index.ts
│       ├── form/
│       │   ├── EntityForm.tsx            # Main component
│       │   ├── FormSection.tsx
│       │   ├── FormField.tsx             # Universal field renderer
│       │   └── index.ts
│       ├── sections/                     # Polymorphic sections
│       │   ├── ActivitiesSection.tsx
│       │   ├── DocumentsSection.tsx
│       │   ├── NotesSection.tsx
│       │   └── index.ts
│       └── shared/
│           ├── StatusBadge.tsx
│           ├── QuickActionBar.tsx
│           ├── EmptyState.tsx
│           ├── EntityIcon.tsx
│           └── index.ts
├── configs/
│   └── entities/                         # Entity Configurations
│       ├── types.ts                      # Shared config types
│       ├── jobs.config.ts
│       ├── accounts.config.ts
│       ├── leads.config.ts
│       ├── deals.config.ts
│       ├── candidates.config.ts
│       ├── campaigns.config.ts
│       └── index.ts
└── lib/
    └── pcf/                              # PCF Utilities
        ├── field-renderer.ts
        ├── format-display-value.ts
        ├── validate-fields.ts
        └── index.ts
```

### Usage Example (After Implementation)

```tsx
// src/app/employee/recruiting/jobs/page.tsx (AFTER)
import { EntityListView } from '@/components/pcf/list-view'
import { jobsListConfig } from '@/configs/entities/jobs.config'

export default async function JobsPage() {
  const initialData = await fetchInitialJobs()

  return (
    <EntityListView
      config={jobsListConfig}
      initialData={initialData}
    />
  )
}

// src/app/employee/recruiting/jobs/[id]/page.tsx (AFTER)
import { EntityDetailView } from '@/components/pcf/detail-view'
import { jobDetailConfig } from '@/configs/entities/jobs.config'

export default async function JobDetailPage({ params }) {
  const job = await fetchJob(params.id)

  return (
    <EntityDetailView
      config={jobDetailConfig}
      entity={job}
      entityId={params.id}
    />
  )
}
```

### Verification Criteria

1. **Any new list page** can be created with just a config file + `<EntityListView config={...} />`
2. **Any new detail page** can be created with just a config file + `<EntityDetailView config={...} />`
3. **Activities/Documents/Notes** sections work identically across all parent entities
4. **Existing pages** continue to work during migration (gradual replacement)
5. **Design system compliance** - All components follow Hublot luxury aesthetic

## What We're NOT Doing

1. **Breaking existing pages** - Migration is gradual, existing components remain functional
2. **Changing database schema** - PCF is UI-only, no backend changes
3. **Modifying tRPC routers** - Existing API contracts remain unchanged
4. **Building a full form builder** - PCF supports defined field types, not arbitrary widgets
5. **Server-side rendering for all PCF** - Client components where interactivity needed
6. **Automated migration script** - Manual page-by-page migration for quality control
7. **Mobile-first redesign** - Responsive but desktop-primary focus maintained

---

## Implementation Approach

The implementation is divided into **7 phases** with natural handoff points between major milestones. Each phase builds on the previous and can be validated independently.

| Phase | Description | Complexity | Handoff Point |
|-------|-------------|------------|---------------|
| 1 | Core Infrastructure | Medium | Yes - Foundation complete |
| 2 | Polymorphic Sections | Medium | Yes - Reusable sections ready |
| 3 | EntityListView | High | Yes - Lists complete |
| 4 | EntityDetailView | High | Yes - Details complete |
| 5 | EntityWizard | Medium | Yes - Wizards complete |
| 6 | EntityForm | Low | No - Quick phase |
| 7 | Entity Configurations & Migration | High | Yes - Per-entity handoffs |

---

## Phase 1: Core Infrastructure

### Overview

Extract reusable utilities from existing components and create the foundational type definitions and shared sub-components that all PCF components will depend on.

### Changes Required

#### 1.1 Create PCF Type Definitions

**File**: `src/configs/entities/types.ts`

```typescript
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

  // Formatting
  formatValue?: (value: unknown) => string
  currencySymbol?: string

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
  format?: 'number' | 'currency' | 'percent'
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
  header: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (item: T) => React.ReactNode
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
    onClick: () => void
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
   * ✅ CORRECT - Define inline:
   *   useListQuery: (filters) => trpc.ats.jobs.list.useQuery({...})
   *
   * ✅ CORRECT - Use inside component:
   *   const config = useMemo(() => ({ ...jobsListConfig }), [])
   *
   * ❌ WRONG - Will cause hydration issues:
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
  getTotal?: (entity: unknown) => number
  tooltip?: string | ((entity: unknown) => string)
}

export interface SectionConfig {
  id: string
  label: string
  icon?: LucideIcon
  showCount?: boolean
  getCount?: (entity: unknown) => number
  alertOnCount?: boolean
  component: React.ComponentType<{ entityId: string; entity?: unknown }>
}

export interface JourneyStepConfig {
  id: string
  label: string
  icon?: LucideIcon
  completedStatuses: string[]
  activeStatuses: string[]
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
  subtitleFields?: Array<{
    key: keyof T
    icon?: LucideIcon
    format?: (value: unknown) => string
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
  title?: string
  description?: string
  columns?: 1 | 2 | 3
  fields: FieldDefinition[]
}

export interface FormConfig<T = unknown> {
  title?: string
  description?: string
  sections: FormSectionConfig[]
  validation?: z.ZodSchema
  submitLabel?: string
  cancelLabel?: string
  onSubmit: (data: T) => Promise<void>
  onCancel?: () => void
}
```

#### 1.2 Extract Field Utilities

**File**: `src/lib/pcf/field-renderer.ts`

```typescript
import { FieldDefinition, FieldType } from '@/configs/entities/types'

/**
 * Format a value for display based on field type
 * Extracted from editable-info-card.tsx
 */
export function formatDisplayValue(
  value: unknown,
  field: FieldDefinition
): string {
  // Handle empty values
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  // Use custom formatter if provided
  if (field.formatValue) {
    return field.formatValue(value)
  }

  switch (field.type) {
    case 'currency':
      const symbol = field.currencySymbol || '$'
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      return isNaN(numValue) ? '—' : `${symbol}${numValue.toLocaleString()}`

    case 'date':
      try {
        const date = new Date(String(value))
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      } catch {
        return String(value)
      }

    case 'checkbox':
    case 'switch':
      return value ? 'Yes' : 'No'

    case 'select':
    case 'radio':
      const option = field.options?.find((opt) => opt.value === value)
      return option?.label || String(value)

    case 'multi-select':
      if (Array.isArray(value)) {
        return value
          .map((v) => field.options?.find((opt) => opt.value === v)?.label || v)
          .join(', ')
      }
      return String(value)

    case 'phone':
      const phoneStr = String(value).replace(/\D/g, '')
      if (phoneStr.length === 10) {
        return `(${phoneStr.slice(0, 3)}) ${phoneStr.slice(3, 6)}-${phoneStr.slice(6)}`
      }
      return String(value)

    case 'url':
      return String(value).replace(/^https?:\/\//, '')

    case 'skills':
      if (Array.isArray(value)) {
        return value.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')
      }
      return String(value)

    default:
      return String(value)
  }
}

/**
 * Validate fields based on field definitions
 * Extracted from editable-info-card.tsx
 */
export function validateFields(
  fields: FieldDefinition[],
  data: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = data[field.key]

    // Required validation
    if (field.required) {
      if (value === null || value === undefined || value === '') {
        errors[field.key] = `${field.label} is required`
        continue
      }
      if (Array.isArray(value) && value.length === 0) {
        errors[field.key] = `${field.label} is required`
        continue
      }
    }

    // Skip further validation if empty and not required
    if (value === null || value === undefined || value === '') {
      continue
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          errors[field.key] = 'Please enter a valid email address'
        }
        break

      case 'url':
        try {
          new URL(String(value))
        } catch {
          errors[field.key] = 'Please enter a valid URL'
        }
        break

      case 'phone':
        const phoneDigits = String(value).replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          errors[field.key] = 'Please enter a valid phone number'
        }
        break

      case 'number':
      case 'currency':
        const numVal = typeof value === 'number' ? value : parseFloat(String(value))
        if (isNaN(numVal)) {
          errors[field.key] = 'Please enter a valid number'
        } else {
          if (field.min !== undefined && numVal < field.min) {
            errors[field.key] = `Minimum value is ${field.min}`
          }
          if (field.max !== undefined && numVal > field.max) {
            errors[field.key] = `Maximum value is ${field.max}`
          }
        }
        break
    }
  }

  return errors
}

/**
 * Check if a field should be visible based on dependencies
 */
export function isFieldVisible(
  field: FieldDefinition,
  data: Record<string, unknown>
): boolean {
  if (!field.dependsOn) return true

  const { field: dependentField, value: expectedValue, operator = 'eq' } = field.dependsOn
  const actualValue = data[dependentField]

  switch (operator) {
    case 'eq':
      return actualValue === expectedValue
    case 'neq':
      return actualValue !== expectedValue
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue)
    default:
      return true
  }
}
```

**File**: `src/lib/pcf/index.ts`

```typescript
export * from './field-renderer'
export * from '@/configs/entities/types'
```

#### 1.3 Create Shared Sub-Components

**File**: `src/components/pcf/shared/StatusBadge.tsx`

```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { StatusConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  config: Record<string, StatusConfig>
  size?: 'sm' | 'default' | 'lg'
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  status,
  config,
  size = 'default',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const statusInfo = config[status] || {
    label: status,
    color: 'bg-charcoal-100 text-charcoal-700',
  }

  const Icon = statusInfo.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  return (
    <Badge
      className={cn(
        'font-medium border gap-1.5',
        statusInfo.color,
        statusInfo.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {statusInfo.label}
    </Badge>
  )
}
```

**File**: `src/components/pcf/shared/EmptyState.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyStateConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  config: EmptyStateConfig
  filters?: Record<string, unknown>
  className?: string
  variant?: 'card' | 'inline'
}

export function EmptyState({
  config,
  filters = {},
  className,
  variant = 'card',
}: EmptyStateProps) {
  const Icon = config.icon
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== 'all'
  )

  const description =
    typeof config.description === 'function'
      ? config.description(filters)
      : config.description

  const content = (
    <div className={cn('text-center py-12', className)}>
      <Icon className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
      <h3 className="text-lg font-medium text-charcoal-900 mb-2">
        {config.title}
      </h3>
      <p className="text-charcoal-500 mb-4 max-w-md mx-auto">{description}</p>
      {config.action && !hasActiveFilters && (
        config.action.href ? (
          <Link href={config.action.href}>
            <Button>{config.action.label}</Button>
          </Link>
        ) : (
          <Button onClick={config.action.onClick}>{config.action.label}</Button>
        )
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card className="bg-white">
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  return content
}
```

**File**: `src/components/pcf/shared/QuickActionBar.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuickActionConfig } from '@/configs/entities/types'
import { MoreHorizontal } from 'lucide-react'

interface QuickActionBarProps<T> {
  entity: T
  quickActions?: QuickActionConfig[]
  dropdownActions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick?: (entity: T) => void
    href?: string
    separator?: boolean
  }>
  isLoading?: boolean
}

export function QuickActionBar<T>({
  entity,
  quickActions = [],
  dropdownActions = [],
  isLoading = false,
}: QuickActionBarProps<T>) {
  const visibleActions = quickActions.filter(
    (action) => !action.isVisible || action.isVisible(entity)
  )

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action) => {
        const Icon = action.icon
        const disabled = action.isDisabled?.(entity) || isLoading

        return (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            onClick={() => action.onClick(entity)}
            disabled={disabled}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {action.label}
          </Button>
        )
      })}

      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {dropdownActions.map((action, index) => {
              if (action.separator) {
                return <DropdownMenuSeparator key={`sep-${index}`} />
              }

              const Icon = action.icon
              return (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => action.onClick?.(entity)}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
```

**File**: `src/components/pcf/shared/index.ts`

```typescript
export { StatusBadge } from './StatusBadge'
export { EmptyState } from './EmptyState'
export { QuickActionBar } from './QuickActionBar'
export { EntityListViewSkeleton, EntityDetailViewSkeleton, EntityWizardSkeleton } from './Skeletons'
```

#### 1.4 Skeleton Loading Components

Dedicated skeleton components ensure consistent loading states across all PCF components.

**File**: `src/components/pcf/shared/Skeletons.tsx`

```typescript
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  compact?: boolean
}

/**
 * Skeleton for EntityListView
 * Shows: Header, Stats cards, Filters, List items
 */
export function EntityListViewSkeleton({ className, compact }: SkeletonProps) {
  return (
    <div className={cn('p-6', compact && 'p-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards skeleton */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-white">
            <CardContent className={cn('py-4', compact && 'py-3')}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for EntityDetailView
 * Shows: Breadcrumbs, Header, Metrics bar, Content area
 */
export function EntityDetailViewSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('', className)}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-charcoal-50 rounded-lg">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <Card className="bg-white">
        <CardContent className="py-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Skeleton for EntityWizard
 * Shows: Progress indicator, Step content, Navigation
 */
export function EntityWizardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            {i < 5 && <Skeleton className="h-1 w-24 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Form fields */}
      <Card className="bg-white mb-6">
        <CardContent className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  )
}
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] New files exist at correct paths
- [ ] Exports work: Can import from `@/lib/pcf` and `@/components/pcf/shared`

#### Manual Verification:
- [ ] `formatDisplayValue` correctly formats all 10+ field types
- [ ] `validateFields` catches required fields and type-specific errors
- [ ] `StatusBadge` renders with correct colors and icons
- [ ] `EmptyState` displays correctly in card and inline variants
- [ ] `QuickActionBar` shows/hides actions based on visibility conditions

---

### 🔄 HANDOFF OPPORTUNITY: Phase 1 Complete

**What's Done:**
- Core type definitions for all PCF components
- Field utility functions (format, validate, visibility)
- Shared sub-components (StatusBadge, EmptyState, QuickActionBar)

**What's Next:**
- Phase 2: Polymorphic Section Components (Activities, Documents, Notes)

**To Continue:** Say "continue to Phase 2" or "create handoff"

---

## Phase 2: Polymorphic Section Components

### Overview

Build three universal section components (Activities, Documents, Notes) that work with any parent entity type. These components use the polymorphic `entity_type` + `entity_id` pattern from the activities table and can be plugged into any detail page via configuration.

### Changes Required

#### 2.1 Activities Section Component

**File**: `src/components/pcf/sections/ActivitiesSection.tsx`

```typescript
'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  User,
  Video,
  Linkedin,
  ClipboardList,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { Activity } from 'lucide-react'

// Activity type icons and colors
const ACTIVITY_TYPE_CONFIG = {
  email: { icon: Mail, color: 'bg-blue-100 text-blue-600', label: 'Email' },
  call: { icon: Phone, color: 'bg-green-100 text-green-600', label: 'Call' },
  meeting: { icon: Video, color: 'bg-purple-100 text-purple-600', label: 'Meeting' },
  note: { icon: MessageSquare, color: 'bg-amber-100 text-amber-600', label: 'Note' },
  linkedin_message: { icon: Linkedin, color: 'bg-sky-100 text-sky-600', label: 'LinkedIn' },
  task: { icon: ClipboardList, color: 'bg-orange-100 text-orange-600', label: 'Task' },
  follow_up: { icon: Clock, color: 'bg-rose-100 text-rose-600', label: 'Follow-up' },
} as const

const ACTIVITY_STATUS_CONFIG = {
  scheduled: { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
  open: { color: 'bg-amber-100 text-amber-700', label: 'Open' },
  in_progress: { color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
  skipped: { color: 'bg-charcoal-100 text-charcoal-600', label: 'Skipped' },
  canceled: { color: 'bg-red-100 text-red-700', label: 'Canceled' },
} as const

interface ActivitiesSectionProps {
  entityType: string
  entityId: string
  onLogActivity?: () => void
  showInlineForm?: boolean
}

export function ActivitiesSection({
  entityType,
  entityId,
  onLogActivity,
  showInlineForm = true,
}: ActivitiesSectionProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType,
    entityId,
    limit: 50,
  })

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.listByEntity.invalidate({ entityType, entityId })
    },
  })

  const activities = activitiesQuery.data?.activities || []
  const selectedActivity = activities.find((a) => a.id === selectedActivityId)

  const handleComplete = (activityId: string) => {
    completeActivity.mutate({ id: activityId })
  }

  if (activitiesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-16 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Activity,
          title: 'No activities yet',
          description: 'Log your first activity to track interactions',
          action: onLogActivity
            ? { label: 'Log Activity', onClick: onLogActivity }
            : undefined,
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="flex gap-4">
      {/* Activity List */}
      <div
        className={cn(
          'flex-1 space-y-3 transition-all duration-300',
          selectedActivityId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
        )}
      >
        {/* Header with action */}
        {onLogActivity && (
          <div className="flex justify-end mb-4">
            <Button onClick={onLogActivity} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Log Activity
            </Button>
          </div>
        )}

        {/* Activity cards */}
        {activities.map((activity) => {
          const typeConfig = ACTIVITY_TYPE_CONFIG[activity.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]
          const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status as keyof typeof ACTIVITY_STATUS_CONFIG]
          const Icon = typeConfig?.icon || MessageSquare

          return (
            <Card
              key={activity.id}
              className={cn(
                'bg-white cursor-pointer transition-all duration-200',
                selectedActivityId === activity.id
                  ? 'ring-2 ring-gold-500 bg-gold-50/30'
                  : 'hover:shadow-sm'
              )}
              onClick={() => setSelectedActivityId(activity.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg', typeConfig?.color || 'bg-charcoal-100')}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-charcoal-900 line-clamp-1">
                          {activity.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn('text-xs', statusConfig?.color)}>
                            {statusConfig?.label || activity.status}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1">
                        {activity.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleComplete(activity.id)
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Description preview */}
                    {activity.description && (
                      <p className="text-sm text-charcoal-500 mt-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    {/* Creator */}
                    {activity.creator && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-charcoal-400">
                        <User className="w-3 h-3" />
                        {activity.creator.full_name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivityId(null)}
        title={selectedActivity?.subject || 'Activity'}
        description={ACTIVITY_TYPE_CONFIG[selectedActivity?.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
        width="md"
      >
        {selectedActivity && (
          <>
            <InlinePanelSection title="Details">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Status</span>
                  <Badge className={ACTIVITY_STATUS_CONFIG[selectedActivity.status as keyof typeof ACTIVITY_STATUS_CONFIG]?.color}>
                    {ACTIVITY_STATUS_CONFIG[selectedActivity.status as keyof typeof ACTIVITY_STATUS_CONFIG]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Type</span>
                  <span className="font-medium">
                    {ACTIVITY_TYPE_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_TYPE_CONFIG]?.label}
                  </span>
                </div>
                {selectedActivity.scheduled_at && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Scheduled</span>
                    <span className="font-medium">
                      {format(new Date(selectedActivity.scheduled_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created</span>
                  <span className="font-medium">
                    {format(new Date(selectedActivity.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </InlinePanelSection>

            {selectedActivity.description && (
              <InlinePanelSection title="Description">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                  {selectedActivity.description}
                </p>
              </InlinePanelSection>
            )}

            {selectedActivity.outcome && (
              <InlinePanelSection title="Outcome">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                  {selectedActivity.outcome}
                </p>
              </InlinePanelSection>
            )}
          </>
        )}
      </InlinePanel>
    </div>
  )
}
```

#### 2.2 Documents Section Component

**File**: `src/components/pcf/sections/DocumentsSection.tsx`

```typescript
'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Download,
  Eye,
  File,
  FileImage,
  FilePdf,
  FileSpreadsheet,
  FileText,
  Folder,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

// File type icons
const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FilePdf,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  default: File,
}

const DOCUMENT_CATEGORY_CONFIG = {
  contract: { color: 'bg-blue-100 text-blue-700', label: 'Contract' },
  resume: { color: 'bg-green-100 text-green-700', label: 'Resume' },
  proposal: { color: 'bg-purple-100 text-purple-700', label: 'Proposal' },
  invoice: { color: 'bg-amber-100 text-amber-700', label: 'Invoice' },
  report: { color: 'bg-cyan-100 text-cyan-700', label: 'Report' },
  other: { color: 'bg-charcoal-100 text-charcoal-700', label: 'Other' },
} as const

interface DocumentsSectionProps {
  entityType: string
  entityId: string
  onUpload?: () => void
}

export function DocumentsSection({
  entityType,
  entityId,
  onUpload,
}: DocumentsSectionProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  // Note: You'll need to create this tRPC procedure
  const documentsQuery = trpc.documents?.listByEntity?.useQuery(
    { entityType, entityId },
    { enabled: !!entityType && !!entityId }
  ) || { data: { documents: [] }, isLoading: false }

  const documents = documentsQuery.data?.documents || []
  const selectedDoc = documents.find((d: any) => d.id === selectedDocId)

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (documentsQuery.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-20 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Folder,
          title: 'No documents yet',
          description: 'Upload documents to keep everything organized',
          action: onUpload ? { label: 'Upload Document', onClick: onUpload } : undefined,
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="flex gap-4">
      {/* Document Grid */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          selectedDocId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
        )}
      >
        {/* Header */}
        {onUpload && (
          <div className="flex justify-end mb-4">
            <Button onClick={onUpload} size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        )}

        {/* Document cards */}
        <div className="grid grid-cols-2 gap-4">
          {documents.map((doc: any) => {
            const FileIcon = getFileIcon(doc.filename)
            const categoryConfig = DOCUMENT_CATEGORY_CONFIG[doc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]
              || DOCUMENT_CATEGORY_CONFIG.other

            return (
              <Card
                key={doc.id}
                className={cn(
                  'bg-white cursor-pointer transition-all duration-200',
                  selectedDocId === doc.id
                    ? 'ring-2 ring-gold-500 bg-gold-50/30'
                    : 'hover:shadow-sm'
                )}
                onClick={() => setSelectedDocId(doc.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {/* File icon */}
                    <div className="p-2 bg-charcoal-100 rounded-lg">
                      <FileIcon className="w-5 h-5 text-charcoal-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn('text-xs', categoryConfig.color)}>
                          {categoryConfig.label}
                        </Badge>
                        <span className="text-xs text-charcoal-500">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-400 mt-1">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDocId(null)}
        title={selectedDoc?.filename || 'Document'}
        description="Document details"
        width="md"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        }
      >
        {selectedDoc && (
          <>
            <InlinePanelSection title="File Information">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Filename</span>
                  <span className="font-medium truncate max-w-[200px]">{selectedDoc.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Size</span>
                  <span className="font-medium">{formatFileSize(selectedDoc.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Category</span>
                  <Badge className={DOCUMENT_CATEGORY_CONFIG[selectedDoc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]?.color}>
                    {DOCUMENT_CATEGORY_CONFIG[selectedDoc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Uploaded</span>
                  <span className="font-medium">
                    {format(new Date(selectedDoc.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </InlinePanelSection>

            {selectedDoc.description && (
              <InlinePanelSection title="Description">
                <p className="text-sm text-charcoal-700">{selectedDoc.description}</p>
              </InlinePanelSection>
            )}
          </>
        )}
      </InlinePanel>
    </div>
  )
}
```

#### 2.3 Notes Section Component

**File**: `src/components/pcf/sections/NotesSection.tsx`

```typescript
'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Edit,
  MoreVertical,
  Plus,
  StickyNote,
  Trash2,
  User,
  Pin,
  PinOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { toast } from '@/hooks/use-toast'

interface NotesSectionProps {
  entityType: string
  entityId: string
  onAddNote?: () => void
  showInlineForm?: boolean
}

export function NotesSection({
  entityType,
  entityId,
  onAddNote,
  showInlineForm = true,
}: NotesSectionProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')

  const utils = trpc.useUtils()

  // Note: You'll need to create this tRPC procedure or use existing notes router
  const notesQuery = trpc.notes?.listByEntity?.useQuery(
    { entityType, entityId },
    { enabled: !!entityType && !!entityId }
  ) || { data: { notes: [] }, isLoading: false }

  const createNote = trpc.notes?.create?.useMutation({
    onSuccess: () => {
      utils.notes?.listByEntity?.invalidate({ entityType, entityId })
      setNewNoteContent('')
      setIsCreating(false)
      toast({ title: 'Note added' })
    },
  })

  const deleteNote = trpc.notes?.delete?.useMutation({
    onSuccess: () => {
      utils.notes?.listByEntity?.invalidate({ entityType, entityId })
      setSelectedNoteId(null)
      toast({ title: 'Note deleted' })
    },
  })

  const notes = notesQuery.data?.notes || []
  const selectedNote = notes.find((n: any) => n.id === selectedNoteId)

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return
    createNote?.mutate({
      entityType,
      entityId,
      content: newNoteContent.trim(),
    })
  }

  if (notesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-16 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {/* Notes List */}
      <div
        className={cn(
          'flex-1 space-y-3 transition-all duration-300',
          selectedNoteId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
        )}
      >
        {/* Inline Create Form */}
        {showInlineForm && (
          <Card className="bg-white">
            <CardContent className="py-4">
              {isCreating ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false)
                        setNewNoteContent('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateNote}
                      disabled={!newNoteContent.trim() || createNote?.isPending}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full flex items-center gap-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a note...</span>
                </button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {notes.length === 0 && !isCreating && (
          <EmptyState
            config={{
              icon: StickyNote,
              title: 'No notes yet',
              description: 'Add notes to capture important information',
              action: showInlineForm
                ? { label: 'Add Note', onClick: () => setIsCreating(true) }
                : onAddNote
                  ? { label: 'Add Note', onClick: onAddNote }
                  : undefined,
            }}
            variant="inline"
          />
        )}

        {/* Note cards */}
        {notes.map((note: any) => (
          <Card
            key={note.id}
            className={cn(
              'bg-white cursor-pointer transition-all duration-200',
              selectedNoteId === note.id
                ? 'ring-2 ring-gold-500 bg-gold-50/30'
                : 'hover:shadow-sm',
              note.is_pinned && 'border-l-4 border-l-gold-500'
            )}
            onClick={() => setSelectedNoteId(note.id)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Content preview */}
                  <p className="text-charcoal-700 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-charcoal-500">
                    {note.creator && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.creator.full_name}
                      </span>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                    {note.is_pinned && (
                      <Badge variant="outline" className="text-xs">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {note.is_pinned ? (
                        <>
                          <PinOff className="w-4 h-4 mr-2" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="w-4 h-4 mr-2" />
                          Pin to top
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote?.mutate({ id: note.id })
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedNote}
        onClose={() => setSelectedNoteId(null)}
        title="Note"
        description={selectedNote?.creator?.full_name || 'Note details'}
        width="md"
        headerActions={
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        }
      >
        {selectedNote && (
          <>
            <InlinePanelSection title="Content">
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </InlinePanelSection>

            <InlinePanelSection title="Details">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created by</span>
                  <span className="font-medium">{selectedNote.creator?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Created</span>
                  <span className="font-medium">
                    {format(new Date(selectedNote.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {selectedNote.updated_at !== selectedNote.created_at && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Last updated</span>
                    <span className="font-medium">
                      {format(new Date(selectedNote.updated_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            </InlinePanelSection>
          </>
        )}
      </InlinePanel>
    </div>
  )
}
```

#### 2.4 Export Index

**File**: `src/components/pcf/sections/index.ts`

```typescript
export { ActivitiesSection } from './ActivitiesSection'
export { DocumentsSection } from './DocumentsSection'
export { NotesSection } from './NotesSection'
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] All section components export correctly from `@/components/pcf/sections`

#### Manual Verification:
- [ ] ActivitiesSection displays activities for any entity type (account, campaign, lead)
- [ ] ActivitiesSection inline panel shows activity details on click
- [ ] ActivitiesSection complete button marks activity as completed
- [ ] DocumentsSection displays documents in grid layout
- [ ] DocumentsSection inline panel shows file details
- [ ] NotesSection inline form creates new notes
- [ ] NotesSection supports pin/unpin functionality
- [ ] All sections show appropriate empty states
- [ ] Inline panels slide in/out smoothly with 300ms transition

---

### 🔄 HANDOFF OPPORTUNITY: Phase 2 Complete

**What's Done:**
- `ActivitiesSection` - Universal activities list with type icons, status badges, inline panel
- `DocumentsSection` - Universal documents grid with file type icons, categories, inline panel
- `NotesSection` - Universal notes list with inline creation, pin support, inline panel

**What's Next:**
- Phase 3: EntityListView Component

**To Continue:** Say "continue to Phase 3" or "create handoff"

---

## Phase 3: EntityListView Component

### Overview

Build the main `EntityListView` component that renders configuration-driven list pages with header, stats cards, filters, table/card rendering, empty states, and pagination. This replaces 8+ individual list implementations.

### Changes Required

#### 3.1 ListHeader Sub-Component

**File**: `src/components/pcf/list-view/ListHeader.tsx`

```typescript
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon, Plus } from 'lucide-react'

interface ListHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  primaryAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }
  secondaryActions?: Array<{
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
    variant?: 'default' | 'outline' | 'ghost'
  }>
}

export function ListHeader({
  title,
  description,
  icon: TitleIcon,
  primaryAction,
  secondaryActions = [],
}: ListHeaderProps) {
  const PrimaryIcon = primaryAction?.icon || Plus

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          {TitleIcon && (
            <div className="p-2 bg-hublot-100 rounded-lg">
              <TitleIcon className="w-6 h-6 text-hublot-900" />
            </div>
          )}
          <h1 className="text-3xl font-heading font-bold text-charcoal-900">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-charcoal-500 mt-1 ml-[52px]">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {secondaryActions.map((action, index) => {
          const ActionIcon = action.icon
          const button = (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )

          return action.href ? (
            <Link key={index} href={action.href}>
              {button}
            </Link>
          ) : (
            button
          )
        })}

        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href}>
              <Button>
                <PrimaryIcon className="w-4 h-4 mr-2" />
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={primaryAction.onClick}>
              <PrimaryIcon className="w-4 h-4 mr-2" />
              {primaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
```

#### 3.2 ListStats Sub-Component

**File**: `src/components/pcf/list-view/ListStats.tsx`

```typescript
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatCardConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ListStatsProps {
  stats: StatCardConfig[]
  data?: Record<string, number | string>
  isLoading?: boolean
  gridCols?: 4 | 5 | 6
}

export function ListStats({
  stats,
  data,
  isLoading = false,
  gridCols = 5,
}: ListStatsProps) {
  const gridClasses = {
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-6',
  }

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 mb-8', gridClasses[gridCols])}>
        {stats.map((stat) => (
          <Card key={stat.key} className="bg-white">
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 mb-8', gridClasses[gridCols])}>
      {stats.map((stat) => {
        const Icon = stat.icon
        const value = data?.[stat.key]

        // Format value based on type
        let displayValue: string
        if (value === undefined || value === null) {
          displayValue = '—'
        } else if (stat.format === 'currency') {
          displayValue = `$${Number(value).toLocaleString()}`
        } else if (stat.format === 'percent') {
          displayValue = `${value}%`
        } else {
          displayValue = String(value)
        }

        return (
          <Card key={stat.key} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-charcoal-900 tabular-nums">
                    {displayValue}
                  </div>
                  <p className="text-sm text-charcoal-500">{stat.label}</p>
                </div>
                {Icon && (
                  <div className={cn('p-2 rounded-lg', stat.color || 'bg-charcoal-100')}>
                    <Icon className="w-5 h-5 text-charcoal-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

#### 3.3 ListFilters Sub-Component

**File**: `src/components/pcf/list-view/ListFilters.tsx`

```typescript
'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FilterConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface ListFiltersProps {
  filters: FilterConfig[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  className?: string
}

export function ListFilters({
  filters,
  values,
  onChange,
  className,
}: ListFiltersProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4 mb-6', className)}>
      {filters.map((filter) => {
        switch (filter.type) {
          case 'search':
            return (
              <div key={filter.key} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  value={(values[filter.key] as string) || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="pl-10"
                />
              </div>
            )

          case 'select':
            return (
              <Select
                key={filter.key}
                value={(values[filter.key] as string) || 'all'}
                onValueChange={(value) => onChange(filter.key, value)}
              >
                <SelectTrigger className={cn('w-[180px]', filter.width)}>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )

          case 'toggle':
            return (
              <div key={filter.key} className="flex items-center gap-2">
                <Switch
                  id={filter.key}
                  checked={Boolean(values[filter.key])}
                  onCheckedChange={(checked) => onChange(filter.key, checked)}
                />
                <Label htmlFor={filter.key} className="text-sm text-charcoal-600">
                  {filter.label}
                </Label>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
```

#### 3.4 ListTable Sub-Component

**File**: `src/components/pcf/list-view/ListTable.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ColumnConfig, StatusConfig } from '@/configs/entities/types'
import { StatusBadge } from '@/components/pcf/shared/StatusBadge'
import { cn } from '@/lib/utils'

interface ListTableProps<T> {
  items: T[]
  columns: ColumnConfig<T>[]
  idField?: keyof T
  baseRoute: string
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  onRowClick?: (item: T) => void
}

export function ListTable<T extends Record<string, unknown>>({
  items,
  columns,
  idField = 'id' as keyof T,
  baseRoute,
  statusField,
  statusConfig,
  onRowClick,
}: ListTableProps<T>) {
  const router = useRouter()

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item)
    } else {
      router.push(`${baseRoute}/${item[idField]}`)
    }
  }

  const formatCellValue = (item: T, column: ColumnConfig<T>) => {
    // Custom render function takes priority
    if (column.render) {
      return column.render(item)
    }

    // Get nested value (e.g., "account.name")
    const keys = column.key.split('.')
    let value: unknown = item
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-charcoal-400">—</span>
    }

    // Format based on column type
    switch (column.format) {
      case 'date':
        try {
          return format(new Date(String(value)), 'MMM d, yyyy')
        } catch {
          return String(value)
        }

      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }

      case 'currency':
        return `$${Number(value).toLocaleString()}`

      case 'number':
        return Number(value).toLocaleString()

      case 'status':
        if (statusConfig) {
          return <StatusBadge status={String(value)} config={statusConfig} size="sm" />
        }
        return String(value)

      default:
        return String(value)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                column.width,
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={String(item[idField])}
            className="cursor-pointer hover:bg-charcoal-50 transition-colors"
            onClick={() => handleRowClick(item)}
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {formatCellValue(item, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

#### 3.5 ListCards Sub-Component

**File**: `src/components/pcf/list-view/ListCards.tsx`

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusConfig } from '@/configs/entities/types'
import { StatusBadge } from '@/components/pcf/shared/StatusBadge'
import { cn } from '@/lib/utils'
import { Building2, MapPin, Calendar, DollarSign, Users } from 'lucide-react'

interface ListCardsProps<T> {
  items: T[]
  idField?: keyof T
  baseRoute: string
  titleField: keyof T
  subtitleField?: keyof T
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  metaFields?: Array<{
    key: keyof T
    icon?: React.ComponentType<{ className?: string }>
    format?: 'date' | 'relative-date' | 'currency' | 'number'
  }>
  cardRenderer?: (item: T, onClick: () => void) => React.ReactNode
  onItemClick?: (item: T) => void
}

export function ListCards<T extends Record<string, unknown>>({
  items,
  idField = 'id' as keyof T,
  baseRoute,
  titleField,
  subtitleField,
  statusField,
  statusConfig,
  metaFields = [],
  cardRenderer,
  onItemClick,
}: ListCardsProps<T>) {
  const router = useRouter()

  const handleClick = (item: T) => {
    if (onItemClick) {
      onItemClick(item)
    } else {
      router.push(`${baseRoute}/${item[idField]}`)
    }
  }

  const formatMetaValue = (value: unknown, format?: string) => {
    if (value === null || value === undefined) return null

    switch (format) {
      case 'date':
        try {
          return new Date(String(value)).toLocaleDateString()
        } catch {
          return String(value)
        }
      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }
      case 'currency':
        return `$${Number(value).toLocaleString()}`
      case 'number':
        return Number(value).toLocaleString()
      default:
        return String(value)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        // Use custom renderer if provided
        if (cardRenderer) {
          return (
            <div key={String(item[idField])}>
              {cardRenderer(item, () => handleClick(item))}
            </div>
          )
        }

        // Default card rendering
        const status = statusField ? String(item[statusField]) : undefined
        const statusInfo = status && statusConfig ? statusConfig[status] : undefined

        return (
          <Card
            key={String(item[idField])}
            className="bg-white cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => handleClick(item)}
            onMouseEnter={() => router.prefetch(`${baseRoute}/${item[idField]}`)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-charcoal-900 truncate">
                      {String(item[titleField] || '')}
                    </h3>
                    {status && statusConfig && (
                      <StatusBadge status={status} config={statusConfig} size="sm" />
                    )}
                  </div>

                  {/* Subtitle */}
                  {subtitleField && item[subtitleField] && (
                    <p className="text-sm text-charcoal-600 mb-2">
                      {String(item[subtitleField])}
                    </p>
                  )}

                  {/* Meta fields */}
                  {metaFields.length > 0 && (
                    <div className="flex items-center gap-4 text-sm text-charcoal-500">
                      {metaFields.map((meta, index) => {
                        const value = item[meta.key]
                        const formattedValue = formatMetaValue(value, meta.format)
                        if (!formattedValue) return null

                        const Icon = meta.icon
                        return (
                          <span key={index} className="flex items-center gap-1">
                            {Icon && <Icon className="w-4 h-4" />}
                            {formattedValue}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

#### 3.6 ListPagination Sub-Component

**File**: `src/components/pcf/list-view/ListPagination.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ListPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  showingFrom: number
  showingTo: number
}

export function ListPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showingFrom,
  showingTo,
}: ListPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-charcoal-500 mt-4">
        Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-charcoal-500">
        Showing {showingFrom} to {showingTo} of {totalItems} items
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-charcoal-600 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
```

#### 3.7 Main EntityListView Component

**File**: `src/components/pcf/list-view/EntityListView.tsx`

```typescript
'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListViewConfig } from '@/configs/entities/types'
import { ListHeader } from './ListHeader'
import { ListStats } from './ListStats'
import { ListFilters } from './ListFilters'
import { ListTable } from './ListTable'
import { ListCards } from './ListCards'
import { ListPagination } from './ListPagination'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

interface EntityListViewProps<T> {
  config: ListViewConfig<T>
  initialData?: { items: T[]; total: number }
  variant?: ListViewVariant  // ← Enables page reusability (My Jobs vs All Jobs)
}

export function EntityListView<T extends Record<string, unknown>>({
  config,
  initialData,
  variant,
}: EntityListViewProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Apply variant overrides
  const effectiveTitle = variant?.title ?? config.title
  const effectiveDescription = variant?.description ?? config.description
  const effectivePageSize = variant?.pageSize ?? config.pageSize ?? 50
  const showStats = !variant?.hideStats && config.statsCards?.length
  const showHeader = !variant?.hideHeader
  const showPrimaryAction = !variant?.hidePrimaryAction

  // Filter out hidden filters
  const effectiveFilters = variant?.hideFilters
    ? config.filters?.filter(f => !variant.hideFilters?.includes(f.key))
    : config.filters

  // Parse URL params for filters (including preset filters from variant)
  const getFilterValues = useCallback(() => {
    const values: Record<string, unknown> = {
      ...variant?.presetFilters,  // ← Apply preset filters first
    }
    config.filters?.forEach((filter) => {
      const paramValue = searchParams.get(filter.key)
      if (paramValue !== null) {
        if (filter.type === 'toggle') {
          values[filter.key] = paramValue === 'true'
        } else {
          values[filter.key] = paramValue
        }
      }
    })
    return values
  }, [config.filters, searchParams, variant?.presetFilters])

  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(getFilterValues)

  // Current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1')
  const pageSize = config.pageSize || 50

  // Update URL when filters change
  const updateFilters = useCallback((key: string, value: unknown) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === undefined || value === '' || value === 'all' || value === false) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }

      // Reset to page 1 when filters change
      params.delete('page')

      router.replace(`?${params.toString()}`)
    })

    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }, [router, searchParams])

  // Data fetching via config hook
  const listQuery = config.useListQuery({
    ...filterValues,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  })

  const statsQuery = config.useStatsQuery?.()

  // Calculate pagination
  const items = listQuery.data?.items || initialData?.items || []
  const total = listQuery.data?.total || initialData?.total || 0
  const totalPages = Math.ceil(total / pageSize)
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = Math.min(currentPage * pageSize, total)

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="p-6">
      {/* Header (respects variant.hideHeader and variant.hidePrimaryAction) */}
      {showHeader && (
        <ListHeader
          title={effectiveTitle}
          description={effectiveDescription}
          icon={config.icon}
          primaryAction={showPrimaryAction ? config.primaryAction : undefined}
        />
      )}

      {/* Stats (respects variant.hideStats) */}
      {showStats && (
        <ListStats
          stats={config.statsCards!}
          data={statsQuery?.data}
          isLoading={statsQuery?.isLoading}
          gridCols={config.statsCards!.length <= 4 ? 4 : 5}
        />
      )}

      {/* Filters (respects variant.hideFilters) */}
      {effectiveFilters && effectiveFilters.length > 0 && (
        <ListFilters
          filters={effectiveFilters}
          values={filterValues}
          onChange={updateFilters}
        />
      )}

      {/* Content */}
      {listQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState config={config.emptyState} filters={filterValues} />
      ) : config.renderMode === 'table' && config.columns ? (
        <ListTable
          items={items}
          columns={config.columns}
          baseRoute={config.baseRoute}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
        />
      ) : (
        <ListCards
          items={items}
          baseRoute={config.baseRoute}
          titleField={config.columns?.[0]?.key as keyof T || 'name' as keyof T}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
          cardRenderer={config.cardRenderer}
        />
      )}

      {/* Pagination */}
      {!listQuery.isLoading && items.length > 0 && (
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />
      )}
    </div>
  )
}
```

#### 3.8 Export Index

**File**: `src/components/pcf/list-view/index.ts`

```typescript
export { EntityListView } from './EntityListView'
export { ListHeader } from './ListHeader'
export { ListStats } from './ListStats'
export { ListFilters } from './ListFilters'
export { ListTable } from './ListTable'
export { ListCards } from './ListCards'
export { ListPagination } from './ListPagination'
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] All components export correctly from `@/components/pcf/list-view`

#### Manual Verification:
- [ ] EntityListView renders header with title and primary action
- [ ] Stats cards show correct values from query data
- [ ] Search filter updates URL and triggers query
- [ ] Select filters work with "all" option
- [ ] Table mode renders with clickable rows
- [ ] Card mode renders with hover effects
- [ ] Empty state shows when no items
- [ ] Pagination navigates between pages
- [ ] URL state persists on page refresh
- [ ] Loading states show skeleton UI

---

### 🔄 HANDOFF OPPORTUNITY: Phase 3 Complete

**What's Done:**
- `EntityListView` - Main configuration-driven list component
- Sub-components: ListHeader, ListStats, ListFilters, ListTable, ListCards, ListPagination
- URL-based filter state management
- Table and Card rendering modes
- Pagination with page size support

**What's Next:**
- Phase 4: EntityDetailView Component

**To Continue:** Say "continue to Phase 4" or "create handoff"

---

## Phase 4: EntityDetailView Component

### Overview

Build the main `EntityDetailView` component that renders configuration-driven detail pages with header, metrics bar, section/journey navigation, and quick actions. Supports both section-based (accounts, campaigns) and journey-based (jobs, submissions) navigation modes.

### Changes Required

#### 4.1 DetailHeader Sub-Component

**File**: `src/components/pcf/detail-view/DetailHeader.tsx`

```typescript
'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusConfig, QuickActionConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface SubtitleField<T> {
  key: keyof T
  icon?: React.ComponentType<{ className?: string }>
  format?: (value: unknown) => string
}

interface DropdownAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: (entity: T) => void
  href?: string
  separator?: boolean
  variant?: 'default' | 'destructive'
}

interface DetailHeaderProps<T> {
  entity: T
  titleField: keyof T
  subtitleFields?: SubtitleField<T>[]
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  breadcrumbs?: Array<{ label: string; href: string }>
  quickActions?: QuickActionConfig[]
  dropdownActions?: DropdownAction<T>[]
  isLoading?: boolean
}

export function DetailHeader<T extends Record<string, unknown>>({
  entity,
  titleField,
  subtitleFields = [],
  statusField,
  statusConfig,
  breadcrumbs = [],
  quickActions = [],
  dropdownActions = [],
  isLoading = false,
}: DetailHeaderProps<T>) {
  const title = entity[titleField] as string
  const status = statusField ? (entity[statusField] as string) : undefined
  const statusInfo = status && statusConfig ? statusConfig[status] : undefined

  const visibleActions = quickActions.filter(
    (action) => !action.isVisible || action.isVisible(entity)
  )

  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <Link
                    href={crumb.href}
                    className="text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-charcoal-300">/</span>
                  )}
                </div>
              ))}
              <span className="text-charcoal-300">/</span>
              <span className="text-sm text-charcoal-700 truncate max-w-[200px]">
                {title}
              </span>
            </div>
          )}

          {/* Title + Status Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
              {title}
            </h1>
            {statusInfo && (
              <Badge
                className={cn(
                  'gap-1.5 font-medium border',
                  statusInfo.bgColor || statusInfo.color
                )}
              >
                {statusInfo.icon && <statusInfo.icon className="w-3.5 h-3.5" />}
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Meta Info Row */}
          {subtitleFields.length > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500 flex-wrap">
              {subtitleFields.map((field) => {
                const value = entity[field.key]
                if (!value) return null

                const Icon = field.icon
                const displayValue = field.format
                  ? field.format(value)
                  : value instanceof Date
                    ? format(value, 'MMM d, yyyy')
                    : String(value)

                return (
                  <span key={String(field.key)} className="flex items-center gap-1.5">
                    {Icon && <Icon className="w-4 h-4" />}
                    {displayValue}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {visibleActions.map((action) => {
            const Icon = action.icon
            const disabled = action.isDisabled?.(entity) || isLoading

            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                onClick={() => action.onClick(entity)}
                disabled={disabled}
              >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )
          })}

          {/* Dropdown Menu */}
          {dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {dropdownActions.map((action, index) => {
                  if (action.separator) {
                    return <DropdownMenuSeparator key={`sep-${index}`} />
                  }

                  const Icon = action.icon
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={() => action.onClick?.(entity)}
                      className={cn(action.variant === 'destructive' && 'text-red-600')}
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 4.2 DetailMetrics Sub-Component

**File**: `src/components/pcf/detail-view/DetailMetrics.tsx`

```typescript
'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MetricConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailMetricsProps<T> {
  entity: T
  metrics: MetricConfig[]
  progressBar?: {
    label: string
    getValue: (entity: T) => number
    getMax: (entity: T) => number
  }
}

export function DetailMetrics<T>({
  entity,
  metrics,
  progressBar,
}: DetailMetricsProps<T>) {
  if (metrics.length === 0) return null

  const progress = progressBar
    ? Math.min(
        Math.round(
          (progressBar.getValue(entity) / progressBar.getMax(entity)) * 100
        ),
        100
      )
    : null

  return (
    <div className="px-6 py-3 bg-charcoal-50/50 border-t border-charcoal-100">
      <div className="flex items-center justify-between gap-6">
        {/* Metrics */}
        <div className="flex items-center gap-6 flex-wrap">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const value = metric.getValue(entity)
            const total = metric.getTotal?.(entity)
            const tooltip =
              typeof metric.tooltip === 'function'
                ? metric.tooltip(entity)
                : metric.tooltip

            return (
              <div key={metric.key} className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <div className={cn('p-1.5 rounded-md', metric.iconBg)}>
                          <Icon className={cn('w-4 h-4', metric.iconColor)} />
                        </div>
                        <div>
                          <div className="text-xs text-charcoal-500">
                            {metric.label}
                          </div>
                          <div className="text-sm font-semibold tabular-nums">
                            {value}
                            {total !== undefined && (
                              <span className="text-charcoal-400 font-normal ml-1">
                                / {total}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {tooltip && (
                      <TooltipContent side="bottom">
                        <p className="text-sm">{tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Divider */}
                {index < metrics.length - 1 && (
                  <div className="h-8 w-px bg-charcoal-200 ml-6" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        {progressBar && progress !== null && (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-charcoal-500">{progressBar.label}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    progress >= 100
                      ? 'bg-emerald-500'
                      : progress >= 75
                        ? 'bg-blue-500'
                        : progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-charcoal-400'
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 4.3 DetailSections Sub-Component

**File**: `src/components/pcf/detail-view/DetailSections.tsx`

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SectionConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailSectionsProps<T> {
  sections: SectionConfig[]
  currentSection: string
  entity?: T
  entityId: string
}

export function DetailSections<T>({
  sections,
  currentSection,
  entity,
  entityId,
}: DetailSectionsProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSectionClick = (sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sectionId === sections[0]?.id) {
      params.delete('section')
    } else {
      params.set('section', sectionId)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="border-b border-charcoal-200 px-6">
      <div className="flex gap-1">
        {sections.map((section) => {
          const isActive = currentSection === section.id
          const Icon = section.icon
          const count = section.getCount?.(entity)

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionClick(section.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                isActive
                  ? 'text-charcoal-900 border-gold-500'
                  : 'text-charcoal-500 border-transparent hover:text-charcoal-700 hover:border-charcoal-200'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {section.label}
              {section.showCount && count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                    section.alertOnCount && count > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

#### 4.4 DetailJourney Sub-Component

**File**: `src/components/pcf/detail-view/DetailJourney.tsx`

```typescript
'use client'

import { Check } from 'lucide-react'
import { JourneyStepConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailJourneyProps<T> {
  steps: JourneyStepConfig[]
  entity: T
  statusField: keyof T
  onStepClick?: (stepId: string) => void
}

export function DetailJourney<T extends Record<string, unknown>>({
  steps,
  entity,
  statusField,
  onStepClick,
}: DetailJourneyProps<T>) {
  const currentStatus = entity[statusField] as string

  const getStepState = (step: JourneyStepConfig) => {
    if (step.completedStatuses.includes(currentStatus)) return 'completed'
    if (step.activeStatuses.includes(currentStatus)) return 'active'
    return 'future'
  }

  return (
    <div className="px-6 py-4 border-b border-charcoal-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step)
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={state === 'future'}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                  'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                  state === 'completed' && 'bg-hublot-700 text-white cursor-pointer',
                  state === 'active' && 'bg-hublot-900 text-white shadow-lg',
                  state === 'future' && 'bg-charcoal-200 text-charcoal-500 cursor-not-allowed'
                )}
              >
                {state === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              <span
                className={cn(
                  'ml-3 text-sm font-medium hidden lg:block',
                  state === 'active' ? 'text-charcoal-900' : 'text-charcoal-500'
                )}
              >
                {step.label}
              </span>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    state === 'completed' ? 'bg-hublot-700' : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

#### 4.5 Main EntityDetailView Component

**File**: `src/components/pcf/detail-view/EntityDetailView.tsx`

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { DetailViewConfig, SectionConfig } from '@/configs/entities/types'
import { DetailHeader } from './DetailHeader'
import { DetailMetrics } from './DetailMetrics'
import { DetailSections } from './DetailSections'
import { DetailJourney } from './DetailJourney'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface EntityDetailViewProps<T> {
  config: DetailViewConfig<T>
  entityId: string
  entity?: T // Optional server-fetched data via EntityContextProvider
}

export function EntityDetailView<T extends Record<string, unknown>>({
  config,
  entityId,
  entity: serverEntity,
}: EntityDetailViewProps<T>) {
  const searchParams = useSearchParams()
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({})

  // Get current section from URL
  const currentSection =
    searchParams.get('section') || config.defaultSection || config.sections?.[0]?.id || 'overview'

  // Use server data or fetch client-side
  const entityQuery = config.useEntityQuery(entityId)
  const entity = serverEntity || entityQuery.data
  const isLoading = !serverEntity && entityQuery.isLoading

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setIsHeaderSticky(rect.top <= 0)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Event listeners for sidebar communication
  useEffect(() => {
    if (!config.eventNamespace) return

    const handleOpenDialog = (e: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = e.detail
      if (config.dialogHandlers?.[dialogId]) {
        setDialogStates((prev) => ({ ...prev, [dialogId]: true }))
      }
    }

    const eventName = `open${config.eventNamespace.charAt(0).toUpperCase()}${config.eventNamespace.slice(1)}Dialog`
    window.addEventListener(eventName, handleOpenDialog as EventListener)

    return () => {
      window.removeEventListener(eventName, handleOpenDialog as EventListener)
    }
  }, [config.eventNamespace, config.dialogHandlers])

  // Render current section
  const renderSection = () => {
    if (!entity || !config.sections) return null

    const section = config.sections.find((s) => s.id === currentSection) || config.sections[0]
    if (!section) return null

    const SectionComponent = section.component
    return <SectionComponent entityId={entityId} entity={entity} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="px-6 py-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="px-6 py-3 bg-charcoal-50/50">
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-32" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!entity) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-charcoal-500">Entity not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header Container */}
      <div
        ref={headerRef}
        className={cn(
          'sticky top-0 z-20 bg-white transition-shadow duration-200',
          isHeaderSticky && 'shadow-md border-b border-charcoal-100'
        )}
      >
        {/* Header */}
        <DetailHeader
          entity={entity}
          titleField={config.titleField}
          subtitleFields={config.subtitleFields}
          statusField={config.statusField}
          statusConfig={config.statusConfig}
          breadcrumbs={config.breadcrumbs}
          quickActions={config.quickActions}
          dropdownActions={config.dropdownActions}
        />

        {/* Metrics Bar */}
        {config.metrics && config.metrics.length > 0 && (
          <DetailMetrics
            entity={entity}
            metrics={config.metrics}
            progressBar={config.showProgressBar}
          />
        )}

        {/* Navigation */}
        {config.navigationMode === 'sections' && config.sections && (
          <DetailSections
            sections={config.sections}
            currentSection={currentSection}
            entity={entity}
            entityId={entityId}
          />
        )}

        {config.navigationMode === 'journey' && config.journeySteps && config.statusField && (
          <DetailJourney
            steps={config.journeySteps}
            entity={entity}
            statusField={config.statusField}
          />
        )}
      </div>

      {/* Section Content */}
      <div className="flex-1 px-6 py-6 bg-charcoal-50/30">
        {renderSection()}
      </div>

      {/* Dialog Handlers - render based on dialogStates */}
      {Object.entries(dialogStates).map(([dialogId, isOpen]) => {
        if (!isOpen || !config.dialogHandlers?.[dialogId]) return null
        // Dialogs would be rendered here based on config
        return null
      })}
    </div>
  )
}
```

#### 4.6 Export Index

**File**: `src/components/pcf/detail-view/index.ts`

```typescript
export { EntityDetailView } from './EntityDetailView'
export { DetailHeader } from './DetailHeader'
export { DetailMetrics } from './DetailMetrics'
export { DetailSections } from './DetailSections'
export { DetailJourney } from './DetailJourney'
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] All components export correctly from `@/components/pcf/detail-view`

#### Manual Verification:
- [ ] DetailHeader renders breadcrumbs, title, status badge, meta info
- [ ] DetailHeader quick actions trigger correct handlers
- [ ] DetailHeader dropdown menu shows all actions
- [ ] DetailMetrics displays KPIs with tooltips on hover
- [ ] DetailMetrics progress bar animates smoothly (300ms)
- [ ] DetailSections tabs update URL `?section=X`
- [ ] DetailSections shows counts with optional alert styling
- [ ] DetailJourney shows completed/current/future states correctly
- [ ] DetailJourney step click navigation works (for completed steps)
- [ ] EntityDetailView sticky header adds shadow on scroll
- [ ] EntityDetailView lazy renders only active section
- [ ] EntityDetailView event system receives sidebar events

---

### 🔄 HANDOFF OPPORTUNITY: Phase 4 Complete

**What's Done:**
- `EntityDetailView` - Main configuration-driven detail page orchestrator
- `DetailHeader` - Breadcrumbs, title, status, meta info, quick actions, dropdown
- `DetailMetrics` - Sticky metrics bar with tooltips and progress bar
- `DetailSections` - Tab-based navigation with URL state
- `DetailJourney` - Step-based workflow visualization

**What's Next:**
- Phase 5: EntityWizard Component

**To Continue:** Say "continue to Phase 5" or "create handoff"

---

## Phase 5: EntityWizard Component

### Overview

Build a configuration-driven multi-step wizard component with URL-based navigation, Zustand store integration, per-step validation, and review step support. Replaces Job Intake and Account Onboarding wizards.

### Changes Required

#### 5.1 WizardProgress Sub-Component

**File**: `src/components/pcf/wizard/WizardProgress.tsx`

```typescript
'use client'

import { Check } from 'lucide-react'
import { WizardStepConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface WizardProgressProps<T> {
  steps: WizardStepConfig<T>[]
  currentStep: number
  style?: 'numbers' | 'icons'
  allowFreeNavigation?: boolean
  onStepClick: (step: number) => void
}

export function WizardProgress<T>({
  steps,
  currentStep,
  style = 'numbers',
  allowFreeNavigation = false,
  onStepClick,
}: WizardProgressProps<T>) {
  const handleStepClick = (stepNumber: number) => {
    if (allowFreeNavigation) {
      // Allow clicking any step
      onStepClick(stepNumber)
    } else {
      // Only allow clicking completed or current step
      if (stepNumber <= currentStep) {
        onStepClick(stepNumber)
      }
    }
  }

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isFuture = stepNumber > currentStep
        const isClickable = allowFreeNavigation || stepNumber <= currentStep

        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => handleStepClick(stepNumber)}
              disabled={!isClickable && !allowFreeNavigation}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                isCurrent && 'bg-hublot-900 text-white shadow-lg',
                isCompleted && 'bg-hublot-700 text-white cursor-pointer',
                isFuture && !allowFreeNavigation && 'bg-charcoal-200 text-charcoal-500 cursor-not-allowed',
                isFuture && allowFreeNavigation && 'bg-charcoal-200 text-charcoal-500 cursor-pointer hover:bg-charcoal-300'
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : style === 'icons' && Icon ? (
                <Icon className="w-5 h-5" />
              ) : (
                stepNumber
              )}
            </button>

            {/* Step Label (visible on larger screens) */}
            <span
              className={cn(
                'ml-2 text-sm font-medium hidden sm:block max-w-[100px] truncate',
                isCurrent ? 'text-charcoal-900' : 'text-charcoal-500'
              )}
            >
              {step.label}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors',
                  isCompleted ? 'bg-hublot-700' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

#### 5.2 WizardNavigation Sub-Component

**File**: `src/components/pcf/wizard/WizardNavigation.tsx`

```typescript
'use client'

import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  onCancel: () => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitLabel?: string
  saveDraftLabel?: string
  cancelRoute?: string
  showSaveDraft?: boolean
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Submit',
  saveDraftLabel = 'Save Draft',
  showSaveDraft = true,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      {/* Left Side: Back + Save Draft */}
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        {showSaveDraft && (
          <Button type="button" variant="ghost" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            {saveDraftLabel}
          </Button>
        )}
      </div>

      {/* Right Side: Cancel + Next/Submit */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        {!isLastStep ? (
          <Button type="button" onClick={onNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-hublot-900 hover:bg-hublot-800"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
```

#### 5.3 WizardStep Sub-Component

**File**: `src/components/pcf/wizard/WizardStep.tsx`

```typescript
'use client'

import { FieldDefinition, WizardStepConfig } from '@/configs/entities/types'
import { FormFieldRenderer } from '@/components/pcf/form/FormFieldRenderer'
import { cn } from '@/lib/utils'

interface WizardStepProps<T> {
  step: WizardStepConfig<T>
  formData: Partial<T>
  setFormData: (data: Partial<T>) => void
  errors: Record<string, string>
}

export function WizardStep<T extends Record<string, unknown>>({
  step,
  formData,
  setFormData,
  errors,
}: WizardStepProps<T>) {
  // If step has a custom component, render it
  if (step.component) {
    const CustomComponent = step.component
    return <CustomComponent formData={formData} setFormData={setFormData} errors={errors} />
  }

  // Otherwise, render fields from step.fields
  if (!step.fields || step.fields.length === 0) {
    return (
      <div className="text-center py-12 text-charcoal-500">
        No fields configured for this step
      </div>
    )
  }

  // Group fields by section if specified
  const fieldsBySection = step.fields.reduce<Record<string, FieldDefinition[]>>(
    (acc, field) => {
      const section = field.section || 'default'
      if (!acc[section]) acc[section] = []
      acc[section].push(field)
      return acc
    },
    {}
  )

  const sections = Object.entries(fieldsBySection)

  return (
    <div className="space-y-6">
      {/* Step Description */}
      {step.description && (
        <p className="text-charcoal-600 mb-6">{step.description}</p>
      )}

      {/* Fields */}
      {sections.map(([sectionName, fields]) => (
        <div key={sectionName} className="space-y-4">
          {sectionName !== 'default' && (
            <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider pt-4 border-t">
              {sectionName}
            </h3>
          )}
          <div
            className={cn(
              'grid gap-4',
              fields.some((f) => f.columns === 1)
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn(field.columns === 1 && 'md:col-span-2')}
              >
                <FormFieldRenderer
                  field={field}
                  value={formData[field.key as keyof T]}
                  onChange={(value) =>
                    setFormData({ ...formData, [field.key]: value } as Partial<T>)
                  }
                  error={errors[field.key]}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 5.4 WizardReview Sub-Component

**File**: `src/components/pcf/wizard/WizardReview.tsx`

```typescript
'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldDefinition } from '@/configs/entities/types'
import { formatDisplayValue } from '@/lib/pcf/field-renderer'

interface ReviewSection<T> {
  label: string
  fields: (keyof T)[]
  stepNumber?: number // For "Edit" link
}

interface WizardReviewProps<T> {
  title: string
  sections: ReviewSection<T>[]
  formData: T
  fieldDefinitions: FieldDefinition[]
  onEditStep: (step: number) => void
}

export function WizardReview<T extends Record<string, unknown>>({
  title,
  sections,
  formData,
  fieldDefinitions,
  onEditStep,
}: WizardReviewProps<T>) {
  const getFieldDefinition = (key: keyof T) =>
    fieldDefinitions.find((f) => f.key === String(key))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-charcoal-900">
        {title}
      </h2>
      <p className="text-charcoal-600">
        Please review the information below before submitting.
      </p>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.label} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{section.label}</CardTitle>
              {section.stepNumber && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditStep(section.stepNumber!)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((fieldKey) => {
                  const fieldDef = getFieldDefinition(fieldKey)
                  const value = formData[fieldKey]
                  const displayValue = fieldDef
                    ? formatDisplayValue(value, fieldDef)
                    : String(value ?? '—')

                  return (
                    <div key={String(fieldKey)} className="space-y-1">
                      <dt className="text-sm text-charcoal-500">
                        {fieldDef?.label || String(fieldKey)}
                      </dt>
                      <dd className="text-sm font-medium text-charcoal-900">
                        {displayValue}
                      </dd>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### 5.5 Main EntityWizard Component

**File**: `src/components/pcf/wizard/EntityWizard.tsx`

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { WizardConfig, FieldDefinition } from '@/configs/entities/types'
import { WizardProgress } from './WizardProgress'
import { WizardStep } from './WizardStep'
import { WizardNavigation } from './WizardNavigation'
import { WizardReview } from './WizardReview'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface EntityWizardProps<T> {
  config: WizardConfig<T>
  store: {
    formData: T
    setFormData: (data: Partial<T>) => void
    resetForm: () => void
    isDirty: boolean
    lastSaved: Date | null
  }
  onCancel?: () => void
}

export function EntityWizard<T extends Record<string, unknown>>({
  config,
  store,
  onCancel,
}: EntityWizardProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current step from URL
  const stepParam = searchParams.get('step')
  const totalSteps = config.steps.length + (config.reviewStep ? 1 : 0)
  const currentStep = stepParam
    ? Math.min(Math.max(parseInt(stepParam), 1), totalSteps)
    : 1

  const isReviewStep = config.reviewStep && currentStep === totalSteps

  // Navigate to step
  const navigateToStep = useCallback(
    (step: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', step.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const stepConfig = config.steps[step - 1]
      if (!stepConfig) return true

      const errors: Record<string, string> = {}

      // Zod schema validation
      if (stepConfig.validation) {
        const result = stepConfig.validation.safeParse(store.formData)
        if (!result.success) {
          result.error.errors.forEach((err) => {
            const path = err.path.join('.')
            errors[path] = err.message
          })
        }
      }

      // Custom validation function
      if (stepConfig.validateFn) {
        const customErrors = stepConfig.validateFn(store.formData)
        customErrors.forEach((error, index) => {
          errors[`custom_${index}`] = error
        })
      }

      // Required field validation from field definitions
      if (stepConfig.fields) {
        stepConfig.fields.forEach((field) => {
          if (field.required) {
            const value = store.formData[field.key as keyof T]
            if (value === null || value === undefined || value === '') {
              errors[field.key] = `${field.label} is required`
            }
            if (Array.isArray(value) && value.length === 0) {
              errors[field.key] = `${field.label} is required`
            }
          }
        })
      }

      setValidationErrors(errors)

      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0]
        toast({
          title: 'Validation Error',
          description: firstError,
          variant: 'destructive',
        })
        return false
      }

      return true
    },
    [config.steps, store.formData]
  )

  // Handlers
  const handleNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < totalSteps) {
      navigateToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      navigateToStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    if (config.allowFreeNavigation) {
      navigateToStep(step)
    } else {
      // Only allow clicking completed or current step
      if (step <= currentStep) {
        navigateToStep(step)
      } else if (step === currentStep + 1 && validateStep(currentStep)) {
        navigateToStep(step)
      }
    }
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const handleCancel = () => {
    if (
      store.isDirty &&
      !confirm('Are you sure you want to cancel? Your progress will be lost.')
    ) {
      return
    }
    store.resetForm()
    if (onCancel) {
      onCancel()
    } else if (config.cancelRoute) {
      router.push(config.cancelRoute)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps before submit
    for (let i = 1; i <= config.steps.length; i++) {
      if (!validateStep(i)) {
        navigateToStep(i)
        return
      }
    }

    setIsSubmitting(true)
    try {
      const result = await config.onSubmit(store.formData)
      store.resetForm()
      config.onSuccess?.(result)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get all field definitions for review step
  const allFieldDefinitions: FieldDefinition[] = config.steps.flatMap(
    (step) => step.fields || []
  )

  // Current step config
  const currentStepConfig = isReviewStep ? null : config.steps[currentStep - 1]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-heading font-bold text-charcoal-900">
          {config.title}
        </h1>
        {config.description && (
          <p className="text-charcoal-600 mt-2">{config.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      <WizardProgress
        steps={config.steps}
        currentStep={currentStep}
        style={config.stepIndicatorStyle}
        allowFreeNavigation={config.allowFreeNavigation}
        onStepClick={handleStepClick}
      />

      {/* Auto-save Indicator */}
      {store.lastSaved && store.isDirty && (
        <p className="text-sm text-charcoal-500 text-center mb-4">
          <Save className="w-3 h-3 inline mr-1" />
          Auto-saved {new Date(store.lastSaved).toLocaleTimeString()}
        </p>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-600">
            {Object.entries(validationErrors)
              .filter(([key]) => !key.startsWith('custom_'))
              .map(([key, error]) => (
                <li key={key}>{error}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle>
            {isReviewStep
              ? config.reviewStep?.title || 'Review'
              : currentStepConfig?.label}
          </CardTitle>
          {currentStepConfig?.description && (
            <CardDescription>{currentStepConfig.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isReviewStep && config.reviewStep ? (
            <WizardReview
              title={config.reviewStep.title}
              sections={config.reviewStep.sections.map((s) => ({
                label: s.label,
                fields: s.fields,
              }))}
              formData={store.formData}
              fieldDefinitions={allFieldDefinitions}
              onEditStep={navigateToStep}
            />
          ) : currentStepConfig ? (
            <WizardStep
              step={currentStepConfig}
              formData={store.formData}
              setFormData={store.setFormData}
              errors={validationErrors}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={config.submitLabel}
        saveDraftLabel={config.saveDraftLabel}
      />
    </div>
  )
}
```

#### 5.6 FormFieldRenderer Sub-Component

**File**: `src/components/pcf/form/FormFieldRenderer.tsx`

```typescript
'use client'

import { DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldDefinition } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface FormFieldRendererProps {
  field: FieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  error?: string
  disabled?: boolean
}

export function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: FormFieldRendererProps) {
  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={onChange}
            disabled={disabled || field.readOnly}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multi-select':
        // Multi-select would need a custom component
        return (
          <Select
            value={(value as string[])?.join(',') || ''}
            onValueChange={(v) => onChange(v.split(',').filter(Boolean))}
            disabled={disabled || field.readOnly}
          >
            <SelectTrigger className={cn(error && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'textarea':
      case 'rich-text':
        return (
          <Textarea
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled || field.readOnly}
            className={cn('min-h-[80px]', error && 'border-red-500')}
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={disabled || field.readOnly}
            />
            {field.description && (
              <Label htmlFor={field.key} className="text-sm text-charcoal-600">
                {field.description}
              </Label>
            )}
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={disabled || field.readOnly}
            />
            {field.description && (
              <Label htmlFor={field.key} className="text-sm text-charcoal-600">
                {field.description}
              </Label>
            )}
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value as number ?? ''}
            onChange={(e) =>
              onChange(e.target.value === '' ? null : parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              type="number"
              value={value as number ?? ''}
              onChange={(e) =>
                onChange(e.target.value === '' ? null : parseFloat(e.target.value))
              }
              placeholder={field.placeholder || '0.00'}
              min={field.min || 0}
              step={field.step || 0.01}
              disabled={disabled || field.readOnly}
              className={cn('pl-10', error && 'border-red-500')}
            />
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={
              value
                ? new Date(value as string | number).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'email':
        return (
          <Input
            type="email"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'email@example.com'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '(555) 123-4567'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'https://example.com'}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled || field.readOnly}
            className={cn(error && 'border-red-500')}
          />
        )
    }
  }

  // Don't render label for checkbox/switch (label is inline)
  if (field.type === 'checkbox' || field.type === 'switch') {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-charcoal-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {renderInput()}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={field.key} className="text-sm font-medium text-charcoal-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {field.description && !error && (
        <p className="text-sm text-charcoal-500">{field.description}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

#### 5.7 Export Index

**File**: `src/components/pcf/wizard/index.ts`

```typescript
export { EntityWizard } from './EntityWizard'
export { WizardProgress } from './WizardProgress'
export { WizardStep } from './WizardStep'
export { WizardNavigation } from './WizardNavigation'
export { WizardReview } from './WizardReview'
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] All components export correctly from `@/components/pcf/wizard`

#### Manual Verification:
- [ ] WizardProgress shows numbered circles with completed/current/future states
- [ ] WizardProgress icon mode works when `stepIndicatorStyle: 'icons'`
- [ ] WizardProgress click navigation respects `allowFreeNavigation`
- [ ] WizardNavigation shows correct buttons per step (no Back on step 1, Submit on last)
- [ ] WizardStep renders fields from config
- [ ] WizardStep renders custom component when provided
- [ ] WizardReview displays all form data with edit links
- [ ] EntityWizard validates step before navigation
- [ ] EntityWizard shows validation errors with toast
- [ ] EntityWizard auto-save indicator shows timestamp
- [ ] EntityWizard URL tracks current step `?step=N`
- [ ] EntityWizard browser back/forward works
- [ ] EntityWizard submit calls `config.onSubmit` and resets form

---

### 🔄 HANDOFF OPPORTUNITY: Phase 5 Complete

**What's Done:**
- `EntityWizard` - Main configuration-driven wizard orchestrator
- `WizardProgress` - Step indicator with numbers/icons support
- `WizardStep` - Step content with field rendering or custom component
- `WizardNavigation` - Back/Next/Submit/Cancel/SaveDraft buttons
- `WizardReview` - Review step with section summaries and edit links
- `FormFieldRenderer` - Universal field renderer for all field types

**What's Next:**
- Phase 6: EntityForm Component

**To Continue:** Say "continue to Phase 6" or "create handoff"

---

## Phase 6: EntityForm Component

### Overview

Build a simple single-step form component for quick entity creation/editing. Uses the same field rendering as wizards (FormFieldRenderer from Phase 5) but without step navigation. Ideal for dialogs, inline forms, and quick-edit panels.

### Changes Required

#### 6.1 FormSection Sub-Component

**File**: `src/components/pcf/form/FormSection.tsx`

```typescript
'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { FieldDefinition } from '@/configs/entities/types'
import { FormFieldRenderer } from './FormFieldRenderer'
import { cn } from '@/lib/utils'

interface FormSectionProps<T> {
  title?: string
  description?: string
  fields: FieldDefinition[]
  formData: T
  onChange: (key: string, value: unknown) => void
  errors: Record<string, string>
  columns?: 1 | 2 | 3
  collapsible?: boolean
  defaultCollapsed?: boolean
  disabled?: boolean
}

export function FormSection<T extends Record<string, unknown>>({
  title,
  description,
  fields,
  formData,
  onChange,
  errors,
  columns = 2,
  collapsible = false,
  defaultCollapsed = false,
  disabled = false,
}: FormSectionProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Filter visible fields based on conditional visibility
  const visibleFields = fields.filter((field) => {
    if (!field.visibleWhen) return true
    return field.visibleWhen(formData)
  })

  if (visibleFields.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Section Header */}
      {title && (
        <div
          className={cn(
            'flex items-center justify-between border-b border-charcoal-100 pb-2',
            collapsible && 'cursor-pointer hover:text-charcoal-700'
          )}
          onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
          role={collapsible ? 'button' : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={(e) => {
            if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setIsCollapsed(!isCollapsed)
            }
          }}
        >
          <div>
            <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-charcoal-500 mt-0.5">{description}</p>
            )}
          </div>
          {collapsible && (
            <ChevronDown
              className={cn(
                'w-5 h-5 text-charcoal-400 transition-transform',
                isCollapsed && '-rotate-90'
              )}
            />
          )}
        </div>
      )}

      {/* Fields Grid */}
      {!isCollapsed && (
        <div
          className={cn(
            'grid gap-4',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {visibleFields.map((field) => {
            // Handle field spanning
            const fieldSpan =
              field.columns === 1
                ? 'col-span-1'
                : field.columns === 2
                  ? 'md:col-span-2'
                  : field.columns === 3
                    ? 'md:col-span-2 lg:col-span-3'
                    : ''

            return (
              <div key={field.key} className={fieldSpan}>
                <FormFieldRenderer
                  field={field}
                  value={formData[field.key as keyof T]}
                  onChange={(value) => onChange(field.key, value)}
                  error={errors[field.key]}
                  disabled={disabled || field.readOnly}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

#### 6.2 FormActions Sub-Component

**File**: `src/components/pcf/form/FormActions.tsx`

```typescript
'use client'

import { Loader2, Save, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FormActionsProps {
  mode: 'create' | 'edit'
  isSubmitting?: boolean
  isDirty?: boolean
  hasErrors?: boolean
  submitLabel?: string
  cancelLabel?: string
  deleteLabel?: string
  onSubmit: () => void
  onCancel: () => void
  onDelete?: () => void
  showDelete?: boolean
  position?: 'bottom' | 'top' | 'sticky'
}

export function FormActions({
  mode,
  isSubmitting = false,
  isDirty = true,
  hasErrors = false,
  submitLabel,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  onSubmit,
  onCancel,
  onDelete,
  showDelete = false,
  position = 'bottom',
}: FormActionsProps) {
  const defaultSubmitLabel = mode === 'create' ? 'Create' : 'Save Changes'
  const finalSubmitLabel = submitLabel || defaultSubmitLabel

  const isDisabled = isSubmitting || hasErrors || !isDirty

  return (
    <div
      className={cn(
        'flex items-center justify-between pt-4 border-t border-charcoal-100',
        position === 'sticky' && 'sticky bottom-0 bg-white pb-4 -mx-6 px-6',
        position === 'top' && 'pb-4 border-t-0 border-b'
      )}
    >
      {/* Left Side: Delete (if editing) */}
      <div>
        {showDelete && mode === 'edit' && onDelete && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            disabled={isSubmitting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteLabel}
          </Button>
        )}
      </div>

      {/* Right Side: Cancel + Submit */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          {cancelLabel}
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
          className="bg-hublot-900 hover:bg-hublot-800"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {finalSubmitLabel}
        </Button>
      </div>
    </div>
  )
}
```

#### 6.3 Main EntityForm Component

**File**: `src/components/pcf/form/EntityForm.tsx`

```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormConfig, FieldDefinition } from '@/configs/entities/types'
import { FormSection } from './FormSection'
import { FormActions } from './FormActions'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface EntityFormProps<T> {
  config: FormConfig<T>
  initialData?: Partial<T>
  mode?: 'create' | 'edit'
  onSuccess?: (result: unknown) => void
  onCancel?: () => void
  className?: string
}

export function EntityForm<T extends Record<string, unknown>>({
  config,
  initialData,
  mode = 'create',
  onSuccess,
  onCancel,
  className,
}: EntityFormProps<T>) {
  // Form state
  const [formData, setFormData] = useState<Partial<T>>(
    initialData || config.defaultValues || {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Track dirty state
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData || config.defaultValues || {})
    setIsDirty(hasChanges)
  }, [formData, initialData, config.defaultValues])

  // Handle field change
  const handleChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))

    // Clear field error on change
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  // Collect all fields from sections
  const allFields: FieldDefinition[] = config.sections
    ? config.sections.flatMap((s) => s.fields)
    : config.fields || []

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Zod schema validation
    if (config.validation) {
      const result = config.validation.safeParse(formData)
      if (!result.success) {
        result.error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
      }
    }

    // Required field validation
    allFields.forEach((field) => {
      if (field.required) {
        const value = formData[field.key as keyof T]
        if (value === null || value === undefined || value === '') {
          newErrors[field.key] = `${field.label} is required`
        }
        if (Array.isArray(value) && value.length === 0) {
          newErrors[field.key] = `${field.label} is required`
        }
      }
    })

    // Custom validation function
    if (config.validateFn) {
      const customErrors = config.validateFn(formData as T)
      Object.entries(customErrors).forEach(([key, message]) => {
        newErrors[key] = message
      })
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0]
      toast({
        title: 'Validation Error',
        description: firstError,
        variant: 'destructive',
      })
      return false
    }

    return true
  }, [formData, config.validation, config.validateFn, allFields])

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const result = await config.onSubmit(formData as T)

      toast({
        title: 'Success',
        description: config.successMessage || (mode === 'create' ? 'Created successfully' : 'Changes saved'),
      })

      onSuccess?.(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) {
      return
    }
    onCancel?.()
  }

  // Handle delete
  const handleDelete = async () => {
    if (!config.onDelete) return
    if (!confirm(`Are you sure you want to delete this ${config.entityName}?`)) return

    setIsSubmitting(true)
    try {
      await config.onDelete(formData as T)
      toast({
        title: 'Deleted',
        description: `${config.entityName} has been deleted`,
      })
      onSuccess?.(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  // Render as card or bare form
  const formContent = (
    <>
      {/* Validation Error Summary */}
      {hasErrors && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 list-disc list-inside text-sm text-red-600">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {config.sections ? (
          // Section-based layout
          config.sections.map((section) => (
            <FormSection
              key={section.id || section.title || 'default'}
              title={section.title}
              description={section.description}
              fields={section.fields}
              formData={formData}
              onChange={handleChange}
              errors={errors}
              columns={section.columns || config.defaultColumns || 2}
              collapsible={section.collapsible}
              defaultCollapsed={section.defaultCollapsed}
              disabled={isSubmitting}
            />
          ))
        ) : (
          // Flat field layout
          <FormSection
            fields={config.fields || []}
            formData={formData}
            onChange={handleChange}
            errors={errors}
            columns={config.defaultColumns || 2}
            disabled={isSubmitting}
          />
        )}
      </div>

      {/* Actions */}
      {!config.hideActions && (
        <FormActions
          mode={mode}
          isSubmitting={isSubmitting}
          isDirty={isDirty}
          hasErrors={hasErrors}
          submitLabel={config.submitLabel}
          cancelLabel={config.cancelLabel}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={config.onDelete ? handleDelete : undefined}
          showDelete={config.showDelete}
          position={config.actionsPosition}
        />
      )}
    </>
  )

  // Wrap in card if configured
  if (config.variant === 'card') {
    return (
      <Card className={cn('bg-white', className)}>
        {(config.title || config.description) && (
          <CardHeader>
            {config.title && <CardTitle>{config.title}</CardTitle>}
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>{formContent}</CardContent>
      </Card>
    )
  }

  // Bare form (for dialogs, inline panels)
  return <div className={className}>{formContent}</div>
}
```

#### 6.4 formatDisplayValue Helper

**File**: `src/lib/pcf/field-renderer.ts`

```typescript
import { FieldDefinition } from '@/configs/entities/types'
import { format } from 'date-fns'

/**
 * Format a field value for display (used in review steps, read-only views)
 */
export function formatDisplayValue(
  value: unknown,
  field: FieldDefinition
): string {
  if (value === null || value === undefined) {
    return '—'
  }

  switch (field.type) {
    case 'select':
    case 'radio':
      const option = field.options?.find((o) => o.value === value)
      return option?.label || String(value)

    case 'multi-select':
      if (Array.isArray(value)) {
        return value
          .map((v) => field.options?.find((o) => o.value === v)?.label || v)
          .join(', ')
      }
      return String(value)

    case 'checkbox':
    case 'switch':
      return value ? 'Yes' : 'No'

    case 'date':
      try {
        return format(new Date(value as string | number), 'MMM d, yyyy')
      } catch {
        return String(value)
      }

    case 'datetime':
      try {
        return format(new Date(value as string | number), 'MMM d, yyyy h:mm a')
      } catch {
        return String(value)
      }

    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(numValue)) return String(value)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: field.currency || 'USD',
      }).format(numValue)

    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(String(value))
      if (isNaN(num)) return String(value)
      return num.toLocaleString()

    case 'phone':
      // Basic US phone formatting
      const phone = String(value).replace(/\D/g, '')
      if (phone.length === 10) {
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
      }
      return String(value)

    case 'url':
      return String(value)

    case 'email':
      return String(value)

    case 'textarea':
    case 'rich-text':
      // Truncate long text
      const text = String(value)
      return text.length > 100 ? `${text.slice(0, 100)}...` : text

    case 'text':
    default:
      return String(value)
  }
}

/**
 * Check if a field should be visible based on conditional visibility
 */
export function isFieldVisible<T>(
  field: FieldDefinition,
  formData: T
): boolean {
  if (!field.visibleWhen) return true
  return field.visibleWhen(formData)
}
```

#### 6.5 Export Index

**File**: `src/components/pcf/form/index.ts`

```typescript
export { EntityForm } from './EntityForm'
export { FormSection } from './FormSection'
export { FormActions } from './FormActions'
export { FormFieldRenderer } from './FormFieldRenderer'
```

### Success Criteria

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] Lint passes: `pnpm lint`
- [ ] All components export correctly from `@/components/pcf/form`

#### Manual Verification:
- [ ] EntityForm renders all field types correctly
- [ ] EntityForm validates required fields on submit
- [ ] EntityForm shows field-level error messages under inputs
- [ ] EntityForm error summary shows at top when validation fails
- [ ] FormSection title and description render correctly
- [ ] FormSection collapsible mode toggles open/closed
- [ ] FormSection columns prop creates 1/2/3 column grid layouts
- [ ] FormSection field spanning works (field.columns = 2 spans two columns)
- [ ] FormSection conditional visibility hides/shows fields
- [ ] FormActions shows correct buttons for create vs edit mode
- [ ] FormActions delete button only shows in edit mode with showDelete=true
- [ ] FormActions submit disabled when form is clean (not dirty)
- [ ] formatDisplayValue correctly formats all field types
- [ ] Card variant wraps form in Card component with header
- [ ] Bare variant renders without Card wrapper (for dialogs)

---

### 🔄 HANDOFF OPPORTUNITY: Phase 6 Complete

**What's Done:**
- `EntityForm` - Main configuration-driven form orchestrator
- `FormSection` - Collapsible section with title, description, column grid
- `FormActions` - Submit/Cancel/Delete buttons with loading states
- `FormFieldRenderer` - Universal field renderer (from Phase 5)
- `formatDisplayValue` - Helper for display formatting in review/read-only

**What's Next:**
- Phase 7: Entity Configurations & Migration

**To Continue:** Say "continue to Phase 7" or "create handoff"

---

## Phase 7: Entity Configurations & Migration

### Overview

Create configuration files for **12 root entities** and migrate existing pages to use PCF components. This phase is the longest and should be done entity-by-entity.

**Entity Scope (G5: 12 entities, not 6):**
| Module | Entities | Priority |
|--------|----------|----------|
| **ATS** | Jobs, Candidates, Submissions, Interviews, Placements | High |
| **CRM** | Leads, Deals, Campaigns, Accounts, Contacts | High |
| **Bench** | Vendors | Medium |
| **Prospects** | Prospects (Campaign children) | Medium |

### File Structure

```
src/configs/entities/
├── types.ts                  # (Created in Phase 1)
├── jobs.config.ts            # Priority 1 - Reference implementation
├── accounts.config.ts        # Priority 2
├── leads.config.ts           # Priority 3
├── campaigns.config.ts       # Priority 4
├── candidates.config.ts      # Priority 5
├── deals.config.ts           # Priority 6
├── contacts.config.ts        # Priority 7
├── submissions.config.ts     # Priority 8
├── interviews.config.ts      # Priority 9
├── placements.config.ts      # Priority 10
├── vendors.config.ts         # Priority 11
├── prospects.config.ts       # Priority 12
└── index.ts
```

### Per-Entity Configuration Pattern

Each config file exports:
- `{entity}ListConfig: ListViewConfig<EntityType>` - For list pages
- `{entity}DetailConfig: DetailViewConfig<EntityType>` - For detail pages
- `{entity}WizardConfig?: WizardConfig<EntityFormData>` - For creation wizards
- Status configuration objects

### Migration Order (Recommended)

**Week 1-2: Core ATS/CRM Entities**
1. **Jobs** - Reference implementation, has list + detail + wizard
2. **Accounts** - Has sections, existing onboarding wizard
3. **Leads** - Simpler list/detail, good second example
4. **Campaigns** - Complex detail with metrics, event system

**Week 3: Extended CRM**
5. **Candidates** - Journey navigation pattern
6. **Deals** - Similar to leads
7. **Contacts** - Section-based, shares with accounts

**Week 4: Pipeline Entities**
8. **Submissions** - Journey + complex status workflow
9. **Interviews** - Scheduling integration
10. **Placements** - Complex lifecycle

**Week 5: Supporting Entities**
11. **Vendors** - Bench sales module
12. **Prospects** - Campaign children, polymorphic pattern

### Migration Progress Tracking

Use this table to track migration progress across all 12 entities:

| Entity | List Config | Detail Config | Wizard | List Page | Detail Page | Verified |
|--------|:-----------:|:-------------:|:------:|:---------:|:-----------:|:--------:|
| Jobs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Accounts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Leads | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Campaigns | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Candidates | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Deals | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Contacts | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Submissions | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Interviews | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Placements | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Vendors | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| Prospects | ❌ | ❌ | — | ❌ | ❌ | ❌ |

**Legend:**
- ❌ Not started
- ⏳ In progress
- ✅ Complete
- — Not applicable (entity doesn't have this feature)

**Update this table as you complete each migration step.**

### Migration Steps per Entity

1. Create `{entity}.config.ts` with ListViewConfig
2. Update list page to use `<EntityListView config={...} />`
3. Verify list page works identically
4. Add DetailViewConfig to config file
5. Update detail page to use `<EntityDetailView config={...} />`
6. Configure polymorphic sections (Activities, Documents, Notes)
7. Verify detail page with all sections
8. If wizard exists, add WizardConfig
9. Update wizard page to use `<EntityWizard config={...} />`

### Example: Jobs Configuration

```typescript
// src/configs/entities/jobs.config.ts

import { Briefcase, Plus, Building2, MapPin, DollarSign } from 'lucide-react'
import { ListViewConfig, DetailViewConfig } from './types'
import { trpc } from '@/lib/trpc/client'

// Types
interface Job {
  id: string
  title: string
  status: string
  account?: { name: string }
  location?: string
  bill_rate_min?: number
  bill_rate_max?: number
  created_at: string
}

// Status Configuration
export const JOB_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  filled: { label: 'Filled', color: 'bg-purple-100 text-purple-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

// List Configuration
export const jobsListConfig: ListViewConfig<Job> = {
  entityType: 'job',
  entityName: { singular: 'Job', plural: 'Jobs' },
  baseRoute: '/employee/recruiting/jobs',

  title: 'Jobs',
  description: 'Manage job requisitions and pipelines',
  icon: Briefcase,

  primaryAction: {
    label: 'New Job',
    icon: Plus,
    href: '/employee/recruiting/jobs/intake',
  },

  statsCards: [
    { key: 'total', label: 'Total Jobs', icon: Briefcase },
    { key: 'active', label: 'Active', color: 'bg-green-100' },
    { key: 'onHold', label: 'On Hold', color: 'bg-amber-100' },
    { key: 'filled', label: 'Filled', color: 'bg-purple-100' },
    { key: 'urgent', label: 'Urgent', color: 'bg-red-100' },
  ],

  filters: [
    { key: 'search', type: 'search', label: 'Jobs', placeholder: 'Search jobs...' },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: Object.entries(JOB_STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
    },
  ],

  renderMode: 'cards',
  statusField: 'status',
  statusConfig: JOB_STATUS_CONFIG,

  emptyState: {
    icon: Briefcase,
    title: 'No jobs found',
    description: (filters) => filters.search ? 'Try adjusting your filters' : 'Create your first job',
    action: { label: 'Create Job', href: '/employee/recruiting/jobs/intake' },
  },

  useListQuery: (filters) => trpc.ats.jobs.list.useQuery({
    search: filters.search as string,
    status: filters.status as string,
    limit: filters.limit as number,
    offset: filters.offset as number,
  }),

  useStatsQuery: () => trpc.ats.jobs.getStats.useQuery(),
}
```

### Success Criteria per Entity

#### Automated:
- [ ] TypeScript compiles
- [ ] No console errors

#### Manual:
- [ ] List page visually identical to original
- [ ] All filters work correctly
- [ ] Detail page shows all sections
- [ ] Activities/Documents/Notes sections work
- [ ] Wizard (if applicable) completes successfully

---

### 🔄 HANDOFF OPPORTUNITY: Phase 7 - Per Entity

After each entity migration, there's a natural handoff point:
- "Jobs migration complete, continue to Accounts?"
- "Accounts migration complete, continue to Leads?"
- etc.

---

## Summary

| Phase | Components | Files | Sub-Components | Effort | Time |
|-------|-----------|-------|----------------|--------|------|
| 1 | Core Infrastructure | 5 | Types, utils, shared configs | Medium | 1 day |
| 2 | Polymorphic Sections | 4 | Activities, Documents, Notes, Comments | Medium | 1.5 days |
| 3 | EntityListView | 8 | Header, Stats, Filters, Table, Cards, Pagination | High | 2 days |
| 4 | EntityDetailView | 6 | Header, Metrics, Sections, Journey, DetailView | High | 2.5 days |
| 5 | EntityWizard | 7 | Progress, Navigation, Step, Review, Wizard, FieldRenderer | High | 2 days |
| 6 | EntityForm | 5 | Section, Actions, Form, FieldRenderer, formatDisplay | Medium | 1 day |
| 7 | Entity Configs (×12) | 12 | Per-entity configuration files | Medium | 6 days |
| 7 | Migrations (×12) | - | Page migrations to use PCF components | Low | 3 days |

**Total Effort Breakdown:**
- Core PCF (Phases 1-6): ~80 hours / 10 days
  - Phase 1: 8 hours (types, infrastructure)
  - Phase 2: 12 hours (4 polymorphic sections)
  - Phase 3: 16 hours (8 list view components)
  - Phase 4: 20 hours (6 detail view components)
  - Phase 5: 16 hours (7 wizard components)
  - Phase 6: 8 hours (5 form components)
- Entity Configs (Phase 7): 48 hours / 6 days (4 hrs each × 12)
- Entity Migrations (Phase 7): 24 hours / 3 days (2 hrs each × 12)
- **Total: ~152 hours / 19 working days**
- **With 30% risk buffer: ~5 weeks**

**Total New Files**: ~54 files (42 core + 12 entity configs)
**Total New Lines**: ~8500 lines (estimated based on expanded phases)

---

## Go/No-Go Checklist

Before starting implementation, verify:

- [x] **Variant support added** (G1) - `ListViewVariant` interface enables "My Jobs" vs "All Jobs"
- [x] **12 entities in scope** (G5) - Phase 7 expanded from 6 to 12 entities
- [x] **Hook pattern documented** (G4) - Hydration safety notes added to types.ts
- [x] **Event system documented** (G3) - `eventNamespace` and `dialogHandlers` added to DetailViewConfig
- [x] **Effort estimates updated** - Plan for 4.5 weeks (not 2-3 weeks)
- [ ] **Test pages identified** - Identify one test page per phase for validation

### Recommended Implementation Order

```
Week 1: Phase 1 (Core) + Phase 3 (ListView)
        → Test with Jobs list page

Week 2: Phase 4 (DetailView) + Phase 2 (Sections)
        → Test with Jobs detail page

Week 3: Phase 5 (Wizard) + Phase 6 (Form)
        → Test with Job Intake wizard

Week 4-5: Phase 7 (All 12 entity configs + migrations)
        → One entity per half-day
```

---

## Executive Review Notes (2025-12-09)

This plan was reviewed and approved with the following conditions addressed:

| Gap | Status | Resolution |
|-----|--------|------------|
| G1: Missing Variant Support | ✅ Fixed | Added `ListViewVariant` interface |
| G2: Phases 4-6 Outlines Only | ✅ Fixed | Expanded with detailed component code (~600 lines each) |
| G3: Event System Missing | ✅ Fixed | Added `eventNamespace` + `dialogHandlers` |
| G4: Hook Hydration Issues | ✅ Fixed | Added documentation with safe patterns |
| G5: Entity Count (6→12) | ✅ Fixed | Expanded to 12 entities |

**Verdict**: APPROVED FOR IMPLEMENTATION

### Phase Expansion Notes (2025-12-08)

Phases 4-6 have been expanded from outlines to detailed implementations:

- **Phase 4 (EntityDetailView)**: 6 components with ~700 lines of code
  - DetailHeader, DetailMetrics, DetailSections, DetailJourney, EntityDetailView, index
  - Features: Sticky header with scroll detection, event system for sidebar communication

- **Phase 5 (EntityWizard)**: 7 components with ~1000 lines of code
  - WizardProgress, WizardNavigation, WizardStep, WizardReview, EntityWizard, FormFieldRenderer, index
  - Features: URL-based navigation, Zustand store integration, per-step validation, review step

- **Phase 6 (EntityForm)**: 5 components with ~500 lines of code
  - FormSection, FormActions, EntityForm, formatDisplayValue helper, index
  - Features: Section-based layout, collapsible sections, conditional visibility, card/bare variants

---

## References

- Issue: `thoughts/shared/issues/ui-components`
- Research: `thoughts/shared/research/2025-12-08-pcf-architecture-current-state.md`
- Existing patterns: `src/components/recruiting/`, `src/components/crm/`
- Navigation config: `src/lib/navigation/entity-sections.ts`, `src/lib/navigation/entity-journeys.ts`
