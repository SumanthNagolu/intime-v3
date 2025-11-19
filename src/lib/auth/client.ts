/**
 * Client-Side Authentication Helpers
 *
 * Use these functions in Client Components for:
 * - Sign up
 * - Sign in
 * - Sign out
 * - Password reset
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export interface AuthResult<T = any> {
  data: T | null;
  error: AuthError | null;
}

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  return { data: null, error };
}

/**
 * Send password reset email
 * @param email - User's email address
 * @returns AuthResult with success or error
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return data.session;
}

/**
 * Get current authenticated user
 * @returns Current user or null
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
