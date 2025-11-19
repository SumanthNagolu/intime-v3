-- ============================================================================
-- Rollback Migration: 006_rls_policies_rollback
-- Description: Remove all RLS policies and helper functions
-- Created: 2025-11-18
-- ============================================================================

-- Drop validation views
DROP VIEW IF EXISTS v_rls_status CASCADE;
DROP VIEW IF EXISTS v_rls_policies CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS test_rls_as_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_is_admin() CASCADE;
DROP FUNCTION IF EXISTS user_has_any_role(TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS user_has_role(TEXT) CASCADE;
DROP FUNCTION IF EXISTS auth_user_id() CASCADE;

-- Disable RLS on all tables
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log_retention_policy DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_delivery_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS session_metadata DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

RAISE NOTICE 'RLS policies rollback completed!';
