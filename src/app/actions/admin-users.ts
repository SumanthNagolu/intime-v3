/**
 * Admin User Management Server Actions
 *
 * Provides CRUD operations for user management with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/admin-users
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface UserWithRoles {
  id: string;
  authId: string | null;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  orgId: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    isPrimary: boolean;
    assignedAt: string;
    expiresAt: string | null;
  }>;
  permissions?: Array<{
    resource: string;
    action: string;
    scope: string;
  }>;
}

export interface PaginatedUsers {
  users: UserWithRoles[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const listUsersFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  roleId: z.string().uuid().optional(),
  roleName: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['email', 'fullName', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  roleId: z.string().uuid('Invalid role ID'),
  isPrimaryRole: z.boolean().default(true),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  isActive: z.boolean().optional(),
  // Employee fields
  employeeDepartment: z.string().nullable().optional(),
  employeePosition: z.string().nullable().optional(),
  // Recruiter fields
  recruiterTerritory: z.string().nullable().optional(),
  recruiterSpecialization: z.array(z.string()).nullable().optional(),
});

const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleId: z.string().uuid('Invalid role ID'),
  isPrimary: z.boolean().default(false),
  expiresAt: z.string().datetime().nullable().optional(),
});

const removeRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleId: z.string().uuid('Invalid role ID'),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated', user: null, profile: null };
  }

  // Get user profile with org_id
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, org_id, email, full_name')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', user, profile: null };
  }

  return { error: null, user, profile };
}

async function checkPermission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_required_scope: 'all',
  });

  if (error) {
    // If the function doesn't exist, fall back to role check
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        role:roles!inner(name)
      `)
      .eq('user_id', userId)
      .is('deleted_at', null);

    const roleNames = roles?.map((r: { role?: { name?: string } | null }) => r.role?.name) || [];
    return roleNames.includes('super_admin') || roleNames.includes('admin');
  }

  return data === true;
}

async function logAuditEvent(
  adminSupabase: ReturnType<typeof createAdminClient>,
  params: {
    tableName: string;
    action: string;
    recordId: string;
    userId: string;
    userEmail: string;
    orgId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
) {
  const { tableName, action, recordId, userId, userEmail, orgId, oldValues, newValues, metadata } = params;

  await (adminSupabase.from as unknown as (table: string) => { insert: (data: unknown) => Promise<unknown> })('audit_logs').insert({
    table_name: tableName,
    action,
    record_id: recordId,
    user_id: userId,
    user_email: userEmail,
    org_id: orgId,
    old_values: oldValues || null,
    new_values: newValues || null,
    metadata: metadata || {},
    severity: action === 'DELETE' ? 'warning' : 'info',
  });
}

// ============================================================================
// Actions
// ============================================================================

/**
 * List users with pagination, search, and role filtering
 */
