# Use Case: Executive Daily Workflow

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-EXEC-001 |
| Actor | CEO / COO / CFO |
| Goal | Monitor organization health and drive strategic decisions through daily workflow |
| Frequency | Daily (Morning, Mid-day, Evening) |
| Estimated Time | 45-60 minutes per day |
| Priority | Critical |

---

## Preconditions

1. User is logged in as Executive (CEO/COO/CFO)
2. User has full organization read access
3. Dashboard KPIs are refreshed and up-to-date
4. Real-time data sync is active

---

## Trigger

One of the following:
- Start of business day (Morning routine)
- Mid-day check-in (Lunch time)
- End of day review (Evening wrap-up)
- Critical alert received (Ad-hoc)

---

## Main Flow: Morning Routine (8:00 AM - 8:45 AM)

### Step 1: Login and Dashboard Load

**User Action:** Navigate to `/executive/dashboard`

**System Response:**
- Authenticates user credentials
- Loads executive dashboard with real-time data
- Shows global KPI summary across all regions
- Displays overnight alerts and exceptions
- Loading completes within 1-2 seconds (cached)

**Screen State:**
```
+-------------------------------------------------------------------------+
| InTime OS - Executive Dashboard                    [🔔 3]  [👤 CEO]    |
+-------------------------------------------------------------------------+
| 🌍 Global View  |  📊 Americas  |  🇪🇺 Europe  |  🌏 APAC  |  🔄 Refresh |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ OVERNIGHT SUMMARY ────────────────────────────────────────────────┐ |
| │ 🕐 Last 16 hours (4:00 PM PST → 8:00 AM PST)                       │ |
| │                                                                     │ |
| │ ✅ 12 Placements Confirmed         📈 Pipeline +$2.4M               │ |
| │ ⚠️  2 Critical Escalations         💰 Revenue: $85K (vs $90K goal)  │ |
| │ 📧 4 Executive Actions Needed      👥 3 New Hires Started           │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CRITICAL ALERTS ──────────────────────────────────────────────────┐ |
| │ 🔴 URGENT (2)                                                       │ |
| │   • Client ABC threatening to churn - $500K ARR at risk            │ |
| │     Action: Review escalation details →                            │ |
| │                                                                     │ |
| │   • Bench utilization dropped to 62% (target: 80%)                 │ |
| │     Action: Review bench status →                                  │ |
| │                                                                     │ |
| │ 🟡 WARNING (4)                                                      │ |
| │   • Q4 revenue forecast -8% below target                           │ |
| │   • Attrition spike: 3 recruiters resigned this week               │ |
| │   • Pod Delta underperforming (-40% vs target)                     │ |
| │   • Client onboarding delayed: 2 accounts stuck in legal           │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~30 seconds (review alerts)

---

### Step 2: Review Global KPI Dashboard

**User Action:** Scroll down to view Global KPI cards

**System Response:**
- Displays 8 primary KPI cards
- Each card shows: Current value, Target, Trend, YoY comparison
- Color-coded indicators (Green = on track, Yellow = warning, Red = critical)

**Screen State:**
```
+-------------------------------------------------------------------------+
| ┌─ KEY PERFORMANCE INDICATORS ───────────────────────────────────────┐ |
| │                                                                     │ |
| │ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │ |
| │ │ 💰 REVENUE    │  │ 📊 MARGIN     │  │ 🎯 PLACEMENTS │           │ |
| │ │ $2.85M        │  │ 24.2%         │  │ 127           │           │ |
| │ │ vs $3.0M 🟡   │  │ vs 22% ✅     │  │ vs 120 ✅     │           │ |
| │ │ MTD: 95%      │  │ ↗ +2.1% MoM   │  │ ↗ +5.8% MoM   │           │ |
| │ │ YoY: +18%     │  │ YoY: +3.2%    │  │ YoY: +12%     │           │ |
| │ └───────────────┘  └───────────────┘  └───────────────┘           │ |
| │                                                                     │ |
| │ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │ |
| │ │ 📈 PIPELINE   │  │ 👥 HEADCOUNT  │  │ 😊 CLIENT NPS │           │ |
| │ │ $18.4M        │  │ 1,125         │  │ 67            │           │ |
| │ │ vs $20M 🟡    │  │ vs 1,200 🔴   │  │ vs 65 ✅      │           │ |
| │ │ ↘ -8% WoW     │  │ ↘ -6.25%      │  │ ↗ +2 pts     │           │ |
| │ │ Velocity: 42d │  │ Attrition: 18%│  │ Retention: 92%│           │ |
| │ └───────────────┘  └───────────────┘  └───────────────┘           │ |
| │                                                                     │ |
| │ ┌───────────────┐  ┌───────────────┐                              │ |
| │ │ 💵 CASH FLOW  │  │ ⚡ EFFICIENCY  │                              │ |
| │ │ $4.2M         │  │ 82%           │                              │ |
| │ │ vs $4.0M ✅   │  │ vs 85% 🟡     │                              │ |
| │ │ Runway: 18mo  │  │ ↘ -3% MoM     │                              │ |
| │ │ Burn: $230K/m │  │ Top Pod: 94%  │                              │ |
| │ └───────────────┘  └───────────────┘                              │ |
| │                                                                     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
+-------------------------------------------------------------------------+
```

**Time:** ~2 minutes (scan all KPIs)

---

### Step 3: Click into Critical Alert

**User Action:** Click on "Client ABC threatening to churn" alert

**System Response:**
- Modal slides in from right
- Shows escalation details with full context
- Timeline of events leading to escalation
- Recommended actions based on AI analysis
- Quick action buttons for response

**Screen State:**
```
+--------------------------------------------------------------+
| ❌ CRITICAL ESCALATION                                  [×] |
+--------------------------------------------------------------+
| Client: ABC Technologies                                     |
| Account Value: $500,000 ARR                                  |
| Risk Level: 🔴 CRITICAL - Churn Imminent                     |
| Escalated: 2 hours ago by Sarah Chen (Account Manager)      |
|                                                              |
| ┌─ SITUATION ─────────────────────────────────────────────┐ |
| │ Client CEO expressed dissatisfaction with:              │ |
| │ • 3 failed placements in last 2 months                  │ |
| │ • Avg time-to-fill: 45 days (target was 30 days)        │ |
| │ • Quality concerns: 2 candidates fell off within 30d    │ |
| │                                                          │ |
| │ Contract renewal in 45 days - at risk of non-renewal    │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| ┌─ TIMELINE ──────────────────────────────────────────────┐ |
| │ Nov 28 • Client CEO sends complaint email to Sarah      │ |
| │ Nov 28 • Sarah escalates to Recruiting Manager          │ |
| │ Nov 29 • Manager assigns recovery task force            │ |
| │ Nov 30 • 8:00 AM - Flagged for executive attention      │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| ┌─ AI RECOMMENDATIONS ────────────────────────────────────┐ |
| │ 1. Schedule executive call within 24 hours              │ |
| │ 2. Assign top-performing recruiter to account           │ |
| │ 3. Offer service credits: $50K (~10% ARR)               │ |
| │ 4. Implement weekly executive sponsor check-ins         │ |
| │ 5. Review and optimize matching algorithm for client    │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| ┌─ QUICK ACTIONS ─────────────────────────────────────────┐ |
| │ [Schedule Call]  [Assign Owner]  [Send Message]         │ |
| │ [View Account Details]  [Review Failed Placements]      │ |
| └──────────────────────────────────────────────────────────┘ |
|                                                              |
| Internal Notes:                                              |
| [Add notes for team...]                               0/500 |
|                                                              |
|                    [Acknowledge]  [Escalate Further]  [Resolve] |
+--------------------------------------------------------------+
```

**Time:** ~3 minutes (review and take action)

---

### Step 4: Take Action on Escalation

**User Action:**
1. Click "Schedule Call" button
2. Select time slot for client call (tomorrow 2 PM)
3. Click "Assign Owner" → Select "Michael Torres" (Top Recruiter)
4. Add internal notes: "Prioritize this account. Will personally sponsor."
5. Click "Acknowledge" button

**System Response:**
- Calendar invitation sent to client CEO
- Email notification to Michael Torres with context
- Task created: "Executive sponsor check-in - ABC Tech"
- Internal note saved and visible to team
- Alert marked as "In Progress"
- Activity logged in audit trail
- Toast notification: "Actions completed. Call scheduled for Dec 1 at 2:00 PM"

**Time:** ~2 minutes

---

### Step 5: Review Bench Utilization Alert

**User Action:** Click on "Bench utilization dropped to 62%" alert

**System Response:**
- Navigates to Bench Analytics view
- Shows utilization trend over last 30 days
- Breakdown by consultant type, skill, location
- Idle consultants highlighted

**Screen State:**
```
+-------------------------------------------------------------------------+
| BENCH UTILIZATION DASHBOARD                                     [Close] |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ UTILIZATION TREND ────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │  100% ┤                                                             │ |
| │   90% ┤ ●━━━━●                                                      │ |
| │   80% ┤       ╲                                                     │ |
| │   70% ┤        ●━━●                                                 │ |
| │   60% ┤            ╲                                                │ |
| │   50% ┤             ●━━━━━━━━━●━━━━━●  ← Current: 62%              │ |
| │       └─────────────────────────────────────────────                │ |
| │        Nov 1        Nov 15          Nov 30                          │ |
| │                                                                     │ |
| │  🎯 Target: 80%  |  Current: 62%  |  Gap: -18 pts  |  🔴 CRITICAL  │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ BREAKDOWN ────────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Total Consultants: 245                                              │ |
| │   • Billable (Active): 152  (62%)  🔴                               │ |
| │   • Bench (Idle):       93   (38%)  ⚠️                              │ |
| │                                                                     │ |
| │ By Time on Bench:                                                   │ |
| │   • 0-7 days:     28 consultants  (New to bench)                    │ |
| │   • 8-30 days:    42 consultants  (Marketing active)                │ |
| │   • 31-60 days:   18 consultants  (Concern)                         │ |
| │   • 61+ days:      5 consultants  (🔴 Critical - action needed)     │ |
| │                                                                     │ |
| │ Top Skills on Bench:                                                │ |
| │   • Java Developers:     22 available                               │ |
| │   • React Developers:    18 available                               │ |
| │   • DevOps Engineers:    14 available                               │ |
| │   • Data Engineers:      12 available                               │ |
| │   • .NET Developers:     11 available                               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ROOT CAUSE ANALYSIS (AI) ─────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Primary Drivers:                                                    │ |
| │ 1. Client demand down 15% (economic slowdown in tech sector)        │ |
| │ 2. Marketing velocity decreased: Avg 8.5 days to first submittal   │ |
| │    (was 5.2 days last quarter)                                      │ |
| │ 3. 12 consultants returning from assignments this week              │ |
| │    (normal rotation, but higher than usual)                         │ |
| │                                                                     │ |
| │ Recommended Actions:                                                │ |
| │ • Increase marketing budget by 20% for bench sales team            │ |
| │ • Launch targeted email campaign to warm client list                │ |
| │ • Expand to 3 new client verticals (Healthcare, Finance, Retail)    │ |
| │ • Consider bench-to-internal-project conversions for top talent     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [View Detailed List]  [Assign Marketing Tasks]  [Generate Report]      |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~3 minutes (review and strategize)

