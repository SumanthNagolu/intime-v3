# Use Case: Regional Reporting to Executive Leadership

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-RD-005 |
| Actor | Regional Director |
| Goal | Generate and present comprehensive regional performance reports to CEO, CFO, and Board |
| Frequency | Monthly (CEO/CFO), Quarterly (Board), Ad-hoc (Special situations) |
| Estimated Time | 2-4 hours (preparation), 30-90 min (presentation) |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Regional Director
2. User has `regional.reporting` permission
3. Performance data is current and validated
4. Financial data reconciled with Finance team
5. Previous period reports available for comparison
6. Presentation template(s) loaded

---

## Trigger

One of the following:
- Monthly reporting cycle (CEO/CFO business review)
- Quarterly reporting cycle (Board meeting)
- Special request from CEO (ad-hoc analysis)
- Crisis situation requiring executive briefing
- Strategic initiative update
- Budget review or forecasting cycle

---

## Main Flow: Monthly Business Review Report for CEO/CFO

### Step 1: Access Reporting Module

**User Action:** Navigate to Regional Reporting > Monthly Business Review

**System Response:**
- URL changes to: `/employee/workspace/regional-reporting/mbr`
- Report builder interface loads
- Previous month's report available for reference
- Data validation status displayed

**Screen State:**
```
+================================================================================+
|  InTime OS - Regional Reporting                         Regional Director     |
+================================================================================+
|                                                                                |
|  MONTHLY BUSINESS REVIEW - AMERICAS REGION              📅 Nov 30, 2025       |
|                                                                                |
|  Report Period: November 2025 (MTD: Day 18 of 30)                             |
|  Report Type: Monthly Business Review (MBR)                                   |
|  Audience: CEO, CFO, COO                                                      |
|  Scheduled Presentation: Dec 5, 2025 at 10:00 AM                              |
|                                                                                |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  REPORT BUILDER                                                          ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  [Executive Summary] [Financial Performance] [Operational Metrics]        │|
|  │  [Country Deep Dive] [Key Wins & Challenges] [Forecast & Outlook]        │|
|  │  [Strategic Initiatives] [Ask/Approvals Needed]                          │|
|  │                                                                           │|
|  │  ┌─ SECTION 1: EXECUTIVE SUMMARY ───────────────────────────────────────┐│|
|  │  │  Status: ✅ Auto-generated (Review & Edit)                           ││|
|  │  │                                                                      ││|
|  │  │  The Americas region delivered a strong November, exceeding revenue ││|
|  │  │  and margin targets while navigating several challenges. Revenue    ││|
|  │  │  reached $3.85M MTD (+2.7% vs plan), driven by exceptional Canada  ││|
|  │  │  performance (12 placements, +45% growth) and continued US          ││|
|  │  │  strength. Gross margin expanded to 31.2% (+4.0% vs target),        ││|
|  │  │  reflecting improved pricing discipline and managed services mix.   ││|
|  │  │                                                                      ││|
|  │  │  Key highlights include successfully saving the Google account      ││|
|  │  │  ($450K annually) through decisive service recovery, and initiating ││|
|  │  │  Mexico turnaround program to address persistent underperformance.  ││|
|  │  │  Q4 forecast remains on track at $19.2M (+4% vs budget), with       ││|
|  │  │  strong pipeline coverage (3.2x) supporting confidence.             ││|
|  │  │                                                                      ││|
|  │  │  [Edit Summary] [AI Rewrite] [Include in Report ✓]                  ││|
|  │  │                                                                      ││|
|  │  └──────────────────────────────────────────────────────────────────────┘│|
|  │                                                                           │|
|  │  ┌─ SECTION 2: FINANCIAL PERFORMANCE ────────────────────────────────────┐│|
|  │  │  Status: ✅ Data validated with Finance (Nov 29)                     ││|
|  │  │                                                                      ││|
|  │  │  [Include Chart: Revenue Trend]                                     ││|
|  │  │  [Include Table: P&L Summary]                                       ││|
|  │  │  [Include Chart: Margin by Country]                                 ││|
|  │  │  [Include Table: Variance Analysis]                                 ││|
|  │  │                                                                      ││|
|  │  │  Key Metrics (MTD):                                                  ││|
|  │  │  • Revenue: $3.85M (vs budget $3.75M, +2.7%) ✅                      ││|
|  │  │  • Gross Margin: 31.2% (vs target 30.0%, +4.0%) ✅                   ││|
|  │  │  • EBITDA: $428K (vs budget $412K, +3.9%) ✅                         ││|
|  │  │  • Placements: 47 (vs target 45, +4.4%) ✅                           ││|
|  │  │                                                                      ││|
|  │  │  Full Month Forecast: $6.5M (+4% vs budget $6.25M)                  ││|
|  │  │  Q4 Forecast: $19.2M (+4% vs budget $18.5M)                         ││|
|  │  │                                                                      ││|
|  │  │  [Preview Slides] [Edit] [Include in Report ✓]                      ││|
|  │  │                                                                      ││|
|  │  └──────────────────────────────────────────────────────────────────────┘│|
|  │                                                                           │|
|  │  ┌─ SECTION 3: OPERATIONAL METRICS ───────────────────────────────────────┐│|
|  │  │  Status: ✅ Auto-generated                                           ││|
|  │  │                                                                      ││|
|  │  │  [Include Chart: Utilization Trend]                                 ││|
|  │  │  [Include Table: Pod Performance Heatmap]                           ││|
|  │  │  [Include Chart: Pipeline Coverage]                                 ││|
|  │  │                                                                      ││|
|  │  │  Key Metrics:                                                        ││|
|  │  │  • Consultant Utilization: 89.2% (target: 85-92%) ✅                 ││|
|  │  │  • Time-to-Fill: 23 days (target: <25 days) ✅                       ││|
|  │  │  • Offer Acceptance: 87% (target: >85%) ✅                           ││|
|  │  │  • Client Retention: 91% (target: >90%) ✅                           ││|
|  │  │  • Pipeline Coverage: 3.2x (target: >3.0x) ✅                        ││|
|  │  │                                                                      ││|
|  │  │  [Preview Slides] [Edit] [Include in Report ✓]                      ││|
|  │  │                                                                      ││|
|  │  └──────────────────────────────────────────────────────────────────────┘│|
|  │                                                                           │|
|  │  [Continue Building Report →]                                            │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Auto-Generate Full Report] [Load Last Month's Template] [Preview] [Export]  |
|                                                                                |
+================================================================================+
```

