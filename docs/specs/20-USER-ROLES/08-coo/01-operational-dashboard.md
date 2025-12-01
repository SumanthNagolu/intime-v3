# UC-COO-010: COO Operational Dashboard - Real-Time Operations Monitoring

**Version:** 1.0
**Last Updated:** 2025-11-30
**Role:** COO (Chief Operating Officer)
**Status:** Active

---

## 1. Overview

The COO Operational Dashboard provides real-time visibility into all operational activities across Recruiting, Bench Sales, TA, and Academy pillars. This dashboard aggregates live data streams, highlights anomalies, tracks SLA compliance, and enables the COO to intervene proactively when operations deviate from targets.

**Purpose:**
- Real-time operational monitoring (30-second refresh)
- SLA tracking and breach detection
- Pod/pillar performance heatmaps
- Process bottleneck identification
- Escalation management
- Team productivity tracking

**Key Capabilities:**
- Live activity feed (INFORMED notifications)
- Drill-down from high-level metrics to individual transactions
- Predictive alerts for at-risk items
- One-click escalation and reassignment
- Customizable dashboard widgets

---

## 2. Main Dashboard Layout

### Screen: SCR-COO-010 - Operational Dashboard

**Route:** `/employee/executive/coo/dashboard`
**Access:** COO only
**Refresh:** Auto-refresh every 30 seconds

