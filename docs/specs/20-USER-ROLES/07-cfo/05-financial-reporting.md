# Use Case: Generate Financial Reports

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-FIN-005 |
| Actor | Finance/CFO |
| Goal | Generate comprehensive financial reports for management, board, and stakeholders |
| Frequency | Weekly (executive), Monthly (comprehensive), Quarterly (board), Annually (auditors) |
| Estimated Time | 30 mins (weekly), 2-3 hours (monthly), 4-6 hours (quarterly) |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Finance/CFO
2. User has financial reporting permissions
3. All financial data for period is recorded and reconciled
4. Revenue recognition complete for period
5. Month-end close completed (for monthly reports)
6. QuickBooks data synced
7. All journal entries posted

---

## Trigger

One of the following:
- Scheduled task: "Weekly executive report due - Friday 3:00 PM"
- Scheduled task: "Month-end reporting due - 5th business day"
- CEO request: "Please prepare financial summary for board meeting"
- Quarterly close: "Q4 2025 financial reporting"
- Ad-hoc request: "Margin analysis needed for client X"
- Audit preparation: "Annual financial statements required"

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Reports Section

**User Action:** Click "Reports & Analytics" in sidebar navigation

**System Response:**
- Sidebar highlights
- URL changes to: `/employee/finance/reports`
- Reports dashboard loads
- Shows available report types and recent reports

**Screen State:**
```
+----------------------------------------------------------+
| Financial Reports                    [Create] [Schedule]  |
+----------------------------------------------------------+
| [Standard] [Custom] [Scheduled] [Recent] [Favorites]     |
+----------------------------------------------------------+
| Standard Reports                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ 📊 Executive Reports                                │  |
| │   • Weekly Executive Summary                        │  |
| │   • Monthly Financial Package                       │  |
| │   • Board Presentation                              │  |
| │   • CEO Dashboard                                   │  |
| │                                                     │  |
| │ 📈 Financial Statements                             │  |
| │   • Profit & Loss (P&L)                            │  |
| │   • Balance Sheet                                   │  |
| │   • Cash Flow Statement                             │  |
| │   • Statement of Changes in Equity                  │  |
| │                                                     │  |
| │ 💰 Revenue Reports                                  │  |
| │   • Revenue by Client                               │  |
| │   • Revenue by Pod                                  │  |
| │   • Revenue by Recruiter                            │  |
| │   • Revenue Recognition Schedule                    │  |
| │                                                     │  |
| │ 📉 Margin Analysis                                  │  |
| │   • Margin by Account                               │  |
| │   • Margin by Pod                                   │  |
| │   • Margin by Job Type                              │  |
| │   • Bill vs Pay Rate Analysis                       │  |
| │                                                     │  |
| │ 💵 AR/AP Reports                                    │  |
| │   • AR Aging Report                                 │  |
| │   • Collections Summary                             │  |
| │   • DSO Trend Analysis                              │  |
| │   • AP Aging Report                                 │  |
| │                                                     │  |
| │ 📊 Operational Reports                              │  |
| │   • Budget vs Actual                                │  |
| │   • Forecast vs Actual                              │  |
| │   • Variance Analysis                               │  |
| │   • KPI Dashboard                                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| Recent Reports                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Nov 29: Weekly Executive Summary (PDF)              │  |
| │ Nov 28: Margin Analysis - Meta (Excel)              │  |
| │ Nov 25: AR Aging Report (PDF)                       │  |
| └────────────────────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 2: Create Weekly Executive Summary

**User Action:** Click "Weekly Executive Summary" under Executive Reports

**System Response:**
- Report configuration screen opens
- Default parameters pre-filled

**Screen State:**
```
+----------------------------------------------------------+
| Weekly Executive Summary                             [×] |
+----------------------------------------------------------+
| Report Configuration                                      |
+----------------------------------------------------------+
| Period                                                    |
| ● This Week (Nov 24-30, 2025)                           |
| ○ Last Week                                              |
| ○ Custom Range: [From] [To]                             |
|                                                           |
| Recipients                                                |
| ☑️  CEO (john.doe@intime.com)                            |
| ☑️  COO (jane.smith@intime.com)                          |
| ☑️  Leadership Team (5 members)                          |
| ☐  Board of Directors                                   |
|                                                           |
| Sections to Include                                       |
| ☑️  Revenue Summary                                      |
| ☑️  Cash Position                                        |
| ☑️  AR Aging                                             |
| ☑️  Margin Analysis                                      |
| ☑️  Budget vs Actual                                     |
| ☑️  Key Metrics (DSO, Gross Margin %)                    |
| ☑️  Alerts & Action Items                                |
| ☐  Detailed P&L                                         |
| ☐  Balance Sheet                                        |
| ☐  Cash Flow Statement                                  |
|                                                           |
| Comparison Period                                         |
| ☑️  Compare to prior week                                |
| ☑️  Compare to same week last year                       |
| ☐  Compare to budget                                    |
|                                                           |
| Format & Delivery                                         |
| Format: ● PDF  ○ Excel  ○ PowerPoint                    |
| ☑️  Email to recipients                                  |
| ☑️  Save to shared drive                                 |
| ☐  Print                                                |
| ☐  Schedule recurring (weekly)                          |
|                                                           |
|                             [Cancel] [Generate Report]    |
+----------------------------------------------------------+
```

**User Action:** Review settings, click "Generate Report"

**System Response:**
- Loading indicator: "Generating report... 25%"
- System queries database for financial data
- Calculations performed
- Charts and graphs generated
- PDF formatted

**Screen State (Progress):**
```
+----------------------------------------------------------+
| Generating Weekly Executive Summary...                    |
+----------------------------------------------------------+
| ████████████████░░░░░░░░  65%                             |
|                                                           |
| ✓ Revenue data compiled                                  |
| ✓ Cash position calculated                               |
| ✓ AR aging analyzed                                      |
| ⏳ Margin calculations in progress...                     |
| ⏱️  Charts and graphs pending...                          |
| ⏱️  PDF formatting pending...                             |
|                                                           |
| Estimated time remaining: 15 seconds                     |
+----------------------------------------------------------+
```

**Screen State (Complete):**
```
+----------------------------------------------------------+
| Report Generated Successfully!                       [×] |
+----------------------------------------------------------+
| Weekly Executive Summary - Nov 24-30, 2025               |
|                                                           |
| ✓ Report generated (4 pages, 1.2 MB)                     |
| ✓ Emailed to 7 recipients                                |
| ✓ Saved to: /Shared/Finance/Reports/2025/Nov/Week4.pdf  |
|                                                           |
|                      [Download PDF] [Preview] [Close]     |
+----------------------------------------------------------+
```

**User Action:** Click "Preview" to review before sending

**System Response:**
- PDF preview modal opens
- Shows formatted report

**Report Preview:**
```
╔══════════════════════════════════════════════════════════╗
║         InTime Solutions - Weekly Financial Snapshot     ║
║                     Nov 24-30, 2025                      ║
╚══════════════════════════════════════════════════════════╝

EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────
This week showed strong performance with revenue ahead of
plan and continued improvement in margin. Collections remain
on track with DSO at 42 days (target: ≤45).

KEY HIGHLIGHTS
────────────────────────────────────────────────────────────
✓ Revenue: $465k (+10.7% WoW)
✓ Gross Margin: 28.5% (+0.2% vs last week)
✓ Cash Position: $2.45M (+$140k vs last week)
⚠️  AR 90+: $60k (5% of total AR) - 2 accounts in collections

REVENUE SUMMARY
────────────────────────────────────────────────────────────
This Week:           $465,000
Last Week:           $420,000    (+10.7% WoW)
Same Week Last Year: $385,000    (+20.8% YoY)
Month to Date:     $2,010,000
Budget (Week):       $450,000    (+3.3% vs Budget)

Revenue by Type:
• Contract/Temp:     $315,000   (67.7%)
• Placement Fees:    $150,000   (32.3%)

Top Clients (This Week):
1. Google       $120,000
2. Meta          $85,000
3. Amazon        $80,000
4. Apple         $60,000
5. Netflix       $45,000

CASH POSITION
────────────────────────────────────────────────────────────
Current Balance:   $2,450,000
Week Change:         +$140,000   (+6.1%)
Daily Deposits:        $85,000

7-Day Forecast:    $2,590,000   (+$140k projected)

Bank Accounts:
• Operating:       $1,850,000
• Payroll:           $450,000
• Reserve:           $150,000

