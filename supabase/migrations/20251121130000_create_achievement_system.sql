-- ACAD-016: Achievement System
-- Sprint 3 (Week 9-10)
-- Description: Gamification system with badges, triggers, and rewards

-- ============================================================================
-- BADGE DEFINITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,

  -- Rewards
  xp_reward INTEGER DEFAULT 50 CHECK (xp_reward >= 0),

  -- Rarity and display
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  display_order INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false, -- Hidden until unlocked

  -- Requirements
  trigger_type TEXT NOT NULL CHECK (
    trigger_type IN (
      'first_video',
      'first_quiz',
      'first_lab',
      'quiz_streak',
      'perfect_quiz',
      'lab_completion',
      'course_completion',
      'ai_mentor_usage',
      'help_others',
      'speed_demon',
      'night_owl',
      'early_bird',
      'consistency',
      'achievement_hunter'
    )
  ),
  trigger_threshold INTEGER DEFAULT 1, -- How many to trigger (e.g., 10 quizzes)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_trigger_type ON badges(trigger_type);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- ============================================================================
-- USER BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- Earning details
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress_value INTEGER DEFAULT 0, -- Current progress toward badge
  is_new BOOLEAN DEFAULT true, -- Show "NEW" indicator
  viewed_at TIMESTAMPTZ, -- When user viewed the unlock animation

  -- Sharing
  shared_at TIMESTAMPTZ,
  share_count INTEGER DEFAULT 0,

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned ON user_badges(earned_at DESC);
CREATE INDEX idx_user_badges_new ON user_badges(user_id, is_new) WHERE is_new = true;

-- ============================================================================
-- BADGE PROGRESS TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  current_value INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_badge_progress_user ON badge_progress(user_id);

-- ============================================================================
-- BADGE TRIGGER EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS badge_trigger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badge_trigger_events_user ON badge_trigger_events(user_id);
CREATE INDEX idx_badge_trigger_events_processed ON badge_trigger_events(processed) WHERE processed = false;

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Badge completion stats
CREATE OR REPLACE VIEW badge_completion_stats AS
SELECT
  b.id as badge_id,
  b.name as badge_name,
  b.rarity,
  b.trigger_type,

  COUNT(ub.id) as total_earned,
  COUNT(DISTINCT ub.user_id) as unique_earners,

  -- Calculate percentile (what % of users have this badge)
  (COUNT(DISTINCT ub.user_id)::NUMERIC / NULLIF(
    (SELECT COUNT(DISTINCT user_id) FROM user_badges), 0
  ) * 100) as completion_percentage,

  MIN(ub.earned_at) as first_earned_at,
  MAX(ub.earned_at) as last_earned_at,

  -- Sharing stats
  SUM(ub.share_count) as total_shares
FROM badges b
LEFT JOIN user_badges ub ON ub.badge_id = b.id
GROUP BY b.id, b.name, b.rarity, b.trigger_type
ORDER BY total_earned DESC;

-- User badge progress
CREATE OR REPLACE VIEW user_badge_progress AS
SELECT
  u.id as user_id,
  u.full_name,

  -- Badge counts by rarity
  COUNT(ub.id) FILTER (WHERE b.rarity = 'common') as common_badges,
  COUNT(ub.id) FILTER (WHERE b.rarity = 'rare') as rare_badges,
  COUNT(ub.id) FILTER (WHERE b.rarity = 'epic') as epic_badges,
  COUNT(ub.id) FILTER (WHERE b.rarity = 'legendary') as legendary_badges,

  COUNT(ub.id) as total_badges_earned,
  (SELECT COUNT(*) FROM badges WHERE is_hidden = false) as total_badges_available,

  -- Completion percentage
  (COUNT(ub.id)::NUMERIC / NULLIF(
    (SELECT COUNT(*) FROM badges WHERE is_hidden = false), 0
  ) * 100) as completion_percentage,

  -- Recent activity
  MAX(ub.earned_at) as last_badge_earned_at,
  COUNT(*) FILTER (WHERE ub.is_new = true) as new_badges_count
FROM user_profiles u
LEFT JOIN user_badges ub ON ub.user_id = u.id
LEFT JOIN badges b ON b.id = ub.badge_id
GROUP BY u.id, u.full_name
ORDER BY total_badges_earned DESC;

