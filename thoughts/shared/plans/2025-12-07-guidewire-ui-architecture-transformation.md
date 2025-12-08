# Guidewire-Style UI Architecture Transformation

## Overview

Transform InTime's UI architecture to align with Guidewire PolicyCenter's object-focused, relational screen approach. This involves restructuring the Desktop/My Work area, converting dialogs to dedicated pages and inline panels, implementing inline editing patterns, and enhancing entity detail pages with consistent section-based navigation.

## Current State Analysis

### Already Aligned with Guidewire
- Top navigation with object tabs and dropdown menus
- Recent entities (last 5) per type in dropdowns
- Account detail uses section-based sidebar (9 sections)
- "My X" patterns exist via URL filters
- Lazy loading per section

### Gaps to Address
1. **Desktop/My Work**: Widget-focused instead of task-focused "My X" tables
2. **Dialog Overuse**: 39 dialogs for editing/viewing instead of inline patterns
3. **Detail Viewing**: Uses modal dialogs instead of inline panels
4. **Contact Entity**: Not a top-level object like in Guidewire
5. **Job Detail**: Journey-only navigation, no sections toggle for power users

## Desired End State

After implementation:

1. **Desktop** shows "My Summary" metrics header + "My X" tables (Activities, Accounts, Jobs, Submissions)
2. **All wizard dialogs** converted to dedicated pages with URL-based step tracking
3. **All detail dialogs** converted to inline expandable panels or dedicated pages
4. **Inline editing** available on info cards throughout the app
5. **Contact** is a top-level entity with its own tab, detail page, and sections
6. **Job detail** has toggle between journey view (default) and sections view

### Verification
- No modal dialogs for viewing entity details
- Wizard workflows have dedicated routes with bookmarkable URLs
- Users can edit simple fields inline without leaving context
- Desktop provides quick access to user's work items as filterable tables

## What We're NOT Doing

- Reviving the archived metadata-driven screen system
- Changing the underlying data model or tRPC routers
- Modifying the design system colors/typography
- Changing authentication or authorization patterns
- Mobile-specific optimizations

## Implementation Approach

We'll work in phases, each delivering incremental value:
1. Desktop restructure (foundation for "My X" patterns)
2. Large wizard conversions (biggest dialog pain points)
3. Detail dialogs to inline panels (reduce modal fatigue)
4. Inline editing patterns (Guidewire-style edit buttons)
5. Job detail sections toggle (hybrid navigation)
6. Contact as top-level entity (complete object model)
7. Remaining dialog conversions (comprehensive cleanup)

---

## Phase 1: Desktop/My Work Restructure

### Overview
Transform the Dashboard from widget-focused to Guidewire-style "My Summary" + "My X" tables. Users get a task-focused workspace showing their activities, accounts, jobs, and submissions in filterable tables.

### Changes Required

#### 1.1 Create MySummary Component

**File**: `src/components/workspace/MySummary.tsx` (new)
**Purpose**: Header section with key metrics cards

```tsx
// Structure:
// - 5 metric cards in a row
// - Activities due today, Overdue tasks, Active jobs, Pending submissions, Interviews this week
// - Each card clickable to filter corresponding table below
```

Key implementation:
- Use existing `trpc.dashboard.getRecruiterMetrics` for data
- Cards use `bg-white` with `shadow-elevation-sm`
- Click handlers set filter state for tables below

#### 1.2 Create MyActivitiesTable Component

**File**: `src/components/workspace/MyActivitiesTable.tsx` (new)
**Purpose**: Table of user's activities with bulk actions

```tsx
// Columns: Subject, Type, Account, Contact, Due Date, Status
// Bulk actions: Complete, Assign, Skip
// Filters: Type, Status, Date range
// Row click: Navigate to entity or expand inline
```

Data source: New procedure `trpc.activities.getMyActivities`

#### 1.3 Create MyAccountsTable Component

**File**: `src/components/workspace/MyAccountsTable.tsx` (new)
**Purpose**: Table of accounts owned by user

