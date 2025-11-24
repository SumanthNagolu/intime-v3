/**
 * Fix Audit Log Trigger - Allow NULL org_id During User Creation
 *
 * Problem: The audit log trigger requires org_id, but during user signup,
 * the organization is created BEFORE the user profile, causing a chicken-egg issue.
 *
 * Solution: Make org_id nullable in audit logs, or set a default value.
 */

-- Option 1: Make org_id nullable in audit_logs (Recommended)
ALTER TABLE audit_logs
ALTER COLUMN org_id DROP NOT NULL;

-- Option 2: Modify the audit trigger to handle NULL org_id
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    action,
    record_id,
    user_id,
    user_email,
    org_id,  -- Can be NULL during initial user creation
    old_values,
    new_values,
    metadata,
    created_at
  )
  VALUES (
    TG_TABLE_NAME::text,
    TG_OP::text,
    COALESCE(NEW.id, OLD.id),
    COALESCE(
      current_setting('app.current_user_id', true)::uuid,
      NEW.id,  -- Use the record's own ID for initial creation
      OLD.id
    ),
    COALESCE(
      current_setting('app.current_user_email', true),
      NEW.email,
      OLD.email,
      'system@intime.local'
    ),
    COALESCE(
      NEW.org_id,  -- Try to get org_id from the new record
      OLD.org_id,  -- Or from the old record
      current_setting('app.current_org_id', true)::uuid,  -- Or from session
      NULL  -- Or allow NULL
    ),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE'
      THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE'
      THEN to_jsonb(NEW)
      ELSE NULL
    END,
    '{}'::jsonb,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all audit-enabled tables
DROP TRIGGER IF EXISTS audit_trigger ON user_profiles;
CREATE TRIGGER audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Verify the fix
SELECT
  conname as constraint_name,
  contype as constraint_type,
  a.attname as column_name,
  a.attnotnull as not_null
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.conrelid = 'audit_logs'::regclass
  AND a.attname = 'org_id';

-- Success message
SELECT 'Audit log trigger fixed - org_id is now nullable during user creation' as status;
