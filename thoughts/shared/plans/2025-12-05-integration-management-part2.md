# Integration Management Part 2 Implementation Plan

## Overview

Implement the advanced features for Integration Management: Webhook Management (AC-4), Retry Configuration (AC-5), OAuth Flow (AC-6), and Fallback/Failover (AC-7). This builds on the foundation established in Part 1.

## Current State Analysis

- Part 1 implemented: Database tables, tRPC router, dashboard, configuration forms, health monitoring
- Event bus exists at database level with `publish_event()` function
- Edge functions pattern established for background processing
- No webhook delivery, retry system, or OAuth token management exists

### Key Discoveries from Research:
- **Event System**: `supabase/migrations/20251119190000_update_event_bus_multitenancy.sql:10-87` - PostgreSQL NOTIFY
- **Event Types**: 268 event types defined in `docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md`
- **Edge Functions**: `src/server/routers/data.ts:22-47` - Fire-and-forget trigger pattern
- **OAuth**: Only Google OAuth via Supabase Auth exists at `src/lib/auth/client.ts:67-94`

## Desired End State

After this implementation:
1. Admin can create webhooks subscribed to specific events with HMAC signature verification
2. Admin can test webhooks and view delivery history with debugging tools
3. Admin can configure retry strategies (exponential, linear, fixed) with DLQ support
4. Admin can process or clear DLQ items
5. Admin can connect integrations via OAuth with automatic token refresh
6. Admin can configure failover/backup providers with auto-switching

### Verification:
- Create webhook and receive test delivery
- View webhook delivery history and replay failed deliveries
- Configure retry policy and verify backoff behavior
- Connect Google Calendar via OAuth flow
- Configure failover and manually trigger switch

## What We're NOT Doing

- **Custom OAuth providers** - Only support predefined providers (Google, Microsoft, Zoom)
- **Scheduled health checks** - Defer to future enhancement (requires pg_cron)
- **Real-time webhook delivery** - Use polling for history updates (no WebSocket)
- **Webhook payload transformations** - Send raw event payloads only
- **Multi-region failover** - Single backup provider only

## Implementation Approach

1. **Phase 1**: Database migration for webhooks, retry config, OAuth tokens, failover tables
2. **Phase 2**: Edge functions for webhook delivery and OAuth token refresh
3. **Phase 3**: tRPC router extensions for webhooks, retry, OAuth, failover
4. **Phase 4**: Webhook management UI (list, create, debug)
5. **Phase 5**: Retry configuration and DLQ management UI
6. **Phase 6**: OAuth flow UI and failover configuration

---

## Phase 1: Database Migration

### Overview
Extend the database schema with tables for webhooks, delivery history, retry configuration, OAuth tokens, and failover configuration.

### Changes Required:

#### 1. Create Migration File
**File**: `supabase/migrations/20251210000000_integration_management_part2_tables.sql`

