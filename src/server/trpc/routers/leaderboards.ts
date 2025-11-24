/**
 * Leaderboards tRPC Router
 * ACAD-017
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  GetGlobalLeaderboardInputSchema,
  GetCourseLeaderboardInputSchema,
  GetCohortLeaderboardInputSchema,
  GetWeeklyLeaderboardInputSchema,
  UpdateLeaderboardVisibilityInputSchema,
} from '@/types/leaderboards';
import {
  getGlobalLeaderboard,
  getCourseLeaderboard,
  getCohortLeaderboard,
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  getUserGlobalRank,
  getUserCourseRank,
  getUserCohortRank,
  getUserWeeklyPerformance,
  getUserLeaderboardSummary,
  updateLeaderboardVisibility,
  getLeaderboardVisibility,
} from '@/lib/leaderboards/leaderboard-service';

export const leaderboardRouter = router({
  // ============================================================================
  // GLOBAL LEADERBOARD
  // ============================================================================

  /**
   * Get global XP leaderboard
   */
  getGlobal: protectedProcedure
    .input(GetGlobalLeaderboardInputSchema)
    .query(async ({ ctx, input }) => {
      return await getGlobalLeaderboard(
        input.limit,
        input.offset,
        ctx.session.user.id
      );
    }),

  /**
   * Get my global rank
   */
  getMyGlobalRank: protectedProcedure.query(async ({ ctx }) => {
    return await getUserGlobalRank(ctx.session.user.id);
  }),

  // ============================================================================
  // COURSE LEADERBOARD
  // ============================================================================

  /**
   * Get course-specific leaderboard
   */
  getByCourse: protectedProcedure
    .input(GetCourseLeaderboardInputSchema)
    .query(async ({ ctx, input }) => {
      return await getCourseLeaderboard(
        input.courseId,
        input.limit,
        input.offset,
        ctx.session.user.id
      );
    }),

  /**
   * Get my rank in a specific course
   */
  getMyCourseRank: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await getUserCourseRank(ctx.session.user.id, input.courseId);
    }),

  // ============================================================================
  // COHORT LEADERBOARD
  // ============================================================================

  /**
   * Get cohort leaderboard (defaults to user's cohort)
   */
  getByCohort: protectedProcedure
    .input(GetCohortLeaderboardInputSchema)
    .query(async ({ ctx, input }) => {
      return await getCohortLeaderboard(
        input.courseId,
        ctx.session.user.id,
        input.cohortMonth
      );
    }),

  /**
   * Get my cohort rank
   */
  getMyCohortRank: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await getUserCohortRank(ctx.session.user.id, input.courseId);
    }),

  // ============================================================================
  // WEEKLY LEADERBOARD
  // ============================================================================

  /**
   * Get weekly XP leaders
   */
  getWeekly: protectedProcedure
    .input(GetWeeklyLeaderboardInputSchema)
    .query(async ({ ctx, input }) => {
      return await getWeeklyLeaderboard(
        input.weekOffset,
        input.limit,
        ctx.session.user.id
      );
    }),

  /**
   * Get my weekly performance (current + last 4 weeks)
   */
  getMyWeeklyPerformance: protectedProcedure.query(async ({ ctx }) => {
    return await getUserWeeklyPerformance(ctx.session.user.id);
  }),

  // ============================================================================
  // ALL-TIME LEADERBOARD
  // ============================================================================

  /**
   * Get all-time top 100 leaders
   */
  getAllTime: protectedProcedure.query(async ({ ctx }) => {
    return await getAllTimeLeaderboard(ctx.session.user.id);
  }),

  // ============================================================================
  // USER SUMMARY
  // ============================================================================

  /**
   * Get comprehensive leaderboard summary for current user
   */
  getMySummary: protectedProcedure.query(async ({ ctx }) => {
    return await getUserLeaderboardSummary(ctx.session.user.id);
  }),

  // ============================================================================
  // PRIVACY SETTINGS
  // ============================================================================

  /**
   * Update leaderboard visibility (opt-in/opt-out)
   */
  updateVisibility: protectedProcedure
    .input(UpdateLeaderboardVisibilityInputSchema)
    .mutation(async ({ ctx, input }) => {
      await updateLeaderboardVisibility(ctx.session.user.id, input.visible);
      return { success: true };
    }),

  /**
   * Get current visibility setting
   */
  getMyVisibility: protectedProcedure.query(async ({ ctx }) => {
    const visible = await getLeaderboardVisibility(ctx.session.user.id);
    return { visible };
  }),
});
