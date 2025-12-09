---
date: 2025-12-08T21:12:28-05:00
researcher: Claude
git_commit: bfba1ba
branch: main
repository: intime-v3
topic: "Guidewire-Inspired PCF Architecture - Current State Analysis"
tags: [research, codebase, pcf, ui-components, entity-list-view, entity-detail-view, wizard, navigation]
status: complete
last_updated: 2025-12-08
last_updated_by: Claude
---

# Research: Guidewire-Inspired PCF Architecture - Current State Analysis

**Date**: 2025-12-08T21:12:28-05:00
**Researcher**: Claude
**Git Commit**: bfba1ba
**Branch**: main
**Repository**: intime-v3

## Research Question

What is the current state of the codebase in relation to the proposed PCF (Page Configuration Framework) architecture specification defined in `thoughts/shared/issues/ui-components`? Document existing implementations of ListView, DetailView, Wizard, and Form patterns to understand what exists and how it relates to the specification.

## Summary

The codebase already implements many patterns that align with the proposed PCF architecture, but they are **distributed across individual components** rather than centralized into reusable configuration-driven components. Key findings:

1. **8 ListView implementations** exist with similar patterns but separate codebases
2. **Section-based detail pages** exist for accounts, campaigns, contacts with inline panels
3. **2 fully-implemented wizards** (Job Intake 5-step, Account Onboarding 6-step) + 5 store-only wizards
4. **Dual navigation system** (journey vs sections) is well-architected
5. **24+ UI widget components** exist in `src/components/ui/`
6. **Status/entity configurations** are scattered inline rather than centralized

## Detailed Findings

### 1. ListView Implementations

**8 list components** found with common patterns but separate implementations:

| Component | File Path | Layout | Stats | Filters | Inline Panel |
|-----------|-----------|--------|-------|---------|--------------|
| AccountsListClient | `src/components/recruiting/accounts/AccountsListClient.tsx` | Table | 4 cards | Search, Status | No |
| JobsListClient | `src/components/recruiting/jobs/JobsListClient.tsx` | Cards | 5 cards | Search, Status | No |
| CandidatesListClient | `src/components/recruiting/candidates/CandidatesListClient.tsx` | Cards | 4 cards | Search, Status, Visa, Hotlist | No |
| LeadsListClient | `src/components/crm/leads/LeadsListClient.tsx` | Cards | 5 cards | Search, Status, Source | No |
| PlacementsListClient | `src/components/recruiting/placements/PlacementsListClient.tsx` | Table | 6 cards | Search, Status, Health | No |
| GdprRequestsList | `src/components/admin/data/GdprRequestsList.tsx` | Cards | No | Status | Yes |
| InterviewsList | `src/components/recruiting/interviews/InterviewsList.tsx` | Cards | No | No | Yes (feedback) |
| PendingFeedbackList | `src/components/recruiting/interviews/PendingFeedbackList.tsx` | Table | No | No | Yes (feedback) |

**Common Patterns Found:**

```typescript
// URL State Management Pattern (AccountsListClient.tsx:141-165)
const [searchParams] = useSearchParams()
const router = useRouter()
const updateFilters = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set(key, value)
  router.replace(`?${params.toString()}`)
}

// tRPC Data Fetching Pattern (JobsListClient.tsx:85-97)
const { data, isLoading } = trpc.ats.jobs.list.useQuery({
  search, status, limit: 50, offset: 0
}, {
  initialData: { jobs: initialJobs, total: initialTotal },
  enabled: search !== initialSearch || status !== initialStatus,
})

// Stats Query Pattern (LeadsListClient.tsx:149-152)
const statsQuery = trpc.crm.leads.getStats.useQuery(
  { period: 'month' },
  { staleTime: 60 * 1000 }
)

// Empty State Pattern (all list components)
{items.length === 0 && (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-charcoal-400" />
    <h3>No items found</h3>
    {!hasFilters && <Button>Create New</Button>}
  </div>
)}
```

**Key Files:**
- `src/components/recruiting/accounts/AccountsListClient.tsx`
- `src/components/recruiting/jobs/JobsListClient.tsx`
- `src/components/recruiting/candidates/CandidatesListClient.tsx`
- `src/components/crm/leads/LeadsListClient.tsx`
- `src/components/recruiting/placements/PlacementsListClient.tsx`

