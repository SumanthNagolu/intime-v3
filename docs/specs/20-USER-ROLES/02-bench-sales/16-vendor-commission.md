# Use Case: Track Vendor Commission and Payments

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-BENCH-016 |
| Actor | Bench Sales Recruiter (Primary), Finance Team (Secondary) |
| Goal | Track vendor commission obligations, verify invoices, and ensure accurate payments |
| Frequency | Weekly review + monthly reconciliation |
| Estimated Time | 15-30 minutes per week, 2-3 hours per month |
| Priority | High (Financial compliance) |

---

## Preconditions

1. User is logged in as Bench Sales Recruiter or Finance role
2. Vendor placement exists with active placement
3. Vendor agreement terms documented in system
4. Placement has valid contract with bill rate
5. User has permission to view commission data

---

## Trigger

One of the following:
- New vendor placement made (commission tracking begins)
- Weekly commission review (routine)
- Vendor invoice received (verification needed)
- Month-end reconciliation (Finance process)
- Commission dispute raised by vendor
- Placement rate changed (recalculation needed)
- Placement ended (final commission calculation)

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Vendor Commission Dashboard

**User Action:** User clicks "Commission" in sidebar or navigates from Vendor section

**System Response:**
- Loads vendor commission dashboard
- Shows overview of commission obligations
- Displays pending invoices and payments

**URL:** `/employee/workspace/bench/vendor-commission`

**Time:** ~1 second

---

### Step 2: View Commission Overview

**System Display:**

```
+------------------------------------------------------------------+
|  Vendor Commission Dashboard              [Refresh ⟳] [Export]   |
+------------------------------------------------------------------+
| Track vendor commission obligations and payments    Updated: Now |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Commission Overview - November 2024                         │   |
| │                                                             │   |
| │ ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │   |
| │ │ Total Owed      │ │ Paid This Month │ │ Outstanding    │ │   |
| │ │ $127,450        │ │ $98,200         │ │ $29,250        │ │   |
| │ │ to vendors      │ │ (15 invoices)   │ │ (8 invoices)   │ │   |
| │ │                 │ │                 │ │                │ │   |
| │ │ ▲ $12k from Oct │ │ ✓ On schedule   │ │ ⚠ 3 overdue    │ │   |
| │ └─────────────────┘ └─────────────────┘ └────────────────┘ │   |
| │                                                             │   |
| │ ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │   |
| │ │ Active Vendors  │ │ Active Placement│ │ Avg Commission │ │   |
| │ │ 8 vendors       │ │ 23 placements   │ │ 12.3%          │ │   |
| │ │ receiving comm. │ │ generating comm.│ │ per placement  │ │   |
| │ │                 │ │                 │ │                │ │   |
| │ │ → View All      │ │ → View Details  │ │ Range: 8-18%   │ │   |
| │ └─────────────────┘ └─────────────────┘ └────────────────┘ │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Commission Breakdown by Vendor                                    |
+------------------------------------------------------------------+
| Vendor                  | Active | Total Owed | Paid MTD | Due   |
|-------------------------|--------|------------|----------|-------|
| TechStaff Solutions     | 7      | $42,350    | $38,200  | $4,150|
| Global IT Partners      | 5      | $28,900    | $22,100  | $6,800|
| StaffAugment Inc        | 4      | $21,600    | $18,500  | $3,100|
| ConsultPro LLC          | 3      | $15,200    | $12,400  | $2,800|
| Elite Staffing          | 2      | $9,800     | $7,000   | $2,800|
| VendorHub Inc           | 1      | $5,400     | $0       | $5,400|
| QuickHire Partners      | 1      | $4,200     | $0       | $4,200|
+------------------------------------------------------------------+
| [View All Vendors]                                                |
+------------------------------------------------------------------+
|                                                                   |
| Pending Actions                                                   |
+------------------------------------------------------------------+
| ⚠️  3 invoices overdue (>Net 30)                                 |
| 📋 5 invoices pending approval                                   |
| ✅ 12 invoices approved, awaiting payment                        |
| 🔔 2 rate change requests requiring recalculation                |
+------------------------------------------------------------------+
```

**Metrics Explained:**
- **Total Owed**: Commission owed to all vendors for current period
- **Paid This Month**: Commission already paid (completed transactions)
- **Outstanding**: Commission awaiting payment (approved + pending)
- **Active Vendors**: Vendors with at least one active placement generating commission
- **Active Placements**: Number of placements currently generating vendor commission
- **Avg Commission**: Mean commission percentage across all vendor deals

**Time:** ~30 seconds to review

---

### Step 3: View Active Vendor Placements

**User Action:** Click "View Details" on Active Placements widget

