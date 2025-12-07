-- =====================================================
-- Migration: Create Commissions Table for Deal Tracking (B05)
-- Date: 2025-12-10
-- Description: Track recruiter commissions from closed deals
-- =====================================================

-- =====================================================
-- COMMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  placement_id UUID, -- Will reference placements table when it exists

  -- Recipient
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Commission details
  deal_value NUMERIC(12, 2) NOT NULL,
  gross_margin NUMERIC(12, 2),
  margin_percentage NUMERIC(5, 2) DEFAULT 20.00,
  commission_percentage NUMERIC(5, 2) DEFAULT 5.00,

  -- Calculated amounts
  projected_commission NUMERIC(12, 2) NOT NULL,
  actual_commission NUMERIC(12, 2),

  -- Commission type
  commission_type TEXT NOT NULL DEFAULT 'deal_close' CHECK (commission_type IN ('deal_close', 'placement', 'renewal', 'expansion')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paid', 'cancelled', 'clawback')),

  -- Payment details
  payment_schedule TEXT DEFAULT 'monthly' CHECK (payment_schedule IN ('one_time', 'monthly', 'quarterly')),
  payment_period_start DATE,
  payment_period_end DATE,

  -- Tracking
  activated_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commissions_org_id ON commissions(org_id);
CREATE INDEX IF NOT EXISTS idx_commissions_deal_id ON commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(commission_type);
CREATE INDEX IF NOT EXISTS idx_commissions_user_status ON commissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_payment_period ON commissions(payment_period_start, payment_period_end);

-- Enable RLS
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS commissions_org_isolation ON commissions;
CREATE POLICY commissions_org_isolation ON commissions
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS commissions_user_select ON commissions;
CREATE POLICY commissions_user_select ON commissions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_id = auth.uid()
      AND (role IN ('admin', 'pod_manager', 'finance'))
    )
  );

-- Update trigger
CREATE OR REPLACE FUNCTION update_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_commissions_updated_at ON commissions;
CREATE TRIGGER trigger_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_commissions_updated_at();

-- =====================================================
-- COMMISSION PAYMENTS TABLE (Payment History)
-- =====================================================

CREATE TABLE IF NOT EXISTS commission_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,

  -- Payment details
  amount NUMERIC(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,

  -- Period
  period_start DATE,
  period_end DATE,
  period_label TEXT, -- "December 2025", "Q4 2025"

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commission_payments_commission_id ON commission_payments(commission_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_org_id ON commission_payments(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_payment_date ON commission_payments(payment_date);

-- Enable RLS
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS commission_payments_org_isolation ON commission_payments;
CREATE POLICY commission_payments_org_isolation ON commission_payments
  FOR ALL
  USING (org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()));

-- =====================================================
-- FUNCTION: Create Commission from Deal Closure
-- =====================================================

CREATE OR REPLACE FUNCTION create_commission_from_deal(
  p_deal_id UUID,
  p_margin_percentage NUMERIC DEFAULT 20.00,
  p_commission_percentage NUMERIC DEFAULT 5.00
)
RETURNS UUID AS $$
DECLARE
  v_deal deals;
  v_commission_id UUID;
  v_gross_margin NUMERIC;
  v_projected_commission NUMERIC;
BEGIN
  -- Get deal details
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;

  IF v_deal.stage != 'closed_won' THEN
    RAISE EXCEPTION 'Deal must be closed won to create commission';
  END IF;

  -- Calculate commission
  v_gross_margin := COALESCE(v_deal.value, 0) * (p_margin_percentage / 100.0);
  v_projected_commission := v_gross_margin * (p_commission_percentage / 100.0);

  -- Create commission record
  INSERT INTO commissions (
    org_id,
    deal_id,
    user_id,
    deal_value,
    gross_margin,
    margin_percentage,
    commission_percentage,
    projected_commission,
    commission_type,
    status,
    payment_schedule,
    payment_period_start,
    payment_period_end,
    created_by
  ) VALUES (
    v_deal.org_id,
    p_deal_id,
    v_deal.owner_id,
    v_deal.value,
    v_gross_margin,
    p_margin_percentage,
    p_commission_percentage,
    v_projected_commission,
    'deal_close',
    'pending',
    'monthly',
    v_deal.contract_start_date,
    v_deal.contract_start_date + (COALESCE(v_deal.contract_duration_months, 12) || ' months')::INTERVAL,
    v_deal.updated_by
  ) RETURNING id INTO v_commission_id;

  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_commission_from_deal IS 'Create a commission record when a deal is closed as won';

-- =====================================================
-- FUNCTION: Get Recruiter Commission Summary
-- =====================================================

CREATE OR REPLACE FUNCTION get_recruiter_commission_summary(p_user_id UUID)
RETURNS TABLE (
  total_projected NUMERIC,
  total_active NUMERIC,
  total_paid NUMERIC,
  pending_count INTEGER,
  active_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN status = 'pending' THEN projected_commission ELSE 0 END), 0) as total_projected,
    COALESCE(SUM(CASE WHEN status = 'active' THEN projected_commission - COALESCE(actual_commission, 0) ELSE 0 END), 0) as total_active,
    COALESCE(SUM(actual_commission), 0) as total_paid,
    CAST(COUNT(*) FILTER (WHERE status = 'pending') AS INTEGER) as pending_count,
    CAST(COUNT(*) FILTER (WHERE status = 'active') AS INTEGER) as active_count
  FROM commissions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_recruiter_commission_summary IS 'Get commission summary for a recruiter';

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE commissions IS 'Tracks commissions earned from closed deals and placements';
COMMENT ON TABLE commission_payments IS 'Payment history for commissions';

COMMENT ON COLUMN commissions.status IS 'pending=awaiting first placement, active=earning commissions, paid=fully paid, cancelled=deal fell through, clawback=returned due to early termination';
COMMENT ON COLUMN commissions.projected_commission IS 'Calculated commission based on deal value and rates';
COMMENT ON COLUMN commissions.actual_commission IS 'Running total of actual commission paid';
