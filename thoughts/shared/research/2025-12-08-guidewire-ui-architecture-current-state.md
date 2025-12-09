---
date: 2025-12-08T15:47:50Z
researcher: Claude
git_commit: 6f15b8b
branch: main
repository: intime-v3
topic: "Guidewire-Inspired UI Architecture - Current Implementation State"
tags: [research, codebase, ui-architecture, guidewire, navigation, activities, inline-panels, workspace, forms]
status: complete
last_updated: 2025-12-08
last_updated_by: Claude
---

# Research: Guidewire-Inspired UI Architecture - Current Implementation State

**Date**: 2025-12-08T15:47:50Z
**Researcher**: Claude
**Git Commit**: 6f15b8b
**Branch**: main
**Repository**: intime-v3

## Research Question

Document the current state of the Guidewire-inspired UI architecture in InTime v3, including navigation system, screen patterns, activity system, inline panels/forms, and workspace system. This research is to inform CLAUDE.md and project documentation updates.

## Summary

InTime v3 has implemented a comprehensive **Guidewire PolicyCenter-inspired architecture** with:

1. **Top Navigation** with entity-specific tabs, dropdowns, and recent entities (last 5 per type)
2. **Dual Navigation Styles**: Journey-based (workflow entities) and Section-based (information entities)
3. **Inline Panels** replacing modal dialogs for detail views (Guidewire pattern)
4. **Inline Forms** for creating activities/notes without leaving context
5. **Editable Info Cards** for in-place editing
6. **Page-based Wizards** with URL step tracking and Zustand state management
7. **Desktop/Workspace** with "My X" tables and summary metrics

---

## 1. Navigation System

### 1.1 Top Navigation

**Files**:
- `src/lib/navigation/top-navigation.ts:10-171` - Configuration
- `src/components/navigation/TopNavigation.tsx:1-589` - Component

**8 Top-Level Tabs**:
1. **My Work** (workspace) - Dashboard, today, activities
2. **Accounts** - Account search and recent
3. **Contacts** - Contact management
4. **Jobs** - Job requisitions
5. **Candidates** - Talent database
6. **CRM** - Leads and deals
7. **Pipeline** - Submissions, interviews, offers
8. **Administration** - System settings

**Dropdown Features**:
- Recent entities (last 5) per type with timestamps
- Search field in dropdown
- Quick action links
- Tab click navigates to most recent entity (if exists)

### 1.2 Navigation Styles

**File**: `src/lib/navigation/entity-navigation.types.ts:20-29`

Two distinct navigation patterns:

| Style | Entities | Use Case |
|-------|----------|----------|
| **Journey** | job, candidate, submission, placement | Sequential workflow |
| **Sections** | account, contact, deal, lead | Information categories |

### 1.3 Journey-Based Navigation

**Files**:
- `src/lib/navigation/entity-journeys.ts:1-705` - Journey configurations
- `src/components/navigation/EntityJourneySidebar.tsx:1-281` - Component

**Job Journey Steps** (6 steps):
1. Job Info (draft)
2. Sourcing (open)
3. Pipeline (active)
4. Interviews (active)
5. Offers (active)
6. Placement (filled)

**Visual Indicators**:
- Completed: Green circle with checkmark
- Current: Gold circle with number, highlighted
- Future: Gray circle with number
- Connector lines between steps

**Quick Actions**: Status-dependent visibility via `showForStatuses`/`hideForStatuses`

### 1.4 Section-Based Navigation

**Files**:
- `src/lib/navigation/entity-sections.ts:1-107` - Section definitions
- `src/components/navigation/AccountSectionSidebar.tsx:1-248` - Account sidebar
- `src/components/navigation/ContactSectionSidebar.tsx:1-229` - Contact sidebar
- `src/components/navigation/JobSectionSidebar.tsx:1-263` - Job sidebar

**Account Sections** (9 sections):
1. Overview
2. Contacts (with count)
3. Jobs (with count)
4. Placements (with count)
5. Documents
6. Activities
7. Notes (with count)
8. Meetings (with count)
9. Escalations (with count, alert styling)

