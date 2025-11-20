/**
 * User Router
 *
 * tRPC router for user-related operations:
 * - Get current user profile
 * - Update profile
 * - List users (admin only)
 */

import { z } from 'zod';
import { router, publicProcedure } from '../init';
import { protectedProcedure, adminProcedure } from '../middleware';

export const usersRouter = router({
  /**
   * Get current user's profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }),

  /**
   * Update current user's profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().min(1).optional(),
        phone: z.string().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data;
    }),

  /**
   * Get user by ID (admin only)
   */
  getById: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', input.userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }

      return data;
    }),

  /**
   * List all users (admin only, with pagination)
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to list users: ${error.message}`);
      }

      return {
        users: data,
        total: count || 0,
      };
    }),
});
