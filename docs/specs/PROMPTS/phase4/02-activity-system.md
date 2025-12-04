Use the database skill and backend skill.

Complete the Activity System (Guidewire-inspired) for InTime v3. Core services exist but need enhancement.

## Read First:
- src/lib/activities/ (ALL existing files - understand current implementation)
- src/lib/db/schema/workplan.ts (Activity schema)
- docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
- docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md

## Current State Analysis:

### Implemented (src/lib/activities/):
- `activity-service.ts` - COMPLETE: create, complete, reschedule, reassign, start, cancel, defer
- `activity-engine.ts` - PARTIAL: processEvent exists but needs enhancement
- `pattern-matcher.ts` - EXISTS: Basic pattern matching
- `patterns.ts` - COMPLETE: 100+ activity patterns defined
- `sla.ts` - COMPLETE: SLA calculations
- `transitions.ts` - COMPLETE: Status transitions
- `due-date-utils.ts` - EXISTS: Due date calculations
- `template-utils.ts` - EXISTS: Subject/description templates
- `activity-queries.ts` - EXISTS: Query helpers

### Missing Components:
1. **PatternService** - Dedicated service for pattern management
2. **QueueManager** - Activity queue prioritization and claiming
3. **Scheduled Jobs** - SLA checker, reminder sender, escalation processor
4. **Enhanced AutoActivityEngine** - Better event→activity rules

---

## Task 1: Create PatternService

Create `src/lib/activities/PatternService.ts`:

