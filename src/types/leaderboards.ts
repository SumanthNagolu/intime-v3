/**
 * Leaderboards Type Definitions
 * ACAD-017
 */

import { z } from 'zod';

// ============================================================================
// BASE TYPES
// ============================================================================

export const LeaderboardTypeSchema = z.enum([
  'global',
  'course',
  'cohort',
  'weekly',
  'all_time',
]);

export type LeaderboardType = z.infer<typeof LeaderboardTypeSchema>;

export const LeaderboardPeriodSchema = z.enum([
  'current_week',
  'last_week',
  'last_4_weeks',
  'last_12_weeks',
  'all_time',
]);

export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriodSchema>;

// ============================================================================
// GLOBAL LEADERBOARD
// ============================================================================

export const GlobalLeaderboardEntrySchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  total_xp: z.number().int().min(0),
  level: z.number().int().min(1),
  level_name: z.string(),
  rank: z.number().int().min(1),
  dense_rank: z.number().int().min(1),
  xp_diff_from_above: z.number().int().nullable(),
  xp_to_next_rank: z.number().int().nullable(),
});

export type GlobalLeaderboardEntry = z.infer<typeof GlobalLeaderboardEntrySchema>;

export const GlobalLeaderboardResponseSchema = z.object({
  entries: z.array(GlobalLeaderboardEntrySchema),
  total_count: z.number().int().min(0),
  user_rank: z.number().int().min(1).nullable(),
  user_percentile: z.number().min(0).max(100).nullable(),
});

export type GlobalLeaderboardResponse = z.infer<typeof GlobalLeaderboardResponseSchema>;

// ============================================================================
// COURSE LEADERBOARD
// ============================================================================

export const CourseLeaderboardEntrySchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  user_id: z.string().uuid(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  course_xp: z.number().int().min(0),
  completion_percentage: z.number().min(0).max(100),
  modules_completed: z.number().int().min(0),
  total_modules: z.number().int().min(0),
  rank: z.number().int().min(1),
  total_students: z.number().int().min(0),
  percentile: z.number().min(0).max(100),
});

export type CourseLeaderboardEntry = z.infer<typeof CourseLeaderboardEntrySchema>;

export const CourseLeaderboardResponseSchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  entries: z.array(CourseLeaderboardEntrySchema),
  total_students: z.number().int().min(0),
  user_rank: z.number().int().min(1).nullable(),
  user_percentile: z.number().min(0).max(100).nullable(),
});

export type CourseLeaderboardResponse = z.infer<typeof CourseLeaderboardResponseSchema>;

// ============================================================================
// COHORT LEADERBOARD
// ============================================================================

export const CohortLeaderboardEntrySchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  cohort_month: z.string(), // ISO date string
  cohort_name: z.string(), // e.g., "January 2025"
  user_id: z.string().uuid(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  total_xp: z.number().int().min(0),
  completion_percentage: z.number().min(0).max(100).nullable(),
  enrolled_at: z.string(), // ISO timestamp
  rank: z.number().int().min(1),
  cohort_size: z.number().int().min(0),
  cohort_percentile: z.number().min(0).max(100),
});

export type CohortLeaderboardEntry = z.infer<typeof CohortLeaderboardEntrySchema>;

export const CohortLeaderboardResponseSchema = z.object({
  course_id: z.string().uuid(),
  course_title: z.string(),
  cohort_name: z.string(),
  entries: z.array(CohortLeaderboardEntrySchema),
  cohort_size: z.number().int().min(0),
  user_rank: z.number().int().min(1).nullable(),
  user_percentile: z.number().min(0).max(100).nullable(),
});

export type CohortLeaderboardResponse = z.infer<typeof CohortLeaderboardResponseSchema>;

// ============================================================================
// WEEKLY LEADERBOARD
// ============================================================================

