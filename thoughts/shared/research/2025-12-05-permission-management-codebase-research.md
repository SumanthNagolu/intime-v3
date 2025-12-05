---
date: 2025-12-05T02:47:16Z
researcher: Claude
git_commit: bd4f5462d7a853ef861c78d80d1461677782892c
branch: main
repository: intime-v3
topic: "Permission Management System - Codebase Research"
tags: [research, codebase, permissions, rbac, admin, authorization]
status: complete
last_updated: 2025-12-05
last_updated_by: Claude
---

# Research: Permission Management System

**Date**: 2025-12-05T02:47:16Z
**Researcher**: Claude
**Git Commit**: bd4f5462d7a853ef861c78d80d1461677782892c
**Branch**: main
**Repository**: intime-v3

## Research Question

Understanding the current state of the codebase to implement Permission Management (ADMIN-US-004) as specified in `/thoughts/shared/epics/epic-01-admin/04-permission-management.md`.

## Summary

The InTime v3 codebase has a **partially implemented RBAC foundation** with comprehensive database schema but **no application-level permission enforcement**. Key findings:

1. **Authentication**: Fully implemented via Supabase Auth with tRPC middleware
2. **Authorization**: Database schema exists for roles/permissions but NOT enforced in application code
3. **User Management**: Recently implemented with role assignment but no permission checking
4. **Feature Flags**: Specification complete but 0% implemented
5. **Audit Logging**: Database triggers exist but limited application integration

---

## Detailed Findings

### 1. Current Authentication & Authorization System

#### Entry Points
- `src/lib/auth/client.ts:15-94` - Client-side auth (signIn, signUp, OAuth)
- `src/server/trpc/context.ts:11-41` - Server context creation with user/orgId
- `src/server/trpc/middleware.ts:4-35` - Auth middleware and protected procedures

#### Current Authorization Model

**What is enforced:**
1. **Authentication** - User must be logged in (`isAuthenticated` middleware at line 4-17)
2. **Organization membership** - User must belong to an org (`hasOrg` middleware at line 19-32)
3. **Multi-tenant isolation** - All queries filter by `org_id`

**What is NOT enforced:**
- Role-based permissions
- Data scope restrictions (Own, Team, Region, Org)
- Feature-level access control
- Object-level permission checks (RACI)

#### Protected Procedures
```typescript
// src/server/trpc/middleware.ts:34-35
export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = publicProcedure.use(isAuthenticated).use(hasOrg)
```

All admin routers use `orgProtectedProcedure` but **no permission checks** beyond org membership.

---

### 2. Database Schema for Roles & Permissions

#### Tables That EXIST (Created in Migrations)

| Table | Location | Purpose |
|-------|----------|---------|
| `organizations` | 20251119184000:10-55 | Multi-tenant root |
| `system_roles` | 20251130200000:133-164 | Predefined role templates |
| `login_history` | 20251205000000:56-73 | Login audit trail |
| `user_invitations` | 20251205000000:90-121 | Pending invitations |
| `pod_managers` | 20251205000000:139-161 | Pod manager assignments |
| `object_owners` | 20251201100000:18-52 | RACI ownership |
| `raci_change_log` | 20251201100000:69-97 | RACI audit trail |

#### Tables REFERENCED but NOT Created

| Table | Status | Notes |
|-------|--------|-------|
| `user_profiles` | Exists (Supabase base) | Enhanced in migrations |
| `roles` | **NOT CREATED** | Documented but missing |
| `permissions` | **NOT CREATED** | Documented but missing |
| `role_permissions` | **NOT CREATED** | Documented but missing |
| `user_roles` | **NOT CREATED** | Documented but missing |
| `feature_flags` | **NOT CREATED** | Spec only |
| `permission_overrides` | **NOT CREATED** | Required for AC-4 |

#### system_roles Table Structure (20251130200000:133-164)

```sql
- id (UUID PK)
- code (TEXT UNIQUE) - e.g., 'technical_recruiter'
- name, display_name, description
- category (CHECK: 'pod_ic', 'pod_manager', 'leadership', 'executive', 'portal', 'admin')
- hierarchy_level (0=IC, 1=Manager, 2=Director, 3=VP, 4=C-Level, 5=Admin)
- pod_type (CHECK: 'recruiting', 'bench_sales', 'ta')
- default_permissions (TEXT[])
- is_system_role, is_active, color_code, icon_name
```

