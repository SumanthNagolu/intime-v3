-- ============================================================================
-- WAVE 4: INTERVIEWS-01 - Multi-interviewer and scorecard support
-- ============================================================================
-- This migration adds:
-- 1. Multi-interviewer support via interview_participants table
-- 2. Structured scorecard system
-- 3. Interviewer contact reference
-- 4. Enhanced scheduling and feedback tracking
-- ============================================================================

-- Step 1: Add interviewer contact reference to interviews table
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS primary_interviewer_contact_id UUID REFERENCES contacts(id);

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS coordinator_contact_id UUID REFERENCES contacts(id);

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS scorecard_template_id UUID;

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS scorecard_completed BOOLEAN DEFAULT false;

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS scorecard_completed_at TIMESTAMPTZ;

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS hiring_decision VARCHAR(50) CHECK (hiring_decision IS NULL OR hiring_decision IN (
  'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
));

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS decision_notes TEXT;

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255);

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500);

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS is_panel BOOLEAN DEFAULT false;

-- ============================================================================
-- Update interview_participants table (multi-interviewer support)
-- ============================================================================
-- First ensure the table exists (baseline creates it without all columns)
CREATE TABLE IF NOT EXISTS interview_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(id),
  external_name TEXT,
  external_email TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Add new columns to existing table (using DO block for reliability)
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Add contact_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'contact_id'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN contact_id UUID REFERENCES contacts(id);
  END IF;

  -- Add role column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'role'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN role VARCHAR(50) DEFAULT 'interviewer';
  END IF;

  -- Add is_confirmed column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'is_confirmed'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN is_confirmed BOOLEAN DEFAULT false;
  END IF;

  -- Add confirmed_at column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'confirmed_at'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN confirmed_at TIMESTAMPTZ;
  END IF;

  -- Add feedback_submitted column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'feedback_submitted'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN feedback_submitted BOOLEAN DEFAULT false;
  END IF;

  -- Add feedback_submitted_at column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'feedback_submitted_at'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN feedback_submitted_at TIMESTAMPTZ;
  END IF;

  -- Add overall_rating column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'overall_rating'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN overall_rating INTEGER;
  END IF;

  -- Add recommendation column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'recommendation'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN recommendation VARCHAR(50);
  END IF;

  -- Add feedback_notes column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'feedback_notes'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN feedback_notes TEXT;
  END IF;

  -- Add calendar_synced column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'calendar_synced'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN calendar_synced BOOLEAN DEFAULT false;
  END IF;

  -- Add calendar_event_id column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'interview_participants' AND column_name = 'calendar_event_id'
  ) INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE interview_participants ADD COLUMN calendar_event_id VARCHAR(255);
  END IF;
END $$;

