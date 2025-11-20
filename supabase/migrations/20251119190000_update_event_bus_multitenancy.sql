-- Migration: 008_update_event_bus_for_multitenancy.sql
-- Description: Update event bus functions to support org_id
-- Author: InTime Development Team
-- Date: 2025-11-19

-- =============================================================================
-- UPDATE FUNCTION: publish_event
-- =============================================================================

CREATE OR REPLACE FUNCTION publish_event(
  p_event_type TEXT,
  p_aggregate_id UUID,
  p_payload JSONB,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_org_id UUID DEFAULT NULL -- New parameter
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_event_category TEXT;
  v_user_email TEXT;
  v_notify_payload TEXT;
  v_org_id UUID;
BEGIN
  -- Extract category from event_type (e.g., 'user.created' -> 'user')
  v_event_category := SPLIT_PART(p_event_type, '.', 1);

  -- Get user email if user_id provided
  IF p_user_id IS NOT NULL THEN
    SELECT email, org_id INTO v_user_email, v_org_id
    FROM user_profiles
    WHERE id = p_user_id;
  END IF;

  -- If org_id provided explicitly, use it. Otherwise use the one from user profile.
  -- If still null, try to get from auth context (if running in RLS context)
  IF p_org_id IS NOT NULL THEN
    v_org_id := p_org_id;
  END IF;

  -- Fallback to default org if still null (should not happen in production)
  IF v_org_id IS NULL THEN
    v_org_id := '00000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  -- Insert event
  INSERT INTO events (
    event_type,
    event_category,
    aggregate_id,
    payload,
    metadata,
    user_id,
    user_email,
    org_id, -- New field
    status
  ) VALUES (
    p_event_type,
    v_event_category,
    p_aggregate_id,
    p_payload,
    p_metadata,
    p_user_id,
    v_user_email,
    v_org_id,
    'pending'
  ) RETURNING id INTO v_event_id;

  -- Build notification payload (lightweight)
  v_notify_payload := json_build_object(
    'event_id', v_event_id,
    'event_type', p_event_type,
    'aggregate_id', p_aggregate_id,
    'org_id', v_org_id,
    'timestamp', NOW()
  )::TEXT;

  -- Send NOTIFY on channel matching event category
  PERFORM pg_notify(v_event_category, v_notify_payload);

  -- Also send on global event channel
  PERFORM pg_notify('events', v_notify_payload);

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION publish_event IS 'Publish an event to the event bus. Triggers PostgreSQL NOTIFY for real-time processing. Supports multi-tenancy.';
