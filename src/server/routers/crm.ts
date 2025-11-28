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
  type PointOfContact,
} from '@/lib/db/schema/crm';
// Note: leadTasks has been migrated to the unified activities system
import { userProfiles } from '@/lib/db/schema/user-profiles';
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
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { createActivityLogSchema } from '@/lib/validations/crm';

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
            eq(accounts.status, status)
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
        status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).optional(),
        accountId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { limit, offset, status, accountId } = input;

        let conditions = [eq(leads.orgId, orgId), isNull(leads.deletedAt)];
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
     * Get single lead by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [lead] = await db.select().from(leads)
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId),
            isNull(leads.deletedAt)
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        return lead;
      }),

    /**
     * Get lead statistics for dashboard
     */
    getStats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const allLeads = await db.select().from(leads)
          .where(and(eq(leads.orgId, orgId), isNull(leads.deletedAt)));

        return {
          total: allLeads.length,
          new: allLeads.filter(l => l.status === 'new').length,
          warm: allLeads.filter(l => l.status === 'warm').length,
          hot: allLeads.filter(l => l.status === 'hot').length,
          cold: allLeads.filter(l => l.status === 'cold').length,
          converted: allLeads.filter(l => l.status === 'converted').length,
          lost: allLeads.filter(l => l.status === 'lost').length,
          totalValue: allLeads.reduce((sum, l) => sum + (parseFloat(l.estimatedValue || '0')), 0),
        };
      }),

    /**
     * Create new lead
     */
    create: orgProtectedProcedure
      .input(createLeadSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get user profile ID for createdBy (FK references user_profiles.id, not auth.users.id)
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        const [newLead] = await db.insert(leads).values({
          ...input,
          orgId,
          ownerId: profileId || undefined,
          createdBy: profileId,
          // Explicitly set BANT defaults to avoid schema sync issues
          bantBudget: 0,
          bantAuthority: 0,
          bantNeed: 0,
          bantTimeline: 0,
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
          .set({
            ...data,
            updatedAt: new Date(),
          })
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
     * Update lead status (for quick status changes)
     */
    updateStatus: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']),
        lostReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // IMPORTANT: userId from context is auth.users.id, but FK columns reference user_profiles.id
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        const updateData: Record<string, any> = {
          status: input.status,
          updatedAt: new Date(),
        };

        if (input.status === 'lost' && input.lostReason) {
          updateData.lostReason = input.lostReason;
        }

        const [updated] = await db.update(leads)
          .set(updateData)
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Lead not found or unauthorized');
        }

        // Log the status change as an activity (only if we have a valid profile ID)
        if (profileId) {
          await db.insert(activityLog).values({
            orgId,
            entityType: 'lead',
            entityId: input.id,
            activityType: 'note',
            subject: `Status changed to ${input.status}`,
            body: input.lostReason ? `Reason: ${input.lostReason}` : undefined,
            performedBy: profileId,
            activityDate: new Date(),
          });
        }

        return updated;
      }),

    /**
     * Convert lead to deal
     */
    convertToDeal: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        dealTitle: z.string().min(1),
        dealValue: z.number().min(0),
        stage: z.enum(['discovery', 'proposal', 'negotiation']).default('discovery'),
        expectedCloseDate: z.date().optional(),
        createAccount: z.boolean().default(false),
        accountName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // IMPORTANT: userId from context is auth.users.id, but FK columns reference user_profiles.id
        // We need to lookup the profile ID
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        if (!userProfile) {
          throw new Error('User profile not found');
        }
        const profileId = userProfile.id;

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

        let accountId = lead.accountId;

        // Create account if requested
        if (input.createAccount && !accountId) {
          const [newAccount] = await db.insert(accounts).values({
            orgId,
            name: input.accountName || lead.companyName || 'New Account',
            industry: lead.industry,
            companyType: lead.companyType,
            status: 'active',
            tier: lead.tier,
            website: lead.website,
            headquartersLocation: lead.headquarters,
            createdBy: profileId,
          }).returning();
          accountId = newAccount.id;
        }

        // Create deal from lead
        const [newDeal] = await db.insert(deals).values({
          orgId,
          title: input.dealTitle,
          value: input.dealValue.toString(),
          stage: input.stage,
          expectedCloseDate: input.expectedCloseDate,
          accountId,
          leadId: lead.id,
          ownerId: lead.ownerId || profileId,
          createdBy: profileId,
        }).returning();

        // Update lead status to converted
        await db.update(leads)
          .set({
            status: 'converted',
            convertedToDealId: newDeal.id,
            convertedToAccountId: accountId,
            convertedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(leads.id, input.leadId));

        // Log the conversion as an activity
        await db.insert(activityLog).values({
          orgId,
          entityType: 'lead',
          entityId: input.leadId,
          activityType: 'note',
          subject: 'Lead converted to deal',
          body: `Deal: ${input.dealTitle}, Value: $${input.dealValue}`,
          performedBy: profileId,
          activityDate: new Date(),
        });

        return { deal: newDeal, accountId };
      }),

    /**
     * Soft delete a lead
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const [deleted] = await db.update(leads)
          .set({
            deletedAt: new Date(),
          })
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId)
          ))
          .returning();

        if (!deleted) {
          throw new Error('Lead not found or unauthorized');
        }

        return { success: true };
      }),

    /**
     * Update BANT scores for a lead
     */
    updateBANT: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        bantBudget: z.number().min(0).max(25),
        bantAuthority: z.number().min(0).max(25),
        bantNeed: z.number().min(0).max(25),
        bantTimeline: z.number().min(0).max(25),
        bantBudgetNotes: z.string().optional(),
        bantAuthorityNotes: z.string().optional(),
        bantNeedNotes: z.string().optional(),
        bantTimelineNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [updated] = await db.update(leads)
          .set({
            bantBudget: input.bantBudget,
            bantAuthority: input.bantAuthority,
            bantNeed: input.bantNeed,
            bantTimeline: input.bantTimeline,
            bantBudgetNotes: input.bantBudgetNotes,
            bantAuthorityNotes: input.bantAuthorityNotes,
            bantNeedNotes: input.bantNeedNotes,
            bantTimelineNotes: input.bantTimelineNotes,
            updatedAt: new Date(),
          })
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId)
          ))
          .returning();

        if (!updated) {
          throw new Error('Lead not found or unauthorized');
        }

        return updated;
      }),
  }),

  // =====================================================
  // LEAD TASKS - DEPRECATED
  // Migrated to unified activities system.
  // Use the activities router instead (activities.create with activityType: 'task')
  // =====================================================

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
          totalValue: sql<number>`sum(${deals.value})::int`,
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
        entityType: z.enum(['account', 'lead', 'deal', 'poc', 'submission', 'candidate']),
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
        entityType: z.enum(['account', 'lead', 'deal', 'poc', 'submission', 'candidate']),
        entityId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'linkedin_message']),
        subject: z.string().optional(),
        body: z.string().optional(),
        direction: z.enum(['inbound', 'outbound']).optional(),
        activityDate: z.date().optional(),
        durationMinutes: z.number().int().min(0).max(480).optional(),
        outcome: z.enum(['positive', 'neutral', 'negative']).optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get user profile ID for performedBy (FK references user_profiles.id, not auth.users.id)
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const [newActivity] = await db.insert(activityLog).values({
          ...input,
          orgId,
          performedBy: userProfile?.id,
          activityDate: input.activityDate || new Date(),
        }).returning();

        // Update lastContactedAt on the entity if it's a lead
        if (input.entityType === 'lead') {
          await db.update(leads)
            .set({ lastContactedAt: new Date() })
            .where(eq(leads.id, input.entityId));
        }

        return newActivity;
      }),
  }),
});
