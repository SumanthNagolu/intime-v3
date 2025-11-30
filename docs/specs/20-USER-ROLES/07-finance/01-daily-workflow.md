# Use Case: Finance Daily Workflow

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-FIN-001 |
| Actor | Finance/CFO |
| Goal | Complete daily financial operations and monitoring tasks |
| Frequency | Daily (Monday-Friday) |
| Estimated Time | 6-8 hours (full workday) |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Finance/CFO
2. User has all finance permissions
3. Database integrations active (QuickBooks, ADP/Gusto, Banking)
4. Previous day's data has been synced
5. Email notifications enabled

---

## Trigger

One of the following:
- Start of business day (8:00 AM)
- Email notification of pending approvals
- Alert for overdue invoices
- Scheduled task reminder
- Executive request for financial data

---

## Main Flow: Morning Routine (8:00 AM - 10:00 AM)

### Step 1: Log In and Navigate to Finance Dashboard

**User Action:** Open InTime OS, log in, navigate to Finance Dashboard

**System Response:**
- User authenticated
- URL changes to: `/employee/finance/dashboard`
- Dashboard loads with latest data
- Loading indicators show for 500ms-1s
- KPI widgets populate

**Screen State:**
```
+----------------------------------------------------------+
| Finance Dashboard                    [📅 Nov 30, 2025]    |
+----------------------------------------------------------+
| 🔔 3 Pending Approvals    ⚠️  2 Overdue Invoices         |
+----------------------------------------------------------+
| Cash Position          AR Aging           Margin %        |
| ┌────────────────┐    ┌────────────┐    ┌───────────┐   |
| │ $2,450,000     │    │ 0-30: 65%  │    │   28.5%   │   |
| │ ↑ $50k vs ytd  │    │ 31-60: 22% │    │ ↑ 2.3% MoM│   |
| │                │    │ 61-90: 8%  │    │           │   |
| │ Daily Deposits │    │ 90+: 5% ⚠️ │    │ Target:25%│   |
| │ $85,000        │    │            │    │           │   |
| └────────────────┘    └────────────┘    └───────────┘   |
|                                                           |
| Recent Activity                    Pending Actions        |
| ┌────────────────────────────┐    ┌───────────────────┐ |
| │ INV-2025-1234 paid $50k    │    │ 3 Commissions     │ |
| │ Commission run approved    │    │ 2 Credit Memos    │ |
| │ Payroll submitted to ADP   │    │ 5 Invoices Review │ |
| └────────────────────────────┘    └───────────────────┘ |
|                                                           |
| Quick Links                                               |
| [Approve Commissions] [Review AR] [Process Invoices]     |
+----------------------------------------------------------+
```

**Time:** ~30 seconds

---

### Step 2: Review Cash Position

**User Action:** Click on "Cash Position" widget to expand details

**System Response:**
- Modal opens showing detailed cash breakdown
- Shows all bank accounts
- Daily deposit details
- Outstanding checks
- Projected cash for next 7/30 days

**Screen State (Expanded):**
```
+----------------------------------------------------------+
| Cash Position Details                               [×]  |
+----------------------------------------------------------+
| As of: Nov 30, 2025 8:15 AM                              |
|                                                           |
| Bank Accounts                                             |
| ┌────────────────────────────────────────────────────┐  |
| │ 🏦 Wells Fargo Operating  ...4321    $1,850,000   │  |
| │ 🏦 Chase Payroll          ...8765      $450,000   │  |
| │ 🏦 BofA Reserve           ...2468      $150,000   │  |
| │                                                     │  |
| │ Total Cash:                          $2,450,000   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Daily Activity (Nov 30)                                   |
| ┌────────────────────────────────────────────────────┐  |
| │ Deposits:                              $85,000     │  |
| │   - Google (INV-1234)       $50,000               │  |
| │   - Meta (INV-1235)         $35,000               │  |
| │                                                     │  |
| │ Withdrawals:                           $25,000     │  |
| │   - Payroll (Nov 15-29)     $20,000               │  |
| │   - Office Rent             $5,000                │  |
| │                                                     │  |
| │ Net Change:                            +$60,000    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| 7-Day Forecast                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Expected Receipts:        $320,000                 │  |
| │ Expected Payments:        $180,000                 │  |
| │ Projected Balance:      $2,590,000                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
|                                           [Export] [Close]|
+----------------------------------------------------------+
```

**User Action:** Review figures, note any anomalies, close modal

**Time:** ~3 minutes

---

### Step 3: Check Pending Invoices and Payments

**User Action:** Click "Review AR" quick link

**System Response:**
- URL changes to: `/employee/finance/ar-aging`
- AR Aging report loads
- Shows invoices grouped by aging bucket
- Highlights overdue items

**Screen State:**
```
+----------------------------------------------------------+
| Accounts Receivable Aging                [Export] [Email] |
+----------------------------------------------------------+
| As of: Nov 30, 2025                      Total AR: $1.2M  |
+----------------------------------------------------------+
| [Current] [0-30] [31-60] [61-90] [90+] [All]            |
+----------------------------------------------------------+
| Aging  Client         Invoice      Amount    Due Date    |
| ─────────────────────────────────────────────────────────|
| ⚠️ 95d  Acme Corp    INV-2023-456  $45,000   Aug 27     |
|        Action: [Send Reminder] [Escalate] [Credit Hold]  |
| ─────────────────────────────────────────────────────────|
| ⚠️ 92d  TechStart    INV-2023-489  $28,500   Aug 30     |
|        Action: [Send Reminder] [Escalate] [Credit Hold]  |
| ─────────────────────────────────────────────────────────|
| 🟡 45d  Google       INV-2024-890  $120,000  Oct 16     |
|        Action: [Send Reminder] [View Details]            |
| ─────────────────────────────────────────────────────────|
| 🟢 15d  Meta         INV-2025-123  $85,000   Nov 15     |
| 🟢 8d   Amazon       INV-2025-145  $62,000   Nov 22     |
|                                                           |
| Summary by Aging                                          |
| 0-30 days:   $780,000 (65%)  ━━━━━━━━━━━━━━━ ✓         |
| 31-60 days:  $264,000 (22%)  ━━━━━━━ 🟡                 |
| 61-90 days:  $96,000  (8%)   ━━━ 🟠                      |
| 90+ days:    $60,000  (5%)   ━━ ⚠️  CRITICAL             |
+----------------------------------------------------------+
```