```typescript
import { db } from '@/lib/db';
import { activityPatterns, activityPatternFields } from '@/lib/db/schema/workplan';
import { eq, and } from 'drizzle-orm';
import { ACTIVITY_PATTERNS } from './patterns';

export class PatternService {
  /**
   * Get pattern by code
   */
  async getPattern(code: string) {
    // First check static patterns
    const staticPattern = ACTIVITY_PATTERNS[code];
    if (staticPattern) {
      return staticPattern;
    }

    // Then check database patterns
    const dbPattern = await db.query.activityPatterns.findFirst({
      where: eq(activityPatterns.code, code),
      with: {
        fields: true,
        checklist: true,
      },
    });

    return dbPattern;
  }

  /**
   * Get patterns by category
   */
  async getByCategory(category: string) {
    const staticPatterns = Object.values(ACTIVITY_PATTERNS).filter(
      (p) => p.category === category
    );

    const dbPatterns = await db.query.activityPatterns.findMany({
      where: eq(activityPatterns.category, category),
    });

    return [...staticPatterns, ...dbPatterns];
  }

  /**
   * Get patterns by entity type
   */
  async getByEntityType(entityType: string) {
    return Object.values(ACTIVITY_PATTERNS).filter(
      (p) => p.entityType === entityType
    );
  }

  /**
   * Instantiate activity from pattern
   */
  async instantiate(
    patternCode: string,
    entityType: string,
    entityId: string,
    overrides?: {
      subject?: string;
      description?: string;
      assignedTo?: string;
      dueAt?: Date;
      priority?: 'critical' | 'high' | 'medium' | 'low';
      fieldValues?: Record<string, unknown>;
    }
  ) {
    const pattern = await this.getPattern(patternCode);
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternCode}`);
    }

    // Calculate due date from pattern SLA
    const dueAt = overrides?.dueAt ?? this.calculateDueDate(pattern);

    return {
      patternCode: pattern.code,
      subject: overrides?.subject ?? pattern.defaultSubject,
      description: overrides?.description ?? pattern.defaultDescription,
      priority: overrides?.priority ?? pattern.defaultPriority,
      dueAt,
      relatedEntityType: entityType,
      relatedEntityId: entityId,
      assignedTo: overrides?.assignedTo,
      fieldValues: overrides?.fieldValues ?? {},
      checklist: pattern.defaultChecklist ?? [],
    };
  }

  /**
   * Get pattern fields
   */
  async getFields(patternCode: string) {
    const pattern = await this.getPattern(patternCode);
    return pattern?.fields ?? [];
  }

  /**
   * Validate field values against pattern
   */
  validateFields(
    pattern: ActivityPattern,
    values: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of pattern.fields ?? []) {
      const value = values[field.name];

      // Check required
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: `${field.label} is required`,
        });
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        if (field.type === 'number' && typeof value !== 'number') {
          errors.push({
            field: field.name,
            message: `${field.label} must be a number`,
          });
        }
        if (field.type === 'date' && !(value instanceof Date) && isNaN(Date.parse(value as string))) {
          errors.push({
            field: field.name,
            message: `${field.label} must be a valid date`,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate due date from pattern SLA
   */
  private calculateDueDate(pattern: ActivityPattern): Date {
    const now = new Date();
    const slaHours = pattern.slaHours ?? 24;

    // Apply business hours if configured
    if (pattern.businessHoursOnly) {
      return this.addBusinessHours(now, slaHours);
    }

    return new Date(now.getTime() + slaHours * 60 * 60 * 1000);
  }

  /**
   * Add business hours (9am-6pm, Mon-Fri)
   */
  private addBusinessHours(start: Date, hours: number): Date {
    let remaining = hours;
    let current = new Date(start);

    while (remaining > 0) {
      const dayOfWeek = current.getDay();
      const hour = current.getHours();

      // Skip weekends
      if (dayOfWeek === 0) {
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }
      if (dayOfWeek === 6) {
        current.setDate(current.getDate() + 2);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // Before business hours
      if (hour < 9) {
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // After business hours
      if (hour >= 18) {
        current.setDate(current.getDate() + 1);
        current.setHours(9, 0, 0, 0);
        continue;
      }

      // During business hours - consume time
      const hoursLeftToday = 18 - hour;
      const hoursToConsume = Math.min(remaining, hoursLeftToday);
      remaining -= hoursToConsume;
      current.setHours(current.getHours() + hoursToConsume);
    }

    return current;
  }
}

// Types
interface ActivityPattern {
  code: string;
  name: string;
  category: string;
  entityType: string;
  defaultSubject: string;
  defaultDescription?: string;
  defaultPriority: 'critical' | 'high' | 'medium' | 'low';
  slaHours: number;
  businessHoursOnly?: boolean;
  fields?: PatternField[];
  defaultChecklist?: string[];
}

interface PatternField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: { value: string; label: string }[];
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

export const patternService = new PatternService();
```

---

## Task 2: Create QueueManager

Create `src/lib/activities/QueueManager.ts`:

```typescript
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema/workplan';
import { eq, and, or, inArray, isNull, desc, asc, sql } from 'drizzle-orm';
import { calculateSLAStatus } from './sla';

export class QueueManager {
  /**
   * Get personal work queue for a user
   */
  async getPersonalQueue(
    userId: string,
    options?: {
      status?: ('pending' | 'in_progress')[];
      limit?: number;
      includeSnoozed?: boolean;
    }
  ) {
    const statuses = options?.status ?? ['pending', 'in_progress'];
    const limit = options?.limit ?? 50;

    const results = await db.query.activities.findMany({
      where: and(
        eq(activities.assignedTo, userId),
        inArray(activities.status, statuses),
        isNull(activities.deletedAt),
        options?.includeSnoozed ? undefined : or(
          isNull(activities.snoozedUntil),
          sql`${activities.snoozedUntil} <= NOW()`
        )
      ),
      orderBy: [
        // Priority order: critical > high > medium > low
        sql`CASE ${activities.priority}
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END`,
        // Then by SLA status
        sql`CASE ${activities.slaStatus}
          WHEN 'breached' THEN 1
          WHEN 'critical' THEN 2
          WHEN 'warning' THEN 3
          WHEN 'ok' THEN 4
          ELSE 5
        END`,
        // Then by due date
        asc(activities.dueAt),
      ],
      limit,
      with: {
        pattern: true,
        relatedEntity: true,
      },
    });

    return results.map((activity) => ({
      ...activity,
      slaStatus: calculateSLAStatus(activity),
      priorityScore: this.calculatePriorityScore(activity),
    }));
  }

  /**
   * Get team queue (for managers)
   */
  async getTeamQueue(
    teamId: string,
    options?: {
      status?: ('pending' | 'in_progress')[];
      includeUnassigned?: boolean;
      limit?: number;
    }
  ) {
    const statuses = options?.status ?? ['pending', 'in_progress'];
    const limit = options?.limit ?? 100;

    // Get team members
    const teamMembers = await db.query.podMembers.findMany({
      where: eq(podMembers.podId, teamId),
    });
    const memberIds = teamMembers.map((m) => m.userId);

    const whereConditions = [
      inArray(activities.status, statuses),
      isNull(activities.deletedAt),
    ];

    if (options?.includeUnassigned) {
      whereConditions.push(
        or(
          inArray(activities.assignedTo, memberIds),
          isNull(activities.assignedTo)
        )
      );
    } else {
      whereConditions.push(inArray(activities.assignedTo, memberIds));
    }

    const results = await db.query.activities.findMany({
      where: and(...whereConditions),
      orderBy: [
        sql`CASE ${activities.slaStatus}
          WHEN 'breached' THEN 1
          WHEN 'critical' THEN 2
          WHEN 'warning' THEN 3
          ELSE 4
        END`,
        asc(activities.dueAt),
      ],
      limit,
      with: {
        assignee: true,
        pattern: true,
      },
    });

    return results;
  }

  /**
   * Claim an activity from the queue
   */
  async claim(activityId: string, userId: string) {
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.assignedTo && activity.assignedTo !== userId) {
      throw new Error('Activity is already assigned to another user');
    }

    const [updated] = await db
      .update(activities)
      .set({
        assignedTo: userId,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    return updated;
  }

  /**
   * Unclaim an activity (return to queue)
   */
  async unclaim(activityId: string, userId: string) {
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.assignedTo !== userId) {
      throw new Error('You can only unclaim activities assigned to you');
    }

    if (activity.status === 'in_progress') {
      throw new Error('Cannot unclaim an activity that is in progress');
    }

    const [updated] = await db
      .update(activities)
      .set({
        assignedTo: null,
        claimedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    return updated;
  }

  /**
   * Get next recommended activity for a user
   */
  async getNextRecommended(userId: string) {
    const queue = await this.getPersonalQueue(userId, { limit: 1 });
    return queue[0] ?? null;
  }

  /**
   * Calculate priority score (0-100, higher = more urgent)
   */
  calculatePriorityScore(activity: {
    priority: string;
    dueAt: Date | null;
    slaStatus?: string;
  }): number {
    let score = 0;

    // Priority base score (0-40)
    const priorityScores: Record<string, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };
    score += priorityScores[activity.priority] ?? 10;

    // SLA status score (0-40)
    const slaScores: Record<string, number> = {
      breached: 40,
      critical: 30,
      warning: 20,
      ok: 0,
    };
    score += slaScores[activity.slaStatus ?? 'ok'] ?? 0;

    // Time urgency score (0-20)
    if (activity.dueAt) {
      const hoursUntilDue = (activity.dueAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilDue < 0) {
        score += 20; // Overdue
      } else if (hoursUntilDue < 2) {
        score += 15;
      } else if (hoursUntilDue < 8) {
        score += 10;
      } else if (hoursUntilDue < 24) {
        score += 5;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Sort activities by priority
   */
  sortByPriority<T extends { priorityScore?: number }>(activities: T[]): T[] {
    return [...activities].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(userId: string) {
    const queue = await this.getPersonalQueue(userId, { limit: 1000 });

    const stats = {
      total: queue.length,
      byStatus: {
        pending: queue.filter((a) => a.status === 'pending').length,
        in_progress: queue.filter((a) => a.status === 'in_progress').length,
      },
      bySLA: {
        breached: queue.filter((a) => a.slaStatus === 'breached').length,
        critical: queue.filter((a) => a.slaStatus === 'critical').length,
        warning: queue.filter((a) => a.slaStatus === 'warning').length,
        ok: queue.filter((a) => a.slaStatus === 'ok').length,
      },
      byPriority: {
        critical: queue.filter((a) => a.priority === 'critical').length,
        high: queue.filter((a) => a.priority === 'high').length,
        medium: queue.filter((a) => a.priority === 'medium').length,
        low: queue.filter((a) => a.priority === 'low').length,
      },
      overdueCount: queue.filter((a) => a.dueAt && a.dueAt < new Date()).length,
    };

    return stats;
  }
}

export const queueManager = new QueueManager();
```

---

## Task 3: Create Scheduled Jobs

Create `src/jobs/activity-jobs.ts`:

```typescript
import { db } from '@/lib/db';
import { activities, events } from '@/lib/db/schema/workplan';
import { eq, and, lt, inArray, isNull } from 'drizzle-orm';
import { calculateSLAStatus, getSLAThresholds } from '@/lib/activities/sla';
import { eventBus } from '@/lib/events/EventBus';

/**
 * SLA Checker - Run every 5 minutes
 * Updates SLA status for all active activities
 */
export async function checkSLAStatus() {
  console.log('[SLA Checker] Starting...');

  const activeActivities = await db.query.activities.findMany({
    where: and(
      inArray(activities.status, ['pending', 'in_progress']),
      isNull(activities.deletedAt)
    ),
    with: {
      pattern: true,
    },
  });

  let updated = 0;
  let escalated = 0;

  for (const activity of activeActivities) {
    const newStatus = calculateSLAStatus(activity);
    const oldStatus = activity.slaStatus;

    if (newStatus !== oldStatus) {
      await db
        .update(activities)
        .set({
          slaStatus: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, activity.id));

      updated++;

      // Emit event for status change
      await eventBus.emit('activity.sla_changed', {
        activityId: activity.id,
        previousStatus: oldStatus,
        newStatus,
        assignedTo: activity.assignedTo,
      });

      // Trigger escalation if breached
      if (newStatus === 'breached' && oldStatus !== 'breached') {
        await processEscalation(activity);
        escalated++;
      }
    }
  }

  console.log(`[SLA Checker] Updated ${updated} activities, escalated ${escalated}`);
  return { updated, escalated };
}

/**
 * Reminder Sender - Run every 15 minutes
 * Sends reminders for activities approaching SLA breach
 */
export async function sendActivityReminders() {
  console.log('[Reminder Sender] Starting...');

  // Get activities in warning or critical status
  const warningActivities = await db.query.activities.findMany({
    where: and(
      inArray(activities.status, ['pending', 'in_progress']),
      inArray(activities.slaStatus, ['warning', 'critical']),
      isNull(activities.deletedAt),
      isNull(activities.lastReminderAt) // Haven't sent reminder recently
    ),
    with: {
      assignee: true,
    },
  });

  let sent = 0;

  for (const activity of warningActivities) {
    // Don't spam - check if we sent a reminder in last hour
    if (
      activity.lastReminderAt &&
      Date.now() - activity.lastReminderAt.getTime() < 60 * 60 * 1000
    ) {
      continue;
    }

    // Emit reminder event (notification system will handle delivery)
    await eventBus.emit('activity.reminder', {
      activityId: activity.id,
      assignedTo: activity.assignedTo,
      subject: activity.subject,
      slaStatus: activity.slaStatus,
      dueAt: activity.dueAt,
    });

    // Update last reminder timestamp
    await db
      .update(activities)
      .set({ lastReminderAt: new Date() })
      .where(eq(activities.id, activity.id));

    sent++;
  }

  console.log(`[Reminder Sender] Sent ${sent} reminders`);
  return { sent };
}

/**
 * Escalation Processor - Run every hour
 * Handles escalations for breached activities
 */
export async function processEscalations() {
  console.log('[Escalation Processor] Starting...');

  // Get breached activities that haven't been escalated
  const breachedActivities = await db.query.activities.findMany({
    where: and(
      inArray(activities.status, ['pending', 'in_progress']),
      eq(activities.slaStatus, 'breached'),
      isNull(activities.deletedAt),
      eq(activities.escalated, false)
    ),
    with: {
      assignee: {
        with: {
          pod: {
            with: {
              manager: true,
            },
          },
        },
      },
    },
  });

  let processed = 0;

  for (const activity of breachedActivities) {
    await processEscalation(activity);
    processed++;
  }

  console.log(`[Escalation Processor] Processed ${processed} escalations`);
  return { processed };
}

/**
 * Process escalation for a single activity
 */
async function processEscalation(activity: any) {
  // Mark as escalated
  await db
    .update(activities)
    .set({
      escalated: true,
      escalatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activity.id));

  // Determine escalation target (usually pod manager)
  const escalateTo = activity.assignee?.pod?.manager?.id;

  // Emit escalation event
  await eventBus.emit('activity.escalated', {
    activityId: activity.id,
    subject: activity.subject,
    assignedTo: activity.assignedTo,
    escalatedTo: escalateTo,
    breachDuration: activity.dueAt
      ? Math.floor((Date.now() - activity.dueAt.getTime()) / (1000 * 60))
      : 0,
  });

  // Create escalation activity for manager
  if (escalateTo) {
    await db.insert(activities).values({
      subject: `[ESCALATION] ${activity.subject}`,
      description: `Activity ${activity.id} has breached SLA and requires attention.`,
      priority: 'high',
      status: 'pending',
      assignedTo: escalateTo,
      relatedEntityType: 'activity',
      relatedEntityId: activity.id,
      dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      patternCode: 'HANDLE_ESCALATION',
    });
  }
}

/**
 * Register jobs with scheduler
 */
export function registerActivityJobs(scheduler: any) {
  // SLA Checker - every 5 minutes
  scheduler.schedule('*/5 * * * *', checkSLAStatus);

  // Reminder Sender - every 15 minutes
  scheduler.schedule('*/15 * * * *', sendActivityReminders);

  // Escalation Processor - every hour
  scheduler.schedule('0 * * * *', processEscalations);
}
```

---

## Task 4: Enhance ActivityEngine

Update `src/lib/activities/activity-engine.ts`:

```typescript
import { db } from '@/lib/db';
import { activities, activityAutoRules } from '@/lib/db/schema/workplan';
import { eq, and } from 'drizzle-orm';
import { patternService } from './PatternService';
import { activityService } from './activity-service';
import { interpolateTemplate } from './template-utils';

interface Event {
  type: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  actorId: string;
  orgId: string;
}

interface AutoRule {
  id: string;
  eventType: string;
  patternCode: string;
  conditions?: Record<string, unknown>;
  fieldMapping?: Record<string, string>;
  assigneeResolution?: 'actor' | 'owner' | 'manager' | 'specific';
  assigneeId?: string;
  active: boolean;
}

export class ActivityEngine {
  /**
   * Process an event and create activities if rules match
   */
  async processEvent(event: Event): Promise<any[]> {
    const rules = await this.getRulesForEvent(event.type);
    const createdActivities: any[] = [];

    for (const rule of rules) {
      // Skip inactive rules
      if (!rule.active) continue;

      // Evaluate conditions
      if (!this.evaluateConditions(rule, event)) continue;

      try {
        // Map event data to activity fields
        const fieldValues = this.mapFields(rule, event);

        // Resolve assignee
        const assignedTo = await this.resolveAssignee(rule, event);

        // Create activity from pattern
        const activityData = await patternService.instantiate(
          rule.patternCode,
          event.entityType,
          event.entityId,
          {
            assignedTo,
            fieldValues,
            subject: this.interpolateSubject(rule, event),
          }
        );

        const created = await activityService.create({
          ...activityData,
          createdBy: 'system',
          triggerEventType: event.type,
        });

        createdActivities.push(created);
      } catch (error) {
        console.error(
          `Failed to create activity from rule ${rule.id}:`,
          error
        );
      }
    }

    return createdActivities;
  }

  /**
   * Get auto-creation rules for an event type
   */
  async getRulesForEvent(eventType: string): Promise<AutoRule[]> {
    // Check database rules
    const dbRules = await db.query.activityAutoRules.findMany({
      where: and(
        eq(activityAutoRules.eventType, eventType),
        eq(activityAutoRules.active, true)
      ),
    });

    // Also check static rules
    const staticRules = STATIC_AUTO_RULES.filter(
      (r) => r.eventType === eventType
    );

    return [...dbRules, ...staticRules];
  }

  /**
   * Evaluate rule conditions against event data
   */
  evaluateConditions(rule: AutoRule, event: Event): boolean {
    if (!rule.conditions) return true;

    for (const [field, expected] of Object.entries(rule.conditions)) {
      const actual = this.getNestedValue(event.data, field);

      if (typeof expected === 'object' && expected !== null) {
        // Handle operators
        if ('$eq' in expected && actual !== expected.$eq) return false;
        if ('$ne' in expected && actual === expected.$ne) return false;
        if ('$in' in expected && !expected.$in.includes(actual)) return false;
        if ('$nin' in expected && expected.$nin.includes(actual)) return false;
        if ('$gt' in expected && !(actual > expected.$gt)) return false;
        if ('$gte' in expected && !(actual >= expected.$gte)) return false;
        if ('$lt' in expected && !(actual < expected.$lt)) return false;
        if ('$lte' in expected && !(actual <= expected.$lte)) return false;
        if ('$exists' in expected && (actual !== undefined) !== expected.$exists)
          return false;
      } else {
        // Simple equality
        if (actual !== expected) return false;
      }
    }

    return true;
  }

  /**
   * Map event data to activity fields
   */
  mapFields(rule: AutoRule, event: Event): Record<string, unknown> {
    if (!rule.fieldMapping) return {};

    const mapped: Record<string, unknown> = {};

    for (const [activityField, eventPath] of Object.entries(rule.fieldMapping)) {
      mapped[activityField] = this.getNestedValue(event.data, eventPath);
    }

    return mapped;
  }

  /**
   * Resolve the assignee for the activity
   */
  async resolveAssignee(rule: AutoRule, event: Event): Promise<string | undefined> {
    switch (rule.assigneeResolution) {
      case 'actor':
        return event.actorId;

      case 'owner':
        // Look up entity owner
        return await this.getEntityOwner(event.entityType, event.entityId);

      case 'manager':
        // Get manager of the actor
        return await this.getUserManager(event.actorId);

      case 'specific':
        return rule.assigneeId;

      default:
        return undefined;
    }
  }

  /**
   * Interpolate subject template with event data
   */
  interpolateSubject(rule: AutoRule, event: Event): string | undefined {
    const pattern = STATIC_AUTO_RULES.find((r) => r.patternCode === rule.patternCode);
    if (!pattern?.subjectTemplate) return undefined;

    return interpolateTemplate(pattern.subjectTemplate, {
      ...event.data,
      entityType: event.entityType,
      entityId: event.entityId,
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get entity owner (RACI responsible or accountable)
   */
  private async getEntityOwner(
    entityType: string,
    entityId: string
  ): Promise<string | undefined> {
    const owner = await db.query.objectOwners.findFirst({
      where: and(
        eq(objectOwners.entityType, entityType),
        eq(objectOwners.entityId, entityId),
        eq(objectOwners.ownershipType, 'accountable')
      ),
    });
    return owner?.userId;
  }

  /**
   * Get user's manager
   */
  private async getUserManager(userId: string): Promise<string | undefined> {
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
      with: {
        pod: {
          with: {
            seniorMember: true,
          },
        },
      },
    });
    return user?.pod?.seniorMember?.userId;
  }
}

/**
 * Static auto-creation rules (can be extended via database)
 */
const STATIC_AUTO_RULES: AutoRule[] = [
  {
    id: 'submission-created',
    eventType: 'submission.created',
    patternCode: 'REVIEW_SUBMISSION',
    conditions: {},
    assigneeResolution: 'owner',
    active: true,
  },
  {
    id: 'interview-scheduled',
    eventType: 'interview.scheduled',
    patternCode: 'PREPARE_INTERVIEW',
    conditions: {},
    assigneeResolution: 'owner',
    active: true,
  },
  {
    id: 'offer-sent',
    eventType: 'offer.sent',
    patternCode: 'FOLLOW_UP_OFFER',
    conditions: {},
    assigneeResolution: 'owner',
    active: true,
  },
  {
    id: 'lead-created',
    eventType: 'lead.created',
    patternCode: 'QUALIFY_LEAD',
    conditions: {},
    assigneeResolution: 'actor',
    active: true,
  },
  {
    id: 'placement-ending',
    eventType: 'placement.ending_soon',
    patternCode: 'DISCUSS_EXTENSION',
    conditions: {},
    assigneeResolution: 'owner',
    active: true,
  },
  {
    id: 'visa-expiring',
    eventType: 'consultant.visa_expiring',
    patternCode: 'CHECK_VISA_STATUS',
    conditions: {},
    assigneeResolution: 'owner',
    active: true,
  },
];

export const activityEngine = new ActivityEngine();
```

---

## Task 5: Update Activity Router

Enhance `src/server/routers/activities.ts` with new procedures:

```typescript
// Add these procedures to the existing router

// Get personal queue
getMyQueue: protectedProcedure
  .input(
    z.object({
      status: z.array(z.enum(['pending', 'in_progress'])).optional(),
      limit: z.number().min(1).max(100).optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    return queueManager.getPersonalQueue(ctx.user.id, input);
  }),

// Get team queue (for managers)
getTeamQueue: protectedProcedure
  .input(
    z.object({
      teamId: z.string().uuid(),
      status: z.array(z.enum(['pending', 'in_progress'])).optional(),
      includeUnassigned: z.boolean().optional(),
      limit: z.number().min(1).max(200).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    // Verify user is manager of team
    const pod = await db.query.pods.findFirst({
      where: and(
        eq(pods.id, input.teamId),
        eq(pods.seniorMemberId, ctx.user.id)
      ),
    });
    if (!pod) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a manager of this team',
      });
    }
    return queueManager.getTeamQueue(input.teamId, input);
  }),

// Claim activity
claim: protectedProcedure
  .input(z.object({ activityId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    return queueManager.claim(input.activityId, ctx.user.id);
  }),

// Unclaim activity
unclaim: protectedProcedure
  .input(z.object({ activityId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    return queueManager.unclaim(input.activityId, ctx.user.id);
  }),

// Get queue statistics
getQueueStats: protectedProcedure.query(async ({ ctx }) => {
  return queueManager.getQueueStats(ctx.user.id);
}),

// Get next recommended activity
getNextRecommended: protectedProcedure.query(async ({ ctx }) => {
  return queueManager.getNextRecommended(ctx.user.id);
}),

// Get pattern
getPattern: protectedProcedure
  .input(z.object({ code: z.string() }))
  .query(async ({ input }) => {
    return patternService.getPattern(input.code);
  }),

// Get patterns by category
getPatternsByCategory: protectedProcedure
  .input(z.object({ category: z.string() }))
  .query(async ({ input }) => {
    return patternService.getByCategory(input.category);
  }),
```

---

## Validation Checklist

After completion:

```bash
# 1. TypeScript compiles
pnpm tsc --noEmit

# 2. Test activity system
pnpm test src/lib/activities/

# 3. Verify imports work
grep -r "PatternService\|QueueManager" src/server/routers/ --include="*.ts"
```

## Requirements:
- All services must be properly typed
- PatternService must handle both static and DB patterns
- QueueManager must properly sort by priority and SLA
- Scheduled jobs must be idempotent
- All mutations must emit events
- Error handling with proper error messages
