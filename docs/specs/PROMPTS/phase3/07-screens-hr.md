# PROMPT: SCREENS-HR (Window 7)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and hr skill.

Create/Update HR Manager role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/05-hr/00-OVERVIEW.md (Complete HR role spec)
- docs/specs/20-USER-ROLES/05-hr/01-daily-workflow.md (Daily workflow)
- docs/specs/20-USER-ROLES/05-hr/02-employee-onboarding.md (Onboarding)
- docs/specs/20-USER-ROLES/05-hr/03-payroll-management.md (Payroll)
- docs/specs/20-USER-ROLES/05-hr/04-performance-reviews.md (Performance)
- docs/specs/20-USER-ROLES/05-hr/05-time-and-attendance.md (Time tracking)
- docs/specs/20-USER-ROLES/05-hr/06-international-employment.md (International)
- docs/specs/20-USER-ROLES/05-hr/07-contractor-classification.md (Contractors)
- docs/specs/20-USER-ROLES/05-hr/08-benefits-administration.md (Benefits)
- docs/specs/20-USER-ROLES/05-hr/09-compliance-audit.md (Compliance)
- docs/specs/20-USER-ROLES/05-hr/12-us-employment-compliance.md (US compliance)
- docs/specs/20-USER-ROLES/05-hr/13-canada-employment-compliance.md (Canada compliance)
- docs/specs/01-GLOSSARY.md (Business terms)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/hr/index.ts (Existing HR screen registry)
- src/screens/hr/hr-dashboard.screen.ts
- src/screens/hr/employee-list.screen.ts
- src/screens/hr/employee-detail.screen.ts
- src/screens/hr/onboarding-list.screen.ts
- src/screens/hr/payroll-dashboard.screen.ts
- src/screens/hr/benefits-list.screen.ts
- src/screens/hr/compliance-dashboard.screen.ts
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/lib/db/schema/hr.ts (HR schema)

## Context:
- Routes: `/employee/hr/*` for HR screens
- HR Manager handles INTERNAL operations (not client placements)
- Focus areas: Employee lifecycle, Payroll, Benefits, Compliance, Performance
- HR manages both internal staff AND placed consultants' onboarding
- Compliance is critical: I-9, work authorization, labor laws

## HR vs Recruiter Distinction (Critical):
Per 00-OVERVIEW.md:
- **HR Manager**: Internal employees, payroll, benefits, compliance, performance
- **Technical Recruiter**: External candidate placements at clients
- **Overlap**: HR onboards placed consultants after recruiter places them

---

## HR Dashboard (src/screens/hr/):

### 1. HR Dashboard (UPDATE existing)
File: hr-dashboard.screen.ts
Route: `/employee/hr/dashboard`
Status: EXISTS - Enhance per 00-OVERVIEW.md

Per Section 4 (KPIs):

KPI Cards (Row 1):
- Total Employees (with +/- from last month)
- New Hires This Month
- Open Internal Positions
- Employee Turnover Rate (trailing 12 months)

KPI Cards (Row 2):
- Time to Onboard (avg days, target <7)
- Payroll Accuracy (target 99.5%)
- Compliance Rate (target 100%)
- Benefits Enrollment Rate (target >90%)

Widgets:
- Compliance Alerts (expiring documents, I-9 issues)
- Pending Onboardings (checklist status)
- Upcoming Reviews
- PTO Requests Pending
- Recent Hires Timeline

---

## Employee Management Screens:

### 2. Employees List (UPDATE existing)
File: employee-list.screen.ts
Route: `/employee/hr/people`
Status: EXISTS - Verify per spec

Per 00-OVERVIEW.md permissions: Full access to all employee data

Table columns: name, department, title, status (active/on_leave/terminated), employmentType (full_time/part_time/contractor), manager, hireDate, location
Filters: Department, Status, Employment type, Manager, Location
Search: By name, email, employee number

Bulk actions: Export, Generate Reports

