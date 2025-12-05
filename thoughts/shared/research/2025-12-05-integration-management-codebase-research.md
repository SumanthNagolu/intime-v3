---
date: 2025-12-05T09:08:26-0500
researcher: Claude
git_commit: 00e36f54acebf51c49cd97d0b2e862ab8a643d20
branch: main
repository: intime-v3
topic: "Integration Management System - Codebase Research"
tags: [research, codebase, integrations, webhooks, oauth, admin]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: Integration Management System

**Date**: 2025-12-05T09:08:26-0500
**Researcher**: Claude
**Git Commit**: 00e36f54acebf51c49cd97d0b2e862ab8a643d20
**Branch**: main
**Repository**: intime-v3

## Research Question

Research the codebase to understand how the system works and what files/line numbers are relevant to implementing the Integration Management feature (ADMIN-US-007) as specified in `thoughts/shared/epics/epic-01-admin/07-integration-management.md`.

## Summary

The Integration Management feature requires building a new subsystem for managing external integrations, webhooks, OAuth connections, and retry configurations. The codebase has established patterns for admin pages, tRPC routers, and settings management that can be followed. Key findings:

1. **Admin routes exist but Integrations page is NOT implemented** - Navigation config defines the route but no page exists
2. **No integration/webhook/oauth tables exist** - Database schema needs to be created from scratch
3. **Event bus exists at database level** - PostgreSQL LISTEN/NOTIFY with `publish_event()` function, but no TypeScript handlers
4. **Email infrastructure uses Resend** - Pattern exists for SMTP-like configuration via system settings
5. **Background jobs use Supabase Edge Functions** - Fire-and-forget pattern with database status tracking
6. **OAuth only supports Google** - Via Supabase Auth, no custom OAuth token management
7. **Settings pages provide excellent patterns** - Custom hooks, form state, unsaved changes warnings

## Detailed Findings

### 1. Admin Portal Structure

#### Existing Admin Routes

| Route | Status | File Path |
|-------|--------|-----------|
| `/employee/admin/integrations` | **NOT IMPLEMENTED** | Defined in nav config only |
| `/employee/admin/settings/*` | Implemented | Pattern to follow |
| `/employee/admin/users/*` | Implemented | CRUD pattern |
| `/employee/admin/pods/*` | Implemented | CRUD pattern |

#### Navigation Configuration

**File**: `src/lib/navigation/adminNavConfig.ts:62-64`
```typescript
{
  label: 'Integrations',
  href: '/employee/admin/integrations',
  icon: Puzzle,
}
```

The route is defined but the page does not exist.

#### Settings Layout Pattern (Recommended for Integrations)

**File**: `src/app/employee/admin/settings/layout.tsx:32-103`

The settings subsystem uses a custom layout with sidebar navigation containing multiple sections. This pattern is ideal for Integration Management:
- Section grouping with uppercase headers (lines 123-127)
- Active state highlighting with `bg-hublot-900 text-white` (line 140)
- Icon + label + description layout (lines 144-152)

#### Admin Page Pattern

All admin route pages follow a minimal wrapper pattern:
```typescript
export const dynamic = 'force-dynamic'
import { ComponentName } from '@/components/admin/path/ComponentName'
export default function PageName() {
  return <ComponentName />
}
```

Components live in `src/components/admin/[module]/`.

---

### 2. tRPC Router Structure

#### Existing Routers

| Router | File | Purpose |
|--------|------|---------|
| `admin` | `src/server/routers/admin.ts` | Dashboard, health, alerts (90 lines) |
| `users` | `src/server/routers/users.ts` | User CRUD, auth operations (813 lines) |
| `pods` | `src/server/routers/pods.ts` | Pod management (766 lines) |
| `permissions` | `src/server/routers/permissions.ts` | Roles, feature flags, API tokens (890 lines) |
| `settings` | `src/server/routers/settings.ts` | Org/system settings (701 lines) |
| `data` | `src/server/routers/data.ts` | Import/export, GDPR (1251 lines) |

#### Root Router

**File**: `src/server/trpc/root.ts:1-19`
```typescript
export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
  settings: settingsRouter,
  data: dataRouter,
})
```

A new `integrationsRouter` would be added here.

#### Procedure Patterns

**File**: `src/server/trpc/middleware.ts:34-35`
```typescript
export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = protectedProcedure.use(hasOrg)
```

All integration procedures should use `orgProtectedProcedure`.

#### Admin Client Pattern (Bypass RLS)

