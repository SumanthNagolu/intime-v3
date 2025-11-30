/**
 * Workspace Dashboard Router
 *
 * Provides data for the unified workspace dashboard including:
 * - Key metrics (active jobs, pipeline, interviews, placements)
 * - Pipeline stage counts
 * - Priority jobs
 * - Today's tasks
 * - Recent submissions
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { jobs, submissions, interviews, placements, offers } from '@/lib/db/schema/ats';
import { activities } from '@/lib/db/schema/activities';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { accounts } from '@/lib/db/schema/crm';
import { eq, and, desc, sql, inArray, isNull, or, gte, lte, count, ne } from 'drizzle-orm';

// =====================================================
// WORKSPACE DASHBOARD ROUTER
// =====================================================

export const workspaceRouter = router({

  // ─────────────────────────────────────────────────────
  // DASHBOARD METRICS
  // ─────────────────────────────────────────────────────

  /**
   * Get key metrics for the recruiter dashboard
   */
  metrics: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(), // Filter by specific user, or get org-wide
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const filterUserId = input?.userId;

      // Get user profile ID from auth ID
      let profileId: string | null = null;
      if (filterUserId) {
        profileId = filterUserId;
      } else if (userId) {
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);
        profileId = userProfile?.id || null;
      }

      // Build base conditions
      const jobConditions = [
        eq(jobs.orgId, orgId),
        isNull(jobs.deletedAt),
        inArray(jobs.status, ['open', 'urgent']),
      ];

      const submissionConditions = [
        eq(submissions.orgId, orgId),
        isNull(submissions.deletedAt),
      ];

      // If filtering by user, add owner filter
      if (profileId) {
        jobConditions.push(eq(jobs.ownerId, profileId));
        submissionConditions.push(eq(submissions.ownerId, profileId));
      }

      // 1. Active Jobs Count (open or urgent status)
      const [activeJobsResult] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(jobs)
        .where(and(...jobConditions));

      // 2. In Pipeline Count (submissions not placed/rejected/withdrawn)
      const [pipelineResult] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(submissions)
        .where(and(
          ...submissionConditions,
          or(
            eq(submissions.status, 'sourced'),
            eq(submissions.status, 'screening'),
            eq(submissions.status, 'vendor_pending'),
            eq(submissions.status, 'vendor_screening'),
            eq(submissions.status, 'vendor_accepted'),
            eq(submissions.status, 'submitted_to_client'),
            eq(submissions.status, 'client_review'),
            eq(submissions.status, 'client_accepted'),
            eq(submissions.status, 'client_interview'),
            eq(submissions.status, 'offer_stage'),
          )
        ));

      // 3. Interviews Count (scheduled interviews)
      const interviewConditions = [
        eq(interviews.orgId, orgId),
        eq(interviews.status, 'scheduled'),
      ];

      const [interviewsResult] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(interviews)
        .where(and(...interviewConditions));

      // 4. Placements MTD (this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const placementConditions = [
        eq(placements.orgId, orgId),
        gte(placements.createdAt, startOfMonth),
      ];

      if (profileId) {
        placementConditions.push(eq(placements.recruiterId, profileId));
      }

      const [placementsMTDResult] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(placements)
        .where(and(...placementConditions));

      // 5. Conversion rate (placements / total submissions this quarter)
      const startOfQuarter = new Date();
      const currentMonth = startOfQuarter.getMonth();
      startOfQuarter.setMonth(currentMonth - (currentMonth % 3));
      startOfQuarter.setDate(1);
      startOfQuarter.setHours(0, 0, 0, 0);

      const [totalSubmissionsQuarter] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          gte(submissions.createdAt, startOfQuarter),
          profileId ? eq(submissions.ownerId, profileId) : sql`true`,
        ));

      const [placementsQuarter] = await db.select({
        count: sql<number>`count(*)::int`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.createdAt, startOfQuarter),
          profileId ? eq(placements.recruiterId, profileId) : sql`true`,
        ));

      const conversionRate = totalSubmissionsQuarter?.count > 0
        ? ((placementsQuarter?.count || 0) / totalSubmissionsQuarter.count * 100).toFixed(1)
        : '0';

      // 6. Average time to fill (days from job posted to placement)
      const [avgTimeToFill] = await db.select({
        avgDays: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (${placements.createdAt} - ${jobs.postedDate})) / 86400
            )::int,
            0
          )
        `,
      })
        .from(placements)
        .innerJoin(jobs, eq(placements.jobId, jobs.id))
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.createdAt, startOfQuarter),
        ));

      return {
        activeJobs: activeJobsResult?.count || 0,
        inPipeline: pipelineResult?.count || 0,
        interviews: interviewsResult?.count || 0,
        placementsMTD: placementsMTDResult?.count || 0,
        conversionRate: parseFloat(conversionRate),
        avgTimeToFill: avgTimeToFill?.avgDays || 0,
      };
    }),

  /**
   * Get submission pipeline counts by stage
   */
  pipeline: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const filterUserId = input?.userId;

      // Get user profile ID
      let profileId: string | null = null;
      if (filterUserId) {
        profileId = filterUserId;
      } else if (userId) {
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);
        profileId = userProfile?.id || null;
      }

      // Map detailed statuses to simplified pipeline stages
      const stageMapping = {
        sourced: ['sourced'],
        screening: ['screening', 'vendor_pending', 'vendor_screening'],
        submitted: ['vendor_accepted', 'submitted_to_client', 'client_review'],
        interview: ['client_accepted', 'client_interview'],
        offer: ['offer_stage'],
        placed: ['placed'],
      };

      const pipeline = [];

      for (const [stage, statuses] of Object.entries(stageMapping)) {
        const conditions = [
          eq(submissions.orgId, orgId),
          isNull(submissions.deletedAt),
          inArray(submissions.status, statuses),
        ];

        if (profileId) {
          conditions.push(eq(submissions.ownerId, profileId));
        }

        const [result] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(...conditions));

        pipeline.push({
          stage,
          count: result?.count || 0,
        });
      }

      return pipeline;
    }),

  /**
   * Get priority jobs (high/urgent priority or with active submissions)
   */
  priorityJobs: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5),
      userId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const limit = input?.limit || 5;
      const filterUserId = input?.userId;

      // Get user profile ID
      let profileId: string | null = null;
      if (filterUserId) {
        profileId = filterUserId;
      } else if (userId) {
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);
        profileId = userProfile?.id || null;
      }

      const conditions = [
        eq(jobs.orgId, orgId),
        isNull(jobs.deletedAt),
        inArray(jobs.status, ['open', 'urgent']),
      ];

      if (profileId) {
        conditions.push(eq(jobs.ownerId, profileId));
      }

      // Get priority jobs with submission counts
      const priorityJobs = await db.select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        isRemote: jobs.isRemote,
        rateMin: jobs.rateMin,
        rateMax: jobs.rateMax,
        rateType: jobs.rateType,
        status: jobs.status,
        urgency: jobs.urgency,
        postedDate: jobs.postedDate,
        createdAt: jobs.createdAt,
        accountId: jobs.accountId,
      })
        .from(jobs)
        .where(and(...conditions))
        .orderBy(
          sql`CASE WHEN ${jobs.urgency} = 'urgent' THEN 1
               WHEN ${jobs.urgency} = 'high' THEN 2
               WHEN ${jobs.urgency} = 'medium' THEN 3
               ELSE 4 END`,
          desc(jobs.createdAt)
        )
        .limit(limit);

      // Enrich with account names and submission counts
      const enrichedJobs = await Promise.all(priorityJobs.map(async (job) => {
        // Get account name
        let accountName = null;
        if (job.accountId) {
          const [account] = await db.select({ name: accounts.name })
            .from(accounts)
            .where(eq(accounts.id, job.accountId))
            .limit(1);
          accountName = account?.name || null;
        }

        // Get submission count
        const [submissionCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(
            eq(submissions.jobId, job.id),
            isNull(submissions.deletedAt),
          ));

        // Calculate days open
        const postedDate = job.postedDate || job.createdAt;
        const daysOpen = Math.floor((Date.now() - new Date(postedDate).getTime()) / (1000 * 60 * 60 * 24));

        // Format rate
        let targetRate = null;
        if (job.rateMin && job.rateMax) {
          const rateType = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
          targetRate = `$${Number(job.rateMin).toFixed(0)}-${Number(job.rateMax).toFixed(0)}${rateType}`;
        }

        return {
          id: job.id,
          title: job.title,
          account: accountName,
          location: job.isRemote ? 'Remote' : job.location || 'Not specified',
          priority: job.urgency || 'normal',
          submissions: submissionCount?.count || 0,
          daysOpen,
          targetRate,
        };
      }));

      return enrichedJobs;
    }),

  /**
   * Get today's tasks (activities assigned to user)
   */
  tasks: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
      includeCompleted: z.boolean().default(true),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const limit = input?.limit || 10;
      const includeCompleted = input?.includeCompleted ?? true;

      // Get user profile ID
      if (!userId) {
        return [];
      }
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId))
        .limit(1);

      if (!userProfile) {
        return [];
      }

      // Get today's date range
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const conditions = [
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, userProfile.id),
        inArray(activities.activityType, ['task', 'follow_up', 'reminder', 'call', 'meeting']),
      ];

      if (!includeCompleted) {
        conditions.push(
          inArray(activities.status, ['scheduled', 'open', 'in_progress'])
        );
      }

      // Get activities due today or overdue
      conditions.push(
        or(
          and(
            gte(activities.dueDate, todayStart),
            lte(activities.dueDate, todayEnd)
          ),
          and(
            lte(activities.dueDate, todayStart),
            inArray(activities.status, ['scheduled', 'open', 'in_progress'])
          )
        )!
      );

      const tasks = await db.select({
        id: activities.id,
        subject: activities.subject,
        status: activities.status,
        priority: activities.priority,
        dueDate: activities.dueDate,
        entityType: activities.entityType,
        entityId: activities.entityId,
        activityType: activities.activityType,
      })
        .from(activities)
        .where(and(...conditions))
        .orderBy(
          sql`CASE WHEN ${activities.status} = 'completed' THEN 1 ELSE 0 END`,
          sql`CASE WHEN ${activities.priority} = 'urgent' THEN 1
               WHEN ${activities.priority} = 'high' THEN 2
               WHEN ${activities.priority} = 'medium' THEN 3
               ELSE 4 END`,
          activities.dueDate
        )
        .limit(limit);

      return tasks.map(task => ({
        id: task.id,
        text: task.subject || `${task.activityType} for ${task.entityType}`,
        done: task.status === 'completed',
        priority: task.priority,
        dueDate: task.dueDate,
        entityType: task.entityType,
        entityId: task.entityId,
      }));
    }),

  /**
   * Get recent submissions with candidate and job info
   */
  recentSubmissions: orgProtectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5),
      userId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;
      const limit = input?.limit || 5;
      const filterUserId = input?.userId;

      // Get user profile ID
      let profileId: string | null = null;
      if (filterUserId) {
        profileId = filterUserId;
      } else if (userId) {
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);
        profileId = userProfile?.id || null;
      }

      const conditions = [
        eq(submissions.orgId, orgId),
        isNull(submissions.deletedAt),
      ];

      if (profileId) {
        conditions.push(eq(submissions.ownerId, profileId));
      }

      // Get recent submissions
      const recentSubmissions = await db.select({
        id: submissions.id,
        status: submissions.status,
        createdAt: submissions.createdAt,
        candidateId: submissions.candidateId,
        jobId: submissions.jobId,
        submittedToClientAt: submissions.submittedToClientAt,
      })
        .from(submissions)
        .where(and(...conditions))
        .orderBy(desc(submissions.updatedAt))
        .limit(limit);

      // Enrich with candidate and job info
      const enrichedSubmissions = await Promise.all(recentSubmissions.map(async (sub) => {
        // Get candidate info
        let candidateName = 'Unknown';
        if (sub.candidateId) {
          const [candidate] = await db.select({
            firstName: userProfiles.firstName,
            lastName: userProfiles.lastName,
          })
            .from(userProfiles)
            .where(eq(userProfiles.id, sub.candidateId))
            .limit(1);

          if (candidate) {
            candidateName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown';
          }
        }

        // Get job info
        let jobTitle = 'Unknown Position';
        if (sub.jobId) {
          const [job] = await db.select({ title: jobs.title })
            .from(jobs)
            .where(eq(jobs.id, sub.jobId))
            .limit(1);
          jobTitle = job?.title || 'Unknown Position';
        }

        // Determine next step based on status
        let nextStep = '';
        switch (sub.status) {
          case 'sourced':
            nextStep = 'Initial screening pending';
            break;
          case 'screening':
          case 'vendor_pending':
          case 'vendor_screening':
            nextStep = 'Under internal review';
            break;
          case 'vendor_accepted':
          case 'submitted_to_client':
            nextStep = 'Awaiting client feedback';
            break;
          case 'client_review':
            nextStep = 'Client reviewing profile';
            break;
          case 'client_accepted':
          case 'client_interview':
            nextStep = 'Interview scheduling in progress';
            break;
          case 'offer_stage':
            nextStep = 'Offer negotiation in progress';
            break;
          case 'placed':
            nextStep = 'Placement confirmed';
            break;
          case 'rejected':
          case 'vendor_rejected':
          case 'client_rejected':
            nextStep = 'Not moving forward';
            break;
          default:
            nextStep = 'Status update pending';
        }

        return {
          id: sub.id,
          candidateName,
          jobTitle,
          status: sub.status,
          submittedAt: sub.submittedToClientAt || sub.createdAt,
          nextStep,
        };
      }));

      return enrichedSubmissions;
    }),

  /**
   * Toggle task completion status
   */
  toggleTask: orgProtectedProcedure
    .input(z.object({
      taskId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;

      // Get current task
      const [task] = await db.select()
        .from(activities)
        .where(and(
          eq(activities.id, input.taskId),
          eq(activities.orgId, orgId),
        ))
        .limit(1);

      if (!task) {
        throw new Error('Task not found');
      }

      // Toggle status
      const newStatus = task.status === 'completed' ? 'open' : 'completed';
      const completedAt = newStatus === 'completed' ? new Date() : null;

      // Get user profile for performedBy
      let userProfile: { id: string } | undefined;
      if (userId) {
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);
        userProfile = profile;
      }

      const [updated] = await db.update(activities)
        .set({
          status: newStatus,
          completedAt,
          performedBy: newStatus === 'completed' ? userProfile?.id : null,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, input.taskId))
        .returning();

      return {
        id: updated.id,
        done: updated.status === 'completed',
      };
    }),

  /**
   * Create a new task
   */
  createTask: orgProtectedProcedure
    .input(z.object({
      subject: z.string().min(1),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      dueDate: z.date().optional(),
      entityType: z.enum(['lead', 'deal', 'account', 'candidate', 'submission', 'job', 'poc']).optional(),
      entityId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, userId } = ctx;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get user profile
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [newTask] = await db.insert(activities)
        .values({
          orgId,
          entityType: input.entityType || 'candidate', // Default entity type
          entityId: input.entityId || userProfile.id, // Default to self if no entity
          activityType: 'task',
          status: 'open',
          priority: input.priority,
          subject: input.subject,
          dueDate: input.dueDate || new Date(),
          assignedTo: userProfile.id,
          createdBy: userProfile.id,
        })
        .returning();

      return {
        id: newTask.id,
        text: newTask.subject,
        done: false,
        priority: newTask.priority,
      };
    }),
});

export type WorkspaceRouter = typeof workspaceRouter;
