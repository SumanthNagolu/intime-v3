# Finance/CFO Role - Complete Specification

## Role Overview

The **Finance/CFO** role is responsible for all financial operations of the staffing company, including revenue recognition, commission approvals, billing cycles, payroll reconciliation, financial reporting, and international accounting. This role ensures financial accuracy, compliance with accounting standards (ASC 606, GAAP), and provides strategic insights to executive leadership.

---

## Role Summary

| Property | Value |
|----------|-------|
| Role ID | `finance`, `cfo`, `controller` |
| Role Type | Executive / Manager |
| Reports To | CEO / Board of Directors |
| Primary Entities | Invoices, Commissions, Placements, Revenue, Payroll, Financial Reports |
| RCAI Default | Accountable (A) for financial accuracy and compliance |
| Key Focus | Financial operations, compliance, strategic analysis |

---

## Key Responsibilities

1. **Commission Approval** - Review and approve commission calculations, resolve disputes, process monthly commission runs, handle overrides and clawbacks
2. **Billing Management** - Oversee client invoicing, time & billing reconciliation, payment tracking, collections, credit memos
3. **Revenue Recognition** - Ensure ASC 606 compliance, recognize contract vs temp revenue, manage placement fees, monthly close process
4. **Payroll Reconciliation** - Verify payroll accuracy, review gross-to-net calculations, ensure tax compliance, reconcile payroll accounts
5. **Financial Reporting** - Generate P&L statements, margin analysis by pod/pillar/region, forecast vs actual, KPI dashboards
6. **Cash Flow Management** - Monitor AR/AP, manage DSO (Days Sales Outstanding), cash flow projections, working capital
7. **Audit & Compliance** - Prepare for audits, ensure GAAP compliance, maintain financial controls, SOX compliance (if applicable)
8. **International Accounting** - Multi-currency management, transfer pricing, regional P&L, tax compliance by country
9. **Strategic Analysis** - Profitability analysis by client/pod/service line, pricing strategy, margin optimization, forecasting

---

## Primary Metrics (KPIs)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Revenue Accuracy | 99.9% | Monthly |
| Commission Accuracy | 99.5% | Per commission run |
| Days Sales Outstanding (DSO) | ≤45 days | Monthly |
| Gross Margin % | ≥25% | Monthly |
| Monthly Close Completion | ≤5 business days | Monthly |
| Invoice Accuracy | 99% | Per invoice cycle |
| Payroll Reconciliation | 100% | Per pay period |
| Cash Flow Forecast Accuracy | ±5% | Weekly |
| AR Aging <90 Days | ≥95% | Monthly |
| Financial Report Timeliness | 100% on-time | Monthly/Quarterly |
| Audit Findings | 0 material findings | Annual |
| Commission Dispute Resolution | ≤3 days | Per dispute |

---

## Daily Workflow Summary

### Morning (8:00 AM - 10:00 AM)
1. Review cash position and daily deposits
2. Check pending invoices and payment status
3. Review commission disputes and overrides
4. Monitor AR aging report
5. Review financial alerts and exceptions

### Mid-Morning (10:00 AM - 12:00 PM)
1. Approve commission calculations
2. Process invoice adjustments and credit memos
3. Revenue recognition review
4. Payroll reconciliation (on payroll weeks)
5. Meet with accounting team

### Afternoon (12:00 PM - 3:00 PM)
1. Financial analysis and reporting
2. Client billing review
3. Margin analysis by account/pod
4. Collections follow-up
5. Budget vs actual variance analysis

### Late Afternoon (3:00 PM - 5:00 PM)
1. Executive reporting and dashboards
2. Strategic planning and forecasting
3. Meet with CEO/leadership team
4. Review financial controls and processes
5. International accounting review (if applicable)

### Weekly Responsibilities
- **Monday:** Commission run review, weekly cash flow forecast
- **Tuesday:** AR aging review, collections planning
- **Wednesday:** Mid-week financial snapshot, margin analysis
- **Thursday:** Payroll review and approval
- **Friday:** Weekly financial reports to CEO, variance analysis

### Monthly Responsibilities
- **Days 1-5:** Month-end close process
- **Days 6-10:** Revenue recognition, financial statements
- **Days 11-15:** Commission runs, board reporting
- **Days 16-20:** Budget reviews, forecast updates
- **Days 21-31:** Strategic planning, ad-hoc analysis

