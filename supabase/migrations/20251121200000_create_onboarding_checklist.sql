-- Student Onboarding Checklist System
-- Critical Fix: Create missing onboarding_checklist table

-- =====================================================
-- ONBOARDING CHECKLIST TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Checklist items
  completed_profile BOOLEAN DEFAULT FALSE,
  completed_profile_at TIMESTAMPTZ,

  enrolled_first_course BOOLEAN DEFAULT FALSE,
  enrolled_first_course_at TIMESTAMPTZ,

  watched_first_video BOOLEAN DEFAULT FALSE,
  watched_first_video_at TIMESTAMPTZ,

  completed_first_quiz BOOLEAN DEFAULT FALSE,
  completed_first_quiz_at TIMESTAMPTZ,

  joined_community BOOLEAN DEFAULT FALSE,
  joined_community_at TIMESTAMPTZ,

  connected_payment_method BOOLEAN DEFAULT FALSE,
  connected_payment_method_at TIMESTAMPTZ,

  set_learning_goals BOOLEAN DEFAULT FALSE,
  set_learning_goals_at TIMESTAMPTZ,

  completed_orientation BOOLEAN DEFAULT FALSE,
  completed_orientation_at TIMESTAMPTZ,

  -- Progress tracking
  total_steps INTEGER GENERATED ALWAYS AS (8) STORED,
  completed_steps INTEGER GENERATED ALWAYS AS (
    (CASE WHEN completed_profile THEN 1 ELSE 0 END) +
    (CASE WHEN enrolled_first_course THEN 1 ELSE 0 END) +
    (CASE WHEN watched_first_video THEN 1 ELSE 0 END) +
    (CASE WHEN completed_first_quiz THEN 1 ELSE 0 END) +
    (CASE WHEN joined_community THEN 1 ELSE 0 END) +
    (CASE WHEN connected_payment_method THEN 1 ELSE 0 END) +
    (CASE WHEN set_learning_goals THEN 1 ELSE 0 END) +
    (CASE WHEN completed_orientation THEN 1 ELSE 0 END)
  ) STORED,
  completion_percentage INTEGER GENERATED ALWAYS AS (
    ROUND((
      (CASE WHEN completed_profile THEN 1 ELSE 0 END) +
      (CASE WHEN enrolled_first_course THEN 1 ELSE 0 END) +
      (CASE WHEN watched_first_video THEN 1 ELSE 0 END) +
      (CASE WHEN completed_first_quiz THEN 1 ELSE 0 END) +
      (CASE WHEN joined_community THEN 1 ELSE 0 END) +
      (CASE WHEN connected_payment_method THEN 1 ELSE 0 END) +
      (CASE WHEN set_learning_goals THEN 1 ELSE 0 END) +
      (CASE WHEN completed_orientation THEN 1 ELSE 0 END)
    )::NUMERIC / 8 * 100)
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint: one checklist per user
  CONSTRAINT unique_checklist_per_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_onboarding_checklist_user ON onboarding_checklist(user_id);
CREATE INDEX idx_onboarding_checklist_incomplete ON onboarding_checklist(user_id) WHERE completed_at IS NULL;
CREATE INDEX idx_onboarding_checklist_completion ON onboarding_checklist(completion_percentage);

COMMENT ON TABLE onboarding_checklist IS 'Student onboarding progress tracking';

-- =====================================================
-- UPDATE TIMESTAMP TRIGGER
-- =====================================================

CREATE TRIGGER update_onboarding_checklist_updated_at
  BEFORE UPDATE ON onboarding_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-COMPLETE TRIGGER
-- =====================================================

-- Automatically set completed_at when all items are checked
CREATE OR REPLACE FUNCTION set_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_steps = NEW.total_steps AND OLD.completed_at IS NULL THEN
    NEW.completed_at := NOW();
  ELSIF NEW.completed_steps < NEW.total_steps AND OLD.completed_at IS NOT NULL THEN
    NEW.completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_onboarding_completion
  BEFORE UPDATE ON onboarding_checklist
  FOR EACH ROW
  WHEN (
    OLD.completed_profile IS DISTINCT FROM NEW.completed_profile OR
    OLD.enrolled_first_course IS DISTINCT FROM NEW.enrolled_first_course OR
    OLD.watched_first_video IS DISTINCT FROM NEW.watched_first_video OR
    OLD.completed_first_quiz IS DISTINCT FROM NEW.completed_first_quiz OR
    OLD.joined_community IS DISTINCT FROM NEW.joined_community OR
    OLD.connected_payment_method IS DISTINCT FROM NEW.connected_payment_method OR
    OLD.set_learning_goals IS DISTINCT FROM NEW.set_learning_goals OR
    OLD.completed_orientation IS DISTINCT FROM NEW.completed_orientation
  )
  EXECUTE FUNCTION set_onboarding_completion();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE onboarding_checklist ENABLE ROW LEVEL SECURITY;

-- Users can view their own checklist
CREATE POLICY "Users can view own onboarding checklist"
  ON onboarding_checklist
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own checklist
CREATE POLICY "Users can update own onboarding checklist"
  ON onboarding_checklist
  FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert checklists for new users
CREATE POLICY "System can insert onboarding checklist"
  ON onboarding_checklist
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all checklists
CREATE POLICY "Admins can view all onboarding checklists"
  ON onboarding_checklist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get or create user's onboarding checklist
CREATE OR REPLACE FUNCTION get_or_create_onboarding_checklist(
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_checklist_id UUID;
BEGIN
  -- Try to get existing checklist
  SELECT id INTO v_checklist_id
  FROM onboarding_checklist
  WHERE user_id = p_user_id;

  -- If not found, create it
  IF v_checklist_id IS NULL THEN
    INSERT INTO onboarding_checklist (user_id)
    VALUES (p_user_id)
    RETURNING id INTO v_checklist_id;
  END IF;

  RETURN v_checklist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark checklist item complete
CREATE OR REPLACE FUNCTION complete_onboarding_step(
  p_user_id UUID,
  p_step_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_checklist_id UUID;
BEGIN
  -- Get or create checklist
  v_checklist_id := get_or_create_onboarding_checklist(p_user_id);

  -- Update the specified step
  CASE p_step_name
    WHEN 'completed_profile' THEN
      UPDATE onboarding_checklist
      SET completed_profile = TRUE, completed_profile_at = NOW()
      WHERE id = v_checklist_id AND completed_profile = FALSE;

    WHEN 'enrolled_first_course' THEN
      UPDATE onboarding_checklist
      SET enrolled_first_course = TRUE, enrolled_first_course_at = NOW()
      WHERE id = v_checklist_id AND enrolled_first_course = FALSE;

    WHEN 'watched_first_video' THEN
      UPDATE onboarding_checklist
      SET watched_first_video = TRUE, watched_first_video_at = NOW()
      WHERE id = v_checklist_id AND watched_first_video = FALSE;

    WHEN 'completed_first_quiz' THEN
      UPDATE onboarding_checklist
      SET completed_first_quiz = TRUE, completed_first_quiz_at = NOW()
      WHERE id = v_checklist_id AND completed_first_quiz = FALSE;

    WHEN 'joined_community' THEN
      UPDATE onboarding_checklist
      SET joined_community = TRUE, joined_community_at = NOW()
      WHERE id = v_checklist_id AND joined_community = FALSE;

    WHEN 'connected_payment_method' THEN
      UPDATE onboarding_checklist
      SET connected_payment_method = TRUE, connected_payment_method_at = NOW()
      WHERE id = v_checklist_id AND connected_payment_method = FALSE;

    WHEN 'set_learning_goals' THEN
      UPDATE onboarding_checklist
      SET set_learning_goals = TRUE, set_learning_goals_at = NOW()
      WHERE id = v_checklist_id AND set_learning_goals = FALSE;

    WHEN 'completed_orientation' THEN
      UPDATE onboarding_checklist
      SET completed_orientation = TRUE, completed_orientation_at = NOW()
      WHERE id = v_checklist_id AND completed_orientation = FALSE;

    ELSE
      RAISE EXCEPTION 'Invalid step name: %', p_step_name;
  END CASE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get onboarding progress for a user
CREATE OR REPLACE FUNCTION get_onboarding_progress(
  p_user_id UUID
)
RETURNS TABLE (
  user_id UUID,
  completed_steps INTEGER,
  total_steps INTEGER,
  completion_percentage INTEGER,
  is_complete BOOLEAN,
  next_step TEXT
) AS $$
DECLARE
  v_checklist onboarding_checklist%ROWTYPE;
  v_next_step TEXT;
BEGIN
  -- Get or create checklist
  PERFORM get_or_create_onboarding_checklist(p_user_id);

  -- Fetch checklist
  SELECT * INTO v_checklist
  FROM onboarding_checklist oc
  WHERE oc.user_id = p_user_id;

  -- Determine next step
  IF NOT v_checklist.completed_profile THEN
    v_next_step := 'Complete your profile';
  ELSIF NOT v_checklist.enrolled_first_course THEN
    v_next_step := 'Enroll in your first course';
  ELSIF NOT v_checklist.watched_first_video THEN
    v_next_step := 'Watch your first video lesson';
  ELSIF NOT v_checklist.completed_first_quiz THEN
    v_next_step := 'Complete your first quiz';
  ELSIF NOT v_checklist.set_learning_goals THEN
    v_next_step := 'Set your learning goals';
  ELSIF NOT v_checklist.joined_community THEN
    v_next_step := 'Join the community forum';
  ELSIF NOT v_checklist.connected_payment_method THEN
    v_next_step := 'Add a payment method';
  ELSIF NOT v_checklist.completed_orientation THEN
    v_next_step := 'Complete orientation';
  ELSE
    v_next_step := 'All done! Start learning';
  END IF;

  RETURN QUERY SELECT
    v_checklist.user_id,
    v_checklist.completed_steps,
    v_checklist.total_steps,
    v_checklist.completion_percentage,
    (v_checklist.completed_at IS NOT NULL) AS is_complete,
    v_next_step;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_onboarding_checklist(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_onboarding_step(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_onboarding_progress(UUID) TO authenticated;

-- =====================================================
-- EVENT TRIGGERS FOR AUTO-COMPLETION
-- =====================================================
-- NOTE: These triggers are created conditionally if the target tables exist.
-- If tables don't exist yet, they'll be created in a later migration.

-- Automatically mark "enrolled_first_course" when user enrolls
CREATE OR REPLACE FUNCTION auto_complete_enrollment_step()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM complete_onboarding_step(NEW.user_id, 'enrolled_first_course');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_enrollments') THEN
    DROP TRIGGER IF EXISTS onboarding_first_enrollment ON student_enrollments;
    CREATE TRIGGER onboarding_first_enrollment
      AFTER INSERT ON student_enrollments
      FOR EACH ROW
      EXECUTE FUNCTION auto_complete_enrollment_step();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create onboarding_first_enrollment trigger: %', SQLERRM;
END;
$$;

-- Automatically mark "watched_first_video" when user completes first video
CREATE OR REPLACE FUNCTION auto_complete_video_step()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM complete_onboarding_step(NEW.user_id, 'watched_first_video');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
    DROP TRIGGER IF EXISTS onboarding_first_video ON video_progress;
    CREATE TRIGGER onboarding_first_video
      AFTER INSERT OR UPDATE ON video_progress
      FOR EACH ROW
      EXECUTE FUNCTION auto_complete_video_step();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create onboarding_first_video trigger: %', SQLERRM;
END;
$$;

-- Automatically mark "completed_first_quiz" when user passes first quiz
CREATE OR REPLACE FUNCTION auto_complete_quiz_step()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM complete_onboarding_step(NEW.user_id, 'completed_first_quiz');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_attempts') THEN
    DROP TRIGGER IF EXISTS onboarding_first_quiz ON quiz_attempts;
    CREATE TRIGGER onboarding_first_quiz
      AFTER INSERT OR UPDATE ON quiz_attempts
      FOR EACH ROW
      EXECUTE FUNCTION auto_complete_quiz_step();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create onboarding_first_quiz trigger: %', SQLERRM;
END;
$$;

-- Automatically mark "connected_payment_method" on first successful payment
CREATE OR REPLACE FUNCTION auto_complete_payment_step()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' THEN
    PERFORM complete_onboarding_step(NEW.user_id, 'connected_payment_method');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    DROP TRIGGER IF EXISTS onboarding_first_payment ON payment_transactions;
    CREATE TRIGGER onboarding_first_payment
      AFTER INSERT ON payment_transactions
      FOR EACH ROW
      EXECUTE FUNCTION auto_complete_payment_step();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create onboarding_first_payment trigger: %', SQLERRM;
END;
$$;