**Time:** 2 minutes to access and review report builder

---

### Step 2: Generate Comprehensive Report

**User Action:** Click "Auto-Generate Full Report" then review/customize

**System Response:** Full report generated with all sections

**Screen State: Executive Summary Slide**
```
+================================================================================+
|  SLIDE 1: EXECUTIVE SUMMARY                                              [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │                                                                          ││|
|  │  AMERICAS REGION - MONTHLY BUSINESS REVIEW                              ││|
|  │  November 2025                                                          ││|
|  │                                                                          ││|
|  │  Presented by: [Regional Director Name]                                 ││|
|  │  Date: December 5, 2025                                                 ││|
|  │                                                                          ││|
|  └──────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  PERFORMANCE SNAPSHOT                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ┌─ REVENUE ──────┐  ┌─ MARGIN ───────┐  ┌─ EBITDA ──────┐  ┌─ TEAM ─┐ │|
|  │  │ MTD: $3.85M    │  │ 31.2%          │  │ $428K          │  │ 122    │ │|
|  │  │ Target: $3.75M │  │ Target: 30.0%  │  │ Target: $412K  │  │ +2 net │ │|
|  │  │ 🟢 +2.7%       │  │ 🟢 +4.0%       │  │ 🟢 +3.9%       │  │        │ │|
|  │  └────────────────┘  └────────────────┘  └────────────────┘  └────────┘ │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  KEY HIGHLIGHTS                                                          ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ✅ STRONG PERFORMANCE                                                    │|
|  │     • Revenue +2.7% ahead of target, full-month forecast $6.5M           │|
|  │     • Margin expansion to 31.2% (pricing discipline + managed services)  │|
|  │     • All operational metrics in green (utilization, TTF, pipeline)      │|
|  │                                                                           │|
|  │  🌟 CANADA EXCEPTIONAL                                                    │|
|  │     • Record week: 12 placements (+50% vs target)                        │|
|  │     • RBC managed services ramping ahead of schedule                     │|
|  │     • Opportunity to replicate model with 5 additional banks             │|
|  │                                                                           │|
|  │  ⚠️ MEXICO CHALLENGES ADDRESSED                                           │|
|  │     • 0 placements MTD, revenue -19.5% vs target (underperformance)      │|
|  │     • 60-day turnaround program initiated (manager change, training)     │|
|  │     • Target: $150K MTD by Feb 2026 (vs current $302K annually)          │|
|  │                                                                           │|
|  │  💼 GOOGLE ACCOUNT SAVED                                                  │|
|  │     • Service recovery successful: $450K annual contract renewed         │|
|  │     • 6-month probationary period with performance guarantees            │|
|  │     • FAANG Quality Protocol implemented across region                   │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  FORECAST & OUTLOOK                                                      ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  November (Full Month):  $6.5M revenue, 31.0% margin  ✅ Confident       │|
|  │  Q4 2025:                $19.2M revenue (+4% vs budget) ✅ On Track      │|
|  │  Q1 2026 Outlook:        $21M revenue (+15% YoY growth target)           │|
|  │                                                                           │|
|  │  Pipeline: $12.3M (3.2x coverage), win rate 32%, avg cycle 42 days       │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Edit Slide] [Speaker Notes] [Next Slide →]                                 |
|                                                                                |
+================================================================================+
```