**Section URL Pattern**: `?section=overview`

### 1.5 Navigation Context

**File**: `src/lib/navigation/EntityNavigationContext.tsx:1-151`

State management for:
- Current entity (type, id, name, status, subtitle)
- Current step (for journey navigation)
- Recent entities (persisted to localStorage, max 5 per type)

---

## 2. Screen/Page Architecture

### 2.1 Detail Page Patterns

**Account Detail** (`src/app/employee/recruiting/accounts/[id]/page.tsx:82-331`):
- Uses `?section=` query param for active section
- Data from server layout via `EntityContextProvider`
- Each section component fetches own data when rendered (lazy loading)
- Inline panels for detail views (Guidewire pattern)

**Job Detail** (`src/app/employee/recruiting/jobs/[id]/page.tsx:61-571`):
- **Dual View Mode**: Journey (default) or Sections (`?view=sections`)
- Toggle UI in header to switch between modes
- Journey view uses tabs (overview, pipeline, activity)
- Sections view uses section sidebar like accounts

### 2.2 Section Components

**Location**: `src/components/recruiting/accounts/sections/`

**Architecture Comment** (line 1-3 in all sections):
```typescript
// Account Section Components - Guidewire Architecture Pattern
// Each section is isolated with its own self-contained data fetching
// DB calls only fire when the section is rendered (tab is active)
```

**Section Types**:
1. **List with Inline Panel**: ContactsSection, ActivitiesSection, NotesSection, MeetingsSection, DocumentsSection
2. **Dashboard Layout**: OverviewSection (multi-column with editable cards)
3. **Simple List**: JobsSection, PlacementsSection, EscalationsSection (clickable links)

**Width Transition Pattern** (when panel opens):
```typescript
<div className={cn(
  'flex-1 transition-all duration-300',
  selectedId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
)}>
```

### 2.3 List Page Patterns

**Server-Client Pattern** (`src/app/employee/recruiting/accounts/page.tsx:15-46`):
1. Server component fetches initial data with `Promise.all()`
2. Passes to client component as initial props
3. Client uses data immediately (no duplicate fetch)
4. Wrapped in Suspense with skeleton fallback

### 2.4 Layout System

**File**: `src/components/layouts/SidebarLayout.tsx:70-219`

**Sidebar Selection Logic**:
1. Check for `currentEntity` in context
2. For jobs: check `?view=sections` URL param
3. Use `ENTITY_NAVIGATION_STYLES[entityType]` to determine style
4. Select appropriate sidebar component

**Sidebar Components**:
- `EntityJourneySidebar` - Journey entities
- `AccountSectionSidebar` - Accounts, deals, leads
- `JobSectionSidebar` - Jobs in sections mode
- `ContactSectionSidebar` - Contacts
- `SectionSidebar` - List pages (fallback)

---

## 3. Inline Panel Pattern (Guidewire Architecture)

### 3.1 Base InlinePanel Component

**File**: `src/components/ui/inline-panel.tsx:1-151`

**Width Options**:
- `sm`: 320px
- `md`: 384px
- `lg`: 480px (most common)
- `xl`: 560px

**Features**:
- Slides in from right with animation
- Escape key closes panel
- Header with title, description, actions
- Scrollable content area
- Optional footer with actions

**Sub-components**:
- `InlinePanelHeader`
- `InlinePanelContent`
- `InlinePanelSection`

### 3.2 Inline Panel Implementations

**Files in** `src/components/recruiting/accounts/`:

| Component | Purpose | Width |
|-----------|---------|-------|
| `ActivityInlinePanel.tsx` | Activity details | lg (480px) |
| `ContactInlinePanel.tsx` | Contact details | lg (480px) |
| `NoteInlinePanel.tsx` | Note details | lg (480px) |
| `MeetingInlinePanel.tsx` | Meeting details | xl (560px) |
| `DocumentInlinePanel.tsx` | Document details | xl (560px) |

