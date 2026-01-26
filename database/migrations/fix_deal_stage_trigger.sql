-- Fix the log_deal_stage_change trigger function
-- The deals table doesn't have an updated_by column, so we use created_by as fallback
-- or simply set it to NULL

CREATE OR REPLACE FUNCTION public.log_deal_stage_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only log if stage actually changed
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    -- Close out the previous stage entry
    UPDATE deal_stages_history
    SET exited_at = NOW(),
        duration_days = EXTRACT(DAY FROM (NOW() - entered_at))
    WHERE deal_id = NEW.id
      AND exited_at IS NULL;

    -- Insert new stage entry
    -- Note: deals table doesn't have updated_by, use created_by or NULL
    INSERT INTO deal_stages_history (
      deal_id,
      stage,
      previous_stage,
      entered_at,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.stage,
      OLD.stage,
      NOW(),
      NEW.created_by
    );

    -- Update last activity
    NEW.last_activity_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.log_deal_stage_change() IS 'Tracks deal stage transitions in history table. Uses created_by since deals table does not have updated_by column.';
