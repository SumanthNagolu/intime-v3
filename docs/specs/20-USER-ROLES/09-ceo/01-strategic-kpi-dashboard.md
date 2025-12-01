# UC-CEO-006: Strategic KPI Dashboard & OKR Tracking

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** CEO (Chief Executive Officer)
**Status:** Active

---

## Table of Contents

1. [Overview](#1-overview)
2. [Actors](#2-actors)
3. [Preconditions](#3-preconditions)
4. [Trigger](#4-trigger)
5. [Main Flow](#5-main-flow)
6. [Alternative Flows](#6-alternative-flows)
7. [Exception Flows](#7-exception-flows)
8. [Postconditions](#8-postconditions)
9. [Business Rules](#9-business-rules)
10. [Screen Specifications](#10-screen-specifications)
11. [Field Specifications](#11-field-specifications)
12. [Integration Points](#12-integration-points)
13. [RACI Assignments](#13-raci-assignments)
14. [Metrics & Analytics](#14-metrics--analytics)
15. [Test Cases](#15-test-cases)
16. [Security](#16-security)
17. [Change Log](#17-change-log)

---

## 1. Overview

The Strategic KPI Dashboard provides the CEO with a comprehensive, high-level view of organizational performance against strategic objectives, OKRs (Objectives and Key Results), market positioning, and long-term growth metrics. This dashboard aggregates data from all business pillars (Recruiting, Bench Sales, TA, Academy, CRM, Finance) into executive-level insights focusing on 3-5 year strategic goals.

**Purpose:**
- Monitor strategic goal achievement and OKR progress
- Track market share and competitive positioning
- Evaluate revenue growth and valuation metrics
- Assess strategic initiative completion
- Prepare for board meetings and investor relations
- Identify strategic risks and opportunities

**Key Capabilities:**
- Real-time strategic KPI tracking
- OKR progress monitoring with drill-down
- Competitive intelligence integration
- Market trend analysis
- Strategic initiative portfolio management
- Board reporting metrics aggregation

---

## 2. Actors

- **Primary:** CEO (Chief Executive Officer)
- **Secondary:**
  - COO (provides operational metrics)
  - CFO (provides financial metrics)
  - VP-level leaders (provide pillar-specific metrics)
  - Data Analytics Team (maintains dashboards)
  - Board of Directors (consumers of board reports)
- **System:**
  - Analytics Engine (aggregates metrics)
  - OKR Tracking System
  - Market Intelligence Platform
  - Financial Reporting System
  - CRM/Revenue System

---

## 3. Preconditions

- CEO has valid authentication and executive-level permissions
- Strategic OKRs have been defined for current period (quarter/year)
- KPI targets have been established in system configuration
- Data pipelines from operational systems are functional
- Market intelligence feeds are active
- Historical baseline data exists for trend analysis
- Board meeting schedule is configured

---

## 4. Trigger

**Primary Triggers:**
- CEO logs into system (auto-redirect to Strategic Dashboard)
- CEO selects "Strategic Dashboard" from navigation
- Scheduled email digest (daily/weekly summary)
- Strategic alert notification (OKR at risk, market shift, etc.)
- Board meeting preparation workflow initiated
- Quarterly/Annual strategic review cycle begins

---

## 5. Main Flow

### Daily Strategic Review Workflow

**Step 1: Dashboard Access**
```
1.1 CEO logs into InTime OS
1.2 System automatically displays Strategic Dashboard
1.3 Dashboard loads with last 24-hour refresh timestamp
1.4 System highlights any critical strategic alerts
```

**Step 2: Strategic KPI Overview**
```
2.1 CEO reviews top-level strategic metrics:
    - Revenue Growth YoY
    - Market Share Position
    - OKR Progress (current quarter)
    - Valuation Metrics
    - Client NPS Score
    - Pipeline Health ($M and months coverage)

2.2 System displays each KPI with:
    - Current value
    - Target value
    - Variance (% to target)
    - Trend indicator (▲ up, ▼ down, ■ flat)
    - Status badge (✅ on-track, 🟡 at-risk, 🔴 critical)

2.3 CEO clicks on any KPI card for drill-down detail
```

**Step 3: OKR Progress Review**
```
3.1 CEO reviews OKR section showing:
    - Current quarter OKRs (typically 3-5 objectives)
    - Each objective with 3-4 key results
    - Progress bars (0-100%) for each key result
    - Overall objective health score
    - Owner assignment (VP-level leader)

3.2 System color-codes OKRs:
    - Green (70-100%): On track
    - Yellow (40-69%): At risk
    - Red (0-39%): Critical

3.3 CEO clicks on OKR to view:
    - Detailed progress narrative
    - Recent updates from owners
    - Blockers and dependencies
    - Mitigation plans for at-risk OKRs
```

**Step 4: Strategic Initiative Portfolio**
```
4.1 CEO reviews strategic initiatives:
    - Canada Expansion (status, % complete, timeline)
    - Academy Platform Launch (status, % complete, timeline)
    - AI Twin Rollout (status, % complete, timeline)
    - M&A Pipeline (status, % complete, timeline)

4.2 System displays for each initiative:
    - Progress bar with % complete
    - Status (On Track, At Risk, Delayed, Blocked)
    - Executive sponsor
    - Key milestones (past, current, upcoming)
    - Budget vs actual spend
    - ROI projection

4.3 CEO clicks on initiative for:
    - Detailed project plan
    - Resource allocation
    - Risk register
    - Decision log
    - Stakeholder updates
```

**Step 5: Competitive Intelligence**
```
5.1 CEO reviews competitive position:
    - Market share chart (InTime vs top 5 competitors)
    - Recent competitive moves (acquisitions, product launches, etc.)
    - Market trends (hiring trends, rate trends, skill demand)
    - Competitive win/loss analysis

5.2 System pulls data from:
    - Industry reports (uploaded by strategy team)
    - News feeds (automated scraping)
    - Sales win/loss records (from CRM)
    - Market research subscriptions

5.3 CEO can:
    - Add notes on competitive threats
    - Flag items for leadership discussion
    - Request deep-dive analysis from strategy team
```

**Step 6: Board Reporting Preview**
```
6.1 CEO reviews board reporting section:
    - Next board meeting date countdown
    - Board deck preparation status
    - Key topics for upcoming meeting
    - Outstanding action items from previous board meeting

6.2 System provides:
    - Pre-populated board metrics
    - Quarter-over-quarter comparisons
    - One-click export to board deck template
    - Historical board meeting archive
```

**Step 7: Strategic Alerts & Actions**
```
7.1 CEO reviews strategic alerts:
    - OKRs falling behind (< 50% progress at 60% of quarter)
    - Revenue targets at risk
    - Major client churn risk
    - Competitive threats (new entrant, pricing pressure)
    - Regulatory/compliance issues

7.2 For each alert, CEO can:
    - Assign to COO/CFO/VP for investigation
    - Schedule leadership discussion
    - Mark as acknowledged
    - Create action item with owner and due date

7.3 System tracks CEO actions:
    - Decisions made
    - Follow-ups assigned
    - Meeting scheduled
    - Board escalations flagged
```

---

## 6. Alternative Flows

### 6A: Deep-Dive into Specific KPI

```
6A.1 CEO clicks on "Revenue Growth YoY" KPI card
6A.2 System displays drill-down view:
     - Revenue by pillar (Recruiting, Bench, TA, Academy)
     - Revenue by region (US, Canada, future regions)
     - Revenue by client segment (Enterprise, Mid-Market, SMB)
     - Month-over-month trend chart
     - Cohort analysis (new vs existing clients)

6A.3 CEO can further drill down into:
     - Specific pillar performance
     - Top 10 revenue-generating accounts
     - Largest revenue drops (client churn)
     - Pipeline conversion trends

6A.4 CEO can export data or schedule recurring report
```

### 6B: OKR Check-In Meeting Preparation

```
6B.1 CEO clicks [Prepare OKR Check-In]
6B.2 System generates OKR review meeting agenda:
     - List of all OKRs with current status
     - At-risk OKRs highlighted for discussion
     - Owner attendance list
     - Pre-meeting questions generated

6B.3 System sends calendar invite to all OKR owners
6B.4 System prompts owners to submit pre-meeting updates
6B.5 CEO reviews updates before meeting
6B.6 During meeting, CEO can update OKR status real-time
```

### 6C: Competitive Intelligence Deep-Dive

```
6C.1 CEO clicks on competitor (e.g., "Acme Staffing")
6C.2 System displays competitive profile:
     - Revenue estimate
     - Market share
     - Geographical footprint
     - Service offerings
     - Pricing strategy (where known)
     - Recent news and announcements
     - Win/loss record against InTime

6C.3 CEO can:
     - Add strategic notes
     - Flag for SWOT analysis
     - Request sales team to focus on competitive wins
     - Update competitive positioning strategy
```

### 6D: Strategic Scenario Planning

```
6D.1 CEO clicks [Scenario Planning Tool]
6D.2 System presents scenario builder:
     - Base case (current trajectory)
     - Upside case (aggressive growth)
     - Downside case (market contraction)

6D.3 CEO can adjust variables:
     - Revenue growth rate
     - Margin assumptions
     - Market share gains
     - New market entry timing

6D.4 System recalculates:
     - Projected revenue
     - Headcount requirements
     - Cash flow impact
     - Funding needs

6D.5 CEO can save scenarios for board presentation
```

---

## 7. Exception Flows

### 7E: Missing OKR Data

```
7E.1 System detects OKR with no progress update in 14+ days
7E.2 System displays warning: "OKR stale - no recent update"
7E.3 CEO clicks [Request Update]
7E.4 System sends reminder to OKR owner
7E.5 If no response in 48 hours, escalates to COO
```

### 7F: Data Pipeline Failure

```
7F.1 System detects missing data feed (e.g., financial data)
7F.2 Dashboard displays: "Data refresh delayed - last updated [timestamp]"
7F.3 CEO clicks [View Details]
7F.4 System shows which data sources are down
7F.5 CEO can:
     - Contact Data/IT team
     - View last known good data
     - Schedule manual refresh
```

### 7G: Strategic Alert Overload

```
7G.1 CEO opens dashboard and sees 25+ strategic alerts
7G.2 CEO clicks [Manage Alerts]
7G.3 System displays alert management:
     - Filter by severity (Critical, High, Medium, Low)
     - Group by category (OKRs, Revenue, Competition, Operations)
     - Dismiss irrelevant alerts
     - Adjust alert thresholds

7G.4 CEO sets alert preferences:
     - Only Critical and High alerts on dashboard
     - Medium/Low alerts sent to weekly digest email
```

### 7H: Board Metrics Discrepancy

```
7H.1 CEO reviews board metrics and notices revenue mismatch
7H.2 CEO clicks [Verify Data]
7H.3 System shows data lineage:
     - Source system (e.g., Financial ERP)
     - Transformation logic
     - Last sync timestamp

7H.4 CEO clicks [Contact CFO]
7H.5 System creates ticket for CFO to investigate
7H.6 CFO responds with explanation or correction
7H.7 System updates dashboard with corrected data
```

---

## 8. Postconditions

**Success:**
- CEO has complete view of strategic performance
- OKR progress is current and accurate
- Strategic alerts are acknowledged and actioned
- Board reporting data is verified and ready
- Competitive intelligence is up-to-date
- CEO action items are logged and tracked

**Failure:**
- Data refresh issues are logged and escalated
- Missing OKR updates are flagged for follow-up
- Alert thresholds are adjusted to reduce noise

---

## 9. Business Rules

### BR-CEO-001: OKR Scoring

```
OKR Key Result Scoring:
- 0-30%: Red (Critical - intervention required)
- 31-69%: Yellow (At Risk - close monitoring)
- 70-100%: Green (On Track)

Objective Health Score:
- Average of all Key Result scores for that objective
- If any Key Result is Red, overall objective cannot be Green
```

### BR-CEO-002: Market Share Calculation

```
Market Share = InTime Revenue / Total Addressable Market (TAM) Revenue

TAM Sources:
- Industry reports (Staffing Industry Analysts, Bullhorn, etc.)
- Updated quarterly
- Segmented by geography and vertical
```

### BR-CEO-003: Strategic Alert Thresholds

```
Revenue Growth Alert:
- Trigger: Actual < 80% of target for 2 consecutive months

OKR Alert:
- Trigger: Progress < 50% when > 60% through time period

Client NPS Alert:
- Trigger: NPS drops below 65 (from target of 70)

Pipeline Alert:
- Trigger: Pipeline value < 2x monthly revenue run rate
```

### BR-CEO-004: Board Reporting Metrics

```
Standard Board Metrics (Monthly):
1. Revenue (actual vs budget, YoY growth)
2. Gross Margin %
3. EBITDA / Net Income
4. Cash Balance & Runway
5. Client Count (new, churned, net)
6. Headcount (by role)
7. Key Wins (top 3 new clients or placements)
8. Strategic Initiative Progress
9. OKR Status
10. Market Share Update (quarterly)
```

### BR-CEO-005: Data Refresh SLA

```
Strategic KPIs:
- Financial data: Daily (by 9 AM)
- Operational data: Hourly
- OKR progress: Real-time (owner updates)
- Market intelligence: Weekly
- Competitive data: As available

Dashboard should never show data > 24 hours old without warning
```

### BR-CEO-006: Strategic Initiative Status

```
Initiative Status Rules:
- On Track: ≥90% milestones on schedule, budget variance < 10%
- At Risk: 70-89% milestones on schedule, budget variance 10-20%
- Delayed: 50-69% milestones on schedule, budget variance 20-30%
- Critical: <50% milestones on schedule or budget variance >30%
```

---

## 10. Screen Specifications

### Screen: SCR-CEO-001 - Strategic Dashboard

**Route:** `/employee/executive/ceo/dashboard`
**Access:** CEO only
**Layout:** Executive Dashboard (Full-width, minimal chrome)

#### Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│ INTIME OS                                          [Search] [Alerts] [👤]  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Strategic Dashboard                           Last Updated: 15 min ago     │
│                                                                             │
│ ┌─ STRATEGIC KPIs ──────────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│ │ │💰 Revenue   │  │📊 Market    │  │🎯 OKR       │  │📈 Valuation │  │  │
│ │ │   Growth    │  │   Share     │  │   Progress  │  │             │  │  │
│ │ │             │  │             │  │             │  │             │  │  │
│ │ │  +28.5%     │  │   #2 in US  │  │    87%      │  │   $125M     │  │  │
│ │ │  vs 25% ✅  │  │   vs #1 🟡  │  │   vs 80% ✅ │  │   +32% ✅   │  │  │
│ │ │             │  │             │  │             │  │             │  │  │
│ │ │ [Details]   │  │ [Details]   │  │ [Details]   │  │ [Details]   │  │  │
│ │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│ │                                                                        │  │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│ │ │🏆 Client NPS│  │💼 Pipeline  │  │👥 Headcount │  │💵 Cash Flow │  │  │
│ │ │             │  │   Health    │  │   Growth    │  │             │  │  │
│ │ │    72       │  │   $45M      │  │   +15%      │  │  +$685K/mo  │  │  │
│ │ │  vs 70 ✅   │  │   3.2x 🟢   │  │   vs +12% ✅│  │   Positive ✅│  │  │
│ │ │             │  │             │  │             │  │             │  │  │
│ │ │ [Details]   │  │ [Details]   │  │ [Details]   │  │ [Details]   │  │  │
│ │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ OKR PROGRESS (Q4 2025) ──────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ Objective 1: Expand to 3 new markets                                  │  │
│ │ Owner: COO  Status: ✅ On Track (82%)                                 │  │
│ │ ├─ KR1: Launch Canada operations         ████████░░ 85% ✅           │  │
│ │ ├─ KR2: Sign 10+ Canadian clients         ██████░░░░ 70% ✅           │  │
│ │ ├─ KR3: Hire 5 Canadian recruiters        ████████░░ 80% ✅           │  │
│ │ └─ KR4: Achieve $1M CAD revenue           ████████░░ 85% ✅           │  │
│ │                                                         [View Details] │  │
│ │                                                                        │  │
│ │ Objective 2: Launch Academy Platform                                  │  │
│ │ Owner: VP Product  Status: ✅ Complete (100%)                         │  │
│ │ ├─ KR1: Build MVP platform                ██████████ 100% ✅          │  │
│ │ ├─ KR2: Enroll 100 students               ██████████ 100% ✅          │  │
│ │ ├─ KR3: 50% completion rate               ██████████ 100% ✅          │  │
│ │ └─ KR4: 80% placement rate                ██████████ 100% ✅          │  │
│ │                                                         [View Details] │  │
│ │                                                                        │  │
│ │ Objective 3: Scale AI Twin to 50% adoption                            │  │
│ │ Owner: CTO  Status: 🟡 At Risk (65%)                                  │  │
│ │ ├─ KR1: Deploy AI Twin to all recruiters  ████████░░ 85% ✅           │  │
│ │ ├─ KR2: Achieve 50% daily active usage    ████░░░░░░ 45% 🔴          │  │
│ │ ├─ KR3: 20% efficiency improvement        ██████░░░░ 65% 🟡           │  │
│ │ └─ KR4: 90% user satisfaction             ██████░░░░ 65% 🟡           │  │
│ │                                                         [View Details] │  │
│ │                                            [Add OKR] [Edit] [Export]  │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ STRATEGIC INITIATIVES ───────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ Initiative                Status      Progress    Budget    Timeline  │  │
│ │ ─────────────────────────────────────────────────────────────────────  │  │
│ │ 1. Canada Expansion       ✅ On Track  ████████░░  $450K/   Dec 2025  │  │
│ │    Sponsor: COO                        85%         $500K              │  │
│ │    Last Update: 3 days ago                                  [View]    │  │
│ │                                                                        │  │
│ │ 2. Academy Platform       ✅ Complete  ██████████  $285K/   Nov 2025  │  │
│ │    Sponsor: VP Product                 100%        $300K              │  │
│ │    Launched Nov 15, 2025                                    [View]    │  │
│ │                                                                        │  │
│ │ 3. AI Twin Rollout        🟡 At Risk   ██████░░░░  $175K/   Jan 2026  │  │
│ │    Sponsor: CTO                        65%         $200K              │  │
│ │    Blocker: Low adoption rate                               [View]    │  │
│ │                                                                        │  │
│ │ 4. M&A Pipeline           🔴 Delayed   ████░░░░░░  $50K/    Mar 2026  │  │
│ │    Sponsor: CEO                        45%         $150K              │  │
│ │    Issue: Target valuations too high                        [View]    │  │
│ │                                                                        │  │
│ │                                        [Add Initiative] [Export]      │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ COMPETITIVE INTELLIGENCE ────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ Market Position: #2 in US Staffing (IT/Tech Vertical)                 │  │
│ │                                                                        │  │
│ │ ┌─ Market Share Chart ─────────────────────────────────────────────┐  │  │
│ │ │                                                                   │  │  │
│ │ │ 1. Acme Staffing        ██████████████████████ 35% ($500M)       │  │  │
│ │ │ 2. InTime (Us)          ████████████ 17% ($85M) ← You are here   │  │  │
│ │ │ 3. TalentSource         ██████████ 15% ($72M)                    │  │  │
│ │ │ 4. GlobalHire           ████████ 12% ($58M)                      │  │  │
│ │ │ 5. TechStaff            ██████ 9% ($42M)                         │  │  │
│ │ │ 6. Others               ████████ 12% ($180M)                     │  │  │
│ │ │                                                                   │  │  │
│ │ └───────────────────────────────────────────────────────────────────┘  │  │
│ │                                                                        │  │
│ │ Recent Competitive Moves (Last 30 Days):                              │  │
│ │ • Nov 10 - Acme acquired TechStaff for $50M (consolidation play)      │  │
│ │ • Nov 18 - GlobalHire launched AI matching (feature parity concern)   │  │
│ │ • Nov 25 - TalentSource announced APAC expansion (geographic threat)  │  │
│ │                                                                        │  │
│ │ Win/Loss vs Competitors (Last Quarter):                               │  │
│ │ vs Acme:        12 wins / 8 losses  (60% win rate) 🟡                 │  │
│ │ vs TalentSource: 15 wins / 5 losses (75% win rate) ✅                 │  │
│ │ vs GlobalHire:   9 wins / 11 losses (45% win rate) 🔴                 │  │
│ │                                                                        │  │
│ │                                        [Full Report] [Add Intel]      │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ BOARD REPORTING ─────────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ Next Board Meeting: December 15, 2025 (14 days away)                  │  │
│ │                                                                        │  │
│ │ Agenda:                                                   Prep Status: │  │
│ │ ● Q4 2025 Performance Review                             ✅ Ready     │  │
│ │ ● 2026 Strategic Plan & Budget Approval                  🟡 In Prog   │  │
│ │ ● Canada Expansion Update                                ✅ Ready     │  │
│ │ ● M&A Strategy Discussion                                ⚪ Not Start │  │
│ │                                                                        │  │
│ │ Board Deck Status: 65% Complete                                       │  │
│ │ ├─ Financial Summary           ✅ Complete                            │  │
│ │ ├─ Operational Metrics         ✅ Complete                            │  │
│ │ ├─ Strategic Initiatives       🟡 In Progress                         │  │
│ │ └─ 2026 Plan                   ⚪ Not Started                         │  │
│ │                                                                        │  │
│ │ Outstanding Action Items from Previous Board (Sept 2025):             │  │
│ │ • Complete competitive analysis - DONE ✅                             │  │
│ │ • Finalize Canada entity setup - DONE ✅                              │  │
│ │ • Evaluate M&A targets - IN PROGRESS 🟡                               │  │
│ │                                                                        │  │
│ │                    [View Board Deck] [Export Metrics] [Archive]       │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ STRATEGIC ALERTS (5) ────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │ 🟡 AI Twin adoption below target (45% vs 50% goal)                    │  │
│ │    Action: Schedule review with CTO                      [Assign]     │  │
│ │                                                                        │  │
│ │ 🟡 M&A initiative delayed (45% vs 70% expected)                       │  │
│ │    Reason: High valuations, economic uncertainty         [Review]     │  │
│ │                                                                        │  │
│ │ 🟡 Win rate vs GlobalHire declining (45%, was 55%)                    │  │
│ │    Action: Sales team competitive training needed        [Escalate]   │  │
│ │                                                                        │  │
│ │ ✅ Canada expansion ahead of schedule                                 │  │
│ │    Note: Consider accelerating timeline                  [View]       │  │
│ │                                                                        │  │
│ │ ✅ Academy platform exceeding enrollment targets                      │  │
│ │    Note: Explore additional cohorts for Q1               [View]       │  │
│ │                                                                        │  │
│ │                                        [Manage Alerts] [View All]     │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Components Used
- `CMP-KPICard` - Strategic metric display with trend
- `CMP-OKRProgress` - OKR tree with progress bars
- `CMP-InitiativeCard` - Strategic initiative status
- `CMP-CompetitiveChart` - Market share visualization
- `CMP-BoardReportingSummary` - Board meeting preparation
- `CMP-StrategicAlerts` - Alert feed with actions

#### State Management

| State | Type | Default | Description |
|-------|------|---------|-------------|
| dashboardData | StrategicDashboard | null | All dashboard metrics |
| selectedOKR | OKR | null | Currently expanded OKR |
| selectedInitiative | Initiative | null | Currently viewed initiative |
| alertFilter | AlertFilter | 'all' | Alert severity filter |
| refreshInterval | number | 900000 | Auto-refresh (15 min) |

---

## 11. Field Specifications

### Strategic KPI Fields

| Field | Type | Source | Calculation | Refresh |
|-------|------|--------|-------------|---------|
| revenueGrowthYoY | percentage | Financial System | (Current Revenue - Prior Year Revenue) / Prior Year Revenue | Daily |
| marketShare | percentage | Industry Reports + Internal | InTime Revenue / TAM | Quarterly |
| okrProgress | percentage | OKR System | Average of all Key Result scores | Real-time |
| valuation | currency | Finance/Board | Last board-approved valuation | Quarterly |
| clientNPS | number | CRM System | Net Promoter Score calculation | Monthly |
| pipelineValue | currency | CRM System | Sum of weighted pipeline deals | Daily |
| headcountGrowth | percentage | HR System | (Current HC - Prior HC) / Prior HC | Monthly |
| cashFlowMonthly | currency | Financial System | Cash in - Cash out (30-day) | Daily |

### OKR Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| objectiveTitle | string | Yes | max:200 | Clear, measurable objective |
| objectiveOwner | user | Yes | VP-level+ | Executive sponsor |
| timePeriod | enum | Yes | Q1-Q4, Annual | When OKR is measured |
| keyResults | array | Yes | 3-4 items | Measurable outcomes |
| keyResultTitle | string | Yes | max:200 | Specific, measurable |
| keyResultTarget | number | Yes | > 0 | Numeric target |
| keyResultCurrent | number | Yes | >= 0 | Current progress |
| keyResultUnit | string | Yes | $, %, #, etc. | Unit of measurement |
| keyResultStatus | enum | Computed | Red/Yellow/Green | Based on % complete |
| lastUpdate | datetime | Auto | - | Last progress update |
| blockers | text | No | - | Current obstacles |
| mitigationPlan | text | Conditional | Required if Yellow/Red | How to get back on track |

### Strategic Initiative Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| initiativeName | string | Yes | max:200 | Project name |
| sponsor | user | Yes | C-level | Executive sponsor |
| status | enum | Yes | On Track, At Risk, Delayed, Critical | Overall health |
| progressPercentage | number | Yes | 0-100 | % complete |
| budgetAllocated | currency | Yes | > 0 | Total budget |
| budgetSpent | currency | Yes | >= 0 | Amount spent to date |
| targetCompletionDate | date | Yes | Future | Expected completion |
| milestones | array | Yes | min:3 | Key project phases |
| dependencies | array | No | - | Other initiatives this depends on |
| riskRegister | array | No | - | Identified risks |
| roiProjection | currency | No | - | Expected return |

---

## 12. Integration Points

### Financial System (ERP)

**Purpose:** Pull revenue, profitability, cash flow data

**Endpoint:** `GET /api/financial/strategic-metrics`

**Data Mapping:**
```typescript
{
  revenue: {
    current: number,
    priorYear: number,
    growth: number,
    byPillar: { recruiting: number, bench: number, ta: number, academy: number },
    byRegion: { us: number, canada: number }
  },
  profitability: {
    grossMargin: number,
    ebitda: number,
    netIncome: number
  },
  cashFlow: {
    monthly: number,
    runway: number // months
  }
}
```

**Frequency:** Daily at 6 AM

---

### OKR Tracking System

**Purpose:** Real-time OKR progress updates

**Endpoint:** `GET /api/okr/current-period`

**Data Mapping:**
```typescript
{
  objectives: [
    {
      id: string,
      title: string,
      owner: string,
      period: 'Q4-2025',
      keyResults: [
        {
          id: string,
          title: string,
          target: number,
          current: number,
          unit: string,
          status: 'green' | 'yellow' | 'red'
        }
      ],
      overallProgress: number,
      lastUpdate: datetime
    }
  ]
}
```

**Frequency:** Real-time (WebSocket subscription)

---

### Market Intelligence Platform

**Purpose:** Competitive data and market trends

**Endpoint:** `GET /api/market-intel/competitive-landscape`

**Data Mapping:**
```typescript
{
  marketShare: {
    intime: { revenue: number, percentage: number },
    competitors: [
      { name: string, revenue: number, percentage: number }
    ],
    totalMarket: number
  },
  recentNews: [
    { date: date, competitor: string, headline: string, impact: string }
  ],
  winLoss: {
    vsCompetitor: { wins: number, losses: number, winRate: number }
  }
}
```

**Frequency:** Weekly refresh

---

### Board Reporting System

**Purpose:** Generate board deck metrics

**Endpoint:** `GET /api/board/meeting-prep/{meetingId}`

**Data Mapping:**
```typescript
{
  meetingDate: date,
  agendaItems: [
    { topic: string, prepStatus: 'ready' | 'in-progress' | 'not-started' }
  ],
  boardDeck: {
    slides: [
      { section: string, status: string, lastUpdate: datetime }
    ],
    overallProgress: number
  },
  actionItems: [
    { item: string, owner: string, dueDate: date, status: string }
  ]
}
```

**Frequency:** On-demand (when board meeting approaching)

---

## 13. RACI Assignments

### OKR Management

| Activity | CEO | COO | CFO | VP-Level | Manager |
|----------|-----|-----|-----|----------|---------|
| Define Annual OKRs | A | R | C | C | I |
| Set Quarterly OKRs | A | R | C | C | I |
| Update KR Progress | I | I | I | R | R |
| Review OKR Status | R | C | C | A | I |
| Approve OKR Changes | A | C | C | R | I |

### Strategic Initiative Management

| Activity | CEO | COO | CFO | Initiative Owner | Board |
|----------|-----|-----|-----|------------------|-------|
| Propose Initiative | R/A | C | C | R | I |
| Approve Budget | A | C | R | C | A |
| Track Progress | I | I | I | R | I |
| Escalate Issues | I | C | C | R | I |
| Approve Closure | A | C | C | R | I |

### Board Reporting

| Activity | CEO | COO | CFO | Board Admin | Board |
|----------|-----|-----|-----|-------------|-------|
| Prepare Board Deck | A | C | C | R | - |
| Review Metrics | R | C | C | A | - |
| Present to Board | R | I | I | - | A |
| Respond to Questions | R | C | C | - | - |

---

## 14. Metrics & Analytics

### Dashboard Usage Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| CEO Login Frequency | Daily | % of weekdays with login |
| Time Spent on Dashboard | 15-30 min/day | Average session duration |
| OKR Update Frequency | Weekly | % of OKRs updated weekly |
| Board Deck Preparation Time | < 4 hours | Time to generate deck |
| Alert Response Time | < 24 hours | Time from alert to action |

### OKR Effectiveness Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| OKR Achievement Rate | 70-80% | % of KRs achieving target |
| OKR Update Timeliness | 100% | % of OKRs updated on schedule |
| Strategic Alignment | 90% | % of OKRs tied to strategy |
| Cross-Functional OKRs | 50%+ | % requiring multi-team collaboration |

### Strategic Initiative Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| On-Time Delivery | 80% | % of initiatives completed on time |
| Budget Adherence | ±10% | % within budget variance |
| ROI Achievement | 100% | % achieving projected ROI |
| Post-Launch Success | 90% | % achieving goals post-launch |

---

## 15. Test Cases

### TC-CEO-001: View Strategic Dashboard

**Priority:** Critical
**Type:** E2E
**Automated:** Yes

#### Preconditions
- CEO user is logged in
- Sample strategic data exists in system
- OKRs are defined for current quarter

#### Test Data
| Variable | Value | Notes |
|----------|-------|-------|
| user | ceo@intime.com | Test CEO account |
| period | Q4-2025 | Current quarter |
| okrCount | 3 | Sample objectives |

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Login as CEO | Dashboard loads automatically | |
| 2 | Verify KPI cards display | 8 KPI cards visible with data | |
| 3 | Check OKR section | 3 objectives with progress bars | |
| 4 | Review strategic initiatives | 4 initiatives with status | |
| 5 | Verify competitive intel | Market share chart displays | |
| 6 | Check board reporting section | Next meeting date shown | |
| 7 | Review strategic alerts | 5 alerts displayed | |

#### Postconditions
- Dashboard fully loaded
- All sections display correctly
- No console errors

---

### TC-CEO-002: Drill Down into Revenue KPI

**Priority:** High
**Type:** Integration
**Automated:** Partial

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Click on "Revenue Growth" KPI card | Drill-down modal opens | |
| 2 | Verify revenue by pillar chart | 4 pillars shown with values | |
| 3 | Verify revenue by region | US and Canada regions shown | |
| 4 | Check month-over-month trend | 12-month trend chart displays | |
| 5 | Click on specific pillar | Further drill-down available | |
| 6 | Export data | CSV file downloads | |
| 7 | Close drill-down | Returns to dashboard | |

---

### TC-CEO-003: Update OKR Progress

**Priority:** Critical
**Type:** E2E
**Automated:** Yes

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Click on OKR "Expand to 3 new markets" | OKR detail view opens | |
| 2 | Click [Edit Progress] on Key Result 2 | Edit modal opens | |
| 3 | Update current value from 7 to 8 | Value updates | |
| 4 | Add update note "Signed 1 new client" | Note saved | |
| 5 | Click [Save] | Progress bar updates to 80% | |
| 6 | Verify status remains Green | Status is Green (>70%) | |
| 7 | Check last update timestamp | Shows current time | |

---

### TC-CEO-004: Manage Strategic Alerts

**Priority:** High
**Type:** Functional
**Automated:** Partial

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Navigate to Strategic Alerts section | 5 alerts displayed | |
| 2 | Click [Manage Alerts] | Alert management modal opens | |
| 3 | Filter by severity: Critical | 0 critical alerts (all Med/Low) | |
| 4 | Click on "AI Twin adoption" alert | Alert detail opens | |
| 5 | Click [Assign to CTO] | Assignment modal opens | |
| 6 | Add note and set due date | Task created for CTO | |
| 7 | Verify alert marked as "Actioned" | Status updates | |

---

### TC-CEO-005: Board Reporting Preparation

**Priority:** Critical
**Type:** E2E
**Automated:** No (involves document generation)

#### Steps
| # | Action | Expected Result | Status |
|---|--------|-----------------|--------|
| 1 | Click on "Board Reporting" section | Section expands | |
| 2 | Click [View Board Deck] | Deck preview opens | |
| 3 | Verify all required slides present | 15 standard slides shown | |
| 4 | Click on "Financial Summary" slide | Slide detail with charts | |
| 5 | Click [Export to PowerPoint] | PPTX file downloads | |
| 6 | Open downloaded file | All data populated correctly | |
| 7 | Verify charts render correctly | Charts display properly | |

---

## 16. Security

### Data Access Controls

```
CEO Strategic Dashboard:
- Role: CEO only (no delegation)
- Data Scope: Organization-wide (all entities, all time periods)
- Financial Data: Full access (revenue, margin, costs)
- Competitive Data: Full access (all intel)
- Employee Data: Aggregated only (no PII except executives)
```

### Audit Trail

```
Log all CEO actions:
- Dashboard views (timestamp)
- OKR updates (before/after values)
- Strategic alerts assigned (to whom, when)
- Board deck exports (timestamp, recipient if shared)
- Drill-down queries (what data accessed)
```

### Data Sensitivity

```
Strategic Dashboard contains:
- Level 1 (Public): Market trends, industry reports
- Level 2 (Internal): Revenue, headcount, operational metrics
- Level 3 (Confidential): Competitive intel, M&A plans, board discussions
- Level 4 (Highly Confidential): Valuation, financial projections, strategic plans

Access: CEO only
Sharing: Requires explicit approval for each recipient
Retention: 7 years (board governance requirement)
```

---

## 17. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Product Team | Initial comprehensive specification |

---

**End of UC-CEO-006: Strategic KPI Dashboard**

*This document provides complete specification for CEO Strategic Dashboard functionality, including OKR tracking, strategic initiative management, competitive intelligence, and board reporting preparation.*
