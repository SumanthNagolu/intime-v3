/**
 * Badge Trigger Integration
 * ACAD-016
 *
 * Event-based badge awarding system
 * Listens to various events and triggers badge checks
 */

import { processTriggerEvent } from './badge-service';
import type { BadgeTriggerType, BadgeAwardResult } from '@/types/badges';

// ============================================================================
// TRIGGER EVENT HANDLERS
// ============================================================================

/**
 * Called when user watches their first video
 */
export async function onFirstVideoWatched(userId: string): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'first_video', 1);
}

/**
 * Called when user completes their first quiz
 */
export async function onFirstQuizCompleted(userId: string): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'first_quiz', 1);
}

/**
 * Called when user completes their first lab
 */
export async function onFirstLabCompleted(userId: string): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'first_lab', 1);
}

/**
 * Called when user completes a quiz
 * @param streakCount - Current consecutive quiz completion count
 */
export async function onQuizCompleted(
  userId: string,
  streakCount: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'quiz_streak', streakCount);
}

/**
 * Called when user scores 100% on a quiz
 * @param perfectQuizCount - Total number of perfect quizzes
 */
export async function onPerfectQuiz(
  userId: string,
  perfectQuizCount: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'perfect_quiz', perfectQuizCount);
}

/**
 * Called when user completes a lab
 * @param totalLabsCompleted - Total number of labs completed
 */
export async function onLabCompleted(
  userId: string,
  totalLabsCompleted: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'lab_completion', totalLabsCompleted);
}

/**
 * Called when user completes a course
 * @param totalCoursesCompleted - Total number of courses completed
 */
export async function onCourseCompleted(
  userId: string,
  totalCoursesCompleted: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'course_completion', totalCoursesCompleted);
}

/**
 * Called when user uses AI mentor
 * @param totalChatCount - Total number of AI mentor chats
 */
export async function onAIMentorUsed(
  userId: string,
  totalChatCount: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'ai_mentor_usage', totalChatCount);
}

/**
 * Called when user helps another student
 * @param totalHelpsGiven - Total number of times user has helped others
 */
export async function onHelpOthers(
  userId: string,
  totalHelpsGiven: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'help_others', totalHelpsGiven);
}

/**
 * Called when user completes course in top 10% time
 */
export async function onSpeedDemon(userId: string): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'speed_demon', 1);
}

/**
 * Called when user completes lessons late at night
 * @param nightLessonCount - Number of lessons completed between midnight and 5am
 */
export async function onNightOwl(
  userId: string,
  nightLessonCount: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'night_owl', nightLessonCount);
}

/**
 * Called when user completes lessons early in the morning
 * @param earlyLessonCount - Number of lessons completed between 5am and 8am
 */
export async function onEarlyBird(
  userId: string,
  earlyLessonCount: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'early_bird', earlyLessonCount);
}

/**
 * Called when user maintains study streak
 * @param streakDays - Number of consecutive days studied
 */
export async function onConsistency(
  userId: string,
  streakDays: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'consistency', streakDays);
}

/**
 * Called when user earns badges
 * @param totalBadgesEarned - Total number of badges earned
 */
export async function onAchievementHunter(
  userId: string,
  totalBadgesEarned: number
): Promise<BadgeAwardResult[]> {
  return await processTriggerEvent(userId, 'achievement_hunter', totalBadgesEarned);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if badge was awarded (to show unlock animation)
 */
export function wasNewBadgeAwarded(results: BadgeAwardResult[]): boolean {
  return results.some((r) => r.newlyEarned);
}

/**
 * Get total XP earned from badge awards
 */
export function getTotalXPEarned(results: BadgeAwardResult[]): number {
  return results.reduce((sum, r) => sum + (r.newlyEarned ? r.xpReward : 0), 0);
}

/**
 * Format badge award notification message
 */
export function formatBadgeAwardMessage(results: BadgeAwardResult[]): string {
  const newBadges = results.filter((r) => r.newlyEarned);

  if (newBadges.length === 0) {
    return '';
  }

  if (newBadges.length === 1) {
    return `🎉 You earned the "${newBadges[0].badgeName}" badge!`;
  }

  return `🎉 You earned ${newBadges.length} new badges!`;
}

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Integrate with quiz completion handler
 *
 * ```typescript
 * import { onQuizCompleted, onPerfectQuiz } from '@/lib/badges/badge-triggers';
 *
 * async function handleQuizSubmit(userId: string, quizId: string, score: number) {
 *   // ... submit quiz logic ...
 *
 *   // Get user's quiz streak
 *   const streakCount = await getUserQuizStreak(userId);
 *
 *   // Check for quiz streak badges
 *   const streakBadges = await onQuizCompleted(userId, streakCount);
 *
 *   // Check for perfect quiz badges
 *   let perfectBadges = [];
 *   if (score === 100) {
 *     const perfectCount = await getUserPerfectQuizCount(userId);
 *     perfectBadges = await onPerfectQuiz(userId, perfectCount);
 *   }
 *
 *   // Show unlock animation if any badges earned
 *   const allBadges = [...streakBadges, ...perfectBadges];
 *   if (wasNewBadgeAwarded(allBadges)) {
 *     // Show badge unlock modal
 *     showBadgeUnlockModal(allBadges);
 *   }
 * }
 * ```
 */

/**
 * Example: Integrate with video completion handler
 *
 * ```typescript
 * import { onFirstVideoWatched } from '@/lib/badges/badge-triggers';
 *
 * async function handleVideoComplete(userId: string, videoId: string) {
 *   // ... mark video complete ...
 *
 *   // Check if this is user's first video
 *   const videoCount = await getUserVideoCount(userId);
 *   if (videoCount === 1) {
 *     const badges = await onFirstVideoWatched(userId);
 *     if (wasNewBadgeAwarded(badges)) {
 *       showBadgeUnlockModal(badges);
 *     }
 *   }
 * }
 * ```
 */

/**
 * Example: Integrate with course graduation
 *
 * ```typescript
 * import { onCourseCompleted } from '@/lib/badges/badge-triggers';
 *
 * async function handleCourseGraduation(userId: string, courseId: string) {
 *   // ... graduation logic ...
 *
 *   const totalCourses = await getUserCompletedCourseCount(userId);
 *   const badges = await onCourseCompleted(userId, totalCourses);
 *
 *   if (wasNewBadgeAwarded(badges)) {
 *     showBadgeUnlockModal(badges);
 *   }
 * }
 * ```
 */
