/**
 * Activity Service
 * 
 * Core CRUD operations for activities.
 * Every action creates/completes activities following the golden rule.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema';
import { eq, and, or, lt, gt, lte, gte, isNull, sql, desc, asc, inArray } from 'drizzle-orm';
import type {
  Activity,
  CreateActivityInput,
  CompleteActivityInput,
  RescheduleActivityInput,
  ReassignActivityInput,
  ActivityFilters,
  ActivitySummary,
  ActivityStatus,
  ActivityPriority,
} from './activity.types';
import { eventEmitter } from '@/lib/events';

/**
 * Activity Service - CRUD operations
 */
export class ActivityService {
  /**
   * Create a new activity
   */
  async create(input: CreateActivityInput): Promise<Activity> {
    const now = new Date();
    
    const [activity] = await db.insert(activities).values({
      orgId: input.orgId,
      
      // Type
      activityType: input.activityType,
      patternCode: input.patternCode,
      patternId: input.patternId,
      autoCreated: input.isAutoCreated ?? false,
      
      // Content
      subject: input.subject,
      body: input.body,
      description: input.description,
      
      // Entity
      entityType: input.entityType,
      entityId: input.entityId,
      secondaryEntityType: input.secondaryEntityType,
      secondaryEntityId: input.secondaryEntityId,
      
      // Assignment
      assignedTo: input.assignedTo,
      assignedGroup: input.assignedGroup,
      createdBy: input.createdBy,
      assignedAt: now,
      
      // Status
      status: input.status ?? 'open',
      priority: input.priority ?? 'medium',
      direction: input.direction,
      category: input.category,
      
      // Timing
      dueDate: input.dueDate,
      scheduledAt: input.scheduledAt,
      
      // Instructions
      instructions: input.instructions,
      checklist: input.checklist ? JSON.stringify(input.checklist) : null,
      
      // Follow-up
      followUpRequired: false,
      
      // Counters
      escalationCount: 0,
      reminderCount: 0,
      
      // Metadata
      tags: input.tags,
      customFields: input.customFields ?? {},
      
      // Audit
      createdAt: now,
      updatedAt: now,
    }).returning();
    
    // Emit event
    await eventEmitter.emit({
      type: 'activity.created',
      orgId: input.orgId,
      entityType: 'activity',
      entityId: activity.id,
      actorId: input.createdBy,
      actorType: input.isAutoCreated ? 'system' : 'user',
      eventData: {
        activityType: input.activityType,
        subject: input.subject,
        assignedTo: input.assignedTo,
        dueDate: input.dueDate,
        relatedEntityType: input.entityType,
        relatedEntityId: input.entityId,
        isAutoCreated: input.isAutoCreated ?? false,
        patternCode: input.patternCode,
      },
      source: input.isAutoCreated ? 'system' : 'ui',
    });
    
    return this.mapToActivity(activity);
  }

  /**
   * Complete an activity
   */
  async complete(input: CompleteActivityInput): Promise<Activity> {
    const now = new Date();
    
    // Get current activity
    const current = await this.getById(input.activityId);
    if (!current) {
      throw new Error(`Activity not found: ${input.activityId}`);
    }
    
    // Update activity
    const [updated] = await db.update(activities)
      .set({
        status: 'completed',
        completedAt: now,
        performedBy: input.userId,
        outcome: input.outcome,
        outcomeNotes: input.outcomeNotes,
        durationMinutes: input.durationMinutes,
        followUpRequired: !!input.followUp,
        followUpDate: input.followUp?.dueDate,
        updatedAt: now,
        updatedBy: input.userId,
      })
      .where(eq(activities.id, input.activityId))
      .returning();
    
    // Create follow-up activity if requested
    let followUpActivity: Activity | undefined;
    if (input.followUp) {
      followUpActivity = await this.create({
        orgId: current.orgId,
        activityType: input.followUp.type,
        subject: input.followUp.subject,
        entityType: current.entityType,
        entityId: current.entityId,
        secondaryEntityType: current.secondaryEntityType,
        secondaryEntityId: current.secondaryEntityId,
        assignedTo: input.followUp.assignedTo ?? input.userId,
        createdBy: input.userId,
        dueDate: input.followUp.dueDate,
        priority: current.priority,
      });
      
      // Link follow-up to parent
      await db.update(activities)
        .set({ followUpActivityId: followUpActivity.id })
        .where(eq(activities.id, input.activityId));
    }
    
    // Emit event
    await eventEmitter.emit({
      type: 'activity.completed',
      orgId: current.orgId,
      entityType: 'activity',
      entityId: input.activityId,
      actorId: input.userId,
      actorType: 'user',
      eventData: {
        activityType: current.activityType,
        outcome: input.outcome,
        durationMinutes: input.durationMinutes,
        relatedEntityType: current.entityType,
        relatedEntityId: current.entityId,
        followUpCreated: !!followUpActivity,
        followUpActivityId: followUpActivity?.id,
      },
      source: 'ui',
    });
    
    return this.mapToActivity(updated);
  }

