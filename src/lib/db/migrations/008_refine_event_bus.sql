-- ============================================================================
-- Migration: 008_refine_event_bus
-- Description: Refine Event Bus schema for Sprint 2 requirements
-- Author: Architect Agent
-- Date: 2025-11-19
-- Epic: FOUND-007, FOUND-008, FOUND-009
-- Dependencies: 005_create_event_bus.sql, 007_add_multi_tenancy.sql
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MULTI-TENANCY TO EVENT_SUBSCRIPTIONS
-- ============================================================================

-- Add org_id to event_subscriptions (missing from Migration 007)
ALTER TABLE event_subscriptions
  ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Backfill with default org for existing subscriptions
UPDATE event_subscriptions
SET org_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE org_id IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE event_subscriptions
  ALTER COLUMN org_id SET NOT NULL;

-- Add index for org isolation
CREATE INDEX idx_event_subscriptions_org_id ON event_subscriptions(org_id);

COMMENT ON COLUMN event_subscriptions.org_id IS 'Organization this subscription belongs to (multi-tenancy)';

-- ============================================================================
-- PART 2: ADD HEALTH MONITORING COLUMNS
-- ============================================================================

-- Add health tracking to event_subscriptions
ALTER TABLE event_subscriptions
  ADD COLUMN failure_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN last_failure_at TIMESTAMPTZ,
  ADD COLUMN last_failure_message TEXT,
  ADD COLUMN consecutive_failures INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN auto_disabled_at TIMESTAMPTZ;

COMMENT ON COLUMN event_subscriptions.failure_count IS 'Total failure count (all time)';
COMMENT ON COLUMN event_subscriptions.consecutive_failures IS 'Consecutive failures (resets on success)';
COMMENT ON COLUMN event_subscriptions.auto_disabled_at IS 'When handler was auto-disabled due to failures';

-- ============================================================================
-- PART 3: RENAME FUNCTIONS FOR CLARITY
-- ============================================================================