export async function listUsersAction(
  filters: z.infer<typeof listUsersFiltersSchema>
): Promise<ActionResult<PaginatedUsers>> {
  // Validate input
  const validation = listUsersFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, roleId, roleName, isActive, sortBy, sortOrder } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'users', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: users:read required' };
  }

  // Build query - RLS automatically filters by org_id
  let query = supabase
    .from('user_profiles')
    .select(`
      id,
      auth_id,
      email,
      full_name,
      avatar_url,
      phone,
      is_active,
      created_at,
      updated_at,
      deleted_at,
      org_id,
      user_roles!inner (
        role_id,
        is_primary,
        assigned_at,
        expires_at,
        deleted_at,
        roles!inner (
          id,
          name,
          display_name
        )
      )
    `, { count: 'exact' });

  // Apply search filter
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  // Apply active filter
  if (isActive !== undefined) {
    if (isActive) {
      query = query.is('deleted_at', null).eq('is_active', true);
    } else {
      query = query.or('deleted_at.not.is.null,is_active.eq.false');
    }
  } else {
    // Default: show active users only
    query = query.is('deleted_at', null);
  }

  // Apply role filter
  if (roleId) {
    query = query.eq('user_roles.role_id', roleId);
  }
  if (roleName) {
    query = query.eq('user_roles.roles.name', roleName);
  }

  // Filter out deleted user_roles
  query = query.is('user_roles.deleted_at', null);

  // Apply sorting
  const sortColumn = sortBy === 'fullName' ? 'full_name' :
                     sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: users, error, count } = await query;

  if (error) {
    console.error('List users error:', error);
    return { success: false, error: 'Failed to fetch users' };
  }

  // Transform data
  interface UserQueryResult {
    id: string;
    auth_id: string | null;
    email: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    org_id: string;
    user_roles: Array<{
      role_id: string;
      is_primary: boolean;
      assigned_at: string;
      expires_at: string | null;
      deleted_at: string | null;
      roles: {
        id: string;
        name: string;
        display_name: string;
      } | null;
    }>;
  }

  const transformedUsers: UserWithRoles[] = (users || []).map((user: UserQueryResult) => ({
    id: user.id,
    authId: user.auth_id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    isActive: user.is_active ?? false,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
    orgId: user.org_id,
    roles: (user.user_roles || [])
      .filter((ur) => !ur.deleted_at && ur.roles)
      .map((ur) => ({
        id: ur.roles!.id,
        name: ur.roles!.name,
        displayName: ur.roles!.display_name,
        isPrimary: ur.is_primary,
        assignedAt: ur.assigned_at,
        expiresAt: ur.expires_at,
      })),
  }));

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    success: true,
    data: {
      users: transformedUsers,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

/**
 * Get a single user with roles and permissions
 */
export async function getUserAction(userId: string): Promise<ActionResult<UserWithRoles>> {
  if (!userId || !z.string().uuid().safeParse(userId).success) {
    return { success: false, error: 'Invalid user ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission (users can view their own profile)
  const isSelf = profile.id === userId;
  if (!isSelf) {
    const hasPermission = await checkPermission(supabase, profile.id, 'users', 'read');
    if (!hasPermission) {
      return { success: false, error: 'Permission denied: users:read required' };
    }
  }

  // Fetch user with roles
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      auth_id,
      email,
      full_name,
      avatar_url,
      phone,
      timezone,
      locale,
      is_active,
      created_at,
      updated_at,
      deleted_at,
      org_id,
      employee_department,
      employee_position,
      recruiter_territory,
      recruiter_specialization,
      user_roles!user_roles_user_id_fkey (
        role_id,
        is_primary,
        assigned_at,
        expires_at,
        deleted_at,
        roles (
          id,
          name,
          display_name,
          role_permissions (
            permissions (
              resource,
              action,
              scope
            )
          )
        )
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    console.error('Get user error:', error);
    return { success: false, error: 'User not found' };
  }

  // Extract unique permissions from all roles
  const permissionsSet = new Set<string>();
  const permissions: Array<{ resource: string; action: string; scope: string }> = [];

  interface UserRoleWithPermissions {
    role_id: string;
    is_primary: boolean;
    assigned_at: string;
    expires_at: string | null;
    deleted_at: string | null;
    roles: {
      id: string;
      name: string;
      display_name: string;
      role_permissions?: Array<{
        permissions: {
          resource: string;
          action: string;
          scope: string;
        } | null;
      }>;
    } | null;
  }

  ((user.user_roles || []) as UserRoleWithPermissions[])
    .filter((ur) => !ur.deleted_at)
    .forEach((ur) => {
      (ur.roles?.role_permissions || []).forEach((rp) => {
        const perm = rp.permissions;
        if (perm) {
          const key = `${perm.resource}:${perm.action}:${perm.scope}`;
          if (!permissionsSet.has(key)) {
            permissionsSet.add(key);
            permissions.push({
              resource: perm.resource,
              action: perm.action,
              scope: perm.scope,
            });
          }
        }
      });
    });

  const transformedUser: UserWithRoles = {
    id: user.id,
    authId: user.auth_id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    isActive: user.is_active ?? false,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,
    orgId: user.org_id,
    roles: ((user.user_roles || []) as UserRoleWithPermissions[])
      .filter((ur) => !ur.deleted_at && ur.roles)
      .map((ur) => ({
        id: ur.roles!.id,
        name: ur.roles!.name,
        displayName: ur.roles!.display_name,
        isPrimary: ur.is_primary,
        assignedAt: ur.assigned_at,
        expiresAt: ur.expires_at,
      })),
    permissions,
  };

  return { success: true, data: transformedUser };
}

/**
 * Create a new user with role assignment
 */
export async function createUserAction(
  input: z.infer<typeof createUserSchema>
): Promise<ActionResult<UserWithRoles>> {
  // Validate input
  const validation = createUserSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, fullName, phone, password, roleId, isPrimaryRole } = validation.data;

  // Get current user context
  const { error: authError, user, profile } = await getCurrentUserContext();
  if (authError || !profile || !user) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'users', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: users:create required' };
  }

  // Verify role exists
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name, display_name')
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Invalid role' };
  }

  // Create auth user
  const { data: authData, error: authCreateError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authCreateError || !authData.user) {
    console.error('Create auth user error:', authCreateError);
    return { success: false, error: authCreateError?.message || 'Failed to create auth user' };
  }

  // Create user profile in same org as admin
  const { data: newProfile, error: profileError } = await adminSupabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      auth_id: authData.user.id,
      email,
      full_name: fullName,
      phone: phone || null,
      org_id: profile.org_id,
      is_active: true,
      created_by: profile.id,
    })
    .select()
    .single();

  if (profileError || !newProfile) {
    console.error('Create profile error:', profileError);
    // Cleanup: delete auth user
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: 'Failed to create user profile' };
  }

  // Assign role
  const { error: roleAssignError } = await adminSupabase
    .from('user_roles')
    .insert({
      user_id: newProfile.id,
      role_id: roleId,
      is_primary: isPrimaryRole,
      assigned_by: profile.id,
    });

  if (roleAssignError) {
    console.error('Role assignment error:', roleAssignError);
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'user_profiles',
    action: 'INSERT',
    recordId: newProfile.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { email, fullName, role: role.name },
    metadata: { source: 'admin_create', roleAssigned: role.name },
  });

  revalidatePath('/employee/admin/users');

  // Return the created user
  return getUserAction(newProfile.id);
}

