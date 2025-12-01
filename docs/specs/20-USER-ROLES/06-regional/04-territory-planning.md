# Use Case: Territory and Market Planning

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-RD-004 |
| Actor | Regional Director |
| Goal | Analyze market opportunities, plan territory expansion, and allocate resources for growth |
| Frequency | Quarterly (Strategic Planning), Monthly (Reviews), Ad-hoc (Opportunities) |
| Estimated Time | 2-4 hours (quarterly planning), 30-60 min (monthly reviews) |
| Priority | High (Strategic) |

---

## Preconditions

1. User is logged in as Regional Director
2. User has `regional.planning` permission
3. Market data and competitive intelligence available
4. Historical performance data accessible (2+ years preferred)
5. Budget framework established for planning period
6. CEO/Board strategic priorities defined

---

## Trigger

One of the following:
- Quarterly strategic planning cycle
- New market opportunity identified
- Competitive threat requiring response
- Budget planning season (annual/quarterly)
- M&A opportunity evaluation
- Client expansion into new geography
- Regulatory change opening new market

---

## Main Flow: Quarterly Territory Planning

### Step 1: Access Territory Planning Module

**User Action:** Navigate to Regional Planning > Territory Planning

**System Response:**
- URL changes to: `/employee/workspace/regional-planning/territory`
- Planning dashboard loads
- AI-powered market insights populate
- Historical performance data displays

