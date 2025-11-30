# InTime OS: Project Handoff Document

**Created:** 2024-11-30
**Updated:** 2024-11-30
**Purpose:** Handoff from Cursor to Claude Code CLI for continued implementation

---

## Current Progress Summary

### Completed Documentation (53 files)

| Category | Documents | Status |
|----------|-----------|--------|
| **Foundation** | INDEX, GLOSSARY | ✅ 2/3 (67%) |
| **Database Specs** | All 15 table specs | ✅ **15/15 (100%)** |
| **Recruiter Role** | Overview + 7 use cases | ✅ **8/8 (100%)** |
| **Bench Sales Role** | Overview + 4 use cases | ✅ **5/5 (100%)** |
| **TA Recruiter Role** | Overview + 4 use cases | ✅ **5/5 (100%)** |
| **Admin Role** | Overview + 4 use cases | ✅ **5/5 (100%)** |
| **Manager Role** | Overview + 4 use cases | ✅ **5/5 (100%)** |
| **HR Manager Role** | Overview + 5 use cases | ✅ **6/6 (100%)** |
| **Screens** | Layout Shell | ✅ 1/7 (14%) |
| **Forms** | None | ⏳ 0/4 (0%) |
| **Components** | None | ⏳ 0/1 (0%) |
| **Workflows** | None | ⏳ 0/4 (0%) |
| **Navigation** | None | ⏳ 0/2 (0%) |
| **Action Logging** | None | ⏳ 0/2 (0%) |

---

## 1. Original User Request Summary

The user requested a transformation of InTime v3 from a role-based tool into a **unified, enterprise-grade Operating System (InTime OS)** for staffing, modeled after Guidewire/Salesforce.

### Core Vision:
- **Single Cohesive Workspace** - Navigation driven by Entity Type (Jobs, People, Opportunities), not User Role
- **RCAI Ownership Model** - Responsible, Accountable, Consulted, Informed controls all access/visibility via `object_owners` table
- **Pod Structure** - Teams with Manager oversight, each IC handling end-to-end (account management, delivery, recruiting)
- **10 Core Objects** in navigation: Jobs, Candidates, Contacts, Leads, Deals, Accounts, Submissions, Job Orders, Placements, Campaigns

### Phased Development Approach:
1. **Phase 1:** Pure manual perfection - Every action logged, tracked, tested (NO AI)
2. **Phase 2:** Flow optimization based on Phase 1 data
3. **Phase 3:** AI automation of repetitive patterns
4. **Phase 4:** Complete AI twin

### Key Requirement:
**"No implementation until docs/specs is complete."** - Create exhaustive documentation covering database, UI, every screen, every field, every click before coding.

---

## 2. What's Completed ✅

### Documentation Created:

