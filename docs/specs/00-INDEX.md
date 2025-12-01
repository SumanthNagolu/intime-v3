# InTime OS - Complete Project Specification

> **Rule: No implementation until docs/specs is complete.**

This documentation captures every aspect of the InTime OS unified workspace - every screen, every field, every user flow in minute detail. This is the single source of truth for development and training.

---

## Documentation Progress

| Category | Total | Complete | Progress |
|----------|-------|----------|----------|
| Foundation | 3 | 2 | 67% |
| Database | 15 | 15 | **100%** |
| User Roles | 12 | 12 | **100%** |
| Screens | 7 | 1 | 14% |
| Forms | 4 | 0 | 0% |
| Components | 1 | 0 | 0% |
| Workflows | 4 | 0 | 0% |
| Navigation | 2 | 0 | 0% |
| Action Logging | 2 | 0 | 0% |

**Total Documents: ~115 complete**

---

## Documentation Map

### Foundation

| Document | Description | Status |
|----------|-------------|--------|
| [00-INDEX.md](./00-INDEX.md) | This file - master navigation | ✅ Complete |
| [01-GLOSSARY.md](./01-GLOSSARY.md) | All terms and definitions | ✅ Complete |
| [02-SYSTEM-OVERVIEW.md](./02-SYSTEM-OVERVIEW.md) | High-level architecture | ⏳ Pending |

### Database Specifications

| Document | Description | Status |
|----------|-------------|--------|
| [10-DATABASE/00-ERD.md](./10-DATABASE/00-ERD.md) | Entity relationship diagram | ✅ Complete |
| [10-DATABASE/01-jobs.md](./10-DATABASE/01-jobs.md) | Jobs table specification | ✅ Complete |
| [10-DATABASE/02-candidates.md](./10-DATABASE/02-candidates.md) | Candidates table specification | ✅ Complete |
| [10-DATABASE/03-accounts.md](./10-DATABASE/03-accounts.md) | Accounts table specification | ✅ Complete |
| [10-DATABASE/04-contacts.md](./10-DATABASE/04-contacts.md) | Contacts table specification | ✅ Complete |
| [10-DATABASE/05-leads.md](./10-DATABASE/05-leads.md) | Leads table specification | ✅ Complete |
| [10-DATABASE/06-deals.md](./10-DATABASE/06-deals.md) | Deals table specification | ✅ Complete |
| [10-DATABASE/07-submissions.md](./10-DATABASE/07-submissions.md) | Submissions table specification | ✅ Complete |
| [10-DATABASE/08-job-orders.md](./10-DATABASE/08-job-orders.md) | Job Orders table specification | ✅ Complete |
| [10-DATABASE/09-placements.md](./10-DATABASE/09-placements.md) | Placements table specification | ✅ Complete |
| [10-DATABASE/10-campaigns.md](./10-DATABASE/10-campaigns.md) | Campaigns table specification | ✅ Complete |
| [10-DATABASE/11-activities.md](./10-DATABASE/11-activities.md) | Activities table specification | ✅ Complete |
| [10-DATABASE/12-object-owners.md](./10-DATABASE/12-object-owners.md) | RCAI ownership table | ✅ Complete |
| [10-DATABASE/13-user-profiles.md](./10-DATABASE/13-user-profiles.md) | User profiles table | ✅ Complete |
| [10-DATABASE/14-pods.md](./10-DATABASE/14-pods.md) | Pods table specification | ✅ Complete |
| [10-DATABASE/99-FIELD-REFERENCE.md](./10-DATABASE/99-FIELD-REFERENCE.md) | Alphabetical field dictionary | ⏳ Pending |

### User Roles & Use Cases

| Document | Description | Status |
|----------|-------------|--------|
| [00-PERMISSIONS-MATRIX.md](./20-USER-ROLES/00-PERMISSIONS-MATRIX.md) | Consolidated permissions | ✅ Complete |

---

