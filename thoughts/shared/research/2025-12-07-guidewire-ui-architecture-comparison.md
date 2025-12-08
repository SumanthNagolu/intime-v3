---
date: 2025-12-08T00:14:53Z
researcher: Claude
git_commit: 6f15b8b750d355383517ea7ea066460b75e6fcf3
branch: main
repository: intime-v3
topic: "Guidewire PolicyCenter UI Architecture Comparison with InTime"
tags: [research, codebase, ui-architecture, guidewire, navigation, accounts, jobs, dashboard]
status: complete
last_updated: 2025-12-07
last_updated_by: Claude
---

# Research: Guidewire PolicyCenter UI Architecture Comparison with InTime

**Date**: 2025-12-08T00:14:53Z
**Researcher**: Claude
**Git Commit**: 6f15b8b750d355383517ea7ea066460b75e6fcf3
**Branch**: main
**Repository**: intime-v3

## Research Question

How does the current InTime UI architecture compare to Guidewire PolicyCenter's object-focused, relational screen approach? Document the current state to understand what exists before considering architectural alignment.

## Summary

The InTime codebase already implements many Guidewire-inspired patterns, particularly in Account detail pages which use a **section-based sidebar** approach nearly identical to PolicyCenter's Account screens. The system has two navigation styles: **journey-based** (for Jobs, Candidates, Submissions) and **section-based** (for Accounts, Deals, Leads). There is also an **archived metadata-driven screen system** in `.archive/ui-reference/` that closely mirrors Guidewire's declarative UI approach but is not currently active in the main codebase.

---

## Guidewire PolicyCenter UI Patterns (From Screenshots)

### Top Navigation Bar
- **Object-type tabs**: Desktop, Account, Policy, Contact, Search, Team, Administration
- Each tab has a **dropdown menu** with:
  - "New [Entity]" action
  - Quick search field
  - Recently accessed items (last 5)

### Desktop (Personal Workspace)
- **"My Summary"** page with overview metrics cards (Activities, Submissions, Change Requests, Renewals, Cancellations)
- **"My Activities"** table with bulk actions (Assign, Skip, Complete)
- **"My Accounts"** table with filtering
- **"My Submissions"** table with filtering
- **"My Renewals"** table
- **"My Queues"** section
- Left sidebar shows: Summary, My Activities, Cross-Suite Activities, My Accounts, My Submissions, My Renewals, Other Policy Transactions, My Queues

### Account Detail Page
- **Left sidebar with sections**: Summary, Contacts, Locations, Participants, Policy Transactions, Submission Manager, Underwriting Files, Related Accounts, Documents, Notes, Claims, Billing, History
- **Main content area**: Details card, Current Activities table, Policy Terms table, Open Policy Transactions
- **"Edit" button** on Details card (inline edit, not dialog)
- **Actions menu** with contextual options: New Note, New Document, New Email, New Submission, New Activity

### Policy Detail Page (Main Work Item)
- **Header breadcrumb**: Policy File > Personal Auto > [Name]
- **Context bar**: Account link, Policy number, Status (In Force/Expiration date)
- **Left sidebar with expandable sections**:
  - Policy Contract (Policy Info, Drivers, Vehicles, PA Coverages, Quote)
  - Tools (Summary, Billing, Contacts, Participants, Notes, Documents, Policy Transactions, Risk Analysis)
- **Date picker** for point-in-time views
- **Tabbed content within sections** (e.g., Contact Detail, Roles, Addresses, Motor Vehicle Record)

### Key Patterns
1. **Object-focused navigation** - Every entity type has its own top-level tab
2. **Section-based detail pages** - Not tabs, but sidebar sections
3. **Inline editing** - "Edit" button on cards, not dialogs for simple edits
4. **Contextual actions** - Actions menu changes based on current object
5. **Recent entities** - Quick access to last 5 viewed items per type
6. **Personal workspace ("Desktop")** - User-centric view with "My X" lists

---

## Current InTime Architecture

### 1. Navigation Architecture

**File References**:
- `src/lib/navigation/top-navigation.ts:10-128` - Top nav tabs configuration
- `src/components/navigation/TopNavigation.tsx:15-588` - Top navigation component
- `src/lib/navigation/entity-navigation.types.ts:14-27` - Navigation style mapping

