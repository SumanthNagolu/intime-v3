/**
 * tRPC Router: Job Orders Module
 * Handles confirmed client orders with full ATS fields
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { jobOrders, contacts, type JobOrder, JobOrderStatus, JobOrderPriority, JobOrderJobType } from '@/lib/db/schema/workspace';
import { accounts } from '@/lib/db/schema/crm';
import { jobs } from '@/lib/db/schema/ats';
import { externalJobs } from '@/lib/db/schema/bench';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, sql, isNull, or, ilike, gte, lte, inArray } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const jobOrderStatusValues = ['pending', 'active', 'on_hold', 'fulfilled', 'cancelled', 'expired'] as const;
const jobOrderPriorityValues = ['low', 'normal', 'high', 'urgent', 'critical'] as const;
const jobTypeValues = ['contract', 'permanent', 'contract_to_hire', 'temp', 'sow'] as const;
const employmentTypeValues = ['w2', '1099', 'corp_to_corp', 'direct_hire'] as const;
const sourceTypeValues = ['requisition', 'external_job', 'direct'] as const;
const rateTypeValues = ['hourly', 'daily', 'weekly', 'monthly', 'annual'] as const;
const remoteTypeValues = ['fully_remote', 'hybrid', 'onsite'] as const;

const createJobOrderSchema = z.object({
  // Source
  sourceType: z.enum(sourceTypeValues).default('direct'),
  sourceJobId: z.string().uuid().optional().nullable(),
  sourceExternalJobId: z.string().uuid().optional().nullable(),

  // Client Association (REQUIRED)
  accountId: z.string().uuid(),
  clientContactId: z.string().uuid().optional().nullable(),

  // Order Details
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),

  // Job Classification
  jobType: z.enum(jobTypeValues).default('contract'),
  employmentType: z.enum(employmentTypeValues).default('w2'),

  // Team/Department
  hiringManagerName: z.string().max(100).optional().nullable(),
  hiringManagerEmail: z.string().email().max(255).optional().nullable(),
  department: z.string().max(100).optional().nullable(),

  // Location
  location: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  country: z.string().max(50).default('USA'),
  zipCode: z.string().max(20).optional().nullable(),
  isRemote: z.boolean().default(false),
  remoteType: z.enum(remoteTypeValues).optional().nullable(),
  hybridDays: z.number().min(0).max(5).optional().nullable(),

  // Rates & Financials
  billRate: z.number().min(0).max(9999999.99),
  billRateMax: z.number().min(0).max(9999999.99).optional().nullable(),
  payRateMin: z.number().min(0).max(9999999.99).optional().nullable(),
  payRateMax: z.number().min(0).max(9999999.99).optional().nullable(),
  markupPercentage: z.number().min(0).max(100).optional().nullable(),
  currency: z.string().max(3).default('USD'),
  rateType: z.enum(rateTypeValues).default('hourly'),

  // Overtime
  overtimeBillRate: z.number().min(0).optional().nullable(),
  overtimePayRate: z.number().min(0).optional().nullable(),
  overtimeExpected: z.boolean().default(false),

  // Fee Structure (for perm)
  placementFeePercentage: z.number().min(0).max(100).optional().nullable(),
  placementFeeFlat: z.number().min(0).optional().nullable(),
  guaranteePeriodDays: z.number().min(0).optional().nullable(),

  // Positions
  positionsCount: z.number().min(1).default(1),

  // Timing
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  durationMonths: z.number().min(1).optional().nullable(),
  extensionPossible: z.boolean().default(true),
  startDateFlexibility: z.string().max(100).optional().nullable(),

  // Priority & Status
  priority: z.enum(jobOrderPriorityValues).default('normal'),
  status: z.enum(jobOrderStatusValues).default('pending'),

  // Qualification Requirements
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  minExperienceYears: z.number().min(0).optional().nullable(),
  maxExperienceYears: z.number().min(0).optional().nullable(),
  educationRequirement: z.string().max(200).optional().nullable(),
  certificationsRequired: z.array(z.string()).optional(),

  // Work Authorization
  visaRequirements: z.array(z.string()).optional(),
  citizenshipRequired: z.boolean().default(false),
  securityClearanceRequired: z.string().max(100).optional().nullable(),

  // Background/Drug
  backgroundCheckRequired: z.boolean().default(true),
  drugScreenRequired: z.boolean().default(false),

  // Interview Process
  interviewProcess: z.string().optional().nullable(),
  interviewRounds: z.number().min(1).optional().nullable(),
  technicalAssessmentRequired: z.boolean().default(false),

  // Submission Requirements
  submissionInstructions: z.string().optional().nullable(),
  submissionFormat: z.string().max(100).optional().nullable(),
  maxSubmissions: z.number().min(1).optional().nullable(),

  // Notes
  internalNotes: z.string().optional().nullable(),
  clientNotes: z.string().optional().nullable(),

  // VMS/MSP
  vmsJobId: z.string().max(100).optional().nullable(),
  vmsName: z.string().max(100).optional().nullable(),
  mspName: z.string().max(100).optional().nullable(),
  vendorTier: z.string().max(50).optional().nullable(),

  // Dates
  targetFillDate: z.string().optional().nullable(),

  // Assignment
  accountableId: z.string().uuid().optional(),
});

const updateJobOrderSchema = createJobOrderSchema.partial().extend({
  id: z.string().uuid(),
  positionsFilled: z.number().min(0).optional(),
  currentSubmissions: z.number().min(0).optional(),
  filledDate: z.string().optional().nullable(),
  closedDate: z.string().optional().nullable(),
  closedReason: z.string().max(200).optional().nullable(),
});

const listJobOrdersSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  status: z.enum(jobOrderStatusValues).optional(),
  statuses: z.array(z.enum(jobOrderStatusValues)).optional(),
  priority: z.enum(jobOrderPriorityValues).optional(),
  accountId: z.string().uuid().optional(),
  accountableId: z.string().uuid().optional(),
  jobType: z.enum(jobTypeValues).optional(),
  isRemote: z.boolean().optional(),
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  minBillRate: z.number().optional(),
  maxBillRate: z.number().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  orderBy: z.enum(['createdAt', 'priority', 'billRate', 'targetFillDate']).default('createdAt'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

// =====================================================
// ROUTER
// =====================================================

export const jobOrdersRouter = router({
  /**
   * List job orders with filtering
   */
  list: orgProtectedProcedure
    .input(listJobOrdersSchema)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const {
        limit,
        offset,
        status,
        statuses,
        priority,
        accountId,
        accountableId,
        jobType,
        isRemote,
        search,
        skills,
        minBillRate,
        maxBillRate,
        startDateFrom,
        startDateTo,
      } = input;

      const conditions = [
        eq(jobOrders.orgId, orgId),
        isNull(jobOrders.deletedAt),
      ];

      if (status) {
        conditions.push(eq(jobOrders.status, status));
      }

      if (statuses && statuses.length > 0) {
        conditions.push(inArray(jobOrders.status, statuses));
      }

      if (priority) {
        conditions.push(eq(jobOrders.priority, priority));
      }

      if (accountId) {
        conditions.push(eq(jobOrders.accountId, accountId));
      }

      if (accountableId) {
        conditions.push(eq(jobOrders.accountableId, accountableId));
      }

      if (jobType) {
        conditions.push(eq(jobOrders.jobType, jobType));
      }

      if (isRemote !== undefined) {
        conditions.push(eq(jobOrders.isRemote, isRemote));
      }

      if (search) {
        conditions.push(
          or(
            ilike(jobOrders.title, `%${search}%`),
            ilike(jobOrders.description, `%${search}%`),
            ilike(jobOrders.orderNumber, `%${search}%`),
            ilike(jobOrders.location, `%${search}%`)
          )!
        );
      }

      if (skills && skills.length > 0) {
        conditions.push(sql`${jobOrders.requiredSkills} && ${skills}`);
      }

      if (minBillRate !== undefined) {
        conditions.push(gte(jobOrders.billRate, minBillRate.toString()));
      }

      if (maxBillRate !== undefined) {
        conditions.push(lte(jobOrders.billRate, maxBillRate.toString()));
      }

      if (startDateFrom) {
        conditions.push(gte(jobOrders.startDate, startDateFrom));
      }

      if (startDateTo) {
        conditions.push(lte(jobOrders.startDate, startDateTo));
      }

      const results = await db
        .select({
          jobOrder: jobOrders,
          account: accounts,
          accountable: userProfiles,
          clientContact: contacts,
        })
        .from(jobOrders)
        .leftJoin(accounts, eq(jobOrders.accountId, accounts.id))
        .leftJoin(userProfiles, eq(jobOrders.accountableId, userProfiles.id))
        .leftJoin(contacts, eq(jobOrders.clientContactId, contacts.id))
        .where(and(...conditions))
        .orderBy(desc(jobOrders.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobOrders)
        .where(and(...conditions));

      return {
        items: results.map(r => ({
          ...r.jobOrder,
          account: r.account,
          accountable: r.accountable,
          clientContact: r.clientContact,
        })),
        total: count,
        limit,
        offset,
      };
    }),

  /**
   * Get single job order by ID
   */
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const result = await db
        .select({
          jobOrder: jobOrders,
          account: accounts,
          accountable: userProfiles,
          clientContact: contacts,
          sourceJob: jobs,
          sourceExternalJob: externalJobs,
        })
        .from(jobOrders)
        .leftJoin(accounts, eq(jobOrders.accountId, accounts.id))
        .leftJoin(userProfiles, eq(jobOrders.accountableId, userProfiles.id))
        .leftJoin(contacts, eq(jobOrders.clientContactId, contacts.id))
        .leftJoin(jobs, eq(jobOrders.sourceJobId, jobs.id))
        .leftJoin(externalJobs, eq(jobOrders.sourceExternalJobId, externalJobs.id))
        .where(
          and(
            eq(jobOrders.id, input.id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .limit(1);

      if (!result.length) {
        throw new Error('Job order not found');
      }

      return {
        ...result[0].jobOrder,
        account: result[0].account,
        accountable: result[0].accountable,
        clientContact: result[0].clientContact,
        sourceJob: result[0].sourceJob,
        sourceExternalJob: result[0].sourceExternalJob,
      };
    }),

  /**
   * Get job order by order number
   */
  getByOrderNumber: orgProtectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const result = await db
        .select()
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.orderNumber, input.orderNumber),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .limit(1);

      if (!result.length) {
        throw new Error('Job order not found');
      }

      return result[0];
    }),

  /**
   * Create new job order
   */
  create: orgProtectedProcedure
    .input(createJobOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Convert numeric values to strings for Drizzle numeric columns
      const insertData: Record<string, unknown> = { ...input };
      if (input.billRate !== undefined) insertData.billRate = input.billRate.toString();
      if (input.billRateMax !== undefined && input.billRateMax !== null) insertData.billRateMax = input.billRateMax.toString();
      if (input.payRateMin !== undefined && input.payRateMin !== null) insertData.payRateMin = input.payRateMin.toString();
      if (input.payRateMax !== undefined && input.payRateMax !== null) insertData.payRateMax = input.payRateMax.toString();
      if (input.markupPercentage !== undefined && input.markupPercentage !== null) insertData.markupPercentage = input.markupPercentage.toString();
      if (input.overtimeBillRate !== undefined && input.overtimeBillRate !== null) insertData.overtimeBillRate = input.overtimeBillRate.toString();
      if (input.overtimePayRate !== undefined && input.overtimePayRate !== null) insertData.overtimePayRate = input.overtimePayRate.toString();
      if (input.placementFeePercentage !== undefined && input.placementFeePercentage !== null) insertData.placementFeePercentage = input.placementFeePercentage.toString();
      if (input.placementFeeFlat !== undefined && input.placementFeeFlat !== null) insertData.placementFeeFlat = input.placementFeeFlat.toString();

      const [newJobOrder] = await db.insert(jobOrders).values({
        ...insertData,
        orgId,
        accountableId: input.accountableId || userId!,
        createdBy: userId!,
      } as any).returning();

      return newJobOrder;
    }),

  /**
   * Create job order from requisition (job)
   */
  createFromRequisition: orgProtectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      billRate: z.number().min(0),
      additionalData: createJobOrderSchema.partial().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get source job
      const [sourceJob] = await db.select()
        .from(jobs)
        .where(
          and(
            eq(jobs.id, input.jobId),
            eq(jobs.orgId, orgId)
          )
        )
        .limit(1);

      if (!sourceJob) {
        throw new Error('Source job not found');
      }

      if (!sourceJob.accountId) {
        throw new Error('Source job must have an associated account');
      }

      const [newJobOrder] = await db.insert(jobOrders).values({
        ...input.additionalData,
        orgId,
        sourceType: 'requisition',
        sourceJobId: sourceJob.id,
        accountId: sourceJob.accountId,
        title: sourceJob.title,
        description: sourceJob.description || undefined,
        jobType: sourceJob.jobType || 'contract',
        location: sourceJob.location || undefined,
        isRemote: sourceJob.isRemote || false,
        hybridDays: sourceJob.hybridDays || undefined,
        billRate: input.billRate.toString(),
        payRateMin: sourceJob.rateMin ? sourceJob.rateMin : undefined,
        payRateMax: sourceJob.rateMax ? sourceJob.rateMax : undefined,
        positionsCount: sourceJob.positionsCount || 1,
        requiredSkills: sourceJob.requiredSkills || undefined,
        niceToHaveSkills: sourceJob.niceToHaveSkills || undefined,
        minExperienceYears: sourceJob.minExperienceYears || undefined,
        maxExperienceYears: sourceJob.maxExperienceYears || undefined,
        visaRequirements: sourceJob.visaRequirements || undefined,
        accountableId: input.additionalData?.accountableId || sourceJob.ownerId || userId!,
        createdBy: userId!,
      } as any).returning();

      return newJobOrder;
    }),

  /**
   * Create job order from external job
   */
  createFromExternalJob: orgProtectedProcedure
    .input(z.object({
      externalJobId: z.string().uuid(),
      accountId: z.string().uuid(),
      billRate: z.number().min(0),
      additionalData: createJobOrderSchema.partial().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get source external job
      const [sourceExtJob] = await db.select()
        .from(externalJobs)
        .where(
          and(
            eq(externalJobs.id, input.externalJobId),
            eq(externalJobs.orgId, orgId)
          )
        )
        .limit(1);

      if (!sourceExtJob) {
        throw new Error('Source external job not found');
      }

      const [newJobOrder] = await db.insert(jobOrders).values({
        ...input.additionalData,
        orgId,
        sourceType: 'external_job',
        sourceExternalJobId: sourceExtJob.id,
        accountId: input.accountId,
        title: sourceExtJob.title,
        description: sourceExtJob.description || undefined,
        location: sourceExtJob.location || undefined,
        isRemote: sourceExtJob.isRemote || false,
        billRate: input.billRate.toString(),
        payRateMin: sourceExtJob.rateMin ? sourceExtJob.rateMin : undefined,
        payRateMax: sourceExtJob.rateMax ? sourceExtJob.rateMax : undefined,
        requiredSkills: sourceExtJob.requiredSkills || undefined,
        minExperienceYears: sourceExtJob.experienceYearsMin || undefined,
        visaRequirements: sourceExtJob.visaRequirements || undefined,
        accountableId: input.additionalData?.accountableId || userId!,
        createdBy: userId!,
      } as any).returning();

      return newJobOrder;
    }),

  /**
   * Update job order
   */
  update: orgProtectedProcedure
    .input(updateJobOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;
      const { id, ...data } = input;

      // Convert numeric values to strings for Drizzle
      const updateData: Record<string, unknown> = { ...data };
      if (data.billRate !== undefined) updateData.billRate = data.billRate.toString();
      if (data.billRateMax !== undefined && data.billRateMax !== null) updateData.billRateMax = data.billRateMax.toString();
      if (data.payRateMin !== undefined && data.payRateMin !== null) updateData.payRateMin = data.payRateMin.toString();
      if (data.payRateMax !== undefined && data.payRateMax !== null) updateData.payRateMax = data.payRateMax.toString();
      if (data.markupPercentage !== undefined && data.markupPercentage !== null) updateData.markupPercentage = data.markupPercentage.toString();
      if (data.overtimeBillRate !== undefined && data.overtimeBillRate !== null) updateData.overtimeBillRate = data.overtimeBillRate.toString();
      if (data.overtimePayRate !== undefined && data.overtimePayRate !== null) updateData.overtimePayRate = data.overtimePayRate.toString();
      if (data.placementFeePercentage !== undefined && data.placementFeePercentage !== null) updateData.placementFeePercentage = data.placementFeePercentage.toString();
      if (data.placementFeeFlat !== undefined && data.placementFeeFlat !== null) updateData.placementFeeFlat = data.placementFeeFlat.toString();

      const [updatedJobOrder] = await db.update(jobOrders)
        .set({
          ...updateData,
          updatedBy: userId!,
        } as any)
        .where(
          and(
            eq(jobOrders.id, id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .returning();

      if (!updatedJobOrder) {
        throw new Error('Job order not found or unauthorized');
      }

      return updatedJobOrder;
    }),

  /**
   * Update job order status
   */
  updateStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(jobOrderStatusValues),
      closedReason: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedBy: userId,
      };

      // Set closed date if status is terminal
      if (['fulfilled', 'cancelled', 'expired'].includes(input.status)) {
        updateData.closedDate = new Date().toISOString().split('T')[0];
        if (input.closedReason) {
          updateData.closedReason = input.closedReason;
        }
      }

      // Set filled date if fulfilled
      if (input.status === 'fulfilled') {
        updateData.filledDate = new Date().toISOString().split('T')[0];
      }

      const [updated] = await db.update(jobOrders)
        .set(updateData)
        .where(
          and(
            eq(jobOrders.id, input.id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Job order not found');
      }

      return updated;
    }),

  /**
   * Increment submission count
   */
  incrementSubmissions: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [updated] = await db.update(jobOrders)
        .set({
          currentSubmissions: sql`COALESCE(${jobOrders.currentSubmissions}, 0) + 1`,
          updatedBy: userId,
        })
        .where(
          and(
            eq(jobOrders.id, input.id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Job order not found');
      }

      return updated;
    }),

  /**
   * Fill a position
   */
  fillPosition: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get current job order
      const [current] = await db.select()
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.id, input.id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .limit(1);

      if (!current) {
        throw new Error('Job order not found');
      }

      const newPositionsFilled = (current.positionsFilled || 0) + 1;
      const isFulfilled = newPositionsFilled >= current.positionsCount;

      const [updated] = await db.update(jobOrders)
        .set({
          positionsFilled: newPositionsFilled,
          status: isFulfilled ? 'fulfilled' : current.status,
          filledDate: isFulfilled ? new Date().toISOString().split('T')[0] : current.filledDate,
          closedDate: isFulfilled ? new Date().toISOString().split('T')[0] : current.closedDate,
          updatedBy: userId,
        })
        .where(eq(jobOrders.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete job order (soft delete)
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [deleted] = await db.update(jobOrders)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
        })
        .where(
          and(
            eq(jobOrders.id, input.id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error('Job order not found or unauthorized');
      }

      return { success: true, id: input.id };
    }),

  /**
   * Get job orders by account
   */
  getByAccount: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      includeInactive: z.boolean().default(false),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const conditions = [
        eq(jobOrders.orgId, orgId),
        eq(jobOrders.accountId, input.accountId),
        isNull(jobOrders.deletedAt),
      ];

      if (!input.includeInactive) {
        conditions.push(inArray(jobOrders.status, ['pending', 'active']));
      }

      const results = await db
        .select()
        .from(jobOrders)
        .where(and(...conditions))
        .orderBy(desc(jobOrders.priority), desc(jobOrders.createdAt))
        .limit(input.limit);

      return results;
    }),

  /**
   * Get dashboard stats
   */
  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, userId } = ctx;

      // Get counts by status
      const statusCounts = await db
        .select({
          status: jobOrders.status,
          count: sql<number>`count(*)::int`,
        })
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )
        )
        .groupBy(jobOrders.status);

      // Get counts by priority for active orders
      const priorityCounts = await db
        .select({
          priority: jobOrders.priority,
          count: sql<number>`count(*)::int`,
        })
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.orgId, orgId),
            eq(jobOrders.status, 'active'),
            isNull(jobOrders.deletedAt)
          )
        )
        .groupBy(jobOrders.priority);

      // My active orders
      const [myActiveOrders] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.orgId, orgId),
            eq(jobOrders.accountableId, userId!),
            eq(jobOrders.status, 'active'),
            isNull(jobOrders.deletedAt)
          )
        );

      return {
        byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s.count])),
        byPriority: Object.fromEntries(priorityCounts.map(p => [p.priority, p.count])),
        myActiveOrders: myActiveOrders.count,
      };
    }),

  /**
   * Search job orders for autocomplete
   */
  search: orgProtectedProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { query, limit } = input;

      const results = await db
        .select({
          id: jobOrders.id,
          orderNumber: jobOrders.orderNumber,
          title: jobOrders.title,
          status: jobOrders.status,
          priority: jobOrders.priority,
          accountId: jobOrders.accountId,
        })
        .from(jobOrders)
        .where(
          and(
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt),
            or(
              ilike(jobOrders.title, `%${query}%`),
              ilike(jobOrders.orderNumber, `%${query}%`)
            )
          )
        )
        .limit(limit);

      return results;
    }),
});

export type JobOrdersRouter = typeof jobOrdersRouter;