```sql
-- =============================================
-- INTEGRATION MANAGEMENT TABLES - PART 2
-- Webhooks, Retry Config, OAuth, Failover
-- =============================================

-- ============================================
-- WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  secret VARCHAR(64) NOT NULL, -- HMAC secret for signature
  events TEXT[] NOT NULL DEFAULT '{}', -- Array of subscribed event types
  headers JSONB DEFAULT '{}', -- Custom headers to include
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, disabled
  consecutive_failures INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

-- ============================================
-- WEBHOOK DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_id UUID, -- Reference to source event if applicable
  payload JSONB NOT NULL,
  request_url TEXT NOT NULL,
  request_headers JSONB NOT NULL,
  request_body TEXT NOT NULL,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, failed, retrying, dlq
  error_message TEXT,
  error_code VARCHAR(50),
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_org ON webhook_deliveries(org_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at)
  WHERE status = 'retrying' AND next_retry_at IS NOT NULL;
CREATE INDEX idx_webhook_deliveries_dlq ON webhook_deliveries(org_id, status)
  WHERE status = 'dlq';

-- ============================================
-- RETRY CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_retry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  max_retries INTEGER NOT NULL DEFAULT 3,
  retry_strategy VARCHAR(20) NOT NULL DEFAULT 'exponential', -- exponential, linear, fixed
  base_delay_seconds INTEGER NOT NULL DEFAULT 5,
  max_delay_seconds INTEGER NOT NULL DEFAULT 300,
  enable_jitter BOOLEAN DEFAULT true,
  enable_dlq BOOLEAN DEFAULT true,
  dlq_retention_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id)
);

-- Insert default config for existing orgs (will be created on first access)
-- No seed data needed - created lazily

-- ============================================
-- OAUTH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id), -- User who authorized (optional)
  provider VARCHAR(50) NOT NULL, -- google, microsoft, zoom, etc.
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_type VARCHAR(20) DEFAULT 'Bearer',
  scope TEXT, -- Space-separated scopes
  expires_at TIMESTAMPTZ,
  refresh_expires_at TIMESTAMPTZ, -- Some providers expire refresh tokens
  account_id VARCHAR(255), -- Provider account identifier
  account_email VARCHAR(255), -- Provider account email
  raw_token_response JSONB, -- Full response for debugging
  last_refreshed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_oauth_tokens_integration ON integration_oauth_tokens(integration_id);
CREATE INDEX idx_oauth_tokens_org ON integration_oauth_tokens(org_id);
CREATE INDEX idx_oauth_tokens_expires ON integration_oauth_tokens(expires_at)
  WHERE status = 'active';
CREATE UNIQUE INDEX idx_oauth_tokens_unique_integration
  ON integration_oauth_tokens(integration_id)
  WHERE status = 'active';

-- ============================================
-- FAILOVER CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integration_failover_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL, -- email, sms, etc.
  primary_integration_id UUID NOT NULL REFERENCES integrations(id),
  backup_integration_id UUID REFERENCES integrations(id),
  failover_threshold INTEGER DEFAULT 3, -- Consecutive failures before failover
  auto_failover BOOLEAN DEFAULT true,
  auto_recovery BOOLEAN DEFAULT false, -- Auto-switch back when primary recovers
  recovery_check_interval_minutes INTEGER DEFAULT 30,
  current_active VARCHAR(20) DEFAULT 'primary', -- primary, backup
  last_failover_at TIMESTAMPTZ,
  last_recovery_at TIMESTAMPTZ,
  failover_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, integration_type)
);

-- Indexes
CREATE INDEX idx_failover_config_org ON integration_failover_config(org_id);
CREATE INDEX idx_failover_config_primary ON integration_failover_config(primary_integration_id);
CREATE INDEX idx_failover_config_backup ON integration_failover_config(backup_integration_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Webhooks RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_org_access" ON webhooks
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Webhook Deliveries RLS
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_deliveries_org_access" ON webhook_deliveries
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Retry Config RLS
ALTER TABLE integration_retry_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retry_config_org_access" ON integration_retry_config
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- OAuth Tokens RLS
ALTER TABLE integration_oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oauth_tokens_org_access" ON integration_oauth_tokens
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Failover Config RLS
ALTER TABLE integration_failover_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "failover_config_org_access" ON integration_failover_config
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on webhooks
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on retry config
CREATE TRIGGER trigger_retry_config_updated_at
  BEFORE UPDATE ON integration_retry_config
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on oauth tokens
CREATE TRIGGER trigger_oauth_tokens_updated_at
  BEFORE UPDATE ON integration_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- Update updated_at on failover config
CREATE TRIGGER trigger_failover_config_updated_at
  BEFORE UPDATE ON integration_failover_config
  FOR EACH ROW
  EXECUTE FUNCTION update_webhooks_updated_at();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get webhook stats for dashboard
CREATE OR REPLACE FUNCTION get_webhook_stats(p_org_id UUID)
RETURNS TABLE (
  total_webhooks BIGINT,
  active_webhooks BIGINT,
  total_deliveries BIGINT,
  successful_deliveries BIGINT,
  failed_deliveries BIGINT,
  dlq_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM webhooks WHERE org_id = p_org_id AND deleted_at IS NULL) as total_webhooks,
    (SELECT COUNT(*) FROM webhooks WHERE org_id = p_org_id AND status = 'active' AND deleted_at IS NULL) as active_webhooks,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id) as total_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'success') as successful_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'failed') as failed_deliveries,
    (SELECT COUNT(*) FROM webhook_deliveries WHERE org_id = p_org_id AND status = 'dlq') as dlq_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate webhook secret
CREATE OR REPLACE FUNCTION generate_webhook_secret()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-disable webhook after consecutive failures
CREATE OR REPLACE FUNCTION check_webhook_auto_disable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consecutive_failures >= 10 AND OLD.consecutive_failures < 10 THEN
    NEW.status = 'disabled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_webhook_auto_disable
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  WHEN (NEW.consecutive_failures IS DISTINCT FROM OLD.consecutive_failures)
  EXECUTE FUNCTION check_webhook_auto_disable();
```

### Success Criteria:

#### Automated Verification:
- [ ] Migration applies cleanly: `pnpm db:migrate`
- [ ] Tables exist: `webhooks`, `webhook_deliveries`, `integration_retry_config`, `integration_oauth_tokens`, `integration_failover_config`
- [ ] RLS policies active on all tables
- [ ] Indexes created for performance

#### Manual Verification:
- [ ] Can insert test webhook via Supabase Studio
- [ ] RLS blocks cross-org access
- [ ] `get_webhook_stats` function returns correct counts
- [ ] `generate_webhook_secret` produces 64-char hex string

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 2.

---

## Phase 2: Edge Functions

### Overview
Create Supabase Edge Functions for webhook delivery with retry logic and OAuth token refresh.

### Changes Required:

