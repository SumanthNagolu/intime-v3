# HR Manager Daily Workflow

This document describes a typical day for an HR Manager, with specific times, actions, and expected system interactions.

---

## Morning Routine (8:00 AM - 10:00 AM)

### 8:00 AM - Login & Dashboard Review

**Step 1: Login**
- User navigates to: `https://app.intime.com/auth/employee`
- User enters email and password
- User clicks "Sign In"
- System redirects to: `/employee/hr/dashboard` (HR Dashboard)
- Time: ~10 seconds

**Step 2: Review HR Dashboard**
- Dashboard loads with HR-specific widgets
- User sees:
  - **Pending Onboarding Tasks** - New hires starting this week
  - **Payroll Status** - Next payroll date, pending approvals
  - **PTO Requests** - Awaiting HR approval
  - **Compliance Alerts** - Expiring I-9s, missing W-4s
  - **Timesheet Approvals** - Pending timesheet count
  - **Benefits Enrollment** - Open enrollment status
- Time: ~30 seconds to scan

**Screen State:**
```
+----------------------------------------------------------+
| HR Dashboard                              [Profile] [⚙]  |
+----------------------------------------------------------+
| Good morning, Sarah! Here's your HR overview             |
+----------------------------------------------------------+
| ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐|
| │ ONBOARDING      │ │ PAYROLL         │ │ PTO REQUESTS││|
| │ 3 Starting Soon │ │ Next: 12/15     │ │ 5 Pending   ││|
| │ 2 Need I-9      │ │ 127 Timesheets  │ │ 2 Urgent    ││|
| └─────────────────┘ └─────────────────┘ └──────────────┘|
| ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐|
| │ COMPLIANCE      │ │ PERFORMANCE     │ │ OPEN ISSUES ││|
| │ 1 I-9 Expiring  │ │ Q4 Reviews: 80% │ │ 2 ER Cases  ││|
| │ All Current ✓   │ │ Due: 12/31      │ │ 1 New       ││|
| └─────────────────┘ └─────────────────┘ └──────────────┘|
+----------------------------------------------------------+
| RECENT ACTIVITY                                           |
| • Michael Johnson - I-9 verified (10 min ago)            |
| • PTO Request: Sarah Chen (15 min ago)                   |
| • Background Check: John Doe - Cleared (1 hour ago)      |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### 8:15 AM - Check Pending Onboarding Tasks

**Step 3: Navigate to Onboarding Queue**
- User clicks "Onboarding" in sidebar
- URL changes to: `/employee/hr/onboarding`
- Onboarding queue loads showing all active onboarding tasks

**Screen State:**
```
+----------------------------------------------------------+
| Onboarding Queue                    [+ New Hire] [⌘K]    |
+----------------------------------------------------------+
| [Search employees...]              [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| Status: [All] [Not Started] [In Progress] [Completed]    |
+----------------------------------------------------------+
| Employee        Start Date   Status            Progress  |
| ─────────────────────────────────────────────────────── |
| Michael Johnson 12/15/24     I-9 Pending      [████░] 75%|
|   • I-9 Verification: ⚠️ URGENT                          |
|   • Background Check: ✓ Cleared                          |
|   • W-4: ✓ Submitted                                     |
|   • Direct Deposit: ✓ Complete                           |
|   [Complete I-9]                                         |
| ─────────────────────────────────────────────────────── |
| Sarah Chen      12/18/24     In Progress      [███░░] 50%|
|   • Background Check: 🔄 In Progress                     |
|   • I-9: ⏳ Not Started                                  |
|   [View Details]                                         |
| ─────────────────────────────────────────────────────── |
| David Park      12/20/24     Not Started      [░░░░░]  0%|
|   [Start Onboarding]                                     |
+----------------------------------------------------------+
```

**Step 4: Review Urgent Items**
- User identifies Michael Johnson needs I-9 completion
- Start date is 12/15 (2 days away) - URGENT
- User clicks "Complete I-9"
- Time: ~2 minutes

---

### 8:30 AM - Process I-9 Verification

**Step 5: Open I-9 Form**
- I-9 modal opens
- Shows Section 1 (employee-completed) and Section 2 (HR verifies documents)

**Screen State:**
```
+----------------------------------------------------------+
| I-9 Employment Eligibility Verification - Michael Johnson|
|                                                      [×] |
+----------------------------------------------------------+
| SECTION 1: EMPLOYEE INFORMATION (Completed by Employee)  |
| ✓ Completed on: 12/13/24                                 |
|                                                          |
| Name: Michael Johnson                                    |
| Citizenship: US Citizen                                  |
| Signature: [Signed electronically]                       |
+----------------------------------------------------------+
| SECTION 2: EMPLOYER REVIEW (Complete by HR)              |
|                                                          |
| Document Verification *                                  |
|                                                          |
| List A (Identity + Work Authorization) OR List B + C     |
|                                                          |
| Selected List A Document:                                |
| [US Passport                                       ▼]    |
|                                                          |
| Document Details:                                        |
| Document Number: [N123456789                        ]    |
| Expiration Date: [12/15/2030                       📅]   |
|                                                          |
| ☑ I have physically examined the original document       |
| ☑ Document appears genuine and relates to employee       |
|                                                          |
| Document Scan:                                           |
| [passport_scan.pdf] ✓ Uploaded                          |
|                                                          |
| Verification Date: [12/13/2024                     📅]   |
| Verified By: Sarah Martinez (HR Manager)                 |
|                                                          |
| Additional Notes (Optional):                             |
| [Document verified, passport valid until 2030        ]   |
|                                                          |
+----------------------------------------------------------+
|                          [Cancel]  [Submit I-9 ✓]       |
+----------------------------------------------------------+
```

**Step 6: Enter I-9 Details**
- User selects document type: US Passport
- Enters passport number
- Enters expiration date
- Checks verification boxes
- Uploads document scan
- Clicks "Submit I-9"

**System Response:**
- I-9 record saved with timestamp
- Status updated to "Verified"
- Compliance record created
- Toast: "I-9 verified for Michael Johnson"
- Onboarding progress updates to 100%

**Time:** ~5 minutes

---

### 8:45 AM - Review Background Check Results

**Step 7: Check Background Checks**
- User returns to onboarding queue
- Clicks "View Details" for Sarah Chen
- Background check tab shows status: "In Progress"

**Screen State:**
```
+----------------------------------------------------------+
| Sarah Chen - Onboarding Details              [×]         |
+----------------------------------------------------------+
| [Overview] [I-9] [Background Check] [Tax Forms] [Payroll]|
+----------------------------------------------------------+
| BACKGROUND CHECK STATUS                                   |
|                                                          |
| Provider: Checkr                                         |
| Ordered: 12/10/24                                        |
| Status: 🔄 IN PROGRESS                                   |
| ETA: 12/14/24                                            |
|                                                          |
| Searches Included:                                       |
| ✓ Criminal Record (County, State, Federal)               |
| ✓ Sex Offender Registry                                  |
| 🔄 Employment Verification (Pending)                     |
| 🔄 Education Verification (Pending)                      |
|                                                          |
| [View Checkr Report] [Refresh Status] [Contact Checkr]   |
+----------------------------------------------------------+
```

**User Action:** Click "Refresh Status"

**System Response:**
- API call to Checkr
- Status updates: "✓ CLEARED"
- All searches show green checkmarks
- Toast: "Background check cleared for Sarah Chen"

**Time:** ~2 minutes

---

### 9:00 AM - Handle Employee Questions

**Step 8: Check Messages**
- User clicks Slack/email icon
- Employee question: "How do I update my W-4?"

**Step 9: Send Response**
- User responds with link to: `/employee/profile/tax-forms`
- User explains steps to update W-4
- Logs interaction in employee notes

**Time:** ~5 minutes

---

## Mid-Morning (10:00 AM - 12:00 PM)

### 10:00 AM - Review PTO Requests

**Step 10: Navigate to PTO Requests**
- User clicks "Time & Attendance" in sidebar
- Clicks "PTO Requests" tab
- URL: `/employee/hr/time/pto-requests`

**Screen State:**
```
+----------------------------------------------------------+
| PTO Requests                          [Calendar] [⌘K]    |
+----------------------------------------------------------+
| [Search...]                    [Filter ▼] [Pending ▼]    |
+----------------------------------------------------------+
| Employee      Type      Start      End       Days  Status|
| ─────────────────────────────────────────────────────── |
| Sarah Chen    Vacation  12/20/24   12/27/24   6   Pending|
|   Reason: Year-end holiday trip                          |
|   Balance: 12 days available                             |
|   Manager: Approved ✓                                    |
|   [Approve] [Deny]                                       |
| ─────────────────────────────────────────────────────── |
| John Doe      Sick      12/13/24   12/13/24    1   Pending|
|   Reason: Doctor appointment                             |
|   Balance: 5 days available                              |
|   Manager: Not yet reviewed                              |
|   [Approve] [Deny]                                       |
+----------------------------------------------------------+
```

**Step 11: Approve PTO Request**
- User reviews Sarah Chen's request
- Checks: Manager approved, sufficient balance
- User clicks "Approve"

**System Response:**
- PTO balance deducted: 12 - 6 = 6 days remaining
- Status updated to "Approved"
- Email notification sent to Sarah Chen
- Calendar event created
- Toast: "PTO request approved for Sarah Chen"

**Step 12: Handle Pending Manager Approval**
- John Doe's request needs manager approval first
- User sends reminder to manager
- User sets status to "Awaiting Manager Approval"

**Time:** ~5 minutes per request

---

### 11:00 AM - Process New Hire Paperwork

**Step 13: Navigate to Onboarding for New Hire**
- User clicks "Onboarding Queue"
- Clicks "Start Onboarding" for David Park
- Onboarding wizard opens

**Screen State:**
```
+----------------------------------------------------------+
| Start Onboarding - David Park                       [×] |
+----------------------------------------------------------+
| Step 1 of 5: Basic Information                           |
|                                                          |
| Employee Name *                                          |
| [David Park                                        ]     |
|                                                          |
| Email *                                                  |
| [david.park@intime.com                             ]     |
|                                                          |
| Start Date *                                             |
| [12/20/2024                                       📅]    |
|                                                          |
| Position *                                               |
| [Senior Recruiter                                  ▼]    |
|                                                          |
| Department *                                             |
| [Recruiting                                        ▼]    |
|                                                          |
| Employment Type *                                        |
| ● Full-Time  ○ Part-Time  ○ Contract  ○ Temp           |
|                                                          |
| Pay Rate *                                               |
| $[75,000      ] /year                                    |
|                                                          |
+----------------------------------------------------------+
|                           [Cancel]  [Next: Tasks →]     |
+----------------------------------------------------------+
```

**Step 14: Fill Employee Details**
- User enters/confirms all fields
- Clicks "Next: Tasks"
- System auto-generates onboarding checklist

**System Response:**
- Creates 8-task onboarding checklist:
  1. Send welcome email
  2. I-9 verification
  3. W-4 collection
  4. State tax forms
  5. Background check
  6. Direct deposit setup
  7. Benefits enrollment
  8. IT equipment request

**Time:** ~10 minutes

---

## Afternoon (12:00 PM - 3:00 PM)

### 1:00 PM - Payroll Preparation (Bi-weekly)

**Step 15: Navigate to Payroll**
- User clicks "Payroll" in sidebar
- URL: `/employee/hr/payroll`
- Shows upcoming payroll run

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Dashboard                      [+ New Run] [⌘K]  |
+----------------------------------------------------------+
| NEXT PAYROLL RUN: Pay Period 12/01 - 12/14               |
| Pay Date: 12/15/24 (2 days)                              |
| Status: 🔄 IN REVIEW                                     |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ Employees: 127                                     │ |
| │ Total Gross: $324,500.00                           │ |
| │ Total Deductions: $97,350.00                       │ |
| │ Total Net Pay: $227,150.00                         │ |
| │                                                    │ |
| │ Timesheets: 127 submitted, 0 pending               │ |
| │ Exceptions: 2 overtime, 1 adjustment               │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| [Review Timesheets] [Review Exceptions] [Approve Run]    |
+----------------------------------------------------------+
| RECENT PAYROLL RUNS                                      |
| • Pay Period 11/17 - 11/30: Processed ✓                 |
| • Pay Period 11/03 - 11/16: Processed ✓                 |
+----------------------------------------------------------+
```

**Step 16: Review Timesheets**
- User clicks "Review Timesheets"
- Shows all submitted timesheets

**Screen State:**
```
+----------------------------------------------------------+
| Timesheets - Pay Period 12/01 - 12/14      [Filter ▼]   |
+----------------------------------------------------------+
| Employee        Reg Hrs  OT Hrs  Total   Status          |
| ─────────────────────────────────────────────────────── |
| Sarah Chen      80       0       80      ✓ Approved      |
| Michael Johnson 80       5       85      ⚠️ Overtime     |
| John Doe        72       0       72      ⚠️ Under 80     |
| David Park      80       0       80      ✓ Approved      |
+----------------------------------------------------------+
| [Approve All] [Review Exceptions]                        |
+----------------------------------------------------------+
```

**Step 17: Review Overtime**
- User clicks on Michael Johnson
- Reviews overtime justification
- Manager already approved
- User approves timesheet

**Step 18: Handle Under-Hours**
- User clicks on John Doe
- Sees notes: "Took 1 day sick leave (8 hours)"
- Verifies PTO was used
- Approves timesheet

**Time:** ~30 minutes for 127 timesheets

---

### 2:00 PM - Performance Review Scheduling

**Step 19: Navigate to Performance Reviews**
- User clicks "Performance Reviews" in sidebar
- URL: `/employee/hr/performance`

**Screen State:**
```
+----------------------------------------------------------+
| Performance Reviews                   [+ New Cycle] [⌘K] |
+----------------------------------------------------------+
| CURRENT CYCLE: Q4 2024 (Oct - Dec)                       |
| Due Date: 12/31/24                                       |
| Progress: 102 of 127 completed (80%)                     |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ STATUS BREAKDOWN                                   │ |
| │ ✓ Completed: 102 (80%)                             │ |
| │ 🔄 In Progress: 15 (12%)                           │ |
| │ ⏳ Not Started: 10 (8%)                            │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| NOT STARTED (10)                                         |
| • Sarah Chen (Recruiter) - Assigned to: Mike Rodriguez  |
|   [Send Reminder]                                        |
| • John Doe (Sales) - Assigned to: Lisa Wang             |
|   [Send Reminder]                                        |
|                                                          |
| [Send Bulk Reminder] [View All] [Generate Report]       |
+----------------------------------------------------------+
```

**Step 20: Send Reminder**
- User clicks "Send Bulk Reminder"
- Email sent to all managers with incomplete reviews
- Due date reminder: 12/31/24 (2 weeks away)

**Time:** ~5 minutes

---

### 2:30 PM - Benefits Enrollment Follow-up

**Step 21: Check Benefits Enrollment**
- User clicks "Benefits" in sidebar
- Reviews open enrollment status

**Screen State:**
```
+----------------------------------------------------------+
| Benefits Administration              [Manage Plans] [⌘K] |
+----------------------------------------------------------+
| OPEN ENROLLMENT: 11/01/24 - 12/31/24                     |
| Enrollment Rate: 114 of 127 (89.8%)                      |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ PLAN SUMMARY                                       │ |
| │ Health Insurance: 105 enrolled                     │ |
| │ Dental: 98 enrolled                                │ |
| │ Vision: 87 enrolled                                │ |
| │ 401(k): 114 enrolled                               │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| NOT ENROLLED (13)                                        |
| • Michael Johnson - New Hire (starts 12/15)             |
| • Sarah Lee - Waived (spouse coverage)                   |
| • 11 others - [View List]                               |
|                                                          |
| [Send Enrollment Reminder] [View Waivers] [Export]      |
+----------------------------------------------------------+
```

**Step 22: Follow Up with Non-Enrolled**
- User reviews list of 13 not enrolled
- Sends reminder email to those who haven't responded
- Verifies waivers are documented

**Time:** ~10 minutes

---

## Late Afternoon (3:00 PM - 5:00 PM)

### 3:00 PM - Compliance Reporting

**Step 23: Navigate to Compliance Center**
- User clicks "Compliance" in sidebar
- URL: `/employee/hr/compliance`

**Screen State:**
```
+----------------------------------------------------------+
| Compliance Center                     [Run Audit] [⌘K]   |
+----------------------------------------------------------+
| COMPLIANCE STATUS: ✓ ALL CURRENT                         |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ I-9 COMPLIANCE                                     │ |
| │ ✓ All employees have I-9 on file                   │ |
| │ ⚠️ 1 I-9 expiring in 30 days (Sarah Chen)          │ |
| │ Next Re-verification Due: 01/15/25                 │ |
| │ [View Details]                                     │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ TAX FORMS (W-4, State)                             │ |
| │ ✓ 127 of 127 W-4s on file                          │ |
| │ ✓ 127 of 127 State tax forms                       │ |
| │ [View Forms]                                       │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ BACKGROUND CHECKS                                  │ |
| │ ✓ 127 of 127 completed                             │ |
| │ Average Time: 4.2 days                             │ |
| │ [View Reports]                                     │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| [Generate Compliance Report] [Schedule Audit]            |
+----------------------------------------------------------+
```

**Step 24: Handle Expiring I-9**
- User clicks "View Details" for I-9 compliance
- Sees Sarah Chen's I-9 expires 01/15/25
- Creates task: "Re-verify I-9 for Sarah Chen"
- Assigns to self, due date: 01/10/25

**Time:** ~10 minutes

---

### 3:30 PM - Generate HR Reports

**Step 25: Navigate to Reports**
- User clicks "Reports" in sidebar
- URL: `/employee/hr/reports`

**Screen State:**
```
+----------------------------------------------------------+
| HR Reports                          [+ New Report] [⌘K]  |
+----------------------------------------------------------+
| REPORT TEMPLATES                                         |
|                                                          |
| Compliance:                                              |
| • I-9 Compliance Report                                  |
| • Tax Form Status Report                                 |
| • Background Check Summary                               |
|                                                          |
| Workforce:                                               |
| • Headcount Report                                       |
| • Turnover Analysis                                      |
| • Time to Hire                                           |
| • Demographics Report                                    |
|                                                          |
| Payroll:                                                 |
| • Payroll Summary by Period                              |
| • Overtime Analysis                                      |
| • PTO Accrual Report                                     |
|                                                          |
| Performance:                                             |
| • Performance Review Status                              |
| • Goal Completion Rate                                   |
| • PIP Summary                                            |
|                                                          |
| [Run Selected] [Schedule Report]                         |
+----------------------------------------------------------+
```

**Step 26: Generate Turnover Report**
- User selects "Turnover Analysis"
- Sets date range: 01/01/24 - 12/13/24
- Clicks "Run Selected"

**System Response:**
- Report generates showing:
  - Total employees: 127
  - Voluntary terminations: 8 (6.3%)
  - Involuntary terminations: 3 (2.4%)
  - Total turnover: 8.7%
  - Industry benchmark: 12%
  - Status: Below industry average ✓

**Time:** ~5 minutes per report

---

### 4:00 PM - Employee Check-Ins

**Step 27: Scheduled 1-on-1**
- User has scheduled 1-on-1 with new hire (Michael Johnson)
- Zoom/in-person meeting
- Discusses:
  - How's onboarding going?
  - Any issues with benefits, payroll?
  - Questions about policies?
  - Feedback on first week

**Time:** ~30 minutes

---

### 4:30 PM - Plan Tomorrow

**Step 28: Review Tomorrow's Tasks**
- User opens "Tasks" view
- Sees upcoming:
  - Payroll approval deadline: 12/15 (tomorrow)
  - New hire starts: Michael Johnson (12/15)
  - Performance review reminders
  - PTO approval needed

**Step 29: Create Tasks**
- User creates task: "Approve payroll run by 10 AM"
- User creates task: "Welcome call with Michael Johnson at 9 AM"
- User creates task: "Follow up on 2 pending PTO requests"

**Time:** ~10 minutes

---

### 5:00 PM - End of Day

**Step 30: Logout**
- User clicks profile menu
- Clicks "Sign Out"
- Session ends
- Redirect to login page

---

## Daily Activity Summary

By end of day, a typical HR Manager should have completed:

| Activity Type | Target Count |
|---------------|--------------|
| I-9 Verifications | 1-3 |
| Background Check Reviews | 2-5 |
| PTO Request Approvals | 5-10 |
| Timesheet Approvals | 50-150 (bi-weekly) |
| Employee Questions | 5-15 |
| Compliance Checks | 1-2 |
| Onboarding Tasks | 3-10 |
| Reports Generated | 1-3 |

---

## Weekly Patterns

| Day | Focus |
|-----|-------|
| Monday | Onboarding queue, PTO requests, employee questions |
| Tuesday | Performance reviews, benefits follow-ups |
| Wednesday | Compliance audits, reporting |
| Thursday | Payroll preparation (bi-weekly), timesheet review |
| Friday | Payroll approval, planning, 1-on-1s |

---

## Monthly Patterns

| Week | Focus |
|------|-------|
| Week 1 | Benefits administration, open enrollment |
| Week 2 | Payroll processing, compliance reporting |
| Week 3 | Performance review cycle coordination |
| Week 4 | Month-end reports, planning next month |

---

## Quarterly Patterns

| Month | Focus |
|-------|-------|
| Q1 (Jan-Mar) | Performance reviews (Q4 prior year), tax season prep |
| Q2 (Apr-Jun) | Benefits planning, summer PTO management |
| Q3 (Jul-Sep) | Mid-year reviews, benefits renewals |
| Q4 (Oct-Dec) | Open enrollment, year-end compliance, performance review cycle |

---

## Common Blockers & Escalation

| Blocker | Escalation Path |
|---------|-----------------|
| Background check delayed | Contact provider, extend start date if needed |
| Employee missing I-9 docs | Send reminder, schedule in-person verification |
| Payroll error | Contact payroll provider immediately, notify Finance |
| Compliance issue | Escalate to Legal, document thoroughly |
| Benefits enrollment issue | Contact benefits provider, assist employee |
| Performance review not completed | Escalate to manager's manager, notify CEO |

---

## Emergency Scenarios

### Scenario 1: Employee No-Show on Day 1
**Actions:**
1. Contact employee via phone, email, text
2. Wait 2 hours for response
3. If no response, mark as "No-Show"
4. Notify manager and recruiter
5. Cancel onboarding tasks
6. Document in employee file

### Scenario 2: Payroll Processing Error
**Actions:**
1. Identify affected employees
2. Calculate correct amounts
3. Issue corrected payments ASAP
4. Send apology email with explanation
5. Document error and prevention steps
6. Notify Finance and CEO

### Scenario 3: Compliance Audit Notice
**Actions:**
1. Gather all requested documents
2. Run compliance reports
3. Identify any gaps
4. Fix issues immediately
5. Prepare audit response
6. Notify Legal and CEO

---

*Last Updated: 2024-11-30*
