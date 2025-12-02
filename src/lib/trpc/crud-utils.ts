/**
 * CRUD Router Utilities
 *
 * Helper functions for building standardized CRUD procedures.
 * These utilities reduce boilerplate while maintaining flexibility.
 */

import { z } from 'zod';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, asc, sql, isNull, ilike, or, inArray, gte, lte, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

// ==========================================
// COMMON INPUT SCHEMAS
// ==========================================

/**
 * Standard pagination input schema
 */
export const paginationInput = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
});

/**
 * Standard sort input schema
 */
export const sortInput = z.object({
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Standard search input schema
 */
export const searchInput = z.object({
  search: z.string().optional(),
});

/**
 * Standard date range input schema
 */
export const dateRangeInput = z.object({
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

/**
 * Combine common list inputs
 */
export const baseListInput = paginationInput
  .merge(sortInput)
  .merge(searchInput)
  .merge(dateRangeInput);

/**
 * Standard ID input schema
 */
export const idInput = z.object({
  id: z.string().uuid(),
});

/**
 * Bulk IDs input schema
 */
export const bulkIdsInput = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

// ==========================================
// QUERY HELPERS
// ==========================================

/**
 * Get user profile ID from auth ID
 */
export async function getUserProfileId(authId: string): Promise<string | null> {
  const result = await db
    .select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.authId, authId))
    .limit(1);

  return result[0]?.id ?? null;
}

/**
 * Build search condition for multiple fields
 */
export function buildSearchCondition<T extends PgTable>(
  searchValue: string,
  fields: Array<keyof T['_']['columns']>,
  table: T
): SQL | undefined {
  if (!searchValue || !fields.length) return undefined;

  const conditions = fields.map((field) => {
    const column = table[field as keyof T] as unknown;
    if (column && typeof column === 'object' && 'sql' in (column as object)) {
      return ilike(column as Parameters<typeof ilike>[0], `%${searchValue}%`);
    }
    return undefined;
  }).filter(Boolean) as SQL[];

  return conditions.length > 1 ? or(...conditions) : conditions[0];
}

/**
 * Build sort order
 */
export function buildSortOrder<T extends PgTable>(
  sortBy: string | undefined,
  sortDirection: 'asc' | 'desc',
  sortableFields: Record<string, keyof T['_']['columns']>,
  defaultColumn: keyof T['_']['columns'],
  table: T
): ReturnType<typeof asc> | ReturnType<typeof desc> {
  const columnKey = (sortBy && sortableFields[sortBy]) || defaultColumn;
  const column = table[columnKey as keyof T] as unknown;

  if (!column || typeof column !== 'object') {
    throw new Error(`Invalid sort column: ${String(columnKey)}`);
  }

  return sortDirection === 'asc'
    ? asc(column as Parameters<typeof asc>[0])
    : desc(column as Parameters<typeof desc>[0]);
}

/**
 * Build standard org and soft-delete conditions
 */
export function buildBaseConditions<T extends PgTable>(
  table: T,
  orgId: string,
  orgIdColumn: keyof T['_']['columns'] = 'orgId' as keyof T['_']['columns'],
  deletedAtColumn: keyof T['_']['columns'] = 'deletedAt' as keyof T['_']['columns']
): SQL[] {
  const conditions: SQL[] = [];

  const orgCol = table[orgIdColumn as keyof T] as unknown;
  if (orgCol && typeof orgCol === 'object') {
    conditions.push(eq(orgCol as Parameters<typeof eq>[0], orgId));
  }

  const deletedCol = table[deletedAtColumn as keyof T] as unknown;
  if (deletedCol && typeof deletedCol === 'object') {
    conditions.push(isNull(deletedCol as Parameters<typeof isNull>[0]));
  }

  return conditions;
}

/**
 * Execute paginated query with count
 */
export async function executePaginatedQuery<T extends PgTable, TResult>(
  table: T,
  conditions: SQL[],
  orderBy: ReturnType<typeof asc> | ReturnType<typeof desc>,
  page: number,
  pageSize: number,
  selectFields?: Parameters<typeof db.select>[0]
): Promise<{
  items: TResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const offset = (page - 1) * pageSize;

  const [items, countResult] = await Promise.all([
    (selectFields
      ? db.select(selectFields)
      : db.select()
    )
      .from(table)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset) as Promise<TResult[]>,
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
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
}

// ==========================================
// MUTATION HELPERS
// ==========================================

/**
 * Standard soft delete mutation
 */
export async function softDelete<T extends PgTable>(
  table: T,
  id: string,
  orgId: string,
  updatedById: string | null,
  idColumn: keyof T['_']['columns'] = 'id' as keyof T['_']['columns'],
  orgIdColumn: keyof T['_']['columns'] = 'orgId' as keyof T['_']['columns'],
  deletedAtColumn: keyof T['_']['columns'] = 'deletedAt' as keyof T['_']['columns'],
  updatedByColumn: keyof T['_']['columns'] = 'updatedBy' as keyof T['_']['columns']
): Promise<{ success: boolean }> {
  const idCol = table[idColumn as keyof T] as unknown;
  const orgCol = table[orgIdColumn as keyof T] as unknown;
  const deletedCol = table[deletedAtColumn as keyof T] as unknown;

  if (!idCol || !orgCol || !deletedCol) {
    throw new Error('Invalid table columns for soft delete');
  }

  const updateValues: Record<string, unknown> = {
    [deletedAtColumn as string]: new Date(),
  };

  if (updatedById) {
    updateValues[updatedByColumn as string] = updatedById;
  }

  const result = await db
    .update(table)
    .set(updateValues as Parameters<typeof db.update>[1])
    .where(
      and(
        eq(idCol as Parameters<typeof eq>[0], id),
        eq(orgCol as Parameters<typeof eq>[0], orgId),
        isNull(deletedCol as Parameters<typeof isNull>[0])
      )
    )
    .returning();

  if (!result.length) {
    throw new Error('Record not found or unauthorized');
  }

  return { success: true };
}

/**
 * Standard create mutation helper
 */
export function prepareCreateValues<T>(
  input: Record<string, unknown>,
  orgId: string,
  createdById: string | null,
  numericFields: string[] = []
): T {
  const values: Record<string, unknown> = {
    ...input,
    orgId,
    createdBy: createdById,
  };

  // Convert numeric fields to strings for database
  for (const field of numericFields) {
    if (values[field] !== undefined && values[field] !== null) {
      values[field] = String(values[field]);
    }
  }

  return values as T;
}

/**
 * Standard update mutation helper
 */
export function prepareUpdateValues<T>(
  input: Record<string, unknown>,
  updatedById: string | null,
  numericFields: string[] = []
): T {
  const values: Record<string, unknown> = {
    ...input,
    updatedAt: new Date(),
    updatedBy: updatedById,
  };

  // Convert numeric fields to strings for database
  for (const field of numericFields) {
    if (values[field] !== undefined && values[field] !== null) {
      values[field] = String(values[field]);
    }
  }

  return values as T;
}

// ==========================================
// STATS HELPERS
// ==========================================

/**
 * Build metrics/stats for list screens
 */
export interface ListMetrics {
  total: number;
  byStatus: Record<string, number>;
}

export async function getListMetrics<T extends PgTable>(
  table: T,
  conditions: SQL[],
  statusColumn: keyof T['_']['columns']
): Promise<ListMetrics> {
  const statusCol = table[statusColumn as keyof T] as unknown;

  if (!statusCol || typeof statusCol !== 'object') {
    throw new Error('Invalid status column');
  }

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(table)
    .where(and(...conditions));

  // Get counts by status
  const statusCounts = await db
    .select({
      status: statusCol as Parameters<typeof db.select>[0][keyof Parameters<typeof db.select>[0]],
      count: sql<number>`count(*)::int`,
    })
    .from(table)
    .where(and(...conditions))
    .groupBy(statusCol as Parameters<typeof db.select>[0][keyof Parameters<typeof db.select>[0]]);

  const byStatus: Record<string, number> = {};
  for (const row of statusCounts) {
    if (row.status) {
      byStatus[String(row.status)] = row.count;
    }
  }

  return {
    total: totalResult[0]?.count ?? 0,
    byStatus,
  };
}

// ==========================================
// TYPE EXPORTS
// ==========================================

export type PaginationInput = z.infer<typeof paginationInput>;
export type SortInput = z.infer<typeof sortInput>;
export type SearchInput = z.infer<typeof searchInput>;
export type DateRangeInput = z.infer<typeof dateRangeInput>;
export type BaseListInput = z.infer<typeof baseListInput>;
export type IdInput = z.infer<typeof idInput>;
export type BulkIdsInput = z.infer<typeof bulkIdsInput>;
