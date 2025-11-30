/**
 * Badge Service
 * ACAD-016
 *
 * Handles badge awarding, progress tracking, and trigger logic
 */

import type {
  BadgeAwardResult,
  BadgeProgress,
  BadgeTriggerType,
  UserBadgeWithDetails,
  BadgeLeaderboardEntry,
} from '@/types/badges';

// SECURITY: These must NEVER be exposed to client-side
// Use non-PUBLIC env vars and verify server-side execution
if (typeof window !== 'undefined') {
  throw new Error('Badge service must only run server-side');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for badge service');
}

// ============================================================================
// BADGE AWARDING
// ============================================================================

/**
 * Check if user has earned any new badges based on trigger
 */
export async function checkAndAwardBadges(
  userId: string,
  triggerType: BadgeTriggerType,
  currentValue: number
): Promise<BadgeAwardResult[]> {
  const sql = `
    SELECT * FROM check_and_award_badge($1, $2, $3)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, triggerType, currentValue],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to check badges: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to check badges');
  }

  return result.data?.map((row: unknown) => ({
    badgeId: (row as { badge_id: string }).badge_id,
    badgeName: (row as { badge_name: string }).badge_name,
    xpReward: (row as { xp_reward: number }).xp_reward,
    newlyEarned: (row as { newly_earned: boolean }).newly_earned,
  })) || [];
}

/**
 * Manually award a badge to a user (admin function)
 */
export async function awardBadgeManual(
  userId: string,
  badgeSlug: string
): Promise<string> {
  const sql = `
    SELECT award_badge_manual($1, $2) as badge_id
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, badgeSlug],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to award badge: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to award badge');
  }

  return result.data[0]?.badge_id;
}

// ============================================================================
// BADGE PROGRESS
// ============================================================================

/**
 * Increment progress toward badges of a trigger type
 */
export async function incrementBadgeProgress(
  userId: string,
  triggerType: BadgeTriggerType,
  increment: number = 1
): Promise<number> {
  const sql = `
    SELECT increment_badge_progress($1, $2, $3) as new_value
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, triggerType, increment],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to increment progress: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to increment progress');
  }

  return result.data[0]?.new_value || increment;
}

/**
 * Get user's progress toward unearned badges
 */
export async function getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
  const sql = `
    SELECT * FROM get_badge_progress($1)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get progress: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get progress');
  }

  return result.data?.map((row: unknown) => ({
    badgeId: (row as { badge_id: string }).badge_id,
    slug: (row as { slug: string }).slug,
    name: (row as { name: string }).name,
    description: (row as { description: string }).description,
    iconUrl: (row as { icon_url: string | null }).icon_url,
    rarity: (row as { rarity: string }).rarity,
    triggerType: (row as { trigger_type: string }).trigger_type,
    currentValue: (row as { current_value: number }).current_value,
    targetValue: (row as { target_value: number }).target_value,
    percentage: (row as { percentage: number }).percentage,
  })) || [];
}

/**
 * Get next achievable badges for a user
 */
export async function getNextBadges(userId: string, limit: number = 5): Promise<BadgeProgress[]> {
  const sql = `
    SELECT * FROM get_next_badges($1, $2)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, limit],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get next badges: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get next badges');
  }

  return result.data?.map((row: unknown) => ({
    badgeId: (row as { badge_id: string }).badge_id,
    slug: (row as { slug: string }).slug,
    name: (row as { name: string }).name,
    description: (row as { description: string }).description,
    iconUrl: (row as { icon_url: string | null }).icon_url,
    rarity: (row as { rarity: string }).rarity,
    currentValue: (row as { current_value: number }).current_value,
    targetValue: (row as { target_value: number }).target_value,
    percentage: (row as { percentage: number }).percentage,
  })) || [];
}

// ============================================================================
// USER BADGES
// ============================================================================

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<UserBadgeWithDetails[]> {
  const sql = `
    SELECT * FROM get_user_badges($1)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get user badges: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get user badges');
  }

  return result.data?.map((row: unknown) => ({
    id: (row as { badge_id: string }).badge_id,
    userId,
    badgeId: (row as { badge_id: string }).badge_id,
    earnedAt: (row as { earned_at: string }).earned_at,
    progressValue: 0,
    isNew: (row as { is_new: boolean }).is_new,
    viewedAt: (row as { viewed_at: string | null }).viewed_at,
    sharedAt: (row as { shared_at: string | null }).shared_at,
    shareCount: (row as { share_count: number }).share_count,
    badge: {
      id: (row as { badge_id: string }).badge_id,
      slug: (row as { slug: string }).slug,
      name: (row as { name: string }).name,
      description: (row as { description: string }).description,
      iconUrl: (row as { icon_url: string | null }).icon_url,
      rarity: (row as { rarity: string }).rarity,
      xpReward: (row as { xp_reward: number }).xp_reward,
      displayOrder: 0,
      isHidden: false,
      triggerType: 'achievement_hunter' as BadgeTriggerType,
      triggerThreshold: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })) || [];
}

/**
 * Mark badge as viewed (dismisses "NEW" indicator)
 */
export async function markBadgeViewed(userId: string, badgeId: string): Promise<void> {
  const sql = `
    SELECT mark_badge_viewed($1, $2)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, badgeId],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark badge viewed: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to mark badge viewed');
  }
}

/**
 * Share a badge and increment share count
 */
export async function shareBadge(userId: string, badgeId: string): Promise<void> {
  const sql = `
    SELECT share_badge($1, $2)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [userId, badgeId],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to share badge: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to share badge');
  }
}

// ============================================================================
// LEADERBOARDS
// ============================================================================

/**
 * Get top badge collectors
 */
export async function getBadgeLeaderboard(limit: number = 10): Promise<BadgeLeaderboardEntry[]> {
  const sql = `
    SELECT * FROM get_badge_leaderboard_top($1)
  `;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      sql,
      params: [limit],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get leaderboard: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to get leaderboard');
  }

  return result.data?.map((row: unknown) => ({
    userId: (row as { user_id: string }).user_id,
    fullName: (row as { full_name: string }).full_name,
    avatarUrl: (row as { avatar_url: string | null }).avatar_url,
    badgeCount: (row as { badge_count: number }).badge_count,
    rarityScore: (row as { rarity_score: number }).rarity_score,
    badgeXpEarned: (row as { badge_xp_earned: number }).badge_xp_earned,
    recentBadges: (row as { recent_badges: unknown[] }).recent_badges || [],
  })) || [];
}

// ============================================================================
// TRIGGER HELPERS
// ============================================================================

/**
 * Process a trigger event and award badges if conditions are met
 * This is the main entry point for awarding badges automatically
 */
export async function processTriggerEvent(
  userId: string,
  triggerType: BadgeTriggerType,
  currentValue: number
): Promise<BadgeAwardResult[]> {
  // Increment progress for this trigger type
  await incrementBadgeProgress(userId, triggerType, 1);

  // Check if any badges should be awarded
  const newBadges = await checkAndAwardBadges(userId, triggerType, currentValue);

  return newBadges;
}
