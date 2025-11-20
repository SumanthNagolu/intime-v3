/**
 * Admin Events Router
 *
 * Event management endpoints for admins
 */

import { z } from 'zod';
import { router, adminProcedure } from '../../trpc';
import { schemas } from '@/lib/validations/schemas';

export const adminEventsRouter = router({
  /**
   * List events with filters
   */
  list: adminProcedure
    .input(schemas.eventFilters)
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      // Apply filters
      if (input.eventType) {
        query = query.eq('event_type', input.eventType);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.startDate) {
        query = query.gte('created_at', input.startDate);
      }

      if (input.endDate) {
        query = query.lte('created_at', input.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }),

  /**
   * Get event by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('events')
        .select('*')
        .eq('id', input.id)
        .single();

      if (error) throw error;
      return data;
    }),

  /**
   * Get dead letter queue events
   */
  deadLetterQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('events')
        .select('*')
        .eq('status', 'dead_letter')
        .order('failed_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw error;
      return data || [];
    }),

  /**
   * Replay failed/dead_letter events
   */
  replay: adminProcedure
    .input(schemas.replayEvents)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('admin_replay_events', {
          p_event_ids: input.eventIds,
        });

      if (error) throw error;
      return { success: true, count: data?.length || 0 };
    }),

  /**
   * Get event statistics
   */
  metrics: adminProcedure
    .input(z.object({ orgId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .rpc('admin_get_event_stats', {
          p_org_id: input.orgId || null,
        });

      if (error) throw error;
      return data;
    }),
});