**Time:** 5 minutes to review and customize executive summary

---

### Step 3: Review Financial Performance Section

**User Action:** Navigate to "Financial Performance" section (Slide 3-6)

**Screen State: Revenue & P&L Slide**
```
+================================================================================+
|  SLIDE 3: REVENUE & P&L PERFORMANCE                                      [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  REVENUE TREND (Last 6 Months)                                          ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  $4.5M ┤                                                        ╭─●       │|
|  │  $4.0M ┤                                           ╭──●──╮──● ─╯          │|
|  │  $3.5M ┤                              ╭──●──╮──●──╯    ╰─╯               │|
|  │  $3.0M ┤                 ╭──●──╮──●──╯    ╰─╯                            │|
|  │  $2.5M ┤    ╭──●──╮──●──╯    ╰─╯                                         │|
|  │  $2.0M ┴────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────        │|
|  │        Jun   Jul   Aug   Sep   Oct   Nov   Dec(F)                        │|
|  │                                                                           │|
|  │  ──── Actual    ─ ─ ─ Budget    ······ Prior Year                        │|
|  │                                                                           │|
|  │  INSIGHTS:                                                                │|
|  │  • Consistent upward trend (+18.2% YoY)                                   │|
|  │  • November on track to exceed budget by $250K                           │|
|  │  • Q4 seasonality pattern consistent with prior years                    │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  P&L SUMMARY (MTD ACTUAL vs BUDGET)                                     ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │                          Actual      Budget      Variance      %         │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Revenue                $3,851,000  $3,750,000    +$101,000   +2.7% ✅   │|
|  │                                                                           │|
|  │  Cost of Revenue        $2,751,000  $2,823,000     -$72,000   -2.6% ✅   │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Gross Profit           $1,100,000    $927,000    +$173,000  +18.7% ✅   │|
|  │  Gross Margin %              31.2%        28.5%       +2.7%          ✅   │|
|  │                                                                           │|
|  │  Operating Expenses       $672,000    $685,000     -$13,000   -1.9% ✅   │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  EBITDA                   $428,000    $412,000     +$16,000   +3.9% ✅   │|
|  │  EBITDA Margin %              11.1%        11.0%       +0.1%          ✅   │|
|  │                                                                           │|
|  │  KEY DRIVERS:                                                             │|
|  │  • Margin expansion: Better pricing + managed services mix growth        │|
|  │  • OpEx discipline: -1.9% vs budget (travel savings, hiring timing)      │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Edit Slide] [Speaker Notes] [Next Slide →]                                 |
|                                                                                |
+================================================================================+
```

