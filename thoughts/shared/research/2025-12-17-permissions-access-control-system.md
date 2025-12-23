---
date: 2025-12-17T07:51:59-05:00
researcher: Claude
git_commit: 0058996
branch: main
repository: intime-v3
topic: "Permissions and Access Control System"
tags: [research, codebase, permissions, rbac, roles, access-control, authentication, authorization]
status: complete
last_updated: 2025-12-17
last_updated_by: Claude
---

# Research: Permissions and Access Control System

**Date**: 2025-12-17T07:51:59-05:00
**Researcher**: Claude
**Git Commit**: 0058996
**Branch**: main
**Repository**: intime-v3

## Research Question

How does the permissions and access control system work? Multiple roles exist (recruiter, bench sales, talent acquisition, etc.) - who sees what, who can do what, both in terms of tabs/screens and objects?

## Summary

InTime v3 implements a **multi-layered Role-Based Access Control (RBAC) system** with:

1. **13+ System Roles** organized into 6 role categories
2. **Route-based UI visibility** (not explicit role checks in components)
3. **6-step permission evaluation chain** for object-level access
4. **7 permission scopes** (own, team, org, etc.) for granular data access
5. **Organization isolation** via mandatory `org_id` filtering
6. **RACI integration** for ownership-based access beyond creators

The system uses **defense-in-depth**: middleware validates auth/org membership, queries filter by org_id, permission evaluator checks role permissions and scopes, and soft deletes preserve audit trails.

---

## Detailed Findings

### 1. System Roles

**Location**: `database/schema.sql:28961-28979`, `scripts/seed-test-users.ts:126-137`

| Role Code | Category | Hierarchy Level | Description |
|-----------|----------|-----------------|-------------|
| `super_admin` | `admin` | 0 | Platform-wide access |
| `admin` | `admin` | 1 | Full workspace control |
| `hr_manager` | `hr` | 2 | HR administration |
| `recruiter` | `pod_ic` | 2 | Jobs, candidates, placements |
| `bench_sales` | `pod_ic` | 2 | Consultants, vendors, hotlists |
| `ta_sales` | `pod_ic` | 2 | Leads, deals, campaigns |
| `recruiting_manager` | `pod_manager` | 2 | Manage recruiting team |
| `bench_sales_manager` | `pod_manager` | 2 | Manage bench sales team |
| `trainer` | `leadership` | 3 | Training content |
| `employee` | `pod_ic` | 3 | Basic employee access |
| `student` | `pod_ic` | 4 | Training-only access |
| `client` | `portal` | - | External client portal |
| `candidate` | `portal` | - | External talent portal |

### 2. Role Categories

**Location**: `src/lib/auth/permission-types.ts:30-35`

```typescript
type RoleCategory = 'pod_ic' | 'pod_manager' | 'leadership' | 'executive' | 'portal' | 'admin'
```

| Category | Purpose | Example Roles |
|----------|---------|---------------|
| `admin` | System administration | super_admin, admin |
| `executive` | Strategic oversight | ceo, vp |
| `leadership` | Team leadership | director, trainer |
| `pod_manager` | Team management | recruiting_manager, bench_sales_manager |
| `pod_ic` | Individual contributors | recruiter, bench_sales, ta_sales |
| `portal` | External users | client, candidate |

### 3. UI/Screen Access Control

**Key Finding**: The system uses **route-based access** rather than explicit role checks in components.

#### Portal Routing Logic

**Location**: `src/lib/auth/client.ts:24-37`

```typescript
const ADMIN_ROLE_CATEGORIES = ['admin', 'executive', 'leadership']

function getEmployeeRedirectPath(role: UserRole | null): string {
  if (!role) return '/employee/workspace/dashboard'

  if (ADMIN_ROLE_CATEGORIES.includes(role.category)) {
    return '/employee/admin/dashboard'
  }

  return '/employee/workspace/dashboard'
}
```

**Result**:
- Admin/Executive/Leadership roles → `/employee/admin/dashboard`
- All other roles → `/employee/workspace/dashboard`

#### Route Structure by Portal

| Portal | Route Prefix | Roles |
|--------|--------------|-------|
| Employee (Admin) | `/employee/admin/*` | admin, executive, leadership |
| Employee (Workspace) | `/employee/workspace/*` | recruiters, sales, HR |
| Client | `/client/*` | client |
| Talent | `/talent/*` | candidate |

#### Navigation Configuration

**Location**: `src/lib/navigation/top-navigation.ts`

The TopNavigation component shows **8 tabs** for employee portal:
- My Work, Accounts, Contacts, Jobs, Candidates, CRM, Pipeline, Administration

Tab visibility is **not role-filtered** at the component level. Instead, different route trees under `/employee/admin/`, `/employee/recruiting/`, `/employee/crm/` provide role-appropriate pages.

