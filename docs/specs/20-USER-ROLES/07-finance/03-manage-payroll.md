# Use Case: Manage Contractor Payroll

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-FIN-003 |
| Actor | Finance/CFO |
| Goal | Process and approve contractor payroll for payment |
| Frequency | Bi-weekly (every other Thursday) |
| Estimated Time | 45-60 minutes |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Finance/CFO
2. User has payroll review and approval permissions
3. Pay period has ended (timesheets locked)
4. All timesheets for period have been approved
5. Payroll provider integration active (ADP/Gusto)
6. Tax tables are current and accurate

---

## Trigger

One of the following:
- Scheduled task: "Payroll review due - Thursday 2:00 PM"
- Email notification: "Payroll ready for review - 12 contractors, $145,000"
- HR Manager request: "Please review and approve payroll"
- Automated workflow: "All timesheets approved - payroll can be processed"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Payroll Reconciliation

**User Action:** Click "Payroll Reconciliation" in sidebar navigation

**System Response:**
- Sidebar item highlights
- URL changes to: `/employee/finance/payroll`
- Payroll reconciliation screen loads
- Shows current pay period by default

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Reconciliation                    [Period ▼] [⚙]  |
+----------------------------------------------------------+
| Pay Period: Nov 15 - Nov 29, 2025                        |
| Pay Date: Dec 1, 2025 (Friday)         Status: 🟡 Review  |
+----------------------------------------------------------+
| ⚠️  Action Required: Review and approve by 3:00 PM today  |
+----------------------------------------------------------+
| Quick Summary                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ Total Employees:        12                         │  |
| │ Total Hours:         2,320                         │  |
| │ Total Gross:      $145,000                         │  |
| │ Total Taxes:       $28,500                         │  |
| │ Total Net:        $116,500                         │  |
| │ Total Deductions:   $2,500                         │  |
| │ Employer Taxes:    $11,500                         │  |
| │                                                     │  |
| │ Company Total Cost: $159,000                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| [Review Timesheets] [Compare with ADP] [View Detail]     |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Review Approved Timesheets

**User Action:** Click "Review Timesheets" button

**System Response:**
- Timesheet summary screen loads
- Shows all approved timesheets for pay period
- Grouped by employee

**Screen State:**
```
+----------------------------------------------------------+
| Approved Timesheets - Nov 15-29, 2025                [×] |
+----------------------------------------------------------+
| All timesheets approved and ready for payroll            |
+----------------------------------------------------------+
| Employee          Hours    Rate    Gross     Status      |
| ─────────────────────────────────────────────────────────|
| Jane Developer     160    $75/hr  $12,000   ✓ Approved  |
|   Week 1: 80h  Week 2: 80h                              |
|   Regular: 160h  OT: 0h                                 |
|   Approved by: Sarah Chen (Nov 29, 10:15 AM)            |
| ─────────────────────────────────────────────────────────|
| Bob Engineer       120    $75/hr   $9,000   ✓ Approved  |
|   Week 1: 60h  Week 2: 60h                              |
|   Regular: 120h  OT: 0h                                 |
|   Approved by: Sarah Chen (Nov 29, 10:18 AM)            |
| ─────────────────────────────────────────────────────────|
| Alice Cloud        160    $85/hr  $13,600   ✓ Approved  |
|   Week 1: 80h  Week 2: 80h                              |
|   Regular: 160h  OT: 0h                                 |
|   Approved by: Tom Brown (Nov 29, 9:30 AM)              |
| ─────────────────────────────────────────────────────────|
| Tom DevOps         160    $75/hr  $12,000   ✓ Approved  |
|   Week 1: 80h  Week 2: 80h                              |
|   Regular: 160h  OT: 0h                                 |
|   Approved by: Tom Brown (Nov 29, 9:35 AM)              |
| ─────────────────────────────────────────────────────────|
| Sarah QA           160    $65/hr  $10,400   ✓ Approved  |
|   Week 1: 80h  Week 2: 80h                              |
|   Regular: 160h  OT: 0h                                 |
|   Approved by: Lisa Wang (Nov 29, 11:00 AM)             |
| ─────────────────────────────────────────────────────────|
| Mike Sales         180    $70/hr  $13,650   ✓ Approved  |
|   Week 1: 90h  Week 2: 90h                              |
|   Regular: 160h  OT: 20h (Time and a half)             |
|   Approved by: Mike Johnson (Nov 29, 8:45 AM)           |
|   Note: OT approved for critical project deadline       |
| ─────────────────────────────────────────────────────────|
| ... (6 more employees)                                   |
|                                                           |
| Total: 12 employees, 2,320 hours, $145,000 gross         |
|                                                           |
|                                        [Export] [Close]   |
+----------------------------------------------------------+
```

