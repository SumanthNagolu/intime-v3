-- ============================================================================
-- Migration: SLA (Service Level Agreement) System
-- 
-- Implements: src/types/core/sla.types.ts
-- 
-- This migration creates the SLA tracking system for monitoring
-- time-sensitive business operations.
--
-- Tables created:
--   - sla_definitions: SLA configuration and thresholds
--   - sla_tracking: Active SLA tracking records
--   - sla_violations: Record of SLA breaches
-- ============================================================================

-- ============================================================================
-- SLA DEFINITIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What this SLA applies to
  entity_type TEXT NOT NULL,
  metric TEXT NOT NULL,

  -- Thresholds (in hours)
  warning_threshold INTEGER NOT NULL,
  breach_threshold INTEGER NOT NULL,

  -- Notification Configuration
  notify_on_warning BOOLEAN DEFAULT TRUE,
  notify_on_breach BOOLEAN DEFAULT TRUE,
  warning_recipients TEXT[] DEFAULT '{}',
  breach_recipients TEXT[] DEFAULT '{}',

  -- Configuration
  is_active BOOLEAN DEFAULT TRUE,
  business_hours_only BOOLEAN DEFAULT TRUE,
  exclude_weekends BOOLEAN DEFAULT TRUE,

  -- Display
  name TEXT,
  description TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sla_definitions_org_id ON sla_definitions(org_id);
CREATE INDEX IF NOT EXISTS idx_sla_definitions_entity_metric ON sla_definitions(entity_type, metric);
CREATE INDEX IF NOT EXISTS idx_sla_definitions_active ON sla_definitions(is_active);

-- Unique constraint: one SLA per entity type + metric per org
CREATE UNIQUE INDEX IF NOT EXISTS idx_sla_definitions_org_entity_metric 
  ON sla_definitions(org_id, entity_type, metric);

-- Comment
COMMENT ON TABLE sla_definitions IS 'SLA configuration and thresholds per entity type and metric';