---

### 2. DetailView Implementations

**Two primary patterns exist:**

#### Pattern A: Section-Based Navigation (URL query param)

Used by: Accounts, Campaigns, Contacts, Deals, Leads

```typescript
// Campaign Detail Page (CampaignDetailPage.tsx:105)
const currentSection = searchParams.get('section') || 'overview'

// Section Rendering (CampaignDetailPage.tsx:240-298)
const renderSection = () => {
  switch (currentSection) {
    case 'activities': return <CampaignActivitiesSection campaignId={campaignId} />
    case 'documents': return <CampaignDocumentsSection campaignId={campaignId} />
    case 'notes': return <CampaignNotesSection campaignId={campaignId} />
    case 'overview':
    default: return <CampaignOverviewSection campaignId={campaignId} campaign={campaign} />
  }
}
```

**Section Sidebar Components:**
- `src/components/navigation/AccountSectionSidebar.tsx` - 9 sections
- `src/components/navigation/CampaignSectionSidebar.tsx` - 5 sections + metrics
- `src/components/navigation/ContactSectionSidebar.tsx` - 7 sections
- `src/components/navigation/SectionSidebar.tsx` - Generic for list views

#### Pattern B: Journey-Based Navigation (workflow steps)

Used by: Jobs, Candidates, Submissions, Placements

```typescript
// EntityJourneySidebar.tsx:33-55
const stepsWithState = useMemo(() => {
  return journeyConfig.steps.map((step, index) => ({
    ...step,
    isCompleted: step.completedStatuses.includes(entityStatus),
    isActive: step.activeStatuses.includes(entityStatus),
  }))
}, [journeyConfig, entityStatus])
```

**Journey Configuration** (`src/lib/navigation/entity-journeys.ts`):
- Job Journey: 6 steps (Info → Sourcing → Pipeline → Interviews → Offers → Placement)
- Candidate Journey: 4 steps (Profile → Screening → Submissions → Placed)
- Submission Journey: 7 steps (Sourced → Screening → Submission → Review → Interview → Offer → Placed)

**Key Files:**
- `src/components/crm/campaigns/CampaignDetailPage.tsx`
- `src/app/employee/recruiting/accounts/[id]/page.tsx`
- `src/components/navigation/EntityJourneySidebar.tsx`
- `src/lib/navigation/entity-journeys.ts`
- `src/lib/navigation/entity-sections.ts`

---

### 3. Header Patterns

**Campaign Header** (`CampaignDetailPage.tsx:304-583`):
- Breadcrumb navigation
- Title + status badge with icon
- Meta info bar (date range, audience, channels)
- Quick actions (Start/Pause/Resume, Complete, More dropdown)
- Sticky key metrics bar (Contacted, Response Rate, Leads, Meetings)

**Account Header** (`accounts/[id]/page.tsx:168-258`):
- Quick contact info bar (website, phone, location, tier)
- Action buttons (Log Activity, Schedule Meeting, More dropdown)

**Pattern:**
```typescript
// Status Badge Pattern (CampaignDetailPage.tsx:63-94)
const statusConfig = {
  active: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: Zap,
    label: 'Active'
  },
  // ... more statuses
}
```

---

### 4. Inline Panel Pattern

**Base Component** (`src/components/ui/inline-panel.tsx`):

```typescript
interface InlinePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode      // Footer actions (Save/Cancel)
  headerActions?: React.ReactNode // Edit button
  width?: 'sm' | 'md' | 'lg' | 'xl'
}

// Width options (lines 20-25)
const widths = {
  sm: 'w-80',   // 320px
  md: 'w-96',   // 384px (default)
  lg: 'w-[480px]',
  xl: 'w-[560px]',
}
```

**Implementations Found:**
- `ActivityInlinePanel.tsx` - View/edit activities
- `ContactInlinePanel.tsx` - View/edit contacts
- `NoteInlinePanel.tsx` - View/edit notes
- `MeetingInlinePanel.tsx` - View/edit meetings (xl width)
- `DocumentInlinePanel.tsx` - View/edit documents
- `LeadInlinePanel.tsx` - View/edit leads
- `CampaignActivityInlinePanel.tsx` - Campaign-specific activities

