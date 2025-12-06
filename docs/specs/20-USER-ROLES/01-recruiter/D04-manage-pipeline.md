# Use Case: Manage Pipeline

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-007 |
| Actor | Recruiter (Technical Recruiter) |
| Goal | Monitor and manage candidate submissions across all pipeline stages to identify bottlenecks, move candidates, and optimize conversion rates |
| Frequency | Multiple times daily (5-10 sessions per day) |
| Estimated Time | 10-15 minutes per session |
| Priority | CRITICAL (Daily Operations) |
| Business Impact | Pipeline velocity, conversion optimization, revenue forecasting, bottleneck identification |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "submission.view" permission (default for Recruiter role)
3. At least one submission exists in the system
4. User is assigned to one or more active jobs
5. Pipeline stages are configured in system settings

---

## Trigger

One of the following:
- Daily morning pipeline review (standard workflow)
- Manager requests pipeline status update
- Need to identify stale submissions requiring action
- Client requests status on submitted candidates
- Sprint review - checking progress toward placement goals
- Proactive pipeline health monitoring
- Notification received about submission status change

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Pipeline View

**User Action:** Click "Pipeline" in the sidebar navigation

**System Response:**
- Sidebar item highlights with active state
- URL changes to: `/employee/workspace/pipeline`
- Pipeline screen loads with loading skeleton (300-500ms)
- Default view: Kanban board showing all active submissions
- Metrics cards load at top showing pipeline health

**Screen State:**
```
+----------------------------------------------------------+
| Pipeline Overview                      [⚙ Settings] [⌘K] |
+----------------------------------------------------------+
| 📊 Pipeline Health (Last 30 Days)                        |
| ┌──────────┬──────────┬──────────┬──────────┬──────────┐|
| │ 🎯 Total │ ⚡ Active │ 📈 Conv. │ ⏱ Avg    │ 🚨 Stale │|
| │ 47 subs  │ 32 subs  │ 23.4%    │ 8.5 days │ 5 subs   │|
| └──────────┴──────────┴──────────┴──────────┴──────────┘|
+----------------------------------------------------------+
| [🔍 Search...] [Filter ▼] [Sort ▼] [View: Kanban ▼]     |
+----------------------------------------------------------+
| Sourced  Screening  Submitted  Interview  Offer  Placed  |
|   (12)      (8)        (6)        (4)      (2)    (15)   |
+----------------------------------------------------------+
```

**Time:** ~1-2 seconds

---

### Step 2: View Kanban Pipeline Board

**User Action:** System loads default Kanban view automatically

**System Response:**
- Kanban board renders with 6 columns (standard pipeline stages)
- Each column shows submission cards
- Submission count displayed in column header
- Cards show: Candidate name, Job title, Days in stage, Quick actions
- Drag-and-drop enabled between stages

**Screen State:**
```
+----------------------------------------------------------+
| Sourced (12) │ Screening (8) │ Submitted (6) │ Interview │
|──────────────┼───────────────┼───────────────┼───────────|
| ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ ┌────────|
| │Sarah J.  │ │ │Mike Chen │  │ │Lisa Wang │  │ │Alex Ro │
| │Sr. Dev   │ │ │Full Stack│  │ │Tech Lead │  │ │DevOps  │
| │Google    │ │ │Meta      │  │ │Amazon    │  │ │Netflix │
| │3d 🟢    │ │ │5d 🟡    │  │ │7d 🟡    │  │ │2d 🟢  │
| │[✉][📞][→]│ │ │[✉][📞][→]│  │ │[✉][📞][→]│  │ │[✉][📞] │
| └──────────┘ │ └──────────┘  │ └──────────┘  │ └────────|
|              │               │               │          |
| ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ ┌────────|
| │John Doe  │ │ │Amy Park  │  │ │Tom Brown │  │ │Sara K. │
| │Backend   │ │ │Frontend  │  │ │Sr. Eng   │  │ │Product │
| │Apple     │ │ │Tesla     │  │ │Microsoft │  │ │Uber    │
| │12d 🔴   │ │ │4d 🟢    │  │ │9d 🟡    │  │ │1d 🟢  │
| │[✉][📞][→]│ │ │[✉][📞][→]│  │ │[✉][📞][→]│  │ │[✉][📞] │
| └──────────┘ │ └──────────┘  │ └──────────┘  │ └────────|
|              │               │               │          |
+──────────────┴───────────────┴───────────────┴──────────+
|                                                          |
| Offer (2)    │ Placed (15)                              |
|──────────────┼──────────────────────────────────────────|
| ┌──────────┐ │ Last 7 Days: 3 placements                |
| │David L.  │ │ This Month: 8 placements                 |
| │Cloud Eng │ │ This Quarter: 15 placements              |
| │Oracle    │ │                                          |
| │$125/hr   │ │ 🎉 Great momentum!                       |
| │[View ✓]  │ │                                          |
| └──────────┘ │                                          |
+──────────────┴──────────────────────────────────────────+
```

**Pipeline Stage Definitions:**

| Stage | Definition | Typical Duration | Success Criteria |
|-------|------------|------------------|------------------|
| **Sourced** | Candidate identified, not yet contacted or initial contact made | 1-3 days | Move to Screening when candidate shows interest |
| **Screening** | Phone screen scheduled or completed, evaluating fit | 2-5 days | Move to Submitted when candidate passes screening |
| **Submitted** | Resume sent to client, awaiting client review | 3-7 days | Move to Interview when client requests interview |
| **Interview** | Interview scheduled or completed, awaiting feedback | 5-10 days | Move to Offer when client wants to extend offer |
| **Offer** | Offer extended, negotiating or awaiting acceptance | 2-5 days | Move to Placed when offer accepted and start date confirmed |
| **Placed** | Candidate has started working (revenue moment) | N/A | Final stage - placement active |

**Color Coding (Days in Stage):**
- 🟢 Green: Within SLA (healthy)
- 🟡 Yellow: Approaching SLA (needs attention)
- 🔴 Red: Exceeds SLA (stale - requires action)

**SLA Thresholds by Stage:**

| Stage | Green (0-X days) | Yellow (X+1 to Y days) | Red (Y+ days) |
|-------|------------------|------------------------|---------------|
| Sourced | 0-3 | 4-7 | 8+ |
| Screening | 0-5 | 6-10 | 11+ |
| Submitted | 0-7 | 8-14 | 15+ |
| Interview | 0-10 | 11-20 | 21+ |
| Offer | 0-5 | 6-10 | 11+ |

**Time:** ~2 seconds

---

### Step 3: Review Pipeline Health Metrics

**User Action:** User reviews metrics at top of screen

**System Response:**
- Metrics auto-calculate based on last 30 days
- Real-time updates as data changes
- Click on any metric to drill down

**Metric Specifications:**

