-- =====================================================
-- Migration: Bench Sales Module
-- Date: 2024-11-24
-- Description: Bench consultant management, external job sourcing, immigration tracking
-- =====================================================

-- =====================================================
-- 1. BENCH_METADATA (Extends user_profiles for bench consultants)
-- =====================================================

CREATE TABLE bench_metadata (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Bench tracking
  bench_start_date DATE NOT NULL,

  -- Days on bench (computed via function get_days_on_bench())
  -- Note: Cannot use GENERATED column with subquery, compute via function instead
  days_on_bench INTEGER DEFAULT 0,

  -- Alerts
  alert_30_day_sent BOOLEAN DEFAULT false,
  alert_30_day_sent_at TIMESTAMPTZ,
  alert_60_day_sent BOOLEAN DEFAULT false,
  alert_60_day_sent_at TIMESTAMPTZ,

  -- Marketing
  last_hotlist_sent_at TIMESTAMPTZ,
  hotlist_send_count INTEGER DEFAULT 0,
  last_outreach_date TIMESTAMPTZ,

  -- Immigration
  has_active_immigration_case BOOLEAN DEFAULT false,
  immigration_case_id UUID, -- FK to immigration_cases (set below)

  -- Engagement
  last_contacted_at TIMESTAMPTZ,
  contact_frequency_days INTEGER DEFAULT 3,
  is_responsive BOOLEAN DEFAULT true,
  responsiveness_score INTEGER CHECK (responsiveness_score >= 0 AND responsiveness_score <= 100),

  -- Bench Sales assignment
  bench_sales_rep_id UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_bench_user ON bench_metadata(user_id);
CREATE INDEX idx_bench_days ON bench_metadata(days_on_bench DESC);
CREATE INDEX idx_bench_alerts ON bench_metadata(alert_30_day_sent, alert_60_day_sent) WHERE days_on_bench > 0;
CREATE INDEX idx_bench_rep ON bench_metadata(bench_sales_rep_id);

-- Auto-update days_on_bench
CREATE OR REPLACE FUNCTION update_bench_days_on_bench()
RETURNS TRIGGER AS $$
BEGIN
  -- Compute days on bench based on candidate_status and bench_start_date
  NEW.days_on_bench := CASE
    WHEN (SELECT candidate_status FROM user_profiles WHERE id = NEW.user_id) = 'bench'
    THEN (CURRENT_DATE - NEW.bench_start_date)::INTEGER
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bench_metadata_days_on_bench
  BEFORE INSERT OR UPDATE ON bench_metadata
  FOR EACH ROW EXECUTE FUNCTION update_bench_days_on_bench();

-- Auto-update updated_at
CREATE TRIGGER trigger_bench_metadata_updated_at
  BEFORE UPDATE ON bench_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. EXTERNAL_JOBS (Jobs scraped from market)
-- =====================================================

CREATE TABLE external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Source
  source_name TEXT NOT NULL, -- 'cognizant_portal', 'dice', 'monster', 'indeed', 'linkedin'
  source_job_id TEXT, -- External job ID
  source_url TEXT,

  -- Job details
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT,

  -- Location
  location TEXT,
  is_remote BOOLEAN DEFAULT false,

  -- Compensation
  rate_min NUMERIC(10,2),
  rate_max NUMERIC(10,2),
  rate_type TEXT DEFAULT 'hourly',

  -- Requirements
  required_skills TEXT[],
  experience_years_min INTEGER,
  visa_requirements TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'filled', 'ignored'

  -- Scraping metadata
  scraped_at TIMESTAMPTZ NOT NULL,
  last_verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Deduplication
  content_hash TEXT, -- Hash of title + description

  -- Match tracking
  match_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_external_jobs_org ON external_jobs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_external_jobs_source ON external_jobs(source_name);
CREATE INDEX idx_external_jobs_status ON external_jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_external_jobs_scraped ON external_jobs(scraped_at DESC);
CREATE INDEX idx_external_jobs_search ON external_jobs USING GIN(search_vector);
CREATE INDEX idx_external_jobs_hash ON external_jobs(content_hash);
CREATE UNIQUE INDEX idx_external_jobs_unique ON external_jobs(source_name, source_job_id) WHERE source_job_id IS NOT NULL;

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_external_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_external_jobs_search_vector
  BEFORE INSERT OR UPDATE ON external_jobs
  FOR EACH ROW EXECUTE FUNCTION update_external_jobs_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_external_jobs_updated_at
  BEFORE UPDATE ON external_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. JOB_SOURCES (Scraping Configuration)
-- =====================================================

CREATE TABLE job_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Source details
  name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL DEFAULT 'vendor_portal', -- 'vendor_portal', 'job_board', 'api', 'email'
  url TEXT,

  -- Scraping config
  scrape_frequency_hours INTEGER DEFAULT 24,
  last_scrape_at TIMESTAMPTZ,
  next_scrape_at TIMESTAMPTZ,

  -- Authentication
  requires_auth BOOLEAN DEFAULT false,
  auth_type TEXT, -- 'basic', 'oauth', 'cookie', 'api_key'
  credentials_encrypted TEXT, -- Encrypted credentials (use Supabase Vault)

  -- Parsing config (JSON selectors)
  selector_config JSONB,
  field_mapping JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_healthy BOOLEAN DEFAULT true,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,

  -- Stats
  total_jobs_scraped INTEGER DEFAULT 0,
  successful_scrapes INTEGER DEFAULT 0,
  failed_scrapes INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_job_sources_org ON job_sources(org_id);
CREATE INDEX idx_job_sources_active ON job_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_job_sources_next_scrape ON job_sources(next_scrape_at) WHERE is_active = true;

-- Auto-update updated_at
CREATE TRIGGER trigger_job_sources_updated_at
  BEFORE UPDATE ON job_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. BENCH_SUBMISSIONS (Submissions to External Jobs)
-- =====================================================

CREATE TABLE bench_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  external_job_id UUID NOT NULL REFERENCES external_jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Submission workflow
  status TEXT NOT NULL DEFAULT 'identified',
  -- Pipeline: 'identified' → 'contacted_candidate' → 'candidate_interested' →
  --          'submitted_to_vendor' → 'vendor_review' → 'interview' → 'offered' → 'placed' / 'rejected'

  -- Submission details
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMPTZ,
  submission_notes TEXT,

  -- Vendor interaction
  vendor_name TEXT,
  vendor_contact_name TEXT,
  vendor_contact_email TEXT,
  vendor_submission_id TEXT,
  vendor_feedback TEXT,

  -- Interview
  interview_date TIMESTAMPTZ,
  interview_feedback TEXT,

  -- Outcome
  placed_at TIMESTAMPTZ,
  placement_start_date DATE,
  placement_bill_rate NUMERIC(10,2),

  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Assignment
  bench_rep_id UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(external_job_id, candidate_id)
);

