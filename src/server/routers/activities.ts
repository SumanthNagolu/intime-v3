/**
 * Unified Activities Router
 * 
 * Handles all activity CRUD operations across entities.
 * Replaces both activity_log and lead_tasks functionality.
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { 
  activities, 
  type Activity, 
  type ActivityStatus, 
  type ActivityType,
  type ActivityPriority 
} from '@/lib/db/schema/activities';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { leads } from '@/lib/db/schema/crm';
import { eq, and, desc, asc, isNull, or, lte, gte, inArray } from 'drizzle-orm';

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
// ACTIVITIES ROUTER
// =====================================================

export const activitiesRouter = router({
  
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
      const { userId, orgId } = ctx;
      
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
      
      const [rescheduled] = await db.update(activities)
        .set({
          dueDate: input.newDueDate,
          scheduledAt: input.newScheduledAt || input.newDueDate,
          status: 'scheduled',
          updatedAt: new Date(),
        })
        .where(and(
          eq(activities.id, input.id),
          eq(activities.orgId, orgId)
        ))
        .returning();
      
      if (!rescheduled) {
        throw new Error('Activity not found or unauthorized');
      }
      
      return rescheduled;
    }),
});

export type ActivitiesRouter = typeof activitiesRouter;
