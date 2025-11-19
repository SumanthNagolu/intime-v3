-- ============================================================================
-- Migration: 004_create_audit_tables
-- Description: Comprehensive audit logging system with monthly partitioning
--              for compliance, security, and debugging. Immutable audit trail.
-- Created: 2025-11-18
-- Author: Database Architect Agent
-- Epic: FOUND-003 - Create Audit Logging Tables
-- Dependencies: 002_create_user_profiles.sql, 003_create_rbac_system.sql
-- ============================================================================

-- ============================================================================
-- TABLE: audit_logs (Partitioned by month)
-- Purpose: Immutable audit trail of all sensitive operations
-- Partitioning Strategy: Monthly partitions for performance and data retention
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4(),

  -- Temporal data (partition key)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Action metadata
  table_name TEXT NOT NULL, -- 'user_profiles', 'placements', 'timesheets', etc.
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  record_id UUID, -- ID of the affected record

  -- Actor information
  user_id UUID REFERENCES user_profiles(id), -- Who performed the action
  user_email TEXT, -- Denormalized for quick reference
  user_ip_address INET, -- IP address of the user
  user_agent TEXT, -- Browser/client information

  -- Change details
  old_values JSONB, -- Previous values (for UPDATE/DELETE)
  new_values JSONB, -- New values (for INSERT/UPDATE)
  changed_fields TEXT[], -- Array of changed field names

  -- Context
  request_id TEXT, -- Unique request ID for correlation
  session_id TEXT, -- User session ID
  request_path TEXT, -- API endpoint or page path
  request_method TEXT, -- 'GET', 'POST', 'PUT', 'DELETE'

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Additional context (e.g., reason, approval_id)

  -- Severity for filtering
  severity TEXT DEFAULT 'info', -- 'debug', 'info', 'warning', 'error', 'critical'

  -- Constraints
  CONSTRAINT valid_action CHECK (
    action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT', 'CUSTOM')
  ),
  CONSTRAINT valid_severity CHECK (
    severity IN ('debug', 'info', 'warning', 'error', 'critical')
  )
) PARTITION BY RANGE (created_at);

-- Create index on partitioned table
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id) WHERE record_id IS NOT NULL;
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity) WHERE severity IN ('error', 'critical');

-- ============================================================================
-- PARTITIONS: Create initial partitions (current month + next 3 months)
-- ============================================================================

-- Helper function to create a partition for a specific month
CREATE OR REPLACE FUNCTION create_audit_log_partition(partition_date DATE)
RETURNS VOID AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate partition boundaries
  start_date := DATE_TRUNC('month', partition_date);
  end_date := start_date + INTERVAL '1 month';

  -- Generate partition name (e.g., audit_logs_2025_11)
  partition_name := 'audit_logs_' || TO_CHAR(start_date, 'YYYY_MM');

  -- Check if partition already exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = partition_name
      AND n.nspname = 'public'
  ) THEN
    -- Create partition
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name,
      start_date,
      end_date
    );

    RAISE NOTICE 'Created partition: % (% to %)', partition_name, start_date, end_date;
  ELSE
    RAISE NOTICE 'Partition % already exists', partition_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create partitions for current month + next 3 months
SELECT create_audit_log_partition(CURRENT_DATE);
SELECT create_audit_log_partition(CURRENT_DATE + INTERVAL '1 month');
SELECT create_audit_log_partition(CURRENT_DATE + INTERVAL '2 months');
SELECT create_audit_log_partition(CURRENT_DATE + INTERVAL '3 months');

-- ============================================================================
-- FUNCTION: Auto-create partition for next month (cron job)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_create_next_audit_partition()
RETURNS VOID AS $$
BEGIN
  -- Create partition for 3 months from now
  PERFORM create_audit_log_partition(CURRENT_DATE + INTERVAL '3 months');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Log audit event
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_table_name TEXT,
  p_action TEXT,
  p_record_id UUID,
  p_user_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_user_email TEXT;
  v_changed_fields TEXT[];
