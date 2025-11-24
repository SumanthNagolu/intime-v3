/**
 * Admin Events Router
 *
 * tRPC router for admin event management:
 * - List events with filters
 * - Get dead letter queue
 * - Replay failed events
 * - Get event metrics
 */

import { z } from 'zod';
import { router } from '../../init';
import { adminProcedure } from '../../middleware';

export const adminEventsRouter = router({
  /**
   * List events with filters
   */
  list: adminProcedure
    .input(
      z.object({
        eventType: z.string().optional(),
        status: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.rpc('get_events_filtered', {
        p_event_type: input.eventType || null,
        p_status: input.status || null,
        p_from_date: input.fromDate?.toISOString() || null,
        p_to_date: input.toDate?.toISOString() || null,
        p_limit: input.limit,
        p_offset: input.offset,
      });

      if (error) {
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      return data || [];
    }),

  /**
   * Get dead letter queue (events that failed permanently)
   */
  deadLetterQueue: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('events')
      .select('*')
      .eq('status', 'failed')
      .gte('retry_count', 3) // Failed events that exhausted retries
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to fetch dead letter queue: ${error.message}`);
    }

    return data || [];
  }),

  /**
   * Get event by ID
   */
  getById: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('events')
        .select('*')
        .eq('id', input.eventId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch event: ${error.message}`);
      }

      return data;
    }),

  /**
   * Replay failed events (batch)
   */
  replay: adminProcedure
    .input(
      z.object({
        eventIds: z.array(z.string().uuid()).min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Reset failed events to pending status for replay
      const { data, error } = await ctx.supabase
        .from('events')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
        })
        .in('id', input.eventIds)
        .eq('status', 'failed')
        .select();

      if (error) {
        throw new Error(`Failed to replay events: ${error.message}`);
      }

      return {
        replayed: data?.length || 0,
        events: data || [],
      };
    }),

  /**
   * Get event metrics (last 24 hours)
   */
  metrics: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('events')
      .select('event_type, event_category, status, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      throw new Error(`Failed to fetch event metrics: ${error.message}`);
    }

    // Aggregate metrics in JavaScript
    const metrics = (data || []).reduce((acc: any, event) => {
      const name = `${event.event_category}.${event.event_type}`;
      if (!acc[name]) {
        acc[name] = { event_name: name, total: 0, pending: 0, completed: 0, failed: 0 };
      }
      acc[name].total++;
      if (event.status === 'pending') acc[name].pending++;
      if (event.status === 'completed') acc[name].completed++;
      if (event.status === 'failed') acc[name].failed++;
      return acc;
    }, {});

    return Object.values(metrics);
  }),
});
