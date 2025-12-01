# Use Case: Recruiter Dashboard

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-024 |
| Actor | Recruiter |
| Goal | Monitor personal performance, track goals, and manage daily activities |
| Frequency | Multiple times daily |
| Estimated Time | 2-5 minutes per view |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has active jobs, candidates, or placements
3. Dashboard configured with default widgets

---

## Trigger

One of the following:
- Daily login (first screen after auth)
- Click "My Dashboard" in sidebar
- Morning routine to plan day
- Mid-day progress check
- End-of-day review
- Sprint planning session

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Dashboard

**User Action:** Click "My Dashboard" in sidebar or login redirect

**System Response:**
- Dashboard page loads
- Widgets populate with real-time data
- URL changes to: `/employee/workspace/dashboard`

**Screen State:**
```
+----------------------------------------------------------+
| MY DASHBOARD - John Smith                     [⚙ Settings]|
| Last updated: Just now                      [🔄 Refresh]  |
+----------------------------------------------------------+
|                                                           |
| SPRINT PROGRESS (Week 1 of 2: Nov 25 - Dec 8)            |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │  PLACEMENTS          REVENUE           SUBMISSIONS  │  |
| │  ┌──────────┐       ┌──────────┐      ┌─────────┐ │  |
| │  │  1 / 2   │       │$18K/$25K │      │  8 / 10 │ │  |
| │  │   50%    │       │   72%    │      │   80%   │ │  |
| │  │   🟡     │       │   🟡     │      │   🟢    │ │  |
| │  └──────────┘       └──────────┘      └─────────┘ │  |
| │                                                     │  |
| │  INTERVIEWS         CANDIDATES         JOB FILL    │  |
| │  ┌──────────┐       ┌──────────┐      ┌─────────┐ │  |
| │  │  2 / 3   │       │ 71 / 75  │      │  6 / 12 │ │  |
| │  │   67%    │       │   95%    │      │   50%   │ │  |
| │  │   🟡     │       │   🟢     │      │   🟢    │ │  |
| │  └──────────┘       └──────────┘      └─────────┘ │  |
| │                                                     │  |
| │  Days remaining: 6                                  │  |
| │  On track to hit: 4 of 6 goals ⚠                   │  |
| │                                                     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| TODAY'S PRIORITIES                     [View All Tasks]  |
| ┌────────────────────────────────────────────────────┐  |
| │ ⚠ OVERDUE (2)                                      │  |
| │ • Send weekly update to Google (2 days overdue)    │  |
| │ • Complete 30-day check-in for Alex R. (1 day)     │  |
| │                                                     │  |
| │ 📅 DUE TODAY (4)                                   │  |
| │ • Call Sarah Chen at 2 PM (Google check-in)        │  |
| │ • Submit 2 candidates for React Developer role     │  |
| │ • Create job req for Full-Stack Engineer (Google)  │  |
| │ • Phone screen with Jane Doe at 3 PM               │  |
| │                                                     │  |
| │ 📌 HIGH PRIORITY (3)                               │  |
| │ • Follow up on 3 pending interview feedbacks       │  |
| │ • Source 10 DevOps candidates for TechStart        │  |
| │ • Prepare for QBR with Meta tomorrow               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PIPELINE HEALTH                         [View Details]   |
| ┌────────────────────────────────────────────────────┐  |
| │ Active Jobs:            12 (6 urgent, 4 high)       │  |
| │ Candidates Sourcing:    23 (need follow-up)         │  |
| │ Submissions Pending:    5 (awaiting feedback)       │  |
| │ Interviews This Week:   4 (2 need scheduling)       │  |
| │ Offers Outstanding:     1 (needs follow-up)         │  |
| │ Placements Active:      8 (2 due for check-in)      │  |
| │                                                     │  |
| │ 🔥 URGENT ATTENTION NEEDED:                         │  |
| │ • DevOps Engineer job (21 days old, weak pipeline) │  |
| │ • React Developer interview feedback overdue (3d)   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ACCOUNT PORTFOLIO                      [View Accounts]   |
| ┌────────────────────────────────────────────────────┐  |
| │ 🟢 Google Inc           8 jobs • $458K YTD • NPS: 9│  |
| │    Last contact: 2 days ago • Weekly call tomorrow  │  |
| │                                                     │  |
| │ 🟢 Meta                 5 jobs • $312K YTD • NPS: 8│  |
| │    Last contact: 5 days ago • Status: Healthy       │  |
| │                                                     │  |
| │ 🟡 TechStart Inc        2 jobs • $85K YTD • NPS: 7 │  |
| │    Last contact: 12 days ago ⚠ Need check-in       │  |
| │                                                     │  |
| │ 🔴 Acme Corp            1 job • $0 YTD • NPS: 6    │  |
| │    Last contact: 18 days ago 🚨 AT RISK            │  |
| │                                                     │  |
| │ Total Accounts: 8 (6 active, 2 at risk)             │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| ACTIVITY SUMMARY (Last 7 Days)          [View All]      |
| ┌────────────────────────────────────────────────────┐  |
| │ Calls Logged:           18 (avg: 2.6/day)          │  |
| │ Emails Sent:            42 (avg: 6/day)            │  |
| │ Meetings:               6 (3 client, 3 internal)    │  |
| │ Candidates Sourced:     71 (on track)              │  |
| │ Phone Screens:          23 (ahead of target)        │  |
| │ Submissions Sent:       8 (on track)               │  |
| │ Interviews Scheduled:   2 (below target)           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| QUALITY METRICS (Last 30 Days)                           |
| ┌────────────────────────────────────────────────────┐  |
| │ Time-to-Submit:         36 hours ✅ (Target: <48)  │  |
| │ Time-to-Fill:           18 days ✅ (Target: <21)   │  |
| │ Submission Quality:     85% → Interview ✅          │  |
| │ Interview-to-Offer:     42% ✅ (Target: >40%)      │  |
| │ Offer Acceptance:       88% ✅ (Target: >85%)      │  |
| │ 30-Day Retention:       97% ✅ (Target: >95%)      │  |
| │                                                     │  |
| │ Overall Quality Score:  92/100 🌟                   │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| UPCOMING CALENDAR                        [View Calendar] |
| ┌────────────────────────────────────────────────────┐  |
| │ TODAY (Dec 5)                                       │  |
| │ • 2:00 PM - Weekly check-in: Google (Sarah Chen)   │  |
| │ • 3:00 PM - Phone screen: Jane Doe                 │  |
| │ • 4:30 PM - Team standup                           │  |
| │                                                     │  |
| │ TOMORROW (Dec 6)                                    │  |
| │ • 10:00 AM - QBR: Meta                             │  |
| │ • 2:00 PM - 1-on-1 with Manager                    │  |
| │                                                     │  |
| │ THIS WEEK                                           │  |
| │ • 4 client calls scheduled                          │  |
| │ • 6 candidate interviews                            │  |
| │ • 2 internal meetings                               │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| RECENT WINS 🎉                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ • Placement confirmed: Alex Rodriguez @ Google      │  |
| │ • Offer accepted: Maria Garcia @ Meta               │  |
| │ • Client testimonial received from TechStart        │  |
| │ • Hit 100% of submissions target last sprint        │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~2 seconds to load

---

### Step 2: Review Sprint Progress Widget

**User Action:** Review primary metrics in Sprint Progress widget

**Widget Specification: Sprint Progress**

| Metric | Calculation | Color Coding | Action Trigger |
|--------|-------------|--------------|----------------|
| Placements | Count(status='placed', sprint) | 🟢 ≥100%, 🟡 50-99%, 🔴 <50% | Below target: Increase activity |
| Revenue | Sum(bill_rate × hours × margin) | 🟢 ≥100%, 🟡 70-99%, 🔴 <70% | Below target: Focus on high-value jobs |
| Submissions | Count(status='submitted', sprint) | 🟢 ≥100%, 🟡 80-99%, 🔴 <80% | Below target: More sourcing |
| Interviews | Count(interviews_scheduled, sprint) | 🟢 ≥100%, 🟡 67-99%, 🔴 <67% | Below target: Follow up on submissions |
| Candidates | Count(candidates_sourced, sprint) | 🟢 ≥100%, 🟡 90-99%, 🔴 <90% | Below target: Increase sourcing time |
| Job Fill Rate | (Filled / Total) × 100 | 🟢 ≥50%, 🟡 30-49%, 🔴 <30% | Contextual, varies by job age |

**System Response:**
- Hovering over any metric shows trend chart
- Click metric to drill down to details
- Red/yellow indicators highlight areas needing attention

**Time:** ~30 seconds

---

### Step 3: Review Today's Priorities

**User Action:** Scan "Today's Priorities" section

**System Response:**
- Tasks auto-prioritized by:
  1. Overdue items (red)
  2. Due today (orange)
  3. High priority (yellow)
  4. Upcoming (gray)
- Click task to open detail or mark complete

**Task Prioritization Logic:**
```sql
ORDER BY
  CASE
    WHEN due_date < CURRENT_DATE THEN 1  -- Overdue
    WHEN due_date = CURRENT_DATE THEN 2  -- Due today
    WHEN priority = 'critical' THEN 3    -- Critical
    WHEN priority = 'high' THEN 4        -- High priority
    ELSE 5                               -- Normal
  END,
  due_date ASC,
  created_at DESC
