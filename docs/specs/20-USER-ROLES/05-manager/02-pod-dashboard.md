# Use Case: Monitor Pod Performance

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-MGR-001 |
| Actor | Manager |
| Goal | Monitor pod-level performance and individual IC metrics to ensure sprint targets are met |
| Frequency | Multiple times daily (primary workspace) |
| Estimated Time | 5-10 minutes per review |
| Priority | Critical (Core workflow) |

---

## Preconditions

1. User is logged in as Manager
2. Manager is assigned to an active pod
3. Pod has at least one IC member
4. Current sprint is active

---

## Trigger

One of the following:
- Manager logs in (redirects to Pod Dashboard)
- Manager wants to check pod progress
- Manager needs to identify at-risk ICs
- End of day status review
- Before stand-up meeting

---

## Main Flow (Click-by-Click)

### Step 1: Access Pod Dashboard

**Option A: Default Login Redirect**
- Manager logs in
- System automatically redirects to `/employee/manager/pod`
- Pod Dashboard loads
- Time: ~2 seconds

**Option B: Navigate from Another Screen**
- Manager presses `g` then `p` (keyboard shortcut)
- OR clicks "Pod Dashboard" in sidebar
- Pod Dashboard loads
- Time: ~1 second

**URL:** `/employee/manager/pod`

---

### Step 2: Review Sprint Progress Overview

**Screen loads with top-level metrics:**

```
+------------------------------------------------------------------+
|                    Pod Dashboard - Recruiting Pod A               |
|                                           Manager: Sarah Martinez |
+------------------------------------------------------------------+
| Current Sprint: Sprint 24 (Nov 15 - Nov 29, 2024)    [3d 12h left]|
+------------------------------------------------------------------+
| SPRINT PROGRESS                                                   |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100% (3/3)          │ |
| │                                                                │ |
| │ Target: 3 placements (1 per IC)              Actual: 3 ✅      │ |
| │ Status: ON TRACK                             Pace: Excellent   │ |
| └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
```

**Data Displayed:**
- **Sprint Name & Dates** - Current sprint identifier and date range
- **Time Remaining** - Countdown to sprint end
- **Progress Bar** - Visual representation of placements vs target
- **Target vs Actual** - Numeric comparison
- **Status** - Text status: "ON TRACK", "AT RISK", "OFF TRACK"
- **Pace** - Trend indicator: "Excellent", "Good", "Slow", "Critical"

**Field Specifications:**

| Field | Data Source | Calculation | Color Coding |
|-------|-------------|-------------|--------------|
| Sprint Progress | `placements` table | `COUNT(WHERE sprint_id AND pod_id) / target_placements` | Green: ≥100%, Yellow: 75-99%, Red: <75% |
| Time Remaining | `sprints.end_date` | `end_date - NOW()` | Red if <3 days |
| Status | Calculated | Based on pace and remaining time | Green/Yellow/Red |
| Pace | Calculated | `(placements_to_date / days_elapsed) * days_remaining` | Excellent: >100%, Good: 80-100%, Slow: 50-80%, Critical: <50% |

**Time:** ~10 seconds to scan

---

### Step 3: Review Individual IC Performance

**Scroll down to Individual Performance table:**

```
+------------------------------------------------------------------+
| INDIVIDUAL PERFORMANCE                                [Sort: Name]|
+------------------------------------------------------------------+
| ┌──────────────┬──────────┬─────────┬────────────┬─────────────┐|
| │ IC           │ Sprint   │ Pipeline│ Submissions│ Status      ││
| │              │ Progress │ Health  │ This Week  │             ││
| ├──────────────┼──────────┼─────────┼────────────┼─────────────┤|
| │ 🟢 John Smith│ 1/1 ✅   │ 12 jobs │ 8 active   │ ⬆ On Track ││
| │              │ 100%     │ 4 submit│ 3 this wk  │             ││
| │              │          │ 2 interv│            │ [Details →] ││
| ├──────────────┼──────────┼─────────┼────────────┼─────────────┤|
| │ 🟢 Mary Jones│ 1/1 ✅   │ 10 jobs │ 6 active   │ ⬆ On Track ││
| │              │ 100%     │ 3 submit│ 2 this wk  │             ││
| │              │          │ 1 interv│            │ [Details →] ││
| ├──────────────┼──────────┼─────────┼────────────┼─────────────┤|
| │ 🟢 Tom Brown │ 1/1 ✅   │ 8 jobs  │ 5 active   │ ⬆ On Track ││
| │              │ 100%     │ 2 submit│ 2 this wk  │             ││
| │              │          │ 1 interv│            │ [Details →] ││
| └──────────────┴──────────┴─────────┴────────────┴─────────────┘|
+------------------------------------------------------------------+
```