### Quarterly Responsibilities
- Quarterly close and reporting
- Board presentation preparation
- Audit prep (if quarterly reviews)
- Tax compliance filings
- Strategic forecast updates

---

## Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Invoices | ✅ | ✅ All | ✅ All | ✅ Admin | Full invoice management |
| Commissions | ❌ | ✅ All | ✅ Approve/Override | ❌ | Approve but not create |
| Placements | ❌ | ✅ All | ✅ Financial Fields | ❌ | Read-only except rates |
| Payroll | ❌ | ✅ All | ✅ Reconciliation | ❌ | Review and reconcile |
| Revenue Recognition | ✅ | ✅ All | ✅ All | ✅ Admin | Full control |
| Financial Reports | ✅ | ✅ All | ✅ All | ✅ Own | Generate and manage |
| Accounts (Clients) | ❌ | ✅ All | ✅ Financial Terms | ❌ | Financial terms only |
| Payment Terms | ✅ | ✅ All | ✅ All | ✅ Admin | Manage payment terms |
| Credit Memos | ✅ | ✅ All | ✅ All | ✅ Own | Issue and manage |
| AR/AP | ❌ | ✅ All | ✅ All | ❌ | Manage receivables/payables |
| Journal Entries | ✅ | ✅ All | ✅ All | ❌ | Create adjustments |
| Bank Accounts | ❌ | ✅ All | ❌ | ❌ | Read-only access |
| Budget | ✅ | ✅ All | ✅ All | ✅ Admin | Budget management |
| Forecast | ✅ | ✅ All | ✅ All | ✅ Own | Forecast management |

### Feature Permissions

| Feature | Access |
|---------|--------|
| Finance Dashboard | ✅ Full |
| Revenue Reports | ✅ Full |
| Commission Approval | ✅ Approve/Override |
| Billing & Invoicing | ✅ Full |
| AR/AP Management | ✅ Full |
| Payroll Reconciliation | ✅ Full |
| Financial Statements | ✅ Generate & View |
| Margin Analysis | ✅ Full |
| Budget Management | ✅ Full |
| Forecast Management | ✅ Full |
| Cash Flow Projections | ✅ Full |
| Tax Reporting | ✅ Full |
| Audit Reports | ✅ Full |
| International Accounting | ✅ Full |
| System Settings (Financial) | ✅ Configure |
| Chart of Accounts | ✅ Full |
| Banking Integration | ✅ Configure |
| Payment Processing | ✅ Full |

---

## RCAI Assignments (Typical)

| Scenario | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Monthly Commission Run | Accounting | CFO | Recruiting Mgrs | All Recruiters |
| Invoice Generation | Billing Clerk | CFO | Account Mgr | Client |
| Revenue Recognition | CFO | CFO | External Auditor | CEO |
| Payroll Reconciliation | HR Manager | CFO | Payroll Provider | CEO |
| Monthly Close | Accounting Team | CFO | - | CEO, Board |
| Commission Dispute | CFO | CFO | Recruiting Mgr | Recruiter |
| Credit Memo Issuance | CFO | CFO | Account Mgr | Client |
| AR Collections | Collections | CFO | Account Mgr | Client |
| Budget Approval | CFO | CEO | Leadership Team | All Managers |
| Pricing Changes | CFO | CEO | Sales Leadership | - |
| Audit Response | CFO | CFO | Legal, External Auditor | CEO, Board |
| International Transfer Pricing | CFO | CFO | Tax Advisor | CEO |

---

## Navigation Quick Reference

