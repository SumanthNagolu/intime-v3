# 🔐 Component 1: Authentication & Access Control

## Starting Prompt for Claude Code

Copy and paste this prompt to start the Authentication & Access Control sprint:

---

```
@workflow Execute Full Production Rollout for Authentication & Access Control

## Context
This is the foundation component for InTime v3. All other features depend on proper authentication and role-based access control working correctly.

## Current State Analysis Required

### 1. DATABASE AUDIT

**Files to analyze:**
- `src/lib/db/schema/user-profiles.ts` - User data model
- `src/lib/db/schema/rbac.ts` - Roles, permissions, user_roles, role_permissions
- `src/lib/db/schema/organizations.ts` - Multi-tenancy organization model
- `src/lib/db/migrations/*.sql` - Applied migrations

**Questions to answer:**
1. Do all tables have RLS enabled?
2. Are RLS policies properly configured for multi-tenancy?
3. Do we have proper indexes on user_profiles.auth_id, user_profiles.org_id?
4. Are audit fields complete (created_at, updated_at, created_by, deleted_at)?
5. Is the roles table seeded with: super_admin, admin, recruiter, bench_sales, trainer, student, employee, candidate, client, hr_manager?

### 2. SERVER ACTIONS AUDIT

**Files to analyze:**
- `src/app/actions/auth.ts` - Current auth actions
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/admin.ts` - Admin client
- `src/middleware.ts` - Auth middleware

**Questions to answer:**
1. Does signUpAction create user profile AND assign role correctly?
2. Does signInAction redirect to role-appropriate dashboard?
3. Is there a `getCurrentUser()` helper that fetches user with roles?
4. Is there `checkPermission(userId, resource, action)` helper?
5. Do we have admin actions for: createUser, updateUser, deactivateUser, assignRole?

### 3. UI COMPONENT AUDIT

**Pages to analyze:**
- `src/app/login/page.tsx` - Login page
- `src/app/auth/*/page.tsx` - Signup pages (academy, client, employee, talent)
- `src/app/employee/admin/dashboard/page.tsx` - Admin console
- `src/components/admin/UserManagement.tsx` - User management UI

**Questions to answer:**
1. Is the login form wired to signInAction or mock?
2. Are signup forms wired to signUpAction or mock?
3. Does UserManagement.tsx use real data or mock data?
4. Is there role-based navigation (different dashboards for different roles)?
5. Are there loading states, error handling, toast notifications?

### 4. MIDDLEWARE AUDIT

**File to analyze:**
- `src/middleware.ts`

**Questions to answer:**
1. Are protected routes properly guarded?
2. Is role-based route protection implemented?
3. Does it handle expired sessions gracefully?

## Deliverables

### Phase 1: Gap Analysis Document
Create a markdown document listing:
- Current state of each area
- Gaps identified
- Priority of fixes (Critical/High/Medium/Low)

### Phase 2: Database Fixes
1. Migration to add any missing RLS policies
2. Seed data for roles and permissions
3. Verify org isolation works

### Phase 3: Server Action Implementation/Fixes

Implement or fix these server actions in `src/app/actions/auth.ts`:

```typescript
// Must have:
signUpAction(input) - Create auth user, profile, assign role
signInAction(input) - Sign in, redirect based on role
signOutAction() - Sign out, redirect to login
getCurrentUser() - Get current user with roles and permissions

// Admin actions (new file: src/app/actions/admin-users.ts):
createUserAction(input) - Admin creates user with role
updateUserAction(userId, input) - Admin updates user
deactivateUserAction(userId) - Soft delete user
reactivateUserAction(userId) - Restore user
assignRoleAction(userId, roleId) - Assign role to user
removeRoleAction(userId, roleId) - Remove role from user
listUsersAction(filters) - List users with pagination
getUserAction(userId) - Get single user details

// Permission helpers:
hasPermission(userId, resource, action) - Check if user can do action
getUserPermissions(userId) - Get all permissions for user
```

### Phase 4: UI Integration

1. Wire UserManagement.tsx to real admin actions
2. Add proper form validation
3. Add loading states
4. Add toast notifications for success/error
5. Ensure role display is correct

### Phase 5: E2E Tests

Create `tests/e2e/auth-workflows.spec.ts`:

```typescript
// Test scenarios required:
1. User can sign up with valid credentials → redirected to appropriate dashboard
2. User cannot sign up with invalid email → validation error shown
3. User cannot sign up with weak password → validation error shown
4. User can sign in with correct credentials → redirected to dashboard
5. User cannot sign in with wrong password → error message shown
6. User can sign out → redirected to login
7. Signed out user cannot access protected routes → redirected to login
8. Admin can create new user → user appears in list
9. Admin can assign role to user → role displayed
10. Admin can deactivate user → user marked inactive
11. Non-admin cannot access admin pages → access denied or redirect
12. User from Org A cannot see Org B data → data isolation verified
13. Role-specific dashboard routing works → recruiter goes to recruiting, etc.
```

### Phase 6: Verification Checklist

Complete this checklist before moving to next component:

```markdown
## Auth & Access Control - Production Readiness

