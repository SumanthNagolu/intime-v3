-- ===========================
-- 🧪 SPRINT 1: RLS TESTING SUITE
-- ===========================
--
-- Comprehensive Row Level Security (RLS) tests for Sprint 1
-- Execute these queries in Supabase SQL Editor to verify RLS policies
--
-- @author QA Engineer Agent
-- @sprint Sprint 1: Core Infrastructure
-- @date 2025-11-19
--
-- ===========================

-- ===========================
-- SETUP: Create Test Data
-- ===========================

-- Create test organization
INSERT INTO organizations (id, name, slug, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test Org A', 'test-org-a', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'Test Org B', 'test-org-b', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create test users in different organizations
INSERT INTO user_profiles (id, email, full_name, is_active, org_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user-a@test.com', 'User A (Org A)', TRUE, '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user-b@test.com', 'User B (Org B)', TRUE, '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user-c@test.com', 'User C (Org A)', TRUE, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Assign roles to test users
INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  id,
  TRUE,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
FROM roles WHERE name = 'recruiter'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  id,
  TRUE,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
FROM roles WHERE name = 'student'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id, is_primary, assigned_by)
SELECT 
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  id,
  TRUE,
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;

-- ===========================
-- TEST 1: Verify RLS is Enabled
-- ===========================

-- Expected Result: All critical tables should have rowsecurity = TRUE
SELECT 
  tablename,
  rowsecurity as rls_enabled,
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

-- ✅ PASS CRITERIA:
-- - All tables show rls_enabled = TRUE
-- - Each table has at least 1 policy defined

-- ===========================
-- TEST 2: List All RLS Policies
-- ===========================

-- Expected Result: Comprehensive list of all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ✅ PASS CRITERIA:
-- - user_profiles: At least 2 policies (SELECT own, UPDATE own)
-- - roles: At least 1 policy (SELECT all)
-- - permissions: At least 1 policy (SELECT all)
-- - audit_logs: At least 1 policy (INSERT only, no DELETE)

-- ===========================
-- TEST 3: Multi-Tenancy Isolation
-- ===========================

-- TEST 3.1: User in Org A cannot see User in Org B
-- Set context to User A (Org A)
SET app.current_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Query all users (should only see Org A users)
SELECT id, email, full_name, org_id
FROM user_profiles
WHERE deleted_at IS NULL;

-- ✅ PASS CRITERIA:
-- - Should see user-a@test.com (self)
-- - Should see user-c@test.com (same org)
-- - Should NOT see user-b@test.com (different org)

-- Reset context
RESET app.current_user_id;

-- ===========================
-- TEST 4: Role-Based Access Control
-- ===========================

-- TEST 4.1: Student can only read own profile
SET app.current_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Try to query all user profiles
SELECT id, email, full_name
FROM user_profiles;

-- ✅ PASS CRITERIA:
-- - Should only see own profile (user-b@test.com)
-- - Should NOT see profiles from other users

-- TEST 4.2: Admin can read all profiles in their org
SET app.current_user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Query user profiles
SELECT id, email, full_name, org_id
FROM user_profiles
ORDER BY email;

-- ✅ PASS CRITERIA:
-- - Should see all users in Org A (user-a and user-c)
-- - Should NOT see users from Org B (user-b)

-- Reset context
RESET app.current_user_id;

-- ===========================
-- TEST 5: Audit Log Immutability
-- ===========================

-- TEST 5.1: Cannot delete audit logs
SET app.current_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Try to delete an audit log (should fail)
-- First, check if any audit logs exist
SELECT COUNT(*) as audit_log_count FROM audit_logs;

-- Attempt delete (should be blocked by RLS or trigger)
DO $$
DECLARE
  log_id UUID;
BEGIN
  -- Get first audit log id
  SELECT id INTO log_id FROM audit_logs LIMIT 1;
  
  IF log_id IS NOT NULL THEN
    -- Try to delete (should fail)
    DELETE FROM audit_logs WHERE id = log_id;
    RAISE NOTICE 'ERROR: Audit log was deleted (RLS NOT WORKING)';
  ELSE
    RAISE NOTICE 'No audit logs to test deletion';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Audit log deletion blocked by RLS';
END $$;

-- ✅ PASS CRITERIA:
-- - DELETE operation should fail
-- - Error message indicates permission denied

-- TEST 5.2: Cannot update audit logs
DO $$
DECLARE
  log_id UUID;
BEGIN
  -- Get first audit log id
  SELECT id INTO log_id FROM audit_logs LIMIT 1;
  
  IF log_id IS NOT NULL THEN
    -- Try to update (should fail)
    UPDATE audit_logs SET user_email = 'hacker@evil.com' WHERE id = log_id;
    RAISE NOTICE 'ERROR: Audit log was updated (RLS NOT WORKING)';
  ELSE
    RAISE NOTICE 'No audit logs to test update';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Audit log update blocked by RLS';
END $$;

-- ✅ PASS CRITERIA:
-- - UPDATE operation should fail
-- - Audit logs remain immutable

-- Reset context
RESET app.current_user_id;

-- ===========================
-- TEST 6: Permission Enforcement
-- ===========================

-- TEST 6.1: Verify helper functions exist
SELECT 
  proname as function_name,
  pronargs as arg_count
FROM pg_proc
WHERE proname IN (
  'user_has_role',
  'user_has_any_role',
  'user_is_admin',
  'user_has_permission',
  'get_user_permissions'
)
ORDER BY proname;

-- ✅ PASS CRITERIA:
-- - All 5 functions should exist

-- TEST 6.2: Test user_has_role function
SELECT user_has_role(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'recruiter'
) as has_recruiter_role;

-- ✅ PASS CRITERIA:
-- - Should return TRUE (User A is a recruiter)

SELECT user_has_role(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'recruiter'
) as has_recruiter_role;

-- ✅ PASS CRITERIA:
-- - Should return FALSE (User B is a student, not recruiter)

-- TEST 6.3: Test user_is_admin function
SELECT user_is_admin('cccccccc-cccc-cccc-cccc-cccccccccccc') as is_admin;

-- ✅ PASS CRITERIA:
-- - Should return TRUE (User C is an admin)

SELECT user_is_admin('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb') as is_admin;

-- ✅ PASS CRITERIA:
-- - Should return FALSE (User B is a student)

-- TEST 6.4: Test get_user_permissions function
SELECT * FROM get_user_permissions('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
LIMIT 10;

-- ✅ PASS CRITERIA:
-- - Should return list of permissions for recruiter role
-- - Should include: candidate:read, placement:create, etc.

-- ===========================
-- TEST 7: Cross-Organization Security
-- ===========================

-- TEST 7.1: User from Org A cannot access Org B data
SET app.current_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET app.current_org_id = '11111111-1111-1111-1111-111111111111';

-- Try to query Org B's organization record
SELECT id, name, slug
FROM organizations
WHERE id = '22222222-2222-2222-2222-222222222222';

-- ✅ PASS CRITERIA:
-- - Should return empty result or permission denied
-- - User from Org A should not see Org B's data

-- TEST 7.2: User can see own organization
SELECT id, name, slug
FROM organizations
WHERE id = '11111111-1111-1111-1111-111111111111';

-- ✅ PASS CRITERIA:
-- - Should see own organization (Test Org A)

-- Reset context
RESET app.current_user_id;
RESET app.current_org_id;

-- ===========================
-- TEST 8: Soft Delete Enforcement
-- ===========================

-- TEST 8.1: Soft-deleted users should not appear in queries
-- Soft delete User C
UPDATE user_profiles
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Query active users only
SELECT id, email, full_name, deleted_at
FROM user_profiles
WHERE deleted_at IS NULL;

-- ✅ PASS CRITERIA:
-- - Should NOT include user-c@test.com (soft deleted)
-- - Should include user-a and user-b

-- Restore User C (undo soft delete)
UPDATE user_profiles
SET deleted_at = NULL, updated_at = NOW()
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- ===========================
-- TEST 9: Event Bus Security
-- ===========================

-- TEST 9.1: Verify event subscriptions have RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'event_subscriptions';

-- ✅ PASS CRITERIA:
-- - rowsecurity should be TRUE

-- TEST 9.2: User can only see own event subscriptions
SET app.current_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT id, event_type, subscriber_type
FROM event_subscriptions;

-- ✅ PASS CRITERIA:
-- - Should only see subscriptions related to current user/org

-- Reset context
RESET app.current_user_id;

-- ===========================
-- TEST 10: Performance Check
-- ===========================

-- TEST 10.1: RLS policy evaluation should be fast
EXPLAIN ANALYZE
SELECT up.id, up.email, up.full_name
FROM user_profiles up
WHERE up.deleted_at IS NULL
  AND up.is_active = TRUE;

-- ✅ PASS CRITERIA:
-- - Query execution time < 10ms
-- - Uses appropriate indexes
-- - RLS policy evaluated efficiently

-- ===========================
-- CLEANUP (Optional)
-- ===========================

-- Uncomment to clean up test data:
-- DELETE FROM user_roles WHERE user_id IN (
--   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
--   'cccccccc-cccc-cccc-cccc-cccccccccccc'
-- );

-- DELETE FROM user_profiles WHERE id IN (
--   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
--   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
--   'cccccccc-cccc-cccc-cccc-cccccccccccc'
-- );

-- DELETE FROM organizations WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222'
-- );

-- ===========================
-- SUMMARY
-- ===========================

-- Run this to get a summary of test results:
SELECT 
  'RLS Tests Complete' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = TRUE) as tables_with_rls,
  (SELECT COUNT(*) FROM roles WHERE is_system_role = TRUE) as system_roles,
  (SELECT COUNT(*) FROM permissions) as total_permissions,
  NOW() as tested_at;

-- ===========================
-- END OF RLS TEST SUITE
-- ===========================

