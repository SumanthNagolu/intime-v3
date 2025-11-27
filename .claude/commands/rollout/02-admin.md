# Phase 1: Admin Console

## Component Overview

**Priority:** HIGH
**Dependencies:** Authentication (Phase 0)
**Blocks:** HR Module

---

## Scope

### Database Tables
- `user_profiles` - User management
- `roles` - Role CRUD
- `permissions` - Permission CRUD
- `user_roles` - Assignment management
- `role_permissions` - Permission grants
- `audit_logs` - Activity viewing
- `organizations` - Org settings

### Server Actions
- `src/app/actions/admin-users.ts` - User management
- `src/app/actions/admin-roles.ts` - Role management (TO CREATE)
- `src/app/actions/admin-audit.ts` - Audit log queries (TO CREATE)
- `src/app/actions/admin-settings.ts` - System settings (TO CREATE)

### UI Components
- `src/components/admin/AdminDashboard.tsx`
- `src/components/admin/UserManagement.tsx`
- `src/components/admin/Permissions.tsx`
- `src/components/admin/AuditLogs.tsx`
- `src/components/admin/SystemSettings.tsx`

### Pages
- `src/app/employee/admin/dashboard/page.tsx`

---

## Phase 1: Audit

### 1.1 Component Inventory

Read and catalog:
```
src/components/admin/AdminDashboard.tsx
src/components/admin/UserManagement.tsx
src/components/admin/Permissions.tsx
src/components/admin/AuditLogs.tsx
src/components/admin/SystemSettings.tsx
```

For each component, document:
- Current data source (mock vs real)
- Forms and their handlers
- Missing functionality

### 1.2 Database Check

Verify audit_logs table structure:
```typescript
// Expected fields:
- id, table_name, action, record_id
- user_id, user_email, org_id
- old_values (jsonb), new_values (jsonb)
- metadata, severity
- created_at, ip_address
```

---

## Phase 2: Database Fixes

### 2.1 Audit Logs Query Optimization

```sql
-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created
ON audit_logs(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action
ON audit_logs(table_name, action);
```

### 2.2 RLS for Audit Logs

```sql
-- Admins can view all org audit logs
CREATE POLICY "admin_view_audit" ON audit_logs
  FOR SELECT
  USING (
    org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT id FROM user_profiles WHERE auth_id = auth.uid())
      AND r.name IN ('super_admin', 'admin')
    )
  );
```

---

## Phase 3: Server Actions

### 3.1 Role Management

Create `src/app/actions/admin-roles.ts`:

```typescript
'use server';

// List all roles
export async function listRolesAction(): Promise<ActionResult<Role[]>>

// Get role with permissions
export async function getRoleAction(roleId: string): Promise<ActionResult<RoleWithPermissions>>

// Create custom role
export async function createRoleAction(input: {
  name: string;
  displayName: string;
  description?: string;
  colorCode?: string;
  parentRoleId?: string;
}): Promise<ActionResult<Role>>

// Update role
export async function updateRoleAction(roleId: string, input: {
  displayName?: string;
  description?: string;
  colorCode?: string;
}): Promise<ActionResult<Role>>

// Delete role (only non-system roles)
export async function deleteRoleAction(roleId: string): Promise<ActionResult<void>>

// Assign permission to role
export async function assignPermissionToRoleAction(
  roleId: string,
  permissionId: string
): Promise<ActionResult<void>>

// Remove permission from role
export async function removePermissionFromRoleAction(
  roleId: string,
  permissionId: string
): Promise<ActionResult<void>>

// List all permissions
export async function listPermissionsAction(): Promise<ActionResult<Permission[]>>
```

### 3.2 Audit Log Actions

Create `src/app/actions/admin-audit.ts`:

```typescript
'use server';

// Get audit logs with filters
export async function getAuditLogsAction(filters: {
  userId?: string;
  tableName?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ logs: AuditLog[]; total: number }>>

// Get audit log detail
export async function getAuditLogDetailAction(logId: string): Promise<ActionResult<AuditLog>>

// Export audit logs (returns CSV data)
export async function exportAuditLogsAction(filters: {
  startDate: string;
  endDate: string;
}): Promise<ActionResult<string>>
```

### 3.3 System Settings Actions

Create `src/app/actions/admin-settings.ts`:

