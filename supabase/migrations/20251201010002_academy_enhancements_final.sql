-- =====================================================
-- ACADEMY MODULE ENHANCEMENTS (Final - TEXT types)
-- Learning Paths, Certificates, Achievements, Streaks, Leaderboards
-- =====================================================

-- =====================================================
-- LEARNING PATHS
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_estimate_hours INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  thumbnail_url TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status);
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON learning_paths(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_paths_deleted_at ON learning_paths(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- LEARNING_PATH_COURSES (Junction Table)
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (path_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_path_courses_path_id ON learning_path_courses(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_course_id ON learning_path_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_sequence ON learning_path_courses(sequence);

-- =====================================================
-- PATH_ENROLLMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS path_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  path_id UUID NOT NULL REFERENCES learning_paths(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'dropped', 'expired')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, path_id)
);

CREATE INDEX IF NOT EXISTS idx_path_enrollments_user_id ON path_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_path_enrollments_path_id ON path_enrollments(path_id);
CREATE INDEX IF NOT EXISTS idx_path_enrollments_status ON path_enrollments(status);

-- =====================================================
-- CERTIFICATES
-- =====================================================

-- Certificate Templates
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  design_template TEXT NOT NULL,
  fields JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificate_templates_active ON certificate_templates(is_active);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id),
  template_id UUID REFERENCES certificate_templates(id),
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  pdf_url TEXT,
  verification_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id ON certificates(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);

-- =====================================================
-- GAMIFICATION - LEVELS
-- =====================================================

-- Level Definitions
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  title TEXT NOT NULL,
  badge_url TEXT,
  perks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_level_definitions_xp_required ON level_definitions(xp_required);

-- User Levels
CREATE TABLE IF NOT EXISTS user_levels (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
  current_level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  level_up_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_levels_current_level ON user_levels(current_level);
CREATE INDEX IF NOT EXISTS idx_user_levels_current_xp ON user_levels(current_xp);

-- =====================================================
-- ACHIEVEMENTS
-- =====================================================

-- Achievements (broader than badges)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  badge_url TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_is_secret ON achievements(is_secret);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- =====================================================
-- STREAKS
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_login', 'daily_learning', 'weekly_completion')),
  current_count INTEGER NOT NULL DEFAULT 0,
  longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  streak_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, streak_type)
);

CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_id ON learning_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_streak_type ON learning_streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_current_count ON learning_streaks(current_count);
CREATE INDEX IF NOT EXISTS idx_learning_streaks_last_activity_date ON learning_streaks(last_activity_date);

-- =====================================================
-- LEADERBOARDS
-- =====================================================

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'all_time')),
  scope TEXT NOT NULL CHECK (scope IN ('org', 'department', 'course')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_scope ON leaderboards(scope);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_start, period_end);

-- Leaderboard Entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  rank INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (leaderboard_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_xp_earned ON leaderboard_entries(xp_earned);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'learning_paths_updated_at') THEN
    CREATE TRIGGER learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'path_enrollments_updated_at') THEN
    CREATE TRIGGER path_enrollments_updated_at BEFORE UPDATE ON path_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'certificate_templates_updated_at') THEN
    CREATE TRIGGER certificate_templates_updated_at BEFORE UPDATE ON certificate_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'level_definitions_updated_at') THEN
    CREATE TRIGGER level_definitions_updated_at BEFORE UPDATE ON level_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_levels_updated_at') THEN
    CREATE TRIGGER user_levels_updated_at BEFORE UPDATE ON user_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'achievements_updated_at') THEN
    CREATE TRIGGER achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'learning_streaks_updated_at') THEN
    CREATE TRIGGER learning_streaks_updated_at BEFORE UPDATE ON learning_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leaderboards_updated_at') THEN
    CREATE TRIGGER leaderboards_updated_at BEFORE UPDATE ON leaderboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leaderboard_entries_updated_at') THEN
    CREATE TRIGGER leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- SEED DATA - Sample Level Definitions
-- =====================================================