AR AGING
────────────────────────────────────────────────────────────
Total AR:          $1,200,000
DSO: 42 days (Target: ≤45) ✓

Aging Breakdown:
  Current:         $420,000    (35%) ✓
  0-30 days:       $360,000    (30%) ✓
  31-60 days:      $264,000    (22%) 🟡
  61-90 days:       $96,000     (8%) 🟠
  90+ days:         $60,000     (5%) 🔴

Collections Activity (This Week):
• Payments Received:    $385,000
• Reminders Sent:             15
• Escalations:                 2
• New Invoices:         $465,000

MARGIN ANALYSIS
────────────────────────────────────────────────────────────
Gross Margin %:           28.5%  (Target: 25%) ✓
Week over Week:           +0.2%
Month to Date:            28.5%

Margin by Client (Top 5):
1. Apple         35%
2. Amazon        32%
3. Google        30%
4. Netflix       25%
5. Meta          18%  ⚠️  Below target

⚠️  Alert: Meta margin needs review (18% vs 25% target)
   Recommendation: Rate review scheduled for Dec 1

BUDGET VS ACTUAL
────────────────────────────────────────────────────────────
                   Budget     Actual    Variance     %
Revenue (Week)    $450,000   $465,000   +$15,000  +3.3% ✓
Revenue (MTD)   $1,950,000 $2,010,000   +$60,000  +3.1% ✓

Expenses (MTD)  $1,545,000 $1,570,000   -$25,000  -1.6% ⚠️
  • Payroll     $1,250,000 $1,280,000   -$30,000  -2.4%
  • Other         $295,000   $290,000    +$5,000  +1.7% ✓

EBITDA (MTD)      $405,000   $440,000   +$35,000  +8.6% ✓

KEY METRICS
────────────────────────────────────────────────────────────
Metric                 Current    Target    Status
Days Sales Outstanding    42        ≤45       ✓
Gross Margin %          28.5%       25%       ✓
Revenue Growth YoY      20.8%       15%       ✓
AR >90 days              5%        <10%       ✓
Cash Position         $2.45M     >$2.0M      ✓

ALERTS & ACTION ITEMS
────────────────────────────────────────────────────────────
🔴 CRITICAL
   • Acme Corp invoice 95 days overdue ($45k)
     → With collections agency, legal action pending

🟠 WARNING
   • Meta margin below target (18% vs 25%)
     → Rate review meeting scheduled Dec 1
   • TechCorp invoice 69 days overdue ($52k)
     → Credit hold applied, demand letter sent

🟡 MONITOR
   • DSO trending upward (38→40→42 days)
     → Increase collections focus on 31-60 day bucket
   • Payroll over budget by $30k
     → Due to 2 unplanned hires in October

✅ COMPLETED
   • November revenue recognition complete
   • 12 commissions approved ($136.5k)
   • 5 invoices generated ($314k)
   • Weekly cash flow forecast updated

UPCOMING EVENTS
────────────────────────────────────────────────────────────
• Dec 1: Payroll processing ($145k)
• Dec 1: Meta rate review meeting
• Dec 5: Board meeting preparation begins
• Dec 15: Q4 preliminary close
• Dec 20: Holiday bonus payments

────────────────────────────────────────────────────────────
Report Generated: Nov 30, 2025 3:15 PM
Generated By: CFO (John Doe)
Next Report: Dec 7, 2025

                                                   Page 1 of 4
