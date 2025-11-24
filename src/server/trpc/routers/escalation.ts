/**
 * Escalation tRPC Router
 * ACAD-014
 *
 * API endpoints for escalation management
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

const SUPABASE_URL = 'https://gkwhxmvugnjwwwiufmdy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const createEscalationSchema = z.object({
  chatId: z.string().uuid(),
  topicId: z.string().uuid().nullable(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  autoDetected: z.boolean(),
  triggers: z.record(z.boolean()),
  metadata: z.record(z.any()),
});

const assignEscalationSchema = z.object({
  escalationId: z.string().uuid(),
  trainerId: z.string().uuid(),
});

const addResponseSchema = z.object({
  escalationId: z.string().uuid(),
  message: z.string().min(10),
  isInternalNote: z.boolean().default(false),
});

const resolveEscalationSchema = z.object({
  escalationId: z.string().uuid(),
  resolutionNotes: z.string().min(10),
});

const dismissEscalationSchema = z.object({
  escalationId: z.string().uuid(),
  dismissalReason: z.string().min(10),
});

// ============================================================================
// ROUTER
// ============================================================================

export const escalationRouter = router({
  /**
   * Create new escalation
   */
  createEscalation: protectedProcedure
    .input(createEscalationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const sql = `SELECT create_escalation($1, $2, $3, $4, $5, $6, $7, $8)`;
      const params = [
        input.chatId,
        userId,
        input.topicId,
        input.reason,
        input.confidence,
        input.autoDetected,
        JSON.stringify(input.triggers),
        JSON.stringify(input.metadata),
      ];

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
        throw new Error(result.error || 'Failed to create escalation');
      }

      const escalationId = result.rows[0]?.create_escalation;

      return { escalationId };
    }),

  /**
   * Get escalation queue (pending/in-progress)
   */
  getQueue: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is trainer/admin

    const sql = `SELECT * FROM escalation_queue ORDER BY wait_time_minutes DESC`;

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
      throw new Error(result.error || 'Failed to get escalation queue');
    }

    return result.rows || [];
  }),

  /**
   * Get escalation details
   */
  getDetails: protectedProcedure
    .input(z.object({ escalationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const sql = `SELECT * FROM get_escalation_details($1)`;
      const params = [input.escalationId];

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
        throw new Error(result.error || 'Failed to get escalation details');
      }

      return result.rows[0] || null;
    }),

  /**
   * Assign escalation to trainer
   */
  assign: protectedProcedure.input(assignEscalationSchema).mutation(async ({ ctx, input }) => {
    // TODO: Check if user is trainer/admin

    const sql = `SELECT assign_escalation($1, $2)`;
    const params = [input.escalationId, input.trainerId];

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
      throw new Error(result.error || 'Failed to assign escalation');
    }

    return { success: true };
  }),

  /**
   * Auto-assign escalation to available trainer
   */
  autoAssign: protectedProcedure
    .input(z.object({ escalationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const sql = `SELECT auto_assign_escalation($1)`;
      const params = [input.escalationId];

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
        throw new Error(result.error || 'Failed to auto-assign escalation');
      }

      const trainerId = result.rows[0]?.auto_assign_escalation;

      return { trainerId };
    }),

  /**
   * Add trainer response
   */
  addResponse: protectedProcedure.input(addResponseSchema).mutation(async ({ ctx, input }) => {
    const trainerId = ctx.session.user.id;
    // TODO: Check if user is trainer/admin

    const sql = `SELECT add_trainer_response($1, $2, $3, $4)`;
    const params = [input.escalationId, trainerId, input.message, input.isInternalNote];

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
      throw new Error(result.error || 'Failed to add trainer response');
    }

    return { success: true };
  }),

  /**
   * Get trainer responses for escalation
   */
  getResponses: protectedProcedure
    .input(
      z.object({
        escalationId: z.string().uuid(),
        includeInternal: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const sql = `SELECT * FROM get_trainer_responses($1, $2)`;
      const params = [input.escalationId, input.includeInternal];

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
        throw new Error(result.error || 'Failed to get trainer responses');
      }

      return result.rows || [];
    }),

  /**
   * Resolve escalation
   */
  resolve: protectedProcedure
    .input(resolveEscalationSchema)
    .mutation(async ({ ctx, input }) => {
      const trainerId = ctx.session.user.id;
      // TODO: Check if user is trainer/admin

      const sql = `SELECT resolve_escalation($1, $2, $3)`;
      const params = [input.escalationId, trainerId, input.resolutionNotes];

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
        throw new Error(result.error || 'Failed to resolve escalation');
      }

      return { success: true };
    }),

  /**
   * Dismiss escalation
   */
  dismiss: protectedProcedure
    .input(dismissEscalationSchema)
    .mutation(async ({ ctx, input }) => {
      const trainerId = ctx.session.user.id;
      // TODO: Check if user is trainer/admin

      const sql = `SELECT dismiss_escalation($1, $2, $3)`;
      const params = [input.escalationId, trainerId, input.dismissalReason];

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
        throw new Error(result.error || 'Failed to dismiss escalation');
      }

      return { success: true };
    }),

  /**
   * Get daily escalation statistics
   */
  getDailyStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is admin/trainer

    const sql = `SELECT * FROM escalation_daily_stats ORDER BY date DESC LIMIT 30`;

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
      throw new Error(result.error || 'Failed to get daily statistics');
    }

    return result.rows || [];
  }),

  /**
   * Get trainer performance statistics
   */
  getTrainerStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is admin

    const sql = `SELECT * FROM trainer_escalation_stats ORDER BY total_assigned DESC`;

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
      throw new Error(result.error || 'Failed to get trainer statistics');
    }

    return result.rows || [];
  }),

  /**
   * Get topic difficulty statistics
   */
  getTopicDifficultyStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Check if user is admin/trainer

    const sql = `SELECT * FROM topic_difficulty_stats ORDER BY escalation_count DESC LIMIT 20`;

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
      throw new Error(result.error || 'Failed to get topic difficulty statistics');
    }

    return result.rows || [];
  }),
});
