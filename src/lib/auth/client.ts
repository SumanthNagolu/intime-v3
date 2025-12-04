'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

export type PortalType = 'employee' | 'client' | 'talent' | 'academy';

export interface AuthResponse {
  error: AuthError | null;
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
