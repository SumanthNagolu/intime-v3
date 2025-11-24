/**
 * Quiz Builder System Migration
 * ACAD-010: Build Quiz Builder (Admin)
 *
 * Creates tables for quiz questions, quiz settings, and analytics.
 * Supports multiple question types with flexible answer storage.
 */

-- ============================================================================
-- TABLES
-- ============================================================================

/**
 * Quiz Questions Table
 * Stores reusable quiz questions with multiple question types
 */
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  topic_id UUID REFERENCES module_topics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_profiles(id),

  -- Question Content
  question_text TEXT NOT NULL CHECK (length(question_text) >= 10),
  question_type TEXT NOT NULL CHECK (
    question_type IN (
      'multiple_choice_single',
      'multiple_choice_multiple',
      'true_false',
      'code'
    )
  ),

  -- Options and Answers (JSONB for flexibility)
  options JSONB NOT NULL, -- ["Option A", "Option B", ...] or ["True", "False"]
  correct_answers JSONB NOT NULL, -- [0, 2] for indices of correct options

  -- Metadata
  explanation TEXT, -- Shown after submission
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),

  -- Code Questions
  code_language TEXT, -- For syntax highlighting (e.g., 'javascript', 'python')

  -- Sharing
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Can be used across courses

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_questions_topic ON quiz_questions(topic_id);
CREATE INDEX idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_public ON quiz_questions(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_quiz_questions_created_by ON quiz_questions(created_by);

-- Full-text search on question text
CREATE INDEX idx_quiz_questions_text_search ON quiz_questions USING GIN (to_tsvector('english', question_text));

-- Update timestamp trigger
CREATE TRIGGER update_quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE quiz_questions IS 'Reusable quiz questions with multiple question types';
COMMENT ON COLUMN quiz_questions.options IS 'Array of option strings stored as JSONB';
COMMENT ON COLUMN quiz_questions.correct_answers IS 'Array of indices pointing to correct options in the options array';

/**
 * Quiz Settings Table
 * Stores quiz configuration per topic
 */
CREATE TABLE quiz_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  topic_id UUID NOT NULL UNIQUE REFERENCES module_topics(id) ON DELETE CASCADE,

  -- Randomization
  randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
  randomize_options BOOLEAN NOT NULL DEFAULT FALSE,

  -- Scoring
  passing_threshold INTEGER NOT NULL DEFAULT 70 CHECK (passing_threshold >= 0 AND passing_threshold <= 100),
  show_correct_answers BOOLEAN NOT NULL DEFAULT TRUE, -- After submission

  -- Time Management
  time_limit_minutes INTEGER CHECK (time_limit_minutes > 0),

  -- Attempts
  max_attempts INTEGER CHECK (max_attempts > 0),
  allow_review BOOLEAN NOT NULL DEFAULT TRUE, -- Can review after submission

  -- XP Rewards
  xp_reward INTEGER NOT NULL DEFAULT 10 CHECK (xp_reward >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_quiz_settings_topic ON quiz_settings(topic_id);

-- Update timestamp trigger
CREATE TRIGGER update_quiz_settings_updated_at
  BEFORE UPDATE ON quiz_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE quiz_settings IS 'Quiz configuration and settings per topic';

/**
 * Quiz Attempts Table
 * Tracks student quiz attempts (used in ACAD-011)
 */
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  topic_id UUID NOT NULL REFERENCES module_topics(id),
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id),

  -- Attempt Metadata
  attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number > 0),

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,

  -- Answers (JSONB for flexibility)
  answers JSONB, -- { "question-id": [selected indices] }

  -- Scoring
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  correct_answers INTEGER CHECK (correct_answers >= 0),
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN,

  -- XP
  xp_earned INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_topic ON quiz_attempts(topic_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX idx_quiz_attempts_submitted ON quiz_attempts(submitted_at) WHERE submitted_at IS NOT NULL;
CREATE UNIQUE INDEX idx_quiz_attempts_unique ON quiz_attempts(user_id, topic_id, attempt_number);

COMMENT ON TABLE quiz_attempts IS 'Student quiz attempts with answers and scoring';
COMMENT ON COLUMN quiz_attempts.answers IS 'JSONB object mapping question IDs to selected answer indices';

-- ============================================================================
-- VIEWS
-- ============================================================================

/**
 * Question Bank Stats View
 * Provides statistics about questions in the bank
 */
CREATE VIEW question_bank_stats AS
SELECT
  qq.id AS question_id,
  qq.topic_id,
  qq.question_text,
  qq.question_type,
  qq.difficulty,
  qq.points,
  qq.is_public,
  qq.created_by,
  up.full_name AS created_by_name,

  -- Usage stats
  COUNT(DISTINCT qa.id) AS times_used,
  COUNT(DISTINCT qa.user_id) AS unique_students,

  -- Performance stats
  COALESCE(AVG(
    CASE
      WHEN qa.submitted_at IS NOT NULL THEN
        -- Check if this question was answered correctly
        CASE
          WHEN (qa.answers->qq.id::text) = qq.correct_answers THEN 100.0
          ELSE 0.0
        END
      ELSE NULL
    END
  ), 0) AS avg_correct_percentage,

  qq.created_at,
  qq.updated_at
FROM quiz_questions qq
LEFT JOIN user_profiles up ON qq.created_by = up.id
LEFT JOIN quiz_attempts qa ON qa.topic_id = qq.topic_id
GROUP BY qq.id, up.full_name;

COMMENT ON VIEW question_bank_stats IS 'Statistics and analytics for questions in the question bank';

/**
 * Quiz Analytics View
 * Aggregates quiz performance data per topic
 */
CREATE VIEW quiz_analytics AS
SELECT
  mt.id AS topic_id,
  mt.title AS topic_title,
  cm.id AS module_id,
  cm.title AS module_title,
  c.id AS course_id,
  c.title AS course_title,

  -- Question stats
  COUNT(DISTINCT qq.id) AS total_questions,
  COUNT(DISTINCT CASE WHEN qq.difficulty = 'easy' THEN qq.id END) AS easy_questions,
  COUNT(DISTINCT CASE WHEN qq.difficulty = 'medium' THEN qq.id END) AS medium_questions,
  COUNT(DISTINCT CASE WHEN qq.difficulty = 'hard' THEN qq.id END) AS hard_questions,

  -- Attempt stats
  COUNT(DISTINCT qa.id) AS total_attempts,
  COUNT(DISTINCT qa.user_id) AS unique_students,
  COUNT(DISTINCT CASE WHEN qa.passed = TRUE THEN qa.id END) AS passed_attempts,

  -- Performance metrics
  COALESCE(AVG(qa.score), 0) AS avg_score,
  COALESCE(AVG(qa.time_taken_seconds), 0) AS avg_time_seconds,
  COALESCE(
    (COUNT(DISTINCT CASE WHEN qa.passed = TRUE THEN qa.id END)::FLOAT /
     NULLIF(COUNT(DISTINCT qa.id), 0)) * 100,
    0
  ) AS pass_rate

FROM module_topics mt
JOIN course_modules cm ON mt.module_id = cm.id
JOIN courses c ON cm.course_id = c.id
LEFT JOIN quiz_questions qq ON qq.topic_id = mt.id
LEFT JOIN quiz_attempts qa ON qa.topic_id = mt.id AND qa.submitted_at IS NOT NULL
WHERE mt.content_type = 'quiz'
GROUP BY mt.id, cm.id, c.id;

COMMENT ON VIEW quiz_analytics IS 'Aggregated quiz performance metrics per topic';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quiz Questions Policies

-- Admins and trainers can do everything
CREATE POLICY quiz_questions_admin_all
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (
    -- TODO: Check if user has 'admin' or 'trainer' role
    TRUE
  );

-- Students can read questions for enrolled courses (will be enforced in ACAD-011)
CREATE POLICY quiz_questions_student_read
  ON quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    -- Public questions or questions in topics where user is enrolled
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN course_modules cm ON cm.course_id = se.course_id
      JOIN module_topics mt ON mt.module_id = cm.id
      WHERE mt.id = topic_id
        AND se.user_id = auth.uid()
        AND se.status = 'active'
    )
  );

