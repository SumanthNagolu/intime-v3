---
date: 2025-12-07T09:32:46-05:00
researcher: Claude
git_commit: 8b61372671012d86153386a58656ef08b5a2a999
branch: main
repository: intime-v3
topic: "Guidewire Architecture Philosophy Alignment - Entity-Centric UI, Wizards, Navigation"
tags: [research, architecture, guidewire, navigation, wizards, entity-centric, ui-patterns]
status: complete
last_updated: 2025-12-07
last_updated_by: Claude
---

# Research: Guidewire Architecture Philosophy Alignment

**Date**: 2025-12-07T09:32:46-05:00
**Researcher**: Claude
**Git Commit**: 8b61372671012d86153386a58656ef08b5a2a999
**Branch**: main
**Repository**: intime-v3

## Research Question

How does Guidewire InsuranceSuite implement:
1. Unified UI controlled by entities, roles, and permissions
2. Top horizontal navigation with entity dropdowns (Claims, Policies, Desktop)
3. Left-side wizard navigation for entity lifecycles (sequential steps capturing full journey)
4. Sub-wizards for complex nested flows

And how does InTime's current architecture compare? What files and patterns are relevant?

---

## Summary

Guidewire implements a sophisticated **entity-centric, wizard-driven UI architecture** where:
- **Top navigation** provides entity-level access (Claims, Policies, Desktop) with dropdown menus for search, recent items, and quick actions
- **Left sidebar** shows **contextual wizard steps** based on the entity/transaction being worked on
- **Entity wizards** capture complete business flows (e.g., Policy submission: 11 steps from Offering to Payment)
- **Sub-wizards** handle nested complexity (e.g., Payment wizard within Policy wizard)

InTime currently implements:
- **Role-based sidebar navigation** (not entity-based)
- **Horizontal tab layouts** for subsections (partial entity-centric pattern)
- **Custom wizard components** for specific flows (5 active wizards found)
- **Tab-based entity detail pages** (not wizard-based entity journey)

The key architectural gap: **InTime organizes navigation by role/module, Guidewire organizes by entity/transaction type**.

---

## Detailed Findings

### Part 1: Guidewire Architecture Patterns

#### 1.1 Top Navigation Pattern

Guidewire uses a **tab bar navigation system** at the top with:

| Component | Purpose |
|-----------|---------|
| **Tab bar** | Horizontal tabs across top of application |
| **Tab menus** | Dropdown menus showing links when tab clicked |
| **QuickJump** | Keyboard shortcut (`/` or `Alt+/`) for instant navigation |
| **InfoBar** | Contextual info bar visible on Account/Policy tabs |

**QuickJump Feature**:
- Type name of page/function to navigate directly
- Search for entities (accounts, policies, claims) by number
- Access common screens without mouse navigation

**Entity Dropdown Structure** (conceptual):
```
Claims Tab Dropdown:
├── Search Claims
├── Recent Claims (last 5-10 viewed)
├── My Claims (assigned to user)
└── Create New Claim

Policies Tab Dropdown:
├── Search Policies
├── Recent Policies
├── My Submissions
└── Start New Submission

Desktop Tab (My Work):
├── My Activities (assigned tasks)
├── My Queues (group queues user can claim from)
├── Pending Approvals
└── Notifications
```

#### 1.2 Left-Side Wizard Navigation

Guidewire's **Job Wizards** are sequential UI pages for specific transactions:

**PolicyCenter New Submission Wizard (11 Steps)**:
| Step | Name | Purpose |
|------|------|---------|
| 1 | Offering | Select product types |
| 2 | Prequalification | Basic qualification questions |
| 3 | Policy Info | Capture basic information |
| 4 | UW | Underwriting based on state requirements |
| 5 | Coverages | Select coverages (collision, liability, etc.) |
| 6 | Modifiers | Coverage increases/decreases |
| 7 | Risk Analysis | Underwriting concerns review |
| 8 | Policy Review | Full application summary |
| 9 | Quote | Rating engine returns quote |
| 10 | Forms | Policy documents available |
| 11 | Payments | Payment options and plans |

