# PROMPT: UI-ACTIVITIES (Window 6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create Activity UI components for the Guidewire-inspired activity-centric architecture.

## Read First:
- docs/specs/10-DATABASE/00-ERD.md (Database overview - activities and workplans)
- docs/specs/01-GLOSSARY.md (Business terms - activities, patterns, SLA)
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md (Core activity/event architecture)
- docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md (All activity patterns by domain)
- docs/specs/20-USER-ROLES/01-recruiter/01-daily-workflow.md (How recruiters use activities)
- docs/specs/20-USER-ROLES/02-bench-sales/00-OVERVIEW.md (Bench sales activity patterns)
- docs/specs/20-USER-ROLES/04-manager/00-OVERVIEW.md (Manager activity oversight)
- src/lib/db/schema/workplan.ts (Activity schema)
- src/components/cards/entity/ActivityCard.tsx (If exists)

## Core Principle:
"No work is done unless an activity is created" - Activities are central to all workflows in InTime v3.
Every action a user takes should generate or update an activity. Activities have patterns (templates), SLAs, checklists, and outcomes.

## Create Activity Components:

### 1. Activity Views (src/components/activities/views/):

#### ActivityList.tsx
List of activities with:
- Grouping options: by date (today/tomorrow/this week/later), by status, by entity type, by pattern
- Filter panel:
  - Status (multi-select): pending, in_progress, completed, deferred, cancelled
  - Priority (multi-select): critical, urgent, high, normal, low
  - Assigned to (searchable): me, unassigned, specific user
  - Overdue toggle
  - Pattern (grouped by category)
  - Entity type: job, candidate, submission, account, lead, deal, placement
  - Date range
- Sort options: due date, priority, created date, last updated
- Quick actions per row: Start, Complete, Defer, Reassign
- Bulk selection & actions
- Row click → expand inline or open drawer

#### ActivityCalendar.tsx
Calendar view of activities:
- Month/week/day view toggle
- Color coding by:
  - Priority (critical=red, high=orange, normal=blue, low=gray)
  - Status (pending=yellow, in_progress=green, overdue=red)
- Drag to reschedule (updates dueAt)
- Click to view activity drawer
- Today indicator (highlighted)
- Multi-day activities shown as bars
- Integration with interview calendar

#### ActivityKanban.tsx
Kanban board with configurable columns:
- By status: Pending → In Progress → Completed
- By priority: Critical → High → Normal → Low
- By entity type (jobs, candidates, etc.)
- Drag-drop between columns (triggers status/priority change)
- Column WIP limits (configurable, highlight when exceeded)
- Card: pattern icon, subject, due date, assignee, SLA indicator
- Column header shows count

#### ActivityQueue.tsx
Work queue view (primary "Today" view):
- Prioritized list (SLA-aware sorting):
  1. Overdue (oldest first)
  2. Breaching soon (< 1 hour)
  3. Due today (by priority)
  4. Coming up (next 24 hours)
- Next action recommendation (AI-suggested or rule-based)
- Claim/unclaim actions for unassigned activities
- Queue filters: My queue, Team queue (for managers), Unassigned
- Quick complete/defer buttons
- Personal vs team toggle

#### ActivityTimeline.tsx
Timeline view for entity context:
- Chronological activities + events
- Entity filter (show only for selected job/candidate/etc.)
- Activity/event type toggle
- Expand for full details
- Load more (infinite scroll)
- Date range selector
- Export timeline

### 2. Activity Components (src/components/activities/):

#### ActivityHeader.tsx
Activity detail header:
- Pattern icon + name (e.g., "📞 Follow-up Call")
- Subject line (editable)
- Status badge (pending/in_progress/completed/deferred/cancelled)
- Priority indicator (icon + color)
- SLA status:
  - Time remaining countdown (e.g., "2h 30m remaining")
  - Or overdue duration (e.g., "Overdue by 1d 4h")
  - Status: on_track (green), at_risk (yellow), breached (red)
