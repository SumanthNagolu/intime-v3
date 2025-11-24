/**
 * tRPC Middleware
 *
 * Middleware functions for common operations:
 * - Authentication checks
 * - Permission checks
 * - Role checks
 */

import { TRPCError } from '@trpc/server';
import { middleware, publicProcedure } from './init';

/**
 * Middleware: Require authentication
 *
 * Throws UNAUTHORIZED error if user is not authenticated.
 * Narrows the context type to guarantee userId is non-null.
 */
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId // Type is now narrowed to string (not string | null)
    }
  });
});

/**
 * Middleware: Require admin role
 *
 * Checks if user is authenticated and has admin role.
 * Throws FORBIDDEN error if user is not admin.
 */
export const isAdmin = isAuthenticated.unstable_pipe(
  middleware(async ({ ctx, next }) => {
    // Check if user has admin role using database function
    const { data: hasAdminRole } = await ctx.supabase.rpc('user_is_admin');

    if (!hasAdminRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required'
      });
    }

    return next({ ctx });
  })
);

/**
 * Middleware: Require specific permission
 *
 * Returns a middleware that checks if user has a specific permission.
 *
 * @param resource - Resource name (e.g., 'events', 'users')
 * @param action - Action name (e.g., 'view', 'create', 'delete')
 */
export const hasPermission = (resource: string, action: string) =>
  isAuthenticated.unstable_pipe(
    middleware(async ({ ctx, next }) => {
      const { data: hasPermission } = await ctx.supabase.rpc('user_has_permission', {
        p_user_id: ctx.userId as string,
        p_resource: resource,
        p_action: action
      });

      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Permission denied: ${resource}.${action}`
        });
      }

      return next({ ctx });
    })
  );

/**
 * Procedure: Protected (requires authentication)
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated);

/**
 * Procedure: Admin (requires admin role)
 */
export const adminProcedure = publicProcedure.use(isAdmin);
