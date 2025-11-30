/**
 * Pricing tRPC Router
 * Story: ACAD-029
 *
 * Type-safe API for pricing plans and course pricing:
 * - Pricing plan management (admin)
 * - Course-specific pricing
 * - Public pricing display
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Minimal type for Supabase client to avoid 'any'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// Type assertion for tables not yet in Supabase generated types
type CoursePricingTable = {
  id: string;
  course_id: string;
  price_monthly: number | null;
  price_annual: number | null;
  price_one_time: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  stripe_price_id_one_time: string | null;
  stripe_product_id: string | null;
  early_bird_price: number | null;
  early_bird_valid_until: string | null;
  scholarship_available: boolean;
  scholarship_criteria: string | null;
  team_discount_percentage: number | null;
  min_team_size: number;
  created_at: string;
  updated_at: string;
};

type PricingPlanTable = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  plan_type: string;
  price_monthly: number | null;
  price_annual: number | null;
  price_one_time: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  stripe_price_id_one_time: string | null;
  stripe_product_id: string | null;
  features: string[] | Record<string, unknown>;
  max_courses: number | null;
  max_users: number | null;
  display_order: number;
  is_featured: boolean;
  badge_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export const pricingRouter = router({
  /**
   * Get all active pricing plans
   *
   * @returns List of active pricing plans
   */
  getPlans: publicProcedure.query(async ({ ctx }) => {
    try {
      const { data: plans, error } = await (ctx.supabase as SupabaseClient)
        .from('pricing_plans')
        .select('*')
        .is('deleted_at', null)
        .eq('is_active', true)
        .order('display_order', { ascending: true }) as { data: PricingPlanTable[] | null; error: unknown };

      if (error) throw error;

      return {
        success: true,
        plans: plans || [],
      };
    } catch (error) {
      console.error('[pricing.getPlans] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve pricing plans',
        cause: error,
      });
    }
  }),

  /**
   * Get pricing plan by ID or slug
   *
   * @param id - Plan ID
   * @param slug - Plan slug
   * @returns Pricing plan details
   */
  getPlan: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        slug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.slug) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either id or slug must be provided',
        });
      }

      try {
        let query = (ctx.supabase as SupabaseClient)
          .from('pricing_plans')
          .select('*')
          .is('deleted_at', null)
          .eq('is_active', true);

        if (input.id) {
          query = query.eq('id', input.id);
        } else if (input.slug) {
          query = query.eq('slug', input.slug);
        }

        const { data: plan, error } = await query.single() as { data: PricingPlanTable | null; error: unknown };

        if (error) {
          if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Pricing plan not found',
            });
          }
          throw error;
        }

        return {
          success: true,
          plan,
        };
      } catch (error) {
        console.error('[pricing.getPlan] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve pricing plan',
          cause: error,
        });
      }
    }),

  /**
   * Get course-specific pricing
   *
   * @param courseId - Course ID
   * @returns Course pricing details with early bird and team discounts
   */
  getCoursePricing: publicProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { data: pricing, error } = await (ctx.supabase as SupabaseClient)
          .from('course_pricing')
          .select('*')
          .eq('course_id', input.courseId)
          .single() as { data: CoursePricingTable | null; error: unknown };

        if (error && typeof error === 'object' && error !== null && 'code' in error && error.code !== 'PGRST116') {
          throw error;
        }

        // Check if early bird is still valid
        const hasEarlyBird =
          pricing?.early_bird_price &&
          pricing.early_bird_valid_until &&
          new Date(pricing.early_bird_valid_until) > new Date();

        return {
          success: true,
          pricing: pricing || null,
          hasEarlyBird,
          earlyBirdEndsAt: hasEarlyBird ? pricing.early_bird_valid_until : null,
        };
      } catch (error) {
        console.error('[pricing.getCoursePricing] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve course pricing',
          cause: error,
        });
      }
    }),

  /**
   * Create pricing plan (admin only)
   *
   * @param plan - Plan details
   * @returns Created pricing plan
   */
  createPlan: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        slug: z.string().min(1),
        plan_type: z.enum(['per_course', 'all_access', 'team', 'enterprise']),
        price_monthly: z.number().positive().optional(),
        price_annual: z.number().positive().optional(),
        price_one_time: z.number().positive().optional(),
        stripe_price_id_monthly: z.string().optional(),
        stripe_price_id_annual: z.string().optional(),
        stripe_price_id_one_time: z.string().optional(),
        stripe_product_id: z.string().optional(),
        features: z.array(z.string()).default([]),
        max_courses: z.number().int().positive().optional(),
        max_users: z.number().int().positive().optional(),
        display_order: z.number().int().default(0),
        is_featured: z.boolean().default(false),
        badge_text: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: Record<string, unknown>) => {
          const roles = ur.roles as Record<string, unknown> | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create pricing plans',
        });
      }

      try {
        const { data: plan, error } = await (ctx.supabase as SupabaseClient)
          .from('pricing_plans')
          .insert({
            name: input.name,
            description: input.description,
            slug: input.slug,
            plan_type: input.plan_type,
            price_monthly: input.price_monthly,
            price_annual: input.price_annual,
            price_one_time: input.price_one_time,
            stripe_price_id_monthly: input.stripe_price_id_monthly,
            stripe_price_id_annual: input.stripe_price_id_annual,
            stripe_price_id_one_time: input.stripe_price_id_one_time,
            stripe_product_id: input.stripe_product_id,
            features: input.features,
            max_courses: input.max_courses,
            max_users: input.max_users,
            display_order: input.display_order,
            is_featured: input.is_featured,
            badge_text: input.badge_text,
          })
          .select()
          .single() as { data: PricingPlanTable | null; error: unknown };

        if (error) throw error;

        return {
          success: true,
          plan,
        };
      } catch (error) {
        console.error('[pricing.createPlan] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create pricing plan',
          cause: error,
        });
      }
    }),

  /**
   * Update pricing plan (admin only)
   *
   * @param id - Plan ID
   * @param updates - Plan updates
   * @returns Updated pricing plan
   */
  updatePlan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        slug: z.string().min(1).optional(),
        plan_type: z.enum(['per_course', 'all_access', 'team', 'enterprise']).optional(),
        price_monthly: z.number().positive().optional(),
        price_annual: z.number().positive().optional(),
        price_one_time: z.number().positive().optional(),
        stripe_price_id_monthly: z.string().optional(),
        stripe_price_id_annual: z.string().optional(),
        stripe_price_id_one_time: z.string().optional(),
        stripe_product_id: z.string().optional(),
        features: z.array(z.string()).optional(),
        max_courses: z.number().int().positive().optional(),
        max_users: z.number().int().positive().optional(),
        display_order: z.number().int().optional(),
        is_featured: z.boolean().optional(),
        badge_text: z.string().optional(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: Record<string, unknown>) => {
          const roles = ur.roles as Record<string, unknown> | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update pricing plans',
        });
      }

      try {
        const { id, ...updates } = input;

        const { data: plan, error } = await (ctx.supabase as SupabaseClient)
          .from('pricing_plans')
          .update(updates)
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single() as { data: PricingPlanTable | null; error: unknown };

        if (error) {
          if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Pricing plan not found',
            });
          }
          throw error;
        }

        return {
          success: true,
          plan,
        };
      } catch (error) {
        console.error('[pricing.updatePlan] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update pricing plan',
          cause: error,
        });
      }
    }),

  /**
   * Delete pricing plan (soft delete, admin only)
   *
   * @param id - Plan ID
   * @returns Success status
   */
  deletePlan: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: Record<string, unknown>) => {
          const roles = ur.roles as Record<string, unknown> | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete pricing plans',
        });
      }

      try {
        const { error } = await (ctx.supabase as SupabaseClient)
          .from('pricing_plans')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .is('deleted_at', null);

        if (error) throw error;

        return {
          success: true,
        };
      } catch (error) {
        console.error('[pricing.deletePlan] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete pricing plan',
          cause: error,
        });
      }
    }),

  /**
   * Set course-specific pricing (admin only)
   *
   * @param courseId - Course ID
   * @param pricing - Pricing details
   * @returns Course pricing
   */
  setCoursePricing: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        price_monthly: z.number().positive().optional(),
        price_annual: z.number().positive().optional(),
        price_one_time: z.number().positive().optional(),
        stripe_price_id_monthly: z.string().optional(),
        stripe_price_id_annual: z.string().optional(),
        stripe_price_id_one_time: z.string().optional(),
        stripe_product_id: z.string().optional(),
        early_bird_price: z.number().positive().optional(),
        early_bird_valid_until: z.string().datetime().optional(),
        scholarship_available: z.boolean().default(false),
        scholarship_criteria: z.string().optional(),
        team_discount_percentage: z.number().min(0).max(100).optional(),
        min_team_size: z.number().int().positive().default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: Record<string, unknown>) => {
          const roles = ur.roles as Record<string, unknown> | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can set course pricing',
        });
      }

      try {
        const { courseId, ...pricingData } = input;

        const { data: pricing, error } = await (ctx.supabase as SupabaseClient)
          .from('course_pricing')
          .upsert(
            {
              course_id: courseId,
              ...pricingData,
            },
            { onConflict: 'course_id' }
          )
          .select()
          .single() as { data: CoursePricingTable | null; error: unknown };

        if (error) throw error;

        return {
          success: true,
          pricing,
        };
      } catch (error) {
        console.error('[pricing.setCoursePricing] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set course pricing',
          cause: error,
        });
      }
    }),
});
