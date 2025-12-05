---
date: 2025-12-05T12:00:00-05:00
researcher: Claude
git_commit: bd4f5462d7a853ef861c78d80d1461677782892c
branch: main
repository: intime-v3
topic: "System & Organization Settings - Codebase Research"
tags: [research, codebase, admin, settings, organization, configuration]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: System & Organization Settings

**Date**: 2025-12-05
**Researcher**: Claude
**Git Commit**: bd4f5462d7a853ef861c78d80d1461677782892c
**Branch**: main
**Repository**: intime-v3

## Research Question

Research the codebase to understand how the system works and what files+line numbers are relevant to implementing System & Organization Settings (ADMIN-US-005) as specified in `/thoughts/shared/epics/epic-01-admin/05-system-organization-settings.md`.

## Summary

The codebase has a solid foundation for implementing System & Organization Settings:

1. **Admin Routes**: The `/employee/admin/settings` route is defined in navigation but has no page file yet. Existing admin pages follow a consistent pattern: route files are thin wrappers delegating to component files in `/src/components/admin/`.

2. **Database Schema**: The `organizations` table already has JSONB `settings` and `features` columns for flexible configuration storage, plus dedicated columns for `timezone`, `locale`, `logo_url`, and `favicon_url`. No dedicated settings tables exist yet.

3. **Feature Flags**: A complete feature flags system exists with `feature_flags` and `feature_flag_roles` tables, tRPC router procedures, and UI components - this provides a pattern for settings management.

4. **tRPC Patterns**: Routers use `orgProtectedProcedure` for org-scoped access, Zod for validation, and follow standard CRUD patterns with audit logging.

5. **UI Components**: Form components (Input, Select, Switch, Dialog) exist with premium Hublot styling. No File Upload or Color Picker components exist yet.

---

## Detailed Findings

### 1. Admin Routes Structure

#### Existing Admin Layout
**File**: `src/app/employee/admin/layout.tsx`
- **Lines 1-16**: Client component wrapping all admin pages
- **Lines 9-14**: Returns `SidebarLayout` with `adminNavSections` configuration
- All child routes inherit this layout

#### Missing Settings Route
**File**: `src/lib/navigation/adminNavConfig.ts:57-60`
```typescript
{
  label: 'Settings',
  href: '/employee/admin/settings',
  icon: Settings,
}
```
- Navigation item exists but **no corresponding page file** at `src/app/employee/admin/settings/`

#### Existing Admin Page Pattern
Route files are thin wrappers:
```typescript
// src/app/employee/admin/pods/page.tsx
export const dynamic = 'force-dynamic'
import { PodsListPage } from '@/components/admin/pods/PodsListPage'
export default function PodsPage() {
  return <PodsListPage />
}
```

Component files contain all logic:
- `src/components/admin/pods/PodsListPage.tsx` - List with filters, pagination
- `src/components/admin/pods/PodFormPage.tsx` - Create/edit form
- `src/components/admin/pods/PodDetailPage.tsx` - Detail view

---

### 2. Database Schema

#### Organizations Table
**File**: `supabase/migrations/20251119184000_add_multi_tenancy.sql:10-55`

**Existing Columns Relevant to Settings**:
| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `name` | TEXT | NOT NULL | Organization display name |
| `legal_name` | TEXT | - | Official legal name |
| `slug` | TEXT | UNIQUE | URL identifier |
| `email`, `phone`, `website` | TEXT | - | Contact info |
| `address_line1/2`, `city`, `state`, `postal_code`, `country` | TEXT | 'US' | Address |
| `billing_email`, `tax_id` | TEXT | - | Billing |
| `subscription_tier` | TEXT | 'free' | Values: free, startup, business, enterprise |
| `subscription_status` | TEXT | 'active' | Values: active, suspended, cancelled |
| `max_users`, `max_candidates`, `max_storage_gb` | INTEGER | 5, 100, 10 | Limits |
| **`features`** | **JSONB** | '{}' | **Feature flags per org** |
| **`settings`** | **JSONB** | '{}' | **Organization settings** |

**Additional Columns from Later Migrations**:
- `timezone` (TEXT, DEFAULT 'America/New_York') - Line 9 in `20251130100000`
- `locale` (TEXT, DEFAULT 'en-US') - Line 12
- `logo_url` (TEXT) - Line 15
- `favicon_url` (TEXT) - Line 18
- `metadata` (JSONB, DEFAULT '{}') - Line 24
- `industry` (TEXT) - Line 32 in `20251130200000`

#### Feature Flags Tables (Reference Pattern)
**File**: `supabase/migrations/20251206000000_permission_management_tables.sql`

**`feature_flags` table** (lines 94-106):
- `id`, `org_id`, `code`, `name`, `description`
- `default_enabled` (BOOLEAN)
- `is_global` (BOOLEAN) - true for system-wide flags
- Soft delete via `deleted_at`

**`feature_flag_roles` table** (lines 115-122):
- Links flags to roles with `enabled` boolean
- Unique constraint on (feature_flag_id, role_id)

