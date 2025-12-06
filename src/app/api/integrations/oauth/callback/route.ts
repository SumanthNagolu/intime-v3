import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// OAuth provider configurations
const OAUTH_CONFIGS: Record<string, {
  tokenUrl: string
  scope: string
}> = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send',
  },
  microsoft: {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'Calendars.ReadWrite Mail.Send User.Read offline_access',
  },
  zoom: {
    tokenUrl: 'https://zoom.us/oauth/token',
    scope: 'meeting:write meeting:read user:read',
  },
}

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle error from OAuth provider
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'OAuth authorization failed'
    return NextResponse.redirect(
      new URL(`/employee/admin/integrations/oauth/complete?error=${encodeURIComponent(errorDescription)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/employee/admin/integrations/oauth/complete?error=Missing%20authorization%20code%20or%20state', request.url)
    )
  }

  // Decode state
  let stateData: { integrationId: string; provider: string; orgId: string; userId: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
  } catch {
    return NextResponse.redirect(
      new URL('/employee/admin/integrations/oauth/complete?error=Invalid%20state%20parameter', request.url)
    )
  }

  const { integrationId, provider, orgId, userId } = stateData
  const providerConfig = OAUTH_CONFIGS[provider]

  if (!providerConfig) {
    return NextResponse.redirect(
      new URL('/employee/admin/integrations/oauth/complete?error=Unknown%20OAuth%20provider', request.url)
    )
  }

  // Get OAuth credentials from environment
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`]
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/employee/admin/integrations/oauth/complete?error=OAuth%20not%20configured%20for%20this%20provider', request.url)
    )
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/callback`

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(provider === 'zoom' && {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        }),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        ...(provider !== 'zoom' && {
          client_id: clientId,
          client_secret: clientSecret,
        }),
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(
        new URL('/employee/admin/integrations/oauth/complete?error=Failed%20to%20exchange%20authorization%20code', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info to get email
    let accountEmail = ''
    if (provider === 'google') {
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userInfo.ok) {
        const user = await userInfo.json()
        accountEmail = user.email
      }
    } else if (provider === 'microsoft') {
      const userInfo = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userInfo.ok) {
        const user = await userInfo.json()
        accountEmail = user.mail || user.userPrincipalName
      }
    } else if (provider === 'zoom') {
      const userInfo = await fetch('https://api.zoom.us/v2/users/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userInfo.ok) {
        const user = await userInfo.json()
        accountEmail = user.email
      }
    }

    // Calculate token expiry
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null

    const adminClient = getAdminClient()

    // Upsert OAuth token
    const { error: upsertError } = await adminClient
      .from('integration_oauth_tokens')
      .upsert({
        integration_id: integrationId,
        org_id: orgId,
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: expiresAt,
        scope: providerConfig.scope,
        account_email: accountEmail,
        status: 'active',
        created_by: userId,
        updated_by: userId,
      }, {
        onConflict: 'integration_id',
      })

    if (upsertError) {
      console.error('Failed to store OAuth token:', upsertError)
      return NextResponse.redirect(
        new URL('/employee/admin/integrations/oauth/complete?error=Failed%20to%20save%20OAuth%20credentials', request.url)
      )
    }

    // Update integration status to active if it was in error
    await adminClient
      .from('integrations')
      .update({
        status: 'active',
        error_message: null,
        error_count: 0,
      })
      .eq('id', integrationId)
      .eq('status', 'error')

    return NextResponse.redirect(
      new URL(`/employee/admin/integrations/oauth/complete?success=true&provider=${provider}&email=${encodeURIComponent(accountEmail)}&integrationId=${integrationId}`, request.url)
    )
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/employee/admin/integrations/oauth/complete?error=An%20unexpected%20error%20occurred', request.url)
    )
  }
}
