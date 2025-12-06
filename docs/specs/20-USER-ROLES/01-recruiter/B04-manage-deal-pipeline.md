# Use Case: Manage Deal Pipeline

## Overview

| Property | Value |
|----------|-------|
| Use Case ID | UC-REC-B04 |
| Actor | Recruiter (Business Development Role) |
| Goal | Track deals through sales stages, monitor pipeline health, and manage opportunities to closure |
| Frequency | Multiple times daily |
| Estimated Time | 5-15 minutes per session |
| Priority | High |

---

## Preconditions

1. User is logged in as Recruiter
2. User has "deal.read" and "deal.update" permissions
3. Deals exist in the pipeline
4. User is owner or has visibility to deals

---

## Trigger

One of the following:
- Daily pipeline review routine
- Weekly sales meeting preparation
- Deal stage update after client meeting
- Pod Manager requests pipeline report
- Close date approaching for deal
- Stale deal notification (no activity)
- Quarter-end pipeline review

---

## Main Flow (Click-by-Click)

### Step 1: Navigate to Pipeline View

**User Action:** Click "Pipeline" in sidebar under Business Development

**System Response:**
- Pipeline page loads
- Kanban view displayed by default
- Deals organized by stage

**Screen State:**
```
+----------------------------------------------------------+
| DEAL PIPELINE                    [+ New Deal] [Export]   |
+----------------------------------------------------------+
| [My Deals ▼]  [All Deals]  Period: [This Quarter ▼]     |
| View: [Kanban ●] [List] [Forecast]     [🔍 Search]       |
+----------------------------------------------------------+
|                                                           |
| PIPELINE SUMMARY                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ Total Deals: 12    Total Value: $485,000           │  |
| │ Weighted Pipeline: $248,500                        │  |
| │ Avg Deal Size: $40,417    Avg Win Rate: 68%       │  |
| │                                                     │  |
| │ This Quarter Target: $300,000                      │  |
| │ Weighted vs Target: 83% ████████░░                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
|                                                           |
| DISCOVERY      QUALIFICATION    PROPOSAL      NEGOTIATION|
| ($125K, 4)     ($98K, 3)        ($142K, 3)    ($120K, 2) |
|                                                           |
| ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐ |
| │TechStart │  │DataFlow  │   │CloudBase │  │FinanceAI │ |
| │$75,000   │  │$48,000   │   │$62,000   │  │$85,000   │ |
| │70% · 30d │  │40% · 45d │   │60% · 15d │  │70% · 10d │ |
| │Sarah Chen│  │Mike Brown│   │Lisa Wang │  │Tom Lee   │ |
| │🟢 On track│  │🟡 Stale  │   │🟢 Active │  │🔴 Urgent │ |
| └──────────┘  └──────────┘   └──────────┘  └──────────┘ |
|                                                           |
| ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌──────────┐ |
| │PaymentCo │  │LogiTech  │   │HealthSys │  │          │ |
| │$35,000   │  │$28,000   │   │$45,000   │  │          │ |
| │20% · 60d │  │40% · 21d │   │60% · 25d │  │          │ |
| │Amy Park  │  │John Doe  │   │Sam Wilson│  │          │ |
| │🟡 Slow   │  │🟢 Active │   │🟢 Active │  │          │ |
| └──────────┘  └──────────┘   └──────────┘  └──────────┘ |
|                                                           |
| ┌──────────┐  ┌──────────┐   ┌──────────┐               |
| │RetailMax │  │          │   │SecurityPro│               |
| │$12,000   │  │          │   │$35,000   │               |
| │20% · 14d │  │          │   │60% · 20d │               |
| │Bob Smith │  │          │   │Jane Miller│               |
| │🟢 New    │  │          │   │🟢 Active │               |
| └──────────┘  └──────────┘   └──────────┘               |
|                                                           |
| ┌──────────┐                                             |
| │StartupXYZ│     Drag deals between stages to update    |
| │$3,000    │                                             |
| │20% · 7d  │                                             |
| │Kim Chen  │                                             |
| │🟢 New    │                                             |
| └──────────┘                                             |
|                                                           |
+----------------------------------------------------------+
| VERBAL COMMIT  CLOSED WON     CLOSED LOST               |
| ($0, 0)        ($165K, 4)     ($52K, 2)                 |
|                                                           |
|                ┌──────────┐   ┌──────────┐              |
|                │Google    │   │AcmeCorp  │              |
|                │$95,000   │   │$32,000   │              |
|                │Won Dec 1 │   │Lost Nov 15│              |
|                │          │   │Budget cut │              |
|                └──────────┘   └──────────┘              |
|                                                           |
|                ┌──────────┐   ┌──────────┐              |
|                │Meta      │   │OldTech   │              |
|                │$45,000   │   │$20,000   │              |
|                │Won Nov 28│   │Lost Nov 10│              |
|                │          │   │Competition│              |
|                └──────────┘   └──────────┘              |
|                                                           |
|                [+ 2 more]                                 |
+----------------------------------------------------------+
```

