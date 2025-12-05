-- ============================================================================
-- Migration: Data Management Tables
-- Date: 2025-12-08
-- Description: Tables for data import, export, GDPR, and duplicate management
-- ============================================================================

-- ============================================================================
-- IMPORT JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job configuration
  entity_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  field_mapping JSONB NOT NULL DEFAULT '{}',
  import_options JSONB NOT NULL DEFAULT '{}',

  -- Progress tracking
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  warning_rows INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  error_log JSONB DEFAULT '[]',
  warnings_log JSONB DEFAULT '[]',

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE import_jobs IS 'Tracks data import operations';
COMMENT ON COLUMN import_jobs.status IS 'pending, validating, processing, completed, failed, cancelled';
COMMENT ON COLUMN import_jobs.import_options IS 'error_handling: skip|stop|flag, create_missing_references, etc.';

-- ============================================================================
-- EXPORT JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Job configuration
  entity_type VARCHAR(50) NOT NULL,
  export_name VARCHAR(255),
  filters JSONB DEFAULT '{}',
  columns TEXT[] NOT NULL,
  format VARCHAR(20) NOT NULL DEFAULT 'csv',
  include_headers BOOLEAN DEFAULT TRUE,

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_cron VARCHAR(100),
  schedule_name VARCHAR(255),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- Results
  file_path TEXT,
  file_size_bytes INTEGER,
  record_count INTEGER,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE export_jobs IS 'Tracks data export operations';
COMMENT ON COLUMN export_jobs.status IS 'pending, processing, completed, failed, cancelled';
COMMENT ON COLUMN export_jobs.format IS 'csv, excel, json';

-- ============================================================================
-- GDPR REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Request identification
  request_number VARCHAR(50) NOT NULL,
  request_type VARCHAR(30) NOT NULL,

  -- Subject information
  subject_email VARCHAR(255) NOT NULL,
  subject_name VARCHAR(255),
  subject_phone VARCHAR(50),
  verification_method VARCHAR(50),
  verified_at TIMESTAMPTZ,

  -- Data discovery
  data_found JSONB DEFAULT '{}',
  tables_scanned TEXT[],
  total_records_found INTEGER DEFAULT 0,

  -- Processing
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  action_taken VARCHAR(50),
  export_file_path TEXT,
  anonymized_fields JSONB DEFAULT '[]',

  -- Notes and compliance
  notes TEXT,
  due_date DATE NOT NULL,
  compliance_notes TEXT,

  -- Audit
  processed_by UUID REFERENCES user_profiles(id),
  processed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE gdpr_requests IS 'Tracks GDPR data subject requests (DSAR, erasure, etc.)';
COMMENT ON COLUMN gdpr_requests.request_type IS 'dsar, erasure, rectification, restriction, portability';
COMMENT ON COLUMN gdpr_requests.status IS 'pending, in_review, processing, completed, rejected';

-- ============================================================================
-- DUPLICATE RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS duplicate_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Entity information
  entity_type VARCHAR(50) NOT NULL,
  record_id_1 UUID NOT NULL,
  record_id_2 UUID NOT NULL,

  -- Match information
  confidence_score DECIMAL(5,4) NOT NULL,
  match_fields TEXT[] NOT NULL,
  match_details JSONB DEFAULT '{}',

  -- Resolution
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  merged_into_id UUID,
  dismissed_reason TEXT,

  -- Audit
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_duplicate_pair UNIQUE (org_id, entity_type, record_id_1, record_id_2),
  CONSTRAINT ordered_record_ids CHECK (record_id_1 < record_id_2)
);

COMMENT ON TABLE duplicate_records IS 'Tracks potential duplicate records for review and merge';
COMMENT ON COLUMN duplicate_records.status IS 'pending, merged, dismissed, auto_merged';

-- ============================================================================
-- DUPLICATE RULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS duplicate_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule configuration
  entity_type VARCHAR(50) NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Match criteria
  match_fields TEXT[] NOT NULL,
  match_type VARCHAR(20) NOT NULL DEFAULT 'exact',
  fuzzy_threshold DECIMAL(3,2) DEFAULT 0.85,

  -- Auto-merge settings
  auto_merge_threshold DECIMAL(5,4),
  auto_merge_enabled BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_rule_name UNIQUE (org_id, entity_type, rule_name)
);