**System Response:**
- Shows list of all placements generating vendor commission
- Sortable and filterable by vendor, consultant, amount

**Active Placements List:**

```
+------------------------------------------------------------------+
|  Active Vendor Placements - Commission Tracking                   |
+------------------------------------------------------------------+
| [All Vendors ▼] [All Status ▼] [This Month ▼]    [Filter] [Sort]|
+------------------------------------------------------------------+
| Consultant        | Vendor           | Client    | Commission    |
|-------------------|------------------|-----------|---------------|
| Rajesh Kumar      | TechStaff        | Accenture | $650/wk (10%) |
| Java Developer    | Solutions        | DC Area   | [View Details]|
| Started: 10/15    | Net 30           | Active    | ✅ Current    |
|-------------------|------------------|-----------|---------------|
| Sarah Johnson     | Global IT        | Capital   | $920/wk (12%) |
| .NET Developer    | Partners         | One, VA   | [View Details]|
| Started: 09/22    | Net 45           | Active    | ✅ Current    |
|-------------------|------------------|-----------|---------------|
| Chen Wei          | TechStaff        | Meta,     | $780/wk (15%) |
| React Developer   | Solutions        | Remote    | [View Details]|
| Started: 11/01    | Net 30           | Active    | ✅ Current    |
|-------------------|------------------|-----------|---------------|
| Priya Sharma      | StaffAugment     | Google,   | $1,150/wk (18%)|
| Full Stack Dev    | Inc              | Bay Area  | [View Details]|
| Started: 08/10    | Net 30           | Active    | ⚠️ Rate change|
|-------------------|------------------|-----------|---------------|
| Michael Brown     | ConsultPro       | Amazon,   | $540/wk (9%)  |
| DevOps Engineer   | LLC              | Seattle   | [View Details]|
| Started: 10/28    | Net 60           | Active    | ✅ Current    |
|-------------------|------------------|-----------|---------------|
| ... 18 more placements ...                                       |
+------------------------------------------------------------------+
| Total Active Placements: 23                                       |
| Total Weekly Commission: $12,840                                  |
| Projected Monthly Commission: ~$55,000                            |
+------------------------------------------------------------------+
```

**Commission Display Format:**
- **$/week**: Weekly commission amount (most common billing cycle)
- **Percentage**: Commission rate per vendor agreement
- **Status**: Current (on-time), Rate change (needs update), Overdue (late payment)

**Time:** ~1 minute to review

---

### Step 4: View Placement Commission Details

**User Action:** Click "View Details" on a specific placement (e.g., Rajesh Kumar)

**System Response:**
- Opens placement commission detail panel
- Shows commission calculation breakdown
- Displays invoice and payment history

**Commission Detail Panel:**

