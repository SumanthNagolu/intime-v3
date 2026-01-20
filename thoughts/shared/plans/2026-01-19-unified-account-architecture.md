# Unified Account Architecture Implementation Plan

## Overview

Implement a fully unified architecture for account management where:
1. ONE component per section renders identically in create, view, and edit modes
2. ONE backend endpoint per section handles saves from both wizard and detail page
3. Draft pattern - wizard creates a draft entity immediately, each step saves to it
4. Inline editing - no separate edit panel; same layout just becomes editable
5. Event-driven side effects for activities and notifications

## Current State Analysis

### What Exists
- 7 unified section components handling create/view/edit modes
- Zustand store for wizard form state
- Draft pattern via `useEntityDraft` hook (auto-saves every 2s)
- `createEnhanced`/`updateEnhanced` endpoints handling ALL section data
- InlinePanel for edit mode (sliding panel)
- Separate wizard wrappers and workspace wrappers

### Key Discoveries
- Section components already support 3 modes (`src/components/accounts/sections/*.tsx`)
- Backend has one large endpoint, not per-section (`src/server/routers/crm.ts:573-896`)
- Edit mode uses InlinePanel instead of in-place editing
- No event system for side effects

## Desired End State

After implementation:
1. `UnifiedField` component switches between input/display based on `editable` prop
2. All 7 sections use `UnifiedField` and edit in-place (no InlinePanel)
3. Backend has 7 `save{Section}` endpoints + `createDraft` + `submit`
4. Event emitter triggers activities/notifications on key actions
5. Wizard uses URL-based navigation, no Zustand store
6. Same section containers work for both wizard and workspace

### Verification
- Wizard creates draft, saves per-section, submits successfully
- Detail page shows sections, edits in-place, saves per-section
- Events trigger activity creation on submit
- No InlinePanel usage in any section
- Zustand store deleted

## What We're NOT Doing

- Changing the database schema (using existing tables)
- Modifying the PCF wizard framework itself
- Changing the ONE database call pattern on detail pages
- Adding new sections (only refactoring existing 7)
- Implementing undo/redo functionality

## Implementation Approach

**Strategy**: Build foundation components first, then backend, then refactor sections, then wire up wizard and workspace.

**Key Architectural Decisions**:
1. Section-specific service functions (not class-based service)
2. Eliminate Zustand store (URL + local state + DB)
3. In-place editing (remove InlinePanel)
4. Per-section save endpoints

---

## Phase 1: Foundation Components

### Overview
Create the reusable components that all sections will depend on: `UnifiedField` for field rendering and `SectionHeader` for section chrome with edit/save/cancel actions.

### Changes Required

#### 1.1 UnifiedField Component

**File**: `src/components/accounts/fields/UnifiedField.tsx` (NEW)

```tsx
'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { cn } from '@/lib/utils'

type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'select'
  | 'multiSelect'
  | 'textarea'
  | 'date'

interface Option {
  value: string
  label: string
  icon?: string
}

interface UnifiedFieldProps {
  label: string
  value: unknown
  onChange: (value: unknown) => void
  editable: boolean
  type?: FieldType
  options?: Option[]
  required?: boolean
  error?: string
  placeholder?: string
  badge?: boolean
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
  maxLength?: number
  min?: number
  max?: number
}

export function UnifiedField({
  label,
  value,
  onChange,
  editable,
  type = 'text',
  options = [],
  required,
  error,
  placeholder,
  badge,
  badgeVariant = 'secondary',
  className,
  maxLength,
  min,
  max,
}: UnifiedFieldProps) {
  // Helper to get label from options
  const getOptionLabel = (val: string) => {
    const opt = options.find(o => o.value === val)
    return opt?.label ?? val?.replace(/_/g, ' ')
  }

  // Helper to format display value
  const formatDisplayValue = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return ''

    if (type === 'phone' && typeof val === 'object' && val !== null) {
      const phone = val as { countryCode?: string; number?: string }
      if (!phone.number) return ''
      const code = phone.countryCode === 'US' ? '1' : phone.countryCode
      return `+${code} ${phone.number}`
    }

    if (type === 'date' && val) {
      return new Date(val as string).toLocaleDateString()
    }

    return String(val)
  }

  // ========== VIEW MODE ==========
  if (!editable) {
    const displayValue = formatDisplayValue(value)
    const isEmpty = !displayValue

    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
          {label}
        </p>

        {badge ? (
          <Badge variant={badgeVariant}>
            {type === 'select' ? getOptionLabel(value as string) : displayValue || 'Not specified'}
          </Badge>
        ) : type === 'multiSelect' ? (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((v: string) => (
                <Badge key={v} variant="outline">
                  {getOptionLabel(v)}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-charcoal-400">Not specified</span>
            )}
          </div>
        ) : type === 'select' ? (
          <p className="text-sm text-charcoal-900">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              getOptionLabel(value as string)
            )}
          </p>
        ) : type === 'textarea' ? (
          <p className="text-sm text-charcoal-900 whitespace-pre-wrap">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              displayValue
            )}
          </p>
        ) : type === 'url' && !isEmpty ? (
          <a
            href={displayValue.startsWith('http') ? displayValue : `https://${displayValue}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {displayValue}
          </a>
        ) : (
          <p className="text-sm text-charcoal-900">
            {isEmpty ? (
              <span className="text-charcoal-400">Not specified</span>
            ) : (
              displayValue
            )}
          </p>
        )}
      </div>
    )
  }

  // ========== EDIT MODE ==========
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-charcoal-700 font-medium">
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </Label>

      {type === 'select' ? (
        <Select value={value as string} onValueChange={onChange}>
          <SelectTrigger className="h-11 rounded-lg border-charcoal-200">
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'multiSelect' ? (
        <MultiSelectChips
          options={options}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      ) : type === 'textarea' ? (
        <Textarea
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="rounded-lg border-charcoal-200 resize-none"
        />
      ) : type === 'phone' ? (
        <PhoneInput
          value={value}
          onChange={onChange}
        />
      ) : (
        <Input
          type={type === 'url' ? 'text' : type}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          maxLength={maxLength}
          className="h-11 rounded-lg border-charcoal-200"
        />
      )}

      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  )
}

