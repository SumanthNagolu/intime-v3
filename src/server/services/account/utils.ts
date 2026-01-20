/**
 * Account Service Utilities
 *
 * Provides helper functions for error handling, logging, and common operations.
 */

import { TRPCError } from '@trpc/server'

/**
 * Error codes for account operations
 */
export const AccountErrorCodes = {
  NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SAVE_FAILED: 'SAVE_FAILED',
  PARTIAL_SAVE: 'PARTIAL_SAVE',
} as const

/**
 * Result type for operations that may partially succeed
 */
export interface OperationResult<T = unknown> {
  success: boolean
  data?: T
  errors?: Array<{
    field?: string
    operation?: string
    message: string
    recoverable: boolean
  }>
}

/**
 * Wraps a service operation with standardized error handling and logging
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    service: string
    accountId: string
    userId: string
  }
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // Already a TRPCError - rethrow
    if (error instanceof TRPCError) {
      throw error
    }

    // Database error
    if (error instanceof Error) {
      console.error(`[${context.service}] Error for account ${context.accountId}:`, error.message)

      // Check for common database errors
      if (error.message.includes('violates foreign key constraint')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid reference: One or more related records do not exist',
          cause: error,
        })
      }

      if (error.message.includes('duplicate key')) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Record already exists',
          cause: error,
        })
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to save ${context.service}: ${error.message}`,
        cause: error,
      })
    }

    // Unknown error
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Unexpected error in ${context.service}`,
    })
  }
}

/**
 * Executes multiple operations and collects results
 * Continues on recoverable errors, stops on critical errors
 */
export async function executeBatch<T>(
  operations: Array<{
    name: string
    execute: () => Promise<T>
    critical?: boolean
  }>
): Promise<OperationResult<T[]>> {
  const results: T[] = []
  const errors: OperationResult['errors'] = []

  for (const op of operations) {
    try {
      const result = await op.execute()
      results.push(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      if (op.critical) {
        // Critical error - stop and report
        return {
          success: false,
          data: results,
          errors: [
            ...errors,
            {
              operation: op.name,
              message: errorMessage,
              recoverable: false,
            },
          ],
        }
      }

      // Non-critical - collect error and continue
      errors.push({
        operation: op.name,
        message: errorMessage,
        recoverable: true,
      })
    }
  }

  return {
    success: errors.length === 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Validates that required fields are present
 */
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const field of requiredFields) {
    const value = data[field]
    if (value === undefined || value === null || value === '') {
      missing.push(String(field))
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Creates a partial save result when some operations succeed
 */
export function createPartialResult<T>(
  successfulItems: T[],
  failedItems: Array<{ item: T; error: string }>
): OperationResult<T[]> {
  if (failedItems.length === 0) {
    return { success: true, data: successfulItems }
  }

  return {
    success: false,
    data: successfulItems,
    errors: failedItems.map((f) => ({
      message: f.error,
      recoverable: true,
    })),
  }
}
