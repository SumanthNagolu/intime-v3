# UC-FIN-007: Multi-Currency Management (USD/CAD Operations)

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** CFO (Chief Financial Officer)
**Status:** Active

---

## 1. Overview

InTime OS operates in **United States and Canada** with two primary currencies: **USD (US Dollar)** and **CAD (Canadian Dollar)**. This use case specifies how the CFO manages multi-currency accounting, currency conversion, FX rate tracking, gain/loss calculation, and consolidated financial reporting.

**Geographic Scope:**
- Primary: United States (80% of revenue) - USD
- Secondary: Canada (20% of revenue) - CAD
- Reporting Currency: USD (all consolidated reports)

**Purpose:**
- Accurate multi-currency accounting
- Real-time FX rate tracking and conversion
- FX gain/loss calculation and reporting
- Consolidated financial statements in USD
- Compliance with GAAP/IFRS standards

---

## 2. Currency Configuration

### 2.1 Supported Currencies

| Currency | Code | Symbol | Entity | Primary Use | % of Revenue |
|----------|------|--------|--------|-------------|--------------|
| US Dollar | USD | $ | InTime Inc. | US operations | 80% |
| Canadian Dollar | CAD | $, C$, CAD$ | InTime Canada Ltd. | Canadian operations | 20% |

### 2.2 Exchange Rate Sources

```
Primary Source: Bank of Canada (official rates)
- URL: https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/
- Update Frequency: Daily at 4:30 PM EST
- Historical Data: Available back to 1950

Secondary Source: Federal Reserve
- URL: https://www.federalreserve.gov/releases/h10/current/
- Update Frequency: Daily
- Backup if Bank of Canada unavailable

Tertiary Source: XE.com API
- Real-time rates (hourly updates)
- Used for intra-day conversions
- Fallback if government sources unavailable

Manual Override:
- CFO can manually override FX rate for specific date
- Requires justification and approval
- Logged in audit trail
```

### 2.3 Exchange Rate Types

| Rate Type | Use Case | Update Frequency | Example |
|-----------|----------|------------------|---------|
| **Spot Rate** | Real-time conversions | Hourly | Today's rate for immediate transactions |
| **Daily Close Rate** | End-of-day balances | Daily at 5 PM EST | Close AR/AP at today's rate |
| **Monthly Average** | P&L items (revenue, expenses) | Monthly | Average rate for November 2025 |
| **Historical Rate** | Balance sheet items (equity, fixed assets) | Original transaction | Rate on date of original transaction |

---

## 3. Multi-Currency Dashboard

### Screen: SCR-FIN-007 - Multi-Currency Console