**Integration Pattern:**
```typescript
// List + Panel Layout (AccountContactsSection.tsx:40-124)
<div className="flex gap-4">
  <div className={cn(
    'flex-1 transition-all duration-300',
    selectedId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
  )}>
    {/* List content */}
  </div>
  <ContactInlinePanel
    contactId={selectedId}
    accountId={accountId}
    onClose={() => setSelectedId(null)}
  />
</div>
```

**Key Files:**
- `src/components/ui/inline-panel.tsx`
- `src/components/recruiting/accounts/ActivityInlinePanel.tsx`
- `src/components/recruiting/accounts/ContactInlinePanel.tsx`
- `src/components/crm/leads/LeadInlinePanel.tsx`

---

### 5. Wizard Implementations

**Fully Implemented Wizards:**

| Wizard | Steps | Store | URL Navigation | Location |
|--------|-------|-------|----------------|----------|
| Job Intake | 5 | `job-intake-store.ts` | `?step=N` | `/employee/recruiting/jobs/intake` |
| Account Onboarding | 6 | `account-onboarding-store.ts` | `?step=N` | `/employee/recruiting/accounts/[id]/onboarding` |
| Simple Account Creation | 3 | Local state | No | `/employee/recruiting/accounts/new` |

**Store-Only (No UI):**
- `create-job-store.ts` - 3 steps implied
- `extend-offer-store.ts` - Tab-based (rates/schedule/benefits)
- `schedule-interview-store.ts` - 3 steps
- `terminate-placement-store.ts` - 3 steps
- `submit-to-client-store.ts` - Named steps (rates/notes/review)

**Wizard Architecture Pattern:**

```typescript
// URL-based navigation (job-intake/page.tsx:140-144)
const navigateToStep = (step: number) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set('step', step.toString())
  router.push(`?${params.toString()}`, { scroll: false })
}

// Zustand store with persistence (job-intake-store.ts:207-215)
export const useJobIntakeStore = create<JobIntakeStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        isDirty: true,
        lastSaved: new Date(),
      })),
      // ...
    }),
    { name: 'job-intake-form', partialize: (state) => ({ formData: state.formData }) }
  )
)

// Per-step validation (job-intake/page.tsx:96-138)
const validateStep = (step: number): boolean => {
  const errors: string[] = []
  switch (step) {
    case 1:
      if (!formData.accountId) errors.push('Please select an account')
      if (!formData.title || formData.title.length < 3) errors.push('Title required')
      break
    // ... more steps
  }
  if (errors.length) { toast.error(errors[0]); return false }
  return true
}
```

**Key Files:**
- `src/app/employee/recruiting/jobs/intake/page.tsx`
- `src/stores/job-intake-store.ts`
- `src/components/recruiting/jobs/intake/IntakeStep1BasicInfo.tsx` (and Step2-5)
- `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx`
- `src/stores/account-onboarding-store.ts`

---

### 6. UI Widget Components

**24+ components in `src/components/ui/`:**

| Component | File | Key Features |
|-----------|------|--------------|
| Button | `button.tsx` | 9 variants (default, premium, gold, glass, etc.), 4 sizes |
| Input | `input.tsx` | 5 variants, icon support, error/success states |
| Select | `select.tsx` | Radix UI wrapper, gold accents |
| Textarea | `textarea.tsx` | Character counter, variants |
| Badge | `badge.tsx` | 6 variants (default, success, warning, destructive, etc.) |
| Card | `card.tsx` | Header, Content, Footer, Title, Description |
| Table | `table.tsx` | Header, Body, Row, Cell, Footer |
| Tabs | `tabs.tsx` | Radix wrapper, gold active state |
| Dialog | `dialog.tsx` | Modal with overlay, portal rendering |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialogs |
| DropdownMenu | `dropdown-menu.tsx` | Full menu with items, checkboxes, radio |
| InlinePanel | `inline-panel.tsx` | Slide-in panel with sections |
| EditableInfoCard | `editable-info-card.tsx` | In-place editing with validation |
| FormField | `form-field.tsx` | Label, error, hint wrapper |
| Checkbox | `checkbox.tsx` | Radix wrapper |
| Switch | `switch.tsx` | Toggle with gold accent |
| RadioGroup | `radio-group.tsx` | Radix wrapper |
| Popover | `popover.tsx` | Tooltip-style popover |
| Tooltip | `tooltip.tsx` | Hover tooltips |
| Avatar | `avatar.tsx` | Image + fallback initials |
| Separator | `separator.tsx` | Horizontal/vertical dividers |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| Progress | `progress.tsx` | Progress bar |