**User Action:** Review hours, note overtime for Mike Sales, verify approvals

**User Action:** Click "Close"

**Time:** ~5 minutes

---

### Step 3: Calculate Pay Components

**User Action:** Click "View Detail" on main payroll screen

**System Response:**
- Detailed payroll calculation screen loads
- Shows breakdown for each employee

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Detail - Nov 15-29, 2025                          |
+----------------------------------------------------------+
| Employee: Jane Developer                    [1 of 12] [→]|
+----------------------------------------------------------+
| Pay Information                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Employee Type:      W2 Contractor                  │  |
| │ Pay Rate:           $75.00/hr                      │  |
| │ Regular Hours:      160                            │  |
| │ Overtime Hours:     0                              │  |
| │ Total Hours:        160                            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Gross Pay Calculation                                     |
| ┌────────────────────────────────────────────────────┐  |
| │ Regular Pay:        160h × $75.00 = $12,000.00     │  |
| │ Overtime Pay:         0h × $112.50 = $0.00         │  |
| │ Commission:                          $0.00         │  |
| │ Bonus:                               $0.00         │  |
| │                                   ───────────       │  |
| │ GROSS PAY:                        $12,000.00       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Deductions                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ Federal Income Tax (22%):         -$2,640.00       │  |
| │ State Income Tax (CA 9.3%):       -$1,116.00       │  |
| │ Social Security (6.2%):             -$744.00       │  |
| │ Medicare (1.45%):                   -$174.00       │  |
| │ State Disability (CA SDI 1.1%):     -$132.00       │  |
| │ Health Insurance:                   -$150.00       │  |
| │ 401(k) Contribution (5%):           -$600.00       │  |
| │                                   ───────────       │  |
| │ TOTAL DEDUCTIONS:                 -$5,556.00       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Employer Taxes                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Social Security Match (6.2%):       $744.00        │  |
| │ Medicare Match (1.45%):             $174.00        │  |
| │ Federal Unemployment (0.6%):         $72.00        │  |
| │ State Unemployment (CA 3.4%):       $408.00        │  |
| │                                   ───────────       │  |
| │ TOTAL EMPLOYER TAXES:              $1,398.00       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Net Pay                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Gross Pay:                        $12,000.00       │  |
| │ Total Deductions:                 -$5,556.00       │  |
| │                                   ───────────       │  |
| │ NET PAY:                           $6,444.00       │  |
| │                                                     │  |
| │ Payment Method: Direct Deposit                     │  |
| │ Bank Account: ****1234                             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Total Cost to Company                                     |
| Gross Pay + Employer Taxes = $12,000 + $1,398 = $13,398  |
|                                                           |
|                           [← Prev] [Next →] [Close]       |
+----------------------------------------------------------+
```

**Field Specifications:**

**Regular Hours**
| Property | Value |
|----------|-------|
| Field Name | `regularHours` |
| Type | Number (calculated from timesheets) |
| Max | 160 (for bi-weekly period, 80/week) |
| Validation | Must match approved timesheets |

**Overtime Hours**
| Property | Value |
|----------|-------|
| Field Name | `overtimeHours` |
| Type | Number (calculated) |
| Rate Multiplier | 1.5× (time and a half) |
| Trigger | Hours > 40 per week |
| Approval | Required for OT |

**Federal Tax**
| Property | Value |
|----------|-------|
| Field Name | `federalTax` |
| Type | Calculated (based on W4, tax tables) |
| Rate | Progressive (12%, 22%, 24%, etc.) |
| Source | IRS tax tables |

**State Tax**
| Property | Value |
|----------|-------|
| Field Name | `stateTax` |
| Type | Calculated (based on state) |
| Rate | Varies by state (CA: 9.3% example) |
| Source | State tax tables |

**User Action:** Review calculations, verify tax rates, click "Next →" to review next employee

**Time:** ~2 minutes per employee (~24 minutes for 12 employees)

---

### Step 4: Compare with ADP Data

**User Action:** Return to main payroll screen, click "Compare with ADP"

**System Response:**
- System fetches data from ADP via API
- Comparison screen loads
- Shows side-by-side InTime vs ADP

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Comparison: InTime vs ADP                    [×] |
+----------------------------------------------------------+
| Pay Period: Nov 15-29, 2025                              |
| Last ADP Sync: Nov 29, 2025 2:15 PM                      |
+----------------------------------------------------------+
| Summary Comparison                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Metric           InTime      ADP        Variance   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Employees          12         12            0  ✓   │  |
| │ Total Hours     2,320      2,320            0  ✓   │  |
| │ Gross Pay    $145,000   $145,000           $0  ✓   │  |
| │ Federal Tax   $31,350    $31,350           $0  ✓   │  |
| │ State Tax     $13,485    $13,485           $0  ✓   │  |
| │ FICA          $11,092    $11,092           $0  ✓   │  |
| │ Medicare       $2,102     $2,102           $0  ✓   │  |
| │ 401(k)         $7,250     $7,250           $0  ✓   │  |
| │ Health Ins.    $1,800     $1,800           $0  ✓   │  |
| │ Other Ded.       $421       $421           $0  ✓   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Net Pay      $77,500    $77,500           $0  ✓   │  |
| │                                                     │  |
| │ Employer Taxes                                      │  |
| │ FICA Match    $11,092    $11,092           $0  ✓   │  |
| │ Medicare        $2,102     $2,102           $0  ✓   │  |
| │ FUTA             $870       $870           $0  ✓   │  |
| │ SUTA           $4,930     $4,930           $0  ✓   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Total Taxes   $18,994    $18,994           $0  ✓   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ✓ All figures match. Payroll is reconciled.              |
|                                                           |
| Employee-Level Variances: None                            |
|                                                           |
| [View Detail] [Force Resync] [Export Report] [Close]     |
+----------------------------------------------------------+
```