// ========== MULTI-SELECT CHIPS ==========
interface MultiSelectChipsProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
}

function MultiSelectChips({ options, value, onChange }: MultiSelectChipsProps) {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              isSelected
                ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white'
                : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
            )}
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default UnifiedField
```

#### 1.2 SectionHeader Component

**File**: `src/components/accounts/fields/SectionHeader.tsx` (NEW)

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Pencil, Loader2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  mode: 'create' | 'view' | 'edit'
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  isSaving?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  mode,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-xl font-heading font-semibold text-charcoal-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-charcoal-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {mode === 'view' && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        )}

        {mode === 'edit' && (
          <>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

#### 1.3 Field Registry (Index)

**File**: `src/components/accounts/fields/index.ts` (NEW)

```typescript
export { UnifiedField } from './UnifiedField'
export { SectionHeader } from './SectionHeader'
```

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] Lint passes: `pnpm lint`
- [x] Components can be imported: Add test import in a page

#### Manual Verification
- [ ] UnifiedField renders correctly in view mode (text, badges, links)
- [ ] UnifiedField renders correctly in edit mode (inputs, selects)
- [ ] SectionHeader shows correct buttons per mode
- [ ] Multi-select chips toggle correctly

---

## Phase 2: Event System

### Overview
Create a simple event emitter for triggering side effects (activities, notifications) on account actions.

### Changes Required

#### 2.1 Event Types

**File**: `src/server/events/types.ts` (NEW)

```typescript
export type AccountEventType =
  | 'account.draft.created'
  | 'account.submitted'
  | 'account.identity.updated'
  | 'account.locations.updated'
  | 'account.billing.updated'
  | 'account.contacts.updated'
  | 'account.contracts.updated'
  | 'account.compliance.updated'
  | 'account.team.updated'
  | 'account.status.changed'

export interface AccountEvent {
  type: AccountEventType
  accountId: string
  orgId: string
  userId: string
  payload?: Record<string, unknown>
  timestamp: Date
}

export type EventHandler = (event: AccountEvent) => Promise<void>
```

#### 2.2 Event Emitter

**File**: `src/server/events/emitter.ts` (NEW)

```typescript
import type { AccountEvent, AccountEventType, EventHandler } from './types'

class EventEmitter {
  private handlers: Map<AccountEventType, EventHandler[]> = new Map()

  on(eventType: AccountEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || []
    this.handlers.set(eventType, [...existing, handler])
  }

  async emit(
    type: AccountEventType,
    data: Omit<AccountEvent, 'type' | 'timestamp'>
  ): Promise<void> {
    const event: AccountEvent = {
      ...data,
      type,
      timestamp: new Date(),
    }

    const handlers = this.handlers.get(type) || []

    // Fire-and-forget - don't block the main operation
    Promise.all(handlers.map(h => h(event).catch(err => {
      console.error(`Event handler error for ${type}:`, err)
    })))
  }
}

export const events = new EventEmitter()
```

#### 2.3 Account Event Handlers

**File**: `src/server/events/handlers/account-handlers.ts` (NEW)

```typescript
import { events } from '../emitter'
import { db } from '@/db'
import { activities } from '@/db/schema'

