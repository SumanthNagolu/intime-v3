---
name: backend
description: Guidewire Activity-Centric backend patterns for InTime v3 server development
---

# Backend Skill - Guidewire Activity-Centric Architecture

## Core Philosophy

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║   "NO WORK IS CONSIDERED DONE UNLESS AN ACTIVITY IS CREATED"              ║
║                                                                            ║
║   Every backend action must:                                               ║
║   • Emit an EVENT (system record, immutable)                               ║
║   • Create/update ACTIVITY (human work tracking)                           ║
║   • Trigger AUTO-ACTIVITIES via patterns                                   ║
║   • Enforce transition rules requiring activities                          ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Activities vs Events

| Aspect | ACTIVITY | EVENT |
|--------|----------|-------|
| **Creator** | Human (user action) | System (automated) |
| **Purpose** | Track work done | Record what happened |
| **Ownership** | Assigned to a user | No owner (system record) |
| **Status** | Open → In Progress → Completed | Immutable (no status) |
| **Editable** | Yes (notes, due date) | No (immutable log) |

## Data Models

### Activity Schema

```typescript
interface Activity {
  id: string;
  org_id: string;
  activity_number: string;              // ACT-2024-00001

  // Type & Pattern
  activity_type: ActivityType;          // call, email, meeting, task, note, etc.
  activity_pattern_id?: string;         // Reference to pattern (if auto-created)
  is_auto_created: boolean;

  // Subject & Description
  subject: string;
  description?: string;

  // Related Entity (Polymorphic)
  related_entity_type: EntityType;      // candidate, job, submission, account
  related_entity_id: string;
  secondary_entity_type?: EntityType;
  secondary_entity_id?: string;

  // Assignment
  assigned_to: string;                  // User ID
  created_by: string;

  // Status & Priority
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Timing
  due_date?: Date;
  completed_at?: Date;
  duration_minutes?: number;

  // Outcome
  outcome?: ActivityOutcome;
  outcome_notes?: string;

  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_activity_id?: string;

  // SLA
  sla_warning_hours?: number;
  sla_breach_hours?: number;

  created_at: Date;
  updated_at: Date;
}

type ActivityType =
  | 'call' | 'email' | 'meeting' | 'task' | 'note'
  | 'sms' | 'linkedin' | 'review' | 'document'
  | 'interview' | 'submission' | 'status_change'
  | 'assignment' | 'escalation' | 'follow_up' | 'custom';

type ActivityOutcome =
  | 'successful' | 'unsuccessful' | 'no_answer'
  | 'left_voicemail' | 'rescheduled' | 'no_show'
  | 'partial' | 'pending_response';
```

### Event Schema

```typescript
interface Event {
  id: string;
  org_id: string;
  event_id: string;                     // EVT-2024-00001

  // Event Classification
  event_type: string;                   // e.g., "candidate.submitted"
  event_category: 'entity' | 'workflow' | 'system' | 'integration' | 'security';
  event_severity: 'info' | 'warning' | 'error' | 'critical';

  // Actor
  actor_type: 'user' | 'system' | 'integration' | 'scheduler' | 'webhook';
  actor_id?: string;
  actor_name?: string;

  // Entity
  entity_type: EntityType;
  entity_id: string;
  entity_name?: string;

  // Event Data (IMMUTABLE)
  event_data: Record<string, any>;
  changes?: { field: string; old_value: any; new_value: any }[];

  // Context
  source: 'ui' | 'api' | 'integration' | 'scheduler' | 'webhook' | 'migration';

  // Correlation
  correlation_id?: string;
  parent_event_id?: string;
  triggered_activity_ids?: string[];

  // Timestamps (immutable)
  occurred_at: Date;
  recorded_at: Date;
}
```

### Activity Pattern Schema

