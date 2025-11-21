/**
 * Quiz Management tRPC Router
 * ACAD-010
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { TRPCError } from '@trpc/server';
import type {
  QuizQuestion,
  QuizSettings,
  QuestionBankItem,
  BulkImportResult,
} from '@/types/quiz';

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const questionTypeSchema = z.enum([
  'multiple_choice_single',
  'multiple_choice_multiple',
  'true_false',
  'code',
]);

const difficultySchema = z.enum(['easy', 'medium', 'hard']);

const createQuestionSchema = z.object({
  topicId: z.string().uuid().nullable(),
  questionText: z.string().min(10),
  questionType: questionTypeSchema,
  options: z.array(z.string()),
  correctAnswers: z.array(z.number().int().min(0)),
  explanation: z.string().nullable().optional(),
  difficulty: difficultySchema.default('medium'),
  points: z.number().int().positive().default(1),
  codeLanguage: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const updateQuestionSchema = z.object({
  questionId: z.string().uuid(),
  questionText: z.string().min(10).optional(),
  questionType: questionTypeSchema.optional(),
  options: z.array(z.string()).optional(),
  correctAnswers: z.array(z.number().int().min(0)).optional(),
  explanation: z.string().nullable().optional(),
  difficulty: difficultySchema.optional(),
  points: z.number().int().positive().optional(),
  codeLanguage: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const questionBankFiltersSchema = z.object({
  topicId: z.string().uuid().optional(),
  questionType: questionTypeSchema.optional(),
  difficulty: difficultySchema.optional(),
  searchText: z.string().optional(),
  includePublic: z.boolean().default(true),
  createdBy: z.string().uuid().optional(),
});

const updateQuizSettingsSchema = z.object({
  topicId: z.string().uuid(),
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  passingThreshold: z.number().int().min(0).max(100).optional(),
  showCorrectAnswers: z.boolean().optional(),
  timeLimitMinutes: z.number().int().positive().nullable().optional(),
  maxAttempts: z.number().int().positive().nullable().optional(),
  allowReview: z.boolean().optional(),
  xpReward: z.number().int().min(0).optional(),
});

const bulkImportSchema = z.object({
  topicId: z.string().uuid(),
  questions: z.array(
    z.object({
      question_text: z.string(),
      question_type: questionTypeSchema,
      options: z.array(z.string()),
      correct_answers: z.array(z.number()),
      explanation: z.string().optional(),
      difficulty: difficultySchema.optional(),
      points: z.number().int().positive().optional(),
      code_language: z.string().optional(),
      is_public: z.boolean().optional(),
    })
  ),
});

// ============================================================================
// ROUTER
// ============================================================================

export const quizRouter = router({
  /**
   * Create a new quiz question
   */
  createQuestion: protectedProcedure
    .input(createQuestionSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('create_quiz_question', {
        p_topic_id: input.topicId || '',
        p_question_text: input.questionText,
        p_question_type: input.questionType,
        p_options: input.options,
        p_correct_answers: input.correctAnswers,
        p_explanation: input.explanation ?? undefined,
        p_difficulty: input.difficulty,
        p_points: input.points,
        p_code_language: input.codeLanguage ?? undefined,
        p_is_public: input.isPublic,
        p_created_by: userId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create question: ${error.message}`,
        });
      }

      return { questionId: data as string };
    }),

  /**
   * Update an existing quiz question
   */
  updateQuestion: protectedProcedure
    .input(updateQuestionSchema)
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('update_quiz_question', {
        p_question_id: input.questionId,
        p_question_text: input.questionText ?? undefined,
        p_question_type: input.questionType ?? undefined,
        p_options: input.options ?? undefined,
        p_correct_answers: input.correctAnswers ?? undefined,
        p_explanation: input.explanation ?? undefined,
        p_difficulty: input.difficulty ?? undefined,
        p_points: input.points ?? undefined,
        p_code_language: input.codeLanguage ?? undefined,
        p_is_public: input.isPublic ?? undefined,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update question: ${error.message}`,
        });
      }

      return { success: data as boolean };
    }),

  /**
   * Delete a quiz question
   */
  deleteQuestion: protectedProcedure
    .input(z.object({ questionId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('delete_quiz_question', {
        p_question_id: input.questionId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete question: ${error.message}`,
        });
      }

      return { success: data as boolean };
    }),

  /**
   * Get question bank with filters
   */
  getQuestionBank: protectedProcedure
    .input(questionBankFiltersSchema)
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_question_bank', {
        p_topic_id: input.topicId ?? undefined,
        p_question_type: input.questionType ?? undefined,
        p_difficulty: input.difficulty ?? undefined,
        p_search_text: input.searchText ?? undefined,
        p_include_public: input.includePublic,
        p_created_by: input.createdBy ?? undefined,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get question bank: ${error.message}`,
        });
      }

      return (data || []) as unknown as QuestionBankItem[];
    }),

  /**
   * Get questions for a specific topic
   */
  getQuestionsByTopic: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', input.topicId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get questions: ${error.message}`,
        });
      }

      return (data || []) as unknown as QuizQuestion[];
    }),

  /**
   * Get quiz questions with randomization (for preview/taking)
   */
  getQuizQuestions: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        randomize: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_quiz_questions', {
        p_topic_id: input.topicId,
        p_randomize: input.randomize,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get quiz questions: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Get quiz settings for a topic
   */
  getQuizSettings: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_or_create_quiz_settings', {
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get quiz settings: ${error.message}`,
        });
      }

      return (data?.[0] as unknown as QuizSettings) || null;
    }),

  /**
   * Update quiz settings
   */
  updateQuizSettings: protectedProcedure
    .input(updateQuizSettingsSchema)
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('update_quiz_settings', {
        p_topic_id: input.topicId,
        p_randomize_questions: input.randomizeQuestions ?? undefined,
        p_randomize_options: input.randomizeOptions ?? undefined,
        p_passing_threshold: input.passingThreshold ?? undefined,
        p_show_correct_answers: input.showCorrectAnswers ?? undefined,
        p_time_limit_minutes: input.timeLimitMinutes ?? undefined,
        p_max_attempts: input.maxAttempts ?? undefined,
        p_allow_review: input.allowReview ?? undefined,
        p_xp_reward: input.xpReward ?? undefined,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update quiz settings: ${error.message}`,
        });
      }

      return { settingsId: data as string };
    }),

  /**
   * Bulk import questions
   */
  bulkImportQuestions: protectedProcedure
    .input(bulkImportSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('bulk_import_quiz_questions', {
        p_topic_id: input.topicId,
        p_questions: input.questions,
        p_created_by: userId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to import questions: ${error.message}`,
        });
      }

      return (data?.[0] || { success: false, imported_count: 0, errors: [] }) as unknown as BulkImportResult;
    }),

  /**
   * Get quiz analytics for a topic
   */
  getQuizAnalytics: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('quiz_analytics')
        .select('*')
        .eq('topic_id', input.topicId)
        .single();

      if (error) {
        // Return empty analytics if no data exists
        if (error.code === 'PGRST116') {
          return null;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get quiz analytics: ${error.message}`,
        });
      }

      return data;
    }),

  /**
   * Get question statistics
   */
  getQuestionStats: protectedProcedure
    .input(z.object({ questionId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('question_bank_stats')
        .select('*')
        .eq('question_id', input.questionId)
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get question stats: ${error.message}`,
        });
      }

      return data;
    }),

  // ============================================================================
  // QUIZ ENGINE ENDPOINTS (ACAD-011)
  // ============================================================================

  /**
   * Start a new quiz attempt
   */
  startQuizAttempt: protectedProcedure
    .input(
      z.object({
        topicId: z.string().uuid(),
        enrollmentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('start_quiz_attempt', {
        p_user_id: userId,
        p_topic_id: input.topicId,
        p_enrollment_id: input.enrollmentId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to start quiz attempt: ${error.message}`,
        });
      }

      return { attemptId: data as string };
    }),

  /**
   * Submit quiz attempt and get results
   */
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        attemptId: z.string().uuid(),
        answers: z.record(z.array(z.number())), // { "question-id": [indices] }
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('submit_quiz_attempt', {
        p_attempt_id: input.attemptId,
        p_answers: input.answers,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to submit quiz: ${error.message}`,
        });
      }

      const result = data?.[0];
      if (!result) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No result returned from quiz submission',
        });
      }

      return {
        attemptId: result.attempt_id,
        score: result.score,
        passed: result.passed,
        correctAnswers: result.correct_answers,
        totalQuestions: result.total_questions,
        xpEarned: result.xp_earned,
        results: result.results,
      };
    }),

  /**
   * Get user's quiz attempts for a topic
   */
  getUserAttempts: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('get_user_quiz_attempts', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get attempts: ${error.message}`,
        });
      }

      return data || [];
    }),

  /**
   * Get best quiz score for user
   */
  getBestScore: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const supabase = createAdminClient();
      const userId = ctx.userId;

      const { data, error } = await supabase.rpc('get_best_quiz_score', {
        p_user_id: userId,
        p_topic_id: input.topicId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get best score: ${error.message}`,
        });
      }

      return data?.[0] || null;
    }),

  /**
   * Get detailed results for a specific attempt
   */
  getAttemptResults: protectedProcedure
    .input(z.object({ attemptId: z.string().uuid() }))
    .query(async ({ input }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('get_quiz_attempt_results', {
        p_attempt_id: input.attemptId,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get attempt results: ${error.message}`,
        });
      }

      return data?.[0] || null;
    }),
});
