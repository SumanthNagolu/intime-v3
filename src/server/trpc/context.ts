import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User | null
  orgId: string | null
  profileId: string | null // user_profiles.id - use for foreign keys, not auth user id
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

  // Use getUser() to securely verify session with Supabase Auth server
  // This prevents cookie tampering attacks (recommended by Supabase)
  const { data: { user } } = await supabase.auth.getUser()
  console.log(`[PERF] context - getUser: ${Date.now() - startTime}ms`)

  let orgId: string | null = null
  let profileId: string | null = null
  if (user) {
    // Check cookie cache first (set on previous request)
    const cachedOrgId = cookieStore.get('x-org-id')?.value
    const cachedProfileId = cookieStore.get('x-profile-id')?.value

    if (cachedOrgId && cachedOrgId !== 'null' && cachedProfileId && cachedProfileId !== 'null') {
      orgId = cachedOrgId
      profileId = cachedProfileId
      console.log(`[PERF] context - orgId/profileId from cookie: 0ms`)
    } else {
      // Fetch from database and cache in cookie
      const profileStart = Date.now()
      const serviceClient = getServiceClient()

      const { data: profile } = await serviceClient
        .from('user_profiles')
        .select('id, org_id')
        .eq('auth_id', user.id)
        .single() as { data: { id: string; org_id: string } | null }

      orgId = profile?.org_id ?? null
      profileId = profile?.id ?? null
      console.log(`[PERF] context - orgId/profileId from DB: ${Date.now() - profileStart}ms`)

      // Cache in cookies for subsequent requests (expires in 1 hour)
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
      if (profileId) {
        try {
          cookieStore.set('x-profile-id', profileId, {
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
    profileId,
  }
}