-- Migration 005 used mark_event_completed(), but Sprint 2 stories use mark_event_processed()
-- Create alias for backward compatibility
CREATE OR REPLACE FUNCTION mark_event_processed(p_event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events
  SET
    status = 'completed',
    processed_at = NOW()
  WHERE id = p_event_id
    AND status != 'completed';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_event_processed IS 'Mark event as successfully processed (alias for mark_event_completed)';

-- ============================================================================
-- PART 4: ADD ADMIN FUNCTIONS
-- ============================================================================

-- Function: Get event handler health status
CREATE OR REPLACE FUNCTION get_event_handler_health()
RETURNS TABLE (
  subscription_id UUID,
  subscriber_name TEXT,
  event_pattern TEXT,
  is_active BOOLEAN,
  failure_count INTEGER,
  consecutive_failures INTEGER,
  last_failure_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  org_id UUID,
  health_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    es.id,
    es.subscriber_name,
    es.event_pattern,
    es.is_active,
    es.failure_count,
    es.consecutive_failures,
    es.last_failure_at,
    es.last_triggered_at,
    es.org_id,
    CASE
      WHEN es.is_active = FALSE THEN 'disabled'
      WHEN es.consecutive_failures >= 5 THEN 'critical'
      WHEN es.consecutive_failures >= 3 THEN 'warning'
      WHEN es.failure_count > 0 THEN 'healthy_with_errors'
      ELSE 'healthy'
    END AS health_status
  FROM event_subscriptions es
  WHERE es.org_id = auth_user_org_id()
     OR user_is_admin()
  ORDER BY es.consecutive_failures DESC, es.subscriber_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_event_handler_health IS 'Returns health status of all event handlers (admin view)';

-- Function: Disable event handler
CREATE OR REPLACE FUNCTION disable_event_handler(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow if user is admin or owns the subscription's org
  IF NOT user_is_admin() AND NOT user_belongs_to_org((SELECT org_id FROM event_subscriptions WHERE id = p_subscription_id)) THEN
    RAISE EXCEPTION 'Permission denied: Cannot disable handler in different organization';
  END IF;

  UPDATE event_subscriptions
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION disable_event_handler IS 'Disable an event handler (requires admin or org owner)';

-- Function: Enable event handler
CREATE OR REPLACE FUNCTION enable_event_handler(p_subscription_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow if user is admin or owns the subscription's org
  IF NOT user_is_admin() AND NOT user_belongs_to_org((SELECT org_id FROM event_subscriptions WHERE id = p_subscription_id)) THEN
    RAISE EXCEPTION 'Permission denied: Cannot enable handler in different organization';
  END IF;

  UPDATE event_subscriptions
  SET
    is_active = TRUE,
    consecutive_failures = 0, -- Reset on manual enable
    auto_disabled_at = NULL,
    updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enable_event_handler IS 'Enable an event handler and reset failure count (requires admin or org owner)';

-- Function: Get events with filters (for admin UI)
CREATE OR REPLACE FUNCTION get_events_filtered(
  p_event_type TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_from_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_to_date TIMESTAMPTZ DEFAULT NOW(),
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  event_category TEXT,
  status TEXT,
  payload JSONB,
  metadata JSONB,
  user_email TEXT,
  retry_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  org_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.event_type,
    e.event_category,
    e.status,
    e.payload,
    e.metadata,
    e.user_email,
    e.retry_count,
    e.error_message,
    e.created_at,
    e.processed_at,
    e.org_id
  FROM events e
  WHERE (p_event_type IS NULL OR e.event_type = p_event_type)
    AND (p_status IS NULL OR e.status = p_status)
    AND e.created_at BETWEEN p_from_date AND p_to_date
    AND (e.org_id = auth_user_org_id() OR user_is_admin())
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_events_filtered IS 'Get events with filters for admin UI';

-- Function: Replay failed events (batch)
CREATE OR REPLACE FUNCTION replay_failed_events_batch(p_event_ids UUID[])
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  status TEXT
) AS $$
BEGIN
  -- Only allow if user is admin
  IF NOT user_is_admin() THEN
    RAISE EXCEPTION 'Permission denied: Only admins can replay events';
  END IF;

  RETURN QUERY
  UPDATE events
  SET
    status = 'pending',
    retry_count = 0,
    next_retry_at = NULL,
    processed_at = NULL,
    failed_at = NULL,
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{replayed}',
      'true'::jsonb
    ),
    metadata = jsonb_set(
      metadata,
      '{replayed_at}',
      to_jsonb(NOW())
    )
  WHERE id = ANY(p_event_ids)
    AND status IN ('failed', 'dead_letter')
    AND (org_id = auth_user_org_id() OR user_is_admin())
  RETURNING id, events.event_type, events.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION replay_failed_events_batch IS 'Replay selected failed events (admin only)';

-- ============================================================================
-- PART 5: UPDATE RLS POLICIES
-- ============================================================================

-- event_subscriptions: Add RLS policies (missing from Migration 007)
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view subscriptions in their org
CREATE POLICY "Users can view subscriptions in their org"
  ON event_subscriptions
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- Only admins can create subscriptions
CREATE POLICY "Only admins can create subscriptions"
  ON event_subscriptions
  FOR INSERT
  WITH CHECK (
    user_is_admin()
  );

-- Admins can update subscriptions in their org
CREATE POLICY "Admins can update subscriptions"
  ON event_subscriptions
  FOR UPDATE
  USING (
    user_is_admin()
    OR (
      org_id = auth_user_org_id()
      AND user_has_role('org_admin')
    )
  );

-- Only admins can delete subscriptions
CREATE POLICY "Only admins can delete subscriptions"
  ON event_subscriptions
  FOR DELETE
  USING (
    user_is_admin()
  );

-- Update event_delivery_log RLS (allow service role to insert)
DROP POLICY IF EXISTS "Service role can insert delivery logs" ON event_delivery_log;
CREATE POLICY "Service role can insert delivery logs"
  ON event_delivery_log
  FOR INSERT
  WITH CHECK (TRUE); -- No restriction for service role

-- Users can view delivery logs in their org
DROP POLICY IF EXISTS "Users can view delivery logs in their org" ON event_delivery_log;
CREATE POLICY "Users can view delivery logs in their org"
  ON event_delivery_log
  FOR SELECT
  USING (
    org_id = auth_user_org_id()
    OR user_is_admin()
  );

-- ============================================================================
-- PART 6: PERFORMANCE INDEXES
-- ============================================================================

-- Admin UI will query events by type + status + date range
CREATE INDEX idx_events_admin_filters ON events(event_type, status, created_at DESC)
  WHERE status IN ('pending', 'failed', 'dead_letter');

-- Dead letter queue queries
CREATE INDEX idx_events_dead_letter ON events(created_at DESC)
  WHERE status = 'dead_letter';

-- Event history queries (date range scans)
CREATE INDEX idx_events_created_at_status ON events(created_at DESC, status);

-- Subscription health queries
CREATE INDEX idx_event_subscriptions_health ON event_subscriptions(is_active, consecutive_failures DESC)
  WHERE is_active = TRUE OR consecutive_failures > 0;

-- ============================================================================
-- PART 7: ADMIN VIEWS
-- ============================================================================

-- View: Dead letter queue (events that failed permanently)
CREATE OR REPLACE VIEW v_dead_letter_queue AS
SELECT
  e.id,
  e.event_type,
  e.event_category,
  e.payload,
  e.metadata,
  e.user_email,
  e.retry_count,
  e.error_message,
  e.created_at,
  e.failed_at,
  e.org_id,
  o.name AS org_name
FROM events e
JOIN organizations o ON e.org_id = o.id
WHERE e.status = 'dead_letter'
  AND (e.org_id = auth_user_org_id() OR user_is_admin())
ORDER BY e.created_at DESC;

COMMENT ON VIEW v_dead_letter_queue IS 'Events that failed permanently after max retries';

-- View: Event processing metrics (last 24 hours)
CREATE OR REPLACE VIEW v_event_metrics_24h AS
SELECT
  event_type,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  COUNT(*) FILTER (WHERE status = 'dead_letter') AS dead_letter,
  ROUND(AVG(EXTRACT(EPOCH FROM (processed_at - created_at)) * 1000)::NUMERIC, 2) AS avg_processing_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (processed_at - created_at)) * 1000)::NUMERIC, 2) AS p95_processing_ms,
  MAX(created_at) AS last_event_at
