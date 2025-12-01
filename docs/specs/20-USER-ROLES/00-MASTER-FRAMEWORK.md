# InTime OS - Master Documentation Framework

**Version:** 2.0
**Last Updated:** 2025-11-30
**Status:** Canonical Reference - ALL role documentation MUST follow this framework

---

## Table of Contents

1. [Business Philosophy](#1-business-philosophy)
2. [Role Architecture](#2-role-architecture)
3. [RACI Ownership Model](#3-raci-ownership-model)
4. [Documentation Standards](#4-documentation-standards)
5. [Screen Specification Template](#5-screen-specification-template)
6. [Component Library](#6-component-library)
7. [Field Specification Standards](#7-field-specification-standards)
8. [Workflow Documentation Format](#8-workflow-documentation-format)
9. [Integration Specification Format](#9-integration-specification-format)
10. [Test Case Standards](#10-test-case-standards)
11. [Prototype & Wireframe Standards](#11-prototype--wireframe-standards)
12. [International Operations](#12-international-operations)
13. [Vendor & Commission Framework](#13-vendor--commission-framework)
14. [Activities & Events Framework](#14-activities--events-framework)

---

## 1. Business Philosophy

### 1.1 Partner Model

InTime OS operates on a **Partner Model** where every team member is an **Individual Contributor (IC)** with:

- **End-to-End Ownership**: Each person handles their work from start to finish
- **Full Responsibility**: Accountable for outcomes, not just tasks
- **Full Accountability**: Measured on results, empowered to make decisions
- **Combined Roles**: Rather than siloed specialists, each person combines multiple capabilities

### 1.2 Core Business Domains

| Domain | Description | Primary Roles |
|--------|-------------|---------------|
| **Recruiting (ATS)** | End-to-end hiring for client positions | Technical Recruiter, Recruiting Manager |
| **Bench Sales** | Consultant marketing and placement | Bench Sales Recruiter, Bench Manager |
| **Talent Acquisition** | Lead generation, internal hiring, training | TA Specialist, TA Manager |
| **CRM** | Client relationship management | Account Manager (combined with Recruiter) |
| **Finance** | Invoicing, payroll, commissions | CFO, Finance Team |
| **HR** | People operations, compliance | HR Manager |
| **Operations** | Process optimization, SLAs | COO, Regional Directors |

### 1.3 Key Business Rules

1. **Pods = Teams**: Flexible project/client/domain/region-based groupings
2. **Dual Ownership**: Every object has Primary (R) and Secondary (A) owners
3. **Manager Consultation**: Pod Manager is always Consulted (C) on key decisions
4. **Executive Visibility**: COO is always Informed (I) on all object changes
5. **No Silos**: Information flows freely; permissions enable, not restrict
6. **Client-Centric**: Every action maps to client value

---

## 2. Role Architecture

### 2.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CEO (Vision & Strategy)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐    ┌──────────────────────────┐    ┌─────────────┐ │
│  │    CFO      │    │          COO             │    │   Admin     │ │
│  │  (Finance)  │    │     (Operations)         │    │  (System)   │ │
│  └─────────────┘    └──────────────────────────┘    └─────────────┘ │
│                              │                                        │
│           ┌──────────────────┼──────────────────┐                    │
│           │                  │                  │                    │
│  ┌────────▼────────┐  ┌──────▼──────┐  ┌───────▼───────┐            │
│  │ Regional Dir 1  │  │ Regional 2  │  │  HR Manager   │            │
│  │ (US + Canada)   │  │ (APAC/EU)   │  │  (People Ops) │            │
│  └────────┬────────┘  └──────┬──────┘  └───────────────┘            │
│           │                  │                                        │
│  ┌────────▼────────────────────────────────┐                         │
│  │              POD MANAGERS               │                         │
│  │  (Project/Client/Domain/Region Based)   │                         │
│  └────────┬───────────────┬───────────────┬┘                         │
│           │               │               │                          │
│  ┌────────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐                 │
│  │   Technical    │ │   Bench   │ │      TA       │                 │
│  │   Recruiter    │ │   Sales   │ │  Specialist   │                 │
│  │  (BDM+AM+Rec+  │ │ (Build+   │ │ (Leads+Train+ │                 │
│  │   Delivery)    │ │ Market+   │ │  Internal)    │                 │
│  │                │ │ Vendor)   │ │               │                 │
│  └────────────────┘ └───────────┘ └───────────────┘                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

EXTERNAL PORTALS:
┌─────────────────────┐    ┌──────────────────────┐
│   Client Portal     │    │   Candidate Portal   │
│  (Jobs, Candidates, │    │  (Profile, Apps,     │
│   Interviews, etc.) │    │   Interviews, etc.)  │
└─────────────────────┘    └──────────────────────┘
```

### 2.2 Role Definitions

#### 2.2.1 Technical Recruiter (Combined Role)

**Identity:** End-to-end recruiting professional in Partner Model

**Combined Responsibilities:**
| Traditional Role | Responsibilities in Combined Role |
|-----------------|-----------------------------------|
| **Business Development Manager (BDM)** | Prospect new clients, build relationships, identify opportunities |
| **Account Manager (AM)** | Maintain client relationships, understand needs, ensure satisfaction |
| **Recruiter** | Source candidates, screen, match to requirements, coordinate interviews |
| **Delivery Manager (DM)** | Ensure successful placements, manage onboarding, handle post-placement |

**Key Metrics:**
- Jobs filled per month
- Placements revenue
- Client satisfaction (NPS)
- Time-to-fill
- Placement retention (30/60/90 day)

#### 2.2.2 Bench Sales Recruiter (Combined Role)

**Identity:** Consultant marketing and placement professional

**Combined Responsibilities:**
| Traditional Role | Responsibilities in Combined Role |
|-----------------|-----------------------------------|
| **Bench Builder** | Source consultants (OPT, H1B, GC, USC, Canada PR, OWP, etc.) |
| **Marketing Specialist** | Create hotlists, mass outreach, LinkedIn campaigns |
| **Vendor Relations** | Manage third-party vendor bench, negotiate terms |
| **Immigration Coordinator** | Track visa status, deadlines, compliance |
| **Placement Specialist** | Submit to jobs, negotiate rates, close deals |

**Key Metrics:**
- Bench utilization rate
- Marketing response rate
- Placements per month
- Average margin per placement
- Immigration compliance rate

#### 2.2.3 TA Specialist (Combined Role)

**Identity:** Business development and talent pipeline professional

**Combined Responsibilities:**
| Traditional Role | Responsibilities in Combined Role |
|-----------------|-----------------------------------|
| **Lead Generator** | Generate leads for bench sales (corporate training, staffing needs) |
| **Training Coordinator** | Source candidates for Academy training programs |
| **Internal Recruiter** | Handle internal hiring for InTime positions |
| **Pipeline Manager** | Nurture leads through sales funnel |

**Key Metrics:**
- Leads generated per month
- Lead-to-deal conversion rate
- Training enrollments
- Internal positions filled
- Pipeline value

### 2.3 Role Assignments

Each user can have ONE primary role, with capability to act in multiple capacities:

```typescript
interface UserRole {
  primaryRole: 'technical_recruiter' | 'bench_sales' | 'ta_specialist' | 'pod_manager' |
               'regional_director' | 'hr_manager' | 'cfo' | 'coo' | 'ceo' | 'admin';

  // Capabilities enabled by primary role
  capabilities: {
    bdm: boolean;        // Business development
    am: boolean;         // Account management
    recruiting: boolean; // Candidate sourcing
    delivery: boolean;   // Placement management
    benchBuilding: boolean;
    marketing: boolean;
    vendorRelations: boolean;
    immigration: boolean;
    leadGen: boolean;
    training: boolean;
    internalHiring: boolean;
  };

  // Data scope
  dataScope: 'own' | 'team' | 'pod' | 'region' | 'org';
}
```

---

## 3. RACI Ownership Model

### 3.1 RACI Definition

Every business object in InTime OS has mandatory RACI assignments:

| Role | Symbol | Description | Permissions | Required |
|------|--------|-------------|-------------|----------|
| **Responsible** | R | Does the work, primary owner | Full edit, delete draft | Yes (exactly 1) |
| **Accountable** | A | Approves/owns outcome, secondary owner | Full edit, approve | Yes (exactly 1) |
| **Consulted** | C | Provides input before decisions | View, comment | Yes (Pod Manager) |
| **Informed** | I | Kept updated on progress | View only | Yes (COO default) |

### 3.2 RACI by Object Type

#### Jobs (Requisitions)

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Job Created | Creator (Recruiter) | Pod Manager | Secondary Recruiter | COO |
| Job Published | Primary Recruiter | Pod Manager | Account contact | COO, Client |
| Job Updated | Primary Recruiter | Pod Manager | Secondary Recruiter | COO |
| Job Filled | Primary Recruiter | Pod Manager | Finance | COO, Client |
| Job Closed | Primary Recruiter | Pod Manager | - | COO |

#### Candidates/Talent

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Candidate Sourced | Sourcing Recruiter | Pod Manager | - | COO |
| Candidate Updated | Owner Recruiter | Pod Manager | - | - |
| Candidate Submitted | Submitting Recruiter | Pod Manager | Primary Recruiter | COO, Client |
| Candidate Placed | Primary Recruiter | Pod Manager | Finance, HR | COO, Client |

#### Submissions

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Submission Created | Recruiter | Pod Manager | Secondary Recruiter | COO |
| Rate Override | Recruiter | Pod Manager | Finance | COO |
| Client Feedback | Recruiter | Pod Manager | - | COO |
| Interview Scheduled | Recruiter | Pod Manager | - | Candidate, Client |
| Offer Extended | Recruiter | Pod Manager | Finance | COO, HR |

#### Bench Consultants

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Consultant Onboarded | Bench Sales Rep | Pod Manager | Immigration (if visa) | COO |
| Hotlist Created | Bench Sales Rep | Pod Manager | Marketing | COO |
| Consultant Submitted | Bench Sales Rep | Pod Manager | - | COO |
| Consultant Placed | Bench Sales Rep | Pod Manager | Finance, HR | COO |
| Immigration Update | Bench Sales Rep | Pod Manager | Legal | COO, HR |

#### Accounts (Clients)

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Account Created | Creator | Pod Manager | Regional Director | COO |
| Account Assigned | New Owner | Pod Manager | Previous Owner | COO |
| Contract Signed | Account Owner | Regional Director | Finance, Legal | COO, CEO |
| Account Escalation | Account Owner | Regional Director | COO | CEO |

#### Leads & Deals

| Event | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|-------|-----------------|-----------------|---------------|--------------|
| Lead Created | TA Specialist | Pod Manager | - | COO |
| Lead Qualified | TA Specialist | Pod Manager | - | COO |
| Deal Created | TA Specialist | Pod Manager | Finance | COO |
| Deal Won | TA Specialist | Pod Manager | Recruiting Manager | COO, CEO |
| Deal Lost | TA Specialist | Pod Manager | - | COO |

### 3.3 RACI Assignment UI

Every object detail page MUST include an RACI Assignment Panel:

```
┌─────────────────────────────────────────────────────────────┐
│ OWNERSHIP (RACI)                                    [Edit]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Responsible (R)          Accountable (A)                   │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ 👤 John Smith   │      │ 👤 Sarah Jones  │              │
│  │ Tech Recruiter  │      │ Pod Manager     │              │
│  │ Assigned: Nov 1 │      │ Assigned: Nov 1 │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                             │
│  Consulted (C)            Informed (I)                      │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ 👤 Mike Brown   │      │ 👤 Lisa Chen    │              │
│  │ Secondary Rec   │      │ COO             │              │
│  │ + Add more...   │      │ + Regional Dir  │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                             │
│  [View History]  [Transfer Ownership]  [Add Stakeholder]   │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 RACI Transfer Workflow

```
UC-RACI-001: Transfer Ownership

PRECONDITIONS:
- Current user is R, A, or has Manager+ role
- New assignee is valid user in organization
- New assignee has appropriate role for object type

MAIN FLOW:
1. User clicks [Transfer Ownership] on RACI panel
2. System displays Transfer Modal:
   ┌────────────────────────────────────────────┐
   │ Transfer Ownership                    [X]  │
   ├────────────────────────────────────────────┤
   │                                            │
   │ Transfer Type: ○ R only  ○ A only  ● Both │
   │                                            │
   │ New Responsible (R):                       │
   │ [🔍 Search users...                    ▼]  │
   │                                            │
   │ New Accountable (A):                       │
   │ [🔍 Search users...                    ▼]  │
   │                                            │
   │ Reason for Transfer: *                     │
   │ [                                       ]  │
   │ [                                       ]  │
   │                                            │
   │ Effective Date: [Today         ] [📅]     │
   │                                            │
   │ ☑ Notify all stakeholders                 │
   │ ☑ Include in audit log                    │
   │                                            │
   │ [Cancel]                   [Transfer Now]  │
   └────────────────────────────────────────────┘

3. User selects new assignee(s) and provides reason
4. System validates:
   - New assignee has permission for object type
   - Reason is provided (required)
   - No circular assignments
5. System updates RACI assignments
6. System sends notifications to all stakeholders
7. System logs transfer in audit trail

POSTCONDITIONS:
- RACI assignments updated
- Previous owners notified
- New owners notified
- COO informed (always)
- Audit log entry created
```

---

## 4. Documentation Standards

### 4.1 Document Structure

Every use case document MUST follow this structure:

```markdown
# UC-[ROLE]-[NUMBER]: [Title]

**Version:** X.Y
**Last Updated:** YYYY-MM-DD
**Role:** [Primary Role]
**Status:** Draft | Review | Approved | Implemented

---

## 1. Overview
[2-3 sentence description of what this use case accomplishes]

## 2. Actors
- **Primary:** [Role performing action]
- **Secondary:** [Supporting roles]
- **System:** [Automated actors]

## 3. Preconditions
[Bulleted list of conditions that must be true before starting]

## 4. Trigger
[Event that initiates this use case]

## 5. Main Flow
[Numbered steps with screen references]

## 6. Alternative Flows
[Variations from main flow]

## 7. Exception Flows
[Error handling scenarios]

## 8. Postconditions
[State after successful completion]

## 9. Business Rules
[Constraints and validations]

## 10. Screen Specifications
[Detailed screen layouts]

## 11. Field Specifications
[Field-by-field details]

## 12. Integration Points
[External system interactions]

## 13. RACI Assignments
[Ownership rules for this flow]

## 14. Metrics & Analytics
[KPIs tracked by this flow]

## 15. Test Cases
[Verification scenarios]

## 16. Accessibility
[WCAG compliance notes]

## 17. Mobile Considerations
[Responsive design notes]

## 18. Security
[Data protection, audit requirements]

## 19. Change Log
[Version history]
```

### 4.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Document | `XX-verb-noun.md` | `02-create-job.md` |
| Use Case ID | `UC-[ROLE]-[NNN]` | `UC-REC-001` |
| Screen ID | `SCR-[ROLE]-[NNN]` | `SCR-REC-001` |
| Component ID | `CMP-[NAME]-[VER]` | `CMP-JobCard-v2` |
| Field ID | `FLD-[ENTITY]-[NAME]` | `FLD-JOB-title` |
| API Endpoint | `[entity].[action]` | `job.create` |

### 4.3 Cross-Reference Format

When referencing other documents:
- Internal: `[UC-REC-002: Source Candidates](./03-source-candidates.md)`
- External: `[Permissions Matrix](../00-PERMISSIONS-MATRIX.md)`
- Screen: `See [SCR-REC-001](#screen-job-list)`
- Component: `Uses [CMP-DataTable](#component-datatable)`

---

## 5. Screen Specification Template

### 5.1 Screen Layout Template

```markdown
### Screen: [SCR-XXX-NNN] [Screen Name]

**Route:** `/app/[module]/[page]`
**Access:** [Roles with access]
**Layout:** [Dashboard | List | Detail | Form | Modal]

#### Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ [HEADER BAR]                                                      │
│ Logo    [Navigation Tabs]                    [Search] [User Menu] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ [PAGE TITLE]                              [Primary Action Button] │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ [FILTERS / TOOLBAR]                                         │  │
│ │ [Filter 1 ▼] [Filter 2 ▼] [Date Range] [🔍 Search]         │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ [MAIN CONTENT AREA]                                         │  │
│ │                                                             │  │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│ │ │ KPI 1   │ │ KPI 2   │ │ KPI 3   │ │ KPI 4   │           │  │
│ │ │ $250K   │ │ 42      │ │ 18 days │ │ 92%     │           │  │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │  │
│ │                                                             │  │
│ │ [DATA TABLE / KANBAN / CARDS]                              │  │
│ │ ┌─────────────────────────────────────────────────────┐   │  │
│ │ │ Col 1 ↕│ Col 2 ↕│ Col 3 ↕│ Col 4 ↕│ Actions      │   │  │
│ │ ├────────┼────────┼────────┼────────┼──────────────┤   │  │
│ │ │ Row 1  │        │        │        │ [···]        │   │  │
│ │ │ Row 2  │        │        │        │ [···]        │   │  │
│ │ │ Row 3  │        │        │        │ [···]        │   │  │
│ │ └─────────────────────────────────────────────────────┘   │  │
│ │                                                             │  │
│ │ [Pagination: < 1 2 3 ... 10 >]  [Showing 1-25 of 247]     │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│ [FOOTER]                                       [Version] [Help]  │
└──────────────────────────────────────────────────────────────────┘
```

#### Components Used
- [CMP-Header](#cmp-header)
- [CMP-FilterToolbar](#cmp-filtertoolbar)
- [CMP-KPICard](#cmp-kpicard)
- [CMP-DataTable](#cmp-datatable)
- [CMP-Pagination](#cmp-pagination)

#### State Management
| State | Type | Default | Description |
|-------|------|---------|-------------|
| filters | FilterState | {} | Active filter values |
| sort | SortState | {field: 'createdAt', dir: 'desc'} | Sort configuration |
| selection | string[] | [] | Selected row IDs |
| page | number | 1 | Current page |

#### Actions
| Action | Trigger | Handler | Result |
|--------|---------|---------|--------|
| Create | Click [+ New] | openCreateModal() | Show create form |
| Filter | Change filter | applyFilters() | Reload data |
| Sort | Click column | updateSort() | Reorder rows |
| Select | Click row | toggleSelection() | Update selection |
| Bulk Action | Click [···] | showBulkMenu() | Show options |
```

### 5.2 Modal Template

```markdown
### Modal: [MDL-XXX-NNN] [Modal Name]

**Size:** sm | md | lg | xl | full
**Closable:** true | false (must complete)
**Keyboard:** ESC closes | Tab navigation

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Modal Title]                                          [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Step Indicator: ● Step 1 ○ Step 2 ○ Step 3]               │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Form Section Title]                                    │ │
│ │                                                         │ │
│ │ Field Label *                        [Info Tooltip (i)] │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [Input Field                                       ]│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ Helper text or validation error                         │ │
│ │                                                         │ │
│ │ Field Label 2                                           │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [Dropdown                                        ▼]│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Cancel]                        [◀ Back]  [Next Step ▶]    │
│                                           [Save as Draft]   │
└─────────────────────────────────────────────────────────────┘
```

#### Step Flow
| Step | Title | Fields | Validation | Can Skip |
|------|-------|--------|------------|----------|
| 1 | Basic Info | title, account, priority | Required: title, account | No |
| 2 | Requirements | skills, experience, visa | Required: skills | No |
| 3 | Compensation | rate, terms, duration | Optional all | Yes |
```

---

## 6. Component Library

### 6.1 Core Components

#### CMP-DataTable

Standard data table with sorting, filtering, pagination, and row actions.

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  sorting: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  filters: FilterDef[];
  rowActions: RowAction[];
  bulkActions?: BulkAction[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  expandable?: boolean;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => ReactNode;
}
```

#### CMP-KanbanBoard

Pipeline/stage-based view for submissions, jobs, deals.

```typescript
interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  getItemColumn: (item: T) => string;
  onDragEnd: (itemId: string, newColumn: string) => void;
  renderCard: (item: T) => ReactNode;
  columnActions?: ColumnAction[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  limit?: number;  // WIP limit
  collapsed?: boolean;
}
```

#### CMP-FormWizard

Multi-step form with validation between steps.

```typescript
interface FormWizardProps {
  steps: WizardStep[];
  onComplete: (data: FormData) => Promise<void>;
  onCancel: () => void;
  allowDraft?: boolean;
  onSaveDraft?: (data: Partial<FormData>) => Promise<void>;
}

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  validate: (data: Partial<FormData>) => ValidationResult;
  canSkip?: boolean;
}
```

#### CMP-RACIPanel

Ownership assignment and display panel.

```typescript
interface RACIPanelProps {
  objectType: 'job' | 'candidate' | 'submission' | 'account' | 'deal' | 'lead';
  objectId: string;
  assignments: RACIAssignment;
  onUpdate?: (assignments: RACIAssignment) => void;
  readonly?: boolean;
}

interface RACIAssignment {
  responsible: User;
  accountable: User;
  consulted: User[];
  informed: User[];
}
```

#### CMP-Timeline

Activity timeline for audit trail and history.

```typescript
interface TimelineProps {
  events: TimelineEvent[];
  filters?: TimelineFilter[];
  groupBy?: 'day' | 'week' | 'month';
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

interface TimelineEvent {
  id: string;
  type: 'create' | 'update' | 'status_change' | 'comment' | 'email' | 'call' | 'meeting';
  actor: User;
  timestamp: Date;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}
```

### 6.2 Domain Components

#### CMP-JobCard

Compact job display for lists and grids.

```
┌─────────────────────────────────────────────────────┐
│ [🔥 Hot]  [Priority: High]  [Status: Active]        │
├─────────────────────────────────────────────────────┤
│ Senior Java Developer                               │
│ 📍 New York, NY (Hybrid)  💼 Contract              │
│ 💰 $85-95/hr  📅 Posted 3 days ago                 │
│                                                     │
│ 🏢 Acme Corp                                        │
│ 👤 John Smith (Primary)                             │
│                                                     │
│ Skills: Java, Spring Boot, AWS, Microservices      │
│                                                     │
│ 📊 Pipeline: 12 sourced, 5 submitted, 2 interview  │
├─────────────────────────────────────────────────────┤
│ [View Details]  [Add Candidate]  [···]             │
└─────────────────────────────────────────────────────┘
```

#### CMP-CandidateCard

Compact candidate display.

```
┌─────────────────────────────────────────────────────┐
│ ┌─────┐  Jane Doe                    [⭐ Hotlist]  │
│ │ 👤  │  Senior Full Stack Developer               │
│ │     │  📍 Austin, TX  🛂 H1B (Valid)            │
│ └─────┘  💰 $75-85/hr  📅 Available: Immediate    │
├─────────────────────────────────────────────────────┤
│ Skills: React, Node.js, Python, AWS                │
│ Experience: 8 years                                 │
│ Last Contact: 2 days ago ✓                         │
├─────────────────────────────────────────────────────┤
│ Match Score: [████████░░] 85%                      │
│ [View Profile]  [Submit to Job]  [···]             │
└─────────────────────────────────────────────────────┘
```

#### CMP-SubmissionCard

Submission status card.

```
┌─────────────────────────────────────────────────────┐
│ [📝 Submitted]  Feb 15, 2025                        │
├─────────────────────────────────────────────────────┤
│ Jane Doe → Senior Java Developer @ Acme Corp       │
│                                                     │
│ Rates: Pay $75/hr → Bill $95/hr (Margin: 21%)     │
│ Submitted via: Email                                │
│                                                     │
│ Status Timeline:                                    │
│ ● Submitted (Feb 15) → ○ Client Review → ○ Interview│
├─────────────────────────────────────────────────────┤
│ [Schedule Interview]  [Add Feedback]  [···]        │
└─────────────────────────────────────────────────────┘
```

### 6.3 Shared UI Patterns

#### Status Badges

```typescript
const statusColors = {
  // Jobs
  draft: 'gray',
  active: 'green',
  on_hold: 'yellow',
  filled: 'blue',
  closed: 'gray',
  cancelled: 'red',

  // Submissions
  sourced: 'gray',
  screening: 'yellow',
  submitted: 'blue',
  client_review: 'purple',
  interview: 'orange',
  offer: 'green',
  placed: 'green',
  rejected: 'red',
  withdrawn: 'gray',

  // Candidates
  available: 'green',
  on_bench: 'yellow',
  placed: 'blue',
  inactive: 'gray',

  // Visa
  valid: 'green',
  expiring_soon: 'yellow',  // < 90 days
  expired: 'red',
  pending: 'orange',
};
```

#### Priority Indicators

```typescript
const priorityConfig = {
  critical: { icon: '🔴', color: 'red', label: 'Critical' },
  high: { icon: '🟠', color: 'orange', label: 'High' },
  medium: { icon: '🟡', color: 'yellow', label: 'Medium' },
  low: { icon: '🟢', color: 'green', label: 'Low' },
};
```

---

## 7. Field Specification Standards

### 7.1 Field Definition Template

Every field MUST be documented with:

```markdown
| Field | Type | Required | Validation | Default | Display | Notes |
|-------|------|----------|------------|---------|---------|-------|
| FLD-JOB-title | string | Yes | min:3, max:200 | - | Text input | Job title as shown to candidates |
```

### 7.2 Field Types

| Type | Description | UI Component | Validation |
|------|-------------|--------------|------------|
| `string` | Single-line text | Input | minLength, maxLength, pattern |
| `text` | Multi-line text | Textarea | minLength, maxLength |
| `richtext` | Formatted text | Rich Editor | - |
| `number` | Numeric value | Number Input | min, max, precision |
| `currency` | Money value | Currency Input | min, max, currency code |
| `date` | Date only | Date Picker | min, max, relative |
| `datetime` | Date and time | DateTime Picker | timezone aware |
| `boolean` | Yes/No | Checkbox/Switch | - |
| `enum` | Fixed options | Select/Radio | allowed values |
| `multi-enum` | Multiple options | Multi-select/Checkboxes | allowed values |
| `user` | User reference | User Search | role filter |
| `account` | Account reference | Account Search | - |
| `file` | File upload | File Input | types, maxSize |
| `phone` | Phone number | Phone Input | format, country |
| `email` | Email address | Email Input | format |
| `url` | Web URL | URL Input | format, protocols |
| `address` | Physical address | Address Input | components |

### 7.3 Standard Field Sets

#### Contact Information

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| firstName | string | Yes | min:1, max:50 | - |
| lastName | string | Yes | min:1, max:50 | - |
| email | email | Yes | valid email | Primary contact email |
| phone | phone | No | valid phone | Mobile preferred |
| phoneSecondary | phone | No | valid phone | Work/Home |
| linkedIn | url | No | linkedin.com domain | Profile URL |
| address | address | No | - | Full address with components |

#### Employment/Visa Information (US + Canada Focus)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| workAuthorization | enum | Yes | See visa types | Current work status |
| visaType | enum | Conditional | Based on country | Specific visa category |
| visaExpiryDate | date | Conditional | Future date | When authorization expires |
| visaSponsorshipRequired | boolean | Yes | - | Needs sponsorship? |
| sponsorshipType | enum | Conditional | H1B, GC | What sponsorship needed |
| eadCategory | enum | Conditional | - | EAD code if applicable |
| i94ExpiryDate | date | Conditional | Future date | I-94 expiration |
| passportExpiryDate | date | No | Future date | Passport validity |
| countryOfCitizenship | enum | Yes | ISO country | Legal citizenship |
| countryOfResidence | enum | Yes | ISO country | Where living now |

**US Visa Types:**
- `USC` - US Citizen
- `GC` - Green Card (Permanent Resident)
- `GC_EAD` - Green Card EAD (I-485 pending)
- `H1B` - H1B Visa
- `H1B_TRANSFER` - H1B Transfer in progress
- `H4_EAD` - H4 EAD (spouse of H1B)
- `L1A` - L1A (Manager/Executive)
- `L1B` - L1B (Specialized Knowledge)
- `L2_EAD` - L2 EAD (spouse of L1)
- `OPT` - Optional Practical Training
- `OPT_STEM` - OPT STEM Extension
- `CPT` - Curricular Practical Training
- `TN` - TN Visa (NAFTA)
- `E3` - E3 (Australian)
- `O1` - O1 (Extraordinary Ability)

**Canada Work Authorization:**
- `CITIZEN` - Canadian Citizen
- `PR` - Permanent Resident
- `WORK_PERMIT` - Closed Work Permit
- `OWP` - Open Work Permit
- `PGWP` - Post-Graduation Work Permit
- `LMIA` - LMIA-based Work Permit
- `IEC` - International Experience Canada
- `BRIDGING_OWP` - Bridging Open Work Permit

#### Rate/Compensation

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| payRateMin | currency | Yes | > 0 | Minimum pay rate |
| payRateMax | currency | Yes | >= payRateMin | Maximum pay rate |
| billRateMin | currency | Yes | >= payRateMax | Minimum bill rate |
| billRateMax | currency | Yes | >= billRateMin | Maximum bill rate |
| rateType | enum | Yes | hourly, daily, weekly, monthly, annual | Rate period |
| currency | enum | Yes | USD, CAD, etc. | Currency code |
| employmentType | enum | Yes | W2, C2C, 1099 | Contract type |
| overtimeEligible | boolean | No | - | OT available? |
| overtimeRate | number | Conditional | multiplier | OT rate multiplier |
| perDiem | currency | No | - | Per diem if travel |
| relocationAssistance | boolean | No | - | Relocation help? |

---

## 8. Workflow Documentation Format

### 8.1 Workflow Diagram Standards

Use ASCII diagrams for all workflows:

```
Simple Linear Flow:
[Start] → [Step 1] → [Step 2] → [Step 3] → [End]

Decision Flow:
                    ┌─── Yes ───→ [Path A] ───┐
[Start] → [Check] ─┤                          ├→ [End]
                    └─── No ────→ [Path B] ───┘

Parallel Flow:
              ┌──→ [Task A] ──┐
[Start] → ◆ ─┼──→ [Task B] ──┼─→ ◆ → [End]
              └──→ [Task C] ──┘

State Machine:
┌────────┐    create    ┌─────────┐   submit   ┌───────────┐
│ (init) │ ──────────→  │  Draft  │ ────────→  │ Submitted │
└────────┘              └─────────┘            └───────────┘
                             │                       │
                          cancel                  approve
                             ↓                       ↓
                        ┌──────────┐          ┌───────────┐
                        │ Cancelled│          │  Active   │
                        └──────────┘          └───────────┘
```

### 8.2 State Transition Tables

| Current State | Event | Next State | Conditions | Actions |
|---------------|-------|------------|------------|---------|
| Draft | submit | Submitted | All required fields valid | Notify manager |
| Submitted | approve | Active | Manager approval | Notify recruiters |
| Submitted | reject | Draft | - | Notify creator with reason |
| Active | fill | Filled | All positions filled | Notify stakeholders |
| Active | hold | On Hold | - | Notify active submissions |
| Active | cancel | Cancelled | No active placements | Notify all |

### 8.3 Time-Based Events

| Entity | Event | Trigger | Action |
|--------|-------|---------|--------|
| Job | Stale Warning | Active > 14 days, 0 submissions | Email to R, notify C |
| Job | Escalation | Active > 30 days, < 3 submissions | Escalate to Pod Manager |
| Submission | Follow-up | Submitted > 3 days, no response | Reminder to R |
| Submission | Urgent | Submitted > 7 days, no response | Escalate to C |
| Interview | Reminder | 24 hours before | Email candidate + interviewer |
| Interview | No-show | 30 min after, no feedback | Alert R, prompt for outcome |
| Visa | Warning | Expiry in 90 days | Alert R, C, I |
| Visa | Critical | Expiry in 30 days | Escalate to HR, Legal |

---

## 9. Integration Specification Format

### 9.1 tRPC Router Specification

```typescript
// Example: jobs router specification

/**
 * Router: jobs
 * Base path: /api/trpc/jobs
 *
 * Procedures:
 * - jobs.list: Query - Get paginated job list
 * - jobs.getById: Query - Get single job by ID
 * - jobs.create: Mutation - Create new job
 * - jobs.update: Mutation - Update existing job
 * - jobs.delete: Mutation - Soft delete job
 * - jobs.publish: Mutation - Publish draft job
 * - jobs.close: Mutation - Close job
 * - jobs.assignRCAI: Mutation - Update RACI assignments
 */

interface JobsRouter {
  list: {
    input: {
      page?: number;          // default: 1
      pageSize?: number;      // default: 25, max: 100
      status?: JobStatus[];   // filter by status
      priority?: Priority[];  // filter by priority
      accountId?: string;     // filter by account
      assignedTo?: string;    // filter by R or A
      search?: string;        // full-text search
      sort?: {
        field: 'createdAt' | 'title' | 'priority' | 'status';
        direction: 'asc' | 'desc';
      };
    };
    output: {
      items: Job[];
      total: number;
      page: number;
      pageSize: number;
    };
    access: ['technical_recruiter', 'recruiting_manager', 'ta_specialist',
             'ta_manager', 'hr', 'admin', 'coo', 'cfo', 'ceo'];
  };

  create: {
    input: {
      title: string;          // required, min 3, max 200
      accountId: string;      // required, valid account
      // ... all fields from field spec
    };
    output: {
      id: string;
      createdAt: Date;
    };
    access: ['technical_recruiter', 'recruiting_manager', 'ta_specialist',
             'ta_manager', 'hr', 'coo', 'ceo'];
    validation: z.object({ /* Zod schema */ });
    sideEffects: [
      'Create audit log entry',
      'Assign default RACI',
      'Notify Pod Manager (C)',
      'Notify COO (I)'
    ];
  };
}
```

### 9.2 External Integration Specification

```markdown
### Integration: [INT-XXX] [Integration Name]

**System:** [External system name]
**Type:** Inbound | Outbound | Bidirectional
**Protocol:** REST API | Webhook | OAuth | SFTP

#### Authentication
- Method: OAuth 2.0 / API Key / JWT
- Credentials: Stored in: Vault / Environment / Database

#### Endpoints Used

| Endpoint | Method | Purpose | Frequency |
|----------|--------|---------|-----------|
| `/api/jobs` | POST | Push new jobs | Real-time |
| `/api/candidates` | GET | Pull candidate updates | Every 15 min |

#### Data Mapping

| InTime Field | External Field | Transform |
|--------------|----------------|-----------|
| job.title | position_name | Direct |
| job.billRateMax | max_rate | Convert to USD |

#### Error Handling

| Error Code | Meaning | Recovery |
|------------|---------|----------|
| 401 | Auth failed | Refresh token, retry |
| 429 | Rate limited | Exponential backoff |
| 500 | Server error | Queue for retry |

#### Monitoring
- Health check: Every 5 minutes
- Alert threshold: 3 consecutive failures
- Dashboard: /admin/integrations/[name]
```

---

## 10. Test Case Standards

### 10.1 Test Case Template

```markdown
### TC-[UC-ID]-[NNN]: [Test Case Name]

**Priority:** Critical | High | Medium | Low
**Type:** Functional | Integration | E2E | Regression
**Automated:** Yes | No | Partial

#### Preconditions
- [Setup requirements]

#### Test Data
| Variable | Value | Notes |
|----------|-------|-------|
| user | tech_recruiter_1 | Test user |
| account | acme_corp | Test account |

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Navigate to /jobs | Job list displayed | |
| 2 | Click [+ New Job] | Create modal opens | |
| 3 | Fill required fields | No validation errors | |
| 4 | Click [Create] | Job created, redirected | |
| 5 | Verify job in list | Job appears with Draft status | |

#### Postconditions
- Job exists in database
- Audit log entry created
- RACI assigned

#### Notes
- [Any additional notes]
```

### 10.2 Test Categories

| Category | Description | Coverage Target |
|----------|-------------|-----------------|
| Unit | Individual functions | 80% |
| Integration | API endpoints | 90% |
| E2E | Full user flows | Critical paths |
| Regression | After changes | All changed areas |
| Performance | Load/stress | Key operations |
| Security | Auth/permissions | All endpoints |
| Accessibility | WCAG 2.1 AA | All screens |

---

## 11. Prototype & Wireframe Standards

### 11.1 Fidelity Levels

| Level | Purpose | Tools | Deliverables |
|-------|---------|-------|--------------|
| **Lo-Fi** | Quick concept validation | ASCII art, Balsamiq | Rough layouts |
| **Mid-Fi** | Flow and interaction | Figma wireframes | Clickable prototype |
| **Hi-Fi** | Visual design review | Figma with design system | Pixel-perfect mockups |

### 11.2 ASCII Wireframe Standards

Use ASCII art for documentation (portable, version-controlled):

```
Characters:
┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼  Box drawing
[ ]  Clickable buttons
(●) (○)  Radio buttons
[✓] [ ]  Checkboxes
▼  Dropdown indicator
🔍 📅 👤  Emoji icons (sparingly)
→ ← ↑ ↓  Arrows
● ○  Status indicators
```

### 11.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640-1024px | Two columns, collapsible nav |
| Desktop | 1024-1440px | Full layout |
| Wide | > 1440px | Max-width container, centered |

---

## 12. International Operations

### 12.1 Geographic Scope

**Primary Markets (US + Canada):**

| Country | Currency | Timezone Range | Language | Legal Entity |
|---------|----------|----------------|----------|--------------|
| USA | USD | EST to PST (UTC-5 to UTC-8) | English | InTime Inc. |
| Canada | CAD | EST to PST (UTC-5 to UTC-8) | English, French | InTime Canada Ltd. |

### 12.2 US Visa Types (Complete Reference)

| Visa Type | Category | Work Auth | Duration | Sponsorship | Key Dates to Track |
|-----------|----------|-----------|----------|-------------|-------------------|
| **USC** | Citizen | Unlimited | Permanent | N/A | None |
| **GC** | Immigrant | Unlimited | Permanent | Past/None | Card expiry (10yr) |
| **GC-EAD** | Pending | Full | Until decision | Active | EAD expiry, I-485 status |
| **H1B** | Non-immigrant | Employer-specific | 3+3 years | Required | I-94 expiry, visa stamp |
| **H1B Transfer** | Non-immigrant | New employer | Existing time | Transfer | Receipt date, approval |
| **H4-EAD** | Dependent | Full | Per H4 status | N/A | EAD expiry, H1B status |
| **L1A** | Non-immigrant | Employer-specific | 7 years max | Company | I-94 expiry |
| **L1B** | Non-immigrant | Employer-specific | 5 years max | Company | I-94 expiry |
| **L2-EAD** | Dependent | Full | Per L1 status | N/A | EAD expiry, L1 status |
| **OPT** | Student | Field-specific | 12 months | N/A | EAD expiry, 90-day limit |
| **OPT-STEM** | Student | Field-specific | +24 months | E-Verify | EAD expiry, employer cap |
| **CPT** | Student | School-approved | Per semester | N/A | Authorization dates |
| **TN** | NAFTA | Employer-specific | 3 years | N/A | I-94 expiry |
| **E3** | Australia | Employer-specific | 2 years | N/A | I-94 expiry, visa stamp |
| **O1** | Extraordinary | Employer-specific | 3 years | Required | I-94 expiry |

### 12.3 Canada Work Authorization Types

| Type | Category | Work Auth | Duration | Key Dates |
|------|----------|-----------|----------|-----------|
| **Citizen** | Citizen | Unlimited | Permanent | None |
| **PR** | Immigrant | Unlimited | Permanent | PR card expiry (5yr) |
| **Closed WP** | Work Permit | Employer-specific | Per LMIA | Permit expiry |
| **OWP** | Work Permit | Any employer | Varies | Permit expiry |
| **PGWP** | Post-grad | Any employer | 1-3 years | Permit expiry |
| **LMIA-based** | Work Permit | Employer-specific | Per LMIA | Permit, LMIA expiry |
| **IEC** | Youth | Any employer | 1-2 years | Permit expiry |
| **Bridging OWP** | Transitional | Any employer | Until PR | PR application status |

### 12.4 Immigration Tracking Workflows

```
Immigration Alert Levels:
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Valid (> 180 days) - No action needed                   │
│ 🟡 Monitor (90-180 days) - Start renewal planning          │
│ 🟠 Warning (30-90 days) - Initiate renewal process         │
│ 🔴 Critical (< 30 days) - Escalate to Legal + HR           │
│ ⚫ Expired - Cannot work, immediate escalation             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Vendor & Commission Framework

### 13.1 Vendor Relationship Types

| Type | Description | Typical Split | Use Case |
|------|-------------|---------------|----------|
| **Direct Client** | InTime → Client | 100% InTime | Own clients |
| **Prime Vendor** | InTime → Prime → Client | 70-85% InTime | Most staffing |
| **Subcontractor** | Third Party → InTime → Prime | 50-70% InTime | Partner bench |
| **Co-Marketing** | Joint marketing | 50/50 split | Partnership |

### 13.2 Commission Structure (Custom Negotiated)

Each vendor relationship has custom terms. Document these fields:

```typescript
interface VendorAgreement {
  vendorId: string;
  agreementType: 'direct' | 'prime' | 'subcontractor' | 'comarketing';

  // Rate structure
  markupType: 'percentage' | 'fixed' | 'tiered';
  markupPercentage?: number;        // e.g., 15%
  fixedMarkup?: Currency;           // e.g., $10/hr
  tieredMarkup?: TierStructure[];   // Volume-based

  // Payment terms
  paymentTerms: number;             // Net days (30, 45, 60)
  invoiceFrequency: 'weekly' | 'biweekly' | 'monthly';

  // Commission to InTime sales
  salesCommission: {
    type: 'percentage' | 'fixed' | 'tiered';
    rate: number;
    duration: 'placement' | '3_months' | '6_months' | 'contract_duration';
  };

  // Volume commitments
  volumeCommitment?: {
    minimum: number;      // Minimum placements/quarter
    discount: number;     // Additional discount if met
  };

  // Exclusivity
  exclusivity?: {
    type: 'none' | 'first_right' | 'exclusive';
    duration: number;     // Days
    scope: 'skill' | 'geography' | 'client';
  };

  // Legal
  effectiveDate: Date;
  expirationDate: Date;
  autoRenew: boolean;
  terminationNotice: number;  // Days
  nonCompete?: {
    duration: number;
    scope: string;
  };
}
```

### 13.3 Vendor Onboarding Workflow

```
Vendor Onboarding Flow:
[Lead] → [Qualify] → [Negotiate] → [Contract] → [Setup] → [Active]
   │         │          │           │          │
   │         │          │           │          └── System access, training
   │         │          │           └── Legal review, signatures
   │         │          └── Terms, rates, commission
   │         └── Verify legitimacy, check references
   └── Initial contact, interest

Required Documents:
- W-9 / W-8BEN (tax)
- Certificate of Insurance
- Vendor Agreement (signed)
- NDA
- Bank details (ACH)
- Contact information
- Preferred skills/verticals
```

### 13.4 Rate Negotiation Framework

```
Rate Calculation Stack:

Client Bill Rate: $100/hr
       │
       ├── Vendor Markup (10%): $10/hr
       │   └── Vendor receives: $90/hr
       │
       ├── InTime Markup (20%): $18/hr
       │   └── InTime receives: $18/hr
       │
       └── Consultant Pay: $72/hr
           └── Consultant receives: $72/hr

Negotiation Variables:
- Skill scarcity (rare skills → higher rates)
- Duration (longer → lower markup acceptable)
- Volume (more positions → volume discount)
- Payment terms (faster pay → lower rates)
- Exclusivity (exclusive → premium rates)
- Market conditions (hot market → tighter margins)
```

---

## 14. Activities & Events Framework

### 14.1 Activity-Centric Architecture

InTime OS operates on a fundamental principle:

> **"No work is done unless an activity is created."**

This activity-centric model ensures:
- **Complete Audit Trail**: Every action is tracked through activities
- **Accountability**: Activities are assigned to specific users with RACI roles
- **Measurability**: All work can be quantified, measured, and optimized
- **SLA Compliance**: Response times and throughput measured via activity timestamps
- **Productivity Analytics**: Individual and team performance tracked through activity metrics

### 14.2 Core Concepts

#### Activities vs. Events

| Aspect | Activity | Event |
|--------|----------|-------|
| **Nature** | Manual work performed by users | System-generated records of changes |
| **Creation** | User-initiated or auto-created | System-triggered |
| **Purpose** | Track work to be done | Record what happened |
| **Status** | open → in_progress → completed | N/A (immutable) |
| **Assignment** | Assigned to specific user(s) | Captures actor/subject |
| **Examples** | Call, email, meeting, task, follow-up | Job created, status changed, candidate submitted |

**Relationship:**
```
Event Occurs → May Trigger Auto-Activity → User Completes Activity → Generates Completion Event

Example:
[Event: Job Created] → [Activity: Follow up with client] → [Event: Activity Completed]
```

### 14.3 Activity Types

| Type | Description | Duration | Outcome Required |
|------|-------------|----------|------------------|
| **call** | Phone conversation with candidate, client, or contact | Minutes | Call notes, next steps |
| **email** | Email communication sent or received | Instant | Email thread reference |
| **meeting** | Scheduled meeting (in-person or virtual) | Minutes-Hours | Meeting notes, action items |
| **task** | Action item or to-do (non-communication) | Hours-Days | Task completion notes |
| **note** | Information capture without interaction | Instant | Note content |
| **follow_up** | Scheduled reminder to reach out | Future | Actual contact activity |
| **interview** | Interview coordination and execution | Hours | Interview feedback |
| **submission** | Candidate submission to job | Hours | Client response |
| **negotiation** | Rate or terms negotiation | Days | Agreed terms |
| **onboarding** | New hire/consultant onboarding | Days-Weeks | Onboarding checklist |

### 14.4 Activity Status Flow

```
┌─────────┐    start work    ┌──────────────┐    complete    ┌───────────┐
│  open   │ ──────────────→  │ in_progress  │ ──────────────→│ completed │
└─────────┘                  └──────────────┘                └───────────┘
     │                              │
     │ cancel/skip                  │ cancel
     ↓                              ↓
┌──────────┐                   ┌──────────┐
│ cancelled│                   │ cancelled│
└──────────┘                   └──────────┘
```

**Status Rules:**
- **open**: Activity created, waiting to be started
- **in_progress**: User actively working on activity (started timestamp captured)
- **completed**: Activity finished with outcome/notes (completed timestamp captured)
- **cancelled**: Activity no longer needed (reason required)

### 14.5 Auto-Activity Patterns

Activities can be automatically created by system events:

| Event | Auto-Activity | Assigned To | Due |
|-------|---------------|-------------|-----|
| Job Created | "Review and post job" | R (Responsible) | +1 business day |
| Candidate Sourced | "Initial screening call" | Sourcer | +2 business days |
| Submission Created | "Follow up with client" | R (Responsible) | +3 business days |
| Interview Scheduled | "Send prep materials" | R (Responsible) | -1 day before |
| Interview No-Show | "Contact candidate" | R (Responsible) | Immediate |
| Offer Extended | "Negotiate and close" | R (Responsible) | +2 business days |
| Placement Day 1 | "Check-in call" | R (Responsible) | End of day 1 |
| Placement Day 30 | "30-day review" | R (Responsible) | Day 30 |
| Visa Expiring Soon | "Initiate renewal" | HR + R | -90 days |

### 14.6 Event Categories

#### 14.6.1 Entity Events
Record creation, updates, and deletions of business objects:
- `job.created`, `job.updated`, `job.status_changed`
- `candidate.created`, `candidate.updated`, `candidate.assigned`
- `submission.created`, `submission.status_changed`
- `account.created`, `account.assigned`
- `deal.created`, `deal.stage_changed`, `deal.won`, `deal.lost`

#### 14.6.2 Workflow Events
Track progress through business processes:
- `job.published`, `job.filled`, `job.closed`
- `submission.client_review`, `submission.interview_scheduled`, `submission.offered`
- `interview.scheduled`, `interview.completed`, `interview.cancelled`
- `placement.started`, `placement.ended`
- `lead.qualified`, `lead.converted`

#### 14.6.3 System Events
Administrative and system-level changes:
- `user.login`, `user.logout`
- `raci.assigned`, `raci.transferred`
- `permission.granted`, `permission.revoked`
- `integration.sync_started`, `integration.sync_completed`
- `report.generated`, `export.completed`

### 14.7 Integration with RACI Model

Activities inherit ownership from their related entities:

```typescript
interface ActivityAssignment {
  // Primary owner (who does the work)
  assignedTo: User;  // Usually R (Responsible) from parent object

  // Context from parent object RACI
  responsible: User;  // R from job/candidate/etc.
  accountable: User;  // A from job/candidate/etc.
  consulted: User[];  // C from job/candidate/etc.
  informed: User[];   // I from job/candidate/etc.

  // Activity-specific
  createdBy: User;    // Who created the activity
  completedBy?: User; // Who marked it complete (may differ from assignedTo)
}
```

**Example:**
```
Job ID: JOB-123
  R: john@intime.com (Technical Recruiter)
  A: sarah@intime.com (Pod Manager)
  C: mike@intime.com (Secondary Recruiter)
  I: coo@intime.com (COO)

Event: Job Created
  → Auto-Activity: "Review and post job"
     assignedTo: john@intime.com (inherited from R)
     responsible: john@intime.com
     accountable: sarah@intime.com
     consulted: [mike@intime.com]
     informed: [coo@intime.com]
```

### 14.8 Activity SLA Tracking

Each activity type has default SLAs (configurable per organization):

| Activity Type | Default SLA | Escalation Rule |
|---------------|-------------|-----------------|
| call | 1 business day | Notify manager if overdue |
| email | 4 hours | Escalate after 8 hours |
| follow_up | Per due date | Notify 1 day before |
| interview | Per scheduled time | Alert 24h before, escalate if no-show |
| submission | 3 business days | Escalate to manager if no response |
| task | Per priority (1-7 days) | Daily reminders if overdue |

**SLA Metrics Tracked:**
- Response time: `startedAt - createdAt`
- Completion time: `completedAt - startedAt`
- Total time: `completedAt - createdAt`
- Overdue duration: `now() - dueAt` (if applicable)

### 14.9 Activity-Based Reporting

Activities power productivity and performance reporting:

#### Individual Metrics
- Activities completed per day/week/month
- Average time per activity type
- SLA compliance rate (% completed on time)
- Overdue activities count
- Activity type distribution

#### Team Metrics
- Team activity volume by type
- Team SLA compliance
- Activity assignment distribution
- Bottleneck identification (long in-progress times)
- Workload balance across team members

#### Business Metrics
- Activities per placement (efficiency)
- Time from sourcing to submission (via activity timestamps)
- Client response time (submission → client feedback activity)
- Candidate engagement rate (call/email activities per candidate)

### 14.10 Activity Data Model

```typescript
interface Activity {
  id: string;
  type: ActivityType;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';

  // Ownership
  assignedTo: string;  // User ID
  createdBy: string;   // User ID
  completedBy?: string; // User ID

  // Context
  relatedTo: {
    entityType: 'job' | 'candidate' | 'submission' | 'account' | 'lead' | 'deal';
    entityId: string;
  };

  // Scheduling
  dueAt?: Date;
  scheduledFor?: Date;  // For meetings, calls
  duration?: number;    // Minutes

  // Content
  subject: string;
  description?: string;
  outcome?: string;     // Required on completion
  notes?: string;

  // Timestamps
  createdAt: Date;
  startedAt?: Date;     // When marked in_progress
  completedAt?: Date;   // When marked completed
  cancelledAt?: Date;

  // SLA tracking
  slaDeadline?: Date;
  slaCompliant?: boolean;

  // Metadata
  priority?: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
  attachments?: FileReference[];
}
```

### 14.11 UI Components

#### Activity Timeline
Every entity detail page displays an activity timeline:
```
┌─────────────────────────────────────────────────────────┐
│ ACTIVITY TIMELINE                           [+ New]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ● Today                                                 │
│   ┌───────────────────────────────────────────────┐    │
│   │ 📞 Call - Follow up on submission              │    │
│   │ 2:30 PM • John Smith • 15 min                  │    │
│   │ "Discussed timeline, candidate interested"     │    │
│   │ [View Details]                                 │    │
│   └───────────────────────────────────────────────┘    │
│                                                         │
│   ┌───────────────────────────────────────────────┐    │
│   │ ✉ Email - Sent job description                 │    │
│   │ 10:15 AM • John Smith                          │    │
│   │ To: candidate@example.com                      │    │
│   │ [View Thread]                                  │    │
│   └───────────────────────────────────────────────┘    │
│                                                         │
│ ○ Yesterday                                             │
│   ┌───────────────────────────────────────────────┐    │
│   │ 📝 Task - Update resume in ATS                  │    │
│   │ 4:45 PM • Sarah Jones • Completed              │    │
│   └───────────────────────────────────────────────┘    │
│                                                         │
│ [Load More Activities...]                              │
└─────────────────────────────────────────────────────────┘
```

#### My Activities Dashboard
Home screen widget showing user's pending activities:
```
┌─────────────────────────────────────────────────────────┐
│ MY ACTIVITIES                              [View All]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Overdue (2)                                            │
│ 🔴 Call - Follow up with client (Due: 2 days ago)     │
│ 🔴 Email - Send updated resume (Due: Yesterday)       │
│                                                         │
│ Due Today (5)                                          │
│ 🟠 Meeting - Candidate interview prep (2:00 PM)       │
│ 🟠 Task - Review submissions (End of day)             │
│ ...                                                    │
│                                                         │
│ Upcoming (12)                                          │
│ 📅 Follow-up - Client feedback check (Tomorrow)       │
│ ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### 14.12 Detailed Documentation References

For comprehensive specifications, see:

- **[01-ACTIVITIES-EVENTS-FRAMEWORK.md](./01-ACTIVITIES-EVENTS-FRAMEWORK.md)**
  - Complete activity type definitions
  - Event type catalog
  - State machines and transitions
  - Auto-activity rules engine

- **[02-ACTIVITY-PATTERN-LIBRARY.md](./02-ACTIVITY-PATTERN-LIBRARY.md)**
  - Common activity patterns by role
  - Activity templates
  - Best practices for activity creation
  - Activity sequence playbooks

- **[03-EVENT-TYPE-CATALOG.md](./03-EVENT-TYPE-CATALOG.md)**
  - Full event taxonomy
  - Event payload specifications
  - Event handlers and listeners
  - Integration event patterns

---

## Appendix A: Quick Reference

### A.1 Role Permissions Summary

| Role | Create | Read | Update | Delete | Approve | Scope |
|------|--------|------|--------|--------|---------|-------|
| Technical Recruiter | Yes | Own+RACI | Own+RACI(R,A) | No | No | Own |
| Bench Sales | Yes | Own+RACI | Own+RACI(R,A) | No | No | Own |
| TA Specialist | Yes | Own+RACI | Own+RACI(R,A) | No | No | Own |
| Pod Manager | Yes | Team+RACI | Team+RACI | Yes | Yes | Team |
| Regional Director | Yes | Region | Region | Yes | Yes | Region |
| HR Manager | Yes | Org | Org | No | Yes | Org |
| CFO | No | Org | Finance | No | Finance | Org |
| COO | Yes | Org | Org | No | Ops | Org |
| CEO | Yes | Org | Org | Yes | All | Org |
| Admin | Yes | Org | Org | Yes | System | Org |

### A.2 Status Colors

| Domain | Status | Color | Hex |
|--------|--------|-------|-----|
| Job | Draft | Gray | #6B7280 |
| Job | Active | Green | #10B981 |
| Job | On Hold | Yellow | #F59E0B |
| Job | Filled | Blue | #3B82F6 |
| Job | Closed | Gray | #6B7280 |
| Submission | Sourced | Gray | #6B7280 |
| Submission | Submitted | Blue | #3B82F6 |
| Submission | Interview | Orange | #F97316 |
| Submission | Offer | Purple | #8B5CF6 |
| Submission | Placed | Green | #10B981 |
| Submission | Rejected | Red | #EF4444 |

### A.3 Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl/Cmd + K` | Global search | Anywhere |
| `Ctrl/Cmd + N` | New item | List pages |
| `Ctrl/Cmd + S` | Save | Forms |
| `Ctrl/Cmd + Enter` | Submit form | Modals |
| `Escape` | Close modal/cancel | Modals |
| `J/K` | Navigate list | Tables |
| `Enter` | Open selected | Tables |
| `?` | Show shortcuts | Anywhere |

---

**End of Master Framework Document**

*This document serves as the canonical reference for all USER-ROLE documentation. All subsequent role documents MUST follow this framework.*