**User Action:** Note overdue invoices (Acme Corp, TechStart)

**Time:** ~5 minutes

---

### Step 4: Review Commission Disputes and Overrides

**User Action:** Navigate to Commission Approvals via sidebar or quick link

**System Response:**
- URL changes to: `/employee/finance/commissions`
- Commission approval queue loads
- Shows pending commission calculations
- Highlights disputes

**Screen State:**
```
+----------------------------------------------------------+
| Commission Approvals                    [Approve All] [⚙] |
+----------------------------------------------------------+
| Pay Period: Nov 1-15, 2025              Total: $145,000   |
+----------------------------------------------------------+
| [Pending] [Approved] [Disputed] [Paid] [All]             |
+----------------------------------------------------------+
| Status  Recruiter     Type      Amount   Details    Action|
| ─────────────────────────────────────────────────────────|
| 🔴 DIS  Sarah Chen    Placement  $8,500  [View]  [Review] |
|        Dispute: Candidate left in 2 weeks, clawback?     |
| ─────────────────────────────────────────────────────────|
| 🟡 PND  Mike Johnson  Contract   $4,200  [View] [Approve] |
| 🟡 PND  Lisa Wang     Placement  $12,000 [View] [Approve] |
| ─────────────────────────────────────────────────────────|
| ✅ APR  Tom Brown     Contract   $3,800  [View]           |
| ✅ APR  Amy Lee       Placement  $9,500  [View]           |
+----------------------------------------------------------+
```

**User Action:** Click on disputed commission (Sarah Chen)

**System Response:**
- Commission detail modal opens
- Shows placement details
- Shows dispute reason and timeline
- Shows supporting documentation

**Screen State (Detail Modal):**
```
+----------------------------------------------------------+
| Commission Detail - Sarah Chen                       [×] |
+----------------------------------------------------------+
| Status: 🔴 DISPUTED                                       |
| Commission ID: COM-2025-11-0234                           |
|                                                           |
| Placement Details                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ Candidate: John Smith                              │  |
| │ Client: Google                                      │  |
| │ Job: Senior Software Engineer                       │  |
| │ Start Date: Nov 1, 2025                            │  |
| │ End Date: Nov 14, 2025 (Left early)               │  |
| │ Bill Rate: $125/hr                                 │  |
| │ Commission Rate: 10%                               │  |
| │ Calculated: $8,500                                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Dispute Timeline                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Nov 14: Candidate resigned (2 weeks in)           │  |
| │ Nov 15: Sarah flagged for review                  │  |
| │ Nov 16: Recruiting Mgr recommends 50% clawback    │  |
| │ Nov 17: Sarah requested override (full payment)   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Company Policy                                            |
| • 30-day guarantee: Full clawback if <30 days            |
| • 31-60 days: 50% clawback                               |
| • 60-90 days: 25% clawback                               |
| • 90+ days: No clawback                                  |
|                                                           |
| Resolution Options                                        |
| ○ Full Clawback ($8,500)     - Per policy              |
| ○ 50% Clawback ($4,250)      - Partial                 |
| ○ No Clawback (Override)     - Requires CFO approval   |
|                                                           |
| Notes:                                                    |
| [Candidate left for personal reasons, not performance    |
|  issues. Sarah did excellent work. Consider override.]   |
|                                                           |
|                        [Approve Clawback] [Override] [Defer]|
+----------------------------------------------------------+
```

**User Action:** Review policy, check manager notes, decide on full clawback per policy

**User Action:** Click "Approve Clawback"

**System Response:**
- Commission status updated to "Clawback Approved"
- Sarah Chen notified via email
- Recruiting Manager informed
- Activity logged
- Modal closes
- Commission list refreshes

**Time:** ~8 minutes

---

### Step 5: Monitor Financial Alerts and Exceptions

**User Action:** Check notifications bell icon in top nav

**System Response:**
- Dropdown shows recent alerts
- Color-coded by severity

**Screen State:**
```
+----------------------------------------------------------+
|                           [🔔 5] [User ▼] [Cmd+K]        |
+----------------------------------------------------------+
| Notifications                                        [×] |
| ─────────────────────────────────────────────────────────|
| 🔴 CRITICAL  Acme Corp invoice 95 days overdue          |
|              Recommend: Credit hold, escalate to Legal   |
|              [View AR] [Take Action]                     |
| ─────────────────────────────────────────────────────────|
| 🟠 WARNING   Margin on Meta account dropped to 18%      |
|              Target: 25%    Recommend: Review rates      |
|              [View Margin Analysis]                      |
| ─────────────────────────────────────────────────────────|
| 🟡 INFO      Payroll due for approval (Submit by 3pm)   |
|              Total: $145,000 for 12 contractors          |
|              [Review Payroll]                            |
| ─────────────────────────────────────────────────────────|
| 🔵 UPDATE    QuickBooks sync completed (8:05 AM)        |
|              152 transactions synced                     |
| ─────────────────────────────────────────────────────────|
| ✅ SUCCESS   November month-end close completed         |
|              All reports available                       |
|              [View Reports]                              |
+----------------------------------------------------------+
```

**User Action:** Note critical alerts, plan to address Acme Corp after morning tasks

**Time:** ~2 minutes

**Morning Summary:**
- Total time: ~18 minutes
- Key outputs: Cash position confirmed, AR issues identified, commission dispute resolved, alerts noted

---

## Mid-Morning Routine (10:00 AM - 12:00 PM)

### Step 6: Approve Commission Calculations

**User Action:** Return to Commission Approvals screen

**User Action:** Click "Approve All" for non-disputed items

**System Response:**
- Confirmation modal appears
- Shows total amount to approve
- Lists all items