**Time:** ~1-2 seconds

---

### Step 2: Move Deal to Next Stage (Drag & Drop)

**User Action:** Drag "TechStart" card from Discovery to Qualification

**System Response:**
- Stage update modal appears
- Prompts for stage completion details

**Screen State:**
```
+----------------------------------------------------------+
|                           Update Deal Stage          [×] |
+----------------------------------------------------------+
|                                                           |
| Moving: TechStart Inc - Q1 Engineering Hiring            |
| From: Discovery → To: Qualification                      |
|                                                           |
| STAGE EXIT CRITERIA ✅                                    |
|                                                           |
| Discovery → Qualification requires:                       |
| ☑ Discovery call completed                               |
| ☑ Key stakeholders identified                            |
| ☑ Initial requirements gathered                          |
| ☑ Budget range discussed                                 |
|                                                           |
| UPDATE WIN PROBABILITY                                    |
|                                                           |
| Current: 70%                                              |
| Suggested for Qualification stage: 40%                   |
|                                                           |
| New Probability: [40  ]%                                 |
| (Based on stage + deal signals)                          |
|                                                           |
| NEXT ACTION                                               |
|                                                           |
| What's the next step for this deal?                      |
| [Send requirements questionnaire             ▼]          |
|                                                           |
| Next Action Date                                          |
| [12/20/2025                                     📅]      |
|                                                           |
| NOTES (Optional)                                          |
| [Discovery call went well. Sarah confirmed 3 senior     |
|  engineer hires for Q1. CTO will be involved in final   |
|  vendor selection. Need to send detailed requirements   |
|  doc and rate card by Friday.                      ]    |
|                                                           |
+----------------------------------------------------------+
|                         [Cancel]  [Update Stage ✓]      |
+----------------------------------------------------------+
```

**User Action:** Complete form, click "Update Stage ✓"

**System Response:**
1. Deal stage updated
2. Win probability adjusted
3. Activity logged
4. Task created for next action
5. Card moves to Qualification column
6. Toast: "Deal moved to Qualification"

**Time:** ~1 second

---

### Step 3: View Deal Detail from Pipeline

**User Action:** Click on deal card to view details

**System Response:**
- Deal detail panel slides in from right
- Full deal information visible