**Scenario: Variance Detected**

**Screen State (With Variance):**
```
+----------------------------------------------------------+
| Payroll Comparison: InTime vs ADP                    [×] |
+----------------------------------------------------------+
| Pay Period: Nov 15-29, 2025                              |
| Last ADP Sync: Nov 29, 2025 2:15 PM                      |
+----------------------------------------------------------+
| Summary Comparison                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Metric           InTime      ADP        Variance   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Employees          12         12            0  ✓   │  |
| │ Total Hours     2,320      2,320            0  ✓   │  |
| │ Gross Pay    $145,000   $145,000           $0  ✓   │  |
| │ Federal Tax   $31,350    $31,350           $0  ✓   │  |
| │ State Tax     $13,485    $13,635        -$150  ⚠️   │  |
| │ FICA          $11,092    $11,092           $0  ✓   │  |
| │ Medicare       $2,102     $2,102           $0  ✓   │  |
| │ 401(k)         $7,250     $7,250           $0  ✓   │  |
| │ Health Ins.    $1,800     $1,800           $0  ✓   │  |
| │ Other Ded.       $421       $421           $0  ✓   │  |
| │ ────────────────────────────────────────────────────│  |
| │ Net Pay      $77,500    $77,350        +$150  ⚠️   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ⚠️  VARIANCE DETECTED: State tax mismatch (-$150)         |
|                                                           |
| Variance Analysis                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Issue: State tax rate difference                   │  |
| │                                                     │  |
| │ InTime Calculation:                                │  |
| │   CA State Tax Rate: 9.3%                          │  |
| │   $145,000 × 9.3% = $13,485                        │  |
| │                                                     │  |
| │ ADP Calculation:                                    │  |
| │   CA State Tax Rate: 9.4% (updated Nov 15)        │  |
| │   $145,000 × 9.4% = $13,635                        │  |
| │                                                     │  |
| │ Root Cause: Tax table update in ADP not synced    │  |
| │             to InTime                              │  |
| │                                                     │  |
| │ Recommended Action:                                │  |
| │ • Update InTime tax tables to 9.4%                │  |
| │ • Use ADP figures for this payroll cycle         │  |
| │ • Reconcile in next cycle                         │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Resolution Options:                                       |
| ○ Update InTime tax tables (apply to future)            |
| ○ Use ADP figures for this cycle (one-time override)    |
| ○ Manual adjustment                                      |
|                                                           |
|               [Update Tax Tables] [Use ADP] [Manual Fix] |
+----------------------------------------------------------+
```