- Assigned to: Avatar + name + reassign button
- Related entity link
- Action buttons: Start, Complete, Defer, Cancel, Reassign

#### ActivityChecklist.tsx
Checklist within activity:
- Items from pattern definition (pre-populated)
- Check/uncheck with timestamp + user
- Add custom items (+ button)
- Progress indicator (3/5 items)
- Required items highlighted (asterisk, must complete before finishing activity)
- Reorder items (drag)
- Delete custom items

#### ActivityComments.tsx
Comment thread on activity:
- Add comment (rich text, markdown support)
- Internal/external toggle (internal = team only, external = visible to client if shared)
- @mentions (user autocomplete, triggers notification)
- File attachments
- Edit/delete own comments (within time limit)
- Threaded replies
- Timestamp + author

#### ActivityFields.tsx
Dynamic fields from pattern definition:
- Render based on field type (text, select, date, currency, etc.)
- Validation per field
- Auto-save on change (debounced)
- Required field indicators
- Field grouping (sections)
- Conditional fields (dependsOn)

#### ActivityRelated.tsx
Related entities panel:
- Primary entity card (the job/candidate/etc. this activity is about)
- Related activities (other activities on same entity)
- Related events (system events on same entity)
- Quick navigation links
- Create related activity button

#### ActivitySLA.tsx
SLA indicator component:
- Time remaining countdown (live updating)
- Status badge: on_track, at_risk, breached
- Target time display (due at)
- Breach reason (if breached, show why)
- SLA tier (from pattern: critical, high, normal, low)
- Override SLA button (with reason, manager only)

#### ActivityHistory.tsx
History/audit log for activity:
- Status changes (with timestamps, actors)
- Field changes (diff view)
- Reassignments
- Comments added
- Checklist changes

### 3. Activity Actions (src/components/activities/actions/):

#### CreateActivityButton.tsx
- Floating action button or inline button
- Pattern selector (opens PatternSelector)
- Quick create modal (ActivityQuickCreateModal)
- Entity context pre-fill (if on entity page)
- Keyboard shortcut: `n` for new activity

#### ActivityStatusButtons.tsx
Status transition buttons (based on current status):
- **Pending → Start**: Changes to in_progress, sets startedAt
- **In Progress → Complete**: Opens CompleteActivityModal
- **Any → Defer**: Opens DeferActivityModal, sets to deferred with new dueAt
- **Any → Cancel**: Opens cancel confirmation, requires reason
- Validation before transition (required fields, checklist)
- Loading state during mutation

#### ActivityQuickCreateModal.tsx
Quick activity creation:
- Pattern selector (required)
- Subject (auto-suggested from pattern + entity)
- Assigned to (default: current user)
- Due date (default: calculated from pattern SLA)
- Priority (default: from pattern)
- Related entity (searchable, or pre-filled from context)
- Description (optional)
- Create button

