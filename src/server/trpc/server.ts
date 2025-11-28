/**
 * Server-Side tRPC Caller
 *
 * Use this to call tRPC procedures directly from Server Components.
 * This enables server-side data fetching without client-side round trips.
 *
 * Usage in Server Components:
 * ```ts
 * import { serverCaller } from '@/server/trpc/server';
 *
 * export default async function Page() {
 *   const data = await serverCaller.ats.jobs.list({ limit: 10 });
 *   return <ClientComponent initialData={data} />;
 * }
 * ```
 */

import { appRouter } from './root';
import { createContext } from './context';

/**
 * Create a server-side tRPC caller
 *
 * This creates a caller that can be used in Server Components
 * to call tRPC procedures directly without HTTP overhead.
 */
export async function createServerCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}

/**
 * Cached server caller for use within a single request
 *
 * Uses React's cache() to deduplicate calls within the same request.
 */
import { cache } from 'react';

export const getServerCaller = cache(async () => {
  return createServerCaller();
});
