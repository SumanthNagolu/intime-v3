import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefreshPayload {
  token_id: string
  org_id: string
}

// Provider-specific token endpoints
const PROVIDER_TOKEN_URLS: Record<string, string> = {
  google: 'https://oauth2.googleapis.com/token',
  microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  zoom: 'https://zoom.us/oauth/token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const payload: RefreshPayload = await req.json()
    const { token_id, org_id } = payload

    // Get token details with integration config
    const { data: token, error: tokenError } = await supabase
      .from('integration_oauth_tokens')
      .select('*, integrations!inner(provider, config)')
      .eq('id', token_id)
      .single()

    if (tokenError || !token) {
      throw new Error(`Token not found: ${token_id}`)
    }

    if (!token.refresh_token) {
      throw new Error('No refresh token available')
    }

    const provider = token.provider
    const tokenUrl = PROVIDER_TOKEN_URLS[provider]
    if (!tokenUrl) {
      throw new Error(`Unsupported OAuth provider: ${provider}`)
    }

    // Get client credentials from integration config
    const config = token.integrations?.config || {}
    const clientId = config.client_id
    const clientSecret = config.client_secret

    if (!clientId || !clientSecret) {
      throw new Error('Missing client credentials in integration config')
    }

    // Refresh the token
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Token refresh failed:', errorBody)

      // Mark token as expired
      await supabase
        .from('integration_oauth_tokens')
        .update({
          status: 'expired',
        })
        .eq('id', token_id)

      // Update integration status
      await supabase
        .from('integrations')
        .update({
          status: 'error',
          error_message: 'OAuth token expired - re-authentication required',
        })
        .eq('id', token.integration_id)

      return new Response(
        JSON.stringify({ success: false, error: 'Token refresh failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await response.json()

    // Calculate expiration
    const expiresIn = tokenData.expires_in || 3600
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Update token
    await supabase
      .from('integration_oauth_tokens')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || token.refresh_token, // Some providers don't rotate
        expires_at: expiresAt,
        scope: tokenData.scope || token.scope,
        last_refreshed_at: new Date().toISOString(),
        status: 'active',
        raw_token_response: tokenData,
      })
      .eq('id', token_id)

    return new Response(
      JSON.stringify({ success: true, expires_at: expiresAt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OAuth refresh error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