**Metric 1: Total Submissions**
| Property | Value |
|----------|-------|
| Metric Name | Total Submissions |
| Calculation | `COUNT(submissions) WHERE created_at >= NOW() - INTERVAL '30 days'` |
| Display | `{count} subs` |
| Icon | 🎯 |
| Click Action | Show filtered list of all submissions |

**Metric 2: Active Submissions**
| Property | Value |
|----------|-------|
| Metric Name | Active Submissions |
| Calculation | `COUNT(submissions) WHERE status NOT IN ('placed', 'rejected', 'withdrawn')` |
| Display | `{count} subs` |
| Icon | ⚡ |
| Click Action | Show filtered list of active submissions |

**Metric 3: Conversion Rate**
| Property | Value |
|----------|-------|
| Metric Name | Conversion Rate |
| Calculation | `(COUNT(placed) / COUNT(total)) × 100` |
| Display | `{percentage}%` |
| Icon | 📈 |
| Color Coding | Green (>20%), Yellow (15-20%), Red (<15%) |
| Click Action | Show conversion funnel breakdown |

**Metric 4: Average Time to Placement**
| Property | Value |
|----------|-------|
| Metric Name | Average Time to Placement |
| Calculation | `AVG(placement_date - submission_date) WHERE status = 'placed'` |
| Display | `{days} days` |
| Icon | ⏱ |
| Benchmark | < 30 days (good), 30-45 days (average), > 45 days (needs improvement) |
| Click Action | Show time-to-placement histogram |

**Metric 5: Stale Submissions**
| Property | Value |
|----------|-------|
| Metric Name | Stale Submissions |
| Calculation | `COUNT(submissions) WHERE (NOW() - last_activity_date) > stage_sla` |
| Display | `{count} subs` |
| Icon | 🚨 |
| Color | Red (if > 0) |
| Click Action | Filter Kanban to show only stale submissions |

**Time:** ~10 seconds

---

### Step 4: Apply Filters to Pipeline View

**User Action:** Click "Filter ▼" button

**System Response:**
- Filter dropdown opens
- Shows available filter options
- User can select multiple filters

**Screen State:**
```
+----------------------------------------------------------+
| [🔍 Search...] [● Filter ▼] [Sort ▼] [View: Kanban ▼]   |
|                ┌──────────────────────────────────────┐  |
|                │ Filter By:                           │  |
|                │                                      │  |
|                │ ☐ My Submissions Only                │  |
|                │ ☐ Team Submissions                   │  |
|                │ ☐ All Submissions                    │  |
|                │ ─────────────────────────────────────│  |
|                │ Job:                                 │  |
|                │ ☐ Sr. Developer @ Google             │  |
|                │ ☐ Full Stack @ Meta                  │  |
|                │ ☐ Tech Lead @ Amazon                 │  |
|                │ [+ Show all jobs]                    │  |
|                │ ─────────────────────────────────────│  |
|                │ Account:                             │  |
|                │ ☐ Google                             │  |
|                │ ☐ Meta                               │  |
|                │ ☐ Amazon                             │  |
|                │ [+ Show all accounts]                │  |
|                │ ─────────────────────────────────────│  |
|                │ Status:                              │  |
|                │ ☑ Active                             │  |
|                │ ☐ Rejected                           │  |
|                │ ☐ Withdrawn                          │  |
|                │ ☐ Placed                             │  |
|                │ ─────────────────────────────────────│  |
|                │ Health:                              │  |
|                │ ☐ Healthy (🟢)                       │  |
|                │ ☐ Needs Attention (🟡)               │  |
|                │ ☐ Stale (🔴)                         │  |
|                │ ─────────────────────────────────────│  |
|                │ Date Range:                          │  |
|                │ [Last 30 days                    ▼] │  |
|                │                                      │  |
|                │ [Clear All]           [Apply Filter] │  |
|                └──────────────────────────────────────┘  |
+----------------------------------------------------------+
```

**Filter Specification: Ownership**
| Property | Value |
|----------|-------|
| Filter Name | Ownership |
| Options | "My Submissions Only", "Team Submissions", "All Submissions" |
| Default | "My Submissions Only" |
| Single Select | Yes |
| SQL Filter | `WHERE recruiter_id = current_user_id` (for My Submissions) |

**Filter Specification: Job**
| Property | Value |
|----------|-------|
| Filter Name | Job |
| Options | List of active jobs assigned to user |
| Default | All jobs |
| Multi Select | Yes |
| SQL Filter | `WHERE job_id IN ({selected_job_ids})` |

**Filter Specification: Account**
| Property | Value |
|----------|-------|
| Filter Name | Account |
| Options | List of active accounts |
| Default | All accounts |
| Multi Select | Yes |
| SQL Filter | `WHERE account_id IN ({selected_account_ids})` |

**Filter Specification: Status**
| Property | Value |
|----------|-------|
| Filter Name | Status |
| Options | "Active", "Rejected", "Withdrawn", "Placed" |
| Default | "Active" (checked) |
| Multi Select | Yes |
| SQL Filter | `WHERE status IN ({selected_statuses})` |

**Filter Specification: Health**
| Property | Value |
|----------|-------|
| Filter Name | Health |
| Options | "Healthy (🟢)", "Needs Attention (🟡)", "Stale (🔴)" |
| Default | All |
| Multi Select | Yes |
| Calculation | Based on SLA thresholds per stage |

**Filter Specification: Date Range**
| Property | Value |
|----------|-------|
| Filter Name | Date Range |
| Options | "Today", "Last 7 days", "Last 30 days", "Last Quarter", "Custom Range" |
| Default | "Last 30 days" |
| Single Select | Yes |
| SQL Filter | `WHERE created_at >= {start_date} AND created_at <= {end_date}` |

**Time:** ~5 seconds

---

### Step 5: Filter by "Stale" Submissions

**User Action:**
1. Click "Filter ▼"
2. Check "Stale (🔴)" under Health
3. Click "Apply Filter"

**System Response:**
- Kanban board re-renders
- Shows only submissions exceeding SLA
- Column counts update
- Badge appears in filter button: "Filter (1)" indicating active filter

**Screen State:**
```
+----------------------------------------------------------+
| [🔍 Search...] [● Filter (1) ▼] [Sort ▼] [Kanban ▼]     |
+----------------------------------------------------------+
| 🚨 Showing STALE submissions only (5 total)              |
| [Clear Filter]                                           |
+----------------------------------------------------------+
| Sourced (2)  │ Screening (1) │ Submitted (1) │ Interview │
|──────────────┼───────────────┼───────────────┼───────────|
| ┌──────────┐ │ ┌──────────┐  │ ┌──────────┐  │ ┌────────|
| │John Doe  │ │ │Kate Lin  │  │ │Paul Green│  │ │Maria S.│
| │Backend   │ │ │QA Lead   │  │ │Staff Eng │  │ │Scrum M.│
| │Apple     │ │ │Airbnb    │  │ │Salesforce│  │ │Adobe   │
| │12d 🔴   │ │ │11d 🔴   │  │ │15d 🔴   │  │ │21d 🔴 │
| │[✉][📞][→]│ │ │[✉][📞][→]│  │ │[✉][📞][→]│  │ │[✉][📞] │
| │No contact│ │ │Awaiting  │  │ │Client    │  │ │Feedback│
| │in 8 days │ │ │screen    │  │ │silent    │  │ │overdue │
| └──────────┘ │ └──────────┘  │ └──────────┘  │ └────────|
+──────────────┴───────────────┴───────────────┴──────────+
| ⚠️ Action Required: These submissions need immediate     |
| attention. Consider: Follow-up call, Email, or Move to   |
| different stage.                                         |
+----------------------------------------------------------+
```

