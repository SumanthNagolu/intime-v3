/**
 * Stripe tRPC Router
 * Story: ACAD-028
 *
 * Type-safe API for Stripe operations:
 * - Checkout session creation
 * - Subscription management
 * - Customer portal access
 * - Refund processing (admin only)
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from '@/lib/stripe/checkout';
import {
  cancelSubscription,
  updateSubscription,
  getSubscription,
  getCustomerSubscriptions,
} from '@/lib/stripe/subscriptions';
import { createRefund, getRefund } from '@/lib/stripe/refunds';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';

/**
 * Extended Stripe Subscription type with period properties
 * Note: These properties exist in the Stripe API response but may not be
 * properly typed in the current Stripe SDK version
 */
type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
};

export const stripeRouter = router({
  /**
   * Create Stripe checkout session for course enrollment
   *
   * @param courseId - Course to purchase
   * @param priceId - Stripe price ID (from course.stripe_price_id)
   * @param paymentType - one_time or subscription
   * @returns Checkout session URL
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        courseId: z.string().uuid(),
        priceId: z.string(),
        paymentType: z.enum(['one_time', 'subscription']),
        discountCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await createCheckoutSession({
          userId: ctx.session.user.id,
          courseId: input.courseId,
          priceId: input.priceId,
          paymentType: input.paymentType,
          discountCode: input.discountCode,
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error('[stripe.createCheckoutSession] Error:', error);

        // Check if it's a discount code error
        if (error instanceof Error && error.message.includes('discount')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
          cause: error,
        });
      }
    }),

  /**
   * Create customer portal session for billing management
   *
   * @param returnUrl - URL to return to after portal session
   * @returns Portal session URL
   */
  createCustomerPortal: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await createCustomerPortalSession(
          ctx.session.user.id,
          input.returnUrl
        );

        return {
          success: true,
          url: session.url,
        };
      } catch (error) {
        console.error('[stripe.createCustomerPortal] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create customer portal session',
          cause: error,
        });
      }
    }),

  /**
   * Get user's active subscriptions
   *
   * @returns List of active subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = await getCustomerSubscriptions(ctx.session.user.id);

      return {
        success: true,
        subscriptions: subscriptions.map((sub) => {
          const subWithPeriod = sub as StripeSubscriptionWithPeriod;
          return {
            id: subWithPeriod.id,
            status: subWithPeriod.status,
            currentPeriodStart: new Date(subWithPeriod.current_period_start * 1000),
            currentPeriodEnd: new Date(subWithPeriod.current_period_end * 1000),
            cancelAtPeriodEnd: subWithPeriod.cancel_at_period_end,
            canceledAt: subWithPeriod.canceled_at ? new Date(subWithPeriod.canceled_at * 1000) : null,
            items: subWithPeriod.items.data.map((item) => ({
              priceId: item.price.id,
              productId: item.price.product as string,
              quantity: item.quantity,
            })),
          };
        }),
      };
    } catch (error) {
      console.error('[stripe.getSubscriptions] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscriptions',
        cause: error,
      });
    }
  }),

  /**
   * Get subscription details by ID
   *
   * @param subscriptionId - Stripe subscription ID
   * @returns Subscription details
   */
  getSubscriptionDetails: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const subscription = await getSubscription(input.subscriptionId);
        const subWithPeriod = subscription as StripeSubscriptionWithPeriod;

        return {
          success: true,
          subscription: {
            id: subWithPeriod.id,
            status: subWithPeriod.status,
            currentPeriodStart: new Date(subWithPeriod.current_period_start * 1000),
            currentPeriodEnd: new Date(subWithPeriod.current_period_end * 1000),
            cancelAtPeriodEnd: subWithPeriod.cancel_at_period_end,
            canceledAt: subWithPeriod.canceled_at
              ? new Date(subWithPeriod.canceled_at * 1000)
              : null,
            items: subWithPeriod.items.data.map((item) => ({
              priceId: item.price.id,
              productId: item.price.product as string,
              quantity: item.quantity,
            })),
          },
        };
      } catch (error) {
        console.error('[stripe.getSubscriptionDetails] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve subscription details',
          cause: error,
        });
      }
    }),

  /**
   * Cancel subscription (at end of period or immediately)
   *
   * @param subscriptionId - Stripe subscription ID
   * @param cancelAtPeriodEnd - If true, cancel at end of billing period. If false, cancel immediately.
   * @returns Updated subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        cancelAtPeriodEnd: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const subscription = await cancelSubscription(
          input.subscriptionId,
          input.cancelAtPeriodEnd
        );

        return {
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          },
        };
      } catch (error) {
        console.error('[stripe.cancelSubscription] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel subscription',
          cause: error,
        });
      }
    }),

  /**
   * Update subscription (change price or quantity)
   *
   * @param subscriptionId - Stripe subscription ID
   * @param priceId - New price ID (optional)
   * @param quantity - New quantity (optional)
   * @param prorationBehavior - How to handle proration (create_prorations, none, always_invoice)
   * @returns Updated subscription
   */
  updateSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        priceId: z.string().optional(),
        quantity: z.number().int().positive().optional(),
        prorationBehavior: z
          .enum(['create_prorations', 'none', 'always_invoice'])
          .default('create_prorations'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const subscription = await updateSubscription(input.subscriptionId, {
          priceId: input.priceId,
          quantity: input.quantity,
          prorationBehavior: input.prorationBehavior,
        });

        return {
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            items: subscription.items.data.map((item) => ({
              priceId: item.price.id,
              productId: item.price.product as string,
              quantity: item.quantity,
            })),
          },
        };
      } catch (error) {
        console.error('[stripe.updateSubscription] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update subscription',
          cause: error,
        });
      }
    }),

  /**
   * Create refund (admin only)
   *
   * @param paymentIntentId - Stripe payment intent ID
   * @param amount - Amount to refund in cents (optional, defaults to full refund)
   * @param reason - Reason for refund
   * @returns Refund details
   */
  createRefund: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        amount: z.number().int().positive().optional(),
        reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
        metadata: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur) => {
          const roles = ur.roles as { name: string } | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create refunds',
        });
      }

      try {
        const refund = await createRefund({
          paymentIntentId: input.paymentIntentId,
          amount: input.amount,
          reason: input.reason,
          metadata: input.metadata,
        });

        return {
          success: true,
          refund: {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
            reason: refund.reason,
            createdAt: new Date(refund.created * 1000),
          },
        };
      } catch (error) {
        console.error('[stripe.createRefund] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create refund',
          cause: error,
        });
      }
    }),

  /**
   * Get refund details by ID (admin only)
   *
   * @param refundId - Stripe refund ID
   * @returns Refund details
   */
  getRefundDetails: protectedProcedure
    .input(
      z.object({
        refundId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const { data: userRoles } = await ctx.supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', ctx.session.user.id);

      const isAdmin = userRoles?.some(
        (ur) => {
          const roles = ur.roles as { name: string } | null;
          return roles?.name === 'admin' || roles?.name === 'super_admin';
        }
      );

      if (!isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view refund details',
        });
      }

      try {
        const refund = await getRefund(input.refundId);

        return {
          success: true,
          refund: {
            id: refund.id,
            amount: refund.amount,
            status: refund.status,
            reason: refund.reason,
            paymentIntentId: refund.payment_intent as string,
            createdAt: new Date(refund.created * 1000),
          },
        };
      } catch (error) {
        console.error('[stripe.getRefundDetails] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve refund details',
          cause: error,
        });
      }
    }),
});
