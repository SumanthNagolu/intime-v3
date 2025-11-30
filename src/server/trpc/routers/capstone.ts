/**
 * Capstone Project tRPC Router
 * ACAD-012
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@/lib/supabase/server';
import type {
  CapstoneSubmissionWithDetails,
  PeerReviewWithReviewer,
  RubricScores,
} from '@/types/capstone';

export const capstoneRouter = router({
  /**
   * Submit a capstone project
   */
  submitCapstone: protectedProcedure
    .input(
      z.object({
        enrollmentId: z.string().uuid(),
        courseId: z.string().uuid(),
        repositoryUrl: z.string().url(),
        demoVideoUrl: z.string().url().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('submit_capstone', {
        p_user_id: ctx.userId,
        p_enrollment_id: input.enrollmentId,
        p_course_id: input.courseId,
        p_repository_url: input.repositoryUrl,
        p_demo_video_url: input.demoVideoUrl ?? null,
        p_description: input.description ?? null,
      });

      if (error) {
        throw new Error(`Failed to submit capstone: ${error.message}`);
      }

      return { submissionId: data as string };
    }),

  /**
   * Submit a peer review
   */
  submitPeerReview: protectedProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        rating: z.number().min(1).max(5),
        comments: z.string().min(10),
        strengths: z.string().optional(),
        improvements: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('submit_peer_review', {
        p_submission_id: input.submissionId,
        p_reviewer_id: ctx.userId,
        p_rating: input.rating,
        p_comments: input.comments,
        p_strengths: input.strengths ?? null,
        p_improvements: input.improvements ?? null,
      });

      if (error) {
        throw new Error(`Failed to submit peer review: ${error.message}`);
      }

      return { reviewId: data as string };
    }),

  /**
   * Grade a capstone submission
   */
  gradeCapstone: protectedProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        grade: z.number().min(0).max(100),
        feedback: z.string().min(10),
        rubricScores: z.record(z.number()).optional(),
        status: z.enum(['passed', 'failed', 'revision_requested']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient();

      // Get submission details for event payload
      const { data: submission } = await supabase
        .from('capstone_submissions')
        .select(
          `
          *,
          student:user_profiles!capstone_submissions_user_id_fkey(full_name, email),
          course:courses(title)
        `
        )
        .eq('id', input.submissionId)
        .single();

      if (!submission) {
        throw new Error('Submission not found');
      }

      // Get grader details
      const { data: grader } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', ctx.userId)
        .single();

      const { data, error } = await (supabase.rpc as any)('grade_capstone', {
        p_submission_id: input.submissionId,
        p_grader_id: ctx.userId,
        p_grade: input.grade,
        p_feedback: input.feedback,
        p_rubric_scores: input.rubricScores || null,
        p_status: input.status,
      });

      if (error) {
        throw new Error(`Failed to grade capstone: ${error.message}`);
      }

      // Publish capstone.graded event (ACAD-026: triggers student notification)
      await (supabase.rpc as any)('publish_event', {
        p_aggregate_id: input.submissionId,
        p_event_type: 'capstone.graded',
        p_payload: {
          submissionId: input.submissionId,
          studentId: submission.user_id,
          studentName: submission.student.full_name,
          studentEmail: submission.student.email,
          courseId: submission.course_id,
          courseName: submission.course.title,
          grade: input.grade,
          feedback: input.feedback,
          status: input.status,
          graderId: ctx.userId,
          graderName: grader?.full_name || 'Unknown Grader',
          gradedAt: new Date().toISOString(),
        },
        p_user_id: submission.user_id,
      });

      return { success: data as boolean };
    }),

  /**
   * Get capstone submissions
   */
  getSubmissions: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        courseId: z.string().uuid().optional(),
        status: z
          .enum([
            'pending',
            'peer_review',
            'trainer_review',
            'passed',
            'failed',
            'revision_requested',
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('get_capstone_submissions', {
        p_user_id: input.userId ?? null,
        p_course_id: input.courseId ?? null,
        p_status: input.status ?? null,
        p_limit: input.limit,
        p_offset: input.offset,
      });

      if (error) {
        throw new Error(`Failed to get submissions: ${error.message}`);
      }

      return (data || []) as unknown as CapstoneSubmissionWithDetails[];
    }),

  /**
   * Get a single submission by ID
   */
  getSubmissionById: protectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('capstone_submissions')
        .select(
          `
          *,
          student:user_profiles!capstone_submissions_user_id_fkey(full_name, email),
          course:courses(title),
          grader:user_profiles!capstone_submissions_graded_by_fkey(full_name)
        `
        )
        .eq('id', input.submissionId)
        .single();

      if (error) {
        throw new Error(`Failed to get submission: ${error.message}`);
      }

      if (!data) {
        throw new Error('Submission not found');
      }

      return {
        id: data.id,
        userId: data.user_id,
        studentName: data.student.full_name,
        studentEmail: data.student.email,
        enrollmentId: data.enrollment_id,
        courseId: data.course_id,
        courseTitle: data.course.title,
        repositoryUrl: data.repository_url,
        demoVideoUrl: data.demo_video_url,
        description: data.description,
        submittedAt: data.submitted_at ? new Date(data.submitted_at) : new Date(),
        revisionCount: data.revision_count,
        status: data.status,
        gradedBy: data.graded_by,
        graderName: data.grader?.full_name || null,
        gradedAt: data.graded_at ? new Date(data.graded_at) : null,
        grade: data.grade,
        feedback: data.feedback,
        rubricScores: data.rubric_scores as RubricScores | null,
        peerReviewCount: data.peer_review_count,
        avgPeerRating: data.avg_peer_rating,
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      } as CapstoneSubmissionWithDetails;
    }),

  /**
   * Get peer reviews for a submission
   */
  getPeerReviews: protectedProcedure
    .input(z.object({ submissionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('get_peer_reviews_for_submission', {
        p_submission_id: input.submissionId,
      });

      if (error) {
        throw new Error(`Failed to get peer reviews: ${error.message}`);
      }

      return (data || []) as unknown as PeerReviewWithReviewer[];
    }),

  /**
   * Get submissions available for peer review
   */
  getSubmissionsForPeerReview: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('get_submissions_for_peer_review', {
        p_reviewer_id: ctx.userId,
        p_course_id: input.courseId,
        p_limit: input.limit,
      });

      if (error) {
        throw new Error(`Failed to get submissions for peer review: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Check graduation eligibility
   */
  checkGraduationEligibility: protectedProcedure
    .input(z.object({ enrollmentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await (supabase.rpc as any)('check_graduation_eligibility', {
        p_enrollment_id: input.enrollmentId,
      });

      if (error) {
        throw new Error(`Failed to check graduation eligibility: ${error.message}`);
      }

      // Also get the enrollment details
      const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('completion_percentage')
        .eq('id', input.enrollmentId)
        .single();

      // Check capstone status
      const { data: capstone } = await supabase
        .from('capstone_submissions')
        .select('status')
        .eq('enrollment_id', input.enrollmentId)
        .eq('status', 'passed')
        .single();

      const completionPercentage = typeof enrollment?.completion_percentage === 'string'
        ? parseFloat(enrollment.completion_percentage)
        : enrollment?.completion_percentage || 0;

      return {
        eligible: data as boolean,
        capstoneCompleted: !!capstone,
        allTopicsCompleted: completionPercentage >= 100,
        completionPercentage,
      };
    }),

  /**
   * Get capstone statistics for a course
   */
  getStatistics: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('capstone_statistics')
        .select('*')
        .eq('course_id', input.courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw new Error(`Failed to get statistics: ${error.message}`);
      }

      return data || null;
    }),

  /**
   * Get grading queue (trainers only)
   */
  getGradingQueue: protectedProcedure.query(async ({ ctx }) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from('capstone_grading_queue').select('*');

    if (error) {
      throw new Error(`Failed to get grading queue: ${error.message}`);
    }

    return data || [];
  }),

  /**
   * Get peer review leaderboard
   */
  getPeerReviewLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('peer_review_leaderboard')
        .select('*')
        .limit(input.limit);

      if (error) {
        throw new Error(`Failed to get peer review leaderboard: ${error.message}`);
      }

      return data || [];
    }),
});
