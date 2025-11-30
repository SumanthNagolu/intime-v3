# HR Manager Role - Complete Specification

## Role Overview

The **HR Manager** is responsible for all internal human resources operations at the staffing company. Unlike Technical Recruiters (who place candidates at clients) and Bench Sales (who market consultants), HR Managers handle employee lifecycle management, compliance, payroll, benefits, and internal talent acquisition for the company itself.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `hr_manager` |
| Role Type | Manager / Individual Contributor Hybrid |
| Reports To | CEO / VP of HR |
| Primary Entities | Employees, Payroll, Benefits, Compliance, Onboarding |
| RCAI Default | Accountable (A) for HR compliance and employee management |
| Key Focus | Internal operations, not client placements |

---

## Key Responsibilities

1. **Employee Onboarding** - Manage I-9, background checks, W-4, direct deposit for new hires (both internal and placed consultants)
2. **Payroll Management** - Process bi-weekly payroll, verify timesheets, handle deductions, generate pay stubs
3. **Benefits Administration** - Manage health insurance, 401k, PTO, and other employee benefits
4. **Compliance** - Ensure company adheres to federal/state labor laws, maintain records, audit readiness
5. **Performance Management** - Coordinate performance review cycles, track goals, manage PIPs
6. **Time & Attendance** - Approve timesheets, manage PTO requests, track attendance
7. **Internal Talent Acquisition** - Hire internal staff (recruiters, salespeople, operations) - different from client placements
8. **Employee Relations** - Handle complaints, mediate conflicts, conduct exit interviews
9. **Reporting** - Generate HR metrics (retention, turnover, time-to-hire, compliance rate)

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Employee Retention | >85% | Annual |
| Time to Onboard | <7 days | Per new hire |
| Payroll Accuracy | 99.5% | Per pay period |
| Compliance Rate | 100% | Ongoing |
| PTO Request Response | <24 hours | Per request |
| Benefits Enrollment | >90% | Annual enrollment period |
| Performance Review Completion | 100% | Per cycle (quarterly) |
| Background Check Completion | 100% before start date | Per hire |
| I-9 Compliance | 100% | Ongoing |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review pending onboarding tasks
2. Process I-9 and background check results
3. Check PTO requests and approve/deny
4. Review employee questions via Slack/email

### Mid-Morning (10:00 AM - 12:00 PM)
1. Handle employee relations issues
2. Process new hire paperwork
3. Update employee records
4. Benefits enrollment follow-ups

### Afternoon (12:00 PM - 3:00 PM)
1. Payroll preparation (on payroll weeks)
2. Timesheet review and approval
3. Compliance audits and documentation
4. Performance review scheduling

