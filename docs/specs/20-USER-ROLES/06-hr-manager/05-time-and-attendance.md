# Use Case: Time & Attendance Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-HR-004 |
| Actor | HR Manager |
| Goal | Manage employee time tracking: approve timesheets, handle PTO requests, track attendance |
| Frequency | Daily (PTO) + Bi-weekly (Timesheets) |
| Estimated Time | 30-60 minutes per day |
| Priority | High (Payroll Dependency) |

---

## Preconditions

1. User is logged in as HR Manager
2. User has "time_attendance.approve" permission
3. Employees are submitting timesheets and PTO requests
4. Timesheet submission deadlines are configured
5. PTO policies are defined (accrual rates, balances)

---

## Trigger

One of the following:
- Employee submits PTO request → HR receives notification
- Pay period ends → Timesheets need approval for payroll
- Daily review of attendance records
- System notification: "5 PTO requests pending"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Time & Attendance

**User Action:** Click "Time & Attendance" in sidebar

**System Response:**
- Sidebar highlights "Time & Attendance"
- URL changes to: `/employee/hr/time`
- Time & Attendance dashboard loads

**Screen State:**
```
+----------------------------------------------------------+
| Time & Attendance                      [Calendar] [⌘K]   |
+----------------------------------------------------------+
| [Timesheets] [PTO Requests] [Attendance] [Reports]       |
+----------------------------------------------------------+
| TODAY'S OVERVIEW - Friday, December 13, 2024             |
|                                                          |
| ┌────────────────┐ ┌────────────────┐ ┌───────────────┐|
| │ PENDING PTO    │ │ TIMESHEETS     │ │ ATTENDANCE    ││|
| │ 5 Requests     │ │ 3 Need Review  │ │ 2 Absences    ││|
| │ ⚠️ 2 Urgent    │ │ Due: 12/14     │ │ 1 Tardy       ││|
| └────────────────┘ └────────────────┘ └───────────────┘|
|                                                          |
| RECENT ACTIVITY                                          |
| • Sarah Chen - PTO Request: 12/20-12/27 (Pending)       |
| • John Doe - Timesheet Submitted (Needs Approval)       |
| • Lisa Martinez - Late Clock-In: 9:15 AM (Noted)        |
|                                                          |
| [Review PTO Requests] [Approve Timesheets] [View All]   |
+----------------------------------------------------------+
| UPCOMING TIME OFF                                        |
| Next 7 Days:                                             |
| • 12/16: 3 employees out                                |
| • 12/20: 8 employees out (holiday prep)                 |
| • 12/23-12/25: 45 employees out (Christmas)             |
|                                                          |
| [View Calendar]                                          |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review PTO Requests

**User Action:** Click "PTO Requests" tab

**System Response:**
- PTO requests view loads
- Shows all pending requests

**Screen State:**
```
+----------------------------------------------------------+
| PTO Requests                          [+ New] [Export]   |
+----------------------------------------------------------+
| [Search employees...]      [Filter ▼] [Pending ▼] [✓]   |
+----------------------------------------------------------+
| Status: [All] [Pending (5)] [Approved] [Denied] [Past]  |
+----------------------------------------------------------+
| Employee      Type      Start      End        Days Status|
| ─────────────────────────────────────────────────────── |
| Sarah Chen    Vacation  12/20/24   12/27/24    6   ⚠️ Urgent|
|   Request Date: 12/10/24                                |
|   Reason: "Year-end family trip to Hawaii"              |
|   Balance: 12 days available (After: 6 days)            |
|   Manager: ✓ Approved by Mike Rodriguez (12/11)         |
|   Conflicts: None                                        |
|   [View Details] [Approve] [Deny]                       |
| ─────────────────────────────────────────────────────── |
| John Doe      Sick      12/13/24   12/13/24    1   Pending|
|   Request Date: 12/13/24 8:30 AM (Today!)               |
|   Reason: "Doctor appointment"                          |
|   Balance: 5 days available (After: 4 days)             |
|   Manager: ⏳ Pending approval                          |
|   Conflicts: None                                        |
|   [View Details] [Approve] [Deny]                       |
| ─────────────────────────────────────────────────────── |
| Emily Rodrig  Personal  12/16/24   12/17/24    2   Pending|
|   Request Date: 12/12/24                                |
|   Reason: "Personal matters"                            |
|   Balance: 3 days available (After: 1 day)              |
|   Manager: ✓ Approved by Lisa Wang (12/13)              |
|   Conflicts: ⚠️ 3 other employees out same days         |
|   [View Details] [Approve] [Deny]                       |
| ─────────────────────────────────────────────────────── |
| [Approve All] [Bulk Actions ▼]                          |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Review PTO Request Detail