**Route:** `/employee/finance/multi-currency`
**Access:** CFO, Controller, Finance Team
**Refresh:** Real-time (hourly for FX rates)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ MULTI-CURRENCY MANAGEMENT                      Last refresh: 45min ago [⟳]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ EXCHANGE RATE MONITOR ──────────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ USD/CAD Exchange Rate: 0.7600                    Dec 1, 2025 10:00AM │  │
│ │                                                                       │  │
│ │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│ │ │ Rate History (Last 30 Days):                                    │  │  │
│ │ │ [Line Chart: Nov 1 (0.7450) → Dec 1 (0.7600)] ▲ Strengthening  │  │  │
│ │ │ 30-day range: 0.7420 - 0.7630                                   │  │  │
│ │ │ Volatility: Low (1.2% range)                                    │  │  │
│ │ └─────────────────────────────────────────────────────────────────┘  │  │
│ │                                                                       │  │
│ │ Key Rates:                                                            │  │
│ │ ├─ Spot Rate (current):     0.7600 USD per 1 CAD                     │  │
│ │ ├─ Daily Close (yesterday): 0.7590 USD per 1 CAD                     │  │
│ │ ├─ Monthly Avg (Nov 2025):  0.7550 USD per 1 CAD                     │  │
│ │ ├─ Yearly Avg (2025 YTD):   0.7480 USD per 1 CAD                     │  │
│ │ └─ Budget Rate (2025 plan): 0.7500 USD per 1 CAD                     │  │
│ │                                                                       │  │
│ │ FX Rate Alert:                                                        │  │
│ │ 🟡 CAD strengthened 2.1% this month (0.7450 → 0.7600)                │  │
│ │    Impact: $15K favorable FX variance on Canadian revenue            │  │
│ │    Action: Update forecast if trend continues                        │  │
│ │                                                                       │  │
│ │ [View Rate History] [Manual Override] [Alert Settings]               │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ CURRENCY EXPOSURE ANALYSIS ─────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Total CAD Exposure: $750,000 CAD (= $570,000 USD at 0.76)           │  │
│ │                                                                       │  │
│ │ ├─ AR (Accounts Receivable):  $450,000 CAD = $342,000 USD           │  │
│ │ ├─ Cash (Canadian bank):      $100,000 CAD = $76,000 USD            │  │
│ │ ├─ AP (Accounts Payable):     -$200,000 CAD = -$152,000 USD         │  │
│ │ └─ Net Exposure:              $350,000 CAD = $266,000 USD            │  │
│ │                                                                       │  │
│ │ FX Risk Analysis:                                                     │  │
│ │ If CAD weakens by 5% (0.76 → 0.722):                                │  │
│ │    Net Exposure Impact: -$13,300 USD (potential loss)                │  │
│ │ If CAD strengthens by 5% (0.76 → 0.798):                            │  │
│ │    Net Exposure Impact: +$13,300 USD (potential gain)                │  │
│ │                                                                       │  │
│ │ Hedging Recommendation:                                               │  │
│ │ 🟡 Consider hedging if exposure exceeds $500K CAD                    │  │
│ │ Current: $350K CAD (below threshold) - No action needed              │  │
│ │                                                                       │  │
│ │ [Detailed Exposure Report] [Hedging Calculator] [Risk Analysis]      │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ MONTHLY REVENUE CONSOLIDATION (November 2025) ──────────────────────┐  │
│ │                                                                       │  │
│ │ Entity          Local Revenue    FX Rate   USD Equivalent   % Total  │  │
│ │ ─────────────────────────────────────────────────────────────────────  │  │
│ │ InTime Inc.     $2,280,000 USD   1.0000    $2,280,000       80.0%   │  │
│ │ (US)                                                                  │  │
│ │                                                                       │  │
│ │ InTime Canada   $750,000 CAD     0.7550    $566,250         19.8%   │  │
│ │ (Canada)        (Monthly Avg)                                        │  │
│ │                                                                       │  │
│ │ FX Variance     -                -          +$3,750          0.1%    │  │
│ │ (vs budget @                     (vs 0.75)                           │  │
│ │  0.75 rate)                                                           │  │
│ │                                                                       │  │
│ │ ─────────────────────────────────────────────────────────────────────  │  │
│ │ Total (USD)     -                -          $2,850,000       100.0%  │  │
│ │ Consolidated                                                          │  │
│ │                                                                       │  │
│ │ [View Detailed P&L] [Export Consolidation] [Variance Analysis]       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ FX GAIN/LOSS TRACKING (MTD) ────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Realized FX Gains/Losses (closed transactions): +$2,150 USD          │  │
│ │ Unrealized FX Gains/Losses (open AR/AP):        -$850 USD            │  │
│ │ ───────────────────────────────────────────────────────────────       │  │
│ │ Net FX Impact (November 2025):                  +$1,300 USD          │  │
│ │                                                  (0.05% of revenue)  │  │
│ │                                                                       │  │
│ │ Recent Transactions:                                                  │  │
│ │ ├─ +$320 USD - Invoice#3345 paid (rate improved)                     │  │
│ │ ├─ +$180 USD - Invoice#3346 paid (rate improved)                     │  │
│ │ ├─ -$120 USD - Invoice#3347 paid (rate worsened)                     │  │
│ │ └─ ... (25 more transactions)                                         │  │
│ │                                                                       │  │
│ │ [View All FX Transactions] [Export for Tax] [Reconciliation Report]  │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ INTERCOMPANY RECONCILIATION ────────────────────────────────────────┐  │
│ │                                                                       │  │
│ │ Intercompany Transactions (November 2025):                           │  │
│ │                                                                       │  │
│ │ US → Canada:  $12,000 USD (services provided)                        │  │
│ │               = $15,789 CAD at 0.76 avg rate                         │  │
│ │                                                                       │  │
│ │ Canada → US:  $25,000 CAD (services provided)                        │  │
│ │               = $18,875 USD at 0.755 avg rate                        │  │
│ │                                                                       │  │
│ │ Reconciliation Status: ✅ Balanced (no discrepancies)                │  │
│ │ Last Reconciled: December 1, 2025                                    │  │
│ │                                                                       │  │
│ │ [View Details] [Export Reconciliation] [Transfer Pricing Doc]        │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ QUICK ACTIONS ──────────────────────────────────────────────────────┐  │
│ │ [Update FX Rates Manually] [Generate Consolidated P&L]               │  │
│ │ [FX Variance Analysis]     [Export Multi-Currency Report]            │  │
│ │ [Hedging Scenario Tool]    [Currency Settings]                       │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Currency Conversion Rules