```

**Time:** ~1 minute

---

### Step 4: Check Pipeline Health Alerts

**User Action:** Review "Pipeline Health" widget for urgent items

**System Response:**
- Alerts shown for items needing immediate attention
- Color-coded by urgency
- Click to navigate to specific entity

**Alert Rules:**

| Alert | Trigger Condition | Action |
|-------|------------------|--------|
| Old Job, Weak Pipeline | Job age > 14 days AND candidates < 5 | Increase sourcing |
| Stale Submission | Submission sent > 3 days ago, no feedback | Follow up with client |
| Interview No-Show | Interview marked no-show | Contact candidate, reschedule |
| Offer Expiring | Offer sent > 3 days, no response | Follow up urgently |
| Check-in Overdue | Placement check-in > 3 days overdue | Complete check-in |
| Client No Contact | Last contact > 14 days | Schedule check-in call |

**Time:** ~1 minute

---

### Step 5: Monitor Account Health

**User Action:** Review "Account Portfolio" widget

**System Response:**
- Shows all accounts with health indicators
- Sorted by risk level (at-risk first)
- Click account to view details

**Account Health Scoring:**
```
🟢 Healthy (Score 70-100):
  - Last contact < 7 days
  - NPS ≥ 8
  - Active jobs
  - No overdue items