-- Indexes
CREATE INDEX idx_bench_submissions_org ON bench_submissions(org_id);
CREATE INDEX idx_bench_submissions_job ON bench_submissions(external_job_id);
CREATE INDEX idx_bench_submissions_candidate ON bench_submissions(candidate_id);
CREATE INDEX idx_bench_submissions_status ON bench_submissions(status);
CREATE INDEX idx_bench_submissions_rep ON bench_submissions(bench_rep_id);

-- Auto-update external_jobs.submission_count
CREATE OR REPLACE FUNCTION update_external_job_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE external_jobs SET
    submission_count = (SELECT COUNT(*) FROM bench_submissions WHERE external_job_id = NEW.external_job_id)
  WHERE id = NEW.external_job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_external_job_submissions
  AFTER INSERT ON bench_submissions
  FOR EACH ROW EXECUTE FUNCTION update_external_job_submission_count();

-- Auto-update updated_at
CREATE TRIGGER trigger_bench_submissions_updated_at
  BEFORE UPDATE ON bench_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. HOTLISTS (Marketing Documents)
-- =====================================================

CREATE TABLE hotlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Hotlist details
  title TEXT NOT NULL,
  description TEXT,

  -- Consultants included
  candidate_ids UUID[] NOT NULL,
  candidate_count INTEGER NOT NULL,

  -- Targeting
  target_accounts UUID[], -- Array of account IDs
  target_skills TEXT[],
  target_roles TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'expired'

  -- Document (use existing file_uploads table)
  document_file_id UUID, -- FK to file_uploads

  -- Distribution
  sent_at TIMESTAMPTZ,
  sent_by UUID REFERENCES user_profiles(id),
  sent_to_emails TEXT[],
  sent_to_account_ids UUID[],

  -- Engagement
  view_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  responses_text TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_hotlists_org ON hotlists(org_id);