### 4.1 Revenue Recognition (ASC 606)

```
Revenue Type: Temporary Staffing

Scenario: Canadian placement, bill rate $100 CAD/hour

Accounting Treatment:
1. Daily Revenue Recognition:
   - Record revenue daily in CAD (local books)
   - Use DAILY CLOSE RATE for USD conversion
   - Example: Dec 1, 2025
     * Revenue: $800 CAD (8 hours × $100/hr)
     * FX Rate: 0.7600 (daily close)
     * USD Revenue: $608 USD

2. Monthly Consolidation:
   - Sum all daily revenue in CAD: $16,000 CAD
   - Apply MONTHLY AVERAGE RATE: 0.7550
   - USD Revenue: $12,080 USD

3. P&L Reporting:
   - Use monthly average rate for all P&L items
   - Rationale: Smooths volatility, matches economic reality
```

### 4.2 Balance Sheet Translation

```
Asset/Liability: Accounts Receivable

Scenario: Invoice issued Nov 1, payment received Dec 15

Nov 1 (Invoice Date):
- Amount: $16,000 CAD
- FX Rate (historical): 0.7500
- USD Value: $12,000 USD
- Journal Entry:
  DR  AR (CAD) $16,000
  CR  Revenue (CAD) $16,000

Nov 30 (Month-End Close):
- AR Balance: $16,000 CAD
- FX Rate (month-end): 0.7600
- USD Value: $12,160 USD
- Unrealized FX Gain: $160 USD
- Journal Entry:
  DR  AR (USD) $160
  CR  Unrealized FX Gain $160

Dec 15 (Payment Received):
- Payment: $16,000 CAD
- FX Rate (payment date): 0.7650
- USD Value: $12,240 USD
- Realized FX Gain: $240 USD (vs original $12,000)
- Journal Entry:
  DR  Cash (USD) $12,240
  CR  AR (USD) $12,160
  CR  Realized FX Gain $80
  (Reverse unrealized gain, record realized gain)
```

---

## 5. Business Rules

### BR-FIN-007-001: FX Rate Update Schedule

```
Automated Updates:
- Daily: 5:00 PM EST (Bank of Canada daily close)
- Hourly: Real-time rates from XE.com (for intra-day conversions)
- Monthly: Calculate monthly average on 1st business day of following month

Manual Override:
- CFO can override any FX rate for specific date
- Requires:
  ✓ Justification (e.g., "Contract locked rate")
  ✓ CFO approval
  ✓ Supporting documentation
  ✓ Audit trail log
- Use cases:
  * Hedged transactions (forward contract rate)
  * Contract with fixed FX rate
  * Correction of system error
```

### BR-FIN-007-002: Currency Conversion Hierarchy