**Screen State (Confirmation):**
```
+----------------------------------------------------------+
| Approve Commission Batch                             [×] |
+----------------------------------------------------------+
| You are about to approve 12 commission payments          |
|                                                           |
| Pay Period: Nov 1-15, 2025                               |
| Total Amount: $136,500                                   |
|                                                           |
| Breakdown by Type:                                        |
| • Placements (8):    $98,500                            |
| • Contract (4):      $38,000                            |
|                                                           |
| Recruiters Affected: 12                                  |
|                                                           |
| ⚠️  This action cannot be undone. Please verify:         |
| ☑️  All placement guarantees verified                    |
| ☑️  No active disputes                                   |
| ☑️  Calculations reviewed by Accounting                  |
|                                                           |
| Once approved, payments will be processed in next        |
| payroll cycle (Dec 1, 2025)                              |
|                                                           |
|                              [Cancel] [✓ Approve Batch]  |
+----------------------------------------------------------+
```

**User Action:** Review totals, click "Approve Batch"

**System Response:**
- Button shows loading spinner
- API processes approvals
- Success toast: "12 commissions approved - $136,500"
- Notification sent to all 12 recruiters
- HR/Payroll team notified
- Activity logged

**Time:** ~5 minutes

---

### Step 7: Process Invoice Adjustments and Credit Memos

**User Action:** Navigate to Invoices section via sidebar

**System Response:**
- URL changes to: `/employee/finance/invoices`
- Invoice list loads

**Screen State:**
```
+----------------------------------------------------------+
| Invoices                           [+ New] [Batch] [Export]|
+----------------------------------------------------------+
| [Search invoices...]                [Filter ▼] [Sort ▼]   |
+----------------------------------------------------------+
| [Pending] [Sent] [Paid] [Overdue] [Disputed] [All]       |
+----------------------------------------------------------+
| Status  Invoice       Client    Amount    Due     Actions |
| ─────────────────────────────────────────────────────────|
| 🔴 ADJ  INV-2025-890 Google    $120,000  Oct 16  [Review] |
|        Adjustment Request: Client disputes 40 hours      |
| ─────────────────────────────────────────────────────────|
| 🟡 PND  INV-2025-901 Meta      $85,000   Nov 15  [Send]   |
| 🟢 PAID INV-2025-234 Amazon    $50,000   Nov 1   [View]   |
+----------------------------------------------------------+
```

**User Action:** Click on invoice needing adjustment (INV-2025-890)

**System Response:**
- Invoice detail opens in workspace
- Shows full invoice details
- Shows adjustment request

**Screen State (Invoice Detail):**
```
+----------------------------------------------------------+
| Invoice INV-2025-890                              [Edit]  |
+----------------------------------------------------------+
| Client: Google                      Status: 🔴 DISPUTED   |
| Issue Date: Oct 1, 2025             Due Date: Oct 16      |
| Amount: $120,000                    Balance: $120,000     |
+----------------------------------------------------------+
|
| Line Items                                                |
| ┌────────────────────────────────────────────────────┐  |
| │ Consultant: Jane Developer                         │  |
| │ Period: Oct 1-15, 2025                            │  |
| │ Hours: 160 @ $125/hr = $20,000                    │  |
| │                                                     │  |
| │ Consultant: Bob Engineer                           │  |
| │ Period: Oct 1-15, 2025                            │  |
| │ Hours: 160 @ $125/hr = $20,000                    │  |
| │                                                     │  |
| │ ... (6 more consultants)                           │  |
| │                                                     │  |
| │ Total Hours: 960                                   │  |
| │ Total Amount: $120,000                            │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| 🔴 Adjustment Request (Nov 15)                           |
| ┌────────────────────────────────────────────────────┐  |
| │ From: Sarah Johnson (Google Procurement)           │  |
| │ Issue: "Bob Engineer worked only 120 hours, not    │  |
| │        160. Please adjust invoice by 40 hours."    │  |
| │                                                     │  |
| │ Supporting Docs:                                    │  |
| │ 📎 Timesheet_correction.pdf                        │  |
| │ 📎 Email_approval_from_manager.pdf                 │  |
| │                                                     │  |
| │ Recommended Action: Credit Memo for $5,000         │  |
| │ (40 hours × $125/hr)                              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
|                   [Reject] [Issue Credit Memo] [Contact Client]|
+----------------------------------------------------------+
```

**User Action:** Review supporting documents, verify timesheet

**User Action:** Click "Issue Credit Memo"

**System Response:**
- Credit memo form opens pre-filled

**Screen State (Credit Memo Form):**
```
+----------------------------------------------------------+
| Issue Credit Memo                                    [×] |
+----------------------------------------------------------+
| Original Invoice: INV-2025-890                           |
| Client: Google                                            |
|                                                           |
| Credit Amount: $5,000.00                                 |
| Reason: Timesheet correction - Bob Engineer             |
|                                                           |
| Description:                                              |
| [Credit for 40 hours ($125/hr) due to timesheet          |
|  correction for Bob Engineer, period Oct 1-15, 2025]     |
|                                                           |
| Accounting:                                               |
| Debit:  Contra Revenue       $5,000.00                  |
| Credit: Accounts Receivable  $5,000.00                  |
|                                                           |
| New Invoice Balance: $115,000.00                         |
|                                                           |
| ☑️  Notify client via email                              |
| ☑️  Notify Account Manager                               |
| ☑️  Sync to QuickBooks                                   |
|                                                           |
|                           [Cancel] [✓ Issue Credit Memo]  |
+----------------------------------------------------------+
```

**User Action:** Review, click "Issue Credit Memo"

**System Response:**
- Credit memo created (CM-2025-0456)
- Original invoice balance updated: $115,000
- Client emailed with credit memo PDF
- Account Manager notified
- QuickBooks synced
- Toast: "Credit memo CM-2025-0456 issued successfully"

**Time:** ~10 minutes

---

### Step 8: Revenue Recognition Review

**User Action:** Navigate to Revenue Reports via sidebar

**System Response:**
- URL changes to: `/employee/finance/revenue`
- Revenue recognition dashboard loads