### 3. Employee Detail (UPDATE existing)
File: employee-detail.screen.ts
Route: `/employee/hr/people/[id]`
Status: EXISTS - Verify tabs per 10-employee-lifecycle.md

Tabs:
- **Profile**: Personal info, contact, emergency contact, photo
- **Employment**: Position, department, manager, salary, hire date, employment type, work mode
- **Documents**: All employee documents (ID, I-9, W-4, direct deposit, etc.)
- **Benefits**: Enrolled benefits, dependents, effective dates
- **Time Off**: PTO balance, accrual, request history
- **Performance**: Reviews, goals, PIPs if any
- **Compliance**: I-9 status, work authorization, required training
- **Payroll**: Compensation history, deductions, pay stubs
- **Activities**: HR activities for this employee

Header: Avatar, Name, Title, Department, Status badge
Actions: Edit, Terminate, Change Department, Promote, Add to PIP

### 4. Employee Onboarding Form (CREATE if needed)
File: employee-onboard-form.screen.ts
Route: `/employee/hr/people/onboard`

Per 02-employee-onboarding.md:

Multi-step wizard:
1. **Basic Info**: First name, Last name, Email, Phone, Address
2. **Employment**: Position, Department, Manager, Start date, Employment type, Salary
3. **Tax & Compliance**: W-4 info, I-9 verification, State tax forms
4. **Direct Deposit**: Bank info, Routing number, Account number
5. **Benefits Enrollment**: Available plans, Select options
6. **IT & Equipment**: Laptop, Software access, Email setup (if integrated)
7. **Review & Create**: Summary, Create employee

Generate onboarding checklist automatically

---

## Onboarding Screens:

### 5. Onboarding Queue (UPDATE existing)
File: onboarding-list.screen.ts
Route: `/employee/hr/onboarding`
Status: EXISTS - Verify features

Views: Kanban (by stage) | List

Kanban columns:
- Documents Pending
- I-9 Verification
- Benefits Selection
- IT Setup
- Complete

List columns: name, startDate, manager, checklistProgress (x/y complete), stage, daysUntilStart
Filters: Stage, Start date range, Department, Overdue items

Actions per row: View Checklist, Send Reminder, Mark Complete

### 6. Onboarding Detail (UPDATE existing)
File: onboarding-detail.screen.ts
Route: `/employee/hr/onboarding/[id]`
Status: EXISTS - Verify checklist

Layout:
- Header: Employee name, Start date, Days until/since start
- Checklist: Interactive checklist items with status, due date, notes
  - Categories: Documents, Compliance, Benefits, IT, Training
- Documents: Upload/view required documents
- Notes: Onboarding notes
- Actions: Mark items complete, Send reminders, Complete onboarding

---

## Payroll Screens:

### 7. Payroll Dashboard (UPDATE existing)
File: payroll-dashboard.screen.ts
Route: `/employee/hr/payroll`
Status: EXISTS - Verify per 03-payroll-management.md

Per spec:

Widgets:
- Current Pay Period (dates, status)
- Pending Timesheets (count, approve all)
- Payroll Run Status (if in progress)
- Next Payroll Date countdown

Tables:
- Current Pay Period Employees (hours, gross, deductions, net)
- Recent Payroll Runs (date, total, status)

Actions: Start Payroll Run, View History, Export

### 8. Payroll Detail (UPDATE existing)
File: payroll-detail.screen.ts
Route: `/employee/hr/payroll/[id]`
Status: EXISTS - Verify fields

Per 03-payroll-management.md:

For a specific payroll run:
- Summary: Pay period, Total employees, Total gross, Total deductions, Total net
- Employee breakdown table: name, hours, rate, gross, taxes, deductions, net
- Deductions summary
- Actions: Approve, Submit for processing, Export pay stubs

---

## Time & Attendance Screens:

### 9. Time Off List (UPDATE existing)
File: timeoff-list.screen.ts
Route: `/employee/hr/time`
Status: EXISTS - Verify

Per 05-time-and-attendance.md:

Tabs:
- Pending Requests (action required)
- Approved
- History

