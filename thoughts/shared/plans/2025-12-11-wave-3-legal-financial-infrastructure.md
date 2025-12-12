# Wave 3: Legal & Financial Infrastructure Implementation Plan

## Overview

Wave 3 implements three enterprise-grade systems for the InTime staffing platform:
1. **COMPLIANCE-01** - Unified Compliance Tracking System
2. **CONTRACTS-01** - Unified Contract Management System
3. **RATES-01** - Unified Rate Cards & Billing System

All three systems follow the same polymorphic architecture established in Wave 1 (DOCS-01, NOTES-01, SKILLS-01, HISTORY-01), enabling any entity type to have compliance items, contracts, and rate cards.

## Current State Analysis

### COMPLIANCE-01 Current State
- **15 scattered compliance tables**: background checks, drug tests, I-9, W-4, insurance compliance, etc.
- **Active Router**: `contactCompliance` - only handles contact-level compliance
- **No Unified System**: No polymorphic compliance, no requirement inheritance, no automated alerts
- **Key Files**:
  - Router: `src/server/routers/contact-compliance.ts`
  - No unified migration exists

### CONTRACTS-01 Current State
- **6 contract tables**: `account_contracts`, `company_contracts`, `contact_agreements`, etc.
- **Active Routers**: `contactAgreements`, `crm.contracts` (partial)
- **Limited Features**: No versioning, no amendment tracking, no clause library
- **Key Files**:
  - Router: `src/server/routers/contact-agreements.ts`
  - CRM contracts: `src/server/routers/crm.ts:918-1130`

### RATES-01 Current State
- **7+ rate tables**: `job_rates`, `placement_rates`, `submission_rates`, `consultant_rates`, `company_rate_cards`, `contact_rate_cards`
- **Active Router**: `contactRateCards` - good patterns to follow
- **Inline fields**: `placements.bill_rate`, `placements.pay_rate` with GENERATED `markup_percentage`
- **Key Files**:
  - Router: `src/server/routers/contact-rate-cards.ts`
  - ATS margin logic: `src/server/routers/ats.ts:1987-2080, 3305-3415`

## Desired End State

### Unified Polymorphic Tables
```
compliance_requirements    → Master requirement definitions
compliance_items          → Polymorphic compliance records for any entity
contracts                 → Polymorphic contracts for any entity
contract_versions         → Amendment/version tracking
rate_cards               → Master rate card definitions
rate_card_items          → Line items by category/level
entity_rates             → Specific rates for entities (placement, submission, etc.)
```

### Key Features
- **Polymorphic**: All tables support any entity type via `entity_type` + `entity_id`
- **Versioned**: Full version history with effective dates
- **Validated**: Entity types validated against `entity_type_registry`
- **Audited**: Integration with HISTORY-01 for audit trail
- **Approval-Ready**: Built-in approval tables for future WORKFLOWS-01 integration

## What We're NOT Doing

1. **No Full Workflow Engine**: Using simple approval tables; WORKFLOWS-01 is Wave 6
2. **No E-Signature Integration**: Schema supports it, but no provider integration
3. **No AI Document Processing**: Schema has `processing_status`, but no OCR/AI
4. **No Rate Negotiation UI**: Backend only; UI is separate ticket
5. **No Legacy Table Deletion**: Legacy tables remain as views during shadow period

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration Strategy | Create new + backward-compatible views | Zero downtime, gradual migration |
| Router Strategy | New polymorphic routers + keep legacy | Backward compatibility |
| Entity Validation | Use `validate_entity_type()` trigger | Consistent with Wave 1 |
| Versioning | Dedicated version tables | More detail than HISTORY-01 generic audit |
| Approvals | Simple approval tables now | Ready for WORKFLOWS-01 integration |

---

## Implementation Approach

### Execution Strategy

```
PHASE 1 (PARALLEL) - Schema Creation
├── 1A: COMPLIANCE-01 Schema  ─┬─ Can run simultaneously
├── 1B: CONTRACTS-01 Schema   ─┤
└── 1C: RATES-01 Schema       ─┘

PHASE 2 (SEQUENTIAL per system) - Routers & Data Migration
├── 2A: COMPLIANCE-01 Router + Migration
├── 2B: CONTRACTS-01 Router + Migration
└── 2C: RATES-01 Router + Migration

PHASE 3 (PARALLEL) - UI Components
├── 3A: COMPLIANCE-01 UI Components  ─┬─ Can run simultaneously
├── 3B: CONTRACTS-01 UI Components   ─┤
└── 3C: RATES-01 UI Components       ─┘

PHASE 4 (SEQUENTIAL) - Integration & Validation
└── 4: Integration Testing, E2E Tests, Validation

PHASE 5 (SEQUENTIAL) - Legacy Cleanup
└── 5: Shadow Period, View Creation, Legacy Deprecation
```

