# User Story: Integration Management - Part 2 (Advanced)

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-007b
**Priority:** High
**Estimated Context:** ~25K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/07-integration-management.md`
**Depends On:** ADMIN-US-007a (Part 1)

---

## User Story

**As an** Admin user,
**I want** to manage webhooks, configure retry policies, and handle OAuth connections,
**So that** I can ensure reliable and recoverable integration connectivity.

---

## Scope (Part 2)

This part covers:
- AC-4: Webhook Management
- AC-5: Retry Configuration
- AC-6: OAuth Flow
- AC-7: Fallback & Failover
- Edge functions for background processing

Prerequisites from Part 1:
- Database tables (already created)
- tRPC router foundation
- Integration dashboard and forms

---

## Acceptance Criteria

### AC-4: Webhook Management
- [ ] Create webhooks with URL and events
- [ ] Test webhook delivery
- [ ] View delivery history
- [ ] Debug failed deliveries
- [ ] Replay failed webhooks

### AC-5: Retry Configuration
- [ ] Configure retry strategy (exponential backoff, linear, fixed)
- [ ] Configure max retries
- [ ] Configure retry delays
- [ ] Enable/disable Dead Letter Queue
- [ ] Process DLQ items

### AC-6: OAuth Flow
- [ ] Connect via OAuth (Google, Microsoft, Zoom, etc.)
- [ ] Automatic token refresh
- [ ] Re-authenticate on token expiry
- [ ] Manage OAuth scopes

### AC-7: Fallback & Failover
- [ ] Configure backup providers
- [ ] Auto-failover on primary failure
- [ ] Manual switch to backup
- [ ] Alert on failover

---

## UI/UX Requirements

### Webhook Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Configure Webhook                                         [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ Webhook Name *                                                 │
│ [Job Created - Zapier                                    ]    │
│                                                                │
│ Webhook URL * (HTTPS required)                                │
│ [https://hooks.zapier.com/hooks/catch/123456/abcdef     ]    │
│                                                                │
│ Events to Subscribe *                                          │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ JOBS                           CANDIDATES                  ││
│ │ ☑ job.created                  ☐ candidate.created        ││
│ │ ☑ job.updated                  ☐ candidate.updated        ││
│ │ ☐ job.closed                   ☐ candidate.status_changed ││
│ │                                                            ││
│ │ SUBMISSIONS                    INTERVIEWS                  ││
│ │ ☐ submission.created           ☐ interview.scheduled      ││
│ │ ☐ submission.status_changed    ☐ interview.completed      ││
│ │ ☐ submission.placed                                        ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SECRET KEY (for signature verification)                        │
│ [whsec_abc123...                            ] [Copy] [Regen]  │
│                                                                │
│ ☑ Active                                                      │
│                                                                │
│ [Cancel]                            [Save] [Save & Test]      │
└────────────────────────────────────────────────────────────────┘
```

### Webhook Debugger
```
┌────────────────────────────────────────────────────────────────┐
│ Webhook Debugger - Job Created (Zapier)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ TEST WEBHOOK                                                   │
│ Event: [job.created                                      ▼]   │
│ [Send Test Webhook]                                            │
│                                                                │
│ DELIVERY RESULT                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ✓ 200 OK (Delivered in 245ms)                             ││
│ │                                                            ││
│ │ Request:                                                   ││
│ │ POST https://hooks.zapier.com/hooks/catch/123456/abcdef   ││
│ │ Headers:                                                   ││
│ │   Content-Type: application/json                          ││
│ │   X-InTime-Signature: sha256=abc123...                    ││
│ │   X-InTime-Event: job.created                             ││
│ │                                                            ││
│ │ Body:                                                      ││
│ │ {"event":"job.created","data":{"id":"JOB-2024-1234"...}}  ││
│ │                                                            ││
│ │ Response:                                                  ││
│ │ {"status":"received","id":"zap_123"}                      ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ DELIVERY HISTORY (Last 24h)                                    │
│ ┌──────────┬──────────────┬────────┬──────────┬─────────┐    │
│ │ Time     │ Event        │ Status │ Response │ Duration│    │
│ ├──────────┼──────────────┼────────┼──────────┼─────────┤    │
│ │ 10:30 AM │ job.created  │ ✓ 200  │ OK       │ 245ms   │    │
│ │ 09:45 AM │ job.created  │ ✗ 500  │ Error    │ 1.2s    │    │
│ │          │              │        │ (retry)  │         │    │
│ │ 09:45 AM │ job.created  │ ✓ 200  │ OK       │ 298ms   │    │
│ └──────────┴──────────────┴────────┴──────────┴─────────┘    │
│                                                                │
│ [View Full History] [Replay Failed]                           │
└────────────────────────────────────────────────────────────────┘
```