Table: employeeName, type (PTO/sick/personal/parental/etc), startDate, endDate, days, status
Filters: Type, Status, Department, Date range

Actions: Approve, Deny (with reason), View Calendar

### 10. Time Off Detail (UPDATE existing)
File: timeoff-detail.screen.ts
Route: `/employee/hr/time/[id]`
Status: EXISTS - Verify

- Request details: Employee, Type, Dates, Days, Notes
- Employee's PTO balance
- Calendar showing request dates
- Conflict check (other team members out)
- Actions: Approve, Deny with reason

### 11. Attendance Tracking (CREATE if missing)
File: attendance-list.screen.ts
Route: `/employee/hr/attendance`
Status: May exist - verify

Table: employeeName, date, clockIn, clockOut, hoursWorked, status (present/absent/late)
Filters: Date range, Department, Status

Summary: Total present, Absent count, Late count

### 12. Timesheet Approval (CREATE if missing)
File: timesheet-approval.screen.ts
Route: `/employee/hr/timesheets`

Pending timesheets for approval:
- Table: employeeName, payPeriod, totalHours, overtimeHours, status
- Expand to see daily breakdown
- Actions: Approve, Reject (with notes), Request Revision

---

## Benefits Screens:

### 13. Benefits List (UPDATE existing)
File: benefits-list.screen.ts
Route: `/employee/hr/benefits`
Status: EXISTS - Verify per 08-benefits-administration.md

Plan cards:
- Plan name
- Type (Health, Dental, Vision, 401k, Life, etc.)
- Provider
- Enrolled count
- Status (active/inactive)

Actions: Edit Plan, View Enrollments, Add Plan

### 14. Benefits Enrollment (UPDATE existing)
File: benefits-enrollment.screen.ts
Route: `/employee/hr/benefits/enroll`
Status: May exist - verify

For managing open enrollment:
- Open Enrollment period settings
- Eligible employees list
- Enrollment status by employee
- Send reminders
- Deadline countdown

### 15. Employee Benefits Detail (CREATE if missing)
File: employee-benefits.screen.ts
Route: `/employee/hr/benefits/employee/[id]`

For a specific employee:
- Current enrollments
- Coverage levels
- Dependents
- Costs (employee/employer split)
- Change requests (life event changes)
- Historical enrollments

---

## Performance Screens:

### 16. Performance Reviews List (UPDATE existing)
File: performance-list.screen.ts
Route: `/employee/hr/performance`
Status: EXISTS - Verify per 04-performance-reviews.md

Tabs:
- Current Cycle (in progress reviews)
- Completed Reviews
- Upcoming Reviews

Table: employeeName, reviewPeriod, manager, status (pending/self_review/manager_review/complete), dueDate
Filters: Cycle, Status, Department

Actions: Start New Cycle, Send Reminders

### 17. Performance Detail (UPDATE existing)
File: performance-detail.screen.ts
Route: `/employee/hr/performance/[id]`
Status: EXISTS - Verify

Review detail:
- Employee info
- Review period
- Self-assessment (if submitted)
- Manager assessment (if submitted)
- Overall rating
- Goals for next period
- Development plan
- Actions: Complete, Send Back, Print

### 18. Goals Management (CREATE if missing)
File: goals-list.screen.ts
Route: `/employee/hr/performance/goals`

Org-wide goal tracking:
- Table: employeeName, goal, dueDate, progress, status
- Filters: Department, Status (on_track/at_risk/completed)
- Aggregate: % on track, % completed

---

## Compliance Screens:

### 19. Compliance Dashboard (UPDATE existing)
File: compliance-dashboard.screen.ts
Route: `/employee/hr/compliance`
Status: EXISTS - Verify per 09-compliance-audit.md

Compliance Score: Overall % (target 100%)

Alert sections:
- I-9 Issues (incomplete, expired)
- Work Authorization Expiring (with countdown)
- Missing Documents
- Required Training Overdue
- Policy Acknowledgments Pending

Actions: View All, Send Reminders, Generate Report

