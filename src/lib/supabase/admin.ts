import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Singleton Admin Client for bypassing RLS
 *
 * This client uses the service role key and should only be used
 * in server-side code (tRPC routers, API routes, etc.)
 *
 * The singleton pattern prevents creating a new client on every request,
 * which significantly improves performance by reusing connections.
 */
let adminClient: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        // Connection pooling settings for better performance
        db: {
          schema: 'public',
        },
      }
    )
  }
  return adminClient
}

/**
 * Reset the admin client (useful for testing)
 */
export function resetAdminClient(): void {
  adminClient = null
}