```
+------------------------------------------------------------------+
|  Placement Commission - Rajesh Kumar                        [×]  |
+------------------------------------------------------------------+
| Consultant: Rajesh Kumar (Java Developer)                        |
| Vendor: TechStaff Solutions                                      |
| Client: Accenture - DC Area Project                              |
| Placement Start: 10/15/2024                                      |
| Status: Active                                                   |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Commission Terms (Per Vendor Agreement)                     │   |
| │                                                             │   |
| │ Agreement: TechStaff Solutions MSA v2.1 (Signed: 03/15/24) │   |
| │ Commission Type: Percentage-based                           │   |
| │ Commission Rate: 10% of net bill amount                     │   |
| │ Payment Terms: Net 30 from invoice date                     │   |
| │ Invoice Frequency: Bi-weekly (every 2 weeks)                │   |
| │ Currency: USD                                               │   |
| │ Payment Method: ACH transfer                                │   |
| │                                                             │   |
| │ Special Terms:                                              │   |
| │ • Volume discount: 1% reduction if >10 placements/month     │   |
| │ • Guaranteed hours: 40 hrs/week minimum                     │   |
| │ • Overtime: Commission on all billed hours (no cap)         │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Rate Calculation Breakdown                                  │   |
| │                                                             │   |
| │ Client Bill Rate:          $95.00 /hr                       │   |
| │ Consultant Pay Rate:       $72.00 /hr (W2)                  │   |
| │ InTime Gross Margin:       $23.00 /hr (24.2%)               │   |
| │                                                             │   |
| │ Less: Vendor Commission    -$6.50 /hr (10% of $65*)         │   |
| │       *Net bill = Bill - Pay burden                         │   |
| │                                                             │   |
| │ InTime Net Margin:         $16.50 /hr (17.4%)               │   |
| │                                                             │   |
| │ Weekly Calculation (40 hrs standard):                       │   |
| │ • Client pays InTime:      $3,800 /week                     │   |
| │ • InTime pays consultant:  $2,880 /week                     │   |
| │ • InTime pays vendor:      $650 /week (commission)          │   |
| │ • InTime keeps:            $920 /week (net)                 │   |
| │                                                             │   |
| │ Overtime Calculation (if applicable):                       │   |
| │ • OT hours: $95 × 1.5 = $142.50/hr bill rate                │   |
| │ • OT pay: $72 × 1.5 = $108/hr pay rate                      │   |
| │ • OT commission: 10% of net ($142.50-$108) = $3.45/hr       │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Invoice & Payment History                                   │   |
| │                                                             │   |
| │ Invoice #2024-TS-142 (11/15 - 11/29)                        │   |
| │ Status: ✅ PAID                                             │   |
| │ Invoice Date: 11/30/2024                                    │   |
| │ Due Date: 12/30/2024 (Net 30)                               │   |
| │ Hours Billed: 80 hrs (2 weeks @ 40 hrs/week)                │   |
| │ Commission Amount: $1,300.00                                │   |
| │ Payment Date: 12/15/2024                                    │   |
| │ Payment Method: ACH                                         │   |
| │ Payment Reference: ACH-20241215-TS142                       │   |
| │ [View Invoice PDF] [View Payment Receipt]                   │   |
| │                                                             │   |
| │ Invoice #2024-TS-141 (11/01 - 11/14)                        │   |
| │ Status: ✅ PAID                                             │   |
| │ Invoice Date: 11/15/2024                                    │   |
| │ Due Date: 12/15/2024                                        │   |
| │ Hours Billed: 80 hrs                                        │   |
| │ Commission Amount: $1,300.00                                │   |
| │ Payment Date: 12/05/2024                                    │   |
| │ Payment Method: ACH                                         │   |
| │ [View Invoice PDF] [View Payment Receipt]                   │   |
| │                                                             │   |
| │ Invoice #2024-TS-140 (10/15 - 10/31)                        │   |
| │ Status: ✅ PAID                                             │   |
| │ Invoice Date: 11/01/2024                                    │   |
| │ Due Date: 12/01/2024                                        │   |
| │ Hours Billed: 88 hrs (includes 8 OT)                        │   |
| │ Commission Amount: $1,327.60                                │   |
| │ Payment Date: 11/28/2024                                    │   |
| │ Payment Method: ACH                                         │   |
| │ [View Invoice PDF] [View Payment Receipt]                   │   |
| │                                                             │   |
| │ Total Paid to Date: $3,927.60                               │   |
| │ Total Hours Billed: 248 hrs                                 │   |
| │ Average Weekly Commission: $654.60                          │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| [Flag Issue] [Request Rate Change] [View Contract] [Close]      |
+------------------------------------------------------------------+
```

**Commission Calculation Notes:**
- **Net bill amount**: Varies by vendor agreement (some use gross bill, some use net)
- **Pay burden**: For W2 consultants, some vendors exclude burden from commission base
- **Overtime**: Most vendor agreements include OT in commission calculation
- **Volume discounts**: Tier-based discounts if placement volume thresholds met

**Time:** ~2 minutes to review

---

### Step 5: Review Pending Invoices

**User Action:** Navigate to "Pending Invoices" tab or section

**System Response:**
- Shows list of vendor invoices awaiting approval
- Allows filtering by vendor, status, due date

**Pending Invoices List:**