**User Action:** Click "Update Tax Tables"

**System Response:**
- Tax configuration modal opens

**Screen State (Tax Table Update):**
```
+----------------------------------------------------------+
| Update Tax Tables                                    [×] |
+----------------------------------------------------------+
| Current vs ADP Tax Rates                                 |
+----------------------------------------------------------+
| Tax Type          Current    ADP      Update To          |
| ─────────────────────────────────────────────────────────|
| CA State Tax        9.3%     9.4%    [9.4%  ] ✓         |
| Federal Tax        22.0%    22.0%    [22.0% ] (no change)|
| FICA (SS)          6.2%     6.2%    [6.2%  ] (no change)|
| Medicare           1.45%    1.45%   [1.45% ] (no change)|
| CA SDI             1.1%     1.1%    [1.1%  ] (no change)|
|                                                           |
| Effective Date: [Nov 15, 2025 ▼]                         |
|                                                           |
| ☑️  Apply to current payroll cycle                       |
| ☑️  Apply to future payroll cycles                       |
| ☑️  Recalculate current payroll with new rates           |
| ☐  Retroactive adjustment for previous cycles           |
|                                                           |
| Impact:                                                   |
| • Current cycle net pay: -$150                          |
| • Future cycles: Accurate state tax calculation         |
|                                                           |
|                                [Cancel] [✓ Update Tables] |
+----------------------------------------------------------+
```

**User Action:** Review, click "Update Tables"

**System Response:**
- Tax tables updated
- Payroll recalculated
- Comparison refreshed
- Toast: "Tax tables updated. Payroll recalculated."

**Time:** ~10 minutes (including variance investigation)

---

### Step 5: Handle Deductions

**User Action:** Review deductions section in detail view

