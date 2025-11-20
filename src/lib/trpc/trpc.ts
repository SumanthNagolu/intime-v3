/**
 * tRPC Server Configuration
 *
 * Defines the tRPC instance, context, middleware, and base procedures.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { createClient } from '@/lib/supabase/server';

/**
 * Create tRPC context
 * Contains session, userId, orgId, and Supabase client
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  const orgId = session?.user?.user_metadata?.org_id;

  return {
    session,
    userId,
    orgId,
    supabase,
    headers: opts.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause
            : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Authenticated procedure
 * Requires user to be logged in
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});

/**
 * Admin procedure
 * Requires user to be admin
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user is admin via database
  const { data: isAdmin } = await ctx.supabase
    .rpc('user_is_admin', { p_user_id: ctx.userId });

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }

  return next({ ctx });
});

/**
 * Middleware to check specific permission
 */
export const hasPermission = (resource: string, action: string) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const { data: hasPermission } = await ctx.supabase
      .rpc('user_has_permission', {
        p_user_id: ctx.userId,
        p_resource: resource,
        p_action: action,
      });

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You don't have permission to ${action} ${resource}`,
      });
    }

    return next({ ctx });
  });