#### 1. Create Webhook Delivery Edge Function
**File**: `supabase/functions/deliver-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeliveryPayload {
  delivery_id: string
  webhook_id: string
  org_id: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const payload: DeliveryPayload = await req.json()
    const { delivery_id, webhook_id, org_id } = payload

    // Get delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('id', delivery_id)
      .single()

    if (deliveryError || !delivery) {
      throw new Error(`Delivery not found: ${delivery_id}`)
    }

    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .single()

    if (webhookError || !webhook) {
      throw new Error(`Webhook not found: ${webhook_id}`)
    }

    // Check if webhook is active
    if (webhook.status !== 'active') {
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          error_message: 'Webhook is not active',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery_id)

      return new Response(JSON.stringify({ success: false, error: 'Webhook not active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate signature
    const timestamp = new Date().toISOString()
    const signaturePayload = `${timestamp}.${delivery.request_body}`
    const signature = `sha256=${createHmac('sha256', webhook.secret)
      .update(signaturePayload)
      .digest('hex')}`

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-InTime-Signature': signature,
      'X-InTime-Timestamp': timestamp,
      'X-InTime-Event': delivery.event_type,
      'X-InTime-Delivery': delivery_id,
      ...(webhook.headers || {}),
    }

    // Make the request
    const startTime = Date.now()
    let response: Response
    let responseBody: string
    let responseHeaders: Record<string, string> = {}

    try {
      response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: delivery.request_body,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      responseBody = await response.text()
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
    } catch (fetchError) {
      // Network or timeout error
      const duration = Date.now() - startTime

      await handleDeliveryFailure(supabase, delivery, webhook, org_id, {
        status: 0,
        body: '',
        headers: {},
        duration,
        error: fetchError instanceof Error ? fetchError.message : 'Network error',
      })

      return new Response(JSON.stringify({ success: false, error: 'Network error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const duration = Date.now() - startTime

    // Check if successful (2xx status)
    if (response.status >= 200 && response.status < 300) {
      // Success!
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'success',
          response_status: response.status,
          response_headers: responseHeaders,
          response_body: responseBody.slice(0, 10000), // Limit stored response
          duration_ms: duration,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', delivery_id)

      // Reset webhook failure count
      await supabase
        .from('webhooks')
        .update({
          consecutive_failures: 0,
          last_success_at: new Date().toISOString(),
          last_triggered_at: new Date().toISOString(),
        })
        .eq('id', webhook_id)

      return new Response(JSON.stringify({ success: true, status: response.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Failed - handle retry logic
      await handleDeliveryFailure(supabase, delivery, webhook, org_id, {
        status: response.status,
        body: responseBody,
        headers: responseHeaders,
        duration,
        error: `HTTP ${response.status}`,
      })

      return new Response(JSON.stringify({ success: false, status: response.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Webhook delivery error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleDeliveryFailure(
  supabase: any,
  delivery: any,
  webhook: any,
  orgId: string,
  result: {
    status: number
    body: string
    headers: Record<string, string>
    duration: number
    error: string
  }
) {
  // Get retry config
  const { data: retryConfig } = await supabase
    .from('integration_retry_config')
    .select('*')
    .eq('org_id', orgId)
    .single()

  const config = retryConfig || {
    max_retries: 3,
    retry_strategy: 'exponential',
    base_delay_seconds: 5,
    max_delay_seconds: 300,
    enable_jitter: true,
    enable_dlq: true,
  }

  const currentAttempt = delivery.attempt_number
  const maxAttempts = config.max_retries + 1 // Initial attempt + retries

  // Check if retryable (4xx client errors are not retryable, except 429)
  const isRetryable = result.status === 0 || result.status === 429 || result.status >= 500

  if (isRetryable && currentAttempt < maxAttempts) {
    // Schedule retry
    const nextDelay = calculateDelay(
      currentAttempt,
      config.retry_strategy,
      config.base_delay_seconds,
      config.max_delay_seconds,
      config.enable_jitter
    )

    const nextRetryAt = new Date(Date.now() + nextDelay * 1000).toISOString()

    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'retrying',
        response_status: result.status,
        response_headers: result.headers,
        response_body: result.body.slice(0, 10000),
        duration_ms: result.duration,
        error_message: result.error,
        next_retry_at: nextRetryAt,
        attempt_number: currentAttempt + 1,
      })
      .eq('id', delivery.id)

    // Note: A separate cron job or trigger would pick up retrying deliveries
  } else {
    // Max retries exceeded or non-retryable error
    const finalStatus = config.enable_dlq ? 'dlq' : 'failed'

    await supabase
      .from('webhook_deliveries')
      .update({
        status: finalStatus,
        response_status: result.status,
        response_headers: result.headers,
        response_body: result.body.slice(0, 10000),
        duration_ms: result.duration,
        error_message: result.error,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', delivery.id)
  }

  // Increment webhook failure count
  await supabase
    .from('webhooks')
    .update({
      consecutive_failures: webhook.consecutive_failures + 1,
      last_failure_at: new Date().toISOString(),
      last_triggered_at: new Date().toISOString(),
    })
    .eq('id', webhook.id)
}

function calculateDelay(
  attempt: number,
  strategy: string,
  baseDelay: number,
  maxDelay: number,
  enableJitter: boolean
): number {
  let delay: number

  switch (strategy) {
    case 'exponential':
      delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
      break
    case 'linear':
      delay = Math.min(baseDelay * attempt, maxDelay)
      break
    case 'fixed':
    default:
      delay = baseDelay
      break
  }

  if (enableJitter) {
    // Add 0-50% random jitter
    delay = delay * (1 + Math.random() * 0.5)
  }

  return Math.round(delay)
}
```

#### 2. Create OAuth Token Refresh Edge Function
**File**: `supabase/functions/refresh-oauth-token/index.ts`

```typescript
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

    // Get token details
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
          error_message: `Refresh failed: ${response.status}`,
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
```

#### 3. Update Shared CORS Headers
**File**: `supabase/functions/_shared/cors.ts` (update if needed)

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Edge functions deploy without errors: `supabase functions deploy deliver-webhook`
- [ ] Edge functions deploy without errors: `supabase functions deploy refresh-oauth-token`
- [ ] Functions are listed: `supabase functions list`

#### Manual Verification:
- [ ] Can call `deliver-webhook` with test payload
- [ ] Webhook signature is correctly generated
- [ ] Retry delay calculation works for all strategies
- [ ] OAuth token refresh updates database correctly

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 3.

---

## Phase 3: tRPC Router Extensions

### Overview
Extend the integrations tRPC router with procedures for webhooks, retry configuration, OAuth, and failover.

### Changes Required:

#### 1. Extend Integrations Router
**File**: `src/server/routers/integrations.ts`

Add the following procedures after the existing ones:

