/**
 * tRPC Context
 *
 * Creates the context for all tRPC procedures.
 * Context includes:
 * - Session (from Supabase Auth)
 * - User ID
 * - Organization ID
 * - Supabase client
 */

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create tRPC context
 *
 * This function is called for every tRPC request.
 * It extracts the session and user information from Supabase Auth.
 */
export async function createContext() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let userId: string | null = null;
  let orgId: string | null = null;

  if (user) {
    userId = user.id;

    // Get user's org_id from profile with error handling
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('id', userId)
        .maybeSingle();

      if (!error && profile) {
        orgId = profile.org_id || null;
      }
    } catch (error) {
      // Log the error but don't fail the context creation
      console.error('Error fetching user profile:', error);
    }
  }

  return {
    session: user ? { user } : null,
    userId,
    orgId,
    supabase
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
