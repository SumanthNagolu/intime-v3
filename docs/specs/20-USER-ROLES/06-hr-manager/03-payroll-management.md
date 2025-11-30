# Use Case: Payroll Management

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-HR-002 |
| Actor | HR Manager |
| Goal | Process bi-weekly payroll run: review timesheets, calculate pay, approve, and disburse payments |
| Frequency | Every 2 weeks (26 pay periods per year) |
| Estimated Time | 2-4 hours per payroll run |
| Priority | CRITICAL (Time-Sensitive, Legal Compliance) |
| Business Impact | Employee payments, tax compliance, company cash flow |

---

## Preconditions

1. User is logged in as HR Manager
2. User has "payroll.approve" permission
3. Pay period has ended (e.g., 12/01 - 12/14 ended on 12/14)
4. Timesheets have been submitted by employees
5. Payroll provider integration is active (ADP, Gusto, or Paychex)
6. Bank account has sufficient funds for payroll

---

## Trigger

One of the following:
- Pay period end date reached (auto-trigger)
- System notification: "Pay period ended - review payroll"
- HR Manager manually initiates payroll run
- Calendar reminder: "Payroll due in 2 days"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Payroll Dashboard

**User Action:** Click "Payroll" in sidebar

**System Response:**
- Sidebar highlights "Payroll"
- URL changes to: `/employee/hr/payroll`
- Payroll dashboard loads

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Dashboard                      [+ New Run] [⌘K]  |
+----------------------------------------------------------+
| UPCOMING PAYROLL RUN                                      |
|                                                          |
| Pay Period: 12/01/2024 - 12/14/2024                      |
| Pay Date: 12/15/2024 (Tomorrow!)                         |
| Status: 🔄 IN REVIEW                                     |
| Deadline: Today by 5:00 PM EST                           |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ PAYROLL SUMMARY                                    │ |
| │                                                    │ |
| │ Employees: 127                                     │ |
| │ Total Hours: 10,160 (Reg: 10,080 | OT: 80)       │ |
| │                                                    │ |
| │ Gross Pay: $324,500.00                             │ |
| │ Deductions: $97,350.00                             │ |
| │   - Federal Tax: $48,675.00                        │ |
| │   - State Tax: $16,225.00                          │ |
| │   - FICA: $24,824.25                               │ |
| │   - Health Ins: $6,350.00                          │ |
| │   - 401(k): $16,225.00                             │ |
| │                                                    │ |
| │ Net Pay: $227,150.00                               │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ⚠️ ITEMS NEEDING ATTENTION                               |
| • 2 employees with overtime (review required)            |
| • 1 timesheet adjustment needed                          |
| • 3 new hires (first payroll)                           |
|                                                          |
| [Review Timesheets] [Review Exceptions] [Approve Payroll]|
+----------------------------------------------------------+
| PAYROLL CALENDAR                                         |
| ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐     |
| │ Dec  │ 1-14 │15-31 │ Jan  │ 1-15 │16-31 │ Feb  │     |
| ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤     |
| │ Due  │12/15 │12/31 │ Due  │01/15 │01/31 │ Due  │     |
| │ [✓]  │[🔄] │ [ ]  │      │ [ ]  │ [ ]  │      │     |
| └──────┴──────┴──────┴──────┴──────┴──────┴──────┘     |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review Timesheets

**User Action:** Click "Review Timesheets" button

**System Response:**
- Timesheets view loads
- Shows all 127 timesheets for current pay period
- Sorted by status: Pending → Approved

