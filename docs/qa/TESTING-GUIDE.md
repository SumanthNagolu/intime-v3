# 🧪 InTime v3 - Testing & Verification Guide

**Sprint 1 Foundation - Complete Testing Protocol**

---

## 📋 Overview

This guide provides comprehensive testing procedures for Sprint 1 foundation work:

1. Database migrations
2. Authentication system
3. Role-based access control (RBAC)
4. Row Level Security (RLS)
5. Audit logging
6. User flows

---

## ✅ Pre-Testing Checklist

Before running any tests, ensure:

- [ ] Supabase project is created
- [ ] Database migrations have been run successfully
- [ ] Environment variables are configured (`.env.local`)
- [ ] Development server can start (`npm run dev`)

---

## 🗄️ Part 1: Database Verification

### Test 1.1: Check All Tables Exist

Run this query in Supabase SQL Editor:

```sql
-- Verify all tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'audit_logs',
    'audit_log_retention_policy',
    'events',
    'event_subscriptions',
    'event_delivery_log',
    'organizations',
    'project_timeline',
    'session_metadata'
  )
ORDER BY table_name;
```

**Expected Result:**
- ✅ 13 tables listed
- ✅ Each table has expected column count (see schema docs)

**If test fails:**
- Tables missing → Re-run missing migration files
- Wrong column count → Check migration file for errors

---

### Test 1.2: Verify RLS is Enabled

```sql
-- Check Row Level Security status
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles',
    'roles',
    'permissions',
    'user_roles',
    'role_permissions',
    'audit_logs',
    'events',
    'organizations'
  )
ORDER BY tablename;
```

**Expected Result:**
- ✅ All tables show `rls_enabled = true`
- ✅ Each table has 2+ policies defined

**If test fails:**
- RLS not enabled → Run migration 006_rls_policies.sql
- No policies → Check policy creation syntax

---

### Test 1.3: Verify System Roles Exist

```sql
-- Check system roles were seeded
SELECT 
  name,
  display_name,
  hierarchy_level,
  is_system_role,
  color_code
FROM roles
WHERE is_system_role = TRUE
ORDER BY hierarchy_level, name;
```

**Expected Result:**
- ✅ 8 system roles:
  - super_admin (level 0)
  - admin (level 1)
  - recruiter, trainer, bench_sales, hr_manager (level 2)
  - student, employee, candidate, client (level 3)

**If test fails:**
- No roles → Run seed script: `scripts/seed-roles.ts` OR manually insert via SQL

---

### Test 1.4: Verify Permissions Exist

```sql
-- Check permissions were created
SELECT 
  resource,
  action,
  scope,
  display_name,
  is_dangerous
FROM permissions
WHERE deleted_at IS NULL
ORDER BY resource, action, scope;
```

**Expected Result:**
- ✅ 40+ permissions covering:
  - user (create, read, update, delete, manage)
  - candidate (create, read, update, delete, export)
  - placement (create, read, update, approve, reject)
  - course (create, read, update, delete, manage)
  - timesheet (create, read, approve, reject)
  - system (read, manage)
  - audit (read)
  - report (export)

**If test fails:**
- No permissions → Migration 003 failed, re-run it

---

### Test 1.5: Verify Role-Permission Mappings

```sql
-- Check role-permission associations
SELECT 
  r.name AS role_name,
  COUNT(rp.permission_id) AS permission_count,
  STRING_AGG(DISTINCT p.resource, ', ' ORDER BY p.resource) AS resources_accessible
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.is_system_role = TRUE
GROUP BY r.name, r.hierarchy_level
ORDER BY r.hierarchy_level, r.name;
```

**Expected Result:**
- ✅ super_admin: 40+ permissions (all resources)
- ✅ admin: 30+ permissions (most resources except system)
- ✅ recruiter: 10+ permissions (candidate, placement, user)
- ✅ trainer: 5+ permissions (course, user)
- ✅ student: 3+ permissions (course read, own profile)
- ✅ candidate: 2+ permissions (own profile only)

**If test fails:**
- Wrong permission counts → Check migration 003 seed data section

---

### Test 1.6: Verify Helper Functions Exist

```sql
-- Check RLS and RBAC helper functions
SELECT 
  proname AS function_name,
  pronargs AS arg_count,
  prorettype::regtype AS return_type
FROM pg_proc
WHERE proname IN (
  'auth_user_id',
  'user_has_role',
  'user_has_any_role',
  'user_is_admin',
  'user_has_permission',
  'get_user_permissions',
  'grant_role_to_user',
  'revoke_role_from_user',
  'exec_migration',
  'exec_sql'
)
ORDER BY proname;
```

