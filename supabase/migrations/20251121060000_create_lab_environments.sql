/**
 * ACAD-008: Lab Environments System
 *
 * Creates:
 * - lab_instances table (active lab sessions)
 * - lab_submissions table (submissions and grading)
 * - lab_templates table (optional template metadata)
 * - Functions for lab management
 */

-- ============================================================================
-- LAB TEMPLATES TABLE (Optional metadata storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lab_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  github_template_url TEXT NOT NULL UNIQUE,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),

  -- Configuration
  time_limit_minutes INTEGER DEFAULT 120, -- 2 hours default
  auto_grading_enabled BOOLEAN DEFAULT false,
  github_actions_workflow TEXT, -- Path to test workflow file

  -- Requirements
  required_skills TEXT[], -- e.g., ['javascript', 'react', 'typescript']
  estimated_duration_minutes INTEGER,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_lab_templates_active ON lab_templates(is_active);
CREATE INDEX idx_lab_templates_difficulty ON lab_templates(difficulty_level);

-- ============================================================================
-- LAB INSTANCES TABLE (Active lab sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lab_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  lab_template_id UUID REFERENCES lab_templates(id),

  -- Repository info
  forked_repo_url TEXT NOT NULL,
  forked_repo_name TEXT,
  original_template_url TEXT NOT NULL,

  -- Session tracking
  status TEXT DEFAULT 'active' CHECK (
    status IN ('active', 'submitted', 'expired', 'abandoned', 'completed')
  ),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Calculated based on time_limit
  completed_at TIMESTAMPTZ,

  -- Resource tracking
  time_spent_seconds INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  github_username TEXT, -- Student's GitHub username
  provisioning_metadata JSONB, -- Store any provisioning details

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_spent CHECK (time_spent_seconds >= 0)
);

-- Indexes
CREATE INDEX idx_lab_instances_user ON lab_instances(user_id);
CREATE INDEX idx_lab_instances_topic ON lab_instances(topic_id);
CREATE INDEX idx_lab_instances_status ON lab_instances(status);
CREATE INDEX idx_lab_instances_expires ON lab_instances(expires_at);
CREATE INDEX idx_lab_instances_enrollment ON lab_instances(enrollment_id);

-- Unique constraint: One active instance per user per topic
CREATE UNIQUE INDEX idx_lab_instances_active_unique
  ON lab_instances(user_id, topic_id)
  WHERE status = 'active';

-- ============================================================================
-- LAB SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lab_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  lab_instance_id UUID NOT NULL REFERENCES lab_instances(id) ON DELETE CASCADE,

  -- Submission details
  repository_url TEXT NOT NULL,
  commit_sha TEXT, -- Specific commit for grading
  branch_name TEXT DEFAULT 'main',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Grading status
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'grading', 'auto_graded', 'manual_review', 'passed', 'failed')
  ),

  -- Auto-grading results
  auto_grade_result JSONB, -- { tests_passed: 10, tests_failed: 2, coverage: 85, etc. }
  auto_grade_score NUMERIC(5,2), -- 0-100
  auto_graded_at TIMESTAMPTZ,

  -- Manual grading
  manual_grade_score NUMERIC(5,2), -- 0-100
  rubric_scores JSONB, -- { code_quality: 85, functionality: 90, etc. }
  graded_by UUID REFERENCES user_profiles(id),
  graded_at TIMESTAMPTZ,
  feedback TEXT,

  -- Final score (combines auto + manual if both exist)
  final_score NUMERIC(5,2),
  passed BOOLEAN,

  -- Re-submission tracking
  attempt_number INTEGER DEFAULT 1,
  previous_submission_id UUID REFERENCES lab_submissions(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_auto_score CHECK (auto_grade_score IS NULL OR (auto_grade_score >= 0 AND auto_grade_score <= 100)),
  CONSTRAINT valid_manual_score CHECK (manual_grade_score IS NULL OR (manual_grade_score >= 0 AND manual_grade_score <= 100)),
  CONSTRAINT valid_final_score CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 100))
);

