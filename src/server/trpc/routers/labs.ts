/**
 * Labs tRPC Router
 * ACAD-008
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRPCError } from '@trpc/server';
import {
  provisionLabEnvironment,
  triggerAutoGrading,
  checkRepositoryExists,
  getLatestCommitSha,
  cleanupLabEnvironment,
} from '@/lib/labs/github-provisioning';

export const labsRouter = router({
  /**
   * Start a new lab instance
   */
  startLab: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
        templateUrl: z.string().url(),
        githubUsername: z.string(),
        timeLimitMinutes: z.number().int().positive().default(120),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      // Check for existing active instance
      const { data: existing } = await supabase.rpc('get_active_lab_instance', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (existing && existing.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have an active lab instance for this topic',
        });
      }

      try {
        // Provision lab environment (fork repo)
        const result = await provisionLabEnvironment({
          userId,
          topicId: input.topicId,
          enrollmentId: input.enrollmentId,
          templateUrl: input.templateUrl,
          githubUsername: input.githubUsername,
          timeLimitMinutes: input.timeLimitMinutes,
        });

        // Create lab instance in database
        const { data: instanceId, error } = await supabase.rpc('start_lab_instance', {
          p_user_id: userId,
          p_topic_id: input.topicId,
          p_enrollment_id: input.enrollmentId,
          p_forked_repo_url: result.forkedRepoUrl,
          p_original_template_url: input.templateUrl,
          p_time_limit_minutes: input.timeLimitMinutes,
          p_github_username: input.githubUsername,
        });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to start lab: ${error.message}`,
          });
        }

        return {
          instanceId,
          forkedRepoUrl: result.forkedRepoUrl,
          expiresAt: result.expiresAt,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }
    }),

  /**
   * Get active lab instance
   */
  getActiveLab: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('get_active_lab_instance', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get active lab: ${error.message}`,
        });
      }

      return data?.[0] || null;
    }),

  /**
   * Update lab activity (heartbeat)
   */
  updateActivity: protectedProcedure
    .input(
      z.object({
        instanceId: z.string().uuid(),
        timeIncrementSeconds: z.number().int().min(0).default(0),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('update_lab_activity', {
        p_instance_id: input.instanceId,
        p_time_increment_seconds: input.timeIncrementSeconds,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update activity: ${error.message}`,
        });
      }

      return { success: data };
    }),

  /**
   * Submit lab solution
   */
  submitLab: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
        labInstanceId: z.string().uuid(),
        repositoryUrl: z.string().url(),
        commitSha: z.string().optional(),
        branchName: z.string().default('main'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      // Validate repository exists
      const repoExists = await checkRepositoryExists(input.repositoryUrl);
      if (!repoExists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Repository does not exist or is not accessible',
        });
      }

      // Get latest commit if not provided
      let commitSha = input.commitSha;
      if (!commitSha) {
        commitSha = (await getLatestCommitSha(input.repositoryUrl, input.branchName)) || undefined;
      }

      // Create submission
      const { data: submissionId, error } = await supabase.rpc('submit_lab', {
        p_user_id: userId,
        p_topic_id: input.topicId,
        p_enrollment_id: input.enrollmentId,
        p_lab_instance_id: input.labInstanceId,
        p_repository_url: input.repositoryUrl,
        p_commit_sha: commitSha,
        p_branch_name: input.branchName,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to submit lab: ${error.message}`,
        });
      }

      // Trigger auto-grading if enabled
      // Note: This would be better handled via a webhook or background job
      try {
        await triggerAutoGrading(input.repositoryUrl);
      } catch (error: any) {
        console.error('Failed to trigger auto-grading:', error);
        // Non-critical, continue
      }

      return { submissionId };
    }),

  /**
   * Get submission history
   */
  getSubmissionHistory: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('get_lab_submission_history', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get submission history: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Record auto-grade result (webhook endpoint)
   */
  recordAutoGrade: protectedProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        result: z.object({
          testsPassed: z.number().int(),
          testsFailed: z.number().int(),
          totalTests: z.number().int(),
          coverage: z.number().optional(),
          lintErrors: z.number().optional(),
          buildSuccess: z.boolean().optional(),
          executionTime: z.number().optional(),
          logs: z.array(z.string()).optional(),
        }),
        score: z.number().min(0).max(100),
        passed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('record_auto_grade', {
        p_submission_id: input.submissionId,
        p_auto_grade_result: input.result,
        p_auto_grade_score: input.score,
        p_passed: input.passed,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to record auto-grade: ${error.message}`,
        });
      }

      return { passed: data };
    }),

  /**
   * Record manual grade (trainer/admin)
   */
  recordManualGrade: protectedProcedure
    .input(
      z.object({
        submissionId: z.string().uuid(),
        manualScore: z.number().min(0).max(100),
        rubricScores: z.record(z.number()).optional(),
        feedback: z.string().optional(),
        passed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const graderId = ctx.userId;

      // TODO: Add authorization check (trainer/admin only)

      const { data, error } = await supabase.rpc('record_manual_grade', {
        p_submission_id: input.submissionId,
        p_grader_id: graderId,
        p_manual_score: input.manualScore,
        p_rubric_scores: input.rubricScores,
        p_feedback: input.feedback,
        p_passed: input.passed,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to record manual grade: ${error.message}`,
        });
      }

      return { passed: data };
    }),

  /**
   * Get grading queue (trainer/admin)
   */
  getGradingQueue: protectedProcedure.query(async () => {
    const supabase = createAdminClient();

    // TODO: Add authorization check (trainer/admin only)

    const { data, error } = await supabase.from('grading_queue').select('*');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get grading queue: ${error.message}`,
      });
    }

    return data || [];
  }),

  /**
   * Get lab statistics (admin)
   */
  getLabStatistics: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      // TODO: Add authorization check (admin only)

      let query = supabase.from('lab_statistics').select('*');

      if (input.topicId) {
        query = query.eq('topic_id', input.topicId);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get lab statistics: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Cleanup expired labs (admin/cron job)
   */
  cleanupExpiredLabs: protectedProcedure.mutation(async () => {
    const supabase = createAdminClient();

    // TODO: Add authorization check (admin only)

    const { data: expiredCount, error } = await supabase.rpc('expire_old_lab_instances');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to cleanup labs: ${error.message}`,
      });
    }

    return { expiredCount };
  }),

  /**
   * Delete lab instance (cleanup resources)
   */
  deleteLab: protectedProcedure
    .input(
      z.object({
        instanceId: z.string().uuid(),
        deleteRepo: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      // Get instance details
      const { data: instance } = await supabase
        .from('lab_instances')
        .select('forked_repo_url, user_id')
        .eq('id', input.instanceId)
        .single();

      if (!instance) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Lab instance not found',
        });
      }

      // Verify ownership
      if (instance.user_id !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this lab',
        });
      }

      // Delete forked repo if requested
      if (input.deleteRepo) {
        try {
          await cleanupLabEnvironment(instance.forked_repo_url);
        } catch (error: any) {
          console.error('Failed to delete forked repo:', error);
          // Non-critical, continue with database cleanup
        }
      }

      // Mark as abandoned in database
      const { error } = await supabase
        .from('lab_instances')
        .update({ status: 'abandoned', updated_at: new Date().toISOString() })
        .eq('id', input.instanceId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete lab: ${error.message}`,
        });
      }

      return { success: true };
    }),
});
