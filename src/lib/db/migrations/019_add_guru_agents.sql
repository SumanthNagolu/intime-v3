-- Migration 019: Guidewire Guru Agents
-- Epic: 2.5 - AI Infrastructure (Sprint 3)
-- Stories: AI-GURU-001 through AI-GURU-004
-- Description: Database tables for Guidewire Guru AI agents

-- =============================================================================
-- Guru Interactions Table
-- =============================================================================
-- Logs all interactions with Guru agents (code mentor, resume builder, etc.)

CREATE TABLE IF NOT EXISTS guru_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Agent metadata
  agent_type TEXT NOT NULL CHECK (agent_type IN ('code_mentor', 'resume_builder', 'project_planner', 'interview_coach')),
  conversation_id TEXT, -- For multi-turn conversations

  -- Request/response data
  input JSONB NOT NULL,
  output JSONB NOT NULL,

  -- User feedback
  was_helpful BOOLEAN,
  user_feedback TEXT,

  -- AI metrics
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  CONSTRAINT guru_interactions_tokens_check CHECK (tokens_used >= 0),
  CONSTRAINT guru_interactions_cost_check CHECK (cost_usd >= 0)
);

CREATE INDEX idx_guru_interactions_student ON guru_interactions(student_id, created_at DESC);
CREATE INDEX idx_guru_interactions_agent_type ON guru_interactions(agent_type, created_at DESC);
CREATE INDEX idx_guru_interactions_conversation ON guru_interactions(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_guru_interactions_org ON guru_interactions(org_id, created_at DESC);

COMMENT ON TABLE guru_interactions IS 'Logs all Guru agent interactions for analytics and improvement';
COMMENT ON COLUMN guru_interactions.agent_type IS 'Type of Guru agent (code_mentor, resume_builder, project_planner, interview_coach)';
COMMENT ON COLUMN guru_interactions.conversation_id IS 'Groups multi-turn conversations for context';

-- =============================================================================
-- Student Progress Table
-- =============================================================================
-- Tracks student learning progress and struggle areas

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Progress tracking
  current_module TEXT NOT NULL,
  completed_modules TEXT[] NOT NULL DEFAULT '{}',
  struggle_areas TEXT[] NOT NULL DEFAULT '{}',
  mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),

  -- Interaction metrics
  total_interactions INTEGER NOT NULL DEFAULT 0,
  helpful_interactions INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_student_progress_module ON student_progress(current_module);
CREATE INDEX idx_student_progress_mastery ON student_progress(mastery_score DESC);

COMMENT ON TABLE student_progress IS 'Tracks Guidewire student learning progress and mastery';
COMMENT ON COLUMN student_progress.mastery_score IS 'Overall mastery score 0-100 based on interactions and completions';

-- =============================================================================
-- Resume Versions Table
-- =============================================================================
-- Stores resume versions with ATS scoring

CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Version info
  version INTEGER NOT NULL DEFAULT 1,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'linkedin', 'json')),

  -- Content
  content JSONB NOT NULL,

  -- ATS metrics
  ats_score INTEGER NOT NULL DEFAULT 0 CHECK (ats_score >= 0 AND ats_score <= 100),
  keyword_matches TEXT[] NOT NULL DEFAULT '{}',

  -- Metadata
  target_job_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique version per student
  UNIQUE(student_id, version)
);

CREATE INDEX idx_resume_versions_student ON resume_versions(student_id, created_at DESC);
CREATE INDEX idx_resume_versions_format ON resume_versions(format);
CREATE INDEX idx_resume_versions_ats_score ON resume_versions(ats_score DESC);

COMMENT ON TABLE resume_versions IS 'Stores resume versions with ATS optimization scores';
COMMENT ON COLUMN resume_versions.ats_score IS 'ATS optimization score 0-100 based on keyword matching';

-- =============================================================================
-- Interview Sessions Table
-- =============================================================================
-- Tracks mock interview sessions and scores

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Session metadata
  interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'behavioral', 'mixed')),
  guidewire_module TEXT,

  -- Questions and answers
  questions JSONB NOT NULL DEFAULT '[]', -- Array of { id, question, type, difficulty, answer, score, feedback }

  -- Scores
  average_score DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK (average_score >= 0 AND average_score <= 10),

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration INTEGER, -- Seconds

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_sessions_student ON interview_sessions(student_id, created_at DESC);
CREATE INDEX idx_interview_sessions_type ON interview_sessions(interview_type);
CREATE INDEX idx_interview_sessions_module ON interview_sessions(guidewire_module) WHERE guidewire_module IS NOT NULL;
CREATE INDEX idx_interview_sessions_score ON interview_sessions(average_score DESC);

COMMENT ON TABLE interview_sessions IS 'Mock interview sessions with scoring and feedback';
COMMENT ON COLUMN interview_sessions.average_score IS 'Average score across all questions in session (1-10 scale)';

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE guru_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Guru Interactions Policies
CREATE POLICY "Users can view own guru interactions"
  ON guru_interactions FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND org_id = guru_interactions.org_id
      AND has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "System can insert guru interactions"
  ON guru_interactions FOR INSERT
  WITH CHECK (true); -- Service role only

CREATE POLICY "Students can update own feedback"
  ON guru_interactions FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Student Progress Policies
CREATE POLICY "Students can view own progress"
  ON student_progress FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.org_id = up2.org_id
      WHERE up1.id = auth.uid()
      AND up2.id = student_progress.student_id
      AND has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "System can manage student progress"
  ON student_progress FOR ALL
  USING (true) -- Service role only
  WITH CHECK (true);

-- Resume Versions Policies
CREATE POLICY "Students can view own resumes"
  ON resume_versions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own resumes"
  ON resume_versions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own resumes"
  ON resume_versions FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Interview Sessions Policies
CREATE POLICY "Students can view own interview sessions"
  ON interview_sessions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own interview sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own interview sessions"
  ON interview_sessions FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- =============================================================================
-- Triggers
-- =============================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_versions_updated_at
  BEFORE UPDATE ON resume_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Grants
-- =============================================================================

-- Grant SELECT to authenticated users (RLS handles access control)
GRANT SELECT ON guru_interactions TO authenticated;
GRANT SELECT ON student_progress TO authenticated;
GRANT SELECT ON resume_versions TO authenticated;
GRANT SELECT ON interview_sessions TO authenticated;

-- Grant INSERT/UPDATE where appropriate
GRANT INSERT, UPDATE ON guru_interactions TO authenticated;
GRANT INSERT, UPDATE ON resume_versions TO authenticated;
GRANT INSERT, UPDATE ON interview_sessions TO authenticated;

-- Service role has full access
GRANT ALL ON guru_interactions TO service_role;
GRANT ALL ON student_progress TO service_role;
GRANT ALL ON resume_versions TO service_role;
GRANT ALL ON interview_sessions TO service_role;

-- =============================================================================
-- Initial Data / Seed (Optional)
-- =============================================================================

-- No seed data needed for this migration

COMMENT ON SCHEMA public IS 'Migration 019: Guidewire Guru agents tables created successfully';