---

### Step 6: Review AI-Generated Daily Briefing

**User Action:** Click "View Daily Briefing" button on dashboard

**System Response:**
- AI Twin generates personalized briefing
- Includes: Key events, opportunities, risks, recommendations
- Natural language summary of overnight activity

**Screen State:**
```
+-------------------------------------------------------------------------+
| 🤖 AI DAILY BRIEFING - November 30, 2025                               |
+-------------------------------------------------------------------------+
|                                                                         |
| Good morning. Here's what happened overnight and what needs your        |
| attention today:                                                        |
|                                                                         |
| ┌─ HIGHLIGHTS ───────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ ✅ WINS                                                              │ |
| │ • 12 placements confirmed across 3 regions                          │ |
| │ • New $2.4M deal signed with TechCorp (largest this quarter)        │ |
| │ • Pod Alpha achieved 140% of monthly target (5 days early)          │ |
| │ • Academy enrollment +28% WoW (Black Friday promo successful)       │ |
| │                                                                     │ |
| │ ⚠️ CHALLENGES                                                        │ |
| │ • ABC Tech escalation requires immediate executive attention        │ |
| │ • Bench utilization below target - demand slowdown in tech          │ |
| │ • 3 recruiters resigned - exit interviews reveal comp concerns      │ |
| │ • Q4 forecast trending 8% below target                              │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ OPPORTUNITIES ────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. MegaCorp RFP (Due: Dec 5) - $5M potential contract              │ |
| │    Status: Draft in progress (80% complete)                         │ |
| │    Action: Review and approve final proposal                        │ |
| │                                                                     │ |
| │ 2. Expansion to Brazil - Legal docs ready for signature            │ |
| │    Status: Awaiting CEO signature                                   │ |
| │    Impact: Access to $50M market                                    │ |
| │                                                                     │ |
| │ 3. Strategic partnership with TrainingCo                            │ |
| │    Status: LOI received, needs negotiation                          │ |
| │    Impact: Could 3x Academy revenue                                 │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ TOP PRIORITIES TODAY ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. ⏰ 9:00 AM - Leadership Team Meeting                             │ |
| │    Agenda: Q4 forecast review, attrition discussion                 │ |
| │                                                                     │ |
| │ 2. 🔴 Address ABC Tech escalation (scheduled call tomorrow)         │ |
| │    Prep: Review account history, failed placements, recovery plan   │ |
| │                                                                     │ |
| │ 3. 📊 Review MegaCorp RFP (due in 5 days)                           │ |
| │    Time needed: 30 minutes                                          │ |
| │                                                                     │ |
| │ 4. 💰 Approve 3 pending compensation adjustments                    │ |
| │    Total impact: $45K annual increase                               │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ METRICS TO WATCH ─────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ • Revenue: Need $150K more this week to hit monthly target          │ |
| │ • Pipeline: Watch for new additions from Americas team              │ |
| │ • Bench: Monitor marketing activities - should improve by Friday    │ |
| │ • Attrition: HR conducting stay interviews with at-risk talent      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
|                                                [Print]  [Email]  [Close] |
+-------------------------------------------------------------------------+
```