```

**Time:** ~5 minutes

---

### Step 3: Generate Monthly P&L Statement

**User Action:** Click "Profit & Loss (P&L)" under Financial Statements

**System Response:**
- P&L configuration screen opens

**Screen State:**
```
+----------------------------------------------------------+
| Profit & Loss Statement                              [×] |
+----------------------------------------------------------+
| Report Period                                             |
| ● This Month (November 2025)                            |
| ○ Last Month (October 2025)                             |
| ○ Year to Date (Jan-Nov 2025)                           |
| ○ Custom Range                                           |
|                                                           |
| Comparison Options                                        |
| ☑️  Compare to prior month                               |
| ☑️  Compare to same month last year                      |
| ☑️  Compare to budget                                    |
| ☐  Show variance %                                      |
| ☐  Show YTD totals                                      |
|                                                           |
| Level of Detail                                           |
| ○ Summary (high-level categories)                       |
| ● Standard (department breakdown)                       |
| ○ Detailed (account-level detail)                       |
|                                                           |
| Grouping                                                  |
| ● By Category (Revenue, COGS, OpEx)                     |
| ○ By Department (Recruiting, Sales, Admin)              |
| ○ By Pod                                                 |
| ○ By Service Line (Permanent, Contract, SOW)            |
|                                                           |
| Format                                                    |
| ● PDF (formatted for printing)                          |
| ○ Excel (editable with formulas)                        |
| ○ QuickBooks Format                                      |
|                                                           |
|                             [Cancel] [Generate Report]    |
+----------------------------------------------------------+
```

**User Action:** Configure options, click "Generate Report"

**System Response:**
- Report generation begins
- Progress shown
- PDF created

**Report Preview (P&L):**
```
╔══════════════════════════════════════════════════════════╗
║         InTime Solutions - Profit & Loss Statement       ║
║                     November 2025                        ║
╚══════════════════════════════════════════════════════════╝

                           Nov 2025   Oct 2025   Budget   Variance
REVENUE
────────────────────────────────────────────────────────────────────
Contract Revenue        $1,450,000 $1,350,000 $1,400,000   +$50,000
Placement Fees            $560,000   $525,000   $550,000   +$10,000
                        ──────────────────────────────────────────
TOTAL REVENUE           $2,010,000 $1,875,000 $1,950,000   +$60,000

COST OF REVENUE
────────────────────────────────────────────────────────────────────
Contractor Payroll      $1,050,000   $975,000 $1,020,000   -$30,000
Employer Taxes             $84,000    $78,000    $81,600    -$2,400
Benefits                   $52,500    $48,750    $51,000    -$1,500
Commissions               $175,000   $165,000   $180,000    +$5,000
Recruiter Salaries        $120,000   $120,000   $120,000         $0
                        ──────────────────────────────────────────
TOTAL COGS              $1,481,500 $1,386,750 $1,452,600   -$28,900
                        ──────────────────────────────────────────
GROSS PROFIT              $528,500   $488,250   $497,400   +$31,100
GROSS MARGIN %               26.3%      26.0%      25.5%      +0.8%

OPERATING EXPENSES
────────────────────────────────────────────────────────────────────
Sales & Marketing
  Salaries                 $45,000    $45,000    $45,000         $0
  Advertising              $12,000    $10,000    $15,000    +$3,000
  Travel                    $8,000     $6,000     $8,000         $0
  Other                     $3,000     $2,500     $3,000         $0
                        ──────────────────────────────────────────
Total S&M                  $68,000    $63,500    $71,000    +$3,000

General & Administrative
  Executive Salaries       $85,000    $85,000    $85,000         $0
  HR/Operations            $45,000    $45,000    $45,000         $0
  Finance/Accounting       $35,000    $35,000    $35,000         $0
  Legal & Professional     $15,000    $12,000    $15,000         $0
  Insurance                $10,000    $10,000    $10,000         $0
  Office Rent              $25,000    $25,000    $25,000         $0
  Utilities                 $3,500     $3,200     $3,500         $0
  Office Supplies           $2,500     $2,300     $2,500         $0
                        ──────────────────────────────────────────
Total G&A                 $221,000   $217,500   $221,000         $0

Technology
  Software Subscriptions   $18,000    $17,000    $18,000         $0
  Infrastructure            $8,000     $7,500     $8,000         $0
  IT Support                $5,000     $5,000     $5,000         $0
                        ──────────────────────────────────────────
Total Technology           $31,000    $29,500    $31,000         $0

Depreciation & Amortization $8,000     $8,000     $8,000         $0
                        ──────────────────────────────────────────
TOTAL OPERATING EXPENSES  $328,000   $318,500   $331,000    +$3,000

OPERATING INCOME (EBITDA) $200,500   $169,750   $166,400   +$34,100
OPERATING MARGIN %           10.0%       9.1%       8.5%      +1.5%

OTHER INCOME/(EXPENSE)
────────────────────────────────────────────────────────────────────
Interest Income             $1,200     $1,100     $1,000      +$200
Interest Expense           -$2,500    -$2,500    -$2,500         $0
Other Income                  $500       $300       $500         $0
                        ──────────────────────────────────────────