#### 01-recruiter/ - Technical Recruiter

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/01-recruiter/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/01-recruiter/01-daily-workflow.md) | Typical day |
| [02-create-job.md](./20-USER-ROLES/01-recruiter/02-create-job.md) | Create job |
| [03-source-candidates.md](./20-USER-ROLES/01-recruiter/03-source-candidates.md) | Source candidates |
| [04-submit-candidate.md](./20-USER-ROLES/01-recruiter/04-submit-candidate.md) | Submit candidate |
| [05-schedule-interview.md](./20-USER-ROLES/01-recruiter/05-schedule-interview.md) | Schedule interview |
| [06-make-placement.md](./20-USER-ROLES/01-recruiter/06-make-placement.md) | Make placement |
| [07-log-activity.md](./20-USER-ROLES/01-recruiter/07-log-activity.md) | Log activity |
| [08-manage-pipeline.md](./20-USER-ROLES/01-recruiter/08-manage-pipeline.md) | Manage pipeline |
| [09-search-candidates.md](./20-USER-ROLES/01-recruiter/09-search-candidates.md) | Search candidates |
| [10-update-job-status.md](./20-USER-ROLES/01-recruiter/10-update-job-status.md) | Update job status |
| [11-create-lead.md](./20-USER-ROLES/01-recruiter/11-create-lead.md) | Create lead |

---

#### 02-bench-sales/ - Bench Sales Recruiter

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/02-bench-sales/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/02-bench-sales/01-daily-workflow.md) | Typical day |
| [02-manage-bench.md](./20-USER-ROLES/02-bench-sales/02-manage-bench.md) | Manage bench |
| [03-market-consultant.md](./20-USER-ROLES/02-bench-sales/03-market-consultant.md) | Market consultant |
| [04-find-requirements.md](./20-USER-ROLES/02-bench-sales/04-find-requirements.md) | Find requirements |
| [05-submit-bench-consultant.md](./20-USER-ROLES/02-bench-sales/05-submit-bench-consultant.md) | Submit consultant |
| [06-create-hotlist.md](./20-USER-ROLES/02-bench-sales/06-create-hotlist.md) | Create hotlist |
| [07-update-consultant.md](./20-USER-ROLES/02-bench-sales/07-update-consultant.md) | Update consultant |
| [08-track-immigration.md](./20-USER-ROLES/02-bench-sales/08-track-immigration.md) | Track immigration |
| [09-schedule-interview.md](./20-USER-ROLES/02-bench-sales/09-schedule-interview.md) | Schedule interview |
| [10-make-placement.md](./20-USER-ROLES/02-bench-sales/10-make-placement.md) | Make placement |

---

#### 03-ta/ - Talent Acquisition

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/03-ta/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/03-ta/01-daily-workflow.md) | Typical day |
| [02-run-campaign.md](./20-USER-ROLES/03-ta/02-run-campaign.md) | Run campaign |
| [03-internal-hiring.md](./20-USER-ROLES/03-ta/03-internal-hiring.md) | Internal hiring |
| [04-onboard-employee.md](./20-USER-ROLES/03-ta/04-onboard-employee.md) | Onboard employee |

---

#### 04-manager/ - Pod Manager

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/04-manager/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/04-manager/01-daily-workflow.md) | Typical day |
| [02-pod-dashboard.md](./20-USER-ROLES/04-manager/02-pod-dashboard.md) | Pod dashboard |
| [03-handle-escalation.md](./20-USER-ROLES/04-manager/03-handle-escalation.md) | Handle escalation |
| [04-approve-submission.md](./20-USER-ROLES/04-manager/04-approve-submission.md) | Approve submission |

---

#### 05-hr/ - HR Manager

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/05-hr/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/05-hr/01-daily-workflow.md) | Typical day |
| [02-employee-onboarding.md](./20-USER-ROLES/05-hr/02-employee-onboarding.md) | Onboarding |
| [03-payroll-management.md](./20-USER-ROLES/05-hr/03-payroll-management.md) | Payroll |
| [04-performance-reviews.md](./20-USER-ROLES/05-hr/04-performance-reviews.md) | Reviews |
| [05-time-and-attendance.md](./20-USER-ROLES/05-hr/05-time-and-attendance.md) | Time/PTO |
| [06-international-employment.md](./20-USER-ROLES/05-hr/06-international-employment.md) | International employment |
| [07-contractor-classification.md](./20-USER-ROLES/05-hr/07-contractor-classification.md) | Contractor classification |

---

#### 06-regional/ - Regional Director

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/06-regional/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/06-regional/01-daily-workflow.md) | Typical day |
| [02-regional-dashboard.md](./20-USER-ROLES/06-regional/02-regional-dashboard.md) | Regional dashboard |
| [03-manage-pods.md](./20-USER-ROLES/06-regional/03-manage-pods.md) | Manage pods |
| [04-territory-planning.md](./20-USER-ROLES/06-regional/04-territory-planning.md) | Territory planning |
| [05-regional-reporting.md](./20-USER-ROLES/06-regional/05-regional-reporting.md) | Regional reporting |

---

