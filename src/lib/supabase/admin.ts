/**
 * Supabase Admin Client
 *
 * Use this for server-side operations that require service role permissions
 * such as file uploads, admin operations, bypassing RLS, etc.
 *
 * ⚠️ SECURITY: Never expose this client to the browser!
 * Only use in server-side code (Server Actions, API Routes, etc.)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Creates or returns existing admin client with service role key
 * Singleton pattern to reuse connection
 */
export function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

/**
 * Create a one-time admin client (useful for testing)
 */
export function createAdminClientOnce() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