**Screen State:**
```
+----------------------------------------------------------+
| Revenue Recognition                    [Month ▼] [Export] |
+----------------------------------------------------------+
| Period: November 2025                   ASC 606 Compliant  |
+----------------------------------------------------------+
| Revenue by Type                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Contract/Temp Revenue:     $1,450,000  (72%)       │  |
| │   Recognized ratably over service period           │  |
| │                                                     │  |
| │ Placement Fees:              $560,000  (28%)       │  |
| │   Recognized on start date (ASC 606)               │  |
| │                                                     │  |
| │ Total Revenue (Nov):       $2,010,000              │  |
| │ vs. Oct:                   $1,875,000  (+7.2%)     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Recognition Schedule (Next 30 Days)                       |
| ┌────────────────────────────────────────────────────┐  |
| │ Dec 1:  $48,500   (Daily contract revenue)         │  |
| │ Dec 5:  $65,000   (3 placements starting)          │  |
| │ Dec 15: $48,500   (Daily contract revenue)         │  |
| │ Dec 20: $85,000   (5 placements starting)          │  |
| │                                                     │  |
| │ Projected Dec Revenue: $2,180,000                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Deferred Revenue Balance                                  |
| Current: $125,000  (Prepaid placement fees)              |
|                                                           |
| [View Details] [Generate Report] [Export to QuickBooks]  |
+----------------------------------------------------------+
```

**User Action:** Review revenue figures, note 7.2% growth, verify deferred revenue

**User Action:** Click "Export to QuickBooks"

**System Response:**
- Export initiated
- Journal entries created
- QuickBooks sync confirmed
- Toast: "Revenue journal entries exported to QuickBooks"

**Time:** ~8 minutes

---

### Step 9: Payroll Reconciliation (On Payroll Weeks)

**Note:** This step occurs bi-weekly (every other Thursday)

**User Action:** Navigate to Payroll Reconciliation via sidebar

**System Response:**
- URL changes to: `/employee/finance/payroll`
- Payroll reconciliation screen loads

**Screen State:**
```
+----------------------------------------------------------+
| Payroll Reconciliation                    [Period ▼] [⚙]  |
+----------------------------------------------------------+
| Pay Period: Nov 15 - Nov 29, 2025                        |
| Pay Date: Dec 1, 2025                  Status: 🟡 Review  |
+----------------------------------------------------------+
| InTime Data               ADP Data          Variance      |
| ─────────────────────────────────────────────────────────|
| Total Gross:   $145,000   $145,000             $0   ✓   |
| Total Hours:     2,320      2,320              0    ✓   |
| Employees:          12         12              0    ✓   |
| Total Taxes:    $28,500    $28,350         -$150   ⚠️   |
| Total Net:     $116,500   $116,650         +$150   ⚠️   |
+----------------------------------------------------------+
|
| Variance Details                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠️  Tax Variance: -$150                             │  |
| │    Cause: State tax rate updated in ADP            │  |
| │    Action Required: Update InTime tax tables       │  |
| │                                                     │  |
| │    [Update Tax Tables] [Override] [Contact ADP]    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Employee Detail (Click to expand)                         |
| ┌────────────────────────────────────────────────────┐  |
| │ ✓ Jane Developer      160h  $20,000  Matched       │  |
| │ ✓ Bob Engineer        120h  $15,000  Matched       │  |
| │ ... (10 more)                                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ☐ Reconciliation complete                                |
| ☐ Variances resolved                                     |
| ☐ Journal entries created                                |
|                                                           |
|                      [Update Tax Tables] [Approve Payroll]|
+----------------------------------------------------------+
```

**User Action:** Click "Update Tax Tables"

**System Response:**
- Tax configuration modal opens
- Shows current vs ADP rates
- User confirms update

**User Action:** Click "Approve Payroll" after update

**System Response:**
- Payroll marked as approved
- Journal entries created
- ADP notified to process
- HR team notified
- Toast: "Payroll approved and submitted to ADP"

**Time:** ~15 minutes (on payroll weeks)

---

### Step 10: Meet with Accounting Team

**User Action:** Join scheduled 11:00 AM team meeting (in-person or Zoom)

**Meeting Agenda:**
- Review previous day's financial activity
- Discuss pending issues (AR, disputes, variances)
- Assign tasks for the day
- Review month-end close progress (if end of month)

**Discussion Topics:**
- Acme Corp overdue invoice → Assign to Collections Specialist
- Credit memo issued for Google → Inform team
- Commission approvals complete → Update payroll
- Margin drop on Meta account → Schedule rate review

**Time:** ~30 minutes

**Mid-Morning Summary:**
- Total time: ~68 minutes (1 hour 8 minutes) + 30 min meeting
- Key outputs: Commissions approved, credit memo issued, revenue recognized, payroll reconciled (if applicable)

---

## Afternoon Routine (12:00 PM - 3:00 PM)

### Step 11: Financial Analysis and Reporting

**User Action:** Navigate to Margin Analysis via sidebar

**System Response:**
- URL changes to: `/employee/finance/margin-analysis`
- Margin analysis dashboard loads

**Screen State:**
```
+----------------------------------------------------------+
| Margin Analysis                  [Period ▼] [By ▼] [Export]|
+----------------------------------------------------------+
| Period: November 2025            View By: Account          |
+----------------------------------------------------------+
| Overall Margin: 28.5%  Target: 25%  ✓  Ahead by 3.5%     |
+----------------------------------------------------------+
| Top Accounts by Margin                                    |
| ┌────────────────────────────────────────────────────┐  |
| │ Account      Revenue   Margin %   Margin $   Trend │  |
| │ ──────────────────────────────────────────────────│  |
| │ Apple        $450k     35%        $157k      ↑ 2% │  |
| │ Amazon       $380k     32%        $122k      → 0% │  |
| │ Google       $520k     30%        $156k      ↓ 1% │  |
| │ Meta         $340k     18%  ⚠️    $61k       ↓ 7% │  |
| │ Netflix      $220k     25%        $55k       ↑ 3% │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ⚠️  Alert: Meta margin dropped to 18% (Target: 25%)      |
|                                                           |
| Low Margin Deep Dive - Meta                              |
| ┌────────────────────────────────────────────────────┐  |
| │ Avg Bill Rate: $95/hr                              │  |
| │ Avg Pay Rate:  $78/hr                              │  |
| │ Spread:        $17/hr (17.9%)                      │  |
| │                                                     │  |
| │ Industry Benchmark: $25/hr spread (26%)            │  |
| │ Gap: -$8/hr                                        │  |
| │                                                     │  |
| │ Recommended Actions:                                │  |
| │ • Review and renegotiate bill rates                │  |
| │ • Reduce pay rates on new hires (if competitive)   │  |
| │ • Discuss with Account Manager (Sarah Chen)        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| [View by Pod] [View by Recruiter] [View by Job Type]     |
+----------------------------------------------------------+
```

