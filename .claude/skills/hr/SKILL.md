---
name: hr
description: HR and Talent Acquisition domain expertise for InTime v3
---

# HR Skill

## Domain Overview
People operations: employee management, payroll, learning admin, org structure.

## Key Tables (src/lib/db/schema/ta-hr.ts)

| Table | Purpose |
|-------|---------|
| `employees` | Employee records |
| `departments` | Department structure |
| `positions` | Job positions |
| `reviews` | Performance reviews |
| `campaigns` | TA outreach campaigns |

## Components (src/components/hr/)

| Component | Purpose |
|-----------|---------|
| HRDashboard.tsx | Main HR dashboard |
| PeopleDirectory.tsx | Employee directory |
| EmployeeProfile.tsx | Employee details |
| OrgChart.tsx | Organization structure |
| PayrollDashboard.tsx | Payroll management |
| LearningAdmin.tsx | Training administration |
| Analytics.tsx | HR analytics |
| Recruitment.tsx | Internal recruitment |

## API Endpoints

```typescript
// Employees
trpc.taHr.employees.list({ departmentId?, status? })
trpc.taHr.employees.getById({ id })
trpc.taHr.employees.create(employeeData)
trpc.taHr.employees.update({ id, data })
trpc.taHr.employees.terminate({ id, reason, effectiveDate })

// Departments
trpc.taHr.departments.list()
trpc.taHr.departments.getOrgChart()

// Reviews
trpc.taHr.reviews.create({ employeeId, type, period })
trpc.taHr.reviews.submit({ reviewId, feedback, rating })
```

## TA/Sales Module (src/components/sales/)

| Component | Purpose |
|-----------|---------|
| TADashboard.tsx | Talent Acquisition dashboard |
| CampaignManager.tsx | Outreach campaign management |

## Integration Points
- Links to Academy for learning tracking
- Links to ATS for internal mobility
- AI Twin for HR insights

## Entity Categories

| Category | Entities | Workplan | Activity Logging |
|----------|----------|----------|------------------|
| **Root** | employee, review, campaign | Yes - auto-created | Yes - all operations |
| **Supporting** | department, position | No | Audit only |

## Activity-Centric Integration

### Golden Rule
```
"NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"
```

### Events Emitted (HR)

| Event | Trigger | Auto-Activities |
|-------|---------|-----------------|
| `employee.onboarded` | New hire starts | EMP_ONBOARD_CHECKLIST |
| `employee.anniversary` | Work anniversary | EMP_ANNIVERSARY_CHECKIN |
| `employee.review_due` | Review period starts | EMP_REVIEW_SCHEDULE |
| `employee.terminated` | Employee exits | EMP_OFFBOARD_CHECKLIST |
| `review.created` | Review initiated | REVIEW_SCHEDULE_MEETING |
| `review.submitted` | Review completed | REVIEW_FOLLOWUP |

### Events Emitted (TA)

| Event | Trigger | Auto-Activities |
|-------|---------|-----------------|
| `campaign.created` | New outreach campaign | CAMP_LAUNCH_PREP |
| `campaign.response_received` | Prospect responds | CAMP_RESPONSE_FOLLOWUP |
| `prospect.interested` | Prospect shows interest | PROSPECT_QUALIFICATION |
| `prospect.stale` | 7 days no response | PROSPECT_STALE_FOLLOWUP |

### Activity Patterns (HR)

| Pattern Code | Trigger | Activity | Due |
|--------------|---------|----------|-----|
| `EMP_ONBOARD_DAY1` | employee.onboarded | Task: Day 1 orientation | +0 hours |
| `EMP_ONBOARD_WEEK1` | employee.onboarded | Meeting: Week 1 check-in | +7 days |
| `EMP_ONBOARD_30DAY` | employee.onboarded | Meeting: 30-day review | +30 days |
| `EMP_ANNIVERSARY_CHECKIN` | employee.anniversary | Meeting: Anniversary check-in | +0 hours |
| `REVIEW_SCHEDULE_MEETING` | review.created | Meeting: Schedule review | +3 days |
| `REVIEW_FOLLOWUP` | review.submitted | Task: Follow up on feedback | +7 days |
| `EMP_OFFBOARD_EXIT` | employee.terminated | Meeting: Exit interview | -3 days |

### Activity Patterns (TA)

| Pattern Code | Trigger | Activity | Due |
|--------------|---------|----------|-----|
| `CAMP_LAUNCH_PREP` | campaign.created | Task: Prepare campaign assets | +24 hours |
| `CAMP_RESPONSE_FOLLOWUP` | campaign.response | Call: Follow up on response | +4 hours |
| `PROSPECT_QUALIFICATION` | prospect.interested | Call: Qualification call | +24 hours |
| `PROSPECT_STALE_FOLLOWUP` | prospect.stale | Email: Re-engagement | +0 hours |

### Transition Guards

```typescript
// Review cannot be closed without meeting
{
  entity: 'review',
  from: 'in_progress',
  to: 'completed',
  requires: [{ type: 'meeting', count: 1, status: 'completed' }],
  error: 'Must have review meeting before completing'
}

// Prospect cannot be converted without qualification
{
  entity: 'prospect',
  from: 'new',
  to: 'qualified',
  requires: [{ type: 'call', count: 1, status: 'completed' }],
  error: 'Complete qualification call first'
}
```

### SLA Rules

| Process | Metric | Warning | Breach |
|---------|--------|---------|--------|
| Onboarding | Day 1 orientation | - | Day 1 |
| Review | Schedule meeting | 5 days | 7 days |
| TA Response | Follow-up call | 2 hours | 4 hours |

### UI Requirements
- Activity queue on HR/TA dashboards
- Timeline on employee profiles
- Campaign activity tracking
- Onboarding checklist with activity completion
- Review progress with activity milestones