COMMENT ON TABLE duplicate_rules IS 'Configurable rules for duplicate detection per entity type';
COMMENT ON COLUMN duplicate_rules.match_type IS 'exact, fuzzy, phonetic';

-- ============================================================================
-- DATA ARCHIVE RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS archived_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Original record info
  entity_type VARCHAR(50) NOT NULL,
  original_id UUID NOT NULL,
  original_data JSONB NOT NULL,

  -- Archive info
  archive_reason VARCHAR(100),
  archived_by UUID NOT NULL REFERENCES user_profiles(id),
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Restoration
  restored_at TIMESTAMPTZ,
  restored_by UUID REFERENCES user_profiles(id),

  -- Permanent deletion
  permanently_deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),

  -- Constraints
  CONSTRAINT unique_archived_record UNIQUE (org_id, entity_type, original_id)
);

COMMENT ON TABLE archived_records IS 'Stores archived/soft-deleted records with full data for restoration';

-- ============================================================================
-- RETENTION POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Policy configuration
  entity_type VARCHAR(50) NOT NULL,
  policy_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Retention rules
  retention_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  delete_after_archive_days INTEGER,

  -- Conditions
  status_filter TEXT[],
  additional_conditions JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_retention_policy UNIQUE (org_id, entity_type, policy_name)
);

COMMENT ON TABLE retention_policies IS 'Configurable data retention policies per entity type';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Import jobs indexes
CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON import_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by ON import_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);

-- Export jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_org ON export_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_scheduled ON export_jobs(is_scheduled) WHERE is_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_export_jobs_next_run ON export_jobs(next_run_at) WHERE is_scheduled = TRUE;
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON export_jobs(created_at DESC);

-- GDPR requests indexes
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_org ON gdpr_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_type ON gdpr_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_email ON gdpr_requests(subject_email);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_due_date ON gdpr_requests(due_date);

-- Duplicate records indexes
CREATE INDEX IF NOT EXISTS idx_duplicate_records_org ON duplicate_records(org_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_entity ON duplicate_records(entity_type);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_status ON duplicate_records(status);
CREATE INDEX IF NOT EXISTS idx_duplicate_records_confidence ON duplicate_records(confidence_score DESC);

-- Archived records indexes
CREATE INDEX IF NOT EXISTS idx_archived_records_org ON archived_records(org_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_entity ON archived_records(entity_type, original_id);
CREATE INDEX IF NOT EXISTS idx_archived_records_archived_at ON archived_records(archived_at DESC);

-- Duplicate rules indexes
CREATE INDEX IF NOT EXISTS idx_duplicate_rules_org ON duplicate_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_rules_entity ON duplicate_rules(entity_type);

-- Retention policies indexes
CREATE INDEX IF NOT EXISTS idx_retention_policies_org ON retention_policies(org_id);
CREATE INDEX IF NOT EXISTS idx_retention_policies_entity ON retention_policies(entity_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER gdpr_requests_updated_at
  BEFORE UPDATE ON gdpr_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER duplicate_records_updated_at
  BEFORE UPDATE ON duplicate_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER duplicate_rules_updated_at
  BEFORE UPDATE ON duplicate_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER retention_policies_updated_at
  BEFORE UPDATE ON retention_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER archived_records_updated_at
  BEFORE UPDATE ON archived_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- Import jobs RLS - allow service role and org members
CREATE POLICY "import_jobs_org_isolation" ON import_jobs
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Export jobs RLS
CREATE POLICY "export_jobs_org_isolation" ON export_jobs
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- GDPR requests RLS (org isolation, admin check done at app level)
CREATE POLICY "gdpr_requests_org_isolation" ON gdpr_requests
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Duplicate records RLS
CREATE POLICY "duplicate_records_org_isolation" ON duplicate_records
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Duplicate rules RLS
CREATE POLICY "duplicate_rules_org_isolation" ON duplicate_rules
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Archived records RLS
CREATE POLICY "archived_records_org_isolation" ON archived_records
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- Retention policies RLS
CREATE POLICY "retention_policies_org_isolation" ON retention_policies
  FOR ALL USING (
    org_id IN (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================================================
-- END MIGRATION
-- ============================================================================