  /**
   * Reschedule an activity
   */
  async reschedule(input: RescheduleActivityInput): Promise<Activity> {
    const now = new Date();
    
    const current = await this.getById(input.activityId);
    if (!current) {
      throw new Error(`Activity not found: ${input.activityId}`);
    }
    
    const [updated] = await db.update(activities)
      .set({
        dueDate: input.newDueDate,
        updatedAt: now,
        updatedBy: input.userId,
      })
      .where(eq(activities.id, input.activityId))
      .returning();
    
    // Emit event
    await eventEmitter.emit({
      type: 'activity.rescheduled',
      orgId: current.orgId,
      entityType: 'activity',
      entityId: input.activityId,
      actorId: input.userId,
      actorType: 'user',
      eventData: {
        previousDueDate: current.dueDate,
        newDueDate: input.newDueDate,
        reason: input.reason,
      },
      changes: [{
        field: 'dueDate',
        oldValue: current.dueDate,
        newValue: input.newDueDate,
      }],
      source: 'ui',
    });
    
    return this.mapToActivity(updated);
  }

  /**
   * Reassign an activity
   */
  async reassign(input: ReassignActivityInput): Promise<Activity> {
    const now = new Date();
    
    const current = await this.getById(input.activityId);
    if (!current) {
      throw new Error(`Activity not found: ${input.activityId}`);
    }
    
    const [updated] = await db.update(activities)
      .set({
        assignedTo: input.newAssigneeId,
        assignedAt: now,
        updatedAt: now,
        updatedBy: input.userId,
      })
      .where(eq(activities.id, input.activityId))
      .returning();
    
    // Emit event
    await eventEmitter.emit({
      type: 'activity.reassigned',
      orgId: current.orgId,
      entityType: 'activity',
      entityId: input.activityId,
      actorId: input.userId,
      actorType: 'user',
      eventData: {
        previousAssignee: current.assignedTo,
        newAssignee: input.newAssigneeId,
        reason: input.reason,
      },
      changes: [{
        field: 'assignedTo',
        oldValue: current.assignedTo,
        newValue: input.newAssigneeId,
      }],
      source: 'ui',
    });
    
    return this.mapToActivity(updated);
  }

  /**
   * Start working on an activity (change status to in_progress)
   */
  async start(activityId: string, userId: string): Promise<Activity> {
    const now = new Date();
    
    const [updated] = await db.update(activities)
      .set({
        status: 'in_progress',
        startedAt: now,
        updatedAt: now,
        updatedBy: userId,
      })
      .where(eq(activities.id, activityId))
      .returning();
    
    if (!updated) {
      throw new Error(`Activity not found: ${activityId}`);
    }
    
    return this.mapToActivity(updated);
  }