**Stale Submission Indicators:**
- Red border around card
- Days in stage exceeds SLA threshold
- Last activity note shown below card
- Suggested action displayed

**Time:** ~2 seconds

---

### Step 6: Click on Submission Card to View Details

**User Action:** Click on "John Doe - Backend - Apple" card

**System Response:**
- Detail panel slides in from right (300ms animation)
- Shows complete submission history
- Timeline of all activities
- Quick actions available
- Status change dropdown visible

**Screen State:**
```
+----------------------------------------------------------+
|                                              John Doe [×]|
+----------------------------------------------------------+
| Backend Engineer @ Apple                                 |
+----------------------------------------------------------+
| [Move to →] [✉ Email] [📞 Log Call] [📝 Note] [⋮ More]  |
+----------------------------------------------------------+
| Status: SOURCED (12 days) 🔴 STALE                       |
| Last Activity: 8 days ago (Note added)                   |
| Created: 12/18/24                                        |
|                                                          |
| 🚨 STALE ALERT:                                          |
| No activity in 8 days. Sourced stage SLA is 3 days.      |
| Recommended actions:                                     |
| • Send follow-up email                                   |
| • Call candidate to confirm interest                     |
| • Move to Rejected if no response                        |
|                                                          |
| ───────────────────────────────────────────────────────  |
| Candidate Details:                                       |
| • Email: john.doe@email.com                              |
| • Phone: (555) 123-4567                                  |
| • Location: Cupertino, CA                                |
| • Years Exp: 8 years                                     |
| • Skills: Python, Django, PostgreSQL, AWS                |
|                                                          |
| Job Details:                                             |
| • Title: Backend Engineer                                |
| • Account: Apple (Technology)                            |
| • Rate: $100-120/hr                                      |
| • Type: Contract (6 months)                              |
|                                                          |
| ───────────────────────────────────────────────────────  |
| Activity Timeline:                                       |
|                                                          |
| 12/26/24  Note Added                                     |
|           "Candidate interested but needs time to        |
|            review JD. Will follow up next week."         |
|           by Sarah R.                                    |
|                                                          |
| 12/20/24  Email Sent                                     |
|           "Initial outreach - Job opportunity at Apple"  |
|           by Sarah R.                                    |
|                                                          |
| 12/18/24  Submission Created                             |
|           Status: Sourced                                |
|           by Sarah R.                                    |
|                                                          |
+----------------------------------------------------------+
```

**Time:** ~1 second

---

### Step 7: Move Submission to Different Stage (Drag-and-Drop)

**User Action:**
1. Close detail panel (or keep open)
2. Click and hold on "Sarah J. - Sr. Dev - Google" card
3. Drag to "Screening" column
4. Release mouse

**System Response:**
1. Card lifts with shadow effect (drag state)
2. Target column highlights with dashed border
3. Other cards in target column shift down to make space
4. On drop:
   - Card animates into new position
   - Status update modal appears
   - User must confirm status change and add note

**Screen State (Status Update Modal):**
```
+----------------------------------------------------------+
|                    Move Submission to Screening          |
|                                                      [×] |
+----------------------------------------------------------+
| You are moving:                                          |
| Sarah Johnson → Sr. Developer @ Google                   |
|                                                          |
| From: SOURCED                                            |
| To:   SCREENING                                          |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| Add a note (required) *                                  |
| [                                                      ] |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
| Examples:                                                |
| • "Phone screen scheduled for 1/5 at 2pm"                |
| • "Candidate responded, moving to screening"             |
| • "Initial call completed, candidate interested"         |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| ☐ Send email notification to candidate                  |
| ☐ Schedule follow-up task                               |
|                                                          |
+----------------------------------------------------------+
|                           [Cancel]  [Confirm Move →]    |
+----------------------------------------------------------+
```

**Field Specification: Status Change Note**
| Property | Value |
|----------|-------|
| Field Name | `statusChangeNote` |
| Type | Textarea |
| Label | "Add a note (required)" |
| Required | Yes |
| Max Length | 500 characters |
| Validation | Not empty, min 10 characters |
| Error Messages | |
| - Empty | "Please provide a note about this status change" |
| - Too short | "Note must be at least 10 characters" |

**User Action:** Type note: "Phone screen scheduled for 1/5 at 2pm EST"

**System Response:**
- Character count updates
- "Confirm Move →" button becomes enabled

**Time:** ~10 seconds

---

### Step 8: Confirm Status Change

**User Action:** Click "Confirm Move →" button

**System Response:**
1. Button shows loading spinner
2. API call `PUT /api/trpc/submissions.updateStatus`
3. On success:
   - Modal closes with fade animation
   - Card appears in new column
   - Old column count decrements
   - New column count increments
   - Activity logged in timeline
   - Toast notification: "Submission moved to Screening"
   - Card shows green highlight for 2 seconds

**Backend Processing:**

```typescript
// 1. Update submission status
await db.update(submissions)
  .set({
    status: 'screening',
    previousStatus: 'sourced',
    statusChangedAt: new Date(),
    statusChangedBy: currentUserId,
    updatedAt: new Date()
  })
  .where(eq(submissions.id, submissionId));

// 2. Log activity
await db.insert(activities).values({
  orgId: currentOrgId,
  entityType: 'submission',
  entityId: submissionId,
  activityType: 'status_change',
  title: 'Status changed: Sourced → Screening',
  description: statusChangeNote,
  metadata: {
    fromStatus: 'sourced',
    toStatus: 'screening',
    daysInPreviousStage: 3
  },
  createdBy: currentUserId,
  createdAt: new Date()
});

// 3. Update pipeline metrics (async)
await updatePipelineMetrics(currentOrgId, currentUserId);

// 4. Check for automation triggers (async)
await checkAutomationTriggers({
  submissionId,
  newStatus: 'screening',
  triggeredBy: 'status_change'
});
```

**Time:** ~2 seconds

---

### Step 9: Bulk Move Submissions

**User Action:**
1. Hold Shift key
2. Click on 3 submission cards to select multiple
3. Click "Bulk Actions ▼" button (appears when items selected)
4. Select "Move to Stage →"

**System Response:**
- Selected cards show blue border and checkmark
- Bulk actions menu appears
- Selection count badge: "3 selected"

