---
date: 2025-12-05T09:08:26-0500
researcher: Claude
git_commit: 00e36f54acebf51c49cd97d0b2e862ab8a643d20
branch: main
repository: intime-v3
topic: "Integration Management Part 2 - Advanced Features Research"
tags: [research, codebase, webhooks, oauth, retry, failover]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: Integration Management Part 2 - Advanced Features

**Date**: 2025-12-05
**Scope**: Webhooks, Retry Config, OAuth Flow, Failover, Edge Functions
**Depends On**: Part 1 research and implementation

## Summary

Part 2 covers advanced integration features: webhook management with delivery/debugging, retry configuration with DLQ, OAuth token management, and failover configuration. This builds on the foundation established in Part 1.

## Key Findings

### 1. Event Bus and Webhooks

#### Database Event System

**File**: `supabase/migrations/20251119190000_update_event_bus_multitenancy.sql:10-87`

PostgreSQL function for publishing events:
```sql
CREATE OR REPLACE FUNCTION publish_event(
  p_event_type TEXT,
  p_aggregate_id UUID,
  p_payload JSONB,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_org_id UUID DEFAULT NULL
) RETURNS UUID
```

Uses `pg_notify()` on two channels:
- Category-specific (e.g., 'user', 'job')
- Global 'events' channel

#### Event Types Catalog

**File**: `docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md`

268 event types defined including:
- `job.created`, `job.updated`, `job.closed`
- `candidate.created`, `candidate.submitted`
- `submission.created`, `submission.status_changed`
- `interview.scheduled`, `interview.completed`
- `user.created`, `user.deactivated`

#### Webhook Delivery - NOT IMPLEMENTED

**Status**: Specifications exist but no code implementation

**Spec**: `docs/specs/10-DATABASE/10-SYSTEM/event_subscriptions.md`

Planned features:
- Pattern matching (e.g., `recruiting.*`, `job.created`)
- Auto-disable after 10 consecutive failures
- HMAC-SHA256 signature verification

---

### 2. Background Job Processing

#### Pattern: Supabase Edge Functions

**File**: `src/server/routers/data.ts:22-47`

Fire-and-forget helper:
```typescript
async function triggerEdgeFunction(
  functionName: string,
  payload: Record<string, unknown>
): Promise<void> {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  })
  // Fire and forget - don't await
}
```

#### Existing Edge Functions

| Function | Directory | Purpose |
|----------|-----------|---------|
| `process-import` | `supabase/functions/process-import/` | CSV/JSON import |
| `process-export` | `supabase/functions/process-export/` | Data export |
| `process-gdpr-request` | `supabase/functions/process-gdpr-request/` | GDPR operations |
| `detect-duplicates` | `supabase/functions/detect-duplicates/` | Duplicate detection |

#### Job Status Tracking

Jobs tracked in database tables with status columns:
- `pending`, `processing`, `completed`, `failed`, `cancelled`
- Progress fields: `total_rows`, `processed_rows`
- Error tracking: `error_message`, `error_log` (JSONB)

#### No Automatic Retry System

The codebase has NO automatic retry mechanism. Failed jobs require manual intervention. **Part 2 will implement this**.

---

### 3. OAuth and Authentication

#### Current OAuth Support

**File**: `src/lib/auth/client.ts:67-94`

Only Google OAuth implemented via Supabase Auth:
```typescript
export async function signInWithGoogle(portal: PortalType) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?portal=${portal}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
}
```

#### Token Management

- Supabase SDK handles token storage and refresh automatically
- No custom OAuth token management code exists
- Service role client used for admin operations (disables auto-refresh)

#### API Tokens Table (Pattern Reference)

**File**: `supabase/migrations/20251206000000_permission_management_tables.sql:131-152`
```sql
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  token_prefix VARCHAR(10) NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  -- ...
)
```

This pattern informs the OAuth tokens table design.

---

### 4. Edge Function Patterns

#### Function Structure

**File**: `supabase/functions/process-import/index.ts`

Standard Deno edge function pattern:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get request payload
  const payload = await req.json()

  // Process...

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### Shared Utilities

**File**: `supabase/functions/_shared/cors.ts`
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## Code References