### Late Afternoon (3:00 PM - 5:00 PM)
1. Policy updates and training
2. Generate HR reports for leadership
3. Plan next day priorities
4. Employee check-ins (1-on-1s)

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Employees (Internal) | ✅ | ✅ All | ✅ All | ❌ | Full employee data access |
| Payroll Runs | ✅ | ✅ All | ✅ Own | ❌ | Create and approve payroll |
| Timesheets | ❌ | ✅ All | ✅ Approve | ❌ | Approve but not create |
| PTO Requests | ❌ | ✅ All | ✅ Approve | ❌ | Approve employee requests |
| Benefits | ✅ | ✅ All | ✅ All | ✅ Admin | Manage benefits packages |
| Performance Reviews | ✅ | ✅ All | ✅ All | ❌ | Coordinate review cycles |
| Compliance Docs | ✅ | ✅ All | ✅ All | ❌ | I-9, W-4, etc. |
| Onboarding Tasks | ✅ | ✅ All | ✅ All | ✅ Own | Manage onboarding checklists |
| Job Postings (Internal) | ✅ | ✅ All | ✅ All | ✅ Own | Post internal positions |
| Placements (Placed Consultants) | ❌ | ✅ All | ✅ Onboarding Only | ❌ | Read-only except onboarding |
| Candidates (External) | ❌ | ✅ Limited | ❌ | ❌ | View only for onboarding |
| Accounts (Clients) | ❌ | ✅ All | ❌ | ❌ | Read-only for context |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Payroll Dashboard | ✅ Full |
| Employee Directory | ✅ Full (including salary data) |
| Benefits Admin Portal | ✅ Full |
| Compliance Reports | ✅ Full |
| Time & Attendance | ✅ Approve/Reject |
| Performance Reviews | ✅ Coordinate & View |
| Onboarding Workflows | ✅ Full |
| Internal Job Postings | ✅ Full |
| Employee Relations Cases | ✅ Full |
| Org Chart | ✅ Full |
| Salary & Compensation | ✅ Full (View & Edit) |
| System Settings | ❌ No (Admin only) |
| Client-Facing Recruiting | ❌ No (Recruiter role) |
| Bench Sales | ❌ No (Bench Sales role) |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| New Employee Onboarding | HR Manager | HR Manager | - | CEO, Direct Manager |
| Payroll Processing | HR Manager | HR Manager | - | Finance, CEO |
| Performance Review Cycle | Managers | HR Manager | Employees | CEO |
| Benefits Enrollment | HR Manager | HR Manager | Benefits Provider | All Employees |
| Compliance Audit | HR Manager | HR Manager | Legal | CEO |
| PTO Request Approval | HR Manager | Direct Manager | - | Employee |
| Placement Onboarding (Consultants) | HR Manager | Recruiter | Client | CEO |
| Employee Termination | HR Manager | CEO | Legal | Direct Manager |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Dashboard / HR Home
- ✅ Employee Directory
- ✅ Onboarding Queue
- ✅ Payroll
- ✅ Time & Attendance
- ✅ Benefits
- ✅ Performance Reviews
- ✅ Compliance Center
- ✅ Reports
- ✅ Org Chart
- ❌ Jobs (Client jobs - Recruiter only)
- ❌ Candidates (External - Recruiter only)
- ❌ Bench Consultants (Bench Sales only)
- ❌ Accounts (Limited read access)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g h` | Go to HR Dashboard |
| `g e` | Go to Employee Directory |
| `g o` | Go to Onboarding Queue |
| `g p` | Go to Payroll |
| `g t` | Go to Time & Attendance |
| `n` | New entity (context-aware) |
| `e` | Edit current entity |
| `a` | Approve (timesheets, PTO) |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Employee Onboarding | [02-employee-onboarding.md](./02-employee-onboarding.md) | High |
| Payroll Management | [03-payroll-management.md](./03-payroll-management.md) | Critical |
| Performance Reviews | [04-performance-reviews.md](./04-performance-reviews.md) | High |
| Time & Attendance | [05-time-and-attendance.md](./05-time-and-attendance.md) | High |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| HR Dashboard | `/employee/hr/dashboard` | Full |
| Employee Directory | `/employee/hr/people` | Full |
| Onboarding Queue | `/employee/hr/onboarding` | Full |
| Payroll Dashboard | `/employee/hr/payroll` | Full |
| Payroll Run Detail | `/employee/hr/payroll/runs/[id]` | Full |
| Time & Attendance | `/employee/hr/time` | Approve |
| Timesheet Detail | `/employee/hr/time/[id]` | Approve |
| Benefits Admin | `/employee/hr/benefits` | Full |
| Performance Reviews | `/employee/hr/performance` | Coordinate |
| Compliance Center | `/employee/hr/compliance` | Full |
| Org Chart | `/employee/hr/org-chart` | Full |
| Employee Detail | `/employee/hr/people/[id]` | Full |
| Reports | `/employee/hr/reports` | Full |

---

## Distinction from Other Roles

### HR Manager vs. Technical Recruiter

| Aspect | HR Manager | Technical Recruiter |
|--------|------------|-------------------|
| Focus | Internal employees | External candidate placements |
| Clients | Company itself | External client companies |
| Goal | Employee retention, compliance | Client placements, revenue |
| Entities | Employees, Payroll, Benefits | Jobs, Candidates, Submissions |
| Metrics | Retention, compliance | Placements, submissions |
| Commission | No (salaried) | Yes (placement-based) |

### HR Manager vs. Bench Sales

| Aspect | HR Manager | Bench Sales |
|--------|------------|-------------|
| Focus | Employee operations | Marketing available consultants |
| Goal | Compliance, onboarding | Place bench consultants |
| Entities | Employees, Payroll | Bench Consultants, Hotlists |
| Clients | Internal | External clients |
| Revenue | Overhead role | Revenue generator |

### HR Manager vs. TA (Talent Acquisition)

| Aspect | HR Manager | TA (Talent Acquisition) |
|--------|------------|------------------------|
| Focus | Post-hire operations | Hiring for clients |
| Goal | Onboarding, compliance | Fill client positions |
| Hiring Type | Internal staff (recruiters, ops) | Client employees |
| Process | Full HR lifecycle | Pre-hire only |
| Overlap | Internal TA | External TA |

---

## Training Requirements

Before using the system, a new HR Manager should complete:

1. **System Orientation** (1 hour)
   - Navigation and UI overview
   - HR-specific features
   - Compliance requirements

2. **Payroll Training** (3 hours)
   - Payroll run process
   - Timesheet approval
   - Deductions and taxes
   - Direct deposit setup

3. **Onboarding Training** (2 hours)
   - I-9 verification
   - Background checks
   - New hire paperwork
   - Onboarding checklists

4. **Benefits Administration** (2 hours)
   - Benefits packages
   - Enrollment process
   - Provider integration
   - Compliance (ACA, COBRA)

5. **Compliance Training** (3 hours)
   - Federal/state labor laws
   - Record retention
   - Audit preparation
   - Reporting requirements

6. **Performance Management** (1 hour)
   - Review cycles
   - Goal setting
   - PIPs (Performance Improvement Plans)
   - Documentation

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Can't approve payroll | Check if you have `payroll.approve` permission. Contact Admin. |
| Timesheet not showing | Ensure employee submitted timesheet. Check date range filters. |
| I-9 verification failed | Contact employee for correct documents. Update form with new docs. |
| PTO balance incorrect | Review PTO accrual settings. Manually adjust if needed. |
| Background check delayed | Follow up with provider. Extend start date if needed. |
| Missing employee data | Import from HRIS or manually enter. Ensure all required fields filled. |

---

## Key Integrations

| System | Purpose | Direction |
|--------|---------|-----------|
| ADP / Gusto / Paychex | Payroll Processing | Bidirectional |
| Checkr / Sterling | Background Checks | Outbound |
| E-Verify | I-9 Verification | Outbound |
| UltiPro / BambooHR | HRIS | Bidirectional |
| Anthem / UHC | Benefits Providers | Outbound |
| IRS / State Agencies | Tax Filing | Outbound |
| DocuSign | Electronic Signatures | Bidirectional |

---

*Last Updated: 2024-11-30*