**Screen State:**
```
+----------------------------------------------------------+
|                                    Deal Detail      [×]  |
+----------------------------------------------------------+
|                                                           |
| TechStart Inc - Q1 Engineering Hiring                    |
| Stage: 🔵 Qualification              [Move Stage ▼]      |
|                                                           |
| Value: $75,000        Weighted: $30,000 (40%)           |
| Close: Jan 15, 2026   Age: 14 days                      |
| Owner: John Smith                                         |
|                                                           |
+----------------------------------------------------------+
|                                                           |
| DEAL HEALTH                                               |
| ┌────────────────────────────────────────────────────┐  |
| │ Status: 🟢 On Track                                │  |
| │                                                     │  |
| │ ✅ Recent Activity: 1 day ago                      │  |
| │ ✅ Next Action Scheduled: Dec 20                   │  |
| │ ✅ Stakeholders Engaged: 2 of 2                    │  |
| │ ⚠️  Close Date: 27 days away                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| STAGE PROGRESS                                            |
| ┌────────────────────────────────────────────────────┐  |
| │ Discovery ✓ → [Qualification] → Proposal →         │  |
| │      3 days      In progress                       │  |
| │                                                     │  |
| │ → Negotiation → Verbal → Won                       │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| NEXT ACTIONS                                              |
| ┌────────────────────────────────────────────────────┐  |
| │ ⏰ Dec 20 - Send requirements questionnaire        │  |
| │    [Complete] [Reschedule] [Skip]                  │  |
| │                                                     │  |
| │ ⏰ Dec 22 - Follow up on questionnaire            │  |
| │    [Complete] [Reschedule] [Skip]                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| KEY STAKEHOLDERS                                          |
| ┌────────────────────────────────────────────────────┐  |
| │ 👤 Sarah Chen - VP Engineering (Champion)          │  |
| │    Last Contact: 1 day ago | [Email] [Call]       │  |
| │                                                     │  |
| │ 👤 Mike Johnson - CTO (Economic Buyer)             │  |
| │    Last Contact: 3 days ago | [Email] [Call]      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| QUICK ACTIONS                                             |
| [📞 Log Call]  [📧 Send Email]  [📝 Add Note]          |
| [📅 Schedule]  [📋 Update Stage]  [⚠ Mark At Risk]     |
|                                                           |
| RECENT ACTIVITY                                           |
| ┌────────────────────────────────────────────────────┐  |
| │ • Stage moved to Qualification · Yesterday         │  |
| │ • Call logged with Sarah Chen · Yesterday          │  |
| │ • Deal created · Dec 15                            │  |
| │ • Lead converted to deal · Dec 15                  │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| [View Full Details]  [Edit Deal]  [Delete]              |
+----------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 4: Switch to List View

**User Action:** Click "List" view toggle

**System Response:**
- Pipeline switches to table view
- All deals in sortable list

**Screen State:**
```
+----------------------------------------------------------+
| DEAL PIPELINE                    [+ New Deal] [Export]   |
+----------------------------------------------------------+
| [My Deals ▼]  [All Deals]  Period: [This Quarter ▼]     |
| View: [Kanban] [List ●] [Forecast]     [🔍 Search]       |
+----------------------------------------------------------+
|                                                           |
| ☐ Deal Name           Stage        Value    Prob  Close  |
| ──────────────────────────────────────────────────────── |
| ☐ TechStart Inc      Qualification $75,000  40%  Jan 15 |
| ☐ DataFlow Systems   Qualification $48,000  40%  Feb 1  |
| ☐ CloudBase          Proposal      $62,000  60%  Jan 10 |
| ☐ FinanceAI          Negotiation   $85,000  70%  Dec 28 |
| ☐ PaymentCo          Discovery     $35,000  20%  Mar 1  |
| ☐ LogiTech           Qualification $28,000  40%  Jan 20 |
| ☐ HealthSys          Proposal      $45,000  60%  Jan 25 |
| ☐ RetailMax          Discovery     $12,000  20%  Feb 15 |
| ☐ SecurityPro        Proposal      $35,000  60%  Jan 30 |
| ☐ StartupXYZ         Discovery     $3,000   20%  Feb 28 |
| ──────────────────────────────────────────────────────── |
|                                                           |
| Showing 10 of 12 deals                    [Load More]    |
|                                                           |
| TOTALS:                                                   |
| Open Deals: 10 | Total Value: $428,000                   |
| Weighted Pipeline: $178,400                              |
+----------------------------------------------------------+
|                                                           |
| BULK ACTIONS (0 selected)                                |
| [Update Stage]  [Change Owner]  [Export Selected]       |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 5: View Forecast

**User Action:** Click "Forecast" view toggle

**System Response:**
- Forecast view shows deals by expected close month
- Revenue projections displayed

