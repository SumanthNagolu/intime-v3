/**
 * Unified Activities Router
 *
 * Handles all activity CRUD operations across entities.
 * Replaces both activity_log and lead_tasks functionality.
 *
 * Enhanced with:
 * - Queue management (personal and team queues)
 * - Pattern management
 * - SLA status and statistics
 * - Activity claiming/unclaiming
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { activities, type Activity } from '@/lib/db/schema/activities';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { leads } from '@/lib/db/schema/crm';
import { eq, and, desc, asc, or, lte, inArray, sql, isNull } from 'drizzle-orm';
import { queueManager } from '@/lib/activities/QueueManager';
import { patternService } from '@/lib/activities/PatternService';
import { calculateSLAStatus, type Priority, type SLAStatus } from '@/lib/activities/sla';
import { ACTIVITY_PATTERNS } from '@/lib/activities/patterns';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const activityStatusSchema = z.enum([
  'scheduled', 'open', 'in_progress', 'completed', 'skipped', 'cancelled'
]);

const activityTypeSchema = z.enum([
  'email', 'call', 'meeting', 'note', 'linkedin_message', 'task', 'follow_up', 'reminder'
]);

const activityPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

const activityOutcomeSchema = z.enum(['positive', 'neutral', 'negative']);

const activityDirectionSchema = z.enum(['inbound', 'outbound']);

const entityTypeSchema = z.enum([
  'lead', 'deal', 'account', 'candidate', 'submission', 'job', 'poc'
]);

// Create activity input schema
const createActivitySchema = z.object({
  // Required fields
  entityType: entityTypeSchema,
  entityId: z.string().uuid(),
  activityType: activityTypeSchema,
  dueDate: z.date(),
  
  // Optional fields
  status: activityStatusSchema.default('open'),
  priority: activityPrioritySchema.default('medium'),
  subject: z.string().optional(),
  body: z.string().optional(),
  direction: activityDirectionSchema.optional(),
  scheduledAt: z.date().optional(),
  escalationDate: z.date().optional(),
  durationMinutes: z.number().int().min(0).max(480).optional(),
  outcome: activityOutcomeSchema.optional(),
  pocId: z.string().uuid().optional(),
  parentActivityId: z.string().uuid().optional(),
});

// Update activity input schema
const updateActivitySchema = z.object({
  id: z.string().uuid(),
  status: activityStatusSchema.optional(),
  priority: activityPrioritySchema.optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  direction: activityDirectionSchema.optional(),
  dueDate: z.date().optional(),
  scheduledAt: z.date().optional(),
  escalationDate: z.date().optional(),
  completedAt: z.date().optional(),
  skippedAt: z.date().optional(),
  durationMinutes: z.number().int().min(0).max(480).optional(),
  outcome: activityOutcomeSchema.optional(),
  assignedTo: z.string().uuid().optional(),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get human-readable name for entity type
 */
function getEntityTypeName(entityType: string): string {
  const nameMap: Record<string, string> = {
    lead: 'Lead',
    deal: 'Deal',
    account: 'Account',
    candidate: 'Candidate',
    submission: 'Submission',
    job: 'Job',
    poc: 'Point of Contact',
    bench_consultant: 'Consultant',
    vendor: 'Vendor',
    job_order: 'Job Order',
    placement: 'Placement',
    hotlist: 'Hotlist',
    immigration_case: 'Immigration Case',
  };
  return nameMap[entityType] || entityType;
}

/**
 * Get link path for entity
 */
function getEntityLink(entityType: string, entityId: string): string {
  const routeMap: Record<string, string> = {
    lead: '/employee/recruiting/leads',
    deal: '/employee/recruiting/deals',
    account: '/employee/recruiting/accounts',
    candidate: '/employee/recruiting/talent',
    submission: '/employee/recruiting/submissions',
    job: '/employee/recruiting/jobs',
    bench_consultant: '/employee/bench/talent',
    vendor: '/employee/bench/vendors',
    job_order: '/employee/bench/job-orders',
    placement: '/employee/bench/placements',
  };
  const basePath = routeMap[entityType] || '/employee/workspace';
  return `${basePath}/${entityId}`;
}

// =====================================================
// ACTIVITIES ROUTER
// =====================================================

