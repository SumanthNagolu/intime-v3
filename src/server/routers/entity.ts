/**
 * Unified Entity Router
 *
 * A single router that handles CRUD operations for all entity types.
 * Uses the entity schema to determine validation and behavior.
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, orgProtectedProcedure } from '../trpc'
import { getEntitySchema, isValidEntityType, type EntityType } from '@/lib/entity/schema'

// Import schemas to register them
import '@/lib/entity/schemas'

// ============================================
// Input Schemas
// ============================================

const entityTypeSchema = z.enum([
  'job',
  'candidate',
  'account',
  'contact',
  'lead',
  'deal',
  'submission',
  'placement',
  'interview',
  'campaign',
  'team',
])

const listInputSchema = z.object({
  type: entityTypeSchema,
  filters: z.record(z.unknown()).optional(),
  search: z.string().optional(),
  sort: z
    .object({
      key: z.string(),
      direction: z.enum(['asc', 'desc']),
    })
    .optional(),
  pagination: z
    .object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(25),
    })
    .optional(),
})

const getInputSchema = z.object({
  type: entityTypeSchema,
  id: z.string().uuid(),
})

const createInputSchema = z.object({
  type: entityTypeSchema,
  data: z.record(z.unknown()),
})

const updateInputSchema = z.object({
  type: entityTypeSchema,
  id: z.string().uuid(),
  data: z.record(z.unknown()),
})

const deleteInputSchema = z.object({
  type: entityTypeSchema,
  id: z.string().uuid(),
})

const transitionInputSchema = z.object({
  type: entityTypeSchema,
  id: z.string().uuid(),
  toStatus: z.string(),
  reason: z.string().optional(),
})

// ============================================
// Helper Functions
// ============================================

/**
 * Get the database table name for an entity type
 */
function getTableName(entityType: EntityType): string {
  const tableMap: Record<EntityType, string> = {
    job: 'jobs',
    candidate: 'candidates',
    account: 'accounts',
    contact: 'contacts',
    lead: 'leads',
    deal: 'deals',
    submission: 'submissions',
    placement: 'placements',
    interview: 'interviews',
    campaign: 'campaigns',
    team: 'teams',
  }
  return tableMap[entityType]
}

/**
 * Validate status transition
 */
function validateTransition(
  entityType: EntityType,
  currentStatus: string,
  newStatus: string
): void {
  const schema = getEntitySchema(entityType)
  const transitions = schema.status.transitions

  if (!transitions) {
    // No transitions defined = all transitions allowed
    return
  }

  const validTargets = transitions[currentStatus]
  if (!validTargets || !validTargets.includes(newStatus)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
    })
  }
}

// ============================================
// Entity Router
// ============================================

export const entityRouter = router({
  /**
   * List entities with filtering, sorting, and pagination
   */
  list: orgProtectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      const { type, filters, search, sort, pagination } = input
      const schema = getEntitySchema(type)
      const tableName = getTableName(type)

      // Build query
      // In a real implementation, this would use Drizzle ORM
      // For now, we return a mock response

      console.log(`[entity.list] ${type}`, { filters, search, sort, pagination })

      // Mock response structure
      return {
        items: [],
        pagination: {
          total: 0,
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || 25,
          totalPages: 0,
        },
      }
    }),

  /**
   * Get a single entity with all related data
   */
  get: orgProtectedProcedure
    .input(getInputSchema)
    .query(async ({ ctx, input }) => {
      const { type, id } = input
      const schema = getEntitySchema(type)
      const tableName = getTableName(type)

      console.log(`[entity.get] ${type}/${id}`)

      // In a real implementation, this would:
      // 1. Fetch the entity from the database
      // 2. Load all related data in parallel using Promise.all
      // 3. Return the complete entity with sections

      // Mock response for now
      return {
        id,
        type,
        // Additional fields would come from the database
      }
    }),

  /**
   * Create a new entity
   */
  create: orgProtectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { type, data } = input
      const schema = getEntitySchema(type)
      const tableName = getTableName(type)

      console.log(`[entity.create] ${type}`, data)

      // In a real implementation, this would:
      // 1. Validate data against the entity's field definitions
      // 2. Insert into the database with org_id and audit fields
      // 3. Emit a creation event
      // 4. Return the created entity

      return {
        id: 'new-entity-id',
        ...data,
      }
    }),

  /**
   * Update an existing entity
   */
  update: orgProtectedProcedure
    .input(updateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { type, id, data } = input
      const schema = getEntitySchema(type)
      const tableName = getTableName(type)

      console.log(`[entity.update] ${type}/${id}`, data)

      // In a real implementation, this would:
      // 1. Verify the entity exists and belongs to the org
      // 2. Validate the update data
      // 3. Update the database with audit fields
      // 4. Emit an update event
      // 5. Return the updated entity

      return {
        id,
        ...data,
      }
    }),

  /**
   * Soft delete an entity
   */
  delete: orgProtectedProcedure
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { type, id } = input
      const tableName = getTableName(type)

      console.log(`[entity.delete] ${type}/${id}`)

      // In a real implementation, this would:
      // 1. Verify the entity exists and belongs to the org
      // 2. Set deleted_at timestamp (soft delete)
      // 3. Emit a deletion event

      return { success: true }
    }),

  /**
   * Transition an entity to a new status
   */
  transition: orgProtectedProcedure
    .input(transitionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { type, id, toStatus, reason } = input
      const schema = getEntitySchema(type)
      const tableName = getTableName(type)

      console.log(`[entity.transition] ${type}/${id} -> ${toStatus}`)

      // In a real implementation, this would:
      // 1. Fetch current entity status
      // 2. Validate the transition
      // 3. Update the status
      // 4. Record status history
      // 5. Emit a status_changed event

      // Mock current status for validation
      const currentStatus = 'draft' // Would come from database
      validateTransition(type, currentStatus, toStatus)

      return {
        id,
        status: toStatus,
      }
    }),

  /**
   * Get entity counts by status (for sidebar badges)
   */
  counts: orgProtectedProcedure
    .input(z.object({ type: entityTypeSchema }))
    .query(async ({ ctx, input }) => {
      const { type } = input
      const schema = getEntitySchema(type)

      console.log(`[entity.counts] ${type}`)

      // Return counts by status
      const counts: Record<string, number> = {}
      for (const status of schema.status.values) {
        counts[status.value] = 0 // Would come from database
      }

      return counts
    }),

  /**
   * Search across all entities
   */
  search: orgProtectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        types: z.array(entityTypeSchema).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, types, limit } = input

      console.log(`[entity.search] "${query}"`, { types, limit })

      // In a real implementation, this would:
      // 1. Search across all specified entity types (or all if not specified)
      // 2. Use full-text search or LIKE queries
      // 3. Return aggregated results with entity type

      return {
        results: [],
        total: 0,
      }
    }),
})

export type EntityRouter = typeof entityRouter