**Screen State (Deductions Detail):**
```
+----------------------------------------------------------+
| Payroll Deductions Summary                                |
+----------------------------------------------------------+
| Pre-Tax Deductions                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ Type                 Employees    Total Amount     │  |
| │ ────────────────────────────────────────────────────│  |
| │ Health Insurance         10         $1,500.00      │  |
| │ 401(k) Contributions      8         $7,250.00      │  |
| │ Dental Insurance          8           $240.00      │  |
| │ Vision Insurance          6            $60.00      │  |
| │ ────────────────────────────────────────────────────│  |
| │ Total Pre-Tax:                      $9,050.00      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Post-Tax Deductions                                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Type                 Employees    Total Amount     │  |
| │ ────────────────────────────────────────────────────│  |
| │ Garnishments              1           $250.00      │  |
| │ Charitable Giving         3           $150.00      │  |
| │ Roth IRA                  2           $500.00      │  |
| │ ────────────────────────────────────────────────────│  |
| │ Total Post-Tax:                       $900.00      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Special Deductions                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠️  New Garnishment for Bob Engineer                │  |
| │    Court Order #CO-2025-12345                      │  |
| │    Amount: $250.00 per pay period                  │  |
| │    Duration: 12 months                             │  |
| │    Status: Pending CFO approval                    │  |
| │                                                     │  |
| │    [View Court Order] [Approve] [Reject]           │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**User Action:** Click "Approve" on garnishment

**System Response:**
- Garnishment approved
- Deduction added to payroll
- Bob's net pay recalculated
- Toast: "Garnishment approved for Bob Engineer"

**Time:** ~5 minutes

---

### Step 6: Review Commission Payments (If Applicable)

**Note:** Commissions typically paid separately, but can be included in payroll

**Screen State:**
```
+----------------------------------------------------------+
| Commission Payments - Nov 15-29, 2025                    |
+----------------------------------------------------------+
| ☑️  Include approved commissions in this payroll cycle   |
+----------------------------------------------------------+
| Employee          Commission    Gross     Total          |
| ─────────────────────────────────────────────────────────|
| Sarah Chen         $12,000    $12,000   $24,000          |
|   Placement: Google - Sr. Developer                      |
| ─────────────────────────────────────────────────────────|
| Mike Johnson        $8,500     $9,000   $17,500          |
|   Placement: Meta - Product Manager                      |
| ─────────────────────────────────────────────────────────|
| Lisa Wang          $14,000    $11,000   $25,000          |
|   Placements: Amazon (2), Netflix (1)                    |
|                                                           |
| Total Commissions: $34,500                               |
|                                                           |
| ⚠️  Note: Commissions taxed at supplemental rate (22%)   |
+----------------------------------------------------------+
```

**User Action:** Verify commission amounts, note supplemental tax rate

**Time:** ~3 minutes

---

### Step 7: Submit to Payroll Provider (ADP/Gusto)

**User Action:** Click "Approve Payroll" button on main screen

**System Response:**
- Final approval confirmation modal appears

**Screen State (Final Approval):**
```
+----------------------------------------------------------+
| Approve Payroll for Processing                       [×] |
+----------------------------------------------------------+
| ⚠️  FINAL APPROVAL - This action cannot be undone        |
+----------------------------------------------------------+
| Pay Period: Nov 15 - Nov 29, 2025                        |
| Pay Date: Dec 1, 2025 (Friday)                           |
|                                                           |
| Summary                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Employees:                    12                   │  |
| │ Total Gross:            $145,000                   │  |
| │ Total Deductions:        $67,000                   │  |
| │ Total Net Pay:           $78,000                   │  |
| │                                                     │  |
| │ Employer Costs:                                     │  |
| │ Employer Taxes:          $18,994                   │  |
| │ Benefits (Employer):      $2,500                   │  |
| │                                                     │  |
| │ TOTAL COMPANY COST:     $166,494                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Approval Checklist                                        |
| ☑️  All timesheets approved                              |
| ☑️  Hours verified against timesheets                    |
| ☑️  Pay rates confirmed                                  |
| ☑️  Tax calculations verified                            |
| ☑️  Deductions reviewed and approved                     |
| ☑️  Reconciled with ADP data                             |
| ☑️  Commission payments included (if applicable)         |
| ☑️  Bank account has sufficient funds                    |
| ☑️  Direct deposit files ready                           |
|                                                           |
| Once approved:                                            |
| • Payroll data submitted to ADP                          |
| • ADP processes payments for Dec 1                       |
| • Direct deposits initiated                              |
| • Pay stubs generated and emailed                        |
| • Tax filings prepared                                   |
| • Cannot be modified or cancelled                        |
|                                                           |
| Approval Password (for verification):                    |
| [                    ]                                    |
|                                                           |
|                            [Cancel] [✓ Approve & Submit]  |
+----------------------------------------------------------+
```

**User Action:** Enter approval password, click "Approve & Submit"

**System Response:**
- Button shows loading spinner: "Submitting to ADP..."
- API calls ADP to submit payroll
- Progress indicator shows

**Screen State (Processing):**
```
+----------------------------------------------------------+
| Submitting Payroll to ADP...                              |
+----------------------------------------------------------+
| ████████████████████████░░░░  75%                         |
|                                                           |
| ✓ Payroll data validated                                 |
| ✓ Employee records verified                              |
| ✓ Tax calculations confirmed                             |
| ⏳ Direct deposit file uploading...                       |
| ⏱️  Pay stub generation pending...                        |
|                                                           |
| Please wait, do not close this window...                 |
+----------------------------------------------------------+
```

**Screen State (Success):**
```
+----------------------------------------------------------+
| Payroll Submitted Successfully!                      [×] |
+----------------------------------------------------------+
| ✓ Payroll approved and submitted to ADP                  |
|                                                           |
| Submission Details                                        |
| ┌────────────────────────────────────────────────────┐  |
| │ ADP Submission ID: ADP-PAY-2025-11-456             │  |
| │ Submitted: Nov 29, 2025 2:45 PM                    │  |
| │ Submitted By: CFO (John Doe)                       │  |
| │ Pay Date: Dec 1, 2025                              │  |
| │                                                     │  |
| │ Status: ✓ Accepted by ADP                          │  |
| │ Processing: In Progress                             │  |
| │ Expected Completion: Nov 30, 2025 11:00 PM        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Next Steps (Automated)                                    |
| ✓ ADP processing payroll                                 |
| ✓ Direct deposits scheduled for Dec 1, 2025             |
| ✓ Tax withholdings calculated                            |
| ✓ Pay stubs will be emailed to employees                |
| ✓ Payroll journal entries created in QuickBooks         |
|                                                           |
| Notifications Sent                                        |
| • All 12 employees notified                             |
| • HR Manager notified                                    |
| • Finance team notified                                  |
| • CEO dashboard updated                                  |
|                                                           |
|                      [View Payroll Report] [Done]         |
+----------------------------------------------------------+
```

**System Actions (Backend):**
1. Payroll data packaged and sent to ADP API
2. ADP validates and accepts submission
3. Direct deposit ACH file generated
4. Tax withholding calculated and submitted
5. QuickBooks journal entries created:
   - Debit: Payroll Expense $145,000
   - Debit: Employer Taxes $18,994
   - Credit: Cash (Payroll Account) $78,000
   - Credit: Tax Liability Accounts $86,994
6. Activity logged
7. Payroll status updated to "Submitted"
8. Employees notified via email
9. Pay stubs generated (by ADP)

**Time:** ~2 minutes

---

### Step 8: Verify Submission in ADP

**User Action:** Log into ADP portal (separate system) to verify

**ADP Portal View:**
```
ADP Workforce Now - Payroll Dashboard
────────────────────────────────────────────────────
Pay Period: 11/15/2025 - 11/29/2025
Pay Date: 12/01/2025
Status: ✓ Submitted - Processing