**Screen State:**
```
+----------------------------------------------------------+
| Timesheets - Pay Period 12/01 - 12/14    [Export] [⌘K]  |
+----------------------------------------------------------+
| [Search employees...]        [Filter ▼] [Sort ▼] [✓ All]|
+----------------------------------------------------------+
| Status: [All (127)] [Pending Review (3)] [Approved (124)]|
+----------------------------------------------------------+
| Employee        Dept      Reg Hrs OT  Total   Status     |
| ─────────────────────────────────────────────────────── |
| Michael Johnson Recruiting  80    5    85    ⚠️ Overtime |
|   Notes: Worked late on 3 placements this sprint        |
|   Manager: Approved ✓ (Mike Rodriguez, 12/14)           |
|   [View Details] [Approve] [Adjust]                     |
| ─────────────────────────────────────────────────────── |
| Sarah Lee       Sales       80    3    83    ⚠️ Overtime |
|   Notes: Client calls extended hours                    |
|   Manager: Approved ✓ (Lisa Wang, 12/14)                |
|   [View Details] [Approve] [Adjust]                     |
| ─────────────────────────────────────────────────────── |
| John Doe        Recruiting  72    0    72    ⚠️ Under   |
|   Notes: Sick leave 12/10 (8 hours PTO used)            |
|   Manager: Approved ✓ (Mike Rodriguez, 12/13)           |
|   PTO Deduction: -8 hours                               |
|   [View Details] [Approve]                              |
| ─────────────────────────────────────────────────────── |
| [Showing 3 of 127 - All others approved]                |
|                                                          |
| [Approve All Pending] [Export to CSV]                   |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 3: Review Overtime Timesheet

**User Action:** Click "View Details" for Michael Johnson

**System Response:**
- Timesheet detail modal opens
- Shows daily breakdown

**Screen State:**
```
+----------------------------------------------------------+
| Timesheet Detail - Michael Johnson             [×]      |
+----------------------------------------------------------+
| Pay Period: 12/01/2024 - 12/14/2024                      |
| Employee: Michael Johnson (EMP-2024-089)                 |
| Position: Senior Recruiter                               |
| Pay Rate: $36.06/hr (Salary: $75,000/year)              |
| Overtime Rate: $54.09/hr (1.5x)                          |
+----------------------------------------------------------+
| DAILY BREAKDOWN                                          |
|                                                          |
| Date       Day   Regular  Overtime  Total  Notes         |
| ────────────────────────────────────────────────────── |
| 12/02      Mon      8        0        8                 |
| 12/03      Tue      8        0        8                 |
| 12/04      Wed      8        2       10   Late client call|
| 12/05      Thu      8        0        8                 |
| 12/06      Fri      8        0        8                 |
| 12/09      Mon      8        3       11   3 placements  |
| 12/10      Tue      8        0        8                 |
| 12/11      Wed      8        0        8                 |
| 12/12      Thu      8        0        8                 |
| 12/13      Fri      8        0        8                 |
| ────────────────────────────────────────────────────── |
| TOTALS            80        5       85                  |
+----------------------------------------------------------+
| PAY CALCULATION                                          |
|                                                          |
| Regular Pay: 80 hrs × $36.06 = $2,884.80                |
| Overtime Pay: 5 hrs × $54.09 = $270.45                  |
| Gross Pay: $3,155.25                                     |
|                                                          |
| Deductions:                                              |
| • Federal Tax (22%): $694.16                            |
| • State Tax (6.5%): $205.09                             |
| • FICA (7.65%): $241.38                                 |
| • Health Insurance: $50.00                              |
| • 401(k) (5%): $157.76                                  |
| Total Deductions: $1,348.39                              |
|                                                          |
| Net Pay: $1,806.86                                       |
+----------------------------------------------------------+
| MANAGER APPROVAL                                         |
| Approved by: Mike Rodriguez (Manager)                    |
| Date: 12/14/2024 3:45 PM                                 |
| Notes: "Justified - heavy placement week"                |
+----------------------------------------------------------+
|                [Reject] [Request Adjustment] [Approve ✓] |
+----------------------------------------------------------+
```

**User Action:** Review overtime justification, click "Approve"

**System Response:**
- Timesheet status updated to "Approved"
- Toast: "Timesheet approved for Michael Johnson"
- Modal closes
- Timesheet list updates

**Time:** ~2 minutes

---

### Step 4: Review Under-Hours Timesheet

**User Action:** Click "View Details" for John Doe

**System Response:**
- Timesheet detail opens
- Shows 72 hours + 8 hours PTO used

**Screen State:**
```
+----------------------------------------------------------+
| Timesheet Detail - John Doe                     [×]      |
+----------------------------------------------------------+
| Pay Period: 12/01/2024 - 12/14/2024                      |
| Employee: John Doe (EMP-2024-045)                        |
| Position: Recruiter                                      |
| Pay Rate: $32.69/hr (Salary: $68,000/year)              |
+----------------------------------------------------------+
| DAILY BREAKDOWN                                          |
|                                                          |
| Date       Day   Work Hrs  PTO Hrs  Total  Notes         |
| ────────────────────────────────────────────────────── |
| 12/02      Mon      8        0        8                 |
| 12/03      Tue      8        0        8                 |
| 12/04      Wed      8        0        8                 |
| 12/05      Thu      8        0        8                 |
| 12/06      Fri      8        0        8                 |
| 12/09      Mon      8        0        8                 |
| 12/10      Tue      0        8        8   Sick leave    |
| 12/11      Wed      8        0        8                 |
| 12/12      Thu      8        0        8                 |
| 12/13      Fri      8        0        8                 |
| ────────────────────────────────────────────────────── |
| TOTALS            72        8       80                  |
+----------------------------------------------------------+
| PTO BALANCE                                              |
| Balance Before: 13 days (104 hours)                      |
| Used This Period: 1 day (8 hours)                        |
| Balance After: 12 days (96 hours)                        |
+----------------------------------------------------------+
| PAY CALCULATION                                          |
|                                                          |
| Regular Pay: 72 hrs × $32.69 = $2,353.68                |
| PTO Pay: 8 hrs × $32.69 = $261.52                       |
| Gross Pay: $2,615.20                                     |
|                                                          |
| (Deductions calculated normally)                         |
| Net Pay: $1,896.23                                       |
+----------------------------------------------------------+
| MANAGER APPROVAL                                         |
| Approved by: Mike Rodriguez (Manager)                    |
| Date: 12/13/2024 2:15 PM                                 |
| Notes: "Sick leave approved, PTO used"                   |
+----------------------------------------------------------+
|                                           [Approve ✓]    |
+----------------------------------------------------------+
```

**User Action:** Verify PTO deduction is correct, click "Approve"

**System Response:**
- Timesheet approved
- PTO balance updated: 104 - 8 = 96 hours
- Toast: "Timesheet approved for John Doe"

**Time:** ~1 minute

---

### Step 5: Approve All Remaining Timesheets

**User Action:** Click "Approve All Pending" (for remaining 1 timesheet)

**System Response:**
- Sarah Lee's overtime timesheet approved
- All 127 timesheets now approved
- Status: "Ready for Payroll Processing"

**Time:** ~30 seconds

---

### Step 6: Review Exceptions

**User Action:** Return to payroll dashboard, click "Review Exceptions"

**System Response:**
- Exceptions screen loads

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Exceptions - Pay Period 12/01 - 12/14           |
+----------------------------------------------------------+
| OVERTIME (2 employees)                                   |
| ✓ Michael Johnson: 5 hours OT ($270.45) - Approved      |
| ✓ Sarah Lee: 3 hours OT ($162.27) - Approved            |
|                                                          |
| NEW HIRES (3 employees - First Payroll)                  |
|                                                          |
| • David Park                                             |
|   Start Date: 12/09/24 (6 days this period)             |
|   Prorated Pay: 6 days × $288.46 = $1,730.76            |
|   Status: ✓ Verified                                    |
|   [View Details]                                         |
|                                                          |
| • Lisa Martinez                                          |
|   Start Date: 12/02/24 (10 days this period)            |
|   Prorated Pay: 10 days × $250.00 = $2,500.00           |
|   Status: ⚠️ Missing Direct Deposit Info                |
|   [Contact Employee] [Issue Paper Check]                 |
|                                                          |
| • Kevin Zhang                                            |
|   Start Date: 12/11/24 (4 days this period)             |
|   Prorated Pay: 4 days × $320.00 = $1,280.00            |
|   Status: ✓ Verified                                    |
|   [View Details]                                         |
|                                                          |
| ADJUSTMENTS (1)                                          |
|                                                          |
| • Emily Rodriguez - Bonus Payment                        |
|   Amount: $2,000.00 (Placement bonus)                    |
|   Approved by: CEO                                       |
|   Status: ⚠️ Needs HR Approval                          |
|   [Review] [Approve]                                     |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 7: Handle Missing Direct Deposit

**User Action:** Click "Contact Employee" for Lisa Martinez

**System Response:**
- Email modal opens

**User Action:** Send email: "Hi Lisa, your direct deposit info is missing. Please submit ASAP to receive payroll. Otherwise we'll issue a paper check."

**User Action:** Click "Issue Paper Check" as backup

**System Response:**
- Flag set: `paymentMethod = 'check'` for Lisa Martinez this period
- Toast: "Paper check will be issued for Lisa Martinez"
- Reminder created: "Get direct deposit info from Lisa"

**Time:** ~2 minutes

---

### Step 8: Approve Bonus Payment

**User Action:** Click "Approve" for Emily Rodriguez's bonus

**System Response:**
- Bonus detail modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Approve Bonus Payment - Emily Rodriguez         [×]      |
+----------------------------------------------------------+
| Employee: Emily Rodriguez (EMP-2024-032)                 |
| Position: Senior Recruiter                               |
| Bonus Type: Placement Bonus                              |
| Amount: $2,000.00                                        |
|                                                          |
| Justification:                                           |
| "Placed 2 candidates in Q4, exceeding target of 1.5"     |
|                                                          |
| Approved by: CEO (12/12/2024)                            |
|                                                          |
| Tax Treatment:                                           |
| ● Supplemental Income (22% federal tax rate)            |
| ○ Add to Regular Pay                                    |
|                                                          |
| Tax Calculation:                                         |
| Gross Bonus: $2,000.00                                   |
| Federal Tax (22%): $440.00                               |
| State Tax (6.5%): $130.00                                |
| FICA (7.65%): $153.00                                    |
| Total Deductions: $723.00                                |
|                                                          |
| Net Bonus: $1,277.00                                     |
|                                                          |
| Payment Date: 12/15/2024 (with regular payroll)          |
+----------------------------------------------------------+
|                              [Reject]  [Approve Bonus ✓] |
+----------------------------------------------------------+
```