**Screen State:**
```
+================================================================================+
|  InTime OS - Territory Planning                         Regional Director     |
+================================================================================+
|                                                                                |
|  AMERICAS REGION - Q1 2026 TERRITORY PLANNING               📅 Nov 30, 2025  |
|                                                                                |
|  [Market Analysis] [Territory Allocation] [Expansion Planning] [Competitive   |
|   Intelligence] [Resource Planning] [Financial Projections] [Export Report]   |
|                                                                                |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  PLANNING OVERVIEW                                                       ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Planning Period: Q1 2026 (Jan 1 - Mar 31, 2026)                         │|
|  │  Status: Draft (Not Yet Approved)                                        │|
|  │  Last Updated: Nov 30, 2025 at 2:45 PM                                   │|
|  │  Owner: Regional Director - Americas                                     │|
|  │                                                                           │|
|  │  Key Objectives for Q1 2026:                                             │|
|  │  1. Expand into Brazil market (new country launch)                       │|
|  │  2. Strengthen Mexico operations (turnaround focus)                      │|
|  │  3. Scale Canada managed services (RBC success replication)              │|
|  │  4. Defend market share in top US tech hubs                              │|
|  │  5. Achieve 15% YoY revenue growth ($21M target)                         │|
|  │                                                                           │|
|  │  [Edit Objectives] [Align with Corporate Strategy] [View Board Deck]     │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  CURRENT STATE ANALYSIS                                                  ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Regional Footprint (Current):                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  🇺🇸 USA (Established - 8 years)                                          │|
|  │     Cities: San Francisco, San Jose, Seattle, Austin, Boston, NYC        │|
|  │     Offices: 6 physical offices, 45 remote employees                     │|
|  │     Team: 72 employees (11 pods)                                         │|
|  │     Revenue: $2.89M MTD → $34.7M annually                                │|
|  │     Market Share: 3.2% (IT staffing in covered metros)                   │|
|  │     Status: 🟢 Mature, stable growth                                      │|
|  │                                                                           │|
|  │  🇨🇦 Canada (Growing - 4 years)                                           │|
|  │     Cities: Toronto, Vancouver, Calgary (limited)                        │|
|  │     Offices: 2 physical (TOR, VAN), 8 remote                             │|
|  │     Team: 28 employees (3 pods)                                          │|
|  │     Revenue: $658K MTD → $7.9M annually                                  │|
|  │     Market Share: 2.1% (IT staffing, Ontario & BC)                       │|
|  │     Status: 🟢 Strong growth (+25% YoY)                                   │|
|  │                                                                           │|
|  │  🇲🇽 Mexico (Challenged - 2 years)                                        │|
|  │     Cities: Mexico City, Monterrey                                       │|
|  │     Offices: 1 physical (CDMX), 15 remote                                │|
|  │     Team: 21 employees (3 pods)                                          │|
|  │     Revenue: $302K MTD → $3.6M annually                                  │|
|  │     Market Share: 0.8% (IT staffing, very fragmented market)             │|
|  │     Status: 🟡 Underperforming, needs turnaround                         │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  TOTAL: 3 countries, 9 cities, 9 offices, 122 employees, $46.2M annually │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  AI-POWERED MARKET OPPORTUNITIES (InTime Market Intelligence)           ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  🌟 TOP RECOMMENDED OPPORTUNITIES                                         │|
|  │                                                                           │|
|  │  ┌─ OPPORTUNITY 1: BRAZIL MARKET ENTRY ────────────────────────────────┐ │|
|  │  │                                                                      │ │|
|  │  │  Priority: 🔴 HIGH                                                   │ │|
|  │  │  Confidence Score: 87% (Based on 42 data signals)                   │ │|
|  │  │                                                                      │ │|
|  │  │  Market Overview:                                                    │ │|
|  │  │  • Market Size: $2.8B IT staffing market (Brazil)                   │ │|
|  │  │  • Growth Rate: 22% YoY (fastest growing in Americas)               │ │|
|  │  │  • Competition: Fragmented (no dominant player >8% share)           │ │|
|  │  │  • Client Demand: Strong (US companies nearshoring to Brazil)       │ │|
|  │  │                                                                      │ │|
|  │  │  Why Now:                                                            │ │|
|  │  │  ✅ Currency advantage (Real depreciation = lower costs)             │ │|
|  │  │  ✅ Regulatory reforms easing labor market (2024-2025)               │ │|
|  │  │  ✅ Tech hub emergence (São Paulo, Florianópolis)                    │ │|
|  │  │  ✅ Existing InTime client interest (3 clients asked about Brazil)  │ │|
|  │  │  ✅ Portuguese language overlap with Spanish (Mexico team leverage) │ │|
|  │  │                                                                      │ │|
|  │  │  Investment Required:                                                │ │|
|  │  │  • Headcount: 1 Country Manager, 2 Pod Managers, 12 recruiters      │ │|
|  │  │  • Office: São Paulo (Year 1), Floripa (Year 2)                     │ │|
|  │  │  • Technology: Localized ATS, payroll, compliance systems           │ │|
|  │  │  • Budget: $850K first year, breakeven by Month 18                  │ │|
|  │  │                                                                      │ │|
|  │  │  Projected Returns (3-year):                                        │ │|
|  │  │  Year 1: $1.2M revenue, -$150K EBITDA (investment year)             │ │|
|  │  │  Year 2: $4.5M revenue, $450K EBITDA (scaling)                      │ │|
|  │  │  Year 3: $8.2M revenue, $1.1M EBITDA (established)                  │ │|
|  │  │                                                                      │ │|
|  │  │  Risks:                                                              │ │|
|  │  │  ⚠️ Political/economic volatility                                    │ │|
|  │  │  ⚠️ Complex labor regulations (CLT employment law)                   │ │|
|  │  │  ⚠️ Currency risk (USD/BRL fluctuations)                             │ │|
|  │  │  ⚠️ Need local market expertise (hiring challenge)                   │ │|
|  │  │                                                                      │ │|
|  │  │  [View Full Business Case] [Financial Model] [Competitive Analysis] │ │|
|  │  │  [Add to Territory Plan] [Decline]                                  │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ OPPORTUNITY 2: EXPAND CANADA MANAGED SERVICES ──────────────────────┐ │|
|  │  │                                                                      │ │|
|  │  │  Priority: 🟡 MEDIUM-HIGH                                            │ │|
|  │  │  Confidence Score: 92% (Proven model, low risk)                     │ │|
|  │  │                                                                      │ │|
|  │  │  Opportunity:                                                        │ │|
|  │  │  RBC managed services success ($2.1M/3yr) demonstrates model        │ │|
|  │  │  viability. 5 additional Canadian banks/enterprises identified      │ │|
|  │  │  as prime targets for similar deals.                                │ │|
|  │  │                                                                      │ │|
|  │  │  Target Accounts:                                                    │ │|
|  │  │  1. TD Bank - Digital transformation program (est. $1.8M/3yr)       │ │|
|  │  │  2. Scotiabank - Cloud migration (est. $1.2M/2yr)                   │ │|
|  │  │  3. BMO - Data modernization (est. $900K/2yr)                       │ │|
|  │  │  4. Manulife - IT modernization (est. $1.5M/3yr)                    │ │|
|  │  │  5. Rogers Communications - DevOps scaling (est. $800K/2yr)         │ │|
|  │  │                                                                      │ │|
|  │  │  Total Pipeline Potential: $6.2M over 2-3 years                     │ │|
|  │  │                                                                      │ │|
|  │  │  Investment Required:                                                │ │|
|  │  │  • Headcount: +8 recruiters, +1 Senior MSP Manager                  │ │|
|  │  │  • Sales: Dedicated enterprise account executive                    │ │|
|  │  │  • Budget: $420K incremental cost                                   │ │|
|  │  │  • Timeline: 6 months to first deal close                           │ │|
|  │  │                                                                      │ │|
|  │  │  [Add to Plan] [View Account Profiles] [Sales Strategy]            │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ OPPORTUNITY 3: CHICAGO MARKET ENTRY (USA) ───────────────────────────┐│|
|  │  │                                                                      │ │|
|  │  │  Priority: 🟢 MEDIUM                                                 │ │|
|  │  │  Confidence Score: 78%                                               │ │|
|  │  │                                                                      │ │|
|  │  │  Market: Chicago metro (3rd largest tech market in US)              │ │|
|  │  │  Opportunity: Large financial services + enterprise tech sector     │ │|
|  │  │  Gap: No current InTime presence, competitors well established      │ │|
|  │  │                                                                      │ │|
|  │  │  [View Details] [Add to Plan] [Defer to Q2]                         │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  [View All Opportunities (12)] →                                         │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
+================================================================================+
```