**EditableInfoCard Pattern** (`editable-info-card.tsx`):
```typescript
interface FieldDefinition {
  key: string
  label: string
  type: 'text' | 'email' | 'phone' | 'url' | 'number' | 'currency' | 'date' | 'select' | 'textarea' | 'checkbox'
  options?: SelectOption[]
  required?: boolean
  placeholder?: string
  readOnly?: boolean
  formatValue?: (value: unknown) => string
}

// Usage
<EditableInfoCard
  title="Company Details"
  fields={[
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'select', options: INDUSTRY_OPTIONS },
  ]}
  data={account}
  onSave={handleSave}
  columns={2}
/>
```

**Key Files:**
- `src/components/ui/button.tsx`
- `src/components/ui/inline-panel.tsx`
- `src/components/ui/editable-info-card.tsx`

---

### 7. Entity Configuration Patterns

**Current State: Configurations are scattered across components**

#### Status Configurations (inline in components)

```typescript
// JobsListClient.tsx:33-42
const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; description: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700', description: 'Not yet published' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', description: 'Ready for sourcing' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', description: 'Actively recruiting' },
  // ...
}

// Valid Transitions (UpdateStatusDialog.tsx:45-52)
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['active', 'on_hold', 'cancelled', 'filled'],
  // ...
}
```

#### Centralized Entity Schema (data management only)

**File**: `src/lib/data-management/entities.ts`

```typescript
export interface EntityConfig {
  name: string
  table: string
  displayName: string
  importable: boolean
  exportable: boolean
  fields: FieldConfig[]
  uniqueConstraints: string[][]
  foreignKeys: ForeignKeyConfig[]
}

// Used for import/export, NOT for UI rendering
```

#### Navigation Configurations (centralized)

**File**: `src/lib/navigation/entity-journeys.ts`
- Journey steps for each entity type
- Status-dependent quick actions
- Active/completed status mappings

**File**: `src/lib/navigation/entity-sections.ts`
- Section definitions per entity type
- Count/alert flags

**File**: `src/lib/navigation/entity-navigation.types.ts`
- Entity type enum
- Navigation style mapping (journey vs sections)
- Base paths

#### Zod Validation Schemas (inline in routers)

```typescript
// src/server/routers/ats.ts:20-24
const jobStatusEnum = z.enum(['draft', 'open', 'active', 'on_hold', 'filled', 'cancelled'])
const jobTypeEnum = z.enum(['contract', 'permanent', 'contract_to_hire', 'temp', 'sow'])

// src/server/routers/activities.ts:11-15
const ActivityTypeEnum = z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message', 'task', 'follow_up'])
```

**Key Files:**
- `src/lib/data-management/entities.ts` - Data import/export schemas
- `src/lib/navigation/entity-journeys.ts` - Journey configurations
- `src/lib/navigation/entity-sections.ts` - Section configurations
- `src/server/routers/ats.ts` - Zod schemas for jobs/submissions
- `src/server/routers/crm.ts` - Zod schemas for CRM entities

---

### 8. Layout System

**SidebarLayout** (`src/components/layouts/SidebarLayout.tsx`):

```typescript
// Sidebar selection logic (lines 200-302)
if (currentEntity) {
  if (entityType === 'job' && viewMode === 'sections') return <JobSectionSidebar />
  if (entityType === 'contact') return <ContactSectionSidebar />
  if (entityType === 'campaign') return <CampaignSectionSidebar />
  if (navStyle === 'sections') return <AccountSectionSidebar /> // accounts, deals, leads
  if (navStyle === 'journey') return <EntityJourneySidebar />
} else {
  return <SectionSidebar /> // List views
}
```