```typescript
interface ActivityPattern {
  id: string;
  org_id: string;
  pattern_code: string;                 // CAND_SUBMITTED_FOLLOWUP

  // Display
  name: string;
  description?: string;

  // Trigger
  trigger_event: string;                // Event type that triggers this
  trigger_conditions?: Condition[];     // Optional conditions

  // Activity Template
  activity_type: ActivityType;
  subject_template: string;             // Supports {{variables}}
  description_template?: string;
  priority: ActivityPriority;

  // Assignment
  assign_to: AssignmentRule;

  // Timing
  due_offset_hours?: number;
  due_offset_business_days?: number;

  // SLA
  sla_warning_hours?: number;
  sla_breach_hours?: number;

  is_active: boolean;
  can_be_skipped: boolean;
  requires_outcome: boolean;
}

type AssignmentRule =
  | { type: 'owner' }                   // Entity owner
  | { type: 'raci_role'; role: 'R' | 'A' | 'C' | 'I' }
  | { type: 'specific_user'; user_id: string }
  | { type: 'specific_role'; role: string }
  | { type: 'round_robin'; group_id: string }
  | { type: 'least_busy' }
  | { type: 'creator' }
  | { type: 'manager' };
```

## Event Naming Convention

Events follow `{entity}.{action}[.{qualifier}]` pattern:

```typescript
// Candidate events
'candidate.created'
'candidate.updated'
'candidate.status_changed'
'candidate.submitted'
'candidate.interviewed'
'candidate.placed'
'candidate.stale'               // System-generated (7 days no activity)

// Job events
'job.created'
'job.published'
'job.closed'
'job.filled'
'job.stale'                     // System-generated (14 days no activity)

// Submission events
'submission.created'
'submission.sent_to_client'
'submission.approved'
'submission.rejected'

// Interview events
'interview.scheduled'
'interview.completed'
'interview.no_show'
'interview.feedback_submitted'

// Placement events
'placement.started'
'placement.extended'
'placement.ended'
'placement.timesheet_missing'

// Account/Lead/Deal events
'account.created'
'account.health_score_dropped'
'lead.created'
'lead.qualified'
'deal.stage_changed'
'deal.won'
```

## Implementation Patterns

### 1. Action Handler Pattern

Every mutation must follow this pattern:

```typescript
async function handleBusinessAction(
  input: ActionInput,
  ctx: Context
): Promise<Result> {
  const { userId, orgId } = ctx;

  return db.transaction(async (tx) => {
    // 1. Execute business logic
    const entity = await executeBusinessLogic(tx, input);

    // 2. Emit event (ALWAYS - immutable record)
    await emitEvent(tx, {
      type: 'entity.action',
      entityType: 'entity_type',
      entityId: entity.id,
      actorId: userId,
      eventData: {
        ...relevantData,
      },
    });

    // 3. Create manual activity (if user action)
    await createActivity(tx, {
      type: 'action_type',
      subject: `Action performed on ${entity.name}`,
      relatedEntityType: 'entity_type',
      relatedEntityId: entity.id,
      assignedTo: userId,
      createdBy: userId,
      status: 'completed',
      completedAt: new Date(),
    });

    // 4. Auto-activities triggered by event handler (async)
    // Pattern matcher runs after transaction commits

    return entity;
  });
}
```

### 2. Create with Activity Pattern

```typescript
// Root entities (lead, job, submission, deal, placement) MUST create activities
create: orgProtectedProcedure
  .input(createSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, orgId } = ctx;

    return db.transaction(async (tx) => {
      // 1. Create entity
      const [entity] = await tx.insert(tableName)
        .values({
          ...input,
          orgId,
          createdBy: userId,
        })
        .returning();

      // 2. Emit event
      await emitEvent(tx, {
        type: 'entity.created',
        entityType: 'entity_type',
        entityId: entity.id,
        actorId: userId,
        eventData: { ...entity },
      });

      // 3. Log creation activity
      await createActivity(tx, {
        type: 'task',
        subject: `${EntityName} created: ${entity.name}`,
        relatedEntityType: 'entity_type',
        relatedEntityId: entity.id,
        assignedTo: userId,
        createdBy: userId,
        status: 'completed',
        outcome: 'successful',
        completedAt: new Date(),
      });

      return entity;
    });
  }),
```