#### Sidebar Selection

**Location**: `src/components/layouts/SidebarLayout.tsx`

```typescript
{currentEntity ? <EntityJourneySidebar /> : <SectionSidebar sectionId={sectionId} />}
```

Sidebar content is determined by:
1. **URL path** (e.g., `/admin` → admin sections, `/recruiting` → recruiting sections)
2. **Entity context** (when viewing an entity detail page)

### 4. Permission Scopes

**Location**: `src/lib/auth/permission-types.ts`, `src/lib/auth/permission-evaluator.ts:226-327`

| Scope | Access Level | Validation |
|-------|--------------|------------|
| `own` | User's own records only | `created_by = userId` |
| `own_raci` | Owned + RACI assigned | Check `object_owners` table for R/A/C/I roles |
| `own_ra` | Owned + Responsible/Accountable | Check for R/A roles only |
| `team` | Team/pod records | `pod_id = user's active pod` |
| `region` | Regional records | Region-based filtering |
| `org` | All org records | No additional filter (org-wide) |
| `draft_only` | Draft records only | `status = 'draft'` |

### 5. Permission Evaluation Chain

**Location**: `src/lib/auth/permission-evaluator.ts:30-217`

The `evaluatePermission()` function executes a **6-step evaluation chain**:

```
1. User Lookup → Fetch user profile, role, pod memberships
2. Account Status → Verify user.status === 'active'
3. Override Check → Check permission_overrides table (HIGHEST PRIORITY)
4. Role Permission → Check role_permissions for user's role
5. Scope Check → Validate access to specific entity based on scope
6. Feature Flag → Check if feature is enabled for role
```

**Code Example**:
```typescript
const result = await evaluatePermission(
  supabase,
  userId,
  'jobs.update',  // Permission code
  jobId           // Optional entity ID for scope check
)

// Returns:
{
  allowed: true,
  reason: 'Permission granted',
  chain: [...], // Full audit trail
  scope: 'own_raci'
}
```

### 6. Object-Level Access Control

**Location**: `src/server/routers/*.ts`, `src/server/trpc/middleware.ts`

#### Middleware Protection

**Location**: `src/server/trpc/middleware.ts:34-35`

```typescript
export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const orgProtectedProcedure = protectedProcedure.use(hasOrg)
```

All entity routers use `orgProtectedProcedure`, which:
1. Validates user is authenticated
2. Validates user belongs to an organization
3. Makes `ctx.orgId` available for queries

#### Query-Level Filtering

**Every query filters by `org_id`**:

```typescript
// Example from crm.ts
const { data } = await adminClient
  .from('companies')
  .select('*')
  .eq('org_id', orgId)           // Organization isolation
  .is('deleted_at', null)        // Exclude soft-deleted
```

#### Defense-in-Depth Pattern

For single entity lookups, **double-check** by both ID and org_id:

```typescript
const { data } = await adminClient
  .from('jobs')
  .select('*')
  .eq('id', input.id)
  .eq('org_id', orgId)  // Prevents cross-org access
  .single()
```

### 7. Database Schema

**Location**: `database/schema.sql`

#### Key Tables

| Table | Line | Purpose |
|-------|------|---------|
| `system_roles` | 28961 | Role definitions with hierarchy |
| `user_roles` | 14388 | User-role assignments (supports multi-role) |
| `permissions` | 26061 | Permission definitions (code, object_type, action) |
| `role_permissions` | 27789 | Role-permission mappings with scope |
| `permission_overrides` | 26040 | User-specific permission grants/denials |
| `object_owners` | 24706 | RACI assignments for entities |

#### Permission Format

Permissions follow `{object_type}.{action}` pattern:

```sql
-- permissions table
code = 'jobs.create'
object_type = 'job'
action = 'create'
```

#### Role-Permission Mapping

```sql
-- role_permissions table
role_id = (recruiter role UUID)
permission_id = (jobs.create permission UUID)
scope_condition = 'team'  -- Can create jobs for their team
granted = true
```

### 8. RACI Integration

**Location**: `database/schema.sql:24706-24725`, `src/lib/auth/permission-evaluator.ts:250-282`

The `object_owners` table implements RACI matrix:

```sql
CREATE TABLE object_owners (
  entity_type text,  -- 'job', 'campaign', 'submission'
  entity_id uuid,
  user_id uuid,
  role text,         -- 'responsible', 'accountable', 'consulted', 'informed'
  permission text,   -- 'edit', 'view'
  is_primary boolean
)
```

**Scope Evaluation**:
- `own_raci` scope: User can access if they have ANY RACI role (R, A, C, or I)
- `own_ra` scope: User can access if they are Responsible or Accountable only

### 9. Feature Flags