  /**
   * Cancel an activity
   */
  async cancel(activityId: string, userId: string, reason?: string): Promise<Activity> {
    const now = new Date();
    
    const current = await this.getById(activityId);
    if (!current) {
      throw new Error(`Activity not found: ${activityId}`);
    }
    
    const [updated] = await db.update(activities)
      .set({
        status: 'cancelled',
        outcomeNotes: reason,
        updatedAt: now,
        updatedBy: userId,
      })
      .where(eq(activities.id, activityId))
      .returning();
    
    // Emit event
    await eventEmitter.emit({
      type: 'activity.cancelled',
      orgId: current.orgId,
      entityType: 'activity',
      entityId: activityId,
      actorId: userId,
      actorType: 'user',
      eventData: {
        reason,
        activityType: current.activityType,
      },
      source: 'ui',
    });
    
    return this.mapToActivity(updated);
  }

  /**
   * Defer an activity
   */
  async defer(activityId: string, userId: string, newDueDate: Date, reason?: string): Promise<Activity> {
    const now = new Date();
    
    const [updated] = await db.update(activities)
      .set({
        status: 'deferred',
        dueDate: newDueDate,
        outcomeNotes: reason,
        updatedAt: now,
        updatedBy: userId,
      })
      .where(eq(activities.id, activityId))
      .returning();
    
    if (!updated) {
      throw new Error(`Activity not found: ${activityId}`);
    }
    
    return this.mapToActivity(updated);
  }

  /**
   * Get activity by ID
   */
  async getById(id: string): Promise<Activity | null> {
    const [activity] = await db.select()
      .from(activities)
      .where(and(
        eq(activities.id, id),
        isNull(activities.deletedAt)
      ))
      .limit(1);
    
    return activity ? this.mapToActivity(activity) : null;
  }

