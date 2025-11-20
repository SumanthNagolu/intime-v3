/**
 * Users Router
 *
 * User profile management endpoints
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { schemas } from '@/lib/validations/schemas';

export const usersRouter = router({
  /**
   * Get current user profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .single();

    if (error) throw error;
    return data;
  }),

  /**
   * Get user by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', ctx.orgId) // Enforce org boundary
        .single();

      if (error) throw error;
      return data;
    }),

  /**
   * List users in organization
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .select('*')
        .eq('org_id', ctx.orgId)
        .range(input.offset, input.offset + input.limit - 1);

      if (error) throw error;
      return data || [];
    }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(schemas.updateUserProfile)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Users can only update their own profile
      if (id !== ctx.userId) {
        throw new Error('Cannot update other user profiles');
      }

      const { data, error } = await ctx.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .eq('org_id', ctx.orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }),
});