**Screen State:**
```
+----------------------------------------------------------+
| Pipeline Overview              [Bulk Actions ▼] [3 sel.] |
+----------------------------------------------------------+
| ● Sourced (12) │ Screening (8) │ Submitted (6) │ Intervi |
|────────────────┼───────────────┼───────────────┼─────────|
| ┌──────────┐   │               │               │         |
| │✓ Sarah J.│   │               │               │         |
| │Sr. Dev   │   │               │               │         |
| │Google    │   │               │               │         |
| │3d 🟢    │   │               │               │         |
| └──────────┘   │               │               │         |
|                │               │               │         |
| ┌──────────┐   │               │               │         |
| │✓ Mike L. │   │               │               │         |
| │DevOps    │   │               │               │         |
| │Netflix   │   │               │               │         |
| │2d 🟢    │   │               │               │         |
| └──────────┘   │               │               │         |
|                │               │               │         |
| ┌──────────┐   │               │               │         |
| │✓ Emma W. │   │               │               │         |
| │Frontend  │   │               │               │         |
| │Uber      │   │               │               │         |
| │4d 🟡    │   │               │               │         |
| └──────────┘   │               │               │         |
+────────────────┴───────────────┴───────────────┴─────────+
|                                                          |
| [Bulk Actions ▼]                                         |
| ┌──────────────────────┐                                 |
| │ Move to Stage →      │                                 |
| │ Send Email           │                                 |
| │ Assign to Recruiter  │                                 |
| │ Add Tag              │                                 |
| │ Export to CSV        │                                 |
| │ Mark as Stale        │                                 |
| │ Delete (⚠️ danger)   │                                 |
| └──────────────────────┘                                 |
+----------------------------------------------------------+
```

**User Action:** Click "Move to Stage →"

**System Response:**
- Stage selection modal appears
- Shows dropdown with all available stages

**Screen State:**
```
+----------------------------------------------------------+
|                  Bulk Move Submissions (3)               |
|                                                      [×] |
+----------------------------------------------------------+
| You are moving 3 submissions:                            |
|                                                          |
| ☑ Sarah Johnson → Sr. Developer @ Google                 |
| ☑ Mike Lee → DevOps Engineer @ Netflix                   |
| ☑ Emma Wilson → Frontend Engineer @ Uber                 |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| Move all to: *                                           |
| [Screening                                          ▼]   |
|                                                          |
| Add a note (required) *                                  |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| ⚠️ Warning: This will move all 3 submissions to the      |
| selected stage. This action cannot be undone.            |
|                                                          |
+----------------------------------------------------------+
|                         [Cancel]  [Move 3 Submissions]  |
+----------------------------------------------------------+
```

**Time:** ~5 seconds

---

### Step 10: Switch to List View

**User Action:** Click "View: Kanban ▼" dropdown, select "List"

**System Response:**
- View changes from Kanban to List
- Shows table format with all submissions
- Sortable columns
- More detailed information visible

**Screen State:**
```
+----------------------------------------------------------+
| Pipeline Overview                      [⚙ Settings] [⌘K] |
+----------------------------------------------------------+
| [🔍 Search...] [Filter ▼] [Sort ▼] [View: List ▼]       |
+----------------------------------------------------------+
| Candidate       Job           Account   Status   Days Age|
|─────────────────────────────────────────────────────────|
| Sarah Johnson   Sr. Dev       Google    Sourced  3d  🟢 |
|                 $110-125/hr   Tech               [▶]    |
|                                                         |
| Mike Chen       Full Stack    Meta      Screening 5d 🟡 |
|                 $95-110/hr    Tech                [▶]   |
|                                                         |
| Lisa Wang       Tech Lead     Amazon    Submitted 7d 🟡 |
|                 $130-145/hr   E-comm              [▶]   |
|                                                         |
| John Doe        Backend       Apple     Sourced  12d 🔴|
|                 $100-120/hr   Tech                [▶]   |
|                                                         |
| Alex Rogers     DevOps        Netflix   Interview 2d 🟢|
|                 $120-135/hr   Media               [▶]   |
|                                                         |
+----------------------------------------------------------+
| Showing 5 of 47 submissions                    [1][2][3]|
+----------------------------------------------------------+
```

**List View Features:**
- Sortable by: Candidate name, Job title, Account, Status, Days in stage, Age
- Click column header to sort ascending/descending
- Click [▶] to expand row and view details inline
- Pagination: 20 submissions per page
- Export to CSV button available

**Time:** ~1 second

---

### Step 11: View Conversion Funnel

**User Action:** Click on "Conversion Rate: 23.4%" metric card

**System Response:**
- Modal opens showing detailed conversion funnel
- Visualizes drop-off between stages
- Shows conversion percentages

**Screen State:**
```
+----------------------------------------------------------+
|                  Pipeline Conversion Funnel              |
|                                                      [×] |
+----------------------------------------------------------+
| Last 30 Days (47 total submissions)                      |
|                                                          |
|    Sourced: 47 submissions                               |
|    ████████████████████████████████████████ 100%        |
|          ↓ 85% conversion                                |
|                                                          |
|    Screening: 40 submissions                             |
|    ██████████████████████████████████ 85%               |
|          ↓ 60% conversion                                |
|                                                          |
|    Submitted: 24 submissions                             |
|    ████████████████████ 51%                             |
|          ↓ 50% conversion                                |
|                                                          |
|    Interview: 12 submissions                             |
|    ████████████ 26%                                     |
|          ↓ 75% conversion                                |
|                                                          |
|    Offer: 9 submissions                                  |
|    █████████ 19%                                        |
|          ↓ 100% conversion                               |
|                                                          |
|    Placed: 11 submissions                                |
|    ███████████ 23%                                      |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| 📊 Insights:                                             |
| • Biggest drop-off: Screening → Submitted (25%)          |
| • Best conversion: Offer → Placed (100%)                 |
| • Overall conversion rate: 23.4% (industry avg: 20%)     |
|                                                          |
| 💡 Recommendations:                                      |
| • Focus on improving client submission rate              |
| • Current screening process is effective (85%)           |
| • Offer acceptance rate is excellent (100%)              |
|                                                          |
+----------------------------------------------------------+
|                                          [Export] [Close]|
+----------------------------------------------------------+
```

**Conversion Calculation:**

```typescript
// Stage-to-stage conversion
const conversionRate = (nextStageCount / currentStageCount) × 100;

// Example: Screening → Submitted
const screeningCount = 40;
const submittedCount = 24;
const conversionScreeningToSubmitted = (24 / 40) × 100; // 60%

// Overall conversion (Sourced → Placed)
const sourcedCount = 47;
const placedCount = 11;
const overallConversion = (11 / 47) × 100; // 23.4%
```

**Time:** ~5 seconds

---

### Step 12: View Pipeline Analytics (Time-Based)

**User Action:** Click "⚙ Settings" → "View Analytics"

**System Response:**
- Analytics dashboard opens
- Shows historical pipeline trends
- Time-series charts for key metrics

