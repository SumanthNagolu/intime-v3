/**
 * Progress Tracking System
 * Story: ACAD-003
 *
 * Creates:
 * - topic_completions: Track completion of individual topics
 * - xp_transactions: Gamification ledger for XP awards
 * - user_xp_totals: Materialized view for leaderboard
 * - Functions: complete_topic, update_enrollment_progress, is_topic_unlocked, get_user_total_xp
 */

-- =====================================================
-- TABLE: topic_completions
-- =====================================================
CREATE TABLE IF NOT EXISTS topic_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  topic_id UUID NOT NULL REFERENCES module_topics(id) ON DELETE RESTRICT,

  -- Completion tracking
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  completion_source TEXT DEFAULT 'manual' CHECK (
    completion_source IN ('manual', 'auto', 'admin_override')
  ),
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_topic_completion UNIQUE (user_id, topic_id),
  CONSTRAINT valid_time_spent CHECK (time_spent_seconds >= 0),
  CONSTRAINT valid_xp CHECK (xp_earned >= 0)
);

-- Indexes for performance
CREATE INDEX idx_topic_completions_user ON topic_completions(user_id);
CREATE INDEX idx_topic_completions_enrollment ON topic_completions(enrollment_id);
CREATE INDEX idx_topic_completions_course ON topic_completions(course_id);
CREATE INDEX idx_topic_completions_completed_at ON topic_completions(completed_at DESC);

-- RLS Policies
ALTER TABLE topic_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON topic_completions FOR SELECT
  USING (user_id = auth.uid());

-- Note: Admin policy will be added when roles system is implemented

-- =====================================================
-- TABLE: xp_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Transaction details
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'topic_completion',
      'quiz_passed',
      'lab_completed',
      'project_submitted',
      'bonus_achievement',
      'penalty',
      'adjustment'
    )
  ),

  -- Context
  reference_type TEXT CHECK (
    reference_type IN ('topic_completion', 'enrollment', 'achievement', 'admin_action')
  ),
  reference_id UUID,
  description TEXT,

  -- Metadata
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by UUID REFERENCES user_profiles(id),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_awarded_at ON xp_transactions(awarded_at DESC);
CREATE INDEX idx_xp_transactions_type ON xp_transactions(transaction_type);
CREATE INDEX idx_xp_transactions_reference ON xp_transactions(reference_type, reference_id);

-- RLS Policies
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP transactions"
  ON xp_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Note: Admin policy will be added when roles system is implemented

-- =====================================================
-- MATERIALIZED VIEW: user_xp_totals
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS user_xp_totals AS
SELECT
  user_id,
  SUM(amount) as total_xp,
  COUNT(*) as transaction_count,
  MAX(awarded_at) as last_xp_earned_at,
  -- Rank for leaderboard
  RANK() OVER (ORDER BY SUM(amount) DESC) as leaderboard_rank
FROM xp_transactions
GROUP BY user_id;

-- Index for fast lookups
CREATE UNIQUE INDEX idx_user_xp_totals_user ON user_xp_totals(user_id);
CREATE INDEX idx_user_xp_totals_rank ON user_xp_totals(leaderboard_rank);

