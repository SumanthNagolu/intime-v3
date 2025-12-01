# PROMPT: SCREENS-MANAGER-HR (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and hr skill.

Create Manager and HR Manager role screens for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/05-manager/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/05-manager/02-manage-team.md
- docs/specs/20-USER-ROLES/05-manager/04-review-pipeline.md
- docs/specs/20-USER-ROLES/06-hr-manager/00-OVERVIEW.md
- docs/specs/20-USER-ROLES/06-hr-manager/02-onboard-employee.md
- docs/specs/20-USER-ROLES/06-hr-manager/03-manage-benefits.md
- src/lib/db/schema/hr.ts

## Create Manager Screens (src/app/(app)/manager/):

### 1. Manager Dashboard (/manager)
File: page.tsx

Layout:
- Welcome banner
- KPI cards row: Team Size, Open Positions, Placements This Month, Revenue MTD
- Team overview section:
  - Pod cards: each pod with members, current assignments, performance
  - Workload distribution chart
- Two-column:
  - Left: Team Activities (requiring attention)
  - Right: Pipeline Summary (by stage)
- Bottom: Performance trends (weekly/monthly charts)

### 2. Team Management (/manager/team)
File: team/page.tsx

Layout:
- Page header: "My Team"
- View toggle: Org Chart | List | Cards
- Team member cards: avatar, name, role, current workload, performance indicators
- Pod groupings
- Actions: Reassign, Performance Review, 1:1 Schedule

### 3. Pod Management (/manager/pods)
File: pods/page.tsx

Layout:
- Pods grid: pod cards with type, members, metrics
- Pod detail modal/drawer:
  - Members list
  - Assignments
  - Performance metrics
  - Actions: Add Member, Remove Member, Reassign

### 4. Pipeline Review (/manager/pipeline)
File: pipeline/page.tsx

Layout:
- Pipeline view (funnel visualization)
- Stages with counts and conversion rates
- Click stage → List of items in that stage
- Filters: Pod, Date range, Job type
- Export option

### 5. Team Performance (/manager/performance)
File: performance/page.tsx

Layout:
- Performance dashboard
- KPI cards per team member
- Comparison charts
- Trends over time
- Drill-down to individual metrics
- Export reports

### 6. Approvals (/manager/approvals)
File: approvals/page.tsx

Layout:
- Pending approvals list
- Categories: Offers, Time Off, Expenses, etc.
- Quick approve/reject actions
- Bulk approve

### 7. Reports (/manager/reports)
File: reports/page.tsx

Layout:
- Report categories: Pipeline, Performance, Revenue, Activity
- Report builder (select metrics, date range, grouping)
- Saved reports
- Export options (PDF, Excel)

### 8. Team Activities (/manager/activities)
File: activities/page.tsx

Layout:
- Team activity queue (all team members)
- Filter by team member, status, overdue
- Reassignment capabilities
- Escalation panel

---

## Create HR Manager Screens (src/app/(app)/hr/):

### 1. HR Dashboard (/hr)
File: page.tsx

Layout:
- Welcome banner
- KPI cards: Total Employees, New Hires This Month, Open Positions, Turnover Rate
- Compliance alerts (documents expiring, reviews due)
- Two-column:
  - Left: Onboarding in Progress
  - Right: Upcoming Reviews
- Bottom: Headcount trends chart

### 2. Employees List (/hr/employees)
File: employees/page.tsx

Layout:
- Page header: "Employees" + Add Employee button
- EmployeesTable: name, department, title, status, hire_date, manager
- Filters: Department, Status, Employment type
- Click → Employee detail

### 3. Employee Detail (/hr/employees/[id])
File: employees/[id]/page.tsx

Layout:
- DetailLayout with tabs
- Header: Avatar, Name, Title, Department, Status, Actions
- Tabs:
  - Profile: Personal info, contact, emergency contact
  - Employment: Position, salary, manager, history
  - Documents: All employee documents
  - Benefits: Enrolled benefits, dependents
  - Time Off: Balance, history, requests
  - Performance: Reviews, goals
  - Compliance: I-9, required documents
  - Activities: HR activities

### 4. Employee Onboarding (/hr/employees/onboard)
File: employees/onboard/page.tsx

Layout:
- Multi-step form
- Steps:
  1. Basic Info (personal details)
  2. Employment Details (position, salary, start date)
  3. Documents (upload required docs)
  4. Benefits Enrollment
  5. IT Setup (optional integration)
  6. Review & Create

### 5. Onboarding Tracker (/hr/onboarding)
File: onboarding/page.tsx

Layout:
- In-progress onboardings list
- Kanban by stage or list view
- Checklist progress per employee
- Overdue tasks highlighted
- Actions: View checklist, Send reminder

### 6. Benefits Management (/hr/benefits)
File: benefits/page.tsx

Layout:
- Benefit plans list
- Plan cards: name, type, provider, enrollment count
- Actions: Edit Plan, View Enrollments
- Open enrollment status

### 7. Benefit Plan Detail (/hr/benefits/[id])
File: benefits/[id]/page.tsx

Layout:
- Plan info: type, provider, options
- Enrollees table
- Coverage levels breakdown
- Cost analysis

### 8. Time Off Management (/hr/time-off)
File: time-off/page.tsx

Layout:
- Pending requests (for approval)
- Calendar view (team time off)
- Policies configuration
- Balance reports

### 9. Compliance Dashboard (/hr/compliance)
File: compliance/page.tsx

Layout:
- Compliance status overview
- Expiring documents alerts
- I-9 audit status
- Required training status
- Filters by employee, requirement type

### 10. Performance Reviews (/hr/reviews)
File: reviews/page.tsx

Layout:
- Review cycles management
- Active reviews progress
- Calibration sessions
- Historical reviews

### 11. HR Reports (/hr/reports)
File: reports/page.tsx

Layout:
- Report categories: Headcount, Turnover, Benefits, Compliance
- Report builder
- Scheduled reports
- Export options

### 12. HR Activities (/hr/activities)
File: activities/page.tsx

Layout:
- HR-specific activity queue
- Onboarding tasks
- Document collection follow-ups
- Review reminders

## Screen Metadata:
Create metadata in:
- src/lib/metadata/screens/manager/
- src/lib/metadata/screens/hr/

## Requirements:
- Manager: Pod-based view hierarchy
- Manager: Approval workflows
- HR: Compliance tracking
- HR: Document management
- HR: Benefits enrollment flows
- Both: Performance visualization

## After Screens:
- Add routes to navigation config
- Export screen metadata
