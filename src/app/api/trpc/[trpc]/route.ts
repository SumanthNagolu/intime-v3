/**
 * tRPC API Route Handler
 *
 * Next.js 15 App Router API route for tRPC.
 * Handles all tRPC requests at /api/trpc/*
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/trpc/root';
import { createContext } from '@/server/trpc/context';

/**
 * tRPC request handler
 *
 * Handles both GET and POST requests for tRPC.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
