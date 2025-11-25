-- =====================================================
-- Migration: CRM Module (Accounts, Leads, Deals)
-- Date: 2024-11-24
-- Description: Core CRM tables for client relationship management
-- =====================================================

-- =====================================================
-- 1. ACCOUNTS (Client Companies)
-- =====================================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  industry TEXT,
  company_type TEXT DEFAULT 'direct_client', -- 'direct_client', 'implementation_partner', 'staffing_vendor'
  status TEXT NOT NULL DEFAULT 'prospect', -- 'prospect', 'active', 'inactive', 'churned'
  tier TEXT, -- 'preferred', 'strategic', 'exclusive'

  -- Account management
  account_manager_id UUID REFERENCES user_profiles(id),
  responsiveness TEXT, -- 'high', 'medium', 'low'
  preferred_quality TEXT, -- 'quality', 'quantity', 'speed'
  description TEXT,

  -- Business terms
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  payment_terms_days INTEGER DEFAULT 30,
  markup_percentage NUMERIC(5,2), -- 20.00 = 20%
  annual_revenue_target NUMERIC(12,2),

  -- Contact info
  website TEXT,
  headquarters_location TEXT,
  phone TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search (auto-maintained by trigger)
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_accounts_org ON accounts(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_manager ON accounts(account_manager_id);
CREATE INDEX idx_accounts_status ON accounts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_search ON accounts USING GIN(search_vector);
CREATE INDEX idx_accounts_name ON accounts(name) WHERE deleted_at IS NULL;

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_accounts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accounts_search_vector
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_accounts_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. POINT_OF_CONTACTS (Decision Makers)
-- =====================================================

CREATE TABLE point_of_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Core fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  title TEXT,
  role TEXT, -- 'VP Engineering', 'TA Lead', 'Hiring Manager'

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  preferred_contact_method TEXT DEFAULT 'email', -- 'email', 'phone', 'linkedin'

  -- Influence
  decision_authority TEXT, -- 'decision_maker', 'influencer', 'gatekeeper'
  notes TEXT,

  -- Status
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_pocs_account ON point_of_contacts(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pocs_email ON point_of_contacts(email);
CREATE INDEX idx_pocs_active ON point_of_contacts(is_active) WHERE is_active = true;

-- Auto-update updated_at
CREATE TRIGGER trigger_pocs_updated_at
  BEFORE UPDATE ON point_of_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ACTIVITY_LOG (Communication History)
-- =====================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association (polymorphic)
  entity_type TEXT NOT NULL, -- 'account', 'lead', 'candidate', 'deal', 'job'
  entity_id UUID NOT NULL,

  -- Activity details
  activity_type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note', 'linkedin_message'
  subject TEXT,
  body TEXT,
  direction TEXT, -- 'inbound', 'outbound'

  -- Participants
  performed_by UUID REFERENCES user_profiles(id),
  poc_id UUID REFERENCES point_of_contacts(id),

  -- Metadata
  activity_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_minutes INTEGER,
  outcome TEXT, -- 'positive', 'neutral', 'negative', 'no_response'
  next_action TEXT,
  next_action_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_date ON activity_log(activity_date DESC);
CREATE INDEX idx_activity_owner ON activity_log(performed_by);
CREATE INDEX idx_activity_org ON activity_log(org_id);
CREATE INDEX idx_activity_poc ON activity_log(poc_id);

-- =====================================================
-- 4. LEADS (Sales Pipeline)
-- =====================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Lead type
  lead_type TEXT NOT NULL DEFAULT 'company', -- 'company', 'individual'

  -- Company fields
  company_name TEXT,
  industry TEXT,
  company_size TEXT, -- 'small', 'medium', 'large', 'enterprise'

  -- Contact fields
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL
      THEN first_name || ' ' || last_name
      ELSE company_name
    END
  ) STORED,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,

  -- Lead status
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'warm', 'hot', 'cold', 'converted', 'lost'
  estimated_value NUMERIC(12,2),

  -- Source tracking
  source TEXT, -- 'linkedin', 'referral', 'cold_outreach', 'inbound', 'event'
  source_campaign_id UUID, -- FK to campaigns (will create later)

  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),

  -- Engagement
  last_contacted_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),

  -- Conversion
  converted_to_deal_id UUID, -- FK to deals (self-reference, set below)
  converted_to_account_id UUID REFERENCES accounts(id),
  converted_at TIMESTAMPTZ,
  lost_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_leads_org ON leads(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_source ON leads(source_campaign_id);
CREATE INDEX idx_leads_search ON leads USING GIN(search_vector);
CREATE INDEX idx_leads_email ON leads(email);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_leads_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.first_name || ' ' || NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.industry, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_search_vector
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_leads_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. DEALS (Revenue Opportunities)
-- =====================================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  lead_id UUID REFERENCES leads(id),
  account_id UUID REFERENCES accounts(id),

  -- Deal details
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12,2) NOT NULL,

  -- Pipeline stage
  stage TEXT NOT NULL DEFAULT 'discovery', -- 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Outcome
  close_reason TEXT,

  -- Linked jobs (one deal → multiple jobs, will update when jobs table created)
  linked_job_ids UUID[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_deals_org ON deals(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_lead ON deals(lead_id);
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date);

-- Auto-update updated_at
CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint from leads to deals (circular reference)
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_converted_to_deal
  FOREIGN KEY (converted_to_deal_id)
  REFERENCES deals(id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_of_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id from JWT
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'org_id',
    (SELECT org_id FROM user_profiles WHERE id = auth.uid())
  )::UUID;
$$ LANGUAGE sql STABLE;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION auth_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = role_name
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- RLS POLICIES: ACCOUNTS
-- =====================================================

-- 1. Organization isolation (multi-tenancy)
CREATE POLICY "accounts_org_isolation"
  ON accounts
  FOR ALL
  USING (org_id = auth_org_id());

-- 2. Employees can view all accounts in their org
CREATE POLICY "accounts_employee_select"
  ON accounts
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- 3. Account managers and recruiters can update their accounts
CREATE POLICY "accounts_employee_update"
  ON accounts
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    account_manager_id = auth.uid() OR
    created_by = auth.uid()
  );

-- 4. Admins and recruiters can create accounts
CREATE POLICY "accounts_employee_insert"
  ON accounts
  FOR INSERT
  WITH CHECK (
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- 5. Only admins can delete (soft delete)
CREATE POLICY "accounts_admin_delete"
  ON accounts
  FOR DELETE
  USING (auth_has_role('admin'));

-- =====================================================
-- RLS POLICIES: POINT_OF_CONTACTS
-- =====================================================

CREATE POLICY "pocs_org_isolation"
  ON point_of_contacts
  FOR ALL
  USING (
    account_id IN (
      SELECT id FROM accounts WHERE org_id = auth_org_id()
    )
  );

CREATE POLICY "pocs_employee_all"
  ON point_of_contacts
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: ACTIVITY_LOG
-- =====================================================

CREATE POLICY "activity_org_isolation"
  ON activity_log
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "activity_employee_select"
  ON activity_log
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

CREATE POLICY "activity_employee_insert"
  ON activity_log
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- RLS POLICIES: LEADS
-- =====================================================

CREATE POLICY "leads_org_isolation"
  ON leads
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "leads_employee_select"
  ON leads
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );

CREATE POLICY "leads_owner_update"
  ON leads
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "leads_employee_insert"
  ON leads
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('ta_specialist')
  );

-- =====================================================
-- RLS POLICIES: DEALS
-- =====================================================

CREATE POLICY "deals_org_isolation"
  ON deals
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "deals_employee_select"
  ON deals
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

CREATE POLICY "deals_owner_update"
  ON deals
  FOR UPDATE
  USING (
    auth_has_role('admin') OR
    owner_id = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "deals_employee_insert"
  ON deals
  FOR INSERT
  WITH CHECK (
    auth_has_role('employee') OR
    auth_has_role('admin') OR
    auth_has_role('recruiter')
  );

-- =====================================================
-- FUNCTIONS: Business Logic
-- =====================================================

-- Function to convert lead to deal
CREATE OR REPLACE FUNCTION convert_lead_to_deal(
  p_lead_id UUID,
  p_deal_title TEXT,
  p_deal_value NUMERIC,
  p_deal_stage TEXT DEFAULT 'discovery'
)
RETURNS UUID AS $$
DECLARE
  v_lead leads;
  v_account_id UUID;
  v_deal_id UUID;
BEGIN
  -- Get lead details
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Create account if company lead and not already converted
  IF v_lead.lead_type = 'company' AND v_lead.converted_to_account_id IS NULL THEN
    INSERT INTO accounts (
      org_id,
      name,
      industry,
      status,
      created_by
    ) VALUES (
      v_lead.org_id,
      v_lead.company_name,
      v_lead.industry,
      'prospect',
      auth.uid()
    ) RETURNING id INTO v_account_id;

    -- Update lead with account reference
    UPDATE leads SET converted_to_account_id = v_account_id WHERE id = p_lead_id;
  ELSE
    v_account_id := v_lead.converted_to_account_id;
  END IF;

  -- Create deal
  INSERT INTO deals (
    org_id,
    lead_id,
    account_id,
    title,
    value,
    stage,
    owner_id,
    created_by
  ) VALUES (
    v_lead.org_id,
    p_lead_id,
    v_account_id,
    p_deal_title,
    p_deal_value,
    p_deal_stage,
    v_lead.owner_id,
    auth.uid()
  ) RETURNING id INTO v_deal_id;

  -- Update lead status
  UPDATE leads SET
    status = 'converted',
    converted_to_deal_id = v_deal_id,
    converted_at = NOW()
  WHERE id = p_lead_id;

  -- Log activity
  INSERT INTO activity_log (
    org_id,
    entity_type,
    entity_id,
    activity_type,
    subject,
    body,
    performed_by,
    activity_date
  ) VALUES (
    v_lead.org_id,
    'lead',
    p_lead_id,
    'note',
    'Lead converted to deal',
    format('Lead converted to deal: %s', p_deal_title),
    auth.uid(),
    NOW()
  );

  RETURN v_deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA (Development/Testing)
-- =====================================================

-- Note: Seed data will be added after user_profiles and organizations are populated
-- This migration focuses on schema creation only

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE accounts IS 'Client companies and prospects';
COMMENT ON TABLE point_of_contacts IS 'Decision makers at client companies';
COMMENT ON TABLE activity_log IS 'Communication history and interactions';
COMMENT ON TABLE leads IS 'Sales pipeline for new business and talent sourcing';
COMMENT ON TABLE deals IS 'Revenue opportunities and closed business';

COMMENT ON FUNCTION convert_lead_to_deal IS 'Converts a lead to a deal, optionally creating an account';
COMMENT ON FUNCTION auth_org_id IS 'Gets current user organization ID from JWT or user_profiles';
COMMENT ON FUNCTION auth_has_role IS 'Checks if current user has specified role';
-- =====================================================
-- Migration: ATS Module (Jobs, Candidates, Submissions, Placements)
-- Date: 2024-11-24
-- Description: Applicant Tracking System for recruiting operations
-- =====================================================

-- =====================================================
-- 1. SKILLS (Normalized Skill Taxonomy)
-- =====================================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Skill details
  name TEXT NOT NULL UNIQUE,
  category TEXT, -- 'programming', 'platform', 'framework', 'tool', 'soft_skill', 'domain'
  parent_skill_id UUID REFERENCES skills(id), -- For hierarchy (e.g., Java → Spring)

  -- Metadata
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX idx_skills_parent ON skills(parent_skill_id);

-- =====================================================
-- 2. CANDIDATE_SKILLS (Many-to-Many with Proficiency)
-- =====================================================

CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),

  -- Proficiency
  proficiency_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced', 'expert'
  years_of_experience NUMERIC(4,1), -- 2.5 years

  -- Validation
  is_certified BOOLEAN DEFAULT false,
  certification_name TEXT,
  last_used_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(candidate_id, skill_id)
);

CREATE INDEX idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill ON candidate_skills(skill_id);
CREATE INDEX idx_candidate_skills_proficiency ON candidate_skills(proficiency_level);