### Database
- [ ] user_profiles has RLS enabled
- [ ] roles has RLS enabled
- [ ] permissions has RLS enabled
- [ ] user_roles has RLS enabled
- [ ] role_permissions has RLS enabled
- [ ] organizations has RLS enabled
- [ ] RLS policies filter by org_id correctly
- [ ] Roles are seeded (super_admin, admin, recruiter, bench_sales, trainer, student, employee, candidate, client, hr_manager)
- [ ] Default permissions are seeded

### Server Actions
- [ ] signUpAction creates auth user
- [ ] signUpAction creates user_profile
- [ ] signUpAction assigns requested role
- [ ] signUpAction creates organization for user
- [ ] signInAction validates credentials
- [ ] signInAction redirects by role
- [ ] signOutAction clears session
- [ ] getCurrentUser returns user with roles
- [ ] Admin can create/update/deactivate users
- [ ] Role assignment works

### UI
- [ ] Login form uses signInAction
- [ ] Signup forms use signUpAction
- [ ] UserManagement uses real data
- [ ] Loading states implemented
- [ ] Error handling with user-friendly messages
- [ ] Toast notifications for actions
- [ ] Role badges display correctly

### Middleware
- [ ] Protected routes require auth
- [ ] Admin routes require admin role
- [ ] Expired sessions handled

### E2E Tests
- [ ] All 13 test scenarios passing
- [ ] Multi-tenancy isolation verified
- [ ] Role-based routing verified
```

## Start Command

Begin with:

```
Read and analyze these files in order, then create a comprehensive gap analysis:

1. src/lib/db/schema/user-profiles.ts
2. src/lib/db/schema/rbac.ts
3. src/lib/db/schema/organizations.ts
4. src/app/actions/auth.ts
5. src/middleware.ts
6. src/app/login/page.tsx
7. src/components/admin/UserManagement.tsx
8. src/components/admin/AdminDashboard.tsx

For each file:
- Summarize current functionality
- Identify gaps vs production requirements
- Rate gap severity (Critical/High/Medium/Low)

Then create action plan with prioritized fixes.
```
```

---

## Existing Test Users (Already in Supabase)

| Role | Email | Password |
|------|-------|----------|
| CEO / Super Admin | ceo@intime.com | TestPass123! |
| Admin | admin@intime.com | TestPass123! |
| HR Manager | hr_admin@intime.com | TestPass123! |
| Recruiter | jr_rec@intime.com | TestPass123! |
| Bench Sales | jr_bs@intime.com | TestPass123! |
| Talent Acquisition | jr_ta@intime.com | TestPass123! |
| Trainer | trainer@intime.com | TestPass123! |
| Student | student@intime.com | TestPass123! |

**Note:** Users already exist in Supabase Auth. Run `pnpm tsx scripts/seed-test-users.ts` to assign roles and permissions.

---

## Expected Workflow Duration

| Phase | Estimated Time |
|-------|----------------|
| Analysis | 20 minutes |
| Database Fixes | 30 minutes |
| Server Actions | 45 minutes |
| UI Integration | 45 minutes |
| E2E Tests | 60 minutes |
| Verification | 15 minutes |
| **Total** | **~3.5 hours** |

---

## Key Files Reference

### Database Schema
```
src/lib/db/schema/
├── user-profiles.ts    # User table with role-specific fields
├── rbac.ts             # roles, permissions, user_roles, role_permissions
├── organizations.ts    # Multi-tenant organizations
└── audit.ts            # Audit logging
```

### Server Actions
```
src/app/actions/
├── auth.ts             # Current auth actions (needs expansion)
└── admin-users.ts      # TO CREATE: Admin user management
```

### UI Components
```
src/components/admin/
├── AdminDashboard.tsx  # Main admin console
├── UserManagement.tsx  # User CRUD UI
├── Permissions.tsx     # Permission management
└── AuditLogs.tsx       # Audit log viewer
```

### Pages
```
src/app/
├── login/page.tsx      # Login page
├── auth/
│   ├── academy/page.tsx
│   ├── client/page.tsx
│   ├── employee/page.tsx
│   └── talent/page.tsx
└── employee/admin/
    └── dashboard/page.tsx
```

---

## Critical Success Criteria

1. **Zero mock data** in user management - all real database operations
2. **RLS working** - user from Org A cannot query Org B data even via direct DB access
3. **Role-based routing** - each role goes to appropriate dashboard after login
4. **Proper error handling** - validation errors, auth errors shown to user
5. **Audit trail** - all user mutations logged to audit_logs
6. **E2E tests passing** - all 13 scenarios green

---

## Common Issues to Watch For

1. **Missing RLS policies** - Tables accessible without auth
2. **Hardcoded org_id** - Should come from user's profile, not URL
3. **Missing role seeding** - Roles table empty after migration
4. **Toast not showing** - Sonner/toast not properly configured
5. **Session not persisting** - Supabase client not configured correctly
6. **Middleware not running** - matcher pattern incorrect

---

## After Completion

Once all checklist items are verified:

1. Run full E2E test suite: `pnpm playwright test tests/e2e/auth-workflows.spec.ts`
2. Document any remaining known issues
3. Move to Component 2: Admin Console

```
@workflow Proceed to Component 2: Admin Console
```