#### 07-cfo/ - Finance / CFO

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/07-cfo/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/07-cfo/01-daily-workflow.md) | Typical day |
| [02-process-invoices.md](./20-USER-ROLES/07-cfo/02-process-invoices.md) | Process invoices |
| [03-manage-payroll.md](./20-USER-ROLES/07-cfo/03-manage-payroll.md) | Manage payroll |
| [04-track-ar.md](./20-USER-ROLES/07-cfo/04-track-ar.md) | Track AR |
| [05-financial-reporting.md](./20-USER-ROLES/07-cfo/05-financial-reporting.md) | Financial reports |

---

#### 08-coo/ - Chief Operating Officer

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/08-coo/00-OVERVIEW.md) | Role summary |
| [01-daily-workflow.md](./20-USER-ROLES/08-coo/01-daily-workflow.md) | Typical day |
| [10-operational-dashboard.md](./20-USER-ROLES/08-coo/10-operational-dashboard.md) | Operational dashboard |
| [11-sla-management.md](./20-USER-ROLES/08-coo/11-sla-management.md) | SLA management |
| [12-process-optimization.md](./20-USER-ROLES/08-coo/12-process-optimization.md) | Process optimization |
| [13-escalation-management.md](./20-USER-ROLES/08-coo/13-escalation-management.md) | Escalation management |

---

#### 09-ceo/ - Chief Executive Officer

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/09-ceo/00-OVERVIEW.md) | Role summary |
| [01-strategic-kpi-dashboard.md](./20-USER-ROLES/09-ceo/01-strategic-kpi-dashboard.md) | Strategic KPI dashboard |
| [02-board-reporting.md](./20-USER-ROLES/09-ceo/02-board-reporting.md) | Board reporting |
| [03-strategic-client.md](./20-USER-ROLES/09-ceo/03-strategic-client.md) | Strategic client management |
| [04-workforce-planning.md](./20-USER-ROLES/09-ceo/04-workforce-planning.md) | Workforce planning |

---

#### 10-admin/ - System Administrator

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/10-admin/00-OVERVIEW.md) | Role summary |
| [01-manage-users.md](./20-USER-ROLES/10-admin/01-manage-users.md) | Manage users |
| [02-configure-pods.md](./20-USER-ROLES/10-admin/02-configure-pods.md) | Configure pods |
| [03-system-settings.md](./20-USER-ROLES/10-admin/03-system-settings.md) | System settings |
| [04-data-management.md](./20-USER-ROLES/10-admin/04-data-management.md) | Data management |

---

#### 11-client-portal/ - Client Portal

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/11-client-portal/00-OVERVIEW.md) | Role summary |
| [01-portal-dashboard.md](./20-USER-ROLES/11-client-portal/01-portal-dashboard.md) | Portal dashboard |
| [02-review-candidates.md](./20-USER-ROLES/11-client-portal/02-review-candidates.md) | Review candidates |
| [03-schedule-interview.md](./20-USER-ROLES/11-client-portal/03-schedule-interview.md) | Schedule interview |
| [04-manage-placements.md](./20-USER-ROLES/11-client-portal/04-manage-placements.md) | Manage placements |
| [05-create-job-request.md](./20-USER-ROLES/11-client-portal/05-create-job-request.md) | Create job request |

---

#### 12-candidate-portal/ - Candidate Portal

| Document | Description |
|----------|-------------|
| [00-OVERVIEW.md](./20-USER-ROLES/12-candidate-portal/00-OVERVIEW.md) | Role summary |
| [01-portal-onboarding.md](./20-USER-ROLES/12-candidate-portal/01-portal-onboarding.md) | Portal onboarding |
| [02-manage-profile.md](./20-USER-ROLES/12-candidate-portal/02-manage-profile.md) | Manage profile |
| [03-view-submissions.md](./20-USER-ROLES/12-candidate-portal/03-view-submissions.md) | View submissions |
| [04-prepare-interview.md](./20-USER-ROLES/12-candidate-portal/04-prepare-interview.md) | Prepare interview |
| [05-manage-placement.md](./20-USER-ROLES/12-candidate-portal/05-manage-placement.md) | Manage placement |

---

### Screen Specifications

