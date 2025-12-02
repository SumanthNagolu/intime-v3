---
name: frontend
description: Guidewire Activity-Centric UI patterns for InTime v3 frontend development
---

# Frontend Skill - Guidewire Activity-Centric UI

## Core Philosophy

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"              ║
║                                                                            ║
║   Every UI action must:                                                    ║
║   • Show activity history for all entities                                 ║
║   • Provide quick-log buttons for manual activities                        ║
║   • Display pending activities prominently                                 ║
║   • Enforce activity requirements before state transitions                 ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Activities vs Events in UI

| Aspect | ACTIVITY (Human Work) | EVENT (System Record) |
|--------|----------------------|----------------------|
| Display | Editable cards with actions | Read-only timeline entries |
| Icon | Type-based (📞 📧 📅 ✅ 📝) | ⚡ bolt icon |
| Status | Open → In Progress → Completed | No status (immutable) |
| Actions | Complete, Reschedule, Reassign | View Details only |
| Color | Status-based (🔴 overdue, 🟡 today, 🟢 upcoming) | Gray/neutral |

## UI Component Patterns

### 1. Activity Queue Widget

Every dashboard must include an activity queue widget showing:

```typescript
interface ActivityQueueWidgetProps {
  userId: string;
  showOverdue?: boolean;      // Default: true
  showDueToday?: boolean;     // Default: true
  showUpcoming?: boolean;     // Default: true (collapsed)
  maxItems?: number;          // Default: 10
  onActivityClick?: (activity: Activity) => void;
}

// Section structure
// - Overdue (red indicator) - expanded by default
// - Due Today (yellow indicator) - expanded by default
// - Upcoming (green indicator) - collapsed by default
// - Progress bar: "Today's Progress: 4/10 completed"
```

### 2. Activity Timeline View

Entity detail pages must show unified timeline of activities AND events:

```typescript
interface TimelineViewProps {
  entityType: EntityType;
  entityId: string;
  filters?: {
    types?: ActivityType[];    // Filter by activity type
    users?: string[];          // Filter by user
    statuses?: ActivityStatus[];
    includeEvents?: boolean;   // Default: true
  };
  groupBy?: 'day' | 'week' | 'month';
}

// Timeline item types:
// ✓ Completed activity (checkmark)
// ○ Open activity (circle)
// ◉ In-progress activity (filled circle)
// ⚡ System event (bolt)
// ↳ Auto-created follow-up (arrow)
```

### 3. Quick Log Buttons

Every entity card/detail page must have quick activity buttons:

```tsx
// Always include in entity headers/footers
<QuickLogButtons
  entityType="candidate"
  entityId={candidateId}
  types={['call', 'email', 'note', 'task', 'meeting']}
/>

// Renders: [📞 Call] [📧 Email] [📝 Note] [✅ Task] [📅 Meeting]
```

### 4. Activity Creation Modal

Standard modal for logging activities:

```typescript
interface ActivityModalProps {
  entityType: EntityType;
  entityId: string;
  defaultType?: ActivityType;
  onComplete?: (activity: Activity) => void;
}

// Required fields:
// - Activity Type (icon selector)
// - Related To (pre-filled from context)
// - Subject (text)
// - Status (open/in_progress/completed)
// - Priority (critical/high/medium/low)

// If status = completed:
// - Outcome (successful/unsuccessful/no_answer/etc.)
// - Duration (minutes)
// - Notes (required for calls)
// - Follow-up checkbox with date picker
```

### 5. Activity Completion Modal

When completing an activity:

```typescript
interface CompleteActivityModalProps {
  activityId: string;
  onComplete?: (activity: Activity, followUp?: Activity) => void;
}

// Required fields:
// - Outcome (required)
// - Duration (required for calls/meetings)
// - Notes (optional, required for calls)
// - Follow-up Required? (checkbox)
// - If follow-up: type, subject, due date
```

### 6. Activity Badge on Entity Cards

All entity cards must display activity indicators:

```tsx
<ActivityBadge
  entityType="candidate"
  entityId={candidateId}
/>

// Shows: 🔴 2 overdue | 🟡 3 due today | 📊 15 total
// + Last Activity: "Call - 2 hours ago"
```

## Screen Section Types

Reference: `src/lib/metadata/types/screen.types.ts`

### Activity-Related Section Types

```typescript
type SectionType =
  | 'activity-queue'    // Pending activities for user
  | 'activity-timeline' // Full activity/event history
  | 'activity-stream'   // Recent activities only
  | 'quick-log'         // Quick log buttons bar
  // ... other section types
```

### Activity Queue Section Definition

```typescript
{
  id: 'my-activities',
  type: 'activity-queue',
  title: 'My Activities',
  config: {
    userId: fieldValue('currentUserId'),
    showOverdue: true,
    showDueToday: true,
    showUpcoming: false,
    maxItems: 10,
  },
}
```

### Activity Timeline Section Definition

```typescript
{
  id: 'entity-timeline',
  type: 'activity-timeline',
  title: 'Timeline',
  dataSource: {
    type: 'query',
    query: {
      procedure: 'activities.getTimeline',
      params: {
        entityType: 'candidate',
        entityId: fieldValue('id'),
      },
    },
  },
  config: {
    includeEvents: true,
    groupBy: 'day',
  },
}
```

## State Transition Guards

Before allowing entity status changes, check activity requirements:

