# PROMPT: SCREENS-MANAGER (Window 3)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill and backend skill.

Create/Update Pod Manager role screens for InTime v3 using the metadata-driven screen definition approach.

## Read First (Required):
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Complete manager spec - "path clearer" role)
- docs/specs/20-USER-ROLES/04-manager/02-pod-dashboard.md (Pod dashboard spec)
- docs/specs/20-USER-ROLES/04-manager/03-handle-escalation.md (Escalation handling)
- docs/specs/20-USER-ROLES/04-manager/04-approve-submission.md (Approval workflows)
- docs/specs/20-USER-ROLES/04-manager/05-conduct-1on1.md (1:1 meetings)
- docs/specs/20-USER-ROLES/04-manager/06-sprint-planning.md (Sprint planning)
- docs/specs/01-GLOSSARY.md (Pods, RACI model)
- CLAUDE.md (Tech stack)

## Read Existing Code:
- src/screens/operations/index.ts (Existing screen registry)
- src/screens/operations/pod-dashboard.screen.ts
- src/screens/operations/approvals-queue.screen.ts
- src/screens/operations/escalations.screen.ts
- src/screens/operations/pod-metrics.screen.ts
- src/lib/metadata/types.ts (ScreenDefinition type)
- src/lib/db/schema/core.ts (Pods schema)

## Context:
- Routes: `/employee/manager/*` for manager-specific screens
- Per 00-OVERVIEW.md: Manager is "Path Clearer / Torch Bearer" - DOES NOT do the work
- Managers have RACI role of Consulted (C) on ALL pod objects
- Pod types: recruiting, bench_sales, ta (Talent Acquisition)
- Manager permissions: View all pod data, approve/reject, escalate, coach
- Managers DO NOT assign work - ICs are autonomous

## Manager Philosophy (Critical):
Per 00-OVERVIEW.md "Core Philosophy":
- ❌ DO NOT assign individual jobs to ICs
- ❌ DO NOT do the recruiting work (sourcing, screening, submitting)
- ❌ DO NOT micromanage daily tasks
- ❌ DO NOT interfere unless asked
- ✅ DO remove obstacles/blockers
- ✅ DO handle escalations
- ✅ DO coach ICs
- ✅ DO approve high-stakes decisions

## Screen Definitions (src/screens/operations/):

### 1. Manager Dashboard (UPDATE existing)
File: pod-dashboard.screen.ts
Route: `/employee/manager/pod` (also accessible via `/employee/manager/dashboard`)
Status: EXISTS - Enhance per 02-pod-dashboard.md

Per 00-OVERVIEW.md "Daily Workflow Summary":

**Morning Section:**
- Overnight escalations (badge if any)
- Team member status (at-risk ICs highlighted)
- C and I notifications (RACI items needing attention)

**Pod Metrics Widget:**
- Sprint target progress (collective pod goal)
- Placement rate per IC
- Pipeline coverage ratio (target: 3x)
- IC productivity averages

**Sprint Progress Widget:**
- Days remaining in sprint
- Target vs actual (placements, submissions)
- Burn-down chart (if time permits)

**Alerts Panel:**
- Escalated items requiring action
- SLA breaches
- ICs not hitting targets (coaching needed)
- Pending approvals count

### 2. Pod Overview (CREATE if missing)
File: pod-overview.screen.ts
Route: `/employee/manager/pod/overview`

Pod summary with:
- Pod name, type (recruiting/bench_sales/ta)
- Team members grid (IC cards with avatars, current sprint performance)
- Pod health score
- Key metrics summary
- Recent activity feed

### 3. Team Management (CREATE if missing)
File: team-management.screen.ts
Route: `/employee/manager/team`

Team roster with:
- IC profiles (avatar, name, role, tenure)
- Individual performance metrics per IC
- 1:1 schedule status
- Coaching notes summary
- Row click → IC detail

### 4. IC Performance Detail (CREATE if missing)
File: ic-performance-detail.screen.ts
Route: `/employee/manager/team/[userId]`

Per 00-OVERVIEW.md "IC Performance" screen access:

Tabs:
- Overview: Current sprint metrics, YTD performance, goals
- Pipeline: IC's active jobs/consultants (read-only)
- Activities: IC's activity history (monitoring, not doing)
- 1:1s: 1:1 meeting notes and schedule
- Coaching: Coaching notes, development plans

Actions: Schedule 1:1, Add Coaching Note, Transfer Item (if needed)

### 5. Sprint Board (CREATE if missing)
File: sprint-board.screen.ts
Route: `/employee/manager/sprint`

Per 06-sprint-planning.md:

Layout:
- Sprint header (sprint number, dates, days remaining)
- Pod-level targets (placements, revenue, submissions)
- Per-IC targets and progress
- Blockers log

Kanban view: Columns by status for sprint items
Actions: Add Blocker, Adjust Target (with justification), End Sprint

### 6. Escalations Queue (UPDATE existing)
File: escalations.screen.ts
Route: `/employee/manager/escalations`
Status: EXISTS - Verify per 03-handle-escalation.md

Per 00-OVERVIEW.md RACI Matrix:
- Client Escalation → Manager is R + A (takes over, resolves)
- IC Requests Help → Manager provides coaching

Columns: createdAt, type, IC name, entity (job/candidate/etc.), status, priority, SLA
Filters: Type (client/candidate/rate/other), Status (open/in_progress/resolved), Priority
Row click → Escalation detail drawer

Actions per row: Take Over, Assign Back, Resolve, Escalate Further

