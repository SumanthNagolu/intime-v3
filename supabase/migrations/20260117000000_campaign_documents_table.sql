-- =====================================================
-- Migration: Campaign Documents Table
-- Date: 2024-12-09
-- Description: Create campaign_documents table for storing templates, collateral, and reports
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Document metadata
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL DEFAULT 'attachment', -- 'template', 'collateral', 'report', 'attachment'
  category TEXT, -- 'email_template', 'linkedin_template', 'presentation', 'case_study', etc.
  
  -- File info
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Template-specific fields
  template_variables JSONB, -- For email/LinkedIn templates
  
  -- Metadata
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_documents_campaign ON campaign_documents(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_documents_org ON campaign_documents(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_documents_type ON campaign_documents(document_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_documents_category ON campaign_documents(category) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE campaign_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "campaign_documents_org_isolation" ON campaign_documents;
CREATE POLICY "campaign_documents_org_isolation"
  ON campaign_documents
  FOR ALL
  USING (org_id = auth_org_id());

DROP POLICY IF EXISTS "campaign_documents_select" ON campaign_documents;
CREATE POLICY "campaign_documents_select"
  ON campaign_documents
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

DROP POLICY IF EXISTS "campaign_documents_insert" ON campaign_documents;
CREATE POLICY "campaign_documents_insert"
  ON campaign_documents
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

DROP POLICY IF EXISTS "campaign_documents_update" ON campaign_documents;
CREATE POLICY "campaign_documents_update"
  ON campaign_documents
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    uploaded_by = auth.uid()
  );

DROP POLICY IF EXISTS "campaign_documents_delete" ON campaign_documents;
CREATE POLICY "campaign_documents_delete"
  ON campaign_documents
  FOR DELETE
  USING (
    auth_has_role('admin') OR
    uploaded_by = auth.uid()
  );

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trigger_campaign_documents_updated_at ON campaign_documents;
CREATE TRIGGER trigger_campaign_documents_updated_at
  BEFORE UPDATE ON campaign_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONE
-- =====================================================