**Column Definitions:**

| Column | Description | Data Source | Drill-Down |
|--------|-------------|-------------|------------|
| IC | IC name with status indicator | `user_profiles` | Click to view IC detail |
| Sprint Progress | Placements this sprint / target | `placements` WHERE `sprint_id` | Click to view placements |
| Pipeline Health | Active jobs + submission/interview counts | `jobs`, `submissions` | Click to view pipeline |
| Submissions This Week | Active submissions + new this week | `submissions` WHERE `created_at > 7 days` | Click to view submissions |
| Status | Trend indicator + status text | Calculated | - |

**Status Indicators:**

| Indicator | Meaning | Criteria |
|-----------|---------|----------|
| 🟢 ⬆ On Track | Exceeding or meeting expectations | ≥100% of sprint target OR strong pipeline (≥3x coverage) |
| 🟡 → At Risk | May miss target without intervention | 50-99% of sprint target OR weak pipeline (<3x coverage) |
| 🔴 ⬇ Off Track | Unlikely to hit target | <50% of sprint target OR no active submissions |

**Time:** ~30 seconds to scan

---

### Step 4: Drill Into IC Details (Example: At-Risk IC)

**Scenario:** Manager notices Mary Jones is at risk

**User Action:** Click "Details →" next to Mary's row

**System Response:** Slide-in panel opens from right side

**Screen State:**
```
+------------------------------------------------------------------+
| Mary Jones - Performance Detail                            [Close]|
+------------------------------------------------------------------+
| Sprint Progress: 0/1 ⚠️ (Behind Pace)          Last Login: 2 hrs |
+------------------------------------------------------------------+
| CURRENT PIPELINE                                                  |
| • Active Jobs: 10                                                |
| • Submissions: 6 (2 submitted this week)                         |
| • Interviews: 1 scheduled (Wed 2 PM)                             |
| • Offers: 0 pending                                              |
| • Pipeline Coverage: 0.6 submissions/job ⚠️ (Target: 3x)         |
+------------------------------------------------------------------+
| ACTIVITY THIS WEEK (Nov 22-29)                                    |
| • Screening Calls: 8 ✅ (above avg)                              |
| • Submissions Created: 2 ⚠️ (below target of 5)                  |
| • Client Follow-ups: 5 ✅                                        |
| • Emails Logged: 12                                              |
| • Total Activities: 27                                           |
+------------------------------------------------------------------+
| BLOCKERS & NOTES                                                  |
| Last stand-up (Nov 28):                                           |
| "Working on 3 submissions for React role at Google. Client slow  |
|  to respond on previous submissions."                            |
|                                                                   |
| Manager Note (Nov 25):                                            |
| "Mary's pipeline looks thin. Follow up on Google submissions."   |
+------------------------------------------------------------------+
| RECENT PLACEMENTS                                                 |
| • Kevin Lee → Microsoft (Nov 20) - 9 days ago ✅                 |
| • Sarah Chen → Amazon (Oct 15) - 44 days ago                     |
+------------------------------------------------------------------+
| STRENGTHS & CONCERNS                                              |
| ✅ Strengths:                                                     |
| • High activity level (27 activities this week)                  |
| • Good screening volume (8 calls)                                |
| • Last placement was high quality (client feedback: 4.8/5)       |
|                                                                   |
| ⚠️ Concerns:                                                      |
| • Low submission rate (2 vs target 5 per week)                   |
| • Pipeline coverage below 3x (0.6 submissions/job)               |
| • 45-day gap between placements (previous placement was Oct 15)  |
|                                                                   |
| Recommended Actions:                                              |
| 1. Check on Google client responsiveness (may need escalation)   |
| 2. Review submission quality (are candidates strong matches?)    |
| 3. Discuss pipeline strategy in next 1:1 (scheduled tomorrow)    |
+------------------------------------------------------------------+
| [Schedule 1:1] [Send Message] [View Full History] [Close]        |
+------------------------------------------------------------------+
```

**Manager Analysis (Internal):**
- Mary is active (27 activities) but not converting to submissions
- Possible issue: Client ghosting (Google slow to respond)
- Possible issue: Candidate quality (screening many, submitting few)
- Action: Schedule 1:1 to discuss (already scheduled tomorrow)

