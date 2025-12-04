/**
 * Activity Scheduled Jobs
 *
 * Background jobs for activity management:
 * - SLA Checker: Updates SLA status for active activities
 * - Reminder Sender: Sends reminders for activities approaching SLA breach
 * - Escalation Processor: Handles escalations for breached activities
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema/workplan';
import { pods } from '@/lib/db/schema/ta-hr';
import { eq, and, lt, inArray, isNull, or, sql } from 'drizzle-orm';
import { calculateSLAStatus, type SLAStatus, type Priority } from '@/lib/activities/sla';
import { eventBus } from '@/lib/events/event-bus';
import { getEventCategory, getEventSeverity } from '@/lib/events/event.types';

// ============================================================================
// TYPES
// ============================================================================

export interface JobResult {
  success: boolean;
  processed: number;
  errors: string[];
}

export interface SLACheckResult extends JobResult {
  updated: number;
  escalated: number;
}

export interface ReminderResult extends JobResult {
  sent: number;
}

export interface EscalationResult extends JobResult {
  escalated: number;
}

// ============================================================================
// SLA CHECKER
// ============================================================================

/**
 * SLA Checker - Run every 5 minutes
 * Updates SLA status for all active activities
 */
export async function checkSLAStatus(): Promise<SLACheckResult> {
  console.log('[SLA Checker] Starting...');

  const result: SLACheckResult = {
    success: true,
    processed: 0,
    updated: 0,
    escalated: 0,
    errors: [],
  };

  try {
    // Get all active activities
    const activeActivities = await db
      .select({
        id: activities.id,
        orgId: activities.orgId,
        subject: activities.subject,
        priority: activities.priority,
        dueDate: activities.dueDate,
        assignedTo: activities.assignedTo,
        status: activities.status,
        escalationCount: activities.escalationCount,
      })
      .from(activities)
      .where(
        and(
          inArray(activities.status, ['open', 'in_progress', 'scheduled']),
          isNull(activities.deletedAt)
        )
      );

    result.processed = activeActivities.length;

    for (const activity of activeActivities) {
      try {
        // Calculate new SLA status
        const newStatus = calculateSLAStatus(
          activity.dueDate,
          activity.priority as Priority
        );

        // Check if we need to update or escalate
        const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date();
        const wasAlreadyBreached = activity.escalationCount && activity.escalationCount > 0;

        // Update activity if status changed or overdue
        if (isOverdue && !wasAlreadyBreached) {
          // First time breach - increment escalation count
          await db
            .update(activities)
            .set({
              escalationCount: (activity.escalationCount ?? 0) + 1,
              lastEscalatedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(activities.id, activity.id));

          result.updated++;

          const eventType = 'activity.sla_breached';
          const now = new Date();
          // Emit SLA breach event
          await eventBus.publish({
            id: `sla_breach_${activity.id}_${Date.now()}`,
            eventType,
            eventCategory: getEventCategory(eventType),
            eventSeverity: getEventSeverity(eventType),
            orgId: activity.orgId,
            entityType: 'activity',
            entityId: activity.id,
            actorId: 'system',
            actorType: 'system',
            occurredAt: now,
            recordedAt: now,
            eventData: {
              activityId: activity.id,
              subject: activity.subject,
              assignedTo: activity.assignedTo,
              dueDate: activity.dueDate,
              slaStatus: newStatus,
            },
            source: 'system',
          });

          // Process escalation
          await processEscalation(activity);
          result.escalated++;
        }
      } catch (error) {
        result.errors.push(
          `Failed to process activity ${activity.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(
      `[SLA Checker] Processed ${result.processed} activities, updated ${result.updated}, escalated ${result.escalated}`
    );
  } catch (error) {
    result.success = false;
    result.errors.push(
      `SLA check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.error('[SLA Checker] Failed:', error);
  }

  return result;
}

// ============================================================================
// REMINDER SENDER
// ============================================================================

/**
 * Reminder Sender - Run every 15 minutes
 * Sends reminders for activities approaching SLA breach
 */
export async function sendActivityReminders(): Promise<ReminderResult> {
  console.log('[Reminder Sender] Starting...');

  const result: ReminderResult = {
    success: true,
    processed: 0,
    sent: 0,
    errors: [],
  };

  try {
    // Get activities that are at risk (due within warning threshold)
    // and haven't had a reminder sent in the last hour
    const now = new Date();
    const warningThreshold = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const warningActivities = await db
      .select({
        id: activities.id,
        orgId: activities.orgId,
        subject: activities.subject,
        priority: activities.priority,
        dueDate: activities.dueDate,
        assignedTo: activities.assignedTo,
        status: activities.status,
        reminderSentAt: activities.reminderSentAt,
        reminderCount: activities.reminderCount,
      })
      .from(activities)
      .where(
        and(
          inArray(activities.status, ['open', 'in_progress', 'scheduled']),
          isNull(activities.deletedAt),
          lt(activities.dueDate, warningThreshold),
          or(
            isNull(activities.reminderSentAt),
            lt(activities.reminderSentAt, oneHourAgo)
          )
        )
      );

    result.processed = warningActivities.length;

    for (const activity of warningActivities) {
      try {
        // Only send reminder if not already overdue (handled by escalation)
        if (activity.dueDate && new Date(activity.dueDate) > now) {
          const reminderEventType = 'activity.reminder';
          // Emit reminder event
          await eventBus.publish({
            id: `reminder_${activity.id}_${Date.now()}`,
            eventType: reminderEventType,
            eventCategory: getEventCategory(reminderEventType),
            eventSeverity: getEventSeverity(reminderEventType),
            orgId: activity.orgId,
            entityType: 'activity',
            entityId: activity.id,
            actorId: 'system',
            actorType: 'system',
            occurredAt: now,
            recordedAt: now,
            eventData: {
              activityId: activity.id,
              subject: activity.subject,
              assignedTo: activity.assignedTo,
              dueDate: activity.dueDate,
              slaStatus: calculateSLAStatus(activity.dueDate, activity.priority as Priority),
            },
            source: 'system',
          });

          // Update reminder tracking
          await db
            .update(activities)
            .set({
              reminderSentAt: now,
              reminderCount: (activity.reminderCount ?? 0) + 1,
            })
            .where(eq(activities.id, activity.id));

          result.sent++;
        }
      } catch (error) {
        result.errors.push(
          `Failed to send reminder for activity ${activity.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(
      `[Reminder Sender] Processed ${result.processed}, sent ${result.sent} reminders`
    );
  } catch (error) {
    result.success = false;
    result.errors.push(
      `Reminder sender failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.error('[Reminder Sender] Failed:', error);
  }

  return result;
}

// ============================================================================
// ESCALATION PROCESSOR
// ============================================================================

/**
 * Escalation Processor - Run every hour
 * Handles escalations for breached activities that haven't been escalated yet
 */
export async function processEscalations(): Promise<EscalationResult> {
  console.log('[Escalation Processor] Starting...');

  const result: EscalationResult = {
    success: true,
    processed: 0,
    escalated: 0,
    errors: [],
  };

  try {
    // Get breached activities that need escalation
    const now = new Date();
    const breachedActivities = await db
      .select({
        id: activities.id,
        orgId: activities.orgId,
        subject: activities.subject,
        priority: activities.priority,
        dueDate: activities.dueDate,
        assignedTo: activities.assignedTo,
        status: activities.status,
        escalationCount: activities.escalationCount,
        lastEscalatedAt: activities.lastEscalatedAt,
      })
      .from(activities)
      .where(
        and(
          inArray(activities.status, ['open', 'in_progress']),
          isNull(activities.deletedAt),
          lt(activities.dueDate, now),
          // Only escalate activities that haven't been escalated in the last 4 hours
          or(
            isNull(activities.lastEscalatedAt),
            lt(
              activities.lastEscalatedAt,
              new Date(now.getTime() - 4 * 60 * 60 * 1000)
            )
          )
        )
      );

    result.processed = breachedActivities.length;

    for (const activity of breachedActivities) {
      try {
        await processEscalation(activity);
        result.escalated++;
      } catch (error) {
        result.errors.push(
          `Failed to escalate activity ${activity.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(
      `[Escalation Processor] Processed ${result.processed}, escalated ${result.escalated}`
    );
  } catch (error) {
    result.success = false;
    result.errors.push(
      `Escalation processor failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.error('[Escalation Processor] Failed:', error);
  }

  return result;
}

/**
 * Process escalation for a single activity
 */
async function processEscalation(activity: {
  id: string;
  orgId: string;
  subject: string | null;
  assignedTo: string;
  dueDate: Date;
}): Promise<void> {
  // Mark as escalated
  await db
    .update(activities)
    .set({
      escalationCount: sql`COALESCE(${activities.escalationCount}, 0) + 1`,
      lastEscalatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activity.id));

  // Get the assignee's manager (pod senior member)
  let escalateTo: string | null = null;

  if (activity.assignedTo) {
    // Find the user's pod
    const [userPod] = await db
      .select({
        seniorMemberId: pods.seniorMemberId,
      })
      .from(pods)
      .where(
        or(
          eq(pods.seniorMemberId, activity.assignedTo),
          eq(pods.juniorMemberId, activity.assignedTo)
        )
      )
      .limit(1);

    if (userPod?.seniorMemberId && userPod.seniorMemberId !== activity.assignedTo) {
      escalateTo = userPod.seniorMemberId;
    }
  }

  const escalationEventType = 'activity.escalated';
  const escalationNow = new Date();
  // Emit escalation event
  await eventBus.publish({
    id: `escalation_${activity.id}_${Date.now()}`,
    eventType: escalationEventType,
    eventCategory: getEventCategory(escalationEventType),
    eventSeverity: getEventSeverity(escalationEventType),
    orgId: activity.orgId,
    entityType: 'activity',
    entityId: activity.id,
    actorId: 'system',
    actorType: 'system',
    occurredAt: escalationNow,
    recordedAt: escalationNow,
    eventData: {
      activityId: activity.id,
      subject: activity.subject,
      assignedTo: activity.assignedTo,
      escalatedTo: escalateTo,
      breachDuration: activity.dueDate
        ? Math.floor((Date.now() - new Date(activity.dueDate).getTime()) / (1000 * 60))
        : 0,
    },
    source: 'system',
  });

  // Create escalation activity for manager if we have one
  if (escalateTo) {
    await db.insert(activities).values({
      orgId: activity.orgId,
      subject: `[ESCALATION] ${activity.subject ?? 'Activity requires attention'}`,
      body: `Activity ${activity.id} has breached SLA and requires attention.`,
      activityType: 'task',
      priority: 'high',
      status: 'open',
      assignedTo: escalateTo,
      entityType: 'activity',
      entityId: activity.id,
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      patternCode: 'HANDLE_ESCALATION',
      autoCreated: true,
      createdBy: escalateTo,
    });
  }
}

// ============================================================================
// JOB REGISTRATION
// ============================================================================

export interface Scheduler {
  schedule: (cronExpression: string, job: () => Promise<unknown>) => void;
}

/**
 * Register activity jobs with a scheduler
 */
export function registerActivityJobs(scheduler: Scheduler): void {
  // SLA Checker - every 5 minutes
  scheduler.schedule('*/5 * * * *', checkSLAStatus);

  // Reminder Sender - every 15 minutes
  scheduler.schedule('*/15 * * * *', sendActivityReminders);

  // Escalation Processor - every hour
  scheduler.schedule('0 * * * *', processEscalations);
}

/**
 * Run all activity jobs once (for testing/manual execution)
 */
export async function runAllActivityJobs(): Promise<{
  sla: SLACheckResult;
  reminders: ReminderResult;
  escalations: EscalationResult;
}> {
  const sla = await checkSLAStatus();
  const reminders = await sendActivityReminders();
  const escalations = await processEscalations();

  return { sla, reminders, escalations };
}
