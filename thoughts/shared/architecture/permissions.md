# Permissions Architecture

This document defines the role-based access control (RBAC) patterns for the InTime platform.

## Role Hierarchy

```
Super Admin
    └── Workspace Admin
        ├── Recruiter Manager
        │   └── Recruiter
        ├── Sales Manager
        │   └── Sales Rep
        └── Trainer
            └── Trainee
```

## Role Definitions

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Global | Platform-wide access, can manage all workspaces |
| `workspace_admin` | Workspace | Full control within a workspace |
| `recruiter_manager` | Workspace | Manage recruiters and their assignments |
| `recruiter` | Workspace | Handle jobs, candidates, placements |
| `sales_manager` | Workspace | Manage sales team and campaigns |
| `sales_rep` | Workspace | Handle leads and client relationships |
| `trainer` | Workspace | Manage courses and training content |
| `trainee` | Workspace | Access assigned training only |

## Permission Patterns

### Resource-Based Permissions

Format: `{resource}:{action}`

```typescript
// Examples
'jobs:create'
'jobs:read'
'jobs:update'
'jobs:delete'
'candidates:read'
'placements:create'
'campaigns:manage'
```

### Common Permission Groups

```typescript
const RECRUITER_PERMISSIONS = [
  'jobs:read', 'jobs:update',
  'candidates:*',
  'applications:*',
  'interviews:*',
  'placements:read', 'placements:create'
];

const SALES_PERMISSIONS = [
  'leads:*',
  'companies:*',
  'contacts:*',
  'campaigns:read', 'campaigns:update',
  'activities:*'
];
```

## Row-Level Security (RLS)

### Workspace Isolation
All workspace-scoped tables must have:
```sql
CREATE POLICY "workspace_isolation" ON {table}
  USING (workspace_id = current_workspace_id());
```

### Role-Based Access
```sql
-- Example: Only recruiters and above can see all candidates
CREATE POLICY "recruiter_candidate_access" ON candidates
  FOR SELECT
  USING (
    has_role('recruiter') OR 
    has_role('recruiter_manager') OR 
    has_role('workspace_admin')
  );
```

### Owner-Based Access
```sql
-- Example: Users can only edit their own activities
CREATE POLICY "owner_activity_update" ON activities
  FOR UPDATE
  USING (created_by = auth.uid());
```

## Implementing Permissions

### In tRPC Routers
```typescript
// Use the protectedProcedure for authenticated routes
export const jobsRouter = router({
  create: protectedProcedure
    .input(createJobSchema)
    .mutation(async ({ ctx, input }) => {
      // ctx.user is available, RLS handles workspace isolation
    }),
});
```

### In React Components
```typescript
// Check permissions before rendering
const { hasPermission } = usePermissions();

if (!hasPermission('jobs:create')) {
  return <NoAccess />;
}
```

## Adding New Permissions

When adding a new permission:
1. Define the resource and actions
2. Add to the appropriate role's permission group
3. Create RLS policies in the database
4. Update this document
5. Test with different role types

## Permission Checking Flow

```
Request → Auth Middleware → Get User Roles → Check Permission → RLS Filter → Response
```

1. **Auth Middleware**: Validates JWT, extracts user
2. **Get User Roles**: Fetches roles for current workspace
3. **Check Permission**: Validates action is allowed
4. **RLS Filter**: Database enforces row-level security

---

**Last Updated**: 2025-12-08
**Maintainer**: Development Team