**User Action:** Manager clicks "Send Message"

**System Response:** Message modal opens

**Manager types:**
```
Hi Mary,

I noticed Google has been slow to respond on your recent submissions.
If you don't hear back by EOD tomorrow, let's escalate to my contact
there to get feedback.

Also, great job on activity this week - 8 screening calls is awesome!
Let's discuss your submission strategy in our 1:1 tomorrow.

- Sarah
```

**User Action:** Click "Send"

**System Response:**
- Message sent to Mary (in-app notification + email)
- Activity logged: `type: note`, `entity: mary_jones`, `notes: [message]`
- Modal closes
- Time: ~3 minutes total for drill-down + message

---

### Step 5: Review Pipeline Health (Pod-Level)

**User Action:** Scroll down to "Pipeline Health" section

**Screen State:**
```
+------------------------------------------------------------------+
| PIPELINE HEALTH                                      [This Sprint]|
+------------------------------------------------------------------+
| Coverage Ratio: 0.63 submissions/job ⚠️ (Target: 3x)            |
|                                                                   |
| Active Jobs: 30 total                                            |
| ┌──────────────────────────────────────────────────────────────┐ |
| │ No Submissions: 8 jobs 🔴 (27%)                              │ |
| │ 1-2 Submissions: 14 jobs 🟡 (47%)                            │ |
| │ 3+ Submissions: 8 jobs 🟢 (27%)                              │ |
| └──────────────────────────────────────────────────────────────┘ |
|                                                                   |
| Submission Funnel:                                                |
| ┌─────────────┬───────┬──────────────────────────────────────┐   |
| │ Stage       │ Count │ Progress                             │   |
| ├─────────────┼───────┼──────────────────────────────────────┤   |
| │ Sourced     │  12   │ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░                │   |
| │ Screening   │  7    │ ▓▓▓▓▓░░░░░░░░░░░░░░░░░                │   |
| │ Submitted   │  6    │ ▓▓▓▓░░░░░░░░░░░░░░░░░░                │   |
| │ Interview   │  3    │ ▓▓░░░░░░░░░░░░░░░░░░░░                │   |
| │ Offer       │  1    │ ▓░░░░░░░░░░░░░░░░░░░░░                │   |
| │ Placed      │  3    │ ▓▓░░░░░░░░░░░░░░░░░░░░                │   |
| └─────────────┴───────┴──────────────────────────────────────┘   |
|                                                                   |
| Conversion Rates:                                                 |
| • Sourced → Submitted: 50% ✅ (Target: 40%+)                     |
| • Submitted → Interview: 50% ✅ (Target: 30%+)                   |
| • Interview → Offer: 33% ⚠️ (Target: 40%+)                       |
| • Offer → Placed: 100% ✅ (Target: 80%+)                         |
+------------------------------------------------------------------+
| JOBS NEEDING ATTENTION                                            |
| ┌────────────────────────────────┬──────────┬──────────────────┐ |
| │ Job                            │ Status   │ Action Needed    │ |
| ├────────────────────────────────┼──────────┼──────────────────┤ |
| │ Senior Java @ Netflix (Urgent) │ 0 submits│ Assign priority  │ |
| │ React Lead @ Stripe            │ 0 submits│ Assign priority  │ |
| │ DevOps @ Google                │ Stale 7d │ Follow up client │ |
| │ Full-stack @ Meta              │ Stale 10d│ Follow up client │ |
| └────────────────────────────────┴──────────┴──────────────────┘ |
|                                                                   |
| [View All Jobs] [Assign Priorities] [Bulk Follow-up]             |
+------------------------------------------------------------------+
```

**Field Specifications:**

| Field | Description | Data Source | Calculation |
|-------|-------------|-------------|-------------|
| Coverage Ratio | Avg submissions per job | `submissions`, `jobs` | `COUNT(submissions) / COUNT(active_jobs)` |
| No Submissions | Jobs with 0 submissions | `jobs` LEFT JOIN `submissions` | `WHERE submission_count = 0` |
| Submission Funnel | Count by stage | `submissions.status` | `COUNT(*) GROUP BY status` |
| Conversion Rates | % moving between stages | `submissions` | `(next_stage_count / current_stage_count) * 100` |
| Stale Jobs | Jobs with no activity in 7+ days | `activities` | `WHERE last_activity < NOW() - INTERVAL '7 days'` |

