/**
 * Admin Handlers Router
 *
 * Handler health management endpoints for admins
 */

import { z } from 'zod';
import { router, adminProcedure } from '../../trpc';
import { schemas } from '@/lib/validations/schemas';

export const adminHandlersRouter = router({
  /**
   * List all event handlers
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('event_subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw error;
      return data || [];
    }),

  /**
   * Get handler by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('event_subscriptions')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  /**
   * Enable a disabled handler
   */
  enable: adminProcedure
    .input(schemas.handlerAction)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('admin_enable_handler', {
          p_handler_id: input.handlerId,
        });

      if (error) throw error;
      return { success: true };
    }),

  /**
   * Disable a handler
   */
  disable: adminProcedure
    .input(schemas.handlerAction)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('admin_disable_handler', {
          p_handler_id: input.handlerId,
          p_reason: input.reason || 'Manually disabled by admin',
        });

      if (error) throw error;
      return { success: true };
    }),

  /**
   * Get handler health dashboard
   */
  healthDashboard: adminProcedure
    .input(z.object({ orgId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      // Get stats
      const { data: stats, error: statsError } = await ctx.supabase
        .rpc('admin_get_handler_stats', {
          p_org_id: input.orgId ?? undefined,
        });

      if (statsError) throw statsError;

      // Get handlers list
      const { data: handlers, error: handlersError } = await ctx.supabase
        .from('event_subscriptions')
        .select('*')
        .order('failure_count', { ascending: false });

      if (handlersError) throw handlersError;

      return {
        stats,
        handlers: handlers || [],
      };
    }),
});