-- Quiz Settings Policies

-- Admins and trainers can manage settings
CREATE POLICY quiz_settings_admin_all
  ON quiz_settings
  FOR ALL
  TO authenticated
  USING (
    -- TODO: Check if user has 'admin' or 'trainer' role
    TRUE
  );

-- Students can read settings for enrolled courses
CREATE POLICY quiz_settings_student_read
  ON quiz_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN course_modules cm ON cm.course_id = se.course_id
      JOIN module_topics mt ON mt.module_id = cm.id
      WHERE mt.id = topic_id
        AND se.user_id = auth.uid()
        AND se.status = 'active'
    )
  );

-- Quiz Attempts Policies

-- Users can only see their own attempts
CREATE POLICY quiz_attempts_user_read
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own attempts
CREATE POLICY quiz_attempts_user_insert
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own in-progress attempts
CREATE POLICY quiz_attempts_user_update
  ON quiz_attempts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND submitted_at IS NULL);

-- Admins and trainers can see all attempts
CREATE POLICY quiz_attempts_admin_read
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    -- TODO: Check if user has 'admin' or 'trainer' role
    TRUE
  );

-- ============================================================================
-- VALIDATION CONSTRAINTS
-- ============================================================================

/**
 * Validate options format based on question type
 */
CREATE OR REPLACE FUNCTION validate_quiz_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate options is an array
  IF jsonb_typeof(NEW.options) != 'array' THEN
    RAISE EXCEPTION 'options must be a JSON array';
  END IF;

  -- Validate correct_answers is an array
  IF jsonb_typeof(NEW.correct_answers) != 'array' THEN
    RAISE EXCEPTION 'correct_answers must be a JSON array';
  END IF;

  -- Type-specific validation
  CASE NEW.question_type
    WHEN 'true_false' THEN
      -- Must have exactly 2 options
      IF jsonb_array_length(NEW.options) != 2 THEN
        RAISE EXCEPTION 'true_false questions must have exactly 2 options';
      END IF;
      -- Must have exactly 1 correct answer
      IF jsonb_array_length(NEW.correct_answers) != 1 THEN
        RAISE EXCEPTION 'true_false questions must have exactly 1 correct answer';
      END IF;

    WHEN 'multiple_choice_single' THEN
      -- Must have at least 2 options
      IF jsonb_array_length(NEW.options) < 2 THEN
        RAISE EXCEPTION 'multiple_choice_single questions must have at least 2 options';
      END IF;
      -- Must have exactly 1 correct answer
      IF jsonb_array_length(NEW.correct_answers) != 1 THEN
        RAISE EXCEPTION 'multiple_choice_single questions must have exactly 1 correct answer';
      END IF;

    WHEN 'multiple_choice_multiple' THEN
      -- Must have at least 2 options
      IF jsonb_array_length(NEW.options) < 2 THEN
        RAISE EXCEPTION 'multiple_choice_multiple questions must have at least 2 options';
      END IF;
      -- Must have at least 1 correct answer
      IF jsonb_array_length(NEW.correct_answers) < 1 THEN
        RAISE EXCEPTION 'multiple_choice_multiple questions must have at least 1 correct answer';
      END IF;

    WHEN 'code' THEN
      -- Code language must be specified
      IF NEW.code_language IS NULL THEN
        RAISE EXCEPTION 'code questions must have a code_language specified';
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for validation
CREATE TRIGGER validate_quiz_question_trigger
  BEFORE INSERT OR UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION validate_quiz_question();

-- ============================================================================
-- SEED DEFAULT SETTINGS
-- ============================================================================

-- Note: Default quiz settings will be created per topic when quiz is first accessed
-- This allows flexibility without requiring upfront configuration
