# Use Case: Manage Multiple Pods Across Region

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-RD-003 |
| Actor | Regional Director |
| Goal | Manage pod structure, resources, and performance across the region |
| Frequency | Weekly (major changes), Daily (monitoring) |
| Estimated Time | 30 minutes to 2 hours (depending on scope) |
| Priority | High |

---

## Preconditions

1. User is logged in as Regional Director
2. User has `pods.manage_regional` permission
3. Region has at least one active pod
4. Pod data is synchronized (last sync < 30 minutes)
5. User has authority to create/dissolve/restructure pods

---

## Trigger

One of the following:
- Pod performance degradation identified in dashboard
- Strategic initiative requiring pod restructure
- New market expansion requiring pod creation
- Merger/acquisition integration
- Resource optimization review (quarterly)
- Country manager escalation
- Critical pod failure

---

## Main Flow: Restructure Underperforming Pod

### Step 1: Navigate to Pod Management

**User Action:** Click "Pods" in navigation or select from regional dashboard

**System Response:**
- URL changes to: `/employee/workspace/regional-pods`
- Pod overview loads
- All regional pods displayed in grid/list view

**Screen State:**
```
+================================================================================+
|  InTime OS - Pod Management                             Regional Director     |
+================================================================================+
|                                                                                |
|  REGIONAL POD OVERVIEW - AMERICAS                       📅 Monday, Nov 30     |
|                                                                                |
|  [+ Create New Pod] [Merge Pods] [Dissolve Pod] [Reassign Resources] [Export] |
|                                                                                |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  QUICK STATS                                                             ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Total Pods: 24    Active: 22    At Risk: 4    Critical: 2               │|
|  │  Total Employees: 122    Avg Pod Size: 5.1    Avg Revenue/Pod: $160K     │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  FILTERS & VIEW OPTIONS                                                  ││|
|  │  ─────────────────────────────────────────────────────────────────────   │|
|  │                                                                           │|
|  │  Country: [All ▼]  Type: [All ▼]  Status: [All ▼]  Manager: [All ▼]     │|
|  │                                                                           │|
|  │  View: [Grid View] [List View] [Heatmap View] [Org Chart View]           │|
|  │  Sort: [Revenue ▼]  [Margin]  [Placements]  [Utilization]  [Team Size]   │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  POD LIST - SORTED BY STATUS (Critical First)                           ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  🔴 CRITICAL                                                              │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ┌─ Pod-MX-02 (IT Services) ─────────────────────────────────────────┐  │|
|  │  │  Country: 🇲🇽 Mexico  |  Manager: Carlos Rodriguez Jr.            │  │|
|  │  │  Team: 8 recruiters  |  Utilization: 75%                          │  │|
|  │  │                                                                    │  │|
|  │  │  Performance:                                                      │  │|
|  │  │  Revenue MTD: $42K (-77% vs target $185K) ❌                       │  │|
|  │  │  Margin: 18.2% (below threshold 25%) ❌                            │  │|
|  │  │  Placements: 0 (45 days without placement) ❌                      │  │|
|  │  │  Pipeline: $28K (weak, only 2 active deals)                       │  │|
|  │  │                                                                    │  │|
|  │  │  Issues:                                                           │  │|
|  │  │  • Manager inexperienced (6 months in role, first leadership)     │  │|
|  │  │  • 2 key recruiters submitted resignation (retention issue)       │  │|
|  │  │  • Lost 3 major accounts to local competitor (Q4)                 │  │|
|  │  │  • Team morale low (engagement score: 42%)                        │  │|
|  │  │                                                                    │  │|
|  │  │  Recommended Actions:                                              │  │|
|  │  │  □ Option 1: Replace manager (demote Carlos Jr. to IC)            │  │|
|  │  │  □ Option 2: Merge with Pod-MX-01 (critical mass)                 │  │|
|  │  │  □ Option 3: Bring in US senior manager for 60-day turnaround     │  │|
|  │  │                                                                    │  │|
|  │  │  [View Full Details] [Restructure Pod] [Action Plan] [Timeline]   │  │|
|  │  └────────────────────────────────────────────────────────────────────┘  │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ┌─ Pod-MX-03 (BPO/Outsourcing) ──────────────────────────────────────┐  │|
|  │  │  Country: 🇲🇽 Mexico  |  Manager: Maria Gonzalez                  │  │|
|  │  │  Team: 5 recruiters  |  Utilization: 68%                          │  │|
|  │  │                                                                    │  │|
|  │  │  Performance:                                                      │  │|
|  │  │  Revenue MTD: $38K (-65% vs target $110K) ❌                       │  │|
|  │  │  Margin: 22.1% (below threshold) ❌                                │  │|
|  │  │  Placements: 0  |  Pipeline: $42K                                 │  │|
|  │  │                                                                    │  │|
|  │  │  Issues:                                                           │  │|
|  │  │  • Client mix: Too many low-margin BPO deals                      │  │|
|  │  │  • Client churn: 3 accounts cancelled this quarter                │  │|
|  │  │  • Manager lacks strategic account experience                     │  │|
|  │  │                                                                    │  │|
|  │  │  [View Details] [Reassign Clients] [Training Plan]                │  │|
|  │  └────────────────────────────────────────────────────────────────────┘  │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  🟡 AT RISK (4 pods)  [Expand All ▼]                                     │|
|  │  🟢 HEALTHY (16 pods)  [Expand All ▼]                                    │|
|  │  ⭐ ELITE (2 pods)  [Expand All ▼]                                       │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
+================================================================================+
```