**Time:** 5 minutes to review dashboard

---

### Step 2: Deep Dive on Brazil Market Entry Opportunity

**User Action:** Click "View Full Business Case" for Brazil opportunity

**System Response:** Opens comprehensive market analysis

**Screen State:**
```
+================================================================================+
|  BRAZIL MARKET ENTRY - DETAILED BUSINESS CASE                            [×] |
+================================================================================+
|                                                                                |
|  [Overview] [Market Analysis] [Competitive Landscape] [Financial Model]       |
|  [Go-to-Market Strategy] [Risk Assessment] [Implementation Plan]              |
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  MARKET ANALYSIS - BRAZIL                                                ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  🇧🇷 BRAZIL - REPÚBLICA FEDERATIVA DO BRASIL                              │|
|  │                                                                           │|
|  │  ┌─ MACROECONOMIC OVERVIEW ────────────────────────────────────────────┐ │|
|  │  │                                                                      │ │|
|  │  │  Population: 215 million (6th largest globally)                     │ │|
|  │  │  GDP: $1.92 trillion (9th largest economy)                          │ │|
|  │  │  GDP Growth: 2.9% (2025 est.)                                       │ │|
|  │  │  Inflation: 4.2% (controlled, within target band)                   │ │|
|  │  │  Unemployment: 7.8% (declining trend)                               │ │|
|  │  │  Currency: Brazilian Real (BRL) - 1 USD = 5.12 BRL                  │ │|
|  │  │                                                                      │ │|
|  │  │  Tech Workforce:                                                     │ │|
|  │  │  • Software developers: 500,000+ (largest in Latin America)         │ │|
|  │  │  • Annual CS graduates: 48,000                                      │ │|
|  │  │  • English proficiency: 62% of tech workforce (adequate)            │ │|
|  │  │  • Avg developer salary: $24K-$42K USD (vs. $80K-$120K in US)       │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ IT STAFFING MARKET SIZE & GROWTH ───────────────────────────────────┐ │|
|  │  │                                                                      │ │|
|  │  │  Total Addressable Market (TAM):                                    │ │|
|  │  │  ────────────────────────────────────────────────────────────────   │ │|
|  │  │  2024: $2.3B                                                        │ │|
|  │  │  2025: $2.8B (est.) ← Current year                                 │ │|
|  │  │  2026: $3.4B (proj.)                                                │ │|
|  │  │  2027: $4.1B (proj.)                                                │ │|
|  │  │  2028: $4.9B (proj.)                                                │ │|
|  │  │                                                                      │ │|
|  │  │  5-Year CAGR: 21.3% (fastest growth in Americas)                    │ │|
|  │  │                                                                      │ │|
|  │  │  ▁▂▃▅▆▇█ Growth driven by:                                          │ │|
|  │  │  • Digital transformation initiatives (govt + enterprise)           │ │|
|  │  │  • Nearshoring trend (US companies → Brazil)                        │ │|
|  │  │  • Fintech boom (Nubank, PagSeguro, etc.)                           │ │|
|  │  │  • E-commerce growth (MercadoLibre, B2W)                            │ │|
|  │  │  • Cloud adoption accelerating                                      │ │|
|  │  │                                                                      │ │|
|  │  │  Service Mix:                                                        │ │|
|  │  │  Contract Staffing:    68% ($1.9B)                                  │ │|
|  │  │  Permanent Placement:  22% ($616M)                                  │ │|
|  │  │  SOW/Projects:         10% ($280M)                                  │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ GEOGRAPHIC FOCUS ────────────────────────────────────────────────────┐│|
|  │  │                                                                      │ │|
|  │  │  Primary Target: São Paulo                                          │ │|
|  │  │  ────────────────────────────────────────────────────────────────   │ │|
|  │  │  • Largest tech hub (65% of Brazil IT market)                       │ │|
|  │  │  • Metro population: 22 million                                     │ │|
|  │  │  • Tech workforce: 180,000+ developers                              │ │|
|  │  │  • Fortune 500 presence: 87 companies                               │ │|
|  │  │  • Startup ecosystem: 2,400+ tech startups                          │ │|
|  │  │  • Infrastructure: Excellent (airport, metro, coworking spaces)     │ │|
|  │  │                                                                      │ │|
|  │  │  Neighborhoods/Districts:                                            │ │|
|  │  │  • Faria Lima: Financial district, enterprise clients               │ │|
|  │  │  • Vila Olímpia: Tech startups, coworking hubs                      │ │|
|  │  │  • Berrini: Corporate HQs, multinational presence                   │ │|
|  │  │                                                                      │ │|
|  │  │  Secondary Target: Florianópolis (Year 2)                           │ │|
|  │  │  ────────────────────────────────────────────────────────────────   │ │|
|  │  │  • Emerging tech hub ("Silicon Valley of Brazil")                   │ │|
|  │  │  • Lower cost base (salaries 15-20% below São Paulo)                │ │|
|  │  │  • Quality of life (attracts remote talent)                         │ │|
|  │  │  • Market share: 8% of Brazil IT staffing                           │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  COMPETITIVE LANDSCAPE                                                   ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Market Structure: FRAGMENTED (No player >8% share)                      │|
|  │                                                                           │|
|  │  ┌─ TOP 5 COMPETITORS ───────────────────────────────────────────────────┐│|
|  │  │                                                                      │ │|
|  │  │  1. Randstad Brazil                                                 │ │|
|  │  │     Market Share: 7.2%  |  Revenue: ~$200M  |  Employees: 450      │ │|
|  │  │     Strengths: Global brand, enterprise relationships               │ │|
|  │  │     Weaknesses: Slow-moving, less tech-focused                      │ │|
|  │  │                                                                      │ │|
|  │  │  2. ManpowerGroup Brazil                                            │ │|
|  │  │     Market Share: 6.8%  |  Revenue: ~$190M  |  Employees: 420      │ │|
|  │  │     Strengths: Broad service offerings, scale                       │ │|
|  │  │     Weaknesses: Generalist (not IT specialist)                      │ │|
|  │  │                                                                      │ │|
|  │  │  3. Gi Group Brazil                                                 │ │|
|  │  │     Market Share: 5.4%  |  Revenue: ~$150M  |  Employees: 340      │ │|
|  │  │     Strengths: Italian heritage, manufacturing focus                │ │|
|  │  │     Weaknesses: Weak in tech sector                                 │ │|
|  │  │                                                                      │ │|
|  │  │  4. Adecco Brazil                                                   │ │|
|  │  │     Market Share: 4.9%  |  Revenue: ~$138M  |  Employees: 310      │ │|
|  │  │     Strengths: Swiss efficiency, quality reputation                 │ │|
|  │  │     Weaknesses: Premium pricing, limited tech depth                 │ │|
|  │  │                                                                      │ │|
|  │  │  5. Luandre (Local player)                                          │ │|
|  │  │     Market Share: 3.2%  |  Revenue: ~$90M  |  Employees: 180       │ │|
|  │  │     Strengths: Local knowledge, government connections              │ │|
|  │  │     Weaknesses: Technology/systems lag, limited scale               │ │|
|  │  │                                                                      │ │|
|  │  │  Remaining Market: 72.5% (100+ small/regional players)              │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  🎯 COMPETITIVE GAP ANALYSIS                                              │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  InTime Differentiation Opportunities:                                   │|
|  │  ✅ Tech specialization (competitors are generalists)                     │|
|  │  ✅ Modern ATS/platform (competitors use legacy systems)                  │|
|  │  ✅ Nearshoring expertise (US clients expanding to Brazil)                │|
|  │  ✅ AI-powered matching (unique in Brazil market)                         │|
|  │  ✅ Transparent pricing (market norms: opaque, high commissions)          │|
|  │  ✅ Quality focus (competitors compete on price, not quality)             │|
|  │                                                                           │|
|  │  Barriers to Entry:                                                       │|
|  │  ⚠️ Complex labor law (CLT - Consolidação das Leis do Trabalho)          │|
|  │  ⚠️ Payroll/tax compliance (requires local expertise)                    │|
|  │  ⚠️ Relationship-driven market (trust, personal networks matter)          │|
|  │  ⚠️ Currency volatility (USD/BRL fluctuations impact margins)            │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Continue to Financial Model →]  [Back to Dashboard]  [Add to Plan]         |
|                                                                                |
+================================================================================+
```

