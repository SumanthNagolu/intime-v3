# PROMPT: ACTIVITY-SYSTEM (Window 2)

Copy everything below the line and paste into Claude Code CLI:

---

Use the database skill.

Implement the Activity System (Guidewire-inspired) for InTime v3.

## Read First:
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
- src/lib/db/schema/workplan.ts

## Core Principle:
"No work is done unless an activity is created" - Activities are the unit of work tracking.

## Create Activity System (src/lib/activities/):

### 1. Activity Service (src/lib/activities/ActivityService.ts)

```typescript
class ActivityService {
  // Create activity from pattern
  createFromPattern(patternCode: string, data: CreateActivityInput): Promise<Activity>;

  // Create manual activity
  createManual(data: CreateActivityInput): Promise<Activity>;

  // Start activity (pending → in_progress)
  start(activityId: string, userId: string): Promise<Activity>;

  // Complete activity (in_progress → completed)
  complete(activityId: string, data: CompleteActivityInput): Promise<Activity>;

  // Defer activity
  defer(activityId: string, data: DeferActivityInput): Promise<Activity>;

  // Cancel activity
  cancel(activityId: string, reason: string): Promise<Activity>;

  // Reassign activity
  reassign(activityId: string, newAssignee: string, reason: string): Promise<Activity>;

  // Get activities for user queue
  getQueue(userId: string, filters: QueueFilters): Promise<Activity[]>;

  // Get activities for entity
  getForEntity(entityType: string, entityId: string): Promise<Activity[]>;

  // Calculate SLA status
  calculateSLAStatus(activity: Activity): SLAStatus;
}
```

### 2. Pattern Service (src/lib/activities/PatternService.ts)

```typescript
class PatternService {
  // Get pattern by code
  getPattern(code: string): Promise<ActivityPattern>;

  // Get patterns by category
  getByCategory(category: string): Promise<ActivityPattern[]>;

  // Create activity from pattern
  instantiate(patternCode: string, entityType: string, entityId: string, overrides?: Partial<Activity>): Promise<Activity>;

  // Get pattern fields
  getFields(patternId: string): Promise<PatternField[]>;

  // Validate field values
  validateFields(patternId: string, values: Record<string, any>): ValidationResult;
}
```

### 3. Auto-Activity Engine (src/lib/activities/AutoActivityEngine.ts)

```typescript
class AutoActivityEngine {
  // Process event and create activities if rules match
  processEvent(event: Event): Promise<Activity[]>;

  // Get rules for event type
  getRulesForEvent(eventType: string): Promise<ActivityAutoRule[]>;

  // Evaluate rule conditions
  evaluateConditions(rule: ActivityAutoRule, event: Event): boolean;

  // Map event data to activity fields
  mapFields(rule: ActivityAutoRule, event: Event): Record<string, any>;

  // Determine assignee
  resolveAssignee(rule: ActivityAutoRule, event: Event): string;
}
```

### 4. SLA Engine (src/lib/activities/SLAEngine.ts)

```typescript
class SLAEngine {
  // Calculate SLA target time
  calculateTarget(activity: Activity, pattern: ActivityPattern): Date;

  // Get current SLA status
  getStatus(activity: Activity): 'ok' | 'warning' | 'critical' | 'breached';

  // Get time remaining
  getTimeRemaining(activity: Activity): number; // minutes

  // Apply business hours
  applyBusinessHours(startTime: Date, durationMinutes: number, timezone: string): Date;

  // Process SLA checks (scheduled job)
  processAllActivities(): Promise<SLACheckResult[]>;

  // Escalate breached activities
  escalate(activityId: string): Promise<void>;
}
```

### 5. Queue Manager (src/lib/activities/QueueManager.ts)

```typescript
class QueueManager {
  // Get personal work queue
  getPersonalQueue(userId: string): Promise<QueuedActivity[]>;

  // Get team queue
  getTeamQueue(teamId: string): Promise<QueuedActivity[]>;

  // Claim activity from queue
  claim(activityId: string, userId: string): Promise<Activity>;

  // Unclaim activity (return to queue)
  unclaim(activityId: string): Promise<Activity>;

  // Get next recommended activity
  getNextRecommended(userId: string): Promise<Activity | null>;

  // Calculate priority score
  calculatePriorityScore(activity: Activity): number;

  // Sort queue by priority
  sortByPriority(activities: Activity[]): Activity[];
}
```