```
+------------------------------------------------------------------+
|  Pending Vendor Invoices                                          |
+------------------------------------------------------------------+
| [All Vendors ▼] [Pending Approval ▼] [Sort by Due Date ▼]       |
+------------------------------------------------------------------+
|                                                                   |
| Invoice #2024-TS-145 | TechStaff Solutions | Due: 01/15/2025     |
| Period: 12/01 - 12/15 | Amount: $4,550.00 | Status: 📋 Pending   |
|                                                                   |
| Placements Included:                                              |
| • Rajesh Kumar (Accenture) - $650                                |
| • Chen Wei (Meta) - $780                                         |
| • David Lee (Microsoft) - $890                                   |
| • Maria Garcia (Apple) - $1,020                                  |
| • Ahmed Ali (Netflix) - $720                                     |
| • Lisa Wong (Uber) - $490                                        |
|                                                                   |
| Total Hours: 320 hrs across 6 placements                         |
|                                                                   |
| ⚠️  Action Required: Verify hours and approve                    |
| [View Invoice PDF] [Verify & Approve] [Flag Issue] [Reject]     |
+------------------------------------------------------------------+
|                                                                   |
| Invoice #2024-GIT-089 | Global IT Partners | Due: 01/30/2025     |
| Period: 11/16 - 11/30 | Amount: $6,840.00 | Status: ⚠️ Issue     |
|                                                                   |
| Placements Included:                                              |
| • Sarah Johnson (Capital One) - $920                             |
| • John Smith (Booz Allen) - $1,150                               |
| • Priya Sharma (Google) - Rate changed, recalc needed            |
| • Michael Brown (Amazon) - $540                                  |
| • Kevin Park (Facebook) - $1,280                                 |
|                                                                   |
| Total Hours: 400 hrs across 5 placements                         |
|                                                                   |
| ⚠️  Issue: Priya Sharma rate changed mid-period                  |
| 🔔 Needs recalculation before approval                            |
| [View Invoice PDF] [Recalculate] [Contact Vendor] [Reject]      |
+------------------------------------------------------------------+
|                                                                   |
| Invoice #2024-SA-067 | StaffAugment Inc | Due: 12/20/2024 ⏰     |
| Period: 11/01 - 11/15 | Amount: $3,100.00 | Status: 🔴 Overdue   |
|                                                                   |
| Placements Included:                                              |
| • Robert Martinez (IBM) - $1,200                                 |
| • Emma Wilson (Oracle) - $950                                    |
| • Carlos Rodriguez (SAP) - $950                                  |
|                                                                   |
| Total Hours: 240 hrs across 3 placements                         |
|                                                                   |
| 🔴 OVERDUE: Payment due 10 days ago                              |
| 📧 Vendor contacted on 12/22 - awaiting Finance approval         |
| [View Invoice PDF] [Approve & Pay Urgently] [Contact Finance]   |
+------------------------------------------------------------------+
| ... 5 more pending invoices ...                                  |
+------------------------------------------------------------------+
| Total Pending: 8 invoices | Total Amount: $29,250                |
+------------------------------------------------------------------+
```

**Invoice Status Types:**
- 📋 **Pending Approval**: Awaiting Bench Sales or Finance review
- ⚠️ **Issue Flagged**: Discrepancy detected, needs resolution
- 🔴 **Overdue**: Past due date, requires urgent action
- ✅ **Approved**: Approved, awaiting payment processing
- 💰 **Paid**: Payment completed

**Time:** ~2-3 minutes to review

---

### Step 6: Verify and Approve Invoice

**User Action:** Click "Verify & Approve" on Invoice #2024-TS-145

**System Response:**
- Opens invoice verification screen
- Shows detailed line-item breakdown
- Compares invoice to system records

**Invoice Verification Screen:**

```
+------------------------------------------------------------------+
|  Verify Invoice - #2024-TS-145                              [×]  |
+------------------------------------------------------------------+
| Vendor: TechStaff Solutions                                       |
| Period: 12/01/2024 - 12/15/2024 (2 weeks)                        |
| Invoice Date: 12/16/2024                                         |
| Due Date: 01/15/2025 (Net 30)                                    |
| Invoice Amount: $4,550.00                                        |
+------------------------------------------------------------------+
|                                                                   |
| Line Item Verification:                                           |
+------------------------------------------------------------------+
| Consultant       | Invoiced    | System Calc | Variance | Status|
|------------------|-------------|-------------|----------|-------|
| Rajesh Kumar     | $650.00     | $650.00     | $0       | ✅ OK |
| (80 hrs @ 10%)   | 80 hrs      | 80 hrs      |          |       |
|------------------|-------------|-------------|----------|-------|
| Chen Wei         | $780.00     | $780.00     | $0       | ✅ OK |
| (80 hrs @ 15%)   | 80 hrs      | 80 hrs      |          |       |
|------------------|-------------|-------------|----------|-------|
| David Lee        | $890.00     | $890.00     | $0       | ✅ OK |
| (80 hrs @ 14%)   | 80 hrs      | 80 hrs      |          |       |
|------------------|-------------|-------------|----------|-------|
| Maria Garcia     | $1,020.00   | $1,020.00   | $0       | ✅ OK |
| (80 hrs @ 16%)   | 80 hrs      | 80 hrs      |          |       |
|------------------|-------------|-------------|----------|-------|
| Ahmed Ali        | $720.00     | $720.00     | $0       | ✅ OK |
| (80 hrs @ 11%)   | 80 hrs      | 80 hrs      |          |       |
|------------------|-------------|-------------|----------|-------|
| Lisa Wong        | $490.00     | $490.00     | $0       | ✅ OK |
| (80 hrs @ 8%)    | 80 hrs      | 80 hrs      |          |       |
+------------------------------------------------------------------+
| TOTALS:          | $4,550.00   | $4,550.00   | $0       | ✅ MATCH|
|                  | 480 hrs     | 480 hrs     |          |       |
+------------------------------------------------------------------+
|                                                                   |
| ✅ All line items verified successfully                          |
| ✅ Total matches system calculation                              |
| ✅ No discrepancies detected                                     |
|                                                                   |
+------------------------------------------------------------------+
| Approval Notes (Optional):                                        |
| [Verified all placements and hours. Invoice matches system   ]   |
| [records. Approved for payment.                              ]   |
| [                                                 ] 0/500         |
|                                                                   |
+------------------------------------------------------------------+
| Next Action:                                                      |
| ● Approve and forward to Finance for payment                     |
| ○ Approve and hold (do not pay yet)                              |
| ○ Flag issue and contact vendor                                  |
| ○ Reject invoice                                                 |
|                                                                   |
+------------------------------------------------------------------+
|                                    [Cancel]  [Approve Invoice →] |
+------------------------------------------------------------------+
```