BEGIN
  -- Get user email for denormalization
  SELECT email INTO v_user_email
  FROM user_profiles
  WHERE id = p_user_id;

  -- Calculate changed fields (for UPDATE actions)
  IF p_action = 'UPDATE' AND p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(p_new_values)
    WHERE value != COALESCE(p_old_values->key, 'null'::jsonb);
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    table_name,
    action,
    record_id,
    user_id,
    user_email,
    old_values,
    new_values,
    changed_fields,
    metadata,
    severity
  ) VALUES (
    p_table_name,
    p_action,
    p_record_id,
    p_user_id,
    v_user_email,
    p_old_values,
    p_new_values,
    v_changed_fields,
    p_metadata,
    p_severity
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER FUNCTIONS: Auto-audit specific tables
-- ============================================================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_action TEXT;
  v_user_id UUID;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_new_values := to_jsonb(NEW);
    v_old_values := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
  END IF;

  -- Try to get current user ID from various sources
  v_user_id := COALESCE(
    NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID,
    NEW.updated_by,
    NEW.created_by,
    OLD.updated_by
  );

  -- Log the audit event
  PERFORM log_audit_event(
    p_table_name := TG_TABLE_NAME,
    p_action := v_action,
    p_record_id := COALESCE(NEW.id, OLD.id),
    p_user_id := v_user_id,
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_severity := 'info'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Apply audit logging to critical tables
-- ============================================================================

-- Audit user_profiles table
CREATE TRIGGER trigger_audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();

-- Audit user_roles table
CREATE TRIGGER trigger_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();

-- Audit role_permissions table
CREATE TRIGGER trigger_audit_role_permissions
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();

-- ============================================================================
-- TABLE: audit_log_retention_policy
-- Purpose: Define retention policies for audit logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log_retention_policy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Policy details
  table_name TEXT UNIQUE NOT NULL,
  retention_months INTEGER NOT NULL DEFAULT 6, -- Keep for 6 months by default
  archive_after_months INTEGER, -- Move to cold storage after N months

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_retention CHECK (retention_months > 0),
  CONSTRAINT valid_archive CHECK (
    archive_after_months IS NULL OR archive_after_months < retention_months
  )
);

-- Default retention policies
INSERT INTO audit_log_retention_policy (table_name, retention_months, archive_after_months) VALUES
  ('user_profiles', 24, 12), -- Keep user changes for 2 years, archive after 1 year
  ('user_roles', 24, 12),
  ('placements', 36, 24), -- Keep placement records for 3 years
  ('timesheets', 84, 24), -- Keep timesheets for 7 years (IRS requirement)
  ('payments', 84, 24),
  ('default', 6, 3) -- Default for all other tables
ON CONFLICT (table_name) DO NOTHING;

-- ============================================================================
-- FUNCTION: Clean up old partitions (run monthly)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_partitions()
RETURNS TABLE (partition_name TEXT, action TEXT) AS $$
DECLARE
  partition_record RECORD;
  partition_date DATE;
  retention_months INTEGER;
BEGIN
  -- Loop through all audit_logs partitions
  FOR partition_record IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname LIKE 'audit_logs_%'
      AND n.nspname = 'public'
      AND c.relkind = 'r' -- Regular table (partition)
  LOOP
    -- Extract date from partition name (e.g., audit_logs_2025_11 -> 2025-11-01)
    BEGIN
      partition_date := TO_DATE(
        SUBSTRING(partition_record.relname FROM 'audit_logs_(\d{4}_\d{2})'),
        'YYYY_MM'
      );

      -- Get retention policy (default to 6 months)
      retention_months := 6;

      -- Check if partition is older than retention period
      IF partition_date < CURRENT_DATE - (retention_months || ' months')::INTERVAL THEN
        -- Drop the partition
        EXECUTE format('DROP TABLE IF EXISTS %I', partition_record.relname);

        partition_name := partition_record.relname;
        action := 'DROPPED';
        RETURN NEXT;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Skip partitions that don't match expected naming pattern
        CONTINUE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Recent audit logs
CREATE OR REPLACE VIEW v_audit_logs_recent AS
SELECT
  al.id,
  al.created_at,
  al.table_name,
  al.action,
  al.user_email,
  al.changed_fields,
  al.severity,
  up.full_name AS user_name
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
WHERE al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC
LIMIT 1000;

-- View: Critical audit events
CREATE OR REPLACE VIEW v_audit_logs_critical AS
SELECT
  al.id,
  al.created_at,
  al.table_name,
  al.action,
  al.user_email,
  al.record_id,
  al.metadata,
  up.full_name AS user_name
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
WHERE al.severity IN ('error', 'critical')
ORDER BY al.created_at DESC;

-- View: User activity summary
CREATE OR REPLACE VIEW v_user_activity_summary AS
SELECT
  user_id,
  user_email,
  COUNT(*) AS total_actions,
  COUNT(*) FILTER (WHERE action = 'INSERT') AS inserts,
  COUNT(*) FILTER (WHERE action = 'UPDATE') AS updates,
  COUNT(*) FILTER (WHERE action = 'DELETE') AS deletes,
  MAX(created_at) AS last_activity
FROM audit_logs
WHERE user_id IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id, user_email
ORDER BY total_actions DESC;

-- ============================================================================
-- IMMUTABILITY: Prevent modifications to audit logs
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. Cannot UPDATE or DELETE audit records.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Prevent UPDATE and DELETE on audit_logs
CREATE TRIGGER trigger_prevent_audit_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trigger_prevent_audit_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE audit_logs IS
'Immutable audit trail with monthly partitioning. Tracks all sensitive operations for compliance and security.';

COMMENT ON FUNCTION create_audit_log_partition IS
'Creates a monthly partition for audit_logs. Should be run automatically via cron.';

COMMENT ON FUNCTION log_audit_event IS
'Helper function to log audit events programmatically.';

COMMENT ON FUNCTION cleanup_old_audit_partitions IS
'Drops partitions older than retention period. Run monthly via cron.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 004_create_audit_tables.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Table created: audit_logs (partitioned by month)';
  RAISE NOTICE 'Partitions created: 4 partitions (current month + next 3 months)';
  RAISE NOTICE 'Table created: audit_log_retention_policy';
  RAISE NOTICE 'Functions: log_audit_event(), create_audit_log_partition(), cleanup_old_audit_partitions()';
  RAISE NOTICE 'Triggers: Auto-audit on user_profiles, user_roles, role_permissions';
  RAISE NOTICE 'Immutability: UPDATE/DELETE prevented on audit_logs';
  RAISE NOTICE 'Views: v_audit_logs_recent, v_audit_logs_critical, v_user_activity_summary';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'IMPORTANT: Set up cron job to run:';
  RAISE NOTICE '  1. auto_create_next_audit_partition() - Run monthly';
  RAISE NOTICE '  2. cleanup_old_audit_partitions() - Run monthly';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next: Run 005_create_event_bus.sql';
  RAISE NOTICE '============================================================';
END $$;