**Time:** 10 seconds

---

### Step 2: Select Pod for Restructuring

**User Action:** Click "[Restructure Pod]" button on Pod-MX-02

**System Response:** Opens pod restructuring wizard

**Screen State:**
```
+================================================================================+
|  RESTRUCTURE POD WIZARD - Pod-MX-02 (IT Services)                        [×] |
+================================================================================+
|                                                                                |
|  Step 1 of 4: Select Restructuring Type                                       |
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  CURRENT STATE SUMMARY                                                   ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Pod: Pod-MX-02 (IT Services)                                            │|
|  │  Country: Mexico  |  Manager: Carlos Rodriguez Jr.                       │|
|  │  Team Size: 8 recruiters  |  Active Consultants: 12                      │|
|  │  Revenue MTD: $42K  |  Margin: 18.2%  |  Utilization: 75%                │|
|  │  Open Jobs: 3  |  Pipeline Value: $28K                                   │|
|  │                                                                           │|
|  │  ISSUES:                                                                  │|
|  │  ❌ No placements in 45 days                                              │|
|  │  ❌ 2 recruiters resigning (effective Dec 15)                             │|
|  │  ❌ Manager underperforming (needs development or replacement)            │|
|  │  ❌ Client base eroding (lost 3 accounts)                                 │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  SELECT RESTRUCTURING TYPE                                               ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ○ Option 1: MERGE with another pod                                      │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Combine Pod-MX-02 with an existing pod for critical mass and          │|
|  │    stronger leadership. Typically used when pod is too small or has      │|
|  │    weak leadership.                                                       │|
|  │                                                                           │|
|  │    Recommended Merge Target: Pod-MX-01 (Manufacturing)                   │|
|  │    Combined Team Size: 8 + 8 = 16 recruiters                             │|
|  │    Combined Revenue: $166K MTD                                           │|
|  │                                                                           │|
|  │    PROS: ✅ Stronger manager (Pod-MX-01)                                  │|
|  │          ✅ Critical mass for knowledge sharing                           │|
|  │          ✅ Reduced overhead (1 manager vs 2)                             │|
|  │    CONS: ❌ Mixed focus (IT Services + Manufacturing)                     │|
|  │          ❌ Large team (16 people) for one manager                        │|
|  │                                                                           │|
|  │    [Select Option 1]                                                      │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ● Option 2: REPLACE MANAGER and stabilize                               │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Keep pod intact but replace manager with experienced leader.          │|
|  │    Demote Carlos Jr. to individual contributor role. Bring in senior     │|
|  │    manager from US or hire externally.                                   │|
|  │                                                                           │|
|  │    Potential Managers:                                                    │|
|  │    • David Kim (Pod-US-09) - Willing to relocate for 6 months            │|
|  │    • External hire - Senior Manager (3-6 month search)                   │|
|  │    • Internal promotion - Identify high-potential recruiter              │|
|  │                                                                           │|
|  │    PROS: ✅ Maintains pod focus (IT Services)                             │|
|  │          ✅ Carlos Jr. can continue as strong IC                          │|
|  │          ✅ Faster than hiring externally (David Kim available)           │|
|  │    CONS: ❌ Disruption to Pod-US-09 (David's current pod)                 │|
|  │          ❌ Relocation costs and logistics                                │|
|  │          ❌ No guarantee new manager succeeds                             │|
|  │                                                                           │|
|  │    [Selected ✓]                                                           │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ○ Option 3: DISSOLVE POD and redistribute team                          │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Shut down Pod-MX-02 entirely. Redistribute 8 recruiters to other      │|
|  │    Mexico pods (MX-01, MX-03) or US pods. Transfer active consultants    │|
|  │    and clients to other pod managers.                                    │|
|  │                                                                           │|
|  │    PROS: ✅ Eliminates underperforming unit                               │|
|  │          ✅ Strengthens other pods with talent infusion                   │|
|  │    CONS: ❌ Loss of IT Services focus in Mexico                           │|
|  │          ❌ Team morale impact (perceived failure)                        │|
|  │          ❌ Client relationship disruption                                │|
|  │                                                                           │|
|  │    [Select Option 3]                                                      │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ○ Option 4: TEMPORARY INTERVENTION (60-90 days)                         │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Bring in external senior manager from US on temporary assignment      │|
|  │    to stabilize pod. Keep Carlos Jr. as co-manager (mentorship model).   │|
|  │    After 60-90 days, evaluate if pod can stand alone or needs permanent  │|
|  │    manager change.                                                        │|
|  │                                                                           │|
|  │    PROS: ✅ Buys time to assess and develop Carlos Jr.                    │|
|  │          ✅ Immediate expertise injection                                 │|
|  │          ✅ Lower commitment than permanent manager change                │|
|  │    CONS: ❌ Temporary fix, not strategic solution                         │|
|  │          ❌ Requires finding willing temporary assignment                 │|
|  │                                                                           │|
|  │    [Select Option 4]                                                      │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Cancel]                                            [Next: Manager Selection →]|
|                                                                                |
+================================================================================+
```