| Document | Description | Status |
|----------|-------------|--------|
| [30-SCREENS/00-SCREEN-MAP.md](./30-SCREENS/00-SCREEN-MAP.md) | All screens listed | ⏳ Pending |
| [30-SCREENS/01-LAYOUT-SHELL.md](./30-SCREENS/01-LAYOUT-SHELL.md) | Global layout | ✅ Complete |
| [30-SCREENS/shell/](./30-SCREENS/shell/) | Shell components | ⏳ Pending |
| [30-SCREENS/dashboard/](./30-SCREENS/dashboard/) | Dashboard screens | ⏳ Pending |
| [30-SCREENS/jobs/](./30-SCREENS/jobs/) | Jobs screens | ⏳ Pending |
| [30-SCREENS/candidates/](./30-SCREENS/candidates/) | Candidates screens | ⏳ Pending |
| [30-SCREENS/submissions/](./30-SCREENS/submissions/) | Submissions screens | ⏳ Pending |

### Form Specifications

| Document | Description | Status |
|----------|-------------|--------|
| [40-FORMS/00-FORM-STANDARDS.md](./40-FORMS/00-FORM-STANDARDS.md) | Form design rules | ⏳ Pending |
| [40-FORMS/job-create.md](./40-FORMS/job-create.md) | Job create form | ⏳ Pending |
| [40-FORMS/candidate-create.md](./40-FORMS/candidate-create.md) | Candidate create form | ⏳ Pending |
| [40-FORMS/submission-create.md](./40-FORMS/submission-create.md) | Submission form | ⏳ Pending |

### Component Library

| Document | Description | Status |
|----------|-------------|--------|
| [50-COMPONENTS/00-COMPONENT-LIBRARY.md](./50-COMPONENTS/00-COMPONENT-LIBRARY.md) | All components | ⏳ Pending |

### Workflows

| Document | Description | Status |
|----------|-------------|--------|
| [60-WORKFLOWS/00-WORKFLOW-MAP.md](./60-WORKFLOWS/00-WORKFLOW-MAP.md) | All workflows | ⏳ Pending |
| [60-WORKFLOWS/job-lifecycle.md](./60-WORKFLOWS/job-lifecycle.md) | Job lifecycle | ⏳ Pending |
| [60-WORKFLOWS/candidate-journey.md](./60-WORKFLOWS/candidate-journey.md) | Candidate journey | ⏳ Pending |
| [60-WORKFLOWS/submission-process.md](./60-WORKFLOWS/submission-process.md) | Submission process | ⏳ Pending |

### Navigation

| Document | Description | Status |
|----------|-------------|--------|
| [70-NAVIGATION/keyboard-shortcuts.md](./70-NAVIGATION/keyboard-shortcuts.md) | All shortcuts | ⏳ Pending |
| [70-NAVIGATION/url-structure.md](./70-NAVIGATION/url-structure.md) | Route patterns | ⏳ Pending |

### Action Logging

| Document | Description | Status |
|----------|-------------|--------|
| [80-ACTION-LOGGING/event-types.md](./80-ACTION-LOGGING/event-types.md) | All events | ⏳ Pending |
| [80-ACTION-LOGGING/event-payloads.md](./80-ACTION-LOGGING/event-payloads.md) | Event structures | ⏳ Pending |

---

## Project Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Pure Manual Perfection - Every action logged, tracked, tested | 🔄 Current |
| **Phase 2** | Flow Optimization - Fix workflows based on Phase 1 data | ⏳ Pending |
| **Phase 3** | AI Automation - Automate repetitive patterns | ⏳ Pending |
| **Phase 4** | AI Twin - Full intelligent automation | ⏳ Pending |

---

## How to Use This Documentation

### For New Developers

1. Start with [02-SYSTEM-OVERVIEW.md](./02-SYSTEM-OVERVIEW.md) for architecture
2. Read the [10-DATABASE/](./10-DATABASE/) section for data model
3. Check [00-PERMISSIONS-MATRIX.md](./20-USER-ROLES/00-PERMISSIONS-MATRIX.md) for access control
4. Review relevant screen specs before implementing

### For New Users

1. Find your role in [20-USER-ROLES/](./20-USER-ROLES/)
2. Read your role's OVERVIEW.md
3. Follow the daily-workflow.md for typical day

### For Implementation

1. Each use case breaks down into ~20min tasks
2. Use the click-by-click steps as acceptance criteria
3. All events to log are specified in [80-ACTION-LOGGING/](./80-ACTION-LOGGING/)

---

## Success Criteria

Documentation is complete when:

1. ✅ A new developer can understand the entire system by reading docs
2. ✅ A new user can learn their role from their role doc
3. ✅ Every field in the UI is specified with type, validation, label
4. ✅ Every click in every workflow is documented
5. ✅ Every screen has a wireframe and element inventory
6. ✅ No ambiguity - two people reading the same doc build the same thing

---

*Last Updated: 2025-12-01*
