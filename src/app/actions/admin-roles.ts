/**
 * Admin Role Management Server Actions
 *
 * Provides CRUD operations for roles and permission management with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/admin-roles
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionResult } from './types';
import {
  getCurrentUserContext,
  checkPermission,
  logAuditEvent,
} from './helpers';

// ============================================================================
// Types
// ============================================================================

export interface RoleWithPermissions {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  parentRoleId: string | null;
  hierarchyLevel: number;
  isSystemRole: boolean;
  isActive: boolean;
  colorCode: string;
  createdAt: string;
  userCount: number;
  permissions: Array<{
    id: string;
    resource: string;
    action: string;
    scope: string;
    displayName: string;
    isDangerous: boolean;
  }>;
}

export interface PermissionInfo {
  id: string;
  resource: string;
  action: string;
  scope: string;
  displayName: string;
  description: string | null;
  isDangerous: boolean;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be at most 50 characters')
    .regex(/^[a-z_]+$/, 'Role name must be lowercase with underscores only'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  description: z.string().optional(),
  parentRoleId: z.string().uuid().optional().nullable(),
  hierarchyLevel: z.number().min(0).max(10).default(0),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#6366f1'),
});

const updateRoleSchema = z.object({
  displayName: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  parentRoleId: z.string().uuid().optional().nullable(),
  hierarchyLevel: z.number().min(0).max(10).optional(),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

const assignPermissionSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
  permissionId: z.string().uuid('Invalid permission ID'),
});

// ============================================================================
// Actions: Roles
// ============================================================================

/**
 * List all roles with permission counts and user counts.
 */
