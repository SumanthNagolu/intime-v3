import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const portal = searchParams.get('portal') || 'employee'
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Determine redirect based on portal type
      const redirectMap: Record<string, string> = {
        academy: '/academy/catalog',
        employee: '/employee/workspace/dashboard',
        client: '/client/portal',
        talent: '/talent/dashboard',
      }

      const redirectPath = next || redirectMap[portal] || '/employee/workspace/dashboard'
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
