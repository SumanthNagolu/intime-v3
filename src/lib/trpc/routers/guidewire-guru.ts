/**
 * Guidewire Guru tRPC Router
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Routes: Student questions, resume generation, project planning, interview prep
 *
 * @module lib/trpc/routers/guidewire-guru
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { CoordinatorAgent } from '@/lib/ai/agents/guru/CoordinatorAgent';
import { ResumeBuilderAgent } from '@/lib/ai/agents/guru/ResumeBuilderAgent';
import { ProjectPlannerAgent } from '@/lib/ai/agents/guru/ProjectPlannerAgent';
import { InterviewCoachAgent } from '@/lib/ai/agents/guru/InterviewCoachAgent';
import { TRPCError } from '@trpc/server';

/**
 * Guidewire Guru Router
 *
 * Provides AI-powered training assistance for Guidewire students.
 */
export const guidewireGuruRouter = router({
  /**
   * Ask Guidewire Guru a question (routes to appropriate agent)
   */
  ask: protectedProcedure
    .input(
      z.object({
        question: z.string().min(10, 'Question must be at least 10 characters').max(2000),
        conversationId: z.string().uuid().optional(),
        currentModule: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        const coordinator = new CoordinatorAgent({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
          enableCostTracking: true,
          enableMemory: true,
          enableRAG: true,
        });

        const result = await coordinator.execute({
          question: input.question,
          studentId: ctx.userId,
          conversationId: input.conversationId,
          currentModule: input.currentModule,
        });

        return {
          success: true,
          data: {
            answer: result.answer,
            agentUsed: result.agentUsed,
            conversationId: result.conversationId,
            escalated: result.escalated,
            tokensUsed: result.tokensUsed,
            cost: result.cost,
            classification: result.classification,
          },
        };
      } catch (error) {
        console.error('[guidewireGuruRouter] ask error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to process question',
        });
      }
    }),

  /**
   * Generate resume (AI-GURU-003)
   */
  generateResume: protectedProcedure
    .input(
      z.object({
        targetRole: z.string().optional(),
        format: z.enum(['pdf', 'docx', 'linkedin', 'json']).default('json'),
        targetJobDescription: z.string().optional(),
        includeProjects: z.boolean().default(true),
        includeCertifications: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        const resumeBuilder = new ResumeBuilderAgent({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
          enableCostTracking: true,
        });

        const result = await resumeBuilder.execute({
          studentId: ctx.userId,
          format: input.format,
          targetJobDescription: input.targetJobDescription,
          includeProjects: input.includeProjects,
          includeCertifications: input.includeCertifications,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('[guidewireGuruRouter] generateResume error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to generate resume',
        });
      }
    }),

  /**
   * Create project plan (AI-GURU-004)
   */
  createProjectPlan: protectedProcedure
    .input(
      z.object({
        projectType: z.string().default('Capstone Project'),
        guidewireModule: z.string(),
        skillLevel: z.number().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        const projectPlanner = new ProjectPlannerAgent({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
          enableCostTracking: true,
        });

        const result = await projectPlanner.execute({
          studentId: ctx.userId,
          projectType: input.projectType,
          guidewireModule: input.guidewireModule,
          skillLevel: input.skillLevel,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('[guidewireGuruRouter] createProjectPlan error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to create project plan',
        });
      }
    }),

  /**
   * Mock interview session (AI-GURU-005)
   */
  mockInterview: protectedProcedure
    .input(
      z.object({
        interviewType: z.enum(['behavioral', 'technical', 'mixed']).default('behavioral'),
        guidewireModule: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        const interviewCoach = new InterviewCoachAgent({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
          enableCostTracking: true,
        });

        const result = await interviewCoach.execute({
          studentId: ctx.userId,
          interviewType: input.interviewType,
          guidewireModule: input.guidewireModule,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('[guidewireGuruRouter] mockInterview error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to start interview',
        });
      }
    }),

  /**
   * Get interaction history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        agentType: z
          .enum(['code_mentor', 'resume_builder', 'project_planner', 'interview_coach', 'coordinator'])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        let query = ctx.supabase
          .from('guru_interactions')
          .select('*')
          .eq('student_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(input.limit);

        if (input.agentType) {
          query = query.eq('agent_type', input.agentType);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          success: true,
          data: data || [],
        };
      } catch (error) {
        console.error('[guidewireGuruRouter] getHistory error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to get history',
        });
      }
    }),

  /**
   * Provide feedback (thumbs up/down)
   */
  provideFeedback: protectedProcedure
    .input(
      z.object({
        interactionId: z.string().uuid(),
        helpful: z.boolean(),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found',
        });
      }

      try {
        const { error } = await ctx.supabase
          .from('guru_interactions')
          .update({
            helpful: input.helpful,
            user_feedback: input.feedback,
          })
          .eq('id', input.interactionId)
          .eq('student_id', ctx.userId); // Security: only update own interactions

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('[guidewireGuruRouter] provideFeedback error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to provide feedback',
        });
      }
    }),

  /**
   * Get student stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User ID not found',
      });
    }

    try {
      // Get interaction count by agent type
      const { data: interactions, error: interactionsError } = await ctx.supabase
        .from('guru_interactions')
        .select('agent_type')
        .eq('student_id', ctx.userId);

      if (interactionsError) throw interactionsError;

      const stats = {
        totalInteractions: interactions?.length || 0,
        byAgent: {
          code_mentor: interactions?.filter((i) => i.agent_type === 'code_mentor').length || 0,
          resume_builder: interactions?.filter((i) => i.agent_type === 'resume_builder').length || 0,
          project_planner: interactions?.filter((i) => i.agent_type === 'project_planner').length || 0,
          interview_coach: interactions?.filter((i) => i.agent_type === 'interview_coach').length || 0,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('[guidewireGuruRouter] getStats error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get stats',
      });
    }
  }),
});
