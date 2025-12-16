import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/set-org-cookie
 * Sets the x-org-id cookie after login to avoid DB lookup on every request
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch org_id from user_profiles
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

    const orgId = profile?.org_id

    if (orgId) {
      // Set the cookie (1 hour expiry)
      cookieStore.set('x-org-id', orgId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      })
    }

    return NextResponse.json({ success: true, orgId })
  } catch (error) {
    console.error('Error setting org cookie:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
