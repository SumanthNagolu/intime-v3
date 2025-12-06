-- ============================================================================
-- Migration: Enhanced SLA Configuration System
--
-- Enhances existing SLA tables to support:
-- - Multi-level escalations (not just warning/breach)
-- - Configurable start/end events
-- - Time units (hours, business_hours, days, business_days)
-- - Per-level notifications and actions
-- ============================================================================

-- ============================================================================
-- ENHANCED SLA RULES TABLE
-- ============================================================================

-- Add new columns to sla_definitions (keeping existing for compatibility)
ALTER TABLE sla_definitions
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS start_event TEXT,
ADD COLUMN IF NOT EXISTS end_event TEXT,
ADD COLUMN IF NOT EXISTS target_value INTEGER,
ADD COLUMN IF NOT EXISTS target_unit TEXT DEFAULT 'business_hours',
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS pause_on_hold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS apply_retroactive BOOLEAN DEFAULT false;

-- Add constraint for target_unit (drop first if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sla_definitions_target_unit_check'
  ) THEN
    ALTER TABLE sla_definitions
    ADD CONSTRAINT sla_definitions_target_unit_check
    CHECK (target_unit IS NULL OR target_unit IN ('minutes', 'hours', 'business_hours', 'days', 'business_days', 'weeks'));
  END IF;
END $$;

-- Add constraint for status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sla_definitions_status_check'
  ) THEN
    ALTER TABLE sla_definitions
    ADD CONSTRAINT sla_definitions_status_check
    CHECK (status IS NULL OR status IN ('draft', 'active', 'disabled'));
  END IF;
END $$;

-- Update index for status filtering
CREATE INDEX IF NOT EXISTS idx_sla_definitions_status ON sla_definitions(org_id, status);

-- ============================================================================
-- SLA ESCALATION LEVELS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_escalation_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_definition_id UUID NOT NULL REFERENCES sla_definitions(id) ON DELETE CASCADE,

  -- Level configuration
  level_number INTEGER NOT NULL CHECK (level_number >= 1 AND level_number <= 10),
  level_name TEXT NOT NULL, -- 'warning', 'breach', 'critical', or custom
  trigger_percentage INTEGER NOT NULL CHECK (trigger_percentage >= 1 AND trigger_percentage <= 500),

  -- Notifications
  notify_email BOOLEAN DEFAULT true,
  notify_slack BOOLEAN DEFAULT false,
  notify_sms BOOLEAN DEFAULT false,
  email_recipients TEXT[] DEFAULT '{}', -- 'owner', 'owners_manager', 'pod_manager', or user IDs
  slack_channel TEXT,
  sms_recipients TEXT[] DEFAULT '{}',

  -- Actions
  show_badge BOOLEAN DEFAULT true,
  badge_color TEXT DEFAULT 'yellow', -- 'yellow', 'orange', 'red'
  add_to_report BOOLEAN DEFAULT false,
  add_to_dashboard BOOLEAN DEFAULT false,
  create_task BOOLEAN DEFAULT false,
  task_assignee TEXT, -- 'owner', 'owners_manager', or user ID
  escalate_ownership BOOLEAN DEFAULT false,
  escalate_to TEXT, -- 'pod_manager', 'regional_director', or user ID
  block_actions BOOLEAN DEFAULT false,
  require_resolution_notes BOOLEAN DEFAULT false,
  flag_for_review BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(sla_definition_id, level_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sla_escalation_levels_definition
ON sla_escalation_levels(sla_definition_id);

-- Comment
COMMENT ON TABLE sla_escalation_levels IS 'Multi-level escalation configuration for SLA rules';

-- ============================================================================
-- SLA EVENTS TABLE (Enhanced tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sla_definition_id UUID NOT NULL REFERENCES sla_definitions(id) ON DELETE CASCADE,

  -- Entity reference
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ, -- When SLA was met
  target_deadline TIMESTAMPTZ NOT NULL,

  -- Status tracking
  elapsed_minutes INTEGER DEFAULT 0,
  current_percentage NUMERIC(6,2) DEFAULT 0,
  current_level INTEGER DEFAULT 0, -- 0 = no escalation yet
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'warning', 'breach', 'critical', 'met', 'cancelled'
  )),

  -- Resolution
  met_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate tracking
  UNIQUE(sla_definition_id, entity_type, entity_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sla_events_org_status ON sla_events(org_id, status);
CREATE INDEX IF NOT EXISTS idx_sla_events_entity ON sla_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sla_events_deadline ON sla_events(target_deadline) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sla_events_active
ON sla_events(org_id, status) WHERE status IN ('pending', 'warning', 'breach');

-- Comment
COMMENT ON TABLE sla_events IS 'Individual SLA tracking events for entity records';

-- ============================================================================
-- SLA NOTIFICATIONS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_event_id UUID NOT NULL REFERENCES sla_events(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'slack', 'sms', 'in_app')),
  recipients TEXT[] NOT NULL,

  -- Delivery status
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,

  -- External tracking
  external_message_id TEXT
);

