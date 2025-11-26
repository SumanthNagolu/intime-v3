/**
 * tRPC Router: TA + HR Modules
 * Handles campaigns, employee metadata, pods, payroll, performance reviews, time attendance, PTO
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  campaigns,
  campaignContacts,
  engagementTracking,
  employeeMetadata,
  pods,
  payrollRuns,
  payrollItems,
  performanceReviews,
  timeAttendance,
  ptoBalances
} from '@/lib/db/schema/ta-hr';
import {
  createCampaignSchema,
  updateCampaignSchema,
  createEmployeeMetadataSchema,
  updateEmployeeMetadataSchema,
  createPodSchema,
  updatePodSchema,
  createPayrollRunSchema,
  createPerformanceReviewSchema,
  updatePerformanceReviewSchema,
  createTimeAttendanceSchema,
  updateTimeAttendanceSchema
} from '@/lib/validations/ta-hr';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

export const taHrRouter = router({
  // =====================================================
  // TALENT ACQUISITION (TA) - CAMPAIGNS
  // =====================================================

  campaigns: router({
    /**
     * Get all campaigns
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status } = input;

        let conditions = [eq(campaigns.orgId, orgId)];
        if (status) conditions.push(eq(campaigns.campaignStatus, status));

        const results = await db.select().from(campaigns)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(campaigns.startDate));

        return results;
      }),

    /**
     * Get campaign by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [campaign] = await db.select().from(campaigns)
          .where(and(
            eq(campaigns.id, input.id),
            eq(campaigns.orgId, orgId)
          ))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        return campaign;
      }),

    /**
     * Create campaign
     */
    create: orgProtectedProcedure
      .input(createCampaignSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newCampaign] = await db.insert(campaigns).values({
          ...input,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
        }).returning();

        return newCampaign;
      }),

    /**
     * Update campaign
     */
    update: orgProtectedProcedure
      .input(updateCampaignSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(campaigns)
          .set(data)
          .where(and(
            eq(campaigns.id, id),
            eq(campaigns.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Campaign not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get campaign metrics
     */
    metrics: orgProtectedProcedure
      .input(z.object({ campaignId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Get contact stats
        const [contactStats] = await db.select({
          totalContacts: sql<number>`count(*)::int`,
          responded: sql<number>`count(*) FILTER (WHERE ${campaignContacts.hasResponded} = true)::int`,
          interested: sql<number>`count(*) FILTER (WHERE ${campaignContacts.responseType} = 'interested')::int`,
        })
          .from(campaignContacts)
          .where(and(
            eq(campaignContacts.campaignId, input.campaignId),
            eq(campaignContacts.orgId, orgId)
          ));

        // Get engagement stats
        const [engagementStats] = await db.select({
          totalEngagements: sql<number>`count(*)::int`,
          emails: sql<number>`count(*) FILTER (WHERE ${engagementTracking.engagementType} = 'email')::int`,
          calls: sql<number>`count(*) FILTER (WHERE ${engagementTracking.engagementType} = 'phone')::int`,
          messages: sql<number>`count(*) FILTER (WHERE ${engagementTracking.engagementType} = 'sms')::int`,
        })
          .from(engagementTracking)
          .where(and(
            eq(engagementTracking.campaignId, input.campaignId),
            eq(engagementTracking.orgId, orgId)
          ));

        return {
          contacts: contactStats,
          engagements: engagementStats,
        };
      }),
  }),

  // =====================================================
  // CAMPAIGN CONTACTS
  // =====================================================

  campaignContacts: router({
    /**
     * Get contacts for a campaign
     */
    list: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['new', 'contacted', 'responded', 'qualified', 'not_interested']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { campaignId, limit, offset, status } = input;

        let conditions = [
          eq(campaignContacts.campaignId, campaignId),
          eq(campaignContacts.orgId, orgId)
        ];
        if (status) conditions.push(eq(campaignContacts.contactStatus, status));

        const results = await db.select().from(campaignContacts)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(campaignContacts.addedAt));

        return results;
      }),

    /**
     * Add contact to campaign
     */
    add: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        prospectId: z.string().uuid(),
        sequencePosition: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newContact] = await db.insert(campaignContacts).values({
          ...input,
          orgId,
          addedBy: userId,
        }).returning();

        return newContact;
      }),

    /**
     * Update contact status
     */
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['new', 'contacted', 'responded', 'qualified', 'not_interested']),
        responseType: z.enum(['interested', 'not_interested', 'maybe', 'do_not_contact']).optional(),
        responseNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, status, responseType, responseNotes } = input;

        const [updated] = await db.update(campaignContacts)
          .set({
            contactStatus: status,
            responseType,
            responseNotes,
            hasResponded: status === 'responded',
            lastContactedAt: new Date(),
          })
          .where(and(
            eq(campaignContacts.id, id),
            eq(campaignContacts.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Contact not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // HR - EMPLOYEE METADATA
  // =====================================================

  employees: router({
    /**
     * Get all employees
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        department: z.string().optional(),
        jobTitle: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, department, jobTitle } = input;

        let conditions = [eq(employeeMetadata.orgId, orgId)];
        if (department) conditions.push(eq(employeeMetadata.department, department));
        if (jobTitle) conditions.push(eq(employeeMetadata.jobTitle, jobTitle));

        const results = await db.select().from(employeeMetadata)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(employeeMetadata.firstName);

        return results;
      }),

    /**
     * Get employee by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [employee] = await db.select().from(employeeMetadata)
          .where(and(
            eq(employeeMetadata.id, input.id),
            eq(employeeMetadata.orgId, orgId)
          ))
          .limit(1);

        if (!employee) {
          throw new Error('Employee not found');
        }

        return employee;
      }),

    /**
     * Create employee
     */
    create: orgProtectedProcedure
      .input(createEmployeeMetadataSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newEmployee] = await db.insert(employeeMetadata).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newEmployee;
      }),

    /**
     * Update employee
     */
    update: orgProtectedProcedure
      .input(updateEmployeeMetadataSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(employeeMetadata)
          .set(data)
          .where(and(
            eq(employeeMetadata.id, id),
            eq(employeeMetadata.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Employee not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get organization chart data
     */
    orgChart: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const employees = await db.select().from(employeeMetadata)
          .where(eq(employeeMetadata.orgId, orgId))
          .orderBy(employeeMetadata.firstName);

        return employees;
      }),
  }),

  // =====================================================
  // PODS (2-Person Teams)
  // =====================================================

  pods: router({
    /**
     * Get all pods
     */
    list: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const results = await db.select().from(pods)
          .where(eq(pods.orgId, orgId))
          .orderBy(pods.podName);

        return results;
      }),

    /**
     * Create pod
     */
    create: orgProtectedProcedure
      .input(createPodSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newPod] = await db.insert(pods).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newPod;
      }),

    /**
     * Update pod
     */
    update: orgProtectedProcedure
      .input(updatePodSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(pods)
          .set(data)
          .where(and(
            eq(pods.id, id),
            eq(pods.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Pod not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get pod performance
     */
    performance: orgProtectedProcedure
      .input(z.object({
        podId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // TODO: Aggregate pod performance metrics
        // - Placements count
        // - Revenue generated
        // - Pipeline value
        // - Time-to-fill

        return {
          podId: input.podId,
          metrics: {
            placements: 0,
            revenue: 0,
            pipelineValue: 0,
            avgTimeToFill: 0,
          },
        };
      }),
  }),

  // =====================================================
  // PAYROLL
  // =====================================================

  payroll: router({
    /**
     * Get all payroll runs
     */
    runs: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'processing', 'approved', 'paid']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status } = input;

        let conditions = [eq(payrollRuns.orgId, orgId)];
        if (status) conditions.push(eq(payrollRuns.status, status));

        const results = await db.select().from(payrollRuns)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(payrollRuns.payPeriodEnd));

        return results;
      }),

    /**
     * Create payroll run
     */
    createRun: orgProtectedProcedure
      .input(createPayrollRunSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newRun] = await db.insert(payrollRuns).values({
          ...input,
          orgId,
          processedBy: userId,
        }).returning();

        return newRun;
      }),

    /**
     * Get payroll items for a run
     */
    items: orgProtectedProcedure
      .input(z.object({ payrollRunId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const results = await db.select().from(payrollItems)
          .where(and(
            eq(payrollItems.payrollRunId, input.payrollRunId),
            eq(payrollItems.orgId, orgId)
          ))
          .orderBy(payrollItems.employeeId);

        return results;
      }),
  }),

  // =====================================================
  // PERFORMANCE REVIEWS
  // =====================================================

  reviews: router({
    /**
     * Get all performance reviews
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        employeeId: z.string().uuid().optional(),
        status: z.enum(['draft', 'scheduled', 'in_progress', 'completed']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, employeeId, status } = input;

        let conditions = [eq(performanceReviews.orgId, orgId)];
        if (employeeId) conditions.push(eq(performanceReviews.employeeId, employeeId));
        if (status) conditions.push(eq(performanceReviews.reviewStatus, status));

        const results = await db.select().from(performanceReviews)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(performanceReviews.reviewDate));

        return results;
      }),

    /**
     * Create performance review
     */
    create: orgProtectedProcedure
      .input(createPerformanceReviewSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newReview] = await db.insert(performanceReviews).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newReview;
      }),

    /**
     * Update performance review
     */
    update: orgProtectedProcedure
      .input(updatePerformanceReviewSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(performanceReviews)
          .set(data)
          .where(and(
            eq(performanceReviews.id, id),
            eq(performanceReviews.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Review not found or unauthorized');
        }

        return updated;
      }),
  }),

  // =====================================================
  // TIME & ATTENDANCE
  // =====================================================

  timeAttendance: router({
    /**
     * Get time records
     */
    list: orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { employeeId, startDate, endDate } = input;

        const results = await db.select().from(timeAttendance)
          .where(and(
            eq(timeAttendance.employeeId, employeeId),
            eq(timeAttendance.orgId, orgId),
            gte(timeAttendance.date, startDate),
            lte(timeAttendance.date, endDate)
          ))
          .orderBy(desc(timeAttendance.date));

        return results;
      }),

    /**
     * Clock in
     */
    clockIn: orgProtectedProcedure
      .input(z.object({
        date: z.date().default(() => new Date()),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [record] = await db.insert(timeAttendance).values({
          employeeId: userId,
          orgId,
          date: input.date,
          clockIn: new Date(),
          notes: input.notes,
        }).returning();

        return record;
      }),

    /**
     * Clock out
     */
    clockOut: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [updated] = await db.update(timeAttendance)
          .set({
            clockOut: new Date(),
            notes: input.notes,
          })
          .where(and(
            eq(timeAttendance.id, input.id),
            eq(timeAttendance.employeeId, userId),
            eq(timeAttendance.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Time record not found');
        }

        return updated;
      }),
  }),

  // =====================================================
  // PTO (Paid Time Off)
  // =====================================================

  pto: router({
    /**
     * Get PTO balance
     */
    balance: orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const employeeId = input.employeeId || userId;

        const [balance] = await db.select().from(ptoBalances)
          .where(and(
            eq(ptoBalances.employeeId, employeeId),
            eq(ptoBalances.orgId, orgId)
          ))
          .limit(1);

        return balance;
      }),

    /**
     * Request PTO
     */
    request: orgProtectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        ptoType: z.enum(['vacation', 'sick', 'personal', 'bereavement']),
        hoursRequested: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // TODO: Create PTO request and deduct from balance

        return { success: true };
      }),
  }),
});