```typescript
// Add these imports at the top
import { randomBytes, createHmac } from 'crypto'

// Add to the router object:

  // ============================================
  // WEBHOOK PROCEDURES
  // ============================================

  // List webhooks
  listWebhooks: orgProtectedProcedure
    .input(z.object({
      status: z.enum(['active', 'inactive', 'disabled']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { status, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('webhooks')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (status) {
        query = query.eq('status', status)
      }

      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch webhooks',
        })
      }

      return {
        items: data ?? [],
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // Get webhook stats
  getWebhookStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_webhook_stats', { p_org_id: orgId })

      if (error) {
        console.error('Failed to fetch webhook stats:', error)
        return {
          totalWebhooks: 0,
          activeWebhooks: 0,
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          dlqCount: 0,
        }
      }

      const stats = data?.[0] ?? {}
      return {
        totalWebhooks: Number(stats.total_webhooks) || 0,
        activeWebhooks: Number(stats.active_webhooks) || 0,
        totalDeliveries: Number(stats.total_deliveries) || 0,
        successfulDeliveries: Number(stats.successful_deliveries) || 0,
        failedDeliveries: Number(stats.failed_deliveries) || 0,
        dlqCount: Number(stats.dlq_count) || 0,
      }
    }),

  // Get webhook by ID
  getWebhookById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      return data
    }),

  // Create webhook
  createWebhook: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      url: z.string().url(),
      events: z.array(z.string()).min(1),
      headers: z.record(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Generate secret
      const secret = randomBytes(32).toString('hex')

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          url: input.url,
          secret,
          events: input.events,
          headers: input.headers || {},
          status: 'active',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create webhook',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'webhooks',
        record_id: webhook.id,
        new_values: { name: input.name, url: input.url, events: input.events },
      })

      return webhook
    }),

  // Update webhook
  updateWebhook: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional().nullable(),
      url: z.string().url().optional(),
      events: z.array(z.string()).min(1).optional(),
      headers: z.record(z.string()).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const { id, ...updates } = input

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook',
        })
      }

      // Reset consecutive failures if re-enabling
      if (updates.status === 'active') {
        await supabase
          .from('webhooks')
          .update({ consecutive_failures: 0 })
          .eq('id', id)
      }

      return webhook
    }),

  // Delete webhook
  deleteWebhook: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { error } = await supabase
        .from('webhooks')
        .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete webhook',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'webhooks',
        record_id: input.id,
      })

      return { success: true }
    }),

  // Regenerate webhook secret
  regenerateWebhookSecret: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const secret = randomBytes(32).toString('hex')

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update({ secret })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to regenerate secret',
        })
      }

      return { secret }
    }),

  // Test webhook
  testWebhook: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      eventType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get webhook
      const { data: webhook, error: webhookError } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (webhookError || !webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      // Create test payload
      const testPayload = {
        event: input.eventType,
        test: true,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          triggered_by: user?.email,
        },
      }

      const requestBody = JSON.stringify(testPayload)

      // Create delivery record
      const { data: delivery, error: deliveryError } = await adminClient
        .from('webhook_deliveries')
        .insert({
          org_id: orgId,
          webhook_id: input.id,
          event_type: input.eventType,
          payload: testPayload,
          request_url: webhook.url,
          request_headers: {
            'Content-Type': 'application/json',
            'X-InTime-Event': input.eventType,
          },
          request_body: requestBody,
          status: 'pending',
        })
        .select()
        .single()

      if (deliveryError || !delivery) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create delivery record',
        })
      }

      // Trigger edge function (fire and forget)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: delivery.id,
          webhook_id: input.id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger webhook delivery:', err))

      return { deliveryId: delivery.id }
    }),

  // Get delivery history
  getDeliveryHistory: orgProtectedProcedure
    .input(z.object({
      webhookId: z.string().uuid().optional(),
      status: z.enum(['pending', 'success', 'failed', 'retrying', 'dlq']).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name)', { count: 'exact' })
        .eq('org_id', orgId)

      if (input.webhookId) {
        query = query.eq('webhook_id', input.webhookId)
      }
      if (input.status) {
        query = query.eq('status', input.status)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch delivery history',
        })
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      }
    }),

  // Get delivery details
  getDeliveryById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name, url)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      return data
    }),

  // Replay delivery
  replayDelivery: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get original delivery
      const { data: original, error: originalError } = await adminClient
        .from('webhook_deliveries')
        .select('*')
        .eq('id', input.deliveryId)
        .eq('org_id', orgId)
        .single()

      if (originalError || !original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      // Create new delivery with same payload
      const { data: delivery, error: deliveryError } = await adminClient
        .from('webhook_deliveries')
        .insert({
          org_id: orgId,
          webhook_id: original.webhook_id,
          event_type: original.event_type,
          event_id: original.event_id,
          payload: original.payload,
          request_url: original.request_url,
          request_headers: original.request_headers,
          request_body: original.request_body,
          status: 'pending',
          attempt_number: 1,
        })
        .select()
        .single()

      if (deliveryError || !delivery) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create replay delivery',
        })
      }

      // Trigger edge function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: delivery.id,
          webhook_id: original.webhook_id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger replay:', err))

      return { deliveryId: delivery.id }
    }),

  // ============================================
  // RETRY CONFIGURATION PROCEDURES
  // ============================================

  // Get retry config
  getRetryConfig: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_retry_config')
        .select('*')
        .eq('org_id', orgId)
        .single()

      // Return defaults if no config exists
      if (error || !data) {
        return {
          maxRetries: 3,
          retryStrategy: 'exponential' as const,
          baseDelaySeconds: 5,
          maxDelaySeconds: 300,
          enableJitter: true,
          enableDlq: true,
          dlqRetentionDays: 30,
        }
      }

      return {
        maxRetries: data.max_retries,
        retryStrategy: data.retry_strategy as 'exponential' | 'linear' | 'fixed',
        baseDelaySeconds: data.base_delay_seconds,
        maxDelaySeconds: data.max_delay_seconds,
        enableJitter: data.enable_jitter,
        enableDlq: data.enable_dlq,
        dlqRetentionDays: data.dlq_retention_days,
      }
    }),

  // Update retry config
  updateRetryConfig: orgProtectedProcedure
    .input(z.object({
      maxRetries: z.number().min(1).max(10),
      retryStrategy: z.enum(['exponential', 'linear', 'fixed']),
      baseDelaySeconds: z.number().min(1).max(60),
      maxDelaySeconds: z.number().min(1).max(3600),
      enableJitter: z.boolean(),
      enableDlq: z.boolean(),
      dlqRetentionDays: z.number().min(1).max(90).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Upsert config
      const { data, error } = await adminClient
        .from('integration_retry_config')
        .upsert({
          org_id: orgId,
          max_retries: input.maxRetries,
          retry_strategy: input.retryStrategy,
          base_delay_seconds: input.baseDelaySeconds,
          max_delay_seconds: input.maxDelaySeconds,
          enable_jitter: input.enableJitter,
          enable_dlq: input.enableDlq,
          dlq_retention_days: input.dlqRetentionDays ?? 30,
        }, { onConflict: 'org_id' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update retry config',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'integration_retry_config',
        new_values: input,
      })

      return data
    }),

  // ============================================
  // DLQ PROCEDURES
  // ============================================

  // Get DLQ items
  getDlqItems: orgProtectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, count, error } = await adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name, url)', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('status', 'dlq')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch DLQ items',
        })
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      }
    }),

  // Retry DLQ item
  retryDlqItem: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Reset delivery to pending
      const { data, error } = await adminClient
        .from('webhook_deliveries')
        .update({
          status: 'pending',
          attempt_number: 1,
          next_retry_at: null,
          error_message: null,
        })
        .eq('id', input.deliveryId)
        .eq('org_id', orgId)
        .eq('status', 'dlq')
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry DLQ item',
        })
      }

      // Trigger delivery
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: data.id,
          webhook_id: data.webhook_id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger DLQ retry:', err))

      return { success: true }
    }),

  // Clear DLQ item
  clearDlqItem: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('webhook_deliveries')
        .update({ status: 'failed' }) // Mark as failed instead of deleting for audit
        .eq('id', input.deliveryId)
        .eq('org_id', orgId)
        .eq('status', 'dlq')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear DLQ item',
        })
      }

      return { success: true }
    }),

  // Clear all DLQ items
  clearAllDlqItems: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('webhook_deliveries')
        .update({ status: 'failed' })
        .eq('org_id', orgId)
        .eq('status', 'dlq')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear DLQ',
        })
      }

      return { success: true }
    }),

  // ============================================
  // OAUTH PROCEDURES
  // ============================================

  // Get OAuth status for integration
  getOAuthStatus: orgProtectedProcedure
    .input(z.object({ integrationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_oauth_tokens')
        .select('id, provider, account_email, status, expires_at, scope, last_refreshed_at')
        .eq('integration_id', input.integrationId)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        return {
          connected: false,
          token: null,
        }
      }

      return {
        connected: true,
        token: {
          id: data.id,
          provider: data.provider,
          accountEmail: data.account_email,
          status: data.status,
          expiresAt: data.expires_at,
          scope: data.scope,
          lastRefreshedAt: data.last_refreshed_at,
        },
      }
    }),

  // Initiate OAuth flow
  initiateOAuth: orgProtectedProcedure
    .input(z.object({
      integrationId: z.string().uuid(),
      provider: z.enum(['google', 'microsoft', 'zoom']),
      scopes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get integration config for client credentials
      const { data: integration, error } = await adminClient
        .from('integrations')
        .select('config')
        .eq('id', input.integrationId)
        .eq('org_id', orgId)
        .single()

      if (error || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      const config = integration.config as Record<string, string>
      const clientId = config.client_id

      if (!clientId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Client ID not configured',
        })
      }

      // Generate OAuth URL based on provider
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`
      const state = Buffer.from(JSON.stringify({
        integrationId: input.integrationId,
        orgId,
        provider: input.provider,
      })).toString('base64url')

      let authUrl: string
      const defaultScopes: Record<string, string[]> = {
        google: ['https://www.googleapis.com/auth/calendar'],
        microsoft: ['Calendars.ReadWrite', 'User.Read'],
        zoom: ['meeting:read', 'meeting:write'],
      }

      const scopes = input.scopes || defaultScopes[input.provider] || []

      switch (input.provider) {
        case 'google':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes.join(' '))}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${state}`
          break
        case 'microsoft':
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes.join(' ') + ' offline_access')}&` +
            `state=${state}`
          break
        case 'zoom':
          authUrl = `https://zoom.us/oauth/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `state=${state}`
          break
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Unsupported provider',
          })
      }

      return { authUrl }
    }),

  // Complete OAuth flow (called from callback)
  completeOAuth: orgProtectedProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Decode state
      let stateData: { integrationId: string; orgId: string; provider: string }
      try {
        stateData = JSON.parse(Buffer.from(input.state, 'base64url').toString())
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid state parameter',
        })
      }

      // Verify org matches
      if (stateData.orgId !== orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Organization mismatch',
        })
      }

      // Get integration config
      const { data: integration, error: integrationError } = await adminClient
        .from('integrations')
        .select('config')
        .eq('id', stateData.integrationId)
        .eq('org_id', orgId)
        .single()

      if (integrationError || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      const config = integration.config as Record<string, string>
      const clientId = config.client_id
      const clientSecret = config.client_secret

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'OAuth credentials not configured',
        })
      }

      // Exchange code for tokens
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`
      let tokenUrl: string
      let body: URLSearchParams

      const tokenUrls: Record<string, string> = {
        google: 'https://oauth2.googleapis.com/token',
        microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        zoom: 'https://zoom.us/oauth/token',
      }

      tokenUrl = tokenUrls[stateData.provider]
      body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      })

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text()
        console.error('OAuth token exchange failed:', errorBody)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to exchange OAuth code',
        })
      }

      const tokenData = await tokenResponse.json()

      // Calculate expiration
      const expiresIn = tokenData.expires_in || 3600
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      // Delete any existing active token for this integration
      await adminClient
        .from('integration_oauth_tokens')
        .update({ status: 'revoked' })
        .eq('integration_id', stateData.integrationId)
        .eq('status', 'active')

      // Create new token record
      const { data: token, error: tokenError } = await adminClient
        .from('integration_oauth_tokens')
        .insert({
          org_id: orgId,
          integration_id: stateData.integrationId,
          user_id: user?.id,
          provider: stateData.provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type || 'Bearer',
          scope: tokenData.scope,
          expires_at: expiresAt,
          account_email: tokenData.email, // Some providers include this
          raw_token_response: tokenData,
          status: 'active',
        })
        .select()
        .single()

      if (tokenError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to store OAuth token',
        })
      }

      // Update integration status
      await adminClient
        .from('integrations')
        .update({
          status: 'active',
          health_status: 'healthy',
          error_message: null,
        })
        .eq('id', stateData.integrationId)

      return { success: true, integrationId: stateData.integrationId }
    }),

  // Disconnect OAuth
  disconnectOAuth: orgProtectedProcedure
    .input(z.object({ integrationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Revoke token
      const { error } = await adminClient
        .from('integration_oauth_tokens')
        .update({ status: 'revoked' })
        .eq('integration_id', input.integrationId)
        .eq('org_id', orgId)
        .eq('status', 'active')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disconnect OAuth',
        })
      }

      // Update integration status
      await adminClient
        .from('integrations')
        .update({
          status: 'inactive',
          health_status: 'unknown',
        })
        .eq('id', input.integrationId)

      return { success: true }
    }),

  // ============================================
  // FAILOVER PROCEDURES
  // ============================================

  // Get failover config for type
  getFailoverConfig: orgProtectedProcedure
    .input(z.object({ integrationType: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_failover_config')
        .select(`
          *,
          primary_integration:integrations!integration_failover_config_primary_integration_id_fkey(id, name, status, health_status),
          backup_integration:integrations!integration_failover_config_backup_integration_id_fkey(id, name, status, health_status)
        `)
        .eq('org_id', orgId)
        .eq('integration_type', input.integrationType)
        .single()

      if (error || !data) {
        return null
      }

      return data
    }),

  // Update failover config
  updateFailoverConfig: orgProtectedProcedure
    .input(z.object({
      integrationType: z.string(),
      primaryIntegrationId: z.string().uuid(),
      backupIntegrationId: z.string().uuid().optional().nullable(),
      failoverThreshold: z.number().min(1).max(10).default(3),
      autoFailover: z.boolean().default(true),
      autoRecovery: z.boolean().default(false),
      recoveryCheckIntervalMinutes: z.number().min(5).max(60).default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_failover_config')
        .upsert({
          org_id: orgId,
          integration_type: input.integrationType,
          primary_integration_id: input.primaryIntegrationId,
          backup_integration_id: input.backupIntegrationId,
          failover_threshold: input.failoverThreshold,
          auto_failover: input.autoFailover,
          auto_recovery: input.autoRecovery,
          recovery_check_interval_minutes: input.recoveryCheckIntervalMinutes,
        }, { onConflict: 'org_id,integration_type' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update failover config',
        })
      }

      return data
    }),

  // Trigger manual failover
  triggerFailover: orgProtectedProcedure
    .input(z.object({
      integrationType: z.string(),
      targetActive: z.enum(['primary', 'backup']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current config
      const { data: config, error: configError } = await adminClient
        .from('integration_failover_config')
        .select('*')
        .eq('org_id', orgId)
        .eq('integration_type', input.integrationType)
        .single()

      if (configError || !config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Failover config not found',
        })
      }

      if (input.targetActive === 'backup' && !config.backup_integration_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No backup integration configured',
        })
      }

      // Update config
      const updateData: Record<string, any> = {
        current_active: input.targetActive,
      }

      if (input.targetActive === 'backup') {
        updateData.last_failover_at = new Date().toISOString()
        updateData.failover_count = (config.failover_count || 0) + 1
      } else {
        updateData.last_recovery_at = new Date().toISOString()
      }

      const { error: updateError } = await adminClient
        .from('integration_failover_config')
        .update(updateData)
        .eq('id', config.id)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger failover',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: input.targetActive === 'backup' ? 'failover' : 'recovery',
        table_name: 'integration_failover_config',
        record_id: config.id,
        new_values: { current_active: input.targetActive },
      })

      return { success: true, currentActive: input.targetActive }
    }),
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm build`
- [ ] tRPC types generate correctly
- [ ] All new procedures are accessible

#### Manual Verification:
- [ ] Can create webhook and retrieve it
- [ ] Can test webhook and see delivery created
- [ ] Can update retry config
- [ ] Can get OAuth status (returns not connected initially)
- [ ] Can configure failover

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to Phase 4.

---

## Phase 4: Webhook Management UI

### Overview
Create UI pages for listing webhooks, creating/editing webhooks, and debugging deliveries.

### Changes Required:

#### 1. Create Webhooks List Page
**File**: `src/app/employee/admin/integrations/webhooks/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { WebhooksListPage } from '@/components/admin/integrations/WebhooksListPage'

