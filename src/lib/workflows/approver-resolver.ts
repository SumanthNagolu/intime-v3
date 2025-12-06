/**
 * Approver Resolver
 *
 * Resolves the appropriate approver for a workflow step based on the configured
 * approver type and configuration.
 */

import { createClient } from '@supabase/supabase-js'
import { type ApproverType, type ApproverConfig, type EntityType } from './types'

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

export interface ApproverResolutionContext {
  orgId: string
  entityType: EntityType
  entityId: string
  record: Record<string, unknown>
  userId?: string
}

export interface ResolvedApprover {
  userId: string
  email?: string
  fullName?: string
  resolvedFrom: ApproverType
  metadata?: Record<string, unknown>
}

/**
 * Main function to resolve an approver
 */
export async function resolveApprover(
  approverType: ApproverType,
  config: ApproverConfig,
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  switch (approverType) {
    case 'specific_user':
      return resolveSpecificUser(config, context)

    case 'record_owner':
      return resolveRecordOwner(context)

    case 'owners_manager':
      return resolveOwnersManager(context)

    case 'role_based':
      return resolveRoleBased(config, context)

    case 'pod_manager':
      return resolvePodManager(context)

    case 'custom_formula':
      return resolveCustomFormula(config, context)

    default:
      throw new Error(`Unknown approver type: ${approverType}`)
  }
}

/**
 * Resolve a specific user by ID
 */