**EntityContextProvider** (`src/components/layouts/EntityContextProvider.tsx`):
- Sets current entity in navigation context
- Adds to recent entities list
- Shares server-fetched data with children

**EntityNavigationContext** (`src/lib/navigation/EntityNavigationContext.tsx`):
- Stores current entity (type, id, name, status)
- Tracks recent entities per type (max 5, persisted to localStorage)
- Derives current journey step from status

**Key Files:**
- `src/components/layouts/SidebarLayout.tsx`
- `src/components/layouts/EntityContextProvider.tsx`
- `src/lib/navigation/EntityNavigationContext.tsx`

---

## Code References

### ListView Files
- `src/components/recruiting/accounts/AccountsListClient.tsx` - Table layout with health stats
- `src/components/recruiting/jobs/JobsListClient.tsx` - Card layout with stats
- `src/components/recruiting/candidates/CandidatesListClient.tsx` - Card layout with hotlist toggle
- `src/components/crm/leads/LeadsListClient.tsx` - Card layout with BANT scores
- `src/components/recruiting/placements/PlacementsListClient.tsx` - Table with health indicators

### DetailView Files
- `src/components/crm/campaigns/CampaignDetailPage.tsx` - Full section-based detail page
- `src/app/employee/recruiting/accounts/[id]/page.tsx` - Account detail with event-driven dialogs
- `src/components/recruiting/jobs/sections/JobOverviewSection.tsx` - Section component pattern

### Wizard Files
- `src/app/employee/recruiting/jobs/intake/page.tsx` - 5-step job intake
- `src/stores/job-intake-store.ts` - Zustand store with 80+ fields
- `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx` - 6-step onboarding

### Navigation Files
- `src/lib/navigation/entity-journeys.ts:11-758` - Journey step configurations
- `src/lib/navigation/entity-sections.ts:31-128` - Section definitions
- `src/components/navigation/EntityJourneySidebar.tsx` - Journey UI component
- `src/components/navigation/AccountSectionSidebar.tsx` - Section UI component

### UI Widget Files
- `src/components/ui/inline-panel.tsx` - Slide-in panel base
- `src/components/ui/editable-info-card.tsx` - In-place editing
- `src/components/ui/button.tsx` - 9 variants

## Architecture Documentation

### Current Patterns That Align with PCF Specification

1. **Navigation System**: Well-architected dual navigation (journey vs sections) with centralized configuration
2. **Inline Panels**: Replace modals for entity details, width options, view/edit modes
3. **EditableInfoCard**: Config-driven in-place editing with field definitions
4. **Wizard Stores**: Zustand persistence, URL-based steps, per-step validation
5. **Status Badge Pattern**: Consistent color/icon mapping across entities
6. **Event-Driven Communication**: Sidebar dispatches events, pages handle dialogs

### Patterns That Would Need Centralization for PCF

1. **ListView Configurations**: Currently inline in each component
   - Stats cards, filters, columns, empty states, row actions defined separately per component

2. **Status Configurations**: Scattered across components
   - No centralized `JOB_STATUS_CONFIG` importable by multiple components

3. **Column Definitions**: Inline in list components
   - No shared column renderer or config format

4. **Filter Configurations**: Inline in list components
   - No reusable filter component with config

5. **Form Field Rendering**: Mixed approaches
   - EditableInfoCard has config pattern
   - Wizard steps use inline JSX

## Historical Context (from thoughts/)

Related research documents:
- `thoughts/shared/research/2025-12-08-guidewire-ui-architecture-current-state.md` - Navigation system analysis
- `thoughts/shared/research/2025-12-08-campaign-workspace-system.md` - Campaign patterns

## Open Questions

1. **Migration Strategy**: Should new PCF components replace existing or wrap them? --> replace
2. **Configuration Location**: `src/configs/entities/` vs inline vs navigation files? --> lets have centralized like guidewre eactly
3. **Type Generation**: Should entity configs generate TypeScript types? --> 
4. **Lazy Loading**: How to handle lazy loading of section components in config? --> 
5. **Store Integration**: Should PCF components own their own stores or accept external state? --> 