TOTAL OTHER                  -$800    -$1,100    -$1,000      +$200

INCOME BEFORE TAXES       $199,700   $168,650   $165,400   +$34,300

Income Tax Expense        -$59,910   -$50,595   -$49,620    -$10,290
(Estimated at 30%)
                        ──────────────────────────────────────────
NET INCOME                $139,790   $118,055   $115,780   +$24,010
NET MARGIN %                  7.0%       6.3%       5.9%      +1.1%

────────────────────────────────────────────────────────────────────
KEY METRICS

Revenue Growth (MoM):              +7.2%
Revenue Growth (YoY):             +18.5%
Gross Margin %:                    26.3%  (Target: 25%) ✓
Operating Margin %:                10.0%  (Target: 8.5%) ✓
Net Margin %:                       7.0%  (Target: 6.0%) ✓

Ahead of Budget:                  +$60k revenue, +$34k net income

────────────────────────────────────────────────────────────────────
Report Generated: Nov 30, 2025
Period: November 1-30, 2025
Generated By: CFO

                                                   Page 1 of 2
```

**Time:** ~8 minutes

---

### Step 4: Generate Margin Analysis by Client

**User Action:** Navigate back to Reports, click "Margin by Account"

**System Response:**
- Margin analysis configuration opens

**Screen State:**
```
+----------------------------------------------------------+
| Margin Analysis by Account                           [×] |
+----------------------------------------------------------+
| Analysis Period: [November 2025 ▼]                       |
|                                                           |
| Filters                                                   |
| Client(s): ● All  ○ Select Specific [             ▼]    |
| Pod(s):    ● All  ○ Select Specific [             ▼]    |
| Job Type:  ● All  ○ Contract  ○ Permanent                |
|                                                           |
| Sort By:                                                  |
| ● Margin % (Lowest to Highest)                          |
| ○ Revenue (Highest to Lowest)                           |
| ○ Client Name (Alphabetical)                            |
|                                                           |
| Include:                                                  |
| ☑️  Bill vs Pay Rate breakdown                           |
| ☑️  Consultant-level detail                              |
| ☑️  Trend vs previous periods                            |
| ☑️  Industry benchmark comparison                        |
| ☑️  Recommendations                                      |
|                                                           |
| Threshold Alerts:                                         |
| ☑️  Highlight margins <20%                               |
| ☑️  Flag accounts below target (25%)                     |
|                                                           |
| Format: ● Excel (for analysis)  ○ PDF                   |
|                                                           |
|                             [Cancel] [Generate Report]    |
+----------------------------------------------------------+
```

**User Action:** Click "Generate Report"

**Report Preview (Margin Analysis):**
```
╔══════════════════════════════════════════════════════════╗
║      InTime Solutions - Margin Analysis by Account       ║
║                     November 2025                        ║
╚══════════════════════════════════════════════════════════╝

SUMMARY
────────────────────────────────────────────────────────────
Total Revenue:              $2,010,000
Total COGS:                 $1,481,500
Total Gross Profit:           $528,500
Overall Margin %:                26.3%  (Target: 25%) ✓

Clients Below Target (<25%): 8 accounts, $685,000 revenue

MARGIN ANALYSIS BY CLIENT (Sorted by Margin %, Ascending)
────────────────────────────────────────────────────────────

1. Meta ⚠️
   Revenue:          $340,000
   COGS:             $279,200
   Gross Profit:      $60,800
   Margin %:             17.9%  ⚠️  7.1% below target

   Details:
   • Avg Bill Rate:    $95/hr
   • Avg Pay Rate:     $78/hr
   • Spread:           $17/hr
   • Active Consultants: 8
   • Total Hours: 3,579

   Issue: Low bill rates negotiated 2 years ago
   Recommendation: Renegotiate rates (target: $110/hr)
   Estimated Impact: +$54k annual margin increase

2. Netflix ⚠️
   Revenue:          $220,000
   COGS:             $176,000
   Gross Profit:      $44,000
   Margin %:             20.0%  ⚠️  5.0% below target

   Details:
   • Avg Bill Rate:   $100/hr
   • Avg Pay Rate:     $80/hr
   • Spread:           $20/hr
   • Active Consultants: 6
   • Total Hours: 2,200

   Issue: High pay rates due to specialty skills
   Recommendation: Review skill requirements, negotiate bill increase
   Estimated Impact: +$22k annual margin increase