-- =====================================================
-- 3. JOBS (Job Requisitions)
-- =====================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  account_id UUID REFERENCES accounts(id),
  deal_id UUID REFERENCES deals(id),

  -- Job details
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT DEFAULT 'contract', -- 'contract', 'c2h', 'permanent', 'contract_to_hire'

  -- Location
  location TEXT,
  is_remote BOOLEAN DEFAULT false,
  hybrid_days INTEGER, -- Days per week in office

  -- Compensation
  rate_min NUMERIC(10,2),
  rate_max NUMERIC(10,2),
  rate_type TEXT DEFAULT 'hourly', -- 'hourly', 'annual'
  currency TEXT DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'open', 'urgent', 'on_hold', 'filled', 'cancelled'
  urgency TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  positions_count INTEGER DEFAULT 1,
  positions_filled INTEGER DEFAULT 0,

  -- Requirements
  required_skills TEXT[],
  nice_to_have_skills TEXT[],
  min_experience_years INTEGER,
  max_experience_years INTEGER,
  visa_requirements TEXT[], -- ['H1B', 'GC', 'USC']

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  recruiter_ids UUID[], -- Multiple recruiters can work on one job

  -- Dates
  posted_date DATE,
  target_fill_date DATE,
  filled_date DATE,

  -- Client interaction
  client_submission_instructions TEXT,
  client_interview_process TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ,

  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_jobs_org ON jobs(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_account ON jobs(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_deal ON jobs(deal_id);
CREATE INDEX idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_owner ON jobs(owner_id);
CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jobs_search_vector
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_search_vector();

-- Auto-update updated_at
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. SUBMISSIONS (Candidate Applications/Matches)
-- =====================================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID REFERENCES accounts(id), -- Denormalized for quick access

  -- Submission workflow stage
  status TEXT NOT NULL DEFAULT 'sourced',
  -- Pipeline: 'sourced' → 'screening' → 'submission_ready' → 'submitted_to_client' →
  --          'client_review' → 'client_interview' → 'offer_stage' → 'placed' / 'rejected'

  -- Match scoring
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  recruiter_match_score INTEGER CHECK (recruiter_match_score >= 0 AND recruiter_match_score <= 100),
  match_explanation TEXT,

  -- Submission details
  submitted_rate NUMERIC(10,2),
  submitted_rate_type TEXT DEFAULT 'hourly',
  submission_notes TEXT,

  -- Client interaction
  submitted_to_client_at TIMESTAMPTZ,
  submitted_to_client_by UUID REFERENCES user_profiles(id),

  -- Resume tracking (use existing file_uploads table)
  client_resume_file_id UUID, -- FK to file_uploads
  client_profile_url TEXT,

  -- Interview tracking
  interview_count INTEGER DEFAULT 0,
  last_interview_date TIMESTAMPTZ,
  interview_feedback TEXT,

  -- Offer tracking
  offer_extended_at TIMESTAMPTZ,
  offer_accepted_at TIMESTAMPTZ,
  offer_declined_at TIMESTAMPTZ,
  offer_decline_reason TEXT,

  -- Rejection
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejection_source TEXT, -- 'candidate', 'client', 'recruiter'

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_submissions_job ON submissions(job_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_candidate ON submissions(candidate_id);
CREATE INDEX idx_submissions_account ON submissions(account_id);
CREATE INDEX idx_submissions_status ON submissions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_submissions_owner ON submissions(owner_id);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);
CREATE UNIQUE INDEX idx_submissions_unique ON submissions(job_id, candidate_id) WHERE deleted_at IS NULL;

-- Auto-update updated_at
CREATE TRIGGER trigger_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment job.positions_filled when submission placed
CREATE OR REPLACE FUNCTION update_job_positions_filled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'placed' AND (OLD.status IS NULL OR OLD.status != 'placed') THEN
    UPDATE jobs SET positions_filled = positions_filled + 1 WHERE id = NEW.job_id;

    -- Auto-close job if all positions filled
    UPDATE jobs SET status = 'filled', filled_date = CURRENT_DATE
    WHERE id = NEW.job_id AND positions_filled >= positions_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_positions
  AFTER INSERT OR UPDATE OF status ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_job_positions_filled();

-- =====================================================
-- 5. INTERVIEWS (Interview Scheduling & Feedback)
-- =====================================================

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Interview details
  round_number INTEGER NOT NULL DEFAULT 1,
  interview_type TEXT DEFAULT 'technical', -- 'phone_screen', 'technical', 'cultural', 'final'

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'America/New_York',
  meeting_link TEXT,
  meeting_location TEXT,

  -- Participants
  interviewer_names TEXT[],
  interviewer_emails TEXT[],
  scheduled_by UUID REFERENCES user_profiles(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  cancellation_reason TEXT,

  -- Feedback
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  recommendation TEXT, -- 'strong_yes', 'yes', 'neutral', 'no', 'strong_no'
  submitted_by UUID REFERENCES user_profiles(id),
  feedback_submitted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_interviews_submission ON interviews(submission_id);
CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_job ON interviews(job_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Auto-update submission.interview_count
CREATE OR REPLACE FUNCTION update_submission_interview_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions SET
    interview_count = (SELECT COUNT(*) FROM interviews WHERE submission_id = NEW.submission_id),
    last_interview_date = NEW.scheduled_at
  WHERE id = NEW.submission_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_count
  AFTER INSERT ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_submission_interview_count();

-- =====================================================
-- 6. OFFERS (Offer Negotiations)
-- =====================================================

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Offer terms
  offer_type TEXT DEFAULT 'contract', -- 'contract', 'permanent', 'c2h'
  rate NUMERIC(10,2) NOT NULL,
  rate_type TEXT DEFAULT 'hourly',
  start_date DATE,
  end_date DATE,

  -- Additional terms
  bonus NUMERIC(10,2),
  benefits TEXT,
  relocation_assistance BOOLEAN DEFAULT false,
  sign_on_bonus NUMERIC(10,2),

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'negotiating', 'accepted', 'declined', 'withdrawn'
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Negotiation
  candidate_counter_offer NUMERIC(10,2),
  negotiation_notes TEXT,

  -- Acceptance
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Documents (use existing file_uploads table)
  offer_letter_file_id UUID, -- FK to file_uploads
  signed_offer_file_id UUID,  -- FK to file_uploads

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_offers_submission ON offers(submission_id);
CREATE INDEX idx_offers_candidate ON offers(candidate_id);
CREATE INDEX idx_offers_job ON offers(job_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_expires ON offers(expires_at);

-- Auto-update submission when offer accepted
CREATE OR REPLACE FUNCTION update_submission_on_offer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    UPDATE submissions SET
      status = 'placed',
      offer_accepted_at = NEW.accepted_at
    WHERE id = NEW.submission_id;
  ELSIF NEW.status = 'declined' THEN
    UPDATE submissions SET
      offer_declined_at = NEW.declined_at,
      offer_decline_reason = NEW.decline_reason
    WHERE id = NEW.submission_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_submission_on_offer
  AFTER UPDATE OF status ON offers
  FOR EACH ROW EXECUTE FUNCTION update_submission_on_offer();

-- =====================================================
-- 7. PLACEMENTS (Successful Hires & Onboarding)
-- =====================================================

CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association
  submission_id UUID NOT NULL REFERENCES submissions(id),
  offer_id UUID REFERENCES offers(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES user_profiles(id),
  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Placement details
  placement_type TEXT DEFAULT 'contract',
  start_date DATE NOT NULL,
  end_date DATE,

  -- Compensation
  bill_rate NUMERIC(10,2) NOT NULL,
  pay_rate NUMERIC(10,2) NOT NULL,
  markup_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    ROUND(((bill_rate - pay_rate) / pay_rate * 100)::numeric, 2)
  ) STORED,

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'extended', 'ended', 'cancelled'
  end_reason TEXT,
  actual_end_date DATE,

  -- Financials
  total_revenue NUMERIC(12,2),
  total_paid NUMERIC(12,2),

  -- Onboarding
  onboarding_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  onboarding_completed_at TIMESTAMPTZ,

  -- Performance
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  extension_count INTEGER DEFAULT 0,

  -- Assignment
  recruiter_id UUID NOT NULL REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_placements_candidate ON placements(candidate_id);
CREATE INDEX idx_placements_job ON placements(job_id);
CREATE INDEX idx_placements_account ON placements(account_id);
CREATE INDEX idx_placements_status ON placements(status);
CREATE INDEX idx_placements_start_date ON placements(start_date DESC);
CREATE INDEX idx_placements_recruiter ON placements(recruiter_id);
CREATE INDEX idx_placements_org ON placements(org_id);

-- Auto-update candidate status when placed
CREATE OR REPLACE FUNCTION update_candidate_on_placement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE user_profiles SET
      candidate_status = 'placed'
    WHERE id = NEW.candidate_id;
  ELSIF NEW.status = 'ended' OR NEW.status = 'cancelled' THEN
    UPDATE user_profiles SET
      candidate_status = 'active'
    WHERE id = NEW.candidate_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_placement
  AFTER INSERT OR UPDATE OF status ON placements
  FOR EACH ROW EXECUTE FUNCTION update_candidate_on_placement();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: SKILLS (Public Read, Admin Write)
-- =====================================================

CREATE POLICY "skills_public_read"
  ON skills
  FOR SELECT
  USING (true); -- All authenticated users can view skills

CREATE POLICY "skills_admin_write"
  ON skills
  FOR ALL
  USING (auth_has_role('admin'));

-- =====================================================
-- RLS: CANDIDATE_SKILLS
-- =====================================================

CREATE POLICY "candidate_skills_candidate_own"
  ON candidate_skills
  FOR ALL
  USING (candidate_id = auth.uid());

CREATE POLICY "candidate_skills_employee_read"
  ON candidate_skills
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "candidate_skills_recruiter_write"
  ON candidate_skills
  FOR ALL
  USING (
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: JOBS
-- =====================================================

CREATE POLICY "jobs_org_isolation"
  ON jobs
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "jobs_employee_read"
  ON jobs
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "jobs_client_own_read"
  ON jobs
  FOR SELECT
  USING (
    auth_has_role('client') AND
    account_id IN (
      SELECT COALESCE(
        (SELECT id FROM accounts WHERE name = (SELECT client_company_name FROM user_profiles WHERE id = auth.uid())),
        NULL::UUID
      )
    )
  );

CREATE POLICY "jobs_recruiter_write"
  ON jobs
  FOR ALL
  USING (
    auth_has_role('recruiter') OR
    auth_has_role('admin') OR
    owner_id = auth.uid()
  );

-- =====================================================
-- RLS: SUBMISSIONS
-- =====================================================

CREATE POLICY "submissions_org_isolation"
  ON submissions
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "submissions_employee_read"
  ON submissions
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "submissions_client_own_read"
  ON submissions
  FOR SELECT
  USING (
    auth_has_role('client') AND
    account_id IN (
      SELECT COALESCE(
        (SELECT id FROM accounts WHERE name = (SELECT client_company_name FROM user_profiles WHERE id = auth.uid())),
        NULL::UUID
      )
    ) AND
    status IN ('submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed')
  );

CREATE POLICY "submissions_candidate_own_read"
  ON submissions
  FOR SELECT
  USING (
    auth_has_role('candidate') AND
    candidate_id = auth.uid()
  );

CREATE POLICY "submissions_recruiter_write"
  ON submissions
  FOR ALL
  USING (
    auth_has_role('recruiter') OR
    auth_has_role('admin') OR
    owner_id = auth.uid()
  );

-- =====================================================
-- RLS: INTERVIEWS, OFFERS, PLACEMENTS
-- =====================================================

-- Interviews
CREATE POLICY "interviews_employee_all"
  ON interviews
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "interviews_candidate_own"
  ON interviews
  FOR SELECT
  USING (candidate_id = auth.uid());

-- Offers
CREATE POLICY "offers_employee_all"
  ON offers
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "offers_candidate_own"
  ON offers
  FOR SELECT
  USING (candidate_id = auth.uid());

-- Placements
CREATE POLICY "placements_org_isolation"
  ON placements
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "placements_employee_all"
  ON placements
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('recruiter') OR
    auth_has_role('admin')
  );

CREATE POLICY "placements_candidate_own"
  ON placements
  FOR SELECT
  USING (candidate_id = auth.uid());

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE skills IS 'Normalized skill taxonomy for matching candidates to jobs';
COMMENT ON TABLE candidate_skills IS 'Candidate skills with proficiency levels';
COMMENT ON TABLE jobs IS 'Job requisitions from clients';
COMMENT ON TABLE submissions IS 'Candidate applications and matches to jobs';
COMMENT ON TABLE interviews IS 'Interview scheduling and feedback';
COMMENT ON TABLE offers IS 'Job offers and negotiations';
COMMENT ON TABLE placements IS 'Successful hires and active placements';
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

  -- Days on bench (computed)
  days_on_bench INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN (SELECT candidate_status FROM user_profiles WHERE id = user_id) = 'bench'
      THEN EXTRACT(DAY FROM CURRENT_DATE - bench_start_date)::INTEGER
      ELSE 0
    END
  ) STORED,

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
  days_elapsed INTEGER GENERATED ALWAYS AS (
    EXTRACT(DAY FROM CURRENT_DATE - COALESCE(filed_date, created_at::DATE))::INTEGER
  ) STORED,

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
-- =====================================================
-- Migration: TA (Talent Acquisition) + HR Modules
-- Date: 2024-11-24
-- Description: Outreach campaigns, HR workflows, payroll, performance management
-- =====================================================

-- =====================================================
-- TALENT ACQUISITION MODULE
-- =====================================================

-- =====================================================
-- 1. CAMPAIGNS (Outreach Campaigns)
-- =====================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'talent_sourcing', -- 'talent_sourcing', 'business_development', 'mixed'

  -- Channel
  channel TEXT NOT NULL DEFAULT 'email', -- 'linkedin', 'email', 'combined'

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'archived'

  -- Targeting
  target_audience TEXT,
  target_locations TEXT[],
  target_skills TEXT[],
  target_company_sizes TEXT[],

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  variant_a_template_id UUID, -- FK to email_templates (existing table!)
  variant_b_template_id UUID,
  ab_split_percentage INTEGER DEFAULT 50,

  -- Goals
  target_contacts_count INTEGER,
  target_response_rate NUMERIC(5,2),
  target_conversion_count INTEGER,

  -- Real-time metrics (aggregated from campaign_contacts)
  contacts_reached INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  linkedin_messages_sent INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN emails_sent > 0
      THEN ROUND((responses_received::numeric / emails_sent * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Dates
  start_date DATE,
  end_date DATE,

  -- Assignment
  owner_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Auto-update updated_at
CREATE TRIGGER trigger_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CAMPAIGN_CONTACTS (Target List)
-- =====================================================

CREATE TABLE campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Contact type
  contact_type TEXT NOT NULL DEFAULT 'candidate', -- 'candidate', 'business_lead'

  -- Existing entity (if already in system)
  user_id UUID REFERENCES user_profiles(id),
  lead_id UUID REFERENCES leads(id),

  -- Contact info (if not in system yet)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  company_name TEXT,
  title TEXT,

  -- Outreach status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'responded', 'converted', 'bounced', 'unsubscribed'

  -- A/B Test variant
  ab_variant TEXT, -- 'A', 'B', null
  template_used_id UUID, -- FK to email_templates (existing!)

  -- Engagement
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_text TEXT,

  -- Conversion
  converted_at TIMESTAMPTZ,
  conversion_type TEXT, -- 'applied_to_job', 'scheduled_call', 'became_deal', 'became_candidate'
  conversion_entity_id UUID, -- ID of resulting submission, lead, deal, etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_campaign_contacts_campaign ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX idx_campaign_contacts_email ON campaign_contacts(email);
CREATE INDEX idx_campaign_contacts_user ON campaign_contacts(user_id);
CREATE INDEX idx_campaign_contacts_lead ON campaign_contacts(lead_id);

-- Auto-update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns SET
    contacts_reached = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id),
    emails_sent = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status NOT IN ('pending', 'bounced')),
    responses_received = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'responded'),
    conversions = (SELECT COUNT(*) FROM campaign_contacts WHERE campaign_id = NEW.campaign_id AND status = 'converted')
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_metrics
  AFTER INSERT OR UPDATE OF status ON campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- Auto-update updated_at
CREATE TRIGGER trigger_campaign_contacts_updated_at
  BEFORE UPDATE ON campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ENGAGEMENT_TRACKING (Email Opens/Clicks)
-- =====================================================

CREATE TABLE engagement_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL, -- 'email_sent', 'email_opened', 'link_clicked', 'email_bounced', 'unsubscribed'
  event_data JSONB,

  -- Timestamp
  event_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Tracking
  tracking_id TEXT, -- External tracking ID (SendGrid, etc.)
  user_agent TEXT,
  ip_address INET,
  clicked_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_engagement_contact ON engagement_tracking(campaign_contact_id);
CREATE INDEX idx_engagement_type ON engagement_tracking(event_type);
CREATE INDEX idx_engagement_timestamp ON engagement_tracking(event_timestamp DESC);

-- Auto-update campaign_contact status based on engagement
CREATE OR REPLACE FUNCTION update_contact_from_engagement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'email_opened' THEN
    UPDATE campaign_contacts SET
      status = 'opened',
      opened_at = NEW.event_timestamp
    WHERE id = NEW.campaign_contact_id AND status = 'sent';
  ELSIF NEW.event_type = 'link_clicked' THEN
    UPDATE campaign_contacts SET
      clicked_at = NEW.event_timestamp
    WHERE id = NEW.campaign_contact_id;
  ELSIF NEW.event_type = 'email_bounced' THEN
    UPDATE campaign_contacts SET
      status = 'bounced'
    WHERE id = NEW.campaign_contact_id;
  ELSIF NEW.event_type = 'unsubscribed' THEN
    UPDATE campaign_contacts SET
      status = 'unsubscribed'
    WHERE id = NEW.campaign_contact_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_engagement
  AFTER INSERT ON engagement_tracking
  FOR EACH ROW EXECUTE FUNCTION update_contact_from_engagement();

-- =====================================================
-- HR MODULE
-- =====================================================

-- =====================================================
-- 4. EMPLOYEE_METADATA (Extends user_profiles)
-- =====================================================

CREATE TABLE employee_metadata (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Employment details
  employment_type TEXT DEFAULT 'full_time', -- 'full_time', 'part_time', 'contractor', 'intern'
  employee_id_number TEXT UNIQUE, -- Company employee ID

  -- Compensation
  bonus_target NUMERIC(12,2),
  commission_plan TEXT,
  equity_shares INTEGER,

  -- Pod assignment
  pod_id UUID, -- FK to pods (set below)
  pod_role TEXT, -- 'senior', 'junior'

  -- Performance
  kpi_targets JSONB,
  monthly_placement_target INTEGER,

  -- Work schedule
  work_schedule TEXT DEFAULT 'standard', -- 'standard', 'flexible', 'remote'
  weekly_hours INTEGER DEFAULT 40,

  -- Benefits
  benefits_eligible BOOLEAN DEFAULT true,
  benefits_start_date DATE,

  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_employee_metadata_pod ON employee_metadata(pod_id);
CREATE INDEX idx_employee_id_number ON employee_metadata(employee_id_number) WHERE employee_id_number IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER trigger_employee_metadata_updated_at
  BEFORE UPDATE ON employee_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. PODS (2-Person Team Structure)
-- =====================================================

CREATE TABLE pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pod details
  name TEXT NOT NULL,
  pod_type TEXT NOT NULL, -- 'recruiting', 'bench_sales', 'ta'

  -- Members (2-person structure)
  senior_member_id UUID REFERENCES user_profiles(id),
  junior_member_id UUID REFERENCES user_profiles(id),

  -- Goals
  sprint_duration_weeks INTEGER DEFAULT 2,
  placements_per_sprint_target INTEGER DEFAULT 2,

  -- Performance (computed from placements table)
  total_placements INTEGER DEFAULT 0,
  current_sprint_placements INTEGER DEFAULT 0,
  current_sprint_start_date DATE,
  average_placements_per_sprint NUMERIC(5,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  formed_date DATE,
  dissolved_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_pods_org ON pods(org_id);
CREATE INDEX idx_pods_type ON pods(pod_type);
CREATE INDEX idx_pods_members ON pods(senior_member_id, junior_member_id);
CREATE INDEX idx_pods_active ON pods(is_active) WHERE is_active = true;

-- Add FK from employee_metadata to pods
ALTER TABLE employee_metadata
  ADD CONSTRAINT fk_employee_pod
  FOREIGN KEY (pod_id)
  REFERENCES pods(id);

-- Auto-update updated_at
CREATE TRIGGER trigger_pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. PAYROLL_RUNS (Bi-Weekly Payroll Cycles)
-- =====================================================

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Pay period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  pay_date DATE NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready_for_approval', 'approved', 'processing', 'completed', 'failed'

  -- Totals (computed from payroll_items)
  employee_count INTEGER NOT NULL DEFAULT 0,
  total_gross_pay NUMERIC(12,2) DEFAULT 0,
  total_taxes NUMERIC(12,2) DEFAULT 0,
  total_net_pay NUMERIC(12,2) DEFAULT 0,

  -- Integration
  gusto_payroll_id TEXT, -- External payroll system ID
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_payroll_runs_org ON payroll_runs(org_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(period_start_date, period_end_date);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX idx_payroll_runs_pay_date ON payroll_runs(pay_date DESC);

-- Auto-update updated_at
CREATE TRIGGER trigger_payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. PAYROLL_ITEMS (Individual Payroll Line Items)
-- =====================================================

CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Compensation components
  base_salary NUMERIC(10,2),
  commission NUMERIC(10,2),
  bonus NUMERIC(10,2),
  overtime_hours NUMERIC(5,2),
  overtime_pay NUMERIC(10,2),
  other_earnings NUMERIC(10,2),

  -- Totals
  gross_pay NUMERIC(10,2) NOT NULL,
  taxes_withheld NUMERIC(10,2),
  benefits_deductions NUMERIC(10,2),
  other_deductions NUMERIC(10,2),
  net_pay NUMERIC(10,2) NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(payroll_run_id, employee_id)
);

-- Indexes
CREATE INDEX idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX idx_payroll_items_employee ON payroll_items(employee_id);

-- Auto-update payroll_run totals
CREATE OR REPLACE FUNCTION update_payroll_run_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE payroll_runs SET
    employee_count = (SELECT COUNT(*) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_gross_pay = (SELECT COALESCE(SUM(gross_pay), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_taxes = (SELECT COALESCE(SUM(taxes_withheld), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id),
    total_net_pay = (SELECT COALESCE(SUM(net_pay), 0) FROM payroll_items WHERE payroll_run_id = NEW.payroll_run_id)
  WHERE id = NEW.payroll_run_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payroll_totals
  AFTER INSERT OR UPDATE ON payroll_items
  FOR EACH ROW EXECUTE FUNCTION update_payroll_run_totals();

-- =====================================================
-- 8. PERFORMANCE_REVIEWS (Annual/Mid-Year Reviews)
-- =====================================================

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Review details
  employee_id UUID NOT NULL REFERENCES user_profiles(id),
  reviewer_id UUID NOT NULL REFERENCES user_profiles(id),
  review_cycle TEXT NOT NULL, -- '2025_q2', '2025_annual'
  review_type TEXT DEFAULT 'annual', -- 'annual', 'mid_year', 'probation', '90_day'

  -- Review period
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_of_work INTEGER CHECK (quality_of_work >= 1 AND quality_of_work <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
  initiative INTEGER CHECK (initiative >= 1 AND initiative <= 5),
  reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),

  -- Goals
  goals_achieved JSONB,
  goals_next_period JSONB,

  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  manager_comments TEXT,
  employee_self_assessment TEXT,
  employee_comments TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'pending_employee_review', 'completed', 'acknowledged'

  -- Dates
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  employee_acknowledged_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_reviews_org ON performance_reviews(org_id);
CREATE INDEX idx_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_reviews_cycle ON performance_reviews(review_cycle);
CREATE INDEX idx_reviews_status ON performance_reviews(status);

-- Auto-update user_profiles.employee_performance_rating
CREATE OR REPLACE FUNCTION update_employee_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.overall_rating IS NOT NULL THEN
    UPDATE user_profiles SET
      employee_performance_rating = NEW.overall_rating
    WHERE id = NEW.employee_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employee_rating
  AFTER UPDATE OF status ON performance_reviews
  FOR EACH ROW EXECUTE FUNCTION update_employee_rating();

-- =====================================================
-- 9. TIME_ATTENDANCE (Timesheet Tracking)
-- =====================================================

CREATE TABLE time_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Date
  date DATE NOT NULL,

  -- Hours
  regular_hours NUMERIC(5,2) DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  pto_hours NUMERIC(5,2) DEFAULT 0,
  sick_hours NUMERIC(5,2) DEFAULT 0,
  holiday_hours NUMERIC(5,2) DEFAULT 0,
  total_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    regular_hours + overtime_hours + pto_hours + sick_hours + holiday_hours
  ) STORED,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'

  -- Approval
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(employee_id, date)
);

-- Indexes
CREATE INDEX idx_time_attendance_employee ON time_attendance(employee_id);
CREATE INDEX idx_time_attendance_date ON time_attendance(date DESC);
CREATE INDEX idx_time_attendance_status ON time_attendance(status);

-- =====================================================
-- 10. PTO_BALANCES (PTO Accrual Tracking)
-- =====================================================

CREATE TABLE pto_balances (
  employee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,

  -- Accrual
  annual_accrual_days NUMERIC(5,2) DEFAULT 15.0,
  accrual_rate_per_pay_period NUMERIC(5,2),

  -- Current balance
  total_accrued NUMERIC(5,2) DEFAULT 0,
  total_used NUMERIC(5,2) DEFAULT 0,
  total_pending NUMERIC(5,2) DEFAULT 0,
  current_balance NUMERIC(5,2) GENERATED ALWAYS AS (
    total_accrued - total_used - total_pending
  ) STORED,

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  PRIMARY KEY (employee_id, year)
);

-- Indexes
CREATE INDEX idx_pto_balances_year ON pto_balances(year);
CREATE INDEX idx_pto_balances_employee ON pto_balances(employee_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: CAMPAIGNS
-- =====================================================

CREATE POLICY "campaigns_org_isolation"
  ON campaigns
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "campaigns_employee_all"
  ON campaigns
  FOR ALL
  USING (
    auth_has_role('employee') OR
    auth_has_role('ta_specialist') OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: HR TABLES (Basic Policies)
-- =====================================================

-- Employee metadata
CREATE POLICY "employee_metadata_employee_own"
  ON employee_metadata
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "employee_metadata_hr_all"
  ON employee_metadata
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- Pods
CREATE POLICY "pods_org_isolation"
  ON pods
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "pods_employee_read"
  ON pods
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin')
  );

CREATE POLICY "pods_admin_write"
  ON pods
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

-- Payroll (Sensitive!)
CREATE POLICY "payroll_runs_org_isolation"
  ON payroll_runs
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "payroll_runs_hr_admin_only"
  ON payroll_runs
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

CREATE POLICY "payroll_items_hr_admin_only"
  ON payroll_items
  FOR ALL
  USING (auth_has_role('admin') OR auth_has_role('hr'));

CREATE POLICY "payroll_items_employee_own"
  ON payroll_items
  FOR SELECT
  USING (employee_id = auth.uid());

-- Performance reviews
CREATE POLICY "reviews_org_isolation"
  ON performance_reviews
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "reviews_employee_own"
  ON performance_reviews
  FOR SELECT
  USING (employee_id = auth.uid() OR reviewer_id = auth.uid());

CREATE POLICY "reviews_hr_all"
  ON performance_reviews
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- Time attendance
CREATE POLICY "time_attendance_employee_own"
  ON time_attendance
  FOR ALL
  USING (employee_id = auth.uid());

CREATE POLICY "time_attendance_hr_read"
  ON time_attendance
  FOR SELECT
  USING (auth_has_role('hr') OR auth_has_role('admin'));

CREATE POLICY "time_attendance_manager_approve"
  ON time_attendance
  FOR UPDATE
  USING (
    auth_has_role('hr') OR
    auth_has_role('admin') OR
    employee_id IN (
      SELECT id FROM user_profiles WHERE employee_manager_id = auth.uid()
    )
  );

-- PTO balances
CREATE POLICY "pto_balances_employee_own"
  ON pto_balances
  FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "pto_balances_hr_all"
  ON pto_balances
  FOR ALL
  USING (auth_has_role('hr') OR auth_has_role('admin'));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE campaigns IS 'Outreach campaigns for talent sourcing and business development';
COMMENT ON TABLE campaign_contacts IS 'Target contacts for outreach campaigns with engagement tracking';
COMMENT ON TABLE engagement_tracking IS 'Email/LinkedIn engagement events (opens, clicks, responses)';
COMMENT ON TABLE employee_metadata IS 'Extended metadata for employees';
COMMENT ON TABLE pods IS '2-person team structure with sprint goals';
COMMENT ON TABLE payroll_runs IS 'Bi-weekly payroll cycles';
COMMENT ON TABLE payroll_items IS 'Individual employee payroll details';
COMMENT ON TABLE performance_reviews IS 'Annual and mid-year performance reviews';
COMMENT ON TABLE time_attendance IS 'Daily timesheet tracking';
COMMENT ON TABLE pto_balances IS 'PTO accrual and balance tracking by year';
-- =====================================================
-- Migration: Shared Infrastructure
-- Date: 2024-11-24
-- Description: Notifications, tasks, comments for collaboration
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS (In-App + Email)
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Recipient
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Notification details
  notification_type TEXT NOT NULL,
  -- Types: 'submission_update', 'interview_scheduled', 'offer_sent', 'approval_needed',
  --        'placement_started', 'bench_alert_30day', 'bench_alert_60day', 'campaign_response',
  --        'review_due', 'timesheet_approval', 'payroll_ready'

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Association (polymorphic)
  entity_type TEXT, -- 'submission', 'interview', 'offer', 'placement', 'approval_request', etc.
  entity_id UUID,

  -- Delivery
  channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'slack'
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  slack_sent_at TIMESTAMPTZ,
  slack_error TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,

  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Action
  action_url TEXT, -- Deep link to relevant entity
  action_label TEXT, -- Button label (e.g., "View Submission", "Approve")

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_org ON notifications(org_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE NOT is_read AND NOT is_archived;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Auto-cleanup old read notifications (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. TASKS (To-Do Items & Action Items)
-- =====================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Task details
  title TEXT NOT NULL,
  description TEXT,

  -- Association (optional)
  entity_type TEXT, -- 'submission', 'candidate', 'job', 'deal', 'lead', 'placement'
  entity_id UUID,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),
  created_by UUID NOT NULL REFERENCES user_profiles(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  parent_task_id UUID REFERENCES tasks(id), -- For recurring tasks

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_tasks_org ON tasks(org_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status) WHERE status IN ('todo', 'in_progress');
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status IN ('todo', 'in_progress');
CREATE INDEX idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Auto-update updated_at
CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create notification when task assigned
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (
      org_id,
      user_id,
      notification_type,
      title,
      message,
      entity_type,
      entity_id,
      priority,
      action_url
    ) VALUES (
      NEW.org_id,
      NEW.assigned_to,
      'task_assigned',
      'New task assigned to you',
      NEW.title,
      'task',
      NEW.id,
      CASE NEW.priority
        WHEN 'urgent' THEN 'urgent'
        WHEN 'high' THEN 'high'
        ELSE 'normal'
      END,
      '/tasks/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_task_assigned
  AFTER INSERT OR UPDATE OF assigned_to ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assigned();

-- =====================================================
-- 3. COMMENTS (Collaborative Notes)
-- =====================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Association (polymorphic)
  entity_type TEXT NOT NULL, -- 'submission', 'candidate', 'job', 'deal', 'lead', 'account', 'placement'
  entity_id UUID NOT NULL,

  -- Comment details
  content TEXT NOT NULL,

  -- Threading
  parent_comment_id UUID REFERENCES comments(id),
  reply_count INTEGER DEFAULT 0,

  -- Author
  author_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Mentions
  mentioned_user_ids UUID[], -- @mention support

  -- Reactions
  reactions JSONB DEFAULT '{}', -- { "👍": ["user_id1", "user_id2"], "❤️": ["user_id3"] }

  -- Status
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES user_profiles(id),

  -- Editing
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  original_content TEXT, -- Keep original for audit

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_comments_org ON comments(org_id);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id) WHERE NOT is_deleted;
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update parent comment reply_count
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    UPDATE comments SET
      reply_count = (SELECT COUNT(*) FROM comments WHERE parent_comment_id = NEW.parent_comment_id AND NOT is_deleted)
    WHERE id = NEW.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR UPDATE OF is_deleted ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- Auto-notify mentioned users
CREATE OR REPLACE FUNCTION notify_mentioned_users()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user UUID;
BEGIN
  IF NEW.mentioned_user_ids IS NOT NULL AND array_length(NEW.mentioned_user_ids, 1) > 0 THEN
    FOREACH mentioned_user IN ARRAY NEW.mentioned_user_ids
    LOOP
      INSERT INTO notifications (
        org_id,
        user_id,
        notification_type,
        title,
        message,
        entity_type,
        entity_id,
        priority,
        action_url
      ) VALUES (
        NEW.org_id,
        mentioned_user,
        'mention',
        'You were mentioned in a comment',
        LEFT(NEW.content, 100),
        NEW.entity_type,
        NEW.entity_id,
        'normal',
        '/' || NEW.entity_type || 's/' || NEW.entity_id || '#comment-' || NEW.id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_mentions
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_mentioned_users();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: NOTIFICATIONS
-- =====================================================

CREATE POLICY "notifications_org_isolation"
  ON notifications
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "notifications_user_own"
  ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "notifications_system_create"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Users can mark own notifications as read
CREATE POLICY "notifications_user_update_own"
  ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- RLS: TASKS
-- =====================================================

CREATE POLICY "tasks_org_isolation"
  ON tasks
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "tasks_assigned_or_created"
  ON tasks
  FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "tasks_create_own"
  ON tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "tasks_update_assigned_or_admin"
  ON tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "tasks_delete_creator_or_admin"
  ON tasks
  FOR DELETE
  USING (
    created_by = auth.uid() OR
    auth_has_role('admin')
  );

-- =====================================================
-- RLS: COMMENTS
-- =====================================================

CREATE POLICY "comments_org_isolation"
  ON comments
  FOR ALL
  USING (org_id = auth_org_id());

CREATE POLICY "comments_read_all"
  ON comments
  FOR SELECT
  USING (
    auth_has_role('employee') OR
    auth_has_role('admin')
  );

CREATE POLICY "comments_create_employee"
  ON comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND (
      auth_has_role('employee') OR
      auth_has_role('admin')
    )
  );

CREATE POLICY "comments_update_own"
  ON comments
  FOR UPDATE
  USING (
    author_id = auth.uid() OR
    auth_has_role('admin')
  );

CREATE POLICY "comments_delete_own_or_admin"
  ON comments
  FOR DELETE
  USING (
    author_id = auth.uid() OR
    auth_has_role('admin')
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to create submission status notification
CREATE OR REPLACE FUNCTION create_submission_notification(
  p_submission_id UUID,
  p_new_status TEXT,
  p_recipient_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
  v_submission submissions;
BEGIN
  -- Get submission details
  SELECT s.*, s.org_id INTO v_submission, v_org_id
  FROM submissions s
  WHERE s.id = p_submission_id;

  -- Create notification
  INSERT INTO notifications (
    org_id,
    user_id,
    notification_type,
    title,
    message,
    entity_type,
    entity_id,
    priority,
    action_url
  ) VALUES (
    v_org_id,
    p_recipient_id,
    'submission_update',
    'Submission status updated',
    format('Submission moved to %s', p_new_status),
    'submission',
    p_submission_id,
    CASE
      WHEN p_new_status = 'client_interview' THEN 'high'
      WHEN p_new_status = 'offer_stage' THEN 'high'
      WHEN p_new_status = 'placed' THEN 'urgent'
      ELSE 'normal'
    END,
    '/submissions/' || p_submission_id
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create bench aging alert
CREATE OR REPLACE FUNCTION create_bench_aging_alert(
  p_candidate_id UUID,
  p_days_on_bench INTEGER
)
RETURNS void AS $$
DECLARE
  v_org_id UUID;
  v_bench_rep_id UUID;
BEGIN
  -- Get org and bench rep
  SELECT up.org_id, bm.bench_sales_rep_id
  INTO v_org_id, v_bench_rep_id
  FROM user_profiles up
  LEFT JOIN bench_metadata bm ON bm.user_id = up.id
  WHERE up.id = p_candidate_id;

  -- Create notification for bench rep
  IF v_bench_rep_id IS NOT NULL THEN
    INSERT INTO notifications (
      org_id,
      user_id,
      notification_type,
      title,
      message,
      entity_type,
      entity_id,
      priority,
      action_url
    ) VALUES (
      v_org_id,
      v_bench_rep_id,
      CASE
        WHEN p_days_on_bench >= 60 THEN 'bench_alert_60day'
        WHEN p_days_on_bench >= 30 THEN 'bench_alert_30day'
      END,
      format('Consultant on bench for %s days', p_days_on_bench),
      'Urgent: Placement needed',
      'candidate',
      p_candidate_id,
      'urgent',
      '/bench/talent/' || p_candidate_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'In-app and email notifications for users';
COMMENT ON TABLE tasks IS 'To-do items and action items with assignment';
COMMENT ON TABLE comments IS 'Collaborative comments on entities with @mentions';

COMMENT ON FUNCTION create_submission_notification IS 'Helper to create submission status change notifications';
COMMENT ON FUNCTION create_bench_aging_alert IS 'Helper to create bench aging alert notifications';
-- =====================================================
-- Migration: Session Context Switching
-- Date: 2024-11-24
-- Description: Support for multi-role context switching in UI
-- =====================================================

-- =====================================================
-- Helper Function: Get Active User Role from Session
-- =====================================================

-- This function reads the 'active_role' from the JWT claims
-- which the frontend sets when user switches context
CREATE OR REPLACE FUNCTION auth_active_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'active_role',
    (
      -- Default to first role if no active_role in JWT
      SELECT r.name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      LIMIT 1
    )
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- Enhanced RLS Helper: Check Active Role
-- =====================================================

-- Check if current active role matches
CREATE OR REPLACE FUNCTION auth_has_active_role(role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT auth_active_role() = role_name;
$$ LANGUAGE sql STABLE;

-- Check if user has role (any of their roles, not just active)
CREATE OR REPLACE FUNCTION auth_has_any_role(role_names TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = ANY(role_names)
  );
$$ LANGUAGE sql STABLE;

-- =====================================================
-- Enhanced RLS Policies for Context Switching
-- =====================================================

-- Jobs: Different access based on active role
DROP POLICY IF EXISTS "jobs_employee_read" ON jobs;
CREATE POLICY "jobs_employee_read"
  ON jobs
  FOR SELECT
  USING (
    -- Recruiters: See all jobs they own or are assigned to
    (auth_has_active_role('recruiter') AND (
      owner_id = auth.uid() OR
      auth.uid() = ANY(recruiter_ids)
    )) OR

    -- Bench Sales: See jobs that match bench consultants
    (auth_has_active_role('bench_sales')) OR

    -- TA Specialist: See jobs for sourcing
    (auth_has_active_role('ta_specialist')) OR

    -- Admin: See everything
    (auth_has_active_role('admin'))
  );

-- Submissions: Context-aware access
DROP POLICY IF EXISTS "submissions_employee_read" ON submissions;
CREATE POLICY "submissions_employee_read"
  ON submissions
  FOR SELECT
  USING (
    -- Recruiters: Own submissions
    (auth_has_active_role('recruiter') AND owner_id = auth.uid()) OR

    -- Bench Sales: Submissions for bench consultants
    (auth_has_active_role('bench_sales') AND candidate_id IN (
      SELECT user_id FROM bench_metadata
    )) OR

    -- Admin: Everything
    (auth_has_active_role('admin'))
  );

-- Candidates: Context-aware read
CREATE POLICY "candidates_context_read"
  ON user_profiles
  FOR SELECT
  USING (
    -- Own profile always visible
    id = auth.uid() OR

    -- Recruiter context: All candidates
    (auth_has_active_role('recruiter') AND candidate_status IS NOT NULL) OR

    -- Bench Sales context: Only bench consultants
    (auth_has_active_role('bench_sales') AND candidate_status = 'bench') OR

    -- TA Specialist: Sourced candidates
    (auth_has_active_role('ta_specialist') AND candidate_status IN ('active', 'sourced')) OR

    -- Student context: Only own student data
    (auth_has_active_role('student') AND id = auth.uid()) OR

    -- Admin: Everything
    (auth_has_active_role('admin'))
  );

-- =====================================================
-- Session Metadata Table (Optional)
-- =====================================================

-- Track user's selected context for analytics
CREATE TABLE IF NOT EXISTS user_session_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  active_role TEXT NOT NULL,
  session_started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_ended_at TIMESTAMPTZ,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN session_ended_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM session_ended_at - session_started_at)::INTEGER
      ELSE NULL
    END
  ) STORED
);

CREATE INDEX idx_session_context_user ON user_session_context(user_id);
CREATE INDEX idx_session_context_role ON user_session_context(active_role);
CREATE INDEX idx_session_context_started ON user_session_context(session_started_at DESC);

-- RLS for session context
ALTER TABLE user_session_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_context_own"
  ON user_session_context
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- Frontend Integration Helper
-- =====================================================

-- Function to get available roles for current user
CREATE OR REPLACE FUNCTION get_user_available_roles()
RETURNS TABLE (
  role_name TEXT,
  role_display_name TEXT,
  role_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.name,
    COALESCE(r.display_name, r.name) as role_display_name,
    r.description
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  ORDER BY r.display_order;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user can switch to role
CREATE OR REPLACE FUNCTION can_switch_to_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name = p_role_name
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- Add display_name and display_order to roles table
-- =====================================================

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set friendly names for context switcher
UPDATE roles SET
  display_name = 'Student',
  display_order = 1
WHERE name = 'student';

UPDATE roles SET
  display_name = 'Client',
  display_order = 2
WHERE name = 'client';

UPDATE roles SET
  display_name = 'Talent',
  display_order = 3
WHERE name = 'candidate';

UPDATE roles SET
  display_name = 'Recruiter',
  display_order = 4
WHERE name = 'recruiter';

UPDATE roles SET
  display_name = 'Bench Sales',
  display_order = 5
WHERE name = 'bench_sales';

UPDATE roles SET
  display_name = 'TA Specialist',
  display_order = 6
WHERE name = 'ta_specialist';

UPDATE roles SET
  display_name = 'HR',
  display_order = 7
WHERE name = 'hr';

UPDATE roles SET
  display_name = 'Admin',
  display_order = 99
WHERE name = 'admin';

-- =====================================================
-- Usage Example for Frontend
-- =====================================================

/*
Frontend Usage:

1. Get available roles for current user:
   const { data: roles } = await supabase.rpc('get_user_available_roles');

2. Switch context (update JWT claim):
   // In middleware or context provider
   await supabase.auth.updateUser({
     data: { active_role: 'recruiter' }
   });

3. Check if user can switch:
   const canSwitch = await supabase.rpc('can_switch_to_role', {
     p_role_name: 'bench_sales'
   });

4. Track session analytics:
   INSERT INTO user_session_context (user_id, active_role)
   VALUES (auth.uid(), 'recruiter');

5. RLS automatically filters data based on active_role in JWT!
*/

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION auth_active_role IS 'Gets the currently active role from JWT claims for context switching';
COMMENT ON FUNCTION auth_has_active_role IS 'Checks if the active role matches the specified role';
COMMENT ON FUNCTION get_user_available_roles IS 'Returns all roles available to current user for context switcher UI';
COMMENT ON FUNCTION can_switch_to_role IS 'Validates if user has permission to switch to specified role';
COMMENT ON TABLE user_session_context IS 'Tracks user context switching for analytics';