### Retry Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Retry Configuration                                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ RETRY STRATEGY                                                 │
│ ● Exponential backoff (recommended)                           │
│ ○ Linear delay                                                │
│ ○ Fixed delay                                                 │
│                                                                │
│ MAX RETRIES                                                    │
│ [3        ] attempts                                          │
│                                                                │
│ DELAY SETTINGS                                                 │
│ Initial delay: [5      ] seconds                              │
│ Max delay:     [60     ] seconds                              │
│                                                                │
│ ☑ Add random jitter (prevents thundering herd)                │
│                                                                │
│ DEAD LETTER QUEUE                                              │
│ ☑ Enable DLQ for failed deliveries                            │
│ DLQ retention: [7       ] days                                │
│                                                                │
│ [Save Changes]                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Dead Letter Queue
```
┌────────────────────────────────────────────────────────────────┐
│ Dead Letter Queue                             [Clear All DLQ]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ FAILED DELIVERIES (12 items)                                   │
│ ┌──────────────┬──────────────┬────────────┬─────────────────┐│
│ │ Webhook      │ Event        │ Failed At  │ Actions         ││
│ ├──────────────┼──────────────┼────────────┼─────────────────┤│
│ │ Zapier Hook  │ job.created  │ 2h ago     │ [Retry] [Clear] ││
│ │              │              │ (3 tries)  │ [View]          ││
│ │ Slack Alert  │ candidate... │ 1d ago     │ [Retry] [Clear] ││
│ │              │              │ (3 tries)  │ [View]          ││
│ └──────────────┴──────────────┴────────────┴─────────────────┘│
│                                                                │
│ [Retry All] [Clear Selected]                                   │
└────────────────────────────────────────────────────────────────┘
```

### OAuth Connection
```
┌────────────────────────────────────────────────────────────────┐
│ Connect to Google Calendar                                [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ CONNECTION STATUS                                              │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ✓ Connected as john@company.com                           ││
│ │ Token expires: Dec 15, 2024 (auto-refresh enabled)        ││
│ │                                                            ││
│ │ [Disconnect] [Reconnect]                                   ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ PERMISSIONS (Scopes)                                           │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ ☑ Read calendar events                                     ││
│ │ ☑ Create calendar events                                   ││
│ │ ☐ Delete calendar events (not currently authorized)       ││
│ │                                                            ││
│ │ [Request Additional Permissions]                           ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ SYNC SETTINGS                                                  │
│ Auto-sync interviews: ☑ Enabled                               │
│ Default calendar: [Primary                              ▼]   │
│                                                                │
│ [Save Settings]                                                │
└────────────────────────────────────────────────────────────────┘
```

### Failover Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Failover Configuration - Email                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ PRIMARY PROVIDER                                               │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ SendGrid (Currently Active)              Status: 🟢 Active ││
│ │ smtp.sendgrid.net:587                                      ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ BACKUP PROVIDER                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Amazon SES                               Status: 🟡 Standby││
│ │ email-smtp.us-east-1.amazonaws.com:587                     ││
│ │                                                            ││
│ │ [Configure] [Test Connection] [Make Primary]               ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ FAILOVER SETTINGS                                              │
│ ☑ Enable automatic failover                                   │
│ Trigger after: [3      ] consecutive failures                 │
│ ☑ Send alert on failover                                      │
│ ☑ Auto-restore when primary recovers                          │
│                                                                │
│ [Save Configuration]                                           │
└────────────────────────────────────────────────────────────────┘
```

---

## tRPC Endpoints (Part 2)

```typescript
// Extend src/server/routers/integrations.ts

// Webhooks
listWebhooks: orgProtectedProcedure
  .query(async ({ ctx }) => {
    // Return all webhooks
  }),

createWebhook: orgProtectedProcedure
  .input(z.object({
    name: z.string(),
    url: z.string().url(),
    events: z.array(z.string()),
    status: z.enum(['active', 'inactive']).default('active')
  }))
  .mutation(async ({ ctx, input }) => {
    // Create webhook with auto-generated secret
  }),

updateWebhook: orgProtectedProcedure
  .input(z.object({
    id: z.string().uuid(),
    name: z.string().optional(),
    url: z.string().url().optional(),
    events: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive']).optional()
  }))
  .mutation(async ({ ctx, input }) => {
    // Update webhook
  }),

deleteWebhook: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Delete webhook
  }),

regenerateWebhookSecret: orgProtectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Generate new secret
  }),

