-- ============================================================================
-- Cleanup Script - Remove ALL Test Users
-- Purpose: Clean slate for fresh test data
-- WARNING: This will delete ALL users and related data!
-- ============================================================================

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = 'replica';

-- Step 1: Delete all user roles assignments
DELETE FROM user_roles
WHERE user_id IN (
  SELECT id FROM user_profiles
  WHERE email LIKE '%@intime.com'
);

-- Step 2: Delete all audit logs for test users
DELETE FROM audit_logs
WHERE user_id IN (
  SELECT id FROM user_profiles
  WHERE email LIKE '%@intime.com'
);

-- Step 3: Delete all events created by test users
DELETE FROM events
WHERE created_by IN (
  SELECT id FROM user_profiles
  WHERE email LIKE '%@intime.com'
);

-- Step 4: Delete all event subscriptions for test users
DELETE FROM event_subscriptions
WHERE subscriber_id IN (
  SELECT id FROM user_profiles
  WHERE email LIKE '%@intime.com'
);

-- Step 5: Delete from academy-related tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') THEN
    DELETE FROM student_enrollments WHERE student_id IN (
      SELECT id FROM user_profiles WHERE email LIKE '%@intime.com'
    );
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_progress') THEN
    DELETE FROM student_progress WHERE student_id IN (
      SELECT id FROM user_profiles WHERE email LIKE '%@intime.com'
    );
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_attempts') THEN
    DELETE FROM quiz_attempts WHERE student_id IN (
      SELECT id FROM user_profiles WHERE email LIKE '%@intime.com'
    );
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_badges') THEN
    DELETE FROM student_badges WHERE student_id IN (
      SELECT id FROM user_profiles WHERE email LIKE '%@intime.com'
    );
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_mentor_conversations') THEN
    DELETE FROM ai_mentor_conversations WHERE student_id IN (
      SELECT id FROM user_profiles WHERE email LIKE '%@intime.com'
    );
  END IF;
END $$;

-- Step 6: Soft delete all user profiles (hard delete not allowed)
UPDATE user_profiles
SET deleted_at = NOW()
WHERE email LIKE '%@intime.com' AND deleted_at IS NULL;

-- Step 7: Clean up orphaned roles (optional - only if you want to reset roles too)
-- DELETE FROM role_permissions WHERE role_id NOT IN (SELECT id FROM roles WHERE is_system_role = true);
-- DELETE FROM roles WHERE is_system_role = false;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT
  (SELECT COUNT(*) FROM user_profiles WHERE email LIKE '%@intime.com') as remaining_users,
  (SELECT COUNT(*) FROM user_roles WHERE user_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intime.com')) as remaining_role_assignments;

-- Expected output: remaining_users = 0, remaining_role_assignments = 0