```tsx
// Columns: Account Name, Industry, Status, Tier, Open Jobs, Last Activity
// Filters: Status, Tier, Industry
// Row click: Navigate to account detail
```

Data source: `trpc.crm.accounts.list` with `{ ownerId: currentUser.id }`

#### 1.4 Create MyJobsTable Component

**File**: `src/components/workspace/MyJobsTable.tsx` (new)
**Purpose**: Table of jobs assigned to user

```tsx
// Columns: Title, Account, Status, Submissions, Interviews, Posted Date
// Filters: Status, Account
// Row click: Navigate to job detail
```

Data source: `trpc.ats.jobs.list` with `{ assignedTo: currentUser.id }`

#### 1.5 Create MySubmissionsTable Component

**File**: `src/components/workspace/MySubmissionsTable.tsx` (new)
**Purpose**: Table of user's submissions

```tsx
// Columns: Candidate, Job, Account, Status, Submitted Date, Last Update
// Filters: Status, Account
// Row click: Navigate to submission detail
```

Data source: `trpc.ats.submissions.list` with `{ recruiterId: currentUser.id }`

#### 1.6 Create WorkspaceDesktop Page

**File**: `src/app/employee/workspace/desktop/page.tsx` (new)
**Purpose**: Main desktop page with summary + tables

```tsx
// Layout:
// - MySummary at top (5 cards)
// - Tabs or accordion for tables: Activities | Accounts | Jobs | Submissions
// - Each table has its own filters
// - Default tab: Activities (most actionable)
```

#### 1.7 Update Navigation

**File**: `src/lib/navigation/top-navigation.ts`
**Changes**:
- Rename "My Work" dropdown items
- Add "Desktop" as primary destination
- Keep quick links to specific filtered views

```typescript
// Update items array for 'my-work' tab:
items: [
  { label: 'Desktop', href: '/employee/workspace/desktop', icon: LayoutDashboard },
  { label: 'My Activities', href: '/employee/workspace/desktop?tab=activities' },
  { label: 'My Accounts', href: '/employee/workspace/desktop?tab=accounts' },
  { label: 'My Jobs', href: '/employee/workspace/desktop?tab=jobs' },
  { label: 'My Submissions', href: '/employee/workspace/desktop?tab=submissions' },
  // Keep existing: Today's Tasks, Pending Approvals, Reports
]
```

#### 1.8 Add tRPC Procedure for My Activities

**File**: `src/server/routers/activities.ts`
**Changes**: Add `getMyActivities` procedure

```typescript
getMyActivities: orgProtectedProcedure
  .input(z.object({
    type: z.enum(['call', 'email', 'meeting', 'task', 'note']).optional(),
    status: z.enum(['pending', 'completed', 'overdue']).optional(),
    dueBefore: z.date().optional(),
    dueAfter: z.date().optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ ctx, input }) => {
    // Filter by ctx.user.id as owner
    // Include related account and contact
    // Sort by due_date ascending
  })
```