#### Top Navigation Tabs
The current system has 7 top-level tabs:
1. **My Work** - workspace dashboard, tasks, activities
2. **Accounts** - search, recent, create account
3. **Jobs** - job search, assignments, urgent jobs
4. **Candidates** - candidate search, hotlist, bench, talent pool
5. **CRM** - leads, deals, campaigns
6. **Pipeline** - submissions, interviews, offers, placements
7. **Administration** - users, roles, settings, audit logs

Each tab has:
- Dropdown menu with recent entities (last 5)
- Search field in dropdown
- Quick action links

**Similarity to Guidewire**: Very similar structure. Main difference is InTime separates "Jobs" and "Pipeline" while Guidewire combines them under "Policy".

#### Two Navigation Styles
```typescript
// src/lib/navigation/entity-navigation.types.ts:14-27
ENTITY_NAVIGATION_STYLES = {
  job: 'journey',        // Sequential workflow steps
  candidate: 'journey',
  submission: 'journey',
  placement: 'journey',
  account: 'sections',   // Section-based sidebar
  deal: 'sections',
  lead: 'sections',
}
```

### 2. Account Detail Page Implementation

**File References**:
- `src/app/employee/recruiting/accounts/[id]/page.tsx:112-385` - Main page component
- `src/components/navigation/AccountSectionSidebar.tsx:32-226` - Section sidebar
- `src/components/recruiting/accounts/sections/` - Section components

#### Section-Based Sidebar (Guidewire-Style)
The Account detail page uses section-based navigation nearly identical to Guidewire:

| Section | Icon | Shows Count | Alert Styling |
|---------|------|-------------|---------------|
| Account Overview | Building2 | No | No |
| Contacts | Users | Yes | No |
| Jobs | Briefcase | Yes | No |
| Placements | Award | Yes | No |
| Documents | FileText | No | No |
| Activities | Clock | No | No |
| Notes | MessageSquare | Yes | No |
| Meetings | Calendar | Yes | No |
| Escalations | AlertTriangle | Yes | **Yes** |

**URL Pattern**: `/employee/recruiting/accounts/:id?section=overview`

#### Lazy Section Loading
Each section fetches its own data only when rendered:
- **Page Load**: 0 calls (uses server-fetched data)
- **Overview Tab**: 2 calls (contacts + jobs)
- **Each other section**: 1 call

**Quick Actions**: Edit Account, Add Contact, New Job, Log Activity

**Similarity to Guidewire**: Nearly identical pattern. Section sidebar with counts, contextual quick actions.

### 3. Job Detail Page Implementation

**File References**:
- `src/app/employee/recruiting/jobs/[id]/page.tsx:42-444` - Main page component
- `src/lib/navigation/entity-journeys.ts:10-118` - Journey configuration
- `src/components/recruiting/submissions/SubmissionPipeline.tsx:44-621` - Kanban board

#### Journey-Based Sidebar
Jobs use sequential workflow steps instead of sections:

1. **Job Info** (draft) → default tab: 'overview'
2. **Sourcing** (open) → default tab: 'pipeline'
3. **Pipeline** (active) → default tab: 'pipeline'
4. **Interviews** (active) → default tab: 'pipeline'
5. **Offers** (active) → default tab: 'pipeline'
6. **Placement** (filled) → default tab: 'overview'

**Visual Indicators**:
- Past steps: Green checkmark
- Current step: Gold numbered badge
- Future steps: Gray numbered badge
- Connector lines between steps

#### Tabs Within Job Page
1. **Overview** - Job details, requirements, status history
2. **Pipeline** - Kanban board with drag-and-drop submissions
3. **Activity** - Timeline of job activities

**Difference from Guidewire**: Jobs use journey/workflow navigation while Guidewire's Policy uses section-based. This is appropriate for the recruiting domain where jobs have a clear lifecycle.

### 4. Dashboard/Desktop Implementation

**File References**:
- `src/app/employee/workspace/dashboard/page.tsx:7-51` - Dashboard route
- `src/components/recruiter-workspace/RecruiterDashboard.tsx:36-110` - Main component
- `src/components/recruiter-workspace/widgets/` - Dashboard widgets
- `src/lib/navigation/top-navigation.ts:11-27` - My Work tab

#### Current "My Work" Section
The "My Work" tab includes:
- My Dashboard
- Today's Tasks
- My Activities
- Pending Approvals
- Reports
- Notifications

