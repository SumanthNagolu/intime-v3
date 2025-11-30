# Use Case: Strategic Workforce Planning

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EXEC-003 |
| Actor | CEO / COO / CHRO |
| Goal | Plan and optimize workforce capacity, hiring, and resource allocation |
| Frequency | Monthly (planning), Weekly (monitoring) |
| Estimated Time | 45-60 minutes (planning session) |
| Priority | High |

---

## Preconditions

1. User is logged in as Executive with workforce planning permissions
2. Historical headcount and utilization data available (minimum 90 days)
3. Current organizational structure defined
4. Budget data accessible
5. Revenue forecasts up-to-date

---

## Trigger

One of the following:
- Monthly workforce planning cycle (first week of month)
- Quarterly strategic planning session
- Significant business change (new contract, market expansion)
- Utilization threshold breach (bench >30% or <70%)
- Attrition spike detected
- Budget review requiring headcount adjustments

---

## Main Flow: Conduct Monthly Workforce Planning

### Step 1: Navigate to Workforce Planning Dashboard

**User Action:** Click "Workforce Planning" from Executive menu or navigate to `/executive/workforce-planning`

**System Response:**
- Loads workforce planning dashboard
- Shows current headcount summary
- Displays utilization trends
- Forecasts capacity needs based on pipeline

**Screen State:**
```
+-------------------------------------------------------------------------+
| WORKFORCE PLANNING DASHBOARD                      [🔔 2]  [⚙]  [👤 COO]|
+-------------------------------------------------------------------------+
| [Overview] [Capacity Analysis] [Hiring Plan] [Scenarios] [Reports]     |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ WORKFORCE SNAPSHOT ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Current Headcount:      1,125 employees                             │ |
| │ Target Headcount:       1,200 (Q4 2025 goal)                        │ |
| │ Gap:                    -75 (-6.25%)  🔴                            │ |
| │                                                                     │ |
| │ Active Bench:           245 consultants (Billable pool)             │ |
| │ Bench Utilization:      62%  (vs 80% target)  🔴                    │ |
| │                                                                     │ |
| │ Monthly Attrition:      18% annualized (vs 15% target)  🟡          │ |
| │ Open Positions:         28 requisitions                             │ |
| │ Time to Hire:           45 days average                             │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~10 seconds

---

### Step 2: Analyze Current Headcount by Department

**User Action:** Click "Capacity Analysis" tab

**System Response:**
- Shows detailed headcount breakdown
- By department, role, location, pillar
- Compares actual vs plan
- Identifies capacity gaps

**Screen State:**
```
+-------------------------------------------------------------------------+
| CAPACITY ANALYSIS                                                       |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ HEADCOUNT BY DEPARTMENT ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Department        Current  Target   Gap    Util%   Attrition   HC% │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Recruiting        420      450      -30🔴  78%     20%          37% │ |
| │ ████████████████████████████████████                               │ |
| │   - Recruiters    315      340      -25                            │ |
| │   - Managers      42       45       -3                             │ |
| │   - Coordinators  63       65       -2                             │ |
| │                                                                     │ |
| │ Bench Sales       210      225      -15🟡  64%     18%          19% │ |
| │ ███████████████████                                                │ |
| │   - Sales Reps    168      180      -12                            │ |
| │   - Managers      21       23       -2                             │ |
| │   - Marketing     21       22       -1                             │ |
| │                                                                     │ |
| │ Talent Acq        165      180      -15🟡  82%     16%          15% │ |
| │ ███████████████                                                    │ |
| │   - TA Specialists 126     138      -12                            │ |
| │   - Managers      18       20       -2                             │ |
| │   - Coordinators  21       22       -1                             │ |
| │                                                                     │ |
| │ Academy           95       105      -10🟡  88%     12%           8% │ |
| │ ████████                                                           │ |
| │   - Instructors   52       58       -6                             │ |
| │   - Content Dev   28       32       -4                             │ |
| │   - Support       15       15        0                             │ |
| │                                                                     │ |
| │ Operations        85       90       -5🟡   92%     14%           8% │ |
| │ ████████                                                           │ |
| │   - IT/Tech       35       38       -3                             │ |
| │   - Finance       25       27       -2                             │ |
| │   - HR            15       15        0                             │ |
| │   - Admin         10       10        0                             │ |
| │                                                                     │ |
| │ Leadership        35       35        0✅   100%    8%            3% │ |
| │ ███                                                                │ |
| │   - Executives    8        8         0                             │ |
| │   - VPs           12       12        0                             │ |
| │   - Directors     15       15        0                             │ |
| │                                                                     │ |
| │ Consultants       245      280      -35🔴  62%     N/A          22% │ |
| │ ████████████████████████                                           │ |
| │ (Billable Pool)                                                     │ |
| │                                                                     │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ TOTAL             1,255    1,365    -110🔴 75%     17%         100% │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ HEADCOUNT BY REGION ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Region          Current  Target   Gap    Avg Util   Cost/HC/Year   │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ 🇺🇸 Americas     675      720      -45🔴  76%       $95,000         │ |
| │ 🌏 APAC          320      340      -20🟡  78%       $42,000         │ |
| │ 🇪🇺 Europe       180      195      -15🟡  72%       $78,000         │ |
| │ 🏜️ Middle East   80       85       -5🟡   68%       $65,000         │ |
| │ 🌴 LATAM         55       60       -5🟡   70%       $38,000         │ |
| │                                                                     │ |
| │ Total Cost (Annual Payroll): $82.3M  (Budget: $88.5M)  ✅ -$6.2M   │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Drill Down by Pod] [View Skills Matrix] [Export Report]               |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~3 minutes (review breakdown)