Employees: 12
Total Gross: $145,000.00
Total Net: $78,000.00

Processing Status:
✓ Submission received
✓ Validation complete
⏳ Tax calculations in progress
⏱️  ACH file generation pending
⏱️  Pay stub generation pending

Estimated Completion: 11/30/2025 11:00 PM
```

**User Action:** Verify figures match, note completion time

**Time:** ~2 minutes

---

### Step 9: Generate Payroll Reports

**User Action:** Return to InTime, navigate to Reports section

**User Action:** Click "Generate Payroll Report"

**Screen State:**
```
+----------------------------------------------------------+
| Generate Payroll Report                              [×] |
+----------------------------------------------------------+
| Report Type: [Payroll Summary ▼]                         |
|                                                           |
| Options:                                                  |
| • Payroll Summary                                        |
| • Detailed Payroll Register                              |
| • Tax Liability Report                                   |
| • Deduction Summary                                      |
| • Employer Cost Report                                   |
| • Journal Entry Report (for accounting)                  |
|                                                           |
| Period: Nov 15 - Nov 29, 2025                            |
|                                                           |
| Include:                                                  |
| ☑️  Employee details                                     |
| ☑️  Pay calculations                                     |
| ☑️  Tax withholdings                                     |
| ☑️  Deductions                                           |
| ☑️  Employer costs                                       |
| ☐  Social Security Numbers (requires extra approval)    |
|                                                           |
| Format: ● PDF  ○ Excel  ○ CSV                           |
|                                                           |
|                            [Cancel] [Generate Report]     |
+----------------------------------------------------------+
```

**User Action:** Select options, click "Generate Report"

**System Response:**
- PDF generated
- Report preview shown

**Report Preview:**
```
╔══════════════════════════════════════════════════════════╗
║         InTime Solutions - Payroll Summary Report        ║
║              Pay Period: Nov 15 - 29, 2025               ║
╚══════════════════════════════════════════════════════════╝

GROSS PAY SUMMARY
────────────────────────────────────────────────────────────
Regular Hours:              2,300 @ avg $62.50     $143,750
Overtime Hours:                20 @ avg $93.75       $1,250
Commission Payments:                                     $0
Bonuses:                                                 $0
                                                 ────────────
TOTAL GROSS PAY:                                   $145,000

DEDUCTIONS
────────────────────────────────────────────────────────────
Federal Income Tax:                                 $31,350
State Income Tax (CA):                              $13,635
Social Security (6.2%):                              $8,990
Medicare (1.45%):                                    $2,102
State Disability (CA SDI):                           $1,595
                                                 ────────────
TOTAL TAX WITHHOLDINGS:                             $57,672

401(k) Contributions:                                $7,250
Health Insurance:                                    $1,500
Dental Insurance:                                      $240
Vision Insurance:                                       $60
Garnishments:                                          $250
Other Deductions:                                      $150
                                                 ────────────
TOTAL OTHER DEDUCTIONS:                              $9,450

TOTAL DEDUCTIONS:                                   $67,122

NET PAY
────────────────────────────────────────────────────────────
Gross Pay:                                         $145,000
Total Deductions:                                  -$67,122
                                                 ────────────
NET PAY (Direct Deposit):                           $77,878