**Seeded Roles**: technical_recruiter, bench_sales_recruiter, ta_specialist, recruiting_manager, bench_manager, ta_manager, hr_manager, regional_director, cfo, coo, ceo, admin, client_user, candidate_user

#### user_profiles Enhancements (20251205000000:15-50)

```sql
- role_id (UUID → system_roles.id) -- Role assignment
- manager_id (UUID → user_profiles.id) -- Reporting structure
- status ('pending', 'active', 'suspended', 'deactivated')
- phone, avatar_url, two_factor_enabled
- start_date, last_login_at, password_changed_at
```

#### Database Permission Helper Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `auth_user_org_id()` | 20251119184000:138-149 | Returns user's org_id for RLS |
| `user_is_admin()` | 20251121140000:9-22 | Checks admin role |
| `check_user_permission()` | 20251127000000:136-183 | Scope-based permission check |
| `auth_has_role()` | 20251123000000:41-54 | Checks if user has specific role |

**IMPORTANT**: `check_user_permission()` exists at database level but is **NEVER called from application code**.

---

### 3. tRPC Router Patterns

#### Current Router Structure (src/server/trpc/root.ts:6-10)

```typescript
export const appRouter = router({
  admin: adminRouter,
  pods: podsRouter,
  users: usersRouter,
})
```

#### Common Patterns

**Input Validation** (Zod schemas):
```typescript
.input(z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  status: z.enum(['active', 'pending', 'suspended']).optional(),
}))
```

**Query Pattern** (src/server/routers/pods.ts:14-77):
- Extract supabase and orgId from context
- Build query with `.select()` and joins
- Filter by `org_id` and `deleted_at IS NULL`
- Handle pagination with `.range()`
- Return items + pagination metadata

**Mutation Pattern** (src/server/routers/users.ts:177-310):
- Validate input
- Check for duplicates/conflicts
- Perform database operations
- Create audit log entry
- Return created/updated record

**Admin Client Pattern** (src/server/routers/users.ts:11-19):
- Service role client bypasses RLS
- Used for auth admin operations (createUser, resetPassword)
- Still enforces org scope via explicit filtering

---

### 4. Admin UI Components & Patterns

#### Route Structure (src/app/employee/admin/)

```
/employee/admin/
├── layout.tsx           -- SidebarLayout wrapper
├── users/
│   ├── page.tsx         -- UsersListPage
│   ├── new/page.tsx     -- UserFormPage (create)
│   └── [id]/
│       ├── page.tsx     -- UserDetailPage
│       └── edit/page.tsx -- UserFormPage (edit)
├── pods/                -- Same pattern
├── roles/               -- Route exists, NO components
└── permissions/         -- Route exists, NO components
```

#### Component Patterns

**List Page** (UsersListPage.tsx):
- Local state for filters (search, roleId, status, page)
- tRPC queries for data + filter options
- Filter UI with dropdowns
- Table with loading/empty/error states
- Custom dropdown menus for row actions
- Pagination with range display

**Form Page** (UserFormPage.tsx):
- Dual mode: create/edit via `mode` prop
- Form state with useState hooks
- tRPC mutations with toast feedback
- Cache invalidation on success
- Client-side validation before submit

**Detail Page** (UserDetailPage.tsx):
- Tabbed interface (profile, activity, security)
- Conditional data fetching per tab
- Action buttons with confirmation dialogs
- Status-specific UI (banners, buttons)

#### Form Field Patterns

**Input**: Label + Input + optional description
**Select**: SelectTrigger + SelectContent + SelectItems
**Radio**: Native inputs with styled labels
**Checkbox**: Native input with label and description

#### Dialog Patterns

Currently uses **custom modal implementations** (fixed overlay + absolute card) instead of Radix Dialog component at `src/components/ui/dialog.tsx`.

---

### 5. Feature Flags System

**Status: 0% Implemented**