**Time:** 10-15 minutes to review market analysis

---

### Step 3: Review Financial Model for Brazil Entry

**User Action:** Click tab "Financial Model"

**Screen State:**
```
+================================================================================+
|  BRAZIL MARKET ENTRY - FINANCIAL MODEL                                  [×] |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  3-YEAR FINANCIAL PROJECTION                                             ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Assumptions:                                                             │|
|  │  • Launch Date: Q2 2026 (April 1)                                        │|
|  │  • Initial Team: 15 employees (1 Country Mgr, 2 Pod Mgrs, 12 recruiters) │|
|  │  • Service Mix: 70% contract, 20% perm, 10% SOW                          │|
|  │  • Avg Gross Margin: 32% (blended)                                       │|
|  │  • USD/BRL Rate: 5.20 (with 10% buffer for volatility)                   │|
|  │                                                                           │|
|  │  ┌─ YEAR 1 (Apr 2026 - Mar 2027) ──────────────────────────────────────┐ │|
|  │  │                                    Q1      Q2      Q3      Q4    Total││|
|  │  │  ──────────────────────────────────────────────────────────────────  │ │|
|  │  │  Revenue                          $80K   $245K   $420K   $455K  $1.2M │ │|
|  │  │  Cost of Revenue (COGS)           $58K   $176K   $302K   $327K  $863K │ │|
|  │  │  ──────────────────────────────────────────────────────────────────  │ │|
|  │  │  Gross Profit                     $22K    $69K   $118K   $128K  $337K │ │|
|  │  │  Gross Margin %                   27.5%   28.2%   28.1%   28.1%  28.1%│ │|
|  │  │                                                                      │ │|
|  │  │  Operating Expenses:                                                 │ │|
|  │  │    Salaries & Benefits           $142K   $142K   $145K   $148K  $577K │ │|
|  │  │    Office & Facilities            $28K    $28K    $28K    $28K  $112K │ │|
|  │  │    Technology & Software          $12K    $12K    $12K    $12K   $48K │ │|
|  │  │    Marketing & Sales              $25K    $25K    $22K    $20K   $92K │ │|
|  │  │    Legal & Compliance             $18K     $8K     $8K     $8K   $42K │ │|
|  │  │    Travel & Setup Costs           $45K    $15K    $10K     $8K   $78K │ │|
|  │  │  ──────────────────────────────────────────────────────────────────  │ │|
|  │  │  Total Operating Expenses        $270K   $230K   $225K   $224K  $949K │ │|
|  │  │                                                                      │ │|
|  │  │  EBITDA                         ($248K) ($161K) ($107K)  ($96K) ($612K)│ │|
|  │  │  EBITDA Margin                   -310%   -65.7%  -25.5%  -21.1% -51.0%│ │|
|  │  │                                                                      │ │|
|  │  │  Cumulative Cash Burn           ($248K) ($409K) ($516K) ($612K)      │ │|
|  │  │                                                                      │ │|
|  │  │  Notes:                                                               │ │|
|  │  │  • Q1 is setup quarter (office, legal entity, hiring)                │ │|
|  │  │  • Revenue ramps slowly (relationship building, brand awareness)     │ │|
|  │  │  • Margin compressed in Y1 (competitive pricing to win clients)      │ │|
|  │  │  • High travel costs (US team supporting Brazil launch)              │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ YEAR 2 (Apr 2027 - Mar 2028) ──────────────────────────────────────┐ │|
|  │  │                                    Q1      Q2      Q3      Q4    Total││|
|  │  │  ──────────────────────────────────────────────────────────────────  │ │|
|  │  │  Revenue                         $850K   $1.0M  $1.25M  $1.4M   $4.5M │ │|
|  │  │  Gross Margin %                   30.5%   31.2%   31.8%  32.1%  31.5% │ │|
|  │  │  Gross Profit                    $259K   $312K   $398K  $449K  $1.42M │ │|
|  │  │                                                                      │ │|
|  │  │  Operating Expenses              $238K   $242K   $248K  $254K   $982K │ │|
|  │  │  (Team grows to 22 employees)                                        │ │|
|  │  │                                                                      │ │|
|  │  │  EBITDA                           $21K    $70K   $150K  $195K   $436K │ │|
|  │  │  EBITDA Margin                     2.5%    7.0%   12.0%  13.9%   9.7% │ │|
|  │  │                                                                      │ │|
|  │  │  Cumulative Cash Position       ($591K) ($521K) ($371K)($176K)       │ │|
|  │  │                                                                      │ │|
|  │  │  Notes:                                                               │ │|
|  │  │  • Breakeven achieved in Q1                                          │ │|
|  │  │  • Margin improvement (process optimization, pricing power)          │ │|
|  │  │  • Team expansion to handle growth                                   │ │|
|  │  │  • Positive cash generation in Q2-Q4                                 │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  ┌─ YEAR 3 (Apr 2028 - Mar 2029) ──────────────────────────────────────┐ │|
|  │  │                                    Q1      Q2      Q3      Q4    Total││|
|  │  │  ──────────────────────────────────────────────────────────────────  │ │|
|  │  │  Revenue                        $1.85M  $2.0M   $2.1M  $2.25M   $8.2M │ │|
|  │  │  Gross Margin %                   32.8%  33.1%   33.5%  33.8%  33.3% │ │|
|  │  │  Gross Profit                    $607K  $662K   $704K  $761K   $2.73M │ │|
|  │  │                                                                      │ │|
|  │  │  Operating Expenses              $385K  $395K   $405K  $415K  $1.60M │ │|
|  │  │  (Team grows to 35 employees, 2nd office in Floripa)                 │ │|
|  │  │                                                                      │ │|
|  │  │  EBITDA                          $222K  $267K   $299K  $346K  $1.13M │ │|
|  │  │  EBITDA Margin                    12.0%  13.4%   14.2%  15.4%  13.8% │ │|
|  │  │                                                                      │ │|
|  │  │  Cumulative Cash Position         $46K  $313K   $612K  $958K         │ │|
|  │  │                                                                      │ │|
|  │  │  Notes:                                                               │ │|
|  │  │  • Fully profitable, strong cash generation                          │ │|
|  │  │  • Second office in Florianópolis launched                           │ │|
|  │  │  • Established market presence, client base diversified              │ │|
|  │  │  • Year 3 cumulative cash positive ($958K)                           │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  KEY FINANCIAL METRICS - 3-YEAR SUMMARY                                 ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │                          Year 1       Year 2       Year 3       Total     │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Revenue                $1.2M        $4.5M        $8.2M       $13.9M     │|
|  │  Gross Profit           $337K       $1.42M       $2.73M       $4.49M     │|
|  │  EBITDA               ($612K)        $436K       $1.13M        $954K     │|
|  │  EBITDA Margin         -51.0%         9.7%        13.8%         6.9%     │|
|  │  Cumulative Cash      ($612K)      ($176K)        $958K                  │|
|  │  Team Size               15           22           35                    │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ROI Analysis:                                                            │|
|  │  • Total Investment:     $850K (Y1 setup + Y2 cumulative burn)           │|
|  │  • Payback Period:       Month 18 (Q2 Year 2)                            │|
|  │  • 3-Year ROI:           112% ($958K return on $850K invested)           │|
|  │  • IRR:                  42% (Internal Rate of Return)                   │|
|  │                                                                           │|
|  │  ✅ FINANCIALLY VIABLE - Strong returns after initial investment period   │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  SENSITIVITY ANALYSIS                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  What if scenarios:                                                       │|
|  │                                                                           │|
|  │  Scenario 1: SLOWER RAMP (Revenue -20% Y1-Y2)                            │|
|  │  • Year 3 Revenue: $6.8M  |  EBITDA: $890K  |  Payback: Month 24         │|
|  │  • Still viable, but tighter margins                                     │|
|  │                                                                           │|
|  │  Scenario 2: CURRENCY SHOCK (BRL devalues 15%)                           │|
|  │  • Margin compression to 28% (vs. 33%)                                   │|
|  │  • Year 3 EBITDA: $920K (vs. $1.13M)                                     │|
|  │  • Mitigated by local cost base (salaries also in BRL)                   │|
|  │                                                                           │|
|  │  Scenario 3: COMPETITION INTENSIFIES (Margin -3%)                        │|
|  │  • Year 3 EBITDA: $884K (still profitable)                               │|
|  │  • Payback period extends to Month 20                                    │|
|  │                                                                           │|
|  │  Scenario 4: ACCELERATED GROWTH (Revenue +30% Y2-Y3)                     │|
|  │  • Year 3 Revenue: $10.7M  |  EBITDA: $1.52M                             │|
|  │  • Payback: Month 15  |  Strong upside potential                         │|
|  │                                                                           │|
|  │  [Run Custom Scenario] [Download Model (Excel)] [Compare to Other Markets]│|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Continue to Go-to-Market Strategy →]  [Add to Territory Plan]  [Decline]   |
|                                                                                |
+================================================================================+
```