### 3. Update with Status Change Detection

```typescript
update: orgProtectedProcedure
  .input(updateSchema)
  .mutation(async ({ ctx, input }) => {
    const { userId, orgId } = ctx;

    return db.transaction(async (tx) => {
      // 1. Get old values for comparison
      const [old] = await tx.select()
        .from(tableName)
        .where(eq(tableName.id, input.id))
        .limit(1);

      if (!old) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Update entity
      const [entity] = await tx.update(tableName)
        .set({ ...input.data, updatedAt: new Date() })
        .where(and(
          eq(tableName.id, input.id),
          eq(tableName.orgId, orgId)
        ))
        .returning();

      // 3. Emit update event
      await emitEvent(tx, {
        type: 'entity.updated',
        entityType: 'entity_type',
        entityId: entity.id,
        actorId: userId,
        eventData: { ...entity },
        changes: diffObjects(old, entity),
      });

      // 4. Handle status change specifically
      if (old.status !== entity.status) {
        await emitEvent(tx, {
          type: 'entity.status_changed',
          entityType: 'entity_type',
          entityId: entity.id,
          actorId: userId,
          eventData: {
            oldStatus: old.status,
            newStatus: entity.status,
          },
        });

        await createActivity(tx, {
          type: 'status_change',
          subject: `Status changed: ${old.status} → ${entity.status}`,
          relatedEntityType: 'entity_type',
          relatedEntityId: entity.id,
          assignedTo: userId,
          createdBy: userId,
          status: 'completed',
          completedAt: new Date(),
        });
      }

      return entity;
    });
  }),
```

### 4. Auto-Activity Rule Engine

```typescript
// Event handler that triggers auto-activities
async function handleEvent(event: Event): Promise<void> {
  // Find matching activity patterns
  const patterns = await findMatchingPatterns(event.event_type, event.org_id);

  for (const pattern of patterns) {
    // Check conditions
    if (!evaluateConditions(pattern.trigger_conditions, event.event_data)) {
      continue;
    }

    // Resolve assignee
    const assigneeId = await resolveAssignee(pattern.assign_to, event);

    // Calculate due date
    const dueDate = calculateDueDate(
      event.occurred_at,
      pattern.due_offset_hours,
      pattern.due_offset_business_days
    );

    // Interpolate templates
    const subject = interpolateTemplate(pattern.subject_template, event.event_data);

    // Create activity
    const activity = await createActivity({
      type: pattern.activity_type,
      subject,
      relatedEntityType: event.entity_type,
      relatedEntityId: event.entity_id,
      assignedTo: assigneeId,
      createdBy: 'system',
      status: 'open',
      priority: pattern.priority,
      dueDate,
      isAutoCreated: true,
      activityPatternId: pattern.id,
      slaWarningHours: pattern.sla_warning_hours,
      slaBreachHours: pattern.sla_breach_hours,
    });

    // Link to event
    await linkActivityToEvent(activity.id, event.id);

    // Send notification
    await notifyAssignee(assigneeId, activity);
  }
}
```

### 5. Template Variable Interpolation

```typescript
// Available template variables
const templateContext = {
  // Entity context
  candidate: { id, name, email, phone, status, owner: { name } },
  job: { id, title, account: { name }, location, rate_range, owner: { name } },
  submission: { id, status, bill_rate, candidate: { name }, job: { title } },
  account: { id, name, industry, owner: { name } },

  // Event context
  event: { type, actor: { name }, occurred_at },

  // System context
  today: new Date().toISOString().split('T')[0],
  now: new Date().toISOString(),
  user: { name },
  org: { name },
};

function interpolateTemplate(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    return getNestedValue(data, path.trim()) ?? '';
  });
}

// Example:
// Template: "Follow up on {{candidate.name}} submission to {{job.title}}"
// Result: "Follow up on John Smith submission to Senior Java Developer @ Google"
```

