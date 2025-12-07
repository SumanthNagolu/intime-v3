-- =====================================================
-- Migration: Align CRM Enums for Deals Pipeline (B01-B05)
-- Date: 2025-12-10
-- Description: Add missing deal stages and align lead statuses for B01-B05 specs
-- =====================================================

-- Note: PostgreSQL text fields don't require ALTER TYPE
-- Validation happens at application layer in tRPC

-- =====================================================
-- ADD COMMENTS DOCUMENTING VALID VALUES
-- =====================================================

-- Document valid deal stages (7 values per B03/B04 spec)
-- Current: discovery, proposal, negotiation, closed_won, closed_lost
-- Adding: qualification, verbal_commit
COMMENT ON COLUMN deals.stage IS 'Valid values: discovery, qualification, proposal, negotiation, verbal_commit, closed_won, closed_lost. Stage probabilities: discovery=20%, qualification=40%, proposal=60%, negotiation=70%, verbal_commit=90%, closed_won=100%, closed_lost=0%';

-- Document valid lead statuses (per B01 spec)
-- Mapping from existing to new:
-- new → new (same)
-- warm → contacted
-- hot → qualified
-- cold → nurture
-- converted → converted (same)
-- lost → unqualified
COMMENT ON COLUMN leads.status IS 'Valid values: new, contacted, qualified, unqualified, nurture, converted. Status colors: new=gray, contacted=blue, qualified=green, unqualified=red, nurture=yellow, converted=purple';

-- =====================================================
-- ADD NEW COLUMNS TO LEADS FOR QUALIFICATION (B02)
-- =====================================================

