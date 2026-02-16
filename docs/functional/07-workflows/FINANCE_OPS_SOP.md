# InTime Finance & Operations SOP
**Version 1.0 | Last Updated: February 2026**

---

## EXECUTIVE SUMMARY

This document outlines financial planning, accounts receivable, accounts payable, timesheet management, payroll processing, and compliance operations for InTime. The company operates from Hyderabad, India with 16-person Phase 1 team, billing US clients in USD, and managing payroll in both USD (placed consultants) and INR (internal team).

**Key Financial Parameters:**
- Revenue Streams: Training fees (₹1.5L/student), bench placements ($10-15/hr spread), contract placements
- Monthly Burn: ~₹12L
- Break-Even Target: Month 4-5
- Reporting Currency: USD (client/revenue), INR (ops/payroll)

---

## 1. FINANCIAL PLANNING

### 1.1 Annual Budgeting

**Frequency:** Q4 previous year (September-October planning for calendar year)

**Process:**
1. **Revenue Projections**
   - Training revenue: enrollment targets × ₹1.5L per student
   - Bench placement revenue: # of bench consultants × avg hourly rate ($10-15) × utilization %
   - Contract placement revenue: # of contracts × duration × markup %
   - Build 12-month rolling forecast with monthly detail

2. **Cost Structure**
   - Fixed costs: office rent, utilities, insurance, core staff salaries (₹12L/month burn)
   - Variable costs: consultant payroll (USD-based), contractor payments
   - One-time: recruitment, technology, compliance setup
   - Currency exposure: INR payroll vs USD revenue (hedge strategy if >20% forex impact)

3. **P&L Forecast**
   - Top-down: revenue targets from BDM + bottom-up: cost build-up from HR
   - Monthly granularity for first 12 months
   - Scenario analysis: base case, upside (120%), downside (80%)
   - Break-even analysis: contribution margin by revenue stream, fixed cost coverage