**User Decision:** Select **Option 2: Replace Manager and Stabilize**

**Time:** 2-3 minutes to review options

---

### Step 3: Select New Manager

**User Action:** Click "Next: Manager Selection"

**System Response:** Wizard advances to Step 2

**Screen State:**
```
+================================================================================+
|  RESTRUCTURE POD WIZARD - Pod-MX-02 (IT Services)                        [×] |
+================================================================================+
|                                                                                |
|  Step 2 of 4: Select New Manager                                              |
|                                                                                |
|  Restructuring Type: Replace Manager                                          |
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  INTERNAL CANDIDATES                                                     ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ● David Kim (Current: Pod-US-09 Manager)                                │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Location: San Jose, CA (Willing to relocate to Mexico for 6 months)   │|
|  │    Experience: 8 years recruiting, 3 years as pod manager                │|
|  │    Current Performance: Revenue $89K MTD, Margin 26.8%                   │|
|  │    Specialization: SAP/ERP (transferable to IT Services)                 │|
|  │    Languages: English, Korean (learning Spanish)                         │|
|  │    Availability: 2 weeks notice (replacement needed for Pod-US-09)       │|
|  │                                                                           │|
|  │    STRENGTHS:                                                             │|
|  │    ✅ Proven manager (3 years experience)                                 │|
|  │    ✅ Immediate availability                                              │|
|  │    ✅ Strong client relationship skills                                   │|
|  │    ✅ Willing to mentor Carlos Jr.                                        │|
|  │                                                                           │|
|  │    CONSIDERATIONS:                                                        │|
|  │    ⚠️ Disrupts Pod-US-09 (need backfill manager)                         │|
|  │    ⚠️ Relocation costs: ~$25K (housing, travel)                          │|
|  │    ⚠️ Limited Spanish (team is bilingual, but clients may require it)    │|
|  │                                                                           │|
|  │    Backfill Plan for Pod-US-09:                                          │|
|  │    • Promote Lisa Chen (Senior Recruiter in US-09) to Acting Manager     │|
|  │    • Or merge US-09 with US-11 (both small pods)                         │|
|  │                                                                           │|
|  │    [Selected ✓]                                                           │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ○ Promote Internal Recruiter from Pod-MX-02                             │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Candidates:                                                            │|
|  │    • Ana Martinez (Senior Recruiter, 5 years exp) - Strong performer     │|
|  │      Revenue: $128K YTD, Win Rate: 42%                                   │|
|  │      Challenge: No management experience, would need intensive training  │|
|  │                                                                           │|
|  │    • Roberto Sanchez (Recruiter, 3 years exp) - High potential           │|
|  │      Revenue: $98K YTD, Win Rate: 38%                                    │|
|  │      Challenge: Less experienced, might be too early for promotion       │|
|  │                                                                           │|
|  │    PROS: ✅ No relocation, knows team/clients                             │|
|  │    CONS: ❌ Unproven, needs significant support                           │|
|  │                                                                           │|
|  │    [Select Internal Promotion]                                            │|
|  │                                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │                                                                           │|
|  │  ○ External Hire (3-6 month search)                                      │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    Post job for experienced IT Services Manager in Mexico market         │|
|  │    Salary Range: $80K-$110K base + bonus                                 │|
|  │    Timeline: 3-6 months to hire, onboard                                 │|
|  │                                                                           │|
|  │    PROS: ✅ Fresh perspective, no internal disruption                     │|
|  │    CONS: ❌ Long timeline, pod needs immediate help                       │|
|  │                                                                           │|
|  │    Note: Can pursue in parallel with David Kim temporary assignment      │|
|  │                                                                           │|
|  │    [Select External Hire]                                                 │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  CURRENT MANAGER TRANSITION                                              ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Carlos Rodriguez Jr. - Transition Plan:                                 │|
|  │                                                                           │|
|  │  ● Demote to Senior Recruiter (Individual Contributor)                   │|
|  │    ───────────────────────────────────────────────────────────────────   │|
|  │    • Maintain current salary for 6 months (performance improvement plan) │|
|  │    • Focus on recruiting excellence (he was a strong recruiter before)   │|
|  │    • Monthly coaching sessions with new manager                          │|
|  │    • If performance improves, reconsider for management in 12-18 months  │|
|  │                                                                           │|
|  │    [Selected ✓]                                                           │|
|  │                                                                           │|
|  │  ○ Transfer to different pod (Pod-MX-01 or Pod-MX-03)                    │|
|  │  ○ Performance improvement plan with 90-day review                       │|
|  │  ○ Mutual separation with severance package                              │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [← Back]  [Cancel]                            [Next: Transition Timeline →] |
|                                                                                |
+================================================================================+
```