**Time:** 10 minutes to review financial projections

---

### Step 4: Add Brazil to Territory Plan

**User Action:** Click "Add to Territory Plan" button

**System Response:** Brazil added to draft plan

**Screen State:**
```
+================================================================================+
|  TERRITORY PLAN - Q1 2026 & BEYOND                                            |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  APPROVED INITIATIVES                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ✅ 1. BRAZIL MARKET ENTRY                                                │|
|  │     Status: Added to plan (pending final approval)                       │|
|  │     Timeline: Q2 2026 launch                                             │|
|  │     Investment: $850K (3-year NPV: $958K)                                │|
|  │     Owner: Regional Director (you)                                       │|
|  │     Dependencies: CFO budget approval, Country Manager hire              │|
|  │                                                                           │|
|  │  ✅ 2. CANADA MANAGED SERVICES EXPANSION                                  │|
|  │     Status: Added to plan                                                │|
|  │     Timeline: Q1 2026 (immediate)                                        │|
|  │     Investment: $420K                                                    │|
|  │     Expected Return: $6.2M pipeline over 2-3 years                       │|
|  │                                                                           │|
|  │  ✅ 3. MEXICO TURNAROUND PROGRAM                                          │|
|  │     Status: In progress                                                  │|
|  │     Timeline: 60-day intensive (Dec 2025 - Feb 2026)                     │|
|  │     Investment: $93K                                                     │|
|  │     Target: Revenue $150K MTD by Feb 2026                                │|
|  │                                                                           │|
|  │  🔄 UNDER CONSIDERATION                                                   │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  • Chicago market entry (USA) - Defer to Q2/Q3 2026                      │|
|  │  • Miami market expansion (USA) - Under evaluation                       │|
|  │  • Montreal expansion (Canada) - Resource constraints                    │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  TERRITORY ALLOCATION MAP                                                ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ┌─ AMERICAS REGION ─────────────────────────────────────────────────────┐│|
|  │  │                                                                      │ │|
|  │  │   🇺🇸 USA (Mature)                🇨🇦 CANADA (Growing)               │ │|
|  │  │   ├─ San Francisco/Bay Area       ├─ Toronto (HQ)                   │ │|
|  │  │   ├─ Seattle                      ├─ Vancouver                      │ │|
|  │  │   ├─ Austin                       └─ Calgary (limited)              │ │|
|  │  │   ├─ Boston                                                         │ │|
|  │  │   └─ New York                     🇲🇽 MEXICO (Turnaround)           │ │|
|  │  │                                   ├─ Mexico City (CDMX)             │ │|
|  │  │                                   └─ Monterrey                      │ │|
|  │  │                                                                      │ │|
|  │  │                                   🇧🇷 BRAZIL (NEW - Q2 2026)         │ │|
|  │  │                                   ├─ São Paulo (Launch)             │ │|
|  │  │                                   └─ Florianópolis (Year 2)         │ │|
|  │  │                                                                      │ │|
|  │  └──────────────────────────────────────────────────────────────────────┘ │|
|  │                                                                           │|
|  │  COVERAGE:                                                                │|
|  │  • Countries: 4 (USA, Canada, Mexico, Brazil)                            │|
|  │  • Cities: 12 (9 current + 1 new + 2 future)                             │|
|  │  • Offices: 11 (9 current + 2 new)                                       │|
|  │  • Team Size: 172 employees (122 current + 50 new hires planned)         │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  RESOURCE ALLOCATION                                                     ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Country          Current  New Hires  Total  % of Region  Investment     │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  USA                 72        4       76       44%        Maintain      │|
|  │  Canada              28       12       40       23%        $420K (grow)  │|
|  │  Mexico              21        0       21       12%        $93K (fix)    │|
|  │  Brazil               0       15       15       9%         $850K (new)   │|
|  │  Regional Ops         1        3        4       2%         Shared        │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  TOTAL              122       34      156      100%        $1.36M        │|
|  │                                                                           │|
|  │  Budget Approval Status:                                                  │|
|  │  ✅ Mexico Turnaround: $93K (approved)                                    │|
|  │  ⏳ Canada Expansion: $420K (pending CFO approval)                        │|
|  │  ⏳ Brazil Launch: $850K (pending CFO + Board approval)                   │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Finalize Plan] [Request Approvals] [Share with CEO] [Export Presentation]  |
|                                                                                |
+================================================================================+
```