**File**: `src/server/routers/users.ts:11-19`
```typescript
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

Used for operations requiring service role access.

#### Input Validation Pattern

**File**: `src/server/routers/settings.ts:7-9`
```typescript
const systemSettingCategorySchema = z.enum(['general', 'security', 'email', 'files', 'api'])
```

Zod schemas defined at top of file, used in `.input()`.

---

### 3. Database Schema

#### Migration Pattern

**File**: `supabase/migrations/20251208000000_data_management_tables.sql:10-43`

Standard table structure:
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Business fields
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft delete
);
```

#### Existing Related Tables

| Table | File | Relevance |
|-------|------|-----------|
| `api_tokens` | `20251206000000_permission_management_tables.sql:131-152` | Token pattern |
| `system_settings` | `20251207000000_settings_tables.sql:11-24` | Config storage |
| `organization_settings` | `20251207000000_settings_tables.sql:35-54` | Org-scoped config |
| `notifications` | `20251124040000_create_shared_infrastructure.sql:11-53` | Alert pattern |

#### Tables NOT Yet Created (Need Migration)

From the requirement spec, these tables need to be created:
- `integrations` - Integration connections and config
- `oauth_tokens` - OAuth token storage (encrypted)
- `webhooks` - Outgoing webhook subscriptions
- `webhook_deliveries` - Delivery history/logs
- `integration_retry_config` - Retry strategy per org

#### RLS Pattern

**File**: `20251208000000_data_management_tables.sql:352-407`
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON table_name
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );
```

---

### 4. Event Bus and Webhooks

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

### 5. Email Infrastructure

#### Email Service

**File**: `src/lib/email/index.ts:1-278`

Uses **Resend** as email provider:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

Existing email functions:
- `sendInvitationEmail()` (lines 18-78)
- `sendPasswordResetEmail()` (lines 83-137)
- `sendWelcomeEmail()` (lines 142-197)
- `sendStatusChangeEmail()` (lines 202-277)

#### Email Settings UI

**File**: `src/components/admin/settings/EmailSettingsPage.tsx:15-21`

Settings managed:
- `email_from_address`
- `email_from_name`
- `email_reply_to`
- `email_footer_text`
- `bounce_handling_enabled`

Uses `useSystemSettingsForm` hook for state management.

#### Email Templates - NOT IMPLEMENTED

**Spec**: `docs/specs/10-DATABASE/10-SYSTEM/email_templates.md`

Database table and template engine not yet built.

---

### 6. Background Job Processing

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

The codebase has NO automatic retry mechanism. Failed jobs require manual intervention.

---

### 7. OAuth and Authentication

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

#### API Tokens Table (Existing)

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

This pattern can inform the OAuth tokens table design.

---

### 8. UI Components and Forms

#### Form State Pattern

**NO react-hook-form used** - Plain React useState:

**File**: `src/components/admin/users/UserFormPage.tsx:77-88`
```typescript
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const [email, setEmail] = useState('')
```

#### Settings Form Hook

**File**: `src/components/admin/settings/useSettingsForm.ts:47-125`

`useSystemSettingsForm<T>` hook provides:
- `formState` - Current form values
- `updateField` - Field update function
- `save` - Save handler
- `isLoading`, `isSaving`, `isDirty` - States

#### Key UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Input` | `src/components/ui/input.tsx` | Text input with variants |
| `Select` | `src/components/ui/select.tsx` | Dropdown (Radix-based) |
| `Switch` | `src/components/ui/switch.tsx` | Toggle switch |
| `Checkbox` | `src/components/ui/checkbox.tsx` | Checkbox (Radix-based) |
| `Badge` | `src/components/ui/badge.tsx` | Status badges |
| `Button` | `src/components/ui/button.tsx` | Button variants |
| `Card` | `src/components/ui/card.tsx` | Card container |
| `Tabs` | `src/components/ui/tabs.tsx` | Tab navigation |
| `Dialog` | `src/components/ui/dialog.tsx` | Modal dialogs |

#### Settings Section Component

**File**: `src/components/admin/settings/SettingsSection.tsx:15-48`

Reusable wrapper with:
- Icon in colored background
- Title and description
- Optional action button
- Content area

#### Status Indicators

**File**: `src/components/admin/users/UsersListPage.tsx:21-33`
```typescript
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  disabled: 'bg-charcoal-100 text-charcoal-600',
}
```

---

## Code References

### Admin Routes & Navigation
- `src/app/employee/admin/layout.tsx` - Admin layout
- `src/lib/navigation/adminNavConfig.ts:62-64` - Integrations nav item
- `src/app/employee/admin/settings/layout.tsx:32-103` - Settings layout pattern

