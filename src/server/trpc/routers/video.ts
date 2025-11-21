/**
 * Video Progress tRPC Router
 * ACAD-007
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRPCError } from '@trpc/server';

export const videoRouter = router({
  /**
   * Save video progress
   */
  saveProgress: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
        lastPositionSeconds: z.number().int().min(0),
        videoDurationSeconds: z.number().int().positive(),
        videoUrl: z.string().url(),
        videoProvider: z.enum(['vimeo', 'youtube', 'direct', 's3']),
        watchTimeIncrement: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('save_video_progress', {
        p_user_id: userId,
        p_topic_id: input.topicId,
        p_enrollment_id: input.enrollmentId,
        p_last_position_seconds: input.lastPositionSeconds,
        p_video_duration_seconds: input.videoDurationSeconds,
        p_video_url: input.videoUrl,
        p_video_provider: input.videoProvider,
        p_watch_time_increment: input.watchTimeIncrement,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to save progress: ${error.message}`,
        });
      }

      return { progressId: data };
    }),

  /**
   * Get video progress for a topic
   */
  getProgress: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('get_video_progress', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get progress: ${error.message}`,
        });
      }

      return data?.[0] || null;
    }),

  /**
   * Get user's watch statistics
   */
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createAdminClient();
    const userId = ctx.userId;

    const { data, error } = await supabase.rpc('get_user_watch_stats', {
      p_user_id: userId,
    });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get user stats: ${error.message}`,
      });
    }

    return data?.[0] || null;
  }),

  /**
   * Get watch statistics for a course (admin/trainer)
   */
  getCourseStats: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      // TODO: Add authorization check (admin/trainer only)

      const { data, error } = await supabase.rpc('get_course_watch_stats', {
        p_course_id: input.courseId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get course stats: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Reset video progress (for re-watching)
   */
  resetProgress: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('reset_video_progress', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to reset progress: ${error.message}`,
        });
      }

      return { success: data };
    }),

  /**
   * Get all video progress for a user
   */
  getAllProgress: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createAdminClient();
    const userId = ctx.userId;

    const { data, error } = await supabase
      .from('video_progress')
      .select(
        `
        *,
        topic:module_topics(
          id,
          title,
          topic_number,
          module:course_modules(
            id,
            title,
            course:courses(id, title)
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('last_watched_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get progress: ${error.message}`,
      });
    }

    return data || [];
  }),

  /**
   * Get watch stats for all users in a course (analytics)
   */
  getCourseAnalytics: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      // Get detailed watch stats from view
      const { data, error } = await supabase
        .from('video_watch_stats')
        .select('*')
        .eq('course_title', input.courseId); // Note: This needs to be fixed to filter by course_id

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get analytics: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Get engagement metrics for a video topic
   */
  getTopicEngagement: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('topic_id', input.topicId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get engagement: ${error.message}`,
        });
      }

      // Calculate engagement metrics
      const totalViewers = data?.length || 0;
      const completedViewers =
        data?.filter((p) => (p.completion_percentage ?? 0) >= 90).length || 0;
      const avgCompletionPercentage =
        totalViewers > 0
          ? data.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalViewers
          : 0;
      const totalWatchTimeSeconds = data?.reduce(
        (sum, p) => sum + (p.total_watch_time_seconds || 0),
        0
      );

      return {
        topicId: input.topicId,
        totalViewers,
        completedViewers,
        completionRate: totalViewers > 0 ? (completedViewers / totalViewers) * 100 : 0,
        avgCompletionPercentage: Math.round(avgCompletionPercentage),
        totalWatchTimeHours: Math.round((totalWatchTimeSeconds || 0) / 3600),
      };
    }),
});