**Verification Checks:**
1. **Hours match**: Invoiced hours = System recorded hours
2. **Rate match**: Commission rate = Vendor agreement rate
3. **Calculation match**: Invoiced amount = System calculated amount
4. **Consultant status**: All consultants still active during invoice period
5. **Payment terms**: Invoice follows agreement payment terms

**User Action:** Click "Approve Invoice →"

**System Response:**
1. Updates invoice status: Pending → Approved
2. Creates Finance task: "Process payment for Invoice #2024-TS-145"
3. Logs approval activity with user and timestamp
4. Sends notification to Finance team
5. Sends confirmation email to vendor (optional)
6. Updates vendor commission dashboard
7. Toast: "Invoice approved and forwarded to Finance ✓"

**Time:** ~3-5 minutes per invoice

---

### Step 7: Handle Invoice Discrepancy

**User Action:** Click "Recalculate" on Invoice #2024-GIT-089 (Priya Sharma rate change)

**System Response:**
- Opens discrepancy resolution screen
- Shows rate change details
- Allows manual recalculation

**Discrepancy Resolution Screen:**

```
+------------------------------------------------------------------+
|  Resolve Invoice Discrepancy - #2024-GIT-089                [×]  |
+------------------------------------------------------------------+
| Vendor: Global IT Partners                                        |
| Issue: Rate changed mid-invoice period                           |
| Consultant: Priya Sharma (Full Stack Developer)                  |
| Placement: Google - Bay Area                                     |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Rate Change Timeline                                        │   |
| │                                                             │   |
| │ Original Rate (10/01 - 12/07):                              │   |
| │ • Bill Rate: $110/hr                                        │   |
| │ • Commission: 18% = $1,150/week (based on net)             │   |
| │                                                             │   |
| │ New Rate (12/08 - present):                                 │   |
| │ • Bill Rate: $120/hr (client approved increase)            │   |
| │ • Commission: 18% = $1,260/week (based on net)             │   |
| │                                                             │   |
| │ Invoice Period: 11/16 - 11/30 (2 weeks)                     │   |
| │ Rate Change Date: 12/08 (AFTER invoice period)             │   |
| │                                                             │   |
| │ ⚠️  Issue: Vendor invoiced at NEW rate, but invoice period  │   |
| │    ended BEFORE rate change. Should use OLD rate.           │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Calculation Comparison                                      │   |
| │                                                             │   |
| │ Vendor Invoice:                                             │   |
| │ • 80 hrs @ $120/hr bill rate                                │   |
| │ • Commission: 18% of net = $1,260/week × 2 = $2,520        │   |
| │                                                             │   |
| │ System Calculation (Correct):                               │   |
| │ • 80 hrs @ $110/hr bill rate (old rate during period)       │   |
| │ • Commission: 18% of net = $1,150/week × 2 = $2,300        │   |
| │                                                             │   |
| │ Discrepancy: $220 overcharge                                │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
| Resolution Options:                                               |
| ● Contact vendor to correct invoice (recommended)                |
| ○ Manually override and pay correct amount ($2,300)              |
| ○ Approve as-is (accept $220 overcharge)                         |
| ○ Reject invoice and request resubmission                        |
|                                                                   |
| Notes for Vendor:                                                 |
| [The invoice period (11/16-11/30) ended before the rate      ]   |
| [change effective date (12/08). Please resubmit invoice with ]   |
| [correct rate of $110/hr for this period. The new $120/hr    ]   |
| [rate will apply to the next invoice period (12/01 onwards). ]   |
| [                                                 ] 287/1000      |
|                                                                   |
+------------------------------------------------------------------+
|                          [Cancel]  [Contact Vendor & Reject →]   |
+------------------------------------------------------------------+
```

