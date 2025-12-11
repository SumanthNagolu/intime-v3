-- ============================================
-- CONTRACTS-01: Unified Contract Management System
-- Creates contracts, contract_versions, contract_templates, contract_parties
-- with versioning and e-signature readiness
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM (
    'draft', 'pending_review', 'pending_signature', 'partially_signed',
    'active', 'expired', 'terminated', 'renewed', 'superseded'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE contract_type AS ENUM (
    'msa', 'nda', 'sow', 'amendment', 'addendum', 'rate_card_agreement',
    'sla', 'vendor_agreement', 'employment', 'contractor', 'subcontractor', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE signatory_status AS ENUM (
    'pending', 'viewed', 'signed', 'declined', 'expired'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CONTRACTS (Unified Polymorphic Table)
-- ============================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference (who this contract is with)
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Secondary entity (optional - for multi-party)
  secondary_entity_type VARCHAR(50),
  secondary_entity_id UUID,

  -- Contract identification
  contract_number VARCHAR(50),
  contract_name VARCHAR(300) NOT NULL,
  contract_type contract_type NOT NULL,

  -- Classification
  category VARCHAR(50), -- 'client', 'vendor', 'employee', 'partner'

  -- Parent contract (for SOWs under MSAs, amendments)
  parent_contract_id UUID REFERENCES contracts(id),

  -- Status
  status contract_status DEFAULT 'draft',

  -- Dates
  effective_date DATE,
  expiry_date DATE,
  termination_date DATE,

  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT false,
  renewal_term_months INTEGER,
  renewal_notice_days INTEGER DEFAULT 30,
  max_renewals INTEGER,
  renewals_count INTEGER DEFAULT 0,

  -- Value
  contract_value NUMERIC(14,2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Terms (flexible JSON storage)
  terms JSONB DEFAULT '{}',

  -- Document linkage (DOCS-01 integration)
  document_id UUID, -- References documents.id
  document_url VARCHAR(500), -- Legacy/external URL
  signed_document_id UUID,
  signed_document_url VARCHAR(500),

  -- Template reference
  template_id UUID,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT true,
  previous_version_id UUID REFERENCES contracts(id),

  -- E-signature
  esign_provider VARCHAR(50), -- 'docusign', 'hellosign', 'adobe_sign', 'manual'
  esign_envelope_id VARCHAR(200),
  esign_status VARCHAR(50),

  -- Termination
  termination_reason TEXT,
  terminated_by UUID REFERENCES user_profiles(id),

  -- Context
  context_job_id UUID, -- SOW for specific job
  context_placement_id UUID, -- Contract for specific placement

  -- Owner
  owner_id UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT contracts_number_unique UNIQUE (org_id, contract_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_org ON contracts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_entity ON contracts(entity_type, entity_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status, contract_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_expiry ON contracts(expiry_date) WHERE expiry_date IS NOT NULL AND status = 'active' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_parent ON contracts(parent_contract_id) WHERE parent_contract_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_latest ON contracts(entity_type, entity_id, contract_type) WHERE is_latest_version = true AND deleted_at IS NULL;

-- Entity type validation trigger
CREATE TRIGGER trg_contracts_validate_entity_type
BEFORE INSERT OR UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
CREATE TRIGGER trg_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTRACT VERSIONS (Amendment Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  -- Version info
  version_number INTEGER NOT NULL,
  version_type VARCHAR(50) NOT NULL, -- 'original', 'amendment', 'renewal', 'addendum'
  version_name VARCHAR(200),

  -- Changes
  change_summary TEXT,
  changes_json JSONB, -- Detailed field-level changes

  -- Snapshot of key fields at this version
  effective_date DATE,
  expiry_date DATE,
  contract_value NUMERIC(14,2),
  terms_snapshot JSONB,

  -- Document
  document_id UUID,
  document_url VARCHAR(500),

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),

  CONSTRAINT contract_versions_unique UNIQUE (contract_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_contract_versions_contract ON contract_versions(contract_id, version_number DESC);

-- ============================================
-- CONTRACT PARTIES (Multi-Signatory Support)
-- ============================================

CREATE TABLE IF NOT EXISTS contract_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  -- Party identification
  party_type VARCHAR(50) NOT NULL, -- 'company', 'individual', 'internal'
  party_role VARCHAR(50) NOT NULL, -- 'client', 'vendor', 'consultant', 'guarantor', 'witness'

  -- Internal party (user from our org)
  user_id UUID REFERENCES user_profiles(id),

  -- External party (contact from contacts table)
  contact_id UUID REFERENCES contacts(id),

  -- External party (company)
  company_id UUID REFERENCES companies(id),

  -- Ad-hoc party info (for external parties not in system)
  party_name VARCHAR(200),
  party_email VARCHAR(200),
  party_title VARCHAR(100),
  party_company VARCHAR(200),

  -- Signature
  signatory_status signatory_status DEFAULT 'pending',
  signature_requested_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signature_ip VARCHAR(45),
  declined_reason TEXT,

  -- E-signature
  esign_recipient_id VARCHAR(200),

  -- Order
  signing_order INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contract_parties_contract ON contract_parties(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_parties_user ON contract_parties(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contract_parties_contact ON contract_parties(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contract_parties_pending ON contract_parties(contract_id, signatory_status) WHERE signatory_status = 'pending';

-- ============================================
-- CONTRACT TEMPLATES
-- ============================================

CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  template_name VARCHAR(200) NOT NULL,
  template_code VARCHAR(50),
  contract_type contract_type NOT NULL,

  -- Content
  description TEXT,
  template_content TEXT, -- Rich text or markdown
  template_document_id UUID, -- Base document

  -- Variables
  available_variables JSONB, -- [{name: 'client_name', required: true, default: ''}]

  -- Clauses (modular)
  default_clauses UUID[], -- References contract_clauses.id

  -- Settings
  default_terms JSONB,
  default_renewal_months INTEGER,
  default_notice_days INTEGER,

  -- Usage
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT contract_templates_code_unique UNIQUE (org_id, template_code)
);

CREATE INDEX IF NOT EXISTS idx_contract_templates_org ON contract_templates(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_templates_type ON contract_templates(contract_type, is_active) WHERE deleted_at IS NULL;

-- ============================================
-- CONTRACT CLAUSES (Clause Library)
-- ============================================

CREATE TABLE IF NOT EXISTS contract_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Identification
  clause_name VARCHAR(200) NOT NULL,
  clause_code VARCHAR(50),
  category VARCHAR(50), -- 'liability', 'termination', 'confidentiality', 'ip', 'payment'

  -- Content
  clause_text TEXT NOT NULL,
  clause_version INTEGER DEFAULT 1,

  -- Legal review
  legal_approved BOOLEAN DEFAULT false,
  legal_approved_by UUID REFERENCES user_profiles(id),
  legal_approved_at TIMESTAMPTZ,

  -- Usage
  is_standard BOOLEAN DEFAULT false, -- Include by default
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contract_clauses_org ON contract_clauses(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contract_clauses_category ON contract_clauses(category, is_active) WHERE deleted_at IS NULL;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contracts_org_isolation" ON contracts;
CREATE POLICY "contracts_org_isolation" ON contracts
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contract_versions_org_isolation" ON contract_versions;
CREATE POLICY "contract_versions_org_isolation" ON contract_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM contracts c WHERE c.id = contract_id AND c.org_id = (current_setting('app.org_id', true))::uuid)
  );

ALTER TABLE contract_parties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contract_parties_org_isolation" ON contract_parties;
CREATE POLICY "contract_parties_org_isolation" ON contract_parties
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contract_templates_org_isolation" ON contract_templates;
CREATE POLICY "contract_templates_org_isolation" ON contract_templates
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

ALTER TABLE contract_clauses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contract_clauses_org_isolation" ON contract_clauses;
CREATE POLICY "contract_clauses_org_isolation" ON contract_clauses
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get active contract by type for an entity
CREATE OR REPLACE FUNCTION get_active_contract(
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_contract_type contract_type
)
RETURNS UUID AS $$
  SELECT id FROM contracts
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND contract_type = p_contract_type
    AND status = 'active'
    AND is_latest_version = true
    AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
    AND deleted_at IS NULL
    AND org_id = (current_setting('app.org_id', true))::uuid
  ORDER BY effective_date DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if all required signatures are complete
CREATE OR REPLACE FUNCTION check_contract_signatures(p_contract_id UUID)
RETURNS TABLE(
  all_signed BOOLEAN,
  total_parties INTEGER,
  signed_count INTEGER,
  pending_count INTEGER
) AS $$
  SELECT
    bool_and(signatory_status = 'signed' OR NOT is_required) AS all_signed,
    count(*)::INTEGER AS total_parties,
    count(*) FILTER (WHERE signatory_status = 'signed')::INTEGER AS signed_count,
    count(*) FILTER (WHERE signatory_status = 'pending' AND is_required)::INTEGER AS pending_count
  FROM contract_parties
  WHERE contract_id = p_contract_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE contracts IS 'Unified contracts table for all entity types (CONTRACTS-01)';
COMMENT ON TABLE contract_versions IS 'Version/amendment history for contracts (CONTRACTS-01)';
COMMENT ON TABLE contract_parties IS 'Multi-party signatory tracking (CONTRACTS-01)';
COMMENT ON TABLE contract_templates IS 'Reusable contract templates (CONTRACTS-01)';
COMMENT ON TABLE contract_clauses IS 'Modular contract clause library (CONTRACTS-01)';
COMMENT ON FUNCTION get_active_contract IS 'Returns active contract ID for entity by type';
COMMENT ON FUNCTION check_contract_signatures IS 'Returns signature status for a contract';

-- ============================================
-- ENTITY TYPE REGISTRY
-- ============================================

-- Update existing 'contract' entry or add if not exists
INSERT INTO entity_type_registry (entity_type, table_name, display_name_column, display_name, url_pattern)
VALUES ('contract', 'contracts', 'contract_name', 'Contract', NULL)
ON CONFLICT (entity_type) DO UPDATE SET table_name = 'contracts', display_name_column = 'contract_name';
