-- Migration: Create candidate_screenings table for E03 - Screen Candidate feature
-- This stores the full screening session with scores, knockout results, and recommendations

-- =====================================================
-- CANDIDATE SCREENINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,

  -- Session metadata
  screener_id UUID NOT NULL REFERENCES user_profiles(id),
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Knockout Questions Results
  knockout_passed BOOLEAN,
  knockout_answers JSONB DEFAULT '[]', -- Array of { question_id, question, answer, passed, notes }

  -- Technical Assessment Scores (1-5)
  technical_scores JSONB DEFAULT '{}', -- { skill_name: { rating, notes } }
  technical_overall NUMERIC(3,2),

  -- Key Project Discussion
  project_discussion JSONB, -- { role, team_size, duration, challenge, solution, outcome }

  -- Soft Skills Scores (1-5)
  soft_skills_scores JSONB DEFAULT '{}', -- { category: { rating, notes } }
  soft_skills_overall NUMERIC(3,2),

  -- Culture & Motivation
  culture_fit_score NUMERIC(3,2),
  interest_level TEXT, -- 'low', 'medium', 'high', 'very_high'
  motivation_notes JSONB, -- { why_leaving, why_interested, career_goals }

  -- Overall Assessment
  overall_score NUMERIC(3,2),
  recommendation TEXT NOT NULL DEFAULT 'hold', -- 'submit', 'submit_with_reservations', 'hold', 'reject'
  strengths TEXT[],
  concerns TEXT[],

  -- Interview Prep Notes
  interview_prep_notes TEXT,

  -- Compensation Discussion
  compensation_discussion JSONB, -- { candidate_expectation, job_range, recommended_offer, margin_percent, notes }

  -- Next Steps
  next_steps JSONB DEFAULT '[]', -- Array of { action, completed }

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_screenings_candidate ON candidate_screenings(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_screenings_job ON candidate_screenings(job_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_screenings_screener ON candidate_screenings(screener_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_screenings_status ON candidate_screenings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_screenings_recommendation ON candidate_screenings(recommendation) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE candidate_screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY candidate_screenings_org_access ON candidate_screenings
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_candidate_screenings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidate_screenings_updated_at_trigger
  BEFORE UPDATE ON candidate_screenings
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_screenings_updated_at();

-- Comments
COMMENT ON TABLE candidate_screenings IS 'Stores candidate phone screening sessions with knockout results, technical/soft skill scores, and recommendations';
COMMENT ON COLUMN candidate_screenings.knockout_answers IS 'JSONB array: [{ question_id, question, answer, passed, notes }]';
COMMENT ON COLUMN candidate_screenings.technical_scores IS 'JSONB object: { skill_name: { rating: 1-5, notes: string } }';
COMMENT ON COLUMN candidate_screenings.soft_skills_scores IS 'JSONB object: { category: { rating: 1-5, notes: string } } - categories: communication, problem_solving, collaboration, leadership';
COMMENT ON COLUMN candidate_screenings.recommendation IS 'submit, submit_with_reservations, hold, reject';

-- =====================================================
-- CANDIDATE PREPARED PROFILES (E05)
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_prepared_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Template
  template_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'client_custom', 'minimal'

  -- Profile sections
  summary TEXT,
  key_highlights TEXT[],
  skills_matrix JSONB, -- [{ skill, years, level, job_match }]
  experience_summary JSONB, -- [{ company, role, duration, achievements }]
  why_this_candidate TEXT,
  education JSONB,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'finalized'
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES user_profiles(id),

  -- Export info
  pdf_url TEXT,
  docx_url TEXT,
  last_exported_at TIMESTAMPTZ,

  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidate_prepared_profiles_candidate ON candidate_prepared_profiles(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_prepared_profiles_job ON candidate_prepared_profiles(job_id) WHERE deleted_at IS NULL;

ALTER TABLE candidate_prepared_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY candidate_prepared_profiles_org_access ON candidate_prepared_profiles
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_candidate_prepared_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidate_prepared_profiles_updated_at_trigger
  BEFORE UPDATE ON candidate_prepared_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_prepared_profiles_updated_at();

COMMENT ON TABLE candidate_prepared_profiles IS 'Stores formatted candidate profiles for client submission (E05)';