**User Decision:** Select **David Kim** as new manager, demote Carlos Jr. to Senior Recruiter

**Time:** 3-5 minutes to review candidates

---

### Step 4: Define Transition Timeline

**User Action:** Click "Next: Transition Timeline"

**System Response:** Wizard advances to Step 3

**Screen State:**
```
+================================================================================+
|  RESTRUCTURE POD WIZARD - Pod-MX-02 (IT Services)                        [×] |
+================================================================================+
|                                                                                |
|  Step 3 of 4: Transition Timeline & Plan                                      |
|                                                                                |
|  New Manager: David Kim (from Pod-US-09)                                      |
|  Current Manager: Carlos Rodriguez Jr. → Senior Recruiter (IC)                |
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  TRANSITION TIMELINE                                                     ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Start Date: [December 15, 2025 ▼]  (2 weeks from today)                 │|
|  │  Transition Period: [60 days ▼]  (Through Feb 15, 2026)                  │|
|  │                                                                           │|
|  │  WEEK 1-2: PREPARATION (Dec 1 - Dec 14)                                  │|
|  │  ───────────────────────────────────────────────────────────────────     │|
|  │  □ Announce restructure to Pod-MX-02 team (Dec 1)                        │|
|  │  □ David Kim gives 2 weeks notice to Pod-US-09 (Dec 1)                   │|
|  │  □ Identify Pod-US-09 backfill (Lisa Chen promotion or merge plan)       │|
|  │  □ HR processes Carlos Jr. demotion paperwork (Dec 5)                    │|
|  │  □ Arrange David's housing in Mexico City (Dec 1-14)                     │|
|  │  □ Book David's relocation flight (arrive Dec 14)                        │|
|  │  □ David reviews Pod-MX-02 performance data, client list (Dec 8-14)      │|
|  │                                                                           │|
|  │  WEEK 3: HANDOVER (Dec 15 - Dec 21)                                      │|
|  │  ───────────────────────────────────────────────────────────────────     │|
|  │  □ David arrives in Mexico City (Dec 14)                                 │|
|  │  □ Official transition meeting with full pod (Dec 15)                    │|
|  │  □ Carlos Jr. hands over client relationships, active jobs (Dec 15-17)   │|
|  │  □ David meets all 8 recruiters individually (Dec 15-18)                 │|
|  │  □ David meets key clients (top 5 accounts) (Dec 16-20)                  │|
|  │  □ Carlos Jr. begins IC role, focuses on recruiting (Dec 18)             │|
|  │  □ David completes team assessment, identifies issues (Dec 21)           │|
|  │                                                                           │|
|  │  WEEK 4-8: STABILIZATION (Dec 22 - Jan 25)                               │|
|  │  ───────────────────────────────────────────────────────────────────     │|
|  │  □ David implements quick wins (process improvements) (Week 4)           │|
|  │  □ Address recruiter retention (counter-offers for 2 resigning) (Week 4) │|
|  │  □ Weekly 1:1s with each recruiter (Ongoing)                             │|
|  │  □ Bi-weekly syncs with Regional Director (Ongoing)                      │|
|  │  □ Client recovery plan for lost accounts (Week 5-8)                     │|
|  │  □ First placement target: Week 6 (Jan 5-11)                             │|
|  │  □ Team training: Objection handling, closing techniques (Week 6)        │|
|  │  □ Carlos Jr. coaching sessions with David (Weekly)                      │|
|  │  □ 30-day review with Regional Director (Jan 15)                         │|
|  │                                                                           │|
|  │  WEEK 9-12: GROWTH MODE (Jan 26 - Feb 15)                                │|
|  │  ───────────────────────────────────────────────────────────────────     │|
|  │  □ Scale recruiting activities (target: 2-3 placements/month)            │|
|  │  □ Rebuild client pipeline (add 3-5 new accounts)                        │|
|  │  □ Team morale initiatives (celebrate wins, team building)               │|
|  │  □ 60-day review: Assess if pod on track to goals (Feb 15)               │|
|  │  □ Decision: David permanent or continue temporary assignment            │|
|  │                                                                           │|
|  │  SUCCESS METRICS (60-day targets):                                       │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Revenue: >$150K MTD (vs. current $42K)                                  │|
|  │  Margin: >25% (vs. current 18.2%)                                        │|
|  │  Placements: 4-6 fills (vs. current 0)                                   │|
|  │  Retention: 0 additional resignations                                    │|
|  │  Team Engagement: >70% (vs. current 42%)                                 │|
|  │  Client Wins: 2-3 new accounts                                           │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  TEAM COMMUNICATION PLAN                                                 ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  Announcement Sequence:                                                   │|
|  │  1. Carlos Rodriguez Jr. (private) - Dec 1, 9:00 AM                      │|
|  │  2. David Kim (confirm commitment) - Dec 1, 10:00 AM                     │|
|  │  3. Pod-MX-02 team meeting - Dec 1, 2:00 PM                              │|
|  │  4. Mexico Country Manager (Carlos Sr.) - Dec 1, 3:00 PM                 │|
|  │  5. Pod-US-09 team (David's current pod) - Dec 1, 4:00 PM                │|
|  │  6. All Americas regional managers - Dec 2, 9:00 AM                      │|
|  │  7. Clients (as needed, during handover) - Dec 15-20                     │|
|  │                                                                           │|
|  │  Key Messages:                                                            │|
|  │  • "Strengthening pod for success" (not "failing pod")                   │|
|  │  • "David bringing best practices from top-performing US pod"            │|
|  │  • "Carlos Jr. returning to recruiting where he excelled"                │|
|  │  • "Commitment to Mexico market and team"                                │|
|  │                                                                           │|
|  │  [Preview Announcement Email] [Edit Messages]                            │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  COST IMPACT ANALYSIS                                                    ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  One-Time Costs:                                                          │|
|  │  • David Kim relocation: $25,000 (housing, flights, setup)               │|
|  │  • Carlos Jr. retention (maintain salary 6mo): $30,000                   │|
|  │  • Pod-US-09 backfill recruitment: $15,000                                │|
|  │  • Team training and development: $5,000                                 │|
|  │  ─────────────────────────────────────────────────────────────────────   │|
|  │  TOTAL ONE-TIME: $75,000                                                  │|
|  │                                                                           │|
|  │  Ongoing Costs (6 months):                                                │|
|  │  • David housing allowance: $3,000/month x 6 = $18,000                   │|
|  │                                                                           │|
|  │  TOTAL INVESTMENT: $93,000                                                │|
|  │                                                                           │|
|  │  Expected ROI:                                                            │|
|  │  • Revenue increase: $42K → $150K MTD = +$108K/month                     │|
|  │  • Margin improvement: 18.2% → 25% on $150K = +$10K/month                │|
|  │  • 6-month revenue impact: $648K additional                              │|
|  │  • Payback period: <1 month                                              │|
|  │                                                                           │|
|  │  ✅ Investment justified by performance improvement potential             │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [← Back]  [Cancel]                          [Next: Review & Approve →]      |
|                                                                                |
+================================================================================+
```