INSERT INTO level_definitions (level, xp_required, title, badge_url, perks) VALUES
(1, 0, 'Beginner', NULL, '{"description": "Just getting started"}'),
(2, 500, 'Novice', NULL, '{"description": "Learning the ropes"}'),
(3, 1500, 'Apprentice', NULL, '{"description": "Making progress"}'),
(4, 3500, 'Intermediate', NULL, '{"description": "Halfway there"}'),
(5, 7000, 'Advanced', NULL, '{"description": "Getting serious"}'),
(6, 12000, 'Expert', NULL, '{"description": "True mastery"}'),
(7, 20000, 'Master', NULL, '{"description": "Elite performer"}'),
(8, 30000, 'Legend', NULL, '{"description": "Legendary status"}')
ON CONFLICT (level) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate path progress
CREATE OR REPLACE FUNCTION calculate_path_progress(p_user_id UUID, p_path_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_courses INTEGER;
  completed_courses INTEGER;
  progress INTEGER;
BEGIN
  -- Get total required courses in path
  SELECT COUNT(*)
  INTO total_courses
  FROM learning_path_courses lpc
  WHERE lpc.path_id = p_path_id
    AND lpc.is_required = TRUE;

  -- Get completed courses for this user
  SELECT COUNT(*)
  INTO completed_courses
  FROM learning_path_courses lpc
  INNER JOIN student_enrollments se ON lpc.course_id = se.course_id
  WHERE lpc.path_id = p_path_id
    AND lpc.is_required = TRUE
    AND se.user_id = p_user_id
    AND se.status = 'completed';

  -- Calculate percentage
  IF total_courses = 0 THEN
    progress := 0;
  ELSE
    progress := ROUND((completed_courses::DECIMAL / total_courses::DECIMAL) * 100);
  END IF;

  RETURN progress;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_learning_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_streak RECORD;
  v_hours_since_last_activity INTEGER;
BEGIN
  -- Get existing streak
  SELECT * INTO v_streak
  FROM learning_streaks
  WHERE user_id = p_user_id
    AND streak_type = p_streak_type;

  IF v_streak IS NULL THEN
    -- Create new streak
    INSERT INTO learning_streaks (
      user_id,
      streak_type,
      current_count,
      longest_count,
      last_activity_date,
      streak_started_at
    ) VALUES (
      p_user_id,
      p_streak_type,
      1,
      1,
      NOW(),
      NOW()
    );
  ELSE
    -- Calculate hours since last activity
    v_hours_since_last_activity := EXTRACT(EPOCH FROM (NOW() - v_streak.last_activity_date)) / 3600;

    IF v_hours_since_last_activity < 48 THEN
      -- Streak continues (within 48 hours)
      UPDATE learning_streaks
      SET current_count = current_count + 1,
          longest_count = GREATEST(longest_count, current_count + 1),
          last_activity_date = NOW(),
          updated_at = NOW()
      WHERE user_id = p_user_id
        AND streak_type = p_streak_type;
    ELSE
      -- Streak broken, restart
      UPDATE learning_streaks
      SET current_count = 1,
          last_activity_date = NOW(),
          streak_started_at = NOW(),
          updated_at = NOW()
      WHERE user_id = p_user_id
        AND streak_type = p_streak_type;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current level info
CREATE OR REPLACE FUNCTION get_user_level_info(p_user_id UUID)
RETURNS TABLE (
  current_level INTEGER,
  current_xp INTEGER,
  xp_to_next_level INTEGER,
  current_level_title TEXT,
  next_level INTEGER,
  next_level_title TEXT,
  progress_percent INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.current_level,
    ul.current_xp,
    ul.xp_to_next_level,
    ld_current.title AS current_level_title,
    (ul.current_level + 1)::INTEGER AS next_level,
    ld_next.title AS next_level_title,
    ROUND((ul.current_xp::DECIMAL / ul.xp_to_next_level::DECIMAL) * 100)::INTEGER AS progress_percent
  FROM user_levels ul
  LEFT JOIN level_definitions ld_current ON ul.current_level = ld_current.level
  LEFT JOIN level_definitions ld_next ON (ul.current_level + 1) = ld_next.level
  WHERE ul.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
