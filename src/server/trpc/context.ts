import { createClient } from '@/lib/supabase/server'
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
    const { data: profile } = await supabase
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