```
┌────────────────────────────────────────────────────────────────────────────┐
│ INTIME OS - COO OPERATIONS DASHBOARD          Last refresh: 15s ago  [⟳]  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─ REAL-TIME OPERATIONAL METRICS ─────────────────────────────────────┐   │
│ │                                                                      │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│ │ │⚡ Efficiency│ │📊 Utilization│ │🎯 Placements│ │⏱️ Avg TTF │ │❗ Escalations││
│ │ │           │  │          │  │   /Day   │  │          │  │        │ │   │
│ │ │   87%     │  │   82%    │  │   8.5    │  │  28 days │  │   3    │ │   │
│ │ │  vs 85% ✅│  │  vs 85% 🟡│ │  vs 8 ✅ │  │  vs 30✅ │  │  vs 0🔴│ │   │
│ │ │  ▲ +2%    │  │  ▼ -3%   │  │  ▲ +0.5 │  │  ▲ -2d   │  │  ▲ +3  │ │   │
│ │ │ [Drill Down] │ [Drill Down]│[Drill Down]│[Drill Down]│[View All]│  │   │
│ │ └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│ │                                                                      │   │
│ │ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│ │ │🔄 SLA    │  │💰 Revenue │  │😊 NPS    │  │📈 Pipeline│            │   │
│ │ │ Compliance│  │   MTD    │  │          │  │  Health  │            │   │
│ │ │   96%     │  │  $2.85M  │  │    72    │  │   $45M   │            │   │
│ │ │  vs 95% ✅│  │  vs $3M🟡│  │  vs 70 ✅│  │   3.2x ✅ │            │   │
│ │ │ [Details] │  │ [Details]│  │ [Details]│  │ [Details]│            │   │
│ │ └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ SLA TRACKING & AT-RISK ITEMS ──────────────────────────────────────┐   │
│ │                                                                      │   │
│ │ 🟢 On Track: 245 items      🟡 At Risk: 18 items (< 24h to breach)  │   │
│ │ 🔴 Breached: 3 items        ⏰ Due Today: 12 items                  │   │
│ │                                                                      │   │
│ │ Critical Breaches (Immediate Action Required):                      │   │
│ │                                                                      │   │
│ │ 🔴 Job#4523 - Google - No submittals for 7 days                     │   │
│ │    SLA: First submittal within 5 days | Breached: 2 days ago       │   │
│ │    Owner: Sarah Chen (Tech Recruiter, Pod Alpha)                    │   │
│ │    [View Job] [Escalate to Pod Manager] [Reassign] [Add Resources] │   │
│ │                                                                      │   │
│ │ 🔴 Placement#8821 - Meta - Candidate no-show on Day 1               │   │
│ │    SLA: Placement retention > 90 days | Failed: Day 1               │   │
│ │    Recruiter: Mike Torres | Client: Meta                            │   │
│ │    [Contact Recruiter] [Client Follow-up] [Find Replacement]        │   │
│ │                                                                      │   │
│ │ 🔴 Invoice#3345 - Acme Corp - Dispute $15K                          │   │
│ │    SLA: Resolve disputes within 3 days | Breached: 1 day overdue   │   │
│ │    Issue: Rate discrepancy | Assigned: Finance Team                │   │
│ │    [View Invoice] [Contact CFO] [Escalate to CEO]                  │   │
│ │                                                                      │   │
│ │ At-Risk Items (< 24 hours to breach):                               │   │
│ │ 🟡 Job#4524 - Amazon - 4 days, no submittals (SLA: 5 days)         │   │
│ │ 🟡 Candidate#8822 - Jane Doe - Submittal pending 3 days (SLA: 3d)  │   │
│ │ ... (16 more)                                     [View All At-Risk]│   │
│ │                                                                      │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ POD PERFORMANCE HEATMAP ────────────────────────────────────────────┐   │
│ │                                                                      │   │
│ │ Pod        Efficiency   Quality    Pipeline   Placements   Status   │   │
│ │ ────────────────────────────────────────────────────────────────────  │   │
│ │ Alpha      ████████░░   ████████░░ ████████░░   12        ✅ Excellent││
│ │            88%          92% NPS    $1.2M       MTD                  │   │
│ │            [Drill Down] [View Team] [Pod Dashboard]                 │   │
│ │                                                                      │   │
│ │ Beta       ██████░░░░   ████████░░ ████░░░░░░   8         🟡 Needs Help││
│ │            72%          90% NPS    $600K       MTD                  │   │
│ │            Issue: Low utilization, 3 recruiters on bench            │   │
│ │            [Coach Manager] [Rebalance Work] [Pod Dashboard]         │   │
│ │                                                                      │   │
│ │ Gamma      ████████░░   ██████░░░░ ████████░░   10        ✅ Good  │   │
│ │            85%          82% NPS    $950K       MTD                  │   │
│ │            Note: Quality dip, client feedback needed                │   │
│ │            [Review Feedback] [Coach Team] [Pod Dashboard]           │   │
│ │                                                                      │   │
│ │ Delta      ████░░░░░░   ████░░░░░░ ██████░░░░   5         🔴 Critical││
│ │            65%          75% NPS    $400K       MTD                  │   │
│ │            Issue: New manager, team struggling                      │   │
│ │            [Escalate] [Assign Mentor] [Reorg?] [Pod Dashboard]     │   │
│ │                                                                      │   │
│ │                                           [View All Pods] [Export]  │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ PROCESS BOTTLENECK ANALYSIS ────────────────────────────────────────┐   │
│ │                                                                      │   │
│ │ End-to-End Recruiting Process (Average Times):                      │   │
│ │                                                                      │   │
│ │ Job Posted → First Candidate Sourced:  4.2 days  🟡 (target: 3d)   │   │
│ │   Bottleneck: Sourcing capacity constraint in Pod Beta              │   │
│ │   [View Details] [Assign More Sourcers]                             │   │
│ │                                                                      │   │
│ │ Sourced → Screened:                     2.1 days  ✅ (target: 2d)   │   │
│ │                                                                      │   │
│ │ Screened → Submitted:                   1.8 days  ✅ (target: 2d)   │   │
│ │                                                                      │   │
│ │ Submitted → Client Response:            5.8 days  🟡 (target: 5d)   │   │
│ │   Bottleneck: Client responsiveness (external dependency)           │   │
│ │   [Client Follow-up Template] [Escalate Stale Submittals]           │   │
│ │                                                                      │   │
│ │ Interview → Offer:                      3.2 days  ✅ (target: 3d)   │   │
│ │                                                                      │   │
│ │ Offer → Start Date:                     12.5 days 🔴 (target: 10d)  │   │
│ │   Bottleneck: Offer negotiation delays                              │   │
│ │   Action: Review offer approval process                             │   │
│ │   [Analyze] [Process Redesign Workshop]                             │   │
│ │                                                                      │   │
│ │ Total Time-to-Fill:                     28 days   ✅ (target: 30d)  │   │
│ │                                                                      │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ LIVE ACTIVITY FEED (INFORMED Notifications) ────────────────────────┐   │
│ │                                                                      │   │
│ │ All Changes (Last 60 Minutes): 37 notifications                     │   │
│ │ Filter: [All ▼] [Critical Only] [By Pillar ▼] [Search...]          │   │
│ │                                                                      │   │
│ │ 2m ago  - JOB CREATED: "Sr Java Developer" by Sarah Chen            │   │
│ │           Account: Google | Priority: High | TTF Target: 21 days    │   │
│ │           [View Job] [Assign Secondary] [Monitor]                   │   │
│ │                                                                      │   │
│ │ 5m ago  - SUBMISSION CREATED: Jane Doe → Google Job#4521            │   │
│ │           Recruiter: Sarah Chen | Bill: $95/hr | Pay: $72/hr       │   │
│ │           Margin: 24% | Status: Submitted                           │   │
│ │           [View Submission] [Track]                                 │   │
│ │                                                                      │   │
│ │ 8m ago  - PLACEMENT STARTED: Tom Wilson @ Apple ($85/hr)            │   │
│ │           Recruiter: Emily Rodriguez | Start: Dec 1, 2025           │   │
│ │           Projected Revenue: $177K annually                         │   │
│ │           [View Placement] [Celebrate 🎉]                           │   │
│ │                                                                      │   │
│ │ 12m ago - SLA BREACH: Job#4523 - No activity 7 days 🔴             │   │
│ │           Owner: Sarah Chen | Pod: Alpha                            │   │
│ │           [Escalate] [Reassign] [View Job]                          │   │
│ │                                                                      │   │
│ │ 15m ago - QUALITY FLAG: Client complaint - Job#8821 🟡             │   │
│ │           Issue: Candidate skill mismatch                           │   │
│ │           Recruiter: Mike Torres | Account: Meta                    │   │
│ │           [Investigate] [Client Follow-up] [Coach Recruiter]        │   │
│ │                                                                      │   │
│ │ 22m ago - INTERVIEW SCHEDULED: Jane Doe with Google                 │   │
│ │           Date: Dec 5, 2025 at 2 PM | Format: Virtual              │   │
│ │           Recruiter: Sarah Chen                                     │   │
│ │           [View Details] [Send Prep Email]                          │   │
│ │                                                                      │   │
│ │ ... (31 more notifications)                [View All] [Settings]    │   │
│ │                                                                      │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ PILLAR PERFORMANCE COMPARISON ──────────────────────────────────────┐   │
│ │                                                                      │   │
│ │           Recruiting    Bench Sales    TA        Academy            │   │
│ │ ────────────────────────────────────────────────────────────────────  │   │
│ │ Revenue   $1.43M  ✅    $855K    ✅    $428K  🟡  $143K   ✅        │   │
│ │ Margin    24.5%   ✅    25.0%    ✅    22.4%  🟡  33.6%   ✅        │   │
│ │ Growth    +18%    ✅    +22%     ✅    +12%   🟡  +45%    ✅        │   │
│ │ NPS       72      ✅    68       🟡    75     ✅  82      ✅        │   │
│ │                                                                      │   │
│ │ [Recruiting Dashboard] [Bench Dashboard] [TA Dashboard] [Academy]   │   │
│ │                                                                      │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─ QUICK ACTIONS ──────────────────────────────────────────────────────┐   │
│ │ [Review All Escalations]  [Pod Performance Deep-Dive]                │   │
│ │ [SLA Management Console]  [Process Improvement Board]                │   │
│ │ [Team Capacity Planner]   [Weekly Ops Review Report]                 │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Drill-Down Capabilities

### Efficiency Drill-Down

```
Click on "Efficiency: 87%"
  ↓