**User Action:** Click "Approve Bonus"

**System Response:**
- Bonus added to Emily's payroll
- Toast: "Bonus approved - $2,000 gross, $1,277 net"
- Exception cleared

**Time:** ~1 minute

---

### Step 9: Final Payroll Review

**User Action:** Return to payroll dashboard

**System Response:**
- All exceptions resolved
- Payroll summary updated

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Dashboard                      [Refresh] [⌘K]    |
+----------------------------------------------------------+
| PAYROLL RUN - READY TO APPROVE                           |
|                                                          |
| Pay Period: 12/01/2024 - 12/14/2024                      |
| Pay Date: 12/15/2024 (Tomorrow)                          |
| Status: ✅ READY FOR APPROVAL                            |
|                                                          |
| ┌────────────────────────────────────────────────────┐ |
| │ FINAL PAYROLL SUMMARY                              │ |
| │                                                    │ |
| │ Employees: 127                                     │ |
| │   • Regular: 124                                   │ |
| │   • Overtime: 2                                    │ |
| │   • New Hires (Prorated): 3                        │ |
| │                                                    │ |
| │ Total Hours: 10,160 (Reg: 10,080 | OT: 80)       │ |
| │                                                    │ |
| │ Regular Pay: $324,500.00                           │ |
| │ Overtime Pay: $432.72                              │ |
| │ Bonuses: $2,000.00                                 │ |
| │ Gross Pay: $326,932.72                             │ |
| │                                                    │ |
| │ Deductions: $98,079.82                             │ |
| │   - Federal Tax: $71,925.20                        │ |
| │   - State Tax: $21,250.63                          │ |
| │   - FICA: $25,010.35                               │ |
| │   - Health Ins: $6,350.00                          │ |
| │   - 401(k): $16,346.64                             │ |
| │                                                    │ |
| │ Net Pay: $228,852.90                               │ |
| │                                                    │ |
| │ Payment Methods:                                   │ |
| │   • Direct Deposit: 126 employees ($227,575.90)   │ |
| │   • Paper Check: 1 employee ($1,277.00)           │ |
| └────────────────────────────────────────────────────┘ |
|                                                          |
| ✅ All timesheets approved (127/127)                     |
| ✅ All exceptions resolved                               |
| ✅ Tax calculations verified                             |
| ✅ Bank account verified (Balance: $450,000)             |
|                                                          |
| ⚠️ FINAL REVIEW CHECKLIST                                |
| ☑ Timesheets reviewed and approved                      |
| ☑ Overtime verified and approved                        |
| ☑ New hire proration calculated                         |
| ☑ Bonuses/adjustments approved                          |
| ☑ Direct deposit info verified                          |
| ☑ Tax withholdings calculated                           |
| ☑ Bank funding confirmed                                |
| ☐ Final approval by HR Manager                          |
|                                                          |
| [Download Preview] [Export to ADP] [🎯 APPROVE PAYROLL] |
+----------------------------------------------------------+
```

**Time:** ~1 minute

---

### Step 10: Download Payroll Preview

**User Action:** Click "Download Preview" (optional but recommended)

**System Response:**
- Generates PDF payroll report
- Shows employee-by-employee breakdown
- File downloads: `Payroll_12-01_to_12-14_Preview.pdf`

**Time:** ~30 seconds

---

### Step 11: Approve Payroll

**User Action:** Click "🎯 APPROVE PAYROLL" button

**System Response:**
- Confirmation modal opens

**Screen State:**
```
+----------------------------------------------------------+
|                      APPROVE PAYROLL                      |
|                                                      [×] |
+----------------------------------------------------------+
| ⚠️ IMPORTANT: This action will submit payroll for        |
| processing. Once submitted, it cannot be reversed.       |
|                                                          |
| Payroll Summary:                                         |
| • 127 employees                                          |
| • $228,852.90 net pay                                    |
| • Pay date: 12/15/2024                                   |
|                                                          |
| This will:                                               |
| 1. Submit payroll to ADP for processing                  |
| 2. Initiate direct deposit transfers (ACH)               |
| 3. Deduct $228,852.90 from company bank account          |
| 4. Print 1 paper check for pickup                        |
| 5. Generate pay stubs and email to employees             |
| 6. File tax withholdings with IRS and state              |
|                                                          |
| Processing Timeline:                                     |
| • ACH transfer initiated: Today by 5:00 PM EST          |
| • Funds available to employees: 12/15/2024 (Tomorrow)    |
|                                                          |
| ─────────────────────────────────────────────────────── |
|                                                          |
| Final Approval                                           |
|                                                          |
| I confirm that I have reviewed all timesheets, verified  |
| calculations, and approve this payroll for processing.   |
|                                                          |
| ☐ I understand this action cannot be reversed            |
|                                                          |
| Approver: Sarah Martinez (HR Manager)                    |
| Date/Time: 12/14/2024 4:30 PM EST                        |
|                                                          |
| Password Confirmation *                                  |
| [                                                      ]  |
|                                                          |
+----------------------------------------------------------+
|                         [Cancel]  [APPROVE & SUBMIT ✓]   |
+----------------------------------------------------------+
```

**User Action:** Check confirmation box, enter password, click "APPROVE & SUBMIT"

**System Response:**

1. **Password Verification:**
   - Validates HR Manager's password
   - Ensures authorized user

2. **API Call to Payroll Provider (ADP):**
   ```typescript
   const payrollRun = {
     payPeriodStart: '2024-12-01',
     payPeriodEnd: '2024-12-14',
     payDate: '2024-12-15',
     employees: [
       {
         employeeId: 'EMP-2024-089',
         regularHours: 80,
         overtimeHours: 5,
         grossPay: 3155.25,
         netPay: 1806.86,
         deductions: { federal: 694.16, state: 205.09, fica: 241.38, health: 50, retirement: 157.76 },
         paymentMethod: 'direct_deposit',
         bankAccount: { routing: '021000021', account: '1234567890' }
       },
       // ... 126 more employees
     ]
   };

   const response = await adp.submitPayroll(payrollRun);
   // Response: { status: 'accepted', confirmationNumber: 'ADP-2024-1214-001' }
   ```

3. **Update Database:**
   ```sql
   UPDATE payroll_runs
   SET status = 'approved',
       approved_by = current_user_id,
       approved_at = NOW(),
       confirmation_number = 'ADP-2024-1214-001',
       gross_total = 326932.72,
       net_total = 228852.90
   WHERE pay_period_start = '2024-12-01';

   UPDATE timesheets
   SET payroll_processed = true,
       processed_at = NOW()
   WHERE pay_period_start = '2024-12-01';
   ```

4. **Generate Pay Stubs:**
   - For each employee, generate PDF pay stub
   - Store in S3: `paystubs/2024/12/EMP-{id}-12-01-to-12-14.pdf`

5. **Email Pay Stubs:**
   ```typescript
   for (const employee of employees) {
     await sendEmail({
       to: employee.email,
       subject: 'Your Pay Stub - 12/01 to 12/14',
       template: 'paystub',
       attachments: [
         { filename: 'paystub.pdf', path: employee.paystubUrl }
       ],
       data: {
         employeeName: employee.name,
         payPeriod: '12/01/2024 - 12/14/2024',
         payDate: '12/15/2024',
         netPay: employee.netPay,
         viewPaystubUrl: `${appUrl}/employee/profile/paystubs/${employee.paystubId}`
       }
     });
   }
   ```

6. **Log Activity:**
   ```sql
   INSERT INTO activity_log (
     entity_type, entity_id, activity_type,
     description, metadata, created_by
   ) VALUES (
     'payroll_run', payroll_run_id, 'payroll_approved',
     'Payroll approved and submitted to ADP',
     '{"employees": 127, "gross": 326932.72, "net": 228852.90}',
     current_user_id
   );
   ```

7. **Success Response:**
   - Modal closes
   - Confetti animation (2 seconds)
   - Success screen appears

**Screen State (Success):**
```
+----------------------------------------------------------+
|                                                          |
|                    [Confetti animation]                  |
|                                                          |
|              🎉🎊🎉🎊🎉🎊🎉🎊🎉🎊                        |
|                                                          |
|          ┌─────────────────────────────────┐            |
|          │                                 │            |
|          │   ✅ PAYROLL APPROVED!         │            |
|          │                                 │            |
|          │  127 employees                  │            |
|          │  $228,852.90 net pay            │            |
|          │  Pay date: 12/15/2024           │            |
|          │                                 │            |
|          │  Confirmation: ADP-2024-1214-001│            |
|          │                                 │            |
|          │  ✅ Submitted to ADP            │            |
|          │  ✅ Pay stubs emailed           │            |
|          │  ✅ ACH transfers initiated     │            |
|          │  ✅ Funds available tomorrow    │            |
|          │                                 │            |
|          └─────────────────────────────────┘            |
|                                                          |
|      [View Payroll Report]  [Back to Dashboard]         |
|                                                          |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

