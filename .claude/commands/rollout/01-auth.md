# Phase 0: Authentication & Access Control

## Component Overview

**Priority:** CRITICAL (Foundation)
**Dependencies:** None
**Blocks:** All other components

---

## Scope

### Database Tables
- `user_profiles` - User data
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission mappings
- `organizations` - Multi-tenancy
- `audit_logs` - Activity tracking

### Server Actions
- `src/app/actions/auth.ts` - SignUp, SignIn, SignOut
- `src/app/actions/admin-users.ts` - User CRUD (TO CREATE)

### UI Components
- `src/app/login/page.tsx`
- `src/app/auth/*/page.tsx` (academy, client, employee, talent)
- `src/components/admin/UserManagement.tsx`
- `src/components/admin/AdminDashboard.tsx`

### Middleware
- `src/middleware.ts` - Route protection

---

## Phase 1: Audit

### 1.1 Database Audit

Read and check:
```
src/lib/db/schema/user-profiles.ts
src/lib/db/schema/rbac.ts
src/lib/db/schema/organizations.ts
```

Questions:
- [ ] RLS enabled on all tables?
- [ ] RLS policies filter by org_id?
- [ ] Indexes on auth_id, org_id, email?
- [ ] Audit fields complete? (created_at, updated_at, created_by, deleted_at)
- [ ] Roles seeded? (super_admin, admin, recruiter, bench_sales, trainer, student, employee, candidate, client, hr_manager, ta_sales)

### 1.2 Server Action Audit

Read and check:
```
src/app/actions/auth.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
```

Questions:
- [ ] signUpAction creates profile + assigns role?
- [ ] signInAction redirects by role?
- [ ] signOutAction clears session?
- [ ] getCurrentUser() helper exists?
- [ ] checkPermission() helper exists?

### 1.3 UI Audit

Read and check:
```
src/app/login/page.tsx
src/app/auth/talent/page.tsx
src/components/admin/UserManagement.tsx
```

Questions:
- [ ] Login form wired to signInAction?
- [ ] Signup forms wired to signUpAction?
- [ ] UserManagement uses real data?
- [ ] Loading states implemented?
- [ ] Error handling with toast?

### 1.4 Middleware Audit

Read and check:
```
src/middleware.ts
```

Questions:
- [ ] Protected routes guarded?
- [ ] Role-based route protection?
- [ ] Session expiry handling?

---

## Phase 2: Database Fixes

### 2.1 Verify RLS

Check each table has RLS and proper policies:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'roles', 'permissions', 'user_roles', 'role_permissions', 'organizations');
```

### 2.2 Create Missing Policies (if needed)

```sql
-- Example org isolation policy
CREATE POLICY "org_isolation" ON user_profiles
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));
```

### 2.3 Verify Indexes

```sql
-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'user_roles');
```

---

## Phase 3: Server Actions

### 3.1 Required Actions

Create `src/app/actions/admin-users.ts`:

```typescript
'use server';