export async function listRolesAction(): Promise<ActionResult<RoleWithPermissions[]>> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:read required' };
  }

  // Fetch roles with permissions
  const { data: roles, error } = await supabase
    .from('roles')
    .select(`
      id,
      name,
      display_name,
      description,
      parent_role_id,
      hierarchy_level,
      is_system_role,
      is_active,
      color_code,
      created_at,
      role_permissions (
        permissions (
          id,
          resource,
          action,
          scope,
          display_name,
          is_dangerous
        )
      ),
      user_roles (
        user_id
      )
    `)
    .is('deleted_at', null)
    .order('hierarchy_level', { ascending: true });

  if (error) {
    console.error('List roles error:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }

  // Transform data
  interface RoleQueryResult {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    parent_role_id: string | null;
    hierarchy_level: number;
    is_system_role: boolean;
    is_active: boolean;
    color_code: string;
    created_at: string;
    user_roles: Array<{ user_id: string; deleted_at?: string | null }>;
    role_permissions: Array<{
      permissions?: {
        id: string;
        resource: string;
        action: string;
        scope: string;
        display_name: string;
        is_dangerous: boolean;
      } | null;
    }>;
  }

  const transformedRoles: RoleWithPermissions[] = (roles as unknown as RoleQueryResult[] || []).map((role) => ({
    id: role.id,
    name: role.name,
    displayName: role.display_name,
    description: role.description,
    parentRoleId: role.parent_role_id,
    hierarchyLevel: role.hierarchy_level,
    isSystemRole: role.is_system_role,
    isActive: role.is_active,
    colorCode: role.color_code,
    createdAt: role.created_at,
    userCount: (role.user_roles || []).filter((ur) => !ur.deleted_at).length,
    permissions: (role.role_permissions || [])
      .map((rp) => rp.permissions ? {
        id: rp.permissions.id,
        resource: rp.permissions.resource,
        action: rp.permissions.action,
        scope: rp.permissions.scope,
        displayName: rp.permissions.display_name,
        isDangerous: rp.permissions.is_dangerous,
      } : null)
      .filter((p): p is NonNullable<typeof p> => p !== null),
  }));

  return { success: true, data: transformedRoles };
}

/**
 * Get a single role with all its permissions.
 */
export async function getRoleAction(roleId: string): Promise<ActionResult<RoleWithPermissions>> {
  if (!roleId || !z.string().uuid().safeParse(roleId).success) {
    return { success: false, error: 'Invalid role ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:read required' };
  }

  // Fetch role with permissions
  const { data: role, error } = await supabase
    .from('roles')
    .select(`
      id,
      name,
      display_name,
      description,
      parent_role_id,
      hierarchy_level,
      is_system_role,
      is_active,
      color_code,
      created_at,
      role_permissions (
        permissions (
          id,
          resource,
          action,
          scope,
          display_name,
          is_dangerous
        )
      ),
      user_roles (
        user_id
      )
    `)
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (error || !role) {
    return { success: false, error: 'Role not found' };
  }

  interface SingleRoleQueryResult {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    parent_role_id: string | null;
    hierarchy_level: number;
    is_system_role: boolean;
    is_active: boolean;
    color_code: string;
    created_at: string;
    user_roles: Array<{ user_id: string }>;
    role_permissions: Array<{
      permissions?: {
        id: string;
        resource: string;
        action: string;
        scope: string;
        display_name: string;
        is_dangerous: boolean;
      } | null;
    }>;
  }

  const typedRole = role as unknown as SingleRoleQueryResult;

  const transformedRole: RoleWithPermissions = {
    id: typedRole.id,
    name: typedRole.name,
    displayName: typedRole.display_name,
    description: typedRole.description,
    parentRoleId: typedRole.parent_role_id,
    hierarchyLevel: typedRole.hierarchy_level ?? 0,
    isSystemRole: typedRole.is_system_role ?? false,
    isActive: typedRole.is_active ?? true,
    colorCode: typedRole.color_code ?? '#6366f1',
    createdAt: typedRole.created_at,
    userCount: (typedRole.user_roles || []).length,
    permissions: (typedRole.role_permissions || [])
      .map((rp) => rp.permissions ? {
        id: rp.permissions.id,
        resource: rp.permissions.resource,
        action: rp.permissions.action,
        scope: rp.permissions.scope,
        displayName: rp.permissions.display_name,
        isDangerous: rp.permissions.is_dangerous,
      } : null)
      .filter((p): p is NonNullable<typeof p> => p !== null),
  };

  return { success: true, data: transformedRole };
}

/**
 * Create a new role (non-system roles only).
 */
export async function createRoleAction(
  input: z.infer<typeof createRoleSchema>
): Promise<ActionResult<RoleWithPermissions>> {
  // Validate input
  const validation = createRoleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, displayName, description, parentRoleId, hierarchyLevel, colorCode } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:create required' };
  }

  // Check if role name already exists
  const { data: existing } = await supabase
    .from('roles')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) {
    return { success: false, error: 'Role name already exists' };
  }

  // Create role
  const { data: newRole, error } = await adminSupabase
    .from('roles')
    .insert({
      name,
      display_name: displayName,
      description: description || null,
      parent_role_id: parentRoleId || null,
      hierarchy_level: hierarchyLevel,
      color_code: colorCode,
      is_system_role: false, // Admin-created roles are never system roles
      is_active: true,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newRole) {
    console.error('Create role error:', error);
    return { success: false, error: 'Failed to create role' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'roles',
    action: 'INSERT',
    recordId: newRole.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    newValues: { name, displayName, hierarchyLevel },
    metadata: { source: 'admin_create' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/permissions');

  return getRoleAction(newRole.id);
}

/**
 * Update an existing role.
 */
export async function updateRoleAction(
  roleId: string,
  input: z.infer<typeof updateRoleSchema>
): Promise<ActionResult<RoleWithPermissions>> {
  if (!roleId || !z.string().uuid().safeParse(roleId).success) {
    return { success: false, error: 'Invalid role ID' };
  }

  // Validate input
  const validation = updateRoleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:update required' };
  }

  // Get existing role for audit
  const { data: existingRole, error: fetchError } = await supabase
    .from('roles')
    .select('*')
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingRole) {
    return { success: false, error: 'Role not found' };
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.parentRoleId !== undefined) updateData.parent_role_id = input.parentRoleId;
  if (input.hierarchyLevel !== undefined) updateData.hierarchy_level = input.hierarchyLevel;
  if (input.colorCode !== undefined) updateData.color_code = input.colorCode;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  // Update role
  const { error: updateError } = await adminSupabase
    .from('roles')
    .update(updateData)
    .eq('id', roleId);

  if (updateError) {
    console.error('Update role error:', updateError);
    return { success: false, error: 'Failed to update role' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'roles',
    action: 'UPDATE',
    recordId: roleId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: existingRole,
    newValues: updateData,
    metadata: { source: 'admin_update' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/permissions');

  return getRoleAction(roleId);
}

/**
 * Delete a role (non-system roles only, soft delete).
 */
export async function deleteRoleAction(roleId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!roleId || !z.string().uuid().safeParse(roleId).success) {
    return { success: false, error: 'Invalid role ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:delete required' };
  }

  // Get existing role
  const { data: existingRole, error: fetchError } = await supabase
    .from('roles')
    .select('name, display_name, is_system_role')
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingRole) {
    return { success: false, error: 'Role not found' };
  }

  // Prevent deleting system roles
  if (existingRole.is_system_role) {
    return { success: false, error: 'Cannot delete system roles' };
  }

  // Soft delete the role
  const { error: deleteError } = await adminSupabase
    .from('roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', roleId);

  if (deleteError) {
    console.error('Delete role error:', deleteError);
    return { success: false, error: 'Failed to delete role' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'roles',
    action: 'DELETE',
    recordId: roleId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: { name: existingRole.name, displayName: existingRole.display_name },
    metadata: { source: 'admin_delete' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/permissions');

  return { success: true, data: { deleted: true } };
}

// ============================================================================
// Actions: Permissions
// ============================================================================

/**
 * List all available permissions.
 */
export async function listPermissionsAction(): Promise<ActionResult<PermissionInfo[]>> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission (need at least read access to roles to view permissions)
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:read required' };
  }

  // Fetch all permissions
  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('id, resource, action, scope, display_name, description, is_dangerous')
    .is('deleted_at', null)
    .order('resource', { ascending: true })
    .order('action', { ascending: true });

  if (error) {
    console.error('List permissions error:', error);
    return { success: false, error: 'Failed to fetch permissions' };
  }

  interface PermissionQueryResult {
    id: string;
    resource: string;
    action: string;
    scope: string;
    display_name: string;
    description: string | null;
    is_dangerous: boolean;
  }

  const transformedPermissions: PermissionInfo[] = (permissions as unknown as PermissionQueryResult[] || []).map((p) => ({
    id: p.id,
    resource: p.resource,
    action: p.action,
    scope: p.scope,
    displayName: p.display_name,
    description: p.description,
    isDangerous: p.is_dangerous,
  }));

  return { success: true, data: transformedPermissions };
}

/**
 * Assign a permission to a role.
 */
export async function assignPermissionToRoleAction(
  input: z.infer<typeof assignPermissionSchema>
): Promise<ActionResult<RoleWithPermissions>> {
  // Validate input
  const validation = assignPermissionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { roleId, permissionId } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'manage');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:manage required' };
  }

  // Verify role exists
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Role not found' };
  }

  // Verify permission exists
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id, resource, action')
    .eq('id', permissionId)
    .is('deleted_at', null)
    .single();

  if (permError || !permission) {
    return { success: false, error: 'Permission not found' };
  }

  // Check if already assigned
  const { data: existing } = await supabase
    .from('role_permissions')
    .select('role_id')
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)
    .single();

  if (existing) {
    return { success: false, error: 'Permission already assigned to this role' };
  }

  // Assign permission
  const { error: assignError } = await adminSupabase
    .from('role_permissions')
    .insert({
      role_id: roleId,
      permission_id: permissionId,
      granted_by: profile.id,
    });

  if (assignError) {
    console.error('Assign permission error:', assignError);
    return { success: false, error: 'Failed to assign permission' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'role_permissions',
    action: 'ASSIGN_PERMISSION',
    recordId: roleId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    newValues: {
      roleId,
      roleName: role.name,
      permissionId,
      permission: `${permission.resource}:${permission.action}`,
    },
    metadata: { source: 'admin_assign' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/permissions');

  return getRoleAction(roleId);
}

/**
 * Remove a permission from a role.
 */
export async function removePermissionFromRoleAction(
  input: z.infer<typeof assignPermissionSchema>
): Promise<ActionResult<RoleWithPermissions>> {
  // Validate input
  const validation = assignPermissionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { roleId, permissionId } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'manage');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:manage required' };
  }

  // Get the assignment for audit
  const { data: assignment, error: fetchError } = await supabase
    .from('role_permissions')
    .select(`
      role_id,
      permission_id,
      roles (name),
      permissions (resource, action)
    `)
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)
    .single();

  if (fetchError || !assignment) {
    return { success: false, error: 'Permission assignment not found' };
  }

  interface AssignmentQueryResult {
    role_id: string;
    permission_id: string;
    roles: { name: string } | null;
    permissions: { resource: string; action: string } | null;
  }

  const typedAssignment = assignment as unknown as AssignmentQueryResult;

  // Remove permission assignment
  const { error: deleteError } = await adminSupabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId);

  if (deleteError) {
    console.error('Remove permission error:', deleteError);
    return { success: false, error: 'Failed to remove permission' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'role_permissions',
    action: 'REMOVE_PERMISSION',
    recordId: roleId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: {
      roleId,
      roleName: typedAssignment.roles?.name,
      permissionId,
      permission: `${typedAssignment.permissions?.resource}:${typedAssignment.permissions?.action}`,
    },
    metadata: { source: 'admin_remove' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/permissions');

  return getRoleAction(roleId);
}

/**
 * Get permissions grouped by resource (for permission tree UI).
 */
export async function getPermissionsGroupedAction(): Promise<
  ActionResult<Record<string, PermissionInfo[]>>
> {
  const result = await listPermissionsAction();

  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'Failed to fetch permissions' };
  }

  // Group permissions by resource
  const grouped: Record<string, PermissionInfo[]> = {};

  for (const perm of result.data) {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = [];
    }
    grouped[perm.resource].push(perm);
  }

  return { success: true, data: grouped };
}