/**
 * Update user details
 */
export async function updateUserAction(
  userId: string,
  input: z.infer<typeof updateUserSchema>
): Promise<ActionResult<UserWithRoles>> {
  if (!userId || !z.string().uuid().safeParse(userId).success) {
    return { success: false, error: 'Invalid user ID' };
  }

  // Validate input
  const validation = updateUserSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const updates = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission (users can update their own profile)
  const isSelf = profile.id === userId;
  if (!isSelf) {
    const hasPermission = await checkPermission(supabase, profile.id, 'users', 'update');
    if (!hasPermission) {
      return { success: false, error: 'Permission denied: users:update required' };
    }
  }

  // Get current user data for audit
  const { data: existingUser, error: fetchError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError || !existingUser) {
    return { success: false, error: 'User not found' };
  }

  // Build update object with snake_case keys
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
  if (updates.locale !== undefined) updateData.locale = updates.locale;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.employeeDepartment !== undefined) updateData.employee_department = updates.employeeDepartment;
  if (updates.employeePosition !== undefined) updateData.employee_position = updates.employeePosition;
  if (updates.recruiterTerritory !== undefined) updateData.recruiter_territory = updates.recruiterTerritory;
  if (updates.recruiterSpecialization !== undefined) updateData.recruiter_specialization = updates.recruiterSpecialization;

  // Update user profile
  const { error: updateError } = await adminSupabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId);

  if (updateError) {
    console.error('Update user error:', updateError);
    return { success: false, error: 'Failed to update user' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'user_profiles',
    action: 'UPDATE',
    recordId: userId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingUser,
    newValues: updateData,
    metadata: { source: isSelf ? 'self_update' : 'admin_update' },
  });

  revalidatePath('/employee/admin/users');
  revalidatePath(`/employee/admin/users/${userId}`);

  return getUserAction(userId);
}

/**
 * Deactivate (soft delete) a user
 */
