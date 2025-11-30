/**
 * Authentication Helper Functions
 *
 * Provides utilities for checking authentication, permissions,
 * and role-based navigation.
 *
 * @module lib/auth/helpers
 */

import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CurrentUser {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  orgId: string;
  isActive: boolean;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    isPrimary: boolean;
    hierarchyLevel: number;
  }>;
  permissions: Array<{
    resource: string;
    action: string;
    scope: string;
  }>;
  primaryRole: string | null;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: string;
}

// ============================================================================
// Dashboard Routes by Role
// ============================================================================

const DASHBOARD_ROUTES: Record<string, string> = {
  // Executive level
  super_admin: '/employee/admin/dashboard',
  admin: '/employee/admin/dashboard',
  ceo: '/employee/executive/dashboard',
  cfo: '/employee/executive/dashboard',

  // HR roles
  hr_manager: '/employee/hr/dashboard',
  hr_admin: '/employee/hr/dashboard',

  // Recruiting roles
  recruiter: '/employee/recruiting/dashboard',
  senior_recruiter: '/employee/recruiting/dashboard',
  junior_recruiter: '/employee/recruiting/dashboard',
  sr_recruiter: '/employee/recruiting/dashboard',
  jr_recruiter: '/employee/recruiting/dashboard',

  // Bench sales roles
  bench_sales: '/employee/bench/dashboard',
  senior_bench_sales: '/employee/bench/dashboard',
  junior_bench_sales: '/employee/bench/dashboard',

  // TA/Sales roles
  ta_sales: '/employee/sales/dashboard',
  senior_ta: '/employee/sales/dashboard',
  junior_ta: '/employee/sales/dashboard',

  // Training roles
  trainer: '/employee/academy/instructor',
  student: '/students/dashboard',

  // External roles
  candidate: '/talent/dashboard',
  client: '/client/dashboard',
  employee: '/employee/dashboard',
};

const DEFAULT_DASHBOARD = '/dashboard';

// ============================================================================
// Cached User Fetching
// ============================================================================

/**
 * Get current authenticated user with roles and permissions.
 * Results are cached per request using React's cache().
 *
 * @returns CurrentUser object or null if not authenticated
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  // Get authenticated user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch user profile with roles and permissions
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      id,
      auth_id,
      email,
      full_name,
      avatar_url,
      phone,
      org_id,
      is_active,
      user_roles (
        role_id,
        is_primary,
        deleted_at,
        expires_at,
        roles (
          id,
          name,
          display_name,
          hierarchy_level,
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
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single();

  if (profileError || !profile) {
    console.error('Failed to fetch user profile:', profileError);
    return null;
  }

  // Extract roles (filter out deleted/expired)
  const now = new Date();
  const activeRoles = ((profile.user_roles as unknown as any[]) || [])
    .filter((ur: any) => {
      if (ur.deleted_at) return false;
      if (ur.expires_at && new Date(ur.expires_at) < now) return false;
      return true;
    })
    .map((ur: any) => ({
      id: ur.roles?.id,
      name: ur.roles?.name,
      displayName: ur.roles?.display_name,
      isPrimary: ur.is_primary,
      hierarchyLevel: ur.roles?.hierarchy_level || 99,
    }));

  // Extract unique permissions from all roles
  const permissionsMap = new Map<string, { resource: string; action: string; scope: string }>();

  ((profile.user_roles as unknown as any[]) || [])
    .filter((ur: any) => !ur.deleted_at && (!ur.expires_at || new Date(ur.expires_at) >= now))
    .forEach((ur: any) => {
      (ur.roles?.role_permissions || []).forEach((rp: any) => {
        const perm = rp.permissions;
        if (perm) {
          const key = `${perm.resource}:${perm.action}:${perm.scope}`;
          if (!permissionsMap.has(key)) {
            permissionsMap.set(key, {
              resource: perm.resource,
              action: perm.action,
              scope: perm.scope,
            });
          }
        }
      });
    });

  // Find primary role
  const primaryRole = activeRoles.find((r: any) => r.isPrimary)?.name ||
                      activeRoles.sort((a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel)[0]?.name ||
                      null;

  return {
    id: profile.id,
    authId: profile.auth_id || '',
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    phone: profile.phone,
    orgId: profile.org_id,
    isActive: profile.is_active ?? false,
    roles: activeRoles,
    permissions: Array.from(permissionsMap.values()),
    primaryRole,
  };
});

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Check if the current user has a specific permission.
 *
 * @param resource - The resource to check (e.g., 'users', 'candidates')
 * @param action - The action to check (e.g., 'read', 'create', 'update', 'delete')
 * @param requiredScope - Optional scope requirement (defaults to checking any scope)
 * @returns true if user has the permission
 */
export async function hasPermission(
  resource: string,
  action: string,
  requiredScope?: string
): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // Super admin and admin always have all permissions
  const roleNames = user.roles.map(r => r.name);
  if (roleNames.includes('super_admin')) {
    return true;
  }

  // Check permissions
  return user.permissions.some(p => {
    if (p.resource !== resource) return false;
    if (p.action !== action) return false;

    // If no specific scope required, any scope is fine
    if (!requiredScope) return true;

    // Check scope hierarchy: all > department > pod > team > own
    const scopeHierarchy = ['own', 'team', 'pod', 'department', 'all'];
    const userScopeIndex = scopeHierarchy.indexOf(p.scope);
    const requiredScopeIndex = scopeHierarchy.indexOf(requiredScope);

    // User's scope must be equal or higher in hierarchy
    return userScopeIndex >= requiredScopeIndex;
  });
}

