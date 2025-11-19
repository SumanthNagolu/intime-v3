-- ============================================================================
-- Migration: 005_create_event_bus
-- Description: Event-driven architecture using PostgreSQL LISTEN/NOTIFY.
--              Enables cross-module communication without tight coupling.
-- Created: 2025-11-18
-- Author: Database Architect Agent
-- Epic: FOUND-007 - Build Event Bus using PostgreSQL LISTEN/NOTIFY
-- Dependencies: 002_create_user_profiles.sql
-- ============================================================================

-- ============================================================================
-- TABLE: events
-- Purpose: Store all events for guaranteed delivery and replay capability
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event identification
  event_type TEXT NOT NULL, -- 'user.created', 'course.graduated', 'placement.approved'
  event_category TEXT NOT NULL, -- 'user', 'academy', 'recruiting', 'hr', 'system'
  aggregate_id UUID, -- ID of the entity this event relates to (user_id, course_id, etc.)

  -- Event payload
  payload JSONB NOT NULL DEFAULT '{}', -- Event data
  metadata JSONB DEFAULT '{}', -- Additional context (correlation_id, causation_id, etc.)

  -- Actor information
  user_id UUID REFERENCES user_profiles(id), -- Who triggered this event
  user_email TEXT, -- Denormalized for quick reference

  -- Event status and delivery
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ, -- When to retry if failed
  error_message TEXT, -- Error details if failed

  -- Temporal data
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ, -- When event was successfully processed
  failed_at TIMESTAMPTZ, -- When event permanently failed

  -- Versioning (for event schema evolution)
  event_version INTEGER DEFAULT 1,

  -- Constraints
  CONSTRAINT valid_event_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'dead_letter')
  ),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0),
  CONSTRAINT valid_max_retries CHECK (max_retries >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_event_category ON events(event_category);
CREATE INDEX idx_events_aggregate_id ON events(aggregate_id) WHERE aggregate_id IS NOT NULL;
CREATE INDEX idx_events_status ON events(status) WHERE status IN ('pending', 'processing', 'failed');
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_user_id ON events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_next_retry ON events(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- ============================================================================
-- TABLE: event_subscriptions
-- Purpose: Track which subscribers are listening to which events
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_subscriptions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Subscription details
  subscriber_name TEXT NOT NULL, -- 'email_service', 'notification_service', 'analytics_service'
  event_pattern TEXT NOT NULL, -- 'user.*', 'user.created', 'academy.course.*'

  -- Subscriber configuration
  handler_function TEXT, -- PostgreSQL function to call (if using DB functions)
  webhook_url TEXT, -- HTTP endpoint to notify (if using webhooks)
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_triggered_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_handler CHECK (
    handler_function IS NOT NULL OR webhook_url IS NOT NULL
  )
);

-- ============================================================================
-- TABLE: event_delivery_log
-- Purpose: Track delivery attempts to subscribers
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_delivery_log (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES event_subscriptions(id) ON DELETE CASCADE,

  -- Delivery details
  attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failure', 'timeout'
  response_code INTEGER, -- HTTP status code if webhook
  response_body TEXT, -- Response from handler
  error_message TEXT,
  duration_ms INTEGER, -- How long the delivery took

  -- Constraints
  CONSTRAINT valid_delivery_status CHECK (
    status IN ('success', 'failure', 'timeout', 'skipped')
  )
);

CREATE INDEX idx_event_delivery_event ON event_delivery_log(event_id);
CREATE INDEX idx_event_delivery_subscription ON event_delivery_log(subscription_id);
CREATE INDEX idx_event_delivery_attempted ON event_delivery_log(attempted_at DESC);

-- ============================================================================
-- FUNCTION: Publish event (with NOTIFY)
-- ============================================================================

CREATE OR REPLACE FUNCTION publish_event(
  p_event_type TEXT,
  p_aggregate_id UUID,
  p_payload JSONB,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_event_category TEXT;
  v_user_email TEXT;
  v_notify_payload TEXT;
BEGIN
  -- Extract category from event_type (e.g., 'user.created' -> 'user')
  v_event_category := SPLIT_PART(p_event_type, '.', 1);

  -- Get user email if user_id provided
  IF p_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email
    FROM user_profiles
    WHERE id = p_user_id;
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
    status
  ) VALUES (
    p_event_type,
    v_event_category,
    p_aggregate_id,
    p_payload,
    p_metadata,
    p_user_id,
    v_user_email,
    'pending'
  ) RETURNING id INTO v_event_id;

  -- Build notification payload
  v_notify_payload := json_build_object(
    'event_id', v_event_id,
    'event_type', p_event_type,
    'aggregate_id', p_aggregate_id,
    'timestamp', NOW()
  )::TEXT;

  -- Send NOTIFY on channel matching event category
  PERFORM pg_notify(v_event_category, v_notify_payload);

  -- Also send on global event channel
  PERFORM pg_notify('events', v_notify_payload);

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Mark event as completed
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_event_completed(p_event_id UUID)
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

-- ============================================================================
-- FUNCTION: Mark event as failed (with retry logic)
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_event_failed(
  p_event_id UUID,
  p_error_message TEXT
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

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Retry failed events
-- ============================================================================

CREATE OR REPLACE FUNCTION retry_failed_events()
RETURNS TABLE (event_id UUID, event_type TEXT) AS $$
BEGIN
  RETURN QUERY
  UPDATE events
  SET
    status = 'pending',
    next_retry_at = NULL
  WHERE status = 'failed'
    AND next_retry_at IS NOT NULL
    AND next_retry_at <= NOW()
  RETURNING id, events.event_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Replay events (for debugging or re-processing)
-- ============================================================================

CREATE OR REPLACE FUNCTION replay_events(
  p_event_type_pattern TEXT DEFAULT NULL,
  p_from_timestamp TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 hour',
  p_to_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  created_at TIMESTAMPTZ,
  replayed BOOLEAN
) AS $$
DECLARE
  event_record RECORD;
  v_notify_payload TEXT;
BEGIN
  FOR event_record IN
    SELECT id, events.event_type, events.event_category, aggregate_id, events.created_at
    FROM events
    WHERE events.created_at BETWEEN p_from_timestamp AND p_to_timestamp
      AND (p_event_type_pattern IS NULL OR events.event_type LIKE p_event_type_pattern)
      AND status = 'completed'
    ORDER BY events.created_at ASC
  LOOP
    -- Build notification payload
    v_notify_payload := json_build_object(
      'event_id', event_record.id,
      'event_type', event_record.event_type,
      'aggregate_id', event_record.aggregate_id,
      'timestamp', event_record.created_at,
      'replayed', TRUE
    )::TEXT;

    -- Send NOTIFY
    PERFORM pg_notify(event_record.event_category, v_notify_payload);
    PERFORM pg_notify('events', v_notify_payload);

    event_id := event_record.id;
    event_type := event_record.event_type;
    created_at := event_record.created_at;
    replayed := TRUE;

    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Subscribe to events
-- ============================================================================

CREATE OR REPLACE FUNCTION subscribe_to_events(
  p_subscriber_name TEXT,
  p_event_pattern TEXT,
  p_handler_function TEXT DEFAULT NULL,
  p_webhook_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
BEGIN
  -- Validate that at least one handler is provided
  IF p_handler_function IS NULL AND p_webhook_url IS NULL THEN
    RAISE EXCEPTION 'Must provide either handler_function or webhook_url';
  END IF;

  -- Insert or update subscription
  INSERT INTO event_subscriptions (
    subscriber_name,
    event_pattern,
    handler_function,
    webhook_url,
    is_active
  ) VALUES (
    p_subscriber_name,
    p_event_pattern,
    p_handler_function,
    p_webhook_url,
    TRUE
  )
  ON CONFLICT (subscriber_name, event_pattern)
  DO UPDATE SET
    handler_function = EXCLUDED.handler_function,
    webhook_url = EXCLUDED.webhook_url,
    is_active = TRUE,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Auto-update updated_at for subscriptions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_event_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_event_subscriptions_updated_at
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_event_subscriptions_updated_at();

-- Add unique constraint for subscriptions
CREATE UNIQUE INDEX idx_event_subscriptions_unique ON event_subscriptions(subscriber_name, event_pattern);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Recent events
CREATE OR REPLACE VIEW v_events_recent AS
SELECT
  e.id,
  e.event_type,
  e.event_category,
  e.status,
  e.user_email,
  e.payload,
  e.created_at,
  up.full_name AS triggered_by
FROM events e
LEFT JOIN user_profiles up ON e.user_id = up.id
WHERE e.created_at > NOW() - INTERVAL '24 hours'
ORDER BY e.created_at DESC
LIMIT 100;

-- View: Failed events needing attention
CREATE OR REPLACE VIEW v_events_failed AS
SELECT
  e.id,
  e.event_type,
  e.status,
  e.retry_count,
  e.max_retries,
  e.next_retry_at,
  e.error_message,
  e.created_at,
  e.failed_at
FROM events e
WHERE e.status IN ('failed', 'dead_letter')
ORDER BY e.created_at DESC;

-- View: Event statistics by type
CREATE OR REPLACE VIEW v_event_stats_by_type AS
SELECT
  event_type,
  COUNT(*) AS total_events,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  COUNT(*) FILTER (WHERE status = 'dead_letter') AS dead_letter,
  AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) AS avg_processing_time_seconds,
  MAX(created_at) AS last_event_at
FROM events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY total_events DESC;

-- View: Subscriber performance
CREATE OR REPLACE VIEW v_subscriber_performance AS
SELECT
  es.subscriber_name,
  es.event_pattern,
  COUNT(edl.id) AS total_deliveries,
  COUNT(*) FILTER (WHERE edl.status = 'success') AS successful,
  COUNT(*) FILTER (WHERE edl.status = 'failure') AS failed,
  AVG(edl.duration_ms) AS avg_duration_ms,
  MAX(edl.attempted_at) AS last_delivery_at
FROM event_subscriptions es
LEFT JOIN event_delivery_log edl ON es.id = edl.subscription_id
WHERE edl.attempted_at > NOW() - INTERVAL '7 days'
GROUP BY es.id, es.subscriber_name, es.event_pattern
ORDER BY total_deliveries DESC;

-- ============================================================================
-- SEED DATA: Example subscriptions
-- ============================================================================

-- Example: Email notification service
INSERT INTO event_subscriptions (
  subscriber_name,
  event_pattern,
  webhook_url
) VALUES (
  'email_service',
  'user.created',
  'http://localhost:3000/api/webhooks/email'
) ON CONFLICT DO NOTHING;

-- Example: Analytics service (all events)
INSERT INTO event_subscriptions (
  subscriber_name,
  event_pattern,
  webhook_url
) VALUES (
  'analytics_service',
  '%', -- Match all events
  'http://localhost:3000/api/webhooks/analytics'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE events IS
'Event store for event-driven architecture. Uses PostgreSQL LISTEN/NOTIFY for real-time event propagation.';

COMMENT ON TABLE event_subscriptions IS
'Subscribers listening to event patterns. Supports both PostgreSQL functions and HTTP webhooks.';

COMMENT ON TABLE event_delivery_log IS
'Delivery attempts log for debugging and monitoring event processing.';

COMMENT ON FUNCTION publish_event IS
'Publish an event to the event bus. Triggers PostgreSQL NOTIFY for real-time processing.';

COMMENT ON FUNCTION replay_events IS
'Replay historical events for debugging or re-processing. Useful for recovering from failures.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Migration 005_create_event_bus.sql completed successfully!';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created: events, event_subscriptions, event_delivery_log';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  - publish_event() - Publish events with NOTIFY';
  RAISE NOTICE '  - mark_event_completed() - Mark events as processed';
  RAISE NOTICE '  - mark_event_failed() - Handle failures with retry logic';
  RAISE NOTICE '  - retry_failed_events() - Retry failed events';
  RAISE NOTICE '  - replay_events() - Replay historical events';
  RAISE NOTICE '  - subscribe_to_events() - Register event subscribers';
  RAISE NOTICE 'Views: v_events_recent, v_events_failed, v_event_stats_by_type, v_subscriber_performance';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'USAGE EXAMPLE:';
  RAISE NOTICE '  SELECT publish_event(';
  RAISE NOTICE '    ''user.created'',';
  RAISE NOTICE '    ''<user_id>'',';
  RAISE NOTICE '    ''{"name": "John Doe", "email": "john@example.com"}''::jsonb';
  RAISE NOTICE '  );';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Next: Run 006_rls_policies.sql';
  RAISE NOTICE '============================================================';
END $$;