-- Add check constraints (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interview_participants_role_check'
  ) THEN
    ALTER TABLE interview_participants ADD CONSTRAINT interview_participants_role_check
      CHECK (role IS NULL OR role IN (
        'lead_interviewer', 'interviewer', 'shadow', 'observer', 'note_taker', 'hiring_manager'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interview_participants_overall_rating_check'
  ) THEN
    ALTER TABLE interview_participants ADD CONSTRAINT interview_participants_overall_rating_check
      CHECK (overall_rating IS NULL OR overall_rating BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'interview_participants_recommendation_check'
  ) THEN
    ALTER TABLE interview_participants ADD CONSTRAINT interview_participants_recommendation_check
      CHECK (recommendation IS NULL OR recommendation IN (
        'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_interview_participants_interview ON interview_participants(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_participants_user ON interview_participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interview_participants_contact ON interview_participants(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interview_participants_org ON interview_participants(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_interview_participants_unique_user ON interview_participants(interview_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_interview_participants_unique_contact ON interview_participants(interview_id, contact_id) WHERE contact_id IS NOT NULL;

-- ============================================================================
-- Create interview_scorecards table (structured scorecards)
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES interview_participants(id) ON DELETE SET NULL,

  submitted_by UUID NOT NULL REFERENCES user_profiles(id),

  -- Overall assessment
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  recommendation VARCHAR(50) NOT NULL CHECK (recommendation IN (
    'strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire'
  )),

  -- Structured criteria scores
  criteria_scores JSONB NOT NULL DEFAULT '{}',
  -- Example: { "technical": 4, "communication": 5, "problem_solving": 4, "cultural_fit": 3 }

  -- Strengths and concerns
  strengths TEXT[],
  concerns TEXT[],
  additional_notes TEXT,

  -- Interview-specific details
  questions_asked JSONB,
  -- Example: [{ "question": "...", "answer_quality": 4, "notes": "..." }]

  would_work_with BOOLEAN,
  would_recommend_for_different_role BOOLEAN DEFAULT false,
  alternative_role_notes TEXT,

  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_scorecards_interview ON interview_scorecards(interview_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_participant ON interview_scorecards(participant_id) WHERE participant_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_org ON interview_scorecards(org_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_submitted_by ON interview_scorecards(submitted_by) WHERE deleted_at IS NULL;

-- ============================================================================
-- Create scorecard_templates table (reusable scorecard templates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scorecard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  interview_type VARCHAR(50),  -- phone, video, onsite, technical, etc.
  job_category VARCHAR(100),   -- engineering, sales, etc.

  -- Criteria definitions
  criteria JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   { "key": "technical", "name": "Technical Skills", "description": "...", "weight": 3 },
  --   { "key": "communication", "name": "Communication", "description": "...", "weight": 2 }
  -- ]

  -- Rating scale
  rating_scale INTEGER DEFAULT 5 CHECK (rating_scale IN (3, 4, 5, 10)),
  rating_labels JSONB,
  -- Example: { "1": "Poor", "2": "Below Average", "3": "Average", "4": "Good", "5": "Excellent" }

  -- Required questions
  required_questions JSONB,
  -- Example: [{ "question": "Tell me about a time...", "category": "behavioral" }]

  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scorecard_templates_org ON scorecard_templates(org_id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_scorecard_templates_type ON scorecard_templates(interview_type) WHERE deleted_at IS NULL AND is_active = true;

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE interview_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_templates ENABLE ROW LEVEL SECURITY;

-- Interview participants policies
DROP POLICY IF EXISTS interview_participants_org_isolation ON interview_participants;
CREATE POLICY interview_participants_org_isolation ON interview_participants
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Interview scorecards policies
DROP POLICY IF EXISTS interview_scorecards_org_isolation ON interview_scorecards;
CREATE POLICY interview_scorecards_org_isolation ON interview_scorecards
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- Scorecard templates policies
DROP POLICY IF EXISTS scorecard_templates_org_isolation ON scorecard_templates;
CREATE POLICY scorecard_templates_org_isolation ON scorecard_templates
FOR ALL USING (org_id = current_setting('app.org_id', true)::uuid);

-- ============================================================================
-- Create indexes for interviews table new columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_interviews_primary_interviewer ON interviews(primary_interviewer_contact_id) WHERE primary_interviewer_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interviews_scorecard_template ON interviews(scorecard_template_id) WHERE scorecard_template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interviews_hiring_decision ON interviews(org_id, hiring_decision) WHERE hiring_decision IS NOT NULL;

-- ============================================================================
-- Add comments
-- ============================================================================
COMMENT ON COLUMN interviews.primary_interviewer_contact_id IS 'Primary interviewer (contact reference)';
COMMENT ON COLUMN interviews.coordinator_contact_id IS 'Interview coordinator (contact reference)';
COMMENT ON COLUMN interviews.scorecard_template_id IS 'Template for structured scorecard';
COMMENT ON COLUMN interviews.scorecard_completed IS 'Whether all required scorecards are submitted';
COMMENT ON COLUMN interviews.hiring_decision IS 'Final hiring decision after interview';
COMMENT ON COLUMN interviews.is_panel IS 'Whether this is a panel interview with multiple interviewers';

COMMENT ON TABLE interview_participants IS 'Interviewers and observers participating in an interview';
COMMENT ON TABLE interview_scorecards IS 'Structured feedback scorecards submitted by interviewers';
COMMENT ON TABLE scorecard_templates IS 'Reusable scorecard templates for consistent evaluation';