FROM events
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND (org_id = auth_user_org_id() OR user_is_admin())
GROUP BY event_type
ORDER BY total_events DESC;

COMMENT ON VIEW v_event_metrics_24h IS 'Event processing metrics for last 24 hours';

-- View: Handler health dashboard
CREATE OR REPLACE VIEW v_handler_health AS
SELECT
  es.id,
  es.subscriber_name,
  es.event_pattern,
  es.is_active,
  es.failure_count,
  es.consecutive_failures,
  es.last_failure_at,
  es.last_failure_message,
  es.last_triggered_at,
  es.auto_disabled_at,
  es.org_id,
  o.name AS org_name,
  CASE
    WHEN es.is_active = FALSE THEN 'disabled'
    WHEN es.consecutive_failures >= 5 THEN 'critical'
    WHEN es.consecutive_failures >= 3 THEN 'warning'
    WHEN es.failure_count > 0 THEN 'healthy_with_errors'
    ELSE 'healthy'
  END AS health_status
FROM event_subscriptions es
JOIN organizations o ON es.org_id = o.id
WHERE es.org_id = auth_user_org_id() OR user_is_admin()
ORDER BY es.consecutive_failures DESC, es.subscriber_name ASC;

COMMENT ON VIEW v_handler_health IS 'Event handler health dashboard for admin UI';

-- ============================================================================
-- PART 8: TRIGGERS FOR HEALTH MONITORING
-- ============================================================================

