/**
 * Resume Matching tRPC Router
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 5)
 * Story: AI-MATCH-001 - Resume Matching
 *
 * Semantic candidate-job matching using pgvector.
 *
 * @module lib/trpc/routers/resume-matching
 */

import { z } from 'zod';
import { router, protectedProcedure, hasPermission } from '../trpc';
import { ResumeMatchingService } from '@/lib/ai/resume-matching';
import { TRPCError } from '@trpc/server';

/**
 * Resume Matching Router
 *
 * Provides semantic candidate search and matching for recruiters.
 * All operations require 'recruiter' role.
 */
export const resumeMatchingRouter = router({
  /**
   * Find matching candidates for a job requisition
   */
  findMatches: hasPermission('candidates', 'read')
    .input(
      z.object({
        requisitionId: z.string().uuid(),
        candidateSources: z
          .array(z.enum(['academy', 'external', 'bench']))
          .default(['academy', 'external', 'bench']),
        topK: z.number().min(1).max(50).default(10),
        matchThreshold: z.number().min(0).max(1).default(0.70),
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
        const matchingService = new ResumeMatchingService({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
        });

        const result = await matchingService.findMatches({
          requisitionId: input.requisitionId,
          candidateSources: input.candidateSources,
          topK: input.topK,
          matchThreshold: input.matchThreshold,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] findMatches error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to find matches',
        });
      }
    }),

  /**
   * Index a candidate for semantic search
   */
  indexCandidate: hasPermission('candidates', 'write')
    .input(
      z.object({
        candidateId: z.string().uuid(),
        resumeText: z.string().min(100),
        skills: z.array(z.string()).min(1),
        experienceLevel: z.enum(['entry', 'mid', 'senior']),
        availability: z.enum(['immediate', '2-weeks', '1-month']),
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
        const matchingService = new ResumeMatchingService({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
        });

        const embeddingId = await matchingService.indexCandidate({
          candidateId: input.candidateId,
          resumeText: input.resumeText,
          skills: input.skills,
          experienceLevel: input.experienceLevel,
          availability: input.availability,
        });

        return {
          success: true,
          data: {
            embeddingId,
            indexed: true,
          },
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] indexCandidate error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to index candidate',
        });
      }
    }),

  /**
   * Batch index multiple candidates
   */
  batchIndexCandidates: hasPermission('candidates', 'write')
    .input(
      z.object({
        candidates: z
          .array(
            z.object({
              candidateId: z.string().uuid(),
              resumeText: z.string().min(100),
              skills: z.array(z.string()).min(1),
              experienceLevel: z.enum(['entry', 'mid', 'senior']),
              availability: z.enum(['immediate', '2-weeks', '1-month']),
            })
          )
          .min(1)
          .max(100), // Max 100 candidates per batch
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
        const matchingService = new ResumeMatchingService({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
        });

        const results = await Promise.all(
          input.candidates.map(async (candidate) => {
            try {
              const embeddingId = await matchingService.indexCandidate(candidate);
              return {
                candidateId: candidate.candidateId,
                success: true,
                embeddingId,
              };
            } catch (error) {
              console.error(
                `[resumeMatchingRouter] Failed to index candidate ${candidate.candidateId}:`,
                error
              );
              return {
                candidateId: candidate.candidateId,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        const successCount = results.filter((r) => r.success).length;

        return {
          success: true,
          data: {
            total: input.candidates.length,
            successful: successCount,
            failed: input.candidates.length - successCount,
            results,
          },
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] batchIndexCandidates error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to batch index candidates',
        });
      }
    }),

  /**
   * Index a job requisition for semantic search
   */
  indexRequisition: hasPermission('jobs', 'write')
    .input(
      z.object({
        requisitionId: z.string().uuid(),
        description: z.string().min(100),
        requiredSkills: z.array(z.string()).min(1),
        niceToHaveSkills: z.array(z.string()).optional(),
        experienceLevel: z.enum(['entry', 'mid', 'senior']),
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
        const matchingService = new ResumeMatchingService({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
        });

        const embeddingId = await matchingService.indexRequisition({
          requisitionId: input.requisitionId,
          description: input.description,
          requiredSkills: input.requiredSkills,
          niceToHaveSkills: input.niceToHaveSkills,
          experienceLevel: input.experienceLevel,
        });

        return {
          success: true,
          data: {
            embeddingId,
            indexed: true,
          },
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] indexRequisition error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to index requisition',
        });
      }
    }),

  /**
   * Provide feedback on a match
   */
  provideFeedback: hasPermission('candidates', 'write')
    .input(
      z.object({
        matchId: z.string().uuid(),
        isRelevant: z.boolean(),
        feedback: z.string().optional(),
        submitted: z.boolean().optional(),
        interviewScheduled: z.boolean().optional(),
        placementAchieved: z.boolean().optional(),
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
        const updateData: any = {
          is_relevant: input.isRelevant,
          recruiter_feedback: input.feedback,
        };

        if (input.submitted !== undefined) {
          updateData.submitted = input.submitted;
        }

        if (input.interviewScheduled !== undefined) {
          updateData.interview_scheduled = input.interviewScheduled;
        }

        if (input.placementAchieved !== undefined) {
          updateData.placement_achieved = input.placementAchieved;
        }

        const { error } = await ctx.supabase
          .from('resume_matches')
          .update(updateData)
          .eq('id', input.matchId)
          .eq('org_id', ctx.orgId || 'default'); // Security: only update own org matches

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error('[resumeMatchingRouter] provideFeedback error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to provide feedback',
        });
      }
    }),

  /**
   * Get matching accuracy metrics
   */
  getAccuracy: hasPermission('candidates', 'read')
    .input(
      z.object({
        startDate: z.date().optional(),
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
        const matchingService = new ResumeMatchingService({
          orgId: ctx.orgId || 'default',
          userId: ctx.userId,
        });

        const accuracy = await matchingService.getAccuracy(input.startDate);

        return {
          success: true,
          data: accuracy,
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] getAccuracy error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to get accuracy',
        });
      }
    }),

  /**
   * Get match history for a requisition
   */
  getMatchHistory: hasPermission('candidates', 'read')
    .input(
      z.object({
        requisitionId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
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
        const { data, error } = await ctx.supabase
          .from('resume_matches')
          .select('*')
          .eq('requisition_id', input.requisitionId)
          .eq('org_id', ctx.orgId || 'default')
          .order('match_score', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return {
          success: true,
          data: data || [],
        };
      } catch (error) {
        console.error('[resumeMatchingRouter] getMatchHistory error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to get match history',
        });
      }
    }),

  /**
   * Get placement stats
   */
  getPlacementStats: hasPermission('candidates', 'read').query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User ID not found',
      });
    }

    try {
      const { data, error } = await ctx.supabase
        .from('resume_matches')
        .select('match_score, placement_achieved, interview_scheduled, submitted')
        .eq('org_id', ctx.orgId || 'default');

      if (error) throw error;

      const stats = {
        totalMatches: data?.length || 0,
        submitted: data?.filter((m) => m.submitted).length || 0,
        interviewScheduled: data?.filter((m) => m.interview_scheduled).length || 0,
        placements: data?.filter((m) => m.placement_achieved).length || 0,
        avgMatchScore: data?.length
          ? Math.round(
              data.reduce((sum, m) => sum + (m.match_score || 0), 0) / data.length
            )
          : 0,
        conversionRate: {
          submissionToInterview:
            data?.filter((m) => m.submitted).length || 0 > 0
              ? Math.round(
                  ((data?.filter((m) => m.interview_scheduled).length || 0) /
                    (data?.filter((m) => m.submitted).length || 0)) *
                    100
                )
              : 0,
          interviewToPlacement:
            data?.filter((m) => m.interview_scheduled).length || 0 > 0
              ? Math.round(
                  ((data?.filter((m) => m.placement_achieved).length || 0) /
                    (data?.filter((m) => m.interview_scheduled).length || 0)) *
                    100
                )
              : 0,
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('[resumeMatchingRouter] getPlacementStats error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to get stats',
      });
    }
  }),
});
