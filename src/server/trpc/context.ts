/**
 * tRPC Context
 *
 * Creates the context for all tRPC procedures.
 * Context includes:
 * - Session (from Supabase Auth)
 * - User ID
 * - Organization ID
 * - Supabase client
 *
 * PERFORMANCE OPTIMIZATION:
 * User context (userId, orgId) is now primarily set by middleware
 * via request headers, eliminating repeated DB lookups per tRPC call.
 * Falls back to direct lookup if headers not available.
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Create tRPC context
 *
 * This function is called for every tRPC request.
 * It extracts the session and user information from:
 * 1. Request headers (set by middleware - fast path)
 * 2. Direct Supabase lookup (fallback - slower)
 */
export async function createContext() {
  const supabase = await createClient();
  const headersList = await headers();

  // Fast path: Check if middleware already set user context
  const headerUserId = headersList.get('x-user-id');
  const headerOrgId = headersList.get('x-org-id');

  // If we have headers from middleware, use them (fast path)
  if (headerUserId) {
    // Still need to get user for session, but skip the profile lookup
    const { data: { user } } = await supabase.auth.getUser();

    return {
      session: user ? { user } : null,
      userId: headerUserId,
      orgId: headerOrgId,
      supabase
    };
  }

  // Fallback: Direct lookup (for cases where middleware didn't run)
  const { data: { user } } = await supabase.auth.getUser();

  let userId: string | null = null;
  let orgId: string | null = null;

  if (user) {
    userId = user.id;

    // Get user's org_id from profile using admin client to bypass RLS
    // (RLS policies on user_profiles can cause stack depth exceeded errors)
    try {
      const adminClient = createAdminClient();

      // Single query with OR condition (optimized from two separate queries)
      const { data: profile, error } = await adminClient
        .from('user_profiles')
        .select('org_id')
        .or(`id.eq.${userId},auth_id.eq.${userId}`)
        .limit(1)
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