┌─────────────────────────────────────────────────────────┐
│ Operational Efficiency Deep-Dive                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Overall Efficiency: 87% vs 85% target ✅                │
│                                                          │
│ By Pillar:                                              │
│ - Recruiting:   90% ✅  (↑ from 88%)                    │
│ - Bench Sales:  85% ✅  (↔ flat)                        │
│ - TA:           82% 🟡  (↓ from 85%)                    │
│ - Academy:      88% ✅  (↑ from 85%)                    │
│                                                          │
│ By Pod:                                                 │
│ - Alpha:  88% ✅  - Beta:   72% 🔴                      │
│ - Gamma:  85% ✅  - Delta:  65% 🔴                      │
│                                                          │
│ Efficiency Components:                                  │
│ - Utilization Rate:        82% (target: 85%) 🟡        │
│ - Time Management:         91% (on productive tasks)✅  │
│ - Process Adherence:       89% (following SOPs) ✅     │
│ - Tool Adoption:           92% (using required tools)✅ │
│                                                          │
│ Trends (Last 30 Days):                                  │
│ [Line Chart showing efficiency trend: 82% → 87%]        │
│                                                          │
│ Top Inefficiency Sources:                               │
│ 1. Administrative overhead (8% of time)                 │
│ 2. Waiting on client responses (5%)                     │
│ 3. Rework due to errors (3%)                            │
│                                                          │
│ Recommended Actions:                                    │
│ • Automate admin tasks (est. 4% efficiency gain)        │
│ • Implement client follow-up automation (2% gain)       │
│ • Quality training to reduce rework (1.5% gain)         │
│                                                          │
│ [Export] [Schedule Review] [Close]                      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Business Rules