**Key Characteristics**:
- Steps correspond to workflow states
- InfoBar shows context (account/policy info)
- Actions menu in sidebar for step-specific actions
- Progress indicator shows completed/current/pending steps

#### 1.3 Entity-Centric UI Design

**Three Core Entity Types**:
- **Account** (parent container)
- **Policy** (owned by account)
- **Claim** (against policy)

**How UI Changes Based on Entity Context**:

| Context | Navigation | Sidebar | InfoBar |
|---------|------------|---------|---------|
| Account level | Account tabs | Account actions | Account summary |
| Policy level | Policy wizard steps | Policy actions | Policy/Account summary |
| Claim level | Claim processing steps | Claim actions | Claim/Policy summary |

**Hierarchy Navigation**:
- InfoBar includes links to navigate "up" (from Policy to Account)
- Sidebar items are contextual to current entity
- Actions menu changes based on entity type and status

#### 1.4 Desktop/My Work Pattern

Guidewire's **Activity System** for personal workspace:

**Activity Assignment Methods**:
1. Direct to specific user
2. To group (auto-assigned via rules)
3. To queue (user manually claims)

**Queue Functionality**:
- Repository belonging to a group
- Contains activities not yet assigned to individuals
- Users can take ownership based on workload/expertise

**Activity Properties**:
- Priority: High, Low, Normal, Urgent
- Status: Canceled, Complete, Open, Skipped
- Due dates with escalation rules

#### 1.5 Sub-Wizard Pattern

Guidewire supports nested wizards through **PCF Location Types**:

| Type | Purpose |
|------|---------|
| Page | Standard page view |
| Wizard | Sequential multi-step workflow |
| Popup | Modal overlay dialog (sub-wizard) |
| Worksheet | Renders outside main area |
| Location Group | Container for multiple screens |

**Sub-Wizard Implementation**:
- **Popup**: Modal dialogs for focused sub-workflows
- **Worksheet**: Side panel for secondary tasks
- Navigation: `push` for popups, `go` for pages/wizards

---

### Part 2: Guidewire Data Model

#### 2.1 Core Business Objects

**Entity Relationships**:
```
Organization
    └── Producer (via ProducerCode)
         └── Account
              ├── Policy (one-to-many)
              │    ├── PolicyPeriod (versioned terms)
              │    ├── PolicyLine (coverage lines)
              │    └── PolicyContact
              └── Contact (account contacts)

Claim
    ├── Policy (copy of policy data)
    ├── Incident (lost/damaged items)
    ├── Exposure (potential payments)
    ├── ClaimContact (involved parties)
    └── ServiceRequest (vendor services)
```

#### 2.2 EffDated Entity Versioning

Guidewire's temporal data model:
- **EffDated Entity**: Has EffectiveDate and ExpirationDate
- **PolicyPeriod**: Root bucket for all versioned policy data
- Every policy modification creates new PolicyPeriod row
- "Deletion" sets expDate = effDate (logical delete, preserves history)

#### 2.3 Activity-Centric Model

Activities track work items across all entities:
- Attached to Claims, Policies, Accounts
- Patterns define automated activity sequences
- Work plans triggered on entity creation
- Assignment engine uses hierarchical rules

#### 2.4 Configuration-First Philosophy

Guidewire's approach: **"Design solutions that are primarily configuration-driven"**

| Configured | Coded (Gosu) |
|------------|--------------|
| Entity model extensions | Complex business logic |
| Typelists/typekeys | Custom calculations |
| Business rules | Integration transformations |
| PCF UI definitions | Conditional workflow logic |
| Workflows | Custom validation |
| Event configurations | Activity pattern triggers |

---

### Part 3: InTime Current Architecture

#### 3.1 Navigation System

**Current Pattern**: Role-based sidebar navigation

**File**: `src/lib/navigation/adminNavConfig.ts:19-125`
```typescript
// Navigation organized by ROLE, not by ENTITY
export const adminNavSections: SidebarSection[] = [
  { title: 'Main', items: [{ label: 'Dashboard', href: '/employee/admin/dashboard' }] },
  { title: 'User Management', items: [...] },
  { title: 'System', items: [...] },
  { title: 'Monitoring', items: [...] },
]
```

