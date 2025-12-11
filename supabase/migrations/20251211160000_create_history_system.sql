-- ============================================
-- HISTORY-01: Unified Audit Trail System
-- ============================================
-- Creates entity_history, audit_log, system_events, and data_retention_policies tables
-- with partitioning and automatic status change capture triggers

-- Change type enum
CREATE TYPE history_change_type AS ENUM (
  'status_change', 'stage_change', 'owner_change', 'assignment_change',
  'score_change', 'priority_change', 'category_change', 'workflow_step', 'custom'
);

-- Event category enum
CREATE TYPE event_category AS ENUM (
  'security', 'data', 'system', 'integration', 'workflow'
);

-- Event severity enum (using different name to avoid conflict with existing)
CREATE TYPE event_severity AS ENUM (
  'debug', 'info', 'warning', 'error', 'critical'
);

-- ============================================
-- ENTITY HISTORY (Status/State Changes)
-- ============================================
-- Tracks business-level status and state changes for entities
-- Different from audit_logs which tracks DML operations

CREATE TABLE entity_history (
  id UUID DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Change details
  change_type history_change_type NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value VARCHAR(500),
  new_value VARCHAR(500),
  old_value_label VARCHAR(200),
  new_value_label VARCHAR(200),

  -- Context
  reason TEXT,
  comment TEXT,

  -- Related entities (correlation)
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  correlation_id UUID,

  -- Workflow context
  workflow_id UUID,
  workflow_step_id UUID,
  is_automated BOOLEAN DEFAULT false,

  -- Duration tracking
  time_in_previous_state INTERVAL,

  -- Who made the change
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Additional metadata
  metadata JSONB,

  -- Primary key must include partition column
  PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);

-- Create partitions (current month + next 3 months)
CREATE TABLE entity_history_2025_12 PARTITION OF entity_history
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE entity_history_2026_01 PARTITION OF entity_history
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE entity_history_2026_02 PARTITION OF entity_history
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE entity_history_2026_03 PARTITION OF entity_history
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Indexes (on partitioned table)
CREATE INDEX idx_entity_history_entity ON entity_history(entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_entity_history_field ON entity_history(entity_type, field_name, changed_at DESC);
CREATE INDEX idx_entity_history_user ON entity_history(changed_by, changed_at DESC);
CREATE INDEX idx_entity_history_correlation ON entity_history(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_entity_history_org_date ON entity_history(org_id, changed_at DESC);

-- Entity type validation trigger (validates against entity_type_registry if it exists)
CREATE OR REPLACE FUNCTION validate_history_entity_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if entity_type_registry exists and validate against it
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entity_type_registry') THEN
    IF NOT EXISTS (
      SELECT 1 FROM entity_type_registry
      WHERE entity_type = NEW.entity_type AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Invalid entity_type: %. Must be registered in entity_type_registry', NEW.entity_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entity_history_validate_entity_type
BEFORE INSERT OR UPDATE ON entity_history
FOR EACH ROW EXECUTE FUNCTION validate_history_entity_type();

-- RLS
ALTER TABLE entity_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entity_history_org_isolation" ON entity_history
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- AUDIT LOG (Field-Level Changes)
-- ============================================
-- Tracks field-level changes with GDPR support
-- Different from audit_logs (plural) which tracks system operations

CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Operation
  operation VARCHAR(20) NOT NULL,  -- 'create', 'update', 'delete', 'restore'

  -- Change details
  changes JSONB NOT NULL,  -- { field_name: { old: value, new: value } }
  change_count INTEGER,

  -- PII tracking (GDPR)
  contains_pii BOOLEAN DEFAULT false,
  pii_fields TEXT[],
  is_masked BOOLEAN DEFAULT false,

  -- Request context
  request_id UUID,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),

  -- User
  performed_by UUID REFERENCES user_profiles(id),
  performed_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Impersonation
  impersonated_by UUID REFERENCES user_profiles(id),

  -- Retention
  retention_until DATE,
  archived_at TIMESTAMPTZ,

  -- Primary key must include partition column
  PRIMARY KEY (id, performed_at),

  -- Constraints
  CONSTRAINT audit_log_operation_check CHECK (operation IN ('create', 'update', 'delete', 'restore'))
) PARTITION BY RANGE (performed_at);

-- Create partitions
CREATE TABLE audit_log_2025_12 PARTITION OF audit_log
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_log_2026_02 PARTITION OF audit_log
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit_log_2026_03 PARTITION OF audit_log
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Indexes
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id, performed_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(performed_by, performed_at DESC);
CREATE INDEX idx_audit_log_org_date ON audit_log(org_id, performed_at DESC);
CREATE INDEX idx_audit_log_pii ON audit_log(contains_pii, is_masked) WHERE contains_pii = true;
CREATE INDEX idx_audit_log_retention ON audit_log(retention_until) WHERE retention_until IS NOT NULL;

-- Entity type validation trigger
CREATE TRIGGER trg_audit_log_validate_entity_type
BEFORE INSERT OR UPDATE ON audit_log
FOR EACH ROW EXECUTE FUNCTION validate_history_entity_type();

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_org_isolation" ON audit_log
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- SYSTEM EVENTS (Application-Level)
-- ============================================

CREATE TABLE system_events (
  id UUID DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),  -- NULL for system-wide events

  -- Event identification
  event_type VARCHAR(100) NOT NULL,
  event_category event_category NOT NULL,

  -- Entity reference (optional)
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Event details
  details JSONB NOT NULL DEFAULT '{}',
  severity event_severity DEFAULT 'info',
  message TEXT,

  -- User context
  user_id UUID REFERENCES user_profiles(id),
  ip_address INET,
  user_agent TEXT,

  -- Request context
  request_id UUID,
  api_endpoint VARCHAR(200),
  http_method VARCHAR(10),

  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  duration_ms INTEGER,

  -- Primary key must include partition column
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Create partitions
CREATE TABLE system_events_2025_12 PARTITION OF system_events
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE system_events_2026_01 PARTITION OF system_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE system_events_2026_02 PARTITION OF system_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE system_events_2026_03 PARTITION OF system_events
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Indexes
CREATE INDEX idx_system_events_type ON system_events(event_type, occurred_at DESC);
CREATE INDEX idx_system_events_category ON system_events(event_category, occurred_at DESC);
CREATE INDEX idx_system_events_user ON system_events(user_id, occurred_at DESC);
CREATE INDEX idx_system_events_severity ON system_events(severity, occurred_at DESC)
  WHERE severity IN ('warning', 'error', 'critical');
CREATE INDEX idx_system_events_entity ON system_events(entity_type, entity_id, occurred_at DESC)
  WHERE entity_type IS NOT NULL;

-- RLS (system events can be org-scoped or global)
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_events_org_access" ON system_events
  FOR SELECT USING (
    org_id IS NULL  -- Global events visible to all
    OR org_id = (current_setting('app.org_id', true))::uuid
  );

-- ============================================
-- DATA RETENTION POLICIES
-- ============================================

CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- What to retain
  table_name VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),

  -- Retention rules
  retention_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  mask_pii_after_days INTEGER,

  -- Actions
  action_on_expiry VARCHAR(20) DEFAULT 'archive',  -- 'archive', 'delete', 'anonymize'

  -- Schedule
  last_processed_at TIMESTAMPTZ,
  processing_frequency VARCHAR(20) DEFAULT 'daily',

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),

  CONSTRAINT retention_policies_unique UNIQUE (org_id, table_name, entity_type),
  CONSTRAINT retention_policies_action_check CHECK (action_on_expiry IN ('archive', 'delete', 'anonymize'))
);