-- ============================================================================
-- SLA TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- References
  definition_id UUID NOT NULL REFERENCES sla_definitions(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metric TEXT NOT NULL,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  warning_at TIMESTAMPTZ NOT NULL,
  breach_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'warning', 'breach', 'completed')),

  -- Results (when completed)
  was_breached BOOLEAN,
  actual_duration_hours NUMERIC(10, 2),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sla_tracking_org_id ON sla_tracking(org_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_entity ON sla_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_status ON sla_tracking(status);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_breach_at ON sla_tracking(breach_at);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_warning_at ON sla_tracking(warning_at);

-- Active SLA tracking per entity (for efficient lookups)
CREATE INDEX IF NOT EXISTS idx_sla_tracking_active 
  ON sla_tracking(entity_type, entity_id, status)
  WHERE status IN ('on_track', 'warning', 'breach');

-- Comment
COMMENT ON TABLE sla_tracking IS 'Active SLA tracking records for entities';

-- ============================================================================
-- SLA VIOLATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS sla_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- References
  tracking_id UUID NOT NULL REFERENCES sla_tracking(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metric TEXT NOT NULL,

  -- Violation details
  violation_type TEXT NOT NULL CHECK (violation_type IN ('warning', 'breach')),
  occurred_at TIMESTAMPTZ NOT NULL,
  threshold_hours INTEGER NOT NULL,
  actual_hours NUMERIC(10, 2) NOT NULL,

  -- Notifications
  notifications_sent TEXT[] DEFAULT '{}',

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),
  resolution_notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sla_violations_org_id ON sla_violations(org_id);
CREATE INDEX IF NOT EXISTS idx_sla_violations_entity ON sla_violations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sla_violations_type ON sla_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_sla_violations_occurred_at ON sla_violations(occurred_at);
CREATE INDEX IF NOT EXISTS idx_sla_violations_unresolved 
  ON sla_violations(entity_type, entity_id)
  WHERE resolved_at IS NULL;

-- Comment
COMMENT ON TABLE sla_violations IS 'Record of SLA warning and breach events';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated at trigger for sla_definitions
CREATE OR REPLACE FUNCTION sla_definitions_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sla_definitions_updated_at ON sla_definitions;
CREATE TRIGGER sla_definitions_updated_at
  BEFORE UPDATE ON sla_definitions
  FOR EACH ROW
  EXECUTE FUNCTION sla_definitions_updated_at_trigger();

-- Updated at trigger for sla_tracking
DROP TRIGGER IF EXISTS sla_tracking_updated_at ON sla_tracking;
CREATE TRIGGER sla_tracking_updated_at
  BEFORE UPDATE ON sla_tracking
  FOR EACH ROW
  EXECUTE FUNCTION sla_definitions_updated_at_trigger();

-- Auto-update SLA status based on completion
CREATE OR REPLACE FUNCTION update_sla_status_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.status := 'completed';
    NEW.was_breached := NEW.completed_at > OLD.breach_at;
    NEW.actual_duration_hours := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sla_tracking_update_status ON sla_tracking;
CREATE TRIGGER sla_tracking_update_status
  BEFORE UPDATE ON sla_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_status_on_complete();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE sla_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_violations ENABLE ROW LEVEL SECURITY;

-- Organization isolation for sla_definitions
DROP POLICY IF EXISTS sla_definitions_org_isolation ON sla_definitions;
CREATE POLICY sla_definitions_org_isolation ON sla_definitions
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

-- Organization isolation for sla_tracking
DROP POLICY IF EXISTS sla_tracking_org_isolation ON sla_tracking;
CREATE POLICY sla_tracking_org_isolation ON sla_tracking
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

-- Organization isolation for sla_violations
DROP POLICY IF EXISTS sla_violations_org_isolation ON sla_violations;
CREATE POLICY sla_violations_org_isolation ON sla_violations
  FOR ALL
  USING (org_id = COALESCE(
    (current_setting('app.current_org_id', true))::uuid,
    (auth.jwt() ->> 'org_id')::uuid
  ));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Start SLA tracking for an entity
CREATE OR REPLACE FUNCTION start_sla_tracking(
  p_org_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_metric TEXT
)
RETURNS UUID AS $$
DECLARE
  v_definition sla_definitions%ROWTYPE;
  v_tracking_id UUID;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Get SLA definition
  SELECT * INTO v_definition
  FROM sla_definitions
  WHERE org_id = p_org_id
    AND entity_type = p_entity_type
    AND metric = p_metric
    AND is_active = TRUE
  LIMIT 1;
  
  IF v_definition IS NULL THEN
    -- No SLA defined, skip tracking
    RETURN NULL;
  END IF;
  
  -- Create tracking record
  INSERT INTO sla_tracking (
    org_id, definition_id, entity_type, entity_id, metric,
    started_at, warning_at, breach_at, status
  ) VALUES (
    p_org_id, v_definition.id, p_entity_type, p_entity_id, p_metric,
    v_now,
    v_now + (v_definition.warning_threshold || ' hours')::INTERVAL,
    v_now + (v_definition.breach_threshold || ' hours')::INTERVAL,
    'on_track'
  )
  RETURNING id INTO v_tracking_id;
  
  RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete SLA tracking
CREATE OR REPLACE FUNCTION complete_sla_tracking(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_metric TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE sla_tracking
  SET completed_at = NOW()
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND metric = p_metric
    AND status != 'completed';
    
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and update SLA statuses (run periodically)
CREATE OR REPLACE FUNCTION check_sla_statuses()
RETURNS TABLE (
  tracking_id UUID,
  entity_type TEXT,
  entity_id UUID,
  old_status TEXT,
  new_status TEXT
) AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT t.*, d.warning_recipients, d.breach_recipients
    FROM sla_tracking t
    JOIN sla_definitions d ON d.id = t.definition_id
    WHERE t.status IN ('on_track', 'warning')
      AND t.completed_at IS NULL
  LOOP
    -- Check for breach
    IF v_now >= v_row.breach_at AND v_row.status != 'breach' THEN
      UPDATE sla_tracking SET status = 'breach' WHERE id = v_row.id;
      
      -- Log violation
      INSERT INTO sla_violations (
        org_id, tracking_id, entity_type, entity_id, metric,
        violation_type, occurred_at, threshold_hours, actual_hours
      ) VALUES (
        v_row.org_id, v_row.id, v_row.entity_type, v_row.entity_id, v_row.metric,
        'breach', v_now,
        EXTRACT(EPOCH FROM (v_row.breach_at - v_row.started_at)) / 3600,
        EXTRACT(EPOCH FROM (v_now - v_row.started_at)) / 3600
      );
      
      tracking_id := v_row.id;
      entity_type := v_row.entity_type;
      entity_id := v_row.entity_id;
      old_status := v_row.status;
      new_status := 'breach';
      RETURN NEXT;
      
    -- Check for warning
    ELSIF v_now >= v_row.warning_at AND v_row.status = 'on_track' THEN
      UPDATE sla_tracking SET status = 'warning' WHERE id = v_row.id;
      
      -- Log violation
      INSERT INTO sla_violations (
        org_id, tracking_id, entity_type, entity_id, metric,
        violation_type, occurred_at, threshold_hours, actual_hours
      ) VALUES (
        v_row.org_id, v_row.id, v_row.entity_type, v_row.entity_id, v_row.metric,
        'warning', v_now,
        EXTRACT(EPOCH FROM (v_row.warning_at - v_row.started_at)) / 3600,
        EXTRACT(EPOCH FROM (v_now - v_row.started_at)) / 3600
      );
      
      tracking_id := v_row.id;
      entity_type := v_row.entity_type;
      entity_id := v_row.entity_id;
      old_status := v_row.status;
      new_status := 'warning';
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get SLA summary for entity
CREATE OR REPLACE FUNCTION get_sla_summary(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE (
  total_slas INTEGER,
  on_track INTEGER,
  warnings INTEGER,
  breaches INTEGER,
  completed INTEGER,
  compliance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_slas,
    COUNT(*) FILTER (WHERE status = 'on_track')::INTEGER as on_track,
    COUNT(*) FILTER (WHERE status = 'warning')::INTEGER as warnings,
    COUNT(*) FILTER (WHERE status = 'breach')::INTEGER as breaches,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE status = 'completed' AND was_breached = FALSE) 
      / NULLIF(COUNT(*) FILTER (WHERE status = 'completed'), 0),
      1
    )::NUMERIC as compliance_rate
  FROM sla_tracking
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DEFAULT SLA DEFINITIONS
-- ============================================================================

-- This will be done per-organization during onboarding
-- Example for reference:
/*
INSERT INTO sla_definitions (org_id, entity_type, metric, warning_threshold, breach_threshold, warning_recipients, breach_recipients, name)
VALUES
  -- Candidate SLAs
  ('ORG_ID', 'candidate', 'first_contact', 4, 24, '{"owner"}', '{"owner", "manager"}', 'First Contact SLA'),
  
  -- Job SLAs
  ('ORG_ID', 'job', 'first_submission', 72, 120, '{"owner"}', '{"owner", "manager", "coo"}', 'First Submission SLA'),
  
  -- Submission SLAs
  ('ORG_ID', 'submission', 'client_response', 24, 48, '{"owner"}', '{"owner", "manager"}', 'Client Response SLA'),
  
  -- Placement SLAs
  ('ORG_ID', 'placement', 'day1_checkin', 8, 24, '{"owner"}', '{"owner", "manager"}', 'Day 1 Check-in SLA');
*/

-- ============================================================================
-- DONE
-- ============================================================================

-- Grant permissions
GRANT ALL ON sla_definitions TO authenticated;
GRANT ALL ON sla_tracking TO authenticated;
GRANT ALL ON sla_violations TO authenticated;