**Screen State: Revenue by Country Slide**
```
+================================================================================+
|  SLIDE 4: REVENUE BY COUNTRY                                             [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  COUNTRY PERFORMANCE COMPARISON                                          ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Country      Revenue    vs Target  Margin   Placements  Trend   Status  │|
|  │  ───────────────────────────────────────────────────────────────────────│ │|
|  │                                                                           │|
|  │  🇺🇸 USA       $2.89M     +5.2% 🟢   32.1%   35 fills    📈 +5%  Healthy │|
|  │                                                                           │|
|  │  DETAILS:                                                                 │|
|  │  • 11 pods, 72 employees, 90.1% utilization                              │|
|  │  • Top performer: Pod-US-04 (Tech/FAANG) - $485K MTD, 42.1% margin       │|
|  │  • At risk: Pod-US-09 (SAP) - margin declining, Oracle client churn      │|
|  │  • Key wins: Microsoft ($385K), Amazon ($312K), Salesforce ($245K)       │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  🇨🇦 Canada    $658K      +8.1% 🟢   28.4%   12 fills    📈 +8%  Growing │|
|  │                                                                           │|
|  │  DETAILS:                                                                 │|
|  │  • 3 pods, 28 employees, 91.5% utilization (highest in region)           │|
|  │  • Standout: Pod-CA-03 (Healthcare) - 12 placements (record week)        │|
|  │  • RBC managed services deal ramping ($2.1M/3yr contract)                │|
|  │  • Opportunity: Replicate RBC model with 5 additional banks ($6.2M)      │|
|  │  • Proposed investment: +12 headcount, $420K budget                      │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  🇲🇽 Mexico    $302K     -19.5% 🔴   29.8%    0 fills    📉 -3%  At Risk │|
|  │                                                                           │|
|  │  DETAILS:                                                                 │|
|  │  • 3 pods, 21 employees, 82.8% utilization (below regional avg)          │|
|  │  • Critical: Pod-MX-02 & Pod-MX-03 (0 placements 45+ days)               │|
|  │  • Issues: Manager inexperience, 2 compliance violations, low morale     │|
|  │  • Turnaround plan: Manager replacement (David Kim from US), training    │|
|  │  • Target: $150K MTD by Feb 2026 (60-day intensive program)              │|
|  │  • Investment: $93K (relocation, training, Gem licenses)                 │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  📊 REGIONAL   $3.85M     +2.7% 🟢   31.2%   47 fills    📈 +3%  On Track│|
|  │     TOTAL                                                                 │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Edit Slide] [Speaker Notes] [Next Slide →]                                 |
|                                                                                |
+================================================================================+
```

**Time:** 10 minutes to review financial slides

---

### Step 4: Review Strategic Initiatives & Requests

**User Action:** Navigate to "Strategic Initiatives" section

