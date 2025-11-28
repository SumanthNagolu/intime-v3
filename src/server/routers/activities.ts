/**
 * tRPC Router: Activities (Daily Planner)
 * Handles user activities, tasks, follow-ups with escalation tracking
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { activities } from '@/lib/db/schema/ats';
import { eq, and, desc, sql, gte, lte, or, type SQL } from 'drizzle-orm';

// Activity types enum
const activityTypeEnum = z.enum([
  'task',
  'follow_up',
  'call',
  'meeting',
  'reminder',
]);

// Priority levels
const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

// Activity status
const statusEnum = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

// Entity types for polymorphic linking
const entityTypeEnum = z.enum([
  'job',
  'submission',
  'candidate',
  'account',
  'lead',
  'deal',
]);

// Create activity schema
const createActivitySchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  activityType: activityTypeEnum,
  priority: priorityEnum.default('medium'),
  startDate: z.date(),
  targetDate: z.date().optional(),
  entityType: entityTypeEnum.optional(),
  entityId: z.string().uuid().optional(),
});

// Update activity schema
const updateActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  activityType: activityTypeEnum.optional(),
  priority: priorityEnum.optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  status: statusEnum.optional(),
  entityType: entityTypeEnum.optional(),
  entityId: z.string().uuid().optional(),
});

export const activitiesRouter = router({
  /**
   * List activities for current user
   */
  list: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: statusEnum.optional(),
      priority: priorityEnum.optional(),
      activityType: activityTypeEnum.optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      includeEscalated: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId!;  // Guaranteed by orgProtectedProcedure
      const orgId = ctx.orgId!;    // Guaranteed by orgProtectedProcedure
      const { limit, offset, status, priority, activityType, dateFrom, dateTo, includeEscalated } = input;

      const conditions: SQL[] = [
        eq(activities.orgId, orgId),
        eq(activities.userId, userId),
      ];

      if (status) {
        conditions.push(eq(activities.status, status));
      }
      if (priority) {
        conditions.push(eq(activities.priority, priority));
      }
      if (activityType) {
        conditions.push(eq(activities.activityType, activityType));
      }
      if (dateFrom) {
        conditions.push(gte(activities.startDate, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(activities.startDate, dateTo));
      }
      if (includeEscalated) {
        conditions.push(eq(activities.isEscalated, true));
      }

      const results = await db.select().from(activities)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(
          desc(activities.isEscalated),
          desc(activities.priority),
          activities.targetDate
        );

      return results;
    }),

  /**
   * Get activities for today
   */
  today: orgProtectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId!;
    const orgId = ctx.orgId!;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const results = await db.select().from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.userId, userId),
        or(
          // Tasks scheduled for today
          and(
            gte(activities.startDate, today),
            lte(activities.startDate, tomorrow)
          ),
          // Or tasks that are pending/in_progress and not completed
          and(
            sql`${activities.status} IN ('pending', 'in_progress')`,
            lte(activities.startDate, tomorrow)
          )
        )
      ))
      .orderBy(
        desc(activities.isEscalated),
        desc(activities.priority),
        activities.targetDate
      );

    return results;
  }),

  /**
   * Get escalated activities
   */
  escalated: orgProtectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId!;
    const orgId = ctx.orgId!;

    const results = await db.select().from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.userId, userId),
        eq(activities.isEscalated, true),
        sql`${activities.status} NOT IN ('completed', 'cancelled')`
      ))
      .orderBy(
        desc(activities.escalatedDays),
        desc(activities.priority)
      );

    return results;
  }),

  /**
   * Get activity by ID
   */
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId!;
      const orgId = ctx.orgId!;

      const [activity] = await db.select().from(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId),
          eq(activities.userId, userId)
        ))
        .limit(1);

      if (!activity) {
        throw new Error('Activity not found');
      }

      return activity;
    }),

  /**
   * Create new activity
   */
  create: orgProtectedProcedure
    .input(createActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId!;
      const orgId = ctx.orgId!;

      const [newActivity] = await db.insert(activities).values({
        ...input,
        orgId,
        userId,
        status: 'pending',
      }).returning();

      return newActivity;
    }),

  /**
   * Update activity
   */
  update: orgProtectedProcedure
    .input(updateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId!;
      const orgId = ctx.orgId!;
      const { id, ...data } = input;

      const [updated] = await db.update(activities)
        .set(data)
        .where(and(
          eq(activities.id, id),
          eq(activities.orgId, orgId),
          eq(activities.userId, userId)
        ))
        .returning();

      if (!updated) {
        throw new Error('Activity not found or unauthorized');
      }

      return updated;
    }),

  /**
   * Mark activity as completed
   */
  complete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId!;
      const orgId = ctx.orgId!;

      const [updated] = await db.update(activities)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId),
          eq(activities.userId, userId)
        ))
        .returning();

      if (!updated) {
        throw new Error('Activity not found or unauthorized');
      }

      return updated;
    }),

  /**
   * Delete activity
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId!;
      const orgId = ctx.orgId!;

      const [deleted] = await db.delete(activities)
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId),
          eq(activities.userId, userId)
        ))
        .returning();

      if (!deleted) {
        throw new Error('Activity not found or unauthorized');
      }

      return { success: true };
    }),

  /**
   * Get activity summary/stats
   */
  summary: orgProtectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId!;
    const orgId = ctx.orgId!;

    const stats = await db.select({
      status: activities.status,
      count: sql<number>`count(*)::int`,
      escalatedCount: sql<number>`count(case when ${activities.isEscalated} then 1 end)::int`,
    })
      .from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.userId, userId)
      ))
      .groupBy(activities.status);

    const summary = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      escalated: 0,
      total: 0,
    };

    for (const stat of stats) {
      if (stat.status === 'pending') summary.pending = stat.count;
      if (stat.status === 'in_progress') summary.inProgress = stat.count;
      if (stat.status === 'completed') summary.completed = stat.count;
      if (stat.status === 'cancelled') summary.cancelled = stat.count;
      summary.escalated += stat.escalatedCount;
      summary.total += stat.count;
    }

    return summary;
  }),
});