---

### Step 3: Analyze Bench Utilization Deep Dive

**User Action:** Scroll down to "Bench Utilization Analysis" section

**System Response:**
- Shows consultant bench breakdown
- Time on bench distribution
- Skills availability
- Revenue impact of low utilization

**Screen State:**
```
+-------------------------------------------------------------------------+
| ┌─ BENCH UTILIZATION ANALYSIS ───────────────────────────────────────┐ |
| │                                                                     │ |
| │ Total Consultants: 245                                              │ |
| │ Billable (Active): 152  (62%)  🔴 Target: 80%  |  Gap: -44 people  │ |
| │ Bench (Idle):      93   (38%)                                       │ |
| │                                                                     │ |
| │ Revenue Impact:                                                     │ |
| │ • Lost Revenue (38% idle): ~$760K/month  (assuming $65/hr avg)     │ |
| │ • Annual Impact if not improved: ~$9.1M                             │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ BENCH BY TIME IDLE ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Time Range      Count    % of Bench   Avg Cost/Day   Total Impact  │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ 0-7 days        28       30%           $520           $14,560/day   │ |
| │ ████████████                                                       │ |
| │ (Fresh to bench - marketing starting)                              │ |
| │                                                                     │ |
| │ 8-30 days       42       45%           $520           $21,840/day   │ |
| │ ██████████████████                                                 │ |
| │ (Active marketing - normal window)                                 │ |
| │                                                                     │ |
| │ 31-60 days      18       19%           $520           $9,360/day    │ |
| │ ████████                                                           │ |
| │ (Concern - need intervention)  🟡                                  │ |
| │                                                                     │ |
| │ 61+ days        5        6%            $520           $2,600/day    │ |
| │ ██                                                                 │ |
| │ (Critical - immediate action)  🔴                                  │ |
| │                                                                     │ |
| │ Total Daily Lost Revenue: $48,360  |  Monthly: ~$1.0M  |  🔴        │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ BENCH BY SKILL (Top 10) ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Skill              Available  Avg $/hr  Market Demand   Match Score│ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Java               22         $70       High  ✅         92%       │ |
| │ React              18         $72       High  ✅         94%       │ |
| │ DevOps             14         $78       High  ✅         88%       │ |
| │ Data Engineer      12         $75       Med   🟡         76%       │ |
| │ .NET               11         $65       Med   🟡         71%       │ |
| │ Python             10         $68       High  ✅         85%       │ |
| │ AWS                9          $80       High  ✅         90%       │ |
| │ Salesforce         8          $72       Med   🟡         73%       │ |
| │ Angular            7          $68       Low   🔴         62%       │ |
| │ QA/Testing         6          $58       Med   🟡         68%       │ |
| │                                                                     │ |
| │ ✅ High demand skills: 71 consultants - should place quickly        │ |
| │ 🟡 Medium demand: 31 consultants - moderate marketing effort        │ |
| │ 🔴 Low demand: 11 consultants - consider retraining or reassign     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ROOT CAUSE ANALYSIS ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Why is bench utilization low?                                       │ |
| │                                                                     │ |
| │ 1. Market Demand Down (40% of problem)                              │ |
| │    • Tech sector slowdown reduced client demand by 15%              │ |
| │    • 3 major clients paused hiring (150 open reqs frozen)           │ |
| │                                                                     │ |
| │ 2. Marketing Velocity Slow (30% of problem)                         │ |
| │    • Avg time to first submittal: 8.5 days (was 5.2 days)           │ |
| │    • Bench sales team 15% understaffed                              │ |
| │                                                                     │ |
| │ 3. Rotation Timing (20% of problem)                                 │ |
| │    • 12 consultants returned from assignments this week             │ |
| │    • Normal churn, but bunched timing                               │ |
| │                                                                     │ |
| │ 4. Skill Mismatch (10% of problem)                                  │ |
| │    • 11 consultants with low-demand skills                          │ |
| │    • Need retraining investment                                     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~4 minutes

---

### Step 4: Build Hiring Plan to Address Gaps

**User Action:** Click "Hiring Plan" tab

**System Response:**
- Shows recommended hiring plan based on gaps
- Allows adjustments to plan
- Calculates budget impact
- Projects timeline to fill positions

**Screen State:**
```
+-------------------------------------------------------------------------+
| HIRING PLAN - Q4 2025                                                   |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ RECOMMENDED HIRING PLAN ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Based on current gaps, pipeline forecast, and attrition trends:     │ |
| │                                                                     │ |
| │ Department     Role              Qty  Region      Start     Budget  │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Recruiting     Recruiters        25   USA (15)    Dec       $1.9M  │ |
| │                                       India (10)                    │ |
| │                Managers          3    USA (2)     Dec       $285K  │ |
| │                                       UK (1)                        │ |
| │                                                                     │ |
| │ Bench Sales    Sales Reps        12   USA (7)     Jan       $912K  │ |
| │                                       India (5)                     │ |
| │                Managers          2    USA (1)     Jan       $190K  │ |
| │                                       Singapore(1)                  │ |
| │                                                                     │ |
| │ Talent Acq     TA Specialists    12   USA (6)     Jan       $864K  │ |
| │                                       India (6)                     │ |
| │                Managers          2    USA (1)     Feb       $190K  │ |
| │                                       UK (1)                        │ |
| │                                                                     │ |
| │ Academy        Instructors       6    India (4)   Dec       $252K  │ |
| │                                       USA (2)                       │ |
| │                Content Dev       4    Remote      Jan       $280K  │ |
| │                                                                     │ |
| │ Operations     DevOps Eng        3    USA (2)     Dec       $330K  │ |
| │                                       India (1)                     │ |
| │                Finance Analyst   2    USA (1)     Jan       $150K  │ |
| │                                       India (1)                     │ |
| │                                                                     │ |
| │ Consultants    Add to Bench      35   USA (20)    Rolling   $2.8M  │ |
| │                                       India (15)                    │ |
| │                                                                     │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ TOTAL                            106                        $8.15M │ |
| │                                                                     │ |
| │ Budget Available:   $10.2M  (Remaining from FY25 allocation)        │ |
| │ Plan Cost:          $8.15M                                          │ |
| │ Buffer:             $2.05M  ✅ Healthy buffer                       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ HIRING TIMELINE ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Month    Hires  Cumulative  Utilization Forecast  Revenue Impact   │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ Dec 2025   42       42          65% (↗ +3 pts)      +$420K/month   │ |
| │ Jan 2026   38       80          72% (↗ +7 pts)      +$760K/month   │ |
| │ Feb 2026   26      106          80% (↗ +8 pts)  ✅  +$1.2M/month   │ |
| │                                                                     │ |
| │ Expected Outcome:                                                   │ |
| │ • Headcount: 1,125 → 1,231 (106 net adds)                          │ |
| │ • Utilization: 62% → 80% (target achieved)  ✅                      │ |
| │ • Revenue Increase: $1.2M/month = $14.4M annual                     │ |
| │ • ROI: 177% in first year                                           │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ RISK ASSESSMENT ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 🟡 Moderate Risk                                                    │ |
| │                                                                     │ |
| │ Risks:                                                              │ |
| │ • Hiring velocity: Need to hire 106 in 3 months (avg 35/month)     │ |
| │   Current capacity: ~25/month → need to scale recruiting ops       │ |
| │                                                                     │ |
| │ • Onboarding capacity: Large influx may strain training resources  │ |
| │   Mitigation: Stagger start dates, hire contract trainers          │ |
| │                                                                     │ |
| │ • Market demand: Betting on Q1 2026 market recovery                │ |
| │   Mitigation: Phased approach (42 in Dec, reassess in Jan)         │ |
| │                                                                     │ |
| │ Contingency Plan:                                                   │ |
| │ • If market doesn't recover: Pause after 42 hires, reassess Feb 1  │ |
| │ • Build bench gradually rather than aggressive hiring               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Adjust Plan] [Approve Plan] [Create Requisitions] [Export to PDF]     |
|                                                                         |
+-------------------------------------------------------------------------+
```

**User Action:** Review plan, click "Approve Plan"

**System Response:**
- Modal asks for confirmation
- Shows summary of approvals being granted
- Once confirmed, creates hiring requisitions
- Notifies HR and recruiting managers
- Updates budget allocation

**Time:** ~10 minutes (review and adjust plan)

---

### Step 5: Run "What-If" Scenarios

**User Action:** Click "Scenarios" tab to explore alternatives

**System Response:**
- Scenario modeling tool loads
- Pre-built scenarios available
- Can create custom scenarios
- Side-by-side comparison

**Screen State:**
```
+-------------------------------------------------------------------------+
| SCENARIO PLANNING                                                       |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ SELECT SCENARIO ──────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ [Current Plan ●] [Conservative ○] [Aggressive ○] [Custom ○]         │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ SCENARIO COMPARISON ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Metric              Current Plan  Conservative  Aggressive  Custom  │ |
| │ ─────────────────────────────────────────────────────────────────  │ |
| │ New Hires (3mo)     106          58            152          --      │ |
| │ Investment          $8.15M       $4.5M         $11.8M       --      │ |
| │ Final Headcount     1,231        1,183         1,277        --      │ |
| │ Utilization (3mo)   80%          72%           85%          --      │ |
| │ Revenue Lift        +$14.4M/yr   +$7.2M/yr     +$18.6M/yr   --      │ |
| │ ROI (1yr)           177%         160%           157%        --      │ |
| │ Risk Level          🟡 Moderate   🟢 Low         🔴 High      --      │ |
| │                                                                     │ |
| │ ┌─ CONSERVATIVE SCENARIO ─────────────────────────────────────┐    │ |
| │ │ Assumptions:                                                │    │ |
| │ │ • Market recovery uncertain - hire cautiously               │    │ |
| │ │ • Hire 58 (55% of recommended)                              │    │ |
| │ │ • Focus on critical roles only                              │    │ |
| │ │ • Slow ramp: Dec 20, Jan 22, Feb 16                         │    │ |
| │ │                                                             │    │ |
| │ │ Pros:                                                       │    │ |
| │ │ ✅ Lower financial risk                                     │    │ |
| │ │ ✅ Easier to onboard and train                              │    │ |
| │ │ ✅ Can accelerate if market improves                        │    │ |
| │ │                                                             │    │ |
| │ │ Cons:                                                       │    │ |
| │ │ ⚠️ Utilization only reaches 72% (below 80% target)          │    │ |
| │ │ ⚠️ Miss revenue opportunity if market recovers              │    │ |
| │ │ ⚠️ Team capacity constraints continue                       │    │ |
| │ └─────────────────────────────────────────────────────────────┘    │ |
| │                                                                     │ |
| │ ┌─ AGGRESSIVE SCENARIO ────────────────────────────────────────┐   │ |
| │ │ Assumptions:                                                │    │ |
| │ │ • Market will rebound strongly in Q1                        │    │ |
| │ │ • Hire 152 (143% of recommended)                            │    │ |
| │ │ • Build larger bench for future demand                      │    │ |
| │ │ • Fast ramp: Dec 55, Jan 52, Feb 45                         │    │ |
| │ │                                                             │    │ |
| │ │ Pros:                                                       │    │ |
| │ │ ✅ Capture maximum market share in recovery                 │    │ |
| │ │ ✅ Strong utilization: 85%                                  │    │ │ │ │ ✅ Competitive advantage - ready to scale                   │    │ │ │ │                                                             │    │ │ │ │ Cons:                                                       │    │ │ │ │ 🔴 Higher financial risk if market stays soft               │    │ │ │ │ 🔴 Onboarding capacity strain                               │    │ │ │ │ 🔴 Quality risk with rushed hiring                          │    │ │ │ │ 🔴 Burn rate increases significantly                        │    │ │ │ └─────────────────────────────────────────────────────────────┘    │ │ │                                                                     │ │ └─────────────────────────────────────────────────────────────────────┘ │ │                                                                         │ │ [Select Conservative] [Select Aggressive] [Create Custom Scenario]      │ │                                                                         │
+-------------------------------------------------------------------------+
```

**User Action:** Click "Create Custom Scenario" to build tailored plan

**System Response:**
- Custom scenario builder opens
- Sliders and inputs to adjust parameters
- Real-time impact calculation

**Screen State:**
```
+-------------------------------------------------------------------------+
| CREATE CUSTOM SCENARIO                                                  |
+-------------------------------------------------------------------------+
|                                                                         |
| Scenario Name: [Phased Approach - Market Responsive        ]           |
|                                                                         |
| ┌─ HIRING PARAMETERS ────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Total New Hires:        [████████░░] 85                             │ |
| │                         (Min: 0  ──────────────────  Max: 200)      │ |
| │                                                                     │ |
| │ Timeline:               [██████░░░░] 4 months                       │ |
| │                         (Min: 1 month  ─────────  Max: 12 months)   │ |
| │                                                                     │ |
| │ Budget Cap:             [███████░░░] $6.5M                          │ |
| │                         (Min: $0  ─────────────────  Max: $15M)     │ |
| │                                                                     │ |
| │ Hiring Distribution:                                                │ |
| │   Dec 2025:   [████░░░░░░] 25  (29%)                                │ |
| │   Jan 2026:   [█████░░░░░] 30  (35%)                                │ |
| │   Feb 2026:   [████░░░░░░] 20  (24%)                                │ |
| │   Mar 2026:   [██░░░░░░░░] 10  (12%)                                │ |
| │                                                                     │ |
| │ Regional Split:                                                     │ |
| │   🇺🇸 Americas:   [██████░░░░] 55% (47 hires)                       │ |
| │   🌏 APAC:        [████░░░░░░] 30% (26 hires)                       │ |
| │   🇪🇺 Europe:     [██░░░░░░░░] 10% (8 hires)                        │ |
| │   Other:         [█░░░░░░░░░] 5%  (4 hires)                         │ |
| │                                                                     │ |
| │ Role Mix:                                                           │ |
| │   Recruiters:           40  (47%)                                   │ |
| │   Bench Sales Reps:     20  (24%)                                   │ |
| │   TA Specialists:       12  (14%)                                   │ |
| │   Consultants (Bench):  10  (12%)                                   │ |
| │   Support/Other:        3   (3%)                                    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ PROJECTED OUTCOMES ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Final Headcount (April):    1,210                                   │ |
| │ Utilization (April):        76%  (vs 80% target)  🟡                │ |
| │ Annual Revenue Lift:        +$11.5M                                 │ |
| │ Payback Period:             7 months                                │ |
| │ 1-Year ROI:                 165%                                    │ |
| │ Risk Level:                 🟡 Moderate                             │ |
| │                                                                     │ |
| │ Monthly P&L Impact:                                                 │ |
| │   Dec 2025:   +$1.9M cost, +$260K revenue  = -$1.64M (investment)  │ |
| │   Jan 2026:   +$2.3M cost, +$580K revenue  = -$1.72M (investment)  │ |
| │   Feb 2026:   +$1.5M cost, +$920K revenue  = -$580K  (improving)   │ |
| │   Mar 2026:   +$760K cost, +$1.15M revenue = +$390K  (profitable!)  │ |
| │   Apr 2026:   (steady state) +$1.2M net profit/month                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ GATE CHECKS (Phased Approval) ────────────────────────────────────┐ |
| │                                                                     │ |
| │ ☑ Gate 1 (Dec 15): Approve first 25 hires                          │ |
| │   Condition: Market demand stable or improving                      │ |
| │                                                                     │ |
| │ ☐ Gate 2 (Jan 10): Approve next 30 hires                           │ |
| │   Condition: Dec utilization ≥ 65% AND pipeline ≥ $19M              │ |
| │                                                                     │ |
| │ ☐ Gate 3 (Feb 10): Approve next 20 hires                           │ |
| │   Condition: Jan utilization ≥ 72% AND revenue on track            │ |
| │                                                                     │ |
| │ ☐ Gate 4 (Mar 10): Approve final 10 hires                          │ |
| │   Condition: Feb utilization ≥ 75%                                  │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Save Scenario] [Run Simulation] [Compare to Other Scenarios] [Approve]|
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~15 minutes (build and analyze custom scenario)