**Screen State: Strategic Initiatives Slide**
```
+================================================================================+
|  SLIDE 9: STRATEGIC INITIATIVES & INVESTMENT REQUESTS                    [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  Q1 2026 STRATEGIC PLAN - INVESTMENT SUMMARY                            ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Initiative                 Investment  Timeline   ROI/Payback  Approval │|
|  │  ─────────────────────────────────────────────────────────────────────   │|
|  │                                                                           │|
|  │  1. BRAZIL MARKET ENTRY       $850K    Q2 2026    112% / 18mo  PENDING  │|
|  │     • Launch São Paulo office (Country Manager + 2 pods)                 │|
|  │     • Target: $1.2M Y1, $4.5M Y2, $8.2M Y3                               │|
|  │     • Market: $2.8B TAM, 22% YoY growth, fragmented (no player >8%)      │|
|  │     • Risk: Political/economic volatility, currency, complex labor law   │|
|  │     • Ask: Board approval + CFO budget allocation                        │|
|  │                                                                           │|
|  │  2. CANADA MANAGED SERVICES   $420K    Q1 2026    $6.2M / 6mo   PENDING │|
|  │     • Expand RBC success model to 5 additional banks/enterprises         │|
|  │     • Headcount: +12 recruiters, +1 Senior MSP Manager                   │|
|  │     • Targets: TD Bank ($1.8M), Scotiabank ($1.2M), BMO ($900K), etc.   │|
|  │     • Risk: Low (proven model, existing relationships)                   │|
|  │     • Ask: CFO budget approval                                           │|
|  │                                                                           │|
|  │  3. MEXICO TURNAROUND          $93K    Dec-Feb    $648K / 1mo   APPROVED│|
|  │     • Manager replacement (David Kim temporary assignment)               │|
|  │     • Training, tools (Gem licenses), retention counter-offers           │|
|  │     • Target: $150K MTD by Feb 2026 (vs current $42K)                    │|
|  │     • Status: In progress (David arrives Dec 14)                         │|
|  │                                                                           │|
|  │  ─────────────────────────────────────────────────────────────────────   │|
|  │  TOTAL INVESTMENT REQUEST:   $1,363K                                     │|
|  │  EXPECTED 3-YEAR RETURN:     $13.9M revenue, $954K EBITDA               │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  DECISION REQUESTED                                                      ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  1. BRAZIL LAUNCH - Board Approval                                       │|
|  │     ☐ Approve $850K investment for Q2 2026 Brazil market entry           │|
|  │     ☐ Defer to Q3/Q4 2026 (pending market conditions)                    │|
|  │     ☐ Decline (focus resources elsewhere)                                │|
|  │                                                                           │|
|  │  2. CANADA EXPANSION - CFO Budget Approval                               │|
|  │     ☐ Approve $420K for managed services expansion                       │|
|  │     ☐ Approve with conditions (reduce headcount to +8 vs +12)            │|
|  │     ☐ Decline                                                            │|
|  │                                                                           │|
|  │  3. HEADCOUNT SUMMARY                                                     │|
|  │     Current regional team: 122 employees                                 │|
|  │     Approved (Mexico): +0 (reallocation)                                 │|
|  │     Requested (Brazil): +15                                              │|
|  │     Requested (Canada): +12                                              │|
|  │     ─────────────────────────────────────────────────────────────────    │|
|  │     TOTAL REQUEST: +27 net new headcount (22% growth)                    │|
|  │                                                                           │|
|  │     ☐ Approve headcount plan as submitted                                │|
|  │     ☐ Approve with modifications (specify)                               │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Edit Slide] [Speaker Notes] [Next Slide →]                                 |
|                                                                                |
+================================================================================+
```

**Time:** 5 minutes to review strategic initiatives

---

### Step 5: Add Speaker Notes and Finalize

**User Action:** Add speaker notes for key slides, finalize presentation