export const WeeklyLeaderboardEntrySchema = z.object({
  week_start: z.string(), // ISO date
  week_label: z.string(), // e.g., "Nov 18, 2025"
  user_id: z.string().uuid(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  weekly_xp: z.number().int().min(0),
  rank: z.number().int().min(1),
  participants: z.number().int().min(0),
  is_current_week: z.boolean(),
});

export type WeeklyLeaderboardEntry = z.infer<typeof WeeklyLeaderboardEntrySchema>;

export const WeeklyLeaderboardResponseSchema = z.object({
  week_label: z.string(),
  is_current_week: z.boolean(),
  entries: z.array(WeeklyLeaderboardEntrySchema),
  total_participants: z.number().int().min(0),
  user_rank: z.number().int().min(1).nullable(),
  user_weekly_xp: z.number().int().min(0).nullable(),
});

export type WeeklyLeaderboardResponse = z.infer<typeof WeeklyLeaderboardResponseSchema>;

// ============================================================================
// ALL-TIME LEADERBOARD
// ============================================================================

export const AllTimeLeaderboardEntrySchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  joined_at: z.string(), // ISO timestamp
  total_xp: z.number().int().min(0),
  level: z.number().int().min(1),
  level_name: z.string(),
  badge_count: z.number().int().min(0),
  courses_completed: z.number().int().min(0),
  days_active: z.number().min(0),
  rank: z.number().int().min(1).max(100),
  avg_xp_per_day: z.number().min(0),
});

export type AllTimeLeaderboardEntry = z.infer<typeof AllTimeLeaderboardEntrySchema>;

export const AllTimeLeaderboardResponseSchema = z.object({
  entries: z.array(AllTimeLeaderboardEntrySchema),
  user_in_top_100: z.boolean(),
  user_rank: z.number().int().min(1).nullable(),
});

export type AllTimeLeaderboardResponse = z.infer<typeof AllTimeLeaderboardResponseSchema>;

// ============================================================================
// USER RANK DETAILS
// ============================================================================

export const UserGlobalRankSchema = z.object({
  rank: z.number().int().min(1),
  total_xp: z.number().int().min(0),
  percentile: z.number().min(0).max(100),
});

export type UserGlobalRank = z.infer<typeof UserGlobalRankSchema>;

export const UserCourseRankSchema = z.object({
  rank: z.number().int().min(1),
  course_xp: z.number().int().min(0),
  percentile: z.number().min(0).max(100),
  total_students: z.number().int().min(0),
});

export type UserCourseRank = z.infer<typeof UserCourseRankSchema>;

export const UserCohortRankSchema = z.object({
  rank: z.number().int().min(1),
  cohort_name: z.string(),
  total_xp: z.number().int().min(0),
  cohort_percentile: z.number().min(0).max(100),
  cohort_size: z.number().int().min(0),
});

export type UserCohortRank = z.infer<typeof UserCohortRankSchema>;

export const UserWeeklyPerformanceSchema = z.object({
  week_label: z.string(),
  weekly_xp: z.number().int().min(0),
  rank: z.number().int().min(1),
  is_current_week: z.boolean(),
});

export type UserWeeklyPerformance = z.infer<typeof UserWeeklyPerformanceSchema>;

export const UserLeaderboardSummarySchema = z.object({
  global_rank: z.number().int().min(1).nullable(),
  global_percentile: z.number().min(0).max(100).nullable(),
  total_xp: z.number().int().min(0).nullable(),
  weekly_rank: z.number().int().min(1).nullable(),
  weekly_xp: z.number().int().min(0).nullable(),
  is_all_time_top100: z.boolean(),
  leaderboard_visible: z.boolean(),
});

export type UserLeaderboardSummary = z.infer<typeof UserLeaderboardSummarySchema>;

// ============================================================================
// INPUT SCHEMAS FOR API
// ============================================================================

export const GetGlobalLeaderboardInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type GetGlobalLeaderboardInput = z.infer<typeof GetGlobalLeaderboardInputSchema>;