  /**
   * Get activities with filters
   */
  async getMany(filters: ActivityFilters): Promise<Activity[]> {
    const conditions = [
      eq(activities.orgId, filters.orgId),
      isNull(activities.deletedAt),
    ];
    
    if (filters.assignedTo) {
      conditions.push(eq(activities.assignedTo, filters.assignedTo));
    }
    
    if (filters.entityType) {
      conditions.push(eq(activities.entityType, filters.entityType));
    }
    
    if (filters.entityId) {
      conditions.push(eq(activities.entityId, filters.entityId));
    }
    
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      conditions.push(inArray(activities.status, statuses));
    }
    
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      conditions.push(inArray(activities.priority, priorities));
    }
    
    if (filters.activityType) {
      const types = Array.isArray(filters.activityType) ? filters.activityType : [filters.activityType];
      conditions.push(inArray(activities.activityType, types));
    }
    
    if (filters.dueBefore) {
      conditions.push(lt(activities.dueDate, filters.dueBefore));
    }
    
    if (filters.dueAfter) {
      conditions.push(gt(activities.dueDate, filters.dueAfter));
    }
    
    if (filters.isOverdue) {
      conditions.push(lt(activities.dueDate, new Date()));
      conditions.push(inArray(activities.status, ['open', 'in_progress']));
    }
    
    if (filters.isAutoCreated !== undefined) {
      conditions.push(eq(activities.autoCreated, filters.isAutoCreated));
    }
    
    // Build query
    let query = db.select()
      .from(activities)
      .where(and(...conditions));
    
    // Ordering
    const orderCol = filters.orderBy === 'priority' 
      ? activities.priority 
      : filters.orderBy === 'createdAt' 
        ? activities.createdAt 
        : activities.dueDate;
    
    if (filters.orderDir === 'desc') {
      query = query.orderBy(desc(orderCol));
    } else {
      query = query.orderBy(asc(orderCol));
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    const results = await query;
    return results.map(r => this.mapToActivity(r));
  }

  /**
   * Get activity summary for a user
   */
  async getSummary(orgId: string, userId: string): Promise<ActivitySummary> {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get all activities for this user
    const userActivities = await db.select({
      status: activities.status,
      dueDate: activities.dueDate,
    })
      .from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, userId),
        isNull(activities.deletedAt)
      ));
    
    const summary: ActivitySummary = {
      total: userActivities.length,
      open: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
    };
    
    for (const activity of userActivities) {
      switch (activity.status) {
        case 'open':
          summary.open++;
          break;
        case 'in_progress':
          summary.inProgress++;
          break;
        case 'completed':
          summary.completed++;
          break;
      }
      
      if (activity.dueDate) {
        const dueDate = new Date(activity.dueDate);
        const isOpenOrInProgress = activity.status === 'open' || activity.status === 'in_progress';
        
        if (isOpenOrInProgress && dueDate < now) {
          summary.overdue++;
        }
        
        if (isOpenOrInProgress && dueDate <= endOfToday && dueDate >= now) {
          summary.dueToday++;
        }
        
        if (isOpenOrInProgress && dueDate <= endOfWeek && dueDate >= now) {
          summary.dueThisWeek++;
        }
      }
    }
    
    return summary;
  }

  /**
   * Get activities for an entity
   */
  async getForEntity(
    orgId: string, 
    entityType: string, 
    entityId: string,
    options?: { limit?: number; includeCompleted?: boolean }
  ): Promise<Activity[]> {
    const conditions = [
      eq(activities.orgId, orgId),
      eq(activities.entityType, entityType),
      eq(activities.entityId, entityId),
      isNull(activities.deletedAt),
    ];
    
    if (!options?.includeCompleted) {
      conditions.push(inArray(activities.status, ['open', 'in_progress']));
    }
    
    let query = db.select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const results = await query;
    return results.map(r => this.mapToActivity(r));
  }

  /**
   * Map database record to Activity type
   */
  private mapToActivity(record: typeof activities.$inferSelect): Activity {
    return {
      id: record.id,
      orgId: record.orgId,
      activityNumber: record.activityNumber ?? '',
      
      activityType: record.activityType as Activity['activityType'],
      patternCode: record.patternCode ?? undefined,
      patternId: record.patternId ?? undefined,
      isAutoCreated: record.autoCreated ?? false,
      
      subject: record.subject ?? '',
      body: record.body ?? undefined,
      description: record.description ?? undefined,
      
      entityType: record.entityType as Activity['entityType'],
      entityId: record.entityId,
      secondaryEntityType: record.secondaryEntityType as Activity['secondaryEntityType'],
      secondaryEntityId: record.secondaryEntityId ?? undefined,
      
      assignedTo: record.assignedTo,
      performedBy: record.performedBy ?? undefined,
      assignedGroup: record.assignedGroup ?? undefined,
      createdBy: record.createdBy ?? '',
      
      status: record.status as ActivityStatus,
      priority: record.priority as ActivityPriority,
      direction: record.direction as Activity['direction'],
      category: record.category ?? undefined,
      
      dueDate: record.dueDate,
      scheduledAt: record.scheduledAt ?? undefined,
      scheduledFor: record.scheduledFor ?? undefined,
      startedAt: record.startedAt ?? undefined,
      completedAt: record.completedAt ?? undefined,
      skippedAt: record.skippedAt ?? undefined,
      durationMinutes: record.durationMinutes ?? undefined,
      
      outcome: record.outcome as Activity['outcome'],
      outcomeNotes: record.outcomeNotes ?? undefined,
      
      instructions: record.instructions ?? undefined,
      checklist: record.checklist ? JSON.parse(record.checklist as string) : undefined,
      checklistProgress: record.checklistProgress as Activity['checklistProgress'],
      
      followUpRequired: record.followUpRequired ?? false,
      followUpDate: record.followUpDate ?? undefined,
      followUpActivityId: record.followUpActivityId ?? undefined,
      
      predecessorActivityId: record.predecessorActivityId ?? undefined,
      parentActivityId: record.parentActivityId ?? undefined,
      
      escalationCount: record.escalationCount ?? 0,
      escalationDate: record.escalationDate ?? undefined,
      lastEscalatedAt: record.lastEscalatedAt ?? undefined,
      reminderSentAt: record.reminderSentAt ?? undefined,
      reminderCount: record.reminderCount ?? 0,
      
      tags: record.tags ?? undefined,
      customFields: record.customFields as Activity['customFields'],
      
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt ?? undefined,
    };
  }
}

// Export singleton instance
export const activityService = new ActivityService();