🟡 Needs Attention (Score 40-69):
  - Last contact 7-14 days
  - NPS 6-7
  - Some concerns

🔴 At Risk (Score 0-39):
  - Last contact > 14 days
  - NPS < 6
  - Escalations or issues
  - No recent activity
```

**Time:** ~1 minute

---

### Step 6: Review Activity Summary

**User Action:** Check "Activity Summary" to see daily averages

**System Response:**
- Shows trailing 7-day metrics
- Compares to targets
- Identifies gaps

**Activity Targets:**

| Activity | Daily Target | Weekly Target | Tracking |
|----------|--------------|---------------|----------|
| Calls | 3 | 15 | Logged activities |
| Emails | 5 | 25 | Sent emails |
| Meetings | 1 | 5 | Calendar events |
| Candidates Sourced | 15 | 75 | New candidate records |
| Phone Screens | 5 | 25 | Screening activities |
| Submissions | 1 | 5 | Submission records |
| Interviews | 0.5 | 3 | Interview events |

**Time:** ~30 seconds

---

### Step 7: Check Quality Metrics

**User Action:** Review "Quality Metrics" widget

**System Response:**
- Shows trailing 30-day quality indicators
- Green check (✅) if meeting target
- Red X (❌) if below target

**Quality Score Calculation:**
```
Overall Quality Score = (
  (Time-to-Submit score × 15%) +
  (Time-to-Fill score × 15%) +
  (Submission Quality × 25%) +
  (Interview-to-Offer × 20%) +
  (Offer Acceptance × 15%) +
  (30-Day Retention × 10%)
) / 100