export const activitiesRouter = router({

  // ─────────────────────────────────────────────────────
  // BENCH ACTIVITIES STATS (for bench activities page)
  // ─────────────────────────────────────────────────────

  /**
   * Get activity stats for bench sales activities page
   * Returns overdue, dueToday, inProgress, completedToday counts
   */
  benchStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { userId, orgId } = ctx;

    // Get user profile
    const [userProfile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.authId, userId as string))
      .limit(1);

    if (!userProfile) {
      return { overdue: 0, dueToday: 0, inProgress: 0, completedToday: 0 };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Count overdue activities (due before today, not completed/cancelled)
    const [overdueResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activities)
      .where(
        and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, userProfile.id),
          lte(activities.dueDate, today),
          or(
            eq(activities.status, 'open'),
            eq(activities.status, 'in_progress'),
            eq(activities.status, 'scheduled')
          )
        )
      );

    // Count due today activities
    const [dueTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activities)
      .where(
        and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, userProfile.id),
          sql`${activities.dueDate} >= ${today} AND ${activities.dueDate} < ${tomorrow}`,
          or(
            eq(activities.status, 'open'),
            eq(activities.status, 'in_progress'),
            eq(activities.status, 'scheduled')
          )
        )
      );

    // Count in progress activities
    const [inProgressResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activities)
      .where(
        and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, userProfile.id),
          eq(activities.status, 'in_progress')
        )
      );

    // Count completed today
    const [completedTodayResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(activities)
      .where(
        and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, userProfile.id),
          eq(activities.status, 'completed'),
          sql`${activities.completedAt} >= ${today} AND ${activities.completedAt} < ${tomorrow}`
        )
      );

    return {
      overdue: overdueResult?.count ?? 0,
      dueToday: dueTodayResult?.count ?? 0,
      inProgress: inProgressResult?.count ?? 0,
      completedToday: completedTodayResult?.count ?? 0,
    };
  }),

  /**
   * Get activities list for bench sales activities page
   * Returns paginated activities with filter support
   */
  benchActivities: orgProtectedProcedure
    .input(
      z.object({
        status: z.array(activityStatusSchema).optional(),
        type: z.array(activityTypeSchema).optional(),
        priority: z.array(activityPrioritySchema).optional(),
        entityType: z.array(entityTypeSchema).optional(),
        dueFrom: z.date().optional(),
        dueTo: z.date().optional(),
        showCompleted: z.boolean().default(false),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        sortField: z.enum(['dueDate', 'createdAt', 'priority', 'status']).default('dueDate'),
        sortDirection: z.enum(['asc', 'desc']).default('asc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db
        .select({ id: userProfiles.id, fullName: userProfiles.fullName })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        return { items: [], total: 0 };
      }

      // Build conditions
      const conditions = [
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, userProfile.id),
      ];

      // Status filter
      if (input.status && input.status.length > 0) {
        conditions.push(inArray(activities.status, input.status));
      } else if (!input.showCompleted) {
        conditions.push(
          or(
            eq(activities.status, 'open'),
            eq(activities.status, 'in_progress'),
            eq(activities.status, 'scheduled')
          )!
        );
      }

      // Type filter
      if (input.type && input.type.length > 0) {
        conditions.push(inArray(activities.activityType, input.type));
      }

      // Priority filter
      if (input.priority && input.priority.length > 0) {
        conditions.push(inArray(activities.priority, input.priority));
      }

      // Entity type filter
      if (input.entityType && input.entityType.length > 0) {
        conditions.push(inArray(activities.entityType, input.entityType as string[]));
      }

      // Date range filter
      if (input.dueFrom) {
        conditions.push(sql`${activities.dueDate} >= ${input.dueFrom}`);
      }
      if (input.dueTo) {
        conditions.push(sql`${activities.dueDate} <= ${input.dueTo}`);
      }

      // Search filter
      if (input.search) {
        conditions.push(
          or(
            sql`${activities.subject} ILIKE ${'%' + input.search + '%'}`,
            sql`${activities.body} ILIKE ${'%' + input.search + '%'}`
          )!
        );
      }

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(activities)
        .where(and(...conditions));

      // Get items with sorting
      const sortColumn = input.sortField === 'dueDate' ? activities.dueDate :
                        input.sortField === 'createdAt' ? activities.createdAt :
                        input.sortField === 'priority' ? activities.priority :
                        activities.status;
      const sortFn = input.sortDirection === 'asc' ? asc : desc;

      const items = await db
        .select({
          id: activities.id,
          subject: activities.subject,
          body: activities.body,
          activityType: activities.activityType,
          status: activities.status,
          priority: activities.priority,
          dueDate: activities.dueDate,
          scheduledAt: activities.scheduledAt,
          entityType: activities.entityType,
          entityId: activities.entityId,
          outcome: activities.outcome,
          completedAt: activities.completedAt,
          createdAt: activities.createdAt,
        })
        .from(activities)
        .where(and(...conditions))
        .orderBy(sortFn(sortColumn))
        .limit(input.limit)
        .offset(input.offset);

      // Enrich with SLA status and assignee info
      const enrichedItems = items.map((item) => {
        const slaStatus = calculateSLAStatus(
          item.dueDate,
          item.priority as Priority
        );

        return {
          ...item,
          slaStatus,
          assignedTo: {
            id: userProfile.id,
            fullName: userProfile.fullName,
          },
          entityName: getEntityTypeName(item.entityType),
          entityLink: getEntityLink(item.entityType, item.entityId),
        };
      });

      return {
        items: enrichedItems,
        total: countResult?.count ?? 0,
      };
    }),

  /**
   * Start an activity (transition to in_progress)
   */
  start: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [updated] = await db
        .update(activities)
        .set({
          status: 'in_progress',
          updatedAt: new Date(),
        })
        .where(and(eq(activities.id, input.id), eq(activities.orgId, orgId)))
        .returning();

      if (!updated) {
        throw new Error('Activity not found or unauthorized');
      }

      return updated;
    }),

  // ─────────────────────────────────────────────────────
  // LIST ACTIVITIES
  // ─────────────────────────────────────────────────────
  
  /**
   * Get activities for an entity
   */
  list: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeSchema,
      entityId: z.string().uuid(),
      includeCompleted: z.boolean().default(true),
      activityTypes: z.array(activityTypeSchema).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const conditions = [
        eq(activities.entityType, input.entityType as string),
        eq(activities.entityId, input.entityId),
        eq(activities.orgId, orgId),
      ];
      
      if (!input.includeCompleted) {
        conditions.push(
          or(
            eq(activities.status, 'scheduled'),
            eq(activities.status, 'open'),
            eq(activities.status, 'in_progress')
          )!
        );
      }
      
      if (input.activityTypes && input.activityTypes.length > 0) {
        conditions.push(inArray(activities.activityType, input.activityTypes));
      }
      
      const result = await db.select()
        .from(activities)
        .where(and(...conditions))
        .orderBy(desc(activities.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return result;
    }),

  /**
   * Get open/pending activities (tasks, follow-ups) for an entity
   */
  pending: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeSchema,
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const result = await db.select()
        .from(activities)
        .where(and(
          eq(activities.entityType, input.entityType as string),
          eq(activities.entityId, input.entityId),
          eq(activities.orgId, orgId),
          inArray(activities.status, ['scheduled', 'open', 'in_progress']),
          inArray(activities.activityType, ['task', 'follow_up', 'reminder', 'meeting', 'call'])
        ))
        .orderBy(asc(activities.dueDate));
      
      return result;
    }),

  /**
   * Get overdue activities across all entities
   */
  overdue: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeSchema.optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const now = new Date();
      
      const conditions = [
        eq(activities.orgId, orgId),
        lte(activities.dueDate, now),
        inArray(activities.status, ['scheduled', 'open', 'in_progress']),
      ];
      
      if (input.entityType) {
        conditions.push(eq(activities.entityType, input.entityType as string));
      }
      
      const result = await db.select()
        .from(activities)
        .where(and(...conditions))
        .orderBy(asc(activities.dueDate))
        .limit(input.limit);
      
      return result;
    }),

  /**
   * Get single activity by ID
   */
  get: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [activity] = await db.select()
        .from(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .limit(1);
      
      return activity || null;
    }),

  // ─────────────────────────────────────────────────────
  // CREATE ACTIVITY
  // ─────────────────────────────────────────────────────
  
  /**
   * Create a new activity
   */
  create: orgProtectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;
      
      // Get user profile for assignedTo and createdBy
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const [newActivity] = await db.insert(activities)
        .values({
          orgId,
          entityType: input.entityType as string,
          entityId: input.entityId,
          activityType: input.activityType as string,
          status: input.status as string,
          priority: input.priority as string,
          subject: input.subject,
          body: input.body,
          direction: input.direction as string | undefined,
          dueDate: input.dueDate,
          scheduledAt: input.scheduledAt,
          escalationDate: input.escalationDate,
          durationMinutes: input.durationMinutes,
          outcome: input.outcome as string | undefined,
          assignedTo: userProfile.id,
          createdBy: userProfile.id,
          pocId: input.pocId,
          parentActivityId: input.parentActivityId,
        })
        .returning();
      
      // Update lastContactedAt on lead if applicable
      if (input.entityType === 'lead' && 
          ['email', 'call', 'meeting', 'linkedin_message'].includes(input.activityType) &&
          input.status === 'completed') {
        await db.update(leads)
          .set({ lastContactedAt: new Date() })
          .where(eq(leads.id, input.entityId));
      }
      
      return newActivity;
    }),

  /**
   * Log a completed activity (email, call, meeting, note)
   * Convenience method that creates with status='completed'
   */
  log: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeSchema,
      entityId: z.string().uuid(),
      activityType: z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message']),
      subject: z.string().optional(),
      body: z.string().optional(),
      direction: activityDirectionSchema.optional(),
      durationMinutes: z.number().int().min(0).max(480).optional(),
      outcome: activityOutcomeSchema.optional(),
      pocId: z.string().uuid().optional(),
      // Follow-up creation
      createFollowUp: z.boolean().default(false),
      followUpSubject: z.string().optional(),
      followUpDueDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const now = new Date();

      // Create the completed activity
      const [activity] = await db.insert(activities)
        .values({
          orgId,
          entityType: input.entityType as string,
          entityId: input.entityId,
          activityType: input.activityType as string,
          status: 'completed',
          priority: 'medium',
          subject: input.subject,
          body: input.body,
          direction: input.direction as string | undefined,
          dueDate: now,
          completedAt: now,
          durationMinutes: input.durationMinutes,
          outcome: input.outcome as string | undefined,
          assignedTo: userProfile.id,
          performedBy: userProfile.id,
          createdBy: userProfile.id,
          pocId: input.pocId,
        })
        .returning();
      
      // Create follow-up if requested
      let followUp: Activity | null = null;
      if (input.createFollowUp && input.followUpDueDate) {
        const [newFollowUp] = await db.insert(activities)
          .values({
            orgId,
            entityType: input.entityType as string,
            entityId: input.entityId,
            activityType: 'follow_up',
            status: 'scheduled',
            priority: 'medium',
            subject: input.followUpSubject || `Follow up on: ${input.subject || input.activityType}`,
            dueDate: input.followUpDueDate,
            scheduledAt: input.followUpDueDate,
            assignedTo: userProfile.id,
            createdBy: userProfile.id,
            parentActivityId: activity.id,
          })
          .returning();
        followUp = newFollowUp;
      }
      
      // Update lastContactedAt on lead
      if (input.entityType === 'lead') {
        await db.update(leads)
          .set({ lastContactedAt: now })
          .where(eq(leads.id, input.entityId));
      }
      
      return { activity, followUp };
    }),

  // ─────────────────────────────────────────────────────
  // UPDATE ACTIVITY
  // ─────────────────────────────────────────────────────
  
  /**
   * Update an activity
   */
  update: orgProtectedProcedure
    .input(updateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const updateData: Partial<Activity> = {
        updatedAt: new Date(),
      };

      if (input.status !== undefined) updateData.status = input.status as string;
      if (input.priority !== undefined) updateData.priority = input.priority as string;
      if (input.subject !== undefined) updateData.subject = input.subject;
      if (input.body !== undefined) updateData.body = input.body;
      if (input.direction !== undefined) updateData.direction = input.direction as string;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt;
      if (input.escalationDate !== undefined) updateData.escalationDate = input.escalationDate;
      if (input.completedAt !== undefined) updateData.completedAt = input.completedAt;
      if (input.skippedAt !== undefined) updateData.skippedAt = input.skippedAt;
      if (input.durationMinutes !== undefined) updateData.durationMinutes = input.durationMinutes;
      if (input.outcome !== undefined) updateData.outcome = input.outcome as string;
      if (input.assignedTo !== undefined) updateData.assignedTo = input.assignedTo;
      
      const [updated] = await db.update(activities)
        .set(updateData)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .returning();
      
      if (!updated) {
        throw new Error('Activity not found or unauthorized');
      }
      
      return updated;
    }),

  /**
   * Complete an activity
   */
  complete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      outcome: activityOutcomeSchema.optional(),
      body: z.string().optional(), // Completion notes
      durationMinutes: z.number().int().min(0).max(480).optional(),
      // Follow-up creation
      createFollowUp: z.boolean().default(false),
      followUpSubject: z.string().optional(),
      followUpDueDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const now = new Date();

      // Get the activity first
      const [activity] = await db.select()
        .from(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .limit(1);

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Complete the activity
      const [completed] = await db.update(activities)
        .set({
          status: 'completed',
          completedAt: now,
          performedBy: userProfile.id,
          outcome: input.outcome as string | undefined,
          body: input.body ? `${activity.body || ''}\n\n---\nCompletion Notes: ${input.body}` : activity.body,
          durationMinutes: input.durationMinutes,
          updatedAt: now,
        })
        .where(eq(activities.id, input.id))
        .returning();

      // Create follow-up if requested
      let followUp: Activity | null = null;
      if (input.createFollowUp && input.followUpDueDate) {
        const [newFollowUp] = await db.insert(activities)
          .values({
            orgId,
            entityType: activity.entityType,
            entityId: activity.entityId,
            activityType: 'follow_up',
            status: 'scheduled',
            priority: activity.priority,
            subject: input.followUpSubject || `Follow up on: ${activity.subject || activity.activityType}`,
            dueDate: input.followUpDueDate,
            scheduledAt: input.followUpDueDate,
            assignedTo: userProfile.id,
            createdBy: userProfile.id,
            parentActivityId: activity.id,
          })
          .returning();
        followUp = newFollowUp;
      }
      
      // Update lastContactedAt on lead
      if (activity.entityType === 'lead') {
        await db.update(leads)
          .set({ lastContactedAt: now })
          .where(eq(leads.id, activity.entityId));
      }
      
      return { activity: completed, followUp };
    }),

  /**
   * Skip an activity
   */
  skip: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [activity] = await db.select()
        .from(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .limit(1);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      const [skipped] = await db.update(activities)
        .set({
          status: 'skipped',
          skippedAt: new Date(),
          body: input.reason ? `${activity.body || ''}\n\n---\nSkipped: ${input.reason}` : activity.body,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, input.id))
        .returning();
      
      return skipped;
    }),

  /**
   * Cancel an activity
   */
  cancel: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [activity] = await db.select()
        .from(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .limit(1);
      
      if (!activity) {
        throw new Error('Activity not found');
      }
      
      const [cancelled] = await db.update(activities)
        .set({
          status: 'cancelled',
          body: input.reason ? `${activity.body || ''}\n\n---\nCancelled: ${input.reason}` : activity.body,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, input.id))
        .returning();
      
      return cancelled;
    }),

  // ─────────────────────────────────────────────────────
  // DELETE ACTIVITY (Soft delete via cancel)
  // ─────────────────────────────────────────────────────
  
  /**
   * Delete an activity (sets status to cancelled)
   * We don't hard delete activities for audit trail
   */
  delete: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [deleted] = await db.update(activities)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .returning();
      
      if (!deleted) {
        throw new Error('Activity not found or unauthorized');
      }
      
      return { success: true };
    }),

  // ─────────────────────────────────────────────────────
  // RESCHEDULE
  // ─────────────────────────────────────────────────────
  
  /**
   * Reschedule an activity
   */
  reschedule: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      newDueDate: z.date(),
      newScheduledAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [rescheduled] = await db
        .update(activities)
        .set({
          dueDate: input.newDueDate,
          scheduledAt: input.newScheduledAt || input.newDueDate,
          status: 'scheduled',
          updatedAt: new Date(),
        })
        .where(and(eq(activities.id, input.id), eq(activities.orgId, orgId)))
        .returning();

      if (!rescheduled) {
        throw new Error('Activity not found or unauthorized');
      }

      return rescheduled;
    }),

  // ─────────────────────────────────────────────────────
  // QUEUE MANAGEMENT
  // ─────────────────────────────────────────────────────

  /**
   * Get personal work queue for the current user
   */
  myQueue: orgProtectedProcedure
    .input(
      z.object({
        status: z
          .array(z.enum(['pending', 'open', 'in_progress']))
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        activityTypes: z.array(activityTypeSchema).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile ID
      const [userProfile] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return queueManager.getPersonalQueue(userProfile.id, orgId, {
        status: input.status as ('pending' | 'open' | 'in_progress')[] | undefined,
        limit: input.limit,
        activityTypes: input.activityTypes,
      });
    }),

  /**
   * Get team queue (for managers)
   */
  teamQueue: orgProtectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        status: z
          .array(z.enum(['pending', 'open', 'in_progress']))
          .optional(),
        limit: z.number().min(1).max(100).default(100),
        includeUnassigned: z.boolean().default(false),
        activityTypes: z.array(activityTypeSchema).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return queueManager.getTeamQueue(input.teamId, orgId, {
        status: input.status as ('pending' | 'open' | 'in_progress')[] | undefined,
        limit: input.limit,
        includeUnassigned: input.includeUnassigned,
        activityTypes: input.activityTypes,
      });
    }),

  /**
   * Get next recommended activity for the current user
   */
  nextRecommended: orgProtectedProcedure.query(async ({ ctx }) => {
    const { userId, orgId } = ctx;

    // Get user profile ID
    const [userProfile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.authId, userId as string))
      .limit(1);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    return queueManager.getNextRecommended(userProfile.id, orgId);
  }),

  /**
   * Claim an activity from the queue
   */
  claim: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile ID
      const [userProfile] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return queueManager.claim(input.id, userProfile.id, orgId);
    }),

  /**
   * Unclaim an activity (return to queue)
   */
  unclaim: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile ID
      const [userProfile] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return queueManager.unclaim(input.id, userProfile.id, orgId);
    }),

  /**
   * Get queue statistics for the current user
   */
  queueStats: orgProtectedProcedure.query(async ({ ctx }) => {
    const { userId, orgId } = ctx;

    // Get user profile ID
    const [userProfile] = await db
      .select({ id: userProfiles.id })
      .from(userProfiles)
      .where(eq(userProfiles.authId, userId as string))
      .limit(1);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    return queueManager.getQueueStats(userProfile.id, orgId);
  }),

  /**
   * Get team queue statistics
   */
  teamQueueStats: orgProtectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return queueManager.getTeamQueueStats(input.teamId, orgId);
    }),

  // ─────────────────────────────────────────────────────
  // PATTERN MANAGEMENT
  // ─────────────────────────────────────────────────────

  /**
   * Get all activity patterns
   */
  patterns: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    return patternService.getAllPatterns(orgId);
  }),

  /**
   * Get patterns by category
   */
  patternsByCategory: orgProtectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return patternService.getByCategory(input.category, orgId);
    }),

  /**
   * Get patterns for an entity type
   */
  patternsForEntity: orgProtectedProcedure
    .input(z.object({ entityType: entityTypeSchema }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return patternService.getByEntityType(input.entityType, orgId);
    }),

  /**
   * Get a specific pattern by code
   */
  pattern: orgProtectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return patternService.getPattern(input.code, orgId);
    }),

  /**
   * Get fields for a pattern
   */
  patternFields: orgProtectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      return patternService.getFields(input.code, orgId);
    }),

  /**
   * Create activity from pattern
   */
  createFromPattern: orgProtectedProcedure
    .input(
      z.object({
        patternCode: z.string(),
        entityType: entityTypeSchema,
        entityId: z.string().uuid(),
        subject: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: activityPrioritySchema.optional(),
        fieldValues: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Instantiate the pattern
      const instantiated = await patternService.instantiate(
        input.patternCode,
        input.entityType,
        input.entityId,
        {
          subject: input.subject,
          description: input.description,
          dueAt: input.dueDate,
          priority: input.priority as Priority | undefined,
          assignedTo: userProfile.id,
          fieldValues: input.fieldValues,
        },
        orgId
      );

      // Create the activity
      const [newActivity] = await db
        .insert(activities)
        .values({
          orgId,
          entityType: input.entityType as string,
          entityId: input.entityId,
          activityType: 'task',
          status: 'open',
          priority: instantiated.priority,
          subject: `[${instantiated.patternCode}] ${instantiated.subject}`,
          body: instantiated.description,
          dueDate: instantiated.dueAt,
          assignedTo: userProfile.id,
          createdBy: userProfile.id,
        })
        .returning();

      return newActivity;
    }),

  // ─────────────────────────────────────────────────────
  // SLA STATUS
  // ─────────────────────────────────────────────────────

  /**
   * Get activities with SLA status
   */
  withSLAStatus: orgProtectedProcedure
    .input(
      z.object({
        entityType: entityTypeSchema.optional(),
        entityId: z.string().uuid().optional(),
        slaStatus: z.enum(['on_track', 'at_risk', 'breached']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const conditions = [
        eq(activities.orgId, orgId),
        inArray(activities.status, ['open', 'in_progress', 'scheduled']),
      ];

      if (input.entityType) {
        conditions.push(eq(activities.entityType, input.entityType as string));
      }

      if (input.entityId) {
        conditions.push(eq(activities.entityId, input.entityId));
      }

      const results = await db
        .select()
        .from(activities)
        .where(and(...conditions))
        .orderBy(asc(activities.dueDate))
        .limit(input.limit);

      // Calculate SLA status for each activity
      const withSLA = results.map((activity) => ({
        ...activity,
        slaStatus: calculateSLAStatus(
          activity.dueDate,
          activity.priority as Priority
        ),
      }));

      // Filter by SLA status if specified
      if (input.slaStatus) {
        return withSLA.filter((a) => a.slaStatus === input.slaStatus);
      }

      return withSLA;
    }),

  /**
   * Get SLA summary (counts by status)
   */
  slaSummary: orgProtectedProcedure
    .input(
      z.object({
        entityType: entityTypeSchema.optional(),
        entityId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const conditions = [
        eq(activities.orgId, orgId),
        inArray(activities.status, ['open', 'in_progress', 'scheduled']),
      ];

      if (input.entityType) {
        conditions.push(eq(activities.entityType, input.entityType as string));
      }

      if (input.entityId) {
        conditions.push(eq(activities.entityId, input.entityId));
      }

      const results = await db
        .select()
        .from(activities)
        .where(and(...conditions));

      const summary = {
        total: results.length,
        on_track: 0,
        at_risk: 0,
        breached: 0,
      };

      for (const activity of results) {
        const status = calculateSLAStatus(
          activity.dueDate,
          activity.priority as Priority
        );
        summary[status]++;
      }

      return summary;
    }),

  // ─────────────────────────────────────────────────────
  // REASSIGN
  // ─────────────────────────────────────────────────────

  /**
   * Reassign activity to another user
   */
  reassign: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        assignedTo: z.string().uuid(),
        notifyAssignee: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [reassigned] = await db
        .update(activities)
        .set({
          assignedTo: input.assignedTo,
          updatedAt: new Date(),
        })
        .where(and(eq(activities.id, input.id), eq(activities.orgId, orgId)))
        .returning();

      if (!reassigned) {
        throw new Error('Activity not found or unauthorized');
      }

      // TODO: Send notification to new assignee if notifyAssignee is true

      return reassigned;
    }),

  // ─────────────────────────────────────────────────────
  // BULK OPERATIONS
  // ─────────────────────────────────────────────────────

  /**
   * Bulk complete activities
   */
  bulkComplete: orgProtectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()).min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const now = new Date();

      const completed = await db
        .update(activities)
        .set({
          status: 'completed',
          completedAt: now,
          performedBy: userProfile.id,
          updatedAt: now,
        })
        .where(
          and(eq(activities.orgId, orgId), inArray(activities.id, input.ids))
        )
        .returning();

      return { count: completed.length, activities: completed };
    }),

  /**
   * Bulk reassign activities
   */
  bulkReassign: orgProtectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()).min(1).max(50),
        assignedTo: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const reassigned = await db
        .update(activities)
        .set({
          assignedTo: input.assignedTo,
          updatedAt: new Date(),
        })
        .where(
          and(eq(activities.orgId, orgId), inArray(activities.id, input.ids))
        )
        .returning();

      return { count: reassigned.length, activities: reassigned };
    }),
});

export type ActivitiesRouter = typeof activitiesRouter;
