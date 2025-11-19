/**
 * Supabase Client-Side Helper
 *
 * Use this in Client Components ("use client")
 * Handles browser-based authentication and API calls
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