async function resolveSpecificUser(
  config: ApproverConfig,
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  if (!config.user_id) {
    throw new Error('user_id is required for specific_user approver type')
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('id', config.user_id)
    .eq('org_id', context.orgId)
    .is('deleted_at', null)
    .single()

  if (error || !user) {
    console.error('Failed to resolve specific user:', error?.message)
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    resolvedFrom: 'specific_user',
  }
}

/**
 * Resolve the record owner
 */
async function resolveRecordOwner(
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  // Get owner_id from the record
  const ownerId = context.record.owner_id || context.record.created_by

  if (!ownerId) {
    // Try to fetch from database
    const tableName = getTableName(context.entityType)
    if (tableName) {
      const { data, error } = await supabase
        .from(tableName)
        .select('owner_id, created_by')
        .eq('id', context.entityId)
        .single()

      if (!error && data) {
        const resolvedOwnerId = data.owner_id || data.created_by
        if (resolvedOwnerId) {
          return resolveUserById(resolvedOwnerId, context.orgId, 'record_owner')
        }
      }
    }
    return null
  }

  return resolveUserById(String(ownerId), context.orgId, 'record_owner')
}

/**
 * Resolve the record owner's manager
 */
async function resolveOwnersManager(
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  // First get the record owner
  const owner = await resolveRecordOwner(context)
  if (!owner) {
    return null
  }

  // Get the owner's manager from employees table
  const { data: employee, error } = await supabase
    .from('employees')
    .select('manager_id, pod_id, pods(manager_id)')
    .eq('user_id', owner.userId)
    .eq('org_id', context.orgId)
    .single()

  if (error || !employee) {
    console.error('Failed to find employee record:', error?.message)
    return null
  }

  // Try direct manager first
  if (employee.manager_id) {
    const manager = await resolveUserById(employee.manager_id, context.orgId, 'owners_manager')
    if (manager) {
      return {
        ...manager,
        metadata: { via: 'direct_manager' },
      }
    }
  }

  // Fall back to pod manager
  const podData = employee.pods as { manager_id: string } | null
  if (podData?.manager_id) {
    const podManager = await resolveUserById(podData.manager_id, context.orgId, 'owners_manager')
    if (podManager) {
      return {
        ...podManager,
        metadata: { via: 'pod_manager' },
      }
    }
  }

  return null
}

/**
 * Resolve based on role
 */
async function resolveRoleBased(
  config: ApproverConfig,
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  if (!config.role_name) {
    throw new Error('role_name is required for role_based approver type')
  }

  // Get role ID first
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', config.role_name)
    .eq('org_id', context.orgId)
    .single()

  if (roleError || !role) {
    console.error('Role not found:', config.role_name)
    return null
  }

  // Find users with this role
  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('user_id, users(id, email, full_name)')
    .eq('role_id', role.id)
    .limit(1) // For now, pick the first one

  if (error || !userRoles || userRoles.length === 0) {
    console.error('No users found with role:', config.role_name)
    return null
  }

  const userData = userRoles[0].users as { id: string; email: string; full_name: string | null }

  return {
    userId: userData.id,
    email: userData.email,
    fullName: userData.full_name || undefined,
    resolvedFrom: 'role_based',
    metadata: { role_name: config.role_name },
  }
}

/**
 * Resolve pod manager for the record owner
 */
async function resolvePodManager(
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  // First get the record owner
  const owner = await resolveRecordOwner(context)
  if (!owner) {
    return null
  }

  // Get the owner's pod
  const { data: employee, error } = await supabase
    .from('employees')
    .select('pod_id, pods(manager_id)')
    .eq('user_id', owner.userId)
    .eq('org_id', context.orgId)
    .single()

  if (error || !employee) {
    console.error('Failed to find employee pod:', error?.message)
    return null
  }

  const podData = employee.pods as { manager_id: string } | null
  if (!podData?.manager_id) {
    console.error('No pod manager found for user:', owner.userId)
    return null
  }

  return resolveUserById(podData.manager_id, context.orgId, 'pod_manager')
}

/**
 * Resolve using a custom JavaScript formula
 */
async function resolveCustomFormula(
  config: ApproverConfig,
  context: ApproverResolutionContext
): Promise<ResolvedApprover | null> {
  if (!config.formula) {
    throw new Error('formula is required for custom_formula approver type')
  }

  try {
    // Create a safe evaluation context
    const evalContext = {
      record: context.record,
      entityType: context.entityType,
      entityId: context.entityId,
      orgId: context.orgId,
    }

    // Execute the formula in a limited scope
    // WARNING: In production, use a proper sandboxed execution environment
    const fn = new Function('record', 'entityType', 'entityId', 'orgId', `
      "use strict";
      ${config.formula}
    `)

    const result = fn(
      evalContext.record,
      evalContext.entityType,
      evalContext.entityId,
      evalContext.orgId
    )

    if (!result || typeof result !== 'string') {
      console.error('Custom formula did not return a valid user ID')
      return null
    }

    return resolveUserById(result, context.orgId, 'custom_formula')
  } catch (error) {
    console.error('Error executing custom formula:', error)
    return null
  }
}

/**
 * Helper: Resolve user by ID
 */
async function resolveUserById(
  userId: string,
  orgId: string,
  resolvedFrom: ApproverType
): Promise<ResolvedApprover | null> {
  const supabase = getAdminClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('id', userId)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .single()

  if (error || !user) {
    console.error('Failed to resolve user by ID:', error?.message)
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    resolvedFrom,
  }
}

/**
 * Helper: Get table name for entity type
 */
function getTableName(entityType: EntityType): string | null {
  const tableMap: Record<EntityType, string> = {
    jobs: 'jobs',
    candidates: 'candidates',
    submissions: 'submissions',
    placements: 'placements',
    accounts: 'accounts',
    contacts: 'contacts',
    leads: 'leads',
    deals: 'deals',
    activities: 'activities',
    employees: 'employees',
    consultants: 'consultants',
    vendors: 'vendors',
    interviews: 'interviews',
  }

  return tableMap[entityType] || null
}

/**
 * Validate approver configuration
 */
export function validateApproverConfig(
  approverType: ApproverType,
  config: ApproverConfig
): string[] {
  const errors: string[] = []

  switch (approverType) {
    case 'specific_user':
      if (!config.user_id) {
        errors.push('User ID is required for specific user approver')
      }
      break

    case 'role_based':
      if (!config.role_name) {
        errors.push('Role name is required for role-based approver')
      }
      break

    case 'custom_formula':
      if (!config.formula) {
        errors.push('Formula is required for custom formula approver')
      }
      break

    case 'record_owner':
    case 'owners_manager':
    case 'pod_manager':
      // No additional config required
      break

    default:
      errors.push(`Unknown approver type: ${approverType}`)
  }

  return errors
}
