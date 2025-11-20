/**
 * tRPC Root Router
 *
 * Combines all tRPC routers into a single app router.
 * This is the main router that gets exposed to the client.
 */

import { router } from './init';
import { usersRouter } from './routers/users';
import { adminEventsRouter } from './routers/admin/events';
import { adminHandlersRouter } from './routers/admin/handlers';

/**
 * App Router
 *
 * Main tRPC router with all sub-routers merged.
 */
export const appRouter = router({
  users: usersRouter,
  admin: router({
    events: adminEventsRouter,
    handlers: adminHandlersRouter,
  }),
});

/**
 * Export type definition for the app router
 * This is used by the tRPC client for type-safe API calls
 */
export type AppRouter = typeof appRouter;
