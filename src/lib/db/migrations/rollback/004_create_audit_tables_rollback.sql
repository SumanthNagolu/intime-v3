-- ============================================================================
-- Rollback Migration: 004_create_audit_tables_rollback
-- Description: Remove audit tables, partitions, and functions
-- Created: 2025-11-18
-- ============================================================================

-- Drop views
DROP VIEW IF EXISTS v_user_activity_summary CASCADE;
DROP VIEW IF EXISTS v_audit_logs_critical CASCADE;
DROP VIEW IF EXISTS v_audit_logs_recent CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_prevent_audit_delete ON audit_logs;
DROP TRIGGER IF EXISTS trigger_prevent_audit_update ON audit_logs;
DROP TRIGGER IF EXISTS trigger_audit_role_permissions ON role_permissions;
DROP TRIGGER IF EXISTS trigger_audit_user_roles ON user_roles;
DROP TRIGGER IF EXISTS trigger_audit_user_profiles ON user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_audit_log_modification() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_audit_partitions() CASCADE;
DROP FUNCTION IF EXISTS auto_create_next_audit_partition() CASCADE;
DROP FUNCTION IF EXISTS create_audit_log_partition(DATE) CASCADE;
DROP FUNCTION IF EXISTS log_audit_event(TEXT, TEXT, UUID, UUID, JSONB, JSONB, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS trigger_audit_log() CASCADE;

-- Drop all audit_logs partitions
DO $$
DECLARE
  partition_record RECORD;
BEGIN
  FOR partition_record IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname LIKE 'audit_logs_%'
      AND n.nspname = 'public'
      AND c.relkind = 'r'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', partition_record.relname);
  END LOOP;
END $$;

-- Drop main tables
DROP TABLE IF EXISTS audit_log_retention_policy CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

RAISE NOTICE 'Audit tables rollback completed!';
