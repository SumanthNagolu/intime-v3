/**
 * tRPC Initialization
 *
 * Sets up the tRPC instance with:
 * - SuperJSON transformer (for dates, BigInts, etc.)
 * - Error formatter (exposes Zod validation errors)
 * - Base router and procedures
 */

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

/**
 * Export router and procedure builders
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
