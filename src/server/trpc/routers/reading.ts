/**
 * Reading Progress tRPC Router
 * ACAD-009
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRPCError } from '@trpc/server';

export const readingRouter = router({
  /**
   * Save reading progress
   */
  saveProgress: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
        scrollPercentage: z.number().int().min(0).max(100),
        lastScrollPosition: z.number().int().min(0),
        readingTimeIncrement: z.number().int().min(0).default(0),
        contentType: z.enum(['markdown', 'pdf', 'html']).default('markdown'),
        contentLength: z.number().int().positive().optional(),
        currentPage: z.number().int().positive().optional(),
        totalPages: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('save_reading_progress', {
        p_user_id: userId,
        p_topic_id: input.topicId,
        p_enrollment_id: input.enrollmentId,
        p_scroll_percentage: input.scrollPercentage,
        p_last_scroll_position: input.lastScrollPosition,
        p_reading_time_increment: input.readingTimeIncrement,
        p_content_type: input.contentType,
        p_content_length: input.contentLength,
        p_current_page: input.currentPage,
        p_total_pages: input.totalPages,
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
   * Get reading progress
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

      const { data, error } = await supabase.rpc('get_reading_progress', {
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
   * Get user reading stats
   */
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createAdminClient();
    const userId = ctx.userId;

    const { data, error } = await supabase.rpc('get_user_reading_stats', {
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
   * Get course reading stats (admin/trainer)
   */
  getCourseStats: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      // TODO: Add authorization check (admin/trainer only)

      const { data, error } = await supabase.rpc('get_course_reading_stats', {
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
   * Reset reading progress
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

      const { data, error } = await supabase.rpc('reset_reading_progress', {
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
   * Get all reading progress for a user
   */
  getAllProgress: protectedProcedure.query(async ({ ctx }) => {
    const supabase = createAdminClient();
    const userId = ctx.userId;

    const { data, error } = await supabase
      .from('reading_progress')
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
      .order('last_read_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get progress: ${error.message}`,
      });
    }

    return data || [];
  }),

  /**
   * Get reading engagement analytics
   */
  getEngagementAnalytics: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('topic_id', input.topicId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get engagement analytics: ${error.message}`,
        });
      }

      // Calculate engagement metrics
      const totalReaders = data?.length || 0;
      const completedReaders = data?.filter((p) => p.scroll_percentage >= 90).length || 0;
      const avgScrollPercentage =
        totalReaders > 0
          ? data.reduce((sum, p) => sum + (p.scroll_percentage || 0), 0) / totalReaders
          : 0;
      const totalReadingTimeSeconds = data?.reduce(
        (sum, p) => sum + (p.total_reading_time_seconds || 0),
        0
      );

      return {
        topicId: input.topicId,
        totalReaders,
        completedReaders,
        completionRate: totalReaders > 0 ? (completedReaders / totalReaders) * 100 : 0,
        avgScrollPercentage: Math.round(avgScrollPercentage),
        totalReadingTimeHours: Math.round((totalReadingTimeSeconds || 0) / 3600),
      };
    }),
});