### 7. Escalation Detail (CREATE if missing)
File: escalation-detail.screen.ts
Route: `/employee/manager/escalations/[id]`

Layout:
- Header: Type, Priority, Status, Created
- Context panel: Related entity (job/candidate/submission), IC info
- Timeline: Escalation history
- Resolution form: Outcome, notes, follow-up tasks

Actions: Resolve, Assign Back, Escalate to COO

### 8. Approvals Queue (UPDATE existing)
File: approvals-queue.screen.ts
Route: `/employee/manager/approvals`
Status: EXISTS - Verify per 04-approve-submission.md

Per 00-OVERVIEW.md RACI Matrix, manager approves:
- Offers extended (C + A review before offer)
- Unusual rate submissions (C + A)
- Any rate override or negative margin

Columns: type, IC name, entity, requestedAt, amount (if rate), details preview
Filters: Type (offer/rate_override/negative_margin), Status (pending/approved/rejected)

Approval form: Approve/Reject, Notes (required for reject), Conditions

### 9. Approval Detail (CREATE if missing)
File: approval-detail.screen.ts
Route: `/employee/manager/approvals/[id]`

Layout:
- Header: Approval type, Status, Requested by, Requested at
- Entity summary (submission/offer details)
- Rate calculation (if rate-related): margin display, comparison to standard
- Similar approvals (historical context)
- Decision form: Approve/Reject with notes

### 10. Analytics Dashboard (UPDATE if needed)
File: pod-metrics.screen.ts OR manager-analytics.screen.ts
Route: `/employee/manager/analytics`
Status: EXISTS - Verify comprehensive

Per 00-OVERVIEW.md Metrics (Section 4):

Primary Metrics:
- Pod Placement Rate (target: 1 per IC per sprint)
- IC Productivity Average
- Sprint Goal Achievement (% of sprints on target)
- Escalation Resolution Time (<24 hours)
- IC Satisfaction Score (from surveys)
- Pod Pipeline Health (3x coverage)
- Client Escalation Rate (<5%)

Charts:
- Trend over last 4 sprints
- Comparison to org average
- Per-IC breakdown
- Pipeline funnel (jobs → submissions → interviews → offers → placements)

### 11. 1:1 Management (CREATE if missing)
File: one-on-ones.screen.ts
Route: `/employee/manager/1on1`

Per 05-conduct-1on1.md:

List view: ICs with next 1:1 date, last 1:1 date, status (overdue/upcoming/scheduled)
Filters: Status, Date range

Actions: Schedule 1:1, View Notes

### 12. 1:1 Session Detail (CREATE if missing)
File: one-on-one-detail.screen.ts
Route: `/employee/manager/1on1/[userId]`

Layout:
- IC header: Avatar, name, role, tenure
- Session form: Date, duration, location
- Agenda: Topics to discuss (from IC and manager)
- Notes: Free-form notes, private
- Action items: Tasks created during 1:1
- History: Previous 1:1 summaries

### 13. RACI Watchlist (CREATE if missing)
File: raci-watchlist.screen.ts
Route: `/employee/manager/raci`

Per 00-OVERVIEW.md RACI section:
Manager has C (Consulted) on ALL pod objects

Sections:
- Awaiting My Input: Items where manager is C and pending action
- Recently Consulted: Items where manager provided input
- Informed Items: Items where manager is I (information only)

Filters: Entity type, IC, Date range
Actions: Provide Input, Mark Reviewed

### 14. Cross-Pod Coordination (CREATE if missing)
File: cross-pod.screen.ts
Route: `/employee/manager/cross-pod`

Per 00-OVERVIEW.md "Key Responsibilities" #7:
- View other pods (read-only)
- Cross-pollination opportunities
- Collaboration requests

### 15. Manager Activities (CREATE if missing)
File: manager-activities.screen.ts
Route: `/employee/manager/activities`

Manager-specific activity patterns:
- Handle escalation
- Conduct 1:1
- Sprint planning
- Coach IC
- Review approval
- Strategic account review

Use Phase 2 ActivityQueue with manager-specific patterns

## Screen Definition Pattern:
```typescript
import type { ScreenDefinition } from '@/lib/metadata/types';

export const managerScreenName: ScreenDefinition = {
  id: 'manager-screen-id',
  type: 'list' | 'dashboard' | 'detail',
  title: 'Screen Title',
  icon: 'IconName',

  // Permission check - manager role required
  permission: {
    roles: ['pod_manager', 'admin'],
  },

  dataSource: {
    type: 'query',
    query: { procedure: 'manager.procedure' },
    params: { podId: { type: 'context', path: 'user.podId' } },
  },

  layout: { /* sections */ },
  actions: [...],
};
```

## Requirements:
- Pod-scoped data (filter by user's assigned pod)
- Read-only view of IC work (monitoring, not doing)
- Approval workflows with audit trail
- Escalation handling with resolution tracking
- 1:1 scheduling and notes
- Sprint target tracking
- RACI visibility (Consulted/Informed items)
- Follow existing pattern from pod-dashboard.screen.ts

## Key UX Principles:
Per Manager Philosophy:
1. Show aggregate metrics, not task assignments
2. Enable coaching, not micromanaging
3. Surface blockers for removal
4. Highlight at-risk situations for intervention
5. Provide approval/rejection workflow (not work assignment)

## After Screens:
1. Export from src/screens/operations/index.ts
2. Add to operationsScreens registry
3. Create routes in src/app/employee/manager/
4. Update navigation config
