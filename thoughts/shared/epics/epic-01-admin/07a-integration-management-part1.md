# User Story: Integration Management - Part 1 (Core)

**Epic:** Admin Portal (Epic-01)
**Story ID:** ADMIN-US-007a
**Priority:** High
**Estimated Context:** ~25K tokens
**Source Spec:** `docs/specs/20-USER-ROLES/10-admin/07-integration-management.md`

---

## User Story

**As an** Admin user,
**I want** to view and configure external integrations,
**So that** I can manage connectivity with third-party services.

---

## Scope (Part 1)

This part covers:
- Database schema (all tables for Part 1 + Part 2)
- tRPC router foundation
- Integration Dashboard (AC-1)
- Configure Integration (AC-2)
- Monitor Health (AC-3)

Part 2 will cover: Webhooks, Retry Config, OAuth Flow, Fallback/Failover

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

---

## Database Schema (Complete - for Part 1 and Part 2)

```sql
-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- email, calendar, hris, sms, etc.
  provider VARCHAR(50) NOT NULL, -- sendgrid, google, bamboohr, etc.
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL, -- Encrypted configuration
  status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, error
  last_health_check TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  health_check_interval_minutes INTEGER DEFAULT 5,
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth tokens (for Part 2, but create now)
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

-- Webhooks (for Part 2, but create now)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(64),
  events TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries (for Part 2, but create now)
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

-- Retry configuration (for Part 2, but create now)
CREATE TABLE integration_retry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  max_retries INTEGER DEFAULT 3,
  retry_strategy VARCHAR(20) DEFAULT 'exponential', -- exponential, linear, fixed
  fixed_delay_seconds INTEGER DEFAULT 5,
  max_delay_seconds INTEGER DEFAULT 60,
  enable_jitter BOOLEAN DEFAULT true,
  enable_dlq BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id)
);

-- Integration health logs
CREATE TABLE integration_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  check_type VARCHAR(20) NOT NULL, -- manual, scheduled, auto
  status VARCHAR(20) NOT NULL, -- success, failure
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_integrations_org ON integrations(org_id);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_oauth_tokens_integration ON oauth_tokens(integration_id);
CREATE INDEX idx_webhooks_org ON webhooks(org_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_integration_health_logs_integration ON integration_health_logs(integration_id);
CREATE INDEX idx_integration_health_logs_checked ON integration_health_logs(checked_at);
```

---

## tRPC Endpoints (Part 1)

```typescript
// src/server/routers/integrations.ts
export const integrationsRouter = router({
  // Dashboard
  list: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return all integrations with status
    }),

  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return counts: total, active, error, disabled
    }),

  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      // Return integrations with status='error' and recent failures
    }),

  // Integration CRUD
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Return integration details (decrypt config)
    }),

  create: orgProtectedProcedure
    .input(z.object({
      type: z.string(),
      provider: z.string(),
      name: z.string(),
      config: z.record(z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      // Create integration (encrypt config)
    }),

  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      config: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Update integration config
    }),

  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Soft delete integration
    }),

  // Connection Testing
  testConnection: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // Test integration connection, return success/error
    }),

  toggleStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'inactive'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Enable/disable integration
    }),

  // Health Monitoring
  getHealthLogs: orgProtectedProcedure
    .input(z.object({
      integrationId: z.string().uuid(),
      limit: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      // Return health check history
    }),

  updateHealthCheckInterval: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      intervalMinutes: z.number().min(1).max(60)
    }))
    .mutation(async ({ ctx, input }) => {
      // Update health check frequency
    }),

  runHealthCheck: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Manually trigger health check
    }),

  healthCheckAll: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      // Run health check on all active integrations
    })
});
```

---

## Files to Create

### Routes
- `src/app/employee/admin/integrations/page.tsx` - Dashboard
- `src/app/employee/admin/integrations/new/page.tsx` - New integration
- `src/app/employee/admin/integrations/[id]/page.tsx` - Detail
- `src/app/employee/admin/integrations/[id]/edit/page.tsx` - Edit

### Components
- `src/components/admin/integrations/IntegrationsDashboard.tsx`
- `src/components/admin/integrations/IntegrationCard.tsx`
- `src/components/admin/integrations/IntegrationForm.tsx`
- `src/components/admin/integrations/IntegrationDetail.tsx`
- `src/components/admin/integrations/HealthStatusBadge.tsx`
- `src/components/admin/integrations/CriticalAlertsPanel.tsx`
- `src/components/admin/integrations/HealthLogsTable.tsx`

### Forms (per integration type)
- `src/components/admin/integrations/forms/SmtpIntegrationForm.tsx`
- `src/components/admin/integrations/forms/SmsIntegrationForm.tsx`
- `src/components/admin/integrations/forms/HrisIntegrationForm.tsx`
- `src/components/admin/integrations/forms/CalendarIntegrationForm.tsx`
- `src/components/admin/integrations/forms/JobBoardIntegrationForm.tsx`

### API
- `src/server/routers/integrations.ts` - tRPC router

### Database
- `supabase/migrations/YYYYMMDD000000_integration_management_tables.sql`

---

## Test Cases (Part 1)

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| ADMIN-INT-001 | View integration dashboard | Shows all integrations with status |
| ADMIN-INT-002 | Add SMTP integration | Integration created, connection tested |
| ADMIN-INT-003 | Test SMTP connection | Test email sent successfully |
| ADMIN-INT-004 | View integration details | Shows config (masked secrets), health |
| ADMIN-INT-005 | Update integration config | Config saved, connection re-tested |
| ADMIN-INT-006 | Disable integration | Status = inactive, no health checks |
| ADMIN-INT-007 | View health logs | Shows recent check history |
| ADMIN-INT-008 | Manual health check | Check runs, log created |
| ADMIN-INT-009 | Health check all | All active integrations checked |
| ADMIN-INT-010 | Delete integration | Soft deleted, removed from list |

---

## Dependencies

- Database migration (new tables)
- UI components from `src/components/ui/`
- Settings form patterns from `src/components/admin/settings/`

---

## Out of Scope (Moved to Part 2)

- Webhook management
- Retry configuration
- OAuth flow
- Fallback & failover
- Edge functions for background processing
