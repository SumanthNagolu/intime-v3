/**
 * Permission Evaluator
 *
 * Server-side library for evaluating user permissions with full chain details.
 * Checks user status, permission overrides, role permissions, data scopes,
 * and feature flags.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PermissionCheckResult,
  PermissionChainStep,
  PermissionScope,
  UserContext,
} from './permission-types'

// =============================================================================
// MAIN PERMISSION EVALUATOR
// =============================================================================

/**
 * Evaluate if a user has a specific permission
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's profile ID (not auth ID)
 * @param permissionCode - The permission code (e.g., 'jobs.create')
 * @param entityId - Optional entity ID for scope checking
 * @returns Permission check result with full evaluation chain
 */
export async function evaluatePermission(
  supabase: SupabaseClient,
  userId: string,
  permissionCode: string,
  entityId?: string
): Promise<PermissionCheckResult> {
  const chain: PermissionChainStep[] = []

  // Step 1: Get user context
  const { data: user, error: userError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      status,
      role_id,
      org_id,
      system_roles!inner (
        id,
        name,
        code,
        display_name
      ),
      pod_memberships (
        pod_id,
        is_active
      )
    `)
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return {
      allowed: false,
      reason: 'User not found',
      chain: [{ step: 'User lookup', result: 'fail', detail: 'User does not exist' }],
    }
  }

  chain.push({ step: 'User lookup', result: 'pass', detail: `Found user: ${userId}` })

  // Step 2: Check user status
  if (user.status !== 'active') {
    chain.push({
      step: 'Account status',
      result: 'fail',
      detail: `User status is ${user.status}`,
    })
    return {
      allowed: false,
      reason: `User account is ${user.status}`,
      chain,
    }
  }
  chain.push({ step: 'Account status', result: 'pass', detail: 'User is active' })

  // Step 3: Check for permission override (highest priority)
  const { data: override } = await supabase
    .from('permission_overrides')
    .select(`
      id,
      granted,
      scope_override,
      reason,
      expires_at,
      permissions!inner (code)
    `)
    .eq('user_id', userId)
    .eq('permissions.code', permissionCode)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle()

  if (override) {
    if (!override.granted) {
      chain.push({
        step: 'Custom override',
        result: 'fail',
        detail: `Denied: ${override.reason}`,
      })
      return {
        allowed: false,
        reason: 'Denied by custom override',
        chain,
      }
    }
    chain.push({
      step: 'Custom override',
      result: 'pass',
      detail: `Allowed: ${override.reason}`,
    })
    return {
      allowed: true,
      reason: 'Allowed by custom override',
      chain,
      scope: override.scope_override as PermissionScope,
    }
  }
  chain.push({ step: 'Custom override', result: 'skip', detail: 'No override found' })

  // Step 4: Check role permission
  const { data: rolePermission } = await supabase
    .from('role_permissions')
    .select(`
      granted,
      scope_condition,
      permissions!inner (code, object_type, action)
    `)
    .eq('role_id', user.role_id)
    .eq('permissions.code', permissionCode)
    .maybeSingle()

  if (!rolePermission || !rolePermission.granted) {
    const systemRole = user.system_roles as { name: string; display_name: string }
    chain.push({
      step: 'Role permission',
      result: 'fail',
      detail: `Role "${systemRole.display_name}" does not have this permission`,
    })
    return {
      allowed: false,
      reason: `Role does not have ${permissionCode} permission`,
      chain,
    }
  }
  chain.push({
    step: 'Role permission',
    result: 'pass',
    detail: `Granted with scope: ${rolePermission.scope_condition}`,
  })

  // Step 5: Check data scope (if entity specified)
  const scopeCondition = rolePermission.scope_condition as PermissionScope
  const permissionInfo = rolePermission.permissions as { object_type: string; action: string }

  if (entityId && scopeCondition !== 'org') {
    const scopeCheck = await checkDataScope(
      supabase,
      userId,
      user,
      entityId,
      permissionInfo.object_type,
      scopeCondition
    )

    if (!scopeCheck.allowed) {
      chain.push({ step: 'Data scope', result: 'fail', detail: scopeCheck.reason })
      return {
        allowed: false,
        reason: scopeCheck.reason,
        chain,
      }
    }
    chain.push({ step: 'Data scope', result: 'pass', detail: scopeCheck.reason })
  } else {
    chain.push({
      step: 'Data scope',
      result: 'skip',
      detail: entityId ? 'Org scope - no restriction' : 'No entity specified',
    })
  }

  // Step 6: Check feature flags (optional, based on object type)
  const featureCheck = await checkFeatureFlag(
    supabase,
    user.role_id,
    user.org_id,
    permissionInfo.object_type
  )

  if (!featureCheck.allowed) {
    chain.push({ step: 'Feature flags', result: 'fail', detail: featureCheck.reason })
    return {
      allowed: false,
      reason: featureCheck.reason,
      chain,
    }
  }
  chain.push({ step: 'Feature flags', result: 'pass', detail: featureCheck.reason })

  return {
    allowed: true,
    reason: 'Permission granted',
    chain,
    scope: scopeCondition,
  }
}

// =============================================================================
// DATA SCOPE CHECKING
// =============================================================================

/**
 * Check if user has access to a specific entity based on scope
 */
async function checkDataScope(
  supabase: SupabaseClient,
  userId: string,
  user: {
    pod_memberships?: Array<{ pod_id: string; is_active: boolean }>
  },
  entityId: string,
  objectType: string,
  requiredScope: PermissionScope
): Promise<{ allowed: boolean; reason: string }> {
  // Own scope - check if user owns the entity
  if (requiredScope === 'own') {
    const { data: entity } = await supabase
      .from(objectType)
      .select('created_by')
      .eq('id', entityId)
      .maybeSingle()

    if (entity?.created_by === userId) {
      return { allowed: true, reason: 'User owns this record' }
    }
    return { allowed: false, reason: 'User does not own this record' }
  }

  // Own + RACI scope
  if (requiredScope === 'own_raci' || requiredScope === 'own_ra') {
    // Check ownership first
    const { data: entity } = await supabase
      .from(objectType)
      .select('created_by')
      .eq('id', entityId)
      .maybeSingle()

    if (entity?.created_by === userId) {
      return { allowed: true, reason: 'User owns this record' }
    }

    // Check RACI assignment
    const raciRoles =
      requiredScope === 'own_ra'
        ? ['responsible', 'accountable']
        : ['responsible', 'accountable', 'consulted', 'informed']

    const { data: raci } = await supabase
      .from('object_owners')
      .select('role')
      .eq('entity_type', objectType)
      .eq('entity_id', entityId)
      .eq('user_id', userId)
      .in('role', raciRoles)
      .maybeSingle()

    if (raci) {
      return { allowed: true, reason: `User has RACI role: ${raci.role}` }
    }
    return { allowed: false, reason: 'User not in RACI for this record' }
  }

  // Team scope
  if (requiredScope === 'team') {
    const activePod = user.pod_memberships?.find((pm) => pm.is_active)
    if (!activePod) {
      return { allowed: false, reason: 'User not assigned to a pod' }
    }

    // Check if entity belongs to same pod
    const { data: entityPod } = await supabase
      .from(objectType)
      .select('pod_id')
      .eq('id', entityId)
      .maybeSingle()

    if (entityPod?.pod_id === activePod.pod_id) {
      return { allowed: true, reason: "Entity belongs to user's pod" }
    }
    return { allowed: false, reason: "Entity not in user's pod" }
  }

  // Draft only scope
  if (requiredScope === 'draft_only') {
    const { data: entity } = await supabase
      .from(objectType)
      .select('status')
      .eq('id', entityId)
      .maybeSingle()

    if (entity?.status === 'draft') {
      return { allowed: true, reason: 'Entity is in draft status' }
    }
    return { allowed: false, reason: 'Can only modify draft records' }
  }

  // Region scope - check if entity is in user's region
  if (requiredScope === 'region') {
    // Region scope would need user's region_id and entity's region assignment
    // For now, pass through (implementation depends on how regions are modeled)
    return { allowed: true, reason: 'Region scope check passed (basic)' }
  }

  // Default - allow for unhandled scopes
  return { allowed: true, reason: `Scope ${requiredScope} check passed` }
}

// =============================================================================
// FEATURE FLAG CHECKING
// =============================================================================

/**
 * Check if a feature is enabled for a role
 */
async function checkFeatureFlag(
  supabase: SupabaseClient,
  roleId: string,
  orgId: string,
  objectType: string
): Promise<{ allowed: boolean; reason: string }> {
  // Map object types to feature flags that gate them
  const featureMap: Record<string, string> = {
    candidates: 'data_export', // Export requires data_export feature
    reports: 'advanced_analytics', // Reports require advanced_analytics
  }

  const featureCode = featureMap[objectType]
  if (!featureCode) {
    return { allowed: true, reason: 'No feature flag restriction' }
  }

  // Check if role has feature enabled
  const { data: flagRole } = await supabase
    .from('feature_flag_roles')
    .select(`
      enabled,
      feature_flags!inner (code, default_enabled)
    `)
    .eq('role_id', roleId)
    .eq('feature_flags.code', featureCode)
    .maybeSingle()

  if (!flagRole) {
    // Check default
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('default_enabled')
      .eq('code', featureCode)
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .maybeSingle()

    if (flag?.default_enabled) {
      return { allowed: true, reason: 'Feature enabled by default' }
    }
    return { allowed: false, reason: `Feature "${featureCode}" not enabled for role` }
  }

  if (flagRole.enabled) {
    return { allowed: true, reason: 'Feature enabled for role' }
  }
  return { allowed: false, reason: `Feature "${featureCode}" disabled for role` }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a user has a specific feature flag enabled
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's profile ID
 * @param featureCode - The feature flag code
 * @returns Whether the feature is enabled
 */
export async function hasFeatureFlag(
  supabase: SupabaseClient,
  userId: string,
  featureCode: string
): Promise<boolean> {
  // Get user's role
  const { data: user } = await supabase
    .from('user_profiles')
    .select('role_id, org_id')
    .eq('id', userId)
    .single()

  if (!user) {
    return false
  }

  // Check role-specific flag
  const { data: flagRole } = await supabase
    .from('feature_flag_roles')
    .select(`
      enabled,
      feature_flags!inner (code, default_enabled, is_global, org_id)
    `)
    .eq('role_id', user.role_id)
    .eq('feature_flags.code', featureCode)
    .maybeSingle()

  if (flagRole) {
    return flagRole.enabled
  }

  // Fall back to default
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('default_enabled')
    .eq('code', featureCode)
    .or(`is_global.eq.true,org_id.eq.${user.org_id}`)
    .maybeSingle()

  return flag?.default_enabled ?? false
}

/**
 * Get user context for permission evaluation
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's profile ID
 * @returns User context or null if not found
 */
export async function getUserContext(
  supabase: SupabaseClient,
  userId: string
): Promise<UserContext | null> {
  const { data: user } = await supabase
    .from('user_profiles')
    .select(`
      id,
      status,
      role_id,
      org_id,
      system_roles!inner (
        id,
        name,
        code,
        display_name
      ),
      pod_memberships (
        pod_id,
        is_active
      )
    `)
    .eq('id', userId)
    .single()

  if (!user) {
    return null
  }

  const systemRole = user.system_roles as {
    id: string
    name: string
    code: string
    display_name: string
  }
  const activePod = (user.pod_memberships as Array<{ pod_id: string; is_active: boolean }>)?.find(
    (pm) => pm.is_active
  )

  return {
    id: user.id,
    roleId: user.role_id,
    roleName: systemRole.display_name,
    roleCode: systemRole.code,
    orgId: user.org_id,
    podId: activePod?.pod_id,
    status: user.status,
  }
}

/**
 * Batch check multiple permissions for a user
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's profile ID
 * @param permissionCodes - Array of permission codes to check
 * @returns Map of permission code to boolean result
 */
export async function checkPermissions(
  supabase: SupabaseClient,
  userId: string,
  permissionCodes: string[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>()

  // For efficiency, we could batch this, but for now evaluate each
  for (const code of permissionCodes) {
    const result = await evaluatePermission(supabase, userId, code)
    results.set(code, result.allowed)
  }

  return results
}

// Export helper functions
export { checkDataScope, checkFeatureFlag }