CREATE INDEX idx_retention_policies_active ON data_retention_policies(org_id) WHERE is_active = true;

ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retention_policies_org_isolation" ON data_retention_policies
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- AUTOMATIC HISTORY CAPTURE TRIGGER
-- ============================================

-- Generic status change capture function
CREATE OR REPLACE FUNCTION capture_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_type VARCHAR;
  v_field_name VARCHAR;
  v_old_value VARCHAR;
  v_new_value VARCHAR;
BEGIN
  -- Get entity type from trigger argument
  v_entity_type := TG_ARGV[0];
  v_field_name := COALESCE(TG_ARGV[1], 'status');  -- Default 'status'

  -- Get old and new values dynamically
  EXECUTE format('SELECT ($1).%I::varchar', v_field_name) INTO v_old_value USING OLD;
  EXECUTE format('SELECT ($1).%I::varchar', v_field_name) INTO v_new_value USING NEW;

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
      COALESCE(NEW.updated_by, (current_setting('app.user_id', true))::uuid),
      now(),
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to key tables
-- Jobs
DROP TRIGGER IF EXISTS trg_jobs_status_history ON jobs;
CREATE TRIGGER trg_jobs_status_history
AFTER UPDATE ON jobs
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION capture_status_change('job', 'status');

-- Submissions
DROP TRIGGER IF EXISTS trg_submissions_status_history ON submissions;
CREATE TRIGGER trg_submissions_status_history
AFTER UPDATE ON submissions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION capture_status_change('submission', 'status');

-- Deals
DROP TRIGGER IF EXISTS trg_deals_stage_history ON deals;
CREATE TRIGGER trg_deals_stage_history
AFTER UPDATE ON deals
FOR EACH ROW
WHEN (OLD.stage IS DISTINCT FROM NEW.stage)
EXECUTE FUNCTION capture_status_change('deal', 'stage');

-- Placements
DROP TRIGGER IF EXISTS trg_placements_status_history ON placements;
CREATE TRIGGER trg_placements_status_history
AFTER UPDATE ON placements
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION capture_status_change('placement', 'status');

-- Comments
COMMENT ON TABLE entity_history IS 'Unified status/state change history for all entities (HISTORY-01)';
COMMENT ON TABLE audit_log IS 'Field-level change audit log with GDPR support (HISTORY-01)';
COMMENT ON TABLE system_events IS 'Application-level events and system logs (HISTORY-01)';
COMMENT ON TABLE data_retention_policies IS 'GDPR/compliance data retention configuration (HISTORY-01)';