**Common Pattern**:
1. Two modes: View and Edit
2. `isEditing` state toggles between modes
3. Edit button in header (view mode)
4. Save/Cancel/Delete in footer (edit mode)
5. Delete requires confirmation dialog
6. Query invalidation on mutation success

### 3.3 Integration with Sections

**Example** (`AccountContactsSection.tsx:48-119`):
```typescript
<div className="flex gap-4">
  {/* List area - shrinks when panel open */}
  <div className={cn('flex-1 transition-all', selectedId ? 'max-w-[calc(100%-496px)]' : '')}>
    {items.map(item => <Card onClick={() => setSelectedId(item.id)} />)}
  </div>

  {/* Inline panel - appears when item selected */}
  {selectedId && (
    <ContactInlinePanel contactId={selectedId} onClose={() => setSelectedId(null)} />
  )}
</div>
```

---

## 4. Inline Form Pattern

### 4.1 Inline Form Components

**Files in** `src/components/recruiting/accounts/`:

| Component | Purpose |
|-----------|---------|
| `InlineActivityForm.tsx` | Log activities inline |
| `InlineNoteForm.tsx` | Add notes inline |

### 4.2 Common Pattern

**Collapsed State**: Shows "+ Log Activity" or "+ Add Note" button
**Expanded State**: Full form with fields

**InlineActivityForm Features** (`src/components/recruiting/accounts/InlineActivityForm.tsx:41-322`):
- Activity type selection (call, email, meeting, note, task, linkedin_message)
- Subject field (required)
- Description textarea
- "Show More" toggle for additional fields
- Contact dropdown (only when expanded)
- Outcome dropdown
- Duration (for calls/meetings only)

**Submission Pattern**:
1. Validate required fields
2. Call tRPC mutation
3. Invalidate related queries
4. Reset form and collapse
5. Show success toast

---

## 5. Editable Info Card Pattern

### 5.1 EditableInfoCard Component

**File**: `src/components/ui/editable-info-card.tsx:1-444`

**Field Types Supported**:
- text, email, phone, url
- number, currency, date
- select, textarea, checkbox

**Features**:
- Declarative field definition with validation
- View mode: Formatted display
- Edit mode: Form inputs
- Save/Cancel buttons
- Field-level error display
- Column layout options (1, 2, or 3)

### 5.2 Usage Example

**AccountOverviewSection** (`src/components/recruiting/accounts/sections/AccountOverviewSection.tsx:193-199`):

```typescript
<EditableInfoCard
  title="Company Details"
  fields={companyDetailsFields}
  data={account}
  onSave={handleSaveCompanyDetails}
  columns={2}
/>
```

**Field Definition** (lines 66-85):
```typescript
const companyDetailsFields: FieldDefinition[] = [
  { key: 'name', label: 'Company Name', type: 'text', required: true },
  { key: 'industry', label: 'Industry', type: 'select', options: [...] },
  { key: 'website', label: 'Website', type: 'url' },
  // ...
]
```

---

## 6. Wizard/Multi-Step Pages

### 6.1 Wizard Pages Inventory

| Wizard | Steps | Location |
|--------|-------|----------|
| Job Intake | 5 | `/employee/recruiting/jobs/intake` |
| Create Job | 3 | `/employee/recruiting/jobs/new` |
| Account Onboarding | 6 | `/employee/recruiting/accounts/[id]/onboarding` |
| Schedule Interview | 3 | `/employee/recruiting/submissions/[id]/schedule-interview` |
| Extend Offer | 3 tabs | `/employee/recruiting/submissions/[id]/extend-offer` |
| Submit to Client | 3 | `/employee/recruiting/submissions/[id]/submit-to-client` |
| Terminate Placement | 3 | `/employee/recruiting/placements/[id]/terminate` |

### 6.2 URL-Based Step Tracking

**Pattern** (`src/app/employee/recruiting/jobs/intake/page.tsx:43-45`):
```typescript
const stepParam = searchParams.get('step')
const currentStep = stepParam ? Math.min(Math.max(parseInt(stepParam), 1), 5) : 1

const navigateToStep = (step: number) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set('step', step.toString())
  router.push(`?${params.toString()}`, { scroll: false })
}
```

