/**
 * Ownership Filter Query Builder
 *
 * Builds Drizzle ORM conditions for ownership-based filtering.
 * Supports RCAI (Responsible, Accountable, Consulted, Informed) model.
 */

import { eq, and, or, inArray, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { objectOwners } from '@/lib/db/schema/workspace';
import type { OwnershipFilter } from '@/lib/validations/ownership';

/**
 * Context needed for ownership filtering
 */
export interface OwnershipContext {
  /** Current user's profile ID */
  userId: string;
  /** Organization ID */
  orgId: string;
  /** Whether user has manager access */
  isManager: boolean;
  /** Profile IDs of direct reports (if manager) */
  managedUserIds: string[];
}

/**
 * Table interface that supports ownership filtering.
 * Must have an 'id' column and 'ownerId' column.
 */
export interface OwnershipTable {
  id: any;
  ownerId: any;
}

/**
 * Build a Drizzle ORM condition for ownership filtering.
 *
 * @param ctx - Ownership context with user info and manager status
 * @param entityType - Entity type for RCAI lookup (e.g., 'lead', 'job', 'deal')
 * @param table - The table being queried (must have id and ownerId columns)
 * @param filter - The ownership filter to apply
 * @returns SQL condition to add to query
 *
 * @example
 * const condition = await buildOwnershipCondition(ctx, 'job', jobs, 'my_items');
 * const results = await db.select().from(jobs).where(and(baseConditions, condition));
 */
export async function buildOwnershipCondition(
  ctx: OwnershipContext,
  entityType: string,
  table: OwnershipTable,
  filter: OwnershipFilter
): Promise<SQL<unknown>> {
  const { userId, orgId, isManager, managedUserIds } = ctx;

  switch (filter) {
    case 'my_items':
      // Only items where I'm the owner
      return eq(table.ownerId, userId);

    case 'my_team':
      // Items owned by me or my direct reports
      if (!isManager || managedUserIds.length === 0) {
        // Not a manager or no reports - fall back to my_items
        return eq(table.ownerId, userId);
      }
      return inArray(table.ownerId, [userId, ...managedUserIds]);

    case 'consulted': {
      // Items where I'm consulted or informed via RCAI
      const consultedIds = await getConsultedEntityIds(userId, orgId, entityType);

      if (consultedIds.length === 0) {
        // No consulted items - return impossible condition
        return sql`FALSE`;
      }
      return inArray(table.id, consultedIds);
    }

    case 'all_accessible': {
      // Union of: my_items + consulted + team (if manager)
      const conditions: SQL<unknown>[] = [eq(table.ownerId, userId)];

      // Add consulted items
      const consultedIds = await getConsultedEntityIds(userId, orgId, entityType);
      if (consultedIds.length > 0) {
        conditions.push(inArray(table.id, consultedIds));
      }

      // Add team items (if manager)
      if (isManager && managedUserIds.length > 0) {
        conditions.push(inArray(table.ownerId, managedUserIds));
      }

      return or(...conditions) ?? eq(table.ownerId, userId);
    }

    case 'all_org':
      // All items in org - no additional ownership filter
      // Note: orgId is already applied by the router
      return sql`TRUE`;

    default:
      // Default to my_items
      return eq(table.ownerId, userId);
  }
}

/**
 * Get entity IDs where user is consulted or informed via RCAI.
 *
 * @param userId - User's profile ID
 * @param orgId - Organization ID
 * @param entityType - Entity type to filter
 * @returns Array of entity IDs
 */
async function getConsultedEntityIds(
  userId: string,
  orgId: string,
  entityType: string
): Promise<string[]> {
  const results = await db
    .select({ entityId: objectOwners.entityId })
    .from(objectOwners)
    .where(
      and(
        eq(objectOwners.userId, userId),
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType),
        inArray(objectOwners.role, ['consulted', 'informed'])
      )
    );

  return results.map((r) => r.entityId);
}

/**
 * Get all entity IDs where user has any RCAI role.
 *
 * @param userId - User's profile ID
 * @param orgId - Organization ID
 * @param entityType - Entity type to filter
 * @returns Array of entity IDs
 */
export async function getAllRCAIEntityIds(
  userId: string,
  orgId: string,
  entityType: string
): Promise<string[]> {
  const results = await db
    .select({ entityId: objectOwners.entityId })
    .from(objectOwners)
    .where(
      and(
        eq(objectOwners.userId, userId),
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType)
      )
    );

  return results.map((r) => r.entityId);
}

/**
 * Check if user has edit access to an entity via RCAI.
 *
 * @param userId - User's profile ID
 * @param orgId - Organization ID
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @returns True if user has edit permission
 */
export async function hasEditAccess(
  userId: string,
  orgId: string,
  entityType: string,
  entityId: string
): Promise<boolean> {
  const result = await db
    .select({ permission: objectOwners.permission })
    .from(objectOwners)
    .where(
      and(
        eq(objectOwners.userId, userId),
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType),
        eq(objectOwners.entityId, entityId)
      )
    )
    .limit(1);

  return result.length > 0 && result[0].permission === 'edit';
}

/**
 * Check if user has any access (edit or view) to an entity via RCAI.
 *
 * @param userId - User's profile ID
 * @param orgId - Organization ID
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @returns True if user has any RCAI assignment
 */
export async function hasAnyAccess(
  userId: string,
  orgId: string,
  entityType: string,
  entityId: string
): Promise<boolean> {
  const result = await db
    .select({ id: objectOwners.id })
    .from(objectOwners)
    .where(
      and(
        eq(objectOwners.userId, userId),
        eq(objectOwners.orgId, orgId),
        eq(objectOwners.entityType, entityType),
        eq(objectOwners.entityId, entityId)
      )
    )
    .limit(1);

  return result.length > 0;
}