## Postconditions

1. ✅ Payroll run status = "approved"
2. ✅ Payroll submitted to ADP (confirmation: ADP-2024-1214-001)
3. ✅ ACH direct deposits initiated (126 employees)
4. ✅ Paper check printed (1 employee)
5. ✅ Pay stubs generated (127 PDFs)
6. ✅ Pay stubs emailed to all employees
7. ✅ Timesheets marked as "payroll_processed"
8. ✅ PTO balances updated (deductions applied)
9. ✅ Tax withholdings calculated and recorded
10. ✅ Bank account will be debited $228,852.90
11. ✅ Employees will receive funds on 12/15/2024
12. ✅ Activity logged for audit trail
13. ✅ Next payroll run auto-created (12/15 - 12/31)

---

## Alternative Flows

### A1: Reject Timesheet (Needs Correction)

**Trigger:** HR Manager finds error in timesheet

**Flow:**
1. HR clicks "Reject" on timesheet detail
2. Modal opens: "Reason for rejection?"
3. HR enters: "Hours don't match scheduled shifts. Please verify."
4. System:
   - Sets timesheet status to "Rejected"
   - Sends email to employee and manager
   - Employee must resubmit corrected timesheet
5. Payroll cannot be approved until all timesheets approved

### A2: Manual Adjustment (Bonus, Commission, Deduction)

