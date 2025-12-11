-- ============================================
-- COMPLIANCE-01: Unified Compliance Tracking System
-- Creates compliance_requirements, compliance_items, entity_compliance_requirements
-- with requirement inheritance and expiration alerts
-- ============================================

-- ============================================
-- HANDLE LEGACY TABLE
-- ============================================
-- The baseline has a legacy compliance_requirements table.
-- We'll rename it and create the new unified schema.

-- First, check if the legacy table exists and rename it
DO $$
BEGIN
  -- Check if the old table exists and doesn't have our new columns
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'compliance_requirements'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compliance_requirements'
      AND column_name = 'requirement_code'
  ) THEN
    -- Rename the legacy table
    ALTER TABLE public.compliance_requirements RENAME TO legacy_compliance_requirements;

    -- Rename its primary key constraint if it exists
    IF EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'compliance_requirements_pkey'
    ) THEN
      ALTER TABLE public.legacy_compliance_requirements
        RENAME CONSTRAINT compliance_requirements_pkey TO legacy_compliance_requirements_pkey;
    END IF;

    RAISE NOTICE 'Renamed legacy compliance_requirements to legacy_compliance_requirements';
  END IF;
END $$;

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE compliance_item_status AS ENUM (
    'pending', 'received', 'under_review', 'verified',
    'expiring', 'expired', 'rejected', 'waived'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE compliance_priority AS ENUM (
    'critical', 'high', 'medium', 'low'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- COMPLIANCE REQUIREMENTS (Master Definitions)
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  requirement_code VARCHAR(50) NOT NULL,
  requirement_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Classification
  category VARCHAR(50) NOT NULL, -- 'background', 'drug_test', 'tax', 'insurance', 'certification', 'legal'
  subcategory VARCHAR(50),

  -- Applicability (which entity types this applies to)
  applies_to_entity_types TEXT[] DEFAULT ARRAY['contact'], -- ['contact', 'company', 'placement']

  -- Validity
  validity_period_days INTEGER, -- NULL = no expiration
  renewal_lead_days INTEGER DEFAULT 30,

  -- Priority
  priority compliance_priority DEFAULT 'medium',
  is_blocking BOOLEAN DEFAULT false, -- Blocks placement if not compliant

  -- Document requirements
  requires_document BOOLEAN DEFAULT true,
  accepted_document_types TEXT[], -- ['pdf', 'jpg', 'png']

  -- Jurisdiction
  jurisdiction VARCHAR(50), -- 'federal', 'state', 'local', 'international'
  jurisdiction_region VARCHAR(100), -- 'CA', 'TX', 'US', etc.

  -- Active status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_until DATE,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT compliance_requirements_code_unique UNIQUE (org_id, requirement_code),
  CONSTRAINT compliance_requirements_category_check CHECK (category IN (
    'background', 'drug_test', 'tax', 'insurance', 'certification',
    'legal', 'immigration', 'health', 'training', 'other'
  ))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_req_org ON compliance_requirements(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_req_category ON compliance_requirements(category, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_req_blocking ON compliance_requirements(is_blocking) WHERE is_blocking = true AND deleted_at IS NULL;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_compliance_requirements_updated_at'
  ) THEN
    CREATE TRIGGER trg_compliance_requirements_updated_at
    BEFORE UPDATE ON compliance_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- COMPLIANCE ITEMS (Polymorphic Records)
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Requirement reference
  requirement_id UUID REFERENCES compliance_requirements(id),
  -- For ad-hoc compliance (no master requirement)
  compliance_type VARCHAR(100), -- Used when requirement_id is NULL
  compliance_name VARCHAR(200),

  -- Status
  status compliance_item_status DEFAULT 'pending',

  -- Document linkage (DOCS-01 integration)
  document_id UUID, -- References documents.id
  document_url VARCHAR(500), -- Legacy/external URL
  document_received_at TIMESTAMPTZ,

  -- Validity dates
  effective_date DATE,
  expiry_date DATE,

  -- Verification
  verified_by UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,
  verification_method VARCHAR(50), -- 'manual', 'automated', 'third_party'
  verification_notes TEXT,

  -- Rejection/waiver
  rejection_reason TEXT,
  waived_by UUID REFERENCES user_profiles(id),
  waived_at TIMESTAMPTZ,
  waiver_reason TEXT,
  waiver_expires_at DATE,

  -- Insurance-specific fields
  policy_number VARCHAR(100),
  coverage_amount NUMERIC(12,2),
  insurance_carrier VARCHAR(200),

  -- Context
  context_placement_id UUID, -- Compliance for specific placement
  context_client_id UUID, -- Client-specific requirement

  -- Alerts
  expiry_alert_sent_at TIMESTAMPTZ,
  expiry_alert_days_before INTEGER DEFAULT 30,

  -- Inheritance tracking
  inherited_from_entity_type VARCHAR(50),
  inherited_from_entity_id UUID,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_items_org ON compliance_items(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_items_entity ON compliance_items(entity_type, entity_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_items_status ON compliance_items(status, entity_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_items_expiry ON compliance_items(expiry_date) WHERE expiry_date IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_items_requirement ON compliance_items(requirement_id) WHERE requirement_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_items_expiring ON compliance_items(expiry_date, status)
  WHERE status NOT IN ('expired', 'rejected', 'waived') AND expiry_date IS NOT NULL AND deleted_at IS NULL;

-- Entity type validation trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_compliance_items_validate_entity_type'
  ) THEN
    CREATE TRIGGER trg_compliance_items_validate_entity_type
    BEFORE INSERT OR UPDATE ON compliance_items
    FOR EACH ROW EXECUTE FUNCTION validate_entity_type();
  END IF;
END $$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_compliance_items_updated_at'
  ) THEN
    CREATE TRIGGER trg_compliance_items_updated_at
    BEFORE UPDATE ON compliance_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- ENTITY COMPLIANCE REQUIREMENTS (Junction)
-- ============================================
-- Assigns specific requirements to entities (e.g., client requires specific compliance)

CREATE TABLE IF NOT EXISTS entity_compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- What entity has this requirement
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Which requirement
  requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),

  -- Override settings
  is_required BOOLEAN DEFAULT true,
  custom_validity_days INTEGER, -- Override default validity
  custom_lead_days INTEGER,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),

  CONSTRAINT entity_compliance_req_unique UNIQUE (entity_type, entity_id, requirement_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_compliance_req_entity ON entity_compliance_requirements(entity_type, entity_id);

-- Entity type validation trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_entity_compliance_req_validate_entity_type'
  ) THEN
    CREATE TRIGGER trg_entity_compliance_req_validate_entity_type
    BEFORE INSERT OR UPDATE ON entity_compliance_requirements
    FOR EACH ROW EXECUTE FUNCTION validate_entity_type();
  END IF;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compliance_requirements_org_isolation" ON compliance_requirements;
CREATE POLICY "compliance_requirements_org_isolation" ON compliance_requirements
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compliance_items_org_isolation" ON compliance_items;
CREATE POLICY "compliance_items_org_isolation" ON compliance_items
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE entity_compliance_requirements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "entity_compliance_requirements_org_isolation" ON entity_compliance_requirements;
CREATE POLICY "entity_compliance_requirements_org_isolation" ON entity_compliance_requirements
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if entity is compliant (all required items verified and not expired)
CREATE OR REPLACE FUNCTION check_entity_compliance(
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_check_blocking_only BOOLEAN DEFAULT false
)
RETURNS TABLE(
  is_compliant BOOLEAN,
  total_requirements INTEGER,
  compliant_count INTEGER,
  pending_count INTEGER,
  expired_count INTEGER,
  blocking_issues TEXT[]
) AS $$
DECLARE
  v_blocking TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RETURN QUERY
  WITH requirements AS (
    SELECT
      cr.id,
      cr.requirement_name,
      cr.is_blocking,
      ci.status,
      ci.expiry_date
    FROM compliance_requirements cr
    LEFT JOIN compliance_items ci ON ci.requirement_id = cr.id
      AND ci.entity_type = p_entity_type
      AND ci.entity_id = p_entity_id
      AND ci.deleted_at IS NULL
    WHERE cr.org_id = (current_setting('app.org_id', true))::uuid
      AND cr.is_active = true
      AND cr.deleted_at IS NULL
      AND p_entity_type = ANY(cr.applies_to_entity_types)
      AND (NOT p_check_blocking_only OR cr.is_blocking = true)
  )
  SELECT
    bool_and(r.status = 'verified' AND (r.expiry_date IS NULL OR r.expiry_date > CURRENT_DATE)) AS is_compliant,
    count(*)::INTEGER AS total_requirements,
    count(*) FILTER (WHERE r.status = 'verified' AND (r.expiry_date IS NULL OR r.expiry_date > CURRENT_DATE))::INTEGER AS compliant_count,
    count(*) FILTER (WHERE r.status IN ('pending', 'received', 'under_review'))::INTEGER AS pending_count,
    count(*) FILTER (WHERE r.status = 'expired' OR (r.expiry_date IS NOT NULL AND r.expiry_date <= CURRENT_DATE))::INTEGER AS expired_count,
    array_agg(r.requirement_name) FILTER (WHERE r.is_blocking AND (r.status != 'verified' OR (r.expiry_date IS NOT NULL AND r.expiry_date <= CURRENT_DATE))) AS blocking_issues
  FROM requirements r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE compliance_requirements IS 'Master compliance requirement definitions (COMPLIANCE-01)';
COMMENT ON TABLE compliance_items IS 'Polymorphic compliance records for any entity type (COMPLIANCE-01)';
COMMENT ON TABLE entity_compliance_requirements IS 'Junction table assigning requirements to specific entities (COMPLIANCE-01)';
COMMENT ON FUNCTION check_entity_compliance IS 'Checks if an entity meets all compliance requirements. Returns compliance status and blocking issues.';

-- ============================================
-- ENTITY TYPE REGISTRY
-- ============================================

INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('compliance_item', 'compliance_items', 'compliance_name', 'Compliance Item', NULL)
ON CONFLICT (entity_type) DO NOTHING;

INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('compliance_requirement', 'compliance_requirements', 'requirement_name', 'Compliance Requirement', NULL)
ON CONFLICT (entity_type) DO NOTHING;

-- ============================================
-- BACKWARD COMPATIBILITY VIEW
-- ============================================
-- Create a view with the legacy table's expected interface for existing code

CREATE OR REPLACE VIEW legacy_compliance_requirements_view AS
SELECT
  id,
  org_id,
  requirement_name AS name,
  category::text AS type,
  jurisdiction,
  'all' AS applies_to,
  CASE
    WHEN validity_period_days IS NULL THEN 'once'
    WHEN validity_period_days <= 365 THEN 'annual'
    ELSE 'once'
  END AS frequency,
  description,
  NULL::text AS document_template_url,
  is_active,
  created_at,
  updated_at,
  created_by
FROM compliance_requirements
WHERE deleted_at IS NULL;