### Success Criteria

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm tsc --noEmit` (pre-existing errors unrelated to Phase 1)
- [ ] Linting passes: `pnpm lint`
- [x] New components have no TypeScript errors
- [x] tRPC procedure types are correctly inferred

#### Manual Verification:
- [ ] Desktop page loads at `/employee/workspace/desktop`
- [ ] MySummary shows 5 metric cards with real data
- [ ] Each "My X" table loads data filtered to current user
- [ ] Table filters work correctly
- [ ] Row clicks navigate to correct detail pages
- [ ] Bulk actions work on Activities table
- [ ] Navigation dropdown shows updated items

---

## Phase 2: Large Wizard Dialog Conversions

### Overview
Convert the largest wizard dialogs (1000+ lines) to dedicated pages with URL-based step tracking. This enables bookmarking, browser back/forward, and reduces modal fatigue.

### Changes Required

#### 2.1 Job Intake Wizard Page

**Current**: `src/components/recruiting/jobs/JobIntakeWizardDialog.tsx` (1,334 lines)
**New**: `src/app/employee/recruiting/jobs/intake/page.tsx`

**URL Pattern**: `/employee/recruiting/jobs/intake?step=1&accountId=xxx`

```tsx
// Page structure:
// - Full-page layout (no sidebar)
// - Progress indicator at top (5 steps)
// - Step content in main area
// - Navigation buttons at bottom
// - Auto-save draft to localStorage or server
```

Steps:
1. Basic Info (`?step=1`)
2. Technical Requirements (`?step=2`)
3. Role Details (`?step=3`)
4. Logistics & Compensation (`?step=4`)
5. Interview Process (`?step=5`)

**State Management**:
- Use URL search params for current step
- Use Zustand store for form data (persisted to localStorage)
- On completion, create job and redirect to job detail

**Files to create**:
- `src/app/employee/recruiting/jobs/intake/page.tsx` - Main page
- `src/app/employee/recruiting/jobs/intake/layout.tsx` - Layout without sidebar
- `src/components/recruiting/jobs/intake/IntakeStep1.tsx` - Basic Info
- `src/components/recruiting/jobs/intake/IntakeStep2.tsx` - Requirements
- `src/components/recruiting/jobs/intake/IntakeStep3.tsx` - Role Details
- `src/components/recruiting/jobs/intake/IntakeStep4.tsx` - Compensation
- `src/components/recruiting/jobs/intake/IntakeStep5.tsx` - Interview Process
- `src/stores/job-intake-store.ts` - Zustand store for form state

**Update triggers**:
- `src/components/navigation/AccountSectionSidebar.tsx:57` - Change `dialogId: 'jobIntake'` to `actionType: 'navigate'`, `href: '/employee/recruiting/jobs/intake?accountId=:id'`
- All other places that open `JobIntakeWizardDialog`

#### 2.2 Account Onboarding Wizard Page

**Current**: `src/components/recruiting/accounts/OnboardingWizardDialog.tsx` (1,118 lines)
**New**: `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx`

**URL Pattern**: `/employee/recruiting/accounts/[id]/onboarding?step=1`

Steps:
1. Company Profile (`?step=1`)
2. Contract Setup (`?step=2`)
3. Billing Setup (`?step=3`)
4. Key Contacts (`?step=4`)
5. Job Categories (`?step=5`)
6. Kickoff Call (`?step=6`)

**Files to create**:
- `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx`
- `src/app/employee/recruiting/accounts/[id]/onboarding/layout.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep1.tsx` through `OnboardingStep6.tsx`
- `src/stores/account-onboarding-store.ts`

#### 2.3 Create Job Page (Simpler Wizard)

**Current**: `src/components/recruiting/jobs/CreateJobDialog.tsx` (635 lines)
**New**: `src/app/employee/recruiting/jobs/new/page.tsx`

**URL Pattern**: `/employee/recruiting/jobs/new?step=1&accountId=xxx`

Steps:
1. Basic Info (`?step=1`)
2. Requirements (`?step=2`)
3. Compensation (`?step=3`)

#### 2.4 Extend Offer Page

**Current**: `src/components/recruiting/offers/ExtendOfferDialog.tsx` (635 lines)
**New**: `src/app/employee/recruiting/submissions/[id]/extend-offer/page.tsx`

**URL Pattern**: `/employee/recruiting/submissions/[id]/extend-offer`

Uses tabs instead of steps: Rates | Schedule | Benefits

#### 2.5 Schedule Interview Page

**Current**: `src/components/recruiting/interviews/ScheduleInterviewDialog.tsx` (611 lines)
**New**: `src/app/employee/recruiting/submissions/[id]/schedule-interview/page.tsx`

Steps:
1. Interview Type
2. Proposed Times
3. Details & Review

#### 2.6 Terminate Placement Page

**Current**: `src/components/recruiting/placements/TerminatePlacementDialog.tsx` (556 lines)
**New**: `src/app/employee/recruiting/placements/[id]/terminate/page.tsx`

Steps:
1. Termination Details
2. Impact Assessment
3. Offboarding

#### 2.7 Submit to Client Page

**Current**: `src/components/recruiting/submissions/SubmitToClientDialog.tsx` (460 lines)
**New**: `src/app/employee/recruiting/submissions/[id]/submit-to-client/page.tsx`

Steps:
1. Rates
2. Notes
3. Review

### Success Criteria

#### Automated Verification:
- [x] All new pages compile without errors
- [x] Routes are accessible and render correctly
- [ ] Old dialog imports can be removed without breaking builds
- [x] Zustand stores persist state correctly

#### Manual Verification:
- [ ] Job intake wizard works end-to-end via page
- [ ] Browser back/forward navigates between steps
- [ ] Refreshing page maintains current step and data
- [ ] All form validations work per step
- [ ] Completion creates entity and redirects correctly
- [ ] All trigger points (buttons, menu items) navigate to new pages

---

## Phase 3: Detail Dialogs to Inline Panels

### Overview
Convert detail view dialogs to inline expandable panels within their parent context. This keeps users in flow and enables side-by-side comparison.

### Changes Required

#### 3.1 Create InlinePanel Component

**File**: `src/components/ui/inline-panel.tsx` (new)
**Purpose**: Reusable expandable panel for inline detail views

```tsx
interface InlinePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl' // 320px, 400px, 480px, 560px
}