**Trigger:** One-time payment or deduction needed

**Flow:**
1. HR navigates to employee's payroll detail
2. Clicks "Add Adjustment"
3. Modal opens with adjustment form:
   - Type: [Bonus / Commission / Reimbursement / Deduction / Other]
   - Amount: $[___]
   - Description: [___]
   - Tax Treatment: [Taxable / Non-Taxable]
4. HR fills and submits
5. Adjustment added to current payroll run
6. Reflected in gross pay calculation

### A3: Off-Cycle Payroll (Emergency/Correction)

**Trigger:** Employee needs immediate payment (forgot to pay, payroll error)

**Flow:**
1. HR clicks "+ New Run" on payroll dashboard
2. Selects "Off-Cycle Payroll"
3. Enters:
   - Employee(s) to pay
   - Amount
   - Reason
   - Pay date (ASAP or specific date)
4. Reviews and approves
5. Submitted to ADP as off-cycle run
6. Faster processing (1-2 days instead of standard schedule)

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Timesheet not submitted | Employee forgot to submit | "Cannot process payroll: 3 timesheets missing" | Contact employees, wait for submission |
| Insufficient funds | Bank balance < payroll total | "Insufficient funds in bank account. Please fund account before approving." | Transfer funds to payroll account |
| ADP API error | Integration failure | "Failed to submit to ADP. Please try again or contact support." | Retry or contact ADP support |
| Missing direct deposit | Employee has no bank info | "Employee has no direct deposit info. Issue paper check?" | Issue check or get DD info |
| Tax calculation error | Incorrect W-4 data | "Tax calculation failed for employee. Please review W-4." | Update W-4, recalculate |
| Duplicate payroll | Attempting to run same period twice | "Payroll for this period already processed." | Cancel or view existing run |

---

## Compliance Requirements

### Federal Tax Compliance

- **FICA**: 7.65% (6.2% Social Security + 1.45% Medicare)
- **Federal Income Tax**: Based on W-4 withholding
- **FUTA**: 0.6% (employer-paid, not deducted from employee)
- **Filing**: Form 941 (quarterly) and W-2 (annual)

### State Tax Compliance

- **State Income Tax**: Varies by state (e.g., NY: 4-10.9%)
- **State Unemployment (SUTA)**: Employer-paid
- **Local Taxes**: Some cities (e.g., NYC: ~3-4%)

### Payroll Deadlines

- **Bi-Weekly**: Payroll must be submitted 2 business days before pay date
- **ACH Processing**: 1-2 business days
- **Paper Checks**: Must be available on pay date

---

## Related Use Cases

- [02-employee-onboarding.md](./02-employee-onboarding.md) - Setting up new hire in payroll
- [05-time-and-attendance.md](./05-time-and-attendance.md) - Timesheet approval process

---

*Last Updated: 2024-11-30*
