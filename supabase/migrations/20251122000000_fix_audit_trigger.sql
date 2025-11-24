-- ============================================================================
-- Fix Audit Trigger to Handle Tables Without 'id' Field
-- This fixes the "record NEW has no field id" error
-- ============================================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS trigger_audit_user_profiles ON user_profiles;
DROP TRIGGER IF EXISTS trigger_audit_user_roles ON user_roles;
DROP TRIGGER IF EXISTS trigger_audit_roles ON roles;
DROP TRIGGER IF EXISTS trigger_audit_events ON events;
DROP TRIGGER IF EXISTS trigger_audit_audit_logs ON audit_logs;

-- Replace the trigger function with a safer version
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_action TEXT;
  v_user_id UUID;
  v_record_id UUID;
  v_new_jsonb JSONB;
  v_old_jsonb JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_new_jsonb := to_jsonb(NEW);
    v_new_values := v_new_jsonb;
    v_old_values := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_new_jsonb := to_jsonb(NEW);
    v_old_jsonb := to_jsonb(OLD);
    v_old_values := v_old_jsonb;
    v_new_values := v_new_jsonb;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_old_jsonb := to_jsonb(OLD);
    v_old_values := v_old_jsonb;
    v_new_values := NULL;
  END IF;

  -- Try to get record ID from jsonb (safer than direct field access)
  -- Try 'id' first, then other common PK fields, cast to UUID
  IF v_new_jsonb IS NOT NULL THEN
    v_record_id := COALESCE(
      (v_new_jsonb->>'id')::UUID,
      (v_new_jsonb->>'user_id')::UUID,  -- for tables like user_roles
      (v_new_jsonb->>'role_id')::UUID   -- fallback
    );
  ELSIF v_old_jsonb IS NOT NULL THEN
    v_record_id := COALESCE(
      (v_old_jsonb->>'id')::UUID,
      (v_old_jsonb->>'user_id')::UUID,
      (v_old_jsonb->>'role_id')::UUID
    );
  END IF;

  -- Try to get current user ID from various sources (safer with jsonb)
  v_user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;

  IF v_user_id IS NULL AND v_new_jsonb IS NOT NULL THEN
    v_user_id := COALESCE(
      (v_new_jsonb->>'updated_by')::UUID,
      (v_new_jsonb->>'created_by')::UUID,
      (v_new_jsonb->>'assigned_by')::UUID  -- for user_roles
    );
  END IF;

  IF v_user_id IS NULL AND v_old_jsonb IS NOT NULL THEN
    v_user_id := COALESCE(
      (v_old_jsonb->>'updated_by')::UUID,
      (v_old_jsonb->>'created_by')::UUID
    );
  END IF;

  -- Log the audit event
  PERFORM log_audit_event(
    p_table_name := TG_TABLE_NAME,
    p_action := v_action,
    p_record_id := v_record_id,
    p_user_id := v_user_id,
    p_old_values := v_old_values,
    p_new_values := v_new_values,
    p_metadata := '{}'::jsonb,
    p_severity := 'info'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create triggers with the fixed function
CREATE TRIGGER trigger_audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_roles
  AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_audit_log();