### Event System
- `supabase/migrations/20251119190000_update_event_bus_multitenancy.sql:10-87` - Event publishing
- `docs/specs/20-USER-ROLES/03-EVENT-TYPE-CATALOG.md` - All event types

### Background Jobs
- `src/server/routers/data.ts:22-47` - Edge function trigger helper
- `supabase/functions/process-import/index.ts` - Import job pattern
- `supabase/functions/process-export/index.ts` - Export job pattern

### OAuth & Auth
- `src/lib/auth/client.ts:67-94` - Google OAuth
- `src/server/routers/users.ts:11-19` - Admin client pattern

### Edge Functions
- `supabase/functions/_shared/` - Shared utilities

---

## Implementation Architecture (Part 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin UI Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  /employee/admin/integrations/                                  │
│  ├── webhooks/page.tsx (Webhook List)                           │
│  ├── webhooks/new/page.tsx (New Webhook)                        │
│  ├── webhooks/[id]/page.tsx (Debugger)                          │
│  ├── retry-config/page.tsx (Retry Settings)                     │
│  └── dlq/page.tsx (Dead Letter Queue)                           │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                    │
│  ├── WebhooksList.tsx, WebhookForm.tsx                          │
│  ├── WebhookDebugger.tsx, DeliveryHistoryTable.tsx              │
│  ├── RetryConfigForm.tsx, DlqManager.tsx                        │
│  ├── OAuthConnectionPanel.tsx                                    │
│  └── FailoverConfigPanel.tsx                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        tRPC API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  src/server/routers/integrations.ts (extended)                  │
│  ├── listWebhooks, createWebhook, testWebhook                   │
│  ├── getDeliveryHistory, replayDelivery                         │
│  ├── getRetryConfig, updateRetryConfig                          │
│  ├── getDlqItems, retryDlqItem, clearDlqItem                    │
│  ├── getOAuthStatus, initiateOAuth, disconnectOAuth             │
│  └── getFailoverConfig, triggerFailover                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Background Processing                         │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions:                                       │
│  ├── deliver-webhook (webhook delivery with retry)              │
│  ├── refresh-oauth-token (token refresh)                        │
│  └── integration-health-check (scheduled checks)                │
│                                                                 │
│  Triggered by:                                                  │
│  ├── Event bus (publish_event → webhook delivery)               │
│  ├── Scheduled cron (health checks)                             │
│  └── Token expiry (OAuth refresh)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### Webhook Signature

Use HMAC-SHA256:
```typescript
import { createHmac } from 'crypto'

function generateSignature(payload: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`
}
```

Headers to include:
- `X-InTime-Signature`: HMAC signature
- `X-InTime-Event`: Event type
- `X-InTime-Delivery`: Delivery ID
- `X-InTime-Timestamp`: ISO timestamp

### Retry Strategy

Exponential backoff with jitter:
```typescript
function calculateDelay(
  attempt: number,
  strategy: 'exponential' | 'linear' | 'fixed',
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
      delay = baseDelay
      break
  }

  if (enableJitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }

  return Math.round(delay)
}
```

### Dead Letter Queue

Items move to DLQ when:
- Max retries exceeded
- Non-retryable error (4xx responses)
- Webhook disabled during retry

DLQ stored as `status = 'dlq'` on `webhook_deliveries` table.

### OAuth Token Storage

Store encrypted tokens using approach similar to api_tokens:
- Access token (encrypted)
- Refresh token (encrypted)
- Expiration timestamp
- Scopes array
- Auto-refresh before expiry

---

## Patterns to Follow

1. **Edge Function Pattern**: Deno serve, service role client
2. **Webhook Pattern**: HMAC signature, structured headers
3. **Retry Pattern**: Configurable strategy with DLQ fallback
4. **OAuth Pattern**: Token refresh via edge function
5. **Status Tracking**: `pending`, `success`, `failed`, `dlq`

---

## Open Questions Resolved

1. **OAuth Token Encryption**: Use server-side encryption with env key
2. **Health Check Scheduling**: Supabase pg_cron extension
3. **Webhook Signature**: HMAC-SHA256 with per-webhook secret
4. **DLQ Storage**: `status='dlq'` on webhook_deliveries
5. **Rate Limiting**: Track in integration config, enforce in functions