### tRPC Infrastructure
- `src/server/trpc/root.ts:1-19` - Router composition
- `src/server/trpc/middleware.ts:34-35` - Protected procedures
- `src/server/trpc/context.ts:11-41` - Context creation
- `src/server/routers/settings.ts` - Settings router pattern

### Database Migrations
- `supabase/migrations/20251207000000_settings_tables.sql` - Settings tables
- `supabase/migrations/20251206000000_permission_management_tables.sql:131-152` - API tokens
- `supabase/migrations/20251119190000_update_event_bus_multitenancy.sql:10-87` - Event system

### Email Infrastructure
- `src/lib/email/index.ts:1-278` - Email functions
- `src/components/admin/settings/EmailSettingsPage.tsx` - Email settings UI

### Background Jobs
- `src/server/routers/data.ts:22-47` - Edge function trigger helper
- `supabase/functions/process-import/index.ts` - Import job pattern
- `supabase/functions/process-export/index.ts` - Export job pattern

### OAuth & Auth
- `src/lib/auth/client.ts:67-94` - Google OAuth
- `src/server/routers/users.ts:11-19` - Admin client pattern

### UI Components
- `src/components/ui/` - All UI components
- `src/components/admin/settings/SettingsSection.tsx` - Section wrapper
- `src/components/admin/settings/useSettingsForm.ts:47-125` - Form hook

---

## Architecture Documentation

### Integration Management Architecture (Proposed)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin UI Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  /employee/admin/integrations/                                  │
│  ├── page.tsx (Dashboard)                                       │
│  ├── [id]/page.tsx (Detail)                                     │
│  ├── [id]/edit/page.tsx (Configure)                             │
│  └── webhooks/page.tsx (Webhook Management)                     │
├─────────────────────────────────────────────────────────────────┤
│  Components: src/components/admin/integrations/                 │
│  ├── IntegrationsDashboard.tsx                                  │
│  ├── IntegrationForm.tsx                                        │
│  ├── WebhooksManager.tsx                                        │
│  └── WebhookDebugger.tsx                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        tRPC API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  src/server/routers/integrations.ts                             │
│  ├── list, getById, create, update, delete                      │
│  ├── testConnection, toggleStatus                               │
│  ├── listWebhooks, createWebhook, testWebhook                   │
│  ├── getDeliveryHistory, replayDelivery                         │
│  └── getRetryConfig, updateRetryConfig, getDlqItems             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Tables (new migration):                                        │
│  ├── integrations (config, status, health)                      │
│  ├── oauth_tokens (encrypted tokens)                            │
│  ├── webhooks (subscriptions)                                   │
│  ├── webhook_deliveries (history)                               │
│  └── integration_retry_config (retry strategy)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Background Processing                         │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions:                                       │
│  ├── deliver-webhook (webhook delivery with retry)              │
│  ├── health-check-integration (periodic health checks)          │
│  └── refresh-oauth-token (token refresh)                        │
│                                                                 │
│  Triggered by:                                                  │
│  ├── Event bus (publish_event → webhook delivery)               │
│  ├── Scheduled cron (health checks)                             │
│  └── Token expiry (OAuth refresh)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Patterns to Follow

1. **Route Pattern**: Thin page → Rich component
2. **tRPC Pattern**: `orgProtectedProcedure` with Zod validation
3. **Form Pattern**: `useState` + manual validation + `toast.error()`
4. **Settings Pattern**: `useSystemSettingsForm` hook
5. **Status Pattern**: `STATUS_COLORS` + `STATUS_LABELS` constants
6. **Job Pattern**: Edge function + database status tracking

---

## Open Questions

1. **OAuth Token Encryption**: How should OAuth tokens be encrypted at rest? (No existing pattern for encrypted columns)

2. **Health Check Scheduling**: How to implement periodic health checks? (Supabase cron jobs or external scheduler?)

3. **Webhook Signature**: What signing algorithm/secret management for webhook signatures?

4. **Dead Letter Queue**: Where should DLQ items be stored? (New table or status on webhook_deliveries?)

5. **Rate Limiting**: How to implement per-integration rate limiting for outbound API calls?

---

## Related Research

- `thoughts/shared/plans/2025-12-05-data-management-implementation.md` - Similar admin feature implementation
- `docs/specs/PROMPTS/phase4/03-event-system.md` - Event system design spec
- `docs/specs/20-USER-ROLES/10-admin/07-integration-management.md` - Full feature specification
