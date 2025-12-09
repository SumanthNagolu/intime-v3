# Implementation Plan: Persistent Campaign Creation Wizard

**Date**: 2025-12-09
**Issue**: CAMPAIGNS-02 - New Campaign Button Not Working
**Branch**: `fix/campaigns-02-new-campaign-wizard`

## Overview

Convert the campaign creation flow from a dialog-based approach (which loses state) to a page-based wizard with Zustand persistence (which survives refresh, navigation, and accidental closure).

## Architecture Decision

**Pattern**: Page/Wizard with Zustand persist (like Account Onboarding)
**Why**:
- Persistence until logout (user requirement)
- Unified architecture with existing wizards
- 5-step workflow already exists in dialog
- Matches job-intake, account-onboarding, candidate-intake patterns

## Files to Create/Modify

### 1. New Files

```
src/stores/create-campaign-store.ts          # Zustand store with persist
src/app/employee/crm/campaigns/new/page.tsx  # Wizard page
src/app/employee/crm/campaigns/new/layout.tsx # Optional layout
```

### 2. Files to Modify

```
src/configs/entities/campaigns.config.ts     # Change onClick to href
```

---

## Implementation Steps

### Step 1: Create Zustand Store

**File**: `src/stores/create-campaign-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Form data matching existing dialog schema
export interface CreateCampaignFormData {
  // Step 1: Campaign Setup
  name: string
  campaignType: 'lead_generation' | 're_engagement' | 'event_promotion' | 'brand_awareness' | 'candidate_sourcing'
  goal: 'generate_qualified_leads' | 'book_discovery_meetings' | 'drive_event_registrations' | 'build_brand_awareness' | 'expand_candidate_pool'
  description: string

  // Step 2: Target Audience
  audienceSource: 'new_prospects' | 'existing_leads' | 'dormant_accounts' | 'import_list'
  industries: string[]
  companySizes: string[]
  regions: string[]
  fundingStages: string[]
  targetTitles: string[]
  excludeExistingClients: boolean
  excludeRecentlyContacted: number
  excludeCompetitors: boolean

  // Step 3: Channels & Sequences
  channels: ('linkedin' | 'email' | 'phone' | 'event' | 'direct_mail')[]
  emailSteps: number
  emailDaysBetween: number
  linkedinSteps: number
  linkedinDaysBetween: number
  stopOnReply: boolean
  stopOnBooking: boolean
  dailyLimit: number
  sequenceTemplateIds: string[]

  // Step 4: Schedule & Budget
  startDate: string
  endDate: string
  launchImmediately: boolean
  budgetTotal: number
  targetLeads: number
  targetMeetings: number
  targetRevenue: number

  // Step 5: Compliance
  gdpr: boolean
  canSpam: boolean
  casl: boolean
  includeUnsubscribe: boolean
}

interface CreateCampaignStore {
  formData: CreateCampaignFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  clearDraft: () => void
}

const defaultFormData: CreateCampaignFormData = {
  // Step 1
  name: '',
  campaignType: 'lead_generation',
  goal: 'generate_qualified_leads',
  description: '',

  // Step 2
  audienceSource: 'new_prospects',
  industries: [],
  companySizes: [],
  regions: [],
  fundingStages: [],
  targetTitles: [],
  excludeExistingClients: true,
  excludeRecentlyContacted: 90,
  excludeCompetitors: true,

  // Step 3
  channels: ['email'],
  emailSteps: 3,
  emailDaysBetween: 3,
  linkedinSteps: 2,
  linkedinDaysBetween: 5,
  stopOnReply: true,
  stopOnBooking: true,
  dailyLimit: 100,
  sequenceTemplateIds: [],

  // Step 4
  startDate: '',
  endDate: '',
  launchImmediately: true,
  budgetTotal: 0,
  targetLeads: 50,
  targetMeetings: 10,
  targetRevenue: 0,

  // Step 5
  gdpr: true,
  canSpam: true,
  casl: true,
  includeUnsubscribe: true,
}

export const useCreateCampaignStore = create<CreateCampaignStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      clearDraft: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),
    }),
    {
      name: 'create-campaign-draft',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// Export constants (reuse from dialog or define here)
export const CAMPAIGN_TYPES = [
  { value: 'lead_generation', label: 'Lead Generation', description: 'Generate new business leads' },
  { value: 're_engagement', label: 'Re-Engagement', description: 'Reconnect with cold leads' },
  { value: 'event_promotion', label: 'Event Promotion', description: 'Drive event registrations' },
  { value: 'brand_awareness', label: 'Brand Awareness', description: 'Build brand recognition' },
  { value: 'candidate_sourcing', label: 'Candidate Sourcing', description: 'Expand talent pool' },
]

export const GOALS = [
  { value: 'generate_qualified_leads', label: 'Generate Qualified Leads' },
  { value: 'book_discovery_meetings', label: 'Book Discovery Meetings' },
  { value: 'drive_event_registrations', label: 'Drive Event Registrations' },
  { value: 'build_brand_awareness', label: 'Build Brand Awareness' },
  { value: 'expand_candidate_pool', label: 'Expand Candidate Pool' },
]

// ... other constants from CreateCampaignDialog
```

### Step 2: Create Wizard Page

**File**: `src/app/employee/crm/campaigns/new/page.tsx`

Key features:
- URL-based step tracking (`?step=1`)
- Draft recovery banner (if lastSaved exists)
- Uses store for all form state
- Step components extracted from dialog
- Submit calls same tRPC mutation

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateCampaignStore } from '@/stores/create-campaign-store'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