Each metric scored 0-100 based on distance from target
```

**Time:** ~30 seconds

---

### Step 8: View Upcoming Calendar

**User Action:** Review "Upcoming Calendar" widget

**System Response:**
- Shows today's schedule
- Tomorrow's schedule
- Week overview
- Click to view full calendar

**Time:** ~30 seconds

---

### Step 9: Customize Dashboard (Optional)

**User Action:** Click "⚙ Settings" to customize widgets

**System Response:**
- Dashboard settings modal opens
- Can add/remove/rearrange widgets

**Screen State:**
```
+----------------------------------------------------------+
|                                  Dashboard Settings      |
+----------------------------------------------------------+
|                                                           |
| AVAILABLE WIDGETS                                         |
| ┌────────────────────────────────────────────────────┐  |
| │ ✅ Sprint Progress (always visible)                 │  |
| │ ✅ Today's Priorities                               │  |
| │ ✅ Pipeline Health                                  │  |
| │ ✅ Account Portfolio                                │  |
| │ ✅ Activity Summary                                 │  |
| │ ✅ Quality Metrics                                  │  |
| │ ✅ Upcoming Calendar                                │  |
| │ ✅ Recent Wins                                      │  |
| │ ⬜ Revenue Chart (add)                              │  |
| │ ⬜ Placement Timeline (add)                         │  |
| │ ⬜ Top Candidates (add)                             │  |
| │ ⬜ Team Leaderboard (add)                           │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| WIDGET ORDER                                              |
| [Drag to reorder]                                         |
| 1. Sprint Progress                                        |
| 2. Today's Priorities ≡                                   |
| 3. Pipeline Health ≡                                      |
| 4. Account Portfolio ≡                                    |
| ...                                                       |
|                                                           |
| REFRESH FREQUENCY                                         |
| ○ Real-time  ○ Every 5 min  ○ Every 15 min  ○ Manual     |
|                                                           |
+----------------------------------------------------------+
|                       [Cancel]  [Save Settings ✓]        |
+----------------------------------------------------------+
```

**Time:** ~2 minutes

---

## Postconditions

1. ✅ Dashboard viewed and metrics reviewed
2. ✅ High-priority items identified
3. ✅ Day planned based on priorities
4. ✅ At-risk accounts flagged
5. ✅ Quality issues identified

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g` then `d` | Go to dashboard |
| `r` | Refresh dashboard |
| `1-9` | Jump to widget (by number) |
| `t` | View tasks |
| `c` | View calendar |

---

## Alternative Flows

### A1: Mobile Dashboard View

Simplified mobile version:
1. Sprint Progress (compact)
2. Today's Tasks (collapsed)
3. Urgent Alerts only
4. Quick actions

### A2: Executive Summary View

If manager viewing recruiter's dashboard:
1. Aggregate team metrics
2. Comparison to team average
3. Strengths and improvement areas

---

## Related Use Cases

- [25-recruiter-reports.md](./25-recruiter-reports.md) - Detailed reporting
- [01-daily-workflow.md](./01-daily-workflow.md) - Daily routine

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | View dashboard with all metrics green | All widgets show green indicators |
| TC-002 | Overdue task exists | Appears at top in red |
| TC-003 | Account not contacted 15+ days | Shows red in portfolio |
| TC-004 | Below sprint target | Yellow/red indicator shown |
| TC-005 | Click metric | Drill-down view opens |
| TC-006 | Customize widget order | Saved and persists |
| TC-007 | Real-time refresh enabled | Updates every 5 seconds |

---

## Backend Processing

### tRPC Procedures

- `dashboard.getMetrics` - Fetch all dashboard data
- `dashboard.getSprintProgress` - Sprint metrics
- `dashboard.getAccountHealth` - Account scores
- `dashboard.getTasks` - Prioritized task list
- `dashboard.saveSettings` - Save customization

---

*Last Updated: 2025-11-30*