// List users with pagination
export async function listUsersAction(filters?: {
  search?: string;
  roleId?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ users: User[]; total: number }>>

// Get single user
export async function getUserAction(userId: string): Promise<ActionResult<UserWithRoles>>

// Create user (admin only)
export async function createUserAction(input: {
  email: string;
  fullName: string;
  roleId: string;
  phone?: string;
}): Promise<ActionResult<User>>

// Update user
export async function updateUserAction(userId: string, input: {
  fullName?: string;
  phone?: string;
  isActive?: boolean;
}): Promise<ActionResult<User>>

// Deactivate user (soft delete)
export async function deactivateUserAction(userId: string): Promise<ActionResult<void>>

// Reactivate user
export async function reactivateUserAction(userId: string): Promise<ActionResult<void>>

// Assign role
export async function assignRoleAction(userId: string, roleId: string): Promise<ActionResult<void>>

// Remove role
export async function removeRoleAction(userId: string, roleId: string): Promise<ActionResult<void>>

// Get current user with roles and permissions
export async function getCurrentUserAction(): Promise<ActionResult<UserWithRolesAndPermissions>>

// Check permission
export async function hasPermissionAction(
  resource: string,
  action: string
): Promise<ActionResult<boolean>>
```

### 3.2 Helper Functions

Add to `src/lib/auth/helpers.ts`:

```typescript
// Get current user with full context
export async function getCurrentUser(): Promise<UserWithContext | null>

// Check if user has permission
export async function hasPermission(
  userId: string,
  resource: string,
  action: string,
  scope?: string
): Promise<boolean>

// Get role-based redirect path
export function getDashboardByRole(roleName: string): string
```

---

## Phase 4: UI Integration

### 4.1 UserManagement.tsx Updates

Replace mock data:
```typescript
// Before
const [users, setUsers] = useState(MOCK_USERS);

// After
const [users, setUsers] = useState<User[]>([]);
useEffect(() => {
  listUsersAction().then(result => {
    if (result.success) setUsers(result.data.users);
  });
}, []);
```

Wire form submissions:
```typescript
async function handleCreateUser(data: FormData) {
  const result = await createUserAction({
    email: data.get('email') as string,
    fullName: data.get('fullName') as string,
    roleId: data.get('roleId') as string,
  });

  if (result.success) {
    toast.success('User created');
    refreshUsers();
  } else {
    toast.error(result.error);
  }
}
```

### 4.2 Login Page Updates

Ensure using real signInAction:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const result = await signInAction({ email, password });

  if (!result.success) {
    toast.error(result.error);
    setLoading(false);
  }
  // Redirect handled by action
};
```

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/auth-workflows.spec.ts`

Required scenarios:
1. Sign in with valid credentials -> redirect to dashboard
2. Sign in with invalid password -> error shown
3. Sign in with invalid email format -> validation error
4. Sign out -> redirect to login
5. Protected route without auth -> redirect to login
6. Admin can access admin pages
7. Non-admin cannot access admin pages
8. Role-based redirect after login (recruiter -> recruiting, student -> academy)
9. Session persists across navigation
10. Session persists after refresh
11. Admin can view user list
12. Admin can create user
13. Admin can deactivate user

Run tests:
```bash
pnpm playwright test tests/e2e/auth-workflows.spec.ts --headed
```

---

## Phase 6: Verification Checklist

### Database
- [ ] user_profiles RLS enabled
- [ ] roles RLS enabled (or public read)
- [ ] permissions RLS enabled (or public read)
- [ ] user_roles RLS enabled
- [ ] role_permissions RLS enabled
- [ ] organizations RLS enabled
- [ ] RLS filters by org_id correctly
- [ ] All 11 roles seeded
- [ ] Permissions seeded

### Server Actions
- [ ] signUpAction creates auth + profile + role
- [ ] signUpAction creates org for user
- [ ] signInAction validates + redirects
- [ ] signOutAction clears session
- [ ] getCurrentUserAction returns user with roles
- [ ] listUsersAction returns paginated users
- [ ] createUserAction works (admin)
- [ ] updateUserAction works
- [ ] deactivateUserAction soft deletes
- [ ] assignRoleAction assigns role
- [ ] hasPermissionAction checks correctly

### UI
- [ ] Login form uses signInAction
- [ ] Signup forms use signUpAction
- [ ] UserManagement uses real data
- [ ] Loading states on all forms
- [ ] Error toast on failures
- [ ] Success toast on actions
- [ ] Role badges display correctly

### Middleware
- [ ] Protected routes require auth
- [ ] Admin routes require admin role
- [ ] Expired sessions handled

### E2E Tests
- [ ] All 13 test scenarios passing

---

## Completion Criteria

Before moving to `/rollout/02-admin`:

1. All checklist items checked
2. E2E tests passing: `pnpm playwright test tests/e2e/auth-workflows.spec.ts`
3. Manual verification: Login as each test user and verify redirect

---

## Next Step

When complete, run:
```
Execute /rollout/02-admin
```
