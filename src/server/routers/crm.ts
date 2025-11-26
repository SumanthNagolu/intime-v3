/**
 * tRPC Router: CRM Module
 * Handles accounts, leads, deals, POCs, and activity logs
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  accounts,
  leads,
  deals,
  pointOfContacts,
  activityLog,
  type Account,
  type Lead,
  type Deal,
  type PointOfContact
} from '@/lib/db/schema/crm';
import {
  createAccountSchema,
  updateAccountSchema,
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  baseDealSchema,
  updateDealSchema,
  createPointOfContactSchema,
  updatePointOfContactSchema
} from '@/lib/validations/crm';
import { eq, and, desc, sql } from 'drizzle-orm';

export const crmRouter = router({
  // =====================================================
  // ACCOUNTS
  // =====================================================

  /**
   * Get all accounts for current user's organization
   */
  accounts: router({
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { limit, offset, status, search } = input;

        let query = db.select().from(accounts)
          .where(eq(accounts.orgId, orgId))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(accounts.createdAt));

        // Apply filters
        if (status) {
          query = query.where(and(
            eq(accounts.orgId, orgId),
            eq(accounts.accountStatus, status)
          ));
        }

        if (search) {
          query = query.where(and(
            eq(accounts.orgId, orgId),
            sql`${accounts.name} ILIKE ${`%${search}%`}`
          ));
        }

        const results = await query;
        return results;
      }),

    /**
     * Get single account by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const account = await db.select().from(accounts)
          .where(and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId)
          ))
          .limit(1);

        if (!account.length) {
          throw new Error('Account not found');
        }

        return account[0];
      }),

    /**
     * Create new account
     */
    create: orgProtectedProcedure
      .input(createAccountSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newAccount] = await db.insert(accounts).values({
          ...input,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
        }).returning();

        return newAccount;
      }),

    /**
     * Update account
     */
    update: orgProtectedProcedure
      .input(updateAccountSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updatedAccount] = await db.update(accounts)
          .set(data)
          .where(and(
            eq(accounts.id, id),
            eq(accounts.orgId, orgId)
          ))
          .returning();

        if (!updatedAccount) {
          throw new Error('Account not found or unauthorized');
        }

        return updatedAccount;
      }),

    /**
     * Delete account (soft delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [deleted] = await db.update(accounts)
          .set({
            deletedAt: new Date(),
            deletedBy: userId
          })
          .where(and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId)
          ))
          .returning();

        if (!deleted) {
          throw new Error('Account not found or unauthorized');
        }

        return { success: true };
      }),
  }),

  // =====================================================
  // LEADS
  // =====================================================

  leads: router({
    /**
     * Get all leads
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        accountId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, accountId } = input;

        let conditions = [eq(leads.orgId, orgId)];
        if (status) conditions.push(eq(leads.status, status));
        if (accountId) conditions.push(eq(leads.accountId, accountId));

        const results = await db.select().from(leads)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(leads.createdAt));

        return results;
      }),

    /**
     * Create new lead
     */
    create: orgProtectedProcedure
      .input(createLeadSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newLead] = await db.insert(leads).values({
          ...input,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
        }).returning();

        return newLead;
      }),

    /**
     * Update lead
     */
    update: orgProtectedProcedure
      .input(updateLeadSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(leads)
          .set(data)
          .where(and(
            eq(leads.id, id),
            eq(leads.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Lead not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Convert lead to deal
     */
    convertToDeal: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        dealData: baseDealSchema.partial(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get lead data
        const [lead] = await db.select().from(leads)
          .where(and(
            eq(leads.id, input.leadId),
            eq(leads.orgId, orgId)
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        // Create deal from lead
        const [newDeal] = await db.insert(deals).values({
          ...input.dealData,
          orgId,
          accountId: lead.accountId,
          leadSource: lead.source,
          ownerId: lead.ownerId,
          createdBy: userId,
        }).returning();

        // Update lead status
        await db.update(leads)
          .set({
            status: 'closed_won',
            convertedToDealId: newDeal.id,
            convertedAt: new Date(),
          })
          .where(eq(leads.id, input.leadId));

        return newDeal;
      }),
  }),

  // =====================================================
  // DEALS
  // =====================================================

  deals: router({
    /**
     * Get all deals
     */
    list: orgProtectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        stage: z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        accountId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, stage, accountId } = input;

        let conditions = [eq(deals.orgId, orgId)];
        if (stage) conditions.push(eq(deals.stage, stage));
        if (accountId) conditions.push(eq(deals.accountId, accountId));

        const results = await db.select().from(deals)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(deals.expectedCloseDate));

        return results;
      }),

    /**
     * Get deal by ID with related data
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deal] = await db.select().from(deals)
          .where(and(
            eq(deals.id, input.id),
            eq(deals.orgId, orgId)
          ))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        return deal;
      }),

    /**
     * Create new deal
     */
    create: orgProtectedProcedure
      .input(createDealSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newDeal] = await db.insert(deals).values({
          ...input,
          orgId,
          ownerId: input.ownerId || userId,
          createdBy: userId,
        }).returning();

        return newDeal;
      }),

    /**
     * Update deal
     */
    update: orgProtectedProcedure
      .input(updateDealSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(deals)
          .set(data)
          .where(and(
            eq(deals.id, id),
            eq(deals.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Deal not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get pipeline summary (deals by stage)
     */
    pipelineSummary: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const summary = await db.select({
          stage: deals.stage,
          count: sql<number>`count(*)::int`,
          totalValue: sql<number>`sum(${deals.dealValue})::int`,
        })
          .from(deals)
          .where(and(
            eq(deals.orgId, orgId),
            sql`${deals.stage} NOT IN ('closed_won', 'closed_lost')`
          ))
          .groupBy(deals.stage);

        return summary;
      }),
  }),

  // =====================================================
  // POINTS OF CONTACT (POCs)
  // =====================================================

  pocs: router({
    /**
     * Get all POCs for an account
     */
    list: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { accountId, limit, offset } = input;

        const results = await db.select().from(pointOfContacts)
          .where(and(
            eq(pointOfContacts.accountId, accountId),
            eq(pointOfContacts.orgId, orgId)
          ))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(pointOfContacts.isPrimary));

        return results;
      }),

    /**
     * Create new POC
     */
    create: orgProtectedProcedure
      .input(createPointOfContactSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newPOC] = await db.insert(pointOfContacts).values({
          ...input,
          orgId,
          createdBy: userId,
        }).returning();

        return newPOC;
      }),

    /**
     * Update POC
     */
    update: orgProtectedProcedure
      .input(updatePointOfContactSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(pointOfContacts)
          .set(data)
          .where(and(
            eq(pointOfContacts.id, id),
            eq(pointOfContacts.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('POC not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Delete POC
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.delete(pointOfContacts)
          .where(and(
            eq(pointOfContacts.id, input.id),
            eq(pointOfContacts.orgId, orgId)
          ))
          .returning();

        if (!deleted) {
          throw new Error('POC not found or unauthorized');
        }

        return { success: true };
      }),
  }),

  // =====================================================
  // ACTIVITY LOGS
  // =====================================================

  activities: router({
    /**
     * Get activity log for an entity
     */
    list: orgProtectedProcedure
      .input(z.object({
        entityType: z.enum(['account', 'lead', 'deal', 'poc']),
        entityId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { entityType, entityId, limit, offset } = input;

        const results = await db.select().from(activityLog)
          .where(and(
            eq(activityLog.entityType, entityType),
            eq(activityLog.entityId, entityId),
            eq(activityLog.orgId, orgId)
          ))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(activityLog.activityDate));

        return results;
      }),

    /**
     * Create activity log entry
     */
    create: orgProtectedProcedure
      .input(z.object({
        entityType: z.enum(['account', 'lead', 'deal', 'poc']),
        entityId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'status_change']),
        subject: z.string().min(1).max(500),
        description: z.string().optional(),
        activityDate: z.date().optional(),
        metadata: z.record(z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [newActivity] = await db.insert(activityLog).values({
          ...input,
          orgId,
          performedBy: userId,
          activityDate: input.activityDate || new Date(),
        }).returning();

        return newActivity;
      }),
  }),
});