#### What Exists:
- Specification: `docs/specs/20-USER-ROLES/10-admin/14-feature-flags.md` (complete)
- Epic story: `thoughts/shared/epics/epic-01-admin/13-feature-flags.md` (complete)
- Navigation entry: `src/lib/navigation/adminNavConfig.ts:91-94`
- Archived screen definition: `.archive/ui-reference/screens/admin/feature-flags.screen.ts`

#### What Does NOT Exist:
- Database tables (feature_flags, feature_flag_overrides)
- tRPC router procedures
- React hooks (useFeatureFlag)
- Utility functions (isFeatureEnabled, evaluateFlag)
- Page routes or components
- Any third-party integration (LaunchDarkly, etc.)

**Note**: Feature flags are a dependency for Permission Management (AC-5 permission testing). May need to implement basic version or skip for MVP.

---

### 6. Audit Logging System

#### Database Infrastructure

**audit_logs table** (enhanced in 20251130200000:175-193):
```sql
- id, org_id, user_id, user_email
- action, table_name, record_id
- old_values, new_values (JSONB)
- entity_type, entity_id
- actor_type, actor_id
- correlation_id, parent_audit_id
- is_compliance_relevant, retention_category
- created_at
```

**Audit Trigger** (20251122000000:14-92):
- `trigger_audit_log()` function
- Applied to: user_profiles, user_roles, roles
- Uses JSONB for safe field access
- Captures actor from session settings

#### Application Usage

**Current audit logging** in users router (src/server/routers/users.ts):
- Line 293-307: User creation audit
- Line 406-415: User update audit
- Line 488-498: Status change audit
- Line 542-551: Password reset audit
- Line 592-601: Session revocation audit

**Pattern**:
```typescript
await supabase.from('audit_logs').insert({
  org_id: orgId,
  user_id: currentUser?.id,
  user_email: currentUser?.email,
  action: 'create' | 'update' | 'delete',
  table_name: 'table_name',
  record_id: recordId,
  old_values: previousData,
  new_values: newData,
})
```

#### Event Bus System

**Tables exist** (events, event_subscriptions, event_delivery_log) but **no application-level TypeScript implementation**.

**publish_event() function** at database level (20251119190000:10-87):
- PostgreSQL NOTIFY for real-time processing
- Multi-tenant support
- Returns event ID

---

### 7. User Management Implementation (Dependency)

#### Complete Implementation

**tRPC Router**: `src/server/routers/users.ts` (766 lines)

| Procedure | Type | Purpose |
|-----------|------|---------|
| `list` | query | Paginated users with filters |
| `getById` | query | Single user with relations |
| `create` | mutation | Create user + auth + profile |
| `update` | mutation | Update profile + pod membership |
| `updateStatus` | mutation | Status + Supabase Auth sync |
| `resetPassword` | mutation | Generate recovery link |
| `revokeAllSessions` | mutation | Force logout |
| `getActivity` | query | User's audit logs |
| `getLoginHistory` | query | User's login history |
| `getRoles` | query | Available system_roles |
| `getAvailableManagers` | query | Manager-eligible users |
| `getPods` | query | Active pods for dropdown |

#### Role Assignment Flow

**Create User** (users.ts:177-310):
1. Creates Supabase Auth user
2. Creates user_profiles with `role_id` reference to system_roles
3. Optionally adds to pod via pod_members
4. Creates invitation if sendInvitation=true

**Role is stored** but **no permission enforcement** based on role.

---

## Code References

### Authentication & Context
- `src/lib/auth/client.ts:15-94` - Client auth functions
- `src/server/trpc/context.ts:11-41` - Context creation
- `src/server/trpc/middleware.ts:4-35` - Protected procedures

### Database Migrations
- `supabase/migrations/20251119184000_add_multi_tenancy.sql` - Multi-tenancy + auth helpers
- `supabase/migrations/20251127000000_auth_access_control_fixes.sql` - check_user_permission()
- `supabase/migrations/20251130200000_core_schema_enhancements.sql` - system_roles table
- `supabase/migrations/20251205000000_user_management_tables.sql` - User management tables

### tRPC Routers
- `src/server/trpc/root.ts` - Router composition
- `src/server/routers/admin.ts` - Admin dashboard queries
- `src/server/routers/pods.ts` - Pod CRUD (766 lines)
- `src/server/routers/users.ts` - User management (766 lines)

