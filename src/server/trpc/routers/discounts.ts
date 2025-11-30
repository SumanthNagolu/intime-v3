/**
 * Discounts tRPC Router
 * Story: ACAD-029
 *
 * Type-safe API for discount codes:
 * - Discount code validation
 * - Discount code management (admin)
 * - Usage tracking
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

interface UserRoleRow {
  role_id: string;
  roles?: { name?: string } | null;
}

export const discountsRouter = router({
  /**
   * Validate discount code
   *
   * @param code - Discount code
   * @param courseId - Course ID (optional)
   * @param planType - Plan type (optional)
   * @param amount - Purchase amount (optional)
   * @returns Validation result with discount details
   */
  validateCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        courseId: z.string().uuid().optional(),
        planType: z.enum(['per_course', 'all_access', 'team', 'enterprise']).optional(),
        amount: z.number().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.rpc('validate_discount_code', {
          p_code: input.code,
          p_user_id: ctx.session.user.id,
          p_course_id: input.courseId || undefined,
          p_plan_type: input.planType || undefined,
          p_amount: input.amount || undefined,
        });

        if (error) throw error;

        const validation = data?.[0];

        if (!validation || !validation.is_valid) {
          return {
            success: false,
            isValid: false,
            error: validation?.error_message || 'Invalid discount code',
          };
        }

        return {
          success: true,
          isValid: true,
          discountId: validation.discount_id,
          discountType: validation.discount_type,
          discountValue: validation.discount_value,
        };
      } catch (error) {
        console.error('[discounts.validateCode] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate discount code',
          cause: error,
        });
      }
    }),

  /**
   * Calculate discounted price
   *
   * @param originalPrice - Original price
   * @param discountType - percentage or fixed
   * @param discountValue - Discount value
   * @returns Discounted price
   */
  calculateDiscount: publicProcedure
    .input(
      z.object({
        originalPrice: z.number().positive(),
        discountType: z.enum(['percentage', 'fixed']),
        discountValue: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.rpc('calculate_discounted_price', {
          p_original_price: input.originalPrice,
          p_discount_type: input.discountType,
          p_discount_value: input.discountValue,
        });

        if (error) throw error;

        const finalPrice = data as number;
        const discountAmount = input.originalPrice - finalPrice;

        return {
          success: true,
          originalPrice: input.originalPrice,
          discountAmount,
          finalPrice,
        };
      } catch (error) {
        console.error('[discounts.calculateDiscount] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate discount',
          cause: error,
        });
      }
    }),

  /**
   * Get all discount codes (admin only)
   *
   * @param includeInactive - Include inactive codes
   * @returns List of discount codes
   */
  getCodes: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: UserRoleRow) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view discount codes',
        });
      }

      try {
        let query = ctx.supabase
          .from('discount_codes')
          .select('*, created_by:user_profiles!created_by(id, full_name)')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!input.includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data: codes, error } = await query;

        if (error) throw error;

        return {
          success: true,
          codes: codes || [],
        };
      } catch (error) {
        console.error('[discounts.getCodes] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve discount codes',
          cause: error,
        });
      }
    }),

  /**
   * Create discount code (admin only)
   *
   * @param code - Discount code details
   * @returns Created discount code
   */
  createCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50),
        name: z.string().min(1),
        description: z.string().optional(),
        discount_type: z.enum(['percentage', 'fixed']),
        discount_value: z.number().positive(),
        max_uses: z.number().int().positive().optional(),
        max_uses_per_user: z.number().int().positive().default(1),
        valid_from: z.string().datetime().optional(),
        valid_until: z.string().datetime().optional(),
        applicable_plan_types: z
          .array(z.enum(['per_course', 'all_access', 'team', 'enterprise']))
          .optional(),
        applicable_course_ids: z.array(z.string().uuid()).optional(),
        minimum_purchase_amount: z.number().positive().optional(),
        stripe_coupon_id: z.string().optional(),
        stripe_promotion_code_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: UserRoleRow) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create discount codes',
        });
      }

      // Validate percentage discount
      if (input.discount_type === 'percentage' && input.discount_value > 100) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Percentage discount cannot exceed 100%',
        });
      }

      try {
        const { data: code, error } = await ctx.supabase
          .from('discount_codes')
          .insert({
            code: input.code.toUpperCase(),
            name: input.name,
            description: input.description,
            discount_type: input.discount_type,
            discount_value: input.discount_value,
            max_uses: input.max_uses,
            max_uses_per_user: input.max_uses_per_user,
            valid_from: input.valid_from || new Date().toISOString(),
            valid_until: input.valid_until,
            applicable_plan_types: input.applicable_plan_types,
            applicable_course_ids: input.applicable_course_ids,
            minimum_purchase_amount: input.minimum_purchase_amount,
            stripe_coupon_id: input.stripe_coupon_id,
            stripe_promotion_code_id: input.stripe_promotion_code_id,
            created_by: ctx.session.user.id,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Discount code already exists',
            });
          }
          throw error;
        }

        return {
          success: true,
          code,
        };
      } catch (error) {
        console.error('[discounts.createCode] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create discount code',
          cause: error,
        });
      }
    }),

  /**
   * Update discount code (admin only)
   *
   * @param id - Discount code ID
   * @param updates - Discount code updates
   * @returns Updated discount code
   */
  updateCode: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        discount_value: z.number().positive().optional(),
        max_uses: z.number().int().positive().optional(),
        max_uses_per_user: z.number().int().positive().optional(),
        valid_from: z.string().datetime().optional(),
        valid_until: z.string().datetime().optional(),
        applicable_plan_types: z
          .array(z.enum(['per_course', 'all_access', 'team', 'enterprise']))
          .optional(),
        applicable_course_ids: z.array(z.string().uuid()).optional(),
        minimum_purchase_amount: z.number().positive().optional(),
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
        (ur: UserRoleRow) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update discount codes',
        });
      }

      try {
        const { id, ...updates } = input;

        const { data: code, error } = await ctx.supabase
          .from('discount_codes')
          .update(updates)
          .eq('id', id)
          .is('deleted_at', null)
          .select()
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Discount code not found',
            });
          }
          throw error;
        }

        return {
          success: true,
          code,
        };
      } catch (error) {
        console.error('[discounts.updateCode] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update discount code',
          cause: error,
        });
      }
    }),

  /**
   * Delete discount code (soft delete, admin only)
   *
   * @param id - Discount code ID
   * @returns Success status
   */
  deleteCode: protectedProcedure
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
        (ur: UserRoleRow) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete discount codes',
        });
      }

      try {
        const { error } = await ctx.supabase
          .from('discount_codes')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.id)
          .is('deleted_at', null);

        if (error) throw error;

        return {
          success: true,
        };
      } catch (error) {
        console.error('[discounts.deleteCode] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete discount code',
          cause: error,
        });
      }
    }),

  /**
   * Get discount code usage stats (admin only)
   *
   * @param discountCodeId - Discount code ID (optional, all codes if not provided)
   * @returns Usage statistics
   */
  getUsageStats: protectedProcedure
    .input(
      z.object({
        discountCodeId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: UserRoleRow) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view usage statistics',
        });
      }

      try {
        let query = ctx.supabase
          .from('discount_code_usage')
          .select(
            `
            *,
            discount_code:discount_codes(id, code, name),
            user:user_profiles(id, full_name, email)
          `
          )
          .order('used_at', { ascending: false });

        if (input.discountCodeId) {
          query = query.eq('discount_code_id', input.discountCodeId);
        }

        const { data: usage, error } = await query;

        if (error) throw error;

        // Calculate aggregate stats
        const totalUsage = usage?.length || 0;
        const totalRevenue = usage?.reduce((sum, u) => sum + Number(u.final_amount), 0) || 0;
        const totalDiscount =
          usage?.reduce((sum, u) => sum + Number(u.discount_amount), 0) || 0;

        return {
          success: true,
          usage: usage || [],
          stats: {
            totalUsage,
            totalRevenue,
            totalDiscount,
          },
        };
      } catch (error) {
        console.error('[discounts.getUsageStats] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve usage statistics',
          cause: error,
        });
      }
    }),

  /**
   * Get user's discount code usage history
   *
   * @returns User's discount usage
   */
  getMyUsage: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data: usage, error } = await ctx.supabase
        .from('discount_code_usage')
        .select(
          `
          *,
          discount_code:discount_codes(id, code, name),
          enrollment:student_enrollments(id, course:courses(id, title))
        `
        )
        .eq('user_id', ctx.session.user.id)
        .order('used_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        usage: usage || [],
      };
    } catch (error) {
      console.error('[discounts.getMyUsage] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve usage history',
        cause: error,
      });
    }
  }),
});
