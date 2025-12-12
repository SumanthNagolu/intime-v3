-- ============================================
-- RATES-01: Unified Rate Cards & Billing System
-- Creates rate_cards, rate_card_items, entity_rates, rate_change_history
-- with versioning and margin calculations
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE rate_card_type AS ENUM (
    'standard', 'msp', 'vms', 'preferred', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rate_unit AS ENUM (
    'hourly', 'daily', 'weekly', 'monthly', 'annual', 'fixed', 'retainer', 'project'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- RATE CARDS (Master Definitions)
-- ============================================

CREATE TABLE IF NOT EXISTS rate_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  rate_card_name VARCHAR(200) NOT NULL,
  rate_card_code VARCHAR(50),

  -- Polymorphic ownership (who this rate card belongs to)
  entity_type VARCHAR(50) NOT NULL, -- 'company', 'organization', 'job'
  entity_id UUID NOT NULL,

  -- Classification
  rate_card_type rate_card_type DEFAULT 'standard',
  currency VARCHAR(3) DEFAULT 'USD',

  -- Versioning
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_latest_version BOOLEAN DEFAULT true,
  previous_version_id UUID REFERENCES rate_cards(id),

  -- Effective dates
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,

  -- Approval
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),

  -- Default multipliers
  overtime_multiplier NUMERIC(4,2) DEFAULT 1.5,
  double_time_multiplier NUMERIC(4,2) DEFAULT 2.0,
  holiday_multiplier NUMERIC(4,2) DEFAULT 1.5,

  -- Default margins
  default_markup_percentage NUMERIC(5,2),
  min_margin_percentage NUMERIC(5,2) DEFAULT 10.0,
  target_margin_percentage NUMERIC(5,2) DEFAULT 20.0,

  -- MSP/VMS specific
  msp_program_name VARCHAR(200),
  msp_tier VARCHAR(50),
  vms_platform VARCHAR(100),
  vms_fee_percentage NUMERIC(5,2),

  -- Direct hire
  direct_hire_fee_percentage NUMERIC(5,2),
  direct_hire_fee_flat NUMERIC(10,2),

  -- Applicable scope
  applicable_regions TEXT[],
  applicable_job_categories TEXT[],

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT rate_cards_code_unique UNIQUE (org_id, rate_card_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_cards_org ON rate_cards(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_cards_entity ON rate_cards(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_cards_active ON rate_cards(entity_type, entity_id, is_active) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_cards_effective ON rate_cards(effective_start_date, effective_end_date) WHERE deleted_at IS NULL;

-- Unique active rate card per entity
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_cards_unique_active
ON rate_cards(entity_type, entity_id)
WHERE is_active = true AND is_latest_version = true AND deleted_at IS NULL;

-- Entity type validation trigger
CREATE TRIGGER trg_rate_cards_validate_entity_type
BEFORE INSERT OR UPDATE ON rate_cards
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
CREATE TRIGGER trg_rate_cards_updated_at
BEFORE UPDATE ON rate_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RATE CARD ITEMS (Line Items)
-- ============================================

CREATE TABLE IF NOT EXISTS rate_card_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,

  -- Classification
  job_category VARCHAR(100), -- 'software_engineer', 'data_analyst', 'project_manager'
  job_level VARCHAR(50), -- 'junior', 'mid', 'senior', 'lead', 'principal', 'executive'
  job_family VARCHAR(100), -- 'engineering', 'design', 'operations', 'finance'
  skill_id UUID, -- Optional: specific skill-based rate

  -- Rate unit
  rate_unit rate_unit DEFAULT 'hourly',

  -- Pay rates (what we pay)
  min_pay_rate NUMERIC(10,2),
  max_pay_rate NUMERIC(10,2),
  target_pay_rate NUMERIC(10,2),

  -- Bill rates (what we charge)
  min_bill_rate NUMERIC(10,2),
  max_bill_rate NUMERIC(10,2),
  standard_bill_rate NUMERIC(10,2),

  -- Calculated fields
  calculated_markup NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN target_pay_rate > 0 AND target_pay_rate IS NOT NULL
    THEN ROUND(((standard_bill_rate - target_pay_rate) / target_pay_rate * 100), 2)
    ELSE NULL END
  ) STORED,

  calculated_margin NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN standard_bill_rate > 0 AND standard_bill_rate IS NOT NULL
    THEN ROUND(((standard_bill_rate - target_pay_rate) / standard_bill_rate * 100), 2)
    ELSE NULL END
  ) STORED,

  -- Target margins
  target_margin_percentage NUMERIC(5,2),
  min_margin_percentage NUMERIC(5,2),

  -- Qualifications for this rate
  requires_certification BOOLEAN DEFAULT false,
  requires_clearance BOOLEAN DEFAULT false,
  clearance_level VARCHAR(50),
  min_years_experience INTEGER,

  -- Notes
  notes TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rate_card_items_card ON rate_card_items(rate_card_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_card_items_category ON rate_card_items(job_category, job_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rate_card_items_skill ON rate_card_items(skill_id) WHERE skill_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================
-- ENTITY RATES (Specific Rates for Entities)
-- ============================================

CREATE TABLE IF NOT EXISTS entity_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Who this rate applies to
  entity_type VARCHAR(50) NOT NULL, -- 'contact', 'placement', 'submission', 'offer'
  entity_id UUID NOT NULL,

  -- Source rate card (optional)
  rate_card_id UUID REFERENCES rate_cards(id),
  rate_card_item_id UUID REFERENCES rate_card_items(id),

  -- Rate details
  rate_unit rate_unit DEFAULT 'hourly',
  currency VARCHAR(3) DEFAULT 'USD',

  -- Actual rates
  bill_rate NUMERIC(10,2) NOT NULL,
  pay_rate NUMERIC(10,2) NOT NULL,

  -- Calculated margins (GENERATED columns)
  gross_margin NUMERIC(10,2) GENERATED ALWAYS AS (bill_rate - pay_rate) STORED,
  margin_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN bill_rate > 0 THEN ROUND(((bill_rate - pay_rate) / bill_rate * 100), 2) ELSE 0 END
  ) STORED,
  markup_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN pay_rate > 0 THEN ROUND(((bill_rate - pay_rate) / pay_rate * 100), 2) ELSE 0 END
  ) STORED,

  -- OT/DT rates
  ot_bill_rate NUMERIC(10,2),
  ot_pay_rate NUMERIC(10,2),
  dt_bill_rate NUMERIC(10,2),
  dt_pay_rate NUMERIC(10,2),

  -- Effective dates
  effective_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,

  -- Negotiation tracking
  original_bill_rate NUMERIC(10,2),
  original_pay_rate NUMERIC(10,2),
  negotiated_by UUID REFERENCES user_profiles(id),
  negotiation_notes TEXT,

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),
  approval_notes TEXT,

  -- Context
  context_job_id UUID,
  context_client_id UUID,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entity_rates_org ON entity_rates(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_rates_entity ON entity_rates(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_rates_current ON entity_rates(entity_type, entity_id) WHERE is_current = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_rates_card ON entity_rates(rate_card_id) WHERE rate_card_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_entity_rates_margin ON entity_rates(margin_percentage) WHERE deleted_at IS NULL;

-- Entity type validation trigger
CREATE TRIGGER trg_entity_rates_validate_entity_type
BEFORE INSERT OR UPDATE ON entity_rates
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
CREATE TRIGGER trg_entity_rates_updated_at
BEFORE UPDATE ON entity_rates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RATE CHANGE HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS rate_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_rate_id UUID NOT NULL REFERENCES entity_rates(id) ON DELETE CASCADE,

  change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'approved', 'rejected', 'expired'

  old_bill_rate NUMERIC(10,2),
  new_bill_rate NUMERIC(10,2),
  old_pay_rate NUMERIC(10,2),
  new_pay_rate NUMERIC(10,2),

  reason TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT rate_change_history_type_check CHECK (change_type IN (
    'created', 'updated', 'approved', 'rejected', 'expired', 'negotiated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_rate_change_history_rate ON rate_change_history(entity_rate_id, changed_at DESC);

-- ============================================
-- RATE APPROVALS
-- ============================================

CREATE TABLE IF NOT EXISTS rate_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  entity_rate_id UUID NOT NULL REFERENCES entity_rates(id) ON DELETE CASCADE,

  -- Approval type
  approval_type VARCHAR(50) NOT NULL, -- 'margin_exception', 'rate_change', 'new_rate', 'below_minimum'

  -- Request
  requested_by UUID REFERENCES user_profiles(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  justification TEXT,

  -- Proposed rates
  proposed_bill_rate NUMERIC(10,2),
  proposed_pay_rate NUMERIC(10,2),
  proposed_margin_percentage NUMERIC(5,2),

  -- Decision
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  decided_by UUID REFERENCES user_profiles(id),
  decided_at TIMESTAMPTZ,
  decision_reason TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT rate_approvals_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_rate_approvals_pending ON rate_approvals(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_rate_approvals_rate ON rate_approvals(entity_rate_id);

-- RLS
ALTER TABLE rate_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_approvals_org_isolation" ON rate_approvals;
CREATE POLICY "rate_approvals_org_isolation" ON rate_approvals
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_cards_org_isolation" ON rate_cards;
CREATE POLICY "rate_cards_org_isolation" ON rate_cards
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE rate_card_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_card_items_org_isolation" ON rate_card_items;
CREATE POLICY "rate_card_items_org_isolation" ON rate_card_items
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE entity_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "entity_rates_org_isolation" ON entity_rates;
CREATE POLICY "entity_rates_org_isolation" ON entity_rates
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE rate_change_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_change_history_org_isolation" ON rate_change_history;
CREATE POLICY "rate_change_history_org_isolation" ON rate_change_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM entity_rates e WHERE e.id = entity_rate_id AND e.org_id = (current_setting('app.org_id', true))::uuid)
  );

-- ============================================
-- SYNC TRIGGER: Placement Rate Sync
-- ============================================

CREATE OR REPLACE FUNCTION sync_placement_rates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_current = true) THEN
    IF NEW.entity_type = 'placement' THEN
      UPDATE placements
      SET
        bill_rate = NEW.bill_rate,
        pay_rate = NEW.pay_rate,
        updated_at = now()
      WHERE id = NEW.entity_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_placement_rates ON entity_rates;
CREATE TRIGGER trg_sync_placement_rates
AFTER INSERT OR UPDATE ON entity_rates
FOR EACH ROW EXECUTE FUNCTION sync_placement_rates();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current rate for entity (with inheritance)
CREATE OR REPLACE FUNCTION get_entity_rate(
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_context_client_id UUID DEFAULT NULL
)
RETURNS TABLE(
  bill_rate NUMERIC,
  pay_rate NUMERIC,
  margin_percentage NUMERIC,
  rate_unit VARCHAR,
  source VARCHAR
) AS $$
BEGIN
  -- 1. Try entity-specific rate
  RETURN QUERY
  SELECT
    er.bill_rate,
    er.pay_rate,
    er.margin_percentage,
    er.rate_unit::VARCHAR,
    'entity_rate'::VARCHAR AS source
  FROM entity_rates er
  WHERE er.entity_type = p_entity_type
    AND er.entity_id = p_entity_id
    AND er.is_current = true
    AND er.deleted_at IS NULL
    AND (p_context_client_id IS NULL OR er.context_client_id = p_context_client_id)
    AND er.org_id = (current_setting('app.org_id', true))::uuid
  ORDER BY
    CASE WHEN er.context_client_id IS NOT NULL THEN 0 ELSE 1 END,
    er.effective_date DESC
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- 2. Return NULL if no rate found
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate margin for given rates
CREATE OR REPLACE FUNCTION calculate_margin(
  p_bill_rate NUMERIC,
  p_pay_rate NUMERIC
)
RETURNS TABLE(
  gross_margin NUMERIC,
  margin_percentage NUMERIC,
  markup_percentage NUMERIC
) AS $$
SELECT
  p_bill_rate - p_pay_rate AS gross_margin,
  CASE WHEN p_bill_rate > 0 THEN ROUND(((p_bill_rate - p_pay_rate) / p_bill_rate * 100), 2) ELSE 0 END AS margin_percentage,
  CASE WHEN p_pay_rate > 0 THEN ROUND(((p_bill_rate - p_pay_rate) / p_pay_rate * 100), 2) ELSE 0 END AS markup_percentage;
$$ LANGUAGE sql IMMUTABLE;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE rate_cards IS 'Master rate card definitions with versioning (RATES-01)';
COMMENT ON TABLE rate_card_items IS 'Rate card line items by job category/level (RATES-01)';
COMMENT ON TABLE entity_rates IS 'Specific rates for entities with calculated margins (RATES-01)';
COMMENT ON TABLE rate_change_history IS 'Audit trail for rate changes (RATES-01)';
COMMENT ON TABLE rate_approvals IS 'Approval workflow for rate exceptions (RATES-01)';
COMMENT ON FUNCTION sync_placement_rates IS 'Syncs entity_rates to placements table when rate changes';
COMMENT ON FUNCTION get_entity_rate IS 'Gets current rate for entity with inheritance';
COMMENT ON FUNCTION calculate_margin IS 'Calculates margin metrics for given bill/pay rates';

-- ============================================
-- ENTITY TYPE REGISTRY
-- ============================================

-- Update existing 'rate_card' entry
INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('rate_card', 'rate_cards', 'rate_card_name', 'Rate Card', NULL)
ON CONFLICT (entity_type) DO UPDATE SET table_name = 'rate_cards', display_name_column = 'rate_card_name';

INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('entity_rate', 'entity_rates', 'id', 'Entity Rate', NULL)
ON CONFLICT (entity_type) DO NOTHING;
