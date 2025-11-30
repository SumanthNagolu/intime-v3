/**
 * Progress Tracking tRPC Router
 * Story: ACAD-003
 *
 * Endpoints for:
 * - Completing topics
 * - Tracking progress
 * - XP transactions
 * - Leaderboards
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@/lib/supabase/server';
import {
  TopicCompletion,
  XPTransaction,
  StudentProgressSummary,
  LeaderboardEntry,
  XPBreakdown,
} from '@/types/progress';

export const progressRouter = router({
  /**
   * Complete a topic and award XP
   */
  completeTopic: protectedProcedure
    .input(
      z.object({
        enrollment_id: z.string().uuid(),
        topic_id: z.string().uuid(),
        time_spent_seconds: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Call database function to complete topic
      const { data: completionId, error } = await supabase.rpc('complete_topic', {
        p_user_id: ctx.userId,
        p_enrollment_id: input.enrollment_id,
        p_topic_id: input.topic_id,
        p_time_spent_seconds: input.time_spent_seconds,
      });

      if (error) {
        throw new Error(`Failed to complete topic: ${error.message}`);
      }

      // Get updated progress
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('completion_percentage')
        .eq('id', input.enrollment_id)
        .single();

      // Get total XP
      const { data: totalXP } = await supabase.rpc('get_user_total_xp', {
        p_user_id: ctx.userId,
      });

      // Get newly unlocked topics
      const enrollmentData = await supabase
        .from('student_enrollments')
        .select('course_id')
        .eq('id', input.enrollment_id)
        .single();

      const { data: topics } = await supabase
        .from('module_topics')
        .select('id, prerequisite_topic_ids')
        .eq('course_id', enrollmentData.data?.course_id ?? '');

      const unlockedTopics: string[] = [];
      if (topics) {
        for (const topic of topics) {
          const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
            p_user_id: ctx.userId,
            p_topic_id: topic.id,
          });
          if (isUnlocked) {
            unlockedTopics.push(topic.id);
          }
        }
      }

      return {
        completion_id: completionId,
        xp_earned: 10, // This should come from the completion record
        total_xp: totalXP || 0,
        new_completion_percentage: enrollment?.completion_percentage || 0,
        unlocked_topics: unlockedTopics,
      };
    }),

  /**
   * Get progress summary for an enrollment
   */
  getProgress: protectedProcedure
    .input(
      z.object({
        enrollment_id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get enrollment details
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('student_enrollments')
        .select(
          `
          id,
          user_id,
          course_id,
          completion_percentage,
          current_module_id,
          current_topic_id,
          course:courses(total_topics)
        `
        )
        .eq('id', input.enrollment_id)
        .eq('user_id', ctx.userId)
        .single();

      if (enrollmentError || !enrollment) {
        throw new Error('Enrollment not found');
      }

      // Get completed topics count
      const { count: completedTopics } = await supabase
        .from('topic_completions')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_id', input.enrollment_id);

      // Get total XP earned in this course
      const { data: xpTransactions } = await supabase
        .from('xp_transactions')
        .select('amount')
        .eq('user_id', ctx.userId)
        .in(
          'reference_id',
          (
            await supabase
              .from('topic_completions')
              .select('id')
              .eq('enrollment_id', input.enrollment_id)
          ).data?.map((c) => c.id) || []
        );

      const totalXP = xpTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get unlocked and locked topics
      // Get module IDs for the course
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', enrollment.course_id);

      const moduleIds = modules?.map((m) => m.id) || [];

      const { data: allTopics } = await supabase
        .from('module_topics')
        .select('id')
        .in('module_id', moduleIds);

      const unlockedTopics: string[] = [];
      const lockedTopics: string[] = [];

      if (allTopics) {
        for (const topic of allTopics) {
          const { data: isUnlocked } = await supabase.rpc('is_topic_unlocked', {
            p_user_id: ctx.userId,
            p_topic_id: topic.id,
          });
          if (isUnlocked) {
            unlockedTopics.push(topic.id);
          } else {
            lockedTopics.push(topic.id);
          }
        }
      }

      const summary: StudentProgressSummary = {
        enrollment_id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        total_topics: (enrollment.course as any)?.total_topics || 0,
        completed_topics: completedTopics || 0,
        completion_percentage: enrollment.completion_percentage ?? 0,
        total_xp_earned: totalXP,
        current_module_id: enrollment.current_module_id,
        current_topic_id: enrollment.current_topic_id,
        unlocked_topics: unlockedTopics,
        locked_topics: lockedTopics,
      };

      return summary;
    }),

  /**
   * Get user's XP history
   */
  getXPHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get transactions
      const { data: transactions, error } = await supabase
        .from('xp_transactions')
        .select(
          `
          *,
          user:user_profiles!user_id(id, full_name, email),
          awarded_by_user:user_profiles!awarded_by(id, full_name)
        `
        )
        .eq('user_id', ctx.userId)
        .order('awarded_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch XP history: ${error.message}`);
      }

      // Calculate breakdown
      const breakdown: XPBreakdown = {
        topics: 0,
        quizzes: 0,
        labs: 0,
        projects: 0,
        bonuses: 0,
        adjustments: 0,
        total: 0,
      };

      transactions?.forEach((t) => {
        const amount = t.amount;
        breakdown.total += amount;

        switch (t.transaction_type) {
          case 'topic_completion':
            breakdown.topics += amount;
            break;
          case 'quiz_passed':
            breakdown.quizzes += amount;
            break;
          case 'lab_completed':
            breakdown.labs += amount;
            break;
          case 'project_submitted':
            breakdown.projects += amount;
            break;
          case 'bonus_achievement':
            breakdown.bonuses += amount;
            break;
          case 'adjustment':
          case 'penalty':
            breakdown.adjustments += amount;
            break;
        }
      });

      // Get total XP
      const { data: totalXP } = await supabase.rpc('get_user_total_xp', {
        p_user_id: ctx.userId,
      });

      return {
        transactions: transactions || [],
        breakdown,
        total_xp: totalXP || 0,
      };
    }),

  /**
   * Get leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(10),
        course_id: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Query materialized view with user profiles
      const { data: leaderboard, error } = await supabase
        .from('user_xp_totals')
        .select(
          `
          user_id,
          total_xp,
          transaction_count,
          last_xp_earned_at,
          leaderboard_rank,
          profile:user_profiles!user_id(id, full_name, email, avatar_url)
        `
        )
        .order('total_xp', { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
      }

      // Get current user's rank
      const { data: userRank } = await supabase
        .from('user_xp_totals')
        .select('leaderboard_rank')
        .eq('user_id', ctx.userId)
        .single();

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('user_xp_totals')
        .select('*', { count: 'exact', head: true });

      const entries: LeaderboardEntry[] =
        leaderboard?.map((entry: any) => ({
          rank: entry.leaderboard_rank,
          user_id: entry.user_id,
          full_name: entry.profile?.full_name || 'Unknown',
          email: entry.profile?.email || '',
          avatar_url: entry.profile?.avatar_url || null,
          total_xp: entry.total_xp,
          transaction_count: entry.transaction_count,
          last_xp_earned_at: entry.last_xp_earned_at,
        })) || [];

      return {
        entries,
        user_rank: userRank?.leaderboard_rank || null,
        total_users: totalUsers || 0,
      };
    }),

  /**
   * Get topic completions for an enrollment
   */
  getTopicCompletions: protectedProcedure
    .input(
      z.object({
        enrollment_id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data: completions, error } = await supabase
        .from('topic_completions')
        .select(
          `
          *,
          course:courses(id, title, slug),
          module:course_modules(id, title, module_number),
          topic:module_topics(id, title, topic_number, content_type)
        `
        )
        .eq('enrollment_id', input.enrollment_id)
        .eq('user_id', ctx.userId)
        .order('completed_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch completions: ${error.message}`);
      }

      return completions || [];
    }),

  /**
   * Check if a topic is unlocked
   */
  checkTopicUnlocked: protectedProcedure
    .input(
      z.object({
        topic_id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data: isUnlocked, error } = await supabase.rpc('is_topic_unlocked', {
        p_user_id: ctx.userId,
        p_topic_id: input.topic_id,
      });

      if (error) {
        throw new Error(`Failed to check topic unlock status: ${error.message}`);
      }

      // Get prerequisite topics
      const { data: topic } = await supabase
        .from('module_topics')
        .select('prerequisite_topic_ids')
        .eq('id', input.topic_id)
        .single();

      // Check if completed
      const { data: completion } = await supabase
        .from('topic_completions')
        .select('id')
        .eq('user_id', ctx.userId)
        .eq('topic_id', input.topic_id)
        .maybeSingle();

      return {
        topic_id: input.topic_id,
        is_unlocked: isUnlocked || false,
        is_completed: !!completion,
        prerequisite_topics: topic?.prerequisite_topic_ids || [],
        missing_prerequisites: [], // TODO: Calculate missing prerequisites
      };
    }),

  /**
   * Get progress metrics for user
   */
  getProgressMetrics: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    // Get all completions
    const { data: completions } = await supabase
      .from('topic_completions')
      .select('time_spent_seconds, xp_earned')
      .eq('user_id', ctx.userId);

    // Get XP breakdown
    const { data: transactions } = await supabase
      .from('xp_transactions')
      .select('amount, transaction_type')
      .eq('user_id', ctx.userId);

    // Calculate metrics
    const topicsCompleted = completions?.length || 0;
    const totalTimeSpent = completions?.reduce((sum, c) => sum + (c.time_spent_seconds ?? 0), 0) || 0;
    const avgTimePerTopic = topicsCompleted > 0 ? totalTimeSpent / topicsCompleted : 0;

    const xpEarned =
      transactions?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0;
    const quizzesPassed =
      transactions?.filter((t) => t.transaction_type === 'quiz_passed').length || 0;
    const labsCompleted =
      transactions?.filter((t) => t.transaction_type === 'lab_completed').length || 0;
    const projectsSubmitted =
      transactions?.filter((t) => t.transaction_type === 'project_submitted').length || 0;

    // Get overall completion
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('completion_percentage')
      .eq('user_id', ctx.userId);

    const overallCompletion =
      enrollments && enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.completion_percentage ?? 0), 0) / enrollments.length
        : 0;

    return {
      overall_completion: Math.round(overallCompletion),
      xp_earned: xpEarned,
      topics_completed: topicsCompleted,
      quizzes_passed: quizzesPassed,
      labs_completed: labsCompleted,
      projects_submitted: projectsSubmitted,
      avg_time_per_topic: Math.round(avgTimePerTopic),
      total_time_spent: totalTimeSpent,
      current_streak_days: 0, // TODO: Calculate streak
    };
  }),

  // ========================================
  // Graduation Workflow (ACAD-022)
  // ========================================

  /**
   * Check graduation eligibility for an enrollment
   */
  checkGraduationEligibility: protectedProcedure
    .input(
      z.object({
        enrollment_id: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get enrollment with course details
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select(
          `
          *,
          course:courses(id, title, total_topics)
        `
        )
        .eq('id', input.enrollment_id)
        .eq('user_id', ctx.userId)
        .single();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const course = enrollment.course as any;

      // Check if already graduated
      if (enrollment.status === 'completed') {
        return {
          is_eligible: false,
          already_graduated: true,
          completion_percentage: enrollment.completion_percentage,
          capstone_passed: true,
          requirements_met: true,
        };
      }

      // Check completion percentage
      const completionMet = (enrollment.completion_percentage ?? 0) >= 100;

      // Check capstone project (if exists)
      let capstonePassed = true; // Default to true if no capstone

      const { data: capstone } = await supabase
        .from('capstone_submissions')
        .select('status, grade')
        .eq('enrollment_id', input.enrollment_id)
        .eq('student_id', ctx.userId)
        .maybeSingle();

      if (capstone) {
        capstonePassed = capstone.status === 'approved' && (capstone.grade ?? 0) >= 70;
      }

      const isEligible = completionMet && capstonePassed;

      return {
        is_eligible: isEligible,
        already_graduated: false,
        completion_percentage: enrollment.completion_percentage ?? 0,
        capstone_passed: capstonePassed,
        requirements_met: completionMet && capstonePassed,
        capstone_status: capstone?.status || null,
        capstone_grade: capstone?.grade || null,
      };
    }),

  /**
   * Process graduation (checks eligibility and publishes event)
   */
  processGraduation: protectedProcedure
    .input(
      z.object({
        enrollment_id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get enrollment with course details
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select(
          `
          *,
          course:courses(id, title)
        `
        )
        .eq('id', input.enrollment_id)
        .eq('user_id', ctx.userId)
        .single();

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const course = enrollment.course as any;

      // Check if already graduated
      if (enrollment.status === 'completed') {
        throw new Error('Student has already graduated from this course');
      }

      // Verify eligibility
      const completionMet = (enrollment.completion_percentage ?? 0) >= 100;

      // Check capstone
      const { data: capstone } = await supabase
        .from('capstone_submissions')
        .select('status, grade')
        .eq('enrollment_id', input.enrollment_id)
        .eq('student_id', ctx.userId)
        .maybeSingle();

      const capstonePassed = capstone
        ? capstone.status === 'approved' && (capstone.grade ?? 0) >= 70
        : true;

      if (!completionMet || !capstonePassed) {
        throw new Error('Graduation requirements not met');
      }

      // Update enrollment status
      const { error: updateError } = await supabase
        .from('student_enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', input.enrollment_id);

      if (updateError) {
        throw new Error(`Failed to update enrollment: ${updateError.message}`);
      }

      // Publish graduation event
      const { error: eventError } = await supabase.rpc('publish_event', {
        p_event_type: 'course.graduated',
        p_aggregate_id: course.id,
        p_payload: JSON.stringify({
          studentId: ctx.userId,
          enrollmentId: input.enrollment_id,
          courseId: course.id,
          courseName: course.title,
          grade: capstone?.grade || 100,
          completedAt: new Date().toISOString(),
        }),
        p_user_id: ctx.userId,
        p_metadata: JSON.stringify({}),
      });

      if (eventError) {
        console.error('[processGraduation] Failed to publish event:', eventError);
        // Don't throw - graduation is still recorded
      }

      console.log(
        `[processGraduation] Student ${ctx.userId} graduated from ${course.title} (enrollment: ${input.enrollment_id})`
      );

      return {
        success: true,
        enrollment_id: input.enrollment_id,
        course_title: course.title,
        completed_at: new Date().toISOString(),
        grade: capstone?.grade || 100,
      };
    }),

  /**
   * Get graduation analytics
   */
  getGraduationAnalytics: protectedProcedure
    .input(
      z.object({
        course_id: z.string().uuid().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      // Build query
      let query = supabase
        .from('student_enrollments')
        .select(
          `
          *,
          course:courses(id, title, estimated_duration_weeks),
          student:user_profiles!user_id(id, full_name, email)
        `
        )
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (input.course_id) {
        query = query.eq('course_id', input.course_id);
      }

      if (input.date_from) {
        query = query.gte('completed_at', input.date_from);
      }

      if (input.date_to) {
        query = query.lte('completed_at', input.date_to);
      }

      const { data: graduations, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch graduations: ${error.message}`);
      }

      // Calculate analytics
      const totalGraduations = graduations?.length || 0;

      const avgCompletionDays =
        graduations && graduations.length > 0
          ? graduations
            .filter((g) => g.enrolled_at && g.completed_at)
            .map((g) => {
              const start = new Date(g.enrolled_at!);
              const end = new Date(g.completed_at!);
              return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            })
            .reduce((sum, days) => sum + days, 0) / graduations.length
          : 0;

      const avgCompletionPercentage =
        graduations && graduations.length > 0
          ? graduations.reduce((sum, g) => sum + (g.completion_percentage ?? 0), 0) /
          graduations.length
          : 0;

      // Group by month
      const byMonth: Record<string, number> = {};
      graduations?.forEach((g) => {
        if (g.completed_at) {
          const month = g.completed_at.slice(0, 7); // YYYY-MM
          byMonth[month] = (byMonth[month] || 0) + 1;
        }
      });

      return {
        total_graduations: totalGraduations,
        avg_time_to_complete_days: Math.round(avgCompletionDays),
        avg_completion_percentage: Math.round(avgCompletionPercentage),
        graduations_by_month: Object.entries(byMonth).map(([month, count]) => ({
          month,
          count,
        })),
        recent_graduates: graduations?.slice(0, 10) || [],
      };
    }),
});
