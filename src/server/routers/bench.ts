/**
 * tRPC Router: Bench Sales Module
 * Handles bench consultants, external job scraping, submissions, hotlist, immigration
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  benchMetadata,
  externalJobs,
  jobSources,
  benchSubmissions,
  hotlists,
  immigrationCases
} from '@/lib/db/schema/bench';
import {
  createBenchMetadataSchema,
  updateBenchMetadataSchema,
  createExternalJobSchema,
  updateExternalJobSchema,
  createBenchSubmissionSchema,
  updateBenchSubmissionSchema,
  createImmigrationCaseSchema,
  updateImmigrationCaseSchema
} from '@/lib/validations/bench';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

export const benchRouter = router({
  // =====================================================
  // BENCH METADATA (Consultant Availability)
  // =====================================================

  consultants: router({
    /**
     * Get all bench consultants
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['bench', 'marketing', 'interview_process', 'offer_stage']).optional(),
        minDaysOnBench: z.number().optional(),
        maxDaysOnBench: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, minDaysOnBench, maxDaysOnBench } = input;

        let conditions = [eq(benchMetadata.orgId, orgId)];
        if (status) conditions.push(eq(benchMetadata.benchStatus, status));
        if (minDaysOnBench) conditions.push(gte(benchMetadata.daysOnBench, minDaysOnBench));
        if (maxDaysOnBench) conditions.push(lte(benchMetadata.daysOnBench, maxDaysOnBench));

        const results = await db.select().from(benchMetadata)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(benchMetadata.daysOnBench));

        return results;
      }),

    /**
     * Get consultant by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [consultant] = await db.select().from(benchMetadata)
          .where(and(
            eq(benchMetadata.id, input.id),
            eq(benchMetadata.orgId, orgId)
          ))
          .limit(1);

        if (!consultant) {
          throw new Error('Consultant not found');
        }

        return consultant;
      }),

    /**
     * Create bench metadata
     */
    create: protectedProcedure
      .input(createBenchMetadataSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newConsultant] = await db.insert(benchMetadata).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newConsultant;
      }),

    /**
     * Update bench metadata
     */
    update: protectedProcedure
      .input(updateBenchMetadataSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(benchMetadata)
          .set(data)
          .where(and(
            eq(benchMetadata.id, id),
            eq(benchMetadata.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Consultant not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get bench aging report
     */
    agingReport: protectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const report = await db.select({
          ageRange: sql<string>`
            CASE
              WHEN ${benchMetadata.daysOnBench} < 15 THEN '0-15 days'
              WHEN ${benchMetadata.daysOnBench} < 30 THEN '15-30 days'
              WHEN ${benchMetadata.daysOnBench} < 60 THEN '30-60 days'
              ELSE '60+ days'
            END
          `,
          count: sql<number>`count(*)::int`,
        })
          .from(benchMetadata)
          .where(and(
            eq(benchMetadata.orgId, orgId),
            eq(benchMetadata.benchStatus, 'bench')
          ))
          .groupBy(sql`
            CASE
              WHEN ${benchMetadata.daysOnBench} < 15 THEN '0-15 days'
              WHEN ${benchMetadata.daysOnBench} < 30 THEN '15-30 days'
              WHEN ${benchMetadata.daysOnBench} < 60 THEN '30-60 days'
              ELSE '60+ days'
            END
          `);

        return report;
      }),
  }),

  // =====================================================
  // EXTERNAL JOBS (Job Scraping)
  // =====================================================

  externalJobs: router({
    /**
     * Get all scraped jobs
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sourceId: z.string().uuid().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, sourceId, search } = input;

        let conditions = [eq(externalJobs.orgId, orgId)];
        if (sourceId) conditions.push(eq(externalJobs.sourceId, sourceId));
        if (search) {
          conditions.push(sql`${externalJobs.jobTitle} ILIKE ${`%${search}%`}`);
        }

        const results = await db.select().from(externalJobs)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(externalJobs.scrapedAt));

        return results;
      }),

    /**
     * Create external job
     */
    create: protectedProcedure
      .input(createExternalJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newJob] = await db.insert(externalJobs).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newJob;
      }),

    /**
     * Update external job
     */
    update: protectedProcedure
      .input(updateExternalJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(externalJobs)
          .set(data)
          .where(and(
            eq(externalJobs.id, id),
            eq(externalJobs.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('External job not found or unauthorized');
        }

        return updated;
      }),
  }),

  // =====================================================
  // JOB SOURCES (Scraping Configuration)
  // =====================================================

  sources: router({
    /**
     * Get all job sources
     */
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const results = await db.select().from(jobSources)
          .where(eq(jobSources.orgId, orgId))
          .orderBy(jobSources.sourceName);

        return results;
      }),

    /**
     * Create job source
     */
    create: protectedProcedure
      .input(z.object({
        sourceName: z.string(),
        sourceType: z.enum(['dice', 'indeed', 'linkedin', 'monster', 'ziprecruiter', 'custom']),
        sourceUrl: z.string().url(),
        isActive: z.boolean().default(true),
        scrapingConfig: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newSource] = await db.insert(jobSources).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newSource;
      }),
  }),

  // =====================================================
  // BENCH SUBMISSIONS
  // =====================================================

  submissions: router({
    /**
     * Get all bench submissions
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        consultantId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, consultantId } = input;

        let conditions = [eq(benchSubmissions.orgId, orgId)];
        if (status) conditions.push(eq(benchSubmissions.submissionStatus, status));
        if (consultantId) conditions.push(eq(benchSubmissions.consultantId, consultantId));

        const results = await db.select().from(benchSubmissions)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(benchSubmissions.submittedAt));

        return results;
      }),

    /**
     * Create bench submission
     */
    create: protectedProcedure
      .input(createBenchSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newSubmission] = await db.insert(benchSubmissions).values({
          ...input,
          orgId,
          submittedBy: userId,
        }).returning();

        return newSubmission;
      }),

    /**
     * Update bench submission
     */
    update: protectedProcedure
      .input(updateBenchSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(benchSubmissions)
          .set(data)
          .where(and(
            eq(benchSubmissions.id, id),
            eq(benchSubmissions.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Submission not found or unauthorized');
        }

        return updated;
      }),
  }),

  // =====================================================
  // HOTLIST
  // =====================================================

  hotlist: router({
    /**
     * Get all hotlists
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset } = input;

        const results = await db.select().from(hotlists)
          .where(eq(hotlists.orgId, orgId))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(hotlists.sentAt));

        return results;
      }),

    /**
     * Create hotlist
     */
    create: protectedProcedure
      .input(z.object({
        consultantIds: z.array(z.string().uuid()).min(1),
        recipientEmails: z.array(z.string().email()).min(1),
        subject: z.string(),
        messageBody: z.string(),
        includeResumes: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newHotlist] = await db.insert(hotlists).values({
          ...input,
          orgId,
          sentBy: userId,
          sentAt: new Date(),
        }).returning();

        // TODO: Send email with consultant details

        return newHotlist;
      }),
  }),

  // =====================================================
  // IMMIGRATION CASES
  // =====================================================

  immigration: router({
    /**
     * Get all immigration cases
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['preparation', 'filed', 'rfe_received', 'approved', 'denied', 'withdrawn']).optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, candidateId } = input;

        let conditions = [eq(immigrationCases.orgId, orgId)];
        if (status) conditions.push(eq(immigrationCases.status, status));
        if (candidateId) conditions.push(eq(immigrationCases.candidateId, candidateId));

        const results = await db.select().from(immigrationCases)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(immigrationCases.filedDate));

        return results;
      }),

    /**
     * Get immigration case by ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [immigrationCase] = await db.select().from(immigrationCases)
          .where(and(
            eq(immigrationCases.id, input.id),
            eq(immigrationCases.orgId, orgId)
          ))
          .limit(1);

        if (!immigrationCase) {
          throw new Error('Immigration case not found');
        }

        return immigrationCase;
      }),

    /**
     * Create immigration case
     */
    create: protectedProcedure
      .input(createImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newCase] = await db.insert(immigrationCases).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newCase;
      }),

    /**
     * Update immigration case
     */
    update: protectedProcedure
      .input(updateImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(immigrationCases)
          .set(data)
          .where(and(
            eq(immigrationCases.id, id),
            eq(immigrationCases.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Immigration case not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get immigration case statistics
     */
    statistics: protectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const stats = await db.select({
          status: immigrationCases.status,
          count: sql<number>`count(*)::int`,
          avgDaysElapsed: sql<number>`avg(${immigrationCases.daysElapsed})::int`,
        })
          .from(immigrationCases)
          .where(eq(immigrationCases.orgId, orgId))
          .groupBy(immigrationCases.status);

        return stats;
      }),
  }),
});
