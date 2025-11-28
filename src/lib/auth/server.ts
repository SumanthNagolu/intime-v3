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

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { PortalType } from './client';

/**
 * Portal access rules - defines which roles can access which portal
 *
 * IMPORTANT: These are EXCLUSIVE lists. A user should only access one portal.
 * - Academy is for STUDENTS only (pure learners, not employees)
 * - Employee portal is for all internal staff (including trainers who are employees)
 * - Client portal is for external clients
 * - Talent portal is for job seekers/candidates
 */
export const PORTAL_ALLOWED_ROLES: Record<PortalType, string[]> = {
  // Academy: Only for external students learning on the platform
  academy: ['student'],

  // Employee: All internal staff including trainers, admins, recruiters, etc.
  employee: [
    'super_admin', 'admin', 'ceo',
    'recruiter', 'senior_recruiter', 'junior_recruiter',
    'bench_manager', 'bench_sales',
    'ta_specialist', 'talent_acquisition',
    'hr_admin', 'hr_manager',
    'academy_admin',
    'trainer', 'training_coordinator',
    'immigration_specialist',
    'employee'
  ],

  // Client: External clients who hire talent
  client: ['client', 'client_admin', 'client_poc'],

  // Talent: Job seekers and candidates
  talent: ['candidate', 'talent'],
};

/**
 * Employee roles - used to check if user is an internal employee
 * If user has ANY of these roles, they should use Employee portal
 */
export const EMPLOYEE_ROLES = [
  'super_admin', 'admin', 'ceo',
  'recruiter', 'senior_recruiter', 'junior_recruiter',
  'bench_manager', 'bench_sales',
  'ta_specialist', 'talent_acquisition',
  'hr_admin', 'hr_manager',
  'academy_admin',
  'trainer', 'training_coordinator',
  'immigration_specialist',
  'employee'
];

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
    .eq('auth_id', userId)
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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

  // Get user profile to find the profile ID
  const profile = await getUserProfile(userId);
  if (!profile) return [];

  const { data, error } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', profile.id)
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
 * Get current user ID (or null if not authenticated)
 * @returns User ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Get current user's organization ID
 * @returns Organization ID or null
 */
export async function getCurrentUserOrgId(): Promise<string | null> {
  const profile = await getUserProfile();
  return profile?.org_id || null;
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

/**
 * Require portal access - checks if user has roles that allow access to a specific portal
 * Uses admin client to bypass RLS for role lookups
 * @param portal - The portal type (academy, employee, client, talent)
 * @returns User and roles if authorized
 */
export async function requirePortalAccess(
  portal: PortalType
): Promise<{ user: Awaited<ReturnType<typeof getCurrentUser>>; roles: string[] }> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/${portal}`);
  }

  // Use admin client to bypass RLS for profile/role lookups
  const supabase = createAdminClient();

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, full_name, email')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single();

  let roles: string[] = [];

  // Get user roles if profile exists
  if (profile) {
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role:roles(name)')
      .eq('user_id', profile.id)
      .is('deleted_at', null);

    if (rolesData) {
      roles = rolesData.map((item: any) => item.role?.name).filter(Boolean);
    }
  }

  const allowedRoles = PORTAL_ALLOWED_ROLES[portal];
  const hasAccess = roles.some(role => allowedRoles.includes(role));

  if (!hasAccess) {
    // Redirect to appropriate portal based on their actual roles
    const correctPortal = getCorrectPortalForRoles(roles);
    if (correctPortal && correctPortal !== portal) {
      redirect(`/${correctPortal}/portal?error=wrong_portal`);
    }
    // No valid portal - redirect to login with error
    redirect(`/login?error=no_access`);
  }

  return { user, roles };
}

/**
 * Determine which portal a user should access based on their roles
 * @param roles - User's roles
 * @returns The portal type they should access, or null if no match
 */
export function getCorrectPortalForRoles(roles: string[]): PortalType | null {
  // Check in order of priority
  const portalPriority: PortalType[] = ['employee', 'academy', 'client', 'talent'];

  for (const portal of portalPriority) {
    const allowedRoles = PORTAL_ALLOWED_ROLES[portal];
    if (roles.some(role => allowedRoles.includes(role))) {
      return portal;
    }
  }

  return null;
}

/**
 * Check if user can access a portal (without redirecting)
 * @param portal - The portal type
 * @param userId - Optional user ID
 * @returns true if user can access the portal
 */
export async function canAccessPortal(
  portal: PortalType,
  userId?: string
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  const allowedRoles = PORTAL_ALLOWED_ROLES[portal];
  return roles.some(role => allowedRoles.includes(role));
}