**Screen State:**
```
+----------------------------------------------------------+
|                  Pipeline Analytics                  [×] |
+----------------------------------------------------------+
| Date Range: [Last 90 Days ▼]         [Export to PDF]    |
+----------------------------------------------------------+
|                                                          |
| Submissions Over Time:                                   |
| 50 ┤                                                     |
|    │                                         ●           |
| 40 ┤                               ●                     |
|    │                         ●                           |
| 30 ┤                   ●                                 |
|    │             ●                                       |
| 20 ┤       ●                                             |
|    │ ●                                                   |
| 10 ┤                                                     |
|  0 └─────────────────────────────────────────────────── |
|    Oct        Nov        Dec        Jan                 |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| Placements Over Time:                                    |
| 10 ┤                                         ●           |
|    │                               ●                     |
|  5 ┤                         ●                           |
|    │                   ●                                 |
|    │             ●                                       |
|  0 └─────────────────────────────────────────────────── |
|    Oct        Nov        Dec        Jan                 |
|                                                          |
| ───────────────────────────────────────────────────────  |
|                                                          |
| Average Time in Each Stage (Days):                       |
|                                                          |
| Sourced    ████ 4.2 days                                |
| Screening  ████████ 6.8 days                            |
| Submitted  ██████████ 9.5 days                          |
| Interview  ████████████ 12.3 days                       |
| Offer      ██████ 5.1 days                              |
|                                                          |
| Total Avg Time to Placement: 37.9 days                   |
|                                                          |
+----------------------------------------------------------+
```

**Time:** ~2 seconds

---

### Step 13: Identify and Act on Stale Submission

**User Action:**
1. Click "Clear Filter" to return to full pipeline view
2. Identify "John Doe - Backend - Apple" (12d 🔴)
3. Click card to open details
4. Click "📞 Log Call" button

**System Response:**
- Call logging modal opens
- User can record outcome of call

**Screen State:**
```
+----------------------------------------------------------+
|                      Log Call Activity                   |
|                                                      [×] |
+----------------------------------------------------------+
| Submission: John Doe → Backend Engineer @ Apple          |
|                                                          |
| Call Outcome: *                                          |
| [Candidate Answered ▼]                                   |
|                                                          |
| Options:                                                 |
| • Candidate Answered                                     |
| • Voicemail Left                                         |
| • No Answer                                              |
| • Wrong Number                                           |
| • Call Declined                                          |
|                                                          |
| Duration:                                                |
| [15] minutes                                             |
|                                                          |
| Notes: *                                                 |
| [                                                      ] |
| [                                                      ] |
| [                                               ] 0/500  |
|                                                          |
| Next Steps:                                              |
| ☐ Send follow-up email                                  |
| ☐ Schedule phone screen                                 |
| ☐ Move to next stage                                    |
| ☐ Create task reminder                                  |
|                                                          |
+----------------------------------------------------------+
|                           [Cancel]  [Log Call Activity] |
+----------------------------------------------------------+
```

**User Action:**
1. Select "Candidate Answered"
2. Enter duration: "15" minutes
3. Enter notes: "Spoke with John. He's interested but needs 2 weeks notice at current job. Will follow up on 1/15."
4. Check "Create task reminder"
5. Click "Log Call Activity"

**System Response:**
1. Call activity logged
2. Submission timeline updated
3. Last activity date updated → Removes 🔴 stale indicator
4. Task created for 1/15 reminder
5. Toast: "Call activity logged. Task created for 1/15."
6. Card updates to show 🟢 (healthy) since activity was just logged

**Time:** ~30 seconds

---

### Step 14: Use Quick Actions from Card

**User Action:** Hover over submission card, click quick action icons

**System Response:**
- Three quick action icons appear on card:
  - [✉] Email - Opens email composer
  - [📞] Call - Opens call logging modal
  - [→] Move - Opens stage selection dropdown

**Quick Action: Email**

**User Action:** Click [✉] on "Sarah J." card

**System Response:**
- Email composer modal opens
- Pre-fills recipient email
- Shows email templates

**Screen State:**
```
+----------------------------------------------------------+
|                    Send Email to Sarah Johnson           |
|                                                      [×] |
+----------------------------------------------------------+
| To: sarah.johnson@email.com                              |
| Subject: [                                             ] |
|                                                          |
| Use Template:                                            |
| [Select template ▼]                                      |
|                                                          |
| Templates:                                               |
| • Initial Outreach                                       |
| • Follow-up After No Response                            |
| • Phone Screen Invitation                                |
| • Interview Confirmation                                 |
| • Status Update                                          |
| • Custom Email                                           |
|                                                          |
| Message:                                                 |
| [                                                      ] |
| [                                                      ] |
| [                                                      ] |
|                                                          |
| ☐ Log this email in submission timeline                 |
| ☐ Set reminder to follow up in [3] days                 |
|                                                          |
+----------------------------------------------------------+
|                    [Cancel]  [Send Email]  [Save Draft] |
+----------------------------------------------------------+
```

**Time:** ~15 seconds to compose

---

### Step 15: Export Pipeline Data

**User Action:** Click "⚙ Settings" → "Export Pipeline"

**System Response:**
- Export options modal appears
- User selects export format and scope

**Screen State:**
```
+----------------------------------------------------------+
|                    Export Pipeline Data                  |
|                                                      [×] |
+----------------------------------------------------------+
| Export Format: *                                         |
| ○ CSV (Excel compatible)                                 |
| ○ PDF Report                                             |
| ○ Excel (.xlsx)                                          |
|                                                          |
| Scope: *                                                 |
| ○ Current filtered view (5 submissions)                  |
| ○ All my submissions (47 submissions)                    |
| ○ Team submissions (156 submissions)                     |
|                                                          |
| Include:                                                 |
| ☑ Candidate details                                     |
| ☑ Job information                                       |
| ☑ Current status and stage                              |
| ☑ Days in stage                                         |
| ☑ Last activity date                                    |
| ☑ Timeline history                                      |
| ☐ Compensation details                                  |
|                                                          |
| Date Range:                                              |
| [Last 30 days ▼]                                         |
|                                                          |
+----------------------------------------------------------+
|                              [Cancel]  [Export Data ⬇]  |
+----------------------------------------------------------+
```

**User Action:**
1. Select "CSV (Excel compatible)"
2. Select "Current filtered view"
3. Check all include options
4. Click "Export Data ⬇"

**System Response:**
1. File generates (1-2 seconds)
2. Download begins: `pipeline-export-2025-01-05.csv`
3. Toast: "Pipeline exported successfully (5 submissions)"

**CSV Format:**
```csv
Candidate Name,Email,Phone,Job Title,Account,Status,Days in Stage,Created Date,Last Activity,Rate Range
Sarah Johnson,sarah.j@email.com,(555)123-4567,Sr. Developer,Google,Sourced,3,2025-01-02,2025-01-05,$110-125/hr
Mike Chen,mike.c@email.com,(555)234-5678,Full Stack,Meta,Screening,5,2024-12-30,2025-01-04,$95-110/hr
...
```