**User Action:** Click "Contact Vendor & Reject →"

**System Response:**
1. Rejects invoice with status: Rejected - Rate Discrepancy
2. Sends email to vendor with explanation and notes
3. Creates follow-up task: "Await corrected invoice from Global IT Partners"
4. Logs rejection activity
5. Notifies Bench Sales Manager
6. Toast: "Invoice rejected and vendor notified ✓"

**Time:** ~5-10 minutes

---

### Step 8: Monthly Commission Reconciliation

**User Action:** Navigate to "Monthly Reconciliation" report (typically Finance-driven)

**System Response:**
- Generates month-end commission report
- Compares invoices to placements
- Identifies discrepancies and missing invoices

**Monthly Reconciliation Report:**

```
+------------------------------------------------------------------+
|  Monthly Commission Reconciliation - November 2024               |
+------------------------------------------------------------------+
| Report Generated: 12/01/2024 9:00 AM                             |
| Period: 11/01/2024 - 11/30/2024                                  |
+------------------------------------------------------------------+
|                                                                   |
| ┌────────────────────────────────────────────────────────────┐   |
| │ Summary                                                     │   |
| │                                                             │   |
| │ Total Active Placements: 23                                 │   |
| │ Total Expected Commission: $55,360                          │   |
| │ Total Invoiced: $54,800                                     │   |
| │ Total Paid: $51,200                                         │   |
| │ Total Outstanding: $3,600                                   │   |
| │                                                             │   |
| │ Discrepancies: 2                                            │   |
| │ Missing Invoices: 1                                         │   |
| │ Overdue Invoices: 3                                         │   |
| └────────────────────────────────────────────────────────────┘   |
|                                                                   |
+------------------------------------------------------------------+
| Vendor Reconciliation Detail:                                     |
+------------------------------------------------------------------+
| Vendor              | Expected | Invoiced | Paid   | Variance   |
|---------------------|----------|----------|--------|------------|
| TechStaff Solutions | $18,200  | $18,200  |$18,200 | ✅ $0      |
| Global IT Partners  | $12,400  | $12,180  |$12,180 | ⚠️ -$220   |
| StaffAugment Inc    | $9,600   | $9,600   | $6,500 | 🔴 -$3,100 |
| ConsultPro LLC      | $6,800   | $6,800   | $6,800 | ✅ $0      |
| Elite Staffing      | $4,200   | $4,200   | $4,200 | ✅ $0      |
| VendorHub Inc       | $2,560   | $0       | $0     | ⚠️ -$2,560 |
| QuickHire Partners  | $1,600   | $1,600   | $1,600 | ✅ $0      |
+------------------------------------------------------------------+
| Total               | $55,360  | $52,580  |$49,480 | -$2,780    |
+------------------------------------------------------------------+
|                                                                   |
| Issues to Resolve:                                                |
+------------------------------------------------------------------+
| 1. Global IT Partners: -$220 variance                            |
|    • Cause: Rate discrepancy (Priya Sharma placement)            |
|    • Status: Invoice rejected, awaiting correction               |
|    • Action: Follow up with vendor                               |
|                                                                   |
| 2. StaffAugment Inc: $3,100 overdue                              |
|    • Cause: Invoice approved but payment delayed                 |
|    • Status: Escalated to Finance                                |
|    • Action: Process payment urgently                            |
|                                                                   |
| 3. VendorHub Inc: $2,560 missing invoice                         |
|    • Cause: Vendor has not submitted invoice for November        |
|    • Status: Contacted vendor on 11/28                           |
|    • Action: Follow up and request invoice                       |
+------------------------------------------------------------------+
| [Download Full Report] [Export to Excel] [Send to Finance]       |
+------------------------------------------------------------------+
```

**Reconciliation Checks:**
1. **Placement coverage**: Every active placement has corresponding invoice
2. **Rate accuracy**: Invoiced rates match vendor agreements
3. **Hours accuracy**: Invoiced hours match timesheet records
4. **Payment timeliness**: Invoices paid within payment terms
5. **Discrepancy resolution**: All variances explained and documented

**Time:** ~30-60 minutes per month

---

## Field Specifications

### Commission Agreement Terms

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Commission Type | Dropdown | Yes | Percentage, Fixed, Tiered | How commission calculated |
| Commission Rate | Percentage | Yes | 0-50% | % of bill or net amount |
| Base Calculation | Dropdown | Yes | Gross Bill, Net Bill | What rate applies to |
| Payment Terms | Dropdown | Yes | Net 15/30/45/60 | Days until payment due |
| Invoice Frequency | Dropdown | Yes | Weekly, Bi-weekly, Monthly | How often invoiced |
| Minimum Hours | Number | No | 0-80 | Guaranteed hours per week |
| Volume Discount | Percentage | No | 0-10% | Discount if volume thresholds met |
| Overtime Included | Checkbox | Yes | - | Commission on OT hours |

