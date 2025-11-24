/**
 * Badge/Achievement System Types
 * ACAD-016
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const BadgeRarity = z.enum(['common', 'rare', 'epic', 'legendary']);
export type BadgeRarity = z.infer<typeof BadgeRarity>;

export const BadgeTriggerType = z.enum([
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
  'achievement_hunter',
]);
export type BadgeTriggerType = z.infer<typeof BadgeTriggerType>;

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export const BadgeSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().nullable(),
  xpReward: z.number().int().min(0),
  rarity: BadgeRarity,
  displayOrder: z.number().int(),
  isHidden: z.boolean(),
  triggerType: BadgeTriggerType,
  triggerThreshold: z.number().int().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Badge = z.infer<typeof BadgeSchema>;

// ============================================================================
// USER BADGES
// ============================================================================

export const UserBadgeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  earnedAt: z.string().datetime(),
  progressValue: z.number().int(),
  isNew: z.boolean(),
  viewedAt: z.string().datetime().nullable(),
  sharedAt: z.string().datetime().nullable(),
  shareCount: z.number().int(),
});

export type UserBadge = z.infer<typeof UserBadgeSchema>;

export const UserBadgeWithDetailsSchema = UserBadgeSchema.extend({
  badge: BadgeSchema,
});

export type UserBadgeWithDetails = z.infer<typeof UserBadgeWithDetailsSchema>;

// ============================================================================
// BADGE PROGRESS
// ============================================================================

export const BadgeProgressSchema = z.object({
  badgeId: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().nullable(),
  rarity: BadgeRarity,
  triggerType: BadgeTriggerType,
  currentValue: z.number().int(),
  targetValue: z.number().int(),
  percentage: z.number(),
});

export type BadgeProgress = z.infer<typeof BadgeProgressSchema>;

// ============================================================================
// BADGE STATISTICS
// ============================================================================

export interface BadgeStats {
  totalBadges: number;
  commonBadges: number;
  rareBadges: number;
  epicBadges: number;
  legendaryBadges: number;
  completionPercentage: number;
  totalXpEarned: number;
  newBadgesCount: number;
  lastBadgeEarnedAt: string | null;
}

export interface BadgeLeaderboardEntry {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  badgeCount: number;
  rarityScore: number;
  badgeXpEarned: number;
  recentBadges: Array<{
    badgeId: string;
    name: string;
    rarity: BadgeRarity;
    earnedAt: string;
  }>;
}

export interface BadgeCompletionStats {
  badgeId: string;
  badgeName: string;
  rarity: BadgeRarity;
  triggerType: BadgeTriggerType;
  totalEarned: number;
  uniqueEarners: number;
  completionPercentage: number;
  firstEarnedAt: string | null;
  lastEarnedAt: string | null;
  totalShares: number;
}

// ============================================================================
// API INPUT/OUTPUT TYPES
// ============================================================================

export const CheckBadgeAwardInputSchema = z.object({
  userId: z.string().uuid(),
  triggerType: BadgeTriggerType,
  currentValue: z.number().int().min(0),
});

export type CheckBadgeAwardInput = z.infer<typeof CheckBadgeAwardInputSchema>;

export const AwardBadgeManualInputSchema = z.object({
  userId: z.string().uuid(),
  badgeSlug: z.string(),
});

export type AwardBadgeManualInput = z.infer<typeof AwardBadgeManualInputSchema>;

export const MarkBadgeViewedInputSchema = z.object({
  badgeId: z.string().uuid(),
});

export type MarkBadgeViewedInput = z.infer<typeof MarkBadgeViewedInputSchema>;

export const ShareBadgeInputSchema = z.object({
  badgeId: z.string().uuid(),
  platform: z.enum(['linkedin', 'twitter', 'facebook', 'clipboard']),
});

export type ShareBadgeInput = z.infer<typeof ShareBadgeInputSchema>;

export interface BadgeAwardResult {
  badgeId: string;
  badgeName: string;
  xpReward: number;
  newlyEarned: boolean;
}

export interface BadgeUnlockAnimation {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string | null;
  rarity: BadgeRarity;
  xpReward: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getRarityColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400';
    case 'epic':
      return 'text-purple-600 dark:text-purple-400';
    case 'legendary':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function getRarityBgColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800';
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900/20';
    case 'epic':
      return 'bg-purple-100 dark:bg-purple-900/20';
    case 'legendary':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
}

export function getRarityBorderColor(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':
      return 'border-gray-300 dark:border-gray-700';
    case 'rare':
      return 'border-blue-300 dark:border-blue-700';
    case 'epic':
      return 'border-purple-300 dark:border-purple-700';
    case 'legendary':
      return 'border-yellow-300 dark:border-yellow-700';
    default:
      return 'border-gray-300 dark:border-gray-700';
  }
}

export function calculateRarityScore(rarity: BadgeRarity): number {
  switch (rarity) {
    case 'legendary':
      return 4;
    case 'epic':
      return 3;
    case 'rare':
      return 2;
    case 'common':
      return 1;
    default:
      return 0;
  }
}

export function formatBadgeProgress(current: number, target: number): string {
  return `${current}/${target}`;
}

export function calculateProgressPercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function isProgressComplete(current: number, target: number): boolean {
  return current >= target;
}

// Badge sharing URLs
export function getBadgeShareUrl(badge: Badge, platform: ShareBadgeInput['platform']): string {
  const text = `I just earned the "${badge.name}" badge! 🏆`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/badges/${badge.slug}`;

  switch (platform) {
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case 'clipboard':
      return url;
    default:
      return url;
  }
}

// Badge icon fallback
export function getBadgeIconFallback(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'legendary':
      return '👑';
    case 'epic':
      return '💎';
    case 'rare':
      return '⭐';
    case 'common':
      return '🏅';
    default:
      return '🏆';
  }
}