**File**: `src/lib/navigation/recruiterNavConfig.ts:24-140`
```typescript
export const recruiterNavSections: SidebarSection[] = [
  { title: 'Workspace', items: [/* My Dashboard, Today, Reports */] },
  { title: 'Recruiting', items: [/* Jobs, Candidates, Submissions, ... */] },
  { title: 'CRM', items: [/* Accounts, Leads, Deals, ... */] },
  { title: 'Settings', items: [...] },
]
```

**Key Files**:
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/navigation/Sidebar.tsx` | 27-138 | Renders sidebar navigation tree |
| `src/components/navigation/PortalHeader.tsx` | 11-129 | Top header with logo and user menu |
| `src/components/navigation/CommandPalette.tsx` | 28-534 | Global search (similar to QuickJump) |

**CommandPalette** (lines 362-372): Activated via `Cmd+K` / `Ctrl+K` - provides quick navigation like Guidewire's QuickJump.

#### 3.2 Layout Components

**Primary Layouts**:

| Component | File | Purpose |
|-----------|------|---------|
| SidebarLayout | `src/components/layouts/SidebarLayout.tsx:17-30` | Main app shell with sidebar |
| HorizontalTabsLayout | `src/components/layouts/HorizontalTabsLayout.tsx:33-111` | Tabbed subsections |

**SidebarLayout Structure** (lines 17-30):
```tsx
<div className="h-screen flex flex-col">
  <PortalHeader />                          // Top header
  <div className="flex flex-1">
    <Sidebar sections={sections} />         // Left sidebar (256px)
    <main className="flex-1">{children}</main>  // Content area
  </div>
</div>
```

**HorizontalTabsLayout** (lines 33-111):
- Used for settings pages, integrations, audit logs, etc.
- Supports grouped tabs with titles
- Active tab highlighted with gold underline

**Example Usage**: `src/app/employee/admin/settings/layout.tsx:104-118`
```typescript
// Settings uses horizontal tabs for Organization/System groups
<HorizontalTabsLayout
  title="Settings"
  groups={settingsTabGroups}  // 2 groups, 14 total tabs
>
```

#### 3.3 Entity Detail Pages

**Current Pattern**: Tab-based detail views

**Job Detail Page**: `src/app/employee/recruiting/jobs/[id]/page.tsx:286-560`
```
┌─────────────────────────────────────────┐
│ Job Header (title, status, actions)      │
├─────────────────────────────────────────┤
│ [Overview] [Pipeline] [Activity]         │  ← Horizontal tabs
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (varies by tab)                        │
│                                         │
│           │  Sidebar                    │
│           │  - Details                  │
│           │  - Status History           │
│                                         │
└─────────────────────────────────────────┘
```

**Tabs on Entity Pages**:
| Entity | Tabs |
|--------|------|
| Job | Overview, Pipeline, Activity |
| Candidate | Overview, Screening, Profiles |
| Deal | Overview (with stage pipeline) |
| Account | Overview, Contacts, Jobs, Activity |

#### 3.4 Wizard Components

**5 Active Wizard Implementations Found**:

| Wizard | File | Steps | Purpose |
|--------|------|-------|---------|
| OnboardingWizard | `src/components/recruiting/accounts/OnboardingWizardDialog.tsx:40-1118` | 6 | Account onboarding |
| JobIntakeWizard | `src/components/recruiting/jobs/JobIntakeWizardDialog.tsx:38-1334` | 5 | Job requisition intake |
| ConfirmPlacementWizard | `src/components/recruiting/placements/ConfirmPlacementWizard.tsx:129-937` | 6 | Placement confirmation |
| CloseJobWizard | `src/components/recruiting/jobs/CloseJobWizard.tsx:75-563` | 2-3 | Job closure |
| ImportWizard | `src/components/admin/data/ImportWizard.tsx:44-572` | 4 | Data import |

**Common Wizard Pattern**:
```typescript
// Step type definition
type Step = 1 | 2 | 3 | 4 | 5 | 6
// or
type WizardStep = 'schedule' | 'rates' | 'logistics' | 'contacts' | 'paperwork' | 'review'

