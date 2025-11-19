-- ============================================================================
-- Rollback Migration: 005_create_event_bus_rollback
-- Description: Remove event bus tables, functions, and views
-- Created: 2025-11-18
-- ============================================================================

-- Drop views
DROP VIEW IF EXISTS v_subscriber_performance CASCADE;
DROP VIEW IF EXISTS v_event_stats_by_type CASCADE;
DROP VIEW IF EXISTS v_events_failed CASCADE;
DROP VIEW IF EXISTS v_events_recent CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_event_subscriptions_updated_at ON event_subscriptions;

-- Drop functions
DROP FUNCTION IF EXISTS subscribe_to_events(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS replay_events(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS retry_failed_events() CASCADE;
DROP FUNCTION IF EXISTS mark_event_failed(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS mark_event_completed(UUID) CASCADE;
DROP FUNCTION IF EXISTS publish_event(TEXT, UUID, JSONB, UUID, JSONB) CASCADE;
DROP FUNCTION IF EXISTS update_event_subscriptions_updated_at() CASCADE;

-- Drop tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS event_delivery_log CASCADE;
DROP TABLE IF EXISTS event_subscriptions CASCADE;
DROP TABLE IF EXISTS events CASCADE;

RAISE NOTICE 'Event bus rollback completed!';