**User Action:** Click "View Details" for Sarah Chen

**System Response:**
- PTO request detail modal opens

**Screen State:**
```
+----------------------------------------------------------+
| PTO Request - Sarah Chen                        [×]      |
+----------------------------------------------------------+
| Request ID: PTO-2024-1210-001                            |
| Submitted: 12/10/2024 2:30 PM                            |
| Status: ⚠️ PENDING HR APPROVAL                           |
+----------------------------------------------------------+
| EMPLOYEE INFORMATION                                     |
| Name: Sarah Chen (EMP-2024-127)                          |
| Position: Senior Recruiter                               |
| Department: Recruiting                                   |
| Manager: Mike Rodriguez                                  |
| Hire Date: 10/15/2024 (2 months employed)               |
+----------------------------------------------------------+
| TIME OFF REQUEST                                         |
| Type: Vacation                                           |
| Start Date: Thursday, 12/20/2024                         |
| End Date: Friday, 12/27/2024                             |
| Total Days: 6 business days                              |
| Return Date: Monday, 12/30/2024                          |
|                                                          |
| Reason:                                                  |
| "Year-end family trip to Hawaii. Tickets already        |
| purchased. Will have limited phone access."              |
+----------------------------------------------------------+
| PTO BALANCE                                              |
| Accrual Rate: 1.25 days/month (15 days/year)            |
| Balance as of 12/01: 10 days                             |
| Accrued in December: +1.25 days                          |
| Used this year: 0 days                                   |
| Current Balance: 12 days                                 |
| Requested: -6 days                                       |
| Balance After Approval: 6 days                           |
|                                                          |
| ✓ Sufficient balance available                          |
+----------------------------------------------------------+
| MANAGER APPROVAL                                         |
| Status: ✓ APPROVED                                       |
| Approved By: Mike Rodriguez (Manager)                    |
| Date: 12/11/2024 10:15 AM                                |
| Manager Notes: "Approved - good timing before year-end" |
+----------------------------------------------------------+
| CONFLICT CHECK                                           |
| Team Coverage:                                           |
| ✓ No conflicts with other recruiters' PTO               |
| ✓ Mike Rodriguez (Manager) will be in office            |
| ✓ 8 of 10 recruiting team members available             |
|                                                          |
| Blackout Dates:                                          |
| ⚠️ 12/23-12/27 are near company holidays                |
| Note: Company closed 12/25 (Christmas)                   |
+----------------------------------------------------------+
| HR DECISION                                              |
| ☐ Approve                                               |
| ☐ Approve with conditions                               |
| ☐ Deny                                                  |
|                                                          |
| HR Notes (optional):                                     |
| [Approved - manager approved, sufficient balance     ]   |
|                                               ] 0/500    |
|                                                          |
| ☑ Send confirmation email to employee                   |
| ☑ Add to team calendar                                  |
| ☑ Deduct PTO balance                                    |
+----------------------------------------------------------+
|                    [Deny Request]  [Approve Request ✓]   |
+----------------------------------------------------------+
```

**User Action:** Review details, click "Approve Request"

**System Response:**

1. **Update PTO Request:**
   ```sql
   UPDATE pto_requests
   SET status = 'approved',
       approved_by_hr = current_user_id,
       approved_by_hr_at = NOW(),
       hr_notes = 'Approved - manager approved, sufficient balance'
   WHERE id = 'PTO-2024-1210-001';
   ```

2. **Deduct PTO Balance:**
   ```sql
   UPDATE pto_balances
   SET balance = balance - 6,
       last_used_date = '2024-12-20',
       updated_at = NOW()
   WHERE employee_id = sarah_chen_id
     AND pto_type = 'vacation';
   ```