### 20. I-9 Verification List (CREATE if missing)
File: i9-list.screen.ts
Route: `/employee/hr/compliance/i9`

Per 12-us-employment-compliance.md:

Table: employeeName, hireDate, status (pending/verified/expired/reverify_needed), expirationDate
Filters: Status, Hire date range

I-9 requirements:
- Section 1 (employee) completed by Day 1
- Section 2 (employer) completed by Day 3

Actions: View Details, Request Documents, Mark Verified

### 21. Immigration Tracking (CREATE if missing)
File: immigration-list.screen.ts
Route: `/employee/hr/compliance/immigration`

Work authorization tracking:
- Table: employeeName, visaType, expirationDate, status, daysRemaining
- Color coding: 🟢 >180 days, 🟡 90-180, 🟠 30-90, 🔴 <30, ⚫ expired
- Filters: Visa type, Status

Actions: View Case, Start Renewal, Add Note

---

## Pod/Team Screens (HR also manages pod setup):

### 22. Pods List (UPDATE existing)
File: pod-list.screen.ts
Route: `/employee/hr/pods`
Status: EXISTS - Verify

Grid by type: Recruiting, Bench Sales, TA
Pod cards: name, type, manager, members count, status

Actions: View Details (HR can view but not edit - Admin only)

### 23. Pod Detail (HR View)
File: pod-detail.screen.ts (HR version)
Route: `/employee/hr/pods/[id]`
Status: EXISTS - Verify

Read-only view for HR:
- Pod info
- Team members (for HR processing)
- No edit capability (Admin only)

---

## Reporting Screens:

### 24. HR Reports (UPDATE existing)
File: reports.screen.ts
Route: `/employee/hr/reports`
Status: EXISTS - Verify

Report categories:
- **Headcount Reports**: By department, By location, By employment type
- **Turnover Reports**: Voluntary/involuntary, By reason, By department
- **Compensation Reports**: Salary ranges, Equity analysis
- **Benefits Reports**: Enrollment rates, Cost analysis
- **Compliance Reports**: I-9 audit, Work authorization, Training

Report builder:
- Select report type
- Date range
- Grouping
- Filters
- Export (PDF, Excel)

Scheduled reports configuration

---

## Org Chart:

### 25. Org Chart (CREATE if missing)
File: org-chart.screen.ts
Route: `/employee/hr/org-chart`

Hierarchical org visualization:
- Tree view with reporting lines
- Expand/collapse nodes
- Employee cards (photo, name, title)
- Click → Employee detail
- Search within org chart
- Export org chart (image/PDF)

---

## HR Activities:

### 26. HR Activities Queue (CREATE if missing)
File: hr-activities.screen.ts
Route: `/employee/hr/activities`

HR-specific activity patterns:
- Onboard employee
- Process I-9
- Verify work authorization
- Enroll in benefits
- Review timesheet
- Approve PTO
- Conduct exit interview
- Performance review follow-up

Use Phase 2 ActivityQueue with HR patterns

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const hrScreenName: ScreenDefinition = {
  id: 'hr-screen-id',
  type: 'list' | 'detail' | 'dashboard' | 'form',
  title: 'Screen Title',
  icon: 'IconName',

  permission: {
    roles: ['hr_manager', 'admin'],
  },

  dataSource: {
    type: 'query',
    query: { procedure: 'hr.procedure' },
  },

  layout: { /* sections */ },
  actions: [...],
};
```

## Requirements:
- Sensitive data handling (SSN, salary visible only to HR)
- Compliance tracking with alerts
- Audit logging for all employee changes
- Document management integration
- Payroll system integration points
- Benefits provider integration points
- Mobile responsive (HR may work remotely)

## Compliance Considerations:
- I-9 timing requirements (Day 1 / Day 3)
- Work authorization tracking
- Document retention policies
- Privacy (employee data access logging)
- State-specific requirements (tax forms)

## After Screens:
1. Export from src/screens/hr/index.ts
2. Add to hrScreens registry
3. Create routes in src/app/employee/hr/
4. Update navigation config for hr_manager role