**Time:** 5 minutes to review consolidated plan

---

## Postconditions

1. ✅ Market opportunities analyzed (Brazil, Canada expansion, others)
2. ✅ Financial models reviewed and validated
3. ✅ Competitive landscape assessed
4. ✅ Territory plan drafted for Q1 2026
5. ✅ Resource allocation determined (34 new hires across countries)
6. ✅ Budget requirements identified ($1.36M investment)
7. ✅ Approval workflow initiated (CFO, Board)
8. ✅ Implementation timeline defined
9. ✅ Risk assessments documented
10. ✅ Strategic alignment with corporate goals confirmed

---

## Alternative Flows

### A1: Evaluate Acquisition Target

**Trigger:** Opportunity to acquire local competitor

**Flow:**
1. Receive acquisition opportunity (e.g., Brazilian staffing firm for sale)
2. Conduct preliminary due diligence (financials, client list, team)
3. Financial valuation analysis
4. Synergy assessment (cost savings, revenue acceleration)
5. Integration complexity evaluation
6. Make vs. Buy analysis (acquire vs. organic growth)
7. Recommend to CEO/Board
8. If approved, execute acquisition and integration plan

---

### A2: Respond to Competitive Threat

**Trigger:** Major competitor enters InTime's key market

**Flow:**
1. Intelligence gathering (competitor's strategy, pricing, targets)
2. Threat assessment (impact on current accounts, pipeline)
3. Defensive strategy development:
   - Client retention program
   - Pricing/value prop adjustment
   - Accelerate product/service innovation
   - Counter-marketing campaign
4. Resource reallocation to defend key accounts
5. Monitor competitor moves and adjust strategy

---

### A3: Emergency Market Exit

**Trigger:** Market becomes unviable (regulatory, economic crisis)

**Flow:**
1. Assess severity of market issue (temporary vs. structural)
2. Scenario planning (stay, pivot, exit)
3. If exit decided:
   - Client transition plan (move to other countries if possible)
   - Employee severance and support
   - Office closure logistics
   - Asset liquidation
   - Financial wind-down
4. Communication plan (clients, employees, CEO/Board)
5. Execute orderly exit

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Insufficient Budget | Territory plan exceeds available funds | "Total investment ($1.36M) exceeds regional budget ($1.0M). Prioritize initiatives or request additional funding." | Defer lower priority items or request CFO budget increase |
| Headcount Freeze | Corporate-wide hiring freeze announced | "Cannot proceed with 34 new hires due to hiring freeze. Adjust plan for zero net new headcount." | Focus on productivity, automation, or contractor model |
| Market Data Outdated | Market analysis based on stale data | "Warning: Brazil market data is 18 months old. Refresh recommended before finalizing plan." | Commission updated market research |
| Regulatory Blocker | New regulation prevents market entry | "Brazil labor law change (effective Jan 2026) increases staffing license requirements. Re-evaluate viability." | Adjust timeline, partner with local firm, or defer entry |
| Acquisition Conflict | Existing client acquires competitor in target market | "Google acquired Brazilian AI staffing firm. Conflict of interest for Brazil entry?" | Legal review, adjust strategy, or target different market segment |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `regional.territory.plan_created` | `{ region, period: 'Q1_2026', initiatives: ['brazil', 'canada_expansion'], investment: 1360000 }` |
| `regional.market.opportunity_evaluated` | `{ market: 'brazil', score: 87, decision: 'approved', expected_roi: 112 }` |
| `regional.expansion.approved` | `{ country: 'brazil', launch_date: '2026-04-01', budget: 850000 }` |
| `regional.resource.allocated` | `{ initiative: 'brazil_launch', headcount: 15, budget: 850000 }` |
| `regional.planning.submitted_for_approval` | `{ approvers: ['CFO', 'Board'], total_investment: 1360000 }` |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Territory planning as part of strategic work
- [02-regional-dashboard.md](./02-regional-dashboard.md) - Performance data informing territory decisions
- [03-manage-pods.md](./03-manage-pods.md) - Pod creation for new markets
- [05-regional-reporting.md](./05-regional-reporting.md) - Presenting territory plan to Board/CEO

---

*Last Updated: 2025-11-30*