---

## Phase 1A: COMPLIANCE-01 Schema

### Overview
Create unified compliance tracking schema with requirement inheritance and expiration alerts.

### Changes Required

#### 1. Migration File
**File**: `supabase/migrations/20251212100000_create_compliance_system.sql`

```sql
-- ============================================
-- COMPLIANCE-01: Unified Compliance Tracking System
-- Creates compliance_requirements, compliance_items, entity_compliance_requirements
-- with requirement inheritance and expiration alerts
-- ============================================

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
CREATE TRIGGER trg_compliance_items_validate_entity_type
BEFORE INSERT OR UPDATE ON compliance_items
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
CREATE TRIGGER trg_compliance_items_updated_at
BEFORE UPDATE ON compliance_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER trg_entity_compliance_req_validate_entity_type
BEFORE INSERT OR UPDATE ON entity_compliance_requirements
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

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
```

### Success Criteria

#### Automated Verification:
- [x] Migration applies cleanly: `pnpm db:migrate`
- [x] No type errors: `pnpm tsc --noEmit` (pre-existing errors unrelated to migration)
- [x] `compliance_requirements` table exists with all columns
- [x] `compliance_items` table exists with polymorphic columns
- [x] `entity_compliance_requirements` junction table exists
- [x] All indexes created (15 indexes)
- [x] All RLS policies active (3 policies)
- [x] `check_entity_compliance` function returns correctly
- [x] Entity types registered in `entity_type_registry`

#### Manual Verification:
- [ ] Can insert compliance requirement via Supabase Studio
- [ ] Can insert compliance item for contact
- [ ] Can insert compliance item for company
- [ ] RLS properly isolates by org_id
- [ ] `check_entity_compliance` returns accurate results

---

## Phase 1B: CONTRACTS-01 Schema

### Overview
Create unified contract management schema with versioning, multi-party support, and e-signature readiness.

### Changes Required

#### 1. Migration File
**File**: `supabase/migrations/20251212100100_create_contracts_system.sql`

```sql
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
```

### Success Criteria

#### Automated Verification:
- [x] Migration applies cleanly: `pnpm db:migrate`
- [x] No type errors: `pnpm tsc --noEmit` (pre-existing errors unrelated to migration)
- [x] `contracts` table exists with polymorphic columns
- [x] `contract_versions` table exists
- [x] `contract_parties` table exists
- [x] `contract_templates` table exists
- [x] `contract_clauses` table exists
- [x] All ENUMs created (contract_status, contract_type, signatory_status)
- [x] All indexes created (15 indexes)
- [x] All RLS policies active (5 policies)
- [x] Helper functions work correctly (get_active_contract, check_contract_signatures)

#### Manual Verification:
- [ ] Can insert contract for company
- [ ] Can insert contract for contact
- [ ] Can add parties to contract
- [ ] Can create version for contract
- [ ] `get_active_contract` returns correctly
- [ ] `check_contract_signatures` returns correctly

---

## Phase 1C: RATES-01 Schema

### Overview
Create unified rate card system with versioning, margin calculations, and rate inheritance.

### Changes Required

#### 1. Migration File
**File**: `supabase/migrations/20251212100200_create_rates_system.sql`

```sql
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
```

### Success Criteria

#### Automated Verification:
- [x] Migration applies cleanly: `pnpm db:migrate` ✅ Verified 2025-12-11
- [x] No type errors: `pnpm tsc --noEmit` ✅ Pre-existing errors only, unrelated to migration
- [x] `rate_cards` table exists with versioning columns ✅ Verified
- [x] `rate_card_items` table exists with calculated columns ✅ Verified
- [x] `entity_rates` table exists with GENERATED margin columns ✅ Verified
- [x] `rate_change_history` table exists ✅ Verified
- [x] `rate_approvals` table exists ✅ Verified
- [x] All ENUMs created (rate_card_type, rate_unit) ✅ Verified
- [x] All indexes created (15 indexes) ✅ Verified
- [x] All RLS policies active (5 policies) ✅ Verified
- [x] Placement sync trigger created ✅ Verified
- [x] Helper functions exist (get_entity_rate, calculate_margin) ✅ Verified
- [x] Entity types registered (rate_card, entity_rate) ✅ Verified