### Invoice Fields

| Field | Required | Validation | Notes |
|-------|----------|------------|-------|
| Invoice Number | Yes | Unique | Vendor's invoice ID |
| Invoice Date | Yes | Cannot be future | Date invoice created |
| Period Start | Yes | Date | Billing period start |
| Period End | Yes | Date > Start | Billing period end |
| Due Date | Yes | Date ≥ Invoice Date | Payment due date |
| Total Amount | Yes | Currency >0 | Total commission owed |
| Line Items | Yes | Min 1 | Per-consultant breakdown |
| Payment Status | Yes | Enum | Pending/Approved/Paid/Rejected |

---

## Postconditions

### Success Postconditions

1. **Invoice verified** and approved/rejected
2. **Payment processed** (if approved)
3. **Vendor notified** of approval or rejection
4. **Finance task created** for payment processing
5. **Commission dashboard updated** with latest status
6. **Reconciliation report** generated for month-end
7. **Audit trail logged** for all actions

### Failure Postconditions

1. **Invoice rejected** with reason documented
2. **Vendor contacted** for correction
3. **Follow-up task created** to track resolution
4. **Manager notified** of issue
5. **Payment held** until discrepancy resolved

---

## Events Logged

| Event | Payload |
|-------|---------|
| `vendor_commission.invoice_received` | `{ invoice_id, vendor_id, amount, period_start, period_end, timestamp }` |
| `vendor_commission.invoice_approved` | `{ invoice_id, approved_by, amount, due_date, timestamp }` |
| `vendor_commission.invoice_rejected` | `{ invoice_id, rejected_by, reason, timestamp }` |
| `vendor_commission.payment_processed` | `{ invoice_id, payment_amount, payment_method, payment_ref, timestamp }` |
| `vendor_commission.discrepancy_detected` | `{ invoice_id, placement_id, expected_amount, invoiced_amount, variance, timestamp }` |
| `vendor_commission.rate_change` | `{ placement_id, old_rate, new_rate, effective_date, timestamp }` |
| `vendor_commission.reconciliation_completed` | `{ period, total_expected, total_invoiced, total_paid, variance_count, timestamp }` |

---

## Error Scenarios