**Time:** ~3 seconds

---

## Postconditions

1. ✅ Pipeline viewed and status reviewed
2. ✅ Filters applied to focus on specific submissions
3. ✅ Stale submissions identified and actioned
4. ✅ Submission statuses updated via drag-and-drop
5. ✅ Activities logged (calls, emails, notes)
6. ✅ Bulk actions performed (if applicable)
7. ✅ Conversion funnel analyzed
8. ✅ Pipeline metrics refreshed
9. ✅ Tasks created for follow-ups
10. ✅ Export generated (if requested)
11. ✅ User has clear understanding of pipeline health
12. ✅ Action items identified for improving conversion rates

---

## Events Logged

| Event | Payload | Recipients |
|-------|---------|-----------|
| `pipeline.viewed` | `{ user_id, view_type: 'kanban' \| 'list', filters_applied, timestamp }` | System |
| `submission.status_changed` | `{ submission_id, from_status, to_status, changed_by, note, timestamp }` | System, Team |
| `submission.moved` | `{ submission_id, from_stage, to_stage, days_in_previous_stage, changed_by }` | System, Team |
| `activity.call_logged` | `{ submission_id, call_outcome, duration, notes, created_by }` | System |
| `activity.email_sent` | `{ submission_id, email_template, recipient, created_by }` | System |
| `bulk_action.performed` | `{ action_type, submission_ids: [], performed_by, timestamp }` | System |
| `pipeline.exported` | `{ user_id, export_format, record_count, filters, timestamp }` | System |
| `metric.calculated` | `{ metric_type, value, period, calculated_at }` | System |
| `stale_alert.triggered` | `{ submission_id, stage, days_stale, assigned_to }` | Recruiter, Manager |

---

## Error Scenarios

| Error | Cause | Message | Recovery |
|-------|-------|---------|----------|
| No Submissions | No submissions exist for user | "No submissions found. Create your first submission to get started!" | Create new submission |
| Filter Returns Empty | Applied filters match no submissions | "No submissions match your filters. Try adjusting your criteria." | Clear or modify filters |
| Permission Denied (View Team) | User tries to view team submissions without permission | "You don't have permission to view team submissions" | Contact Admin |
| Status Change Failed | API error during drag-and-drop | "Failed to update submission status. Please try again." | Retry operation |
| Bulk Action Limit Exceeded | User selects > 50 submissions for bulk action | "Bulk actions limited to 50 submissions at a time" | Select fewer items |
| Stale Submission No Action | Submission marked stale but no activity logged | "⚠️ This submission has been stale for 12 days. Please take action." | Log activity or change status |
| Export Failed | Export generation error | "Export failed. Please try again or contact support." | Retry or contact support |
| Conversion Data Unavailable | Insufficient data for funnel | "Not enough data to calculate conversion rates (min: 10 submissions)" | Wait for more data |
| Network Error | API unreachable | "Network error. Unable to load pipeline data." | Refresh page |
| Concurrent Edit Conflict | Two users edit same submission simultaneously | "This submission was just updated by another user. Please refresh." | Refresh and retry |

---

## Keyboard Shortcuts (During Flow)

| Key | Action |
|-----|--------|
| `Cmd+K` | Open global command palette |
| `Cmd+F` | Focus search input |
| `F` | Open filter menu |
| `V` | Toggle view (Kanban ↔ List) |
| `N` | Create new submission (if on pipeline screen) |
| `R` | Refresh pipeline data |
| `Esc` | Close modal/detail panel |
| `Cmd+Shift+E` | Export current view |
| `←` `→` | Navigate between pipeline stages (in Kanban view) |
| `↑` `↓` | Navigate between submission cards |
| `Enter` | Open selected submission detail |
| `Cmd+A` | Select all submissions (for bulk actions) |
| `Shift+Click` | Multi-select submissions |

---

## Alternative Flows

### A1: View Pipeline by Job

**Trigger:** User wants to see pipeline for specific job only

**Flow:**
1. User clicks "Filter ▼"
2. Under "Job:", selects "Sr. Developer @ Google"
3. Clicks "Apply Filter"
4. Pipeline shows only submissions for that job
5. Metrics recalculate for filtered view
6. Badge shows "Filter (1)" indicating active filter
7. User can continue managing pipeline for that job

### A2: View Pipeline by Account

**Trigger:** Client (Account Manager for Google) wants status on all Google submissions

**Flow:**
1. User clicks "Filter ▼"
2. Under "Account:", selects "Google"
3. Clicks "Apply Filter"
4. Pipeline shows all submissions across all jobs for Google
5. User can see holistic view of Google pipeline
6. Useful for client status meetings

### A3: View Team Pipeline (Manager View)

**Trigger:** Recruiting Manager wants to see entire team's pipeline

**Flow:**
1. User clicks "Filter ▼"
2. Selects "Team Submissions"
3. Clicks "Apply Filter"
4. Pipeline shows all submissions from entire pod/team
5. Cards show recruiter name/avatar on each submission
6. Manager can identify bottlenecks across team
7. Manager can reassign submissions if needed

### A4: Pipeline Health Dashboard (Executive View)

**Trigger:** VP of Recruiting wants high-level pipeline health across all teams

**Flow:**
1. User navigates to "Analytics" → "Pipeline Dashboard"
2. Dashboard shows:
   - Pipeline health by team/pod
   - Conversion rates by recruiter
   - Stale submission count by team
   - Revenue forecast based on pipeline
3. Click any metric to drill down
4. Identify underperforming teams/stages
5. Export executive summary report

### A5: Create Submission from Pipeline View

**Trigger:** User realizes candidate is missing from pipeline, wants to add quickly

**Flow:**
1. User clicks "+ New" button on pipeline screen
2. Quick-add submission modal appears
3. User enters: Candidate name, Job, Status
4. Modal pre-selects "Sourced" status
5. User clicks "Create Submission"
6. New card appears in Sourced column
7. User can drag to correct stage if needed

### A6: Schedule Follow-up from Pipeline

**Trigger:** User wants to batch-schedule follow-ups for multiple candidates

**Flow:**
1. User selects 5 submissions in Sourced stage
2. Clicks "Bulk Actions ▼" → "Schedule Follow-ups"
3. Modal appears with date/time picker
4. User selects: "1/10/2025 at 2:00 PM"
5. User enters note: "Follow up on initial outreach"
6. System creates 5 tasks scheduled for that date/time
7. Tasks appear in user's task list
8. Notifications sent day-of

### A7: Identify Bottleneck Stage

**Trigger:** Manager notices conversions dropping at specific stage