---

### Step 6: Approve Final Workforce Plan

**User Action:** After reviewing scenarios, click "Approve" on chosen plan

**System Response:**
- Approval confirmation modal appears
- Shows final summary and commit actions
- Requests executive sign-off

**Screen State:**
```
+-------------------------------------------------------------------------+
| APPROVE WORKFORCE PLAN                                             [×]  |
+-------------------------------------------------------------------------+
|                                                                         |
| You are about to approve the following workforce plan:                  |
|                                                                         |
| Plan: "Phased Approach - Market Responsive"                             |
|                                                                         |
| Summary:                                                                |
| • Total New Hires: 85                                                   |
| • Investment: $6.5M                                                     |
| • Timeline: Dec 2025 - Mar 2026 (4 months)                              |
| • Expected Outcome: 76% utilization, +$11.5M revenue                    |
|                                                                         |
| This approval will trigger:                                             |
| ✓ Create 85 hiring requisitions in HRIS                                 |
| ✓ Allocate $6.5M from workforce budget                                  |
| ✓ Notify HR and recruiting managers                                     |
| ✓ Set up gate check milestones for phased approval                      |
| ✓ Update organizational capacity forecasts                              |
| ✓ Schedule monthly progress reviews                                     |
|                                                                         |
| Gate 1 (Dec 15) will auto-trigger unless you intervene.                 |
|                                                                         |
| Are you sure you want to approve this plan?                             |
|                                                                         |
| Comments (optional):                                                    |
| [Phased approach gives us flexibility to respond to market              |
| conditions while still addressing critical capacity gaps.         ]     |
|                                                                         |
|                                    [Cancel]  [Approve and Execute]      |
+-------------------------------------------------------------------------+
```