3. Salesforce ⚠️
   Revenue:          $125,000
   COGS:             $100,000
   Gross Profit:      $25,000
   Margin %:             20.0%  ⚠️  5.0% below target

   ... [6 more low-margin clients]

─────────────────────────────────────────────────────────────

10. Amazon ✓
    Revenue:          $380,000
    COGS:             $258,400
    Gross Profit:     $121,600
    Margin %:             32.0%  ✓  7.0% above target

    Details:
    • Avg Bill Rate:   $120/hr
    • Avg Pay Rate:     $82/hr
    • Spread:           $38/hr
    • Active Consultants: 9
    • Total Hours: 3,167

    Strong Performance: Well-negotiated rates, appropriate skill mix
    Recommendation: Maintain current strategy

11. Apple ✓
    Revenue:          $450,000
    COGS:             $292,500
    Gross Profit:     $157,500
    Margin %:             35.0%  ✓  10.0% above target

    Details:
    • Avg Bill Rate:   $150/hr
    • Avg Pay Rate:     $98/hr
    • Spread:           $52/hr
    • Active Consultants: 6
    • Total Hours: 3,000

    Top Performer: Premium rates for specialized skills
    Recommendation: Replicate strategy with similar clients

RECOMMENDATIONS
────────────────────────────────────────────────────────────
Immediate Actions:
1. Meta: Schedule rate renegotiation (Priority 1)
   Target: Increase bill rate from $95 to $110 (+15.8%)
   Impact: +$54k annual margin

2. Netflix: Review consultant skill levels
   Target: Reduce pay rates or increase bill rates
   Impact: +$22k annual margin

3. Implement minimum margin policy: 22% (3% buffer below target)
   Action: New contracts must meet minimum, existing contracts
           flagged for renegotiation at renewal

Long-term Strategy:
• Focus growth on high-margin clients (Apple, Amazon, Google)
• Gradually phase out or renegotiate low-margin accounts
• Target overall margin: 28% (current: 26.3%)

────────────────────────────────────────────────────────────
Report Generated: Nov 30, 2025
Generated By: CFO
```

**Time:** ~10 minutes

---

### Step 5: Generate Cash Flow Statement

**User Action:** Click "Cash Flow Statement" under Financial Statements

**Report Preview:**
```
╔══════════════════════════════════════════════════════════╗
║      InTime Solutions - Statement of Cash Flows          ║
║                     November 2025                        ║
╚══════════════════════════════════════════════════════════╝

CASH FLOWS FROM OPERATING ACTIVITIES
────────────────────────────────────────────────────────────
Net Income                                         $139,790

Adjustments to reconcile net income to cash:
  Depreciation & Amortization                        $8,000
  Changes in operating assets and liabilities:
    Accounts Receivable                            -$75,000
    Prepaid Expenses                                 -$2,000
    Accounts Payable                                 $15,000
    Accrued Expenses                                  $8,000
    Deferred Revenue                                  $5,000
                                                  ──────────
Net Cash from Operating Activities                 $98,790

CASH FLOWS FROM INVESTING ACTIVITIES
────────────────────────────────────────────────────────────
Purchase of Equipment                               -$5,000
Software Capitalization                             -$3,000
                                                  ──────────
Net Cash from Investing Activities                  -$8,000

CASH FLOWS FROM FINANCING ACTIVITIES
────────────────────────────────────────────────────────────
Line of Credit Draws                                     $0
Line of Credit Repayments                                $0
Owner Distributions                                -$25,000
                                                  ──────────
Net Cash from Financing Activities                -$25,000

NET INCREASE IN CASH                                $65,790

CASH - BEGINNING OF PERIOD                      $2,384,210
CASH - END OF PERIOD                            $2,450,000

────────────────────────────────────────────────────────────
SUPPLEMENTAL DISCLOSURES

Cash paid for:
  Interest                                           $2,500
  Income Taxes                                      $55,000

Non-cash activities:
  None