**Screen State: Speaker Notes Editor**
```
+================================================================================+
|  SPEAKER NOTES - SLIDE 9 (Strategic Initiatives)                        [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  TALKING POINTS                                                          ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  BRAZIL OPPORTUNITY:                                                      │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  • "Brazil represents our biggest growth opportunity in Americas"        │|
|  │  • Market size: $2.8B and growing 22% annually (fastest in region)       │|
|  │  • Competition fragmented - no dominant player gives us opening           │|
|  │  • Timing is right: currency advantage, regulatory reforms, tech boom    │|
|  │  • 3 existing clients already asking about Brazil capability             │|
|  │  • Investment: $850K upfront, but breakeven by Month 18                  │|
|  │  • 3-year projection: $13.9M revenue, $954K EBITDA                       │|
|  │  • Risk mitigation: Start small (São Paulo only), proven team model      │|
|  │                                                                           │|
|  │  IF ASKED ABOUT RISKS:                                                    │|
|  │  • Political/economic: True, but staffing is counter-cyclical            │|
|  │  • Currency: Most costs in BRL too, natural hedge                        │|
|  │  • Labor law complexity: Hire local legal/HR experts (budgeted)          │|
|  │  • Exit strategy: If not working by Month 18, orderly wind-down          │|
|  │                                                                           │|
|  │  CANADA EXPANSION:                                                        │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  • "This is de-risked growth - replicating proven RBC success"           │|
|  │  • RBC deal: $2.1M over 3 years, ramping ahead of schedule               │|
|  │  • 5 target accounts identified, similar profiles to RBC                 │|
|  │  • Investment: $420K, but pipeline potential is $6.2M                    │|
|  │  • Team already in place, just need to scale (Jennifer Wu proven leader) │|
|  │  • Lower risk than Brazil, faster ROI (6 months vs 18 months)            │|
|  │                                                                           │|
|  │  MEXICO TURNAROUND:                                                       │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  • "This is about protecting existing investment, not new bet"           │|
|  │  • Mexico underperforming: $302K MTD vs $375K target (-19.5%)            │|
|  │  • Root cause: Inexperienced manager, recruiting gaps, compliance issues │|
|  │  • Solution: Bring in David Kim (proven US manager) for 60 days          │|
|  │  • Investment: $93K (mostly relocation and training)                     │|
|  │  • Target: $150K MTD by Feb 2026 (achievable with right leadership)      │|
|  │  • If turnaround fails, we'll consider exit strategy by Q2               │|
|  │                                                                           │|
|  │  CLOSING:                                                                 │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  • "Total ask: $1.36M investment for $13.9M revenue opportunity"         │|
|  │  • "This plan gets us to $55M+ annual run rate by 2028"                  │|
|  │  • "We're building on strength (US, Canada) while fixing weakness (MX)"  │|
|  │  • "Brazil is the long-term strategic play for regional dominance"       │|
|  │  • "Recommend: Approve Canada (low risk), Approve Brazil (high return),  │|
|  │     Monitor Mexico turnaround (already in progress)"                     │|
|  │                                                                           │|
|  │  ANTICIPATED QUESTIONS:                                                   │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Q: "Can we afford $1.36M investment right now?"                         │|
|  │  A: "Yes - regional cash flow is strong ($428K EBITDA/month). We can     │|
|  │      self-fund Canada from regional P&L. Brazil needs corporate budget   │|
|  │      allocation, but payback is 18 months. Strong ROI justifies it."     │|
|  │                                                                           │|
|  │  Q: "What if Mexico turnaround fails?"                                    │|
|  │  A: "We have 60-day checkpoint. If not on track by Feb, we'll either     │|
|  │      consolidate (merge pods), find permanent manager, or exit market.   │|
|  │      Worst case: write off $93K and redeploy 21 employees elsewhere."    │|
|  │                                                                           │|
|  │  Q: "Why Brazil vs other markets (Chile, Argentina, Colombia)?"          │|
|  │  A: "Market size - Brazil is 60% of Latin America IT market. Also,       │|
|  │      language advantage (Portuguese overlap with Spanish), US client     │|
|  │      demand for nearshoring, and regulatory environment improving."      │|
|  │                                                                           │|
|  │  [Save Notes] [Print Notes] [Back to Slide]                              │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
+================================================================================+
```

**Time:** 15-20 minutes to add comprehensive speaker notes

---

### Step 6: Export and Share Report

**User Action:** Export presentation in multiple formats

