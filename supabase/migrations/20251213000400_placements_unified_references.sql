-- ============================================================================
-- WAVE 4: PLACEMENTS-01 - Unified contact and company references
-- ============================================================================
-- This migration adds:
-- 1. contact_id column (parallel to candidate_id)
-- 2. Unified company references (client, end_client, vendor)
-- 3. Contact references for client contacts
-- 4. Contract and rate linkages
-- 5. Change order tracking
-- 6. Enhanced health and checkin tracking
-- ============================================================================

-- Step 1: Add contact_id column (parallel to candidate_id for transition)
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);

-- Step 2: Add unified company references
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS client_company_id UUID REFERENCES companies(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS end_client_company_id UUID REFERENCES companies(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS vendor_company_id UUID REFERENCES companies(id);

-- Step 3: Add contact references for client contacts
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS client_manager_contact_id UUID REFERENCES contacts(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS hr_contact_id UUID REFERENCES contacts(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS reporting_manager_contact_id UUID REFERENCES contacts(id);

-- Step 4: Add contract and rate linkages
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS rate_card_id UUID REFERENCES rate_cards(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS rate_card_item_id UUID REFERENCES rate_card_items(id);

-- Step 5: Add change order tracking
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS has_change_orders BOOLEAN DEFAULT false;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS active_change_order_id UUID;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS change_order_count INTEGER DEFAULT 0;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS original_end_date DATE;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS original_bill_rate NUMERIC(10,2);

-- Step 6: Add enhanced tracking fields
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IS NULL OR approval_status IN (
  'pending', 'approved', 'rejected', 'expired'
));

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id);

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS expected_hours_per_week NUMERIC(5,2) DEFAULT 40;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS overtime_eligible BOOLEAN DEFAULT true;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS expenses_allowed BOOLEAN DEFAULT true;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS expense_budget NUMERIC(10,2);

-- Step 7: Add compliance tracking
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(50) DEFAULT 'pending' CHECK (compliance_status IS NULL OR compliance_status IN (
  'pending', 'in_progress', 'complete', 'expired', 'blocked'
));

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS compliance_cleared_at TIMESTAMPTZ;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS compliance_expires_at TIMESTAMPTZ;

-- Step 8: Add work arrangement tracking
ALTER TABLE placements
ADD COLUMN IF NOT EXISTS work_arrangement VARCHAR(50) DEFAULT 'onsite' CHECK (work_arrangement IS NULL OR work_arrangement IN (
  'onsite', 'remote', 'hybrid'
));

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS hybrid_days_per_week INTEGER;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS work_location TEXT;

ALTER TABLE placements
ADD COLUMN IF NOT EXISTS work_address_id UUID REFERENCES addresses(id);

-- ============================================================================
-- Create placement_change_orders table
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
    'extension', 'rate_change', 'hours_change', 'role_change', 'location_change', 'other'
  )),

  -- Original values
  original_end_date DATE,
  original_bill_rate NUMERIC(10,2),
  original_pay_rate NUMERIC(10,2),
  original_hours_per_week NUMERIC(5,2),

  -- New values
  new_end_date DATE,
  new_bill_rate NUMERIC(10,2),
  new_pay_rate NUMERIC(10,2),
  new_hours_per_week NUMERIC(5,2),

  effective_date DATE NOT NULL,
  reason TEXT,
  notes TEXT,

  -- Approval workflow
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'applied'
  )),
  requested_by UUID REFERENCES user_profiles(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,

  -- Document reference
  document_id UUID REFERENCES documents(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_placement_change_orders_placement ON placement_change_orders(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_change_orders_status ON placement_change_orders(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_placement_change_orders_org ON placement_change_orders(org_id);

-- ============================================================================
-- Enhance placement_checkins table (table exists in baseline)
-- ============================================================================
-- Add new columns to existing placement_checkins table
ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES user_profiles(id);

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS action_items JSONB;

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false;

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS follow_up_date DATE;

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS health_score INTEGER;

ALTER TABLE placement_checkins
ADD COLUMN IF NOT EXISTS health_assessment VARCHAR(50);

-- Add check constraints for new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'placement_checkins_health_score_check'
  ) THEN
    ALTER TABLE placement_checkins ADD CONSTRAINT placement_checkins_health_score_check
      CHECK (health_score IS NULL OR health_score BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'placement_checkins_health_assessment_check'
  ) THEN
    ALTER TABLE placement_checkins ADD CONSTRAINT placement_checkins_health_assessment_check
      CHECK (health_assessment IS NULL OR health_assessment IN (
        'healthy', 'minor_concerns', 'at_risk', 'critical'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_placement_checkins_placement ON placement_checkins(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_checkins_pending ON placement_checkins(checkin_date) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placement_checkins_org ON placement_checkins(org_id);

-- ============================================================================
-- Create placement_vendors table (C2C vendor chain tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS placement_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  vendor_company_id UUID NOT NULL REFERENCES companies(id),
  vendor_type VARCHAR(50) NOT NULL CHECK (vendor_type IN (
    'primary', 'sub_vendor', 'end_client', 'implementation_partner'
  )),
  position_in_chain INTEGER NOT NULL DEFAULT 1,

  -- Rates at this level
  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  markup_percentage NUMERIC(5,2),
  margin_amount NUMERIC(10,2),

  -- Contact at vendor
  vendor_contact_id UUID REFERENCES contacts(id),

  -- Contract reference
  vendor_contract_id UUID REFERENCES contracts(id),

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_placement_vendors_placement ON placement_vendors(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_vendors_company ON placement_vendors(vendor_company_id);
CREATE INDEX IF NOT EXISTS idx_placement_vendors_org ON placement_vendors(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_placement_vendors_unique ON placement_vendors(placement_id, vendor_company_id, position_in_chain);

-- RLS for placement_vendors
ALTER TABLE placement_vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS placement_vendors_org_isolation ON placement_vendors;
CREATE POLICY placement_vendors_org_isolation ON placement_vendors
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

COMMENT ON TABLE placement_vendors IS 'Track C2C vendor chain with margin calculations';
COMMENT ON COLUMN placement_vendors.position_in_chain IS 'Position in vendor chain (1=primary, 2=sub-vendor, etc.)';
COMMENT ON COLUMN placement_vendors.bill_rate IS 'Rate billed by this vendor';
COMMENT ON COLUMN placement_vendors.pay_rate IS 'Rate paid to downstream vendor/consultant';
COMMENT ON COLUMN placement_vendors.margin_amount IS 'Bill rate - pay rate';

-- ============================================================================
-- Create indexes for new placements columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_placements_contact ON placements(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_client_company ON placements(client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_end_client ON placements(end_client_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_vendor ON placements(vendor_company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_contract ON placements(contract_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_compliance ON placements(org_id, compliance_status) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_placements_approval ON placements(org_id, approval_status) WHERE approval_status = 'pending' AND deleted_at IS NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE placement_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS placement_change_orders_org_isolation ON placement_change_orders;
CREATE POLICY placement_change_orders_org_isolation ON placement_change_orders
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

DROP POLICY IF EXISTS placement_checkins_org_isolation ON placement_checkins;
CREATE POLICY placement_checkins_org_isolation ON placement_checkins
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- ============================================================================
-- Backward compatibility view
-- ============================================================================
-- Note: Using only contact_id and client_company_id (new unified columns)
-- Legacy candidate_id still exists on base table for backward compat
CREATE OR REPLACE VIEW placements_extended_v AS
SELECT
  p.*,
  COALESCE(c.first_name || ' ' || c.last_name, c.first_name, c.last_name) as contact_name,
  c.email as contact_email,
  cc.name as client_company_name,
  ec.name as end_client_company_name,
  vc.name as vendor_company_name
FROM placements p
LEFT JOIN contacts c ON c.id = p.contact_id
LEFT JOIN companies cc ON cc.id = p.client_company_id
LEFT JOIN companies ec ON ec.id = p.end_client_company_id
LEFT JOIN companies vc ON vc.id = p.vendor_company_id;

COMMENT ON VIEW placements_extended_v IS 'Placement view with denormalized contact and company names';

-- ============================================================================
-- Add comments
-- ============================================================================
COMMENT ON COLUMN placements.contact_id IS 'Unified contact reference (replacing candidate_id)';
COMMENT ON COLUMN placements.client_company_id IS 'Direct client company';
COMMENT ON COLUMN placements.end_client_company_id IS 'End client if different from direct client';
COMMENT ON COLUMN placements.vendor_company_id IS 'Vendor company if placement is through vendor';
COMMENT ON COLUMN placements.client_manager_contact_id IS 'Client-side manager contact';
COMMENT ON COLUMN placements.hr_contact_id IS 'Client HR contact';
COMMENT ON COLUMN placements.contract_id IS 'Associated contract';
COMMENT ON COLUMN placements.rate_card_id IS 'Rate card used for billing';
COMMENT ON COLUMN placements.has_change_orders IS 'Whether placement has any change orders';
COMMENT ON COLUMN placements.compliance_status IS 'Current compliance status';

COMMENT ON TABLE placement_change_orders IS 'Track extensions, rate changes, and other modifications';
COMMENT ON TABLE placement_checkins IS 'Scheduled and completed placement health checkins';