**Flow:**
1. User views conversion funnel (Step 11)
2. Identifies: "Screening → Submitted" has only 60% conversion
3. User clicks on that funnel stage
4. Drill-down shows all 40 submissions in Screening
5. User filters by "Needs Attention (🟡)" and "Stale (🔴)"
6. Identifies 15 submissions stuck in screening > 7 days
7. User bulk-selects these 15
8. User clicks "Bulk Actions" → "Send Email" → "Follow-up After No Response"
9. 15 emails sent
10. User creates task to review responses in 3 days

### A8: Pipeline Forecasting

**Trigger:** User wants to predict placements for next 30 days

**Flow:**
1. User clicks "Analytics" → "Forecast"
2. System analyzes current pipeline:
   - 6 submissions in Submitted stage
   - 4 submissions in Interview stage
   - 2 submissions in Offer stage
3. Based on historical conversion rates:
   - Submitted (50% convert) → 3 expected interviews
   - Interview (75% convert) → 3 expected offers
   - Offer (100% convert) → 2 expected placements
4. System forecasts: "5 placements expected in next 30 days"
5. Revenue forecast: "~$100K monthly recurring revenue"
6. User can adjust conversion assumptions
7. Export forecast report for planning

---

## International Considerations

### Multi-Timezone Display

**Challenge:** Recruiter in US (EST) managing candidates interviewing with client in India (IST)

**Solution:**
- All timestamps show in user's local timezone by default
- Hover tooltip shows candidate's timezone
- Interview cards show both timezones:
  ```
  Interview Scheduled:
  1/10 at 2:00 PM EST
  (1/11 at 12:30 AM IST)
  ```
- System auto-detects candidate timezone from profile
- Calendar invites sent with correct timezone

### Currency Display

**Challenge:** Viewing pipeline with rates in multiple currencies (USD, EUR, INR)

**Solution:**
- Each submission card shows rate in original currency
- Pipeline metrics show totals in user's preferred currency
- Conversion funnel revenue uses exchange rates (daily updated)
- Filter by currency: "Show only USD submissions"
- Export includes both original and converted currencies

**Example:**
```
+----------------------------------------------------------+
| Conversion Funnel Revenue Forecast                       |
+----------------------------------------------------------+
| Offer Stage (9 submissions):                             |
| • 5 × $120/hr (USD)  → $105,600/mo                       |
| • 2 × €95/hr (EUR)   → $22,040/mo  (@ 1.10 rate)         |
| • 2 × ₹8500/hr (INR) → $21,120/mo  (@ 83.50 rate)        |
|                                                          |
| Total Forecast: $148,760/mo USD                          |
+----------------------------------------------------------+
```

### Regional Pipeline Views

**Challenge:** Global staffing firm with teams in US, India, Philippines

**Solution:**
- Filter by region: "North America", "APAC", "EMEA"
- Regional managers see their team's pipeline only
- Global view available for executives
- Time-based metrics adjust for regional work hours
- SLA thresholds account for regional holidays
- Language support for pipeline UI (future)

---

## Related Use Cases

- [D01-create-job.md](./D01-create-job.md) - Create jobs that appear in pipeline
- [E01-source-candidates.md](./E01-source-candidates.md) - Source candidates to add to pipeline
- [F01-submit-candidate.md](./F01-submit-candidate.md) - Submit candidates (creates Submitted stage entry)
- [F03-schedule-interview.md](./F03-schedule-interview.md) - Move to Interview stage
- [G08-make-placement.md](./G08-make-placement.md) - Final stage: Placed
- [H02-log-activity.md](./H02-log-activity.md) - Log activities from pipeline
- [D05-update-job-status.md](./D05-update-job-status.md) - Job status affects pipeline display

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Load pipeline with 50 submissions | All submissions load in < 2s, Kanban shows 6 columns |
| TC-002 | Drag submission from Sourced to Screening | Status update modal appears, note required |
| TC-003 | Confirm status change with note | Submission moves, activity logged, toast shown |
| TC-004 | Filter by "Stale" submissions | Only red-flagged submissions shown, count accurate |
| TC-005 | Filter by specific job | Only submissions for that job shown, metrics recalculate |
| TC-006 | Switch from Kanban to List view | View changes instantly, same data shown |
| TC-007 | Click submission card | Detail panel slides in from right, shows timeline |
| TC-008 | Bulk select 10 submissions, move to Screening | Bulk modal appears, all 10 moved after confirmation |
| TC-009 | Click conversion rate metric | Funnel modal opens, shows stage-by-stage breakdown |
| TC-010 | Export pipeline to CSV | File downloads, contains all filtered submissions |
| TC-011 | Log call activity on stale submission | Activity logged, stale flag removed, card turns green |
| TC-012 | Quick action: Send email from card | Email modal opens, candidate email pre-filled |
| TC-013 | Pipeline with no submissions | Shows empty state with "Create submission" CTA |
| TC-014 | Apply 3 filters simultaneously | All filters applied correctly, results accurate |
| TC-015 | Clear all filters | Returns to default view (all active submissions) |
| TC-016 | View team pipeline (manager permission) | Shows all team submissions, recruiter names visible |
| TC-017 | View team pipeline (no permission) | Error: "Permission denied" |
| TC-018 | Concurrent edit: Two users move same submission | Second user sees conflict warning, must refresh |
| TC-019 | Drag submission to invalid stage (skip stage) | Warning: "You're skipping Screening stage. Confirm?" |
| TC-020 | Search for candidate name in pipeline | Results filter in real-time, shows matching cards |
| TC-021 | Sort list view by "Days in Stage" desc | Stale submissions appear first |
| TC-022 | View pipeline analytics for last 90 days | Charts load, data accurate, trends visible |
| TC-023 | Create task from stale submission detail | Task created, appears in task list, reminder set |
| TC-024 | Multi-timezone: View interview with IST time | Shows both EST and IST times, hover shows full details |
| TC-025 | Multi-currency: View pipeline with USD + EUR | Revenue metrics show converted totals, original shown on cards |

---

## UI/UX Specifications

### Kanban Card Design

**Card Dimensions:**
- Width: 280px
- Height: Auto (min 120px)
- Border Radius: 8px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

**Card States:**
- Default: White background, gray border
- Hover: Blue border, shadow increases
- Selected: Blue border, checkmark top-right
- Dragging: Semi-transparent, follows cursor
- Stale (Red): Red left border (4px), red badge

**Card Content Layout:**
```
┌────────────────────────────────┐
│ Candidate Name (Bold, 16px)    │ ← Top
│ Job Title (Gray, 14px)         │
│ Account Name (Gray, 12px)      │
│                                │
│ Xd 🟢/🟡/🔴                    │ ← Bottom-left
│ [✉][📞][→]                     │ ← Bottom-right (Quick Actions)
└────────────────────────────────┘
```

### Color Scheme

**Health Indicators:**
- 🟢 Green (Healthy): `#10B981` (Tailwind green-500)
- 🟡 Yellow (Attention): `#F59E0B` (Tailwind amber-500)
- 🔴 Red (Stale): `#EF4444` (Tailwind red-500)

