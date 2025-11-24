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
import { guidewireGuruRouter } from './guidewire-guru';
import { resumeMatchingRouter } from './resume-matching';

/**
 * Main application router
 */
import { coursesRouter } from '@/server/trpc/routers/courses';
import { enrollmentRouter } from '@/server/trpc/routers/enrollment';
import { xpTransactionsRouter } from '@/server/trpc/routers/xp-transactions';
import { badgeRouter } from '@/server/trpc/routers/badges';
import { progressRouter } from '@/server/trpc/routers/progress';
import { quizRouter } from '@/server/trpc/routers/quiz';

export const appRouter = router({
  users: usersRouter,
  admin: router({
    events: adminEventsRouter,
    handlers: adminHandlersRouter,
  }),
  guidewireGuru: guidewireGuruRouter,
  resumeMatching: resumeMatchingRouter,
  // Academy Routers
  courses: coursesRouter,
  enrollments: enrollmentRouter,
  xpTransactions: xpTransactionsRouter,
  badges: badgeRouter,
  progress: progressRouter,
  quiz: quizRouter,
});

/**
 * Export type definition
 * Used by the client for type-safe API calls
 */
export type AppRouter = typeof appRouter;