// Step components
import { CampaignSetupStep } from './steps/CampaignSetupStep'
import { TargetAudienceStep } from './steps/TargetAudienceStep'
import { ChannelsStep } from './steps/ChannelsStep'
import { ScheduleBudgetStep } from './steps/ScheduleBudgetStep'
import { ComplianceStep } from './steps/ComplianceStep'

const STEPS = [
  { id: 1, title: 'Campaign Setup', component: CampaignSetupStep },
  { id: 2, title: 'Target Audience', component: TargetAudienceStep },
  { id: 3, title: 'Channels', component: ChannelsStep },
  { id: 4, title: 'Schedule & Budget', component: ScheduleBudgetStep },
  { id: 5, title: 'Compliance', component: ComplianceStep },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '1')

  const { formData, setFormData, setCurrentStep, resetForm, lastSaved, isDirty } = useCreateCampaignStore()

  // Sync URL step with store
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const createCampaign = trpc.crm.campaigns.create.useMutation({
    onSuccess: (data) => {
      toast.success('Campaign created successfully!')
      resetForm()
      router.push(`/employee/crm/campaigns/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create campaign')
    },
  })

  const handleSubmit = () => {
    // Build payload from formData (same as dialog)
    createCampaign.mutate({
      name: formData.name,
      campaignType: formData.campaignType,
      // ... rest of fields
    })
  }

  const handleCancel = () => {
    if (isDirty) {
      // Optionally confirm - draft is preserved automatically
      toast.info('Draft saved. You can continue later.')
    }
    router.push('/employee/crm/campaigns')
  }

  const StepComponent = STEPS[currentStep - 1]?.component

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Draft Recovery Banner */}
      {lastSaved && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Draft saved {new Date(lastSaved).toLocaleString()}
          </span>
          <button
            onClick={resetForm}
            className="text-sm text-blue-600 hover:underline"
          >
            Discard draft
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold">Create New Campaign</h1>
        <p className="text-charcoal-500">Set up a new outreach campaign</p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      {StepComponent && (
        <StepComponent
          formData={formData}
          setFormData={setFormData}
          onNext={() => navigateToStep(currentStep + 1)}
          onPrev={() => navigateToStep(currentStep - 1)}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isFirst={currentStep === 1}
          isLast={currentStep === STEPS.length}
          isSubmitting={createCampaign.isPending}
        />
      )}
    </div>
  )
}
```

### Step 3: Update Config to Use href

**File**: `src/configs/entities/campaigns.config.ts`

```diff
  primaryAction: {
    label: 'New Campaign',
    icon: Plus,
-   onClick: () => {
-     window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'create' } }))
-   },
+   href: '/employee/crm/campaigns/new',
  },
```

Also update `emptyState.action`:

```diff
  emptyState: {
    icon: Megaphone,
    title: 'No campaigns found',
    description: (filters) =>
      filters.search
        ? 'Try adjusting your search or filters'
        : 'Create your first campaign to start generating leads',
    action: {
      label: 'Create Campaign',
-     onClick: () => {
-       window.dispatchEvent(new CustomEvent('openCampaignDialog', { detail: { dialogId: 'create' } }))
-     },
+     href: '/employee/crm/campaigns/new',
    },
  },
```

### Step 4: Create Step Components

Extract step UI from `CreateCampaignDialog.tsx` into separate files:

```
src/app/employee/crm/campaigns/new/steps/
├── CampaignSetupStep.tsx      # Step 1: name, type, goal
├── TargetAudienceStep.tsx     # Step 2: audience filters
├── ChannelsStep.tsx           # Step 3: email/linkedin config
├── ScheduleBudgetStep.tsx     # Step 4: dates, budget
├── ComplianceStep.tsx         # Step 5: gdpr, canSpam
└── StepIndicator.tsx          # Shared step indicator
```

Each step component receives:
```typescript
interface StepProps {
  formData: CreateCampaignFormData
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onCancel: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting: boolean
}
```

### Step 5: Export Store from Index

**File**: `src/stores/index.ts`

```typescript
export { useCreateCampaignStore } from './create-campaign-store'
```

---

## Persistence Behavior

| Scenario | Behavior |
|----------|----------|
| Close tab/browser | Draft preserved in localStorage |
| Refresh page | Form data restored, step preserved |
| Navigate away | Draft preserved |
| Click Cancel | Draft preserved (with toast notification) |
| Submit successfully | Draft cleared, redirect to campaign |
| Click "Discard draft" | Draft cleared, form reset |
| Logout | localStorage cleared (browser default) |

---

## Testing Checklist

- [ ] Click "New Campaign" navigates to `/employee/crm/campaigns/new`
- [ ] Step navigation via URL `?step=N` works
- [ ] Form data persists on refresh
- [ ] Form data persists on navigation away and back
- [ ] Draft recovery banner shows with last saved time
- [ ] "Discard draft" clears form
- [ ] Cancel returns to list with draft preserved
- [ ] Submit creates campaign and clears draft
- [ ] Redirect to new campaign detail page after submit
- [ ] Empty state "Create Campaign" button works

---

## Migration Notes

1. **Keep CreateCampaignDialog**: Don't delete - it may be used elsewhere or for quick inline creation
2. **Dialog still useful**: For detail page "Duplicate Campaign" action
3. **Backward compatible**: Old event pattern can coexist if needed

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Create Zustand store | 30 min |
| Create wizard page | 1 hour |
| Extract 5 step components | 1.5 hours |
| Update config | 10 min |
| Testing | 30 min |
| **Total** | ~3.5 hours |

---

## Success Criteria

1. Clicking "New Campaign" opens wizard page
2. Form persists across refresh/navigation
3. User can resume draft next day
4. Matches existing wizard patterns (account onboarding, job intake)
