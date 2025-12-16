'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export type PortalType = 'employee' | 'client' | 'talent' | 'academy';

export interface AuthResponse {
  error: AuthError | null;
}

export interface UserRole {
  code: string;
  category: string;
  displayName: string;
}

// Role categories that should go to admin dashboard
const ADMIN_ROLE_CATEGORIES = ['admin', 'executive', 'leadership'];

/**
 * Get redirect path based on user role for employee portal
 */
export function getEmployeeRedirectPath(role: UserRole | null): string {
  if (!role) {
    // Default to recruiter workspace if no role found
    return '/employee/workspace/dashboard';
  }
  
  // Admin and leadership roles go to admin dashboard
  if (ADMIN_ROLE_CATEGORIES.includes(role.category)) {
    return '/employee/admin/dashboard';
  }
  
  // All other roles (recruiters, sales, etc.) go to workspace dashboard
  return '/employee/workspace/dashboard';
}

/**
 * Get the current user's role from their profile
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        role_id,
        system_roles:role_id (
          code,
          category,
          display_name
        )
      `)
      .eq('auth_id', user.id)
      .single();
    
    if (!profile?.system_roles) return null;
    
    // Handle array response from Supabase
    const role = Array.isArray(profile.system_roles) 
      ? profile.system_roles[0] 
      : profile.system_roles;
    
    if (!role) return null;
    
    return {
      code: role.code,
      category: role.category,
      displayName: role.display_name,
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