// Features:
// - Slides in from right side of parent container
// - Has close button and optional action buttons
// - Supports edit mode toggle
// - Animates open/close
```

#### 3.2 Convert ActivityDetailDialog to Inline Panel

**Current**: `src/components/recruiting/accounts/ActivityDetailDialog.tsx` (362 lines)
**New**: `src/components/recruiting/accounts/ActivityInlinePanel.tsx`

**Integration point**: `src/components/recruiting/accounts/sections/AccountActivitiesSection.tsx`

```tsx
// In AccountActivitiesSection:
// - Track selectedActivityId state
// - When activity clicked, set selectedActivityId
// - Render ActivityInlinePanel alongside activity list
// - Panel shows activity details with edit capability
```

Layout change:
```
Before: [Activity List]  → click → [Modal Dialog]
After:  [Activity List | Activity Panel]  ← side by side
```

#### 3.3 Convert ContactDetailDialog to Inline Panel

**Current**: `src/components/recruiting/accounts/ContactDetailDialog.tsx` (392 lines)
**New**: `src/components/recruiting/accounts/ContactInlinePanel.tsx`

**Integration point**: `src/components/recruiting/accounts/sections/AccountContactsSection.tsx`

#### 3.4 Convert NoteDetailDialog to Inline Panel

**Current**: `src/components/recruiting/accounts/NoteDetailDialog.tsx`
**New**: `src/components/recruiting/accounts/NoteInlinePanel.tsx`

**Integration point**: `src/components/recruiting/accounts/sections/AccountNotesSection.tsx`

#### 3.5 Convert MeetingDetailDialog to Inline Panel

**Current**: `src/components/recruiting/accounts/MeetingDetailDialog.tsx`
**New**: `src/components/recruiting/accounts/MeetingInlinePanel.tsx`

**Integration point**: `src/components/recruiting/accounts/sections/AccountMeetingsSection.tsx`

#### 3.6 Convert DocumentDetailDialog to Inline Panel

**Current**: `src/components/recruiting/accounts/DocumentDetailDialog.tsx`
**New**: `src/components/recruiting/accounts/DocumentInlinePanel.tsx`

**Integration point**: `src/components/recruiting/accounts/sections/AccountDocumentsSection.tsx`

#### 3.7 Update Section Components Layout

Each section component needs layout update:

**Pattern**:
```tsx
// Before:
<div className="grid grid-cols-1 gap-4">
  {items.map(item => <ItemCard onClick={() => openDialog(item.id)} />)}
</div>
<ItemDetailDialog open={dialogOpen} itemId={selectedId} />

