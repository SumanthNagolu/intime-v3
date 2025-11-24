/**
 * Admin Handlers Router
 *
 * tRPC router for admin handler management:
 * - List event handlers with health status
 * - Enable/disable handlers
 * - Get handler details
 */

import { z } from 'zod';
import { router } from '../../init';
import { adminProcedure } from '../../middleware';

export const adminHandlersRouter = router({
  /**
   * List all event handlers with health status
   */
  list: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc('get_event_handler_health');

    if (error) {
      throw new Error(`Failed to fetch handlers: ${error.message}`);
    }

    return data || [];
  }),

  /**
   * Get handler by ID
   */
  getById: adminProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('event_subscriptions')
        .select('*')
        .eq('id', input.subscriptionId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch handler: ${error.message}`);
      }

      return data;
    }),

  /**
   * Disable event handler
   */
  disable: adminProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get handler name from subscription
      const { data: subscription, error: fetchError } = await ctx.supabase
        .from('event_subscriptions')
        .select('subscriber_name')
        .eq('id', input.subscriptionId)
        .single();

      if (fetchError || !subscription) {
        throw new Error(`Failed to find handler: ${fetchError?.message}`);
      }

      const { error } = await ctx.supabase.rpc('disable_event_handler', {
        p_handler_name: subscription.subscriber_name,
      });

      if (error) {
        throw new Error(`Failed to disable handler: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Enable event handler
   */
  enable: adminProcedure
    .input(z.object({ subscriptionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get handler name from subscription
      const { data: subscription, error: fetchError } = await ctx.supabase
        .from('event_subscriptions')
        .select('subscriber_name')
        .eq('id', input.subscriptionId)
        .single();

      if (fetchError || !subscription) {
        throw new Error(`Failed to find handler: ${fetchError?.message}`);
      }

      const { error } = await ctx.supabase.rpc('enable_event_handler', {
        p_handler_name: subscription.subscriber_name,
      });

      if (error) {
        throw new Error(`Failed to enable handler: ${error.message}`);
      }

      return { success: true };
    }),

  /**
   * Get handler health dashboard view
   */
  healthDashboard: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('event_subscriptions')
      .select('*')
      .order('consecutive_failures', { ascending: false, nullsFirst: false });

    if (error) {
      throw new Error(`Failed to fetch handler health: ${error.message}`);
    }

    return data || [];
  }),
});
