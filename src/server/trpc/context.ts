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

import { createClient, createAdminClient } from '@/lib/supabase/server';
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

    // Get user's org_id from profile using admin client to bypass RLS
    // (RLS policies on user_profiles can cause stack depth exceeded errors)
    try {
      const adminClient = createAdminClient();

      // First try by id (default case)
      let { data: profile, error } = await adminClient
        .from('user_profiles')
        .select('org_id')
        .eq('id', userId)
        .maybeSingle();

      // If not found by id, try by auth_id
      if (!profile && !error) {
        const result = await adminClient
          .from('user_profiles')
          .select('org_id')
          .eq('auth_id', userId)
          .maybeSingle();
        profile = result.data;
        error = result.error;
      }

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
