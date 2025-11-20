# 🚀 InTime v3 - Complete Migration Guide

## ⚠️ IMPORTANT: Read This First

This guide provides step-by-step instructions to run database migrations **manually in Supabase Dashboard** since the web UI has a CSS build issue that needs to be resolved.

---

## 📋 Prerequisites

- [ ] Supabase project created
- [ ] Database connection working
- [ ] `.env.local` configured with Supabase credentials

---

## 🔐 Step 1: Bootstrap (ONE-TIME ONLY)

**Purpose:** Create RPC functions to enable automated migrations

### Instructions:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. **Copy and paste the entire content of `BOOTSTRAP.sql`**
4. Click **Run** (green play button)
5. Verify success message appears

### What This Does:

- Creates `exec_migration()` function
- Creates `exec_sql()` function
- Grants permissions to service_role

### Expected Output:

```
function_name    | definition
-----------------|------------------
exec_migration   | CREATE OR REPLACE FUNCTION...
exec_sql         | CREATE OR REPLACE FUNCTION...
```

---

## 📦 Step 2: Run All Migrations

**Choose ONE of the following approaches:**

### Option A: All-in-One (RECOMMENDED - Fastest)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. **Copy and paste the entire content of `ALL-MIGRATIONS.sql`** (3,327 lines)
4. Click **Run**
5. ⏳ Wait 30-60 seconds for completion
6. Verify success messages appear

✅ **Advantages:**
- Single execution
- Atomic (all-or-nothing)
- Fastest approach

⚠️ **Potential Issues:**
- Query timeout if Supabase has execution time limits
- Hard to debug if one migration fails

---

### Option B: Individual Migrations (SAFEST)

Run these files **in order**, one at a time:

```sql
-- 1. Timeline tables (development logging)
src/lib/db/migrations/001_create_timeline_tables.sql

-- 2. User profiles (core user table)
src/lib/db/migrations/002_create_user_profiles.sql

-- 3. RBAC system (roles, permissions)
src/lib/db/migrations/003_create_rbac_system.sql

-- 4. Audit logging
src/lib/db/migrations/004_create_audit_tables.sql

-- 5. Event bus
src/lib/db/migrations/005_create_event_bus.sql

-- 6. Row Level Security policies
src/lib/db/migrations/006_rls_policies.sql

-- 7. Multi-tenancy (organizations)
src/lib/db/migrations/007_add_multi_tenancy.sql
```

**Instructions for each file:**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the content of the migration file
4. Click **Run**
5. Wait for success message
6. Proceed to next file

✅ **Advantages:**
- Easy to debug
- Can skip timeline tables if not needed
- Clear progress tracking

⚠️ **Disadvantages:**
- More manual steps
- Takes longer

---

## ✅ Step 3: Verify Migrations

Run this query in Supabase SQL Editor to verify all tables were created:

```sql
-- Check if all critical tables exist
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
    'events',
    'event_subscriptions',
    'organizations',
    'project_timeline',
    'session_metadata'
  )
ORDER BY table_name;
```

### Expected Result:

You should see **11 tables**:

| table_name             | column_count |
|------------------------|--------------|
| audit_logs             | 12           |
| audit_log_retention_policy | 6       |
| event_delivery_log     | 8            |
| event_subscriptions    | 10           |
| events                 | 14           |
| organizations          | 14           |
| permissions            | 9            |
| project_timeline       | 24           |
| role_permissions       | 4            |
| roles                  | 11           |
| session_metadata       | 15           |
| user_profiles          | 45           |
| user_roles             | 7            |

---

## 🔒 Step 4: Verify RLS (Row Level Security)

Run this query to ensure RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
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

### Expected Result:

All tables should show `rls_enabled = true` ✅

---

## 🌱 Step 5: Seed Roles (Essential Data)

Run this SQL to insert the system roles:

```sql
-- Insert core system roles
INSERT INTO roles (name, display_name, description, is_system_role, hierarchy_level, color_code) VALUES
  ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 0, '#dc2626'),
  ('admin', 'Administrator', 'Administrative access to manage users and settings', TRUE, 1, '#ea580c'),
  ('recruiter', 'Recruiter', 'Manages candidates, placements, and client relationships', TRUE, 2, '#0891b2'),
  ('trainer', 'Trainer', 'Manages training courses and student progress', TRUE, 2, '#7c3aed'),
  ('student', 'Student', 'Enrolled in training academy courses', TRUE, 3, '#2563eb'),
  ('candidate', 'Candidate', 'Job seeker available for placement', TRUE, 3, '#16a34a'),
  ('employee', 'Employee', 'Internal team member', TRUE, 3, '#4f46e5'),
  ('client', 'Client', 'Hiring company representative', TRUE, 3, '#9333ea')
ON CONFLICT (name) DO NOTHING;
```