### 6.3 Zustand State Management

**Stores Location**: `src/stores/`

| Store | File |
|-------|------|
| Job Intake | `job-intake-store.ts` |
| Create Job | `create-job-store.ts` |
| Account Onboarding | `account-onboarding-store.ts` |
| Schedule Interview | `schedule-interview-store.ts` |
| Extend Offer | `extend-offer-store.ts` |
| Submit to Client | `submit-to-client-store.ts` |
| Terminate Placement | `terminate-placement-store.ts` |

**Pattern** (`src/stores/job-intake-store.ts:173-216`):
```typescript
export const useJobIntakeStore = create<JobIntakeStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,
      setFormData: (data) => set(state => ({ ...state.formData, ...data })),
      resetForm: () => set({ /* reset */ }),
    }),
    { name: 'job-intake-form' }
  )
)
```

### 6.4 Step Component Pattern

**Step Components Location**: `src/components/recruiting/jobs/intake/`

Pattern:
```typescript
export function IntakeStep1BasicInfo() {
  const { formData, setFormData } = useJobIntakeStore()
  return <div className="space-y-6">{/* Form fields */}</div>
}
```

---

## 7. Activity System

### 7.1 Dual Activity Tables

**Unified activity system**:

| Table | Purpose | Columns | Status Default |
|-------|---------|---------|----------------|
| `activities` | Unified activity table for all entity types (tasks, CRM logging, etc.) | 69 | 'open' (for tasks) or 'completed' (for logs) |

Note: The `crm_activities` table has been deprecated in favor of the unified `activities` table.

### 7.2 Activity Types and Statuses

**Activity Types** (`src/server/routers/activities.ts:11-15`):
- email, call, meeting, note, linkedin_message, task, follow_up

**Statuses**:
- scheduled, open, in_progress, completed, skipped, canceled

**Outcomes**:
- positive, neutral, negative, no_response, left_voicemail, busy, connected

### 7.3 Activity tRPC Procedures

**Activities Router** (`src/server/routers/activities.ts`):
- `log` (lines 51-197) - Log completed activity
- `listByEntity` (lines 202-253) - List for entity
- `getMyTasks` (lines 258-334) - User's assigned tasks
- `getMyActivities` (lines 501-591) - Desktop view
- `complete` (lines 339-384) - Mark complete
- `skip` (lines 389-415) - Skip activity

**CRM Activities** (`src/server/routers/crm.ts:3913-4115`):
- `listByAccount`, `listByContact`, `log`, `getById`, `update`, `delete`

### 7.4 Activity Display Components

**AccountActivitiesSection** (`src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx`):
- Inline form at top for quick logging
- List of activities as cards
- Click to open inline panel
- Icon mapping: call→Phone, email→Mail, meeting→Calendar, note→FileText

---

## 8. Workspace/Desktop System

### 8.1 Workspace Routes

| Route | Purpose |
|-------|---------|
| `/employee/workspace/dashboard` | Dashboard with widgets |
| `/employee/workspace/desktop` | Personal workspace with tables |
| `/employee/workspace/today` | Task-focused view |
| `/employee/workspace/reports` | Report management |

### 8.2 Desktop Page

**File**: `src/app/employee/workspace/desktop/page.tsx`

**Components**:
- `MySummary` - 5 metric cards (Due Today, Overdue, Active Jobs, Pending Submissions, Interviews)
- `MyActivitiesTable` - Activities with bulk actions
- `MyAccountsTable` - User's accounts
- `MyJobsTable` - Assigned jobs
- `MySubmissionsTable` - User's submissions

**Tab Sync**: Active tab synced to URL via `?tab=activities|accounts|jobs|submissions`

**Metric Interaction**: Clicking summary metrics switches tabs and applies filters

### 8.3 Dashboard Widgets

**File**: `src/components/recruiter-workspace/widgets/`

