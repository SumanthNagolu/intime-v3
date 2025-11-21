/**
 * Lazy Supabase Client Initialization
 *
 * Creates Supabase client only when needed (not at module load time).
 * This prevents build-time errors when environment variables aren't available.
 */

import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'
      );
    }

    supabaseInstance = createClient(url, key);
  }

  return supabaseInstance;
}
