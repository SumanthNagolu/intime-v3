/**
 * Permission Management Types
 *
 * Type definitions for the RBAC permission system including
 * permissions, roles, overrides, feature flags, and API tokens.
 */

// =============================================================================
// SCOPE TYPES
// =============================================================================

/**
 * Data scope levels for permission access control.
 * Determines what records a user can access/modify.
 */
export type PermissionScope =
  | 'own'        // User's own records only
  | 'own_raci'   // Records where user is R, A, C, or I
  | 'own_ra'     // Records where user is R or A only
  | 'team'       // Team/pod members' records
  | 'region'     // Regional records
  | 'org'        // Organization-wide access
  | 'draft_only' // Can only modify draft records

/**
 * Actions that can be performed on objects
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'manage'
  | 'assign'

/**
 * Object types that permissions apply to
 */
export type ObjectType =
  | 'jobs'
  | 'candidates'
  | 'submissions'
  | 'accounts'
  | 'users'
  | 'reports'
  | 'settings'
  | 'permissions'
  | 'pods'
  | 'consultants'
  | 'leads'

// =============================================================================
// PERMISSION TYPES
// =============================================================================

/**
 * Permission definition
 */
export interface Permission {
  id: string
  code: string
  name: string
  description: string | null
  objectType: ObjectType
  action: PermissionAction
  createdAt: Date
  deletedAt: Date | null
}

/**
 * Role-permission mapping with scope
 */
export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  scopeCondition: PermissionScope
  granted: boolean
  createdAt: Date
  grantedBy: string | null
}

/**
 * User-specific permission override
 */
export interface PermissionOverride {
  id: string
  orgId: string
  userId: string
  permissionId: string
  granted: boolean
  scopeOverride: PermissionScope | null
  reason: string
  expiresAt: Date | null
  createdBy: string
  createdAt: Date
  revokedAt: Date | null
  revokedBy: string | null
}

// =============================================================================
// PERMISSION CHECK TYPES
// =============================================================================

/**
 * Step in the permission evaluation chain
 */
export interface PermissionChainStep {
  step: string
  result: 'pass' | 'fail' | 'skip'
  detail: string
}

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason: string
  chain: PermissionChainStep[]
  scope?: PermissionScope
}

/**
 * User context for permission evaluation
 */
export interface UserContext {
  id: string
  roleId: string
  roleName: string
  roleCode: string
  orgId: string
  podId?: string
  regionId?: string
  status: string
}

// =============================================================================
// FEATURE FLAG TYPES
// =============================================================================

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  id: string
  orgId: string | null
  code: string
  name: string
  description: string | null
  defaultEnabled: boolean
  isGlobal: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

/**
 * Feature flag role assignment
 */
export interface FeatureFlagRole {
  id: string
  featureFlagId: string
  roleId: string
  enabled: boolean
  createdAt: Date
}

// =============================================================================
// API TOKEN TYPES
// =============================================================================

/**
 * API token for programmatic access
 */
export interface ApiToken {
  id: string
  orgId: string
  name: string
  tokenHash: string
  tokenPrefix: string
  scopes: string[]
  expiresAt: Date | null
  lastUsedAt: Date | null
  lastUsedIp: string | null
  usageCount: number
  rateLimitPerHour: number
  createdBy: string
  createdAt: Date
  revokedAt: Date | null
  revokedBy: string | null
}

/**
 * API token with visible token (only on creation)
 */
export interface ApiTokenWithSecret extends ApiToken {
  token: string
}

// =============================================================================
// BULK UPDATE TYPES
// =============================================================================

/**
 * Types of bulk permission updates
 */
export type BulkUpdateType =
  | 'enable_feature'
  | 'disable_feature'
  | 'change_scope'
  | 'add_permission'
  | 'remove_permission'

/**
 * Bulk update history entry
 */
export interface BulkUpdateHistory {
  id: string
  orgId: string
  updateType: BulkUpdateType
  affectedUserIds: string[]
  changes: Record<string, unknown>
  previousState: Record<string, unknown>
  reason: string
  appliedBy: string
  appliedAt: Date
  rolledBackAt: Date | null
  rolledBackBy: string | null
}

// =============================================================================
// ROLE TYPES
// =============================================================================

/**
 * Role category classification
 */
export type RoleCategory =
  | 'pod_ic'
  | 'pod_manager'
  | 'leadership'
  | 'executive'
  | 'portal'
  | 'admin'

/**
 * System role definition
 */
export interface SystemRole {
  id: string
  code: string
  name: string
  displayName: string
  description: string | null
  category: RoleCategory
  hierarchyLevel: number
  podType: string | null
  defaultPermissions: string[]
  isSystemRole: boolean
  isActive: boolean
  colorCode: string | null
  iconName: string | null
}

// =============================================================================
// MATRIX TYPES (for UI)
// =============================================================================

/**
 * Permission matrix row
 */
export interface PermissionMatrixRow {
  permission: {
    id: string
    code: string
    name: string
    action: PermissionAction
  }
  rolePermissions: Array<{
    roleId: string
    roleName: string
    granted: boolean
    scope: PermissionScope | null
  }>
}

/**
 * Permission matrix response
 */
export interface PermissionMatrix {
  matrix: PermissionMatrixRow[]
  roles: SystemRole[]
  objectType: ObjectType
}

/**
 * Role comparison result
 */
export interface RoleComparisonResult {
  role1: SystemRole
  role2: SystemRole
  permissionComparison: Array<{
    permission: Permission
    role1: { granted: boolean; scope: PermissionScope | null }
    role2: { granted: boolean; scope: PermissionScope | null }
    different: boolean
  }>
  featureComparison: Array<{
    featureCode: string
    featureName: string
    role1Enabled: boolean
    role2Enabled: boolean
    different: boolean
  }>
}
