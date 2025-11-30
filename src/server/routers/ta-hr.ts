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
  submitTimesheetSchema,
  updateTimesheetSchema
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
        if (status) conditions.push(eq(campaigns.status, status));

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

        const { targetResponseRate, startDate, endDate, ...rest } = input;

        const [newCampaign] = await db.insert(campaigns).values({
          ...rest,
          orgId,
          createdBy: userId,
          targetResponseRate: targetResponseRate?.toString(),
          startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
          endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
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
        const { id, targetResponseRate, ownerId, ...data } = input;

        const updateData: Record<string, unknown> = {
          ...data,
        };

        if (targetResponseRate !== undefined) {
          updateData.targetResponseRate = targetResponseRate?.toString();
        }
        if (ownerId !== undefined) {
          updateData.ownerId = ownerId;
        }

        const [updated] = await db.update(campaigns)
          .set(updateData)
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
          responded: sql<number>`count(*) FILTER (WHERE ${campaignContacts.respondedAt} IS NOT NULL)::int`,
          interested: sql<number>`count(*) FILTER (WHERE ${campaignContacts.conversionType} = 'interested')::int`,
        })
          .from(campaignContacts)
          .where(eq(campaignContacts.campaignId, input.campaignId));

        // Get engagement stats
        const [engagementStats] = await db.select({
          totalEngagements: sql<number>`count(*)::int`,
          emails: sql<number>`count(*) FILTER (WHERE ${engagementTracking.eventType} = 'email')::int`,
          calls: sql<number>`count(*) FILTER (WHERE ${engagementTracking.eventType} = 'phone')::int`,
          messages: sql<number>`count(*) FILTER (WHERE ${engagementTracking.eventType} = 'sms')::int`,
        })
          .from(engagementTracking)
          .innerJoin(campaignContacts, eq(engagementTracking.campaignContactId, campaignContacts.id))
          .where(eq(campaignContacts.campaignId, input.campaignId));

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
          eq(campaignContacts.campaignId, campaignId)
        ];
        if (status) conditions.push(eq(campaignContacts.status, status));

        const results = await db.select().from(campaignContacts)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(campaignContacts.createdAt));

        return results;
      }),

    /**
     * Add contact to campaign
     */
    add: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        leadId: z.string().uuid().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const [newContact] = await db.insert(campaignContacts).values({
          ...input,
        }).returning();

        return newContact;
      }),

    /**
     * Update contact status
     */
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['pending', 'sent', 'opened', 'clicked', 'responded', 'converted']),
        responseText: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, status, responseText } = input;

        const updateData: Record<string, unknown> = {
          status,
          updatedAt: new Date(),
        };

        if (status === 'responded' && responseText) {
          updateData.respondedAt = new Date();
          updateData.responseText = responseText;
        }

        const [updated] = await db.update(campaignContacts)
          .set(updateData)
          .where(eq(campaignContacts.id, id))
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
      }))
      .query(async ({ ctx, input }) => {
        const { limit, offset } = input;

        const results = await db.select().from(employeeMetadata)
          .limit(limit)
          .offset(offset)
          .orderBy(employeeMetadata.userId);

        return results;
      }),

    /**
     * Get employee by user ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ userId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const [employee] = await db.select().from(employeeMetadata)
          .where(eq(employeeMetadata.userId, input.userId))
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
        const { bonusTarget, benefitsStartDate, ...rest } = input;

        const [newEmployee] = await db.insert(employeeMetadata).values({
          ...rest,
          bonusTarget: bonusTarget?.toString(),
          benefitsStartDate: benefitsStartDate ? new Date(benefitsStartDate).toISOString().split('T')[0] : undefined,
        }).returning();

        return newEmployee;
      }),

    /**
     * Update employee
     */
    update: orgProtectedProcedure
      .input(updateEmployeeMetadataSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, bonusTarget, benefitsStartDate, ...data } = input;

        const updateData: Record<string, unknown> = {
          ...data,
        };

        if (bonusTarget !== undefined) {
          updateData.bonusTarget = bonusTarget?.toString();
        }
        if (benefitsStartDate !== undefined) {
          updateData.benefitsStartDate = benefitsStartDate ? new Date(benefitsStartDate).toISOString().split('T')[0] : undefined;
        }

        const [updated] = await db.update(employeeMetadata)
          .set(updateData)
          .where(eq(employeeMetadata.userId, userId))
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
        const employees = await db.select().from(employeeMetadata)
          .orderBy(employeeMetadata.userId);

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
          .orderBy(pods.name);

        return results;
      }),

    /**
     * Create pod
     */
    create: orgProtectedProcedure
      .input(createPodSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { formedDate, ...rest } = input;

        const [newPod] = await db.insert(pods).values({
          ...rest,
          orgId,
          createdBy: userId,
          formedDate: formedDate ? new Date(formedDate).toISOString().split('T')[0] : undefined,
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
        const { id, formedDate, dissolvedDate, ...data } = input;

        const [updated] = await db.update(pods)
          .set({
            ...data,
            formedDate: formedDate ? new Date(formedDate).toISOString().split('T')[0] : undefined,
            dissolvedDate: dissolvedDate ? new Date(dissolvedDate).toISOString().split('T')[0] : undefined,
          })
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
          .orderBy(desc(payrollRuns.periodEndDate));

        return results;
      }),

    /**
     * Create payroll run
     */
    createRun: orgProtectedProcedure
      .input(createPayrollRunSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { periodStartDate, periodEndDate, payDate, ...rest } = input;

        const [newRun] = await db.insert(payrollRuns).values({
          ...rest,
          orgId,
          createdBy: userId,
          periodStartDate: new Date(periodStartDate).toISOString().split('T')[0],
          periodEndDate: new Date(periodEndDate).toISOString().split('T')[0],
          payDate: new Date(payDate).toISOString().split('T')[0],
        }).returning();

        return newRun;
      }),

    /**
     * Get payroll items for a run
     */
    items: orgProtectedProcedure
      .input(z.object({ payrollRunId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const results = await db.select().from(payrollItems)
          .where(eq(payrollItems.payrollRunId, input.payrollRunId))
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
        if (status) conditions.push(eq(performanceReviews.status, status));

        const results = await db.select().from(performanceReviews)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(performanceReviews.scheduledDate));

        return results;
      }),

    /**
     * Create performance review
     */
    create: orgProtectedProcedure
      .input(createPerformanceReviewSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { periodStartDate, periodEndDate, scheduledDate, ...rest } = input;

        const [newReview] = await db.insert(performanceReviews).values({
          ...rest,
          orgId,
          periodStartDate: new Date(periodStartDate).toISOString().split('T')[0],
          periodEndDate: new Date(periodEndDate).toISOString().split('T')[0],
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : undefined,
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
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { employeeId, startDate, endDate } = input;

        const results = await db.select().from(timeAttendance)
          .where(and(
            eq(timeAttendance.employeeId, employeeId),
            gte(timeAttendance.date, startDate),
            lte(timeAttendance.date, endDate)
          ))
          .orderBy(desc(timeAttendance.date));

        return results;
      }),

    /**
     * Submit timesheet
     */
    submit: orgProtectedProcedure
      .input(submitTimesheetSchema)
      .mutation(async ({ ctx, input }) => {
        const { date, regularHours, overtimeHours, ptoHours, sickHours, holidayHours, ...rest } = input;

        const [record] = await db.insert(timeAttendance).values({
          ...rest,
          date: new Date(date).toISOString().split('T')[0],
          regularHours: regularHours?.toString(),
          overtimeHours: overtimeHours?.toString(),
          ptoHours: ptoHours?.toString(),
          sickHours: sickHours?.toString(),
          holidayHours: holidayHours?.toString(),
          status: 'submitted',
        }).returning();

        return record;
      }),

    /**
     * Update timesheet
     */
    update: orgProtectedProcedure
      .input(updateTimesheetSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { id, date, regularHours, overtimeHours, ptoHours, sickHours, holidayHours, employeeId, ...data } = input;

        const updateData: Record<string, unknown> = {
          ...data,
        };

        if (date !== undefined) {
          updateData.date = date ? new Date(date).toISOString().split('T')[0] : undefined;
        }
        if (regularHours !== undefined) {
          updateData.regularHours = regularHours?.toString();
        }
        if (overtimeHours !== undefined) {
          updateData.overtimeHours = overtimeHours?.toString();
        }
        if (ptoHours !== undefined) {
          updateData.ptoHours = ptoHours?.toString();
        }
        if (sickHours !== undefined) {
          updateData.sickHours = sickHours?.toString();
        }
        if (holidayHours !== undefined) {
          updateData.holidayHours = holidayHours?.toString();
        }

        // Use employeeId from input or fallback to userId from context
        const targetEmployeeId = employeeId || userId;
        if (!targetEmployeeId) {
          throw new Error('Employee ID is required');
        }

        const [updated] = await db.update(timeAttendance)
          .set(updateData)
          .where(and(
            eq(timeAttendance.id, id),
            eq(timeAttendance.employeeId, targetEmployeeId)
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
        year: z.number().int().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { userId } = ctx;
        const employeeId = input.employeeId || userId;
        const year = input.year || new Date().getFullYear();

        if (!employeeId) {
          throw new Error('Employee ID is required');
        }

        const [balance] = await db.select().from(ptoBalances)
          .where(and(
            eq(ptoBalances.employeeId, employeeId),
            eq(ptoBalances.year, year)
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