**User Action:** Click "Approve and Execute"

**System Response:**
- Plan approved and logged
- 85 hiring requisitions created in HRIS
- Budget allocated
- Notifications sent to:
  - CHRO (plan approved)
  - VP HR (begin recruiting)
  - Finance (budget allocated)
  - Department heads (headcount incoming)
- Calendar events created for gate check reviews
- Dashboard updated with new headcount targets
- Toast notification: "Workforce plan approved. 85 requisitions created."

**Time:** ~5 minutes

---

## Postconditions

1. ✅ Workforce plan approved and documented
2. ✅ Hiring requisitions created in system
3. ✅ Budget allocated and locked
4. ✅ Stakeholders notified (HR, Finance, Department Heads)
5. ✅ Gate check milestones scheduled
6. ✅ Capacity forecasts updated
7. ✅ Monthly review cadence established
8. ✅ Activity logged in audit trail

---

## Events Logged

| Event | Payload |
|-------|---------|
| `workforce.plan.created` | `{ plan_id, scenario_name, total_hires, budget, created_by, timestamp }` |
| `workforce.plan.approved` | `{ plan_id, approved_by, approval_date, comments }` |
| `hiring.requisitions.created` | `{ plan_id, requisition_ids[], count, total_budget }` |
| `budget.allocated` | `{ plan_id, amount, from_budget, to_department, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Budget Exceeded | Plan cost > available budget | "Plan exceeds available budget by $X" | Adjust plan or request budget increase |
| Invalid Scenario | Math calculation error | "Unable to calculate scenario outcomes" | Refresh page, retry |
| Approval Failed | Permission issue | "You don't have permission to approve" | Contact Admin |
| Requisition Creation Failed | HRIS API error | "Failed to create requisitions" | Retry, manual creation fallback |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+S` | Save scenario (without approving) |
| `Cmd+P` | Print/export plan to PDF |
| `Cmd+C` | Copy scenario for comparison |
| `Esc` | Close modal/cancel action |

