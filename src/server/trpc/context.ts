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

  const { data: { session } } = await supabase.auth.getSession();

  let userId: string | null = null;
  let orgId: string | null = null;

  if (session?.user) {
    userId = session.user.id;

    // Get user's org_id from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('id', userId)
      .single();

    orgId = profile?.org_id || null;
  }

  return {
    session,
    userId,
    orgId,
    supabase
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
