/**
 * tRPC Router: Client Portal Module
 * Handles client-specific views for jobs, submissions, and interviews
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  jobs,
  submissions,
  interviews,
  offers,
  placements,
} from '@/lib/db/schema/ats';
import { accounts } from '@/lib/db/schema/crm';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export const clientRouter = router({
  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  /**
   * Get dashboard statistics for client
   * Shows overview of jobs, submissions, and placements
   */
  dashboardStats: orgProtectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { clientId } = input;

      // Verify client belongs to org
      const [account] = await db.select().from(accounts)
        .where(and(
          eq(accounts.id, clientId),
          eq(accounts.orgId, orgId)
        ))
        .limit(1);

      if (!account) {
        throw new Error('Client not found or unauthorized');
      }

      // Get job counts by status
      const jobStats = await db.select({
        status: jobs.status,
        count: sql<number>`count(*)::int`,
      })
        .from(jobs)
        .where(and(
          eq(jobs.clientId, clientId),
          eq(jobs.orgId, orgId)
        ))
        .groupBy(jobs.status);

      // Get total submissions for this client's jobs
      const clientJobIds = await db.select({ id: jobs.id })
        .from(jobs)
        .where(and(
          eq(jobs.clientId, clientId),
          eq(jobs.orgId, orgId)
        ));

      const jobIds = clientJobIds.map(j => j.id);

      let submissionStats: Array<{ status: string | null; count: number }> = [];
      let totalPlacements = 0;
      let upcomingInterviews = 0;

      if (jobIds.length > 0) {
        // Get submission counts by status
        submissionStats = await db.select({
          status: submissions.status,
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(
            inArray(submissions.jobId, jobIds),
            eq(submissions.orgId, orgId)
          ))
          .groupBy(submissions.status);

        // Get placement count
        const [placementCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(placements)
          .where(and(
            inArray(placements.jobId, jobIds),
            eq(placements.orgId, orgId)
          ));

        totalPlacements = placementCount?.count || 0;

        // Get upcoming interviews (next 30 days)
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);

        const [upcomingCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(interviews)
          .where(and(
            inArray(interviews.jobId, jobIds),
            eq(interviews.orgId, orgId),
            sql`${interviews.scheduledAt} >= ${today}`,
            sql`${interviews.scheduledAt} <= ${futureDate}`
          ));

        upcomingInterviews = upcomingCount?.count || 0;
      }

      return {
        jobStats,
        submissionStats,
        totalPlacements,
        upcomingInterviews,
      };
    }),

  // =====================================================
  // JOBS
  // =====================================================

  jobs: router({
    /**
     * Get all jobs for a specific client
     */
    list: orgProtectedProcedure
      .input(z.object({
        clientId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'open', 'on_hold', 'filled', 'closed']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { clientId, limit, offset, status } = input;

        const conditions = [
          eq(jobs.clientId, clientId),
          eq(jobs.orgId, orgId)
        ];

        if (status) {
          conditions.push(eq(jobs.status, status));
        }

        const results = await db.select().from(jobs)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(jobs.createdAt));

        return results;
      }),

    /**
     * Get single job detail for client
     */
    getById: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        clientId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { jobId, clientId } = input;

        const [job] = await db.select().from(jobs)
          .where(and(
            eq(jobs.id, jobId),
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ))
          .limit(1);

        if (!job) {
          throw new Error('Job not found or unauthorized');
        }

        return job;
      }),

    /**
     * Get submission metrics for a specific job
     */
    metrics: orgProtectedProcedure
      .input(z.object({
        jobId: z.string().uuid(),
        clientId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { jobId, clientId } = input;

        // Verify job belongs to client
        const [job] = await db.select().from(jobs)
          .where(and(
            eq(jobs.id, jobId),
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ))
          .limit(1);

        if (!job) {
          throw new Error('Job not found or unauthorized');
        }

        // Get submission counts by status
        const submissionStats = await db.select({
          status: submissions.status,
          count: sql<number>`count(*)::int`,
        })
          .from(submissions)
          .where(and(
            eq(submissions.jobId, jobId),
            eq(submissions.orgId, orgId)
          ))
          .groupBy(submissions.status);

        // Get interview count
        const [interviewCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(interviews)
          .where(and(
            eq(interviews.jobId, jobId),
            eq(interviews.orgId, orgId)
          ));

        // Get offer count
        const [offerCount] = await db.select({
          count: sql<number>`count(*)::int`,
        })
          .from(offers)
          .where(and(
            eq(offers.jobId, jobId),
            eq(offers.orgId, orgId)
          ));

        return {
          submissionStats,
          interviewCount: interviewCount?.count || 0,
          offerCount: offerCount?.count || 0,
        };
      }),
  }),

  // =====================================================
  // SUBMISSIONS
  // =====================================================

  submissions: router({
    /**
     * Get all submissions for client's jobs
     */
    list: orgProtectedProcedure
      .input(z.object({
        clientId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum([
          'screening',
          'submitted_to_client',
          'client_interview',
          'offer',
          'placed',
          'rejected',
          'withdrawn'
        ]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { clientId, jobId, limit, offset, status } = input;

        // Get all job IDs for this client
        const clientJobs = await db.select({ id: jobs.id })
          .from(jobs)
          .where(and(
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ));

        const jobIds = clientJobs.map(j => j.id);

        if (jobIds.length === 0) {
          return [];
        }

        const conditions = [
          inArray(submissions.jobId, jobIds),
          eq(submissions.orgId, orgId)
        ];

        if (jobId) {
          conditions.push(eq(submissions.jobId, jobId));
        }

        if (status) {
          conditions.push(eq(submissions.status, status));
        }

        const results = await db.select().from(submissions)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(submissions.submittedToClientAt));

        return results;
      }),

    /**
     * Get submission detail
     */
    getById: orgProtectedProcedure
      .input(z.object({
        submissionId: z.string().uuid(),
        clientId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { submissionId, clientId } = input;

        // Get submission
        const [submission] = await db.select().from(submissions)
          .where(and(
            eq(submissions.id, submissionId),
            eq(submissions.orgId, orgId)
          ))
          .limit(1);

        if (!submission) {
          throw new Error('Submission not found');
        }

        // Verify the job belongs to this client
        const [job] = await db.select().from(jobs)
          .where(and(
            eq(jobs.id, submission.jobId),
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ))
          .limit(1);

        if (!job) {
          throw new Error('Unauthorized to view this submission');
        }

        return submission;
      }),
  }),

  // =====================================================
  // INTERVIEWS
  // =====================================================

  interviews: router({
    /**
     * Get interviews for client's jobs
     */
    list: orgProtectedProcedure
      .input(z.object({
        clientId: z.string().uuid(),
        jobId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        upcoming: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { clientId, jobId, limit, offset, upcoming } = input;

        // Get all job IDs for this client
        const clientJobs = await db.select({ id: jobs.id })
          .from(jobs)
          .where(and(
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ));

        const jobIds = clientJobs.map(j => j.id);

        if (jobIds.length === 0) {
          return [];
        }

        const conditions = [
          inArray(interviews.jobId, jobIds),
          eq(interviews.orgId, orgId)
        ];

        if (jobId) {
          conditions.push(eq(interviews.jobId, jobId));
        }

        if (upcoming) {
          const now = new Date();
          conditions.push(sql`${interviews.scheduledAt} >= ${now}`);
        }

        const results = await db.select().from(interviews)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(interviews.scheduledAt));

        return results;
      }),

    /**
     * Get interview detail
     */
    getById: orgProtectedProcedure
      .input(z.object({
        interviewId: z.string().uuid(),
        clientId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { interviewId, clientId } = input;

        // Get interview
        const [interview] = await db.select().from(interviews)
          .where(and(
            eq(interviews.id, interviewId),
            eq(interviews.orgId, orgId)
          ))
          .limit(1);

        if (!interview) {
          throw new Error('Interview not found');
        }

        // Verify the job belongs to this client
        const [job] = await db.select().from(jobs)
          .where(and(
            eq(jobs.id, interview.jobId),
            eq(jobs.clientId, clientId),
            eq(jobs.orgId, orgId)
          ))
          .limit(1);

        if (!job) {
          throw new Error('Unauthorized to view this interview');
        }

        return interview;
      }),
  }),
});
