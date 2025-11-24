/**
 * Lazy Supabase Client Initialization
 *
 * Creates Supabase client only when needed (not at module load time).
 * This prevents build-time errors when environment variables aren't available.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
      );
    }

    supabaseInstance = createClient<Database>(url, key);
  }

  return supabaseInstance;
}