**User Action:** Note Meta margin issue, schedule meeting with Account Manager

**User Action:** Click "View by Pod"

**Screen State (By Pod):**
```
+----------------------------------------------------------+
| Margin Analysis - By Pod                                  |
+----------------------------------------------------------+
| Pod              Revenue   Margin %   Margin $   Grade   |
| ─────────────────────────────────────────────────────────|
| Recruiting Pod A  $680k    32%        $218k      A       |
|   Mgr: Tom Brown                                          |
| Recruiting Pod B  $550k    28%        $154k      B+      |
|   Mgr: Lisa Wang                                          |
| Bench Sales 1     $420k    25%        $105k      B       |
|   Mgr: Mike Johnson                                       |
| Bench Sales 2     $360k    22%  ⚠️    $79k       C+      |
|   Mgr: Amy Lee   → Schedule Review                       |
+----------------------------------------------------------+
```

**Time:** ~15 minutes

---

### Step 12: Client Billing Review

**User Action:** Navigate back to Invoices section

**User Action:** Click "Batch" button to review this week's billing

**System Response:**
- Batch invoice generation modal opens

**Screen State:**
```
+----------------------------------------------------------+
| Generate Batch Invoices                              [×] |
+----------------------------------------------------------+
| Billing Period: Nov 15 - Nov 29, 2025                    |
+----------------------------------------------------------+
| Approved Timesheets Ready for Billing: 24                |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Client   Consultants  Hours  Est. Amount  Status   │  |
| │ ────────────────────────────────────────────────────│  |
| │ ☑️ Google      5       800    $100,000     ✓ Ready │  |
| │ ☑️ Meta        3       480     $60,000     ✓ Ready │  |
| │ ☑️ Amazon      4       640     $80,000     ✓ Ready │  |
| │ ☑️ Apple       2       320     $44,000     ✓ Ready │  |
| │ ⚠️  Netflix    2       280     $35,000     ⚠️ Issue │  |
| │    → 1 timesheet pending approval                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Total to Invoice: $284,000 (4 clients)                   |
|                                                           |
| Invoice Options:                                          |
| ☑️  Apply standard payment terms (Net 30)                |
| ☑️  Email invoices to client billing contacts            |
| ☑️  CC Account Managers                                  |
| ☑️  Sync to QuickBooks                                   |
| ☐  Mark as Sent immediately                             |
|                                                           |
|                          [Cancel] [Generate Invoices]     |
+----------------------------------------------------------+
```

**User Action:** Uncheck Netflix (pending approval), click "Generate Invoices"

**System Response:**
- System generates 4 invoices
- PDFs created
- Emails sent to clients
- Account Managers CC'd
- QuickBooks synced
- Toast: "4 invoices generated totaling $284,000"

**Time:** ~10 minutes

---

### Step 13: Collections Follow-up

**User Action:** Return to AR Aging report

**User Action:** Click "Send Reminder" on 45-day Google invoice

**System Response:**
- Email template opens

**Screen State (Email Template):**
```
+----------------------------------------------------------+
| Send Payment Reminder                                [×] |
+----------------------------------------------------------+
| To: billing@google.com                                    |
| CC: sarah.johnson@google.com (Procurement)               |
| BCC: accountmanager@intime.com                           |
|                                                           |
| Subject: Payment Reminder - Invoice INV-2024-890         |
|                                                           |
| Template: [45-Day Reminder ▼]                            |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Dear Google Accounts Payable Team,                 │  |
| │                                                     │  |
| │ This is a friendly reminder that invoice           │  |
| │ INV-2024-890 for $120,000 is now 45 days past the │  |
| │ due date of October 16, 2025.                      │  |
| │                                                     │  |
| │ Invoice Details:                                    │  |
| │ - Invoice Number: INV-2024-890                     │  |
| │ - Amount: $120,000.00                              │  |
| │ - Original Due Date: October 16, 2025             │  |
| │ - Days Overdue: 45                                 │  |
| │                                                     │  |
| │ Please remit payment at your earliest convenience. │  |
| │ If payment has already been sent, please disregard │  |
| │ this notice and reply with payment details.        │  |
| │                                                     │  |
| │ If there are any issues with this invoice, please  │  |
| │ contact us immediately so we can resolve them.     │  |
| │                                                     │  |
| │ Thank you for your prompt attention to this matter.│  |
| │                                                     │  |
| │ Best regards,                                       │  |
| │ [Your Name]                                         │  |
| │ CFO, InTime Solutions                              │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Attachments: 📎 INV-2024-890.pdf                         |
|                                                           |
|                                  [Cancel] [Send Reminder] |
+----------------------------------------------------------+
```

**User Action:** Review, click "Send Reminder"

**System Response:**
- Email sent
- Activity logged on invoice
- Follow-up task created for 1 week out
- Toast: "Payment reminder sent to Google"

**User Action:** Click "Escalate" on 95-day Acme Corp invoice

**System Response:**
- Escalation workflow opens

**Screen State (Escalation):**
```
+----------------------------------------------------------+
| Escalate Overdue Invoice                             [×] |
+----------------------------------------------------------+
| Invoice: INV-2023-456                                     |
| Client: Acme Corp                                         |
| Amount: $45,000                                           |
| Days Overdue: 95                                          |
+----------------------------------------------------------+
| Escalation Level:                                         |
| ○ Level 1: Account Manager (0-60 days)                  |
| ○ Level 2: CFO (61-90 days) - Completed                 |
| ● Level 3: Legal/Collections (90+ days) ← RECOMMENDED   |
| ○ Level 4: Write-off                                     |
|                                                           |
| Actions to Take:                                          |
| ☑️  Place account on credit hold (no new work)           |
| ☑️  Send final demand letter (certified mail)            |
| ☑️  Engage collections agency (XYZ Collections)          |
| ☐  Refer to legal counsel                               |
| ☐  Write off as bad debt                                |
|                                                           |
| Notes:                                                    |
| [Multiple payment reminders sent. Client unresponsive.   |
|  Account Manager unable to reach decision maker.         |
|  Recommend immediate credit hold and collections.]       |
|                                                           |
|                            [Cancel] [✓ Escalate to Legal] |
+----------------------------------------------------------+
```

