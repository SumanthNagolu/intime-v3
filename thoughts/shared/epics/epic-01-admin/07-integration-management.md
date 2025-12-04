# User Story: Integration Management

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-007
**Priority:** High
**Estimated Context:** ~45K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/07-integration-management.md`

---

## User Story

**As an** Admin user,
**I want** to configure, monitor, and troubleshoot external integrations,
**So that** I can ensure reliable connectivity with third-party services.

---

## Acceptance Criteria

### AC-1: Integration Dashboard
- [ ] Display all integrations with health status
- [ ] Show active/error/disabled counts
- [ ] Display critical alerts for failing integrations
- [ ] Show last sync time for each integration
- [ ] Quick actions to test/reconnect

### AC-2: Configure Integration
- [ ] Configure SMTP email settings
- [ ] Configure OAuth integrations (Google, Microsoft, etc.)
- [ ] Configure job board integrations
- [ ] Configure HRIS/Payroll integrations
- [ ] Configure SMS/communication integrations
- [ ] Test connection before saving

### AC-3: Monitor Health
- [ ] View health metrics (uptime, response time, error rate)
- [ ] View recent errors with details
- [ ] View integration logs
- [ ] Configure health check frequency

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

### Integration Dashboard
```
┌────────────────────────────────────────────────────────────────┐
│ Integrations Dashboard                       [+ Add Integration│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ HEALTH OVERVIEW                                                │
│ ┌────────────┬────────────┬────────────┬────────────┐         │
│ │ Total      │ Active     │ Errors     │ Disabled   │         │
│ │ 18         │ 16 (89%)   │ 1 (6%)     │ 1 (6%)     │         │
│ └────────────┴────────────┴────────────┴────────────┘         │
│                                                                │
│ CRITICAL ALERTS                                                │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ 🔴 SMTP Email: Connection timeout (15 min ago)            ││
│ │    Impact: Emails not sending                             ││
│ │    [View Logs] [Reconnect] [Troubleshoot]                 ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ ALL INTEGRATIONS                            [Search...]        │
│ ┌──────────────┬─────────────┬──────────┬────────────────────┐│
│ │ Integration  │ Provider    │ Status   │ Last Sync          ││
│ ├──────────────┼─────────────┼──────────┼────────────────────┤│
│ │ 📧 Email     │ SendGrid    │🔴 Error  │ 2 min ago (failed) ││
│ │ 💼 HRIS      │ BambooHR    │🟢 Active │ 5 min ago          ││
│ │ 💰 Payroll   │ ADP         │🟢 Active │ 10 min ago         ││
│ │ 📋 BG Check  │ Checkr      │🟢 Active │ 1 hour ago         ││
│ │ 📱 SMS       │ Twilio      │🟢 Active │ 30 sec ago         ││
│ │ 📅 Calendar  │ Google      │🟢 Active │ 1 min ago          ││
│ └──────────────┴─────────────┴──────────┴────────────────────┘│
│                                                                │
│ [Health Check All] [View Logs]                                │
└────────────────────────────────────────────────────────────────┘
```

### SMTP Configuration
```
┌────────────────────────────────────────────────────────────────┐
│ Email Integration (SMTP)                                  [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ CONNECTION SETTINGS                                            │
│ ┌────────────────────────────────────────────────────────────┐│
│ │ Provider: [SendGrid                                    ▼]  ││
│ │                                                            ││
│ │ SMTP Host:                                                 ││
│ │ [smtp.sendgrid.net                                     ]   ││
│ │                                                            ││
│ │ SMTP Port:                                                 ││
│ │ ● 587 (TLS)  ○ 465 (SSL)  ○ 25 (Unencrypted)             ││
│ │                                                            ││
│ │ Username (API Key):                                        ││
│ │ [apikey                                                ]   ││
│ │                                                            ││
│ │ Password (API Secret):                                     ││
│ │ [************************************] [Show] [Regenerate] ││
│ │                                                            ││
│ │ From Email:                                                ││
│ │ [noreply@company.com                                   ]   ││
│ │                                                            ││
│ │ From Name:                                                 ││
│ │ [InTime Staffing                                       ]   ││
│ └────────────────────────────────────────────────────────────┘│
│                                                                │
│ RATE LIMITS                                                    │
│ Max emails/hour: [1000]    Max emails/day: [25000]            │
│ Current usage: 247 today (1% of daily limit)                  │
│                                                                │
│ [Send Test Email]                        [Save] [Test & Save] │
└────────────────────────────────────────────────────────────────┘
```

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

---

## Database Schema

```sql
-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type VARCHAR(50) NOT NULL, -- email, calendar, hris, sms, etc.
  provider VARCHAR(50) NOT NULL, -- sendgrid, google, bamboohr, etc.
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL, -- Encrypted configuration
  status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, error
  last_health_check TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth tokens
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_type VARCHAR(20) DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(64),
  events TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  request_headers JSONB,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  next_retry_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' -- pending, success, failed, dlq
);

-- Retry configuration
CREATE TABLE integration_retry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  max_retries INTEGER DEFAULT 3,
  retry_strategy VARCHAR(20) DEFAULT 'exponential', -- exponential, linear, fixed
  fixed_delay_seconds INTEGER DEFAULT 5,
  max_delay_seconds INTEGER DEFAULT 60,
  enable_jitter BOOLEAN DEFAULT true,
  enable_dlq BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
```

---

## tRPC Endpoints

```typescript
// src/server/routers/admin/integrations.ts
export const integrationsRouter = router({
  list: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return all integrations with status
    }),

  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return integration details
    }),

  configure: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid().optional(), // null for new
      type: z.string(),
      provider: z.string(),
      name: z.string(),
      config: z.record(z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      // Save integration config (encrypted)
    }),

  testConnection: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      type: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Test integration connection
    }),

  toggleStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'inactive'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Enable/disable integration
    }),

  // Webhooks
  listWebhooks: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return all webhooks
    }),

  createWebhook: orgProtectedProcedure
    .input(z.object({
      name: z.string(),
      url: z.string().url(),
      events: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // Create webhook with secret
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

  testWebhook: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      eventType: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Send test webhook
    }),

  getDeliveryHistory: orgProtectedProcedure
    .input(z.object({
      webhookId: z.string().uuid(),
      limit: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      // Return delivery history
    }),

  replayDelivery: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Replay failed delivery
    }),

  // Retry Config
  getRetryConfig: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return retry configuration
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
    .query(async ({ ctx }) => {
      // Return DLQ items
    }),

  retryDlqItem: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Retry DLQ item
    }),

  clearDlqItem: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Remove from DLQ
    })
});
```

---

## Test Cases

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-INT-001 | View integration dashboard | Shows all integrations with status |
| ADMIN-INT-002 | Add SMTP integration | Integration created, connection tested |
| ADMIN-INT-003 | Test SMTP connection | Test email sent successfully |
| ADMIN-INT-004 | Configure OAuth integration | OAuth flow completes, tokens stored |
| ADMIN-INT-005 | Create webhook | Webhook created with secret |
| ADMIN-INT-006 | Test webhook | Test payload delivered successfully |
| ADMIN-INT-007 | View webhook history | Shows delivery history with status |
| ADMIN-INT-008 | Replay failed webhook | Webhook re-sent with same payload |
| ADMIN-INT-009 | Configure retry policy | Retry settings updated |
| ADMIN-INT-010 | Handle rate limit | Backs off and retries |
| ADMIN-INT-011 | Process DLQ item | Item retried or cleared |
| ADMIN-INT-012 | OAuth token refresh | Token refreshed automatically |
| ADMIN-INT-013 | Integration failover | Switches to backup provider |
| ADMIN-INT-014 | Disable integration | Integration stopped, status = inactive |
| ADMIN-INT-015 | View integration logs | Logs displayed with filtering |

---

## Dependencies

- External service APIs (SendGrid, Twilio, etc.)
- OAuth providers (Google, Microsoft)
- Background job processor for retries
- Audit Logging (UC-ADMIN-008)

---

## Out of Scope

- Custom integration development
- API marketplace
- Integration templates
