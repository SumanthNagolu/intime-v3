/**
 * Root tRPC Router
 *
 * Combines all sub-routers into the main application router.
 * Export the type definition for use in the client.
 */

import { router } from '../trpc';
import { usersRouter } from './users';
import { adminEventsRouter } from './admin/events';
import { adminHandlersRouter } from './admin/handlers';

/**
 * Main application router
 */
export const appRouter = router({
  users: usersRouter,
  admin: router({
    events: adminEventsRouter,
    handlers: adminHandlersRouter,
  }),
});

/**
 * Export type definition
 * Used by the client for type-safe API calls
 */
export type AppRouter = typeof appRouter;