```typescript
interface TransitionGuard {
  fromStatus: string;
  toStatus: string;
  requiredActivities: {
    type: ActivityType;
    count: number;
    status: 'completed';
  }[];
  errorMessage: string;
}

// Example: Candidate new → submitted requires 1 completed call
const candidateGuards: TransitionGuard[] = [
  {
    fromStatus: 'new',
    toStatus: 'submitted',
    requiredActivities: [{ type: 'call', count: 1, status: 'completed' }],
    errorMessage: 'Complete at least 1 call before submitting candidate'
  },
];

// Usage in UI
const canTransition = await checkTransitionGuard(
  'candidate',
  candidateId,
  'new',
  'submitted'
);
if (!canTransition.allowed) {
  showError(canTransition.errorMessage);
}
```

## SLA Indicators

Display SLA status for activities:

```typescript
type SLAStatus = 'on_track' | 'warning' | 'breached';

function getSLAStatus(activity: Activity): SLAStatus {
  if (!activity.dueDate) return 'on_track';

  const now = new Date();
  const due = new Date(activity.dueDate);
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDue < 0) return 'breached';
  if (hoursUntilDue < activity.slaWarningHours) return 'warning';
  return 'on_track';
}

// Color mapping
const slaColors = {
  on_track: 'green',
  warning: 'yellow',
  breached: 'red',
};
```

## Activity Icons Reference

| Type | Icon | Color |
|------|------|-------|
| `call` | 📞 | Blue |
| `email` | 📧 | Green |
| `meeting` | 📅 | Purple |
| `task` | ✅ | Gray |
| `note` | 📝 | Yellow |
| `sms` | 💬 | Cyan |
| `linkedin` | 💼 | Blue |
| `review` | 👁️ | Orange |
| `document` | 📄 | Gray |
| `interview` | 🎤 | Purple |
| `submission` | 📤 | Green |
| `status_change` | 🔄 | Blue |
| `assignment` | 👤 | Gray |
| `escalation` | ⚠️ | Red |
| `follow_up` | ↩️ | Blue |

## Dashboard Requirements

Every role dashboard MUST include:

1. **Activity Queue Widget** - Top priority section
2. **Today's Progress Bar** - Completed vs total activities
3. **Overdue Alerts** - Prominent display of overdue items
4. **Quick Actions** - Log activity, view all activities

```typescript
// Dashboard screen definition pattern
const dashboardScreen: ScreenDefinition = {
  id: 'recruiter-dashboard',
  type: 'dashboard',
  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'activity-queue',
        type: 'activity-queue',
        title: 'My Activities',
        priority: 1,  // Always first
      },
      // ... other sections
    ],
  },
};
```

## Entity Detail Page Requirements

Every entity detail page MUST include:

1. **Quick Log Buttons** - In header or toolbar
2. **Activity Timeline Tab** - Full history view
3. **Open Activities Section** - Pending items for this entity
4. **Activity Badge** - Summary in header

```typescript
// Entity detail screen pattern
const candidateDetailScreen: ScreenDefinition = {
  id: 'candidate-detail',
  type: 'detail',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        sections: [
          { id: 'quick-log', type: 'quick-log' },
          { id: 'info', type: 'info-card', /* ... */ },
          { id: 'open-activities', type: 'activity-stream', /* ... */ },
        ],
      },
      {
        id: 'timeline',
        label: 'Timeline',
        badge: { field: 'activityCount' },
        sections: [
          { id: 'timeline', type: 'activity-timeline', /* ... */ },
        ],
      },
    ],
  },
};
```

## Notification Toasts

Show activity-related notifications:

```typescript
// Activity assigned
toast.info('New activity assigned: Follow up on submission');

// Activity due soon
toast.warning('Activity due in 1 hour: Call candidate');

// Activity overdue
toast.error('Overdue: Client check-in (2 hours late)');

// Activity completed
toast.success('Activity completed: Introduction call');
```

## React Query Patterns

### Activity Hooks

```typescript
// Get user's activity queue
export function useMyActivities(options?: { status?: ActivityStatus[] }) {
  return trpc.activities.getMyQueue.useQuery({
    statuses: options?.status ?? ['open', 'in_progress'],
  });
}

// Get entity timeline
export function useEntityTimeline(entityType: EntityType, entityId: string) {
  return trpc.activities.getTimeline.useQuery({
    entityType,
    entityId,
    includeEvents: true,
  });
}

// Complete activity mutation
export function useCompleteActivity() {
  const utils = trpc.useUtils();

  return trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.getMyQueue.invalidate();
      utils.activities.getTimeline.invalidate();
    },
  });
}
```

## File Locations

```
src/components/activities/
├── ActivityQueueWidget.tsx      # Queue display
├── ActivityTimeline.tsx         # Timeline view
├── ActivityModal.tsx            # Create/edit modal
├── CompleteActivityModal.tsx    # Completion flow
├── QuickLogButtons.tsx          # Quick action buttons
├── ActivityBadge.tsx            # Summary badge
├── ActivityCard.tsx             # Individual activity
└── EventCard.tsx                # System event display

src/hooks/queries/
├── useActivities.ts             # Activity queries
└── useEvents.ts                 # Event queries

src/hooks/mutations/
├── useCreateActivity.ts
├── useCompleteActivity.ts
└── useRescheduleActivity.ts
```

## Accessibility Requirements

- Activity status must be announced to screen readers
- Due date/time clearly visible
- Color not sole indicator of status (use icons + labels)
- Keyboard navigation for activity actions
- Focus management in modals

## Quick Reference Checklist

Before shipping any entity UI:

- [ ] Activity queue widget on dashboard
- [ ] Quick log buttons on entity cards/detail
- [ ] Timeline tab on entity detail pages
- [ ] Activity badge showing counts
- [ ] Transition guards enforced
- [ ] SLA indicators displayed
- [ ] Overdue items highlighted
- [ ] Follow-up prompts on completion
