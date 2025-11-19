/**
 * MUTATION TEMPLATE
 *
 * Standard patterns for creating, updating, and deleting data with Drizzle ORM.
 * Copy and customize for each entity.
 *
 * @see docs/adrs/ADR-001-use-drizzle-orm.md
 * @see docs/adrs/ADR-002-standard-schema-patterns.md
 */

import { db } from '@/lib/db'
import { [ENTITY_NAME], type New[EntityName], type [EntityName] } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

/**
 * ==========================================
 * HELPER TYPES
 * ==========================================
 */

/** Result type for mutations (type-safe error handling) */
export type MutationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

/**
 * ==========================================
 * CREATE OPERATIONS
 * ==========================================
 */

/**
 * Create a new record
 * @param data - Entity data (without audit fields)
 * @param userId - User performing the action
 * @returns Created entity or error
 */
export async function create[EntityName](
  data: Omit<New[EntityName], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt'>,
  userId: string
): Promise<MutationResult<[EntityName]>> {
  try {
    const [entity] = await db
      .insert([ENTITY_NAME])
      .values({
        ...data,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning()

    return { success: true, data: entity }
  } catch (error) {
    console.error('Error creating [entityName]:', error)

    // Handle specific error types
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes('unique_violation')) {
        return {
          success: false,
          error: 'A [entityName] with this information already exists',
          code: 'DUPLICATE_ENTRY',
        }
      }

      // Foreign key violation
      if (error.message.includes('foreign_key_violation')) {
        return {
          success: false,
          error: 'Related record not found',
          code: 'INVALID_REFERENCE',
        }
      }
    }

    return {
      success: false,
      error: 'Failed to create [entityName]',
      code: 'CREATE_FAILED',
    }
  }
}

/**
 * Create multiple records (bulk insert)
 * @param dataArray - Array of entity data
 * @param userId - User performing the action
 * @returns Created entities or error
 */
export async function create[EntityName]sBulk(
  dataArray: Array<Omit<New[EntityName], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt'>>,
  userId: string
): Promise<MutationResult<[EntityName][]>> {
  try {
    const entities = await db
      .insert([ENTITY_NAME])
      .values(
        dataArray.map(data => ({
          ...data,
          createdBy: userId,
          updatedBy: userId,
        }))
      )
      .returning()

    return { success: true, data: entities }
  } catch (error) {
    console.error('Error bulk creating [entityName]s:', error)
    return {
      success: false,
      error: 'Failed to bulk create [entityName]s',
      code: 'BULK_CREATE_FAILED',
    }
  }
}

/**
 * ==========================================
 * UPDATE OPERATIONS
 * ==========================================
 */

/**
 * Update a record
 * @param id - Entity ID
 * @param data - Partial entity data to update
 * @param userId - User performing the action
 * @param orgId - Organization ID (for multi-tenancy check)
 * @returns Updated entity or error
 */
export async function update[EntityName](
  id: string,
  data: Partial<Omit<[EntityName], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'orgId'>>,
  userId: string,
  orgId: string
): Promise<MutationResult<[EntityName]>> {
  try {
    const [updated] = await db
      .update([ENTITY_NAME])
      .set({
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq([ENTITY_NAME].id, id),
          eq([ENTITY_NAME].orgId, orgId), // Multi-tenancy check
          isNull([ENTITY_NAME].deletedAt) // Can't update deleted records
        )
      )
      .returning()

    if (!updated) {
      return {
        success: false,
        error: '[EntityName] not found or you don\'t have permission to update it',
        code: 'NOT_FOUND',
      }
    }

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error updating [entityName]:', error)
    return {
      success: false,
      error: 'Failed to update [entityName]',
      code: 'UPDATE_FAILED',
    }
  }
}

/**
 * Update multiple records (bulk update)
 * @param updates - Array of { id, data } pairs
 * @param userId - User performing the action
 * @param orgId - Organization ID
 * @returns Updated entities or error
 */
export async function update[EntityName]sBulk(
  updates: Array<{
    id: string
    data: Partial<Omit<[EntityName], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt' | 'orgId'>>
  }>,
  userId: string,
  orgId: string
): Promise<MutationResult<[EntityName][]>> {
  try {
    // Execute updates in parallel (within transaction if needed)
    const results = await Promise.all(
      updates.map(({ id, data }) =>
        update[EntityName](id, data, userId, orgId)
      )
    )

    // Check if any failed
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      return {
        success: false,
        error: `${failures.length} updates failed`,
        code: 'PARTIAL_UPDATE_FAILED',
      }
    }

    const updated = results.map(r => r.success && r.data).filter(Boolean) as [EntityName][]

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error bulk updating [entityName]s:', error)
    return {
      success: false,
      error: 'Failed to bulk update [entityName]s',
      code: 'BULK_UPDATE_FAILED',
    }
  }
}

/**
 * ==========================================
 * DELETE OPERATIONS (SOFT DELETE)
 * ==========================================
 */

/**
 * Soft delete a record
 * @param id - Entity ID
 * @param userId - User performing the action
 * @param orgId - Organization ID
 * @returns Deleted entity or error
 */
export async function softDelete[EntityName](
  id: string,
  userId: string,
  orgId: string
): Promise<MutationResult<[EntityName]>> {
  try {
    const [deleted] = await db
      .update([ENTITY_NAME])
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq([ENTITY_NAME].id, id),
          eq([ENTITY_NAME].orgId, orgId),
          isNull([ENTITY_NAME].deletedAt) // Already deleted
        )
      )
      .returning()

    if (!deleted) {
      return {
        success: false,
        error: '[EntityName] not found or already deleted',
        code: 'NOT_FOUND',
      }
    }

    return { success: true, data: deleted }
  } catch (error) {
    console.error('Error soft deleting [entityName]:', error)
    return {
      success: false,
      error: 'Failed to delete [entityName]',
      code: 'DELETE_FAILED',
    }
  }
}