#### Dashboard Widgets (8 Total)
1. **Sprint Progress** - 2-week goal tracking with 6 metrics
2. **Today's Priorities** - Overdue/Due Today/High Priority tasks
3. **Pipeline Health** - Active jobs, submissions, interviews, offers
4. **Account Portfolio** - Account health monitoring
5. **Activity Summary** - 7-day activity tracking
6. **Quality Metrics** - 30-day quality measurements
7. **Upcoming Calendar** - Interviews next 7 days
8. **Recent Wins** - Achievements display

#### "My X" Patterns
- **My Accounts**: `/employee/recruiting/accounts?owner=me`
- **My Assigned Jobs**: `/employee/recruiting/jobs?assigned=me`
- **My Activities**: `/employee/workspace/activities`
- **My Commissions**: `/employee/recruiting/commissions`

**Similarity to Guidewire**: Similar structure but InTime uses dedicated widgets vs Guidewire's table-based "My X" lists. Guidewire's "My Summary" shows counts + tables; InTime shows metrics cards + specialized widgets.

### 5. Dialog/Popup Patterns

**File References**:
- `src/components/ui/dialog.tsx:8-117` - Base dialog component
- `src/components/ui/alert-dialog.tsx:8-135` - Confirmation dialog
- `src/components/recruiting/accounts/` - Domain-specific dialogs

#### Current Dialog Types
1. **Simple Form Dialogs**: AddContactDialog, LogActivityDialog, AddNoteDialog
2. **Multi-Step Wizards**: JobIntakeWizardDialog (5 steps), CloseWonDialog (3 steps)
3. **Detail View Dialogs**: ContactDetailDialog, ActivityDetailDialog (View/Edit mode toggle)
4. **Confirmation Dialogs**: CancelInterviewDialog (two-stage confirmation)

#### Dialog Count
~39 domain-specific dialogs across recruiting, CRM, and admin modules.

#### No Sheet/Drawer Components
The codebase uses only Dialog modals, no Sheet or Drawer patterns.

**Difference from Guidewire**: Guidewire uses more inline editing with "Edit" buttons on cards. InTime currently uses more dialog-based editing. However, the Account edit page (`/accounts/:id/edit`) does use full-page inline editing.

### 6. Metadata-Driven Screen System (Archived)

**File References**:
- `.archive/ui-reference/types/screen.types.ts:30-95` - Screen definition types
- `.archive/ui-reference/renderers/ScreenRenderer.tsx:397-598` - Renderer
- `.archive/ui-reference/screens/recruiting/` - 22 screen definitions

#### Status
The metadata-driven system is **archived** in `.archive/ui-reference/` and not currently active.

#### Screen Types Defined
- `detail` - Single entity detail view
- `list` - Table/grid of entities
- `list-detail` - Master-detail split view
- `wizard` - Multi-step workflow
- `dashboard` - KPI/widget dashboard
- `popup` - Modal dialog

#### Layout Types
- `single-column` - Simple stacked sections
- `two-column` - Two equal columns
- `sidebar-main` - Narrow sidebar + main content
- `tabs` - Tabbed content
- `wizard-steps` - Wizard with step navigation
- `list` - List layout
- `split-view` - Split view

#### 75+ Screen Definitions
Example screens defined:
- `recruiter-dashboard`, `job-list`, `job-detail`, `job-form`
- `candidate-list`, `candidate-detail`, `account-list`, `account-detail`
- `submission-list`, `submission-pipeline`, `interview-detail`

**Similarity to Guidewire**: This archived system closely mirrors Guidewire's declarative UI approach where screens are defined as metadata rather than coded as components.

---

## Detailed File References

### Navigation System
| File | Line | Description |
|------|------|-------------|
| `src/lib/navigation/top-navigation.ts` | 10-128 | Top nav tabs configuration |
| `src/lib/navigation/entity-navigation.types.ts` | 14-27 | Navigation style mapping |
| `src/lib/navigation/entity-journeys.ts` | 10-585 | Journey steps per entity type |
| `src/lib/navigation/EntityNavigationContext.tsx` | 30-150 | Navigation state management |
| `src/components/navigation/TopNavigation.tsx` | 15-588 | Top navigation component |
| `src/components/navigation/AccountSectionSidebar.tsx` | 32-226 | Account section sidebar |
| `src/components/navigation/EntityJourneySidebar.tsx` | 11-216 | Journey sidebar |
| `src/components/navigation/SectionSidebar.tsx` | 35-283 | Generic section sidebar |