testWebhook: orgProtectedProcedure
  .input(z.object({
    id: z.string().uuid(),
    eventType: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // Send test webhook, return result
  }),

getDeliveryHistory: orgProtectedProcedure
  .input(z.object({
    webhookId: z.string().uuid(),
    limit: z.number().default(50),
    status: z.enum(['all', 'success', 'failed', 'dlq']).optional()
  }))
  .query(async ({ ctx, input }) => {
    // Return delivery history with filtering
  }),

getDeliveryDetail: orgProtectedProcedure
  .input(z.object({ deliveryId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Return full delivery details (request/response)
  }),

replayDelivery: orgProtectedProcedure
  .input(z.object({ deliveryId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Replay failed delivery
  }),

// Retry Config
getRetryConfig: orgProtectedProcedure
  .query(async ({ ctx }) => {
    // Return retry configuration for org
  }),

updateRetryConfig: orgProtectedProcedure
  .input(z.object({
    maxRetries: z.number().min(1).max(10),
    retryStrategy: z.enum(['exponential', 'linear', 'fixed']),
    fixedDelaySeconds: z.number().optional(),
    maxDelaySeconds: z.number(),
    enableJitter: z.boolean(),
    enableDlq: z.boolean()
  }))
  .mutation(async ({ ctx, input }) => {
    // Update retry configuration
  }),

// Dead Letter Queue
getDlqItems: orgProtectedProcedure
  .input(z.object({
    limit: z.number().default(50)
  }))
  .query(async ({ ctx, input }) => {
    // Return DLQ items
  }),

retryDlqItem: orgProtectedProcedure
  .input(z.object({ deliveryId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Retry single DLQ item
  }),

retryAllDlq: orgProtectedProcedure
  .mutation(async ({ ctx }) => {
    // Retry all DLQ items
  }),

clearDlqItem: orgProtectedProcedure
  .input(z.object({ deliveryId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Remove from DLQ
  }),

clearAllDlq: orgProtectedProcedure
  .mutation(async ({ ctx }) => {
    // Clear all DLQ items
  }),

// OAuth
getOAuthStatus: orgProtectedProcedure
  .input(z.object({ integrationId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Return OAuth token status (connected, expires, scopes)
  }),

initiateOAuth: orgProtectedProcedure
  .input(z.object({
    integrationId: z.string().uuid(),
    scopes: z.array(z.string())
  }))
  .mutation(async ({ ctx, input }) => {
    // Return OAuth authorization URL
  }),

disconnectOAuth: orgProtectedProcedure
  .input(z.object({ integrationId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Revoke OAuth tokens
  }),

// Failover
getFailoverConfig: orgProtectedProcedure
  .input(z.object({ integrationId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // Return failover configuration
  }),

updateFailoverConfig: orgProtectedProcedure
  .input(z.object({
    integrationId: z.string().uuid(),
    backupIntegrationId: z.string().uuid().optional(),
    enableAutoFailover: z.boolean(),
    failoverThreshold: z.number(),
    alertOnFailover: z.boolean(),
    autoRestore: z.boolean()
  }))
  .mutation(async ({ ctx, input }) => {
    // Update failover settings
  }),

triggerFailover: orgProtectedProcedure
  .input(z.object({ integrationId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Manually switch to backup
  }),

restorePrimary: orgProtectedProcedure
  .input(z.object({ integrationId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    // Switch back to primary
  })
```

---

## Files to Create

### Routes
- `src/app/employee/admin/integrations/webhooks/page.tsx` - Webhooks list
- `src/app/employee/admin/integrations/webhooks/new/page.tsx` - New webhook
- `src/app/employee/admin/integrations/webhooks/[id]/page.tsx` - Webhook detail/debugger
- `src/app/employee/admin/integrations/retry-config/page.tsx` - Retry settings
- `src/app/employee/admin/integrations/dlq/page.tsx` - Dead letter queue
- `src/app/api/integrations/oauth/callback/route.ts` - OAuth callback

### Components
- `src/components/admin/integrations/WebhooksList.tsx`
- `src/components/admin/integrations/WebhookForm.tsx`
- `src/components/admin/integrations/WebhookDebugger.tsx`
- `src/components/admin/integrations/DeliveryHistoryTable.tsx`
- `src/components/admin/integrations/DeliveryDetailModal.tsx`
- `src/components/admin/integrations/RetryConfigForm.tsx`
- `src/components/admin/integrations/DlqManager.tsx`
- `src/components/admin/integrations/OAuthConnectionPanel.tsx`
- `src/components/admin/integrations/FailoverConfigPanel.tsx`
- `src/components/admin/integrations/EventSelector.tsx`

### Edge Functions
- `supabase/functions/deliver-webhook/index.ts` - Webhook delivery with retry
- `supabase/functions/refresh-oauth-token/index.ts` - Token refresh
- `supabase/functions/integration-health-check/index.ts` - Scheduled health checks

### Library
- `src/lib/integrations/webhook-signer.ts` - HMAC signature generation
- `src/lib/integrations/retry-calculator.ts` - Retry delay calculation
- `src/lib/integrations/oauth-providers.ts` - OAuth provider configs

---

## Test Cases (Part 2)

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-INT-011 | Create webhook | Webhook created with secret |
| ADMIN-INT-012 | Test webhook | Test payload delivered successfully |
| ADMIN-INT-013 | View webhook history | Shows delivery history with status |
| ADMIN-INT-014 | Replay failed webhook | Webhook re-sent with same payload |
| ADMIN-INT-015 | Configure retry policy | Retry settings updated |
| ADMIN-INT-016 | View DLQ | Shows failed deliveries |
| ADMIN-INT-017 | Retry DLQ item | Item retried, removed from DLQ on success |
| ADMIN-INT-018 | Clear DLQ item | Item removed without retry |
| ADMIN-INT-019 | OAuth connect | OAuth flow completes, tokens stored |
| ADMIN-INT-020 | OAuth token refresh | Token refreshed automatically |
| ADMIN-INT-021 | OAuth disconnect | Tokens revoked and deleted |
| ADMIN-INT-022 | Configure failover | Backup provider linked |
| ADMIN-INT-023 | Auto-failover | Switches to backup on primary failure |
| ADMIN-INT-024 | Manual failover | Admin switches to backup |
| ADMIN-INT-025 | Restore primary | Switches back to primary |

---

## Edge Function: Webhook Delivery

```typescript
// supabase/functions/deliver-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  webhookId: string
  eventType: string
  data: Record<string, unknown>
  attemptNumber?: number
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const payload: WebhookPayload = await req.json()
  const { webhookId, eventType, data, attemptNumber = 1 } = payload

  // Get webhook config
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .single()

  if (!webhook || webhook.status !== 'active') {
    return new Response(JSON.stringify({ error: 'Webhook not active' }), { status: 400 })
  }

  // Create delivery record
  const deliveryPayload = {
    event: eventType,
    data,
    timestamp: new Date().toISOString()
  }

  const { data: delivery } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      event_type: eventType,
      payload: deliveryPayload,
      attempt_number: attemptNumber,
      status: 'pending'
    })
    .select()
    .single()

  // Generate signature
  const signature = await generateHmacSignature(
    JSON.stringify(deliveryPayload),
    webhook.secret
  )

  // Deliver webhook
  const startTime = Date.now()
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-InTime-Signature': signature,
        'X-InTime-Event': eventType,
        'X-InTime-Delivery': delivery.id
      },
      body: JSON.stringify(deliveryPayload)
    })

    const duration = Date.now() - startTime
    const responseBody = await response.text()

    // Update delivery record
    await supabase
      .from('webhook_deliveries')
      .update({
        response_status: response.status,
        response_body: responseBody.slice(0, 1000),
        duration_ms: duration,
        status: response.ok ? 'success' : 'failed',
        delivered_at: new Date().toISOString()
      })
      .eq('id', delivery.id)

    if (!response.ok) {
      // Schedule retry
      await scheduleRetry(supabase, webhookId, delivery.id, attemptNumber)
    }

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      duration
    }))

  } catch (error) {
    const duration = Date.now() - startTime

    await supabase
      .from('webhook_deliveries')
      .update({
        response_status: 0,
        response_body: error.message,
        duration_ms: duration,
        status: 'failed',
        delivered_at: new Date().toISOString()
      })
      .eq('id', delivery.id)

    await scheduleRetry(supabase, webhookId, delivery.id, attemptNumber)

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 })
  }
})
```

---

## Dependencies

- Part 1 implementation complete
- Database tables from Part 1 migration
- External OAuth providers (Google, Microsoft, Zoom)
- Supabase cron for scheduled health checks

---

## Open Questions Resolved

1. **OAuth Token Encryption**: Store encrypted using Supabase Vault or server-side encryption key
2. **Health Check Scheduling**: Use Supabase cron extension for periodic checks
3. **Webhook Signature**: HMAC-SHA256 with auto-generated secret per webhook
4. **DLQ Storage**: Use `status='dlq'` on webhook_deliveries table
5. **Rate Limiting**: Track in integration config, enforce in edge functions