CREATE INDEX idx_hotlists_status ON hotlists(status);
CREATE INDEX idx_hotlists_sent ON hotlists(sent_at DESC);
CREATE INDEX idx_hotlists_created_by ON hotlists(created_by);

-- Auto-update updated_at
CREATE TRIGGER trigger_hotlists_updated_at
  BEFORE UPDATE ON hotlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. IMMIGRATION_CASES (Visa Tracking)
-- =====================================================

CREATE TABLE immigration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Case details
  case_type TEXT NOT NULL, -- 'H1B', 'H1B_transfer', 'H1B_extension', 'L1', 'green_card', 'OPT_extension', 'TN'
  status TEXT NOT NULL DEFAULT 'drafting', -- 'drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn'

  -- Current visa details (from user_profiles)
  current_visa_type TEXT,
  current_visa_expiry DATE,

  -- New visa details
  new_visa_type TEXT,
  new_visa_start_date DATE,
  new_visa_end_date DATE,

  -- Processing
  petition_number TEXT, -- USCIS receipt number (e.g., WAC2190012345)
  filed_date DATE,
  approved_date DATE,
  denied_date DATE,
  denial_reason TEXT,

  -- RFE (Request for Evidence)
  rfe_received_date DATE,
  rfe_response_due_date DATE,
  rfe_response_submitted_date DATE,

  -- Costs
  filing_fee NUMERIC(10,2),
  attorney_fee NUMERIC(10,2),
  premium_processing_fee NUMERIC(10,2),
  total_cost NUMERIC(10,2) GENERATED ALWAYS AS (
    COALESCE(filing_fee, 0) + COALESCE(attorney_fee, 0) + COALESCE(premium_processing_fee, 0)
  ) STORED,
  paid_by TEXT DEFAULT 'employer', -- 'employer', 'candidate', 'shared'

  -- Documents (use existing file_uploads table)
  petition_document_file_id UUID,
  approval_notice_file_id UUID,
  i797_file_id UUID,

  -- Timeline
  days_elapsed INTEGER DEFAULT 0,

  next_action TEXT,
  next_action_date DATE,
  expected_decision_date DATE,

  -- Assignment
  case_manager_id UUID REFERENCES user_profiles(id),
  attorney_name TEXT,
  attorney_firm TEXT,
  attorney_email TEXT,
  attorney_phone TEXT,

  -- Notes
  internal_notes TEXT,
  timeline_notes JSONB, -- Array of timeline events

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_immigration_org ON immigration_cases(org_id);
CREATE INDEX idx_immigration_candidate ON immigration_cases(candidate_id);
CREATE INDEX idx_immigration_status ON immigration_cases(status);
CREATE INDEX idx_immigration_case_type ON immigration_cases(case_type);
CREATE INDEX idx_immigration_next_action ON immigration_cases(next_action_date);
CREATE INDEX idx_immigration_case_manager ON immigration_cases(case_manager_id);

-- Auto-update updated_at
CREATE TRIGGER trigger_immigration_updated_at
  BEFORE UPDATE ON immigration_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update days_elapsed
CREATE OR REPLACE FUNCTION update_immigration_days_elapsed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_elapsed := (CURRENT_DATE - COALESCE(NEW.filed_date, NEW.created_at::DATE))::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_immigration_days_elapsed
  BEFORE INSERT OR UPDATE ON immigration_cases
  FOR EACH ROW EXECUTE FUNCTION update_immigration_days_elapsed();