### Account Detail
| File | Line | Description |
|------|------|-------------|
| `src/app/employee/recruiting/accounts/[id]/page.tsx` | 112-385 | Main page component |
| `src/app/employee/recruiting/accounts/[id]/layout.tsx` | 13-40 | Server layout |
| `src/app/employee/recruiting/accounts/[id]/edit/page.tsx` | 37-544 | Edit form page |
| `src/components/recruiting/accounts/sections/AccountOverviewSection.tsx` | 95-346 | Overview section |
| `src/components/recruiting/accounts/sections/AccountContactsSection.tsx` | 22-85 | Contacts section |
| `src/server/routers/crm.ts` | 26-620 | Account tRPC procedures |

### Job Detail
| File | Line | Description |
|------|------|-------------|
| `src/app/employee/recruiting/jobs/[id]/page.tsx` | 42-444 | Main page component |
| `src/app/employee/recruiting/jobs/[id]/layout.tsx` | 13-40 | Server layout |
| `src/components/recruiting/submissions/SubmissionPipeline.tsx` | 44-621 | Kanban board |
| `src/components/recruiting/jobs/UpdateStatusDialog.tsx` | 67-184 | Status update dialog |
| `src/components/recruiting/jobs/CloseJobWizard.tsx` | 76-514 | Close wizard |
| `src/server/routers/ats.ts` | 458-1337 | Job tRPC procedures |

### Dashboard
| File | Line | Description |
|------|------|-------------|
| `src/app/employee/workspace/dashboard/page.tsx` | 7-51 | Dashboard route |
| `src/components/recruiter-workspace/RecruiterDashboard.tsx` | 36-110 | Main component |
| `src/components/recruiter-workspace/widgets/` | * | 8 dashboard widgets |
| `src/components/dashboard/DashboardShell.tsx` | 14-95 | Layout wrapper |
| `src/server/routers/dashboard.ts` | 24-810 | Dashboard tRPC procedures |

### Dialogs
| File | Line | Description |
|------|------|-------------|
| `src/components/ui/dialog.tsx` | 8-117 | Base dialog component |
| `src/components/ui/alert-dialog.tsx` | 8-135 | Confirmation dialog |
| `src/components/recruiting/accounts/LogActivityDialog.tsx` | 36-235 | Activity logging |
| `src/components/recruiting/accounts/AddContactDialog.tsx` | 28-235 | Contact creation |
| `src/components/recruiting/accounts/ContactDetailDialog.tsx` | 62-381 | Contact detail/edit |
| `src/components/recruiting/jobs/JobIntakeWizardDialog.tsx` | 38-1328 | 5-step wizard |

---

## Architecture Comparison Summary

| Aspect | Guidewire PolicyCenter | InTime Current |
|--------|----------------------|----------------|
| **Top Nav** | Object tabs with dropdowns | Object tabs with dropdowns |
| **Recent Entities** | Last 5 per type in dropdown | Last 5 per type in dropdown |
| **Account Detail** | Section sidebar | Section sidebar (identical) |
| **Policy/Job Detail** | Section sidebar | Journey-based sidebar |
| **Desktop/My Work** | Summary + "My X" tables | Dashboard widgets + "My X" filters |
| **Editing** | Inline "Edit" buttons | Mix of dialogs and edit pages |
| **Screen Definition** | Metadata-driven | Archived metadata system; currently component-based |
| **Dialog Usage** | Minimal (inline editing) | Heavy (~39 dialogs) |

---

## Key Observations

### Already Aligned with Guidewire
1. **Account section sidebar** - Nearly identical implementation
2. **Top navigation with dropdowns** - Same pattern with recent entities
3. **"My X" patterns** - Exist via URL filters (owner=me, assigned=me)
4. **Entity context management** - EntityNavigationContext provides current entity state
5. **Section-based navigation** - Accounts, Deals, Leads use this style

### Different from Guidewire
1. **Jobs use journey-based navigation** instead of sections (appropriate for recruiting workflow)
2. **More reliance on dialogs** vs inline editing
3. **Dashboard uses specialized widgets** vs Guidewire's table-based "My Summary"
4. **Metadata screen system is archived** and not actively used

### Partial Implementations
1. **Edit patterns** - Account has full-page edit (`/edit`), but most entities use dialogs
2. **Desktop concept** - Exists as "My Work" but widget-focused vs table-focused

---

## Open Questions

1. Should the archived metadata-driven screen system be revived for new screens?
2. Should Jobs switch from journey-based to section-based navigation to match Guidewire Policy?
3. Which dialogs should be converted to inline editing or dedicated edit pages?
4. Should the dashboard be reorganized with more "My X" table views vs metric widgets?