/**
 * Check multiple permissions at once.
 *
 * @param checks - Array of permission checks
 * @param mode - 'all' requires all permissions, 'any' requires at least one
 * @returns true if permissions are satisfied
 */
export async function hasPermissions(
  checks: PermissionCheck[],
  mode: 'all' | 'any' = 'all'
): Promise<boolean> {
  const results = await Promise.all(
    checks.map(check => hasPermission(check.resource, check.action, check.scope))
  );

  if (mode === 'all') {
    return results.every(Boolean);
  }

  return results.some(Boolean);
}

/**
 * Check if current user has a specific role.
 *
 * @param roleName - Role name to check (e.g., 'admin', 'recruiter')
 * @returns true if user has the role
 */
export async function hasRole(roleName: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.roles.some(r => r.name === roleName);
}

/**
 * Check if current user has any of the specified roles.
 *
 * @param roleNames - Array of role names to check
 * @returns true if user has any of the roles
 */
export async function hasAnyRole(roleNames: string[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.roles.some(r => roleNames.includes(r.name));
}

/**
 * Check if current user is an admin (admin or super_admin).
 *
 * @returns true if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasAnyRole(['admin', 'super_admin']);
}

// ============================================================================
// Role-Based Navigation
// ============================================================================

/**
 * Get the appropriate dashboard path for a role.
 *
 * @param roleName - The role name
 * @returns Dashboard path for the role
 */
export function getDashboardByRole(roleName: string): string {
  return DASHBOARD_ROUTES[roleName] || DEFAULT_DASHBOARD;
}

/**
 * Get the dashboard path for the current user based on their primary role.
 *
 * @returns Dashboard path for the user
 */
export async function getCurrentUserDashboard(): Promise<string> {
  const user = await getCurrentUser();

  if (!user || !user.primaryRole) {
    return DEFAULT_DASHBOARD;
  }

  return getDashboardByRole(user.primaryRole);
}

/**
 * Get all dashboard routes available to the current user.
 *
 * @returns Array of available dashboard routes
 */
export async function getAvailableDashboards(): Promise<Array<{
  role: string;
  displayName: string;
  path: string;
}>> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return user.roles.map(role => ({
    role: role.name,
    displayName: role.displayName,
    path: getDashboardByRole(role.name),
  }));
}

// ============================================================================
// Server-Side Authentication Guards
// ============================================================================

/**
 * Require authentication. Throws an error if not authenticated.
 * Use in Server Components or Server Actions.
 *
 * @returns Current user
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require specific permission. Throws an error if permission not granted.
 *
 * @param resource - The resource to check
 * @param action - The action to check
 * @throws Error if permission not granted
 */
export async function requirePermission(resource: string, action: string): Promise<CurrentUser> {
  const user = await requireAuth();

  const hasAccess = await hasPermission(resource, action);
  if (!hasAccess) {
    throw new Error(`Permission denied: ${resource}:${action}`);
  }

  return user;
}

/**
 * Require specific role. Throws an error if role not assigned.
 *
 * @param roleNames - Role name(s) to require (any of them)
 * @throws Error if role not assigned
 */
export async function requireRole(...roleNames: string[]): Promise<CurrentUser> {
  const user = await requireAuth();

  const hasRequiredRole = await hasAnyRole(roleNames);
  if (!hasRequiredRole) {
    throw new Error(`Role required: ${roleNames.join(' or ')}`);
  }

  return user;
}

/**
 * Require admin role (admin or super_admin).
 *
 * @throws Error if not admin
 */
export async function requireAdmin(): Promise<CurrentUser> {
  return requireRole('admin', 'super_admin');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get user's organization ID.
 *
 * @returns Organization ID or null if not authenticated
 */
export async function getCurrentOrgId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.orgId || null;
}

/**
 * Check if user belongs to a specific organization.
 *
 * @param orgId - Organization ID to check
 * @returns true if user belongs to the organization
 */
export async function belongsToOrg(orgId: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.orgId === orgId;
}

/**
 * Get user's primary role name.
 *
 * @returns Primary role name or null
 */
export async function getPrimaryRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.primaryRole || null;
}

/**
 * Get all role names for the current user.
 *
 * @returns Array of role names
 */
export async function getRoleNames(): Promise<string[]> {
  const user = await getCurrentUser();
  return user?.roles.map(r => r.name) || [];
}

// ============================================================================
// Client-Callable Permission Check (for use in Server Actions)
// ============================================================================

/**
 * Create a permission checker function for a specific user context.
 * Useful when you already have the user and don't want to refetch.
 *
 * @param user - Current user object
 * @returns Permission checker function
 */
export function createPermissionChecker(user: CurrentUser) {
  return (resource: string, action: string, requiredScope?: string): boolean => {
    // Super admin always has all permissions
    const roleNames = user.roles.map(r => r.name);
    if (roleNames.includes('super_admin')) {
      return true;
    }

    return user.permissions.some(p => {
      if (p.resource !== resource) return false;
      if (p.action !== action) return false;
      if (!requiredScope) return true;

      const scopeHierarchy = ['own', 'team', 'pod', 'department', 'all'];
      const userScopeIndex = scopeHierarchy.indexOf(p.scope);
      const requiredScopeIndex = scopeHierarchy.indexOf(requiredScope);

      return userScopeIndex >= requiredScopeIndex;
    });
  };
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { PermissionCheck as Permission };