### 6. Activity Types (src/lib/activities/types.ts)

```typescript
interface Activity {
  id: string;
  workplanId: string | null;
  patternId: string | null;
  subject: string;
  description: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
  assignedTo: string;
  assignedBy: string;
  dueAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  completedBy: string | null;
  outcome: string | null;
  completionNotes: string | null;
  parentActivityId: string | null;
  relatedEntityType: string;
  relatedEntityId: string;
  correlationId: string | null;
  slaStatus: 'ok' | 'warning' | 'critical' | 'breached';
}

interface CreateActivityInput {
  patternCode?: string;
  subject: string;
  description?: string;
  priority?: Priority;
  dueAt?: Date;
  assignedTo: string;
  relatedEntityType: string;
  relatedEntityId: string;
  parentActivityId?: string;
  fieldValues?: Record<string, any>;
}

interface CompleteActivityInput {
  outcome: string;
  completionNotes?: string;
  createFollowUp?: {
    patternCode: string;
    dueOffset?: number; // hours
  };
}

interface DeferActivityInput {
  newDueAt: Date;
  reason: string;
}

interface QueueFilters {
  status?: ActivityStatus[];
  priority?: Priority[];
  overdue?: boolean;
  patternCodes?: string[];
  entityType?: string;
  limit?: number;
}

interface SLAStatus {
  status: 'ok' | 'warning' | 'critical' | 'breached';
  targetAt: Date;
  timeRemaining: number; // minutes
  warningAt: Date;
  criticalAt: Date;
}
```

### 7. Activity Hooks (src/hooks/activities/):

```typescript
// useActivity.ts - Single activity
export function useActivity(id: string);

// useActivities.ts - List with filters
export function useActivities(filters: QueueFilters);

// useMyQueue.ts - Personal queue
export function useMyQueue();

// useActivityMutations.ts - Activity mutations
export function useActivityMutations();
```

### 8. Activity UI Integration Points:

```typescript
// After key actions, create activity
async function afterSubmissionCreate(submission: Submission) {
  await activityService.createFromPattern('REVIEW_SUBMISSION', {
    subject: `Review submission for ${submission.candidate.name}`,
    assignedTo: submission.job.primaryRecruiter,
    relatedEntityType: 'submission',
    relatedEntityId: submission.id,
  });
}

// On activity completion, potentially trigger follow-ups
async function onActivityComplete(activity: Activity, outcome: string) {
  const followUpRules = await patternService.getFollowUpRules(activity.patternId, outcome);
  for (const rule of followUpRules) {
    await activityService.createFromPattern(rule.patternCode, {
      parentActivityId: activity.id,
      // ... mapped from current activity
    });
  }
}
```

## Standard Activity Patterns to Seed:

See docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md for full list.

Key patterns:
- `REVIEW_SUBMISSION` - Review candidate submission
- `SCHEDULE_INTERVIEW` - Schedule interview for candidate
- `COLLECT_FEEDBACK` - Collect interview feedback
- `PREPARE_OFFER` - Prepare offer package
- `FOLLOW_UP_LEAD` - Follow up with lead
- `UPDATE_MARKETING_PROFILE` - Update consultant profile
- `CHECK_VISA_EXPIRY` - Visa expiry check
- `COMPLETE_ONBOARDING_TASK` - Onboarding checklist item

## Requirements:
- Thread-safe activity creation
- Optimistic locking for updates
- Audit trail for all changes
- Real-time updates (consider subscriptions)
- Bulk operations support
- Proper error handling

## Scheduled Jobs (src/jobs/):

```typescript
// SLA checker - runs every 5 minutes
export async function checkSLAStatus();

// Reminder sender - runs every 15 minutes
export async function sendActivityReminders();

// Escalation processor - runs every hour
export async function processEscalations();
```

## After Implementation:
- Seed activity patterns from library
- Create SLA definitions
- Test auto-activity rules
- Verify queue sorting