-- Index for avoiding duplicate notifications
CREATE INDEX IF NOT EXISTS idx_sla_notifications_event_level
ON sla_notifications(sla_event_id, escalation_level, notification_type);

-- Comment
COMMENT ON TABLE sla_notifications IS 'Log of sent SLA notifications for audit trail';

-- ============================================================================
-- SLA SCHEDULED RUNS (for tracking background job)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_scheduled_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_run_at TIMESTAMPTZ NOT NULL,
  rules_checked INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  errors TEXT[],
  run_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comment
COMMENT ON TABLE sla_scheduled_runs IS 'Tracking table for SLA monitoring background job runs';

-- ============================================================================
-- ORGANIZATION BUSINESS HOURS (if not exists)
-- ============================================================================

-- Add business hours config to organizations if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'business_hours_start'
  ) THEN
    ALTER TABLE organizations
    ADD COLUMN business_hours_start TIME DEFAULT '09:00',
    ADD COLUMN business_hours_end TIME DEFAULT '17:00',
    ADD COLUMN business_timezone TEXT DEFAULT 'America/New_York',
    ADD COLUMN holiday_calendar JSONB DEFAULT '[]';
  END IF;
END $$;

-- ============================================================================
-- UPDATED AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_sla_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sla_escalation_levels_updated_at ON sla_escalation_levels;
CREATE TRIGGER sla_escalation_levels_updated_at
  BEFORE UPDATE ON sla_escalation_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_updated_at();

DROP TRIGGER IF EXISTS sla_events_updated_at ON sla_events;
CREATE TRIGGER sla_events_updated_at
  BEFORE UPDATE ON sla_events
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE sla_escalation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_notifications ENABLE ROW LEVEL SECURITY;

-- Escalation levels inherit from parent definition
DROP POLICY IF EXISTS sla_escalation_levels_org_isolation ON sla_escalation_levels;
CREATE POLICY sla_escalation_levels_org_isolation ON sla_escalation_levels
  FOR ALL
  USING (
    sla_definition_id IN (
      SELECT id FROM sla_definitions
      WHERE org_id = COALESCE(
        (current_setting('app.current_org_id', true))::uuid,
        (auth.jwt() ->> 'org_id')::uuid
      )
    )
  );

DROP POLICY IF EXISTS sla_events_org_isolation ON sla_events;
CREATE POLICY sla_events_org_isolation ON sla_events
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

DROP POLICY IF EXISTS sla_notifications_org_isolation ON sla_notifications;
CREATE POLICY sla_notifications_org_isolation ON sla_notifications
  FOR ALL
  USING (
    sla_event_id IN (
      SELECT id FROM sla_events
      WHERE org_id = COALESCE(
        (current_setting('app.current_org_id', true))::uuid,
        (auth.jwt() ->> 'org_id')::uuid
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get SLA statistics for dashboard
CREATE OR REPLACE FUNCTION get_sla_stats(p_org_id UUID)
RETURNS TABLE (
  total_rules INTEGER,
  active_rules INTEGER,
  draft_rules INTEGER,
  disabled_rules INTEGER,
  pending_events INTEGER,
  warning_events INTEGER,
  breach_events INTEGER,
  met_today INTEGER,
  breached_today INTEGER,
  compliance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH rule_counts AS (
    SELECT
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active,
      COUNT(*) FILTER (WHERE status = 'draft')::INTEGER as draft,
      COUNT(*) FILTER (WHERE status = 'disabled')::INTEGER as disabled
    FROM sla_definitions
    WHERE org_id = p_org_id AND is_active = true
  ),
  event_counts AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending,
      COUNT(*) FILTER (WHERE status = 'warning')::INTEGER as warning,
      COUNT(*) FILTER (WHERE status IN ('breach', 'critical'))::INTEGER as breach,
      COUNT(*) FILTER (WHERE status = 'met' AND met_at >= CURRENT_DATE)::INTEGER as met_today,
      COUNT(*) FILTER (WHERE status IN ('breach', 'critical') AND updated_at >= CURRENT_DATE)::INTEGER as breached_today
    FROM sla_events
    WHERE org_id = p_org_id
  ),
  compliance AS (
    SELECT
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'met')
        / NULLIF(COUNT(*) FILTER (WHERE status IN ('met', 'breach', 'critical')), 0),
        1
      )::NUMERIC as rate
    FROM sla_events
    WHERE org_id = p_org_id
      AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
  )
  SELECT
    rc.total, rc.active, rc.draft, rc.disabled,
    ec.pending, ec.warning, ec.breach, ec.met_today, ec.breached_today,
    COALESCE(c.rate, 0)
  FROM rule_counts rc, event_counts ec, compliance c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON sla_escalation_levels TO authenticated;
GRANT ALL ON sla_events TO authenticated;
GRANT ALL ON sla_notifications TO authenticated;
GRANT ALL ON sla_scheduled_runs TO service_role;
GRANT EXECUTE ON FUNCTION get_sla_stats(UUID) TO authenticated;

-- ============================================================================
-- DONE
-- ============================================================================

COMMENT ON FUNCTION get_sla_stats IS 'Returns SLA dashboard statistics for an organization';