***Guidewire Notes:
Below is the **clear, interview-ready explanation of Guidewire Screen Hierarchy**, based directly on PolicyCenter / ClaimCenter UI structure documented in the **Application Guides** (screens, tabs, wizards, list views, layout settings, etc.).
I’ll keep it crisp and correct for interviews.

---

# ⭐ **Guidewire Screen Hierarchy (PolicyCenter / ClaimCenter / BillingCenter)**

*(How the UI is structured internally and how screens relate to each other)*

Guidewire UI follows **a strict hierarchical layout**, defined via **PCF files**.
The same hierarchy pattern exists across **PolicyCenter**, **ClaimCenter**, and **BillingCenter**.

---

# ✅ **1. Top-Level UI Hierarchy**

### **1. Application → Tabs → Screens → Panels → Widgets**

Every Guidewire screen is organized like this:

```
Application
   ├── Tabs (Desktop, Account, Policy, Search, Admin, etc.)
   │     ├── Screens
   │     │     ├── Panels / PanelSets
   │     │     │     ├── Sections / Detail Views
   │     │     │     │     ├── Widgets (Input fields, Buttons, Lists)
```

This hierarchy is confirmed in the **PolicyCenter Application Guide** under UI navigation and screen layout sections.
Example from PolicyCenter’s UI structure: Tabs such as *Desktop, Account, Policy, Contact, Search, Admin* are top-level navigation components. 

---

# ✅ **2. TAB LEVEL**

Tabs represent top-level entities in the application.

### **PolicyCenter Tabs** include:

(From Application Guide – Navigating PolicyCenter)

* Desktop
* Account
* Policy
* Contact
* Reinsurance
* Search
* Team
* Administration


### **ClaimCenter Tabs** similarly include:

* Desktop
* Claim
* Search
* Address Book
* Team
* Admin


### **BillingCenter Tabs:**

* Desktop
* Account
* Policy
* Producer
* Search
* Administration

---

# ✅ **3. SCREEN LEVEL**

Each tab contains **multiple screens or pages**, implemented via `.pcf` files.

Examples:

### PolicyCenter → Account Tab → Screens:

* Account Summary
* Account Contacts
* Policies
* Documents


### ClaimCenter → Claim Tab → Screens:

* Summary
* Loss Details
* Exposures
* Financials
* Documents
* History


---

# ✅ **4. PANELSET / PANEL LEVEL**

Inside each screen PCF, Guidewire uses:

* **PanelSet** (multi-section layout)
* **DetailView** (form layout for entities)
* **ListView** (table format with sortable columns)
  (Documented in “Changing screen layout → List views”) 

Example hierarchy inside a screen:

```
AccountSummary.pcf
   ├── PanelSet.AccountSummaryDV
       ├── AccountInfoDV
       ├── RelatedPoliciesLV
       ├── ActivitiesLV
```

---

# ✅ **5. WIDGET LEVEL**

Each panel contains UI widgets:

* TextInput
* SelectInput
* DateInput
* BooleanCheckbox
* Buttons
* Links
* ListView columns
  (Defined under “Data entry support for input fields”) 

---

# ✅ **6. WIZARD LEVEL (For Transactions)**

PolicyCenter screens used for transactions (Submission, Renewal, Rewrite, Policy Change) are built using **wizard PCF files**.

A wizard hierarchy:

```
SubmissionWizard.pcf
   ├── Step1: Offerings
   ├── Step2: Pre-Qual
   ├── Step3: Policy Info
   ├── Step4: Risk Analysis
   ├── Step5: Forms
   ├── Step6: Quote
```

Documented in **PolicyCenter – Submission Flow** sections. 

---

# ✅ **7. INTERNAL PCF FILE STRUCTURE (Important for Developers)**

Every screen is backed by a **PCF file**, which follows this structure:

```
<pcf>
  <PanelSet>
      <Panel>
          <DetailView / ListView>
              <Input / Output / Button / Toolbar / Iterator>
```

PCF locations (not in docs but important):

```
/pcf/claim/
/pcf/policy/
/pcf/account/
/pcf/admin/
```

---