**Screen State: Export Options**
```
+================================================================================+
|  EXPORT MONTHLY BUSINESS REVIEW                                         [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  SELECT EXPORT FORMAT                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ☑ PowerPoint (.pptx)                                                    │|
|  │    • Full presentation with speaker notes                                │|
|  │    • Editable format for CEO/CFO to modify                               │|
|  │    • File size: ~4.2 MB                                                  │|
|  │                                                                           │|
|  │  ☑ PDF (Executive Summary)                                               │|
|  │    • Slides only, no speaker notes                                       │|
|  │    • For Board distribution                                              │|
|  │    • File size: ~1.8 MB                                                  │|
|  │                                                                           │|
|  │  ☑ Excel (Data Tables)                                                   │|
|  │    • All financial and operational data tables                           │|
|  │    • For CFO deep-dive analysis                                          │|
|  │    • File size: ~890 KB                                                  │|
|  │                                                                           │|
|  │  ☐ Google Slides (Cloud collaboration)                                   │|
|  │    • Shareable link for remote attendees                                 │|
|  │    • Real-time collaboration enabled                                     │|
|  │                                                                           │|
|  │  ☐ Video Recording (Pre-recorded presentation)                           │|
|  │    • Auto-generate narrated video from slides + speaker notes            │|
|  │    • For asynchronous review                                             │|
|  │    • Estimated length: 18 minutes                                        │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  DISTRIBUTION                                                            ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Send To:                                                                 │|
|  │  ☑ CEO (john.smith@intime.com)                                           │|
|  │  ☑ CFO (david.park@intime.com)                                           │|
|  │  ☑ COO (sarah.johnson@intime.com)                                        │|
|  │  ☐ Board Members (via Board portal)                                      │|
|  │  ☑ Country Managers (Americas region)                                    │|
|  │                                                                           │|
|  │  Email Subject:                                                           │|
|  │  [Americas Region - November 2025 Monthly Business Review]               │|
|  │                                                                           │|
|  │  Email Message:                                                           │|
|  │  ┌──────────────────────────────────────────────────────────────────┐    │|
|  │  │ Hi Team,                                                         │    │|
|  │  │                                                                  │    │|
|  │  │ Please find attached the Americas Region MBR for November 2025. │    │|
|  │  │                                                                  │    │|
|  │  │ Key highlights:                                                  │    │|
|  │  │ • Strong month: Revenue +2.7% ahead, margin expansion to 31.2%  │    │|
|  │  │ • Canada exceptional (12 placements, RBC success)               │    │|
|  │  │ • Mexico turnaround initiated (60-day program)                  │    │|
|  │  │ • Google account saved ($450K annually)                         │    │|
|  │  │                                                                  │    │|
|  │  │ Strategic requests for discussion:                              │    │|
|  │  │ 1. Brazil market entry ($850K investment) - Board approval      │    │|
|  │  │ 2. Canada managed services expansion ($420K) - CFO approval     │    │|
|  │  │                                                                  │    │|
|  │  │ Looking forward to our review meeting on Dec 5 at 10:00 AM.     │    │|
|  │  │                                                                  │    │|
|  │  │ Best regards,                                                    │    │|
|  │  │ [Regional Director Name]                                        │    │|
|  │  └──────────────────────────────────────────────────────────────────┘    │|
|  │                                                                           │|
|  │  [Edit Message]                                                           │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  CALENDAR INTEGRATION                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ☑ Attach to meeting invite: "Americas MBR - December 5, 2025"           │|
|  │    Meeting Details:                                                       │|
|  │    • Date: December 5, 2025                                              │|
|  │    • Time: 10:00 AM - 11:00 AM PST                                       │|
|  │    • Location: Executive Conference Room / Zoom                          │|
|  │    • Attendees: CEO, CFO, COO, Regional Director                         │|
|  │                                                                           │|
|  │  ☐ Schedule follow-up: "Strategic Initiatives Decision Meeting"          │|
|  │    (For Board approval of Brazil launch)                                 │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Cancel]                                    [Export & Send]                  |
|                                                                                |
+================================================================================+
```

**User Action:** Click "Export & Send"

**System Response:**
```
✅ Report exported successfully

Files generated:
• Americas_MBR_Nov2025.pptx (4.2 MB)
• Americas_MBR_Nov2025_ExecSummary.pdf (1.8 MB)
• Americas_MBR_Nov2025_DataTables.xlsx (890 KB)

Email sent to:
• CEO (john.smith@intime.com)
• CFO (david.park@intime.com)
• COO (sarah.johnson@intime.com)
• Country Managers (3 recipients)

Calendar invite updated with attachments.

[View Sent Email] [Download Files] [Close]
```

**Time:** 5 minutes to export and distribute

---

## Postconditions

1. ✅ Monthly Business Review report generated (9 slides, comprehensive)
2. ✅ Financial data validated with Finance team
3. ✅ Strategic initiatives clearly articulated with ROI analysis
4. ✅ Speaker notes prepared for live presentation
5. ✅ Report exported in multiple formats (PowerPoint, PDF, Excel)
6. ✅ Distribution completed to CEO, CFO, COO, Country Managers
7. ✅ Calendar invite updated with attachments
8. ✅ Approvals requested (Brazil launch, Canada expansion)
9. ✅ Follow-up items tracked (60-day Mexico review, Q1 forecast)

---

## Alternative Flows

### A1: Quarterly Board Presentation

**Differences from Monthly Review:**
- Longer format (20-25 slides vs 9 slides)
- More strategic focus (less operational detail)
- 3-month trend analysis vs single month
- Competitive positioning section
- Market share analysis
- Long-term strategic roadmap (12-24 months)
- Formal vote requests (approvals, budget)

**Additional Sections:**
- Industry trends and market outlook
- Talent development and succession planning
- Technology and innovation initiatives
- Regulatory and compliance overview
- Risk management dashboard

