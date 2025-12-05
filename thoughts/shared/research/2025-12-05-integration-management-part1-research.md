---
date: 2025-12-05T09:08:26-0500
researcher: Claude
git_commit: 00e36f54acebf51c49cd97d0b2e862ab8a643d20
branch: main
repository: intime-v3
topic: "Integration Management Part 1 - Core Infrastructure Research"
tags: [research, codebase, integrations, admin]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: Integration Management Part 1 - Core Infrastructure

**Date**: 2025-12-05
**Scope**: Database, tRPC router, Dashboard, Configure, Health Monitoring

## Summary

Part 1 covers the foundation for Integration Management: database schema, tRPC router structure, integration dashboard, configuration forms, and health monitoring. Key patterns from existing admin features will be followed.

## Key Findings

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

### 4. Email Infrastructure (Reference for SMTP config)

#### Email Service

**File**: `src/lib/email/index.ts:1-278`

Uses **Resend** as email provider:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

#### Email Settings UI

**File**: `src/components/admin/settings/EmailSettingsPage.tsx:15-21`

Settings managed:
- `email_from_address`
- `email_from_name`
- `email_reply_to`
- `email_footer_text`
- `bounce_handling_enabled`

Uses `useSystemSettingsForm` hook for state management.

---

### 5. UI Components and Forms

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
| `Badge` | `src/components/ui/badge.tsx` | Status badges |
| `Button` | `src/components/ui/button.tsx` | Button variants |
| `Card` | `src/components/ui/card.tsx` | Card container |
| `Table` | `src/components/ui/table.tsx` | Data tables |

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

### UI Components
- `src/components/ui/` - All UI components
- `src/components/admin/settings/SettingsSection.tsx` - Section wrapper
- `src/components/admin/settings/useSettingsForm.ts:47-125` - Form hook

---

## Implementation Architecture (Part 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin UI Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  /employee/admin/integrations/                                  │
│  ├── page.tsx (Dashboard)                                       │
│  ├── new/page.tsx (Add Integration)                             │
│  ├── [id]/page.tsx (Detail)                                     │
│  └── [id]/edit/page.tsx (Configure)                             │
├─────────────────────────────────────────────────────────────────┤
│  Components: src/components/admin/integrations/                 │
│  ├── IntegrationsDashboard.tsx                                  │
│  ├── IntegrationForm.tsx                                        │
│  ├── IntegrationCard.tsx                                        │
│  └── HealthLogsTable.tsx                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        tRPC API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  src/server/routers/integrations.ts                             │
│  ├── list, getById, create, update, delete                      │
│  ├── getStats, getCriticalAlerts                                │
│  ├── testConnection, toggleStatus                               │
│  └── getHealthLogs, runHealthCheck                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Tables (new migration):                                        │
│  ├── integrations (config, status, health)                      │
│  ├── integration_health_logs (check history)                    │
│  └── (webhook tables created but used in Part 2)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Patterns to Follow

1. **Route Pattern**: Thin page → Rich component
2. **tRPC Pattern**: `orgProtectedProcedure` with Zod validation
3. **Form Pattern**: `useState` + manual validation + `toast.error()`
4. **Settings Pattern**: `useSystemSettingsForm` hook for config forms
5. **Status Pattern**: `STATUS_COLORS` + `STATUS_LABELS` constants
6. **Card Pattern**: White bg, rounded-lg, shadow-elevation-sm