**User Action:** Review timeline, adjust dates if needed, click "Next: Review & Approve"

**Time:** 5-10 minutes to review and customize plan

---

### Step 5: Review and Approve Restructuring

**User Action:** Click "Next: Review & Approve"

**System Response:** Final confirmation screen

**Screen State:**
```
+================================================================================+
|  RESTRUCTURE POD WIZARD - Pod-MX-02 (IT Services)                        [×] |
+================================================================================+
|                                                                                |
|  Step 4 of 4: Review & Approve                                                |
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  RESTRUCTURING SUMMARY                                                   ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  POD: Pod-MX-02 (IT Services)                                            │|
|  │  TYPE: Manager Replacement                                               │|
|  │  START DATE: December 15, 2025                                           │|
|  │  DURATION: 60-day transition period                                      │|
|  │                                                                           │|
|  │  CHANGES:                                                                 │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Manager:     Carlos Rodriguez Jr. → David Kim                           │|
|  │  Carlos Jr.:  Pod Manager → Senior Recruiter (IC)                        │|
|  │  Team Size:   8 recruiters (unchanged)                                   │|
|  │  Focus:       IT Services (unchanged)                                    │|
|  │                                                                           │|
|  │  BACKFILL PLAN:                                                           │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Pod-US-09:   Promote Lisa Chen to Acting Pod Manager                    │|
|  │                                                                           │|
|  │  INVESTMENT:                                                              │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Total Cost:  $93,000 (6-month period)                                   │|
|  │  Expected ROI: $648,000 additional revenue over 6 months                 │|
|  │  Payback:     <1 month                                                   │|
|  │                                                                           │|
|  │  SUCCESS TARGETS (60 days):                                              │|
|  │  ────────────────────────────────────────────────────────────────────    │|
|  │  Revenue:     >$150K MTD (vs. current $42K)                              │|
|  │  Margin:      >25% (vs. current 18.2%)                                   │|
|  │  Placements:  4-6 fills (vs. current 0)                                  │|
|  │  Retention:   0 additional resignations                                  │|
|  │  Engagement:  >70% (vs. current 42%)                                     │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  APPROVALS REQUIRED                                                      ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ✅ Regional Director (You): Auto-approved                                │|
|  │  ⏳ HR Director: Notification sent for Carlos Jr. role change             │|
|  │  ⏳ CFO: Budget approval required (>$50K expenditure)                     │|
|  │  ⏳ David Kim: Formal acceptance of assignment                            │|
|  │  ⏳ Carlos Rodriguez Sr. (Mexico Country Manager): Acknowledgment         │|
|  │                                                                           │|
|  │  Note: You have authority to proceed. Other approvals are notifications. │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  AUTOMATED ACTIONS (Upon Approval)                                       ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  The system will automatically:                                          │|
|  │  □ Update Pod-MX-02 manager assignment to David Kim (effective Dec 15)   │|
|  │  □ Change Carlos Jr.'s role to Senior Recruiter                          │|
|  │  □ Update Pod-US-09 manager to Lisa Chen (Acting)                        │|
|  │  □ Generate announcement emails (queued for Dec 1 send)                  │|
|  │  □ Create calendar invites for all transition meetings                   │|
|  │  □ Set up tracking dashboard for 60-day metrics                          │|
|  │  □ Notify HR for role change processing                                  │|
|  │  □ Notify Finance for relocation expense budget                          │|
|  │  □ Create task list for David Kim (onboarding checklist)                 │|
|  │  □ Schedule bi-weekly review meetings with Regional Director             │|
|  │  □ Set 30-day and 60-day review reminders                                │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  FINAL CONFIRMATION                                                      ││|
|  │  ═══════════════════════════════════════════════════════════════════     │|
|  │                                                                           │|
|  │  ⚠️  This action will restructure Pod-MX-02 and cannot be easily undone. │|
|  │                                                                           │|
|  │  Are you sure you want to proceed?                                       │|
|  │                                                                           │|
|  │  [  ] I have reviewed all details and approve this restructuring         │|
|  │  [  ] I understand the cost impact ($93,000)                             │|
|  │  [  ] I commit to bi-weekly monitoring for 60 days                       │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [← Back]  [Cancel]                  [✓ Approve & Execute Restructuring]     |
|                                                                                |
+================================================================================+
```

