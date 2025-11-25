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