export async function deactivateUserAction(userId: string): Promise<ActionResult<{ deactivated: boolean }>> {
  if (!userId || !z.string().uuid().safeParse(userId).success) {
    return { success: false, error: 'Invalid user ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  // Can't deactivate yourself
  if (profile.id === userId) {
    return { success: false, error: 'Cannot deactivate your own account' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'users', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: users:delete required' };
  }

  // Get user for audit
  const { data: existingUser, error: fetchError } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (fetchError || !existingUser) {
    return { success: false, error: 'User not found' };
  }

  // Soft delete: set deleted_at and is_active
  const { error: updateError } = await adminSupabase
    .from('user_profiles')
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_by: profile.id,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Deactivate user error:', updateError);
    return { success: false, error: 'Failed to deactivate user' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'user_profiles',
    action: 'DEACTIVATE',
    recordId: userId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { is_active: true, deleted_at: null },
    newValues: { is_active: false, deleted_at: new Date().toISOString() },
    metadata: { source: 'admin_deactivate', deactivatedUser: existingUser.email },
  });

  revalidatePath('/employee/admin/users');

  return { success: true, data: { deactivated: true } };
}

/**
 * Reactivate a deactivated user
 */
export async function reactivateUserAction(userId: string): Promise<ActionResult<UserWithRoles>> {
  if (!userId || !z.string().uuid().safeParse(userId).success) {
    return { success: false, error: 'Invalid user ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'users', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: users:update required' };
  }

  // Get user for audit
  const { data: existingUser, error: fetchError } = await adminSupabase
    .from('user_profiles')
    .select('email, full_name, deleted_at, is_active')
    .eq('id', userId)
    .single();

  if (fetchError || !existingUser) {
    return { success: false, error: 'User not found' };
  }

  if (!existingUser.deleted_at && existingUser.is_active) {
    return { success: false, error: 'User is already active' };
  }

  // Reactivate: clear deleted_at and set is_active
  const { error: updateError } = await adminSupabase
    .from('user_profiles')
    .update({
      deleted_at: null,
      is_active: true,
      updated_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Reactivate user error:', updateError);
    return { success: false, error: 'Failed to reactivate user' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'user_profiles',
    action: 'REACTIVATE',
    recordId: userId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { is_active: existingUser.is_active, deleted_at: existingUser.deleted_at },
    newValues: { is_active: true, deleted_at: null },
    metadata: { source: 'admin_reactivate', reactivatedUser: existingUser.email },
  });

  revalidatePath('/employee/admin/users');

  return getUserAction(userId);
}

/**
 * Assign a role to a user
 */
export async function assignRoleAction(
  input: z.infer<typeof assignRoleSchema>
): Promise<ActionResult<UserWithRoles>> {
  // Validate input
  const validation = assignRoleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { userId, roleId, isPrimary, expiresAt } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'assign');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:assign required' };
  }

  // Verify user exists and is in same org
  const { data: targetUser, error: userError } = await supabase
    .from('user_profiles')
    .select('id, email, org_id')
    .eq('id', userId)
    .single();

  if (userError || !targetUser) {
    return { success: false, error: 'User not found' };
  }

  // Verify role exists
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name, display_name')
    .eq('id', roleId)
    .is('deleted_at', null)
    .single();

  if (roleError || !role) {
    return { success: false, error: 'Role not found' };
  }

  // If setting as primary, unset other primary roles
  if (isPrimary) {
    await adminSupabase
      .from('user_roles')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .is('deleted_at', null);
  }

  // Upsert role assignment
  const { error: assignError } = await adminSupabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role_id: roleId,
      is_primary: isPrimary,
      expires_at: expiresAt || null,
      assigned_by: profile.id,
      assigned_at: new Date().toISOString(),
      deleted_at: null, // Clear any soft delete
    }, {
      onConflict: 'user_id,role_id',
    });

  if (assignError) {
    console.error('Assign role error:', assignError);
    return { success: false, error: 'Failed to assign role' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'user_roles',
    action: 'ASSIGN_ROLE',
    recordId: userId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { roleId, roleName: role.name, isPrimary, expiresAt },
    metadata: { source: 'admin_assign', targetUser: targetUser.email, roleName: role.name },
  });

  revalidatePath('/employee/admin/users');
  revalidatePath(`/employee/admin/users/${userId}`);

  return getUserAction(userId);
}

/**
 * Remove a role from a user
 */
export async function removeRoleAction(
  input: z.infer<typeof removeRoleSchema>
): Promise<ActionResult<UserWithRoles>> {
  // Validate input
  const validation = removeRoleSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { userId, roleId } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'roles', 'assign');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: roles:assign required' };
  }

  // Get current role assignment for audit
  const { data: assignment, error: fetchError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role_id,
      is_primary,
      roles (name, display_name),
      user_profiles!inner (email)
    `)
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !assignment) {
    return { success: false, error: 'Role assignment not found' };
  }

  // Soft delete the role assignment
  const { error: removeError } = await adminSupabase
    .from('user_roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('role_id', roleId);

  if (removeError) {
    console.error('Remove role error:', removeError);
    return { success: false, error: 'Failed to remove role' };
  }

  // Audit log
  interface AssignmentWithRoles {
    user_id: string;
    role_id: string;
    is_primary: boolean;
    roles: { name: string; display_name: string } | null;
    user_profiles: { email: string } | null;
  }

  const typedAssignment = assignment as unknown as AssignmentWithRoles;

  await logAuditEvent(adminSupabase, {
    tableName: 'user_roles',
    action: 'REMOVE_ROLE',
    recordId: userId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { roleId, roleName: typedAssignment.roles?.name, isPrimary: assignment.is_primary },
    metadata: {
      source: 'admin_remove',
      targetUser: typedAssignment.user_profiles?.email,
      roleName: typedAssignment.roles?.name,
    },
  });

  revalidatePath('/employee/admin/users');
  revalidatePath(`/employee/admin/users/${userId}`);

  return getUserAction(userId);
}

/**
 * Get all available roles for assignment
 */
export async function listRolesAction(): Promise<ActionResult<Array<{
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  hierarchyLevel: number;
  colorCode: string;
}>>> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: roles, error } = await supabase
    .from('roles')
    .select('id, name, display_name, description, hierarchy_level, color_code')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('hierarchy_level', { ascending: true });

  if (error) {
    console.error('List roles error:', error);
    return { success: false, error: 'Failed to fetch roles' };
  }

  return {
    success: true,
    data: (roles || []).map(r => ({
      id: r.id,
      name: r.name,
      displayName: r.display_name,
      description: r.description,
      hierarchyLevel: r.hierarchy_level ?? 0,
      colorCode: r.color_code ?? '#000000',
    })),
  };
}
