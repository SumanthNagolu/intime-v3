-- Create Leaderboards
-- Created: 2025-11-21
-- Story: ACAD-017
-- Description: XP rankings, cohort comparisons, privacy settings

-- ============================================================================
-- PRIVACY SETTINGS
-- ============================================================================

-- Add opt-out column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT true;

COMMENT ON COLUMN user_profiles.leaderboard_visible IS 'Whether user wants to appear on public leaderboards (privacy setting)';

-- ============================================================================
-- GLOBAL LEADERBOARD
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard_global AS
WITH ranked_users AS (
  SELECT
    up.id as user_id,
    up.full_name,
    up.avatar_url,
    uxp.total_xp,
    -- Calculate level from XP (1000 XP per level)
    FLOOR(uxp.total_xp / 1000)::INTEGER + 1 as level,
    -- Calculate level name
    CASE
      WHEN uxp.total_xp < 1000 THEN 'Beginner'
      WHEN uxp.total_xp < 5000 THEN 'Intermediate'
      WHEN uxp.total_xp < 10000 THEN 'Advanced'
      WHEN uxp.total_xp < 25000 THEN 'Expert'
      ELSE 'Master'
    END as level_name,
    RANK() OVER (ORDER BY uxp.total_xp DESC) as rank,
    DENSE_RANK() OVER (ORDER BY uxp.total_xp DESC) as dense_rank
  FROM user_profiles up
  JOIN user_xp_totals uxp ON uxp.user_id = up.id
  WHERE up.leaderboard_visible = true
    AND uxp.total_xp > 0
)
SELECT
  user_id,
  full_name,
  avatar_url,
  total_xp,
  level,
  level_name,
  rank,
  dense_rank,
  -- Calculate XP difference from previous rank
  total_xp - LAG(total_xp) OVER (ORDER BY rank DESC) as xp_diff_from_above,
  -- Calculate XP to next rank
  LEAD(total_xp) OVER (ORDER BY rank DESC) - total_xp as xp_to_next_rank
FROM ranked_users
ORDER BY rank ASC;

COMMENT ON VIEW leaderboard_global IS 'Global XP leaderboard with all visible students';

-- ============================================================================
-- COURSE-SPECIFIC LEADERBOARD
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard_by_course AS
WITH ranked_students AS (
  SELECT
    e.course_id,
    c.title as course_title,
    up.id as user_id,
    up.full_name,
    up.avatar_url,
    uxp.total_xp as course_xp,
    e.completion_percentage,
    0 as modules_completed,
    0 as total_modules,
    RANK() OVER (PARTITION BY e.course_id ORDER BY uxp.total_xp DESC) as rank,
    COUNT(*) OVER (PARTITION BY e.course_id) as total_students
  FROM student_enrollments e
  JOIN user_profiles up ON up.id = e.user_id
  JOIN courses c ON c.id = e.course_id
  JOIN user_xp_totals uxp ON uxp.user_id = e.user_id
  WHERE up.leaderboard_visible = true
    AND e.status IN ('active', 'completed')
    AND uxp.total_xp > 0
)
SELECT
  course_id,
  course_title,
  user_id,
  full_name,
  avatar_url,
  course_xp,
  completion_percentage,
  modules_completed,
  total_modules,
  rank,
  total_students,
  -- Calculate percentile (top X%)
  ROUND((1 - (rank::numeric / total_students::numeric)) * 100, 1) as percentile
FROM ranked_students
ORDER BY course_id, rank ASC;

COMMENT ON VIEW leaderboard_by_course IS 'Course-specific XP leaderboards with completion stats';

-- ============================================================================
-- COHORT LEADERBOARD
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard_by_cohort AS
WITH cohorts AS (
  -- Group enrollments by year-month cohort
  SELECT
    e.course_id,
    c.title as course_title,
    DATE_TRUNC('month', e.enrolled_at) as cohort_month,
    TO_CHAR(e.enrolled_at, 'Month YYYY') as cohort_name,
    up.id as user_id,
    up.full_name,
    up.avatar_url,
    uxp.total_xp,
    e.completion_percentage,
    e.enrolled_at
  FROM student_enrollments e
  JOIN user_profiles up ON up.id = e.user_id
  JOIN courses c ON c.id = e.course_id
  JOIN user_xp_totals uxp ON uxp.user_id = up.id
  WHERE up.leaderboard_visible = true
    AND e.status IN ('active', 'completed')
),
ranked_cohorts AS (
  SELECT
    course_id,
    course_title,
    cohort_month,
    cohort_name,
    user_id,
    full_name,
    avatar_url,
    total_xp,
    completion_percentage,
    enrolled_at,
    RANK() OVER (PARTITION BY course_id, cohort_month ORDER BY total_xp DESC) as rank,
    COUNT(*) OVER (PARTITION BY course_id, cohort_month) as cohort_size
  FROM cohorts
)
SELECT
  course_id,
  course_title,
  cohort_month,
  cohort_name,
  user_id,
  full_name,
  avatar_url,
  total_xp,
  completion_percentage,
  enrolled_at,
  rank,
  cohort_size,
  ROUND((1 - (rank::numeric / cohort_size::numeric)) * 100, 1) as cohort_percentile