// Register handlers
events.on('account.submitted', async ({ accountId, orgId, userId }) => {
  // Create welcome activity
  await db.insert(activities).values({
    entity_type: 'account',
    entity_id: accountId,
    org_id: orgId,
    subject: 'Schedule welcome call with new client',
    activity_type: 'call',
    status: 'open',
    priority: 'high',
    due_date: addBusinessDays(new Date(), 3),
    assigned_to: userId,
    created_by: userId,
  })
})

events.on('account.status.changed', async ({ accountId, payload }) => {
  console.log(`Account ${accountId} status changed:`, payload)
  // Add to history, send notifications, etc.
})

// Helper
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++
    }
  }
  return result
}
```

#### 2.4 Events Index

**File**: `src/server/events/index.ts` (NEW)

```typescript
export { events } from './emitter'
export type { AccountEvent, AccountEventType } from './types'

// Import handlers to register them
import './handlers/account-handlers'
```

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] Event emitter can be imported and used

#### Manual Verification
- [ ] Events fire correctly when triggered
- [ ] Handlers execute without blocking main operation

---

## Phase 3: Backend Per-Section Endpoints

### Overview
Create service functions and tRPC endpoints for each section. Keep existing `createEnhanced`/`updateEnhanced` for backward compatibility during migration.

### Changes Required

#### 3.1 Validation Schemas

**File**: `src/server/services/account/validations.ts` (NEW)

```typescript
import { z } from 'zod'

// Shared sub-schemas
const phoneSchema = z.object({
  countryCode: z.string(),
  number: z.string(),
}).optional()

export const addressSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isPrimary: z.boolean(),
})

export const contactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  phone: phoneSchema,
  mobile: phoneSchema,
  title: z.string().optional(),
  department: z.string().optional(),
  role: z.string(),
  decisionAuthority: z.string().optional(),
  isPrimary: z.boolean(),
  linkedInUrl: z.string().optional(),
  notes: z.string().optional(),
})

export const contractSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['msa', 'nda', 'sow', 'rate_agreement', 'subcontract']),
  name: z.string().min(1, 'Contract name is required'),
  number: z.string().optional(),
  status: z.enum(['draft', 'active', 'pending_signature', 'expired']),
  effectiveDate: z.date().nullable().optional(),
  expiryDate: z.date().nullable().optional(),
  autoRenew: z.boolean(),
  contractValue: z.string().optional(),
  currency: z.string(),
  fileUrl: z.string().optional(),
})