export const GetCourseLeaderboardInputSchema = z.object({
  courseId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type GetCourseLeaderboardInput = z.infer<typeof GetCourseLeaderboardInputSchema>;

export const GetCohortLeaderboardInputSchema = z.object({
  courseId: z.string().uuid(),
  cohortMonth: z.string().optional(), // If omitted, use user's cohort
});

export type GetCohortLeaderboardInput = z.infer<typeof GetCohortLeaderboardInputSchema>;

export const GetWeeklyLeaderboardInputSchema = z.object({
  weekOffset: z.number().int().min(0).max(11).default(0), // 0 = current week, 1 = last week, etc.
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetWeeklyLeaderboardInput = z.infer<typeof GetWeeklyLeaderboardInputSchema>;

export const UpdateLeaderboardVisibilityInputSchema = z.object({
  visible: z.boolean(),
});

export type UpdateLeaderboardVisibilityInput = z.infer<typeof UpdateLeaderboardVisibilityInputSchema>;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface LeaderboardFilters {
  type: LeaderboardType;
  courseId?: string;
  cohortMonth?: string;
  period?: LeaderboardPeriod;
  limit?: number;
  offset?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get rank badge display (1st, 2nd, 3rd, or rank number)
 */
export function getRankDisplay(rank: number): string {
  if (rank === 1) return '🥇 1st';
  if (rank === 2) return '🥈 2nd';
  if (rank === 3) return '🥉 3rd';
  return `#${rank}`;
}

/**
 * Get rank badge color class
 */
export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
  if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
  if (rank <= 10) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (rank <= 50) return 'bg-green-100 text-green-800 border-green-300';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

/**
 * Format percentile for display
 */
export function formatPercentile(percentile: number): string {
  return `Top ${(100 - percentile).toFixed(1)}%`;
}

/**
 * Get week label from week offset (0 = current, 1 = last week)
 */
export function getWeekLabel(weekOffset: number): string {
  if (weekOffset === 0) return 'This Week';
  if (weekOffset === 1) return 'Last Week';
  return `${weekOffset} Weeks Ago`;
}

/**
 * Format XP change (positive = gained, negative = lost)
 */
export function formatXpChange(xp: number): string {
  if (xp > 0) return `+${xp.toLocaleString()} XP`;
  if (xp < 0) return `${xp.toLocaleString()} XP`;
  return '0 XP';
}

/**
 * Get leaderboard type display name
 */
export function getLeaderboardTypeName(type: LeaderboardType): string {
  const names: Record<LeaderboardType, string> = {
    global: 'Global Leaderboard',
    course: 'Course Leaderboard',
    cohort: 'Cohort Leaderboard',
    weekly: 'Weekly Leaders',
    all_time: 'All-Time Top 100',
  };
  return names[type];
}

/**
 * Get leaderboard type description
 */
export function getLeaderboardTypeDescription(type: LeaderboardType): string {
  const descriptions: Record<LeaderboardType, string> = {
    global: 'See how you rank against all students across all courses',
    course: 'Compare your progress with other students in the same course',
    cohort: 'Compete with students who started around the same time as you',
    weekly: 'See who earned the most XP this week',
    all_time: 'The legends - top 100 students of all time',
  };
  return descriptions[type];
}

/**
 * Calculate XP needed for specific rank (based on user above)
 */
export function calculateXpToRank(
  currentXp: number,
  targetXp: number | null
): number | null {
  if (targetXp === null) return null;
  const diff = targetXp - currentXp;
  return diff > 0 ? diff : 0;
}

/**
 * Estimate time to reach rank based on avg XP per day
 */
export function estimateDaysToRank(
  xpNeeded: number,
  avgXpPerDay: number
): number | null {
  if (avgXpPerDay <= 0) return null;
  return Math.ceil(xpNeeded / avgXpPerDay);
}

/**
 * Get user avatar with fallback
 */
export function getUserAvatar(
  avatarUrl: string | null,
  fullName: string
): string {
  if (avatarUrl) return avatarUrl;
  // Generate placeholder with initials
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&size=128&bold=true&format=svg&initials=${initials}`;
}