```
Conversion Logic (in order of preference):

1. Contract-Specified Rate
   - If contract specifies FX rate, use that rate
   - Example: Client contract says "bill at 0.75 CAD/USD"

2. Historical Rate (for balance sheet items)
   - Equity accounts: Rate on date of transaction
   - Fixed assets: Rate on date of acquisition

3. Monthly Average (for P&L items)
   - Revenue: Monthly average rate
   - Expenses: Monthly average rate

4. Daily Close (for end-of-period balances)
   - AR/AP: Daily close rate at month-end

5. Spot Rate (for real-time needs)
   - Intra-day conversions
   - Immediate decisions
```

### BR-FIN-007-003: FX Gain/Loss Recognition

```
Realized FX Gains/Losses:
- Recognize when transaction closes (invoice paid)
- Record in "FX Gain/Loss" P&L account
- Include in Net Income

Unrealized FX Gains/Losses:
- Recognize at period-end for open AR/AP
- Record in "Unrealized FX Gain/Loss" P&L account
- Include in Net Income (GAAP requirement)

Translation Adjustment (CTA):
- For equity accounts and cumulative translation
- Record in "Accumulated Other Comprehensive Income" (equity)
- Does NOT impact Net Income
```

---

## 6. Reporting Requirements

### 6.1 Internal Reports (Monthly)

**Multi-Currency P&L**
```
Revenue:
  US Entity (USD):       $2,280,000
  Canada Entity (CAD):   $750,000 CAD × 0.7550 = $566,250 USD
  Total Revenue (USD):   $2,846,250

Expenses:
  US Entity (USD):       $1,710,000
  Canada Entity (CAD):   $562,500 CAD × 0.7550 = $424,687 USD
  Total Expenses (USD):  $2,134,687

FX Impact:
  Realized FX Gain:      $2,150
  Unrealized FX Gain:    -$850
  Net FX Impact:         $1,300

Net Income (USD):        $712,863
```

**Regional P&L (separate by entity)**
```
InTime Inc. (US):
  Revenue:     $2,280,000 USD
  Expenses:    $1,710,000 USD
  Net Income:  $570,000 USD

InTime Canada Ltd. (Canada):
  Revenue:     $750,000 CAD ($566,250 USD)
  Expenses:    $562,500 CAD ($424,687 USD)
  Net Income:  $187,500 CAD ($141,563 USD)
```

### 6.2 Tax Reports (Annual)

- **US IRS Form 1120**: US entity only (USD)
- **Canada T2 Corporation Income Tax Return**: Canadian entity only (CAD)
- **Transfer Pricing Documentation**: Intercompany transactions (both currencies)
- **Country-by-Country Reporting**: If revenue >$850M USD (not applicable yet)

---

## 7. Integration Points

### FX Rate Provider Integration

**Endpoint:** `GET /api/fx-rates/daily`

**Response:**
```json
{
  "date": "2025-12-01",
  "base_currency": "USD",
  "rates": {
    "CAD": 1.3158,  // 1 USD = 1.3158 CAD
    "CAD_USD": 0.7600  // 1 CAD = 0.76 USD (inverse)
  },
  "source": "bank_of_canada",
  "timestamp": "2025-12-01T16:30:00Z"
}
```

### Financial ERP Integration

**Endpoint:** `POST /api/finance/multi-currency/convert`

**Request:**
```json
{
  "amount": 16000,
  "from_currency": "CAD",
  "to_currency": "USD",
  "rate_type": "monthly_average",  // or "spot", "daily_close"
  "period": "2025-11"
}
```

**Response:**
```json
{
  "original_amount": 16000,
  "original_currency": "CAD",
  "converted_amount": 12080,
  "converted_currency": "USD",
  "fx_rate": 0.7550,
  "rate_type": "monthly_average",
  "period": "2025-11"
}
```

---

## 8. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Product Team | Initial comprehensive specification |

---

**End of UC-FIN-007: Multi-Currency Management**

*This document provides complete specification for USD/CAD multi-currency operations, FX rate management, currency conversion, gain/loss tracking, and consolidated financial reporting.*