| Widget | Purpose |
|--------|---------|
| `SprintProgressWidget` | 2-week sprint metrics |
| `TodaysPrioritiesWidget` | Overdue/due today/high priority tasks |
| `PipelineHealthWidget` | Active jobs, submissions, interviews |
| `AccountPortfolioWidget` | Account health monitoring |
| `ActivitySummaryWidget` | 7-day activity tracking |
| `QualityMetricsWidget` | 30-day quality measurements |
| `UpcomingCalendarWidget` | Next 7 days interviews |
| `RecentWinsWidget` | Placements and offers |

### 8.4 Data Flow Pattern

**Dashboard**:
1. Server component fetches 8 widget data sets in parallel
2. Passes as initial data to client component
3. Widgets use initial data (no duplicate fetch)
4. Refresh invalidates all queries

**Desktop**:
1. Client-side only (each table fetches own data)
2. Filter props passed from parent
3. Refresh invalidates related queries

---

## 9. Entity Types and Routing

### 9.1 Entity Base Paths

**File**: `src/lib/navigation/entity-navigation.types.ts:114-123`

```typescript
ENTITY_BASE_PATHS: {
  job: '/employee/recruiting/jobs',
  candidate: '/employee/recruiting/candidates',
  account: '/employee/recruiting/accounts',
  contact: '/employee/contacts',
  submission: '/employee/recruiting/submissions',
  placement: '/employee/recruiting/placements',
  lead: '/employee/crm/leads',
  deal: '/employee/crm/deals',
}
```

### 9.2 Route Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| List | `/employee/recruiting/jobs` | Entity list |
| Detail | `/employee/recruiting/jobs/[id]` | Entity detail |
| Detail + Section | `/employee/recruiting/accounts/[id]?section=contacts` | Section view |
| Detail + View Mode | `/employee/recruiting/jobs/[id]?view=sections` | Alternate view |
| Edit | `/employee/recruiting/accounts/[id]/edit` | Edit form |
| Wizard | `/employee/recruiting/jobs/intake?step=1` | Multi-step wizard |

---

## 10. Quick Action Event System

### 10.1 Action Types

**File**: `src/lib/navigation/entity-navigation.types.ts:53-66`

```typescript
interface EntityQuickAction {
  actionType: 'dialog' | 'navigate' | 'mutation'
  dialogId?: string      // For dialog actions
  href?: string          // For navigate (supports :id)
  showForStatuses?: string[]
  hideForStatuses?: string[]
}
```

### 10.2 Event Dispatch

**SidebarLayout** (`src/components/layouts/SidebarLayout.tsx:89-125`):

```typescript
const handleQuickAction = (action) => {
  switch (action.actionType) {
    case 'navigate':
      router.push(resolveHref(action.href, entityId))
      break
    case 'dialog':
      window.dispatchEvent(new CustomEvent('openEntityDialog', {
        detail: { dialogId, entityType, entityId }
      }))
      break
    case 'mutation':
      window.dispatchEvent(new CustomEvent('entityMutation', {
        detail: { actionId, entityType, entityId }
      }))
      break
  }
}
```

### 10.3 Event Listening

**Account Detail Page** (`src/app/employee/recruiting/accounts/[id]/page.tsx:136-155`):
```typescript
useEffect(() => {
  const handler = (e) => {
    if (e.detail.dialogId === 'addContact') setAddContactOpen(true)
    if (e.detail.dialogId === 'logActivity') setLogActivityOpen(true)
  }
  window.addEventListener('openEntityDialog', handler)
  return () => window.removeEventListener('openEntityDialog', handler)
}, [])
```

---

## Code References Summary

