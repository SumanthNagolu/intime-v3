/**
 * Auth Module Exports
 *
 * Centralized exports for authentication and authorization functionality.
 */

// Client-side auth functions
export * from './client'

// Permission types
export * from './permission-types'

// Permission evaluation (server-side)
export {
  evaluatePermission,
  hasFeatureFlag,
  getUserContext,
  checkPermissions,
} from './permission-evaluator'