3. **Create Calendar Events:**
   ```typescript
   // Create calendar event for Sarah (6 days off)
   await createCalendarEvent({
     title: 'Sarah Chen - Vacation',
     start: '2024-12-20',
     end: '2024-12-27',
     allDay: true,
     type: 'pto',
     employeeId: sarah_chen_id
   });

   // Add to team calendar
   await addToTeamCalendar({
     teamId: recruiting_team_id,
     event: 'Sarah Chen - Out of Office',
     dates: ['12/20', '12/21', '12/22', '12/23', '12/24', '12/27']
   });
   ```

4. **Send Confirmation Email:**
   ```typescript
   await sendEmail({
     to: 'sarah.chen@intime.com',
     cc: 'mike.rodriguez@intime.com',
     subject: 'PTO Request Approved - 12/20 to 12/27',
     template: 'pto_approved',
     data: {
       employeeName: 'Sarah Chen',
       startDate: '12/20/2024',
       endDate: '12/27/2024',
       totalDays: 6,
       balanceBefore: 12,
       balanceAfter: 6,
       returnDate: '12/30/2024'
     }
   });
   ```

5. **Success Response:**
   - Modal closes
   - Toast: "PTO approved for Sarah Chen - 6 days deducted"
   - PTO requests list updates
   - Calendar updated

**Time:** ~2 minutes

---

### Step 4: Handle Same-Day PTO Request (Urgent)

**User Action:** Click "View Details" for John Doe (same-day request)

**System Response:**
- PTO detail opens, shows urgent status

**Screen State:**
```
+----------------------------------------------------------+
| PTO Request - John Doe                          [×]      |
+----------------------------------------------------------+
| ⚠️ URGENT: Same-day request (12/13/24)                   |
| Request submitted: Today at 8:30 AM                      |
+----------------------------------------------------------+
| EMPLOYEE INFORMATION                                     |
| Name: John Doe (EMP-2024-045)                            |
| Position: Recruiter                                      |
| Manager: Mike Rodriguez                                  |
+----------------------------------------------------------+
| TIME OFF REQUEST                                         |
| Type: Sick Leave                                         |
| Date: Friday, 12/13/2024 (Today)                         |
| Total Days: 1 day                                        |
| Return Date: Monday, 12/16/2024                          |
|                                                          |
| Reason:                                                  |
| "Doctor appointment at 2 PM. Will be unavailable        |
| afternoon."                                              |
+----------------------------------------------------------+
| PTO BALANCE                                              |
| Sick Leave Balance: 5 days                               |
| Requested: -1 day                                        |
| Balance After: 4 days                                    |
| ✓ Sufficient balance                                    |
+----------------------------------------------------------+
| MANAGER APPROVAL                                         |
| Status: ⏳ PENDING                                        |
| Manager: Mike Rodriguez                                  |
| Note: Same-day request - HR can approve directly         |
+----------------------------------------------------------+
| HR DECISION                                              |
| ☐ Approve immediately (skip manager approval)           |
| ☐ Wait for manager approval                             |
| ☐ Deny                                                  |
|                                                          |
| HR Notes:                                                |
| [Same-day sick leave approved - doctor appointment   ]   |
+----------------------------------------------------------+
|                    [Deny Request]  [Approve Request ✓]   |
+----------------------------------------------------------+
```

**User Action:** Click "Approve Request" (same-day sick leave policy allows HR direct approval)

**System Response:**
- PTO approved
- Manager notified (FYI, not approval needed)
- Employee notified
- Timesheet auto-updated with PTO hours
- Toast: "Same-day PTO approved for John Doe"

**Time:** ~1 minute

---

### Step 5: Handle PTO Request with Conflict

**User Action:** Click "View Details" for Emily Rodriguez

**System Response:**
- Detail opens, shows conflict warning