### 6. Transition Guard Enforcement

```typescript
interface TransitionRule {
  entity_type: EntityType;
  from_status: string;
  to_status: string;
  required_activities: {
    type: ActivityType;
    count: number;
    status: 'completed';
  }[];
  error_message: string;
}

const transitionRules: TransitionRule[] = [
  {
    entity_type: 'candidate',
    from_status: 'new',
    to_status: 'submitted',
    required_activities: [{ type: 'call', count: 1, status: 'completed' }],
    error_message: 'Complete at least 1 call before submitting candidate',
  },
  {
    entity_type: 'submission',
    from_status: 'draft',
    to_status: 'sent_to_client',
    required_activities: [{ type: 'review', count: 1, status: 'completed' }],
    error_message: 'Complete resume review before sending to client',
  },
  {
    entity_type: 'lead',
    from_status: 'new',
    to_status: 'qualified',
    required_activities: [{ type: 'call', count: 1, status: 'completed' }],
    error_message: 'Complete qualification call before marking as qualified',
  },
];

async function checkTransitionAllowed(
  entityType: EntityType,
  entityId: string,
  fromStatus: string,
  toStatus: string
): Promise<{ allowed: boolean; errorMessage?: string }> {
  const rule = transitionRules.find(
    r => r.entity_type === entityType &&
         r.from_status === fromStatus &&
         r.to_status === toStatus
  );

  if (!rule) return { allowed: true };

  for (const req of rule.required_activities) {
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(and(
        eq(activities.relatedEntityType, entityType),
        eq(activities.relatedEntityId, entityId),
        eq(activities.activityType, req.type),
        eq(activities.status, req.status)
      ));

    if (Number(count[0].count) < req.count) {
      return { allowed: false, errorMessage: rule.error_message };
    }
  }

  return { allowed: true };
}
```

### 7. SLA Monitoring

```typescript
// Scheduled job to check SLA status
async function checkActivitySLAs(): Promise<void> {
  const now = new Date();

  // Find activities approaching SLA warning
  const warningActivities = await db.select()
    .from(activities)
    .where(and(
      eq(activities.status, 'open'),
      isNotNull(activities.dueDate),
      isNotNull(activities.slaWarningHours),
      sql`${activities.dueDate} - interval '1 hour' * ${activities.slaWarningHours} <= ${now}`,
      sql`${activities.dueDate} > ${now}`,
    ));

  for (const activity of warningActivities) {
    await emitEvent({
      type: 'activity.sla_warning',
      entityType: 'activity',
      entityId: activity.id,
      eventData: { activity },
    });
    await notifyUser(activity.assignedTo, 'sla_warning', activity);
  }

  // Find breached activities
  const breachedActivities = await db.select()
    .from(activities)
    .where(and(
      eq(activities.status, 'open'),
      isNotNull(activities.dueDate),
      sql`${activities.dueDate} < ${now}`,
    ));

  for (const activity of breachedActivities) {
    await emitEvent({
      type: 'activity.sla_breach',
      entityType: 'activity',
      entityId: activity.id,
      eventData: { activity },
    });
    await notifyUser(activity.assignedTo, 'sla_breach', activity);
    await escalateToManager(activity);
  }
}
```

### 8. Stale Entity Detection

```typescript
// Scheduled job to detect stale entities
async function detectStaleEntities(): Promise<void> {
  const staleThresholds = {
    candidate: 7,   // days
    job: 14,
    lead: 7,
    deal: 7,
  };

  for (const [entityType, days] of Object.entries(staleThresholds)) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const staleEntities = await db.select()
      .from(getEntityTable(entityType))
      .where(and(
        inArray(getEntityTable(entityType).status, getActiveStatuses(entityType)),
        lt(getEntityTable(entityType).lastActivityAt, threshold),
      ));

    for (const entity of staleEntities) {
      await emitEvent({
        type: `${entityType}.stale`,
        entityType,
        entityId: entity.id,
        eventData: {
          daysSinceActivity: days,
          lastActivityAt: entity.lastActivityAt,
        },
      });
      // This triggers auto-activity via pattern (e.g., CAND_STALE_FOLLOWUP)
    }
  }
}
```

