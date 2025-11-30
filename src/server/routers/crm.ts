/**
 * tRPC Router: CRM Module
 * Handles accounts, leads, deals, POCs, and activity logs
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { ownershipProcedure } from '../trpc/middleware';
import { db } from '@/lib/db';
import { ownershipFilterSchema } from '@/lib/validations/ownership';
import { buildOwnershipCondition } from '@/lib/db/queries/ownership-filter';
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
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  baseDealSchema,
  updateDealSchema,
  createPointOfContactSchema,
  updatePointOfContactSchema
} from '@/lib/validations/crm';
import {
  createAccountInput,
  updateAccountInput,
  listAccountsInput,
  bulkAssignAccountsInput,
} from '@/lib/validations/account';
import { eq, and, desc, asc, sql, isNull, ilike, or, inArray, gte, lte } from 'drizzle-orm';
import { createActivityLogSchema } from '@/lib/validations/crm';

export const crmRouter = router({
  // =====================================================
  // ACCOUNTS
  // =====================================================

  /**
   * Get all accounts for current user's organization with pagination, search, and filters
   */
  accounts: router({
    list: ownershipProcedure
      .input(listAccountsInput)
      .query(async ({ ctx, input }) => {
        const { orgId, profileId, isManager, managedUserIds } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions = [
          eq(accounts.orgId, orgId),
          isNull(accounts.deletedAt),
        ];

        // Search across searchable fields
        if (search) {
          conditions.push(
            or(
              ilike(accounts.name, `%${search}%`),
              ilike(accounts.website, `%${search}%`),
              ilike(accounts.headquartersLocation, `%${search}%`),
            )!
          );
        }

        // Apply filters
        if (filters?.status?.length) {
          conditions.push(inArray(accounts.status, filters.status));
        }

        if (filters?.tier?.length) {
          conditions.push(inArray(accounts.tier, filters.tier));
        }

        if (filters?.industry?.length) {
          conditions.push(inArray(accounts.industry, filters.industry));
        }

        if (filters?.companyType?.length) {
          conditions.push(inArray(accounts.companyType, filters.companyType));
        }

        if (filters?.accountManagerId) {
          conditions.push(eq(accounts.accountManagerId, filters.accountManagerId));
        }

        if (filters?.hasContract === true) {
          conditions.push(sql`${accounts.contractStartDate} IS NOT NULL`);
        } else if (filters?.hasContract === false) {
          conditions.push(sql`${accounts.contractStartDate} IS NULL`);
        }

        if (filters?.dateRange?.from) {
          conditions.push(gte(accounts.createdAt, filters.dateRange.from));
        }

        if (filters?.dateRange?.to) {
          conditions.push(lte(accounts.createdAt, filters.dateRange.to));
        }

        // Build sort order
        const sortColumn = sortBy === 'name' ? accounts.name
          : sortBy === 'status' ? accounts.status
          : sortBy === 'tier' ? accounts.tier
          : sortBy === 'annualRevenueTarget' ? accounts.annualRevenueTarget
          : accounts.createdAt;

        const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        // Execute queries in parallel
        const [items, countResult] = await Promise.all([
          db.query.accounts.findMany({
            where: and(...conditions),
            with: {
              accountManager: true,
            },
            orderBy,
            limit: pageSize,
            offset,
          }),
          db.select({ count: sql<number>`count(*)::int` })
            .from(accounts)
            .where(and(...conditions)),
        ]);

        const total = countResult[0]?.count ?? 0;

        return {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }),

    /**
     * Get single account by ID with relations
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const account = await db.query.accounts.findFirst({
          where: and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
          ),
          with: {
            accountManager: true,
            pointOfContacts: true,
            deals: true,
            leads: true,
          },
        });

        if (!account) {
          throw new Error('Account not found');
        }

        return account;
      }),

    /**
     * Get account metrics/statistics
     */
    getMetrics: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const allAccounts = await db.select().from(accounts)
          .where(and(
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
          ));

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return {
          byStatus: {
            prospect: allAccounts.filter(a => a.status === 'prospect').length,
            active: allAccounts.filter(a => a.status === 'active').length,
            inactive: allAccounts.filter(a => a.status === 'inactive').length,
            churned: allAccounts.filter(a => a.status === 'churned').length,
          },
          byTier: {
            enterprise: allAccounts.filter(a => a.tier === 'enterprise').length,
            mid_market: allAccounts.filter(a => a.tier === 'mid_market').length,
            smb: allAccounts.filter(a => a.tier === 'smb').length,
            strategic: allAccounts.filter(a => a.tier === 'strategic').length,
            unassigned: allAccounts.filter(a => !a.tier).length,
          },
          totalRevenueTarget: allAccounts.reduce(
            (sum, a) => sum + (parseFloat(a.annualRevenueTarget || '0')), 0
          ),
          activeRevenueTarget: allAccounts
            .filter(a => a.status === 'active')
            .reduce((sum, a) => sum + (parseFloat(a.annualRevenueTarget || '0')), 0),
          total: allAccounts.length,
          withActiveContract: allAccounts.filter(a =>
            a.contractStartDate && a.contractEndDate && a.contractEndDate > now
          ).length,
          contractsExpiringSoon: allAccounts.filter(a =>
            a.contractEndDate && a.contractEndDate > now && a.contractEndDate <= thirtyDaysFromNow
          ).length,
        };
      }),

    /**
     * Create new account
     */
    create: orgProtectedProcedure
      .input(createAccountInput)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get user profile ID for createdBy
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        const [newAccount] = await db.insert(accounts).values({
          ...input,
          // Convert numeric values to strings for database
          markupPercentage: input.markupPercentage?.toString(),
          annualRevenueTarget: input.annualRevenueTarget?.toString(),
          orgId,
          accountManagerId: input.accountManagerId || profileId,
          createdBy: profileId,
        }).returning();

        // Log activity
        if (profileId) {
          await db.insert(activityLog).values({
            orgId,
            entityType: 'account',
            entityId: newAccount.id,
            activityType: 'note',
            subject: 'Account created',
            performedBy: profileId,
            activityDate: new Date(),
          });
        }

        return newAccount;
      }),

    /**
     * Update account
     */
    update: orgProtectedProcedure
      .input(updateAccountInput)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, data } = input;

        // Get user profile ID for updatedBy
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        // Prepare update data, converting numeric values
        const updateData: Record<string, unknown> = {
          ...data,
          updatedAt: new Date(),
          updatedBy: profileId,
        };

        if (data.markupPercentage !== undefined) {
          updateData.markupPercentage = data.markupPercentage?.toString();
        }

        if (data.annualRevenueTarget !== undefined) {
          updateData.annualRevenueTarget = data.annualRevenueTarget?.toString();
        }

        const [updatedAccount] = await db.update(accounts)
          .set(updateData)
          .where(and(
            eq(accounts.id, id),
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
          ))
          .returning();

        if (!updatedAccount) {
          throw new Error('Account not found or unauthorized');
        }

        return updatedAccount;
      }),

    /**
     * Bulk assign accounts to an account manager
     */
    bulkAssign: orgProtectedProcedure
      .input(bulkAssignAccountsInput)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { accountIds, accountManagerId } = input;

        // Get user profile ID for updatedBy
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        // Update all specified accounts
        const results = await db.update(accounts)
          .set({
            accountManagerId,
            updatedAt: new Date(),
            updatedBy: profileId,
          })
          .where(and(
            inArray(accounts.id, accountIds),
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
          ))
          .returning({ id: accounts.id });

        return {
          success: true,
          updatedCount: results.length,
          updatedIds: results.map(r => r.id),
        };
      }),

    /**
     * Delete account (soft delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Get user profile ID for updatedBy
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;

        const [deleted] = await db.update(accounts)
          .set({
            deletedAt: new Date(),
            updatedBy: profileId,
          })
          .where(and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
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
     * Get all leads with optional ownership filtering
     */
    list: ownershipProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).optional(),
        accountId: z.string().uuid().optional(),
        ownership: ownershipFilterSchema.optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, profileId, isManager, managedUserIds } = ctx;
        const { limit, offset, status, accountId, ownership } = input;

        let conditions = [eq(leads.orgId, orgId), isNull(leads.deletedAt)];
        if (status) conditions.push(eq(leads.status, status));
        if (accountId) conditions.push(eq(leads.accountId, accountId));

        // Apply ownership filter if specified
        if (ownership) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId, isManager, managedUserIds },
            'lead',
            leads,
            ownership
          );
          conditions.push(ownershipCondition);
        }

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
     * Get all deals with optional ownership filtering
     */
    list: ownershipProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        stage: z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        accountId: z.string().uuid().optional(),
        ownership: ownershipFilterSchema.optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId, profileId, isManager, managedUserIds } = ctx;
        const { limit, offset, stage, accountId, ownership } = input;

        let conditions = [eq(deals.orgId, orgId)];
        if (stage) conditions.push(eq(deals.stage, stage));
        if (accountId) conditions.push(eq(deals.accountId, accountId));

        // Apply ownership filter if specified
        if (ownership) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId, isManager, managedUserIds },
            'deal',
            deals,
            ownership
          );
          conditions.push(ownershipCondition);
        }

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

        // Get user profile ID for ownerId (FK references user_profiles.id, not auth.users.id)
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        const profileId = userProfile?.id;
        if (!profileId) {
          throw new Error('User profile not found');
        }

        const [newDeal] = await db.insert(deals).values({
          ...input,
          // Convert numeric value to string for database
          value: String(input.value ?? 0),
          orgId,
          ownerId: input.ownerId || profileId,
          createdBy: profileId,
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

    /**
     * Get deal statistics for dashboard
     */
    getStats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const allDeals = await db.select().from(deals)
          .where(and(eq(deals.orgId, orgId), isNull(deals.deletedAt)));

        const activeStages = ['discovery', 'qualification', 'proposal', 'negotiation'];
        const activeDeals = allDeals.filter(d => activeStages.includes(d.stage));
        const wonDeals = allDeals.filter(d => d.stage === 'closed_won');
        const lostDeals = allDeals.filter(d => d.stage === 'closed_lost');

        return {
          total: allDeals.length,
          discovery: allDeals.filter(d => d.stage === 'discovery').length,
          qualification: allDeals.filter(d => d.stage === 'qualification').length,
          proposal: allDeals.filter(d => d.stage === 'proposal').length,
          negotiation: allDeals.filter(d => d.stage === 'negotiation').length,
          won: wonDeals.length,
          lost: lostDeals.length,
          active: activeDeals.length,
          pipelineValue: activeDeals.reduce((sum, d) => sum + (parseFloat(d.value || '0')), 0),
          wonValue: wonDeals.reduce((sum, d) => sum + (parseFloat(d.value || '0')), 0),
        };
      }),
  }),

  // =====================================================
  // POINTS OF CONTACT (POCs)
  // =====================================================

  pocs: router({
    /**
     * Get all POCs for an account
     * Security: Verifies account belongs to user's org through the account relationship
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

        // First verify the account belongs to the user's org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, accountId),
            eq(accounts.orgId, orgId)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found or unauthorized');
        }

        const results = await db.select().from(pointOfContacts)
          .where(eq(pointOfContacts.accountId, accountId))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(pointOfContacts.isPrimary));

        return results;
      }),

    /**
     * Create new POC
     * Security: Verifies account belongs to user's org before creating
     */
    create: orgProtectedProcedure
      .input(createPointOfContactSchema)
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Verify the account belongs to the user's org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found or unauthorized');
        }

        // Get user profile ID from auth ID (userId is auth_id, not profile id)
        const [userProfile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId))
          .limit(1);

        if (!userProfile) {
          throw new Error('User profile not found');
        }

        const [newPOC] = await db.insert(pointOfContacts).values({
          ...input,
          createdBy: userProfile.id,
        }).returning();

        return newPOC;
      }),

    /**
     * Update POC
     * Security: Verifies POC's account belongs to user's org before updating
     */
    update: orgProtectedProcedure
      .input(updatePointOfContactSchema)
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...data } = input;

        // Get the POC and verify its account belongs to user's org
        const [poc] = await db.select({
          id: pointOfContacts.id,
          accountId: pointOfContacts.accountId
        })
          .from(pointOfContacts)
          .where(eq(pointOfContacts.id, id))
          .limit(1);

        if (!poc) {
          throw new Error('POC not found');
        }

        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, poc.accountId),
            eq(accounts.orgId, orgId)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Unauthorized');
        }

        const [updated] = await db.update(pointOfContacts)
          .set(data)
          .where(eq(pointOfContacts.id, id))
          .returning();

        if (!updated) {
          throw new Error('POC not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Delete POC
     * Security: Verifies POC's account belongs to user's org before deleting
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Get the POC and verify its account belongs to user's org
        const [poc] = await db.select({
          id: pointOfContacts.id,
          accountId: pointOfContacts.accountId
        })
          .from(pointOfContacts)
          .where(eq(pointOfContacts.id, input.id))
          .limit(1);

        if (!poc) {
          throw new Error('POC not found');
        }

        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, poc.accountId),
            eq(accounts.orgId, orgId)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Unauthorized');
        }

        const [deleted] = await db.delete(pointOfContacts)
          .where(eq(pointOfContacts.id, input.id))
          .returning();

        if (!deleted) {
          throw new Error('POC not found');
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