**Location**: `src/lib/auth/permission-evaluator.ts:336-383`, `src/hooks/useFeatureFlag.tsx`

Feature flags can gate entire features by role:

```typescript
// Feature map (permission-evaluator.ts:343-346)
const featureMap = {
  candidates: 'data_export',      // Export requires data_export feature
  reports: 'advanced_analytics',  // Reports require advanced_analytics
}
```

**UI Usage**:
```typescript
const { hasFeatureFlag } = useFeatureFlags()

if (!hasFeatureFlag('advanced_analytics')) {
  return <UpgradePrompt />
}
```

---

## Code References

### Core Files

| Purpose | File | Key Exports |
|---------|------|-------------|
| Permission evaluation | `src/lib/auth/permission-evaluator.ts` | `evaluatePermission`, `hasFeatureFlag`, `getUserContext` |
| Permission types | `src/lib/auth/permission-types.ts` | `PermissionScope`, `SystemRole`, `RoleCategory` |
| Auth client | `src/lib/auth/client.ts` | `getUserRole`, `getEmployeeRedirectPath` |
| tRPC middleware | `src/server/trpc/middleware.ts` | `protectedProcedure`, `orgProtectedProcedure` |
| Permissions router | `src/server/routers/permissions.ts` | Role/permission CRUD, testing |

### Admin UI

| Purpose | Route |
|---------|-------|
| Role management | `/employee/admin/roles/` |
| Permission matrix | `/employee/admin/permissions/` |
| Role comparison | `/employee/admin/permissions/compare` |
| Permission testing | `/employee/admin/permissions/test` |
| User-role assignment | `/employee/admin/users/` |

---

## Architecture Documentation

### Access Control Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Authentication                                         │
│ - JWT validation via Supabase Auth                              │
│ - Session management in cookies                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: tRPC Middleware                                        │
│ - isAuthenticated: Validates user session                       │
│ - hasOrg: Validates organization membership                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Query Filtering                                        │
│ - All queries filter by org_id                                  │
│ - Soft delete exclusion (deleted_at IS NULL)                    │
│ - Owner/team filtering where applicable                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Permission Evaluation (when needed)                    │
│ - Role permission check                                         │
│ - Scope validation (own/team/org)                               │
│ - RACI assignment check                                         │
│ - Feature flag validation                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Who Sees What (Summary)

| Role Category | Dashboard | Key Features Access |
|---------------|-----------|---------------------|
| **Admin/Executive/Leadership** | Admin Dashboard | Users, Roles, Settings, System Config |
| **Recruiters** | Workspace Dashboard | Jobs, Candidates, Submissions, Interviews, Placements |
| **Bench Sales** | Workspace Dashboard | Consultants, Vendors, Job Orders, Hotlists |
| **TA/Sales** | Workspace Dashboard | Leads, Deals, Campaigns, Activities |
| **HR** | Workspace Dashboard | Employees, Onboarding, Benefits |
| **Clients** | Client Portal | Their jobs, submitted candidates, interviews |
| **Candidates** | Talent Portal | Profile, applications, interview schedules |

### Who Can Do What (Scope Matrix)

| Scope | Create | Read | Update | Delete |
|-------|--------|------|--------|--------|
| `own` | Yes | Own records | Own records | Own records |
| `own_raci` | Yes | RACI assigned | RACI assigned | RACI assigned |
| `team` | Yes | Team records | Team records | Team records |
| `org` | Yes | All org records | All org records | All org records |
| `draft_only` | Yes | All | Draft only | Draft only |

---

## Historical Context (from thoughts/)

- `thoughts/shared/architecture/permissions.md` - Main permissions architecture document defining RBAC patterns, role hierarchy, RLS policies
- `thoughts/shared/plans/2025-12-11-wave-1-foundation.md` - Foundation plan including contact_roles and document access control
- `thoughts/shared/research/2025-12-11-wave-1-foundation-current-state.md` - Current state analysis of permissions system

**Note**: The architecture document uses `workspace_id` terminology while the codebase uses `org_id`. These refer to the same concept (organization isolation).

---

## Related Research

- None currently in `thoughts/shared/research/` specifically about permissions prior to this document.

---

## Open Questions

1. **RLS Policies**: How are Supabase Row-Level Security policies configured? The codebase uses `adminClient` (service role) which bypasses RLS - are RLS policies used for direct Supabase access?

2. **Multi-Role Support**: The `user_roles` table supports multiple roles per user - how is the "primary" role determined for UI routing?

3. **Region Scope**: The `region` scope is defined but implementation appears incomplete (`permission-evaluator.ts:318-323`).

4. **Client/Talent Portals**: Portal UI routes for clients and candidates are referenced but not fully implemented in the current route structure.

5. **Permission Override Auditing**: Override grants/denials require `reason` - is there a UI for reviewing these?