#### Manual Verification:
- [ ] GENERATED columns calculate correctly
- [ ] `sync_placement_rates` updates placement when entity_rate changes
- [ ] `get_entity_rate` returns correct rate with inheritance
- [ ] `calculate_margin` returns correct values

---

## Phase 2A: COMPLIANCE-01 Router & Migration

### Overview
Create unified `compliance` tRPC router and migrate data from legacy tables.

### Changes Required

#### 1. tRPC Router
**File**: `src/server/routers/compliance.ts`

```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// COMPLIANCE-01: Unified Compliance Router
// ============================================

// Input schemas
const complianceStatusEnum = z.enum([
  'pending', 'received', 'under_review', 'verified',
  'expiring', 'expired', 'rejected', 'waived'
])

const complianceCategoryEnum = z.enum([
  'background', 'drug_test', 'tax', 'insurance', 'certification',
  'legal', 'immigration', 'health', 'training', 'other'
])

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const complianceRouter = router({
  // Requirements CRUD
  requirements: router({
    list: orgProtectedProcedure
      .input(z.object({
        category: complianceCategoryEnum.optional(),
        isActive: z.boolean().optional(),
        isBlocking: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('compliance_requirements')
          .select('*', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.category) query = query.eq('category', input.category)
        if (input.isActive !== undefined) query = query.eq('is_active', input.isActive)
        if (input.isBlocking !== undefined) query = query.eq('is_blocking', input.isBlocking)

        query = query
          .order('category')
          .order('requirement_name')
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

        return { items: data ?? [], total: count ?? 0 }
      }),

    create: orgProtectedProcedure
      .input(z.object({
        requirementCode: z.string(),
        requirementName: z.string(),
        description: z.string().optional(),
        category: complianceCategoryEnum,
        subcategory: z.string().optional(),
        appliesToEntityTypes: z.array(z.string()).default(['contact']),
        validityPeriodDays: z.number().optional(),
        renewalLeadDays: z.number().default(30),
        priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
        isBlocking: z.boolean().default(false),
        requiresDocument: z.boolean().default(true),
        acceptedDocumentTypes: z.array(z.string()).optional(),
        jurisdiction: z.string().optional(),
        jurisdictionRegion: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_requirements')
          .insert({
            org_id: orgId,
            requirement_code: input.requirementCode,
            requirement_name: input.requirementName,
            description: input.description,
            category: input.category,
            subcategory: input.subcategory,
            applies_to_entity_types: input.appliesToEntityTypes,
            validity_period_days: input.validityPeriodDays,
            renewal_lead_days: input.renewalLeadDays,
            priority: input.priority,
            is_blocking: input.isBlocking,
            requires_document: input.requiresDocument,
            accepted_document_types: input.acceptedDocumentTypes,
            jurisdiction: input.jurisdiction,
            jurisdiction_region: input.jurisdictionRegion,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { id: data.id }
      }),
  }),

  // Compliance Items CRUD
  items: router({
    listByEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        status: complianceStatusEnum.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('compliance_items')
          .select(`
            *,
            requirement:compliance_requirements!requirement_id(id, requirement_name, category, is_blocking),
            verifier:user_profiles!verified_by(id, full_name)
          `, { count: 'exact' })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .is('deleted_at', null)

        if (input.status) query = query.eq('status', input.status)

        query = query
          .order('expiry_date', { ascending: true, nullsFirst: false })
          .range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

        return { items: data ?? [], total: count ?? 0 }
      }),

    create: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        requirementId: z.string().uuid().optional(),
        complianceType: z.string().optional(),
        complianceName: z.string().optional(),
        status: complianceStatusEnum.default('pending'),
        documentId: z.string().uuid().optional(),
        documentUrl: z.string().optional(),
        effectiveDate: z.string().optional(),
        expiryDate: z.string().optional(),
        policyNumber: z.string().optional(),
        coverageAmount: z.number().optional(),
        insuranceCarrier: z.string().optional(),
        verificationNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('compliance_items')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            requirement_id: input.requirementId,
            compliance_type: input.complianceType,
            compliance_name: input.complianceName,
            status: input.status,
            document_id: input.documentId,
            document_url: input.documentUrl,
            effective_date: input.effectiveDate,
            expiry_date: input.expiryDate,
            policy_number: input.policyNumber,
            coverage_amount: input.coverageAmount,
            insurance_carrier: input.insuranceCarrier,
            verification_notes: input.verificationNotes,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { id: data.id }
      }),

    verify: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        verificationMethod: z.string().optional(),
        verificationNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({
            status: 'verified',
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
            verification_method: input.verificationMethod || 'manual',
            verification_notes: input.verificationNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { success: true }
      }),

    reject: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({
            status: 'rejected',
            rejection_reason: input.reason,
            verified_by: user?.id,
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { success: true }
      }),

    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('compliance_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { success: true }
      }),
  }),

  // Compliance Check
  checkCompliance: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
      blockingOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('check_entity_compliance', {
          p_entity_type: input.entityType,
          p_entity_id: input.entityId,
          p_check_blocking_only: input.blockingOnly,
        })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data?.[0] ?? { is_compliant: true, total_requirements: 0, compliant_count: 0, pending_count: 0, expired_count: 0, blocking_issues: [] }
    }),

  // Expiring items
  getExpiring: orgProtectedProcedure
    .input(z.object({
      daysAhead: z.number().min(1).max(90).default(30),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + input.daysAhead)

      const { data, error } = await adminClient
        .from('compliance_items')
        .select(`
          *,
          requirement:compliance_requirements!requirement_id(id, requirement_name, category, is_blocking)
        `)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .not('status', 'in', '("expired","rejected","waived")')
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(input.limit)

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data ?? []
    }),

  // Stats
  statsByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data } = await adminClient
        .from('compliance_items')
        .select('id, status, expiry_date')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .is('deleted_at', null)

      const now = new Date()
      const thirtyDays = new Date()
      thirtyDays.setDate(thirtyDays.getDate() + 30)

      return {
        total: data?.length ?? 0,
        verified: data?.filter(d => d.status === 'verified').length ?? 0,
        pending: data?.filter(d => ['pending', 'received', 'under_review'].includes(d.status)).length ?? 0,
        expired: data?.filter(d => d.status === 'expired' || (d.expiry_date && new Date(d.expiry_date) < now)).length ?? 0,
        expiringSoon: data?.filter(d =>
          d.expiry_date &&
          new Date(d.expiry_date) <= thirtyDays &&
          new Date(d.expiry_date) > now
        ).length ?? 0,
      }
    }),
})
```

