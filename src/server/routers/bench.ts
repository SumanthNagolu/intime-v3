/**
 * tRPC Router: Bench Sales Module
 * Handles bench consultants, external job scraping, submissions, hotlist, immigration
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
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

/**
 * Helper function to convert Date to YYYY-MM-DD string for Drizzle date fields
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const benchRouter = router({
  // =====================================================
  // BENCH METADATA (Consultant Availability)
  // =====================================================

  consultants: router({
    /**
     * Get all bench consultants
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        minDaysOnBench: z.number().optional(),
        maxDaysOnBench: z.number().optional(),
      }))
      .query(async ({ ctx: _ctx, input }) => {
        const { limit, offset, minDaysOnBench, maxDaysOnBench } = input;

        const conditions = [];
        if (minDaysOnBench !== undefined) conditions.push(gte(benchMetadata.daysOnBench, minDaysOnBench));
        if (maxDaysOnBench !== undefined) conditions.push(lte(benchMetadata.daysOnBench, maxDaysOnBench));

        const results = await db.select().from(benchMetadata)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(benchMetadata.daysOnBench));

        return results;
      }),

    /**
     * Get consultant by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ ctx: _ctx, input }) => {
        const [consultant] = await db.select().from(benchMetadata)
          .where(eq(benchMetadata.userId, input.userId))
          .limit(1);

        if (!consultant) {
          throw new Error('Consultant not found');
        }

        return consultant;
      }),

    /**
     * Create bench metadata
     */
    create: orgProtectedProcedure
      .input(createBenchMetadataSchema)
      .mutation(async ({ ctx: _ctx, input }) => {
        const [newConsultant] = await db.insert(benchMetadata).values({
          userId: input.userId,
          benchStartDate: formatDate(input.benchStartDate),
          contactFrequencyDays: input.contactFrequencyDays,
          isResponsive: input.isResponsive,
          responsivenessScore: input.responsivenessScore,
          benchSalesRepId: input.benchSalesRepId,
        }).returning();

        return newConsultant;
      }),

    /**
     * Update bench metadata
     */
    update: orgProtectedProcedure
      .input(updateBenchMetadataSchema)
      .mutation(async ({ ctx: _ctx, input }) => {
        const { userId, ...data } = input;

        const [updated] = await db.update(benchMetadata)
          .set(data)
          .where(eq(benchMetadata.userId, userId))
          .returning();

        if (!updated) {
          throw new Error('Consultant not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get bench aging report
     */
    agingReport: orgProtectedProcedure
      .query(async ({ ctx: _ctx }) => {
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
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, search } = input;

        const conditions = [eq(externalJobs.orgId, orgId)];
        if (search) {
          conditions.push(sql`${externalJobs.title} ILIKE ${`%${search}%`}`);
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
    create: orgProtectedProcedure
      .input(createExternalJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [newJob] = await db.insert(externalJobs).values({
          orgId,
          sourceName: input.sourceName,
          sourceJobId: input.sourceJobId,
          sourceUrl: input.sourceUrl,
          title: input.title,
          description: input.description,
          companyName: input.companyName,
          location: input.location,
          isRemote: input.isRemote,
          rateMin: input.rateMin?.toString(),
          rateMax: input.rateMax?.toString(),
          rateType: input.rateType,
          requiredSkills: input.requiredSkills,
          experienceYearsMin: input.experienceYearsMin,
          visaRequirements: input.visaRequirements,
          scrapedAt: input.scrapedAt,
          expiresAt: input.expiresAt,
        }).returning();

        return newJob;
      }),

    /**
     * Update external job
     */
    update: orgProtectedProcedure
      .input(updateExternalJobSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updateData } = input;

        // Convert validation schema fields to database schema fields
        const data: Partial<typeof externalJobs.$inferInsert> = {};

        if (updateData.title !== undefined) data.title = updateData.title;
        if (updateData.description !== undefined) data.description = updateData.description;
        if (updateData.companyName !== undefined) data.companyName = updateData.companyName;
        if (updateData.location !== undefined) data.location = updateData.location;
        if (updateData.isRemote !== undefined) data.isRemote = updateData.isRemote;
        if (updateData.rateMin !== undefined) data.rateMin = updateData.rateMin.toString();
        if (updateData.rateMax !== undefined) data.rateMax = updateData.rateMax.toString();
        if (updateData.rateType !== undefined) data.rateType = updateData.rateType;
        if (updateData.requiredSkills !== undefined) data.requiredSkills = updateData.requiredSkills;
        if (updateData.experienceYearsMin !== undefined) data.experienceYearsMin = updateData.experienceYearsMin;
        if (updateData.visaRequirements !== undefined) data.visaRequirements = updateData.visaRequirements;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.scrapedAt !== undefined) data.scrapedAt = updateData.scrapedAt;
        if (updateData.expiresAt !== undefined) data.expiresAt = updateData.expiresAt;
        if (updateData.sourceName !== undefined) data.sourceName = updateData.sourceName;
        if (updateData.sourceJobId !== undefined) data.sourceJobId = updateData.sourceJobId;
        if (updateData.sourceUrl !== undefined) data.sourceUrl = updateData.sourceUrl;

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
    list: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const results = await db.select().from(jobSources)
          .where(eq(jobSources.orgId, orgId))
          .orderBy(jobSources.name);

        return results;
      }),

    /**
     * Create job source
     */
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string(),
        sourceType: z.enum(['vendor_portal', 'job_board', 'api', 'email']),
        url: z.string().url().optional(),
        isActive: z.boolean().default(true),
        selectorConfig: z.record(z.any()).optional(),
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
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, candidateId } = input;

        const conditions = [eq(benchSubmissions.orgId, orgId)];
        if (status) conditions.push(eq(benchSubmissions.status, status));
        if (candidateId) conditions.push(eq(benchSubmissions.candidateId, candidateId));

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
    create: orgProtectedProcedure
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
    update: orgProtectedProcedure
      .input(updateBenchSubmissionSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updateData } = input;

        // Convert validation schema fields to database schema fields
        const data: Partial<typeof benchSubmissions.$inferInsert> = {};

        if (updateData.externalJobId !== undefined) data.externalJobId = updateData.externalJobId;
        if (updateData.candidateId !== undefined) data.candidateId = updateData.candidateId;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.vendorName !== undefined) data.vendorName = updateData.vendorName;
        if (updateData.vendorContactName !== undefined) data.vendorContactName = updateData.vendorContactName;
        if (updateData.vendorContactEmail !== undefined) data.vendorContactEmail = updateData.vendorContactEmail;
        if (updateData.vendorSubmissionId !== undefined) data.vendorSubmissionId = updateData.vendorSubmissionId;
        if (updateData.submissionNotes !== undefined) data.submissionNotes = updateData.submissionNotes;
        if (updateData.benchRepId !== undefined) data.benchRepId = updateData.benchRepId;
        if (updateData.submittedAt !== undefined) data.submittedAt = updateData.submittedAt;
        if (updateData.vendorFeedback !== undefined) data.vendorFeedback = updateData.vendorFeedback;
        if (updateData.interviewDate !== undefined) data.interviewDate = updateData.interviewDate;
        if (updateData.interviewFeedback !== undefined) data.interviewFeedback = updateData.interviewFeedback;
        if (updateData.placementBillRate !== undefined) data.placementBillRate = updateData.placementBillRate.toString();
        if (updateData.placementStartDate !== undefined) data.placementStartDate = formatDate(updateData.placementStartDate);
        if (updateData.rejectionReason !== undefined) data.rejectionReason = updateData.rejectionReason;

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
    list: orgProtectedProcedure
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
    create: orgProtectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        candidateIds: z.array(z.string().uuid()).min(1),
        targetAccounts: z.array(z.string().uuid()).optional(),
        targetSkills: z.array(z.string()).optional(),
        targetRoles: z.array(z.string()).optional(),
        sentToEmails: z.array(z.string().email()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newHotlist] = await db.insert(hotlists).values({
          title: input.title,
          description: input.description,
          candidateIds: input.candidateIds,
          candidateCount: input.candidateIds.length,
          targetAccounts: input.targetAccounts,
          targetSkills: input.targetSkills,
          targetRoles: input.targetRoles,
          sentToEmails: input.sentToEmails,
          orgId,
          sentBy: userId,
          sentAt: new Date(),
          status: 'sent',
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
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['preparation', 'filed', 'rfe_received', 'approved', 'denied', 'withdrawn']).optional(),
        candidateId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, candidateId } = input;

        const conditions = [eq(immigrationCases.orgId, orgId)];
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
    getById: orgProtectedProcedure
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
    create: orgProtectedProcedure
      .input(createImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Convert numeric fields to strings for database
        const values: typeof immigrationCases.$inferInsert = {
          candidateId: input.candidateId,
          caseType: input.caseType,
          status: input.status,
          orgId,
          createdBy: userId,
          currentVisaType: input.currentVisaType,
          currentVisaExpiry: input.currentVisaExpiry ? formatDate(input.currentVisaExpiry) : undefined,
          newVisaType: input.newVisaType,
          newVisaStartDate: input.newVisaStartDate ? formatDate(input.newVisaStartDate) : undefined,
          newVisaEndDate: input.newVisaEndDate ? formatDate(input.newVisaEndDate) : undefined,
          petitionNumber: input.petitionNumber,
          filedDate: input.filedDate ? formatDate(input.filedDate) : undefined,
          filingFee: input.filingFee?.toString(),
          attorneyFee: input.attorneyFee?.toString(),
          premiumProcessingFee: input.premiumProcessingFee?.toString(),
          paidBy: input.paidBy,
          attorneyName: input.attorneyName,
          attorneyFirm: input.attorneyFirm,
          attorneyEmail: input.attorneyEmail,
          attorneyPhone: input.attorneyPhone,
          caseManagerId: input.caseManagerId,
          internalNotes: input.internalNotes,
        };

        const [newCase] = await db.insert(immigrationCases).values(values).returning();

        return newCase;
      }),

    /**
     * Update immigration case
     */
    update: orgProtectedProcedure
      .input(updateImmigrationCaseSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updateData } = input;

        // Convert validation schema fields to database schema fields
        const data: Partial<typeof immigrationCases.$inferInsert> = {};

        if (updateData.candidateId !== undefined) data.candidateId = updateData.candidateId;
        if (updateData.caseType !== undefined) data.caseType = updateData.caseType;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.currentVisaType !== undefined) data.currentVisaType = updateData.currentVisaType;
        if (updateData.currentVisaExpiry !== undefined) data.currentVisaExpiry = formatDate(updateData.currentVisaExpiry);
        if (updateData.newVisaType !== undefined) data.newVisaType = updateData.newVisaType;
        if (updateData.newVisaStartDate !== undefined) data.newVisaStartDate = formatDate(updateData.newVisaStartDate);
        if (updateData.newVisaEndDate !== undefined) data.newVisaEndDate = formatDate(updateData.newVisaEndDate);
        if (updateData.petitionNumber !== undefined) data.petitionNumber = updateData.petitionNumber;
        if (updateData.filedDate !== undefined) data.filedDate = formatDate(updateData.filedDate);
        if (updateData.approvedDate !== undefined) data.approvedDate = formatDate(updateData.approvedDate);
        if (updateData.deniedDate !== undefined) data.deniedDate = formatDate(updateData.deniedDate);
        if (updateData.denialReason !== undefined) data.denialReason = updateData.denialReason;
        if (updateData.rfeReceivedDate !== undefined) data.rfeReceivedDate = formatDate(updateData.rfeReceivedDate);
        if (updateData.rfeResponseDueDate !== undefined) data.rfeResponseDueDate = formatDate(updateData.rfeResponseDueDate);
        if (updateData.rfeResponseSubmittedDate !== undefined) data.rfeResponseSubmittedDate = formatDate(updateData.rfeResponseSubmittedDate);
        if (updateData.filingFee !== undefined) data.filingFee = updateData.filingFee.toString();
        if (updateData.attorneyFee !== undefined) data.attorneyFee = updateData.attorneyFee.toString();
        if (updateData.premiumProcessingFee !== undefined) data.premiumProcessingFee = updateData.premiumProcessingFee.toString();
        if (updateData.paidBy !== undefined) data.paidBy = updateData.paidBy;
        if (updateData.petitionDocumentFileId !== undefined) data.petitionDocumentFileId = updateData.petitionDocumentFileId;
        if (updateData.approvalNoticeFileId !== undefined) data.approvalNoticeFileId = updateData.approvalNoticeFileId;
        if (updateData.i797FileId !== undefined) data.i797FileId = updateData.i797FileId;
        if (updateData.nextAction !== undefined) data.nextAction = updateData.nextAction;
        if (updateData.nextActionDate !== undefined) data.nextActionDate = formatDate(updateData.nextActionDate);
        if (updateData.expectedDecisionDate !== undefined) data.expectedDecisionDate = formatDate(updateData.expectedDecisionDate);
        if (updateData.caseManagerId !== undefined) data.caseManagerId = updateData.caseManagerId;
        if (updateData.attorneyName !== undefined) data.attorneyName = updateData.attorneyName;
        if (updateData.attorneyFirm !== undefined) data.attorneyFirm = updateData.attorneyFirm;
        if (updateData.attorneyEmail !== undefined) data.attorneyEmail = updateData.attorneyEmail;
        if (updateData.attorneyPhone !== undefined) data.attorneyPhone = updateData.attorneyPhone;
        if (updateData.internalNotes !== undefined) data.internalNotes = updateData.internalNotes;

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
    statistics: orgProtectedProcedure
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