FROM ranked_cohorts
ORDER BY cohort_month DESC, rank ASC;

COMMENT ON VIEW leaderboard_by_cohort IS 'Cohort-based leaderboard grouping students by enrollment month';

-- ============================================================================
-- WEEKLY XP LEADERS
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard_weekly AS
WITH weekly_xp AS (
  SELECT
    xt.user_id,
    up.full_name,
    up.avatar_url,
    DATE_TRUNC('week', xt.created_at) as week_start,
    TO_CHAR(DATE_TRUNC('week', xt.created_at), 'Mon DD, YYYY') as week_label,
    SUM(xt.amount) as weekly_xp
  FROM xp_transactions xt
  JOIN user_profiles up ON up.id = xt.user_id
  WHERE up.leaderboard_visible = true
    AND xt.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
  GROUP BY xt.user_id, up.full_name, up.avatar_url, DATE_TRUNC('week', xt.created_at)
),
ranked_weekly AS (
  SELECT
    week_start,
    week_label,
    user_id,
    full_name,
    avatar_url,
    weekly_xp,
    RANK() OVER (PARTITION BY week_start ORDER BY weekly_xp DESC) as rank,
    COUNT(*) OVER (PARTITION BY week_start) as participants
  FROM weekly_xp
  WHERE weekly_xp > 0
)
SELECT
  week_start,
  week_label,
  user_id,
  full_name,
  avatar_url,
  weekly_xp,
  rank,
  participants,
  -- Is current week?
  CASE WHEN week_start = DATE_TRUNC('week', CURRENT_DATE) THEN true ELSE false END as is_current_week
FROM ranked_weekly
ORDER BY week_start DESC, rank ASC;

COMMENT ON VIEW leaderboard_weekly IS 'Weekly XP leaders for past 12 weeks';

-- ============================================================================
-- ALL-TIME LEADERS (TOP 100)
-- ============================================================================

CREATE OR REPLACE VIEW leaderboard_all_time AS
WITH all_time_stats AS (
  SELECT
    up.id as user_id,
    up.full_name,
    up.avatar_url,
    up.created_at as joined_at,
    uxp.total_xp,
    -- Calculate level from XP (1000 XP per level)
    FLOOR(uxp.total_xp / 1000)::INTEGER + 1 as level,
    -- Calculate level name
    CASE
      WHEN uxp.total_xp < 1000 THEN 'Beginner'
      WHEN uxp.total_xp < 5000 THEN 'Intermediate'
      WHEN uxp.total_xp < 10000 THEN 'Advanced'
      WHEN uxp.total_xp < 25000 THEN 'Expert'
      ELSE 'Master'
    END as level_name,
    -- Count achievements
    (SELECT COUNT(*) FROM user_badges WHERE user_id = up.id) as badge_count,
    -- Count courses completed
    (SELECT COUNT(*) FROM student_enrollments WHERE user_id = up.id AND status = 'completed') as courses_completed,
    -- Days active
    (CURRENT_DATE - up.created_at::date)::numeric as days_active
  FROM user_profiles up
  JOIN user_xp_totals uxp ON uxp.user_id = up.id
  WHERE up.leaderboard_visible = true
    AND uxp.total_xp > 0
),
ranked_all_time AS (
  SELECT
    user_id,
    full_name,
    avatar_url,
    joined_at,
    total_xp,
    level,
    level_name,
    badge_count,
    courses_completed,
    days_active,
    RANK() OVER (ORDER BY total_xp DESC) as rank,
    -- Calculate XP per day
    CASE
      WHEN days_active > 0 THEN ROUND(total_xp::numeric / days_active::numeric, 2)
      ELSE 0
    END as avg_xp_per_day
  FROM all_time_stats
)
SELECT
  user_id,
  full_name,
  avatar_url,
  joined_at,
  total_xp,
  level,
  level_name,
  badge_count,
  courses_completed,
  days_active,
  rank,
  avg_xp_per_day