**Manager Identifies Issues:**
- 8 jobs with no submissions (27% of jobs) - needs immediate action
- Coverage ratio 0.63 (target 3x) - pipeline is weak
- Interview → Offer conversion is 33% (below 40% target) - may indicate candidate quality issue

**Time:** ~1 minute to scan

---

### Step 6: Review Escalations & Approvals

**User Action:** Click "Escalations" tab at top of dashboard

**Screen State:**
```
+------------------------------------------------------------------+
| ESCALATIONS QUEUE                                   [2 URGENT 🔴]|
+------------------------------------------------------------------+
| ┌────────┬─────────────────────────┬──────────┬────────────────┐|
| │Priority│ Issue                   │ Reporter │ Age            ││
| ├────────┼─────────────────────────┼──────────┼────────────────┤|
| │ 🔴     │ Client complaint - Rate │ John S.  │ 8 hours        ││
| │ URGENT │ increase unauthorized   │          │ [Handle Now]   ││
| ├────────┼─────────────────────────┼──────────┼────────────────┤|
| │ 🟡     │ Candidate withdrew from │ Tom B.   │ 2 hours        ││
| │ MEDIUM │ interview last minute   │          │ [View Details] ││
| └────────┴─────────────────────────┴──────────┴────────────────┘|
+------------------------------------------------------------------+
```

**User Action:** Click "Approvals" tab

**Screen State:**
```
+------------------------------------------------------------------+
| APPROVALS QUEUE                                     [1 PENDING ⚠️]|
+------------------------------------------------------------------+
| ┌───────────────────────────┬──────────┬──────────┬────────────┐|
| │ Item                      │ Requester│ Amount   │ Action     ││
| ├───────────────────────────┼──────────┼──────────┼────────────┤|
| │ Submission: Michael Chen  │ Mary J.  │ $115/hr  │ [Approve]  ││
| │ → Stripe Staff Engineer   │          │ (Max:    │ [Reject]   ││
| │ Rate above job max        │          │ $110)    │ [Details]  ││
| └───────────────────────────┴──────────┴──────────┴────────────┘|
+------------------------------------------------------------------+
```

**Time:** ~30 seconds to scan

---

### Step 7: Review Recent Activity (Pod-Wide)

**User Action:** Scroll to "Recent Activity" section

**Screen State:**
```
+------------------------------------------------------------------+
| RECENT ACTIVITY                                [Last 24 hours 📅]|
+------------------------------------------------------------------+
| 🎉 Tom Brown made a placement: Kevin Lee → Oracle (8:45 AM)      |
| 📧 Mary Jones submitted Michael Chen → Stripe (8:30 AM)          |
| 📞 John Smith screening call with candidate (8:15 AM)            |
| 📧 Tom Brown follow-up email to Salesforce (7:50 AM)             |
| 📞 Mary Jones client call with Microsoft (Yesterday 4:30 PM)     |
| 📅 John Smith scheduled interview for Maria (Yesterday 3:15 PM)  |
| 📧 Tom Brown submitted candidate to Oracle (Yesterday 2:45 PM)   |
| 🎯 Mary Jones added 5 candidates to pipeline (Yesterday 1:20 PM) |
| 📞 John Smith candidate screening (Yesterday 11:00 AM)           |
| 📧 Tom Brown client follow-up (Yesterday 10:30 AM)               |
|                                                                   |
| [View Full Timeline] [Filter by IC] [Filter by Type]             |
+------------------------------------------------------------------+
```

**Activity Icons:**
- 🎉 Placement
- 📧 Email
- 📞 Call
- 📅 Meeting/Interview scheduled
- 🎯 Pipeline action (add candidate, update status)
- 💬 Note

**Time:** ~30 seconds to scan

---

### Step 8: Export Report (Optional)

**User Action:** Click "Export Report" button at top right

**System Response:** Modal opens

