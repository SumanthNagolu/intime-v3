/**
 * QUERY TEMPLATE
 *
 * Standard patterns for querying data with Drizzle ORM.
 * Copy and customize for each entity.
 *
 * @see docs/adrs/ADR-001-use-drizzle-orm.md
 * @see docs/adrs/ADR-002-standard-schema-patterns.md
 */

import { db } from '@/lib/db'
import { [ENTITY_NAME], type [EntityName] } from '@/lib/db/schema'
import { eq, and, isNull, desc, asc, like, gte, lte } from 'drizzle-orm'

/**
 * ==========================================
 * HELPER FUNCTIONS
 * ==========================================
 */

/** Exclude soft-deleted records */
function notDeleted() {
  return isNull([ENTITY_NAME].deletedAt)
}

/** Filter by organization */
function inOrg(orgId: string) {
  return eq([ENTITY_NAME].orgId, orgId)
}

/**
 * ==========================================
 * READ OPERATIONS
 * ==========================================
 */

/**
 * Get single record by ID
 * @param id - Entity ID
 * @param orgId - Organization ID (for multi-tenancy check)
 * @returns Entity or undefined
 */
export async function get[EntityName]ById(
  id: string,
  orgId: string
): Promise<[EntityName] | undefined> {
  return db.query.[ENTITY_NAME].findFirst({
    where: and(
      eq([ENTITY_NAME].id, id),
      inOrg(orgId),
      notDeleted()
    ),
  })
}

/**
 * Get all records for an organization
 * @param orgId - Organization ID
 * @param options - Query options (limit, offset, orderBy)
 * @returns Array of entities
 */
export async function get[EntityName]s(
  orgId: string,
  options?: {
    limit?: number
    offset?: number
    orderBy?: 'createdAt' | 'updatedAt' | 'name'
    order?: 'asc' | 'desc'
  }
): Promise<[EntityName][]> {
  const { limit = 50, offset = 0, orderBy = 'createdAt', order = 'desc' } = options || {}

  const orderByColumn = {
    createdAt: [ENTITY_NAME].createdAt,
    updatedAt: [ENTITY_NAME].updatedAt,
    name: [ENTITY_NAME].name,
  }[orderBy]

  const orderFn = order === 'asc' ? asc : desc

  return db.query.[ENTITY_NAME].findMany({
    where: and(
      inOrg(orgId),
      notDeleted()
    ),
    orderBy: orderFn(orderByColumn),
    limit,
    offset,
    // Include relations (customize as needed)
    with: {
      // org: true,
      // createdByUser: true,
      // children: true,
    },
  })
}

/**
 * Search records by name/description
 * @param orgId - Organization ID
 * @param query - Search query
 * @returns Matching entities
 */
export async function search[EntityName]s(
  orgId: string,
  query: string
): Promise<[EntityName][]> {
  return db.query.[ENTITY_NAME].findMany({
    where: and(
      inOrg(orgId),
      notDeleted(),
      // Search in name OR description (customize fields)
      or(
        like([ENTITY_NAME].name, `%${query}%`),
        like([ENTITY_NAME].description, `%${query}%`)
      )
    ),
    limit: 20, // Reasonable limit for search results
  })
}

/**
 * Count records in organization
 * @param orgId - Organization ID
 * @returns Total count (excluding soft-deleted)
 */
export async function count[EntityName]s(orgId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from([ENTITY_NAME])
    .where(and(
      inOrg(orgId),
      notDeleted()
    ))

  return result[0]?.count ?? 0
}

/**
 * Check if record exists
 * @param id - Entity ID
 * @param orgId - Organization ID
 * @returns Boolean
 */
export async function [entityName]Exists(
  id: string,
  orgId: string
): Promise<boolean> {
  const result = await get[EntityName]ById(id, orgId)
  return result !== undefined
}

/**
 * ==========================================
 * ADVANCED QUERIES (Customize per entity)
 * ==========================================
 */

/**
 * Get records created in date range
 * @param orgId - Organization ID
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Entities in range
 */
export async function get[EntityName]sInDateRange(
  orgId: string,
  startDate: Date,
  endDate: Date
): Promise<[EntityName][]> {
  return db.query.[ENTITY_NAME].findMany({
    where: and(
      inOrg(orgId),
      notDeleted(),
      gte([ENTITY_NAME].createdAt, startDate),
      lte([ENTITY_NAME].createdAt, endDate)
    ),
    orderBy: desc([ENTITY_NAME].createdAt),
  })
}

/**
 * Get recently updated records
 * @param orgId - Organization ID
 * @param limit - Number of records
 * @returns Recently updated entities
 */
export async function getRecent[EntityName]s(
  orgId: string,
  limit: number = 10
): Promise<[EntityName][]> {
  return db.query.[ENTITY_NAME].findMany({
    where: and(
      inOrg(orgId),
      notDeleted()
    ),
    orderBy: desc([ENTITY_NAME].updatedAt),
    limit,
  })
}

/**
 * ==========================================
 * RAW SQL QUERIES (for complex cases)
 * ==========================================
 */

/**
 * Example: Complex aggregation query
 * Use raw SQL when Drizzle query builder is too limiting
 */
export async function get[EntityName]Statistics(orgId: string) {
  const result = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as this_month
    FROM ${[ENTITY_NAME]}
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
  `)

  return result.rows[0]
}

/**
 * ==========================================
 * USAGE EXAMPLES
 * ==========================================
 */

/**
 * Example 1: Get all entities for current user's org
 *
 * ```typescript
 * const entities = await get[EntityName]s(currentUser.orgId)
 * ```
 *
 * Example 2: Search entities
 *
 * ```typescript
 * const results = await search[EntityName]s(currentUser.orgId, 'search term')
 * ```
 *
 * Example 3: Paginated list
 *
 * ```typescript
 * const page2 = await get[EntityName]s(currentUser.orgId, {
 *   limit: 25,
 *   offset: 25,
 *   orderBy: 'name',
 *   order: 'asc'
 * })
 * ```
 *
 * Example 4: Check existence before update
 *
 * ```typescript
 * if (await [entityName]Exists(id, currentUser.orgId)) {
 *   // Safe to update
 * }
 * ```
 */