**Screen State:**
```
+----------------------------------------------------------+
| PTO Request - Emily Rodriguez                   [×]      |
+----------------------------------------------------------+
| Request ID: PTO-2024-1212-003                            |
| Status: ⚠️ PENDING - TEAM CONFLICT                       |
+----------------------------------------------------------+
| TIME OFF REQUEST                                         |
| Type: Personal                                           |
| Start: Monday, 12/16/2024                                |
| End: Tuesday, 12/17/2024                                 |
| Total Days: 2 days                                       |
+----------------------------------------------------------+
| CONFLICT ANALYSIS                                        |
|                                                          |
| ⚠️ 3 other team members out same days:                   |
| • Sarah Lee (Sales): 12/16-12/17 (Approved)             |
| • Kevin Zhang (Sales): 12/16 (Approved)                 |
| • Lisa Martinez (Sales): 12/17 (Approved)               |
|                                                          |
| Team Coverage:                                           |
| Department: Sales (8 members total)                      |
| Available: 4 members (50% staffing)                      |
| Minimum Required: 5 members (62.5% staffing)             |
|                                                          |
| ⚠️ WARNING: Below minimum staffing level                 |
+----------------------------------------------------------+
| MANAGER APPROVAL                                         |
| Status: ✓ APPROVED by Lisa Wang (Manager)               |
| Manager Notes: "Approved but noted staffing concern"     |
+----------------------------------------------------------+
| HR OPTIONS                                               |
|                                                          |
| ● Approve (Override staffing concern)                   |
| ○ Conditional Approval (Ask employee to be on-call)     |
| ○ Deny (Staffing insufficient)                          |
| ○ Request Reschedule (Suggest alternate dates)          |
|                                                          |
| HR Notes:                                                |
| [Conditionally approved - employee must be available ]   |
| [for urgent calls if needed                          ]   |
+----------------------------------------------------------+
|     [Deny]  [Request Reschedule]  [Approve with Note ✓] |
+----------------------------------------------------------+
```

**User Action:** Select "Conditional Approval", enter note, click "Approve with Note"

**System Response:**
- PTO approved with condition
- Email sent to Emily: "Approved - please be available for urgent calls"
- Manager notified of conditional approval
- Calendar marked with special flag: "On-call if needed"
- Toast: "PTO conditionally approved for Emily Rodriguez"

**Time:** ~2 minutes

---

### Step 6: Review Timesheets

**User Action:** Click "Timesheets" tab

**System Response:**
- Timesheets view loads

