/**
 * tRPC Router: Object Owners (RCAI) Module
 * Handles RCAI ownership assignments for all business objects
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  objectOwners,
  DEFAULT_RACI_PERMISSIONS,
} from '@/lib/db/schema/raci';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, sql, SQL } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const rcaiRoleValues = ['responsible', 'accountable', 'consulted', 'informed'] as const;
const rcaiPermissionValues = ['edit', 'view'] as const;
const rcaiAssignmentTypeValues = ['auto', 'manual'] as const;
const entityTypeValues = [
  'campaign', 'lead', 'deal', 'account', 'job', 'job_order',
  'submission', 'contact', 'external_job', 'candidate', 'talent'
] as const;

const assignOwnerSchema = z.object({
  entityType: z.enum(entityTypeValues),
  entityId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(rcaiRoleValues),
  permission: z.enum(rcaiPermissionValues).optional(),
  notes: z.string().max(500).optional(),
  assignmentType: z.enum(rcaiAssignmentTypeValues).default('manual'),
});

const updateOwnerSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(rcaiRoleValues).optional(),
  permission: z.enum(rcaiPermissionValues).optional(),
  notes: z.string().max(500).optional(),
});

const bulkAssignSchema = z.object({
  entityType: z.enum(entityTypeValues),
  entityId: z.string().uuid(),
  assignments: z.array(z.object({
    userId: z.string().uuid(),
    role: z.enum(rcaiRoleValues),
    permission: z.enum(rcaiPermissionValues).optional(),
    notes: z.string().max(500).optional(),
  })).min(1).max(10),
});

// =====================================================
// ROUTER
// =====================================================

export const objectOwnersRouter = router({
  /**
   * Get all owners for an entity
   */
  getByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const results = await db
        .select({
          owner: objectOwners,
          user: userProfiles,
        })
        .from(objectOwners)
        .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId)
          )
        )
        .orderBy(
          sql`CASE ${objectOwners.role}
            WHEN 'accountable' THEN 1
            WHEN 'responsible' THEN 2
            WHEN 'consulted' THEN 3
            WHEN 'informed' THEN 4
          END`
        );

      return results.map(r => ({
        ...r.owner,
        user: r.user,
      }));
    }),

  /**
   * Get entities where user is an owner
   */
  getByUser: orgProtectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(), // defaults to current user
      entityType: z.enum(entityTypeValues).optional(),
      role: z.enum(rcaiRoleValues).optional(),
      permission: z.enum(rcaiPermissionValues).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, userId: currentUserId } = ctx;
      const targetUserId = (input.userId || currentUserId) as string;

      const conditions = [
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.userId, targetUserId),
      ];

      if (input.entityType) {
        conditions.push(eq(objectOwners.entityType, input.entityType));
      }

      if (input.role) {
        conditions.push(eq(objectOwners.role, input.role));
      }

      if (input.permission) {
        conditions.push(eq(objectOwners.permission, input.permission));
      }

      const results = await db
        .select()
        .from(objectOwners)
        .where(and(...conditions))
        .orderBy(desc(objectOwners.assignedAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(objectOwners)
        .where(and(...conditions));

      return {
        items: results,
        total: count,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Assign owner to entity
   */
  assign: orgProtectedProcedure
    .input(assignOwnerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Determine permission based on role if not provided
      const permission = input.permission ||
        DEFAULT_RACI_PERMISSIONS[input.role as keyof typeof DEFAULT_RACI_PERMISSIONS];

      const [owner] = await db.insert(objectOwners)
        .values({
          orgId,
          entityType: input.entityType,
          entityId: input.entityId,
          userId: input.userId,
          role: input.role,
          permission,
          assignmentType: input.assignmentType,
          assignedBy: userId,
          notes: input.notes,
        })
        .onConflictDoUpdate({
          target: [objectOwners.entityType, objectOwners.entityId, objectOwners.userId],
          set: {
            role: input.role,
            permission,
            assignmentType: input.assignmentType,
            assignedBy: userId,
            notes: input.notes,
            updatedAt: new Date(),
          },
        })
        .returning();

      return owner;
    }),

  /**
   * Bulk assign owners to entity
   */
  bulkAssign: orgProtectedProcedure
    .input(bulkAssignSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const ownersToInsert = input.assignments.map(assignment => ({
        orgId,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: assignment.userId,
        role: assignment.role,
        permission: assignment.permission ||
          DEFAULT_RACI_PERMISSIONS[assignment.role as keyof typeof DEFAULT_RACI_PERMISSIONS],
        assignmentType: 'manual' as const,
        assignedBy: userId,
        notes: assignment.notes,
      }));

      // Delete existing and insert new (transaction)
      await db.delete(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId)
          )
        );

      const inserted = await db.insert(objectOwners)
        .values(ownersToInsert)
        .returning();

      return inserted;
    }),

  /**
   * Update owner assignment
   */
  update: orgProtectedProcedure
    .input(updateOwnerSchema)
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { id, ...data } = input;

      // If role is being changed, update permission accordingly
      const updateData: Record<string, unknown> = { ...data };
      if (data.role && !data.permission) {
        updateData.permission = DEFAULT_RACI_PERMISSIONS[data.role as keyof typeof DEFAULT_RACI_PERMISSIONS];
      }

      const [updated] = await db.update(objectOwners)
        .set(updateData)
        .where(
          and(
            eq(objectOwners.id, id),
            eq(objectOwners.orgId, orgId)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Owner assignment not found');
      }

      return updated;
    }),

  /**
   * Remove owner from entity
   */
  remove: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [deleted] = await db.delete(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId),
            eq(objectOwners.userId, input.userId)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error('Owner assignment not found');
      }

      return { success: true };
    }),

  /**
   * Remove owner by ID
   */
  removeById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const [deleted] = await db.delete(objectOwners)
        .where(
          and(
            eq(objectOwners.id, input.id),
            eq(objectOwners.orgId, orgId)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error('Owner assignment not found');
      }

      return { success: true };
    }),

  /**
   * Transfer ownership (change accountable)
   */
  transferOwnership: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
      newAccountableId: z.string().uuid(),
      keepPreviousAs: z.enum(['responsible', 'consulted', 'informed']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get current accountable
      const [currentAccountable] = await db.select()
        .from(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId),
            eq(objectOwners.role, 'accountable')
          )
        )
        .limit(1);

      // Update previous accountable if exists and keepPreviousAs is set
      if (currentAccountable && input.keepPreviousAs) {
        await db.update(objectOwners)
          .set({
            role: input.keepPreviousAs,
            permission: DEFAULT_RACI_PERMISSIONS[input.keepPreviousAs],
            isPrimary: false,
            updatedAt: new Date(),
          })
          .where(eq(objectOwners.id, currentAccountable.id));
      } else if (currentAccountable) {
        // Remove if not keeping
        await db.delete(objectOwners)
          .where(eq(objectOwners.id, currentAccountable.id));
      }

      // Assign new accountable
      const [newOwner] = await db.insert(objectOwners)
        .values({
          orgId,
          entityType: input.entityType,
          entityId: input.entityId,
          userId: input.newAccountableId,
          role: 'accountable',
          permission: 'edit',
          isPrimary: true,
          assignmentType: 'manual',
          assignedBy: userId,
        })
        .onConflictDoUpdate({
          target: [objectOwners.entityType, objectOwners.entityId, objectOwners.userId],
          set: {
            role: 'accountable',
            permission: 'edit',
            isPrimary: true,
            assignmentType: 'manual',
            assignedBy: userId,
            updatedAt: new Date(),
          },
        })
        .returning();

      return newOwner;
    }),

  /**
   * Check if user can access entity
   */
  canAccess: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
      requiredPermission: z.enum(rcaiPermissionValues).default('view'),
      userId: z.string().uuid().optional(), // defaults to current user
    }))
    .query(async ({ ctx, input }) => {
      const { orgId, userId: currentUserId } = ctx;
      const targetUserId = (input.userId || currentUserId) as string;

      const [result] = await db.select()
        .from(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId),
            eq(objectOwners.userId, targetUserId),
            (input.requiredPermission === 'view'
              ? sql`TRUE` as SQL<unknown> // Any permission allows view
              : eq(objectOwners.permission, 'edit'))
          )
        )
        .limit(1);

      return {
        hasAccess: !!result,
        permission: result?.permission || null,
        role: result?.role || null,
      };
    }),

  /**
   * Get primary owner (accountable) for entity
   */
  getPrimaryOwner: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const result = await db
        .select({
          owner: objectOwners,
          user: userProfiles,
        })
        .from(objectOwners)
        .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId),
            eq(objectOwners.isPrimary, true)
          )
        )
        .limit(1);

      if (!result.length) {
        return null;
      }

      return {
        ...result[0].owner,
        user: result[0].user,
      };
    }),

  /**
   * Get users with edit permission for entity
   */
  getEditors: orgProtectedProcedure
    .input(z.object({
      entityType: z.enum(entityTypeValues),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const results = await db
        .select({
          owner: objectOwners,
          user: userProfiles,
        })
        .from(objectOwners)
        .leftJoin(userProfiles, eq(objectOwners.userId, userProfiles.id))
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.entityType),
            eq(objectOwners.entityId, input.entityId),
            eq(objectOwners.permission, 'edit')
          )
        );

      return results.map(r => ({
        ...r.owner,
        user: r.user,
      }));
    }),

  /**
   * Get my owned entities summary
   */
  getMySummary: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId, userId } = ctx;

      const summary = await db
        .select({
          entityType: objectOwners.entityType,
          role: objectOwners.role,
          count: sql<number>`count(*)::int`,
        })
        .from(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.userId, userId as string)
          )
        )
        .groupBy(objectOwners.entityType, objectOwners.role);

      // Transform into nested structure
      const result: Record<string, Record<string, number>> = {};
      for (const row of summary) {
        if (!result[row.entityType]) {
          result[row.entityType] = {};
        }
        result[row.entityType][row.role] = row.count;
      }

      return result;
    }),

  /**
   * Copy RCAI from one entity to another
   */
  copyFromEntity: orgProtectedProcedure
    .input(z.object({
      sourceEntityType: z.enum(entityTypeValues),
      sourceEntityId: z.string().uuid(),
      targetEntityType: z.enum(entityTypeValues),
      targetEntityId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get source owners
      const sourceOwners = await db.select()
        .from(objectOwners)
        .where(
          and(
            eq(objectOwners.orgId, orgId),
            eq(objectOwners.entityType, input.sourceEntityType),
            eq(objectOwners.entityId, input.sourceEntityId)
          )
        );

      if (!sourceOwners.length) {
        throw new Error('No owners found for source entity');
      }

      // Create new owner records for target
      const targetOwners = sourceOwners.map(owner => ({
        orgId,
        entityType: input.targetEntityType,
        entityId: input.targetEntityId,
        userId: owner.userId,
        role: owner.role,
        permission: owner.permission,
        isPrimary: owner.isPrimary,
        assignmentType: 'auto' as const,
        assignedBy: userId,
        notes: `Copied from ${input.sourceEntityType}/${input.sourceEntityId}`,
      }));

      const inserted = await db.insert(objectOwners)
        .values(targetOwners)
        .onConflictDoNothing()
        .returning();

      return inserted;
    }),
});

export type ObjectOwnersRouter = typeof objectOwnersRouter;