**Key Insight**: The feature flags system demonstrates a pattern for normalized settings storage with role-based access. However, for flexibility, the spec proposes using JSONB columns in organizations table.

#### No Dedicated Settings Tables Yet
The spec proposes these tables (not yet implemented):
- `system_settings` - Global system configuration
- `organization_settings` - Per-org settings by key
- `organization_branding` - Branding assets
- `organization_security_settings` - Security config
- `organization_email_settings` - Email config
- `organization_data_settings` - Data retention

---

### 3. tRPC Router Patterns

#### Root Router Composition
**File**: `src/server/trpc/root.ts:1-14`
```typescript
export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
  permissions: permissionsRouter,
})
```

#### Procedure Types
**File**: `src/server/trpc/middleware.ts`
- `publicProcedure` - No auth (line 21 in init.ts)
- `protectedProcedure` - Requires authenticated user (line 34)
- **`orgProtectedProcedure`** - Requires user + organization (line 35) - **USE THIS**

#### Standard Query Pattern
**File**: `src/server/routers/pods.ts:14-77`
```typescript
list: orgProtectedProcedure
  .input(z.object({
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(20),
  }))
  .query(async ({ ctx, input }) => {
    const { supabase, orgId } = ctx
    // Query with org_id filter, soft delete check, pagination
    return { items, pagination }
  })
```

#### Standard Mutation Pattern
**File**: `src/server/routers/pods.ts:120-213`
```typescript
create: orgProtectedProcedure
  .input(z.object({ /* validated fields */ }))
  .mutation(async ({ ctx, input }) => {
    const { supabase, orgId, user } = ctx
    // 1. Validate (duplicate check)
    // 2. Insert with org_id
    // 3. Create audit log
    return data
  })
```

#### Audit Logging Pattern
**File**: `src/server/routers/pods.ts:201-210`
```typescript
await supabase.from('audit_logs').insert({
  org_id: orgId,
  user_id: user?.id,
  user_email: user?.email,
  action: 'create',
  table_name: 'pods',
  record_id: pod.id,
  new_values: pod,
})
```

#### Feature Flags Router (Reference)
**File**: `src/server/routers/permissions.ts`
- `getFeatureFlags` (lines 494-522) - List flags for org
- `updateFeatureFlagRole` (lines 524-570) - Toggle flag for role

---

### 4. UI Components

#### Form Components Available
**File**: `src/components/ui/`

| Component | File | Key Props |
|-----------|------|-----------|
| **Button** | `button.tsx` | `variant`, `size`, `loading` |
| **Input** | `input.tsx` | `variant`, `error`, `leftIcon`, `rightIcon` |
| **Select** | `select.tsx` | Radix-based, `SelectTrigger`, `SelectContent`, `SelectItem` |
| **Label** | `label.tsx` | Standard label |
| **Textarea** | `textarea.tsx` | `error`, `showCount`, `maxLength` |
| **Switch** | `switch.tsx` | Toggle with gold accent |
| **Dialog** | `dialog.tsx` | Modal with `DialogHeader`, `DialogFooter` |
| **FormField** | `form-field.tsx` | Wrapper with label, error, hint |

#### Missing Components
- **File Upload** - No dedicated component
- **Color Picker** - No color picker implementation
- **Checkbox** - Uses native HTML
- **Radio** - Uses native HTML
- **DatePicker** - Uses native datetime-local input

#### Form Pattern (No react-hook-form)
**File**: `src/components/admin/pods/PodFormPage.tsx:59-68`
```typescript
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [podType, setPodType] = useState<string>('recruiting')
// ... individual useState for each field
```