// Section schemas
export const identitySchema = z.object({
  accountType: z.enum(['company', 'person']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  legalName: z.string().optional(),
  dba: z.string().optional(),
  taxId: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: phoneSchema,
  website: z.string().optional(),
  linkedinUrl: z.string().optional(),
  description: z.string().max(500).optional(),
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
  companyType: z.string().min(1, 'Select relationship type'),
  tier: z.string().optional(),
  segment: z.string().optional(),
  status: z.string().optional(),
  foundedYear: z.string().optional(),
  employeeRange: z.string().optional(),
  revenueRange: z.string().optional(),
  ownershipType: z.string().optional(),
})

export const locationsSchema = z.object({
  addresses: z.array(addressSchema),
})

export const billingSchema = z.object({
  billingEntityName: z.string().optional(),
  billingEmail: z.string().email().optional().or(z.literal('')),
  billingPhone: phoneSchema,
  billingFrequency: z.string().optional(),
  paymentTermsDays: z.string().optional(),
  poRequired: z.boolean().optional(),
  currentPoNumber: z.string().optional(),
  poExpirationDate: z.string().nullable().optional(),
  currency: z.string().optional(),
  invoiceFormat: z.string().optional(),
  invoiceDeliveryMethod: z.string().optional(),
  creditStatus: z.string().optional(),
  creditLimit: z.string().optional(),
  defaultMarkupPercentage: z.string().optional(),
  defaultFeePercentage: z.string().optional(),
})

export const contactsSchema = z.object({
  contacts: z.array(contactSchema),
})

export const contractsSchema = z.object({
  contracts: z.array(contractSchema),
})

export const complianceSchema = z.object({
  insurance: z.object({
    generalLiability: z.boolean(),
    professionalLiability: z.boolean(),
    workersComp: z.boolean(),
    cyberLiability: z.boolean(),
  }),
  backgroundCheck: z.object({
    required: z.boolean(),
    level: z.string().optional(),
  }),
  drugTest: z.object({
    required: z.boolean(),
  }),
  certifications: z.array(z.string()),
})

export const teamSchema = z.object({
  ownerId: z.string().uuid().optional(),
  accountManagerId: z.string().uuid().optional(),
  recruiterId: z.string().uuid().optional(),
  salesLeadId: z.string().uuid().optional(),
  preferredContactMethod: z.string().optional(),
  meetingCadence: z.string().optional(),
  submissionMethod: z.string().optional(),
})

// Export types
export type IdentityData = z.infer<typeof identitySchema>
export type LocationsData = z.infer<typeof locationsSchema>
export type BillingData = z.infer<typeof billingSchema>
export type ContactsData = z.infer<typeof contactsSchema>
export type ContractsData = z.infer<typeof contractsSchema>
export type ComplianceData = z.infer<typeof complianceSchema>
export type TeamData = z.infer<typeof teamSchema>
```

#### 3.2 Identity Section Service

**File**: `src/server/services/account/sections/identity.ts` (NEW)

```typescript
import { db } from '@/db'
import { companies } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import type { IdentityData } from '../validations'
import type { Context } from '@/server/trpc'

export async function saveIdentity(
  accountId: string,
  data: IdentityData,
  ctx: Context
) {
  // Map company type to relationship_type
  let relationshipType = 'direct_client'
  if (data.companyType === 'implementation_partner') {
    relationshipType = 'implementation_partner'
  } else if (data.companyType === 'staffing_vendor') {
    relationshipType = 'prime_vendor'
  }

  const [updated] = await db.update(companies)
    .set({
      account_type: data.accountType,
      name: data.name,
      legal_name: data.legalName || null,
      dba_name: data.dba || null,
      tax_id: data.taxId || null,
      email: data.email || null,
      phone: data.phone?.number || null,
      website: data.website || null,
      linkedin_url: data.linkedinUrl || null,
      description: data.description || null,
      industries: data.industries,
      industry: data.industries[0] || null,
      relationship_type: relationshipType,
      tier: data.tier || null,
      segment: data.segment || null,
      status: data.status || 'prospect',
      founded_year: data.foundedYear ? parseInt(data.foundedYear) : null,
      employee_range: data.employeeRange || null,
      revenue_range: data.revenueRange || null,
      ownership_type: data.ownershipType || null,
      updated_by: ctx.userId,
      updated_at: new Date(),
    })
    .where(and(
      eq(companies.id, accountId),
      eq(companies.org_id, ctx.orgId),
      isNull(companies.deleted_at)
    ))
    .returning()

  if (!updated) {
    throw new Error('Account not found')
  }

  return updated
}
```

#### 3.3 Locations Section Service

**File**: `src/server/services/account/sections/locations.ts` (NEW)

```typescript
import { db } from '@/db'
import { addresses } from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { LocationsData } from '../validations'
import type { Context } from '@/server/trpc'

export async function saveLocations(
  accountId: string,
  data: LocationsData,
  ctx: Context
) {
  await db.transaction(async (tx) => {
    // Get existing address IDs
    const existing = await tx.query.addresses.findMany({
      where: and(
        eq(addresses.entity_type, 'account'),
        eq(addresses.entity_id, accountId)
      ),
      columns: { id: true }
    })

    const existingIds = new Set(existing.map(a => a.id))
    const newIds = new Set(data.addresses.map(a => a.id))

    // Delete removed addresses
    const toDelete = [...existingIds].filter(id => !newIds.has(id))
    if (toDelete.length > 0) {
      await tx.delete(addresses).where(
        and(
          eq(addresses.entity_type, 'account'),
          eq(addresses.entity_id, accountId),
          inArray(addresses.id, toDelete)
        )
      )
    }

    // Upsert addresses
    for (const addr of data.addresses) {
      await tx.insert(addresses)
        .values({
          id: addr.id,
          entity_type: 'account',
          entity_id: accountId,
          org_id: ctx.orgId,
          address_type: addr.type,
          address_line_1: addr.addressLine1,
          address_line_2: addr.addressLine2 || null,
          city: addr.city,
          state_province: addr.state,
          postal_code: addr.postalCode,
          country_code: addr.country,
          is_primary: addr.isPrimary,
          created_by: ctx.userId,
          updated_by: ctx.userId,
        })
        .onConflictDoUpdate({
          target: addresses.id,
          set: {
            address_type: addr.type,
            address_line_1: addr.addressLine1,
            address_line_2: addr.addressLine2 || null,
            city: addr.city,
            state_province: addr.state,
            postal_code: addr.postalCode,
            country_code: addr.country,
            is_primary: addr.isPrimary,
            updated_by: ctx.userId,
            updated_at: new Date(),
          }
        })
    }
  })

  return { success: true }
}
```

#### 3.4 Services Index

**File**: `src/server/services/account/sections/index.ts` (NEW)

```typescript
export { saveIdentity } from './identity'
export { saveLocations } from './locations'
export { saveBilling } from './billing'
export { saveContacts } from './contacts'
export { saveContracts } from './contracts'
export { saveCompliance } from './compliance'
export { saveTeam } from './team'
```

**Note**: Create similar files for `billing.ts`, `contacts.ts`, `contracts.ts`, `compliance.ts`, `team.ts` following the same pattern.

#### 3.5 Accounts Router Updates

**File**: `src/server/routers/accounts.ts` (NEW - separate from crm.ts)

```typescript
import { router, orgProtectedProcedure } from '../trpc'
import { z } from 'zod'
import { db } from '@/db'
import { companies } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { events } from '../events'
import * as sections from '../services/account/sections'
import {
  identitySchema,
  locationsSchema,
  billingSchema,
  contactsSchema,
  contractsSchema,
  complianceSchema,
  teamSchema,
} from '../services/account/validations'

export const accountsRouter = router({
  // Create draft
  createDraft: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const [draft] = await db.insert(companies)
        .values({
          org_id: ctx.orgId,
          name: 'Untitled Account',
          status: 'draft',
          category: 'prospect',
          created_by: ctx.userId,
          updated_by: ctx.userId,
        })
        .returning()

      await events.emit('account.draft.created', {
        accountId: draft.id,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })

      return draft
    }),

  // Per-section saves
  saveIdentity: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: identitySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveIdentity(input.accountId, input.data, ctx)
      await events.emit('account.identity.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveLocations: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: locationsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveLocations(input.accountId, input.data, ctx)
      await events.emit('account.locations.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveBilling: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: billingSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveBilling(input.accountId, input.data, ctx)
      await events.emit('account.billing.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveContacts: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: contactsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveContacts(input.accountId, input.data, ctx)
      await events.emit('account.contacts.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveContracts: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: contractsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveContracts(input.accountId, input.data, ctx)
      await events.emit('account.contracts.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveCompliance: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: complianceSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveCompliance(input.accountId, input.data, ctx)
      await events.emit('account.compliance.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  saveTeam: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: teamSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await sections.saveTeam(input.accountId, input.data, ctx)
      await events.emit('account.team.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
      })
      return result
    }),

  // Submit draft (finalize)
  submit: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      targetStatus: z.enum(['prospect', 'active']).default('active'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify draft exists and is owned by user's org
      const account = await db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.accountId),
          eq(companies.org_id, ctx.orgId),
          isNull(companies.deleted_at)
        )
      })

      if (!account) {
        throw new Error('Account not found')
      }

      if (account.status !== 'draft') {
        throw new Error('Account is not a draft')
      }

      // Update status
      const [updated] = await db.update(companies)
        .set({
          status: input.targetStatus,
          category: input.targetStatus === 'prospect' ? 'prospect' : 'client',
          custom_fields: {}, // Clear wizard state
          updated_by: ctx.userId,
          updated_at: new Date(),
        })
        .where(eq(companies.id, input.accountId))
        .returning()

      await events.emit('account.submitted', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: ctx.userId,
        payload: { status: input.targetStatus },
      })

      return updated
    }),
})
```

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] All service functions are importable
- [x] tRPC procedures are accessible via client

#### Manual Verification
- [ ] `createDraft` creates account with status='draft'
- [ ] Each `save{Section}` updates only that section's data
- [ ] `submit` transitions draft to active status
- [ ] Events fire on each operation

---

## Phase 4: Refactor Section Components

### Overview
Refactor all 7 section components to use `UnifiedField` and implement true in-place editing (remove InlinePanel).

### Changes Required

#### 4.1 IdentitySection Refactor

**File**: `src/components/accounts/sections/IdentitySection.tsx`

**Changes**:
- Replace inline field rendering with `UnifiedField`
- Remove `InlinePanel` usage in view/edit modes
- Add `isEditing` state management
- Same card layout for all modes, fields switch between display/input

Key changes (showing view/edit mode - create mode stays similar):

```tsx
// REMOVE these imports
// import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'