// Step configuration
const STEPS = [
  { number: 1, title: 'Company Profile', icon: Building2 },
  { number: 2, title: 'Contract Setup', icon: FileText },
  // ...
]

// State management
const [step, setStep] = useState<Step>(1)

// Navigation
const handleNext = () => setStep((step + 1) as Step)
const handleBack = () => setStep((step - 1) as Step)

// Progress indicator with checkmarks for completed steps
```

**Wizard UI Pattern** (from OnboardingWizardDialog:1051-1080):
- Circular numbered indicators
- Completed steps show checkmark
- Connector lines between steps
- Dialog footer with Back/Next/Complete buttons

#### 3.5 Entity Lifecycles

**Status Enums and Transitions**:

| Entity | File:Line | Statuses |
|--------|-----------|----------|
| Job | `migrations/20251124010000:89` | draft, open, active, on_hold, filled, cancelled |
| Submission | `migrations/20251124010000:168-170` | sourced, screening, submission_ready, submitted_to_client, client_review, client_interview, offer_stage, placed, rejected, withdrawn |
| Interview | `migrations/20251124010000:276` | scheduled, completed, cancelled, no_show |
| Offer | `migrations/20251124010000:338` | draft, sent, negotiating, accepted, declined, withdrawn |
| Placement | `migrations/20251124010000:419` | pending_start, active, extended, ended, cancelled |
| Account | `migrations/20251124000000:18-19` | prospect, active, inactive, churned |
| Lead | `migrations/20251124000000:195-196` | new, contacted, qualified, unqualified, nurture, converted, lost |
| Deal | `migrations/20251210000001:17` | discovery, qualification, proposal, negotiation, verbal_commit, closed_won, closed_lost |

**Automatic Triggers** (database-level cascades):
- `migrations/20251124010000:369-389`: Offer accepted → Submission placed
- `migrations/20251124010000:455-473`: Placement active → Candidate placed
- `migrations/20251124010000:231-247`: Submission placed → Job positions_filled++

**Status History Tracking**:
- `migrations/20260103000000:9-48`: `job_status_history` table
- `migrations/20251130211000:428-449`: `deal_stages_history` table

#### 3.6 Permission System

**Role-Based Access Control**:

| Component | File | Purpose |
|-----------|------|---------|
| Role definitions | `migrations/20251130200000:133-164` | `system_roles` table |
| Permission mapping | `migrations/20251206000000:46-62` | `role_permissions` table |
| Permission evaluator | `src/lib/auth/permission-evaluator.ts:30-215` | 6-step evaluation chain |
| tRPC middleware | `src/server/trpc/middleware.ts:4-35` | Auth + org guards |

**Permission Evaluation Chain** (evaluator.ts:30-215):
1. User lookup with role/pods
2. Account status check (active required)
3. Permission override check (highest priority)
4. Role permission check
5. Data scope validation (own, team, org)
6. Feature flag check

**Scope Levels** (permission-types.ts:16-24):
- `own` - User's own records
- `own_raci` - Records with RACI assignment
- `team` - Team/pod members' records
- `region` - Regional records
- `org` - Organization-wide

---

### Part 4: Architectural Comparison

#### 4.1 Navigation Philosophy

| Aspect | Guidewire | InTime Current |
|--------|-----------|----------------|
| **Organization** | Entity-centric | Role/module-centric |
| **Top navigation** | Entity type tabs (Claims, Policies, Desktop) | None (logo + user menu only) |
| **Sidebar** | Contextual to current entity/transaction | Static per role |
| **Quick navigation** | QuickJump (`/` key) | CommandPalette (`Cmd+K`) |

#### 4.2 Entity Journey Representation

| Aspect | Guidewire | InTime Current |
|--------|-----------|----------------|
| **Entity lifecycle** | Left-side wizard steps | Tab-based detail pages |
| **Step visualization** | Sequential sidebar navigation | Tabs (Overview, Pipeline, Activity) |
| **Progress tracking** | Wizard step indicators | Status badges + history |
| **Sub-flows** | Popup/Worksheet sub-wizards | Dialog-based wizards |

#### 4.3 Permission Integration

| Aspect | Guidewire | InTime Current |
|--------|-----------|----------------|
| **UI visibility** | PCF file conditions | Static navigation per role |
| **Action permissions** | Per-element visibility | Server-side tRPC checks |
| **Role hierarchy** | Group-based with inheritance | Category-based (IC, Manager, Leadership, Executive, Admin) |

---

### Part 5: Mapping InTime Entities to Guidewire Pattern

If InTime adopted Guidewire-style entity-centric navigation:

#### 5.1 Proposed Top Navigation Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] │ Jobs ▼ │ Accounts ▼ │ Candidates ▼ │ My Workspace ▼ │ 👤│
└──────────────────────────────────────────────────────────────────┘

Jobs Dropdown:           Accounts Dropdown:        My Workspace:
├── Search Jobs         ├── Search Accounts       ├── My Dashboard
├── Recent Jobs         ├── Recent Accounts       ├── My Activities
├── My Assigned Jobs    ├── My Accounts           ├── My Queues
├── Create New Job      ├── Create Account        ├── Pending Approvals
└── Job Board           └── Account Health        └── Today's Tasks
```

