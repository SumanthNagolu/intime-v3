# PROMPT: UI-ACTIVITIES (Window 6)

Copy everything below the line and paste into Claude Code CLI:

---

Use the metadata skill.

Create Activity UI components for the Guidewire-inspired activity-centric architecture.

## Read First:
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
- src/lib/db/schema/workplan.ts
- src/components/cards/entity/ActivityCard.tsx (if exists)

## Core Principle:
"No work is done unless an activity is created" - Activities are central to all workflows.

## Create Activity Components:

### 1. Activity Views (src/components/activities/views/):

#### ActivityList.tsx
List of activities with:
- Grouping (by date, status, entity)
- Filters (status, priority, assigned, overdue, pattern)
- Sort options (due date, priority, created)
- Quick actions per row
- Bulk selection & actions

#### ActivityCalendar.tsx
Calendar view of activities:
- Month/week/day views
- Color by priority/status
- Drag to reschedule
- Click to view/edit
- Today indicator

#### ActivityKanban.tsx
Kanban board by status:
- Columns: Pending, In Progress, Completed
- Or by priority: Critical, High, Medium, Low
- Drag-drop between columns
- Column WIP limits

#### ActivityQueue.tsx
Work queue view:
- Prioritized list (SLA-aware)
- Next action recommendation
- Claim/unclaim actions
- Queue filters
- Personal vs team queue

#### ActivityTimeline.tsx
Timeline view:
- Chronological activities/events
- Entity filter
- Activity/event toggle
- Expand for details

### 2. Activity Components (src/components/activities/):

#### ActivityHeader.tsx
Activity detail header:
- Pattern icon & name
- Subject
- Status badge
- Priority indicator
- SLA status (time remaining or overdue)
- Assigned to (avatar, reassign)
- Actions (Start, Complete, Defer)

#### ActivityChecklist.tsx
Checklist within activity:
- Items from pattern
- Check/uncheck
- Add custom items
- Progress indicator
- Required items highlighted

#### ActivityComments.tsx
Comment thread:
- Add comment
- Internal/external toggle
- Mentions (@user)
- Attachments
- Edit/delete own comments

#### ActivityFields.tsx
Dynamic fields from pattern:
- Render based on field type
- Validation
- Auto-save on change

#### ActivityRelated.tsx
Related entities panel:
- Primary entity (candidate, job, etc.)
- Related activities
- Related events
- Quick navigation

#### ActivitySLA.tsx
SLA indicator:
- Time remaining (countdown)
- Status (ok/warning/critical/breached)
- Target time display
- Breach reason (if breached)

### 3. Activity Actions (src/components/activities/actions/):

#### CreateActivityButton.tsx
- Pattern selector
- Quick create modal
- Entity context (pre-fill related entity)

#### ActivityStatusButtons.tsx
Status transition buttons:
- Start (pending → in_progress)
- Complete (in_progress → completed)
- Defer (with reason)
- Cancel (with reason)
- Validation before transition

#### CompleteActivityModal.tsx
Completion flow:
- Outcome selector (from pattern)
- Completion notes (if required)
- Checklist verification
- Next activity suggestion
- Create follow-up option

#### ReassignActivityModal.tsx
Reassignment:
- User selector
- Reason field
- Notify toggle

#### DeferActivityModal.tsx
Defer activity:
- New due date
- Reason field
- Snooze presets (1hr, 4hr, tomorrow, next week)

### 4. Activity Patterns (src/components/activities/patterns/):

#### PatternSelector.tsx
Pattern dropdown/modal:
- Grouped by category
- Search
- Pattern info (description, fields, SLA)
- Recently used

#### PatternCard.tsx
Pattern display:
- Icon, name, description
- Default priority, SLA
- Field count, checklist count

#### PatternBadge.tsx
Compact pattern indicator:
- Icon
- Name
- Category color

### 5. Activity Feed (src/components/activities/feed/):

#### ActivityFeed.tsx
Combined activity + event feed:
- Toggle: Activities only, Events only, Both
- Filter by entity, user, type
- Infinite scroll
- Real-time updates

#### ActivityFeedItem.tsx
Feed item:
- Icon based on type
- Title/action description
- Entity reference
- Actor + timestamp
- Expand for details

#### EventFeedItem.tsx
Event item:
- System icon
- Event type
- Description
- Timestamp
- Related entity

### 6. Activity Dashboard (src/components/activities/dashboard/):

#### MyActivitiesWidget.tsx
Personal activity widget:
- Due today count
- Overdue count
- In progress count
- Quick list of urgent items

#### TeamActivitiesWidget.tsx
Team activity overview:
- Team members' workload
- Unassigned activities
- SLA at risk count

#### ActivityMetricsWidget.tsx
Activity performance:
- Completed this week
- Avg completion time
- SLA compliance rate
- Trend chart

#### OverdueActivitiesWidget.tsx
Overdue alerts:
- List of overdue activities
- Escalation indicators
- Quick reassign

### 7. Activity Hooks (src/hooks/activities/):

#### useActivity.ts
- Fetch single activity with related data

#### useActivities.ts
- List activities with filters
- Pagination
- Real-time updates

#### useActivityMutations.ts
- Create, update, complete, defer, reassign
- Optimistic updates

#### useMyQueue.ts
- Personal work queue
- Priority sorting
- SLA awareness

## Requirements:
- Real-time updates (subscriptions)
- Optimistic UI for status changes
- Keyboard shortcuts (complete, defer, etc.)
- SLA countdown timers
- Accessibility (focus management, announcements)
- Mobile responsive

## Activity Status Flow:
```
pending → in_progress → completed
                ↓
            deferred → pending
                ↓
            cancelled
```

## After Components:
Export all from src/components/activities/index.ts
