# USER-ROLES Documentation Index

**Version:** 1.0
**Last Updated:** 2025-11-30
**Purpose:** Master navigation for all user role specifications

---

## Partner Model Overview

InTime v3 operates on a **Partner Model** where each team member owns end-to-end responsibility:

```
┌─────────────────────────────────────────────────────────────┐
│                    PARTNER MODEL                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TECHNICAL RECRUITER = BDM + AM + Recruiter + Delivery Mgr  │
│  ─────────────────────────────────────────────────────────  │
│  • Prospects clients (BDM)                                   │
│  • Manages relationships (AM)                                │
│  • Sources & submits candidates (Recruiter)                  │
│  • Ensures placement success (Delivery)                      │
│                                                              │
│  BENCH SALES = Builder + Marketing + Vendor + Immigration   │
│  ─────────────────────────────────────────────────────────  │
│  • Builds bench (all visa types)                            │
│  • Markets consultants                                       │
│  • Manages vendor relationships                              │
│  • Tracks immigration status                                 │
│                                                              │
│  TA SPECIALIST = Lead Gen + Training + Internal Hiring      │
│  ─────────────────────────────────────────────────────────  │
│  • Generates leads for bench & training                      │
│  • Manages training pipeline                                 │
│  • Handles internal hiring                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
20-USER-ROLES/
│
├── FOUNDATIONAL DOCUMENTS
│   ├── 00-MASTER-FRAMEWORK.md      ← Canonical reference (read first)
│   ├── 00-PERMISSIONS-MATRIX.md    ← Role permissions (RACI model)
│   ├── 01-ACTIVITIES-EVENTS-FRAMEWORK.md  ← Activity-centric architecture
│   ├── 02-ACTIVITY-PATTERN-LIBRARY.md     ← 71 standard activity patterns
│   ├── 03-EVENT-TYPE-CATALOG.md           ← 268 event types
│   └── ROLE-INDEX.md               ← This file
│
├── INDIVIDUAL CONTRIBUTORS (Revenue Generators)
│   ├── 01-recruiter/           ← Technical Recruiter (Partner Model)
│   ├── 02-bench-sales/         ← Bench Sales Recruiter
│   └── 03-ta/                  ← Talent Acquisition Specialist
│
├── MANAGEMENT
│   ├── 04-manager/             ← Pod Manager
│   ├── 05-hr/                  ← HR Manager
│   └── 06-regional/            ← Regional Director
│
├── EXECUTIVE LEADERSHIP
│   ├── 07-cfo/                 ← Chief Financial Officer
│   ├── 08-coo/                 ← Chief Operating Officer
│   └── 09-ceo/                 ← Chief Executive Officer
│
├── SUPPORT
│   └── 10-admin/               ← System Administrator
│
└── EXTERNAL PORTALS
    ├── 11-client-portal/       ← Client Portal Users
    └── 12-candidate-portal/    ← Candidate Portal Users
```

---

## Role Quick Reference

| # | Folder | Role | Primary Focus | Key Entity |
|---|--------|------|---------------|------------|
| 01 | recruiter | Technical Recruiter | End-to-end recruiting | Jobs, Candidates, Placements |
| 02 | bench-sales | Bench Sales | Consultant marketing | Bench Consultants, Vendors |
| 03 | ta | TA Specialist | Lead generation | Leads, Training Pipeline |
| 04 | manager | Pod Manager | Team oversight | Pods, Approvals |
| 05 | hr | HR Manager | People operations | Employees, Compliance |
| 06 | regional | Regional Director | Multi-pod oversight | Regions, Accounts |
| 07 | cfo | CFO | Finance & profitability | Revenue, Commissions, AR/AP |
| 08 | coo | COO | Operations & execution | SLAs, Efficiency, Quality |
| 09 | ceo | CEO | Vision & strategy | OKRs, Board Metrics |
| 10 | admin | System Admin | System configuration | Users, Settings |
| 11 | client-portal | Client Users | External client access | Jobs, Submissions |
| 12 | candidate-portal | Candidate Users | External candidate access | Profile, Applications |

---

## Screen-to-Role Mapping

| Screen | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 |
|--------|----|----|----|----|----|----|----|----|----|----|----|----|
| Jobs | ✅ | - | - | ✅ | - | ✅ | - | ✅ | - | - | ✅ | - |
| Candidates | ✅ | ✅ | - | ✅ | - | ✅ | - | ✅ | - | - | - | - |
| Submissions | ✅ | ✅ | - | ✅ | - | ✅ | - | ✅ | - | - | ✅ | ✅ |
| Placements | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | ✅ | ✅ |
| Bench | - | ✅ | - | ✅ | - | ✅ | - | ✅ | - | - | - | - |
| Accounts | ✅ | ✅ | ✅ | ✅ | - | ✅ | - | ✅ | ✅ | - | - | - |
| Leads | ✅ | - | ✅ | ✅ | - | ✅ | - | - | - | - | - | - |
| Finance | - | - | - | - | - | - | ✅ | - | - | - | - | - |
| HR Dashboard | - | - | - | - | ✅ | - | - | - | - | - | - | - |
| Admin Settings | - | - | - | - | - | - | - | - | - | ✅ | - | - |

Legend: ✅ = Full Access, - = No Access

---

## RACI Quick Reference