// After:
<div className="flex gap-4">
  <div className="flex-1">
    {items.map(item => <ItemCard onClick={() => setSelectedId(item.id)} />)}
  </div>
  {selectedId && (
    <ItemInlinePanel
      itemId={selectedId}
      onClose={() => setSelectedId(null)}
    />
  )}
</div>
```

#### 3.8 Remove Old Dialog Imports

After inline panels are working, remove:
- `ActivityDetailDialog` imports and usage
- `ContactDetailDialog` imports and usage
- `NoteDetailDialog` imports and usage
- `MeetingDetailDialog` imports and usage
- `DocumentDetailDialog` imports and usage

### Success Criteria

#### Automated Verification:
- [x] All inline panel components compile
- [x] No remaining imports of converted dialogs (detail view dialogs removed from page)
- [x] TypeScript types match between list and panel

#### Manual Verification:
- [ ] Clicking item in list opens inline panel (not modal)
- [ ] Panel shows correct data for selected item
- [ ] Edit mode works within panel
- [ ] Delete with confirmation works
- [ ] Closing panel returns focus to list
- [ ] Can select different items without closing panel
- [ ] Panel width is appropriate for content

---

## Phase 4: Inline Editing Patterns

### Overview
Implement Guidewire-style inline editing where info cards have "Edit" buttons that toggle the card into edit mode, rather than opening dialogs.

### Changes Required

#### 4.1 Create EditableInfoCard Component

**File**: `src/components/ui/editable-info-card.tsx` (new)
**Purpose**: Card that toggles between view and edit mode

```tsx
interface EditableInfoCardProps {
  title: string
  fields: FieldDefinition[]
  data: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => Promise<void>
  editable?: boolean
}

interface FieldDefinition {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'currency' | 'phone' | 'email' | 'textarea'
  options?: { value: string; label: string }[]  // for select
  required?: boolean
}

// Features:
// - View mode: displays field values in grid
// - Edit button in card header (if editable)
// - Edit mode: fields become inputs
// - Save/Cancel buttons in edit mode
// - Loading state during save
// - Validation errors inline
```

#### 4.2 Update AccountOverviewSection

**File**: `src/components/recruiting/accounts/sections/AccountOverviewSection.tsx`
**Changes**: Replace static info display with EditableInfoCard

```tsx
// Replace manual field rendering with:
<EditableInfoCard
  title="Company Information"
  fields={[
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'select', options: industryOptions },
    { key: 'website', label: 'Website', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'phone' },
    // ...
  ]}
  data={account}
  onSave={handleUpdateAccount}
  editable={canEdit}