**Screen State:**
```
+------------------------------------------------------------------+
| Export Pod Performance Report                                     |
+------------------------------------------------------------------+
| Report Type:                                                      |
| ○ Daily Summary                                                  |
| ● Sprint Progress Report                                         |
| ○ Individual IC Report                                           |
| ○ Pipeline Health Report                                         |
|                                                                   |
| Time Period:                                                      |
| ● Current Sprint (Nov 15 - Nov 29)                               |
| ○ Last Sprint                                                    |
| ○ Last 30 Days                                                   |
| ○ Custom Range: [____] to [____]                                 |
|                                                                   |
| Include:                                                          |
| ☑ Sprint Progress                                                |
| ☑ Individual IC Metrics                                          |
| ☑ Pipeline Breakdown                                             |
| ☑ Activity Summary                                               |
| ☐ Detailed Activity Log                                          |
|                                                                   |
| Format:                                                           |
| ● PDF                                                            |
| ○ Excel                                                          |
| ○ CSV                                                            |
|                                                                   |
| [Cancel] [Generate Report]                                       |
+------------------------------------------------------------------+
```

**User Action:** Click "Generate Report"

**System Response:**
- Report generates (5-10 seconds)
- PDF downloads automatically
- Toast notification: "Sprint Progress Report downloaded"
- Time: ~15 seconds total

---

## Postconditions

1. ✅ Manager has clear understanding of pod status
2. ✅ At-risk ICs identified
3. ✅ Escalations triaged
4. ✅ Approvals identified
5. ✅ Pipeline gaps identified
6. ✅ Action items created (if needed)
7. ✅ Messages sent to ICs (if needed)

---

## Events Logged

| Event | Payload |
|-------|---------|
| `dashboard.viewed` | `{ user_id, dashboard_type: 'pod', timestamp }` |
| `ic_detail.viewed` | `{ manager_id, ic_id, timestamp }` |
| `message.sent` | `{ from: manager_id, to: ic_id, type: 'coaching', timestamp }` |
| `report.exported` | `{ user_id, report_type, time_period, timestamp }` |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No Pod Assignment | Manager not assigned to pod | "You are not currently assigned to a pod. Contact Admin." | Contact Admin to assign pod |
| Empty Pod | Pod has no IC members | "Your pod has no members. Add ICs to start tracking performance." | Add ICs via Pod Settings |
| No Active Sprint | No sprint configured | "No active sprint found. Create a sprint to track progress." | Create sprint via Sprint Planning |
| Data Load Failure | API error | "Failed to load pod data. Please refresh." | Refresh page or contact support |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Sprint Progress | Must have active sprint | "No active sprint" |
| IC Metrics | IC must belong to pod | "IC not in pod" |
| Pipeline Coverage | Must have jobs to calculate | "No active jobs" |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `g p` | Go to Pod Dashboard |
| `r` | Refresh dashboard |
| `1-9` | Jump to IC detail (1 = first IC, 2 = second, etc.) |
| `e` | View Escalations |
| `a` | View Approvals |
| `x` | Export report |
| `/` | Search/filter |

---

## Alternative Flows

### A1: Manager Has Multiple Pods

**Scenario:** Manager oversees 2+ pods

1. Pod Dashboard shows dropdown: "Select Pod: Recruiting A | Recruiting B"
2. Manager selects pod from dropdown
3. Dashboard updates to show selected pod's data
4. Manager can compare pods side-by-side (split view option)

### A2: Mid-Sprint Status Check

**Scenario:** COO asks for mid-sprint update

1. Manager opens Pod Dashboard
2. Clicks "Export Report" → "Sprint Progress Report"
3. Selects "PDF" format
4. Clicks "Generate Report"
5. Shares PDF with COO via email or Slack

### A3: Identifying Systemic Issue

**Scenario:** All ICs have weak pipelines (not just one)

1. Manager reviews Pipeline Health section
2. Sees coverage ratio 0.5 across all ICs
3. Identifies root cause: Client responsiveness is slow (many stale jobs)
4. Manager escalates to COO: "Need client engagement strategy"
5. Manager adjusts sprint target or extends deadline

---