Validation in submit handler:
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!name.trim()) {
    toast.error('Pod name is required')
    return
  }
  // Submit mutation
}
```

#### Toast Notifications
Two systems in use:
1. **Sonner** (simpler): `import { toast } from 'sonner'`
2. **Custom useToast**: `import { useToast } from '@/components/ui/use-toast'`

#### Dashboard Shell
**File**: `src/components/dashboard/DashboardShell.tsx`
- Wrapper for admin pages with title, description, breadcrumbs, actions
- `DashboardSection` for content groupings
- `DashboardGrid` for responsive layouts

---

### 5. Navigation Configuration

#### Admin Nav Config Structure
**File**: `src/lib/navigation/adminNavConfig.ts`

```typescript
export const adminNavSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [{ label: 'Dashboard', href: '/employee/admin/dashboard', icon: LayoutDashboard }]
  },
  {
    title: 'User Management',
    items: [/* Users, Pods, Roles, Permissions */]
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/employee/admin/settings', icon: Settings },
      { label: 'Integrations', href: '/employee/admin/integrations', icon: Workflow },
      // ...
    ]
  },
  // ...
]
```

#### Adding Nested Navigation (Supported)
**File**: `src/components/navigation/Sidebar.tsx:13`
```typescript
items?: SidebarItem[]  // Nested items supported
```

For Settings sub-navigation:
```typescript
{
  label: 'Settings',
  icon: Settings,
  items: [
    { label: 'Organization', href: '/employee/admin/settings/organization' },
    { label: 'Security', href: '/employee/admin/settings/security' },
    // ...
  ]
}
```

---

## Code References

### Admin Routes
- `src/app/employee/admin/layout.tsx:1-16` - Admin layout wrapper
- `src/lib/navigation/adminNavConfig.ts:57-60` - Settings nav item (no page)
- `src/app/employee/admin/pods/page.tsx:1-7` - Example route pattern
- `src/components/admin/pods/PodFormPage.tsx:1-410` - Example form component

### Database Schema
- `supabase/migrations/20251119184000_add_multi_tenancy.sql:10-55` - Organizations table
- `supabase/migrations/20251119184000_add_multi_tenancy.sql:43-44` - JSONB settings/features
- `supabase/migrations/20251130100000_add_missing_columns.sql:9-24` - timezone, locale, logo
- `supabase/migrations/20251206000000_permission_management_tables.sql:94-126` - Feature flags tables

### tRPC Routers
- `src/server/trpc/root.ts:1-14` - Router composition
- `src/server/trpc/middleware.ts:19-35` - orgProtectedProcedure
- `src/server/routers/pods.ts:14-77` - List query pattern
- `src/server/routers/pods.ts:120-213` - Create mutation pattern
- `src/server/routers/permissions.ts:494-570` - Feature flags procedures

### UI Components
- `src/components/ui/button.tsx:11-50` - Button variants
- `src/components/ui/input.tsx:9-67` - Input with icons
- `src/components/ui/select.tsx:8-168` - Select dropdown
- `src/components/ui/switch.tsx:12-27` - Toggle switch
- `src/components/ui/dialog.tsx:8-130` - Dialog modal
- `src/components/dashboard/DashboardShell.tsx:5-95` - Page shell

### Feature Flags (Reference Pattern)
- `src/components/admin/features/FeatureFlagsPage.tsx:37-289` - Feature flags UI
- `src/server/routers/permissions.ts:494-522` - getFeatureFlags query
- `src/server/routers/permissions.ts:524-570` - updateFeatureFlagRole mutation

---

## Architecture Documentation

### Current Multi-Tenancy Pattern
- All tables have `org_id UUID NOT NULL REFERENCES organizations(id)`
- RLS policies filter by `org_id = auth_user_org_id()`
- tRPC middleware validates org membership before queries
- Service role client used after middleware validation to bypass RLS

### Settings Storage Strategy
Current approach uses JSONB columns on `organizations` table:
- `settings` - General configuration (timezone, locale, defaults)
- `features` - Feature flag overrides
- `metadata` - Extensible additional data

This allows flexible schema-less storage without migrations for new settings.

### Component Architecture
```
Route (page.tsx)
  └── Component (*Page.tsx)
        ├── DashboardShell (layout)
        │     ├── Breadcrumbs
        │     ├── Title/Description
        │     └── Actions (buttons)
        ├── tRPC Queries (useQuery)
        ├── tRPC Mutations (useMutation)
        └── Form/Content
              ├── useState for each field
              ├── UI Components (Input, Select, etc.)
              └── Submit handler with validation
```

---

## Related Files for Implementation

### Files to Create
1. `src/app/employee/admin/settings/page.tsx` - Route file
2. `src/app/employee/admin/settings/organization/page.tsx` - Org settings route
3. `src/components/admin/settings/OrganizationSettingsPage.tsx` - Main component
4. `src/server/routers/settings.ts` - Settings tRPC router
5. `src/components/ui/color-picker.tsx` - Color picker component
6. `src/components/ui/file-upload.tsx` - File upload component

### Files to Modify
1. `src/server/trpc/root.ts` - Add settings router
2. `src/lib/navigation/adminNavConfig.ts` - Add nested Settings navigation
3. `supabase/migrations/` - Add settings tables if using normalized approach

### Existing Patterns to Follow
- `src/components/admin/pods/PodFormPage.tsx` - Form structure
- `src/components/admin/features/FeatureFlagsPage.tsx` - Settings-style UI with switches
- `src/server/routers/pods.ts` - CRUD router pattern
- `src/server/routers/permissions.ts` - Feature flags pattern

---

## Open Questions

1. **Settings Storage**: Should settings use JSONB columns (flexible) or dedicated tables (normalized)?
   - Current: JSONB `settings` and `features` columns exist
   - Spec: Proposes dedicated tables for security, email, data settings

2. **File Upload**: Where should branding assets (logo, favicon) be stored?
   - Supabase Storage bucket `org-assets/` mentioned in spec
   - No file upload component exists yet

3. **Color Picker**: What color picker library to use?
   - Options: react-colorful, @radix-ui/react-color-picker
   - Must match Hublot design system

4. **Settings Router Structure**: Single router or split by category?
   - Option A: `settingsRouter` with all procedures
   - Option B: `systemSettingsRouter`, `orgSettingsRouter`, etc.

5. **Real-time Preview**: How to implement branding preview?
   - Live CSS variable updates vs. iframe preview
