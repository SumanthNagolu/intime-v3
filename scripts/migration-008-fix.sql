-- Migration 008: Fix - Add org_id with proper handling of existing data

-- 1. Add org_id as nullable first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_subscriptions' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE event_subscriptions
    ADD COLUMN org_id UUID;

    -- Get the default organization ID
    UPDATE event_subscriptions
    SET org_id = (SELECT id FROM organizations ORDER BY created_at LIMIT 1)
    WHERE org_id IS NULL;

    -- Now make it NOT NULL
    ALTER TABLE event_subscriptions
    ALTER COLUMN org_id SET NOT NULL;

    -- Add foreign key
    ALTER TABLE event_subscriptions
    ADD CONSTRAINT event_subscriptions_org_id_fkey
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;

    -- Add index
    CREATE INDEX idx_event_subscriptions_org_id ON event_subscriptions(org_id);

    COMMENT ON COLUMN event_subscriptions.org_id IS 'Organization this subscription belongs to';
  END IF;
END $$;

-- 2. Create admin functions
CREATE OR REPLACE FUNCTION admin_get_event_stats(p_org_id UUID DEFAULT NULL)
RETURNS JSON AS $$
SELECT json_build_object(
  'total_events', COUNT(*),
  'pending', COUNT(*) FILTER (WHERE status = 'pending'),
  'processing', COUNT(*) FILTER (WHERE status = 'processing'),
  'completed', COUNT(*) FILTER (WHERE status = 'completed'),
  'failed', COUNT(*) FILTER (WHERE status = 'failed'),
  'dead_letter', COUNT(*) FILTER (WHERE status = 'dead_letter')
)
FROM events
WHERE p_org_id IS NULL OR org_id = p_org_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_get_handler_stats(p_org_id UUID DEFAULT NULL)
RETURNS JSON AS $$
SELECT json_build_object(
  'total_handlers', COUNT(*),
  'active', COUNT(*) FILTER (WHERE is_active = true),
  'disabled', COUNT(*) FILTER (WHERE is_active = false),
  'avg_failure_rate', AVG(failure_count)::numeric(10,2)
)
FROM event_subscriptions
WHERE p_org_id IS NULL OR org_id = p_org_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_disable_handler(p_handler_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
UPDATE event_subscriptions
SET
  is_active = false,
  auto_disabled_at = NOW(),
  last_failure_message = COALESCE(p_reason, 'Manually disabled by admin')
WHERE id = p_handler_id
RETURNING true;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_enable_handler(p_handler_id UUID)
RETURNS BOOLEAN AS $$
UPDATE event_subscriptions
SET
  is_active = true,
  consecutive_failures = 0,
  auto_disabled_at = NULL
WHERE id = p_handler_id
RETURNING true;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_replay_events(p_event_ids UUID[])
RETURNS SETOF events AS $$
UPDATE events
SET
  status = 'pending',
  retry_count = 0,
  next_retry_at = NULL,
  error_message = NULL
WHERE id = ANY(p_event_ids)
  AND status IN ('failed', 'dead_letter')
RETURNING *;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 3. RLS policies
DROP POLICY IF EXISTS event_subscriptions_select ON event_subscriptions;
CREATE POLICY event_subscriptions_select ON event_subscriptions
  FOR SELECT
  USING (
    auth_user_org_id() = org_id
    OR user_is_admin()
  );

DROP POLICY IF EXISTS event_subscriptions_insert ON event_subscriptions;
CREATE POLICY event_subscriptions_insert ON event_subscriptions
  FOR INSERT
  WITH CHECK (
    auth_user_org_id() = org_id
    OR user_is_admin()
  );

SELECT '✅ Migration 008 completed successfully' AS result;