## UI/UX Specifications

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header (Pod name, manager, sprint info)                 │
├─────────────────────────────────────────────────────────┤
│ Sprint Progress (visual progress bar + metrics)         │
├─────────────────────────────────────────────────────────┤
│ Individual Performance (table with IC rows)             │
├─────────────────────────────────────────────────────────┤
│ Pipeline Health (funnel, conversion rates, coverage)    │
├─────────────────────────────────────────────────────────┤
│ Escalations & Approvals (counts + quick links)          │
├─────────────────────────────────────────────────────────┤
│ Recent Activity (timeline of last 10 activities)        │
└─────────────────────────────────────────────────────────┘
```

### Color Coding Standards

| Color | Meaning | Usage |
|-------|---------|-------|
| Green (🟢) | On track, healthy | Sprint progress ≥100%, IC on target |
| Yellow (🟡) | At risk, needs attention | Sprint progress 50-99%, IC behind |
| Red (🔴) | Off track, critical | Sprint progress <50%, IC far behind |
| Blue (🔵) | Informational | Neutral metrics |

### Responsive Design

- Desktop (1920x1080): Full 3-column layout
- Laptop (1440x900): 2-column layout, some sections stack
- Tablet (768x1024): Single column, all sections stack
- Mobile (375x667): Not optimized (managers typically use desktop)

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 2 seconds | Time to First Contentful Paint |
| Data Refresh | < 500ms | API response time |
| IC Detail Slide-in | < 300ms | Animation + data load |
| Export Report | < 10 seconds | PDF generation time |

---

## Data Refresh Strategy

- **Auto-refresh:** Every 5 minutes (configurable)
- **Manual refresh:** "Refresh" button or `r` key
- **Real-time updates:** WebSocket for critical events (placements, escalations)
- **Stale data indicator:** "Last updated: 3 minutes ago"

---

## Related Use Cases

- [01-daily-workflow.md](./01-daily-workflow.md) - Manager's typical day includes dashboard review
- [03-handle-escalation.md](./03-handle-escalation.md) - Drill into escalation from dashboard
- [04-approve-submission.md](./04-approve-submission.md) - Approve submission from dashboard
- [05-conduct-1on1.md](./05-conduct-1on1.md) - Use IC metrics to prepare for 1:1

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Load dashboard with active sprint | All metrics display correctly |
| TC-002 | Load dashboard with no active sprint | Show "No active sprint" message |
| TC-003 | Click IC details | Slide-in panel opens with IC metrics |
| TC-004 | Filter pipeline by IC | Pipeline shows only selected IC's jobs |
| TC-005 | Export sprint report | PDF downloads with correct data |
| TC-006 | Auto-refresh after 5 minutes | Dashboard updates without full page reload |
| TC-007 | Navigate to escalation from dashboard | Escalation detail opens |
| TC-008 | IC has 0 placements mid-sprint | Shows "At Risk" status in yellow |

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/trpc/manager.getPodDashboard` | GET | Fetch pod overview data |
| `/api/trpc/manager.getICPerformance` | GET | Fetch individual IC metrics |
| `/api/trpc/manager.getPipelineHealth` | GET | Fetch pod pipeline data |
| `/api/trpc/manager.getEscalations` | GET | Fetch pending escalations |
| `/api/trpc/manager.getApprovals` | GET | Fetch pending approvals |
| `/api/trpc/manager.exportReport` | POST | Generate and download report |

---

## Backend Calculations

### Sprint Progress Calculation

```typescript
function calculateSprintProgress(podId: string, sprintId: string) {
  const targetPlacements = await db.query(`
    SELECT COUNT(DISTINCT ic.id) as ic_count
    FROM pods p
    JOIN user_profiles ic ON ic.pod_id = p.id
    WHERE p.id = ${podId} AND ic.is_active = true
  `);

  const actualPlacements = await db.query(`
    SELECT COUNT(*) as placement_count
    FROM placements
    WHERE pod_id = ${podId}
      AND sprint_id = ${sprintId}
      AND status = 'active'
  `);

  const progress = (actualPlacements / targetPlacements) * 100;

  return {
    target: targetPlacements,
    actual: actualPlacements,
    percentage: progress,
    status: progress >= 100 ? 'ON TRACK' : progress >= 75 ? 'AT RISK' : 'OFF TRACK'
  };
}
```

### Pipeline Coverage Calculation

```typescript
function calculatePipelineCoverage(podId: string) {
  const activeJobs = await db.query(`
    SELECT COUNT(*) as job_count
    FROM jobs
    WHERE pod_id = ${podId} AND status = 'active'
  `);

  const activeSubmissions = await db.query(`
    SELECT COUNT(*) as submission_count
    FROM submissions
    WHERE pod_id = ${podId}
      AND status IN ('sourced', 'screening', 'submitted', 'interview')
  `);

  const coverageRatio = activeSubmissions / activeJobs;

  return {
    jobs: activeJobs,
    submissions: activeSubmissions,
    coverage: coverageRatio,
    health: coverageRatio >= 3 ? 'HEALTHY' : coverageRatio >= 1.5 ? 'MODERATE' : 'WEAK'
  };
}
```

---

*Last Updated: 2024-11-30*