**User Action:** Check all boxes except write-off, click "Escalate to Legal"

**System Response:**
- Account placed on credit hold
- Legal team notified
- Collections agency engaged
- Final demand letter generated
- Account Manager notified
- Toast: "Invoice escalated to legal. Account on credit hold."

**Time:** ~15 minutes

---

### Step 14: Budget vs Actual Variance Analysis

**User Action:** Navigate to Budget & Forecast via sidebar

**System Response:**
- URL changes to: `/employee/finance/budget-actual`
- Budget variance report loads

**Screen State:**
```
+----------------------------------------------------------+
| Budget vs Actual                    [Month ▼] [Export]    |
+----------------------------------------------------------+
| Period: November 2025               YTD: Jan - Nov         |
+----------------------------------------------------------+
| Revenue                                                   |
| ┌────────────────────────────────────────────────────┐  |
| │                Budget    Actual    Variance    %   │  |
| │ ──────────────────────────────────────────────────│  |
| │ Nov 2025      $1,950k   $2,010k    +$60k   ✓ +3%  │  |
| │ YTD 2025     $20,500k  $21,200k   +$700k   ✓ +3%  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Expenses                                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ Category       Budget    Actual    Variance    %   │  |
| │ ──────────────────────────────────────────────────│  |
| │ Payroll       $1,250k   $1,280k    -$30k   ⚠️ -2%  │  |
| │ Commissions    $180k     $175k     +$5k    ✓ +3%  │  |
| │ Marketing       $50k      $48k     +$2k    ✓ +4%  │  |
| │ Technology      $40k      $42k     -$2k    ⚠️ -5%  │  |
| │ Rent/Util       $25k      $25k       $0    ✓  0%  │  |
| │ ──────────────────────────────────────────────────│  |
| │ Total        $1,545k   $1,570k    -$25k   ⚠️ -2%  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Operating Income (EBITDA)                                 |
| Budget: $405k    Actual: $440k    Variance: +$35k ✓ +9%  |
|                                                           |
| Key Variances:                                            |
| ⚠️  Payroll over budget by $30k                          |
|    → Cause: 2 unplanned hires in October                |
| ⚠️  Technology over budget by $2k                        |
|    → Cause: New CRM licenses                            |
| ✓  Revenue ahead of budget by $60k                      |
|    → Cause: 3 unexpected placements                     |
|                                                           |
| [View Details] [Update Forecast] [Export to Board Report]|
+----------------------------------------------------------+
```

**User Action:** Note variances, prepare explanation for CEO meeting

**Time:** ~10 minutes

---

**Afternoon Summary:**
- Total time: ~50 minutes
- Key outputs: Margin analysis complete, invoices generated, collections escalated, budget review done

---

## Late Afternoon Routine (3:00 PM - 5:00 PM)

### Step 15: Executive Reporting and Dashboards

**User Action:** Generate weekly financial snapshot for CEO

**User Action:** Navigate to Reports section, click "Create Report"

**System Response:**
- Report builder opens

**Screen State:**
```
+----------------------------------------------------------+
| Create Financial Report                              [×] |
+----------------------------------------------------------+
| Report Type: [Weekly Executive Summary ▼]                |
| Recipient: [CEO - John Smith ▼]                          |
| Period: Nov 24 - Nov 30, 2025                            |
+----------------------------------------------------------+
| Include Sections:                                         |
| ☑️  Revenue Summary                                      |
| ☑️  Cash Position                                        |
| ☑️  AR Aging                                             |
| ☑️  Margin Analysis                                      |
| ☑️  Budget vs Actual                                     |
| ☑️  Key Metrics (DSO, Gross Margin %)                    |
| ☑️  Alerts & Action Items                                |
| ☐  Detailed P&L                                         |
| ☐  Balance Sheet                                        |
|                                                           |
| Format: ● PDF  ○ Excel  ○ PowerPoint                    |
|                                                           |
| Delivery:                                                 |
| ☑️  Email to recipient                                   |
| ☑️  Save to shared drive                                 |
| ☐  Print                                                |
|                                                           |
|                             [Cancel] [Generate Report]    |
+----------------------------------------------------------+
```

**User Action:** Review selections, click "Generate Report"

**System Response:**
- Report generation begins (takes 10-15 seconds)
- Progress bar shows
- PDF created
- Email sent to CEO
- Copy saved to drive
- Toast: "Weekly executive report sent to CEO"

**Report Preview:**
```
╔══════════════════════════════════════════════════════════╗
║         InTime Solutions - Weekly Financial Snapshot     ║
║                     Nov 24-30, 2025                      ║
╚══════════════════════════════════════════════════════════╝

REVENUE SUMMARY
────────────────────────────────────────────────────────────
This Week:           $465,000
Last Week:           $420,000    (+10.7% WoW)
Month to Date:     $2,010,000
Year to Date:     $21,200,000    (+3.4% vs Budget)

CASH POSITION
────────────────────────────────────────────────────────────
Current Balance:   $2,450,000
Daily Deposits:       $85,000
7-Day Forecast:    $2,590,000    (+$140k projected)

AR AGING
────────────────────────────────────────────────────────────
Total AR:          $1,200,000
  0-30 days:         $780,000    (65%) ✓
  31-60 days:        $264,000    (22%)
  61-90 days:         $96,000     (8%)
  90+ days:           $60,000     (5%) ⚠️ ACTION NEEDED

DSO: 42 days (Target: ≤45) ✓

MARGIN ANALYSIS
────────────────────────────────────────────────────────────
Gross Margin %:           28.5%  (Target: 25%) ✓
Week over Week:           +0.2%

⚠️  Alert: Meta account margin dropped to 18%
   Recommendation: Rate review scheduled with AM

BUDGET VARIANCE
────────────────────────────────────────────────────────────
Revenue:     +$60k ahead (+3%)   ✓
Expenses:    -$25k over budget   ⚠️
EBITDA:      +$35k ahead (+9%)   ✓

ALERTS & ACTION ITEMS
────────────────────────────────────────────────────────────
🔴 CRITICAL
   • Acme Corp invoice 95 days overdue ($45k)
     → Escalated to legal, account on credit hold

🟠 WARNING
   • Meta margin below target (18% vs 25%)
     → Rate review meeting scheduled for Dec 1

✅ COMPLETED
   • 12 commissions approved ($136.5k)
   • 4 invoices generated ($284k)
   • November revenue recognition complete

────────────────────────────────────────────────────────────
Prepared by: CFO
Date: Nov 30, 2025 4:15 PM
```