### Sidebar Access
- ✅ Finance Dashboard
- ✅ Revenue Reports
- ✅ Commission Approvals
- ✅ Invoices & Billing
- ✅ AR/AP Management
- ✅ Payroll Reconciliation
- ✅ Financial Statements
- ✅ Margin Analysis
- ✅ Budget & Forecast
- ✅ Cash Flow
- ✅ Reports & Analytics
- ✅ Audit Center
- ✅ International Accounting (if multi-region)
- ✅ Settings (Financial)
- ✅ All Placements (Read-only)
- ✅ All Accounts (Financial view)
- ❌ Recruiting Operations (Read-only)
- ❌ HR Operations (Read-only except payroll)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g f` | Go to Finance Dashboard |
| `g r` | Go to Revenue Reports |
| `g c` | Go to Commission Approvals |
| `g i` | Go to Invoices |
| `g a` | Go to AR/AP |
| `g p` | Go to Payroll Reconciliation |
| `g m` | Go to Margin Analysis |
| `n` | New entity (context-aware) |
| `a` | Approve (commission, invoice) |
| `e` | Edit current entity |
| `/` | Quick search |

---

## Use Cases (Summary)

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Commission Approval | [02-approve-commissions.md](./02-approve-commissions.md) | Critical |
| Billing Management | [03-manage-billing.md](./03-manage-billing.md) | Critical |
| Revenue Recognition | [04-revenue-recognition.md](./04-revenue-recognition.md) | Critical |
| Financial Reporting | [05-financial-reporting.md](./05-financial-reporting.md) | High |

---

## Screen Access Map

| Screen | Route | Access Level |
|--------|-------|--------------|
| Finance Dashboard | `/employee/finance/dashboard` | Full |
| Revenue Reports | `/employee/finance/revenue` | Full |
| Commission Approvals | `/employee/finance/commissions` | Approve |
| Commission Detail | `/employee/finance/commissions/[id]` | Approve/Override |
| Invoices | `/employee/finance/invoices` | Full |
| Invoice Detail | `/employee/finance/invoices/[id]` | Full |
| AR Aging | `/employee/finance/ar-aging` | Full |
| AP Dashboard | `/employee/finance/ap` | Full |
| Payroll Reconciliation | `/employee/finance/payroll` | Full |
| P&L Statement | `/employee/finance/reports/pl` | Full |
| Balance Sheet | `/employee/finance/reports/balance-sheet` | Full |
| Cash Flow Statement | `/employee/finance/reports/cash-flow` | Full |
| Margin Analysis | `/employee/finance/margin-analysis` | Full |
| Budget vs Actual | `/employee/finance/budget-actual` | Full |
| Forecast | `/employee/finance/forecast` | Full |
| Audit Center | `/employee/finance/audit` | Full |
| International P&L | `/employee/finance/international` | Full |
| Settings | `/employee/finance/settings` | Configure |

---

## Distinction from Other Roles

### CFO vs. HR Manager

| Aspect | CFO | HR Manager |
|--------|-----|------------|
| Focus | Financial operations | People operations |
| Payroll Role | Reconciliation & compliance | Processing & execution |
| Entities | Revenue, invoices, commissions | Employees, benefits, onboarding |
| Goal | Financial accuracy, profitability | Employee retention, compliance |
| Revenue Impact | Direct (revenue recognition) | Indirect (operational efficiency) |
| Commission | No (salaried executive) | No (salaried) |

### CFO vs. Recruiting Manager

| Aspect | CFO | Recruiting Manager |
|--------|-----|-------------------|
| Focus | Financial accuracy | Placement generation |
| Commission Role | Approve & reconcile | Earn & track |
| Entities | Invoices, revenue | Jobs, candidates, submissions |
| Goal | Margin optimization | Placement volume |
| Clients | Internal (company P&L) | External (client companies) |
| Metrics | DSO, margin %, revenue | Placements, submissions, fill rate |

### CFO vs. Admin

| Aspect | CFO | Admin |
|--------|-----|-------|
| Focus | Financial operations | System administration |
| Access | Financial data (full) | All data (system level) |
| Role | Domain expert | System manager |
| Scope | Finance module | Entire platform |
| Users | Financial team | All users |
| Permissions | Financial entities | All entities |

---

## Training Requirements

Before using the system, a new CFO should complete:

1. **System Orientation** (2 hours)
   - Navigation and UI overview
   - Finance-specific features
   - Role-based access control
   - Integration points

2. **Revenue Recognition Training** (4 hours)
   - ASC 606 compliance in system
   - Contract vs temp revenue
   - Placement fee recognition
   - Monthly close process
   - Revenue report generation

3. **Commission System Training** (3 hours)
   - Commission calculation rules
   - Approval workflows
   - Override procedures
   - Dispute resolution
   - Clawback processing
   - Monthly commission runs

4. **Billing & Invoicing Training** (3 hours)
   - Invoice generation process
   - Time & billing reconciliation
   - Payment terms management
   - Collections workflows
   - Credit memo procedures
   - Client billing statements

5. **Payroll Reconciliation Training** (2 hours)
   - Payroll review process
   - Gross-to-net verification
   - Tax compliance checks
   - Account reconciliation
   - Variance analysis

6. **Financial Reporting Training** (3 hours)
   - P&L statement generation
   - Balance sheet and cash flow
   - Margin analysis tools
   - Budget vs actual reports
   - Executive dashboards
   - Custom report building

7. **International Accounting Training** (3 hours, if applicable)
   - Multi-currency management
   - Transfer pricing rules
   - Regional P&L consolidation
   - Tax compliance by country
   - Currency conversion processes

8. **Audit & Compliance Training** (2 hours)
   - Audit trail review
   - Compliance reports
   - SOX controls (if applicable)
   - Documentation standards
   - Audit preparation

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Commission dispute won't approve | Review dispute details, verify supporting documentation, use override if needed |
| Invoice not generating | Check placement status, verify billing terms, ensure timesheet approval |
| Revenue recognition mismatch | Review ASC 606 rules, check placement start/end dates, verify contract terms |
| Payroll reconciliation fails | Compare system totals to payroll provider, investigate variances, adjust if needed |
| DSO exceeding target | Review AR aging, prioritize collections, escalate overdue accounts |
| Margin below threshold | Analyze bill/pay rate spread, review pricing strategy, identify low-margin accounts |
| Month-end close delayed | Review close checklist, identify blockers, escalate to accounting team |
| Multi-currency variance | Check exchange rates, verify conversion timing, review intercompany transactions |
| Missing financial data | Verify data source integration, check sync status, manual entry if needed |
| Audit finding | Document issue, create remediation plan, implement controls, verify resolution |

---

## Key Integrations

| System | Purpose | Direction |
|--------|---------|-----------|
| QuickBooks / NetSuite / SAP | General Ledger | Bidirectional |
| ADP / Gusto / Paychex | Payroll Data | Inbound |
| Bill.com / Tipalti | AP Automation | Bidirectional |
| Stripe / PayPal / ACH | Payment Processing | Bidirectional |
| Avalara | Tax Compliance | Outbound |
| Expensify / Concur | Expense Management | Inbound |
| Salesforce (Financial Cloud) | Revenue Forecasting | Bidirectional |
| Carta / EquityZen | Cap Table Management | Inbound |
| Bloomberg / FX APIs | Currency Exchange Rates | Inbound |
| Dun & Bradstreet | Credit Checks | Inbound |
| DocuSign | Contract Signatures | Bidirectional |
| Box / SharePoint | Document Storage | Outbound |

---

## International Considerations

### Multi-Currency Accounting
- Support for 50+ currencies
- Real-time exchange rate updates
- Historical rate tracking for revenue recognition
- Gain/loss calculation on foreign transactions
- Multi-currency bank account management

### Transfer Pricing
- Intercompany billing between entities
- Arm's length pricing compliance
- Transfer pricing documentation
- Country-by-country reporting (CBCR)
- Tax authority compliance (OECD guidelines)

### Regional P&L Management
- Separate P&L by country/region
- Consolidated global P&L
- Regional margin analysis
- Local GAAP compliance (IFRS, local standards)
- Regional budget and forecast

### Tax Compliance by Country
- VAT/GST management (EU, Australia, etc.)
- Withholding tax on cross-border payments
- Corporate income tax by jurisdiction
- Transfer pricing documentation
- Country-specific reporting requirements

### Currency Conversion Rules
- Spot rate vs average rate
- Functional currency determination
- Translation vs transaction adjustments
- Cumulative translation adjustment (CTA)
- Hedging strategy integration

---

## Key Financial Terms

| Term | Definition |
|------|------------|
| **ASC 606** | Revenue from Contracts with Customers (US GAAP) |
| **DSO** | Days Sales Outstanding - average collection period |
| **Gross Margin** | (Bill Rate - Pay Rate) / Bill Rate |
| **AR Aging** | Analysis of receivables by days outstanding |
| **Clawback** | Recovery of commission on failed placement |
| **Credit Memo** | Document reducing invoice amount |
| **Journal Entry** | Manual accounting transaction |
| **Accrual** | Revenue/expense recognized before cash exchange |
| **Deferred Revenue** | Payment received before service delivered |
| **Contra Revenue** | Reductions to revenue (credits, discounts) |
| **Intercompany** | Transactions between related entities |
| **Transfer Pricing** | Pricing of cross-border intercompany transactions |

---

*Last Updated: 2025-11-30*