```typescript
'use server';

// Get organization settings
export async function getOrgSettingsAction(): Promise<ActionResult<OrgSettings>>

// Update organization settings
export async function updateOrgSettingsAction(input: {
  name?: string;
  settings?: {
    timezone?: string;
    locale?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
    };
  };
}): Promise<ActionResult<Organization>>

// Get subscription info
export async function getSubscriptionAction(): Promise<ActionResult<SubscriptionInfo>>
```

---

## Phase 4: UI Integration

### 4.1 AdminDashboard.tsx

Wire up tabs to real actions:
- User Management tab -> listUsersAction
- Permissions tab -> listRolesAction, listPermissionsAction
- Audit Logs tab -> getAuditLogsAction
- Settings tab -> getOrgSettingsAction

### 4.2 UserManagement.tsx

Already addressed in Phase 0, verify:
- Real user list loading
- Create user form working
- Edit user working
- Deactivate/reactivate working
- Role assignment working

### 4.3 Permissions.tsx

Connect to role management:
```typescript
const [roles, setRoles] = useState<Role[]>([]);
const [permissions, setPermissions] = useState<Permission[]>([]);

useEffect(() => {
  Promise.all([
    listRolesAction(),
    listPermissionsAction()
  ]).then(([rolesResult, permsResult]) => {
    if (rolesResult.success) setRoles(rolesResult.data);
    if (permsResult.success) setPermissions(permsResult.data);
  });
}, []);
```

### 4.4 AuditLogs.tsx

Connect to audit queries:
```typescript
const [logs, setLogs] = useState<AuditLog[]>([]);
const [filters, setFilters] = useState<AuditFilters>({});

useEffect(() => {
  getAuditLogsAction(filters).then(result => {
    if (result.success) setLogs(result.data.logs);
  });
}, [filters]);
```

### 4.5 SystemSettings.tsx

Connect to settings:
```typescript
const [settings, setSettings] = useState<OrgSettings | null>(null);

useEffect(() => {
  getOrgSettingsAction().then(result => {
    if (result.success) setSettings(result.data);
  });
}, []);
```

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/admin-workflows.spec.ts`

Required scenarios:

```typescript
test.describe('Admin Console', () => {
  // Access Control
  test('admin can access admin dashboard');
  test('non-admin is redirected from admin dashboard');

  // User Management
  test('admin can view user list');
  test('admin can search users');
  test('admin can create new user');
  test('admin can edit user details');
  test('admin can deactivate user');
  test('admin can reactivate user');
  test('admin can change user role');

  // Role Management
  test('admin can view roles');
  test('admin can view role permissions');
  test('admin can create custom role');
  test('admin cannot delete system roles');
  test('admin can assign permission to role');
  test('admin can remove permission from role');

  // Audit Logs
  test('admin can view audit logs');
  test('admin can filter audit logs by user');
  test('admin can filter audit logs by date');
  test('admin can export audit logs');

  // Settings
  test('admin can view organization settings');
  test('admin can update organization name');
  test('admin can update branding settings');
});
```

---

## Phase 6: Verification Checklist

### Server Actions
- [ ] listRolesAction returns all roles
- [ ] getRoleAction returns role with permissions
- [ ] createRoleAction creates non-system role
- [ ] updateRoleAction updates role
- [ ] deleteRoleAction only deletes non-system
- [ ] assignPermissionToRoleAction works
- [ ] removePermissionFromRoleAction works
- [ ] getAuditLogsAction returns filtered logs
- [ ] exportAuditLogsAction generates CSV
- [ ] getOrgSettingsAction returns settings
- [ ] updateOrgSettingsAction saves settings

### UI
- [ ] AdminDashboard tabs all work
- [ ] UserManagement fully functional
- [ ] Permissions shows roles/permissions matrix
- [ ] AuditLogs filterable and paginated
- [ ] SystemSettings editable
- [ ] All loading states
- [ ] All error handling
- [ ] Toast notifications

### E2E Tests
- [ ] All admin scenarios passing

---

## Completion Criteria

Before moving to `/rollout/03-hr`:

1. All checklist items checked
2. E2E tests passing
3. Manual verification as admin@intime.com

---

## Next Step

When complete, run:
```
Execute /rollout/03-hr
```