-- Badge leaderboard
CREATE OR REPLACE VIEW badge_leaderboard AS
SELECT
  u.id as user_id,
  u.full_name,
  u.avatar_url,

  COUNT(ub.id) as badge_count,

  -- Rarity score (legendary = 4 points, epic = 3, rare = 2, common = 1)
  SUM(
    CASE b.rarity
      WHEN 'legendary' THEN 4
      WHEN 'epic' THEN 3
      WHEN 'rare' THEN 2
      WHEN 'common' THEN 1
      ELSE 0
    END
  ) as rarity_score,

  -- Total XP earned from badges
  SUM(b.xp_reward) as badge_xp_earned,

  -- Recent badges (JSON array of last 3)
  jsonb_agg(
    jsonb_build_object(
      'badge_id', b.id,
      'name', b.name,
      'rarity', b.rarity,
      'earned_at', ub.earned_at
    ) ORDER BY ub.earned_at DESC
  ) FILTER (WHERE ub.id IS NOT NULL) as recent_badges
FROM user_profiles u
LEFT JOIN user_badges ub ON ub.user_id = u.id
LEFT JOIN badges b ON b.id = ub.badge_id
GROUP BY u.id, u.full_name, u.avatar_url
ORDER BY badge_count DESC, rarity_score DESC
LIMIT 100;

-- Rare achievement tracking (99th percentile)
CREATE OR REPLACE VIEW rare_achievements AS
SELECT
  b.id as badge_id,
  b.name as badge_name,
  b.rarity,
  COUNT(ub.id) as earner_count,
  (COUNT(DISTINCT ub.user_id)::NUMERIC / NULLIF(
    (SELECT COUNT(DISTINCT user_id) FROM user_badges), 0
  ) * 100) as earner_percentage
FROM badges b
LEFT JOIN user_badges ub ON ub.badge_id = b.id
GROUP BY b.id, b.name, b.rarity
HAVING (COUNT(DISTINCT ub.user_id)::NUMERIC / NULLIF(
  (SELECT COUNT(DISTINCT user_id) FROM user_badges), 0
) * 100) <= 1.0 -- Less than 1% of users have this
ORDER BY earner_percentage ASC;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at on badges
CREATE OR REPLACE FUNCTION update_badge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER badge_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW
  EXECUTE FUNCTION update_badge_updated_at();

-- Auto-create XP transaction when badge is earned
CREATE OR REPLACE FUNCTION award_badge_xp()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_reward INTEGER;
  v_badge_name TEXT;
BEGIN
  -- Get badge details
  SELECT xp_reward, name INTO v_xp_reward, v_badge_name
  FROM badges
  WHERE id = NEW.badge_id;

  -- Create XP transaction
  INSERT INTO xp_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_type,
    reference_id
  ) VALUES (
    NEW.user_id,
    v_xp_reward,
    'badge_earned',
    'Earned badge: ' || v_badge_name,
    'badge',
    NEW.badge_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_badge_xp_trigger
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION award_badge_xp();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_trigger_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-hidden badges
CREATE POLICY badges_select_all ON badges
  FOR SELECT
  USING (is_hidden = false OR auth.uid() IS NOT NULL);

-- Users can view their own earned badges (including hidden ones once earned)
CREATE POLICY user_badges_select_own ON user_badges
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can view their own progress
CREATE POLICY badge_progress_select_own ON badge_progress
  FOR SELECT
  USING (user_id = auth.uid());

-- System can insert badge progress
CREATE POLICY badge_progress_insert_system ON badge_progress
  FOR INSERT
  WITH CHECK (true); -- Handled by service role

-- Users can update viewed_at and shared_at
CREATE POLICY user_badges_update_own ON user_badges
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can create trigger events
CREATE POLICY badge_trigger_events_insert_system ON badge_trigger_events
  FOR INSERT
  WITH CHECK (true); -- Handled by service role

-- Admins can manage badges
CREATE POLICY badges_all_admin ON badges
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE badges IS 'Badge definitions with trigger rules and rewards';
COMMENT ON TABLE user_badges IS 'Tracks which badges users have earned';
COMMENT ON TABLE badge_progress IS 'Tracks progress toward earning badges';
COMMENT ON TABLE badge_trigger_events IS 'Queue of events that may trigger badge awards';
COMMENT ON VIEW badge_completion_stats IS 'Badge earn rates and rarity statistics';
COMMENT ON VIEW user_badge_progress IS 'User badge collection progress';
COMMENT ON VIEW badge_leaderboard IS 'Top badge collectors ranked by count and rarity';
COMMENT ON VIEW rare_achievements IS 'Badges earned by less than 1% of users';