## Standard Activity Patterns

### Candidate Patterns

| Pattern Code | Trigger Event | Activity | Due |
|--------------|---------------|----------|-----|
| `CAND_NEW_INTRO_CALL` | `candidate.created` | Call: Introduction call | +4 hours |
| `CAND_SUBMITTED_FOLLOWUP` | `candidate.submitted` | Call: Follow up on submission | +24 hours |
| `CAND_INTERVIEW_PREP` | `interview.scheduled` | Task: Prepare for interview | -24 hours |
| `CAND_INTERVIEW_DEBRIEF` | `interview.completed` | Call: Post-interview debrief | +2 hours |
| `CAND_STALE_FOLLOWUP` | `candidate.stale` | Call: Re-engage candidate | +0 hours |

### Job Patterns

| Pattern Code | Trigger Event | Activity | Due |
|--------------|---------------|----------|-----|
| `JOB_NEW_KICKOFF` | `job.created` | Meeting: Kickoff with hiring manager | +24 hours |
| `JOB_SOURCING_START` | `job.published` | Task: Begin sourcing | +0 hours |
| `JOB_NO_SUBMITS` | `job.no_submissions` (5 days) | Task: Review requirements | +0 hours |

### Submission Patterns

| Pattern Code | Trigger Event | Activity | Due |
|--------------|---------------|----------|-----|
| `SUB_CLIENT_FOLLOWUP` | `submission.sent_to_client` | Call: Follow up with client | +48 hours |
| `SUB_REJECTED_FEEDBACK` | `submission.rejected` | Task: Get rejection feedback | +4 hours |

## tRPC Router Structure

```typescript
// src/server/routers/activities.ts
export const activitiesRouter = router({
  // Get user's activity queue
  getMyQueue: orgProtectedProcedure
    .input(z.object({
      statuses: z.array(z.enum(['open', 'in_progress'])).optional(),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get entity timeline (activities + events)
  getTimeline: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      includeEvents: z.boolean().default(true),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Create activity
  create: orgProtectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Complete activity
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcome: z.enum([...activityOutcomes]),
      durationMinutes: z.number().optional(),
      outcomeNotes: z.string().optional(),
      followUp: z.object({
        type: z.enum([...activityTypes]),
        subject: z.string(),
        dueDate: z.date(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Reschedule activity
  reschedule: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newDueDate: z.date(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Check transition allowed
  checkTransition: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      fromStatus: z.string(),
      toStatus: z.string(),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),
});
```

## File Locations

```
src/lib/activities/
├── types.ts                    # Activity, Event, Pattern types
├── events.ts                   # Event emission utilities
├── patterns.ts                 # Pattern matching logic
├── templates.ts                # Template interpolation
├── transitions.ts              # Transition guard rules
├── sla.ts                      # SLA calculation utilities
└── index.ts                    # Exports

src/server/routers/
├── activities.ts               # Activity CRUD router
└── events.ts                   # Event query router

src/lib/db/schema/
├── activities.ts               # Activities table
├── events.ts                   # Events table (immutable)
└── activity-patterns.ts        # Pattern definitions
```

## Quick Reference Checklist

Before shipping any backend mutation:

- [ ] Emit appropriate event(s) for the action
- [ ] Create/update activity record for user actions
- [ ] Check transition guards before status changes
- [ ] Update `lastActivityAt` on related entity
- [ ] Link auto-activities to triggering events
- [ ] Include SLA thresholds from patterns
- [ ] Handle errors without losing event data
