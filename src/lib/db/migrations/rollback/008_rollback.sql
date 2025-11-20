-- ============================================================================
-- Rollback: 008_refine_event_bus
-- Description: Revert changes from Migration 008
-- ============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_auto_disable_handler ON event_subscriptions;
DROP FUNCTION IF EXISTS auto_disable_failing_handler();

-- Drop views
DROP VIEW IF EXISTS v_handler_health;
DROP VIEW IF EXISTS v_event_metrics_24h;
DROP VIEW IF EXISTS v_dead_letter_queue;
DROP VIEW IF EXISTS v_event_bus_validation;

-- Drop functions
DROP FUNCTION IF EXISTS mark_event_processed(UUID, UUID);
DROP FUNCTION IF EXISTS mark_event_failed(UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS replay_failed_events_batch(UUID[]);
DROP FUNCTION IF EXISTS get_events_filtered(TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS enable_event_handler(UUID);
DROP FUNCTION IF EXISTS disable_event_handler(UUID);
DROP FUNCTION IF EXISTS get_event_handler_health();

-- Restore original functions (from Migration 005)
CREATE OR REPLACE FUNCTION mark_event_processed(p_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events SET status = 'completed', processed_at = NOW()
  WHERE id = p_event_id AND status != 'completed';
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_event_failed(p_event_id UUID, p_error_message TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
BEGIN
  SELECT retry_count, max_retries INTO v_retry_count, v_max_retries FROM events WHERE id = p_event_id;
  IF v_retry_count < v_max_retries THEN
    UPDATE events SET status = 'failed', retry_count = retry_count + 1, error_message = p_error_message WHERE id = p_event_id;
  ELSE
    UPDATE events SET status = 'dead_letter', failed_at = NOW(), error_message = p_error_message WHERE id = p_event_id;
  END IF;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Drop RLS policies
DROP POLICY IF EXISTS "Only admins can delete subscriptions" ON event_subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON event_subscriptions;
DROP POLICY IF EXISTS "Only admins can create subscriptions" ON event_subscriptions;
DROP POLICY IF EXISTS "Users can view subscriptions in their org" ON event_subscriptions;
DROP POLICY IF EXISTS "Users can view delivery logs in their org" ON event_delivery_log;
DROP POLICY IF EXISTS "Service role can insert delivery logs" ON event_delivery_log;

ALTER TABLE event_subscriptions DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_event_subscriptions_health;
DROP INDEX IF EXISTS idx_events_created_at_status;
DROP INDEX IF EXISTS idx_events_dead_letter;
DROP INDEX IF EXISTS idx_events_admin_filters;
DROP INDEX IF EXISTS idx_event_subscriptions_org_id;

-- Remove health monitoring columns
ALTER TABLE event_subscriptions
  DROP COLUMN IF EXISTS auto_disabled_at,
  DROP COLUMN IF EXISTS consecutive_failures,
  DROP COLUMN IF EXISTS last_failure_message,
  DROP COLUMN IF EXISTS last_failure_at,
  DROP COLUMN IF EXISTS failure_count;

-- Remove org_id from event_subscriptions
ALTER TABLE event_subscriptions
  DROP COLUMN IF EXISTS org_id;

DO $$
BEGIN
  RAISE NOTICE 'Migration 008 rolled back successfully';
END $$;
