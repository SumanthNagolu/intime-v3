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
import { enrollmentRouter } from './routers/enrollment';
import { progressRouter } from './routers/progress';
import { contentRouter } from './routers/content';
import { coursesRouter } from './routers/courses';
import { videoRouter } from './routers/video';
import { labsRouter } from './routers/labs';
import { readingRouter } from './routers/reading';
import { quizRouter } from './routers/quiz';
import { capstoneRouter } from './routers/capstone';
import { aiMentorRouter } from './routers/ai-mentor';
import { escalationRouter } from './routers/escalation';
import { badgeRouter } from './routers/badges';
import { leaderboardRouter } from './routers/leaderboards';
import { xpTransactionsRouter } from './routers/xp-transactions';
import { certificatesRouter } from './routers/certificates';
import { stripeRouter } from './routers/stripe';
import { pricingRouter } from './routers/pricing';
import { discountsRouter } from './routers/discounts';
import { analyticsRouter } from './routers/analytics';
import { academyRouter } from './routers/academy';
// Removed aiChatRouter - using aiMentorRouter instead (ACAD-013)

// Business module routers
import { crmRouter } from '../routers/crm';
import { atsRouter } from '../routers/ats';
import { benchRouter } from '../routers/bench';
import { taHrRouter } from '../routers/ta-hr';
import { dashboardRouter } from '../routers/dashboard';
import { activitiesRouter } from '../routers/activities';

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
  // Academy UI router (transforms database to Academy UI format)
  academy: academyRouter,
  // Academy routers (direct database access)
  enrollment: enrollmentRouter,
  progress: progressRouter,
  content: contentRouter,
  courses: coursesRouter,
  video: videoRouter,
  labs: labsRouter,
  reading: readingRouter,
  quiz: quizRouter,
  capstone: capstoneRouter,
  aiMentor: aiMentorRouter,
  escalation: escalationRouter,
  badges: badgeRouter,
  leaderboards: leaderboardRouter,
  xpTransactions: xpTransactionsRouter,
  certificates: certificatesRouter,
  stripe: stripeRouter,
  pricing: pricingRouter,
  discounts: discountsRouter,
  analytics: analyticsRouter,
  // aiChat router removed - chat UI now uses aiMentor router

  // Business module routers
  crm: crmRouter,
  ats: atsRouter,
  bench: benchRouter,
  taHr: taHrRouter,
  dashboard: dashboardRouter,
  activities: activitiesRouter,
});

/**
 * Export type definition for the app router
 * This is used by the tRPC client for type-safe API calls
 */
export type AppRouter = typeof appRouter;