**Screen State:**
```
+----------------------------------------------------------+
| Timesheets - Pay Period 12/01 - 12/14    [Export] [⌘K]  |
+----------------------------------------------------------+
| [Search employees...]        [Filter ▼] [Pending ▼] [✓] |
+----------------------------------------------------------+
| Status: [All (127)] [Pending Review (3)] [Approved (124)]|
+----------------------------------------------------------+
| Employee        Dept      Reg Hrs OT  Total   Status     |
| ─────────────────────────────────────────────────────── |
| Michael Johnson Recruiting  80    5    85    ⚠️ Overtime |
|   Notes: Worked late on 3 placements                    |
|   Manager: ✓ Approved (Mike Rodriguez, 12/14)           |
|   [View Details] [Approve] [Adjust]                     |
| ─────────────────────────────────────────────────────── |
| Sarah Lee       Sales       80    3    83    ⚠️ Overtime |
|   Notes: Extended client calls                          |
|   Manager: ✓ Approved (Lisa Wang, 12/14)                |
|   [View Details] [Approve] [Adjust]                     |
| ─────────────────────────────────────────────────────── |
| John Doe        Recruiting  72    0    72    ⚠️ Under   |
|   Notes: Sick leave 12/13 (8 hrs PTO)                   |
|   Manager: ✓ Approved (Mike Rodriguez, 12/13)           |
|   PTO: -8 hours                                          |
|   [View Details] [Approve]                              |
+----------------------------------------------------------+
| [Approve All (3)] [Export to Payroll]                   |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 7: Approve Timesheet with Overtime

**User Action:** Click "View Details" for Michael Johnson

**System Response:**
- Timesheet detail modal opens (see UC-HR-002 Payroll Management for full detail screen)

**User Action:** Review overtime justification (manager already approved), click "Approve"

**System Response:**
- Timesheet approved
- Overtime hours flagged for payroll
- Toast: "Timesheet approved - 5 hours OT"

**Time:** ~1 minute

---

### Step 8: Approve Timesheet with PTO Deduction

**User Action:** Click "View Details" for John Doe

**System Response:**
- Shows 72 work hours + 8 PTO hours = 80 total

**User Action:** Verify PTO deduction matches approved request, click "Approve"

**System Response:**
- Timesheet approved
- PTO deduction confirmed (already applied)
- Toast: "Timesheet approved - PTO deduction verified"

**Time:** ~1 minute

---

### Step 9: View Attendance Report

**User Action:** Click "Attendance" tab

**System Response:**
- Attendance tracking view loads

**Screen State:**
```
+----------------------------------------------------------+
| Attendance Tracking                   [Calendar] [Export]|
+----------------------------------------------------------+
| Date Range: [This Week ▼] [12/09/24 - 12/13/24]         |
+----------------------------------------------------------+
| TODAY: Friday, December 13, 2024                         |
|                                                          |
| CLOCK-IN STATUS (as of 9:00 AM)                          |
| ✅ On Time: 120 employees (94.5%)                        |
| ⚠️ Late: 4 employees (3.1%)                              |
| ❌ Absent (No Call): 1 employee (0.8%)                   |
| 📅 PTO/Scheduled Off: 2 employees (1.6%)                 |
+----------------------------------------------------------+
| LATE ARRIVALS                                            |
|                                                          |
| • Lisa Martinez - Clocked in 9:15 AM (15 min late)      |
|   Reason: "Traffic accident on highway"                  |
|   Manager Notified: Yes                                  |
|   [View] [Mark as Excused]                              |
|                                                          |
| • Kevin Zhang - Clocked in 9:22 AM (22 min late)        |
|   Reason: None provided                                  |
|   Manager Notified: Yes                                  |
|   [View] [Send Warning]                                 |
+----------------------------------------------------------+
| NO-CALL NO-SHOW                                          |
|                                                          |
| • David Park - Expected 9:00 AM, no clock-in            |
|   Last Contact: Yesterday 5:00 PM                        |
|   Manager: Mike Rodriguez (notified)                     |
|   [Contact Employee] [Mark as Emergency] [View]         |
+----------------------------------------------------------+
| ATTENDANCE TRENDS (Last 30 Days)                         |
| Average On-Time Rate: 96.2%                              |
| Average Late Rate: 3.5%                                  |
| Chronic Late Employees (>3 lates): 2                     |
|   • Kevin Zhang: 4 lates this month                     |
|   • John Smith: 3 lates this month                      |
|                                                          |
| [Generate Attendance Report] [View Chronic Issues]       |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 10: Handle No-Call No-Show

**User Action:** Click "Contact Employee" for David Park