#### CompleteActivityModal.tsx
Completion flow:
- Summary of activity
- Outcome selector (from pattern outcomes: success, partial, failed, etc.)
- Completion notes (required if pattern says so)
- Checklist verification (must complete required items)
- Next activity suggestion (from pattern's nextActivity field)
- Create follow-up option (checkbox + due date)
- Complete button

#### ReassignActivityModal.tsx
Reassignment:
- Current assignee display
- New assignee selector (searchable users)
- Reason field (required)
- Notify new assignee toggle (default: on)
- Keep in my queue toggle (for managers)
- Reassign button

#### DeferActivityModal.tsx
Defer activity:
- Current due date display
- New due date picker
- Snooze presets: 1 hour, 4 hours, Tomorrow 9am, Next Monday 9am, Custom
- Reason field (required for >1 day defer)
- Defer button
- Activity stays in deferred status until new dueAt

#### CancelActivityModal.tsx
Cancel activity:
- Warning message
- Reason selector (duplicate, no longer needed, created in error, other)
- Notes field
- Confirm cancel button

### 4. Activity Patterns (src/components/activities/patterns/):

#### PatternSelector.tsx
Pattern selection interface:
- Grouped by category:
  - Recruiting: Source candidate, Screen candidate, Submit candidate, Schedule interview, Follow up
  - Bench Sales: Market consultant, Submit to requirement, Update availability, Immigration check
  - CRM: Outreach call, Send proposal, Negotiate deal, Follow up lead
  - HR: Onboard employee, Process I-9, Review timesheet, Conduct 1:1
  - General: Task, Note, Meeting, Email, Call
- Search within patterns
- Pattern info on hover/select (description, SLA, fields, checklist)
- Recently used patterns (pinned at top)
- Favorites

#### PatternCard.tsx
Pattern display card:
- Icon (emoji or Lucide icon)
- Name
- Description (short)
- Default priority badge
- SLA indicator (e.g., "4h SLA")
- Field count, checklist item count
- Click to select

#### PatternBadge.tsx
Compact pattern indicator (for lists/tables):
- Icon
- Name (truncated)
- Category color coding
- Tooltip with full info

#### PatternDetail.tsx
Full pattern information:
- Name, description, category
- Default priority, SLA tier
- Fields definition
- Checklist items
- Possible outcomes
- Auto-create next activity rules
- Usage stats (how often used)

### 5. Activity Feed (src/components/activities/feed/):

#### ActivityFeed.tsx
Combined activity + event feed (for entity detail pages):
- Toggle: Activities only, Events only, All
- Filter by:
  - Activity type/pattern
  - Event type
  - User (who created/performed)
  - Date range
- Infinite scroll with load more
- Real-time updates (new items appear at top)
- Grouped by date

#### ActivityFeedItem.tsx
Activity in feed:
- Pattern icon
- Subject line (link to activity)
- Status badge
- Assignee avatar
- Due date / completed date
- Expand to show description, checklist preview
- Quick actions (if pending/in_progress)

#### EventFeedItem.tsx
System event in feed:
- Event type icon (status_changed, email_sent, document_uploaded, etc.)
- Event description (auto-generated: "Status changed from Submitted to Interview Scheduled")
- Actor (who triggered, or "System" if automated)
- Timestamp (relative)
- Related entity link
- Expand for full details/metadata

### 6. Activity Dashboard Widgets (src/components/activities/dashboard/):

#### MyActivitiesWidget.tsx
Personal activity widget:
- Due today count (with number badge)
- Overdue count (red badge if > 0)
- In progress count
- Quick list of top 5 urgent items
- "View all" link
- Refresh button

#### TeamActivitiesWidget.tsx (Manager view)
Team activity overview:
- Team members with activity counts
- Unassigned activities count (action needed)
- SLA at risk count
- Workload distribution chart
- Click member to see their queue

#### ActivityMetricsWidget.tsx
Activity performance metrics:
- Completed this week (number + trend)
- Average completion time (vs SLA)
- SLA compliance rate (%)
- Trend chart (7-day sparkline)
- Breakdown by pattern type

#### OverdueActivitiesWidget.tsx
Overdue alerts:
- List of overdue activities (top 10)
- Escalation level indicators
- Quick reassign action
- Acknowledge/dismiss option
- Critical items highlighted

#### UpcomingActivitiesWidget.tsx
Upcoming timeline:
- Next 24-48 hours of activities
- Grouped by time slot
- Quick view on hover
- Click to open

### 7. Activity Hooks (src/hooks/activities/):

#### useActivity.ts
```tsx
const { activity, isLoading, error, refetch } = useActivity(activityId);
// Returns activity with related entity, pattern, checklist, comments
```

#### useActivities.ts
```tsx
const { activities, totalCount, isLoading, error, refetch } = useActivities({
  status: ['pending', 'in_progress'],
  assignedTo: 'me',
  entityType: 'job',
  entityId: 'xxx',
  page: 1,
  pageSize: 25,
});
// List activities with filters, pagination, real-time updates
```

#### useActivityMutations.ts
```tsx
const { createActivity, updateActivity, startActivity, completeActivity, deferActivity, reassignActivity, cancelActivity } = useActivityMutations();
// All mutations with optimistic updates
```

#### useMyQueue.ts
```tsx
const { queue, overdue, dueToday, upcoming, refetch } = useMyQueue();
// Personal work queue, SLA-sorted
```

#### useTeamQueue.ts (Manager)
```tsx
const { queue, byMember, unassigned, atRisk } = useTeamQueue(podId);
// Team-wide activity queue
```

#### useActivityPatterns.ts
```tsx
const { patterns, byCategory, search } = useActivityPatterns();
// Available patterns for selection
```

### 8. Activity Utilities (src/lib/activities/):

#### sla.ts
SLA calculation utilities:
- calculateSLAStatus(dueAt, priority) → 'on_track' | 'at_risk' | 'breached'
- getTimeRemaining(dueAt) → { hours, minutes, text }
- isOverdue(dueAt) → boolean
- getAtRiskThreshold(priority) → number (minutes before due to be "at risk")

#### patterns.ts
Pattern utilities:
- getDefaultDueDate(pattern, priority) → Date
- getPatternFields(pattern) → FieldDefinition[]
- getPatternChecklist(pattern) → ChecklistItem[]
- getPatternOutcomes(pattern) → Outcome[]

#### transitions.ts
Status transition validation:
- canTransition(currentStatus, newStatus) → boolean
- getAvailableTransitions(currentStatus) → Status[]
- validateTransition(activity, newStatus) → ValidationResult

## Activity Status Flow:
```
               ┌──────────────────────────────────────────┐
               │                                          │
               ▼                                          │
           pending ──────► in_progress ──────► completed  │
               │               │                          │
               │               ▼                          │
               │           deferred ──────────────────────┘
               │               │
               ▼               ▼
           cancelled       cancelled
```

**Transitions:**
- pending → in_progress (Start)
- pending → deferred (Defer without starting)
- pending → cancelled (Cancel)
- in_progress → completed (Complete with outcome)
- in_progress → deferred (Defer mid-work)
- in_progress → cancelled (Cancel)
- deferred → pending (Resume - resets dueAt)
- deferred → cancelled (Cancel)

## Activity Pattern Categories:

### Recruiting Patterns:
- Source candidate
- Screen candidate
- Submit candidate
- Schedule interview
- Conduct interview
- Follow up with client
- Follow up with candidate
- Make offer
- Onboard placement

### Bench Sales Patterns:
- Source consultant
- Update consultant profile
- Market consultant (hotlist)
- Submit to requirement
- Update availability
- Immigration status check
- Vendor follow up
- Close placement

### CRM Patterns:
- Lead outreach
- Qualify lead
- Send proposal
- Negotiate deal
- Contract review
- Client check-in

### HR Patterns:
- Employee onboarding
- I-9 verification
- Background check
- Timesheet review
- PTO request review
- Performance review
- 1:1 meeting

### General Patterns:
- Task (generic)
- Note (logging only)
- Meeting
- Call
- Email

## Requirements:
- Real-time updates via tRPC subscriptions or polling
- Optimistic UI for status changes (immediate feedback, rollback on error)
- Keyboard shortcuts:
  - `n` - New activity
  - `s` - Start selected activity
  - `c` - Complete selected activity
  - `d` - Defer selected activity
  - `r` - Reassign selected activity
  - `j/k` - Navigate up/down in list
  - `Enter` - Open selected activity
- SLA countdown timers (live updating every minute)
- Accessibility:
  - Focus management
  - Screen reader announcements for status changes
  - High contrast for overdue items
- Mobile responsive (swipe actions, compact views)
- Offline support (queue actions, sync when online)

## After Components:
Export all from src/components/activities/index.ts

  use parallel agents.. not for sake of using..  only where it
  makes senses