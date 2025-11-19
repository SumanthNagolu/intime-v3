/**
 * Server-Side Authentication Helpers
 *
 * Use these functions in Server Components, Server Actions, and API Routes for:
 * - Getting current session
 * - Getting current user
 * - Requiring authentication
 * - Getting user profile
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user's session
 * @returns Session object or null if not authenticated
 */
export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return data.session;
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return data.user;
}

// Alias for backward compatibility
export const getUser = getCurrentUser;

/**
 * Require authentication - redirects to login if not authenticated
 * Use this in Server Components that require authentication
 * @param redirectTo - Optional redirect path after login (defaults to current path)
 * @returns Session object (guaranteed to be non-null)
 */
export async function requireAuth(redirectTo?: string) {
  const session = await getSession();

  if (!session) {
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/login';
    redirect(loginUrl);
  }

  return session;
}

/**
 * Get the user profile from the database
 * @param userId - User ID (defaults to current authenticated user)
 * @returns User profile or null
 */
export async function getUserProfile(userId?: string) {
  const supabase = await createClient();

  // If no userId provided, get current user
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return null;
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .eq('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get the user profile by auth ID (from Supabase Auth)
 * @param authId - Auth user ID
 * @returns User profile or null
 */
export async function getUserProfileByAuthId(authId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authId)
    .eq('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching user profile by auth_id:', error);
    return null;
  }

  return data;
}

/**
 * Get user roles
 * @param userId - User ID (defaults to current authenticated user)
 * @returns Array of role names
 */
export async function getUserRoles(userId?: string): Promise<string[]> {
  const supabase = await createClient();

  // If no userId provided, get current user
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) return [];
    userId = user.id;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .or('expires_at.is.null,expires_at.gt.now()');

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data.map((item: any) => item.role.name);
}

/**
 * Check if user has a specific role
 * @param roleName - Role name to check (e.g., 'admin', 'recruiter')
 * @param userId - User ID (defaults to current authenticated user)
 * @returns true if user has the role
 */
export async function userHasRole(
  roleName: string,
  userId?: string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName);
}

/**
 * Check if user has any of the specified roles
 * @param roleNames - Array of role names to check
 * @param userId - User ID (defaults to current authenticated user)
 * @returns true if user has at least one of the roles
 */
export async function userHasAnyRole(
  roleNames: string[],
  userId?: string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roleNames.some((role) => roles.includes(role));
}

/**
 * Check if user is an admin
 * @param userId - User ID (defaults to current authenticated user)
 * @returns true if user is admin or super_admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  return userHasAnyRole(['admin', 'super_admin'], userId);
}

/**
 * Require specific role(s) - throws error or redirects if user doesn't have required role
 * @param allowedRoles Array of role names that are allowed
 * @param userId Optional user ID (defaults to current user)
 * @param redirectTo Optional redirect path (if not provided, throws error)
 */
export async function requireRole(
  allowedRoles: string[],
  userId?: string,
  redirectTo?: string
) {
  const hasRole = await userHasAnyRole(allowedRoles, userId);

  if (!hasRole) {
    if (redirectTo) {
      redirect(redirectTo);
    } else {
      throw new Error(`Unauthorized: Requires one of roles: ${allowedRoles.join(', ')}`);
    }
  }

  return await getUser();
}