**Expected Result:**
- ✅ 10 functions created
- ✅ All return expected types (boolean, void, TABLE)

**If test fails:**
- Functions missing → Re-run migrations 003 and 006
- exec_migration missing → Run BOOTSTRAP.sql

---

## 🔐 Part 2: Authentication System Testing

### Test 2.1: Create Test User (Manual Signup)

**Prerequisites:**
- Development server running (`npm run dev`)
- Navigate to: http://localhost:3000/signup

**Test Steps:**

1. Fill out signup form:
   - Full Name: Test User
   - Email: test@intimesolutions.com
   - Phone: +1234567890
   - Password: Test@123456
   - Role: Recruiter

2. Click "Sign Up"

3. Check for success message

4. Check email for verification link (Supabase sends automatically)

**Expected Result:**
- ✅ Form submits successfully
- ✅ Success message displayed
- ✅ Email verification reminder shown
- ✅ No error messages

**If test fails:**
- "Email already exists" → Use different email
- "Invalid credentials" → Check Supabase auth settings
- Form validation errors → Fix input values
- Server error → Check console for details

---

### Test 2.2: Verify User Profile Created

After signup, run this query in Supabase:

```sql
-- Check if user profile was created
SELECT 
  id,
  email,
  full_name,
  phone,
  is_active,
  created_at
FROM user_profiles
WHERE email = 'test@intimesolutions.com';
```

**Expected Result:**
- ✅ 1 row returned
- ✅ `is_active = true`
- ✅ `created_at` is recent timestamp
- ✅ All fields populated correctly

**If test fails:**
- No row → Server action failed, check `src/app/actions/auth.ts`
- Missing fields → Check signup form submission

---

### Test 2.3: Verify Role Assignment

```sql
-- Check if role was assigned during signup
SELECT 
  up.email,
  up.full_name,
  r.name AS role_name,
  r.display_name,
  ur.is_primary,
  ur.assigned_at
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email = 'test@intimesolutions.com';
```

**Expected Result:**
- ✅ 1 row returned
- ✅ `role_name = 'recruiter'` (or whatever was selected)
- ✅ `is_primary = true`
- ✅ `assigned_at` is recent timestamp

**If test fails:**
- No role assigned → Check `src/app/actions/auth.ts` signup function
- Wrong role → Verify role selection in form
- is_primary = false → Check signup logic

---

### Test 2.4: Verify Audit Log Entry

```sql
-- Check if signup was logged
SELECT 
  table_name,
  operation,
  user_id,
  changes,
  created_at
FROM audit_logs
WHERE user_email = 'test@intimesolutions.com'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- ✅ 2-3 entries:
  1. user_profiles INSERT
  2. user_roles INSERT
  3. Possibly auth event

**If test fails:**
- No audit logs → Check triggers on user_profiles table
- Missing data → Verify audit_logs table structure

---

### Test 2.5: Login Test

**Test Steps:**

1. Navigate to: http://localhost:3000/login
2. Enter credentials:
   - Email: test@intimesolutions.com
   - Password: Test@123456
3. Click "Sign In"

**Expected Result:**
- ✅ Redirected to `/dashboard`
- ✅ User profile displayed
- ✅ Role shown on dashboard
- ✅ No error messages

**If test fails:**
- "Invalid credentials" → Check password
- "Email not confirmed" → Confirm email in Supabase dashboard
- Redirect fails → Check middleware.ts

---

### Test 2.6: Protected Route Test

**Test Steps:**

1. Logout if logged in
2. Try to access: http://localhost:3000/dashboard
3. Verify redirect to login

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ Cannot access dashboard while logged out

**If test fails:**
- Dashboard accessible → Check middleware.ts
- No redirect → Verify auth guards

---

## 🔒 Part 3: Row Level Security (RLS) Testing

### Test 3.1: Multi-Tenancy Isolation (CRITICAL)

**Purpose:** Verify Org A cannot see Org B data

**Test Steps:**

1. Create two test users in different organizations
2. Log in as User A
3. Try to query User B's data

**SQL Test:**

```sql
-- Test RLS: Create two users
INSERT INTO user_profiles (email, full_name, is_active) VALUES
  ('user_a@orga.com', 'User A', TRUE),
  ('user_b@orgb.com', 'User B', TRUE);

-- Assign to different orgs (once organizations table exists)
-- This test is placeholder for Epic 2 when orgs are created