────────────────────────────────────────────────────────────
Report Generated: Nov 30, 2025
Period: November 1-30, 2025
```

**Time:** ~5 minutes

---

### Step 6: Generate Board Presentation (Quarterly)

**User Action:** Click "Board Presentation" under Executive Reports

**System Response:**
- Board presentation builder opens

**Screen State:**
```
+----------------------------------------------------------+
| Board Presentation - Q4 2025                         [×] |
+----------------------------------------------------------+
| Presentation Type: [Quarterly Board Meeting ▼]           |
| Quarter: Q4 2025 (Oct-Dec)                               |
| Board Meeting Date: Dec 15, 2025                         |
+----------------------------------------------------------+
| Sections to Include                                       |
| ☑️  Executive Summary (1 slide)                          |
| ☑️  Financial Highlights (2-3 slides)                    |
|     - Revenue & Growth                                   |
|     - Profitability (EBITDA, Net Income)                |
|     - Cash & Balance Sheet                              |
| ☑️  Operational Metrics (2 slides)                       |
|     - Placements, Jobs, Candidates                      |
|     - Pod Performance                                    |
| ☑️  Strategic Initiatives (2 slides)                     |
|     - Key achievements                                   |
|     - Upcoming priorities                                |
| ☑️  Financial Deep Dive (3-4 slides)                     |
|     - P&L vs Budget                                     |
|     - Margin Analysis                                    |
|     - AR/AP Status                                      |
|     - Cash Flow & Forecast                              |
| ☑️  2026 Outlook (2 slides)                              |
|     - Revenue forecast                                   |
|     - Strategic priorities                               |
| ☐  Appendix (detailed financials)                       |
|                                                           |
| Visual Style                                              |
| ● Professional (charts, minimal text)                   |
| ○ Executive (high-level, visual)                        |
| ○ Detailed (comprehensive data)                         |
|                                                           |
| Format: ● PowerPoint  ○ PDF  ○ Google Slides            |
|                                                           |
| Estimated Slides: 12-15                                  |
| Estimated Time to Generate: 5-8 minutes                  |
|                                                           |
|                             [Cancel] [Generate Deck]      |
+----------------------------------------------------------+
```

**User Action:** Configure, click "Generate Deck"

**System Response:**
- PowerPoint deck generated
- Charts auto-created from data
- Professional formatting applied

**Sample Slides (Preview):**
```
─────────────────────────────────────────────────────────────
Slide 1: Executive Summary

InTime Solutions
Q4 2025 Board Report

Key Highlights:
✓ Revenue: $6.2M (+18% YoY)
✓ EBITDA: $620k (10.0% margin)
✓ Net Income: $434k (7.0% margin)
✓ Cash: $2.45M (+$185k from Q3)
✓ Placements: 48 (+9% YoY)

Strategic Achievements:
• Launched new CRM platform
• Expanded into 2 new verticals
• Hired 3 new recruiters

─────────────────────────────────────────────────────────────
Slide 2: Revenue & Growth

                Q4 2024    Q4 2025    Growth
Revenue:         $5.25M     $6.20M    +18.1%
Contract:        $3.68M     $4.35M    +18.2%
Placements:      $1.57M     $1.85M    +17.8%

[BAR CHART: Quarterly revenue trend showing growth]

YoY Growth by Month:
  Oct: +16%
  Nov: +18%
  Dec: +20% (projected)

─────────────────────────────────────────────────────────────
Slide 3: Profitability

                Q4 2024    Q4 2025    Change
Gross Profit:    $1.31M     $1.63M    +24.4%
Gross Margin:     25.0%      26.3%    +1.3%

EBITDA:           $446k      $620k    +39.0%
EBITDA Margin:     8.5%      10.0%    +1.5%

Net Income:       $312k      $434k    +39.1%
Net Margin:        5.9%       7.0%    +1.1%

[LINE CHART: Margin trend over 4 quarters]

Key Drivers:
• Improved bill rates (+3%)
• Better consultant utilization (+2%)
• Operating leverage (+5% revenue, +3% OpEx)

─────────────────────────────────────────────────────────────
... [9 more slides]

Final Slide: 2026 Outlook

Revenue Forecast: $28M (+20% YoY)
  Q1: $6.8M
  Q2: $7.0M
  Q3: $7.0M
  Q4: $7.2M

Strategic Priorities:
1. Expand bench sales division (+50% growth)
2. Launch academy training program
3. Open second regional office
4. Implement AI-powered recruiting tools

