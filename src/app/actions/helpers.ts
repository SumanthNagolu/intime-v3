/**
 * Server Action Helper Functions
 *
 * Provides reusable utilities for authentication, authorization,
 * and audit logging across all server actions.
 *
 * @module actions/helpers
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserContext, AuditEventParams, AuditSeverity } from './types';

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Get the current authenticated user's context.
 *
 * This function fetches the authenticated user from Supabase Auth
 * and retrieves their profile from the database.
 *
 * @returns Object containing error (if any), user, and profile
 *
 * @example
 * ```ts
 * const { error, profile } = await getCurrentUserContext();
 * if (error || !profile) {
 *   return { success: false, error: error || 'Not authenticated' };
 * }
 * ```
 */
export async function getCurrentUserContext(): Promise<{
  error: string | null;
  user: { id: string; email?: string } | null;
  profile: UserContext | null;
}> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated', user: null, profile: null };
  }

  // Get user profile with org_id
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, auth_id, org_id, email, full_name')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', user, profile: null };
  }

  return {
    error: null,
    user,
    profile: {
      id: profile.id,
      authId: profile.auth_id || '',
      email: profile.email || '',
      fullName: profile.full_name || '',
      orgId: profile.org_id,
    },
  };
}

// ============================================================================
// Authorization Helpers
// ============================================================================

/**
 * Check if a user has a specific permission.
 *
 * First attempts to use the database RPC function `check_user_permission`.
 * Falls back to role-based check if the function doesn't exist.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check permissions for
 * @param resource - Resource name (e.g., 'users', 'jobs', 'candidates')
 * @param action - Action to check (e.g., 'read', 'create', 'update', 'delete')
 * @param requiredScope - Optional scope requirement (default: 'all')
 * @returns true if user has the permission
 *
 * @example
 * ```ts
 * const hasPermission = await checkPermission(supabase, profile.id, 'users', 'create');
 * if (!hasPermission) {
 *   return { success: false, error: 'Permission denied: users:create required' };
 * }
 * ```
 */
export async function checkPermission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resource: string,
  action: string,
  requiredScope: string = 'all'
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_required_scope: requiredScope,
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

    const roleNames = roles?.map((r: any) => r.role?.name) || [];
    return roleNames.includes('super_admin') || roleNames.includes('admin');
  }

  return data === true;
}

/**
 * Check if user has any of the specified roles.
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check roles for
 * @param roleNames - Array of role names to check
 * @returns true if user has any of the roles
 */
export async function hasAnyRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  roleNames: string[]
): Promise<boolean> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!inner(name)
    `)
    .eq('user_id', userId)
    .is('deleted_at', null);

  const userRoleNames = roles?.map((r: any) => r.role?.name) || [];
  return roleNames.some(roleName => userRoleNames.includes(roleName));
}

/**
 * Check if user is an admin (admin or super_admin).
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @returns true if user is an admin
 */
export async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  return hasAnyRole(supabase, userId, ['admin', 'super_admin']);
}

// ============================================================================
// Audit Logging Helpers
// ============================================================================

/**
 * Determine audit severity based on action type.
 */
function getSeverityForAction(action: string): AuditSeverity {
  const warningSeverityActions = [
    'DELETE',
    'DEACTIVATE',
    'TERMINATE',
    'REMOVE_ROLE',
    'REJECT',
  ];

  if (warningSeverityActions.includes(action.toUpperCase())) {
    return 'warning';
  }

  return 'info';
}

/**
 * Log an audit event to the audit_logs table.
 *
 * Uses the admin Supabase client to bypass RLS for audit logging.
 *
 * @param adminSupabase - Admin Supabase client (bypasses RLS)
 * @param params - Audit event parameters
 *
 * @example
 * ```ts
 * await logAuditEvent(adminSupabase, {
 *   tableName: 'user_profiles',
 *   action: 'INSERT',
 *   recordId: newUser.id,
 *   userId: profile.id,
 *   userEmail: profile.email,
 *   orgId: profile.orgId,
 *   newValues: { email, fullName },
 *   metadata: { source: 'admin_create' },
 * });
 * ```
 */
export async function logAuditEvent(
  adminSupabase: ReturnType<typeof createAdminClient>,
  params: AuditEventParams
): Promise<void> {
  const {
    tableName,
    action,
    recordId,
    userId,
    userEmail,
    orgId,
    oldValues,
    newValues,
    metadata,
  } = params;

  try {
    await (adminSupabase.from as any)('audit_logs').insert({
      table_name: tableName,
      action,
      record_id: recordId,
      user_id: userId,
      user_email: userEmail,
      org_id: orgId,
      old_values: oldValues || null,
      new_values: newValues || null,
      metadata: metadata || {},
      severity: getSeverityForAction(action),
    });
  } catch (error) {
    // Log error but don't fail the action
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Log a batch of audit events.
 *
 * @param adminSupabase - Admin Supabase client
 * @param events - Array of audit event parameters
 */
export async function logAuditEventBatch(
  adminSupabase: ReturnType<typeof createAdminClient>,
  events: AuditEventParams[]
): Promise<void> {
  try {
    const rows = events.map(params => ({
      table_name: params.tableName,
      action: params.action,
      record_id: params.recordId,
      user_id: params.userId,
      user_email: params.userEmail,
      org_id: params.orgId,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      metadata: params.metadata || {},
      severity: getSeverityForAction(params.action),
    }));

    await (adminSupabase.from as any)('audit_logs').insert(rows);
  } catch (error) {
    console.error('Failed to log audit events batch:', error);
  }
}

// ============================================================================
// Data Transformation Helpers
// ============================================================================

/**
 * Transform database snake_case keys to camelCase.
 *
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function snakeToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }

  return result;
}

/**
 * Transform camelCase keys to database snake_case.
 *
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function camelToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }

  return result;
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Format a Zod validation error into field errors.
 *
 * @param error - Zod error object
 * @returns Record of field names to error messages
 */
export function formatZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): Record<string, string[]> {
  return error.flatten().fieldErrors;
}

/**
 * Create a standardized error result.
 *
 * @param error - Error message
 * @param fieldErrors - Optional field-specific errors
 * @returns ActionResult with error
 */
export function errorResult(
  error: string,
  fieldErrors?: Record<string, string[]>
): { success: false; error: string; fieldErrors?: Record<string, string[]> } {
  return {
    success: false,
    error,
    ...(fieldErrors && { fieldErrors }),
  };
}

/**
 * Create a standardized success result.
 *
 * @param data - Result data
 * @returns ActionResult with data
 */
export function successResult<T>(data: T): { success: true; data: T } {
  return {
    success: true,
    data,
  };
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Calculate pagination metadata.
 *
 * @param total - Total number of items
 * @param page - Current page number
 * @param pageSize - Items per page
 * @returns Pagination metadata
 */
export function calculatePagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasMore,
  };
}

/**
 * Calculate SQL offset from page and pageSize.
 *
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Object with from and to for Supabase range
 */
export function calculateRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}