export default function WebhooksPage() {
  return <WebhooksListPage />
}
```

#### 2. Create New Webhook Page
**File**: `src/app/employee/admin/integrations/webhooks/new/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { WebhookFormPage } from '@/components/admin/integrations/WebhookFormPage'

export default function NewWebhookPage() {
  return <WebhookFormPage />
}
```

#### 3. Create Webhook Edit Page
**File**: `src/app/employee/admin/integrations/webhooks/[id]/edit/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { WebhookFormPage } from '@/components/admin/integrations/WebhookFormPage'

export default function EditWebhookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <WebhookFormPage paramsPromise={params} />
}
```

#### 4. Create Webhook Debug Page
**File**: `src/app/employee/admin/integrations/webhooks/[id]/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { WebhookDebugPage } from '@/components/admin/integrations/WebhookDebugPage'

export default function WebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <WebhookDebugPage paramsPromise={params} />
}
```

#### 5. Create WebhooksListPage Component
**File**: `src/components/admin/integrations/WebhooksListPage.tsx`

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Webhook,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
  disabled: 'bg-red-100 text-red-800',
}

export function WebhooksListPage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.integrations.getWebhookStats.useQuery()
  const webhooksQuery = trpc.integrations.listWebhooks.useQuery({ pageSize: 100 })

  const updateMutation = trpc.integrations.updateWebhook.useMutation({
    onSuccess: () => {
      utils.integrations.listWebhooks.invalidate()
      utils.integrations.getWebhookStats.invalidate()
      toast.success('Webhook updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update webhook')
    },
  })

  const deleteMutation = trpc.integrations.deleteWebhook.useMutation({
    onSuccess: () => {
      utils.integrations.listWebhooks.invalidate()
      utils.integrations.getWebhookStats.invalidate()
      toast.success('Webhook deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete webhook')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Webhooks' },
  ]

  const stats = statsQuery.data

  return (
    <DashboardShell
      title="Webhooks"
      description="Manage outgoing webhooks for event notifications"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/integrations/webhooks/new">
          <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Webhook
          </Button>
        </Link>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Webhooks"
          value={stats?.totalWebhooks ?? 0}
          icon={<Webhook className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.activeWebhooks ?? 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="Successful Deliveries"
          value={stats?.successfulDeliveries ?? 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="In DLQ"
          value={stats?.dlqCount ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          showWarning={stats?.dlqCount ? stats.dlqCount > 0 : false}
        />
      </div>

      <DashboardSection>
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {webhooksQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : webhooksQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Webhook className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No webhooks configured</h3>
              <p className="text-charcoal-500 mb-4">
                Create a webhook to receive event notifications
              </p>
              <Link href="/employee/admin/integrations/webhooks/new">
                <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Webhook</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Last Triggered</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {webhooksQuery.data?.items.map((webhook: any) => (
                  <tr key={webhook.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/employee/admin/integrations/webhooks/${webhook.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-600"
                        >
                          {webhook.name}
                        </Link>
                        <p className="text-sm text-charcoal-500 truncate max-w-[300px]">
                          {webhook.url}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {webhook.events.slice(0, 3).map((event: string) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[webhook.status]}`}>
                          {webhook.status}
                        </span>
                        {webhook.consecutive_failures > 0 && (
                          <span className="text-xs text-red-600">
                            {webhook.consecutive_failures} failures
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-500">
                      {webhook.last_triggered_at
                        ? formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })
                        : <span className="text-charcoal-400">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === webhook.id ? null : webhook.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === webhook.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/integrations/webhooks/${webhook.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View & Debug
                              </Link>
                              <Link
                                href={`/employee/admin/integrations/webhooks/${webhook.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  updateMutation.mutate({
                                    id: webhook.id,
                                    status: webhook.status === 'active' ? 'inactive' : 'active',
                                  })
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                {webhook.status === 'active' ? (
                                  <>
                                    <PowerOff className="w-4 h-4" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-4 h-4" />
                                    Enable
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this webhook?')) {
                                    deleteMutation.mutate({ id: webhook.id })
                                  }
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DashboardSection>
    </DashboardShell>
  )
}

function StatCard({
  label,
  value,
  icon,
  showWarning,
}: {
  label: string
  value: number
  icon: React.ReactNode
  showWarning?: boolean
}) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${showWarning ? 'border-amber-200' : 'border-charcoal-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-charcoal-500">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-charcoal-900">{value}</span>
    </div>
  )
}
```

Due to length constraints, I'll describe the remaining components that need to be created:

#### 6. Create WebhookFormPage Component
**File**: `src/components/admin/integrations/WebhookFormPage.tsx`

This component should:
- Allow creating/editing webhooks
- Have fields for: name, description, URL, events (multi-select), custom headers
- Show the webhook secret with copy/regenerate buttons
- Test webhook functionality before saving

#### 7. Create WebhookDebugPage Component
**File**: `src/components/admin/integrations/WebhookDebugPage.tsx`

This component should:
- Show webhook details and status
- Allow sending test webhooks with event type selection
- Show delivery history with status, response codes, duration
- Show request/response details for each delivery
- Allow replaying failed deliveries
- Show error messages and debugging info

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] ESLint passes: `pnpm lint`
- [ ] Pages accessible at `/employee/admin/integrations/webhooks`

#### Manual Verification:
- [ ] Can create new webhook with events
- [ ] Can test webhook and see delivery
- [ ] Can view delivery history and details
- [ ] Can replay failed deliveries
- [ ] Can enable/disable webhooks

**Implementation Note**: After completing this phase, pause for manual verification before proceeding.

---

## Phase 5: Retry Configuration and DLQ UI

### Overview
Create UI for configuring retry strategies and managing the Dead Letter Queue.

### Changes Required:

#### 1. Create Retry Config Page
**File**: `src/app/employee/admin/integrations/retry-config/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { RetryConfigPage } from '@/components/admin/integrations/RetryConfigPage'

export default function RetryConfigurationPage() {
  return <RetryConfigPage />
}
```

#### 2. Create DLQ Page
**File**: `src/app/employee/admin/integrations/dlq/page.tsx`

```typescript
export const dynamic = 'force-dynamic'
import { DlqManagerPage } from '@/components/admin/integrations/DlqManagerPage'

export default function DlqPage() {
  return <DlqManagerPage />
}
```

#### 3. Create RetryConfigPage Component
**File**: `src/components/admin/integrations/RetryConfigPage.tsx`

This component should:
- Show current retry configuration
- Allow configuring: max retries, strategy (exponential/linear/fixed), delays
- Allow enabling/disabling jitter and DLQ
- Show visual preview of retry timing
- Save configuration

#### 4. Create DlqManagerPage Component
**File**: `src/components/admin/integrations/DlqManagerPage.tsx`

This component should:
- Show count of items in DLQ
- List all DLQ items with webhook name, event type, error, timestamp
- Allow retrying individual items
- Allow clearing individual items
- Allow bulk clear all

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] Pages accessible at configured routes

#### Manual Verification:
- [ ] Can view and update retry config
- [ ] Can view DLQ items
- [ ] Can retry DLQ items
- [ ] Can clear DLQ items

---

## Phase 6: OAuth and Failover UI

### Overview
Add OAuth connection UI to integration forms and create failover configuration UI.

### Changes Required:

#### 1. Create OAuth Callback Route
**File**: `src/app/api/oauth/callback/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/employee/admin/integrations?error=${error}`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/employee/admin/integrations?error=missing_params`
    )
  }

  // Redirect to complete OAuth page with code and state
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/employee/admin/integrations/oauth-complete?code=${code}&state=${state}`
  )
}
```

#### 2. Create OAuth Complete Page
**File**: `src/app/employee/admin/integrations/oauth-complete/page.tsx`

```typescript
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function OAuthCompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const completeOAuthMutation = trpc.integrations.completeOAuth.useMutation({
    onSuccess: (data) => {
      setStatus('success')
      setMessage('OAuth connected successfully!')
      setTimeout(() => {
        router.push(`/employee/admin/integrations/${data.integrationId}`)
      }, 2000)
    },
    onError: (error) => {
      setStatus('error')
      setMessage(error.message || 'Failed to complete OAuth')
    },
  })

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && state) {
      completeOAuthMutation.mutate({ code, state })
    } else {
      setStatus('error')
      setMessage('Missing OAuth parameters')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-charcoal-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-charcoal-900">Completing OAuth...</h2>
            <p className="text-charcoal-500 mt-2">Please wait while we connect your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-charcoal-900">{message}</h2>
            <p className="text-charcoal-500 mt-2">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-charcoal-900">Connection Failed</h2>
            <p className="text-red-600 mt-2">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <OAuthCompleteContent />
    </Suspense>
  )
}
```

#### 3. Update IntegrationDetailPage for OAuth
Add OAuth connection panel to the integration detail page showing:
- Connection status (connected/not connected)
- Connected account email
- Token expiration
- Connect/Disconnect buttons
- Last refresh time

#### 4. Create Failover Config Page
**File**: `src/app/employee/admin/integrations/failover/page.tsx`

This page should:
- List integration types with failover options
- Show current primary and backup for each type
- Allow configuring failover threshold
- Allow manual failover/recovery
- Show failover history

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm build`
- [ ] OAuth callback route works
- [ ] Failover page accessible