FROM ranked_all_time
WHERE rank <= 100
ORDER BY rank ASC;

COMMENT ON VIEW leaderboard_all_time IS 'Top 100 all-time XP leaders with comprehensive stats';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's current rank in global leaderboard
CREATE OR REPLACE FUNCTION get_user_global_rank(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  total_xp INTEGER,
  percentile NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lg.rank,
    lg.total_xp,
    ROUND((1 - (lg.rank::numeric / total_count.count::numeric)) * 100, 1) as percentile
  FROM leaderboard_global lg
  CROSS JOIN (SELECT COUNT(*) as count FROM leaderboard_global) total_count
  WHERE lg.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's rank in specific course
CREATE OR REPLACE FUNCTION get_user_course_rank(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS TABLE (
  rank BIGINT,
  course_xp INTEGER,
  percentile NUMERIC,
  total_students BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.rank,
    lc.course_xp,
    lc.percentile,
    lc.total_students
  FROM leaderboard_by_course lc
  WHERE lc.user_id = p_user_id
    AND lc.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's rank in their cohort
CREATE OR REPLACE FUNCTION get_user_cohort_rank(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS TABLE (
  rank BIGINT,
  cohort_name TEXT,
  total_xp INTEGER,
  cohort_percentile NUMERIC,
  cohort_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lch.rank,
    lch.cohort_name,
    lch.total_xp,
    lch.cohort_percentile,
    lch.cohort_size
  FROM leaderboard_by_cohort lch
  WHERE lch.user_id = p_user_id
    AND lch.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's weekly performance (current + last 4 weeks)
CREATE OR REPLACE FUNCTION get_user_weekly_performance(p_user_id UUID)
RETURNS TABLE (
  week_label TEXT,
  weekly_xp BIGINT,
  rank BIGINT,
  is_current_week BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lw.week_label,
    lw.weekly_xp,
    lw.rank,
    lw.is_current_week
  FROM leaderboard_weekly lw
  WHERE lw.user_id = p_user_id
    AND lw.week_start >= CURRENT_DATE - INTERVAL '5 weeks'
  ORDER BY lw.week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user's leaderboard visibility (privacy toggle)
CREATE OR REPLACE FUNCTION update_leaderboard_visibility(
  p_user_id UUID,
  p_visible BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET leaderboard_visible = p_visible
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get leaderboard summary for user (all ranks in one call)
CREATE OR REPLACE FUNCTION get_user_leaderboard_summary(p_user_id UUID)
RETURNS TABLE (
  global_rank BIGINT,
  global_percentile NUMERIC,
  total_xp INTEGER,
  weekly_rank BIGINT,
  weekly_xp BIGINT,
  is_all_time_top100 BOOLEAN,
  leaderboard_visible BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lg.rank as global_rank,
    ROUND((1 - (lg.rank::numeric / total.count::numeric)) * 100, 1) as global_percentile,
    lg.total_xp,
    lw.rank as weekly_rank,
    lw.weekly_xp,
    EXISTS(SELECT 1 FROM leaderboard_all_time lat WHERE lat.user_id = p_user_id) as is_all_time_top100,
    up.leaderboard_visible
  FROM user_profiles up
  LEFT JOIN leaderboard_global lg ON lg.user_id = p_user_id
  LEFT JOIN LATERAL (
    SELECT rank, weekly_xp
    FROM leaderboard_weekly
    WHERE user_id = p_user_id
      AND is_current_week = true
    LIMIT 1
  ) lw ON true
  CROSS JOIN (SELECT COUNT(*) as count FROM leaderboard_global) total
  WHERE up.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for leaderboard privacy filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_leaderboard_visible
ON user_profiles(leaderboard_visible)
WHERE leaderboard_visible = true;

-- Index for XP transactions weekly queries
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_week
ON xp_transactions(user_id, created_at);

-- Index for enrollments cohort queries
CREATE INDEX IF NOT EXISTS idx_student_enrollments_enrolled_month
ON student_enrollments(course_id, enrolled_at);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON leaderboard_global TO authenticated;
GRANT SELECT ON leaderboard_by_course TO authenticated;
GRANT SELECT ON leaderboard_by_cohort TO authenticated;
GRANT SELECT ON leaderboard_weekly TO authenticated;
GRANT SELECT ON leaderboard_all_time TO authenticated;

-- Grant EXECUTE on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_global_rank TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_course_rank TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cohort_rank TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_weekly_performance TO authenticated;
GRANT EXECUTE ON FUNCTION update_leaderboard_visibility TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_leaderboard_summary TO authenticated;