-- For now, test basic RLS:
-- Set session user context
SET app.current_user_id = (SELECT id FROM user_profiles WHERE email = 'user_a@orga.com');

-- Try to query all users (should only see own profile)
SELECT email, full_name FROM user_profiles;

-- Reset
RESET app.current_user_id;
```

**Expected Result:**
- ✅ User A can only see own profile
- ✅ RLS prevents cross-user visibility

**If test fails:**
- Can see other users → RLS policies not working
- Error: "permission denied" → RLS too restrictive

---

### Test 3.2: Role-Based Access Test

**SQL Test:**

```sql
-- Test: Recruiter can view candidates
-- Assume auth.uid() returns recruiter's user_id

-- This requires actual login, so use Supabase client-side test:
```

**Client-Side Test (in browser console on /dashboard):**

```javascript
// Test: Fetch candidates (should work for recruiter)
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .not('candidate_status', 'is', null);

console.log('Candidates:', data);
console.log('Error:', error);
```

**Expected Result:**
- ✅ Recruiter can fetch candidates
- ✅ Student cannot fetch candidates (permission denied)

---

## 📊 Part 4: Audit Logging Testing

### Test 4.1: Verify Audit Trail for Updates

**Test Steps:**

1. Login to dashboard
2. Update user profile (change name or phone)
3. Check audit logs

**SQL Verification:**

```sql
-- Check recent audit logs for your user
SELECT 
  table_name,
  operation,
  old_data,
  new_data,
  user_email,
  created_at
FROM audit_logs
WHERE user_email = 'test@intimesolutions.com'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:**
- ✅ UPDATE operation logged
- ✅ old_data shows previous values
- ✅ new_data shows new values
- ✅ Timestamp is accurate

---

## 🎯 Part 5: End-to-End User Flows

### Flow 5.1: Complete Signup → Login → Dashboard

**Steps:**

1. Visit `/signup`
2. Create new user (use unique email)
3. See success message
4. Navigate to `/login`
5. Login with credentials
6. Redirected to `/dashboard`
7. See user profile and role

**Expected Result:**
- ✅ All steps complete without errors
- ✅ User can access protected pages
- ✅ Role is displayed correctly

---

### Flow 5.2: Permission Check

**Test:** Verify users have correct permissions

**SQL Test:**

```sql
-- Get all permissions for a test user
SELECT * FROM get_user_permissions(
  (SELECT id FROM user_profiles WHERE email = 'test@intimesolutions.com')
);
```

**Expected Result:**
- ✅ Returns list of permissions
- ✅ Matches assigned role(s)

---

## 🐛 Troubleshooting

### Issue: "auth.uid() returned null"

**Cause:** Supabase auth context not set

**Solution:**
```sql
-- Use service_role key for backend operations
-- Or set context manually for testing:
SET app.current_user_id = 'YOUR_USER_UUID';
```

---

### Issue: "permission denied for table user_profiles"

**Cause:** RLS blocking query

**Solution:**
```sql
-- Check RLS policies:
SELECT * FROM v_rls_policies WHERE tablename = 'user_profiles';

-- Temporarily disable for testing (DANGER):
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing:
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

---

### Issue: "role 'recruiter' does not exist"

**Cause:** Roles not seeded

**Solution:**
- Run migration 003 again
- Or manually insert roles (see seed script)

---

## ✅ Success Criteria

All tests passed if:

- ✅ 13 database tables created
- ✅ RLS enabled on 8+ tables
- ✅ 8 system roles seeded
- ✅ 40+ permissions defined
- ✅ Signup creates user profile + assigns role
- ✅ Login redirects to dashboard
- ✅ Protected routes require auth
- ✅ Audit logs capture all operations
- ✅ RLS prevents unauthorized access
- ✅ Users have correct permissions

---

## 📈 Performance Benchmarks

Expected query performance:

| Query | Expected Time |
|-------|---------------|
| User profile lookup | < 10ms |
| Role check | < 5ms |
| Permission check | < 20ms |
| Audit log insert | < 15ms |
| RLS policy evaluation | < 10ms |

If queries are slower, check:
- Index creation (should have 50+ indexes)
- Table statistics (run `ANALYZE`)
- Query plans (`EXPLAIN ANALYZE`)

---

## 🎉 Completion

Once all tests pass:

1. Mark Sprint 1 as complete ✅
2. Document any issues found
3. Proceed to Sprint 2 (Event Bus & API)

---

**Last Updated:** 2025-11-19  
**Sprint:** 1 (Foundation)  
**Status:** Ready for Testing ✅