-- =====================================================
-- FUNCTION: get_user_total_xp
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_total_xp(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT COALESCE(total_xp, 0) INTO v_total_xp
  FROM user_xp_totals
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_total_xp, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: is_topic_unlocked
-- =====================================================
CREATE OR REPLACE FUNCTION is_topic_unlocked(
  p_user_id UUID,
  p_topic_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_topics UUID[];
  v_completed_topics UUID[];
BEGIN
  -- Get prerequisite topics for this topic
  SELECT prerequisite_topic_ids INTO v_prerequisite_topics
  FROM module_topics
  WHERE id = p_topic_id;

  -- If no prerequisites, topic is unlocked
  IF v_prerequisite_topics IS NULL OR array_length(v_prerequisite_topics, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Get completed topics for user
  SELECT ARRAY_AGG(topic_id) INTO v_completed_topics
  FROM topic_completions
  WHERE user_id = p_user_id;

  -- Check if all prerequisites are completed
  RETURN v_prerequisite_topics <@ COALESCE(v_completed_topics, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: update_enrollment_progress
-- =====================================================
CREATE OR REPLACE FUNCTION update_enrollment_progress(
  p_enrollment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_total_topics INTEGER;
  v_completed_topics INTEGER;
  v_new_percentage INTEGER;
  v_current_percentage INTEGER;
BEGIN
  -- Get enrollment details
  SELECT user_id, course_id, completion_percentage
  INTO v_user_id, v_course_id, v_current_percentage
  FROM student_enrollments
  WHERE id = p_enrollment_id;

  -- Get total topics in course
  SELECT total_topics INTO v_total_topics
  FROM courses
  WHERE id = v_course_id;

  -- Guard against division by zero
  IF v_total_topics = 0 THEN
    RETURN;
  END IF;

  -- Count completed topics for this enrollment
  SELECT COUNT(*) INTO v_completed_topics
  FROM topic_completions
  WHERE enrollment_id = p_enrollment_id;

  -- Calculate new percentage
  v_new_percentage := LEAST(100, (v_completed_topics * 100) / v_total_topics);

  -- Update enrollment
  UPDATE student_enrollments
  SET
    completion_percentage = v_new_percentage,
    updated_at = NOW(),
    completed_at = CASE
      WHEN v_new_percentage = 100 AND v_current_percentage < 100 THEN NOW()
      ELSE completed_at
    END,
    status = CASE
      WHEN v_new_percentage = 100 AND status = 'active' THEN 'completed'
      ELSE status
    END
  WHERE id = p_enrollment_id;

  -- Publish graduation event if just reached 100%
  IF v_new_percentage = 100 AND v_current_percentage < 100 THEN
    BEGIN
      PERFORM publish_event(
        'course.graduated',
        jsonb_build_object(
          'enrollment_id', p_enrollment_id,
          'user_id', v_user_id,
          'course_id', v_course_id,
          'completed_topics', v_completed_topics
        ),
        jsonb_build_object('source', 'update_enrollment_progress'),
        v_user_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Silently continue if publish_event doesn't exist
        IF SQLSTATE = '42883' THEN
          NULL;
        ELSE
          RAISE;
        END IF;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: complete_topic
-- =====================================================
CREATE OR REPLACE FUNCTION complete_topic(
  p_user_id UUID,
  p_enrollment_id UUID,
  p_topic_id UUID,
  p_time_spent_seconds INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_completion_id UUID;
  v_course_id UUID;
  v_module_id UUID;
  v_topic_unlocked BOOLEAN;
  v_content_type TEXT;
  v_xp_earned INTEGER;
BEGIN
  -- Check if topic is unlocked
  SELECT is_topic_unlocked(p_user_id, p_topic_id) INTO v_topic_unlocked;

  IF NOT v_topic_unlocked THEN
    RAISE EXCEPTION 'Topic is locked. Complete prerequisites first.';
  END IF;

  -- Get topic details
  SELECT course_id, module_id, content_type
  INTO v_course_id, v_module_id, v_content_type
  FROM module_topics
  WHERE id = p_topic_id;

  -- Calculate XP based on content type
  v_xp_earned := CASE v_content_type
    WHEN 'video' THEN 10
    WHEN 'reading' THEN 10
    WHEN 'quiz' THEN 20
    WHEN 'lab' THEN 30
    WHEN 'project' THEN 50
    ELSE 10
  END;

  -- Insert or update completion
  INSERT INTO topic_completions (
    user_id, enrollment_id, course_id, module_id, topic_id,
    time_spent_seconds, xp_earned, completion_source
  ) VALUES (
    p_user_id, p_enrollment_id, v_course_id, v_module_id, p_topic_id,
    p_time_spent_seconds, v_xp_earned, 'manual'
  )
  ON CONFLICT (user_id, topic_id) DO UPDATE
  SET
    time_spent_seconds = topic_completions.time_spent_seconds + EXCLUDED.time_spent_seconds,
    updated_at = NOW()
  RETURNING id INTO v_completion_id;

  -- Record XP transaction (only on first completion)
  IF v_completion_id IS NOT NULL THEN
    INSERT INTO xp_transactions (
      user_id, amount, transaction_type,
      reference_type, reference_id, description
    ) VALUES (
      p_user_id, v_xp_earned, 'topic_completion',
      'topic_completion', v_completion_id,
      'Completed topic: ' || v_content_type
    );
  END IF;

  -- Update enrollment progress
  PERFORM update_enrollment_progress(p_enrollment_id);

  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_xp_totals;

  RETURN v_completion_id;
EXCEPTION
  WHEN OTHERS THEN
    -- If materialized view refresh fails, still return completion
    IF SQLSTATE = '55000' THEN -- object in use
      RETURN v_completion_id;
    ELSE
      RAISE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_topic_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topic_completions_updated_at
  BEFORE UPDATE ON topic_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_completions_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE topic_completions IS 'Tracks student completion of individual course topics';
COMMENT ON TABLE xp_transactions IS 'Ledger of all XP awards and penalties for gamification';
COMMENT ON MATERIALIZED VIEW user_xp_totals IS 'Aggregated XP totals for leaderboard performance';
COMMENT ON FUNCTION complete_topic IS 'Marks a topic as complete, awards XP, and updates enrollment progress';
COMMENT ON FUNCTION update_enrollment_progress IS 'Recalculates enrollment completion percentage based on completed topics';
COMMENT ON FUNCTION is_topic_unlocked IS 'Checks if a topic is unlocked for a user based on prerequisites';
COMMENT ON FUNCTION get_user_total_xp IS 'Returns total XP earned by a user';