-- Trigger: Auto-disable handler after 5 consecutive failures
CREATE OR REPLACE FUNCTION auto_disable_failing_handler()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consecutive_failures >= 5 AND OLD.consecutive_failures < 5 THEN
    NEW.is_active := FALSE;
    NEW.auto_disabled_at := NOW();

    -- Log to audit log
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      changes,
      org_id
    ) VALUES (
      auth_user_id(),
      'auto_disable',
      'event_subscription',
      NEW.id,
      jsonb_build_object(
        'reason', 'consecutive_failures',
        'failure_count', NEW.consecutive_failures
      ),
      NEW.org_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_disable_handler
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW
  WHEN (NEW.consecutive_failures >= 5 AND OLD.consecutive_failures < 5)
  EXECUTE FUNCTION auto_disable_failing_handler();

COMMENT ON TRIGGER trigger_auto_disable_handler ON event_subscriptions IS 'Auto-disable handler after 5 consecutive failures';

-- ============================================================================
-- PART 9: HELPER FUNCTIONS (REFINEMENTS)
-- ============================================================================

-- Update mark_event_failed to track subscription health
CREATE OR REPLACE FUNCTION mark_event_failed(
  p_event_id UUID,
  p_error_message TEXT,
  p_subscription_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
  v_next_retry_at TIMESTAMPTZ;
BEGIN
  -- Get current retry count and max retries
  SELECT retry_count, max_retries
  INTO v_retry_count, v_max_retries
  FROM events
  WHERE id = p_event_id;

  -- Calculate next retry time (exponential backoff: 2^retry_count minutes)
  v_next_retry_at := NOW() + (POWER(2, v_retry_count + 1) || ' minutes')::INTERVAL;

  -- Update event
  IF v_retry_count < v_max_retries THEN
    -- Still have retries left
    UPDATE events
    SET
      status = 'failed',
      retry_count = retry_count + 1,
      next_retry_at = v_next_retry_at,
      error_message = p_error_message
    WHERE id = p_event_id;
  ELSE
    -- Exhausted retries, move to dead letter queue
    UPDATE events
    SET
      status = 'dead_letter',
      failed_at = NOW(),
      error_message = p_error_message
    WHERE id = p_event_id;
  END IF;

  -- Update subscription health metrics if subscription_id provided
  IF p_subscription_id IS NOT NULL THEN
    UPDATE event_subscriptions
    SET
      failure_count = failure_count + 1,
      consecutive_failures = consecutive_failures + 1,
      last_failure_at = NOW(),
      last_failure_message = p_error_message
    WHERE id = p_subscription_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_event_failed IS 'Mark event as failed and update subscription health (updated for Sprint 2)';

-- Function to mark event processed AND reset handler health
CREATE OR REPLACE FUNCTION mark_event_processed(
  p_event_id UUID,
  p_subscription_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events
  SET
    status = 'completed',
    processed_at = NOW()
  WHERE id = p_event_id
    AND status != 'completed';

  -- Reset consecutive failures on success
  IF p_subscription_id IS NOT NULL AND FOUND THEN
    UPDATE event_subscriptions
    SET
      consecutive_failures = 0,
      last_triggered_at = NOW()
    WHERE id = p_subscription_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_event_processed IS 'Mark event as processed and reset handler consecutive failures (updated for Sprint 2)';

-- ============================================================================
-- PART 10: DATA VALIDATION
-- ============================================================================

-- Validation view: Check all tables have org_id
CREATE OR REPLACE VIEW v_event_bus_validation AS
SELECT
  'events' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NULL) AS missing_org_id,
  CASE WHEN COUNT(*) FILTER (WHERE org_id IS NULL) > 0 THEN 'FAIL' ELSE 'PASS' END AS status
FROM events
UNION ALL
SELECT
  'event_subscriptions' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NULL) AS missing_org_id,
  CASE WHEN COUNT(*) FILTER (WHERE org_id IS NULL) > 0 THEN 'FAIL' ELSE 'PASS' END AS status
FROM event_subscriptions
UNION ALL
SELECT
  'event_delivery_log' AS table_name,
  COUNT(*) AS total_records,
  COUNT(DISTINCT org_id) AS unique_orgs,
  COUNT(*) FILTER (WHERE org_id IS NULL) AS missing_org_id,
  CASE WHEN COUNT(*) FILTER (WHERE org_id IS NULL) > 0 THEN 'FAIL' ELSE 'PASS' END AS status
FROM event_delivery_log;

COMMENT ON VIEW v_event_bus_validation IS 'Validation: Check all event bus tables have org_id (should all be PASS)';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 008_refine_event_bus.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Added org_id to event_subscriptions';
  RAISE NOTICE '  - Added health monitoring columns to event_subscriptions';
  RAISE NOTICE '  - Created admin functions: get_event_handler_health, disable/enable_event_handler';
  RAISE NOTICE '  - Created event filtering function for admin UI';
  RAISE NOTICE '  - Created replay_failed_events_batch function';
  RAISE NOTICE '  - Added RLS policies to event_subscriptions';
  RAISE NOTICE '  - Added performance indexes for admin queries';
  RAISE NOTICE '  - Created admin views: v_dead_letter_queue, v_event_metrics_24h, v_handler_health';
  RAISE NOTICE '  - Added auto-disable trigger for failing handlers';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Validation:';
  RAISE NOTICE '  SELECT * FROM v_event_bus_validation;';
  RAISE NOTICE '  -- All rows should show status = PASS';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Verify migration: SELECT * FROM v_event_bus_validation;';
  RAISE NOTICE '  2. Test admin functions: SELECT * FROM get_event_handler_health();';
  RAISE NOTICE '  3. Proceed with tRPC API implementation';
  RAISE NOTICE '============================================================';
END $$;