// ADD these imports
import { UnifiedField } from '../fields/UnifiedField'
import { SectionHeader } from '../fields/SectionHeader'

export function IdentitySection({
  mode,
  data,
  onChange,
  onSave,
  onCancel,
  isSaving,
  errors,
}: IdentitySectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const isEditable = mode === 'create' || isEditing

  // View/Edit Mode - SAME layout, fields switch between display/input
  if (mode !== 'create') {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Identity & Classification"
          subtitle="Company details and industry classification"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={() => setIsEditing(true)}
          onSave={async () => {
            await onSave?.()
            setIsEditing(false)
          }}
          onCancel={() => {
            onCancel?.()
            setIsEditing(false)
          }}
          isSaving={isSaving}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Identity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Company Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnifiedField
                label="Company Name"
                value={data.name}
                onChange={(v) => onChange?.('name', v)}
                editable={isEditable}
                required
                error={errors?.name}
              />
              <UnifiedField
                label="Legal Name"
                value={data.legalName}
                onChange={(v) => onChange?.('legalName', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="DBA / Trade Name"
                value={data.dba}
                onChange={(v) => onChange?.('dba', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Relationship Type"
                type="select"
                options={COMPANY_TYPES}
                value={data.companyType}
                onChange={(v) => onChange?.('companyType', v)}
                editable={isEditable}
              />
            </CardContent>
          </Card>

          {/* Classification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnifiedField
                label="Industries"
                type="multiSelect"
                options={INDUSTRIES}
                value={data.industries}
                onChange={(v) => onChange?.('industries', v)}
                editable={isEditable}
                required
                error={errors?.industries}
              />
              <UnifiedField
                label="Segment"
                type="select"
                options={COMPANY_SEGMENTS}
                value={data.segment}
                onChange={(v) => onChange?.('segment', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Tier"
                type="select"
                options={PARTNERSHIP_TIERS}
                value={data.tier}
                onChange={(v) => onChange?.('tier', v)}
                editable={isEditable}
                badge={!isEditable}
              />
              <UnifiedField
                label="Status"
                type="select"
                options={ACCOUNT_STATUSES}
                value={data.status}
                onChange={(v) => onChange?.('status', v)}
                editable={isEditable}
                badge={!isEditable}
                badgeVariant={getStatusBadgeVariant(data.status)}
              />
            </CardContent>
          </Card>

          {/* Continue with other cards... */}
        </div>
      </div>
    )
  }

  // Create mode - keep existing implementation but can also use UnifiedField
  return (
    <div className="space-y-10">
      {/* ... existing create mode code, gradually migrate to UnifiedField ... */}
    </div>
  )
}
```

#### 4.2 Section Hooks

**File**: `src/components/accounts/hooks/useIdentitySection.ts` (NEW)

```typescript
import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { IdentitySectionData } from '@/lib/accounts/types'

interface UseIdentitySectionOptions {
  accountId: string
  initialData?: IdentitySectionData
  mode: 'create' | 'view' | 'edit'
  onSaveComplete?: () => void
}

export function useIdentitySection({
  accountId,
  initialData,
  mode,
  onSaveComplete,
}: UseIdentitySectionOptions) {
  const [localData, setLocalData] = useState<IdentitySectionData | null>(
    initialData || null
  )
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')

  const saveMutation = trpc.accounts.saveIdentity.useMutation()

  // Sync from initial data
  useEffect(() => {
    if (initialData) {
      setLocalData(initialData)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => prev ? { ...prev, [field]: value } : null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!localData) return

    await saveMutation.mutateAsync({
      accountId,
      data: localData,
    })

    setIsEditing(false)
    onSaveComplete?.()
  }, [accountId, localData, saveMutation, onSaveComplete])

  const handleCancel = useCallback(() => {
    // Reset to initial data
    if (initialData) {
      setLocalData(initialData)
    }
    setIsEditing(false)
  }, [initialData])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  return {
    data: localData,
    isLoading: !localData,
    isSaving: saveMutation.isPending,
    isEditing,
    errors: saveMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}
```

### Pattern for All Sections

Apply the same pattern to all 7 sections:

| Section | File | Hook File |
|---------|------|-----------|
| Identity | `IdentitySection.tsx` | `useIdentitySection.ts` |
| Locations | `LocationsSection.tsx` | `useLocationsSection.ts` |
| Billing | `BillingSection.tsx` | `useBillingSection.ts` |
| Contacts | `ContactsSection.tsx` | `useContactsSection.ts` |
| Contracts | `ContractsSection.tsx` | `useContractsSection.ts` |
| Compliance | `ComplianceSection.tsx` | `useComplianceSection.ts` |
| Team | `TeamSection.tsx` | `useTeamSection.ts` |

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit` (accounts components pass)
- [x] Lint passes: `pnpm lint` (no new errors in accounts components; pre-existing errors in other files)
- [x] No InlinePanel imports in section components

#### Manual Verification
- [ ] Each section renders correctly in view mode
- [ ] Clicking Edit shows editable fields in place (same layout)
- [ ] Save persists changes and returns to view mode
- [ ] Cancel reverts changes and returns to view mode

---

## Phase 5: Wizard Refactor

### Overview
Refactor the wizard to use URL-based navigation, per-section saves, and remove Zustand store dependency.

### Changes Required

#### 5.1 New Wizard Page

**File**: `src/app/employee/recruiting/accounts/new/page.tsx`

**Changes**: Complete rewrite to use URL-based steps and section hooks

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { WizardLayout } from '@/components/pcf/wizard/WizardLayout'
import { useToast } from '@/components/ui/use-toast'

// Section components
import { IdentitySection } from '@/components/accounts/sections/IdentitySection'
import { LocationsSection } from '@/components/accounts/sections/LocationsSection'
import { BillingSection } from '@/components/accounts/sections/BillingSection'
import { ContactsSection } from '@/components/accounts/sections/ContactsSection'
import { ContractsSection } from '@/components/accounts/sections/ContractsSection'
import { ComplianceSection } from '@/components/accounts/sections/ComplianceSection'
import { TeamSection } from '@/components/accounts/sections/TeamSection'

// Section hooks
import { useIdentitySection } from '@/components/accounts/hooks/useIdentitySection'
// ... other hooks

const STEPS = [
  { id: 'identity', label: 'Identity', component: IdentityStep },
  { id: 'locations', label: 'Locations', component: LocationsStep },
  { id: 'billing', label: 'Billing', component: BillingStep },
  { id: 'contacts', label: 'Contacts', component: ContactsStep },
  { id: 'contracts', label: 'Contracts', component: ContractsStep },
  { id: 'compliance', label: 'Compliance', component: ComplianceStep },
  { id: 'team', label: 'Team', component: TeamStep },
]

export default function CreateAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get draft ID and step from URL
  const draftId = searchParams.get('id')
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam) : 1

  // Mutations
  const createDraft = trpc.accounts.createDraft.useMutation()
  const submitMutation = trpc.accounts.submit.useMutation()

  // Fetch draft data
  const { data: draft, refetch } = trpc.crm.accounts.getByIdForEdit.useQuery(
    { id: draftId! },
    { enabled: !!draftId }
  )

  // Create draft on first load if no ID
  useEffect(() => {
    if (!draftId) {
      createDraft.mutateAsync().then(newDraft => {
        router.replace(`/employee/recruiting/accounts/new?id=${newDraft.id}&step=1`)
      })
    }
  }, [draftId])

  // Navigation helpers
  const goToStep = (step: number) => {
    router.push(`/employee/recruiting/accounts/new?id=${draftId}&step=${step}`)
  }

  const handleNext = async () => {
    // Save is handled by the step component
    // Just navigate to next step
    if (currentStep < STEPS.length) {
      goToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!draftId) return

    try {
      await submitMutation.mutateAsync({
        accountId: draftId,
        targetStatus: 'active',
      })

      toast({
        title: 'Account created!',
        description: 'The account has been successfully created.',
      })

      router.push(`/employee/recruiting/accounts/${draftId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account.',
        variant: 'error',
      })
    }
  }

  if (!draftId || !draft) {
    return <div>Loading...</div>
  }

  const StepComponent = STEPS[currentStep - 1]?.component

  return (
    <WizardLayout
      title="Create Account"
      steps={STEPS.map(s => s.label)}
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      isLastStep={currentStep === STEPS.length}
      isSubmitting={submitMutation.isPending}
    >
      {StepComponent && (
        <StepComponent
          accountId={draftId}
          initialData={draft}
          onSaveComplete={() => refetch()}
          onNext={handleNext}
        />
      )}
    </WizardLayout>
  )
}

// Step components wrap section with create mode
function IdentityStep({ accountId, initialData, onSaveComplete, onNext }) {
  const section = useIdentitySection({
    accountId,
    initialData: mapToIdentityData(initialData),
    mode: 'create',
    onSaveComplete: () => {
      onSaveComplete()
      onNext()
    },
  })

  return (
    <IdentitySection
      mode="create"
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

// ... similar for other steps
```

#### 5.2 Wizard Layout Component

**File**: `src/components/pcf/wizard/WizardLayout.tsx` (NEW or modify existing)

```tsx
interface WizardLayoutProps {
  title: string
  steps: string[]
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  isLastStep: boolean
  isSubmitting: boolean
  children: React.ReactNode
}

export function WizardLayout({
  title,
  steps,
  currentStep,
  onBack,
  onNext,
  onSubmit,
  isLastStep,
  isSubmitting,
  children,
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="flex">
        {/* Sidebar with steps */}
        <div className="w-64 bg-white border-r min-h-screen p-6">
          <h1 className="text-xl font-heading font-semibold mb-8">{title}</h1>
          <nav className="space-y-2">
            {steps.map((step, idx) => (
              <StepIndicator
                key={step}
                label={step}
                number={idx + 1}
                status={
                  idx + 1 < currentStep
                    ? 'complete'
                    : idx + 1 === currentStep
                    ? 'current'
                    : 'upcoming'
                }
              />
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {children}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              {isLastStep ? (
                <Button onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </Button>
              ) : (
                <Button onClick={onNext}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] No imports from `create-account-store.ts`
- [x] URL contains `?id={uuid}&step={n}`

#### Manual Verification
- [ ] Visiting `/accounts/new` creates draft and redirects with ID
- [ ] Each step saves on "Continue" click
- [ ] Browser back/forward navigates steps correctly
- [ ] Refreshing page restores correct step and data
- [ ] Submit creates account and redirects to detail page

---

## Phase 6: Workspace Refactor

### Overview
Refactor the workspace to use the same section components and hooks as the wizard.

### Changes Required

#### 6.1 AccountWorkspace Updates

**File**: `src/components/workspaces/AccountWorkspace.tsx`

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useAccountWorkspace } from './account/AccountWorkspaceProvider'

// Section components
import { IdentitySection } from '@/components/accounts/sections/IdentitySection'
import { LocationsSection } from '@/components/accounts/sections/LocationsSection'
// ... other sections

// Section hooks
import { useIdentitySection } from '@/components/accounts/hooks/useIdentitySection'
// ... other hooks

const SECTIONS = [
  { id: 'summary', label: 'Summary' },
  { id: 'identity', label: 'Identity' },
  { id: 'locations', label: 'Locations' },
  { id: 'billing', label: 'Billing' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'team', label: 'Team' },
]

export function AccountWorkspace() {
  const { data, refreshData } = useAccountWorkspace()
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentSection = searchParams.get('section') || 'summary'

  const renderSection = () => {
    switch (currentSection) {
      case 'identity':
        return (
          <IdentitySectionWrapper
            accountId={data.account.id}
            initialData={mapToIdentityData(data)}
            onSaveComplete={refreshData}
          />
        )
      case 'locations':
        return (
          <LocationsSectionWrapper
            accountId={data.account.id}
            initialData={mapToLocationsData(data)}
            onSaveComplete={refreshData}
          />
        )
      // ... other sections
      default:
        return <SummarySection data={data} />
    }
  }

  return (
    <div className="space-y-6">
      {renderSection()}
    </div>
  )
}

// Section wrappers use hooks
function IdentitySectionWrapper({ accountId, initialData, onSaveComplete }) {
  const section = useIdentitySection({
    accountId,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <IdentitySection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      onEdit={section.handleEdit}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

// ... similar wrappers for other sections
```

### Success Criteria

#### Automated Verification
- [x] TypeScript compiles: `pnpm tsc --noEmit`
- [x] No imports from old workspace wrapper files (no `trpc.crm.accounts.update` calls - now uses hooks with `trpc.accounts.save{Section}`)

#### Manual Verification
- [ ] Detail page loads with correct data
- [ ] Section navigation works via URL
- [ ] Edit mode works in-place for all sections
- [ ] Save persists changes and refreshes data

---

## Phase 7: Cleanup

### Overview
Remove deprecated files and dependencies.

### Files to Delete

```
src/stores/create-account-store.ts                    ✅ DELETED
src/components/accounts/wizard/index.tsx              ✅ DELETED
src/components/accounts/workspace/index.tsx           ❌ KEPT (still used by AccountWorkspace.tsx)
src/components/recruiting/accounts/intake/*.tsx       ✅ Already moved to _archive
src/configs/entities/wizards/account-create.config.tsx ✅ DELETED (no longer imported)
```

Note: Also added `src/_archive/**/*` to tsconfig.json exclude list.

### Files to Update

**Remove Zustand imports from**:
- `src/app/employee/recruiting/accounts/new/page.tsx` (already done in Phase 5)

**Remove InlinePanel imports from**:
- All section components (already done in Phase 4)

### Success Criteria

#### Automated Verification
- [x] `pnpm tsc --noEmit` passes (pre-existing errors in unrelated files remain)
- [x] `pnpm lint` passes (warnings only in unrelated files)
- [x] `pnpm build` succeeds
- [x] No unused imports warnings (in account-related files)

#### Manual Verification
- [ ] Full wizard flow works end-to-end
- [ ] Full detail page editing works end-to-end
- [ ] No console errors
- [ ] No regressions in existing functionality

---

## Testing Strategy

### Unit Tests
- UnifiedField renders correctly in view/edit modes
- Section hooks manage state correctly
- Service functions validate and save data

### Integration Tests
- Wizard creates draft and saves each section
- Submit transitions draft to active
- Events trigger activity creation

### Manual Testing Steps
1. Create new account via wizard
2. Fill all 7 steps with data
3. Submit and verify account created
4. Navigate to detail page
5. Edit each section and save
6. Verify changes persisted

---

## Migration Notes

### Backward Compatibility
- Keep `createEnhanced`/`updateEnhanced` endpoints during migration
- Old wizard route can redirect to new
- Existing drafts will work with new system

### Data Migration
- No database changes required
- Existing drafts in `custom_fields.wizard_state` still work
- New system clears `wizard_state` on submit (same as before)

---

## References

- Research document: `thoughts/shared/research/2026-01-19-account-management-architecture.md`
- Current IdentitySection: `src/components/accounts/sections/IdentitySection.tsx`
- Current wizard page: `src/app/employee/recruiting/accounts/new/page.tsx`
- Current backend: `src/server/routers/crm.ts:32-2483`