**Time:** ~10 minutes

---

### Step 16: Strategic Planning and Forecasting

**User Action:** Update Q1 2026 forecast based on pipeline

**User Action:** Navigate to Forecast section

**Screen State:**
```
+----------------------------------------------------------+
| Financial Forecast                    [Period ▼] [Export] |
+----------------------------------------------------------+
| Current View: Q1 2026 (Jan - Mar)                        |
+----------------------------------------------------------+
| Revenue Forecast                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Source           Jan       Feb       Mar    Total  │  |
| │ ────────────────────────────────────────────────────│  |
| │ Contract Rev   $1,450k   $1,500k   $1,550k  $4,500k│  |
| │ Placement Fees   $520k     $550k     $580k  $1,650k│  |
| │ ────────────────────────────────────────────────────│  |
| │ Total          $1,970k   $2,050k   $2,130k  $6,150k│  |
| │                                                     │  |
| │ vs Q1 2025: +12%                                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Assumptions:                                              |
| • 8 new placements per month @ avg $65k fee             |
| • Contract consultants: 35 active (growing from 32)     |
| • Average bill rate: $125/hr (no change)                |
| • 5% organic growth in existing accounts                |
|                                                           |
| Confidence Level: ███████░░░ 75% (Medium-High)           |
|                                                           |
| Risk Factors:                                             |
| ⚠️  Meta contract up for renewal in Feb (20% of revenue)  |
| ⚠️  2 key recruiters on maternity leave Q1               |
| ✓  Strong pipeline: 45 active jobs                      |
| ✓  3 new client accounts closing in Dec                 |
|                                                           |
| [Update Assumptions] [Run Scenarios] [Save Forecast]     |
+----------------------------------------------------------+
```

**User Action:** Click "Update Assumptions"

**User Action:** Adjust placement count to 10/month based on pipeline

**User Action:** Click "Save Forecast"

**System Response:**
- Forecast updated
- Revenue projections recalculated
- Toast: "Q1 2026 forecast updated"

**Time:** ~15 minutes

---

### Step 17: Meet with CEO/Leadership Team

**User Action:** Join 4:00 PM leadership meeting (scheduled)

**Meeting Agenda:**
- Review weekly financial snapshot
- Discuss Acme Corp collections issue
- Present Meta margin analysis
- Q1 forecast review
- Strategic initiatives

**Key Discussion Points:**
- Revenue ahead of budget by 3% YTD
- Recommend rate increase for Meta account
- Collections process for 90+ day invoices
- Q1 hiring plan impact on expenses

**Time:** ~45 minutes

---

### Step 18: Review Financial Controls and Processes

**User Action:** Perform daily control checks (EOD routine)

**Checklist:**
```
Daily Financial Controls Checklist - Nov 30, 2025
────────────────────────────────────────────────────

CASH MANAGEMENT
☑️  Bank balances reconciled
☑️  Daily deposits verified
☑️  Outstanding checks reviewed
☑️  Cash forecast updated

ACCOUNTS RECEIVABLE
☑️  Invoices generated and sent
☑️  Payments applied correctly
☑️  AR aging reviewed
☑️  Collections actions taken

ACCOUNTS PAYABLE
☑️  Vendor invoices reviewed
☑️  Payment approvals processed
☐  Upcoming payments scheduled (Tomorrow)

PAYROLL (If applicable)
☑️  Timesheets approved
☑️  Payroll reconciled with ADP
☑️  Payroll approved for processing

REVENUE RECOGNITION
☑️  Daily contract revenue recognized
☑️  Placement fees verified
☑️  Deferred revenue reviewed

COMMISSIONS
☑️  Commission approvals completed
☑️  Disputes resolved
☑️  Clawbacks processed

INTEGRATIONS
☑️  QuickBooks sync verified
☑️  ADP sync verified
☐  Banking integration check (Scheduled nightly)

COMPLIANCE
☑️  No unusual transactions flagged
☑️  Approval workflows followed
☑️  Audit trail intact
```

**Time:** ~10 minutes

---

### Step 19: International Accounting Review (If Applicable)

**Note:** This step applies to multi-region operations

**User Action:** Navigate to International Accounting section

**Screen State:**
```
+----------------------------------------------------------+
| International Accounting                [Region ▼] [Export]|
+----------------------------------------------------------+
| Regions: US (HQ) | UK | India | Canada                   |
+----------------------------------------------------------+
| Multi-Currency Dashboard                                  |
| ┌────────────────────────────────────────────────────┐  |
| │ Region   Revenue (Local)  Revenue (USD)  P&L      │  |
| │ ────────────────────────────────────────────────────│  |
| │ US       $1,450,000 USD   $1,450,000    +$285k   │  |
| │ UK         £285,000 GBP     $360,000    +$58k    │  |
| │ India   ₹12,500,000 INR     $150,000    +$22k    │  |
| │ Canada     $65,000 CAD       $50,000    +$8k     │  |
| │ ────────────────────────────────────────────────────│  |
| │ Total                      $2,010,000   +$373k    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Exchange Rates (as of Nov 30, 2025)                      |
| GBP/USD: 1.2632  INR/USD: 83.45  CAD/USD: 0.7692        |
|                                                           |
| Currency Gain/Loss (Nov):                                 |
| Total: -$2,450 (Unrealized)                              |
|                                                           |
| Intercompany Transactions                                 |
| • UK → US: $25,000 (Management fees)                    |
| • US → India: $15,000 (Technology services)             |
| Status: ✓ All reconciled                                 |
+----------------------------------------------------------+
```