EMPLOYER COSTS
────────────────────────────────────────────────────────────
Social Security Match (6.2%):                        $8,990
Medicare Match (1.45%):                              $2,102
Federal Unemployment (0.6%):                           $870
State Unemployment (CA 3.4%):                        $4,930
Workers Comp Insurance (est):                        $2,102
                                                 ────────────
TOTAL EMPLOYER TAXES:                               $18,994

Health Insurance (Employer):                         $2,000
401(k) Match:                                        $3,625
Other Benefits:                                        $500
                                                 ────────────
TOTAL EMPLOYER BENEFITS:                             $6,125

TOTAL COMPANY COST
────────────────────────────────────────────────────────────
Gross Pay:                                         $145,000
Employer Taxes:                                     $18,994
Employer Benefits:                                   $6,125
                                                 ────────────
TOTAL COST TO COMPANY:                             $170,119

────────────────────────────────────────────────────────────
Report Generated: Nov 29, 2025 3:00 PM
Generated By: CFO (John Doe)
ADP Submission ID: ADP-PAY-2025-11-456
```

**Time:** ~3 minutes

---

## Postconditions

1. ✅ Payroll approved and submitted to ADP/Gusto
2. ✅ All timesheets marked as "Paid"
3. ✅ Direct deposits scheduled for pay date
4. ✅ Tax withholdings calculated and submitted
5. ✅ Deductions processed (401k, health insurance, etc.)
6. ✅ Employer taxes calculated
7. ✅ QuickBooks journal entries created
8. ✅ Employees notified of payment
9. ✅ Pay stubs generated (by ADP)
10. ✅ Payroll reports generated and archived
11. ✅ Activity logged in system
12. ✅ HR Manager notified of completion
13. ✅ Garnishments processed (if applicable)
14. ✅ Commission payments included (if applicable)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `payroll.reviewed` | `{ period, total_gross, reviewer_id }` |
| `payroll.reconciled` | `{ period, variance, reconciled_by }` |
| `payroll.approved` | `{ period, total_amount, approved_by }` |
| `payroll.submitted` | `{ period, adp_submission_id, submitted_at }` |
| `payroll.processed` | `{ period, pay_date, employee_count }` |
| `payroll.tax_calculated` | `{ period, total_taxes, tax_breakdown }` |
| `payroll.journal_entry` | `{ period, entry_id, quickbooks_id }` |
| `deduction.approved` | `{ employee_id, deduction_type, amount }` |
| `garnishment.added` | `{ employee_id, court_order, amount }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Unapproved Timesheets | Timesheet pending | "Cannot process payroll - 2 timesheets not approved" | Approve timesheets or exclude employees |
| ADP Sync Failed | API error | "ADP sync failed. Cannot compare data." | Retry sync, manual comparison if urgent |
| Tax Calculation Error | Missing tax data | "Tax calculation failed for Jane Developer" | Verify employee tax info, update W4 |
| Variance Too High | Data mismatch | "Variance exceeds threshold ($500). Review required." | Investigate variance, adjust if needed |
| Insufficient Funds | Low bank balance | "Warning: Payroll account balance may be insufficient" | Transfer funds before pay date |
| Missing Deduction Info | Incomplete setup | "401(k) deduction missing for Bob Engineer" | Update deduction info or skip for this cycle |
| ADP Submission Failed | API/network error | "Payroll submission to ADP failed" | Retry submission, contact ADP support |
| Duplicate Submission | Already submitted | "Payroll already submitted for this period" | Verify submission status, void if needed |
| Garnishment Invalid | Missing court order | "Cannot process garnishment - court order required" | Upload court order, defer to next cycle |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Hours | Must match approved timesheets | "Hours mismatch with timesheets" |
| Pay Rate | Must match employee contract | "Pay rate does not match contract" |
| Tax Withholding | Must use current tax tables | "Tax tables outdated" |
| Net Pay | Must be > $0 | "Net pay cannot be zero or negative" |
| Bank Account | Must be verified and active | "Employee bank account not verified" |
| Garnishment | Requires court order | "Court order required for garnishment" |
| Deduction | Cannot exceed gross pay | "Deductions exceed gross pay" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g p` | Go to Payroll Reconciliation |
| `a` | Approve payroll |
| `r` | Refresh ADP sync |
| `e` | Export payroll report |
| `Cmd+K` | Open Command Bar |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Includes payroll review in bi-weekly tasks
- [05-financial-reporting.md](./05-financial-reporting.md) - Payroll reports

---

*Last Updated: 2025-11-30*