-- Add FK constraint from bench_metadata to immigration_cases
ALTER TABLE bench_metadata
  ADD CONSTRAINT fk_bench_immigration_case
  FOREIGN KEY (immigration_case_id)
  REFERENCES immigration_cases(id);

-- Auto-update bench_metadata.has_active_immigration_case
CREATE OR REPLACE FUNCTION update_bench_immigration_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bench_metadata SET
    has_active_immigration_case = EXISTS (
      SELECT 1 FROM immigration_cases
      WHERE candidate_id = NEW.candidate_id
        AND status IN ('drafting', 'submitted', 'rfe')
    ),
    immigration_case_id = CASE
      WHEN NEW.status IN ('drafting', 'submitted', 'rfe') THEN NEW.id
      ELSE NULL
    END
  WHERE user_id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bench_immigration
  AFTER INSERT OR UPDATE OF status ON immigration_cases
  FOR EACH ROW EXECUTE FUNCTION update_bench_immigration_status();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE bench_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bench_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE immigration_cases ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: BENCH_METADATA
-- =====================================================

CREATE POLICY "bench_metadata_employee_read"
  ON bench_metadata
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('bench_sales') OR
    auth_has_role('admin') OR
    user_id = auth.uid()
  );

CREATE POLICY "bench_metadata_bench_sales_write"
  ON bench_metadata
  FOR ALL
  USING (
    auth_has_role('bench_sales') OR
    auth_has_role('admin') OR
    bench_sales_rep_id = auth.uid()
  );

-- =====================================================
-- RLS: EXTERNAL_JOBS
-- =====================================================

CREATE POLICY "external_jobs_org_isolation"
  ON external_jobs
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "external_jobs_employee_read"
  ON external_jobs
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('bench_sales') OR
    auth_has_role('admin')
  );

CREATE POLICY "external_jobs_admin_write"
  ON external_jobs
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('bench_sales'));

-- =====================================================
-- RLS: JOB_SOURCES
-- =====================================================

CREATE POLICY "job_sources_org_isolation"
  ON job_sources
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "job_sources_employee_read"
  ON job_sources
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('bench_sales') OR
    auth_has_role('admin')
  );

CREATE POLICY "job_sources_admin_write"
  ON job_sources
  FOR ALL
  USING (auth_has_role('admin'));

-- =====================================================
-- RLS: BENCH_SUBMISSIONS
-- =====================================================

CREATE POLICY "bench_submissions_org_isolation"
  ON bench_submissions
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "bench_submissions_employee_read"
  ON bench_submissions
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('bench_sales') OR
    auth_has_role('admin')
  );

CREATE POLICY "bench_submissions_candidate_own"
  ON bench_submissions
  FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "bench_submissions_rep_write"
  ON bench_submissions
  FOR ALL
  USING (
    auth_has_role('admin') OR
    auth_has_role('bench_sales') OR
    bench_rep_id = auth.uid()
  );

-- =====================================================
-- RLS: HOTLISTS
-- =====================================================

CREATE POLICY "hotlists_org_isolation"
  ON hotlists
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "hotlists_employee_all"
  ON hotlists
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('bench_sales') OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: IMMIGRATION_CASES
-- =====================================================

CREATE POLICY "immigration_org_isolation"
  ON immigration_cases
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "immigration_employee_read"
  ON immigration_cases
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('immigration_specialist')
  );

CREATE POLICY "immigration_candidate_own"
  ON immigration_cases
  FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "immigration_specialist_write"
  ON immigration_cases
  FOR ALL
  USING (
    auth_has_role('admin') OR
    auth_has_role('immigration_specialist') OR
    case_manager_id = auth.uid()
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE bench_metadata IS 'Extended metadata for bench consultants';
COMMENT ON TABLE external_jobs IS 'Jobs scraped from external sources (Cognizant, Dice, etc.)';
COMMENT ON TABLE job_sources IS 'Configuration for job scraping sources';
COMMENT ON TABLE bench_submissions IS 'Submissions of bench consultants to external jobs';
COMMENT ON TABLE hotlists IS 'Marketing documents featuring available consultants';
COMMENT ON TABLE immigration_cases IS 'Visa petition tracking and immigration case management';