**Time:** ~8 minutes (if applicable)

---

### Step 20: End of Day Wrap-Up

**User Action:** Review task list, mark completions, plan tomorrow

**Task Review:**
```
Today's Tasks - Nov 30, 2025
────────────────────────────────────────────────────

COMPLETED ✓
✓ Review cash position
✓ Check AR aging
✓ Approve commissions ($136.5k)
✓ Resolve commission dispute (Sarah Chen clawback)
✓ Issue credit memo for Google ($5k)
✓ Generate weekly invoices ($284k)
✓ Send payment reminder to Google
✓ Escalate Acme Corp to legal
✓ Review margin analysis (Meta issue identified)
✓ Payroll reconciliation
✓ Generate CEO weekly report
✓ Update Q1 forecast
✓ Daily controls checklist

PENDING FOR TOMORROW
○ Follow up with Meta Account Manager (rate review)
○ Schedule meeting with Bench Sales Pod 2 (low margin)
○ Review month-end close checklist (Dec prep)
○ Approve vendor invoices ($8,500)

BLOCKED
⚠️  Acme Corp collections (waiting on legal)
```

**User Action:** Log out, end workday

**Time:** ~5 minutes

**Late Afternoon Summary:**
- Total time: ~93 minutes + 45 min meeting
- Key outputs: CEO report generated, forecast updated, controls verified

---

## Postconditions

1. ✅ All daily financial operations completed
2. ✅ Cash position verified and reconciled
3. ✅ AR aging reviewed, collections actions taken
4. ✅ Commissions approved and disputes resolved
5. ✅ Invoices generated and sent to clients
6. ✅ Credit memos issued as needed
7. ✅ Payroll reconciled (if payroll week)
8. ✅ Revenue recognition current
9. ✅ Margin analysis complete
10. ✅ Executive reporting delivered
11. ✅ Forecast updated
12. ✅ Financial controls verified
13. ✅ All integrations synced
14. ✅ Activity logged in system
15. ✅ Tomorrow's tasks planned

---

## Events Logged

| Event | Payload |
|-------|---------|
| `finance.daily_review` | `{ user_id, date, cash_position, ar_total, margin_pct }` |
| `commission.approved` | `{ batch_id, total_amount, count, approved_by }` |
| `commission.clawback` | `{ commission_id, amount, reason, approved_by }` |
| `invoice.generated` | `{ invoice_id, client_id, amount, created_by }` |
| `credit_memo.issued` | `{ credit_memo_id, invoice_id, amount, reason }` |
| `ar.reminder_sent` | `{ invoice_id, client_id, days_overdue, sent_by }` |
| `ar.escalated` | `{ invoice_id, level, actions_taken, escalated_by }` |
| `payroll.reconciled` | `{ period, total_amount, variance, reconciled_by }` |
| `report.generated` | `{ report_type, recipient, period, generated_by }` |
| `forecast.updated` | `{ period, revenue_projection, updated_by }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| QuickBooks Sync Failed | Integration down | "QuickBooks sync failed. Data may be stale." | Retry sync, manual entry if urgent |
| Commission Calculation Error | Missing placement data | "Commission cannot be calculated - placement data incomplete" | Review placement, add missing data |
| Invoice Generation Failed | Timesheet not approved | "Cannot generate invoice - 1 timesheet pending approval" | Approve timesheet or exclude from batch |
| Payroll Variance Too High | Data mismatch | "Payroll variance exceeds threshold (>5%)" | Review line-by-line, contact ADP |
| AR Escalation Blocked | Missing approval | "Cannot escalate - requires CEO approval for amounts >$40k" | Request CEO approval |
| Exchange Rate Unavailable | API down | "Currency conversion failed - exchange rate unavailable" | Use last known rate, manual override |
| Report Generation Timeout | Large dataset | "Report generation timed out. Please reduce date range." | Split into smaller periods |

---

## Keyboard Shortcuts (During Workflow)

| Key | Action |
|-----|--------|
| `g f` | Go to Finance Dashboard |
| `g r` | Go to Revenue Reports |
| `g c` | Go to Commission Approvals |
| `g i` | Go to Invoices |
| `g a` | Go to AR/AP |
| `a` | Approve (commission, invoice, payroll) |
| `e` | Edit current entity |
| `Cmd+K` | Open Command Bar |
| `/` | Quick search |
| `Cmd+Shift+E` | Export current view |

---

## Daily Time Breakdown Summary

| Period | Duration | Key Activities |
|--------|----------|----------------|
| Morning (8-10 AM) | ~2 hours | Cash review, AR aging, commission approvals, team meeting |
| Mid-Morning (10-12 PM) | ~1.5 hours | Invoice adjustments, revenue recognition, payroll |
| Afternoon (12-3 PM) | ~1 hour | Margin analysis, billing, collections, budget review |
| Late Afternoon (3-5 PM) | ~2 hours | Executive reporting, forecasting, leadership meeting, EOD controls |
| **Total** | **~6.5 hours** | Full daily workflow |

---

## Weekly Responsibilities Summary

| Day | Special Activities |
|-----|-------------------|
| Monday | Commission run review, weekly cash flow forecast |
| Tuesday | AR aging review, collections planning |
| Wednesday | Mid-week financial snapshot, margin analysis |
| Thursday | Payroll review and approval (bi-weekly) |
| Friday | Weekly financial reports to CEO, variance analysis |

---

## Related Use Cases

- [02-process-invoices.md](./02-process-invoices.md) - Detailed invoice generation workflow
- [03-manage-payroll.md](./03-manage-payroll.md) - Payroll processing workflow
- [04-track-ar.md](./04-track-ar.md) - AR management workflow
- [05-financial-reporting.md](./05-financial-reporting.md) - Report generation workflow

---

*Last Updated: 2025-11-30*