---

### A2: Crisis Reporting (Ad-hoc)

**Trigger:** Major issue requiring immediate executive attention

**Examples:**
- Major client loss (>$500K annually)
- Compliance violation with legal exposure
- Financial miss (>10% below target)
- Key executive departure
- Cybersecurity incident

**Report Structure:**
1. **Situation Summary** (What happened, when, impact)
2. **Root Cause Analysis** (Why it happened)
3. **Immediate Actions Taken** (What we've done so far)
4. **Mitigation Plan** (How we'll minimize damage)
5. **Long-term Remediation** (Preventing recurrence)
6. **Financial Impact** (Revenue, cost, risk exposure)
7. **Approvals/Resources Needed** (What you need from leadership)

**Timeline:** Report within 24 hours of crisis, daily updates until resolved

---

### A3: Forecast Update (Mid-Quarter)

**Trigger:** Material change to quarterly forecast (>5% variance)

**Report Focus:**
- Updated revenue/EBITDA forecast
- Variance explanation (vs original plan)
- Key drivers of change (wins, losses, delays)
- Risk assessment (probability-weighted scenarios)
- Action plan to close gap (if underperforming)
- Resource requests (if needed to hit targets)

**Format:** 3-5 slide executive summary + supporting data

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Data Validation Failed | Finance data doesn't match | "Warning: Revenue figure ($3.85M) doesn't match Finance system ($3.82M). Reconcile before sending." | Contact CFO team, reconcile variance, update report |
| Export Failed | File size too large | "Export failed: Presentation exceeds 25MB email limit. Compress or use cloud link." | Compress images, use Google Slides link instead |
| Calendar Conflict | Meeting time not available | "CEO has conflict at 10:00 AM on Dec 5. Reschedule or proceed?" | Adjust time or proceed with COO/CFO only |
| Approval Not Received | CEO hasn't approved prior action | "Brazil budget request from Oct is still pending. Follow up before submitting new request?" | Escalate pending item before adding new asks |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `regional.report.generated` | `{ type: 'monthly_business_review', period: '2025-11', pages: 9, created_by, created_at }` |
| `regional.report.distributed` | `{ report_id, recipients: ['CEO', 'CFO', 'COO'], formats: ['pptx', 'pdf', 'xlsx'] }` |
| `regional.approval.requested` | `{ initiative: 'brazil_launch', amount: 850000, approver: 'Board', due_date: '2025-12-15' }` |
| `regional.presentation.scheduled` | `{ meeting_date: '2025-12-05', attendees, duration: 60, agenda }` |

---

## Key Metrics for Reports

### Financial (Always Include)
- Revenue (MTD, QTD, YTD, Forecast)
- Gross Margin % and $ amount
- EBITDA and EBITDA %
- Variance to budget ($, %)
- Variance to prior year ($, %)

### Operational (Core KPIs)
- Consultant utilization %
- Time-to-fill (days)
- Offer acceptance rate %
- Client retention %
- Pipeline coverage (x of target)
- Win rate %

### Strategic (Quarterly/Board)
- Market share (where available)
- Net Promoter Score (NPS)
- Employee engagement score
- Strategic initiative progress (% complete)
- New market expansion metrics

---

## Presentation Best Practices

1. **Executive Summary First**: Never bury the lead - key takeaways on slide 1
2. **Data Visualization**: Use charts over tables where possible
3. **Variance Focus**: Always show actual vs budget/plan, explain variances >5%
4. **Forward-Looking**: Spend 40% on past performance, 60% on forecast and actions
5. **Action-Oriented**: Every problem needs a solution slide
6. **Pre-Read**: Send deck 24 hours before meeting (no surprises in live presentation)
7. **Backup Slides**: Include detailed backup data (30-50 slides) after main deck
8. **Consistent Template**: Use company standard format for all reports

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Reporting as part of daily/weekly routine
- [02-regional-dashboard.md](./02-regional-dashboard.md) - Source data for reports
- [03-manage-pods.md](./03-manage-pods.md) - Pod performance included in reports
- [04-territory-planning.md](./04-territory-planning.md) - Strategic initiatives featured in reports

---

*Last Updated: 2025-11-30*