### Verify Roles Were Created:

```sql
SELECT name, display_name, hierarchy_level 
FROM roles 
WHERE is_system_role = TRUE 
ORDER BY hierarchy_level, name;
```

### Expected Result:

8 system roles created ✅

---

## 🧪 Step 6: Test Database Connectivity

Create a test user profile to verify everything works:

```sql
-- Test: Insert a user profile
INSERT INTO user_profiles (
  email,
  full_name,
  is_active
) VALUES (
  'test@intimesolutions.com',
  'Test User',
  TRUE
) RETURNING id, email, full_name, created_at;
```

### Expected Result:

- User created successfully ✅
- Returns UUID, email, full_name, timestamp

---

## 🎯 Success Checklist

After completing all steps, you should have:

- ✅ Bootstrap functions created
- ✅ 11+ database tables created
- ✅ 8 system roles seeded
- ✅ RLS enabled on all critical tables
- ✅ 40+ permissions defined
- ✅ Test user profile created

---

## 🐛 Troubleshooting

### Issue: "function exec_migration does not exist"

**Solution:** Run `BOOTSTRAP.sql` first (Step 1)

---

### Issue: "relation 'roles' does not exist"

**Solution:** Run migrations 002 and 003 before attempting role operations

---

### Issue: "permission denied for table user_profiles"

**Solution:** 
1. Check if RLS is enabled: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_profiles';`
2. If TRUE, you need to use service_role key or disable RLS temporarily for testing:

```sql
-- TEMPORARY: Disable RLS for testing (DO NOT USE IN PRODUCTION)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

---

### Issue: "Query timeout"

**Solution:** 
- Use Option B (individual migrations) instead of ALL-MIGRATIONS.sql
- Or increase timeout in Supabase settings

---

### Issue: "syntax error at or near..."

**Solution:**
- Check which migration file caused the error
- Copy the error message
- Review the specific SQL file for syntax issues
- Common causes:
  - Missing semicolons
  - Unclosed string literals
  - Invalid function syntax

---

## 🔄 Rollback (if needed)

If migrations fail and you need to start fresh:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS audit_log_retention_policy CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_subscriptions CASCADE;
DROP TABLE IF EXISTS event_delivery_log CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS project_timeline CASCADE;
DROP TABLE IF EXISTS session_metadata CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS exec_migration(TEXT);
DROP FUNCTION IF EXISTS exec_sql(TEXT);
DROP FUNCTION IF EXISTS auth_user_id();
DROP FUNCTION IF EXISTS user_has_role(TEXT);
DROP FUNCTION IF EXISTS user_has_any_role(TEXT[]);
DROP FUNCTION IF EXISTS user_is_admin();
DROP FUNCTION IF EXISTS user_has_permission(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_permissions(UUID);
DROP FUNCTION IF EXISTS grant_role_to_user(UUID, TEXT, UUID, BOOLEAN, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS revoke_role_from_user(UUID, TEXT);

-- Then re-run migrations from Step 1
```

---

## 📞 Next Steps After Migrations

Once all migrations are successful:

1. **Test Authentication:** Visit `/signup` and create a test account
2. **Verify Role Assignment:** Check if user was assigned default role
3. **Test Dashboard:** Login and visit `/dashboard`
4. **Check Audit Logs:** Verify audit_logs table has entries

---

## 🎉 Completion

Migrations complete! You now have:

✅ Fully structured database with 11+ tables
✅ RBAC system with 8 roles and 40+ permissions
✅ Audit logging with automated triggers
✅ Event bus for cross-module communication
✅ Row Level Security enabled on all tables
✅ Multi-tenancy support ready

**Estimated Time:** 5-15 minutes (depending on chosen approach)

---

## 📚 Additional Resources

- **Database Schema:** `docs/architecture/DATABASE-SCHEMA.md`
- **Migration Details:** `src/lib/db/migrations/README.md`
- **Troubleshooting:** `AUTOMATED-MIGRATION-GUIDE.md`
- **Project Structure:** `PROJECT-STRUCTURE.md`

---

Last Updated: 2025-11-19
Status: Ready for Production ✅

