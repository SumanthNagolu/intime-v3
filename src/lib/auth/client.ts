/**
 * Client-Side Authentication Helpers
 *
 * Use these functions in Client Components for:
 * - Sign up
 * - Sign in (Email/Password & OAuth)
 * - Sign out
 * - Password reset
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError, Provider } from '@supabase/supabase-js';

export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
}

export type PortalType = 'academy' | 'client' | 'talent' | 'employee';

/**
 * Sign up a new user with email and password
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param metadata - Additional user metadata (full_name, etc.)
 * @returns AuthResult with user data or error
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    phone?: string;
  }
): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: metadata,
    },
  });

  return { data, error };
}

/**
 * Sign in an existing user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResult with session data or error
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Sign out the current user
 * @returns AuthResult with success or error
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  return { data: null, error };
}

/**
 * Send password reset email
 * @param email - User's email address
 * @returns AuthResult with success or error
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { data: null, error };
}

/**
 * Update user password (must be authenticated)
 * @param newPassword - New password
 * @returns AuthResult with user data or error
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

/**
 * Get current session
 * @returns Current session or null
 */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    // Silently handle session errors to avoid excessive logging
    return null;
  }

  return data.session;
}

/**
 * Get current authenticated user
 * @returns Current user or null
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // Silently handle user fetch errors to avoid excessive logging
    return null;
  }

  return data.user;
}

/**
 * Get the redirect URL for a portal type
 * @param portal - The portal type (academy, client, talent, employee)
 * @returns The dashboard URL for that portal
 */
export function getPortalRedirectUrl(portal: PortalType): string {
  switch (portal) {
    case 'academy':
      return '/academy/dashboard';
    case 'client':
      return '/client/portal';
    case 'talent':
      return '/talent/portal';
    case 'employee':
      return '/employee/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * @param provider - The OAuth provider
 * @param portal - The portal type for redirect after auth
 * @returns AuthResult with URL or error
 */
export async function signInWithOAuth(
  provider: Provider,
  portal: PortalType
): Promise<AuthResult> {
  const supabase = createClient();
  const redirectUrl = getPortalRedirectUrl(portal);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

/**
 * Sign in with Google
 * @param portal - The portal type for redirect after auth
 * @returns AuthResult with URL or error
 */
export async function signInWithGoogle(portal: PortalType): Promise<AuthResult> {
  return signInWithOAuth('google', portal);
}