/**
 * Restore a soft-deleted record
 * @param id - Entity ID
 * @param userId - User performing the action
 * @param orgId - Organization ID
 * @returns Restored entity or error
 */
export async function restore[EntityName](
  id: string,
  userId: string,
  orgId: string
): Promise<MutationResult<[EntityName]>> {
  try {
    const [restored] = await db
      .update([ENTITY_NAME])
      .set({
        deletedAt: null,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq([ENTITY_NAME].id, id),
          eq([ENTITY_NAME].orgId, orgId)
          // Note: No isNull check, we want deleted records
        )
      )
      .returning()

    if (!restored) {
      return {
        success: false,
        error: '[EntityName] not found',
        code: 'NOT_FOUND',
      }
    }

    return { success: true, data: restored }
  } catch (error) {
    console.error('Error restoring [entityName]:', error)
    return {
      success: false,
      error: 'Failed to restore [entityName]',
      code: 'RESTORE_FAILED',
    }
  }
}

/**
 * Hard delete a record (USE WITH EXTREME CAUTION)
 * Only for: test data cleanup, GDPR compliance, etc.
 * @param id - Entity ID
 * @param orgId - Organization ID
 * @returns Success or error
 */
export async function hardDelete[EntityName](
  id: string,
  orgId: string
): Promise<MutationResult<{ id: string }>> {
  try {
    const [deleted] = await db
      .delete([ENTITY_NAME])
      .where(
        and(
          eq([ENTITY_NAME].id, id),
          eq([ENTITY_NAME].orgId, orgId)
        )
      )
      .returning({ id: [ENTITY_NAME].id })

    if (!deleted) {
      return {
        success: false,
        error: '[EntityName] not found',
        code: 'NOT_FOUND',
      }
    }

    return { success: true, data: deleted }
  } catch (error) {
    console.error('Error hard deleting [entityName]:', error)

    // Foreign key constraint (children exist)
    if (error instanceof Error && error.message.includes('foreign_key_violation')) {
      return {
        success: false,
        error: 'Cannot delete [entityName] because it has related records',
        code: 'HAS_DEPENDENCIES',
      }
    }

    return {
      success: false,
      error: 'Failed to delete [entityName]',
      code: 'HARD_DELETE_FAILED',
    }
  }
}

/**
 * ==========================================
 * TRANSACTION EXAMPLES
 * ==========================================
 */

/**
 * Example: Create entity with related records (transaction)
 * Customize this pattern for your specific needs
 */
export async function create[EntityName]WithChildren(
  entityData: Omit<New[EntityName], 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'deletedAt'>,
  childrenData: Array<any>, // Replace with actual child type
  userId: string
): Promise<MutationResult<{ entity: [EntityName]; children: any[] }>> {
  try {
    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Step 1: Create parent
      const [entity] = await tx
        .insert([ENTITY_NAME])
        .values({
          ...entityData,
          createdBy: userId,
          updatedBy: userId,
        })
        .returning()

      // Step 2: Create children
      const children = await tx
        .insert(childTable)
        .values(
          childrenData.map(data => ({
            ...data,
            [entityName]Id: entity.id,
            createdBy: userId,
            updatedBy: userId,
          }))
        )
        .returning()

      return { entity, children }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating [entityName] with children:', error)
    return {
      success: false,
      error: 'Failed to create [entityName] with children',
      code: 'TRANSACTION_FAILED',
    }
  }
}

/**
 * ==========================================
 * USAGE EXAMPLES
 * ==========================================
 */

/**
 * Example 1: Create with error handling
 *
 * ```typescript
 * const result = await create[EntityName](
 *   {
 *     name: 'Example',
 *     orgId: currentUser.orgId,
 *   },
 *   currentUser.id
 * )
 *
 * if (result.success) {
 *   console.log('Created:', result.data)
 * } else {
 *   console.error('Error:', result.error)
 *   if (result.code === 'DUPLICATE_ENTRY') {
 *     // Handle duplicate
 *   }
 * }
 * ```
 *
 * Example 2: Update with validation
 *
 * ```typescript
 * const result = await update[EntityName](
 *   id,
 *   { name: 'Updated Name' },
 *   currentUser.id,
 *   currentUser.orgId
 * )
 *
 * if (!result.success) {
 *   throw new Error(result.error)
 * }
 * ```
 *
 * Example 3: Soft delete with confirmation
 *
 * ```typescript
 * const confirmed = await askUserConfirmation('Delete this [entityName]?')
 * if (confirmed) {
 *   const result = await softDelete[EntityName](id, currentUser.id, currentUser.orgId)
 *   if (result.success) {
 *     toast.success('[EntityName] deleted')
 *   }
 * }
 * ```
 *
 * Example 4: Server Action pattern
 *
 * ```typescript
 * 'use server'
 *
 * import { create[EntityName] } from '@/lib/db/mutations/[entityName]'
 * import { [entityName]Schema } from '@/lib/validations/[entityName]'
 *
 * export async function createServerAction(formData: FormData) {
 *   const currentUser = await getCurrentUser()
 *   if (!currentUser) {
 *     return { success: false, error: 'Unauthorized' }
 *   }
 *
 *   // Validate input
 *   const validated = [entityName]Schema.parse({
 *     name: formData.get('name'),
 *     // ... other fields
 *   })
 *
 *   // Create
 *   return create[EntityName](
 *     { ...validated, orgId: currentUser.orgId },
 *     currentUser.id
 *   )
 * }
 * ```
 */