**Status Colors:**
- Sourced: `#94A3B8` (Slate-400)
- Screening: `#3B82F6` (Blue-500)
- Submitted: `#8B5CF6` (Violet-500)
- Interview: `#EC4899` (Pink-500)
- Offer: `#F59E0B` (Amber-500)
- Placed: `#10B981` (Green-500)

### Drag-and-Drop Animation

**Animation Sequence:**
1. **Pickup (0-100ms):**
   - Card lifts: `transform: scale(1.05)` + `shadow: 0 8px 16px rgba(0,0,0,0.2)`
   - Cursor changes to `grabbing`
   - Other cards in column shift to fill gap

2. **Dragging (continuous):**
   - Card follows cursor with 20ms delay (smooth following)
   - Target column highlights with dashed border (`border: 2px dashed #3B82F6`)
   - Other cards in target column shift down to show insertion point

3. **Drop (100-300ms):**
   - Card animates to final position: `transition: all 300ms ease-out`
   - Shadow reduces: `shadow: 0 2px 4px rgba(0,0,0,0.1)`
   - Status update modal appears after drop animation completes

4. **Confirmed (after modal):**
   - Card shows green pulse: `animation: pulse 500ms ease-out`
   - Column counts update with number animation

### Loading States

**Initial Load:**
- Show skeleton cards (6 per column)
- Shimmer animation across skeletons
- Load completes top-to-bottom (Sourced → Placed)

**Lazy Load:**
- As user scrolls down in List view
- Load 20 submissions at a time
- Loading spinner at bottom while fetching

**Refresh:**
- Pull-to-refresh gesture (mobile)
- Refresh button shows spinner during reload
- New submissions slide in from top with animation

### Responsive Design

**Desktop (1920px):**
- Kanban: All 6 columns visible side-by-side
- Card width: 280px
- Comfortable spacing: 24px between columns

**Laptop (1440px):**
- Kanban: All 6 columns visible, narrower spacing (16px)
- Card width: 240px

**Tablet (768px):**
- Kanban: Horizontal scroll, 3 columns visible at once
- Swipe left/right to navigate
- Card width: 280px

**Mobile (375px):**
- Switch to List view by default (Kanban optional)
- Tap card to view details (full-screen modal)
- Swipe actions: Left (Email), Right (Call)

---

## Database Schema Reference

**Submissions Table (relevant fields):**
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Associations
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'sourced',
    -- 'sourced', 'screening', 'submitted', 'interview', 'offer', 'placed', 'rejected', 'withdrawn'
  previous_status TEXT,
  status_changed_at TIMESTAMPTZ,
  status_changed_by UUID REFERENCES user_profiles(id),

  -- Pipeline metrics
  days_in_current_stage INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - status_changed_at)::INTEGER
  ) STORED,

  last_activity_date TIMESTAMPTZ,
  last_activity_type TEXT, -- 'call', 'email', 'note', 'status_change', etc.

  is_stale BOOLEAN GENERATED ALWAYS AS (
    (NOW() - last_activity_date) > INTERVAL '7 days'
  ) STORED,

  -- Assignment
  recruiter_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes for pipeline queries
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_recruiter ON submissions(recruiter_id);
CREATE INDEX idx_submissions_job ON submissions(job_id);
CREATE INDEX idx_submissions_account ON submissions(account_id);
CREATE INDEX idx_submissions_stale ON submissions(is_stale);
CREATE INDEX idx_submissions_status_changed_at ON submissions(status_changed_at);
```

**Pipeline Metrics Materialized View:**
```sql
CREATE MATERIALIZED VIEW pipeline_metrics AS
SELECT
  org_id,
  recruiter_id,
  DATE_TRUNC('day', created_at) AS date,

  -- Counts by stage
  COUNT(*) FILTER (WHERE status = 'sourced') AS sourced_count,
  COUNT(*) FILTER (WHERE status = 'screening') AS screening_count,
  COUNT(*) FILTER (WHERE status = 'submitted') AS submitted_count,
  COUNT(*) FILTER (WHERE status = 'interview') AS interview_count,
  COUNT(*) FILTER (WHERE status = 'offer') AS offer_count,
  COUNT(*) FILTER (WHERE status = 'placed') AS placed_count,

  -- Conversion rates
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'placed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS overall_conversion_rate,

  -- Average time to placement
  ROUND(
    AVG(EXTRACT(EPOCH FROM (placement_date - created_at)) / 86400) FILTER (WHERE status = 'placed'),
    1
  ) AS avg_days_to_placement,

  -- Stale submissions
  COUNT(*) FILTER (WHERE is_stale = true) AS stale_count

FROM submissions
GROUP BY org_id, recruiter_id, DATE_TRUNC('day', created_at);

-- Refresh every hour
CREATE UNIQUE INDEX ON pipeline_metrics (org_id, recruiter_id, date);
REFRESH MATERIALIZED VIEW CONCURRENTLY pipeline_metrics;
```

---

## Performance Optimization

### Query Optimization

**Problem:** Loading 500+ submissions for large teams takes 5+ seconds

**Solution:**
1. **Pagination:** Load 50 submissions initially, lazy-load rest
2. **Materialized Views:** Pre-calculate metrics daily
3. **Indexes:** All filter fields indexed
4. **Caching:** Redis cache for pipeline data (5-minute TTL)
5. **GraphQL/tRPC:** Only fetch fields needed for Kanban cards

**Optimized Query:**
```typescript
// Instead of fetching full submission objects:
const submissions = await db.query.submissions.findMany({
  where: eq(submissions.recruiterId, userId),
  // Fetch only fields needed for Kanban view
  columns: {
    id: true,
    candidateId: true,
    jobId: true,
    accountId: true,
    status: true,
    daysInCurrentStage: true,
    lastActivityDate: true,
    isStale: true
  },
  with: {
    candidate: {
      columns: { firstName: true, lastName: true }
    },
    job: {
      columns: { title: true, rateMin: true, rateMax: true }
    },
    account: {
      columns: { name: true }
    }
  },
  orderBy: [desc(submissions.statusChangedAt)],
  limit: 50
});
```

### Real-time Updates

**WebSocket Integration:**
- Connect to WebSocket on pipeline load
- Listen for events: `submission.status_changed`, `submission.created`
- Update Kanban board in real-time without refresh
- Show toast: "New submission added by [Recruiter Name]"
- Optimistic updates: Move card immediately, rollback on error

**Example:**
```typescript
// WebSocket listener
socket.on('submission.status_changed', (payload) => {
  const { submissionId, fromStatus, toStatus } = payload;

  // Find card in UI
  const card = document.querySelector(`[data-submission-id="${submissionId}"]`);

  // Animate move
  animateCardMove(card, fromStatus, toStatus);

  // Update column counts
  updateColumnCounts();
});
```

---

*Last Updated: 2025-01-05*
*Document Version: 1.0*
*Author: InTime v3 Product Team*
*Status: Final*