**Time:** ~5 minutes (read and internalize)

---

## Mid-Day Review (12:00 PM - 12:30 PM)

### Step 7: Check Real-Time Performance

**User Action:** Refresh dashboard at lunch time

**System Response:**
- Dashboard auto-refreshes with latest data
- Shows current day performance metrics
- Live pipeline movement tracker
- Team activity heatmap

**Screen State:**
```
+-------------------------------------------------------------------------+
| ⏰ MID-DAY SNAPSHOT - 12:15 PM PST                                     |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ TODAY'S PERFORMANCE ──────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Revenue Today:     $28,500    Goal: $50,000    Progress: 57% ███▓▓ │ |
| │ Placements Today:  4          Goal: 6          Progress: 67% ████▓ │ |
| │ Submittals Today:  23         Goal: 30         Progress: 77% ████▓ │ |
| │ New Leads Today:   8          Goal: 10         Progress: 80% ████▓ │ |
| │                                                                     │ |
| │ Pipeline Movement:                                                  │ |
| │   • 12 deals advanced to next stage                                 │ |
| │   • 3 deals won ($85K total)                                        │ |
| │   • 1 deal lost ($40K)                                              │ |
| │   • 5 new opportunities added ($320K potential)                     │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ TEAM ACTIVITY HEATMAP ────────────────────────────────────────────┐ |
| │                                                                     │ |
| │        8AM  9AM  10AM  11AM  12PM  1PM  2PM  3PM  4PM  5PM          │ |
| │ Rec    ████ ████ ████  ████  ███▓                                   │ |
| │ Bench  ████ ████ ████  ████  ████                                   │ |
| │ TA     ████ ████ ████  ████  ███▓                                   │ |
| │ Sales  ████ ████ ████  ████  ████                                   │ |
| │                                                                     │ |
| │ █ = High Activity  ▓ = Medium  ░ = Low                              │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**Time:** ~2 minutes

---

### Step 8: Handle Pending Approvals

**User Action:** Click "Approvals" tab (shows badge with "7" pending)

**System Response:**
- Lists all pending approvals requiring executive sign-off
- Grouped by type: Compensation, Hiring, Budget, Contracts
- Quick approve/reject/defer actions

**Screen State:**
```
+-------------------------------------------------------------------------+
| PENDING APPROVALS (7)                                                   |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ COMPENSATION ADJUSTMENTS (3) ─────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. Sarah Chen - Account Manager → Senior Account Manager           │ |
| │    Current: $85K → Proposed: $95K (+11.7%)                          │ |
| │    Justification: Exceeded targets 3 quarters, retention critical   │ |
| │    Requested by: VP Sales                                           │ |
| │    [Approve] [Reject] [Request More Info]                           │ |
| │                                                                     │ |
| │ 2. Michael Torres - Senior Recruiter → Lead Recruiter              │ |
| │    Current: $75K → Proposed: $85K (+13.3%)                          │ |
| │    Justification: Top performer, mentoring 3 juniors                │ |
| │    Requested by: Recruiting Manager                                 │ |
| │    [Approve] [Reject] [Request More Info]                           │ |
| │                                                                     │ |
| │ 3. Emily Rodriguez - Recruiter → Senior Recruiter                  │ |
| │    Current: $65K → Proposed: $72K (+10.8%)                          │ |
| │    Justification: Consistent performance, 18 placements YTD         │ |
| │    Requested by: Recruiting Manager                                 │ |
| │    [Approve] [Reject] [Request More Info]                           │ |
| │                                                                     │ |
| │ Total Annual Impact: $45,000                                        │ |
| │ [Approve All] [Review Individually]                                 │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ HIRING REQUISITIONS (2) ──────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. 2x Recruiters - Bench Sales Team (India)                         │ |
| │    Budget: $120K annual total                                       │ |
| │    Justification: Team at 150% capacity, missing opportunities      │ |
| │    Requested by: VP Operations                                      │ |
| │    [Approve] [Reject] [Defer]                                       │ |
| │                                                                     │ |
| │ 2. 1x DevOps Engineer - Internal IT                                │ |
| │    Budget: $110K annual                                             │ |
| │    Justification: Infrastructure scaling for 40% YoY growth         │ |
| │    Requested by: CTO                                                │ |
| │    [Approve] [Reject] [Defer]                                       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ CONTRACT APPROVALS (2) ───────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. MegaCorp MSA - Master Service Agreement                          │ |
| │    Value: $5M over 2 years                                          │ |
| │    Status: Legal review complete, ready for signature               │ |
| │    [Review Document] [Approve] [Request Changes]                    │ |
| │                                                                     │ |
| │ 2. TrainingCo Partnership - Letter of Intent                       │ |
| │    Value: Revenue share (est. $500K annual)                         │ |
| │    Status: Terms negotiated, awaiting executive approval            │ |
| │    [Review Document] [Approve] [Request Changes]                    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
```

**User Action:**
1. Review each compensation adjustment
2. Click "Approve All" for compensation (all justified)
3. Approve hiring requisitions (team capacity critical)
4. Review MegaCorp contract - click "Review Document"
5. Approve contract after review

**System Response:**
- Approvals processed immediately
- Notifications sent to requesters
- HR begins processing compensation changes (effective next pay cycle)
- Recruiting can post job openings
- Legal team notified to execute contracts
- Activity logged
- Approval count badge updates: (7) → (0)

**Time:** ~15 minutes

---

## End of Day Review (6:00 PM - 6:30 PM)

### Step 9: Review Daily Summary

**User Action:** Click "Daily Summary" on dashboard

**System Response:**
- AI generates end-of-day summary
- Shows achievements vs goals
- Highlights wins and losses
- Identifies tomorrow's priorities

**Screen State:**
```
+-------------------------------------------------------------------------+
| 📊 DAILY SUMMARY - November 30, 2025                                   |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ TODAY'S ACHIEVEMENTS ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Revenue:       $47,500  vs  $50,000 goal    ✅ 95%                  │ |
| │ Placements:    5        vs  6 goal          ✅ 83%                  │ |
| │ Submittals:    28       vs  30 goal         ✅ 93%                  │ |
| │ New Leads:     11       vs  10 goal         ✅ 110%                 │ |
| │ Client Calls:  34       vs  40 goal         🟡 85%                  │ |
| │                                                                     │ |
| │ Overall Day Score: 93% - Strong Performance ⭐⭐⭐⭐                │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ NOTABLE WINS ─────────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. 🏆 Pod Alpha closed $85K deal (largest this week)                │ |
| │ 2. ✅ MegaCorp contract approved - revenue kicks off Jan 1          │ |
| │ 3. 🎉 3 team members promoted (morale boost)                        │ |
| │ 4. 💼 2 new recruiters hired (India team expansion)                 │ |
| │ 5. 🤝 ABC Tech escalation addressed - call scheduled tomorrow       │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ AREAS FOR IMPROVEMENT ────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ 1. Bench utilization still at 64% (target: 80%)                     │ |
| │    → Action: Marketing blitz launched, expect improvement by Fri    │ |
| │                                                                     │ |
| │ 2. Monthly revenue tracking 5% below target ($2.85M vs $3.0M)       │ |
| │    → Action: Push for 5 more placements before month-end            │ |
| │                                                                     │ |
| │ 3. Client call volume 15% below target                              │ |
| │    → Action: Coaching session scheduled with sales team             │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ TOMORROW'S PREVIEW ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Key Events:                                                         │ |
| │ • 9:00 AM - Monthly Business Review (All VPs)                       │ |
| │ • 2:00 PM - ABC Tech Client Call (Escalation Recovery)              │ |
| │ • 4:00 PM - Board Prep Meeting (CFO, COO)                           │ |
| │                                                                     │ |
| │ Critical Deadlines:                                                 │ |
| │ • Month-end close (1 day remaining)                                 │ |
| │ • MegaCorp RFP submission (5 days remaining)                        │ |
| │ • Q4 forecast update (3 days remaining)                             │ |
| │                                                                     │ |
| │ Focus Areas:                                                        │ |
| │ • Drive remaining $150K revenue to hit monthly target               │ |
| │ • Monitor ABC Tech relationship closely                             │ |
| │ • Bench utilization improvement tracking                            │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Export Report] [Share with Leadership] [Schedule Tomorrow] [Close]     |
+-------------------------------------------------------------------------+
```

**Time:** ~5 minutes

---

### Step 10: Check Forecast Accuracy

**User Action:** Click "Revenue Forecast" widget on dashboard

**System Response:**
- Shows month-to-date performance
- Forecast for remaining days
- Probability of hitting target
- Recommendations to close gap

**Screen State:**
```
+-------------------------------------------------------------------------+
| 💰 REVENUE FORECAST - November 2025                                    |
+-------------------------------------------------------------------------+
|                                                                         |
| ┌─ MONTHLY PROGRESS ─────────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Current:    $2,850,000                                              │ |
| │ Target:     $3,000,000                                              │ |
| │ Gap:        -$150,000  (5% below target)  🟡                         │ |
| │ Days Left:  1 (business days)                                       │ |
| │                                                                     │ |
| │ Progress: ████████████████████████████▓▓▓ 95%                       │ |
| │                                                                     │ |
| │ ┌─────────────────────────────────────────────────────────────┐    │ |
| │ │ $3.0M  ┤                                         ╭─ Target   │    │ |
| │ │        ┤                                    ╭────╯           │    │ |
| │ │ $2.5M  ┤                            ╭───────╯                │    │ |
| │ │        ┤                      ╭─────╯                        │    │ |
| │ │ $2.0M  ┤              ╭───────╯                              │    │ |
| │ │        ┤      ╭───────╯                                      │    │ |
| │ │ $1.5M  ┤ ─────╯       ▲ Current                             │    │ |
| │ │        └──────────────────────────────────────────────────   │    │ |
| │ │         Nov 1      Nov 15          Nov 30                    │    │ |
| │ └─────────────────────────────────────────────────────────────┘    │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ FORECAST SCENARIOS ───────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ Best Case:    $2,940,000   (98% of target)   Probability: 35%      │ |
| │ Likely Case:  $2,885,000   (96% of target)   Probability: 50%      │ |
| │ Worst Case:   $2,850,000   (95% of target)   Probability: 15%      │ |
| │                                                                     │ |
| │ Key Assumptions:                                                    │ |
| │ • 3-5 placements will close tomorrow (historical avg: 4)            │ |
| │ • Avg placement value: $35K                                         │ |
| │ • 2 deals in final stages: $40K + $45K (70% close probability)      │ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| ┌─ ACTIONS TO CLOSE GAP ─────────────────────────────────────────────┐ |
| │                                                                     │ |
| │ To hit $3.0M target, need 5 more placements @ avg $30K each         │ |
| │                                                                     │ |
| │ High-Probability Opportunities (closing tomorrow):                  │ |
| │ 1. ✅ Java Developer @ TechStart ($40K) - 90% probability           │ |
| │ 2. 🟡 DevOps Engineer @ CloudCo ($45K) - 70% probability            │ |
| │ 3. 🟡 Product Manager @ StartupXYZ ($55K) - 60% probability         │ |
| │                                                                     │ |
| │ Recommended Actions:                                                │ |
| │ • Push recruiters to close DevOps + PM deals (potential $100K)      │ |
| │ • Expedite 2 pending start dates to count in Nov revenue            │ |
| │ • Approve early commission for tomorrow's placements (motivate team)│ |
| └─────────────────────────────────────────────────────────────────────┘ |
|                                                                         |
| [Drill Down by Pillar] [View Pipeline Details] [Export Forecast] [Close]|
+-------------------------------------------------------------------------+
```

**Time:** ~5 minutes

---

## Postconditions

1. ✅ Executive has complete visibility into organization health
2. ✅ Critical escalations acknowledged and actioned
3. ✅ Pending approvals processed (compensation, hiring, contracts)
4. ✅ Revenue forecast reviewed and gap-closing actions identified
5. ✅ Tomorrow's priorities identified and scheduled
6. ✅ Leadership team informed of key decisions
7. ✅ Activity logged in audit trail

---

## Events Logged

| Event | Payload |
|-------|---------|
| `executive.dashboard.viewed` | `{ user_id, timestamp, session_duration }` |
| `executive.alert.acknowledged` | `{ alert_id, type, action_taken, timestamp }` |
| `executive.approval.processed` | `{ approval_id, type, decision, timestamp }` |
| `executive.forecast.reviewed` | `{ month, revenue_actual, revenue_target, gap }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Data Load Failed | API timeout | "Unable to load dashboard data" | Retry button, fallback to cached data |
| Approval Failed | Permission issue | "Approval could not be processed" | Contact system admin |
| Forecast Unavailable | Calculation error | "Forecast data temporarily unavailable" | Retry in 5 minutes |
| Alert Action Failed | Network error | "Unable to process alert action" | Retry, log for follow-up |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+R` | Refresh dashboard data |
| `Cmd+A` | Go to Approvals tab |
| `Cmd+F` | Open forecast view |
| `Cmd+K` | Global command palette |
| `Esc` | Close modal/drawer |

---

## Alternative Flows

### A1: Critical Alert Outside Business Hours

If critical alert triggered after hours:
1. SMS notification sent to executive
2. Email with alert details
3. Option to acknowledge via mobile app
4. Escalation to on-call VP if not acknowledged within 2 hours

### A2: Weekly Workflow (Monday Planning)

1. Review weekend metrics
2. Set weekly priorities for leadership team
3. Review pipeline forecast for week
4. Schedule strategic check-ins
5. Prepare for Monday leadership meeting

### A3: Monthly Workflow (Month-End Close)

1. Review monthly performance vs targets
2. Analyze variance and trends
3. Approve/adjust forecasts for next month
4. Prepare board report
5. Conduct all-hands town hall
6. Set next month's goals

---

## Related Use Cases

- [02-executive-dashboard.md](./02-executive-dashboard.md) - Dashboard specification
- [03-workforce-planning.md](./03-workforce-planning.md) - Strategic planning
- [04-strategic-client.md](./04-strategic-client.md) - Client relationship management
- [05-organization-config.md](./05-organization-config.md) - System configuration

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-EXEC-001 | Load dashboard on login | All KPIs load within 2 seconds |
| TC-EXEC-002 | Critical alert displayed | Alert appears with correct priority and details |
| TC-EXEC-003 | Process approval | Approval processed and notifications sent |
| TC-EXEC-004 | Review forecast | Forecast shows accurate data and scenarios |
| TC-EXEC-005 | Daily summary generated | AI summary includes all key events |
| TC-EXEC-006 | Refresh dashboard mid-day | Data updates in real-time |
| TC-EXEC-007 | Handle multiple alerts | Alerts queue correctly, process in order |

---

*Last Updated: 2025-11-30*