Capital Needs: $500k (equipment, technology, hiring)

Expected Return: 3x within 18 months
```

**Time:** ~15 minutes (including review)

---

### Step 7: Schedule Recurring Reports

**User Action:** Click "Schedule" button on main Reports screen

**Screen State:**
```
+----------------------------------------------------------+
| Schedule Recurring Reports                           [×] |
+----------------------------------------------------------+
| Current Scheduled Reports: 4 active                      |
+----------------------------------------------------------+
| ☑️  Weekly Executive Summary                             |
|     Frequency: Every Friday at 3:00 PM                   |
|     Recipients: CEO, COO, Leadership (7 people)          |
|     Last Run: Nov 29, 2025                               |
|     Next Run: Dec 6, 2025                                |
|     [Edit] [Pause] [Delete]                              |
| ─────────────────────────────────────────────────────────|
| ☑️  Monthly P&L Package                                  |
|     Frequency: 5th business day of month                 |
|     Recipients: CEO, Board Chair (2 people)              |
|     Last Run: Nov 7, 2025                                |
|     Next Run: Dec 5, 2025                                |
|     [Edit] [Pause] [Delete]                              |
| ─────────────────────────────────────────────────────────|
| ☑️  AR Aging Report                                      |
|     Frequency: Every Tuesday at 9:00 AM                  |
|     Recipients: CFO, Collections Team (3 people)         |
|     Last Run: Nov 26, 2025                               |
|     Next Run: Dec 3, 2025                                |
|     [Edit] [Pause] [Delete]                              |
| ─────────────────────────────────────────────────────────|
| ☑️  Cash Flow Forecast                                   |
|     Frequency: Every Monday at 8:00 AM                   |
|     Recipients: CFO, CEO (2 people)                      |
|     Last Run: Nov 25, 2025                               |
|     Next Run: Dec 2, 2025                                |
|     [Edit] [Pause] [Delete]                              |
+----------------------------------------------------------+
|                                        [+ New Schedule]   |
+----------------------------------------------------------+
```

**Time:** ~5 minutes to review and manage

---

## Postconditions

1. ✅ Financial reports generated and distributed
2. ✅ Reports saved to shared drive
3. ✅ Recipients notified via email
4. ✅ Data validated and accurate
5. ✅ Trends and variances analyzed
6. ✅ Recommendations documented
7. ✅ Scheduled reports configured for automation
8. ✅ Board presentation ready for meeting
9. ✅ Audit trail maintained
10. ✅ Reports accessible for future reference

---

## Events Logged

| Event | Payload |
|-------|---------|
| `report.generated` | `{ report_type, period, generated_by, recipients }` |
| `report.emailed` | `{ report_id, recipients, sent_at }` |
| `report.downloaded` | `{ report_id, user_id, downloaded_at }` |
| `report.scheduled` | `{ report_type, frequency, recipients }` |
| `report.viewed` | `{ report_id, user_id, viewed_at }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Data Missing | Incomplete period data | "Cannot generate report - November data incomplete" | Complete month-end close first |
| QuickBooks Sync Issue | API error | "QuickBooks data stale - last sync 2 hours ago" | Force resync, regenerate |
| Large Dataset Timeout | Too much data | "Report generation timed out. Please reduce date range." | Split into smaller periods |
| Email Delivery Failed | Invalid recipient | "Email delivery failed for 2 recipients" | Verify emails, resend |
| Permission Denied | User access | "You don't have permission to view this report" | Request access from admin |
| Template Error | Corrupted template | "Report template error. Using default." | Fix template, regenerate |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Report Period | Must be complete | "Period not closed - data may be incomplete" |
| Date Range | End date must be >= start date | "Invalid date range" |
| Recipients | At least one required | "At least one recipient required" |
| Format | Must select format | "Output format required" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g r` | Go to Reports |
| `n` | New Report |
| `e` | Export current report |
| `s` | Schedule report |
| `Cmd+P` | Print current report |
| `Cmd+Shift+E` | Export to Excel |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Includes weekly reporting tasks
- [02-process-invoices.md](./02-process-invoices.md) - Revenue data source
- [03-manage-payroll.md](./03-manage-payroll.md) - Expense data source
- [04-track-ar.md](./04-track-ar.md) - AR reporting

---

*Last Updated: 2025-11-30*
