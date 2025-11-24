-- Optimize Badge Leaderboard
-- Created: 2025-11-21
-- Description: Use CTE to filter top 100 users first, then aggregate (much faster)

-- ============================================================================
-- OPTIMIZED BADGE LEADERBOARD VIEW
-- ============================================================================

CREATE OR REPLACE VIEW badge_leaderboard AS
WITH top_users AS (
  -- First, get top 100 users by badge count (fast, no JSON aggregation yet)
  SELECT
    u.id,
    u.full_name,
    u.avatar_url,
    COUNT(ub.id) as badge_count,
    SUM(
      CASE b.rarity
        WHEN 'legendary' THEN 4
        WHEN 'epic' THEN 3
        WHEN 'rare' THEN 2
        WHEN 'common' THEN 1
        ELSE 0
      END
    ) as rarity_score,
    SUM(b.xp_reward) as badge_xp_earned
  FROM user_profiles u
  LEFT JOIN user_badges ub ON ub.user_id = u.id
  LEFT JOIN badges b ON b.id = ub.badge_id
  GROUP BY u.id, u.full_name, u.avatar_url
  ORDER BY badge_count DESC, rarity_score DESC
  LIMIT 100
)
-- Now aggregate recent badges only for top 100 users
SELECT
  tu.id as user_id,
  tu.full_name,
  tu.avatar_url,
  tu.badge_count,
  tu.rarity_score,
  tu.badge_xp_earned,
  -- Only build JSON for top 100 users (huge performance gain!)
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'badge_id', b.id,
        'name', b.name,
        'rarity', b.rarity,
        'earned_at', ub.earned_at
      ) ORDER BY ub.earned_at DESC
    ) FILTER (WHERE ub.id IS NOT NULL),
    '[]'::jsonb
  ) as recent_badges
FROM top_users tu
LEFT JOIN user_badges ub ON ub.user_id = tu.id
LEFT JOIN badges b ON b.id = ub.badge_id
GROUP BY tu.id, tu.full_name, tu.avatar_url, tu.badge_count, tu.rarity_score, tu.badge_xp_earned
ORDER BY tu.badge_count DESC, tu.rarity_score DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON VIEW badge_leaderboard IS 'Top 100 badge collectors (optimized with CTE to filter first, then aggregate)';
