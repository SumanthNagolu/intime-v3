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
  accountAddresses,
  accountContracts,
  accountPreferences,
  accountMetrics,
  accountTeam,
  leads,
  leadTouchpoints,
  leadQualification,
  deals,
  dealStagesHistory,
  dealStakeholders,
  dealCompetitors,
  dealProducts,
  crmContacts,
  crmCampaigns,
  crmCampaignTargets,
  crmCampaignContent,
  crmCampaignMetrics,
  activityLog,
} from '@/lib/db/schema/crm';
// Note: leadTasks has been migrated to the unified activities system
import { userProfiles } from '@/lib/db/schema/user-profiles';
import {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
} from '@/lib/validations/crm';
import {
  createAccountInput,
  updateAccountInput,
  listAccountsInput,
  bulkAssignAccountsInput,
} from '@/lib/validations/account';
import { eq, and, desc, asc, sql, isNull, ilike, or, inArray, gte, lte, type SQL } from 'drizzle-orm';

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
        const { orgId } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions = [
          eq(accounts.orgId, orgId!),
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
        // Note: Using select query instead of relational query to avoid lateral join issues
        const [items, countResult] = await Promise.all([
          db.select({
            id: accounts.id,
            orgId: accounts.orgId,
            name: accounts.name,
            industry: accounts.industry,
            companyType: accounts.companyType,
            status: accounts.status,
            tier: accounts.tier,
            accountManagerId: accounts.accountManagerId,
            responsiveness: accounts.responsiveness,
            preferredQuality: accounts.preferredQuality,
            description: accounts.description,
            contractStartDate: accounts.contractStartDate,
            contractEndDate: accounts.contractEndDate,
            paymentTermsDays: accounts.paymentTermsDays,
            markupPercentage: accounts.markupPercentage,
            annualRevenueTarget: accounts.annualRevenueTarget,
            website: accounts.website,
            headquartersLocation: accounts.headquartersLocation,
            phone: accounts.phone,
            createdAt: accounts.createdAt,
            updatedAt: accounts.updatedAt,
            createdBy: accounts.createdBy,
            updatedBy: accounts.updatedBy,
            deletedAt: accounts.deletedAt,
            // Account manager info (flattened)
            accountManagerName: userProfiles.fullName,
            accountManagerEmail: userProfiles.email,
          })
            .from(accounts)
            .leftJoin(userProfiles, eq(accounts.accountManagerId, userProfiles.id))
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset),
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
        try {
        const { orgId } = ctx;

        // Fetch account with account manager using explicit join
        const accountResults = await db.select({
          id: accounts.id,
          orgId: accounts.orgId,
          name: accounts.name,
          industry: accounts.industry,
          companyType: accounts.companyType,
          status: accounts.status,
          tier: accounts.tier,
          accountManagerId: accounts.accountManagerId,
          responsiveness: accounts.responsiveness,
          preferredQuality: accounts.preferredQuality,
          description: accounts.description,
          contractStartDate: accounts.contractStartDate,
          contractEndDate: accounts.contractEndDate,
          paymentTermsDays: accounts.paymentTermsDays,
          markupPercentage: accounts.markupPercentage,
          annualRevenueTarget: accounts.annualRevenueTarget,
          website: accounts.website,
          headquartersLocation: accounts.headquartersLocation,
          phone: accounts.phone,
          createdAt: accounts.createdAt,
          updatedAt: accounts.updatedAt,
          createdBy: accounts.createdBy,
          updatedBy: accounts.updatedBy,
          deletedAt: accounts.deletedAt,
        })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        const account = accountResults[0];

        if (!account) {
          throw new Error('Account not found');
        }

        // Fetch related data in parallel
        const [accountManagerResult, contactsResult, dealsResult, leadsResult] = await Promise.all([
          // Account manager
          account.accountManagerId
            ? db.select().from(userProfiles).where(eq(userProfiles.id, account.accountManagerId)).limit(1)
            : Promise.resolve([]),
          // Contacts linked to this account
          db.select().from(crmContacts).where(
            and(
              eq(crmContacts.companyId, input.id),
              isNull(crmContacts.deletedAt),
            )
          ),
          // Deals
          db.select().from(deals).where(
            and(
              eq(deals.accountId, input.id),
              isNull(deals.deletedAt),
            )
          ),
          // Leads
          db.select().from(leads).where(
            and(
              eq(leads.accountId, input.id),
              isNull(leads.deletedAt),
            )
          ),
        ]);

        return {
          ...account,
          accountManager: accountManagerResult[0] || null,
          contacts: contactsResult,
          deals: dealsResult,
          leads: leadsResult,
        };
        } catch (error) {
          console.error('getById error:', error);
          throw error;
        }
      }),

    /**
     * Get account statistics (aggregate metrics across all accounts)
     */
    getStats: orgProtectedProcedure
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const [newAccount] = await db.insert(accounts).values({
          ...input,
          // Convert numeric values to strings for database
          markupPercentage: input.markupPercentage?.toString() ?? null,
          annualRevenueTarget: input.annualRevenueTarget?.toString() ?? null,
          orgId: orgId!,
          accountManagerId: input.accountManagerId || profileId || null,
          createdBy: profileId ?? null,
        }).returning();

        // Log activity
        if (profileId) {
          await db.insert(activityLog).values({
            orgId: orgId!,
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        // Prepare update data, converting numeric values
        const updateData: Partial<typeof accounts.$inferInsert> = {
          updatedAt: new Date(),
          updatedBy: profileId ?? null,
        };

        // Manually copy fields to ensure proper type conversion
        if (data.name !== undefined) updateData.name = data.name;
        if (data.industry !== undefined) updateData.industry = data.industry ?? null;
        if (data.companyType !== undefined) updateData.companyType = data.companyType ?? null;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.tier !== undefined) updateData.tier = data.tier ?? null;
        if (data.accountManagerId !== undefined) updateData.accountManagerId = data.accountManagerId ?? null;
        if (data.responsiveness !== undefined) updateData.responsiveness = data.responsiveness ?? null;
        if (data.preferredQuality !== undefined) updateData.preferredQuality = data.preferredQuality ?? null;
        if (data.description !== undefined) updateData.description = data.description ?? null;
        if (data.contractStartDate !== undefined) updateData.contractStartDate = data.contractStartDate ?? null;
        if (data.contractEndDate !== undefined) updateData.contractEndDate = data.contractEndDate ?? null;
        if (data.paymentTermsDays !== undefined) updateData.paymentTermsDays = data.paymentTermsDays ?? null;
        if (data.website !== undefined) updateData.website = data.website ?? null;
        if (data.headquartersLocation !== undefined) updateData.headquartersLocation = data.headquartersLocation ?? null;
        if (data.phone !== undefined) updateData.phone = data.phone ?? null;

        // Convert numeric values to strings for database
        if (data.markupPercentage !== undefined) {
          updateData.markupPercentage = data.markupPercentage !== undefined && data.markupPercentage !== null
            ? data.markupPercentage.toString()
            : null;
        }

        if (data.annualRevenueTarget !== undefined) {
          updateData.annualRevenueTarget = data.annualRevenueTarget !== undefined && data.annualRevenueTarget !== null
            ? data.annualRevenueTarget.toString()
            : null;
        }

        const [updatedAccount] = await db.update(accounts)
          .set(updateData)
          .where(and(
            eq(accounts.id, id),
            eq(accounts.orgId, orgId!),
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        // Update all specified accounts
        const results = await db.update(accounts)
          .set({
            accountManagerId,
            updatedAt: new Date(),
            updatedBy: profileId ?? null,
          })
          .where(and(
            inArray(accounts.id, accountIds),
            eq(accounts.orgId, orgId!),
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const [deleted] = await db.update(accounts)
          .set({
            deletedAt: new Date(),
            updatedBy: profileId ?? null,
          })
          .where(and(
            eq(accounts.id, input.id),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Account not found or unauthorized');
        }

        return { success: true };
      }),

    /**
     * Get account addresses
     */
    getAddresses: orgProtectedProcedure
      .input(z.object({ accountId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify account exists and belongs to org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found');
        }

        const addresses = await db.select()
          .from(accountAddresses)
          .where(eq(accountAddresses.accountId, input.accountId))
          .orderBy(desc(accountAddresses.isPrimary), asc(accountAddresses.addressType));

        return addresses;
      }),

    /**
     * Get account contracts
     */
    getContracts: orgProtectedProcedure
      .input(z.object({ accountId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify account exists and belongs to org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found');
        }

        const contracts = await db.select()
          .from(accountContracts)
          .where(eq(accountContracts.accountId, input.accountId))
          .orderBy(desc(accountContracts.startDate));

        return contracts;
      }),

    /**
     * Get account team members
     */
    getTeam: orgProtectedProcedure
      .input(z.object({ accountId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify account exists and belongs to org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found');
        }

        const team = await db.select({
          id: accountTeam.id,
          accountId: accountTeam.accountId,
          userId: accountTeam.userId,
          role: accountTeam.role,
          isPrimary: accountTeam.isPrimary,
          isActive: accountTeam.isActive,
          assignedAt: accountTeam.assignedAt,
          notes: accountTeam.notes,
          userName: userProfiles.fullName,
          userEmail: userProfiles.email,
        })
          .from(accountTeam)
          .leftJoin(userProfiles, eq(accountTeam.userId, userProfiles.id))
          .where(and(
            eq(accountTeam.accountId, input.accountId),
            eq(accountTeam.isActive, true),
          ))
          .orderBy(desc(accountTeam.isPrimary), asc(accountTeam.role));

        return team;
      }),

    /**
     * Get account preferences
     */
    getPreferences: orgProtectedProcedure
      .input(z.object({ accountId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify account exists and belongs to org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found');
        }

        const [preferences] = await db.select()
          .from(accountPreferences)
          .where(eq(accountPreferences.accountId, input.accountId))
          .limit(1);

        return preferences ?? null;
      }),

    /**
     * Get account metrics (most recent)
     */
    getMetrics: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        period: z.string().optional(), // YYYY-MM format
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify account exists and belongs to org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, input.accountId),
            eq(accounts.orgId, orgId!),
            isNull(accounts.deletedAt),
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found');
        }

        const conditions = [eq(accountMetrics.accountId, input.accountId)];
        if (input.period) {
          conditions.push(eq(accountMetrics.period, input.period));
        }

        const metrics = await db.select()
          .from(accountMetrics)
          .where(and(...conditions))
          .orderBy(desc(accountMetrics.period))
          .limit(12); // Last 12 periods

        return metrics;
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

        const conditions = [eq(leads.orgId, orgId!), isNull(leads.deletedAt)];
        if (status) conditions.push(eq(leads.status, status));
        if (accountId) conditions.push(eq(leads.accountId, accountId));

        // Apply ownership filter if specified
        if (ownership && profileId) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId: orgId!, isManager: isManager ?? false, managedUserIds: managedUserIds ?? [] },
            'lead',
            { id: leads.id as unknown as SQL<unknown>, ownerId: leads.ownerId as unknown as SQL<unknown> },
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
            eq(leads.orgId, orgId!),
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
          .where(and(eq(leads.orgId, orgId!), isNull(leads.deletedAt)));

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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const [newLead] = await db.insert(leads).values({
          ...input,
          // Convert numeric estimatedValue to string if present
          estimatedValue: input.estimatedValue !== undefined && input.estimatedValue !== null
            ? input.estimatedValue.toString()
            : null,
          orgId: orgId!,
          ownerId: profileId ?? null,
          createdBy: profileId ?? null,
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
        const { orgId } = ctx;
        const { id, ...data } = input;

        const updateData: Partial<typeof leads.$inferInsert> = {
          updatedAt: new Date(),
        };

        // Manually copy fields to ensure proper type conversion
        Object.keys(data).forEach((key) => {
          const value = data[key as keyof typeof data];
          if (key === 'estimatedValue' && value !== undefined) {
            // Convert number to string for database
            updateData.estimatedValue = value !== null ? String(value) : null;
          } else if (key !== 'id') {
            // Copy other fields directly
            updateData[key as keyof typeof updateData] = value as never;
          }
        });

        const [updated] = await db.update(leads)
          .set(updateData)
          .where(and(
            eq(leads.id, id),
            eq(leads.orgId, orgId!)
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const updateData: Partial<typeof leads.$inferInsert> = {
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
            eq(leads.orgId, orgId!)
          ))
          .returning();

        if (!updated) {
          throw new Error('Lead not found or unauthorized');
        }

        // Log the status change as an activity (only if we have a valid profile ID)
        if (profileId) {
          await db.insert(activityLog).values({
            orgId: orgId!,
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        if (!userProfileResult[0]) {
          throw new Error('User profile not found');
        }
        const profileId = userProfileResult[0].id;

        // Get lead data
        const [lead] = await db.select().from(leads)
          .where(and(
            eq(leads.id, input.leadId),
            eq(leads.orgId, orgId!)
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        let accountId = lead.accountId;

        // Create account if requested
        if (input.createAccount && !accountId) {
          const [newAccount] = await db.insert(accounts).values({
            orgId: orgId!,
            name: input.accountName || lead.companyName || 'New Account',
            industry: lead.industry ?? null,
            companyType: lead.companyType ?? 'direct_client',
            status: 'active',
            tier: lead.tier ?? null,
            website: lead.website ?? null,
            headquartersLocation: lead.headquarters ?? null,
            createdBy: profileId,
          }).returning();
          accountId = newAccount.id;
        }

        // Create deal from lead
        const [newDeal] = await db.insert(deals).values({
          orgId: orgId!,
          title: input.dealTitle,
          value: input.dealValue.toString(),
          stage: input.stage,
          expectedCloseDate: input.expectedCloseDate ?? null,
          accountId: accountId ?? null,
          leadId: lead.id,
          ownerId: lead.ownerId || profileId,
          createdBy: profileId,
        }).returning();

        // Update lead status to converted
        await db.update(leads)
          .set({
            status: 'converted',
            convertedToDealId: newDeal.id,
            convertedToAccountId: accountId ?? null,
            convertedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(leads.id, input.leadId));

        // Log the conversion as an activity
        await db.insert(activityLog).values({
          orgId: orgId!,
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
        const { orgId } = ctx;

        const [deleted] = await db.update(leads)
          .set({
            deletedAt: new Date(),
          })
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId!)
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
            bantBudgetNotes: input.bantBudgetNotes ?? null,
            bantAuthorityNotes: input.bantAuthorityNotes ?? null,
            bantNeedNotes: input.bantNeedNotes ?? null,
            bantTimelineNotes: input.bantTimelineNotes ?? null,
            updatedAt: new Date(),
          })
          .where(and(
            eq(leads.id, input.id),
            eq(leads.orgId, orgId!)
          ))
          .returning();

        if (!updated) {
          throw new Error('Lead not found or unauthorized');
        }

        return updated;
      }),

    /**
     * Get lead touchpoints
     */
    getTouchpoints: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify lead exists and belongs to org
        const [lead] = await db.select({ id: leads.id })
          .from(leads)
          .where(and(
            eq(leads.id, input.leadId),
            eq(leads.orgId, orgId!),
            isNull(leads.deletedAt),
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        const touchpoints = await db.select({
          id: leadTouchpoints.id,
          leadId: leadTouchpoints.leadId,
          touchpointType: leadTouchpoints.touchpointType,
          direction: leadTouchpoints.direction,
          subject: leadTouchpoints.subject,
          notes: leadTouchpoints.notes,
          outcome: leadTouchpoints.outcome,
          nextSteps: leadTouchpoints.nextSteps,
          nextFollowUpDate: leadTouchpoints.nextFollowUpDate,
          durationMinutes: leadTouchpoints.durationMinutes,
          touchpointDate: leadTouchpoints.touchpointDate,
          createdAt: leadTouchpoints.createdAt,
          createdByName: userProfiles.fullName,
        })
          .from(leadTouchpoints)
          .leftJoin(userProfiles, eq(leadTouchpoints.createdBy, userProfiles.id))
          .where(eq(leadTouchpoints.leadId, input.leadId))
          .orderBy(desc(leadTouchpoints.touchpointDate))
          .limit(input.limit)
          .offset(input.offset);

        return touchpoints;
      }),

    /**
     * Create a lead touchpoint
     */
    createTouchpoint: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        touchpointType: z.enum(['call', 'email', 'meeting', 'linkedin', 'text', 'event']),
        direction: z.enum(['inbound', 'outbound']).default('outbound'),
        subject: z.string().optional(),
        notes: z.string().optional(),
        outcome: z.enum(['positive', 'neutral', 'negative', 'no_response']).optional(),
        nextSteps: z.string().optional(),
        nextFollowUpDate: z.date().optional(),
        durationMinutes: z.number().min(0).optional(),
        touchpointDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Verify lead exists and belongs to org
        const [lead] = await db.select({ id: leads.id })
          .from(leads)
          .where(and(
            eq(leads.id, input.leadId),
            eq(leads.orgId, orgId!),
            isNull(leads.deletedAt),
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        // Get user profile ID
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const [touchpoint] = await db.insert(leadTouchpoints).values({
          leadId: input.leadId,
          touchpointType: input.touchpointType,
          direction: input.direction,
          subject: input.subject ?? null,
          notes: input.notes ?? null,
          outcome: input.outcome ?? null,
          nextSteps: input.nextSteps ?? null,
          nextFollowUpDate: input.nextFollowUpDate ?? null,
          durationMinutes: input.durationMinutes ?? null,
          touchpointDate: input.touchpointDate ?? new Date(),
          createdBy: profileId ?? null,
        }).returning();

        // Update lead's lastContactedAt
        await db.update(leads)
          .set({ lastContactedAt: touchpoint.touchpointDate, updatedAt: new Date() })
          .where(eq(leads.id, input.leadId));

        return touchpoint;
      }),

    /**
     * Get lead qualification details
     */
    getQualification: orgProtectedProcedure
      .input(z.object({ leadId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify lead exists and belongs to org
        const [lead] = await db.select({ id: leads.id })
          .from(leads)
          .where(and(
            eq(leads.id, input.leadId),
            eq(leads.orgId, orgId!),
            isNull(leads.deletedAt),
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        const [qualification] = await db.select()
          .from(leadQualification)
          .where(eq(leadQualification.leadId, input.leadId))
          .limit(1);

        return qualification ?? null;
      }),

    /**
     * Update lead qualification
     */
    updateQualification: orgProtectedProcedure
      .input(z.object({
        leadId: z.string().uuid(),
        // Budget
        hasBudget: z.boolean().optional(),
        budgetAmount: z.number().optional(),
        budgetTimeframe: z.enum(['this_quarter', 'next_quarter', 'this_year', 'next_year']).optional(),
        budgetNotes: z.string().optional(),
        // Authority
        decisionMaker: z.enum(['yes', 'no', 'partial', 'unknown']).optional(),
        decisionProcess: z.string().optional(),
        otherStakeholders: z.string().optional(),
        authorityNotes: z.string().optional(),
        // Need
        needIdentified: z.boolean().optional(),
        needUrgency: z.enum(['critical', 'high', 'medium', 'low']).optional(),
        painPoints: z.array(z.string()).optional(),
        currentSolution: z.string().optional(),
        needNotes: z.string().optional(),
        // Timeline
        timeline: z.enum(['immediate', '30_days', '90_days', '6_months', '12_months', 'unknown']).optional(),
        decisionDate: z.date().optional(),
        projectStartDate: z.date().optional(),
        timelineNotes: z.string().optional(),
        // Status
        qualificationStatus: z.enum(['pending', 'qualified', 'disqualified']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { leadId, ...qualificationData } = input;

        // Verify lead exists and belongs to org
        const [lead] = await db.select({ id: leads.id })
          .from(leads)
          .where(and(
            eq(leads.id, leadId),
            eq(leads.orgId, orgId!),
            isNull(leads.deletedAt),
          ))
          .limit(1);

        if (!lead) {
          throw new Error('Lead not found');
        }

        // Get user profile ID
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        // Check if qualification exists
        const [existing] = await db.select({ id: leadQualification.id })
          .from(leadQualification)
          .where(eq(leadQualification.leadId, leadId))
          .limit(1);

        if (existing) {
          // Update existing
          const [updated] = await db.update(leadQualification)
            .set({
              ...qualificationData,
              budgetAmount: qualificationData.budgetAmount?.toString() ?? undefined,
              updatedAt: new Date(),
              qualifiedAt: qualificationData.qualificationStatus === 'qualified' ? new Date() : undefined,
              qualifiedBy: qualificationData.qualificationStatus === 'qualified' ? profileId : undefined,
            })
            .where(eq(leadQualification.id, existing.id))
            .returning();

          return updated;
        } else {
          // Create new
          const [created] = await db.insert(leadQualification).values({
            leadId,
            ...qualificationData,
            budgetAmount: qualificationData.budgetAmount?.toString() ?? null,
            qualifiedAt: qualificationData.qualificationStatus === 'qualified' ? new Date() : null,
            qualifiedBy: qualificationData.qualificationStatus === 'qualified' ? profileId : null,
          }).returning();

          return created;
        }
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

        const conditions = [eq(deals.orgId, orgId!)];
        if (stage) conditions.push(eq(deals.stage, stage));
        if (accountId) conditions.push(eq(deals.accountId, accountId));

        // Apply ownership filter if specified
        if (ownership && profileId) {
          const ownershipCondition = await buildOwnershipCondition(
            { userId: profileId, orgId: orgId!, isManager: isManager ?? false, managedUserIds: managedUserIds ?? [] },
            'deal',
            { id: deals.id as unknown as SQL<unknown>, ownerId: deals.ownerId as unknown as SQL<unknown> },
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
            eq(deals.orgId, orgId!)
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;
        if (!profileId) {
          throw new Error('User profile not found');
        }

        const [newDeal] = await db.insert(deals).values({
          ...input,
          // Convert numeric value to string for database
          value: String(input.value ?? 0),
          orgId: orgId!,
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
        const { orgId } = ctx;
        const { id, ...data } = input;

        // Prepare update data with proper type handling
        const updateData: Partial<typeof deals.$inferInsert> = {
          ...data,
          // Convert value if it's a number to string
          value: data.value !== undefined ? String(data.value) : undefined,
        };

        const [updated] = await db.update(deals)
          .set(updateData)
          .where(and(
            eq(deals.id, id),
            eq(deals.orgId, orgId!)
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
            eq(deals.orgId, orgId!),
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
          .where(and(eq(deals.orgId, orgId!), isNull(deals.deletedAt)));

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

    /**
     * Get all deals with full pagination, search, and filters
     */
    listAll: orgProtectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
        sortBy: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
        filters: z.object({
          stage: z.array(z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])).optional(),
          dealType: z.array(z.enum(['new_business', 'expansion', 'renewal', 'upsell'])).optional(),
          accountId: z.string().uuid().optional(),
          ownerId: z.string().uuid().optional(),
          minValue: z.number().optional(),
          maxValue: z.number().optional(),
          expectedCloseFrom: z.date().optional(),
          expectedCloseTo: z.date().optional(),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        const conditions: SQL[] = [
          eq(deals.orgId, orgId!),
          isNull(deals.deletedAt),
        ];

        // Search
        if (search) {
          conditions.push(
            or(
              ilike(deals.title, `%${search}%`),
              ilike(deals.description, `%${search}%`),
            )!
          );
        }

        // Apply filters
        if (filters?.stage?.length) {
          conditions.push(inArray(deals.stage, filters.stage));
        }

        if (filters?.dealType?.length) {
          conditions.push(inArray(deals.dealType, filters.dealType));
        }

        if (filters?.accountId) {
          conditions.push(eq(deals.accountId, filters.accountId));
        }

        if (filters?.ownerId) {
          conditions.push(eq(deals.ownerId, filters.ownerId));
        }

        if (filters?.minValue !== undefined) {
          conditions.push(sql`${deals.value}::numeric >= ${filters.minValue}`);
        }

        if (filters?.maxValue !== undefined) {
          conditions.push(sql`${deals.value}::numeric <= ${filters.maxValue}`);
        }

        if (filters?.expectedCloseFrom) {
          conditions.push(gte(deals.expectedCloseDate, filters.expectedCloseFrom));
        }

        if (filters?.expectedCloseTo) {
          conditions.push(lte(deals.expectedCloseDate, filters.expectedCloseTo));
        }

        // Build sort order
        const sortColumn = sortBy === 'title' ? deals.title
          : sortBy === 'value' ? deals.value
          : sortBy === 'stage' ? deals.stage
          : sortBy === 'expectedCloseDate' ? deals.expectedCloseDate
          : deals.createdAt;

        const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const [items, countResult] = await Promise.all([
          db.select({
            id: deals.id,
            title: deals.title,
            description: deals.description,
            dealType: deals.dealType,
            value: deals.value,
            currency: deals.currency,
            stage: deals.stage,
            probability: deals.probability,
            expectedCloseDate: deals.expectedCloseDate,
            actualCloseDate: deals.actualCloseDate,
            accountId: deals.accountId,
            leadId: deals.leadId,
            ownerId: deals.ownerId,
            closeReason: deals.closeReason,
            lossReason: deals.lossReason,
            competitorWon: deals.competitorWon,
            notes: deals.notes,
            createdAt: deals.createdAt,
            updatedAt: deals.updatedAt,
            accountName: accounts.name,
            ownerName: userProfiles.fullName,
          })
            .from(deals)
            .leftJoin(accounts, eq(deals.accountId, accounts.id))
            .leftJoin(userProfiles, eq(deals.ownerId, userProfiles.id))
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset),
          db.select({ count: sql<number>`count(*)::int` })
            .from(deals)
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
     * Update deal stage with history logging
     */
    updateStage: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        stage: z.enum(['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
        reason: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        // Get current deal
        const [currentDeal] = await db.select().from(deals)
          .where(and(
            eq(deals.id, input.id),
            eq(deals.orgId, orgId!),
          ))
          .limit(1);

        if (!currentDeal) {
          throw new Error('Deal not found');
        }

        const previousStage = currentDeal.stage;

        // Update deal stage
        const [updatedDeal] = await db.update(deals)
          .set({
            stage: input.stage,
            probability: input.stage === 'closed_won' ? 100 : input.stage === 'closed_lost' ? 0 : currentDeal.probability,
            actualCloseDate: ['closed_won', 'closed_lost'].includes(input.stage) ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(deals.id, input.id))
          .returning();

        // Log stage change in history
        await db.insert(dealStagesHistory).values({
          dealId: input.id,
          stage: input.stage,
          previousStage,
          notes: input.notes,
          reason: input.reason,
          changedBy: profileId,
        });

        return updatedDeal;
      }),

    /**
     * Get deal stage history
     */
    getStageHistory: orgProtectedProcedure
      .input(z.object({ dealId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, input.dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const history = await db.select({
          id: dealStagesHistory.id,
          stage: dealStagesHistory.stage,
          previousStage: dealStagesHistory.previousStage,
          enteredAt: dealStagesHistory.enteredAt,
          exitedAt: dealStagesHistory.exitedAt,
          durationDays: dealStagesHistory.durationDays,
          notes: dealStagesHistory.notes,
          reason: dealStagesHistory.reason,
          changedByName: userProfiles.fullName,
        })
          .from(dealStagesHistory)
          .leftJoin(userProfiles, eq(dealStagesHistory.changedBy, userProfiles.id))
          .where(eq(dealStagesHistory.dealId, input.dealId))
          .orderBy(desc(dealStagesHistory.enteredAt));

        return history;
      }),

    /**
     * Get deal stakeholders
     */
    getStakeholders: orgProtectedProcedure
      .input(z.object({ dealId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, input.dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const stakeholders = await db.select({
          id: dealStakeholders.id,
          dealId: dealStakeholders.dealId,
          contactId: dealStakeholders.contactId,
          name: dealStakeholders.name,
          title: dealStakeholders.title,
          email: dealStakeholders.email,
          role: dealStakeholders.role,
          influenceLevel: dealStakeholders.influenceLevel,
          sentiment: dealStakeholders.sentiment,
          engagementNotes: dealStakeholders.engagementNotes,
          isActive: dealStakeholders.isActive,
          isPrimary: dealStakeholders.isPrimary,
          createdAt: dealStakeholders.createdAt,
          // Contact info if linked
          contactFirstName: crmContacts.firstName,
          contactLastName: crmContacts.lastName,
          contactEmail: crmContacts.email,
          contactTitle: crmContacts.title,
        })
          .from(dealStakeholders)
          .leftJoin(crmContacts, eq(dealStakeholders.contactId, crmContacts.id))
          .where(eq(dealStakeholders.dealId, input.dealId))
          .orderBy(desc(dealStakeholders.isPrimary), asc(dealStakeholders.createdAt));

        return stakeholders;
      }),

    /**
     * Add stakeholder to deal
     */
    addStakeholder: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        contactId: z.string().uuid().optional(),
        name: z.string().optional(),
        title: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['decision_maker', 'influencer', 'champion', 'blocker', 'gatekeeper', 'end_user']),
        influenceLevel: z.enum(['high', 'medium', 'low']).optional(),
        sentiment: z.enum(['positive', 'neutral', 'negative', 'unknown']).optional(),
        isPrimary: z.boolean().default(false),
        engagementNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { dealId, ...stakeholderData } = input;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const [newStakeholder] = await db.insert(dealStakeholders).values({
          dealId,
          ...stakeholderData,
        }).returning();

        return newStakeholder;
      }),

    /**
     * Remove stakeholder from deal
     */
    removeStakeholder: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        stakeholderId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, input.dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        await db.delete(dealStakeholders)
          .where(and(
            eq(dealStakeholders.id, input.stakeholderId),
            eq(dealStakeholders.dealId, input.dealId),
          ));

        return { success: true };
      }),

    /**
     * Get deal competitors
     */
    getCompetitors: orgProtectedProcedure
      .input(z.object({ dealId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, input.dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const competitors = await db.select()
          .from(dealCompetitors)
          .where(eq(dealCompetitors.dealId, input.dealId))
          .orderBy(desc(dealCompetitors.threatLevel), asc(dealCompetitors.competitorName));

        return competitors;
      }),

    /**
     * Add competitor to deal
     */
    addCompetitor: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        competitorName: z.string(),
        competitorWebsite: z.string().optional(),
        strengths: z.string().optional(),
        weaknesses: z.string().optional(),
        ourDifferentiators: z.string().optional(),
        pricing: z.string().optional(),
        threatLevel: z.enum(['high', 'medium', 'low']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { dealId, ...competitorData } = input;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const [newCompetitor] = await db.insert(dealCompetitors).values({
          dealId,
          ...competitorData,
        }).returning();

        return newCompetitor;
      }),

    /**
     * Get deal products/services
     */
    getProducts: orgProtectedProcedure
      .input(z.object({ dealId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, input.dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        const products = await db.select()
          .from(dealProducts)
          .where(eq(dealProducts.dealId, input.dealId))
          .orderBy(asc(dealProducts.createdAt));

        return products;
      }),

    /**
     * Add product to deal
     */
    addProduct: orgProtectedProcedure
      .input(z.object({
        dealId: z.string().uuid(),
        productType: z.enum(['staffing', 'training', 'consulting', 'recruitment', 'subscription']),
        productName: z.string().optional(),
        description: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
        unitPrice: z.number().optional(),
        discount: z.number().min(0).max(100).optional(),
        durationMonths: z.number().int().min(1).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { dealId, ...productData } = input;

        // Verify deal belongs to org
        const [deal] = await db.select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, dealId), eq(deals.orgId, orgId!)))
          .limit(1);

        if (!deal) {
          throw new Error('Deal not found');
        }

        // Calculate total value
        const unitPrice = productData.unitPrice ?? 0;
        const quantity = productData.quantity ?? 1;
        const discountPercent = productData.discount ?? 0;
        const totalValue = (unitPrice * quantity) * (1 - discountPercent / 100);

        const [newProduct] = await db.insert(dealProducts).values({
          dealId,
          ...productData,
          unitPrice: productData.unitPrice?.toString(),
          discount: productData.discount?.toString(),
          totalValue: totalValue.toString(),
        }).returning();

        return newProduct;
      }),

    /**
     * Soft delete a deal
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [deleted] = await db.update(deals)
          .set({
            deletedAt: new Date(),
          })
          .where(and(
            eq(deals.id, input.id),
            eq(deals.orgId, orgId!)
          ))
          .returning();

        if (!deleted) {
          throw new Error('Deal not found or unauthorized');
        }

        return { success: true };
      }),
  }),

  // =====================================================
  // CONTACTS (Account POCs via crm_contacts)
  // =====================================================

  contacts: router({
    /**
     * Get all contacts for an account (account-scoped)
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

        // Verify the account belongs to the user's org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, accountId),
            eq(accounts.orgId, orgId!)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found or unauthorized');
        }

        const results = await db.select().from(crmContacts)
          .where(and(
            eq(crmContacts.companyId, accountId),
            isNull(crmContacts.deletedAt),
          ))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(crmContacts.createdAt));

        return results;
      }),

    /**
     * Get all contacts (global, not account-scoped) with pagination, search, and filters
     */
    listAll: orgProtectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
        sortBy: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
        filters: z.object({
          contactType: z.array(z.enum(['client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general'])).optional(),
          status: z.array(z.enum(['active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed'])).optional(),
          companyId: z.string().uuid().optional(),
          ownerId: z.string().uuid().optional(),
          decisionAuthority: z.array(z.enum(['final_decision_maker', 'key_influencer', 'gatekeeper', 'recommender', 'end_user'])).optional(),
          hasEmail: z.boolean().optional(),
          dateRange: z.object({
            from: z.date().optional(),
            to: z.date().optional(),
          }).optional(),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions: SQL[] = [
          eq(crmContacts.orgId, orgId!),
          isNull(crmContacts.deletedAt),
        ];

        // Search across searchable fields
        if (search) {
          conditions.push(
            or(
              ilike(crmContacts.firstName, `%${search}%`),
              ilike(crmContacts.lastName, `%${search}%`),
              ilike(crmContacts.email, `%${search}%`),
              ilike(crmContacts.companyName, `%${search}%`),
              ilike(crmContacts.title, `%${search}%`),
            )!
          );
        }

        // Apply filters
        if (filters?.contactType?.length) {
          conditions.push(inArray(crmContacts.contactType, filters.contactType));
        }

        if (filters?.status?.length) {
          conditions.push(inArray(crmContacts.status, filters.status));
        }

        if (filters?.companyId) {
          conditions.push(eq(crmContacts.companyId, filters.companyId));
        }

        if (filters?.ownerId) {
          conditions.push(eq(crmContacts.ownerId, filters.ownerId));
        }

        if (filters?.decisionAuthority?.length) {
          conditions.push(inArray(crmContacts.decisionAuthority, filters.decisionAuthority));
        }

        if (filters?.hasEmail === true) {
          conditions.push(sql`${crmContacts.email} IS NOT NULL AND ${crmContacts.email} != ''`);
        } else if (filters?.hasEmail === false) {
          conditions.push(sql`${crmContacts.email} IS NULL OR ${crmContacts.email} = ''`);
        }

        if (filters?.dateRange?.from) {
          conditions.push(gte(crmContacts.createdAt, filters.dateRange.from));
        }

        if (filters?.dateRange?.to) {
          conditions.push(lte(crmContacts.createdAt, filters.dateRange.to));
        }

        // Build sort order
        const sortColumn = sortBy === 'firstName' ? crmContacts.firstName
          : sortBy === 'lastName' ? crmContacts.lastName
          : sortBy === 'email' ? crmContacts.email
          : sortBy === 'companyName' ? crmContacts.companyName
          : sortBy === 'status' ? crmContacts.status
          : sortBy === 'contactType' ? crmContacts.contactType
          : sortBy === 'lastContactedAt' ? crmContacts.lastContactedAt
          : sortBy === 'engagementScore' ? crmContacts.engagementScore
          : crmContacts.createdAt;

        const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        // Execute queries in parallel
        const [items, countResult] = await Promise.all([
          db.select({
            id: crmContacts.id,
            orgId: crmContacts.orgId,
            contactType: crmContacts.contactType,
            firstName: crmContacts.firstName,
            lastName: crmContacts.lastName,
            email: crmContacts.email,
            phone: crmContacts.phone,
            mobile: crmContacts.mobile,
            linkedinUrl: crmContacts.linkedinUrl,
            avatarUrl: crmContacts.avatarUrl,
            title: crmContacts.title,
            companyName: crmContacts.companyName,
            companyId: crmContacts.companyId,
            department: crmContacts.department,
            workLocation: crmContacts.workLocation,
            timezone: crmContacts.timezone,
            preferredContactMethod: crmContacts.preferredContactMethod,
            status: crmContacts.status,
            decisionAuthority: crmContacts.decisionAuthority,
            buyingRole: crmContacts.buyingRole,
            influenceLevel: crmContacts.influenceLevel,
            lastContactedAt: crmContacts.lastContactedAt,
            lastResponseAt: crmContacts.lastResponseAt,
            totalInteractions: crmContacts.totalInteractions,
            engagementScore: crmContacts.engagementScore,
            ownerId: crmContacts.ownerId,
            createdAt: crmContacts.createdAt,
            updatedAt: crmContacts.updatedAt,
            // Company info (flattened from join)
            accountName: accounts.name,
            accountStatus: accounts.status,
            // Owner info (flattened from join)
            ownerName: userProfiles.fullName,
            ownerEmail: userProfiles.email,
          })
            .from(crmContacts)
            .leftJoin(accounts, eq(crmContacts.companyId, accounts.id))
            .leftJoin(userProfiles, eq(crmContacts.ownerId, userProfiles.id))
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset),
          db.select({ count: sql<number>`count(*)::int` })
            .from(crmContacts)
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
     * Get single contact by ID with relations
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Fetch contact with company and owner info
        const contactResults = await db.select({
          id: crmContacts.id,
          orgId: crmContacts.orgId,
          contactType: crmContacts.contactType,
          firstName: crmContacts.firstName,
          lastName: crmContacts.lastName,
          email: crmContacts.email,
          phone: crmContacts.phone,
          mobile: crmContacts.mobile,
          linkedinUrl: crmContacts.linkedinUrl,
          avatarUrl: crmContacts.avatarUrl,
          title: crmContacts.title,
          companyName: crmContacts.companyName,
          companyId: crmContacts.companyId,
          department: crmContacts.department,
          workLocation: crmContacts.workLocation,
          timezone: crmContacts.timezone,
          preferredContactMethod: crmContacts.preferredContactMethod,
          bestTimeToContact: crmContacts.bestTimeToContact,
          doNotCallBefore: crmContacts.doNotCallBefore,
          doNotCallAfter: crmContacts.doNotCallAfter,
          status: crmContacts.status,
          source: crmContacts.source,
          sourceDetail: crmContacts.sourceDetail,
          userProfileId: crmContacts.userProfileId,
          lastContactedAt: crmContacts.lastContactedAt,
          lastResponseAt: crmContacts.lastResponseAt,
          totalInteractions: crmContacts.totalInteractions,
          engagementScore: crmContacts.engagementScore,
          twitterUrl: crmContacts.twitterUrl,
          githubUrl: crmContacts.githubUrl,
          decisionAuthority: crmContacts.decisionAuthority,
          buyingRole: crmContacts.buyingRole,
          influenceLevel: crmContacts.influenceLevel,
          tags: crmContacts.tags,
          notes: crmContacts.notes,
          internalNotes: crmContacts.internalNotes,
          ownerId: crmContacts.ownerId,
          createdAt: crmContacts.createdAt,
          updatedAt: crmContacts.updatedAt,
          createdBy: crmContacts.createdBy,
          updatedBy: crmContacts.updatedBy,
        })
          .from(crmContacts)
          .where(and(
            eq(crmContacts.id, input.id),
            eq(crmContacts.orgId, orgId!),
            isNull(crmContacts.deletedAt),
          ))
          .limit(1);

        const contact = contactResults[0];

        if (!contact) {
          throw new Error('Contact not found');
        }

        // Fetch related data in parallel
        const [companyResult, ownerResult, dealsResult, activitiesResult] = await Promise.all([
          // Company
          contact.companyId
            ? db.select({
                id: accounts.id,
                name: accounts.name,
                industry: accounts.industry,
                status: accounts.status,
                tier: accounts.tier,
              })
              .from(accounts)
              .where(eq(accounts.id, contact.companyId))
              .limit(1)
            : Promise.resolve([]),
          // Owner
          contact.ownerId
            ? db.select({
                id: userProfiles.id,
                fullName: userProfiles.fullName,
                email: userProfiles.email,
                avatarUrl: userProfiles.avatarUrl,
              })
              .from(userProfiles)
              .where(eq(userProfiles.id, contact.ownerId))
              .limit(1)
            : Promise.resolve([]),
          // Related deals (where this contact is a stakeholder)
          db.select({
            id: deals.id,
            title: deals.title,
            value: deals.value,
            stage: deals.stage,
            expectedCloseDate: deals.expectedCloseDate,
          })
            .from(deals)
            .where(and(
              eq(deals.orgId, orgId!),
              isNull(deals.deletedAt),
            ))
            .limit(5),
          // Recent activity log
          db.select()
            .from(activityLog)
            .where(and(
              eq(activityLog.entityType, 'poc'),
              eq(activityLog.entityId, input.id),
              eq(activityLog.orgId, orgId!),
            ))
            .orderBy(desc(activityLog.activityDate))
            .limit(10),
        ]);

        return {
          ...contact,
          company: companyResult[0] ?? null,
          owner: ownerResult[0] ?? null,
          deals: dealsResult,
          activities: activitiesResult,
        };
      }),

    /**
     * Get contact statistics for metrics
     */
    getStats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const allContacts = await db.select().from(crmContacts)
          .where(and(
            eq(crmContacts.orgId, orgId!),
            isNull(crmContacts.deletedAt),
          ));

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
          total: allContacts.length,
          byType: {
            client_poc: allContacts.filter(c => c.contactType === 'client_poc').length,
            candidate: allContacts.filter(c => c.contactType === 'candidate').length,
            vendor: allContacts.filter(c => c.contactType === 'vendor').length,
            partner: allContacts.filter(c => c.contactType === 'partner').length,
            internal: allContacts.filter(c => c.contactType === 'internal').length,
            general: allContacts.filter(c => c.contactType === 'general').length,
          },
          byStatus: {
            active: allContacts.filter(c => c.status === 'active').length,
            inactive: allContacts.filter(c => c.status === 'inactive').length,
            do_not_contact: allContacts.filter(c => c.status === 'do_not_contact').length,
            bounced: allContacts.filter(c => c.status === 'bounced').length,
            unsubscribed: allContacts.filter(c => c.status === 'unsubscribed').length,
          },
          recentlyContacted: allContacts.filter(c =>
            c.lastContactedAt && c.lastContactedAt >= thirtyDaysAgo
          ).length,
          needsFollowUp: allContacts.filter(c =>
            !c.lastContactedAt || c.lastContactedAt < sevenDaysAgo
          ).length,
          withEmail: allContacts.filter(c => c.email).length,
          withPhone: allContacts.filter(c => c.phone || c.mobile).length,
          avgEngagementScore: Math.round(
            allContacts.reduce((sum, c) => sum + (c.engagementScore ?? 0), 0) / (allContacts.length || 1)
          ),
          decisionMakers: allContacts.filter(c =>
            c.decisionAuthority === 'final_decision_maker' || c.decisionAuthority === 'key_influencer'
          ).length,
          newThisMonth: allContacts.filter(c =>
            c.createdAt >= thirtyDaysAgo
          ).length,
        };
      }),

    /**
     * Create new contact for an account
     */
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        linkedinUrl: z.string().optional(),
        contactType: z.enum(['client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general']).default('client_poc'),
        preferredContactMethod: z.enum(['email', 'phone', 'mobile', 'linkedin', 'text']).default('email'),
        decisionAuthority: z.enum(['final_decision_maker', 'key_influencer', 'gatekeeper', 'recommender', 'end_user']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { accountId, ...contactData } = input;

        // Verify the account belongs to the user's org
        const [account] = await db.select({ id: accounts.id })
          .from(accounts)
          .where(and(
            eq(accounts.id, accountId),
            eq(accounts.orgId, orgId!)
          ))
          .limit(1);

        if (!account) {
          throw new Error('Account not found or unauthorized');
        }

        // Get user profile ID
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        if (!userProfileResult[0]) {
          throw new Error('User profile not found');
        }

        const [newContact] = await db.insert(crmContacts).values({
          ...contactData,
          orgId: orgId!,
          companyId: accountId,
          createdBy: userProfileResult[0].id,
        }).returning();

        return newContact;
      }),

    /**
     * Update contact
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        linkedinUrl: z.string().optional(),
        contactType: z.enum(['client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general']).optional(),
        preferredContactMethod: z.enum(['email', 'phone', 'mobile', 'linkedin', 'text']).optional(),
        decisionAuthority: z.enum(['final_decision_maker', 'key_influencer', 'gatekeeper', 'recommender', 'end_user']).optional(),
        notes: z.string().optional(),
        status: z.enum(['active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        // Verify contact belongs to user's org
        const [contact] = await db.select()
          .from(crmContacts)
          .where(and(
            eq(crmContacts.id, id),
            eq(crmContacts.orgId, orgId!),
          ))
          .limit(1);

        if (!contact) {
          throw new Error('Contact not found');
        }

        // Get user profile ID
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [updated] = await db.update(crmContacts)
          .set({
            ...data,
            updatedAt: new Date(),
            updatedBy: userProfileResult[0]?.id ?? null,
          })
          .where(eq(crmContacts.id, id))
          .returning();

        return updated;
      }),

    /**
     * Delete contact (soft delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        // Verify contact belongs to user's org
        const [contact] = await db.select({ id: crmContacts.id })
          .from(crmContacts)
          .where(and(
            eq(crmContacts.id, input.id),
            eq(crmContacts.orgId, orgId!),
          ))
          .limit(1);

        if (!contact) {
          throw new Error('Contact not found');
        }

        // Get user profile ID
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [deleted] = await db.update(crmContacts)
          .set({
            deletedAt: new Date(),
            updatedBy: userProfileResult[0]?.id ?? null,
          })
          .where(eq(crmContacts.id, input.id))
          .returning();

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
            eq(activityLog.orgId, orgId!)
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
        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [newActivity] = await db.insert(activityLog).values({
          ...input,
          orgId: orgId!,
          performedBy: userProfileResult[0]?.id ?? null,
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

  // =====================================================
  // CAMPAIGNS
  // =====================================================

  campaigns: router({
    /**
     * Get all campaigns with pagination, search, and filters
     */
    list: orgProtectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(25),
        sortBy: z.string().optional(),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
        filters: z.object({
          status: z.array(z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'])).optional(),
          campaignType: z.array(z.enum(['email', 'linkedin', 'event', 'webinar', 'content', 'outbound_call'])).optional(),
          ownerId: z.string().uuid().optional(),
          dateRange: z.object({
            from: z.date().optional(),
            to: z.date().optional(),
          }).optional(),
        }).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        const conditions: SQL[] = [
          eq(crmCampaigns.orgId, orgId!),
          isNull(crmCampaigns.deletedAt),
        ];

        // Search
        if (search) {
          conditions.push(
            or(
              ilike(crmCampaigns.name, `%${search}%`),
              ilike(crmCampaigns.description, `%${search}%`),
            )!
          );
        }

        // Apply filters
        if (filters?.status?.length) {
          conditions.push(inArray(crmCampaigns.status, filters.status));
        }

        if (filters?.campaignType?.length) {
          conditions.push(inArray(crmCampaigns.campaignType, filters.campaignType));
        }

        if (filters?.ownerId) {
          conditions.push(eq(crmCampaigns.ownerId, filters.ownerId));
        }

        if (filters?.dateRange?.from) {
          conditions.push(gte(crmCampaigns.startDate, filters.dateRange.from));
        }

        if (filters?.dateRange?.to) {
          conditions.push(lte(crmCampaigns.startDate, filters.dateRange.to));
        }

        // Build sort order
        const sortColumn = sortBy === 'name' ? crmCampaigns.name
          : sortBy === 'status' ? crmCampaigns.status
          : sortBy === 'startDate' ? crmCampaigns.startDate
          : sortBy === 'endDate' ? crmCampaigns.endDate
          : crmCampaigns.createdAt;

        const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const [items, countResult] = await Promise.all([
          db.select({
            id: crmCampaigns.id,
            orgId: crmCampaigns.orgId,
            name: crmCampaigns.name,
            description: crmCampaigns.description,
            campaignType: crmCampaigns.campaignType,
            status: crmCampaigns.status,
            startDate: crmCampaigns.startDate,
            endDate: crmCampaigns.endDate,
            scheduledAt: crmCampaigns.scheduledAt,
            budget: crmCampaigns.budget,
            currency: crmCampaigns.currency,
            goalLeads: crmCampaigns.goalLeads,
            goalResponses: crmCampaigns.goalResponses,
            goalMeetings: crmCampaigns.goalMeetings,
            ownerId: crmCampaigns.ownerId,
            createdAt: crmCampaigns.createdAt,
            updatedAt: crmCampaigns.updatedAt,
            ownerName: userProfiles.fullName,
          })
            .from(crmCampaigns)
            .leftJoin(userProfiles, eq(crmCampaigns.ownerId, userProfiles.id))
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset),
          db.select({ count: sql<number>`count(*)::int` })
            .from(crmCampaigns)
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
     * Get campaign by ID with related data
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const [campaign] = await db.select()
          .from(crmCampaigns)
          .where(and(
            eq(crmCampaigns.id, input.id),
            eq(crmCampaigns.orgId, orgId!),
            isNull(crmCampaigns.deletedAt),
          ))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Get related data
        const [owner, targets, content, metrics] = await Promise.all([
          campaign.ownerId
            ? db.select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
                .from(userProfiles)
                .where(eq(userProfiles.id, campaign.ownerId))
                .limit(1)
            : Promise.resolve([]),
          db.select().from(crmCampaignTargets)
            .where(eq(crmCampaignTargets.campaignId, input.id))
            .limit(100),
          db.select().from(crmCampaignContent)
            .where(eq(crmCampaignContent.campaignId, input.id)),
          db.select().from(crmCampaignMetrics)
            .where(eq(crmCampaignMetrics.campaignId, input.id))
            .limit(1),
        ]);

        return {
          ...campaign,
          owner: owner[0] ?? null,
          targets,
          content,
          metrics: metrics[0] ?? null,
        };
      }),

    /**
     * Get campaign statistics
     */
    getStats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const allCampaigns = await db.select().from(crmCampaigns)
          .where(and(
            eq(crmCampaigns.orgId, orgId!),
            isNull(crmCampaigns.deletedAt),
          ));

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
          total: allCampaigns.length,
          byStatus: {
            draft: allCampaigns.filter(c => c.status === 'draft').length,
            scheduled: allCampaigns.filter(c => c.status === 'scheduled').length,
            active: allCampaigns.filter(c => c.status === 'active').length,
            paused: allCampaigns.filter(c => c.status === 'paused').length,
            completed: allCampaigns.filter(c => c.status === 'completed').length,
            cancelled: allCampaigns.filter(c => c.status === 'cancelled').length,
          },
          byType: {
            email: allCampaigns.filter(c => c.campaignType === 'email').length,
            linkedin: allCampaigns.filter(c => c.campaignType === 'linkedin').length,
            event: allCampaigns.filter(c => c.campaignType === 'event').length,
            webinar: allCampaigns.filter(c => c.campaignType === 'webinar').length,
            content: allCampaigns.filter(c => c.campaignType === 'content').length,
            outbound_call: allCampaigns.filter(c => c.campaignType === 'outbound_call').length,
          },
          active: allCampaigns.filter(c => c.status === 'active').length,
          recentlyLaunched: allCampaigns.filter(c =>
            c.startDate && c.startDate >= thirtyDaysAgo
          ).length,
          totalBudget: allCampaigns.reduce((sum, c) => sum + (parseFloat(c.budget ?? '0')), 0),
          activeBudget: allCampaigns
            .filter(c => c.status === 'active')
            .reduce((sum, c) => sum + (parseFloat(c.budget ?? '0')), 0),
        };
      }),

    /**
     * Create new campaign
     */
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        campaignType: z.enum(['email', 'linkedin', 'event', 'webinar', 'content', 'outbound_call']),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        scheduledAt: z.date().optional(),
        targetAudience: z.string().optional(),
        targetIndustries: z.array(z.string()).optional(),
        targetCompanySizes: z.array(z.string()).optional(),
        targetTitles: z.array(z.string()).optional(),
        goalLeads: z.number().int().min(0).optional(),
        goalResponses: z.number().int().min(0).optional(),
        goalMeetings: z.number().int().min(0).optional(),
        budget: z.number().optional(),
        currency: z.string().default('USD'),
        ownerId: z.string().uuid().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const profileId = userProfileResult[0]?.id;

        const [newCampaign] = await db.insert(crmCampaigns).values({
          ...input,
          budget: input.budget?.toString(),
          targetIndustries: input.targetIndustries ?? [],
          targetCompanySizes: input.targetCompanySizes ?? [],
          targetTitles: input.targetTitles ?? [],
          orgId: orgId!,
          ownerId: input.ownerId ?? profileId,
          createdBy: profileId,
        }).returning();

        // Create initial metrics record
        await db.insert(crmCampaignMetrics).values({
          campaignId: newCampaign.id,
        });

        return newCampaign;
      }),

    /**
     * Update campaign
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        campaignType: z.enum(['email', 'linkedin', 'event', 'webinar', 'content', 'outbound_call']).optional(),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        scheduledAt: z.date().optional(),
        targetAudience: z.string().optional(),
        targetIndustries: z.array(z.string()).optional(),
        targetCompanySizes: z.array(z.string()).optional(),
        targetTitles: z.array(z.string()).optional(),
        goalLeads: z.number().int().min(0).optional(),
        goalResponses: z.number().int().min(0).optional(),
        goalMeetings: z.number().int().min(0).optional(),
        budget: z.number().optional(),
        currency: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { id, ...data } = input;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [updated] = await db.update(crmCampaigns)
          .set({
            ...data,
            budget: data.budget !== undefined ? data.budget.toString() : undefined,
            updatedAt: new Date(),
          })
          .where(and(
            eq(crmCampaigns.id, id),
            eq(crmCampaigns.orgId, orgId!),
          ))
          .returning();

        if (!updated) {
          throw new Error('Campaign not found');
        }

        return updated;
      }),

    /**
     * Launch campaign (change status from draft/scheduled to active)
     */
    launch: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [campaign] = await db.select()
          .from(crmCampaigns)
          .where(and(
            eq(crmCampaigns.id, input.id),
            eq(crmCampaigns.orgId, orgId!),
          ))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        if (!['draft', 'scheduled', 'paused'].includes(campaign.status)) {
          throw new Error(`Cannot launch campaign with status: ${campaign.status}`);
        }

        const [updated] = await db.update(crmCampaigns)
          .set({
            status: 'active',
            startDate: campaign.startDate ?? new Date(),
            updatedAt: new Date(),
          })
          .where(eq(crmCampaigns.id, input.id))
          .returning();

        return updated;
      }),

    /**
     * Pause campaign
     */
    pause: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [updated] = await db.update(crmCampaigns)
          .set({
            status: 'paused',
            updatedAt: new Date(),
          })
          .where(and(
            eq(crmCampaigns.id, input.id),
            eq(crmCampaigns.orgId, orgId!),
          ))
          .returning();

        if (!updated) {
          throw new Error('Campaign not found');
        }

        return updated;
      }),

    /**
     * Complete campaign
     */
    complete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [updated] = await db.update(crmCampaigns)
          .set({
            status: 'completed',
            endDate: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(crmCampaigns.id, input.id),
            eq(crmCampaigns.orgId, orgId!),
          ))
          .returning();

        if (!updated) {
          throw new Error('Campaign not found');
        }

        return updated;
      }),

    /**
     * Get campaign targets
     */
    getTargets: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(50),
        status: z.enum(['pending', 'sent', 'opened', 'clicked', 'responded', 'converted', 'bounced', 'unsubscribed']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { campaignId, page, pageSize, status } = input;
        const offset = (page - 1) * pageSize;

        // Verify campaign belongs to org
        const [campaign] = await db.select({ id: crmCampaigns.id })
          .from(crmCampaigns)
          .where(and(eq(crmCampaigns.id, campaignId), eq(crmCampaigns.orgId, orgId!)))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const conditions = [eq(crmCampaignTargets.campaignId, campaignId)];
        if (status) {
          conditions.push(eq(crmCampaignTargets.status, status));
        }

        const [items, countResult] = await Promise.all([
          db.select()
            .from(crmCampaignTargets)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset)
            .orderBy(desc(crmCampaignTargets.createdAt)),
          db.select({ count: sql<number>`count(*)::int` })
            .from(crmCampaignTargets)
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
     * Add targets to campaign
     */
    addTargets: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        targets: z.array(z.object({
          targetType: z.enum(['lead', 'contact', 'account']),
          targetId: z.string().uuid(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify campaign belongs to org
        const [campaign] = await db.select({ id: crmCampaigns.id })
          .from(crmCampaigns)
          .where(and(eq(crmCampaigns.id, input.campaignId), eq(crmCampaigns.orgId, orgId!)))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const newTargets = await db.insert(crmCampaignTargets).values(
          input.targets.map(t => ({
            campaignId: input.campaignId,
            targetType: t.targetType,
            targetId: t.targetId,
            status: 'pending' as const,
          }))
        ).returning();

        return newTargets;
      }),

    /**
     * Get campaign content
     */
    getContent: orgProtectedProcedure
      .input(z.object({ campaignId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify campaign belongs to org
        const [campaign] = await db.select({ id: crmCampaigns.id })
          .from(crmCampaigns)
          .where(and(eq(crmCampaigns.id, input.campaignId), eq(crmCampaigns.orgId, orgId!)))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const content = await db.select()
          .from(crmCampaignContent)
          .where(eq(crmCampaignContent.campaignId, input.campaignId))
          .orderBy(asc(crmCampaignContent.variant));

        return content;
      }),

    /**
     * Add content to campaign
     */
    addContent: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        contentType: z.enum(['email', 'linkedin_message', 'landing_page', 'call_script', 'text_message']),
        name: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        htmlBody: z.string().optional(),
        assetUrl: z.string().optional(),
        variant: z.string().default('A'),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;
        const { campaignId, ...contentData } = input;

        // Verify campaign belongs to org
        const [campaign] = await db.select({ id: crmCampaigns.id })
          .from(crmCampaigns)
          .where(and(eq(crmCampaigns.id, campaignId), eq(crmCampaigns.orgId, orgId!)))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [newContent] = await db.insert(crmCampaignContent).values({
          campaignId,
          ...contentData,
          createdBy: userProfileResult[0]?.id,
        }).returning();

        return newContent;
      }),

    /**
     * Get campaign metrics
     */
    getMetrics: orgProtectedProcedure
      .input(z.object({ campaignId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        // Verify campaign belongs to org
        const [campaign] = await db.select({ id: crmCampaigns.id })
          .from(crmCampaigns)
          .where(and(eq(crmCampaigns.id, input.campaignId), eq(crmCampaigns.orgId, orgId!)))
          .limit(1);

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        const [metrics] = await db.select()
          .from(crmCampaignMetrics)
          .where(eq(crmCampaignMetrics.campaignId, input.campaignId))
          .limit(1);

        return metrics ?? null;
      }),

    /**
     * Soft delete campaign
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { userId, orgId } = ctx;

        const userProfileResult = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(eq(userProfiles.authId, userId!))
          .limit(1);

        const [deleted] = await db.update(crmCampaigns)
          .set({
            deletedAt: new Date(),
          })
          .where(and(
            eq(crmCampaigns.id, input.id),
            eq(crmCampaigns.orgId, orgId!),
          ))
          .returning();

        if (!deleted) {
          throw new Error('Campaign not found');
        }

        return { success: true };
      }),
  }),
});