#### Manual Verification:
- [ ] Can initiate OAuth flow
- [ ] OAuth callback completes successfully
- [ ] Can disconnect OAuth
- [ ] Can configure failover
- [ ] Can manually trigger failover

---

## Testing Strategy

### Unit Tests:
- Webhook signature generation
- Retry delay calculations for all strategies
- OAuth state encoding/decoding

### Integration Tests:
- Create webhook → Test → View delivery
- Configure retry → Fail delivery → Verify retry scheduled
- OAuth flow end-to-end
- Failover trigger and recovery

### Manual Testing Steps:
1. Create a webhook pointing to webhook.site or similar
2. Send test webhook and verify delivery
3. Configure retry strategy and verify in DLQ
4. Process DLQ item
5. Connect Google Calendar via OAuth
6. Configure failover with backup integration
7. Manually trigger failover and verify switch

---

## Performance Considerations

- Webhook deliveries table will grow large - consider partitioning by `created_at`
- DLQ queries filtered to status='dlq' for efficiency
- OAuth tokens indexed on `expires_at` for refresh scheduling
- Consider adding cleanup job for old deliveries (30-day retention)

---

## Migration Notes

- All new tables, no existing data affected
- Edge functions deploy separately from main app
- OAuth callback requires `NEXT_PUBLIC_APP_URL` environment variable

---

## References

- Original epic: `thoughts/shared/epics/epic-01-admin/07-integration-management.md`
- Part 1 plan: `thoughts/shared/plans/2025-12-05-integration-management-part1.md`
- Part 2 research: `thoughts/shared/research/2025-12-05-integration-management-part2-research.md`
- Event types catalog: `docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md`
- Edge function pattern: `src/server/routers/data.ts:22-47`
