import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User | null
  orgId: string | null
}

// Cache for service client (reuse across requests in same process)
let cachedServiceClient: ReturnType<typeof createServiceClient> | null = null

function getServiceClient() {
  if (!cachedServiceClient) {
    cachedServiceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return cachedServiceClient
}

export async function createContext(): Promise<Context> {
  const startTime = Date.now()
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Use getSession() instead of getUser() - faster as it uses cached session
  // getUser() makes a network call to verify, getSession() reads from cookie
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  console.log(`[PERF] context - getSession: ${Date.now() - startTime}ms`)

  let orgId: string | null = null
  if (user) {
    // Check cookie cache first (set on previous request)
    const cachedOrgId = cookieStore.get('x-org-id')?.value

    if (cachedOrgId && cachedOrgId !== 'null') {
      orgId = cachedOrgId
      console.log(`[PERF] context - orgId from cookie: 0ms`)
    } else {
      // Fetch from database and cache in cookie
      const profileStart = Date.now()
      const serviceClient = getServiceClient()

      const { data: profile } = await serviceClient
        .from('user_profiles')
        .select('org_id')
        .eq('auth_id', user.id)
        .single()

      orgId = profile?.org_id ?? null
      console.log(`[PERF] context - orgId from DB: ${Date.now() - profileStart}ms`)

      // Cache orgId in cookie for subsequent requests (expires in 1 hour)
      if (orgId) {
        try {
          cookieStore.set('x-org-id', orgId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
          })
        } catch {
          // May fail in Server Components - that's ok
        }
      }
    }
  }

  console.log(`[PERF] context - total: ${Date.now() - startTime}ms`)

  return {
    supabase,
    user,
    orgId,
  }
}
