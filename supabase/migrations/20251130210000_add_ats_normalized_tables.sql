-- Migration: Add ATS Normalized Tables
-- Description: Adds normalized tables for SKILLS, JOBS, CANDIDATES, SUBMISSIONS, INTERVIEWS, OFFERS, and PLACEMENTS
-- Date: 2025-11-30

-- =====================================================
-- SKILL ALIASES
-- =====================================================

CREATE TABLE IF NOT EXISTS skill_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  alias TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_skill_id ON skill_aliases(skill_id);

-- =====================================================
-- JOB REQUIREMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  requirement TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'must_have',
  sequence INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_requirements_job_id ON job_requirements(job_id);

-- =====================================================
-- JOB SKILLS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  importance TEXT NOT NULL DEFAULT 'required',
  min_years NUMERIC(4,1),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(job_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id ON job_skills(skill_id);

-- =====================================================
-- JOB RATES
-- =====================================================

CREATE TABLE IF NOT EXISTS job_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  bill_rate_min NUMERIC(10,2),
  bill_rate_max NUMERIC(10,2),
  pay_rate_min NUMERIC(10,2),
  pay_rate_max NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  rate_type TEXT DEFAULT 'hourly',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_rates_job_id ON job_rates(job_id);

-- =====================================================
-- JOB ASSIGNMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  role TEXT NOT NULL DEFAULT 'secondary',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_job_id ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_user_id ON job_assignments(user_id);

-- =====================================================
-- JOB SCREENING QUESTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS job_screening_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  sequence INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_screening_questions_job_id ON job_screening_questions(job_id);

-- =====================================================
-- CANDIDATE PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

  summary TEXT,
  total_experience_years NUMERIC(4,1),
  highest_education TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- CANDIDATE DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate_id ON candidate_documents(candidate_id);

-- =====================================================
-- CANDIDATE AVAILABILITY
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

  available_from DATE,
  notice_period_days INTEGER,
  preferred_rate_min NUMERIC(10,2),
  preferred_rate_max NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- CANDIDATE PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS candidate_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

  preferred_job_types TEXT[],
  preferred_work_modes TEXT[],
  preferred_industries TEXT[],
  min_rate NUMERIC(10,2),
  max_commute_miles INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- SUBMISSION RATES
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,

  bill_rate NUMERIC(10,2),
  pay_rate NUMERIC(10,2),
  margin_percent NUMERIC(5,2),
  margin_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- SUBMISSION SCREENING ANSWERS
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_screening_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES job_screening_questions(id) ON DELETE CASCADE,

  answer TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(submission_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_screening_answers_submission_id ON submission_screening_answers(submission_id);

-- =====================================================
-- SUBMISSION NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  note TEXT NOT NULL,
  is_client_visible BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES user_profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_submission_notes_submission_id ON submission_notes(submission_id);

-- =====================================================
-- SUBMISSION STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,

  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  changed_by UUID NOT NULL REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_status_history_submission_id ON submission_status_history(submission_id);

-- =====================================================
-- INTERVIEW PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS interview_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,

  participant_type TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id),
  external_name TEXT,
  external_email TEXT,
  is_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_participants_interview_id ON interview_participants(interview_id);

-- =====================================================
-- INTERVIEW FEEDBACK
-- =====================================================

CREATE TABLE IF NOT EXISTS interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,

  submitted_by UUID NOT NULL REFERENCES user_profiles(id),
  rating INTEGER,
  recommendation TEXT,
  strengths TEXT,
  weaknesses TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);

-- =====================================================
-- INTERVIEW REMINDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS interview_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,

  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_reminders_interview_id ON interview_reminders(interview_id);

-- =====================================================
-- OFFER TERMS
-- =====================================================

CREATE TABLE IF NOT EXISTS offer_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,

  term_type TEXT NOT NULL,
  value TEXT,
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offer_terms_offer_id ON offer_terms(offer_id);

-- =====================================================
-- OFFER NEGOTIATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS offer_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,

  requested_by TEXT NOT NULL,
  requested_changes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offer_negotiations_offer_id ON offer_negotiations(offer_id);

-- =====================================================
-- OFFER APPROVALS
-- =====================================================

CREATE TABLE IF NOT EXISTS offer_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,

  approver_id UUID NOT NULL REFERENCES user_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  decided_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offer_approvals_offer_id ON offer_approvals(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_approvals_approver_id ON offer_approvals(approver_id);

-- =====================================================
-- PLACEMENT RATES
-- =====================================================

CREATE TABLE IF NOT EXISTS placement_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  bill_rate NUMERIC(10,2) NOT NULL,
  pay_rate NUMERIC(10,2) NOT NULL,
  margin_percent NUMERIC(5,2),
  effective_from DATE NOT NULL,
  effective_to DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_placement_rates_placement_id ON placement_rates(placement_id);

-- =====================================================
-- PLACEMENT EXTENSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS placement_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  previous_end_date DATE NOT NULL,
  new_end_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_placement_extensions_placement_id ON placement_extensions(placement_id);

-- =====================================================
-- PLACEMENT TIMESHEETS
-- =====================================================

CREATE TABLE IF NOT EXISTS placement_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  week_ending DATE NOT NULL,
  regular_hours NUMERIC(5,2) DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_placement_timesheets_placement_id ON placement_timesheets(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_timesheets_week_ending ON placement_timesheets(week_ending);

-- =====================================================
-- PLACEMENT MILESTONES
-- =====================================================

CREATE TABLE IF NOT EXISTS placement_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,

  milestone_type TEXT NOT NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_placement_milestones_placement_id ON placement_milestones(placement_id);
CREATE INDEX IF NOT EXISTS idx_placement_milestones_due_date ON placement_milestones(due_date);
