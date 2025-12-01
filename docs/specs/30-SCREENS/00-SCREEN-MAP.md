# InTime OS - Screen Map & Registry

> **Status:** Active / In Progress
> **Purpose:** Registry of all UI screens derived from User Role specifications.
> **Architecture:** Metadata-Driven UI (Guidewire-style PCFs)

---

## 1. Core Workspace (Shell)

| Screen ID | Title | Pattern | Role Access | Status |
|-----------|-------|---------|-------------|--------|
| `shell.main` | Main Layout | AppShell | All | ✅ |
| `shell.nav` | Navigation Sidebar | Sidebar | All | ✅ |
| `shell.command` | Command Bar | Modal/Palette | All | ⏳ |
| `shell.notifications` | Notification Center | Drawer | All | ⏳ |
| `shell.user_menu` | User Profile Menu | Dropdown | All | ⏳ |

---

## 2. Recruiting Module (ATS)

**Source Role:** [01-recruiter](../20-USER-ROLES/01-recruiter/00-OVERVIEW.md)

### Jobs
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `job.list` | All Jobs | ListView | Filterable list of job requisitions |
| `job.detail` | Job Detail | DetailView | Main job view with tabs (Details, Pipeline, Team) |
| `job.create` | Create Job | Wizard | 3-step wizard (Basics, Requirements, Compensation) |
| `job.edit` | Edit Job | Form | Edit job metadata |
| `job.pipeline` | Job Pipeline | Kanban/List | Candidate pipeline for specific job |

### Candidates
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `candidate.list` | All Candidates | ListView | Searchable candidate database |
| `candidate.detail` | Candidate Detail | DetailView | Profile, Resume, Activity Timeline |
| `candidate.create` | Add Candidate | Form | Create/Import candidate profile |
| `candidate.quick_submit` | Submit to Job | Modal | Quick submission action |

### Submissions
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `submission.list` | Submissions | ListView | Tracking active submissions |
| `submission.detail` | Submission Detail | DetailView | Submission status, client feedback |
| `submission.review` | Resume Review | SplitView | Resume + Feedback form |

---

## 3. Bench Sales Module (RMG)

**Source Role:** [02-bench-sales](../20-USER-ROLES/02-bench-sales/00-OVERVIEW.md)

### Bench Management
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `bench.dashboard` | Bench Dashboard | Dashboard | Metrics, Hotlist status, Consultant cards |
| `bench.list` | My Consultants | ListView | Assigned consultants |
| `bench.detail` | Consultant Detail | DetailView | Deep dive: Skills, Marketing Log, Resume |
| `bench.hotlist` | Hotlist Manager | ListDetail | Manage marketing hotlists |

### Marketing
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `marketing.campaign` | Create Campaign | Wizard | Email blast to vendors |
| `marketing.vendors` | Vendor List | ListView | Vendor contact database |

---

## 4. Operations Module

**Source Role:** [04-manager](../20-USER-ROLES/04-manager/00-OVERVIEW.md)

### Management
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `pod.dashboard` | Pod Dashboard | Dashboard | Pod metrics, IC performance |
| `pod.escalations` | Escalation Queue | ListView | Urgent issues requiring manager attention |
| `pod.approvals` | Approval Queue | ListView | Placements/Offers awaiting approval |
| `pod.settings` | Pod Settings | DetailView | Member assignment, Targets |

---

## 5. HR & Onboarding

**Source Role:** [05-hr](../20-USER-ROLES/05-hr/00-OVERVIEW.md)

### Employee Management
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `hr.dashboard` | HR Dashboard | Dashboard | Onboarding status, Compliance alerts |
| `hr.employee.list` | Employee Directory | ListView | All internal employees |
| `hr.employee.detail` | Employee Profile | DetailView | HR view: Comp, Benefits, Docs |
| `hr.onboarding` | Onboarding Tracker | Kanban | New hire progress |

---

## 6. Finance

**Source Role:** [07-cfo](../20-USER-ROLES/07-cfo/00-OVERVIEW.md)

### Financials
| Screen ID | Title | Pattern | Description |
|-----------|-------|---------|-------------|
| `finance.dashboard` | Finance Overview | Dashboard | Cash flow, AR/AP, Margin |
| `finance.invoices` | Invoice Manager | ListView | Client billing status |
| `finance.commissions` | Commission Calc | ListView | Monthly commission runs |

---

## Screen Patterns (Guidewire-Style)

### 1. ListView
Standard table with:
- Pagination
- Sorting/Filtering
- Search Bar
- Row Actions
- Bulk Actions (Toolbar)

### 2. DetailView
Read-only view with:
- Info Cards (InputSets in read-only mode)
- Action Toolbar (Edit, Delete, Workflow actions)
- Tabs (Sub-views)
- Sidebar (Context/Timeline)

### 3. Wizard
Multi-step process:
- Stepper Progress
- Next/Back Navigation
- Validation per step
- Save Draft capability

### 4. Dashboard
Widget-based layout:
- KPI Cards
- Charts/Graphs
- Activity Feeds
- Quick Action Lists

### 5. Modal / Worksheet
Temporary overlay:
- Quick Create
- Lookup/Search
- Confirmation
- Single-task workflows

---

## Implementation Status

| Module | Total Screens | Defined | Implemented |
|--------|---------------|---------|-------------|
| Shell | 5 | 5 | 1 |
| Recruiting | 10 | 10 | 0 |
| Bench Sales | 6 | 6 | 0 |
| Operations | 4 | 4 | 0 |
| HR | 4 | 4 | 0 |
| Finance | 3 | 3 | 0 |
| **TOTAL** | **32** | **32** | **1** |

*Last Updated: 2025-12-01*