#### 5.2 Proposed Entity Journey Wizards

**Job Journey (left sidebar when in Job context)**:
```
Job: Senior Developer @ Acme Corp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✓ Job Info
2. ✓ Requirements
3. ● Sourcing         ← Current step
4. ○ Pipeline
5. ○ Interviews
6. ○ Offers
7. ○ Placement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actions:
• Edit Job
• Pause Job
• Close Job
```

**Submission Journey**:
```
Submission: John Doe → Sr. Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✓ Sourced
2. ✓ Screening
3. ● Client Submission  ← Current
4. ○ Client Review
5. ○ Interviews
6. ○ Offer
7. ○ Placement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Actions:
• Schedule Interview
• Update Status
• Withdraw
```

**Account Journey**:
```
Account: Acme Corporation
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ● Company Profile
2. ○ Contacts
3. ○ Contracts & Terms
4. ○ Active Jobs
5. ○ Placements
6. ○ Billing & Invoices
━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick Stats:
• 5 Active Jobs
• 12 Placements YTD
• Health: Healthy
```

---

## Code References

### Navigation System
- `src/lib/navigation/adminNavConfig.ts:19-125` - Admin nav sections
- `src/lib/navigation/recruiterNavConfig.ts:24-140` - Recruiter nav sections
- `src/components/navigation/Sidebar.tsx:27-138` - Sidebar component
- `src/components/navigation/PortalHeader.tsx:11-129` - Top header
- `src/components/navigation/CommandPalette.tsx:28-534` - Quick navigation

### Layout System
- `src/components/layouts/SidebarLayout.tsx:17-30` - Main layout
- `src/components/layouts/HorizontalTabsLayout.tsx:33-111` - Tab layout
- `src/app/employee/admin/settings/layout.tsx:104-118` - Settings tabs

### Wizard Components
- `src/components/recruiting/accounts/OnboardingWizardDialog.tsx:40-1118` - 6-step account wizard
- `src/components/recruiting/jobs/JobIntakeWizardDialog.tsx:38-1334` - 5-step job wizard
- `src/components/recruiting/placements/ConfirmPlacementWizard.tsx:129-937` - 6-step placement wizard
- `src/components/recruiting/jobs/CloseJobWizard.tsx:75-563` - Dynamic 2-3 step wizard
- `src/components/admin/data/ImportWizard.tsx:44-572` - 4-step import wizard

### Entity Detail Pages
- `src/app/employee/recruiting/jobs/[id]/page.tsx:286-560` - Job detail with tabs
- `src/app/employee/crm/deals/[id]/page.tsx` - Deal detail with stage pipeline
- `src/app/employee/recruiting/candidates/[id]/page.tsx:101-199` - Candidate detail

### Status Definitions
- `supabase/migrations/20251124010000_create_ats_module.sql:89` - Job status
- `supabase/migrations/20251124010000_create_ats_module.sql:168-170` - Submission status
- `supabase/migrations/20251124010000_create_ats_module.sql:338` - Offer status
- `supabase/migrations/20251124010000_create_ats_module.sql:419` - Placement status
- `supabase/migrations/20251124000000_create_crm_module.sql:18-19` - Account status