```
docs/specs/
├── 00-INDEX.md                    ✅ Complete (with progress dashboard)
├── 01-GLOSSARY.md                 ✅ Complete
├── 02-SYSTEM-OVERVIEW.md          ⏳ Pending
│
├── 10-DATABASE/
│   ├── 00-ERD.md                  ✅ Complete
│   ├── 01-jobs.md                 ✅ Complete
│   ├── 02-candidates.md           ✅ Complete
│   ├── 03-accounts.md             ✅ Complete
│   ├── 04-contacts.md             ✅ Complete
│   ├── 05-leads.md                ✅ Complete
│   ├── 06-deals.md                ✅ Complete
│   ├── 07-submissions.md          ✅ Complete
│   ├── 08-job-orders.md           ✅ Complete
│   ├── 09-placements.md           ✅ Complete
│   ├── 10-campaigns.md            ✅ Complete
│   ├── 11-activities.md           ✅ Complete
│   ├── 12-object-owners.md        ✅ Complete
│   ├── 13-user-profiles.md        ✅ Complete
│   ├── 14-pods.md                 ✅ Complete
│   └── 99-FIELD-REFERENCE.md      ⏳ Pending
│
├── 20-USER-ROLES/
│   ├── 00-PERMISSIONS-MATRIX.md   ⏳ Pending
│   │
│   ├── 01-recruiter/              ✅ Complete (8 docs)
│   │   ├── 00-OVERVIEW.md
│   │   ├── 01-daily-workflow.md
│   │   ├── 02-create-job.md
│   │   ├── 03-source-candidates.md
│   │   ├── 04-submit-candidate.md
│   │   ├── 05-schedule-interview.md
│   │   ├── 06-make-placement.md
│   │   └── 07-log-activity.md
│   │
│   ├── 02-bench-sales/            ✅ Complete (5 docs)
│   │   ├── 00-OVERVIEW.md
│   │   ├── 01-daily-workflow.md
│   │   ├── 02-manage-bench.md
│   │   ├── 03-market-consultant.md
│   │   └── 04-find-requirements.md
│   │
│   ├── 03-ta/                     ✅ Complete (5 docs)
│   │   ├── 00-OVERVIEW.md
│   │   ├── 01-daily-workflow.md
│   │   ├── 02-run-campaign.md
│   │   ├── 03-internal-hiring.md
│   │   └── 04-onboard-employee.md
│   │
│   ├── 03-admin/                  ✅ Complete (5 docs) [NOTE: Should be 04-admin]
│   │   ├── 00-OVERVIEW.md
│   │   ├── 01-manage-users.md
│   │   ├── 02-configure-pods.md
│   │   ├── 03-system-settings.md
│   │   └── 04-data-management.md
│   │
│   ├── 05-manager/                ✅ Complete (5 docs)
│   │   ├── 00-OVERVIEW.md
│   │   ├── 01-daily-workflow.md
│   │   ├── 02-pod-dashboard.md
│   │   ├── 03-handle-escalation.md
│   │   └── 04-approve-submission.md
│   │
│   └── 06-hr-manager/             ✅ Complete (6 docs)
│       ├── 00-OVERVIEW.md
│       ├── 01-daily-workflow.md
│       ├── 02-employee-onboarding.md
│       ├── 03-payroll-management.md
│       ├── 04-performance-reviews.md
│       └── 05-time-and-attendance.md
│
├── 30-SCREENS/
│   ├── 00-SCREEN-MAP.md           ⏳ Pending
│   └── 01-LAYOUT-SHELL.md         ✅ Complete
│
├── 40-FORMS/                      ⏳ All pending
├── 50-COMPONENTS/                 ⏳ All pending
├── 60-WORKFLOWS/                  ⏳ All pending
├── 70-NAVIGATION/                 ⏳ All pending
└── 80-ACTION-LOGGING/             ⏳ All pending
```

---

## 3. What's Next 📋

### High Priority (Implementation Blockers)

