-- =====================================================
-- Candidate Resumes - Resume Versioning System
-- =====================================================
-- This table implements a versioning system for candidate resumes.
-- Resumes are never deleted, only archived - creating a complete history.

CREATE TABLE IF NOT EXISTS candidate_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT TRUE,
  previous_version_id UUID REFERENCES candidate_resumes(id),

  -- File storage
  bucket TEXT NOT NULL DEFAULT 'resumes',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,

  -- Resume metadata
  resume_type TEXT DEFAULT 'master', -- 'master', 'formatted', 'client_specific'
  title TEXT,
  notes TEXT,

  -- Parsed content (for AI features)
  parsed_content TEXT,
  parsed_skills TEXT[],
  parsed_experience TEXT,
  ai_summary TEXT,

  -- Submission tracking
  submission_write_up TEXT,

  -- Upload info
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft delete (never truly delete)
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_org_id ON candidate_resumes(org_id);
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_id ON candidate_resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_is_latest ON candidate_resumes(candidate_id, is_latest) WHERE is_latest = TRUE;
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_resume_type ON candidate_resumes(resume_type);
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_not_archived ON candidate_resumes(candidate_id) WHERE is_archived = FALSE;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_candidate_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_candidate_resumes_updated_at ON candidate_resumes;
CREATE TRIGGER trigger_candidate_resumes_updated_at
  BEFORE UPDATE ON candidate_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_resumes_updated_at();

-- RLS policies
ALTER TABLE candidate_resumes ENABLE ROW LEVEL SECURITY;

-- Users can view resumes in their organization
CREATE POLICY "Users can view resumes in their org" ON candidate_resumes
  FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Users can insert resumes in their organization
CREATE POLICY "Users can insert resumes in their org" ON candidate_resumes
  FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Users can update resumes in their organization
CREATE POLICY "Users can update resumes in their org" ON candidate_resumes
  FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM user_profiles WHERE auth_id = auth.uid()
  ));

-- Comment for documentation
COMMENT ON TABLE candidate_resumes IS 'Versioned resume storage for candidates. Resumes are never deleted, only archived.';
COMMENT ON COLUMN candidate_resumes.version IS 'Version number, increments with each new upload';
COMMENT ON COLUMN candidate_resumes.is_latest IS 'TRUE for the most recent version of each resume type';
COMMENT ON COLUMN candidate_resumes.resume_type IS 'master (original), formatted (internal formatted), client_specific (tailored for specific client)';
COMMENT ON COLUMN candidate_resumes.submission_write_up IS 'Pre-formatted text for quick submissions to clients';