### BR-COO-010-001: Dashboard Refresh

```
Real-Time Refresh:
- Dashboard auto-refreshes every 30 seconds
- KPI values update in real-time
- Notification feed updates via WebSocket (instant)
- User can manually refresh with [⟳] button

Performance:
- Dashboard must load in < 3 seconds
- Refresh must complete in < 2 seconds
- If data source is slow (> 5s), show last known value with timestamp

Offline Behavior:
- If internet connection lost, show banner: "Dashboard offline - last update: [timestamp]"
- Queue user actions for sync when reconnected
```

### BR-COO-010-002: Alert Thresholds

```
Efficiency Alerts:
- Green (✅): >= 85%
- Yellow (🟡): 75-84%
- Red (🔴): < 75%

SLA Compliance Alerts:
- Green: >= 95%
- Yellow: 90-94%
- Red: < 90%

Escalation Alerts:
- Green: 0 open escalations
- Yellow: 1-3 open escalations
- Red: 4+ open escalations

Utilization Alerts:
- Green: 82-90% (optimal)
- Yellow: 75-81% or 91-95% (sub-optimal)
- Red: < 75% or > 95% (critical)
```

### BR-COO-010-003: Drill-Down Access

```
COO can drill down to:
✅ Any entity (job, candidate, submission, placement)
✅ Any pod performance details
✅ Any individual team member activity
✅ Any time period (real-time, daily, weekly, monthly, quarterly)

Drill-down preserves:
- Applied filters
- Date range selection
- Comparison settings (e.g., vs prior period)
```

---

## 5. Integration Points

### Real-Time Data Pipeline

**Technology:** Apache Kafka + Stream Processing

**Data Sources:**
- Jobs database (create, update, status change)
- Candidates database
- Submissions tracking
- Placements monitoring
- SLA calculation engine
- Performance metrics aggregation

**Latency:** < 30 seconds from event to dashboard display

---

### Analytics Engine

**Purpose:** KPI calculation and aggregation

**Endpoints:**
- `GET /api/coo/kpis/real-time` - Current KPI values
- `GET /api/coo/sla/status` - SLA compliance status
- `GET /api/coo/pods/performance` - Pod heatmap data
- `GET /api/coo/bottlenecks` - Process bottleneck analysis

---

## 6. Security

```
Access Control:
- COO: Full access to all operational data
- Board Administrator: Read-only (for board reporting support)
- CEO: Read-only access to COO dashboard
- Data Analysts: No access (must request specific reports)

Data Sensitivity:
- Individual performance data: Confidential (COO + HR only)
- Pod performance: Internal (leadership team)
- Aggregate metrics: Can be shared in board reports

Audit Trail:
- Log all COO actions (escalate, reassign, etc.)
- Log all drill-down queries
- Retention: 2 years
```

---

## 7. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-30 | Product Team | Initial comprehensive specification |

---

**End of UC-COO-010: COO Operational Dashboard**

*This document specifies the real-time operational dashboard providing the COO with complete visibility into organizational operations, SLA compliance, pod performance, and process bottlenecks.*