**User Action:**
1. Check all three confirmation boxes
2. Click "Approve & Execute Restructuring"

**System Response:**
```
+================================================================================+
|  RESTRUCTURING APPROVED                                                       |
+================================================================================+
|                                                                                |
|  ┌──────────────────────────────────────────────────────────────────────────┐|
|  │  ✅ Pod-MX-02 Restructuring Approved                                      ││|
|  │                                                                           │|
|  │  Executing automated actions...                                          │|
|  │                                                                           │|
|  │  ✓ Pod manager assignments updated                                       │|
|  │  ✓ Role changes processed                                                │|
|  │  ✓ Announcement emails scheduled (Dec 1, 9:00 AM)                        │|
|  │  ✓ Calendar invites created                                              │|
|  │  ✓ Tracking dashboard initialized                                        │|
|  │  ✓ HR and Finance notified                                               │|
|  │  ✓ Task lists generated                                                  │|
|  │  ✓ Review meetings scheduled                                             │|
|  │                                                                           │|
|  │  Next Steps:                                                              │|
|  │  1. Meet with Carlos Jr. privately (Dec 1, 9:00 AM) - [Calendar Invite]  │|
|  │  2. Confirm with David Kim (Dec 1, 10:00 AM) - [Calendar Invite]         │|
|  │  3. Pod-MX-02 team announcement (Dec 1, 2:00 PM) - [Calendar Invite]     │|
|  │                                                                           │|
|  │  [View Restructuring Dashboard] [View Timeline] [Download Summary PDF]   │|
|  │                                                                           │|
|  └───────────────────────────────────────────────────────────────────────────┘|
|                                                                                |
|  [Close]                                                                      |
|                                                                                |
+================================================================================+
```

