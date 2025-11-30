/**
 * Analytics tRPC Router
 * Story: ACAD-030
 *
 * Revenue analytics and business intelligence:
 * - MRR, churn rate, LTV
 * - Course revenue analytics
 * - Payment metrics
 * - Discount effectiveness
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const analyticsRouter = router({
  /**
   * Get revenue overview metrics
   *
   * @returns MRR, total revenue, active subscriptions, churn rate, LTV
   */
  getRevenueOverview: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const { data: userRoles } = await ctx.supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', ctx.session.user.id);

    const isAdmin = userRoles?.some(
      (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
    );

    if (!isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can view analytics',
      });
    }

    try {
      // Get MRR
      const { data: mrr } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: number | null; error: unknown }>)('calculate_mrr');

      // Get churn rate (last 3 months)
      const { data: churnRate } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: number | null; error: unknown }>)('calculate_churn_rate', {
        p_period_months: 3,
      });

      // Get average LTV
      const { data: avgLtv } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: number | null; error: unknown }>)('calculate_avg_student_ltv');

      // Get current month analytics from materialized view
      const { data: currentMonth } = await (ctx.supabase
        .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (n: number) => { single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }> } } } })('revenue_analytics')
        .select('*')
        .order('month', { ascending: false })
        .limit(1)
        .single();

      return {
        success: true,
        mrr: Number(mrr) || 0,
        churnRate: Number(churnRate) || 0,
        avgStudentLtv: Number(avgLtv) || 0,
        currentMonth: currentMonth || null,
      };
    } catch (error) {
      console.error('[analytics.getRevenueOverview] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve revenue overview',
        cause: error,
      });
    }
  }),

  /**
   * Get monthly revenue trend
   *
   * @param months - Number of months to retrieve
   * @returns Monthly revenue data
   */
  getRevenueTrend: protectedProcedure
    .input(
      z.object({
        months: z.number().int().positive().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        const { data: trend, error } = await (ctx.supabase
          .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } } })('revenue_analytics')
          .select('*')
          .order('month', { ascending: false })
          .limit(input.months);

        if (error) throw error;

        return {
          success: true,
          data: (trend || []).reverse(), // Reverse to show oldest first
        };
      } catch (error) {
        console.error('[analytics.getRevenueTrend] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve revenue trend',
          cause: error,
        });
      }
    }),

  /**
   * Get course revenue analytics
   *
   * @param limit - Number of courses to retrieve
   * @param sortBy - Sort field
   * @returns Course revenue data
   */
  getCourseRevenue: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(20),
        sortBy: z
          .enum(['total_revenue', 'total_enrollments', 'completion_rate_percent'])
          .default('total_revenue'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        const { data: courses, error } = await (ctx.supabase
          .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } } })('course_revenue_analytics')
          .select('*')
          .order(input.sortBy, { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        return {
          success: true,
          courses: courses || [],
        };
      } catch (error) {
        console.error('[analytics.getCourseRevenue] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve course revenue',
          cause: error,
        });
      }
    }),

  /**
   * Get student LTV analytics
   *
   * @param limit - Number of students to retrieve
   * @param minRevenue - Minimum lifetime revenue filter
   * @returns Student LTV data
   */
  getStudentLTV: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(50),
        minRevenue: z.number().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        let query = (ctx.supabase
          .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (n: number) => { gte: (column: string, value: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } & Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } } })('student_ltv_analytics')
          .select('*')
          .order('lifetime_revenue', { ascending: false })
          .limit(input.limit);

        if (input.minRevenue) {
          query = query.gte('lifetime_revenue', input.minRevenue);
        }

        const { data: students, error } = await query;

        if (error) throw error;

        return {
          success: true,
          students: students || [],
        };
      } catch (error) {
        console.error('[analytics.getStudentLTV] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve student LTV',
          cause: error,
        });
      }
    }),

  /**
   * Get payment metrics
   *
   * @param periodDays - Period in days
   * @returns Payment success rate, refund rate
   */
  getPaymentMetrics: protectedProcedure
    .input(
      z.object({
        periodDays: z.number().int().positive().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        // Get success rate
        const { data: successRate } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: number | null; error: unknown }>)(
          'calculate_payment_success_rate',
          {
            p_period_days: input.periodDays,
          }
        );

        // Get refund rate
        const { data: refundRate } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: number | null; error: unknown }>)('calculate_refund_rate', {
          p_period_days: input.periodDays,
        });

        return {
          success: true,
          successRate: Number(successRate) || 0,
          refundRate: Number(refundRate) || 0,
          periodDays: input.periodDays,
        };
      } catch (error) {
        console.error('[analytics.getPaymentMetrics] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve payment metrics',
          cause: error,
        });
      }
    }),

  /**
   * Get enrollment funnel
   *
   * @param periodDays - Period in days
   * @returns Funnel stages with conversion rates
   */
  getEnrollmentFunnel: protectedProcedure
    .input(
      z.object({
        periodDays: z.number().int().positive().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        const { data: funnel, error } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }>)('get_enrollment_funnel', {
          p_period_days: input.periodDays,
        });

        if (error) throw error;

        return {
          success: true,
          funnel: funnel || [],
        };
      } catch (error) {
        console.error('[analytics.getEnrollmentFunnel] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve enrollment funnel',
          cause: error,
        });
      }
    }),

  /**
   * Get discount effectiveness analytics
   *
   * @param limit - Number of codes to retrieve
   * @param sortBy - Sort field
   * @returns Discount code ROI data
   */
  getDiscountEffectiveness: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(20),
        sortBy: z.enum(['total_uses', 'total_revenue_generated', 'roi_ratio']).default('roi_ratio'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view analytics',
        });
      }

      try {
        const { data: discounts, error } = await (ctx.supabase
          .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean; nullsFirst: boolean }) => { limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } } })('discount_effectiveness_analytics')
          .select('*')
          .order(input.sortBy, { ascending: false, nullsFirst: false })
          .limit(input.limit);

        if (error) throw error;

        return {
          success: true,
          discounts: discounts || [],
        };
      } catch (error) {
        console.error('[analytics.getDiscountEffectiveness] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve discount effectiveness',
          cause: error,
        });
      }
    }),

  /**
   * Refresh analytics materialized views (admin only)
   *
   * @returns Success status
   */
  refreshAnalytics: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin
    const { data: userRoles } = await ctx.supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', ctx.session.user.id);

    const isAdmin = userRoles?.some(
      (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
    );

    if (!isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can refresh analytics',
      });
    }

    try {
      const { error } = await (ctx.supabase.rpc as (name: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)('refresh_revenue_analytics');

      if (error) throw error;

      return {
        success: true,
        message: 'Analytics refreshed successfully',
      };
    } catch (error) {
      console.error('[analytics.refreshAnalytics] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to refresh analytics',
        cause: error,
      });
    }
  }),

  /**
   * Export analytics data to CSV format
   *
   * @param type - Type of data to export
   * @param months - Number of months (for revenue trend)
   * @returns CSV data as string
   */
  exportToCSV: protectedProcedure
    .input(
      z.object({
        type: z.enum(['revenue', 'courses', 'students', 'discounts']),
        months: z.number().int().positive().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur: { role_id: string; roles: { name: string } | null }) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can export analytics',
        });
      }

      try {
        let data: Record<string, unknown>[] = [];
        let headers: string[] = [];

        switch (input.type) {
          case 'revenue':
            const { data: revenue } = await (ctx.supabase
              .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } } })('revenue_analytics')
              .select('*')
              .order('month', { ascending: false })
              .limit(input.months);
            data = revenue || [];
            headers = [
              'month',
              'mrr',
              'total_revenue',
              'total_enrollments',
              'active_subscriptions',
              'churned_subscriptions',
            ];
            break;

          case 'courses':
            const { data: courses } = await (ctx.supabase
              .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } })('course_revenue_analytics')
              .select('*')
              .order('total_revenue', { ascending: false });
            data = courses || [];
            headers = [
              'course_title',
              'total_revenue',
              'total_enrollments',
              'completion_rate_percent',
            ];
            break;

          case 'students':
            const { data: students } = await (ctx.supabase
              .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean }) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } })('student_ltv_analytics')
              .select('*')
              .order('lifetime_revenue', { ascending: false });
            data = students || [];
            headers = [
              'student_name',
              'student_email',
              'lifetime_revenue',
              'total_enrollments',
            ];
            break;

          case 'discounts':
            const { data: discounts } = await (ctx.supabase
              .from as (table: string) => { select: (columns: string) => { order: (column: string, options: { ascending: boolean; nullsFirst: boolean }) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }> } })('discount_effectiveness_analytics')
              .select('*')
              .order('roi_ratio', { ascending: false, nullsFirst: false });
            data = discounts || [];
            headers = [
              'discount_code',
              'total_uses',
              'total_discount_given',
              'total_revenue_generated',
              'roi_ratio',
            ];
            break;
        }

        // Convert to CSV
        const csv = [
          headers.join(','),
          ...data.map((row) => headers.map((h) => (row[h] as string | number | undefined) ?? '').join(',')),
        ].join('\n');

        return {
          success: true,
          csv,
          filename: `${input.type}-analytics-${new Date().toISOString().split('T')[0]}.csv`,
        };
      } catch (error) {
        console.error('[analytics.exportToCSV] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export analytics',
          cause: error,
        });
      }
    }),
});
