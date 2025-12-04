import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

export interface Context {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User | null
  orgId: string | null
}

export async function createContext(): Promise<Context> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let orgId: string | null = null
  if (user) {
    // Use service role client to bypass RLS and avoid infinite recursion
    // The RLS policy on user_profiles calls auth_user_org_id() which queries
    // user_profiles again, causing "stack depth limit exceeded" error
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('org_id')
      .eq('auth_id', user.id)
      .single()

    orgId = profile?.org_id ?? null
  }

  return {
    supabase,
    user,
    orgId,
  }
}