4. **Approval & Communication**
   - CEO reviews and approves budget by end of October
   - Communicate final budget to all team leads by November 1
   - Post in accessible location (Slack #general, shared drive)

**KPIs to Track:**
- Budget vs actual variance (monthly): target <10% variance
- Revenue mix: % from each stream (training, bench, contract)
- Gross margin by revenue type

---

### 1.2 Monthly Forecasting

**Frequency:** Monthly, on the 5th of each month

**Process:**
1. **Rolling 3-Month Forecast**
   - Update next 3 months of revenue based on:
     - Pipeline status (current month + 2 months forward)
     - Recent placement conversions
     - Bench utilization rates
     - Training enrollment pipeline
   - Update payroll projections for new placements
   - Adjust for known seasonality

2. **Variance Analysis**
   - Compare prior month actual vs forecast from 2 months prior
   - Variance buckets: revenue, payroll, operating expenses
   - Root cause analysis for >10% variances:
     - Revenue: slower conversions? Lost deals? Rate pressure?
     - Payroll: new placements? Turnover? Rate changes?
     - OpEx: spending decisions? One-time items?

3. **Reforecast Triggers**
   - Pipeline value drops >20%
   - Consultant utilization drops <70%
   - Training enrollment <5 students/month
   - Currency movements >5% INR/USD
   - Unexpected costs >₹5L

4. **Documentation & Communication**
   - Finance lead prepares forecast in spreadsheet
   - Circulate to BDM, HR, Ops Lead for input
   - CEO reviews and approves by 10th of month
   - Present summary to team by 15th in #finance channel

**KPIs to Track:**
- Forecast accuracy: actual vs 3-month prior forecast (target >85% accuracy)
- Reforecast frequency: track triggers and frequency

---

### 1.3 Cash Flow Management

**Frequency:** Weekly projection, daily monitoring

**Process:**

1. **Weekly Cash Flow Projection (Every Monday)**
   - Open spreadsheet: opening cash balance, scheduled receipts (AR), scheduled payments (AP/payroll)
   - Project next 4 weeks with daily detail
   - Identify cash low points or shortfall risks
   - Run 3 scenarios: expected, optimistic (early collections), pessimistic (delayed collections)

2. **Runway Calculation**
   - Formula: Current Cash / Monthly Burn Rate = months of runway
   - Minimum runway target: 3 months (₹36L in cash)
   - Trigger for action: if runway <2 months, escalate to CEO for contingency planning
   - Update in monthly business review

3. **Contingency Planning**
   - Debt facilities: credit line availability? Terms?
   - Investor commitments: any funding tranches pending?
   - Expense flexibility: which costs can be reduced in 30 days?
   - Receivables acceleration: early payment discounts, dunning strategy

4. **Daily Monitoring**
   - Monitor cash account daily for unexpected movements
   - Reconcile actual cash receipt/payments vs forecast
   - Update forecast if variances >$5K
   - Alert CEO if cash balance falls below 2-week burn

**KPIs to Track:**
- Runway (months): target ≥3 months
- Cash position: weekly trend
- Forecast vs actual: variance tracking

---

### 1.4 Financial Reporting

**Frequency:** Weekly flash, monthly P&L, quarterly board deck

**Process:**

1. **Weekly Flash Report (Every Friday, 5 PM IST)**
   - Cash position: opening, inflows, outflows, closing
   - AR status: # invoices outstanding, aging, collections
   - AP status: # payments pending, due dates
   - Payroll status: # consultants active, utilization %, pending payments
   - Key metrics: revenue YTD, margin, burn rate
   - Format: 1-page, color-coded (green/yellow/red)
   - Distribute: Slack #finance, CEO, board (if applicable)

2. **Monthly P&L (Due 15th of following month)**
   - Revenue: by stream (training, bench, contract), by geography/client if trackable
   - COGS/Direct costs: consultant payroll, subcontractor payments, training materials
   - Gross margin: % by stream
   - OpEx: salaries, rent, utilities, insurance, tech, compliance
   - EBITDA, net income
   - Cash basis vs accrual basis reconciliation
   - YTD cumulative P&L
   - Compare to budget and prior year
   - Distribute: CEO, investor, board (if applicable)

3. **Quarterly Board Deck (Within 10 days of quarter end)**
   - Executive summary: YTD performance vs plan
   - Financial highlights: revenue, margin, cash position
   - Waterfall: prior quarter vs current quarter
   - Variance analysis: revenue, costs, profitability
   - Headcount snapshot
   - Pipeline & growth outlook
   - Risk highlights and mitigation plans
   - Format: 5-7 slides, present in board meeting

4. **Currency Reporting**
   - InR-denominated costs: payroll, rent, local expenses
   - USD-denominated revenue: client billing
   - Forex exposure: notional USD/INR position
   - Fx impact on P&L: actual vs budget
   - Hedging strategy (if >20% revenue-cost mismatch)

**KPIs to Track:**
- Gross margin %: target >40% (training), >30% (bench), variable by contract
- Operating margin: path to break-even Month 4-5
- Revenue growth: MoM %, YTD %
- Burn rate: monthly, trend toward profitability

---

## 2. ACCOUNTS RECEIVABLE

### 2.1 Invoice Generation

**Frequency:** Varies by client (weekly, bi-weekly, monthly)

**Process:**

1. **Timesheet to Invoice Conversion**
   - Input: Approved timesheet (consultant hours by week)
   - Verification:
     - Hours match approved timesheet
     - Rate matches contract/SOW with client
     - Consultant is active in system
     - No duplicate invoicing (cross-check prior invoices)
   - Calculate billable hours: exclude PTO, training, unpaid time
   - Apply client-specific rules (see 2.1.2 below)

2. **Billing Rules by Client (Contract/SOW)**
   - **Fixed hours contracts:** Bill agreed hours regardless of actual (unless underutilization clause)
   - **Time & materials:** Bill actual hours worked
   - **Markup/spread:** Verify markup applied to consultant rate
   - **Discount:** Apply contract-negotiated discounts or volume commitments
   - **Retainer models:** Bill fixed monthly, true-up quarterly
   - **VMS/MSP requirements:** Include required fields, tags, cost centers, project codes

3. **Invoice Creation**
   - System: Use invoicing tool (QuickBooks, FreshBooks, or custom)
   - Template: Client-specific (some prefer certain formats, logos, contact info)
   - Data required:
     - Invoice number (unique, sequential)
     - Invoice date
     - Bill period (start-end dates)
     - Consultant name, role, hours, rate
     - Total amount (USD)
     - InTime company details (address, tax ID if applicable, bank for wire transfer)
     - Client PO number (if required by contract)
     - Terms: Net 30/45 (per contract)
   - Review & sign-off: Finance lead reviews, Ops coordinator approves before sending

4. **Special Cases**
   - **Training revenue invoices:** Fixed price (₹1.5L per batch), invoice upon completion
   - **Subcontractor/C2C payments:** Issued as vendor invoices to consultants (reverse flow)
   - **Multiple clients:** Separate invoices per client per period
   - **Partial month:** Pro-rate hours, clearly note in invoice

**Approval Workflow (ASCII Diagram):**
```
Timesheet Approved
      ↓
Finance Lead Verifies Hours & Rates
      ↓
Decision: Correct?
   ├─ No → Return to Approver for Correction
   │
   └─ Yes → Generate Invoice
           ↓
        Ops Coordinator Reviews
           ↓
        Decision: Quality Check Pass?
           ├─ No → Return for Edits
           │
           └─ Yes → Mark Ready to Send
```

---

### 2.2 Invoice Delivery

**Process:**

1. **Delivery Channels (by client preference)**
   - **Email:** PDF attachment, memo-style email with payment details
   - **Portal:** Upload to client's vendor portal or Fieldglass/Beeline
   - **EDI/VMS:** System-to-system transmission if supported
   - **Manual:** For small clients or special arrangements

2. **Format Standards**
   - PDF: Clear formatting, easy to read, company logo
   - Email subject: "Invoice [#] - [Consultant Name] - [Period]"
   - Payment instructions: Wire transfer details (bank name, account, routing, SWIFT if international)
   - Contact: Ops coordinator email, finance lead escalation contact
   - Attach: Supporting docs if required (timesheets, POs)

3. **Timing**
   - Target: Send within 2 business days of timesheet approval
   - Deadline: Friday for weekly billings, end of period for periodic billings
   - Note: Client may have "invoice cutoff" (e.g., must receive by 5 PM to process same week)

4. **Confirmation & Tracking**
   - Log invoice in AR aging spreadsheet upon sending (date, amount, invoice #, expected payment date)
   - Obtain email read receipt if available
   - For portal uploads, confirm submission (screenshot/confirmation email)
   - Update status: "Sent - Awaiting Payment"

---

### 2.3 Payment Tracking

**Frequency:** Daily monitoring, weekly reporting

**Process:**

1. **Expected vs Received Tracking**
   - Maintain AR spreadsheet (or system):
     - Invoice #, client, amount, invoice date, terms, expected payment date
     - Actual payment date, payment method, amount received
     - Status: Awaiting, Received, Disputed, Partial

2. **Aging Buckets**
   - **Current:** 0-30 days from invoice date
   - **30+ days:** 31-60 days
   - **60+ days:** 61-90 days
   - **90+ days:** >90 days (escalation required)
   - Weekly report: Total A/R by bucket, trend, % of total

3. **Aging Analysis**
   - Current + 30: "Good standing" clients, normal payment cycle
   - 60+: Attention needed, likely payment delay or dispute
   - 90+: Escalation to CEO/account manager, may indicate client financial distress
   - Seasonal patterns: Some clients (gov, enterprise) have fixed payment cycles; adjust expectations

4. **Variance Investigation**
   - Payment received != Invoice sent: Investigate reason
     - Partial payment: Ask client why (invoice disputed, budget issue, dispute amount?)
     - Early payment: Accept and note (credit to client account if applicable)
     - Wrong amount: Verify invoice amount sent vs received; follow up if discrepancy

5. **System Reconciliation**
   - Weekly: Reconcile bank deposits to invoices sent
   - Match: transaction date, amount, client
   - Identify gaps: Missing invoice, wrong amount, stale invoices
   - Escalate: Unmatched transactions >$1K or >1 week old

**KPIs to Track:**
- DSO (Days Sales Outstanding): target <45 days
- % invoices paid on-time (within contract terms): target >90%
- Aging: % current, % 30+, % 60+, % 90+ (target >80% current)

---

### 2.4 Collections

**Escalation Ladder:**

```
Day 0-30: No Action (Normal Payment Period)
           ↓
Day 31-45: Email Reminder (Ops Coordinator)
           - "Just checking in, did you receive invoice #XYZ?"
           - Include copy of invoice
           - Request confirmation of receipt/payment status
           ↓
Day 46-60: Follow-up Call (Account Manager or Ops Lead)
           - Call client point of contact
           - Confirm receipt, ask payment status
           - Troubleshoot: missing PO, invoice issues, payment delays
           ↓
Day 61-90: Escalation to CEO + Account Manager
           - CEO reaches out to client leadership
           - Review contract terms, payment history
           - Discuss: payment schedule, early payment discounts, issues
           ↓
Day 90+:   Legal/Vendor Management
           - Escalate to external counsel if >$10K
           - Place client on COD or payment-in-advance terms
           - Consider removing client from active pipeline
```

**Collections Process:**

1. **Email Reminder (Day 31)**
   - Template:
     ```
     Subject: Payment Confirmation - Invoice #XYZ

     Hi [Client Contact],

     I wanted to follow up on invoice #XYZ for [period] in the amount of $[X],
     which was sent on [date] with payment terms Net 30.

     Could you please confirm receipt and expected payment date?

     If you have any questions or issues, please let me know.

     Best regards,
     [Ops Coordinator Name]
     ```
   - Follow up if no response within 3 business days

2. **Phone Call (Day 46)**
   - Account manager calls client contact (AR clerk or controller)
   - Questions:
     - Did you receive invoice #XYZ?
     - Are there any issues (incorrect amount, missing info)?
     - When do you expect to process payment?
     - Do you need anything from us (revised invoice, documentation)?
   - Document call notes in CRM

3. **CEO Escalation (Day 61)**
   - CEO calls client leadership (VP, CFO, or procurement lead)
   - Tone: Problem-solving, not accusatory
   - Topics:
     - Payment status and timeline
     - Any invoicing issues or disputes
     - Relationship health check
     - Opportunity to strengthen partnership
   - Document in CRM; determine if relationship is at risk

4. **Legal Escalation (Day 90+)**
   - Prepare for potential debt collection
   - Options:
     - Demand letter (via email from legal counsel)
     - Small claims court (if <$10K and client in US)
     - Collection agency (if cost-effective)
     - Debt write-off (if uncollectible)
   - Document all efforts in file

**Collections KPIs:**
- Invoices collected on-time: target >90%
- Time to first collection action: target <35 days
- Collection rate by escalation level: email 70%, call 90%, CEO 95%+

---

### 2.5 Client Credit Management

**Process:**

1. **Credit Limit Assignment**
   - New clients: Start with $10K credit limit
   - Increase after: 3 on-time payments OR $50K revenue generated
   - Assignment: Finance lead sets in system, communicates to account manager
   - Review: Quarterly or after major order

2. **Credit Scoring**
   - Factors:
     - Payment history: % on-time (0-30 points)
     - Payment frequency: consistency (0-20 points)
     - Age as customer: tenure (0-15 points)
     - Relationship: annual spend, growth (0-15 points)
     - External factors: news, D&B rating if available (0-20 points)
   - Score: 0-100
     - 80-100: Excellent (increase credit limit 25%)
     - 60-79: Good (maintain current limit)
     - 40-59: Fair (apply payment terms restrictions)
     - <40: Poor (require upfront payment or escrow)

3. **Risk Classification**
   - Green: Score ≥80, zero past-due invoices, established payment pattern
   - Yellow: Score 60-79, minor late payments (1-2), OR new client with limited history
   - Red: Score <60, OR >60 days past due, OR multiple disputed invoices
   - Actions by tier:
     - Green: Standard Net 30 terms
     - Yellow: Net 15 terms or require PO before invoicing
     - Red: Prepayment or credit card only; limit credit exposure

4. **Client Communication**
   - Communicate credit policy in contract/SOW
   - Track payment performance
   - If client moves to Yellow/Red, CFO/CEO discusses with account manager
   - Opportunity to improve: early payment discounts (1% for Net 15, etc.)

---

## 3. ACCOUNTS PAYABLE

### 3.1 Contractor/Consultant Payroll Processing

**Frequency:** Weekly or bi-weekly (depends on contract terms)

**Process:**

1. **Timesheet Verification**
   - Input: Approved timesheet from Ops (submitted by consultant, approved by delivery manager)
   - Verify:
     - Consultant is active and on payroll
     - Hours are reasonable (no >60 hours/week unless authorized)
     - Start/end dates match employment period
     - No duplicate payments in prior weeks
   - Flag: Unpaid time, sick days, PTO (should be excluded from billing but paid per contract)

2. **Payroll Run Preparation**
   - Compile all verified timesheets for payment period
   - Calculate:
     - Regular hours × hourly rate
     - Overtime (if applicable): hours >40/week × 1.5× rate
     - Bonuses or incentives (if applicable)
     - Deductions: taxes (if W2), other agreed deductions
   - For C2C (Corp-to-Corp): No tax withholding required
   - For W2: Apply federal, state, FICA withholding

3. **Payroll Processing**
   - Use payroll service (ADP, Gusto, or manual process if <20 consultants)
   - Steps:
     - Upload timesheet data
     - Review calculations for errors
     - Approve payroll run
     - Generate payment file (ACH for US consultants)
     - Obtain second sign-off (CEO or finance lead)
   - Payment method: ACH direct deposit (preferred), wire transfer (if requested)

4. **Payment Execution**
   - Schedule ACH: Process by Thursday, settle Friday (or next business day)
   - Wire transfers: Same-day or next-day depending on bank
   - Confirm: Check payment status in bank account by settlement date
   - Document: Payment confirmation (ACH receipt, wire reference number)

5. **Post-Payment Reconciliation**
   - Match bank statement to payroll run:
     - # of payments issued vs # of consultants paid
     - Total amount charged to account
   - Verify: Each consultant received expected amount
   - Investigate: Missing payments, incorrect amounts
   - Reconcile: Post to general ledger, tag as payroll expense

**Consultant Payroll Cycle (Example: Weekly, Friday payment):**

```
Monday:      Consultants submit timesheets
Tuesday 6AM: Delivery manager reviews/approves
Tuesday 10AM: Ops coordinator compiles in system
Tuesday 2PM: Finance lead verifies
Wednesday:   Payroll loaded to service, CEO approves
Thursday:    Payment file submitted to bank (ACH)
Friday:      Payments settle in consultant accounts
```

**KPIs to Track:**
- On-time payment rate: target 100%
- Payroll processing cycle time: target <3 days from timesheet approval
- Payroll accuracy: variance in pay <0.5%

---

### 3.2 Vendor Payments

**Process:**

1. **Subcontractor Invoices**
   - Receive: Invoice from subcontractor
   - Match: To SOW/contract (rate, terms, deliverables)
   - Verify: Work completed (status check with hiring manager)
   - Approve: Finance lead approves payment authorization
   - Pay: Per contract terms (Net 15, Net 30, etc.)
   - Method: Bank transfer, ACH, or check

2. **Vendor Bills (Non-Payroll)**
   - Suppliers: Software, hardware, services (e.g., recruiting tools, cloud services)
   - Process:
     - Receive invoice
     - Match to PO (if required)
     - Verify: Goods/services received, quality acceptable
     - Route to approver based on amount and category
     - Pay per terms (usually Net 30)
   - Controls: No invoice >$5K without CFO approval

3. **Expense Reimbursements**
   - Employee submits: Receipt(s), business purpose, category
   - Manager approves: Confirms business purpose, amount
   - Finance processes: Reimburse within 5 business days
   - Limits: Per policy (meals $25/day, travel pre-approved)

4. **Payment Timing**
   - Policy: Pay all invoices by due date to maintain vendor relationships
   - Early payment discounts: If applicable (e.g., 2/10 Net 30), consider cash flow vs discount value
   - Late payments: Only if cash flow issue; communicate with vendor proactively

---

### 3.3 Internal Payroll (India Team)

**Frequency:** Monthly (fixed payroll) + variable components

**Process:**

1. **Monthly Salary Processing**
   - Employees: 16-person team (CEO, finance, HR, ops, sales, recruitment, delivery, etc.)
   - Fixed: Agreed monthly salary, documented in employment letter
   - Variable: Bonus, commission (if applicable)
   - Process:
     - HR confirms attendance (no unpaid leave)
     - Finance calculates net pay (salary - deductions)
     - Payroll submitted to bank (same-day or next-day ACH in India)
     - Confirmation: Employees confirm receipt

2. **Statutory Deductions (India)**
   - **PF (Provident Fund):** 12% of basic salary (employee + employer contribution)
   - **ESI (Employee State Insurance):** ~4.75% of salary (if employee <₹21K/month)
   - **TDS (Tax Deducted at Source):** Based on income tax slab (progressive)
   - **Professional tax:** ₹2.5K/month (varies by state)
   - Compliance: File PF/ESI returns quarterly, TDS returns monthly

3. **Salary Components (Example)**
   - Basic salary
   - Dearness allowance (DA): Cost-of-living adjustment
   - House rent allowance (HRA): If employee rents
   - Conveyance: Transportation allowance
   - Medical: Health coverage allowance
   - Special allowance: Catch-all for benefits
   - Gross = sum of components
   - Deductions: PF, ESI, TDS, professional tax, personal deductions
   - Net = Gross - Deductions

4. **Payroll Calendar**
   - 25th of month: Salary payment date
   - Month-end: Prepare payroll (26th-28th)
   - Month-end: File statutory returns if due
   - Quarterly: PF/ESI statements
   - Annual (March): Tax filing, Form 16 generation

5. **Currency Conversion**
   - Track INR payroll in INR; report in USD using month-end rate
   - Example: ₹12L monthly burn ÷ 83 INR/USD = ~$14.5K monthly
   - Update forex rate for P&L reporting (actual vs budget)

**KPIs to Track:**
- Payroll accuracy: 100% correct calculations
- On-time payment: 100% by 25th of month
- Statutory compliance: 0 late filings

---

### 3.4 Expense Management

**Process:**

1. **Approval Workflow**
   - All expenses: Require manager approval before submission
   - <₹5,000: Manager approves
   - ₹5K-₹25K: Finance lead approves
   - >₹25K: CEO approves
   - Categories: Travel, meals, supplies, software, professional services

2. **Reimbursement Processing**
   - Employee submits: Receipt, category, business purpose, date
   - Manager reviews: Legitimate business expense?
   - Finance: Verify amount, match to receipt, process payment
   - Timeline: Reimburse within 5 business days of approval

3. **Policy Limits** (Example, to be customized)
   - **Meals:** ₹500/person/day (max ₹1,500 for team outings)
   - **Travel:** Economy flights only, 3-star hotels or equivalent
   - **Internet/phone:** Reimbursement if pre-approved for remote work
   - **Professional development:** ₹50K/person/year (pre-approval required)

4. **Policy Enforcement**
   - Regular audits: Finance lead reviews all reimbursements monthly
   - Non-compliant expenses: Denied reimbursement; discussed with employee
   - Serial offenders: Escalated to CEO/HR

---

### 3.5 Payment Reconciliation

**Frequency:** Weekly

**Process:**

1. **Bank Statement Reconciliation**
   - Download: Bank statement (daily or weekly)
   - Compare: Transactions in bank vs. approved payments (payroll, invoices, expenses)
   - Identify: Uncleared checks, ACH delays, bank fees
   - Adjust: General ledger for bank fees, interest (if any)
   - Discrepancies: Investigate any unmatched transaction >₹10,000 or >3 days old

2. **Outstanding Items Resolution**
   - Issued but uncleared payments: Track in spreadsheet (date issued, expected clear date)
   - Outstanding >1 week: Follow up with recipient (check delivery issue, ACH delay)
   - Stale checks: >180 days outstanding should be voided and re-issued
   - Bank holds or delays: Document and communicate to affected parties

3. **Accrual Tracking**
   - Accrued expenses: Invoices received but not yet paid (due in future period)
   - Accrued payroll: Consultants worked but not yet paid
   - Track in separate accrual schedule; reconcile month-end for P&L

4. **System Records**
   - Update general ledger: All payments, receipts, adjustments
   - Bank reconciliation statement: Attach to monthly close checklist
   - Audit trail: Keep all supporting documents (invoices, payment receipts, reconciliations)

**Bank Reconciliation Template (ASCII):**
```
Bank Balance (per statement):                    $150,000
  + Outstanding deposits:                        +$5,000
  - Outstanding checks:                          -$8,000
  - Uncleared ACH:                               -$3,000
  ────────────────────────────────────────────────────
Adjusted Bank Balance:                           $144,000

Accounting Records Balance:                      $144,000
  ────────────────────────────────────────────────────
RECONCILED ✓
```

---

## 4. TIMESHEET MANAGEMENT

### 4.1 Collection

**Frequency:** Weekly (submitted Friday, approved Monday)

**Process:**

1. **Reminder Sequence**
   - Thursday 2 PM: Ops coordinator sends reminder (Slack + email)
     - "Reminder: Timesheets due tomorrow (Friday) by 6 PM"
     - Include link to timesheet system
   - Friday 4 PM: Second reminder (if not yet submitted)
     - "Timesheet deadline is in 2 hours (6 PM)"
   - Friday 6 PM: System closes for submissions
   - Monday 9 AM: Final notice for missing timesheets
     - "Your timesheet for [period] is missing. Please submit immediately."

2. **Escalation for Missing Timesheets**
   - Day 1 (Friday): Ops coordinator reaches out via Slack
   - Day 2 (Monday): Delivery manager calls consultant
   - Day 3 (Tuesday): Delivery manager escalates to consultant's account manager
   - Day 4+ (Wednesday): Halt work authorization if timesheet not submitted
     - Notify consultant: Cannot bill hours without timesheet
     - Notify client: Work halted pending timekeeping
   - Resolution: Once submitted, can resume work and bill retroactively (if client approves)

3. **System Access & Training**
   - All consultants: Have system access on day 1 (email, password, orientation)
   - Training: How to log hours, submit timesheet, track time daily
   - Support: Ops coordinator available for tech issues (response <2 hours)
   - Backup: Manual timesheet submission via email (in case of system issues)

**Timesheet Reminder Template (Slack):**
```
@channel Timesheet Reminder 📋

Timesheets for [Period: M/DD - M/DD] are due TOMORROW (Friday) by 6 PM IST.

Please submit here: [link to system]

Questions? Reach out to [Ops coordinator name] in #delivery

Thank you!
```

---

### 4.2 Approval Workflow

**Process:**

```
CONSULTANT SUBMITS TIMESHEET (Friday by 6 PM)
           ↓
DELIVERY MANAGER REVIEWS (Monday 10 AM - noon)
  Check: Hours reasonable? Any gaps or overages?
  Missing context? Reach out to consultant
           ↓
Decision: Hours correct?
   ├─ No → Return to Consultant (with feedback)
   │         Consultant has until Tuesday 10 AM to correct
   │
   └─ Yes → Approve (mark in system)
              ↓
OPERATIONS COORDINATOR FINAL APPROVAL (Monday noon - 2 PM)
  Check: Approved by manager? Dates match invoice period?
         Any data quality issues?
           ↓
Decision: Ready for billing?
   ├─ No → Request correction from ops team
   │
   └─ Yes → FINALIZE (mark approved in system, prepare for invoicing)
              Notify finance that timesheet is ready
              Lock timesheet (no edits allowed post-approval)
```

---

### 4.3 Exception Handling

**Common Exceptions & Resolution:**

1. **Overtime (>40 hours/week for W2 consultants)**
   - Policy: Requires pre-approval from account manager
   - Approval process: Consultant requests, manager approves, invoice notes "OT"
   - Payment: Overtime hours paid at 1.5× rate (if W2)
   - Billing: Some clients bill OT at standard rate, some at premium; verify SOW

2. **Corrections & Amendments**
   - Before approval: Consultant can edit freely
   - After approval: Freezes for edit; requires manager request
   - Correction request:
     - Reason: What changed? (e.g., "Incorrect date", "Missed 2 hours Tuesday")
     - Evidence: Supporting docs (client email, chat log, calendar invite)
     - Decision: Ops lead approves, finance adjusts invoice if already sent
   - Deadline: Corrections must be submitted within 5 business days of period end

3. **Disputes (Consultant vs. Manager disagreement)**
   - Escalation:
     - Level 1: Consultant + Manager discuss (email)
     - Level 2: Ops lead mediates (if no agreement within 24 hours)
     - Level 3: CEO decides (if disagreement on policy interpretation)
   - Example dispute: "Consultant logged 45 hours, manager says only 40 worked"
     - Resolution: Review client work product, delivery milestones, client feedback
   - Timeline: Resolve within 3 business days to avoid payment delay

4. **Late Submissions (submitted >1 week after deadline)**
   - Policy: Can still submit, but flag in system as "late"
   - Process: Same approval workflow, but noted as late
   - Impact: May delay invoice and payment (hold until all timesheets received)
   - Consultant communication: Explain impact on cash flow; encourage timely submission

---

### 4.4 Deadline Enforcement

**Deadlines:**
- Consultant submission: Friday 6 PM IST (hard deadline; system closes)
- Manager approval: Monday noon (soft deadline; send reminder at 11:30 AM)
- Ops finalization: Monday 2 PM (hard deadline; locks timesheet)
- Finance invoicing: Tuesday (requires finalized timesheet by Monday 2 PM)

**Enforcement Process:**
- Missed deadline = escalation (see 4.1 Escalation for Missing Timesheets)
- Repeated missing timesheets (3+ months): Escalate to CEO; may affect placement

---

### 4.5 System Reconciliation

**Frequency:** Weekly (after finalization) & monthly (full audit)

**Process:**

1. **Weekly Reconciliation**
   - Compare: Timesheet hours vs. invoice hours vs. payroll hours
   - For each consultant:
     - Timesheet hours (approved)
     - Invoice hours (billed to client)
     - Payroll hours (amount paid)
   - Discrepancies:
     - Timesheet ≠ Invoice: Should match; if not, investigate (client may cap hours, unauthorized time, etc.)
     - Invoice ≠ Payroll: Should match; if not, investigate (overpayment, underpayment, error)
   - Report: List any variance >5% to Ops lead

2. **Monthly Audit**
   - Pull all timesheets, invoices, and payroll records for the month
   - Reconciliation table:
     - Consultant | Timesheet Hours | Invoice Hours | Payroll Hours | Variance | Notes
   - Reconciliation rate: Target >99% (variance <1%)
   - Variance analysis: Root cause for any discrepancy
   - Sign-off: Finance lead signs off on monthly reconciliation

**Reconciliation Template (ASCII):**
```
TIMESHEET RECONCILIATION - January 2026

Consultant        | Timesheet | Invoice | Payroll | Status
────────────────────────────────────────────────────────
John Smith        |    160    |   160   |   160   | ✓
Jane Doe          |    155    |   155   |   155   | ✓
Raj Patel         |    165    |   160   |   160   | ⚠ (5 hrs OT)
Maria Garcia      |    150    |   140   |   140   | ? (10 hrs missing)

Notes: Maria's 10 missing hours = approved leave (not billable)
       Raj's OT approved by client per email [date]

RECONCILIATION RATE: 99.4% ✓
```

---

## 5. PAYROLL PROCESSING

### 5.1 US Consultant Payroll (W2)

**Frequency:** Weekly or bi-weekly (depends on consultant contract)

**Process:**

1. **W2 Setup**
   - New consultant: Collect W-4 form (federal tax withholding)
   - Collect state tax forms (if applicable)
   - Verify: SSN, address, filing status
   - Set up in payroll system (ADP, Gusto, etc.)

2. **Tax Withholding**
   - Federal: Withhold based on W-4 (allowances, additional withholding)
   - FICA: 6.2% Social Security + 1.45% Medicare (employer also pays matching)
   - State: Varies by state; some states no income tax, others have high rates
   - Local: NYC, some cities have local income tax
   - Quarterly: File 941 form (federal), state equivalents
   - Annual: File W-2s (due Jan 31)

3. **Direct Deposit Setup**
   - Consultant provides: Bank account details (routing number, account number)
   - Payroll system: Routes ACH payment to consultant's bank
   - Verification: Test micro-deposits (2-3 small deposits, consultant confirms)
   - Confirmation: Consultant confirms direct deposit working after first payment

4. **Regular Payroll Processing**
   - Input: Approved timesheet (hours)
   - Calculate:
     - Gross: Hours × Hourly rate
     - Taxes: Federal, FICA, state, local
     - Deductions: Benefits (health insurance, 401k, other)
     - Net: Gross - taxes - deductions
   - Review: Check for errors before processing
   - Approve: CEO or CFO sign-off on payroll
   - Submit: File with payroll processor (ACH)
   - Settle: Funds transfer next business day

**W2 Payroll Cycle (Example: Bi-weekly):**
```
Monday:    Timesheet collection deadline
Tuesday:   Delivery manager approval
Wednesday: Finance verifies and processes
Thursday:  Payroll processor submits to bank
Friday:    Settlement (funds arrive in consultant account)
```

---

### 5.2 C2C (Corp-to-Corp) Payments

**Frequency:** Per invoice (usually monthly, Net 15/30)

**Process:**

1. **Invoice Receipt & Verification**
   - Subcontractor invoices InTime for services rendered
   - Verification:
     - Invoice matches SOW/contract (rate, period, deliverables)
     - Work completed per delivery manager
     - No duplicate invoices
     - Amount correct

2. **Approval Workflow**
   - Ops lead: Verifies work completion
   - Finance: Verifies amount and contract terms
   - CEO/CFO: Approves payment (if >$5K or unusual)
   - Approval: Usually within 2-3 business days

3. **Payment Processing**
   - Method: Bank transfer or ACH (per contractor preference)
   - Terms: Net 15 (standard, payable within 15 days of invoice)
   - Timing: Pay by due date to maintain relationship
   - Confirmation: Send payment confirmation to contractor (date, amount, reference)

4. **Tax Treatment**
   - No W2 forms (contractor handles own taxes)
   - No payroll taxes (contractor responsible)
   - Annual: File 1099 forms if >$600 paid per contractor per year
   - Document: Keep invoice and payment records for audit

---

### 5.3 India Team Payroll

**Frequency:** Monthly (fixed salaries) + variable (bonuses, if applicable)

**Process:**

1. **Monthly Salary Processing**
   - Input: HR confirms attendance (no unpaid leave)
   - Fixed salaries: Per employment contract
   - Variable: Bonuses, incentives (if applicable)
   - Calculation:
     - Gross = Fixed salary + DA + HRA + Conveyance + Medical + Variable
     - Deductions = PF + ESI + TDS + Professional Tax + Other
     - Net = Gross - Deductions
   - Review: Finance verifies calculation (no errors)
   - Approval: CEO approves payroll
   - Submit: Bank transfer instruction to payroll bank
   - Settle: 25th of month (standard date)

2. **Statutory Contributions**
   - PF (Provident Fund): 12% employee + 12% employer (deferred retirement contribution)
   - ESI (Employee State Insurance): ~4.75% employer (health/disability insurance for <₹21K/month employees)
   - TDS (Tax Deducted at Source): Progressive slab, depends on employee income
   - Professional Tax: ₹2.5K/month (varies by state)
   - Compliance: File returns with government authorities

3. **Statutory Filings**
   - Monthly: TDS returns (ITNS to income tax dept)
   - Quarterly: PF & ESI statements
   - Annual: Form 16 (TDS certificate), employee tax filing support
   - Year-end: Reconciliation of annual taxes, bonus calculations

4. **Payroll Reconciliation**
   - Monthly: Verify all employees received correct net pay
   - Match bank account transfers to approved payroll
   - Discrepancies: Investigate and correct immediately
   - Documentation: Keep payroll register, bank statements, employee confirmations

---

### 5.4 Special Cases

**1. Overtime Calculation**
   - W2 Consultants (US): >40 hours/week = 1.5× rate (if approved)
   - India Team: Usually salaried (no OT, included in salary)
   - Billing: Verify client contract (some include OT in rate, some pay premium)
   - Process:
     - Identify OT hours (>40/week)
     - Verify pre-approval (manager + account manager)
     - Calculate: OT hours × rate × 1.5
     - Include in payroll, labeled as "Overtime"

**2. Bonus Payouts**
   - Eligibility: Per employee contract or company policy
   - Calculation: % of annual salary, monthly/quarterly/annual timing
   - Trigger: Revenue targets, profitability, individual performance
   - Process: Finance calculates, CEO approves, process in regular payroll
   - Timing: Usually month-end (with salary) or specific dates

**3. Final Settlements (Separation)**
   - Consultant terminates: Calculate final pay (all earned hours, accrued PTO if applicable)
   - Deductions: Return company property, outstanding advances (if any)
   - Final check: Include all earned compensation + any accruals
   - Compliance: Obtain signed separation agreement, release of claims
   - Timeline: Final pay within 3 business days of last day

**4. Salary Advances**
   - Policy: Only in exceptional circumstances (medical emergency, etc.)
   - Approval: CEO approval required
   - Amount: Advance on future salary (max 1 month ahead)
   - Repayment: Deducted from next 2 paychecks
   - Documentation: Signed advance agreement

---

### 5.5 Payroll Calendar

**Monthly Payroll Calendar (Example):**

```
Date              Event
──────────────────────────────────────────
25th (prior month) End of payroll period
1st               HR submits attendance
5th               Finance reviews, processes
10th              Payroll submitted to bank
15th              Settlement (funds arrive)
20th              Statutory filings due (if applicable)
25th              Next month payroll date
```

**Quarterly Calendar:**

```
March 31         Q4 (Oct-Dec) PF/ESI statement
June 30          Q1 (Jan-Mar) PF/ESI statement
September 30     Q2 (Apr-Jun) PF/ESI statement
December 31      Q3 (Jul-Sep) PF/ESI statement
```

**Annual Calendar:**

```
January 31       W-2s issued (US), Form 16s issued (India)
March 15         US employer tax returns (941)
May 31           Annual PF statement (India)
June 30          Annual ESI statement (India)
```

**KPIs for Payroll:**
- On-time payment rate: 100%
- Payroll accuracy: <0.5% variance
- Statutory compliance: 0 late filings
- Payroll cycle time: <5 days from timesheet to payment

---

## 6. INVOICING OPERATIONS

### 6.1 Invoice Creation

**Process:**

1. **Billing Period Definition**
   - Determine: Weekly, bi-weekly, or monthly based on client contract
   - Dates: [Start date] - [End date]
   - Cross-check: Matches timesheet period

2. **Hours Verification**
   - Pull: Approved timesheets for period
   - Verify:
     - All hours approved by manager
     - No duplicate entries
     - Billable hours (exclude PTO, unpaid time, training)
   - Total: Sum billable hours by week/consultant

3. **Rate Verification**
   - Client contract: Review SOW for rate agreement
   - Consultant rate: Cross-check against master rate card
   - Markup: Verify spread/markup applied (if any)
   - Discounts: Apply any volume discounts or negotiated rates

4. **Invoice Calculation**
   - Formula: Hours × Rate = Invoice Amount
   - Example:
     - Consultant: John Smith
     - Hours: 40 hours/week × 4 weeks = 160 hours
     - Rate: $50/hour
     - Amount: 160 × $50 = $8,000
   - Multi-consultant invoices: Sum all consultants

5. **Template Selection**
   - Client-specific formats (some clients require specific layout, logo placement, etc.)
   - Standard info:
     - Invoice number (unique, sequential)
     - Invoice date
     - Bill period dates
     - Consultant name, role, hours, rate, amount
     - InTime details (address, tax ID, bank for wires)
     - Payment terms (Net 30, Net 45, etc.)
     - Client PO number (if required)

6. **Quality Check**
   - Ops coordinator reviews:
     - All required fields completed
     - Numbers correct
     - Format clean and professional
     - Client contact info correct
   - Sign-off: Approved for sending

---

### 6.2 Billing Schedules

**Frequency Variations:**

1. **Weekly Billing** (Typical for bench placements)
   - Invoice sent: Every Friday or Monday
   - Bill period: 7 calendar days (Mon-Sun)
   - Payment expected: Net 30-45 (by following week/two weeks)
   - Advantage: Faster cash flow; Disadvantage: More invoices to manage

2. **Bi-Weekly Billing** (Common for contract placements)
   - Invoice sent: Every other week (Friday or Monday)
   - Bill period: 14 calendar days
   - Payment expected: Net 30-45
   - Advantage: Fewer invoices; Disadvantage: Slightly slower cash flow

3. **Monthly Billing** (Typical for enterprise clients)
   - Invoice sent: End of month or early next month
   - Bill period: Calendar month
   - Payment expected: Net 30-45 (within 30-60 days)
   - Advantage: Cleaner accounting; Disadvantage: Slower cash flow

**Client-Specific Billing:**
- Enterprise clients: Often prefer monthly (consolidated invoicing)
- MSP/Vendor managers: Often require weekly or bi-weekly (system integration)
- Small/medium clients: Flexible, based on preference
- Contract negotiation: Finalize billing frequency in SOW

---

### 6.3 VMS/Portal Billing

**Platforms:**
- Fieldglass (SAP Fieldglass): Large enterprise clients, detailed requirements
- Beeline: Mid-market clients, flexible format
- IQNavigator: MSP-managed vendors
- Others: Specific to client systems

**Process:**

1. **Portal Setup**
   - Obtain: Client VMS access credentials
   - Configure: InTime profile (company name, tax ID, bank, contact info)
   - Test: Send sample invoice; verify receipt and processing

2. **Invoice Submission**
   - Manual entry: Fill in consultant hours, rate, amount in portal
   - File upload: Prepare CSV/flat file (if system supports)
   - Required fields: Varies by platform; typically: Date, Consultant name, Hours, Rate, Amount
   - Validation: System checks for errors (missing fields, invalid formats)
   - Submit: Confirm submission (screenshot for records)

3. **Submission Timing**
   - Deadline: Before client's accounting cutoff (usually mid-month or month-end)
   - Confirmation: Portal shows "submitted" status
   - Issues: Resubmit if rejected due to errors

4. **Reconciliation**
   - Track: Submitted invoice date, amount, status
   - Follow-up: Monitor in portal for "approved" status
   - Collections: Note portal reference # for follow-up if payment delayed

---

### 6.4 AR Aging Management

**Frequency:** Weekly review, action taken on aging >60 days

**Process:**

1. **Weekly Aging Report**
   - Pull: All outstanding invoices as of Friday 5 PM
   - Categorize:
     - Current: 0-30 days
     - 30+: 31-60 days
     - 60+: 61-90 days
     - 90+: >90 days
   - Total: By client, by bucket, overall
   - Trend: Compare to prior week, identify aging movement

2. **Report Distribution & Action**
   - Friday 5 PM: Aging report sent to finance lead, CEO
   - Action items:
     - Current/30: No action (normal)
     - 60+: Account manager reaches out (see Collections section 2.4)
     - 90+: CEO escalation required

3. **Client-Specific Analysis**
   - Top 5 clients: Track aging separately
   - Problem clients: More frequent collection activity
   - Good clients: Pattern of on-time payment

---

### 6.5 Revenue Recognition

**Accounting Principle:**
Revenue recognized when InTime has fulfilled its obligation (consultant has worked and deliverable has been provided).

**Policy:**
- **Upon Billing:** Recognize when invoice is sent (consultant worked, timesheet approved)
- **Upon Collection:** Conservative approach; recognize only when payment received
- **Best Practice:** Upon billing (if client creditworthy), adjust if payment fails

**Implementation:**
- Determine: Company policy (billing vs. collection basis)
- Process: Record revenue in month invoice sent or payment received (per policy)
- Documentation: Timesheet + invoice = proof of delivery
- Exceptions:
  - Disputed invoices: Hold revenue recognition until resolved
  - Refund-obligation invoices: Reduce revenue if refund likely

**Example:**
- January: Consultant works, timesheet approved (Jan 31)
- February: Invoice sent (Feb 2)
- February: Revenue recognized (Feb 2) if billing-basis; if collection-basis, wait for payment
- March: Payment received (Mar 15)
- If collection-basis: Revenue recognized Mar 15

**KPIs:**
- Revenue recognized vs. invoiced: Should match within 5-7 days
- Variance: <2% month-over-month

---

## 7. COMPLIANCE OPERATIONS

### 7.1 Document Tracking

**Documents to Track:**
- **Consultants (US):**
  - I-9 (identity & work authorization verification)
  - W-4 (federal tax withholding)
  - State tax forms (if applicable)
  - Insurance: COI (certificate of insurance), background check (optional)

- **Consultants (India):**
  - PAN (Permanent Account Number)
  - Bank details (for payroll)
  - Address proof
  - Professional certifications (if required)

- **Vendors/Subcontractors:**
  - W-9 (US tax form)
  - Contract/SOW
  - Insurance: General liability, E&O (if applicable)
  - Tax compliance: 1099 form collection

- **Company:**
  - Business licenses
  - Tax ID (EIN, GST if applicable)
  - Corporate documentation
  - Insurance: General liability, E&O, cyber (if applicable)

### 7.2 Certification Monitoring

**Expirations to Track:**
- Insurance policies: Annual renewal
- Licenses: Periodic renewal (varies by jurisdiction)
- Professional certifications: Client-required (if any)
- Background checks: Annual (best practice)

**Process:**
- Maintain: Spreadsheet with expiration dates
- 90-day alert: Finance lead notifies relevant person
- 60-day alert: Escalate to CEO if not renewed
- 30-day alert: Final notice; block work if not resolved
- Post-expiration: Suspension until renewed

### 7.3 Expiration Alerts

**Alert Schedule:**
- 90 days before: Reminder email "Please renew [document] by [date]"
- 60 days before: Escalation email to CEO
- 30 days before: Stop billing client until renewed (if critical document)
- On expiration: Block consultant from work until renewed

**Responsibility:**
- Finance lead: Tracks expiration calendar, sends alerts
- HR: Responsible for employee documents
- CEO: Approves exceptions, resolves delays

### 7.4 Audit Support

**Audit Readiness:**
- Documentation: All files organized and accessible
- Records: Timesheets, invoices, payments, reconciliations kept for 7 years
- Trails: Documented approvals and sign-offs
- Exceptions: Notable items explained and documented

**Audit Response:**
- External audit: Provide documentation on request
- Timeframe: 5-10 business days to produce records
- Contact: CEO coordinates with external auditor
- Findings: Follow-up on recommendations

---

## 8. REVENUE CYCLE (END-TO-END)

### 8.1 Cycle Flow

```
PLACEMENT
  ↓
TIMESHEET (Submitted Friday, Approved Monday)
  ↓
INVOICE (Sent Tuesday, Invoice period Mon-Sun)
  ↓
COLLECTION (Expected within 30-45 days)
  ↓
REVENUE RECOGNITION (Upon billing or payment, per policy)
  ↓
FINANCIAL REPORTING (Weekly flash, monthly P&L)
```

**Timeline Example:**
```
Monday    Jan 2:  Consultant starts work
Friday    Jan 5:  Timesheet submitted (40 hours)
Monday    Jan 8:  Timesheet approved
Tuesday   Jan 9:  Invoice sent ($2,000 @ $50/hr)
Tuesday   Jan 23: Payment received (Net 14)
Tue/Wed   Jan 23: Revenue recognized + payroll processed
Friday    Jan 26: Flash report shows cash receipt
```

### 8.2 Cycle Time Targets

**Target Cycle Times:**
- Timesheet approval: <2 business days (submit Friday, approve Monday)
- Invoice generation: <1 business day (approve Monday, send Tuesday)
- Total to invoice: <3 business days from timesheet submission
- Collection cycle: Net 30-45 days (30-day target, 45-day acceptable)
- Cash conversion cycle: <60 days total (from work to cash receipt)

**Levers to Improve:**
- Faster timesheet approval: Manager reviews Thursday afternoon
- Automated invoicing: Templates reduce manual entry
- Early payment discounts: Offer 2% if paid within 10 days
- Client payment terms negotiation: Push for Net 30 vs. Net 45

### 8.3 Cash Conversion Cycle

**Definition:** Time from cash outlay (consultant payroll) to cash receipt (client payment)

**Calculation:**
```
Consultant paid:          Friday (5 days after work)
Invoice sent:             Tuesday (10 days after work)
Expected payment (Net 30): 40 days after invoice
Total to cash receipt:    50-60 days after work
```

**Target:** <60 days (less than 2 months of working capital tied up)

**Improvement Levers:**
1. **Faster timesheet approval:** Save 2-3 days
2. **Faster invoicing:** Save 1 day
3. **Better client terms:** Net 30 vs. Net 45 (save 15 days)
4. **Early payment incentives:** 2% discount for Net 15
5. **Expedited client collection:** Follow up proactively at Day 20 (vs. Day 30)

**KPI:** Track monthly average CCC; target declining trend toward <45 days

### 8.4 Revenue Leakage Prevention

**Common Leakage Points:**

1. **Unbilled Hours**
   - Cause: Consultant works, but timesheet not submitted or approved
   - Prevention:
     - Automated reminders (see Timesheet Management section 4.1)
     - Escalation for missing timesheets (see section 4.1)
     - Weekly reconciliation of work logs vs. timesheets
   - Recovery: Follow up with consultant/manager within 5 days of period end

2. **Rate Discrepancies**
   - Cause: Invoice sent at wrong rate (outdated contract, manual error)
   - Prevention:
     - Master rate card: Single source of truth for all rates
     - Contract verification: Before each invoice, confirm rate
     - Approval step: Finance lead verifies rate before sending
   - Recovery: Send corrected invoice, follow up with client on discrepancy

3. **Missed Timesheets**
   - Cause: Consultant forgets to submit, or loses late
   - Prevention:
     - Reminders (Friday + Monday)
     - System enforcement: No other transactions (payroll, etc.) without timesheet
     - Manager accountability: Manager's responsibility to ensure team completes
   - Recovery: Accept late submission; invoice retroactively if client allows

4. **Overbilling Prevention**
   - Cause: Duplicate invoicing, extended hours not pre-approved
   - Prevention:
     - Timesheet deduplication: Check prior weeks for duplicate entries
     - OT approval: All OT >40 hrs/week requires pre-approval
     - Client communication: Confirm expected hours weekly
   - Recovery: Issue credit memo, follow up with client

5. **Contract Rate Verification**
   - Process:
     - Quarterly: Finance lead audits top 10 clients vs. contracts
     - Verify: Billing rate matches contract rate
     - Discrepancy: Correct and adjust prior invoices if needed
   - KPI: Zero rate discrepancies

**Revenue Leakage Dashboard (Monthly):**
```
Metric                          | Target | Actual | Gap
────────────────────────────────────────────────────────
% of hours billed              | 100%   | 98%    | 2%
% of invoices at correct rate  | 100%   | 99%    | 1%
% timesheets on time           | 95%    | 92%    | -3%
Days to invoice after approval | 1 day  | 1.2    | -0.2
```

---

## APPENDIX: KPI METRICS DICTIONARY

**Definition:** All KPIs used throughout this SOP, with calculation formula, target, and frequency.

### Financial KPIs

**Gross Margin %**
- Formula: (Revenue - COGS) / Revenue × 100
- Target: 40% (training), 30% (bench), variable (contract)
- Frequency: Monthly
- Owner: Finance Lead
- Use: Revenue quality, pricing health

**Operating Margin %**
- Formula: (EBITDA / Revenue) × 100
- Target: -50% (month 1), path to 15% by month 12
- Frequency: Monthly
- Owner: CEO
- Use: Progress toward profitability

**Burn Rate**
- Formula: (Operating expenses) / month
- Target: ~₹12L/month, declining to ₹8L by month 6
- Frequency: Monthly
- Owner: Finance Lead
- Use: Runway planning, cost control

**Runway**
- Formula: Cash balance / Monthly burn rate
- Target: ≥3 months
- Frequency: Weekly
- Owner: CEO
- Use: Funding triggers, contingency planning

**DSO (Days Sales Outstanding)**
- Formula: (Average AR / Daily revenue) OR (AR at month-end / Revenue for month) × 30
- Target: <45 days
- Frequency: Monthly
- Owner: Finance Lead
- Use: Collections efficiency

**Cash Conversion Cycle**
- Formula: DSO + Days Inventory Outstanding (if any) + Days Payable Outstanding
- Target: <60 days
- Frequency: Monthly
- Owner: Finance Lead
- Use: Working capital efficiency

### Operational KPIs

**Timesheet Submission Rate**
- Formula: (Timesheets submitted on time) / (Total timesheets due) × 100
- Target: >95%
- Frequency: Weekly
- Owner: Ops Coordinator
- Use: Process compliance

**Timesheet Approval Cycle Time**
- Formula: Days from submission to approval
- Target: <2 business days
- Frequency: Weekly average
- Owner: Ops Lead
- Use: Invoicing speed

**Invoice Generation Cycle Time**
- Formula: Days from timesheet approval to invoice sent
- Target: <1 business day
- Frequency: Weekly average
- Owner: Finance Lead
- Use: Revenue cycle speed

**On-Time Collection Rate**
- Formula: (Invoices paid within contract terms) / (Total invoices sent) × 100
- Target: >90%
- Frequency: Monthly
- Owner: Finance Lead
- Use: Client payment behavior

**AR Aging: % Current**
- Formula: (AR 0-30 days) / (Total AR) × 100
- Target: >80%
- Frequency: Weekly
- Owner: Finance Lead
- Use: Collections health

**Payroll Processing Accuracy**
- Formula: (Payroll with zero variance) / (Total payroll runs) × 100
- Target: 100%
- Frequency: Monthly
- Owner: Payroll Coordinator
- Use: Accuracy/compliance

**Payroll On-Time Payment Rate**
- Formula: (Payroll paid by due date) / (Total payroll runs) × 100
- Target: 100%
- Frequency: Monthly
- Owner: Finance Lead
- Use: Employee satisfaction

### Compliance KPIs

**Document Compliance Rate**
- Formula: (Documents current/non-expired) / (Total documents required) × 100
- Target: 100%
- Frequency: Monthly
- Owner: HR/Compliance
- Use: Audit readiness

**Statutory Filing On-Time Rate**
- Formula: (Filings submitted on or before deadline) / (Total filings due) × 100
- Target: 100%
- Frequency: Monthly
- Owner: Finance Lead/HR
- Use: Regulatory compliance

---

**Last Updated: February 2026**

---

End of FINANCE_OPS_SOP.md
