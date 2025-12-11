-- Fix capture_status_change function to not reference updated_by
-- Not all tables have updated_by column (jobs has created_by, not updated_by)

CREATE OR REPLACE FUNCTION capture_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_type VARCHAR;
  v_field_name VARCHAR;
  v_old_value VARCHAR;
  v_new_value VARCHAR;
  v_user_id UUID;
BEGIN
  -- Get entity type from trigger argument
  v_entity_type := TG_ARGV[0];
  v_field_name := COALESCE(TG_ARGV[1], 'status');  -- Default 'status'

  -- Get old and new values dynamically
  EXECUTE format('SELECT ($1).%I::varchar', v_field_name) INTO v_old_value USING OLD;
  EXECUTE format('SELECT ($1).%I::varchar', v_field_name) INTO v_new_value USING NEW;

  -- Try to get user_id from app settings
  BEGIN
    v_user_id := (current_setting('app.user_id', true))::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  -- Only record if value changed
  IF v_old_value IS DISTINCT FROM v_new_value THEN
    INSERT INTO entity_history (
      org_id,
      entity_type,
      entity_id,
      change_type,
      field_name,
      old_value,
      new_value,
      changed_by,
      changed_at,
      is_automated
    ) VALUES (
      NEW.org_id,
      v_entity_type,
      NEW.id,
      'status_change',
      v_field_name,
      v_old_value,
      v_new_value,
      v_user_id,
      now(),
      v_user_id IS NULL  -- Mark as automated if no user context
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