### Navigation System
- `src/lib/navigation/top-navigation.ts:10-171`
- `src/lib/navigation/entity-navigation.types.ts:1-134`
- `src/lib/navigation/entity-journeys.ts:1-705`
- `src/lib/navigation/entity-sections.ts:1-107`
- `src/lib/navigation/EntityNavigationContext.tsx:1-151`
- `src/components/navigation/TopNavigation.tsx:1-589`
- `src/components/navigation/EntityJourneySidebar.tsx:1-281`
- `src/components/navigation/AccountSectionSidebar.tsx:1-248`
- `src/components/navigation/ContactSectionSidebar.tsx:1-229`
- `src/components/navigation/JobSectionSidebar.tsx:1-263`
- `src/components/navigation/SectionSidebar.tsx:1-289`

### Layouts
- `src/components/layouts/SidebarLayout.tsx:1-223`
- `src/components/layouts/EntityContextProvider.tsx:1-81`

### Inline Components
- `src/components/ui/inline-panel.tsx:1-151`
- `src/components/ui/editable-info-card.tsx:1-444`
- `src/components/recruiting/accounts/ActivityInlinePanel.tsx`
- `src/components/recruiting/accounts/ContactInlinePanel.tsx`
- `src/components/recruiting/accounts/NoteInlinePanel.tsx`
- `src/components/recruiting/accounts/MeetingInlinePanel.tsx`
- `src/components/recruiting/accounts/DocumentInlinePanel.tsx`
- `src/components/recruiting/accounts/InlineActivityForm.tsx`
- `src/components/recruiting/accounts/InlineNoteForm.tsx`

### Section Components
- `src/components/recruiting/accounts/sections/AccountOverviewSection.tsx`
- `src/components/recruiting/accounts/sections/AccountContactsSection.tsx`
- `src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx`
- `src/components/recruiting/accounts/sections/AccountNotesSection.tsx`
- `src/components/recruiting/accounts/sections/AccountMeetingsSection.tsx`
- `src/components/recruiting/jobs/sections/JobOverviewSection.tsx`
- `src/components/recruiting/jobs/sections/JobSubmissionsSection.tsx`

### Wizard Pages
- `src/app/employee/recruiting/jobs/intake/page.tsx`
- `src/app/employee/recruiting/jobs/new/page.tsx`
- `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx`
- `src/app/employee/recruiting/submissions/[id]/schedule-interview/page.tsx`

### Workspace
- `src/app/employee/workspace/desktop/page.tsx`
- `src/app/employee/workspace/dashboard/page.tsx`
- `src/components/workspace/MySummary.tsx`
- `src/components/workspace/MyActivitiesTable.tsx`
- `src/components/workspace/MyAccountsTable.tsx`
- `src/components/workspace/MyJobsTable.tsx`
- `src/components/workspace/MySubmissionsTable.tsx`

### Stores
- `src/stores/job-intake-store.ts`
- `src/stores/create-job-store.ts`
- `src/stores/account-onboarding-store.ts`
- `src/stores/schedule-interview-store.ts`
- `src/stores/extend-offer-store.ts`
- `src/stores/submit-to-client-store.ts`
- `src/stores/terminate-placement-store.ts`

### Activity System
- `src/server/routers/activities.ts:1-771`
- `src/server/routers/crm.ts:3913-4115`
- `src/server/routers/activityPatterns.ts`

---

## Historical Context

### Prior Research Documents
- `thoughts/shared/research/2025-12-07-guidewire-ui-architecture-comparison.md` - Initial comparison
- `thoughts/shared/research/2025-12-07-account-detail-navigation-and-activity-system.md` - Account/Activity detail
- `thoughts/shared/research/2025-12-08-campaign-workspace-system.md` - Campaign system

### Implementation Plan
- `thoughts/shared/plans/2025-12-07-guidewire-ui-architecture-transformation.md` - 7-phase plan

---

## Open Questions

1. **Dialog Migration Status**: Some legacy dialogs still exist alongside inline panels (marked "kept for backwards compatibility" in `index.ts`). Which are still in use?

2. **Job View Mode Persistence**: Should `?view=sections` preference be persisted per user or remain URL-only?

3. **Contact Top-Level Status**: Contact is now a top-level entity with its own tab - is this fully integrated with recent entities?

4. **Activity Pattern System**: The `activityPatterns` router exists but integration with main activity logging is unclear.
