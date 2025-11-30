/**
 * Supabase Server-Side Helper
 *
 * Use this in Server Components, Server Actions, and API Routes
 * Handles server-side authentication with cookie management
 *
 * Epic: FOUND-005 - Configure Supabase Auth
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create an admin Supabase client with service role key
 *
 * Use this for operations that need to bypass RLS:
 * - Profile lookups in tRPC context
 * - Admin operations
 * - Background jobs
 *
 * SECURITY: Never expose this client to the frontend
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Type for Supabase query builder on tables not in generated types
 * Use this for tables like audit_logs, background_jobs, etc. that aren't in Database types
 */
export interface UntypedQueryBuilder {
  insert: (data: Record<string, unknown>) => {
    select: () => { single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }> };
  };
  select: (columns?: string) => {
    eq: (column: string, value: unknown) => UntypedQueryBuilder;
    order: (column: string, options?: { ascending?: boolean }) => UntypedQueryBuilder;
    limit: (count: number) => UntypedQueryBuilder;
    single: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
    maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: Error | null }>;
  };
  update: (data: Record<string, unknown>) => {
    eq: (column: string, value: unknown) => Promise<{ data: unknown; error: Error | null }>;
  };
  delete: () => {
    eq: (column: string, value: unknown) => Promise<{ data: unknown; error: Error | null }>;
  };
}

export type UntypedFromFunction = (table: string) => UntypedQueryBuilder;