/>
```

#### 4.3 Update Job Overview Tab

**File**: `src/app/employee/recruiting/jobs/[id]/page.tsx`
**Changes**: Add inline editing to job info cards

#### 4.4 Update Submission Detail

**File**: Future submission detail page
**Changes**: Add inline editing to submission info

#### 4.5 Create Inline Add Forms

For simple entities, replace "Add" dialogs with inline forms:

**LogActivityDialog** → Inline form at top of activities section
**AddNoteDialog** → Inline form at top of notes section
**AddContactDialog** → Keep as dialog (has multiple fields)

**File**: `src/components/recruiting/accounts/InlineActivityForm.tsx` (new)
```tsx
// Collapsed state: "Log Activity" button
// Expanded state: Compact form with type, subject, notes, save/cancel
```

**File**: `src/components/recruiting/accounts/InlineNoteForm.tsx` (new)
```tsx
// Collapsed state: "Add Note" button
// Expanded state: Title, content textarea, pin checkbox, save/cancel
```

### Success Criteria

#### Automated Verification:
- [x] EditableInfoCard component compiles with all field types
- [x] Form validation works correctly
- [x] Save mutations are typed correctly

#### Manual Verification:
- [ ] Edit button appears on info cards
- [ ] Clicking Edit toggles card to edit mode
- [ ] All field types render correctly in edit mode
- [ ] Save updates data and returns to view mode
- [ ] Cancel discards changes and returns to view mode
- [ ] Validation errors display inline
- [ ] Inline add forms expand/collapse correctly

---

## Phase 5: Job Detail Sections Toggle

### Overview
Add a toggle to Job detail page allowing users to switch between journey view (default, workflow-focused) and sections view (Guidewire-style, all info accessible).

### Changes Required

#### 5.1 Define Job Sections

**File**: `src/lib/navigation/entity-sections.ts` (new)
**Purpose**: Define section-based navigation for jobs (alternative to journey)

```typescript
export const jobSections: SectionDefinition[] = [
  { id: 'overview', label: 'Job Overview', icon: FileText },
  { id: 'requirements', label: 'Requirements', icon: ListChecks },
  { id: 'pipeline', label: 'Pipeline', icon: Users, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'interviews', label: 'Interviews', icon: Calendar, showCount: true },
  { id: 'offers', label: 'Offers', icon: Gift, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
]
```

#### 5.2 Create JobSectionSidebar Component

**File**: `src/components/navigation/JobSectionSidebar.tsx` (new)
**Purpose**: Section-based sidebar for jobs (alternative to journey)

Similar to `AccountSectionSidebar` but with job-specific sections and quick actions.

#### 5.3 Add View Toggle to Job Detail

**File**: `src/app/employee/recruiting/jobs/[id]/page.tsx`
**Changes**:

```tsx
// Add state for view mode
const [viewMode, setViewMode] = useState<'journey' | 'sections'>('journey')

// Add toggle in header
<div className="flex items-center gap-2">
  <Button
    variant={viewMode === 'journey' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setViewMode('journey')}
  >
    <Workflow className="w-4 h-4 mr-1" />
    Journey
  </Button>
  <Button
    variant={viewMode === 'sections' ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setViewMode('sections')}
  >
    <LayoutGrid className="w-4 h-4 mr-1" />
    Sections
  </Button>
</div>
```

#### 5.4 Update SidebarLayout for Job Toggle

**File**: `src/components/layouts/SidebarLayout.tsx`
**Changes**: Support both navigation styles for jobs based on user preference

```typescript
// Check for job-specific view mode preference
const jobViewMode = currentEntity?.type === 'job'
  ? (searchParams.get('view') || 'journey')
  : null

// Render appropriate sidebar
if (currentEntity?.type === 'job') {
  return jobViewMode === 'sections'
    ? <JobSectionSidebar {...} />
    : <EntityJourneySidebar {...} />
}
```

#### 5.5 Create Job Section Components

**Files**:
- `src/components/recruiting/jobs/sections/JobOverviewSection.tsx`
- `src/components/recruiting/jobs/sections/JobRequirementsSection.tsx`
- `src/components/recruiting/jobs/sections/JobSubmissionsSection.tsx`
- `src/components/recruiting/jobs/sections/JobInterviewsSection.tsx`
- `src/components/recruiting/jobs/sections/JobOffersSection.tsx`
- `src/components/recruiting/jobs/sections/JobActivitiesSection.tsx`
- `src/components/recruiting/jobs/sections/JobDocumentsSection.tsx`
- `src/components/recruiting/jobs/sections/JobNotesSection.tsx`

Each section follows the same pattern as Account sections.

### Success Criteria

#### Automated Verification:
- [ ] All job section components compile
- [ ] JobSectionSidebar renders without errors
- [ ] View toggle state persists in URL

#### Manual Verification:
- [ ] Toggle appears in job detail header
- [ ] Clicking "Journey" shows journey sidebar
- [ ] Clicking "Sections" shows sections sidebar
- [ ] All sections load data correctly
- [ ] Section counts display accurately
- [ ] Quick actions work in sections mode
- [ ] View preference persists across navigation

---

## Phase 6: Contact as Top-Level Entity

### Overview
Elevate Contact to a top-level entity with its own navigation tab, detail page, and section-based sidebar, matching Guidewire's Contact object.

### Changes Required

#### 6.1 Add Contact Tab to Top Navigation

**File**: `src/lib/navigation/top-navigation.ts`
**Changes**: Add Contact tab after Candidates

```typescript
{
  id: 'contacts',
  label: 'Contacts',
  href: '/employee/contacts',
  icon: Users,
  items: [
    { label: 'Search Contacts', href: '/employee/contacts', icon: Search },
    { label: 'Recently Viewed', type: 'recent', entityType: 'contact' },
    { label: 'New Contact', href: '/employee/contacts/new', icon: Plus },
  ],
}
```

#### 6.2 Create Contact List Page

**File**: `src/app/employee/contacts/page.tsx` (new)
**Purpose**: Searchable list of all contacts across accounts

```tsx
// Features:
// - Search by name, email, phone, title
// - Filter by account, decision authority, primary status
// - Table with: Name, Title, Account, Email, Phone, Decision Authority
// - Row click navigates to contact detail
```

#### 6.3 Create Contact Detail Page

**File**: `src/app/employee/contacts/[id]/page.tsx` (new)
**Purpose**: Full detail page for a contact

Uses section-based sidebar like Account.

#### 6.4 Define Contact Sections

**File**: `src/lib/navigation/entity-sections.ts`
**Add**:

```typescript
export const contactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Contact Overview', icon: User },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true },
  { id: 'activities', label: 'Activities', icon: Clock },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'notes', label: 'Notes', icon: MessageSquare, showCount: true },
  { id: 'emails', label: 'Emails', icon: Mail, showCount: true },
]
```

#### 6.5 Create ContactSectionSidebar Component

**File**: `src/components/navigation/ContactSectionSidebar.tsx` (new)

#### 6.6 Create Contact Section Components

**Files**:
- `src/components/contacts/sections/ContactOverviewSection.tsx`
- `src/components/contacts/sections/ContactAccountsSection.tsx`
- `src/components/contacts/sections/ContactActivitiesSection.tsx`
- `src/components/contacts/sections/ContactMeetingsSection.tsx`
- `src/components/contacts/sections/ContactNotesSection.tsx`
- `src/components/contacts/sections/ContactEmailsSection.tsx`

#### 6.7 Add Contact to Entity Navigation Types

**File**: `src/lib/navigation/entity-navigation.types.ts`
**Changes**:

```typescript
ENTITY_NAVIGATION_STYLES = {
  // ... existing
  contact: 'sections',
}
```

#### 6.8 Add Contact tRPC Procedures

**File**: `src/server/routers/crm.ts`
**Add**:

```typescript
contacts: {
  // Existing: listByAccount, getById, create, update, delete

  // New:
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      accountId: z.string().optional(),
      decisionAuthority: z.string().optional(),
      isPrimary: z.boolean().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Search across all contacts in org
      // Include account info in response
    }),

  getActivities: orgProtectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(...),

  getMeetings: orgProtectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(...),

  getNotes: orgProtectedProcedure
    .input(z.object({ contactId: z.string() }))
    .query(...),
}
```

### Success Criteria

#### Automated Verification:
- [ ] Contact tab appears in navigation
- [ ] All contact routes compile
- [ ] tRPC procedures have correct types
- [ ] Contact entity type recognized in navigation system

#### Manual Verification:
- [ ] Contact tab visible in top navigation
- [ ] Contact dropdown shows search, recent, new
- [ ] Contact list page loads with search/filters
- [ ] Contact detail page shows all sections
- [ ] Recent contacts appear in dropdown
- [ ] Creating contact from detail page works
- [ ] Contact activities/meetings/notes load correctly

---

## Phase 7: Remaining Dialog Conversions

### Overview
Convert all remaining dialogs to appropriate patterns (pages, inline forms, or keep as confirmation dialogs).

### Changes Required

#### 7.1 Creation Dialogs → Pages

| Dialog | New Location |
|--------|--------------|
| `CreateAccountDialog` | `/employee/recruiting/accounts/new` |
| `CreateVendorDialog` | `/employee/bench/vendors/new` |
| `CreateJobOrderDialog` | `/employee/bench/job-orders/new` |
| `OnboardTalentDialog` | `/employee/bench/talent/onboard` |
| `CreateHotlistDialog` | `/employee/recruiting/hotlists/new` |

Each follows the pattern established in Phase 2.

#### 7.2 Simple Form Dialogs → Inline Forms

| Dialog | Inline Location |
|--------|-----------------|
| `LogActivityDialog` | Inline form in activities section |
| `AddNoteDialog` | Inline form in notes section |
| `RecordFeedbackDialog` | Inline form in interview detail |
| `InterviewFeedbackDialog` | Inline form in interview detail |

#### 7.3 Selection Dialogs → Keep as Dialogs

These work well as dialogs (quick selection, not editing):

| Dialog | Reason to Keep |
|--------|----------------|
| `AddToPipelineDialog` | Quick candidate search and add |
| `AddToHotlistDialog` | Quick selection from list |
| `SubmitTalentDialog` | Quick submission action |
| `SubmitToJobDialog` | Quick submission action |

#### 7.4 Confirmation Dialogs → Keep as Dialogs

Destructive/critical actions should remain as focused dialogs:

| Dialog | Reason to Keep |
|--------|----------------|
| `CancelInterviewDialog` | Destructive, needs confirmation |
| `UpdateStatusDialog` | Important state change |
| `RescheduleDialog` | Time-sensitive action |
| `ConfirmTimeDialog` | Quick confirmation |

#### 7.5 Screening Checklist → Inline Panel

**Current**: `ScreeningChecklistDialog`
**New**: `ScreeningChecklistPanel` - Inline panel in submission detail

### Success Criteria

#### Automated Verification:
- [ ] All converted pages compile
- [ ] All inline forms work correctly
- [ ] No orphaned dialog imports

#### Manual Verification:
- [ ] All creation flows work via pages
- [ ] Inline forms submit correctly
- [ ] Kept dialogs still function properly
- [ ] No regression in existing functionality

---

## Testing Strategy

### Unit Tests

For each new component:
- Render tests with various props
- User interaction tests (clicks, form submissions)
- Loading and error state tests

### Integration Tests

- Desktop page loads with real data
- Wizard pages complete full workflow
- Inline panels open/close/save correctly
- Navigation between entities works

### Manual Testing Steps

1. **Desktop Verification**:
   - Log in as recruiter
   - Navigate to Desktop
   - Verify all "My X" tables show correct data
   - Test filters and bulk actions

2. **Wizard Flow Verification**:
   - Start job intake wizard
   - Navigate through all steps
   - Use browser back/forward
   - Refresh page and verify state persists
   - Complete wizard and verify job created

3. **Inline Panel Verification**:
   - Go to Account detail
   - Click on a contact in the contacts section
   - Verify panel opens inline (not modal)
   - Edit contact and save
   - Delete contact with confirmation

4. **View Toggle Verification**:
   - Go to Job detail
   - Toggle between Journey and Sections view
   - Verify both views show correct data
   - Verify sidebar changes appropriately

---

## Performance Considerations

1. **Lazy Loading**: Maintain lazy loading for all sections/tabs
2. **Query Caching**: Use tRPC query caching for repeated data fetches
3. **Optimistic Updates**: Implement optimistic updates for inline edits
4. **Bundle Splitting**: Ensure new pages are code-split appropriately
5. **Virtualization**: Consider virtualization for long "My X" tables

---

## Migration Notes

### Deprecation Strategy

1. Keep old dialogs during transition period
2. Add console warnings when old dialogs are used
3. Remove old dialogs after all references updated
4. Update any external documentation

### Data Migration

No database changes required - this is purely a UI restructuring.

### User Communication

- Announce new Desktop experience
- Provide quick guide to inline editing
- Document keyboard shortcuts for power users

---

## References

- Research document: `thoughts/shared/research/2025-12-07-guidewire-ui-architecture-comparison.md`
- Current Account implementation: `src/app/employee/recruiting/accounts/[id]/page.tsx`
- Current Job implementation: `src/app/employee/recruiting/jobs/[id]/page.tsx`
- Navigation system: `src/lib/navigation/`
- Design system: `.claude/rules/ui-design-system.md`