**System Response:**
- Contact modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Contact Employee - David Park                   [×]      |
+----------------------------------------------------------+
| Employee: David Park (EMP-2024-120)                      |
| Expected Clock-In: 9:00 AM                               |
| Current Time: 9:30 AM (30 minutes late)                  |
| Status: ⚠️ NO-CALL NO-SHOW                               |
+----------------------------------------------------------+
| CONTACT ATTEMPTS                                         |
|                                                          |
| [Call Cell Phone] (555) 987-6543                         |
| [Call Home Phone] (555) 123-4567                         |
| [Send Email] david.park@intime.com                       |
| [Send SMS] "David, please contact HR immediately"        |
|                                                          |
| Contact Log:                                             |
| • 9:05 AM: Manager called - no answer                   |
| • 9:15 AM: Manager texted - no response                 |
| • 9:30 AM: HR calling now...                            |
+----------------------------------------------------------+
| EMERGENCY CONTACT                                        |
| Name: Susan Park (Spouse)                                |
| Phone: (555) 555-1234                                    |
| Relationship: Spouse                                     |
|                                                          |
| [Call Emergency Contact]                                 |
+----------------------------------------------------------+
| ACTIONS                                                  |
| ☐ Mark as Excused (medical emergency)                   |
| ☐ Mark as Unexcused Absence                             |
| ☐ Escalate to Manager                                   |
| ☐ Initiate Disciplinary Process                         |
|                                                          |
| Notes:                                                   |
| [Called cell and home - no answer. Will try emergency]   |
| [contact.                                            ]   |
+----------------------------------------------------------+
|                               [Cancel]  [Save & Close]   |
+----------------------------------------------------------+
```

**User Action:** Attempts to contact, logs notes, clicks "Save & Close"

**System Response:**
- Contact attempts logged
- Manager receives update
- Follow-up task created: "Check on David Park status"
- If employee responds: Update attendance record accordingly

**Time:** ~5 minutes

---

## Postconditions

### PTO Management:
1. ✅ PTO requests approved or denied
2. ✅ PTO balances updated
3. ✅ Team calendar updated
4. ✅ Employees and managers notified
5. ✅ Conflicts tracked and resolved

### Timesheet Management:
1. ✅ Timesheets approved for payroll
2. ✅ Overtime verified and approved
3. ✅ PTO deductions applied
4. ✅ Ready for payroll processing

### Attendance Tracking:
1. ✅ Attendance records updated
2. ✅ Late arrivals documented
3. ✅ No-shows investigated
4. ✅ Trends identified for follow-up

---

## Alternative Flows

### A1: Deny PTO Request

**Trigger:** HR needs to deny PTO request

**Flow:**
1. HR clicks "Deny Request"
2. Modal prompts: "Reason for denial?"
3. HR selects reason:
   - Insufficient balance
   - Blackout period
   - Staffing requirements
   - Other (enter text)
4. HR enters explanation
5. System:
   - Updates request status to "Denied"
   - Sends email to employee with reason
   - Notifies manager
   - Does NOT deduct PTO balance

### A2: Adjust Timesheet

**Trigger:** Timesheet has errors

**Flow:**
1. HR clicks "Adjust" on timesheet
2. Adjustment modal opens
3. HR can modify:
   - Hours worked (increase/decrease)
   - Overtime hours
   - PTO hours
   - Add notes explaining adjustment
4. Adjustment requires reason selection
5. System:
   - Updates timesheet
   - Notifies employee and manager
   - Logs adjustment in audit trail
   - Recalculates pay

### A3: Bulk PTO Approval

**Trigger:** Multiple PTO requests for same event (e.g., company holiday)

**Flow:**
1. HR filters PTO requests by date range
2. Selects multiple requests (checkboxes)
3. Clicks "Bulk Approve"
4. System verifies:
   - All have manager approval
   - All have sufficient balance
   - No critical conflicts
5. If all pass, approves all at once
6. Sends individual confirmation emails

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Insufficient PTO balance | Employee requests more than available | "Insufficient PTO balance. Available: 3 days, Requested: 5 days" | Deny or ask employee to reduce days |
| Conflicting PTO | Request overlaps with existing approved PTO | "Employee already has approved PTO for these dates" | Deny or cancel previous request |
| Blackout period | Request during company blackout | "These dates are in a blackout period (Q4 close)" | Deny or request alternate dates |
| Manager not approved | Trying to approve before manager | "Manager approval required first" | Send reminder to manager |
| Timesheet already processed | Attempting to adjust paid timesheet | "Timesheet already processed in payroll. Contact Payroll for correction." | Use payroll adjustment |

---

## Compliance & Policies

### PTO Policies

**Accrual:**
- Full-Time: 1.25 days/month (15 days/year)
- Proration: New hires accrue from start date
- Cap: 30 days maximum balance
- Carryover: Up to 5 days per year

**Usage:**
- Advance notice: 2 weeks for planned PTO
- Same-day: Allowed for sick leave only
- Manager approval: Required for all PTO
- HR approval: Final approval, can override

**Blackout Periods:**
- Quarter-end close (1 week each quarter)
- Annual company events
- Peak business periods (as designated)

### Timesheet Compliance

**FLSA Requirements:**
- Accurate record of hours worked
- Overtime properly calculated (1.5x after 40 hours/week)
- Meal breaks documented
- Rest breaks tracked

**Company Policy:**
- Bi-weekly submission
- Manager approval required
- HR final approval for payroll
- Corrections documented in audit trail

---

## Related Use Cases

- [03-payroll-management.md](./03-payroll-management.md) - Timesheets feed into payroll
- [02-employee-onboarding.md](./02-employee-onboarding.md) - PTO balance setup

---

*Last Updated: 2024-11-30*