**Screen State:**
```
+----------------------------------------------------------+
| DEAL PIPELINE                    [+ New Deal] [Export]   |
+----------------------------------------------------------+
| [My Deals ▼]  [All Deals]  Period: [This Quarter ▼]     |
| View: [Kanban] [List] [Forecast ●]     [🔍 Search]       |
+----------------------------------------------------------+
|                                                           |
| REVENUE FORECAST                                          |
|                                                           |
| ┌────────────────────────────────────────────────────┐  |
| │                                                     │  |
| │ Quarter Target: $300,000                           │  |
| │                                                     │  |
| │            Dec '25    Jan '26    Feb '26   Total   │  |
| │ ────────────────────────────────────────────────── │  |
| │ Commit     $85,000   $62,000     $0      $147,000 │  |
| │ Upside     $0        $123,000   $12,000  $135,000 │  |
| │ Pipeline   $0        $35,000    $38,000  $73,000  │  |
| │ ────────────────────────────────────────────────── │  |
| │ Total      $85,000   $220,000   $50,000  $355,000 │  |
| │                                                     │  |
| │ [Chart visualization of monthly forecast]          │  |
| │                                                     │  |
| │ vs Target:                                         │  |
| │ Commit:   49% of target 🟡                        │  |
| │ + Upside: 94% of target 🟢                        │  |
| │ + Pipeline: 118% coverage 🟢                      │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| DEALS BY CLOSE MONTH                                      |
|                                                           |
| DECEMBER 2025 (1 deal, $85,000)                          |
| ┌────────────────────────────────────────────────────┐  |
| │ FinanceAI - Negotiation - $85,000 (70%)            │  |
| │ Close: Dec 28 | Status: 🔴 Urgent                  │  |
| │ Next: Final proposal review meeting                 │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| JANUARY 2026 (4 deals, $220,000)                         |
| ┌────────────────────────────────────────────────────┐  |
| │ CloudBase - Proposal - $62,000 (60%) · Jan 10     │  |
| │ TechStart - Qualification - $75,000 (40%) · Jan 15│  |
| │ LogiTech - Qualification - $28,000 (40%) · Jan 20 │  |
| │ HealthSys - Proposal - $45,000 (60%) · Jan 25     │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| FEBRUARY 2026 (2 deals, $50,000)                         |
| ┌────────────────────────────────────────────────────┐  |
| │ DataFlow - Qualification - $48,000 (40%) · Feb 1  │  |
| │ RetailMax - Discovery - $12,000 (20%) · Feb 15    │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~500ms

---

### Step 6: Filter and Search Pipeline

**User Action:** Click filter dropdown, select "Proposal" stage

**System Response:**
- Pipeline filtered to show only Proposal stage deals
- Summary updates to reflect filter

**Screen State:**
```
+----------------------------------------------------------+
| DEAL PIPELINE                    [+ New Deal] [Export]   |
+----------------------------------------------------------+
| [My Deals ▼]  [All Deals]  Period: [This Quarter ▼]     |
| View: [Kanban ●] [List] [Forecast]     [🔍 Search]       |
+----------------------------------------------------------+
| FILTERS APPLIED:  Stage: Proposal  [×]  [Clear All]     |
+----------------------------------------------------------+
|                                                           |
| PIPELINE SUMMARY (Filtered)                               |
| ┌────────────────────────────────────────────────────┐  |
| │ Showing: 3 deals    Value: $142,000                │  |
| │ Weighted: $85,200   Avg Probability: 60%          │  |
| └────────────────────────────────────────────────────┘  |
|                                                           |
| PROPOSAL STAGE (3 deals)                                  |
| ┌──────────────────────────────────────────────────────┐|
| │                                                       │|
| │ ┌──────────┐  ┌──────────┐  ┌──────────┐           │|
| │ │CloudBase │  │HealthSys │  │SecurityPro│           │|
| │ │$62,000   │  │$45,000   │  │$35,000   │           │|
| │ │60% · 15d │  │60% · 25d │  │60% · 20d │           │|
| │ │Lisa Wang │  │Sam Wilson│  │Jane Miller│           │|
| │ │🟢 Active │  │🟢 Active │  │🟢 Active │           │|
| │ └──────────┘  └──────────┘  └──────────┘           │|
| │                                                       │|
| └──────────────────────────────────────────────────────┘|
|                                                           |
+----------------------------------------------------------+
```

**Time:** ~200ms

---

## Postconditions

1. ✅ Pipeline view reflects current deal statuses
2. ✅ Deal stage updates logged
3. ✅ Win probabilities adjusted
4. ✅ Next actions scheduled
5. ✅ Activity timeline updated
6. ✅ Weighted pipeline recalculated

---

## Events Logged

| Event | Payload |
|-------|---------|
| `deal.stage_changed` | `{ deal_id, old_stage, new_stage, changed_by, changed_at }` |
| `deal.probability_updated` | `{ deal_id, old_prob, new_prob }` |
| `deal.activity_logged` | `{ deal_id, activity_type, notes }` |
| `pipeline.viewed` | `{ user_id, view_type, filters }` |

---

## Pipeline Health Indicators

| Indicator | Definition | Color |
|-----------|------------|-------|
| **On Track** | Recent activity (<7 days), next action scheduled | 🟢 Green |
| **Slow** | No activity 7-14 days | 🟡 Yellow |
| **Stale** | No activity >14 days | 🟠 Orange |
| **Urgent** | Close date within 14 days + not in final stages | 🔴 Red |
| **At Risk** | Manually flagged as at-risk | 🔴 Red |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `k` | Kanban view |
| `l` | List view |
| `f` | Forecast view |
| `n` | New deal |
| `/` | Search |
| `1-5` | Filter by stage |

---

## Related Use Cases

- [B03-create-deal.md](./B03-create-deal.md) - Create deals
- [B05-close-deal.md](./B05-close-deal.md) - Close deals
- [H03-recruiter-dashboard.md](./H03-recruiter-dashboard.md) - Dashboard metrics

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| TC-001 | Drag deal to next stage | Stage update modal, deal moves |
| TC-002 | Switch to list view | All deals in table format |
| TC-003 | View forecast | Monthly breakdown shown |
| TC-004 | Filter by stage | Only matching deals shown |
| TC-005 | Update win probability | Weighted value recalculated |
| TC-006 | Search deals | Matching deals highlighted |
| TC-007 | Bulk stage update | Multiple deals moved |
| TC-008 | Export pipeline | CSV/PDF downloaded |

---

## Backend Processing

### tRPC Procedures

- `deals.list` - Get deals with filters
- `deals.updateStage` - Move deal to new stage
- `deals.getPipelineSummary` - Aggregate metrics
- `deals.getForecast` - Revenue forecast by period

---

*Last Updated: 2025-12-05*

