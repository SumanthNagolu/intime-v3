/**
 * Badge Router
 * ACAD-016
 *
 * tRPC endpoints for badge/achievement system
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import {
  checkAndAwardBadges,
  awardBadgeManual,
  getUserBadges,
  getBadgeProgress,
  getNextBadges,
  markBadgeViewed,
  shareBadge,
  getBadgeLeaderboard,
  processTriggerEvent,
} from '@/lib/badges/badge-service';
import {
  BadgeTriggerType,
  CheckBadgeAwardInputSchema,
  AwardBadgeManualInputSchema,
  MarkBadgeViewedInputSchema,
  ShareBadgeInputSchema,
} from '@/types/badges';

export const badgeRouter = router({
  // ============================================================================
  // GET USER BADGES
  // ============================================================================

  /**
   * Get all badges earned by the current user
   */
  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    return await getUserBadges(ctx.userId);
  }),

  /**
   * Get badges earned by a specific user (public)
   */
  getUserBadges: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await getUserBadges(input.userId);
    }),

  // ============================================================================
  // BADGE PROGRESS
  // ============================================================================

  /**
   * Get current user's progress toward unearned badges
   */
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    return await getBadgeProgress(ctx.userId);
  }),

  /**
   * Get next achievable badges for current user
   */
  getNextBadges: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      return await getNextBadges(ctx.userId, input.limit);
    }),

  // ============================================================================
  // BADGE INTERACTIONS
  // ============================================================================

  /**
   * Mark a badge as viewed (dismiss "NEW" indicator)
   */
  markViewed: protectedProcedure
    .input(MarkBadgeViewedInputSchema)
    .mutation(async ({ ctx, input }) => {
      await markBadgeViewed(ctx.userId, input.badgeId);
      return { success: true };
    }),

  /**
   * Share a badge on social media
   */
  shareBadge: protectedProcedure
    .input(ShareBadgeInputSchema)
    .mutation(async ({ ctx, input }) => {
      await shareBadge(ctx.userId, input.badgeId);
      return { success: true, platform: input.platform };
    }),

  // ============================================================================
  // LEADERBOARDS
  // ============================================================================

  /**
   * Get badge leaderboard (top collectors)
   */
  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      return await getBadgeLeaderboard(input.limit);
    }),

  // ============================================================================
  // ADMIN FUNCTIONS
  // ============================================================================

  /**
   * Manually award a badge to a user (admin only)
   * SECURITY: Requires admin role
   */
  awardBadge: adminProcedure
    .input(AwardBadgeManualInputSchema)
    .mutation(async ({ ctx, input }) => {
      const badgeId = await awardBadgeManual(input.userId, input.badgeSlug);
      return { success: true, badgeId };
    }),

  /**
   * Trigger badge check manually (admin only - for testing/debugging)
   * SECURITY: Requires admin role to prevent abuse
   */
  checkTrigger: adminProcedure
    .input(CheckBadgeAwardInputSchema)
    .mutation(async ({ input }) => {
      const newBadges = await checkAndAwardBadges(
        input.userId,
        input.triggerType,
        input.currentValue
      );
      return { success: true, newBadges };
    }),

  // ============================================================================
  // INTERNAL TRIGGER PROCESSING
  // ============================================================================

  /**
   * Process a trigger event (called by other services)
   * This is the main entry point for automatic badge awarding
   */
  processTrigger: protectedProcedure
    .input(
      z.object({
        triggerType: BadgeTriggerType,
        currentValue: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newBadges = await processTriggerEvent(
        ctx.userId,
        input.triggerType,
        input.currentValue
      );

      return {
        success: true,
        newBadges,
        count: newBadges.length,
      };
    }),
});