| Document | Description | Priority |
|----------|-------------|----------|
| **30-SCREENS/** | Screen specifications for implementation | HIGH |
| **40-FORMS/** | Form specifications (job, candidate, submission) | HIGH |

### Medium Priority

| Document | Description | Priority |
|----------|-------------|----------|
| **00-PERMISSIONS-MATRIX.md** | Consolidate all role permissions | MEDIUM |
| **02-SYSTEM-OVERVIEW.md** | Architecture for new developers | MEDIUM |
| **50-COMPONENTS/** | Reusable component library | MEDIUM |
| **60-WORKFLOWS/** | Cross-role workflow diagrams | MEDIUM |

### Low Priority (Can Generate from Existing)

| Document | Description | Priority |
|----------|-------------|----------|
| **70-NAVIGATION/** | Extract from use cases | LOW |
| **80-ACTION-LOGGING/** | Extract from use cases | LOW |
| **99-FIELD-REFERENCE.md** | Alphabetical dictionary from table specs | LOW |

---

## 4. Key Business Context

### Pod Structure
- **Pod = Team** with Manager + ICs (Individual Contributors)
- **Manager role:** "Path clearer / torch bearer" - handles C and I in RCAI
- **ICs work independently** end-to-end (account management, delivery, recruiting)
- **Sprint target:** 1 placement per person per 2-week sprint

### User Roles Documented
1. **Technical Recruiter** - Client-facing, fills job requisitions
2. **Bench Sales Recruiter** - Markets consultants on the bench
3. **Talent Acquisition** - Internal hiring for the staffing company
4. **Admin** - System configuration, user management
5. **Manager** - Pod oversight, escalation handling
6. **HR Manager** - Onboarding, payroll, compliance

### RCAI Model
- **R**esponsible: Does the work (IC)
- **A**ccountable: Owns the outcome (exactly 1 per entity)
- **C**onsulted: Provides input (Manager)
- **I**nformed: Kept updated (Manager)

---

## 5. Documentation Standards

### For Database Specs
Each table document includes:
- Overview table with metadata
- Complete SQL CREATE TABLE statement
- Exhaustive field specifications (type, validation, UI label, error messages)
- Enum values with display labels and colors
- Indexes with purpose
- RLS policies
- Triggers with function code
- Related tables
- Business rules

### For Use Cases
Each use case document includes:
- Overview (ID, Actor, Goal, Frequency, Time)
- Preconditions
- Trigger scenarios
- Main flow (click-by-click with ASCII wireframes)
- Field specifications with validation
- Alternative flows
- Error scenarios
- Postconditions
- Events logged
- Related use cases
- Test cases

---

## 6. Claude Code CLI Continuation Prompt

Copy the following to continue with Claude Code CLI:

```
Continue implementing the InTime OS project specification documentation.

Reference the handoff document at: docs/INTIME-OS-HANDOFF.md

Current state:
- Foundation docs complete (INDEX, GLOSSARY)
- ALL 15 database specs complete (100%)
- ALL 6 user roles complete (100%)
  - Recruiter: 8 docs
  - Bench Sales: 5 docs
  - TA: 5 docs
  - Admin: 5 docs
  - Manager: 5 docs
  - HR Manager: 6 docs
- Shell layout complete
- Folder structure in place at docs/specs/

Next priority:
1. Complete SCREENS specs (30-SCREENS/) - Dashboard, Jobs, Candidates, Submissions
2. Complete FORMS specs (40-FORMS/) - Job create, Candidate create, Submission create
3. Add Permissions Matrix (20-USER-ROLES/00-PERMISSIONS-MATRIX.md)

Key context:
- Pod = Manager + ICs working independently end-to-end
- Sprint target = 1 placement per person per 2-week sprint
- Roles: Technical Recruiter, Bench Sales Recruiter, Talent Acquisition Recruiter, HR Manager
- Manager = "path clearer / torch bearer" - handles C and I responsibilities

Documentation must be exhaustive:
- Every field: type, label, validation, error messages
- Every workflow: step-by-step, click-by-click
- Every screen: wireframe, all elements

Rule: "No implementation until docs/specs is complete."
```

---

## 7. Session Notes

### 2024-11-30 Session (Claude Code CLI)
- **Completed all 12 remaining database specs** using parallel agents
- **Completed all 4 remaining Recruiter use cases**
- **Created full documentation for 5 additional roles:**
  - Bench Sales Recruiter (5 docs)
  - Talent Acquisition Recruiter (5 docs)
  - Admin (5 docs)
  - Manager (5 docs)
  - HR Manager (6 docs)
- Updated INDEX.md with complete navigation and progress dashboard
- **Total: ~53 documents created/completed**

### Approach Used
- Parallel agent execution for independent documents
- Read existing specs (01-jobs.md, 02-create-job.md) for format consistency
- Read actual schema files (ats.ts, crm.ts, workspace.ts, ta-hr.ts, activities.ts) for accuracy
- Each database spec: ~500-1500 lines
- Each use case: ~500-1000 lines

---

*Next session: Start with 30-SCREENS/ for implementation readiness.*