#### 2. Register Router
**File**: `src/server/trpc/root.ts`
Add import and registration:
```typescript
// Add import
import { complianceRouter } from '../routers/compliance'

// Add to appRouter
compliance: complianceRouter,
```

### Success Criteria

#### Automated Verification:
- [x] No type errors: `pnpm tsc --noEmit` ✅ 2025-12-11 (pre-existing errors only, unrelated)
- [x] Router registered in root.ts ✅ 2025-12-11
- [x] All procedures implemented: requirements CRUD, items CRUD, verify/reject/waive, checkCompliance, getExpiring, statsByEntity, entityRequirements ✅ 2025-12-11

#### Manual Verification:
- [ ] Can list requirements
- [ ] Can create requirement
- [ ] Can create compliance item for contact
- [ ] Can verify/reject compliance item
- [ ] Can check compliance status
- [ ] Expiring items query works

---

## Phase 2B: CONTRACTS-01 Router & Migration

Similar structure to Phase 2A. Create `src/server/routers/contracts.ts` with:
- `contracts.list`, `contracts.getById`, `contracts.create`, `contracts.update`, `contracts.delete`
- `contracts.activate`, `contracts.terminate`, `contracts.renew`
- `versions.list`, `versions.create`
- `parties.list`, `parties.add`, `parties.sign`
- `templates.list`, `templates.create`
- `clauses.list`, `clauses.create`

---

## Phase 2C: RATES-01 Router & Migration

Similar structure to Phase 2A. Create `src/server/routers/rates.ts` with:
- `rateCards.list`, `rateCards.getById`, `rateCards.create`, `rateCards.update`
- `rateCards.createVersion`, `rateCards.activate`, `rateCards.deactivate`
- `items.list`, `items.create`, `items.update`, `items.delete`
- `entityRates.listByEntity`, `entityRates.getById`, `entityRates.create`, `entityRates.update`
- `entityRates.getCurrentRate`, `entityRates.requestApproval`
- `approvals.list`, `approvals.approve`, `approvals.reject`
- `calculateMargin` (utility)