-- Budget status for BANT scoring
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_status TEXT CHECK (budget_status IN ('confirmed', 'likely', 'unclear', 'no_budget'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_monthly_spend NUMERIC(12, 2);

-- Authority level for BANT scoring
ALTER TABLE leads ADD COLUMN IF NOT EXISTS authority_level TEXT CHECK (authority_level IN ('decision_maker', 'influencer', 'gatekeeper', 'no_authority'));

-- Need details for BANT scoring
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_need TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('immediate', 'high', 'medium', 'low'));

-- Timeline for BANT scoring
ALTER TABLE leads ADD COLUMN IF NOT EXISTS target_start_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS positions_count INTEGER DEFAULT 1 CHECK (positions_count >= 1 AND positions_count <= 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS skills_needed TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contract_types TEXT[];

-- Qualification results
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_result TEXT CHECK (qualification_result IN ('qualified_convert', 'qualified_nurture', 'not_qualified'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualified_by UUID REFERENCES user_profiles(id);

-- =====================================================
-- ADD NEW COLUMNS TO DEALS (B03/B04)
-- =====================================================

-- Deal value details
ALTER TABLE deals ADD COLUMN IF NOT EXISTS value_basis TEXT DEFAULT 'one_time' CHECK (value_basis IN ('one_time', 'annual', 'monthly'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS weighted_value NUMERIC(12, 2) GENERATED ALWAYS AS (value * probability / 100.0) STORED;

-- Deal details
ALTER TABLE deals ADD COLUMN IF NOT EXISTS estimated_placements INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS avg_bill_rate NUMERIC(10, 2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contract_length_months INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS hiring_needs TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS roles_breakdown JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS services_required TEXT[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitors TEXT[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitive_advantage TEXT;

-- Assignment
ALTER TABLE deals ADD COLUMN IF NOT EXISTS pod_manager_id UUID REFERENCES user_profiles(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS secondary_owner_id UUID REFERENCES user_profiles(id);

-- Next actions
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS next_action_date DATE;

-- Pipeline health
ALTER TABLE deals ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'on_track' CHECK (health_status IN ('on_track', 'slow', 'stale', 'urgent', 'at_risk'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Close details (B05)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contract_signed_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contract_duration_months INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('msa', 'sow', 'po', 'email'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS payment_terms TEXT CHECK (payment_terms IN ('net_15', 'net_30', 'net_45', 'net_60'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS billing_frequency TEXT CHECK (billing_frequency IN ('weekly', 'biweekly', 'monthly'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS billing_contact JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS confirmed_roles JSONB;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS win_reason TEXT CHECK (win_reason IN ('price_value', 'expertise_speed', 'relationship_trust', 'candidate_quality', 'response_time', 'other'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS win_details TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitors_beat TEXT[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS loss_reason_category TEXT CHECK (loss_reason_category IN ('competitor', 'no_budget', 'project_cancelled', 'hired_internally', 'went_dark', 'price_too_high', 'requirements_changed', 'other'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS loss_details TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitor_price NUMERIC(10, 2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS future_potential TEXT CHECK (future_potential IN ('yes', 'maybe', 'no'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS reengagement_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lessons_learned TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_account_id UUID REFERENCES accounts(id);

-- =====================================================
-- ADD INDEXES FOR DEAL PIPELINE QUERIES
-- =====================================================

-- Pipeline view indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage_owner ON deals(stage, owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_active ON deals(expected_close_date) WHERE deleted_at IS NULL AND stage NOT IN ('closed_won', 'closed_lost');
CREATE INDEX IF NOT EXISTS idx_deals_health_status ON deals(health_status) WHERE deleted_at IS NULL AND stage NOT IN ('closed_won', 'closed_lost');
CREATE INDEX IF NOT EXISTS idx_deals_last_activity ON deals(last_activity_at) WHERE deleted_at IS NULL AND stage NOT IN ('closed_won', 'closed_lost');

-- Lead qualification indexes
CREATE INDEX IF NOT EXISTS idx_leads_bant_status ON leads(bant_total_score, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_qualification_result ON leads(qualification_result) WHERE deleted_at IS NULL;

-- =====================================================
-- TRIGGER TO UPDATE DEAL HEALTH STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION update_deal_health_status()
RETURNS TRIGGER AS $$
DECLARE
  v_days_since_activity INTEGER;
  v_days_to_close INTEGER;
BEGIN
  -- Calculate days since last activity
  v_days_since_activity := EXTRACT(DAY FROM (NOW() - COALESCE(NEW.last_activity_at, NEW.created_at)));

  -- Calculate days until expected close
  v_days_to_close := CASE
    WHEN NEW.expected_close_date IS NOT NULL
    THEN (NEW.expected_close_date - CURRENT_DATE)
    ELSE 999
  END;

  -- Skip for closed deals
  IF NEW.stage IN ('closed_won', 'closed_lost') THEN
    NEW.health_status := NULL;
    RETURN NEW;
  END IF;

  -- Determine health status
  IF NEW.health_status = 'at_risk' THEN
    -- Keep at_risk if manually set (don't override)
    NULL;
  ELSIF v_days_to_close <= 14 AND NEW.stage NOT IN ('verbal_commit') THEN
    NEW.health_status := 'urgent';
  ELSIF v_days_since_activity > 14 THEN
    NEW.health_status := 'stale';
  ELSIF v_days_since_activity > 7 THEN
    NEW.health_status := 'slow';
  ELSE
    NEW.health_status := 'on_track';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deal_health_status ON deals;
CREATE TRIGGER trigger_deal_health_status
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_health_status();

-- =====================================================
-- TRIGGER TO LOG STAGE CHANGES TO HISTORY
-- =====================================================

CREATE OR REPLACE FUNCTION log_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stage actually changed
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    -- Close out the previous stage entry
    UPDATE deal_stages_history
    SET exited_at = NOW(),
        duration_days = EXTRACT(DAY FROM (NOW() - entered_at))
    WHERE deal_id = NEW.id
      AND exited_at IS NULL;

    -- Insert new stage entry
    INSERT INTO deal_stages_history (
      deal_id,
      stage,
      previous_stage,
      entered_at,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.stage,
      OLD.stage,
      NOW(),
      NEW.updated_by
    );

    -- Update last activity
    NEW.last_activity_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deal_stage_change ON deals;
CREATE TRIGGER trigger_deal_stage_change
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION log_deal_stage_change();

-- =====================================================
-- FUNCTION TO CALCULATE DEAL VALUE FROM ROLES
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_deal_value_from_roles(
  p_placements INTEGER,
  p_avg_bill_rate NUMERIC,
  p_hours_per_month INTEGER DEFAULT 173,
  p_contract_months INTEGER DEFAULT 6
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE(p_placements, 0) *
         COALESCE(p_avg_bill_rate, 0) *
         COALESCE(p_hours_per_month, 173) *
         COALESCE(p_contract_months, 6);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_deal_value_from_roles IS 'Calculate deal gross revenue from placements × rate × hours × months';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN leads.budget_status IS 'BANT Budget: confirmed=25pts, likely=15pts, unclear=5pts, no_budget=0pts';
COMMENT ON COLUMN leads.authority_level IS 'BANT Authority: decision_maker=25pts, influencer=20pts, gatekeeper=10pts, no_authority=0pts';
COMMENT ON COLUMN leads.urgency IS 'BANT Timeline urgency: immediate=25pts, high=20pts, medium=10pts, low=5pts';
COMMENT ON COLUMN deals.value_basis IS 'How deal value is calculated: one_time, annual, or monthly';
COMMENT ON COLUMN deals.weighted_value IS 'Auto-calculated: value * probability / 100';
COMMENT ON COLUMN deals.health_status IS 'Deal pipeline health: on_track (active), slow (7-14d stale), stale (>14d), urgent (close <14d), at_risk (manual)';
