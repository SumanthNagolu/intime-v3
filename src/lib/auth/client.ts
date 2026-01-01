'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';
import { getNavigationConfig } from '@/lib/navigation/role-navigation.config';

export type PortalType = 'employee' | 'client' | 'talent' | 'academy';

export interface AuthResponse {
  error: AuthError | null;
}

export interface UserRole {
  code: string;
  category: string;
  displayName: string;
}

/**
 * Get redirect path based on user role for employee portal.
 * Uses role-based navigation config to determine the default landing page.
 */
export function getEmployeeRedirectPath(role: UserRole | null): string {
  if (!role) {
    // Default to workspace dashboard if no role found
    return '/employee/workspace/dashboard';
  }

  // Use the role navigation config to get the default path for this role
  const config = getNavigationConfig(role.code, role.category);
  return config.defaultPath;
}

/**
 * Get the current user's role from their profile
 * Uses a two-step query approach for reliability
 * @param userId - Optional user ID. If not provided, will try to get from session.
 * @deprecated Use tRPC users.getMyRole for reliable role fetching
 */
export async function getUserRole(userId?: string): Promise<UserRole | null> {
  try {
    const supabase = createClient();
    
    // Use provided userId or try to get from session
    let authUserId = userId;
    if (!authUserId) {
      // Only call getSession if no userId provided
      // Note: getSession may hang on some client setups
      const { data: { session } } = await supabase.auth.getSession();
      authUserId = session?.user?.id;
    }
    
    if (!authUserId) {
      return null;
    }
    
    // Step 1: Get user profile with role_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role_id, employee_role')
      .eq('auth_id', authUserId)
      .single();
    
    if (profileError || !profile) {
      return null;
    }
    
    // If no role_id, try to use employee_role as fallback
    if (!profile.role_id) {
      if (profile.employee_role) {
        return {
          code: profile.employee_role,
          category: 'pod_ic', // Default category for legacy roles
          displayName: profile.employee_role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        };
      }
      return null;
    }
    
    // Step 2: Get the system role details
    const { data: systemRole, error: roleError } = await supabase
      .from('system_roles')
      .select('code, category, display_name')
      .eq('id', profile.role_id)
      .single();
    
    if (roleError || !systemRole) {
      return null;
    }
    
    return {
      code: systemRole.code,
      category: systemRole.category,
      displayName: systemRole.display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  } catch (err) {
    return {
      error: {
        name: 'AuthError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      } as AuthError,
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    return { error };
  } catch (err) {
    return {
      error: {
        name: 'AuthError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      } as AuthError,
    };
  }
}

/**
 * Set org cookie after login (avoids DB lookup on every request)
 */
export async function setOrgCookie(): Promise<void> {
  try {
    await fetch('/api/auth/set-org-cookie', { method: 'POST' })
  } catch {
    // Ignore errors - cookie will be set on next request as fallback
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(
  portal: PortalType
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?portal=${portal}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    return { error };
  } catch (err) {
    return {
      error: {
        name: 'AuthError',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      } as AuthError,
    };
  }
}
