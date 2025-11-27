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