| Scenario | Cause | System Response | User Action |
|----------|-------|-----------------|-------------|
| **Invoice amount mismatch** | Vendor invoiced wrong amount | Flag discrepancy, highlight variance | Review calculation, contact vendor |
| **Missing line items** | Vendor didn't include all placements | Show missing placements | Contact vendor to resubmit |
| **Rate change mid-period** | Bill rate changed during invoice period | Pro-rate calculation, show breakdown | Verify correct pro-ration, approve/reject |
| **Duplicate invoice** | Vendor submitted same invoice twice | Detect duplicate, warn user | Mark as duplicate, reject second invoice |
| **Overdue payment** | Invoice past due date | Flag as overdue, notify Finance | Escalate to Finance for urgent payment |
| **Vendor not in system** | Invoice from unknown vendor | Reject invoice | Verify vendor, onboard if legitimate |
| **Placement ended early** | Consultant terminated mid-period | Adjust commission calculation | Verify end date, recalculate commission |
| **Consultant hours mismatch** | Timesheet doesn't match invoice | Flag hours discrepancy | Review timesheets, contact vendor |
| **Payment failed** | ACH transfer failed | Retry payment, notify Finance | Contact vendor for updated bank info |
| **Commission terms changed** | Vendor agreement updated | Use new terms going forward | Apply old terms to old periods, new to new |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g then c` | Go to Commission Dashboard |
| `v` | Verify selected invoice |
| `a` | Approve selected invoice |
| `r` | Reject selected invoice |
| `f` | Flag issue on selected invoice |
| `p` | View payment details |
| `Enter` | Open selected invoice |
| `Esc` | Close invoice detail |
| `Cmd/Ctrl + E` | Export report |

---

## Alternative Flows

### A1: Tiered Commission Structure

**Scenario:** Vendor has tiered commission based on placement volume

**Vendor Agreement Terms:**
- Tier 1 (1-5 placements): 15% commission
- Tier 2 (6-10 placements): 12% commission
- Tier 3 (11+ placements): 10% commission

**System Calculation:**
1. Count active placements for vendor in current month
2. Determine tier based on count
3. Apply appropriate commission rate to each placement
4. Recalculate if placement count changes mid-month

**Example:**
- November 1-15: 5 placements → Tier 1 (15%)
- November 16-30: 7 placements → Tier 2 (12%)
- System pro-rates commission for placements active during tier change

### A2: Fixed Commission per Placement

**Scenario:** Vendor receives fixed fee per placement, not percentage

**Vendor Agreement Terms:**
- Junior roles: $500/month per placement
- Mid-level roles: $800/month per placement
- Senior roles: $1,200/month per placement

**System Calculation:**
1. Classify consultant by level (Junior/Mid/Senior)
2. Apply fixed fee per classification
3. Pro-rate if placement starts/ends mid-month
4. No calculation based on hours or bill rate

### A3: Revenue Share Model

**Scenario:** Vendor receives % of InTime's margin (not bill rate)

**Vendor Agreement Terms:**
- Vendor receives 40% of InTime's net margin
- Net margin = Bill Rate - (Pay Rate + Burden)

**Example:**
- Bill Rate: $100/hr
- Pay Rate: $70/hr
- Burden: $10/hr
- Net Margin: $100 - $80 = $20/hr
- Vendor Commission: 40% × $20 = $8/hr

**System Calculation:**
1. Calculate InTime net margin per placement
2. Apply vendor's revenue share %
3. Invoice commission based on margin, not bill rate

### A4: Annual Reconciliation and True-Up

**Trigger:** End of calendar year or contract year

**System Actions:**
1. Calculate total annual commission paid to vendor
2. Compare to volume commitments in agreement
3. If volume met: Apply discount retrospectively
4. If volume not met: Invoice vendor for shortfall OR adjust future rates

**Example:**
- Agreement: If 100+ placements/year, reduce all commission by 2%
- Actual: 127 placements made
- True-up: Calculate 2% refund on all year's commission
- System generates credit memo: -$5,400
- Apply credit to next year's invoices

### A5: Commission Dispute Resolution

**Trigger:** Vendor disputes invoice rejection or payment amount

**Flow:**
1. Vendor submits dispute via email or phone
2. Bench Sales Recruiter logs dispute in system
3. System creates "Dispute" task assigned to Bench Manager
4. Manager reviews:
   - Original invoice
   - System calculation
   - Vendor agreement terms
   - Communication history
5. Manager makes decision:
   - **Vendor correct**: Approve payment, apologize
   - **InTime correct**: Provide detailed explanation to vendor
   - **Compromise**: Negotiate settlement (e.g., split difference)
6. Document resolution and update invoice
7. If unresolved: Escalate to Regional Director or Legal

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Invoice Number | Unique | "Duplicate invoice number. This invoice was already submitted." |
| Invoice Date | Cannot be future | "Invoice date cannot be in the future" |
| Period End | Must be ≥ Period Start | "Period end date must be after start date" |
| Total Amount | Must be >0 | "Invoice amount must be greater than 0" |
| Line Items | At least 1 | "Invoice must include at least one line item" |
| Commission Rate | 0-50% | "Commission rate must be between 0% and 50%" |
| Payment Terms | Valid option | "Invalid payment terms. Must be Net 15/30/45/60" |

---

## Business Rules

### Payment Priority

1. **Urgent**: Overdue invoices (past due date)
2. **High**: Invoices due within 7 days
3. **Normal**: Invoices due within 30 days
4. **Low**: Invoices due >30 days

### Approval Workflow

| Invoice Amount | Approval Required |
|----------------|-------------------|
| <$5,000 | Bench Sales Recruiter |
| $5,000-$10,000 | Bench Sales Manager |
| $10,000-$50,000 | Regional Director |
| >$50,000 | CFO |

### Discrepancy Tolerance

- **Auto-approve**: Variance ≤$10 or ≤1%
- **Flag for review**: Variance $10-100 or 1-5%
- **Reject automatically**: Variance >$100 or >5%

### Commission Accrual

- **Accrual starts**: First day of placement
- **Accrual ends**: Last day of placement OR end of invoice period
- **Pro-ration**: Daily pro-ration for partial weeks
- **Holiday weeks**: Full commission if consultant billed any hours

---

## Related Use Cases

- [13-manage-vendors.md](./13-manage-vendors.md) - Managing vendor relationships
- [14-onboard-vendor.md](./14-onboard-vendor.md) - Negotiating commission terms
- [15-vendor-bench-import.md](./15-vendor-bench-import.md) - Importing vendor consultants
- [10-make-placement.md](./10-make-placement.md) - Creating placements that generate commission
- [19-post-placement.md](./19-post-placement.md) - Managing active placements

---

*Last Updated: 2024-11-30*