### Status Transitions
- `src/components/recruiting/jobs/UpdateStatusDialog.tsx:44-52` - Job transitions
- `src/components/recruiting/submissions/SubmissionPipeline.tsx:44-52` - Submission pipeline
- `supabase/migrations/20251124010000_create_ats_module.sql:369-389` - Auto transitions

### Permission System
- `src/lib/auth/permission-evaluator.ts:30-215` - Permission evaluation
- `src/server/trpc/middleware.ts:4-35` - Auth middleware
- `supabase/migrations/20251206000000_permission_management_tables.sql:24-40` - Permission schema

### Archived Metadata System
- `.archive/ui-reference/renderers/ScreenRenderer.tsx:397-598` - Screen renderer
- `.archive/ui-reference/renderers/LayoutRenderer.tsx:334-462` - Wizard-steps layout
- `.archive/ui-reference/forms/FormStepper.tsx:1-331` - Reusable form stepper

---

## Key Guidewire Terminology

| Term | Definition | InTime Equivalent |
|------|------------|-------------------|
| **Job** | Policy transaction (submission, renewal, etc.) | Submission (candidate-to-job transaction) |
| **PolicyPeriod** | Versioned slice of policy data | N/A (no temporal versioning) |
| **Exposure** | Potential payment to claimant | Placement (revenue/cost event) |
| **Activity** | Work item/task with assignment | Activity (via activity system) |
| **Queue** | Group repository for unassigned work | N/A (direct assignment) |
| **PCF** | Page Configuration Format (XML UI) | Screen definitions (archived metadata) |
| **Gosu** | Guidewire scripting language | TypeScript |
| **ProducerCode** | Links account to producer/agency | account_manager_id / owner_id |

---

## Sources

### Guidewire Documentation
- [InsuranceSuite Core Insurance Software](https://www.guidewire.com/products/core-products/insurancesuite)
- [Configuration Guides](https://www.guidewire.com/developers/developer-tools-and-guides/configuration-guides)
- [Gosu Programming Language](https://www.guidewire.com/developers/developer-tools-and-guides/gosu-programming-language)
- [Policy Contacts API](https://docs.guidewire.com/cloud/pc/202407/cloudapibf/cloudAPI/topics/123-PCpolicies/09-policy-contacts/)
- [Activity Assignment](https://docs.guidewire.com/cloud/cc/202306/cloudapibf/cloudAPI/topics/141-Framework/01_activities/c_assigning-activities.html)
- [Queues](https://docs.guidewire.com/cloud/cc/202306/cloudapibf/cloudAPI/topics/141-Framework/04_users-and-groups/c_queues.html)
- [App Events Overview](https://docs.guidewire.com/education/cloud-integration-basics/latest/docs/integration_cloud_basics/appevents_overview/)

### Additional Resources
- [Guidewire Tutorial - TechSolidity](https://techsolidity.com/blog/guidewire-tutorial)
- [How Guidewire ClaimCenter Works](https://cloudfoundation.com/blog/how-does-guidewire-claim-center-work/)
- [PCF Files Introduction](https://medium.com/@salendraabhilash1/guidewire-role-of-pcf-files-36dc06230b72)
- [Configuring Applications in Guidewire](https://guidewiremasters.in/configuring-applications-in-guidewire/)

---

## Open Questions

1. **Entity Context Switching**: How should navigation update when user navigates from Job → Submission → Interview? Should sidebar completely change or show nested hierarchy?

2. **Wizard Step Persistence**: When user leaves a wizard mid-flow, should progress be auto-saved? Guidewire uses "Unsaved Work" menu.

3. **Sub-Wizard Implementation**: Should sub-wizards (like Payment wizard in Placement flow) be modals (current) or dedicated pages with "return to parent" navigation?

4. **Activity/Queue System**: Does InTime need Guidewire-style work queues where users claim items from group pools?

5. **Temporal Data**: Should InTime implement EffDated versioning for contracts, placements, or other time-sensitive entities?

6. **Role vs Entity Navigation**: How to handle users with multiple roles (e.g., recruiter who also does bench sales)? Show all entity types or role-specific subset?
