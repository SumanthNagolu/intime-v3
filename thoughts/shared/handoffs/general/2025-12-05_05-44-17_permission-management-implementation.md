---
date: 2025-12-05T10:44:17+0000
researcher: Claude
git_commit: bd4f5462d7a853ef861c78d80d1461677782892c
branch: main
repository: intime-v3
topic: "Permission Management System Implementation"
tags: [implementation, permissions, rbac, admin, feature-flags, api-tokens]
status: in_progress
last_updated: 2025-12-05
last_updated_by: Claude
type: implementation_strategy
---

# Handoff: Permission Management System Implementation

## Task(s)

Implementing a comprehensive permission management system based on the implementation plan. This is a multi-phase implementation:

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Database migration for permission tables | **Completed** |
| Phase 2 | Permission evaluation library (types + evaluator) | **In Progress** |
| Phase 3 | tRPC permissions router | Planned |
| Phase 4 | Permission Matrix UI page | Planned |
| Phase 5 | Data Scope Configuration UI | Planned |
| Phase 6 | Permission Testing UI | Planned |
| Phase 7 | Role Comparison UI | Planned |
| Phase 8 | Permission Overrides UI | Planned |
| Phase 9 | Feature Flags UI | Planned |
| Phase 10 | API Tokens UI | Planned |
| Phase 11 | Bulk Updates UI | Planned |
| Final | E2E testing | Planned |

## Critical References

1. **Implementation Plan**: `thoughts/shared/plans/2025-12-05-permission-management-implementation.md`
2. **Epic/Story Document**: `thoughts/shared/epics/epic-01-admin/04-permission-management.md`
3. **Codebase Research**: `thoughts/shared/research/2025-12-05-permission-management-codebase-research.md`

## Recent changes

### Phase 1: Database Migration (Completed)

Created new migration file with comprehensive permission management schema:

`supabase/migrations/20251206000000_permission_management_tables.sql`

Tables created:
- `permissions` - Permission definitions with code, name, object_type, action
- `role_permissions` - Maps system_roles to permissions with scope conditions
- `permission_overrides` - User-specific permission grants/denials with expiration
- `feature_flags` - Global and org-specific feature flags
- `feature_flag_roles` - Maps feature flags to roles
- `api_tokens` - API token management with scopes and rate limiting
- `bulk_update_history` - Audit trail for bulk permission changes

Key implementation notes:
- Had to DROP and recreate `permissions` and `role_permissions` tables as the existing schema (`resource`, `scope`, `display_name`, `is_dangerous`) didn't match the new design (`code`, `name`, `object_type`, `action`)
- Also dropped `v_role_permissions_audit` view which depended on old schema
- Seeded 48 permissions across 11 object types (jobs, candidates, submissions, accounts, users, reports, settings, permissions, pods, consultants, leads)
- Created role-permission mappings for all system_roles with appropriate scope conditions
- Created 10 global feature flags with role-based enablement

## Learnings

1. **Existing RBAC Schema Mismatch**: The codebase had an older `permissions` table with columns `resource`, `scope`, `display_name`, `is_dangerous` that conflicted with the new design. The migration handles this by dropping and recreating the tables.

2. **system_roles vs roles**: The codebase has TWO role tables:
   - `system_roles` (from `20251130200000_core_schema_enhancements.sql`) - Has `code`, `category`, `pod_type` columns
   - `roles` (from seed data) - Has `name`, `display_name`, `is_system_role`

   The permission system uses `system_roles` as the foreign key reference.

3. **Scope Conditions**: The plan specifies these scope values:
   - `own` - User's own records only
   - `own_raci` - Records where user is R, A, C, or I
   - `own_ra` - Records where user is R or A
   - `team` - Team/pod members' records
   - `region` - Regional records
   - `org` - Organization-wide
   - `draft_only` - Can only delete drafts

4. **tRPC Patterns**: The existing routers (`users.ts`, `pods.ts`) use:
   - `orgProtectedProcedure` from `src/server/trpc/middleware.ts`
   - Admin client with `getAdminClient()` to bypass RLS
   - Zod schemas for input validation

## Artifacts

- `supabase/migrations/20251206000000_permission_management_tables.sql` - Database schema migration (applied)
- `thoughts/shared/plans/2025-12-05-permission-management-implementation.md` - Full implementation plan

## Action Items & Next Steps

### Immediate (Phase 2 - In Progress)
1. Create permission types file at `src/lib/auth/types.ts` with:
   - `Permission`, `RolePermission`, `PermissionOverride`, `FeatureFlag`, `ApiToken` types
   - Scope enum/type
   - Permission check result type

2. Create permission evaluator at `src/lib/auth/permissions.ts` with:
   - `checkPermission(userId, permissionCode, entityId?)` function
   - `hasFeatureFlag(userId, flagCode)` function
   - Cache layer for performance

### Next Phases
3. **Phase 3**: Create `src/server/routers/permissions.ts` with procedures:
   - `getMatrix`, `updateRolePermission`, `testPermission`
   - `listOverrides`, `createOverride`, `revokeOverride`
   - `listFeatureFlags`, `updateFeatureFlag`
   - `listApiTokens`, `createApiToken`, `revokeApiToken`
   - `bulkUpdate`, `listBulkHistory`, `rollbackBulkUpdate`

4. **Phase 4-11**: Create UI components at `src/app/employee/admin/permissions/`:
   - `page.tsx` - Main permission matrix
   - `test/page.tsx` - Permission testing
   - `compare/page.tsx` - Role comparison
   - Feature flags, API tokens, bulk updates pages

5. Wire up to tRPC root router at `src/server/trpc/root.ts`

## Other Notes

### File Structure Reference
```
src/
├── lib/auth/
│   ├── client.ts (existing)
│   ├── types.ts (to create)
│   └── permissions.ts (to create)
├── server/
│   ├── trpc/
│   │   ├── init.ts - exports router, publicProcedure, middleware
│   │   ├── middleware.ts - exports protectedProcedure, orgProtectedProcedure
│   │   └── root.ts - currently has admin, pods, users routers
│   └── routers/
│       ├── users.ts (reference pattern)
│       └── permissions.ts (to create)
└── app/employee/admin/
    ├── users/ (existing, reference for UI patterns)
    └── permissions/ (to create)
```

### Design System Notes
- Use Hublot-inspired luxury aesthetic (black/white/rose gold)
- Use `bg-cream` for page backgrounds
- Use `hublot-900` (black) for primary actions
- Use `gold-500` (rose gold) for premium/accent actions
- Sharp corners (`rounded-sm`, `rounded-lg`), not `rounded-xl`
- 300ms transitions for luxury feel

### Key SQL Functions Created
- `app_check_permission(p_user_id, p_permission_code, p_entity_id)` - Returns (allowed, reason, scope)