-- Indexes
CREATE INDEX idx_lab_submissions_user ON lab_submissions(user_id);
CREATE INDEX idx_lab_submissions_topic ON lab_submissions(topic_id);
CREATE INDEX idx_lab_submissions_status ON lab_submissions(status);
CREATE INDEX idx_lab_submissions_grader ON lab_submissions(graded_by);
CREATE INDEX idx_lab_submissions_instance ON lab_submissions(lab_instance_id);
CREATE INDEX idx_lab_submissions_pending ON lab_submissions(status)
  WHERE status IN ('pending', 'manual_review');

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE lab_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_submissions ENABLE ROW LEVEL SECURITY;

-- Lab Templates: Public read, admin write
CREATE POLICY lab_templates_public_read ON lab_templates
  FOR SELECT
  USING (is_active = true);

-- Note: Admin write policies will be added when roles system is implemented

-- Lab Instances: Users can view/update their own
CREATE POLICY lab_instances_user_policy ON lab_instances
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Lab Submissions: Users can view/create their own
CREATE POLICY lab_submissions_user_policy ON lab_submissions
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_lab_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lab_templates_timestamp
  BEFORE UPDATE ON lab_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

CREATE TRIGGER set_lab_instances_timestamp
  BEFORE UPDATE ON lab_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

CREATE TRIGGER set_lab_submissions_timestamp
  BEFORE UPDATE ON lab_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_timestamp();

-- Auto-update lab instance status when submitted
CREATE OR REPLACE FUNCTION update_lab_instance_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lab_instances
  SET
    status = 'submitted',
    completed_at = NEW.submitted_at,
    updated_at = NOW()
  WHERE id = NEW.lab_instance_id
    AND status = 'active';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lab_instance_submission
  AFTER INSERT ON lab_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_instance_on_submission();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Grading queue view for trainers
CREATE OR REPLACE VIEW grading_queue AS
SELECT
  ls.id AS submission_id,
  ls.user_id,
  up.full_name AS student_name,
  up.email AS student_email,
  ls.topic_id,
  mt.title AS topic_title,
  cm.title AS module_title,
  c.title AS course_title,
  ls.repository_url,
  ls.commit_sha,
  ls.submitted_at,
  ls.status,
  ls.auto_grade_score,
  ls.attempt_number,
  ls.enrollment_id
FROM lab_submissions ls
JOIN user_profiles up ON up.id = ls.user_id
JOIN module_topics mt ON mt.id = ls.topic_id
JOIN course_modules cm ON cm.id = mt.module_id
JOIN courses c ON c.id = cm.course_id
WHERE ls.status IN ('pending', 'manual_review')
ORDER BY ls.submitted_at ASC;

-- Lab statistics view
CREATE OR REPLACE VIEW lab_statistics AS
SELECT
  mt.id AS topic_id,
  mt.title AS lab_title,
  COUNT(DISTINCT li.user_id) AS total_students_started,
  COUNT(DISTINCT ls.user_id) AS total_students_submitted,
  COUNT(ls.id) FILTER (WHERE ls.passed = true) AS total_passed,
  COUNT(ls.id) FILTER (WHERE ls.passed = false) AS total_failed,
  AVG(ls.final_score) AS avg_final_score,
  AVG(li.time_spent_seconds) FILTER (WHERE li.status = 'completed') AS avg_time_spent_seconds
FROM module_topics mt
LEFT JOIN lab_instances li ON li.topic_id = mt.id
LEFT JOIN lab_submissions ls ON ls.topic_id = mt.id
WHERE mt.content_type = 'lab'
GROUP BY mt.id, mt.title;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE lab_templates IS 'Store metadata about lab template repositories';
COMMENT ON TABLE lab_instances IS 'Track active lab sessions for students';
COMMENT ON TABLE lab_submissions IS 'Store lab submissions and grading results';
COMMENT ON COLUMN lab_instances.expires_at IS 'When the lab session expires (based on time_limit)';
COMMENT ON COLUMN lab_submissions.auto_grade_result IS 'JSON result from GitHub Actions or auto-grader';
COMMENT ON COLUMN lab_submissions.rubric_scores IS 'JSON scores for manual grading rubric items';