**Time:** 5 minutes to review and approve

---

## Postconditions

1. ✅ Pod-MX-02 restructuring plan approved and documented
2. ✅ David Kim assigned as new manager (effective Dec 15)
3. ✅ Carlos Rodriguez Jr. demoted to Senior Recruiter
4. ✅ Lisa Chen promoted to Acting Manager of Pod-US-09
5. ✅ Announcement emails scheduled
6. ✅ Transition timeline created with 60-day milestones
7. ✅ Budget allocated ($93,000 for restructuring)
8. ✅ Tracking dashboard created for monitoring progress
9. ✅ All stakeholders notified (HR, Finance, Country Managers)
10. ✅ Review meetings scheduled (30-day, 60-day)

---

## Alternative Flows

### A1: Create New Pod from Scratch

**Trigger:** Regional Director decides to create new pod for market expansion

**Flow:**
1. Click "+ Create New Pod" button
2. Select country and location
3. Define pod focus (specialization, industry, service line)
4. Assign pod manager (internal promotion or external hire)
5. Set initial team size target (4-8 recruiters)
6. Define success metrics and ramp-up timeline
7. Allocate budget and resources
8. Approve and execute

**Example Use Case:** Creating Pod-CA-04 for RBC managed services

---

### A2: Merge Two Pods