### UI Components
- `src/components/admin/users/UsersListPage.tsx` - User list
- `src/components/admin/users/UserFormPage.tsx` - Create/edit form
- `src/components/admin/users/UserDetailPage.tsx` - User detail with tabs
- `src/components/ui/dialog.tsx` - Radix Dialog (unused in admin)
- `src/lib/navigation/adminNavConfig.ts` - Admin sidebar navigation

### Specifications
- `docs/specs/20-USER-ROLES/10-admin/06-permission-management.md` - Full spec
- `thoughts/shared/epics/epic-01-admin/04-permission-management.md` - User story

---

## Architecture Documentation

### Current Multi-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│   (UsersListPage, UserFormPage, UserDetailPage)         │
└─────────────────────────┬───────────────────────────────┘
                          │ tRPC hooks
┌─────────────────────────▼───────────────────────────────┐
│                    tRPC Routers                          │
│   (admin, pods, users)                                   │
│   Middleware: orgProtectedProcedure                      │
└─────────────────────────┬───────────────────────────────┘
                          │ Supabase client
┌─────────────────────────▼───────────────────────────────┐
│                    PostgreSQL + RLS                      │
│   - auth_user_org_id() for org isolation                │
│   - user_is_admin() for admin bypass                    │
│   - check_user_permission() (UNUSED)                    │
└─────────────────────────────────────────────────────────┘
```

### Required Architecture for Permission Management

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│   + PermissionMatrixPage                                │
│   + PermissionTestDialog                                │
│   + PermissionOverrideForm                              │
│   + RoleComparisonView                                  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Permission Evaluation Layer                 │
│   NEW: src/lib/auth/permission-evaluator.ts             │
│   - evaluatePermission(userId, objectType, action)      │
│   - getPermissionChain() for debugging                  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    tRPC Routers                          │
│   NEW: src/server/routers/permissions.ts                │
│   - getMatrix, updateRolePermission                     │
│   - testPermission, createOverride, listOverrides       │
│   - compareRoles, bulkUpdate                            │
│   - API token CRUD                                      │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    PostgreSQL                            │
│   NEW Tables:                                            │
│   - permissions (action × resource × scope)             │
│   - role_permissions (role → permission mapping)        │
│   - permission_overrides (user-specific exceptions)     │
│   - api_tokens (for AC-7)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Open Questions

1. **Missing Core Tables**: Should `roles`, `permissions`, `role_permissions`, `user_roles` be created? The spec assumes they exist but migrations don't create them.

2. **Feature Flags Dependency**: AC-5 (Permission Testing) references feature flag checks. Should basic feature flags be implemented first, or mock for MVP?

3. **RACI Integration**: How should permission management interact with existing `object_owners` RACI system? Spec mentions "Own + RACI" scope.

4. **Existing check_user_permission()**: The database function exists but isn't used. Should the new implementation call it or create a TypeScript-based evaluator?

5. **API Tokens (AC-7)**: Should this be part of Permission Management or a separate feature? It's a significant sub-feature.

6. **Bulk Updates (AC-6)**: Rollback capability requires storing change snapshots. What's the retention policy?

---

## Related Research

- `thoughts/shared/research/2025-12-04-user-management-codebase-research.md` - User management implementation details
- `thoughts/shared/plans/2025-12-04-user-management-implementation.md` - User management implementation plan

---

## Implementation Readiness Assessment

| Acceptance Criteria | Database Ready | API Ready | UI Ready |
|---------------------|----------------|-----------|----------|
| AC-1: Permission Matrix View | Partial (need tables) | No | No |
| AC-2: Data Scope Configuration | Yes (system_roles.default_data_scope) | No | No |
| AC-3: Role Comparison | Partial | No | No |
| AC-4: Custom Permission Overrides | No (need table) | No | No |
| AC-5: Permission Testing | Partial (check_user_permission exists) | No | No |
| AC-6: Bulk Permission Updates | No | No | No |
| AC-7: API Token Management | No (need table) | No | No |

**Estimated Implementation Effort**: High - requires database migrations, new tRPC router, permission evaluation library, and 4-5 new UI pages.
