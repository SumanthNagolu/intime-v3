# CFO (Chief Financial Officer) - Executive Role Specification

**Version:** 2.0
**Last Updated:** 2025-11-30
**Owner:** Executive Team
**Status:** Active

---

## Table of Contents

1. [Role Overview](#1-role-overview)
2. [Key Responsibilities](#2-key-responsibilities)
3. [Multi-Currency Operations](#3-multi-currency-operations)
4. [Primary Metrics (KPIs)](#4-primary-metrics-kpis)
5. [Daily Workflow](#5-daily-workflow)
6. [Permissions Matrix](#6-permissions-matrix)
7. [RACI Assignments](#7-raci-assignments)
8. [Navigation & Access](#8-navigation--access)
9. [Use Cases](#9-use-cases)
10. [International Considerations](#10-international-considerations)
11. [Distinction from Other Roles](#11-distinction-from-other-roles)
12. [Success Criteria](#12-success-criteria)

---

## 1. Role Overview

The **Chief Financial Officer (CFO)** is responsible for all financial operations, including multi-currency accounting, revenue recognition, commission management, accounts payable/receivable, financial reporting, audit compliance, and strategic financial analysis. The CFO ensures financial accuracy, profitability, regulatory compliance, and provides financial insights to support executive decision-making.

**Critical Focus:** InTime OS operates primarily in **US + Canada** with multi-currency capabilities (USD, CAD). The CFO manages international financial operations, including currency conversion, transfer pricing, tax compliance, and consolidated reporting.

| Property | Value |
|----------|-------|
| Role ID | `cfo`, `finance`, `controller` |
| Role Type | Executive |
| Reports To | CEO |
| Direct Reports | Controller, Accounting Manager, Finance Team |
| Primary Entities | Invoices, Commissions, Revenue, Payroll, Financial Reports |
| RACI Default | Accountable (A) for financial accuracy and compliance |
| Key Focus | Financial stewardship, profitability, compliance |
| Time Horizon | Monthly to Annual (financial cycles) |
| Geographic Scope | All entities (US, Canada, future expansion) |

---

## 2. Key Responsibilities

### 2.1 Financial Operations

**Multi-Currency Management**
- Manage USD and CAD operations with real-time FX rate tracking
- Currency conversion for revenue recognition and reporting
- FX gain/loss calculation and reporting
- Hedging strategy (for significant currency exposure)
- Multi-currency bank account management

**Revenue Recognition (ASC 606 Compliance)**
- Contract revenue recognition (placement fees)
- Temporary staffing revenue recognition (daily/weekly)
- Deferred revenue management
- Revenue allocation across entities (US vs Canada)
- Monthly/quarterly revenue close

**Accounts Receivable**
- Client invoicing (automated + manual)
- AR aging monitoring (DSO target: ≤45 days)
- Collections management
- Credit memo processing
- Write-off approvals (bad debt)

**Accounts Payable**
- Vendor payment processing (1099 and W2)
- Consultant payroll (W2 employees, 1099 contractors, C2C)
- Invoice approval workflows
- Payment terms management
- Vendor onboarding and compliance

**Commission Management**
- Commission calculation (automated rules engine)
- Commission approval workflow (CFO final approval)
- Dispute resolution
- Clawback processing (failed placements)
- Commission payment (monthly/quarterly cycles)

### 2.2 Financial Reporting & Analysis

**Management Reporting**
- Monthly P&L by entity, pillar, pod, region
- Balance sheet and cash flow statements
- Margin analysis (gross, operating, net)
- Budget vs actual variance analysis
- KPI dashboards for CEO and Board

**Board Reporting**
- Quarterly financial review
- Annual budget and forecast
- Strategic financial analysis
- Risk assessment and mitigation

**Statutory Compliance**
- US GAAP compliance
- Canadian GAAP/IFRS (if applicable)
- Tax compliance (federal, state, provincial)
- Audit preparation and coordination
- SOX compliance (if public or preparing for IPO)

### 2.3 Strategic Financial Management

**Budget & Forecast**
- Annual budget preparation
- Quarterly forecast updates
- Scenario planning (base, upside, downside)
- Capital allocation recommendations

**Margin Optimization**
- Pricing strategy analysis
- Cost structure optimization
- Profitability analysis by client, pod, service line
- Margin expansion initiatives

**Cash Flow Management**
- Cash flow forecasting (13-week rolling)
- Working capital optimization
- Credit line management
- Capital raising (if needed)

### 2.4 International Accounting

**Transfer Pricing**
- Intercompany billing (US ↔ Canada)
- Arm's length pricing compliance
- Transfer pricing documentation
- Tax authority compliance (IRS, CRA)

**Multi-Entity Consolidation**
- Consolidate US and Canadian entities
- Eliminate intercompany transactions
- Currency translation adjustments
- Regional P&L and global P&L

**Tax Compliance**
- US federal and state taxes
- Canadian federal and provincial taxes
- Cross-border tax planning
- Withholding tax management
- Country-by-country reporting (if required)

---

## 3. Multi-Currency Operations

### 3.1 Currency Pairs

InTime OS operates primarily with two currencies:

| Currency | Symbol | Entity | Use Case |
|----------|--------|--------|----------|
| US Dollar | USD | InTime Inc. (US) | US operations, 80% of revenue |
| Canadian Dollar | CAD | InTime Canada Ltd. | Canadian operations, 20% of revenue |

**Reporting Currency:** USD (all financial reports consolidated in USD)

### 3.2 Exchange Rate Management

```
FX Rate Sources:
- Primary: Bank of Canada official rates
- Secondary: Federal Reserve rates
- Tertiary: XE.com or Bloomberg (real-time)

FX Rate Types:
- Spot Rate: Real-time rate for today's date
- Average Rate: Monthly average for P&L items (revenue, expenses)
- Historical Rate: Original transaction rate for balance sheet items

FX Rate Refresh:
- Real-time: Updated hourly during business hours
- Daily close: Updated at 5 PM EST
- Monthly average: Calculated first business day of following month
```

### 3.3 Currency Conversion Examples

**Example 1: Canadian Revenue Recognition**

```
Scenario:
- Placement in Canada: Bill Rate $100 CAD/hour
- Consultant works 160 hours in November 2025
- FX rate (Nov average): 1 CAD = 0.76 USD

Calculation:
- CAD Revenue: $100/hr × 160 hrs = $16,000 CAD
- USD Revenue: $16,000 CAD × 0.76 = $12,160 USD

Journal Entry (Canadian entity):
DR  Accounts Receivable (CAD)  $16,000 CAD
CR  Revenue (CAD)               $16,000 CAD

Consolidated Reporting (USD):
DR  Accounts Receivable (USD)  $12,160 USD
CR  Revenue (USD)               $12,160 USD
```

**Example 2: FX Gain/Loss on Payment**

```
Scenario:
- Invoice issued Nov 1: $16,000 CAD (= $12,160 USD at 0.76 rate)
- Payment received Dec 15: $16,000 CAD (= $12,480 USD at 0.78 rate)

FX Gain Calculation:
- Payment value: $16,000 CAD × 0.78 = $12,480 USD
- Invoice value: $16,000 CAD × 0.76 = $12,160 USD
- FX Gain: $12,480 - $12,160 = $320 USD

Journal Entry:
DR  Cash (USD)                  $12,480 USD
CR  Accounts Receivable (USD)   $12,160 USD
CR  FX Gain (USD)               $320 USD
```

---

## 4. Primary Metrics (KPIs)

### Financial Performance KPIs

| Metric | Target | Measurement Period | Dashboard |
|--------|--------|-------------------|-----------|
| **Revenue** | | | |
| Total Revenue (USD) | Budget | Monthly | Daily |
| Revenue Growth YoY | 25%+ | Quarterly | Monthly |
| Revenue by Pillar | Budget | Monthly | Daily |
| Revenue by Entity (US/CA) | 80%/20% split | Monthly | Daily |
| **Profitability** | | | |
| Gross Margin % | 25%+ | Monthly | Daily |
| Operating Margin % | 15%+ | Quarterly | Monthly |
| Net Income | Budget | Monthly | Monthly |
| EBITDA | Budget | Quarterly | Monthly |
| **Cash Flow** | | | |
| Operating Cash Flow | Positive | Monthly | Weekly |
| Free Cash Flow | Positive | Monthly | Weekly |
| Cash Runway | 6+ months | Monthly | Weekly |
| **Working Capital** | | | |
| DSO (Days Sales Outstanding) | ≤45 days | Monthly | Daily |
| AR Aging <90 days | 95%+ | Monthly | Daily |
| AP Days Outstanding | 30 days | Monthly | Weekly |
| **Commission Accuracy** | | | |
| Commission Calculation Accuracy | 99.5%+ | Per run | Monthly |
| Commission Disputes | <5% | Per run | Monthly |
| Commission Payment Timeliness | 100% on-time | Monthly | Monthly |
| **Financial Close** | | | |
| Monthly Close Completion | ≤5 business days | Monthly | Monthly |
| Revenue Recognition Accuracy | 99.9%+ | Monthly | Monthly |
| **Multi-Currency** | | | |
| FX Gain/Loss (% of revenue) | <2% | Monthly | Monthly |
| Currency Hedging Effectiveness | 90%+ | Quarterly | Quarterly |
| **Audit & Compliance** | | | |
| Audit Findings (Material) | 0 | Annual | Annual |
| Tax Compliance | 100% | Annual | Quarterly |

---

## 5. Daily Workflow

### Morning (8:00 AM - 10:00 AM)

```
8:00 - Review cash position (US + Canada)
       - Bank balances
       - Expected deposits
       - Upcoming payments

8:15 - Check AR aging report
       - Overdue accounts (>90 days)
       - Collections follow-up needed
       - Escalate to CEO if necessary

8:30 - Review pending commission approvals
       - Commission calculations from previous day
       - Dispute queue
       - Approve or flag for review

9:00 - Monitor FX rates
       - USD/CAD rate movement
       - Update forecasts if significant move (>2%)
       - Consider hedging if volatility high

9:30 - Financial exception review
       - Invoicing errors
       - Payment failures
       - Revenue recognition issues
       - Assign to finance team for resolution
```

### Mid-Morning (10:00 AM - 12:00 PM)

```
10:00 - Commission approval workflow
        - Review commission reports
        - Approve standard commissions
        - Deep-dive disputed commissions
        - Resolve with recruiting managers

11:00 - Invoice and payment approvals
        - Vendor invoices >$5K
        - Large client invoices (manual review)
        - Payment runs >$50K

11:30 - Leadership team sync
        - Financial update to CEO
        - Budget discussions
        - Strategic initiatives financial review
```

### Afternoon (12:00 PM - 3:00 PM)

```
12:00 - Lunch / catch up on emails

1:00  - Margin analysis and pricing
        - Review margin by account
        - Identify low-margin accounts
        - Pricing strategy discussions

2:00  - Month-end close activities (during close week)
        - Revenue recognition review
        - Accrual adjustments
        - Intercompany reconciliation
        - Journal entry approvals

2:30  - Strategic financial analysis
        - Scenario modeling
        - Budget vs actual analysis
        - Investment decisions
```

### Late Afternoon (3:00 PM - 6:00 PM)

```
3:00  - Board reporting preparation (week before board meeting)
        - Financial slides for board deck
        - KPI analysis
        - Variance explanations

4:00  - Ad-hoc requests
        - CEO questions
        - Client escalations (billing issues)
        - Audit requests

5:00  - End-of-day review
        - Final approval of payments going out
        - Review next day's agenda
        - Update priorities
```

### Weekly Rhythms

| Day | Focus |
|-----|-------|
| Monday | Commission approvals, cash flow forecast update |
| Tuesday | AR aging review, collections planning |
| Wednesday | Mid-week financial snapshot, vendor payments |
| Thursday | Payroll review and approval |
| Friday | Week-in-review financial report to CEO |

### Monthly Rhythms

| Days | Activity |
|------|----------|
| 1-5 | Month-end close, revenue recognition |
| 6-10 | Financial statements, variance analysis |
| 11-15 | Commission runs, commission payments |
| 16-20 | Budget review, forecast updates |
| 21-31 | Strategic analysis, board prep (if applicable) |

---

## 6. Permissions Matrix

### Entity Permissions

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Invoices | ✅ | ✅ All | ✅ All | ✅ Admin | Full invoice management |
| Commissions | ❌ | ✅ All | ✅ Approve/Override | ❌ | Approve but not create |
| Placements | ❌ | ✅ All | ✅ Financial Fields | ❌ | Read-only except rates |
| Payroll Records | ❌ | ✅ All | ✅ Reconciliation | ❌ | Review and reconcile |
| Revenue Recognition | ✅ | ✅ All | ✅ All | ✅ Admin | Full control |
| Journal Entries | ✅ | ✅ All | ✅ All | ❌ | Accounting adjustments |
| Financial Reports | ✅ | ✅ All | ✅ All | ✅ Own | Generate and manage |
| Accounts (Clients) | ❌ | ✅ All | ✅ Financial Terms | ❌ | Payment terms, credit limit |
| Vendors | ✅ | ✅ All | ✅ All | ✅ Admin | Vendor management |
| Bank Accounts | ❌ | ✅ All | ❌ | ❌ | Read-only (security) |
| Budget | ✅ | ✅ All | ✅ All | ✅ Admin | Budget management |
| FX Rates | ❌ | ✅ All | ✅ Manual Override | ❌ | System auto-updates, CFO can override |

### Feature Permissions

| Feature | Access |
|---------|--------|
| CFO Financial Dashboard | ✅ Full |
| Multi-Currency Console | ✅ Full |
| Commission Approval | ✅ Approve/Override/Dispute Resolution |
| Revenue Recognition | ✅ Full (ASC 606 compliance) |
| AR/AP Management | ✅ Full |
| Payroll Reconciliation | ✅ Full |
| Financial Statements | ✅ Generate & View |
| Margin Analysis | ✅ Full |
| Budget Management | ✅ Full (Prepare, Approve with CEO) |
| Cash Flow Forecasting | ✅ Full |
| Audit Center | ✅ Full |
| Tax Reporting | ✅ Full |
| Transfer Pricing | ✅ Full |
| Intercompany Reconciliation | ✅ Full |
| System Settings (Financial) | ✅ Configure |

---

## 7. RACI Assignments

### Financial Events

| Event | CFO | Controller | Accounting | CEO | COO |
|-------|-----|------------|------------|-----|-----|
| Invoice Generated | A | R | R | - | I |
| Commission Calculated | A | R | R | - | I |
| Commission Approved | **R/A** | C | I | I | I |
| Month-End Close | A | R | R | I | I |
| Revenue Recognition | **R/A** | C | R | I | I |
| Financial Statements | **R/A** | R | R | I | I |
| Budget Approval | R | R | C | **A** | C |
| Pricing Changes | R | I | I | **A** | C |
| Payment Approval (>$50K) | **R/A** | C | R | I | I |
| Audit Response | **R/A** | R | R | I | I |
| Tax Filing | **A** | R | R | I | - |
| Transfer Pricing | **R/A** | C | R | I | - |

---

## 8. Navigation & Access

### Sidebar Access

- ✅ **CFO Financial Dashboard** (default home)
- ✅ Multi-Currency Console
- ✅ Revenue Reports
- ✅ Commission Approvals
- ✅ Invoices & Billing
- ✅ AR/AP Management
- ✅ Payroll Reconciliation
- ✅ Financial Statements (P&L, Balance Sheet, Cash Flow)
- ✅ Margin Analysis
- ✅ Budget & Forecast
- ✅ Cash Flow Projections
- ✅ Tax Center
- ✅ Audit Center
- ✅ Transfer Pricing
- ✅ Intercompany Reconciliation
- ✅ Reports & Analytics
- ✅ Settings (Financial)
- ✅ All Placements (Financial view only)
- ✅ All Accounts (Financial terms)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` | Open Command Bar |
| `g f` | Go to CFO Dashboard |
| `g r` | Go to Revenue Reports |
| `g c` | Go to Commission Approvals |
| `g i` | Go to Invoices |
| `g a` | Go to AR/AP |
| `g m` | Go to Margin Analysis |
| `a` | Approve (commission, invoice) |
| `/` | Quick search |

---

## 9. Use Cases

The following use cases are documented in detail in separate files:

| Use Case | File | Priority |
|----------|------|----------|
| CFO Daily Workflow | [01-daily-workflow.md](./01-daily-workflow.md) | High |
| Multi-Currency Management | [07-multi-currency.md](./07-multi-currency.md) | Critical |
| International Tax Compliance | [08-international-tax.md](./08-international-tax.md) | Critical |
| Accounts Payable | [09-accounts-payable.md](./09-accounts-payable.md) | Critical |
| Commission Management | [10-commission-management.md](./10-commission-management.md) | Critical |
| Period Close | [11-period-close.md](./11-period-close.md) | Critical |
| Margin Analysis | [12-margin-analysis.md](./12-margin-analysis.md) | High |

---

## 10. International Considerations

### 10.1 Legal Entities

| Entity | Jurisdiction | Currency | Tax ID | Use |
|--------|-------------|----------|--------|-----|
| InTime Inc. | Delaware, USA | USD | US EIN | US operations (80% revenue) |
| InTime Canada Ltd. | Ontario, Canada | CAD | Canada BN | Canadian operations (20% revenue) |

### 10.2 Transfer Pricing Rules

```
Intercompany Services:
- US entity provides recruiter to fill Canadian job → Invoice Canadian entity
- Canadian entity provides recruiter to fill US job → Invoice US entity

Transfer Price Calculation:
- Cost Plus Method: Cost + 10% markup (arms-length)
- Market Rate Method: Use market rate for comparable services

Documentation:
- Maintain transfer pricing documentation (IRS/CRA requirement)
- Annual reconciliation and true-up
- Country-by-country reporting (if revenue >$850M USD)
```

### 10.3 Tax Considerations

```
US Tax:
- Federal corporate tax: 21%
- State taxes: Varies by state (avg 5%)
- Quarterly estimated tax payments

Canadian Tax:
- Federal corporate tax: 15%
- Provincial tax (Ontario): 11.5%
- Combined: 26.5%
- Quarterly installments

Cross-Border:
- Withholding tax on intercompany payments (0% if treaty applies)
- Permanent establishment risk (if Canadian entity operates in US or vice versa)
```

---

## 11. Distinction from Other Roles

### CFO vs. CEO

| Aspect | CFO | CEO |
|--------|-----|-----|
| Focus | Financial stewardship | Vision & Strategy |
| Time Horizon | Monthly to Annual | 3-5 years |
| Primary Stakeholder | Auditors, Banks | Board, Investors |
| Key Metric | Profitability, Cash Flow | Market Share, Valuation |
| Decision Type | Financial | Strategic |
| Risk Focus | Financial risk | Market risk |

### CFO vs. COO

| Aspect | CFO | COO |
|--------|-----|-----|
| Focus | Finance | Operations |
| Primary Entities | Invoices, Commissions | Jobs, Candidates, Placements |
| Key Metric | Margin, DSO | Efficiency, SLA |
| Notifications | Financial events | INFORMED on all operational changes |
| Approval Role | Financial approvals | Operational decisions |

### CFO vs. Controller

| Aspect | CFO | Controller |
|--------|-----|-------------|
| Role Level | Executive (C-suite) | Management |
| Reports To | CEO | CFO |
| Focus | Strategic finance | Tactical accounting |
| Scope | Entire finance function | Accounting operations |
| Board Interaction | Regular (quarterly reports) | Rare (audit only) |

---

## 12. Success Criteria

### Financial Accuracy
- Revenue accuracy: 99.9%
- Commission accuracy: 99.5%
- Monthly close: ≤5 business days
- Audit findings: Zero material issues

### Profitability
- Gross margin: 25%+ sustained
- Operating margin: 15%+ achieved
- Net income: Budget or better
- Margin expansion: 1-2% annually

### Cash Management
- DSO: ≤45 days
- Cash flow: Positive monthly
- Cash runway: 6+ months
- AR aging <90 days: 95%+

### Compliance
- Tax compliance: 100% on-time filings
- Audit: Clean opinion
- SOX controls: Effective (if applicable)
- Multi-currency: Accurate FX accounting

### Strategic Value
- CEO confidence: "CFO has finances under control"
- Board feedback: Clear, accurate financial reporting
- Pricing strategy: Data-driven margin optimization
- Capital efficiency: Optimal use of working capital

---

**End of CFO Overview**

*This document provides the foundational understanding of the CFO role in InTime OS, with emphasis on multi-currency operations, international accounting, commission management, and financial stewardship.*
