-- ============================================
-- DOCS-01: Unified Documents System
-- Creates polymorphic documents table with versioning and access control
-- ============================================

-- Use VARCHAR with CHECK constraints instead of ENUMs to avoid conflicts
-- with existing document_type enum in baseline

-- Unified documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic entity reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(20),  -- Extension
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,

  -- Storage
  storage_provider VARCHAR(20) DEFAULT 'supabase',
  storage_bucket VARCHAR(100),
  storage_path VARCHAR(500) NOT NULL,
  public_url VARCHAR(1000),

  -- Classification
  document_type VARCHAR(50) NOT NULL DEFAULT 'other',
  document_category VARCHAR(50) DEFAULT 'general',
  description TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT true,
  previous_version_id UUID REFERENCES documents(id),
  version_notes TEXT,

  -- Processing
  processing_status VARCHAR(20) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  ocr_text TEXT,
  extracted_metadata JSONB,

  -- Deduplication
  content_hash VARCHAR(64),  -- SHA-256

  -- Expiration
  expires_at TIMESTAMPTZ,
  expiry_alert_sent_at TIMESTAMPTZ,
  expiry_alert_days_before INTEGER DEFAULT 30,

  -- Access control
  is_confidential BOOLEAN DEFAULT false,
  access_level VARCHAR(20) DEFAULT 'standard',
  accessible_by_roles TEXT[],

  -- Tags
  tags TEXT[],

  -- Audit
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- CHECK constraints for valid values
  CONSTRAINT documents_document_type_check CHECK (document_type IN (
    -- Person documents
    'resume', 'cover_letter', 'id_document', 'certification', 'reference_letter',
    'background_check', 'drug_test', 'i9', 'w4', 'direct_deposit',
    -- Company documents
    'msa', 'nda', 'sow', 'w9', 'coi', 'insurance', 'contract',
    -- Job documents
    'job_description', 'requirements', 'scorecard',
    -- General
    'other', 'note_attachment', 'email_attachment'
  )),
  CONSTRAINT documents_document_category_check CHECK (document_category IN (
    'compliance', 'legal', 'marketing', 'hr', 'operational', 'general'
  )),
  CONSTRAINT documents_access_level_check CHECK (access_level IN (
    'public', 'standard', 'confidential', 'restricted'
  )),
  CONSTRAINT documents_processing_status_check CHECK (processing_status IN (
    'pending', 'processing', 'completed', 'failed'
  ))
);

-- Indexes
CREATE INDEX idx_documents_org ON documents(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(document_type, entity_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expiry ON documents(expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_hash ON documents(content_hash) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_latest ON documents(entity_type, entity_id, document_type) WHERE is_latest_version = true AND deleted_at IS NULL;
CREATE INDEX idx_documents_processing ON documents(processing_status) WHERE processing_status != 'completed' AND deleted_at IS NULL;

-- Entity type validation trigger (uses validate_entity_type from ENTITIES-01)
CREATE TRIGGER trg_documents_validate_entity_type
BEFORE INSERT OR UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION validate_entity_type();

-- Updated_at trigger
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Document access log (audit trail)
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  action VARCHAR(20) NOT NULL,  -- 'view', 'download', 'share', 'delete'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_access_document ON document_access_log(document_id, accessed_at DESC);
CREATE INDEX idx_document_access_user ON document_access_log(user_id, accessed_at DESC);

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_org_isolation" ON documents
  FOR ALL USING (org_id = (current_setting('app.org_id', true))::uuid);

CREATE POLICY "documents_access_level" ON documents
  FOR SELECT USING (
    access_level IN ('public', 'standard')
    OR (access_level = 'confidential' AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = (current_setting('app.user_id', true))::uuid
      AND ur.role_id IN (SELECT id FROM roles WHERE name IN ('admin', 'manager'))
    ))
    OR uploaded_by = (current_setting('app.user_id', true))::uuid
  );

ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_access_log_policy" ON document_access_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM documents d WHERE d.id = document_id AND d.org_id = (current_setting('app.org_id', true))::uuid)
  );

-- Comments
COMMENT ON TABLE documents IS 'Unified documents table for all entity types (DOCS-01)';
COMMENT ON TABLE document_access_log IS 'Audit trail for document access events';
COMMENT ON COLUMN documents.entity_type IS 'Polymorphic entity type (contact, company, job, placement, campaign)';
COMMENT ON COLUMN documents.content_hash IS 'SHA-256 hash of file content for deduplication';
COMMENT ON COLUMN documents.processing_status IS 'OCR/AI processing status';