---

## Alternative Flows

### A1: Emergency Hiring Freeze

If business downturn requires hiring freeze:

1. Navigate to approved workforce plan
2. Click "Freeze Plan"
3. Select freeze scope: All hires vs Partial
4. System pauses requisitions
5. Notifications sent to HR and recruiters
6. Gate checks disabled until unfreeze

### A2: Accelerate Hiring Due to Market Uptick

If market improves faster than expected:

1. Review current plan performance
2. Click "Accelerate Plan"
3. Adjust timeline (compress months)
4. Increase hiring targets
5. Re-approve adjusted plan
6. System updates requisitions and notifications

### A3: Skills-Based Hiring (Retraining Instead of Hiring)

For consultants with low-demand skills:

1. Identify bench consultants with low placement rates
2. Click "Retraining Program"
3. Select target skills (high-demand)
4. Estimate retraining cost vs new hire cost
5. Approve retraining budget
6. Academy creates training curriculum
7. Track skill acquisition and placement success

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Executive daily routine
- [02-executive-dashboard.md](./02-executive-dashboard.md) - Dashboard monitoring
- [04-strategic-client.md](./04-strategic-client.md) - Client relationship management
- [05-organization-config.md](./05-organization-config.md) - Org configuration

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-WFP-001 | Load workforce planning dashboard | All data loads within 2 seconds |
| TC-WFP-002 | Create custom scenario | Calculations update in real-time |
| TC-WFP-003 | Approve hiring plan | Requisitions created, budget allocated |
| TC-WFP-004 | Budget exceeded | Error shown, approval blocked |
| TC-WFP-005 | Compare 3 scenarios side-by-side | All metrics display correctly |
| TC-WFP-006 | Freeze approved plan | All requisitions paused |
| TC-WFP-007 | Export plan to PDF | PDF includes all details |

---

*Last Updated: 2025-11-30*
