/**
 * Server-side tRPC Client
 *
 * Provides a way to call tRPC procedures directly on the server (Server Components, API routes, etc.)
 */

import { appRouter } from '@/server/trpc/root';
import { createClient } from '@/lib/supabase/server';

export const trpc = {
  /**
   * Create a server-side tRPC caller
   *
   * @param opts - Options including userId for context
   * @returns A tRPC caller instance with all procedures
   */
  createCaller: async (opts: { userId?: string } = {}) => {
    const supabase = await createClient();

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    let orgId = null;
    if (opts.userId) {
      // Get user's org_id from profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('id', opts.userId)
        .single();
      orgId = profile?.org_id || null;
    }

    // Create context
    const context = {
      session,
      userId: opts.userId || null,
      orgId,
      supabase,
    };

    // Return caller with context
    return appRouter.createCaller(context);
  },
};