Every object in InTime has:
- **R (Responsible)**: Does the work (usually the creator/owner)
- **A (Accountable)**: Approves/reviews (usually Pod Manager)
- **C (Consulted)**: Provides input (Secondary Recruiter, Finance)
- **I (Informed)**: Gets notifications (COO, Regional Director)

---

## Employee Self-Service (All Internal Roles)

All internal employees (roles 01-10) have access to these self-service workflows:

| Workflow | File | Description |
|----------|------|-------------|
| Submit Leave | [05-hr/20-submit-leave.md](./05-hr/20-submit-leave.md) | PTO, sick, personal, bereavement |
| Submit Timesheet | [05-hr/21-submit-timesheet.md](./05-hr/21-submit-timesheet.md) | Weekly hours, project allocation |
| Enroll Training | [05-hr/22-enroll-training.md](./05-hr/22-enroll-training.md) | Academy courses, certifications |
| Submit Expense | [05-hr/23-submit-expense.md](./05-hr/23-submit-expense.md) | Reimbursements, mileage, per diem |

These workflows live in `05-hr/` (HR owns policies) but are accessible to all employees.

---

## Developer Quick Start

1. **Pick a role** → Read its `00-OVERVIEW.md`
2. **Find a workflow** → Each folder has numbered workflow files
3. **Build the screen** → Each workflow has ASCII wireframes and field specs
4. **Check permissions** → See `00-PERMISSIONS-MATRIX.md`

---

## Key Business Rules

1. **Pods = Teams**: Flexible groupings (project/client/domain/region-based)
2. **Partner Model**: Every IC owns end-to-end (no handoffs between roles)
3. **RACI on Everything**: Every object has clear ownership
4. **US + Canada Focus**: Primary markets with visa tracking
5. **Custom Vendor Terms**: Negotiated per-vendor (not fixed percentages)
6. **Activity-Centric**: No work is done unless an activity is created

---

## Activities & Events Framework

InTime v3 operates on an **Activity-Centric Architecture** inspired by Guidewire:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"              ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

### Activities vs Events

| Type | Creator | Purpose | Status | Example |
|------|---------|---------|--------|---------|
| **Activity** | Human | Track work done | Open → Completed | "Call candidate" |
| **Event** | System | Record what happened | Immutable log | "candidate.submitted" |

### Key Documents

| Document | Purpose | Content |
|----------|---------|---------|
| [01-ACTIVITIES-EVENTS-FRAMEWORK.md](./01-ACTIVITIES-EVENTS-FRAMEWORK.md) | Architecture guide | Core concepts, data models, UI components |
| [02-ACTIVITY-PATTERN-LIBRARY.md](./02-ACTIVITY-PATTERN-LIBRARY.md) | Pattern catalog | 71 standard patterns by entity |
| [03-EVENT-TYPE-CATALOG.md](./03-EVENT-TYPE-CATALOG.md) | Event catalog | 268 event types with schemas |

### Activity Types

| Icon | Type | Use Case |
|------|------|----------|
| 📞 | Call | Phone conversations |
| 📧 | Email | Email correspondence |
| 📅 | Meeting | Scheduled meetings |
| ✅ | Task | General tasks |
| 📝 | Note | Comments/observations |
| 🎤 | Interview | Interviews conducted |
| 📤 | Submission | Candidate submissions |

### Auto-Activity Patterns

When events occur, the system automatically creates follow-up activities:

| Trigger Event | Auto-Created Activity | Due |
|---------------|----------------------|-----|
| `candidate.created` | Call: Introduction | +4 hours |
| `candidate.submitted` | Call: Follow up on submission | +24 hours |
| `interview.scheduled` | Task: Prepare candidate | -24 hours |
| `placement.started` | Call: Day 1 check-in | +1 day |
| `account.health_dropped` | Escalation: Review at-risk | +4 hours |

---

## Developer Quick Start

1. **Read Foundation** → Start with `00-MASTER-FRAMEWORK.md`
2. **Understand Activities** → Read `01-ACTIVITIES-EVENTS-FRAMEWORK.md`
3. **Pick a role** → Read its `00-OVERVIEW.md`
4. **Find a workflow** → Each folder has numbered workflow files
5. **Build the screen** → Each workflow has ASCII wireframes and field specs
6. **Add Activities** → Every action must create an activity
7. **Check permissions** → See `00-PERMISSIONS-MATRIX.md`

---

## File Counts by Folder

| Folder | Files | Description |
|--------|-------|-------------|
| Root | 6 | Framework docs + index |
| 01-recruiter | 27 | Technical Recruiter workflows |
| 02-bench-sales | 23 | Bench Sales workflows |
| 03-ta | 9 | TA Specialist workflows |
| 04-manager | 11 | Pod Manager workflows |
| 05-hr | 16 | HR + Employee Self-Service |
| 06-regional | 8 | Regional Director workflows |
| 07-cfo | 10 | CFO/Finance workflows |
| 08-coo | 4 | COO/Operations workflows |
| 09-ceo | 5 | CEO/Strategy workflows |
| 10-admin | 11 | System Admin workflows |
| 11-client-portal | 9 | Client Portal workflows |
| 12-candidate-portal | 7 | Candidate Portal workflows |
| **Total** | **146** | Complete specification |

---

*Last Updated: 2025-11-30*