**Trigger:** Two small pods in same country performing below critical mass

**Flow:**
1. Select "Merge Pods" action
2. Choose primary pod (keeps manager) and secondary pod (dissolves)
3. Assign team members from secondary to primary
4. Transfer clients and active consultants
5. Handle redundant manager (reassign, demote, or separate)
6. Define merged pod's focus and targets
7. Communication plan for both teams
8. Approve and execute merger

**Example:** Merge Pod-MX-02 + Pod-MX-03 to create stronger combined pod

---

### A3: Dissolve Pod Completely

**Trigger:** Pod is unviable, team needs to be redistributed

**Flow:**
1. Select pod to dissolve
2. System identifies all active assignments (consultants, clients, jobs)
3. Assign each consultant to new pod manager
4. Transfer clients to appropriate pods
5. Redistribute recruiters to other pods or offer separation packages
6. Handle pod manager transition (reassign or separate)
7. Communication and change management plan
8. Execute dissolution over 30-60 days

---

### A4: Reassign Resources Between Pods

**Trigger:** Need to balance workload or move high performer to struggling pod

**Flow:**
1. Select "Reassign Resources" action
2. Choose source pod and target pod
3. Select recruiter(s) to move
4. Optionally transfer their clients/consultants with them
5. Set effective date
6. Generate communication for both pods
7. Approve and execute

**Example:** Move 2 top recruiters from Pod-US-04 to Pod-MX-02 to strengthen it

---

### A5: Set Regional Targets and Cascade to Pods

**Trigger:** Quarterly planning, need to allocate regional targets to pods

**Flow:**
1. Navigate to "Regional Targets" section
2. Set regional goals (revenue, margin, placements, etc.)
3. Select allocation method:
   - Equal distribution
   - Weighted by team size
   - Weighted by historical performance
   - Manual allocation
4. System suggests pod-level targets
5. Regional Director reviews and adjusts
6. Approve and publish targets
7. Pod managers notified of their targets

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| Manager Already Assigned | Selected manager already managing another pod | "David Kim is currently managing Pod-US-09. Proceed with reassignment?" | Confirm backfill plan or select different manager |
| Insufficient Budget | Cost exceeds regional budget | "Restructuring cost ($93K) exceeds available budget ($75K). Seek CFO approval?" | Request budget increase or reduce scope |
| Active Consultants at Risk | Dissolving pod with 12 active placements | "Warning: Pod has 12 active consultants. All must be reassigned before dissolution." | Create reassignment plan first |
| Team Member Resignation | Key recruiter resigns during transition | "Ana Martinez submitted resignation. Adjust transition plan?" | Accelerate hiring or adjust timeline |
| Manager Declines | Selected manager declines assignment | "David Kim declined Mexico assignment. Select alternative manager." | Choose backup option or external hire |

---

## Events Logged

| Event | Payload |
|-------|---------|
| `pod.restructured` | `{ pod_id: 'MX-02', type: 'manager_replacement', old_manager, new_manager, date }` |
| `manager.reassigned` | `{ user_id: 'david_kim', from_pod: 'US-09', to_pod: 'MX-02', effective_date }` |
| `role.changed` | `{ user_id: 'carlos_jr', from: 'pod_manager', to: 'senior_recruiter', reason }` |
| `pod.budget.allocated` | `{ pod_id: 'MX-02', amount: 93000, purpose: 'restructuring', approved_by }` |
| `regional.decision.approved` | `{ decision_type: 'pod_restructure', cost: 93000, roi_expected: 648000 }` |

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Context for when pod management happens
- [02-regional-dashboard.md](./02-regional-dashboard.md) - Identifying pods needing intervention
- [04-territory-planning.md](./04-territory-planning.md) - Strategic pod planning
- [05-regional-reporting.md](./05-regional-reporting.md) - Reporting on pod performance

---

*Last Updated: 2025-11-30*