---

## Phase 3: UI Components

### 3A: COMPLIANCE-01 UI Components
- `ComplianceItemsSection.tsx` - Section component for entity workspace
- `ComplianceStatusBadge.tsx` - Status indicator
- `ComplianceRequirementForm.tsx` - Admin requirement management
- `ComplianceItemForm.tsx` - Add/edit compliance items
- `ExpiringComplianceWidget.tsx` - Dashboard widget

### 3B: CONTRACTS-01 UI Components
- `ContractsSection.tsx` - Section component for entity workspace
- `ContractStatusBadge.tsx` - Status indicator
- `ContractForm.tsx` - Create/edit contracts
- `ContractVersionHistory.tsx` - Version timeline
- `ContractSignatories.tsx` - Party management

### 3C: RATES-01 UI Components
- `RateCardManager.tsx` - Rate card CRUD
- `RateCardItemEditor.tsx` - Line item management
- `EntityRateWidget.tsx` - Rate display on entities
- `MarginCalculator.tsx` - What-if analysis
- `RateApprovalDialog.tsx` - Approval workflow

---

## Phase 4: Integration & Validation

### Testing Strategy

#### Unit Tests:
- Router procedure tests
- Margin calculation tests
- Compliance check function tests

#### Integration Tests:
- Create compliance requirement → create item → verify → check compliance
- Create rate card → create items → apply to entity → verify margin
- Create contract → add parties → sign → activate

#### E2E Tests:
- Full compliance workflow via UI
- Full contract workflow via UI
- Rate card management via UI

---

## Phase 5: Legacy Cleanup

### Shadow Period
1. Create backward-compatible views for legacy tables
2. Update legacy routers to use new tables via views
3. Monitor for errors/issues
4. After validation, deprecate legacy routers

### View Creation (Example)
```sql
-- Legacy contact_compliance view
CREATE OR REPLACE VIEW contact_compliance_legacy AS
SELECT
  id,
  org_id,
  entity_id AS contact_id,
  compliance_type,
  status,
  document_url,
  document_received_at,
  effective_date,
  expiry_date,
  verified_by,
  verified_at,
  verification_notes,
  policy_number,
  coverage_amount,
  insurance_carrier,
  expiry_alert_sent_at,
  created_at,
  updated_at,
  deleted_at
FROM compliance_items
WHERE entity_type = 'contact';
```

---

## References

- Original tickets: `thoughts/shared/issues/compliance-01`, `contracts-01`, `rates-01`
- Research: `thoughts/shared/research/2025-12-11-wave-3-legal-financial-infrastructure.md`
- Wave 1 patterns: `supabase/migrations/20251211*`
- Existing routers: `src/server/routers/contact-compliance.ts`, `contact-agreements.ts`, `contact-rate-cards.ts`

---

## Execution Summary

| Phase | Tasks | Can Parallelize | Duration Estimate |
|-------|-------|-----------------|-------------------|
| 1A | COMPLIANCE-01 Schema | Yes (with 1B, 1C) | 2-3 hours |
| 1B | CONTRACTS-01 Schema | Yes (with 1A, 1C) | 2-3 hours |
| 1C | RATES-01 Schema | Yes (with 1A, 1B) | 2-3 hours |
| 2A | COMPLIANCE-01 Router | Sequential | 3-4 hours |
| 2B | CONTRACTS-01 Router | Sequential | 4-5 hours |
| 2C | RATES-01 Router | Sequential | 4-5 hours |
| 3A | COMPLIANCE-01 UI | Yes (with 3B, 3C) | 4-6 hours |
| 3B | CONTRACTS-01 UI | Yes (with 3A, 3C) | 6-8 hours |
| 3C | RATES-01 UI | Yes (with 3A, 3B) | 6-8 hours |
| 4 | Integration & E2E | Sequential | 4-6 hours |
| 5 | Legacy Cleanup | Sequential | 2-3 hours |

**Parallel Execution Points:**
1. Phase 1 (A, B, C) - All three schema migrations can run in parallel
2. Phase 3 (A, B, C) - All three UI component sets can run in parallel

**Sequential Dependencies:**
- Phase 2 depends on Phase 1 (schema must exist before router)
- Phase 3 depends on Phase 2 (router must exist before UI)
- Phase 4 depends on Phase 3 (integration tests need UI)
- Phase 5 depends on Phase 4 (validation before cleanup)
