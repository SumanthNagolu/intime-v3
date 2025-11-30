/**
 * AI Mentor tRPC Router
 * ACAD-013
 *
 * API endpoints for AI-powered student mentorship
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  askMentor,
  askMentorStream,
  getChatHistory,
  getUserSessions,
  getRateLimitStatus,
} from '@/lib/ai/mentor-service';
import { observable } from '@trpc/server/observable';
import type { MentorStreamChunk } from '@/types/ai-mentor';

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const askMentorSchema = z.object({
  question: z.string().min(10).max(1000),
  topicId: z.string().uuid().optional().nullable(),
  courseId: z.string().uuid().optional().nullable(),
  sessionId: z.string().uuid().optional().nullable(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
});

const rateChatSchema = z.object({
  chatId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

const escalateChatSchema = z.object({
  chatId: z.string().uuid(),
  reason: z.string().min(10),
});

const getChatHistorySchema = z.object({
  sessionId: z.string().uuid(),
  limit: z.number().int().min(1).max(50).default(20),
});

const getUserSessionsSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
});

const getStatisticsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const aiMentorRouter = router({
  /**
   * Ask AI Mentor (Non-streaming)
   */
  askMentor: protectedProcedure.input(askMentorSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId as string;

    const response = await askMentor(userId, {
      question: input.question,
      topicId: input.topicId,
      courseId: input.courseId,
      sessionId: input.sessionId,
      conversationHistory: input.conversationHistory,
    });

    return response;
  }),

  /**
   * Ask AI Mentor (Streaming)
   */
  askMentorStream: protectedProcedure
    .input(askMentorSchema)
    .subscription(({ ctx, input }) => {
      const userId = ctx.userId as string;

      return observable<MentorStreamChunk>((emit) => {
        (async () => {
          try {
            const stream = askMentorStream(userId, {
              question: input.question,
              topicId: input.topicId,
              courseId: input.courseId,
              sessionId: input.sessionId,
              conversationHistory: input.conversationHistory,
            });

            for await (const chunk of stream) {
              emit.next(chunk);
            }

            emit.complete();
          } catch (error) {
            emit.error(error instanceof Error ? error : new Error('Unknown error'));
          }
        })();
      });
    }),

  /**
   * Rate a chat response
   */
  rateChat: protectedProcedure.input(rateChatSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId as string;

    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT rate_ai_chat($1, $2, $3, $4)`;
    const params = [input.chatId, userId, input.rating, input.feedback || null];

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to rate chat');
    }

    return { success: true };
  }),

  /**
   * Escalate chat to trainer
   */
  escalateChat: protectedProcedure.input(escalateChatSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId as string;

    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT escalate_ai_chat($1, $2, $3)`;
    const params = [input.chatId, userId, input.reason];

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to escalate chat');
    }

    return { success: true };
  }),

  /**
   * Get chat history for a session
   */
  getChatHistory: protectedProcedure
    .input(getChatHistorySchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId as string;

      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT * FROM get_ai_chat_history($1, $2, $3)`;
      const params = [userId, input.sessionId, input.limit];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get chat history');
      }

      return result.rows || [];
    }),

  /**
   * Get user's active sessions
   */
  getUserSessions: protectedProcedure
    .input(getUserSessionsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId as string;

      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT * FROM get_user_ai_sessions($1, $2)`;
      const params = [userId, input.limit];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get sessions');
      }

      return result.rows || [];
    }),

  /**
   * Get rate limit status for current user
   */
  getRateLimitStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId as string;

    const status = await getRateLimitStatus(userId);

    return status;
  }),

  /**
   * Get daily statistics (Admin/Trainer only)
   */
  getDailyStats: protectedProcedure
    .input(getStatisticsSchema)
    .query(async ({ ctx, input }) => {
      // TODO: Check if user is admin/trainer

      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `
      SELECT * FROM ai_mentor_daily_stats
      WHERE date >= COALESCE($1::date, CURRENT_DATE - INTERVAL '30 days')
      AND date <= COALESCE($2::date, CURRENT_DATE)
      ORDER BY date DESC
      LIMIT 30
    `;
      const params = [input.startDate || null, input.endDate || null];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get statistics');
      }

      return result.rows || [];
    }),

  /**
   * Get student statistics (Admin/Trainer only)
   */
  getStudentStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is admin/trainer

    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT * FROM ai_mentor_student_stats ORDER BY total_chats DESC LIMIT 100`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get student statistics');
    }

    return result.rows || [];
  }),

  /**
   * Get topic statistics (Admin/Trainer only)
   */
  getTopicStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is admin/trainer

    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT * FROM ai_mentor_topic_stats ORDER BY total_chats DESC LIMIT 50`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get topic statistics');
    }

    return result.rows || [];
  }),

  // ========================================================================
  // ANALYTICS (ACAD-015)
  // ========================================================================

  /**
   * Get quality dashboard metrics
   */
  getQualityMetrics: protectedProcedure
    .input(z.object({ days: z.number().int().min(1).max(90).default(7) }))
    .query(async ({ ctx, input }) => {
      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT * FROM get_quality_dashboard_metrics($1)`;
      const params = [input.days];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql, params }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get quality metrics');
      }

      return result.rows || [];
    }),

  /**
   * Get topic quality analysis
   */
  getTopicQuality: protectedProcedure.query(async ({ ctx }) => {
    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT * FROM ai_mentor_topic_quality ORDER BY total_chats DESC LIMIT 20`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get topic quality');
    }

    return result.rows || [];
  }),

  /**
   * Get prompt variant performance
   */
  getPromptVariantPerformance: protectedProcedure.query(async ({ ctx }) => {
    const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const sql = `SELECT * FROM ai_prompt_variant_performance ORDER BY created_at DESC`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get prompt variant performance');
    }

    return result.rows || [];
  }),

  /**
   * Create prompt variant for A/B testing
   */
  createPromptVariant: protectedProcedure
    .input(
      z.object({
        variantName: z.string(),
        systemPrompt: z.string(),
        trafficPercentage: z.number().int().min(0).max(100).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT create_prompt_variant($1, $2, $3)`;
      const params = [input.variantName, input.systemPrompt, input.trafficPercentage];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql, params }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create prompt variant');
      }

      return { variantId: result.rows[0]?.create_prompt_variant };
    }),

  /**
   * Activate prompt variant
   */
  activatePromptVariant: protectedProcedure
    .input(
      z.object({
        variantId: z.string().uuid(),
        trafficPercentage: z.number().int().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT activate_prompt_variant($1, $2)`;
      const params = [input.variantId, input.trafficPercentage];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql, params }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to activate prompt variant');
      }

      return { success: true };
    }),

  /**
   * Deactivate prompt variant
   */
  deactivatePromptVariant: protectedProcedure
    .input(z.object({ variantId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const sql = `SELECT deactivate_prompt_variant($1)`;
      const params = [input.variantId];

      const response = await fetch(`${SUPABASE_URL}/functions/v1/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ sql, params }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to deactivate prompt variant');
      }

      return { success: true };
    }),
});
