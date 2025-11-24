/**
 * Create Badge Database Functions
 * ACAD-016
 */

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const functions = [
  {
    name: 'check_and_award_badge',
    sql: `
CREATE OR REPLACE FUNCTION check_and_award_badge(
  p_user_id UUID,
  p_trigger_type TEXT,
  p_current_value INTEGER
) RETURNS TABLE (
  badge_id UUID,
  badge_name TEXT,
  xp_reward INTEGER,
  newly_earned BOOLEAN
) AS $$
DECLARE
  v_badge RECORD;
  v_already_earned BOOLEAN;
BEGIN
  -- Find matching badges that user doesn't have yet
  FOR v_badge IN
    SELECT b.id, b.name, b.xp_reward, b.trigger_threshold
    FROM badges b
    WHERE b.trigger_type = p_trigger_type
    AND p_current_value >= b.trigger_threshold
    AND NOT EXISTS (
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id
      AND ub.badge_id = b.id
    )
    ORDER BY b.trigger_threshold ASC
  LOOP
    -- Award the badge
    INSERT INTO user_badges (user_id, badge_id, progress_value)
    VALUES (p_user_id, v_badge.id, p_current_value)
    ON CONFLICT (user_id, badge_id) DO NOTHING
    RETURNING true INTO v_already_earned;

    IF v_already_earned IS NOT NULL THEN
      -- Return the newly earned badge
      badge_id := v_badge.id;
      badge_name := v_badge.name;
      xp_reward := v_badge.xp_reward;
      newly_earned := true;
      RETURN NEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'award_badge_manual',
    sql: `
CREATE OR REPLACE FUNCTION award_badge_manual(
  p_user_id UUID,
  p_badge_slug TEXT
) RETURNS UUID AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  -- Get badge ID from slug
  SELECT id INTO v_badge_id
  FROM badges
  WHERE slug = p_badge_slug;

  IF v_badge_id IS NULL THEN
    RAISE EXCEPTION 'Badge not found: %', p_badge_slug;
  END IF;

  -- Award badge (if not already earned)
  INSERT INTO user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN v_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'mark_badge_viewed',
    sql: `
CREATE OR REPLACE FUNCTION mark_badge_viewed(
  p_user_id UUID,
  p_badge_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE user_badges
  SET
    viewed_at = NOW(),
    is_new = false
  WHERE user_id = p_user_id
  AND badge_id = p_badge_id
  AND viewed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'increment_badge_progress',
    sql: `
CREATE OR REPLACE FUNCTION increment_badge_progress(
  p_user_id UUID,
  p_trigger_type TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
  v_new_value INTEGER;
BEGIN
  -- Update or create progress for all badges of this trigger type
  UPDATE badge_progress
  SET
    current_value = current_value + p_increment,
    last_updated = NOW()
  WHERE user_id = p_user_id
  AND badge_id IN (
    SELECT id FROM badges WHERE trigger_type = p_trigger_type
  );

  -- Get the new max value for this trigger type
  SELECT MAX(current_value) INTO v_new_value
  FROM badge_progress
  WHERE user_id = p_user_id
  AND badge_id IN (
    SELECT id FROM badges WHERE trigger_type = p_trigger_type
  );

  RETURN COALESCE(v_new_value, p_increment);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_user_badges',
    sql: `
CREATE OR REPLACE FUNCTION get_user_badges(
  p_user_id UUID
) RETURNS TABLE (
  badge_id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  icon_url TEXT,
  rarity TEXT,
  xp_reward INTEGER,
  earned_at TIMESTAMPTZ,
  is_new BOOLEAN,
  share_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as badge_id,
    b.slug,
    b.name,
    b.description,
    b.icon_url,
    b.rarity,
    b.xp_reward,
    ub.earned_at,
    ub.is_new,
    ub.share_count
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  WHERE ub.user_id = p_user_id
  ORDER BY ub.earned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_badge_progress',
    sql: `
CREATE OR REPLACE FUNCTION get_badge_progress(
  p_user_id UUID
) RETURNS TABLE (
  badge_id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  icon_url TEXT,
  rarity TEXT,
  trigger_type TEXT,
  current_value INTEGER,
  target_value INTEGER,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as badge_id,
    b.slug,
    b.name,
    b.description,
    b.icon_url,
    b.rarity,
    b.trigger_type,
    COALESCE(bp.current_value, 0) as current_value,
    b.trigger_threshold as target_value,
    (COALESCE(bp.current_value, 0)::NUMERIC / NULLIF(b.trigger_threshold, 0) * 100) as percentage
  FROM badges b
  LEFT JOIN badge_progress bp ON bp.badge_id = b.id AND bp.user_id = p_user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = p_user_id
    AND ub.badge_id = b.id
  )
  AND (b.is_hidden = false OR bp.current_value > 0)
  ORDER BY percentage DESC, b.display_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'share_badge',
    sql: `
CREATE OR REPLACE FUNCTION share_badge(
  p_user_id UUID,
  p_badge_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE user_badges
  SET
    shared_at = NOW(),
    share_count = share_count + 1
  WHERE user_id = p_user_id
  AND badge_id = p_badge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_next_badges',
    sql: `
CREATE OR REPLACE FUNCTION get_next_badges(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
  badge_id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  icon_url TEXT,
  rarity TEXT,
  current_value INTEGER,
  target_value INTEGER,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as badge_id,
    b.slug,
    b.name,
    b.description,
    b.icon_url,
    b.rarity,
    COALESCE(bp.current_value, 0) as current_value,
    b.trigger_threshold as target_value,
    (COALESCE(bp.current_value, 0)::NUMERIC / NULLIF(b.trigger_threshold, 0) * 100) as percentage
  FROM badges b
  LEFT JOIN badge_progress bp ON bp.badge_id = b.id AND bp.user_id = p_user_id
  WHERE NOT EXISTS (
    SELECT 1 FROM user_badges ub
    WHERE ub.user_id = p_user_id
    AND ub.badge_id = b.id
  )
  AND b.is_hidden = false
  ORDER BY percentage DESC, b.trigger_threshold ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
  {
    name: 'get_badge_leaderboard_top',
    sql: `
CREATE OR REPLACE FUNCTION get_badge_leaderboard_top(
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  badge_count BIGINT,
  rarity_score BIGINT,
  badge_xp_earned BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM badge_leaderboard
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  },
];

async function deployFunction(name: string, sql: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`  ✅ ${name}`);
      return true;
    } else {
      console.error(`  ❌ ${name}:`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ ${name}:`, error);
    return false;
  }
}

async function deployAllFunctions() {
  console.log('📦 Deploying Badge database functions...\n');

  let successCount = 0;

  for (const func of functions) {
    const success = await deployFunction(func.name, func.sql);
    if (success) successCount++;
  }

  console.log(`\n✅ Deployed ${successCount}/${functions.length} functions successfully\n`);

  if (successCount < functions.length) {
    process.exit(1);
  }
}

deployAllFunctions();
