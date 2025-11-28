/**
 * tRPC Prefetch Utilities
 *
 * Server-side data prefetching with React Query hydration.
 * Enables instant page loads by fetching data during SSR.
 *
 * Usage:
 * ```tsx
 * // In Server Component (page.tsx)
 * import { prefetchQueries, HydrationBoundary } from '@/lib/trpc/prefetch';
 *
 * export default async function Page() {
 *   const dehydratedState = await prefetchQueries(async (caller) => ({
 *     jobs: await caller.ats.jobs.list({ limit: 10 }),
 *     submissions: await caller.ats.submissions.list({ limit: 10 }),
 *   }));
 *
 *   return (
 *     <HydrationBoundary state={dehydratedState}>
 *       <ClientComponent />
 *     </HydrationBoundary>
 *   );
 * }
 * ```
 */

import { QueryClient, dehydrate, DehydratedState } from '@tanstack/react-query';
import { getServerCaller } from '@/server/trpc/server';

// Re-export HydrationBoundary for convenience
export { HydrationBoundary } from '@tanstack/react-query';

type ServerCaller = Awaited<ReturnType<typeof getServerCaller>>;

/**
 * Prefetch multiple queries and return dehydrated state
 *
 * @param fetchFn - Function that receives the server caller and returns prefetched data
 * @returns Dehydrated React Query state for hydration on client
 */
export async function prefetchQueries<T extends Record<string, unknown>>(
  fetchFn: (caller: ServerCaller) => Promise<T>
): Promise<DehydratedState> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  try {
    const caller = await getServerCaller();
    const data = await fetchFn(caller);

    // Populate the query cache with prefetched data
    Object.entries(data).forEach(([key, value]) => {
      queryClient.setQueryData([key], value);
    });
  } catch (error) {
    console.error('Prefetch error:', error);
    // Don't throw - allow page to render with client-side fetch as fallback
  }

  return dehydrate(queryClient);
}

/**
 * Prefetch recruiting dashboard data
 *
 * Convenience function for the recruiting dashboard.
 * Prefetches jobs, submissions, and placements count in parallel.
 */
export async function prefetchRecruitingDashboard(): Promise<DehydratedState> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  });

  try {
    const caller = await getServerCaller();

    // Fetch all data in parallel
    const [jobs, submissions, placementsCount] = await Promise.all([
      caller.ats.jobs.list({ limit: 50, status: 'open' }),
      caller.ats.submissions.list({ limit: 50 }),
      caller.ats.placements.activeCount(),
    ]);

    // Set query data with the same keys used by tRPC hooks
    queryClient.setQueryData(
      [['ats', 'jobs', 'list'], { input: { limit: 50, status: 'open' }, type: 'query' }],
      jobs
    );
    queryClient.setQueryData(
      [['ats', 'submissions', 'list'], { input: { limit: 50 }, type: 'query' }],
      submissions
    );
    queryClient.setQueryData(
      [['ats', 'placements', 'activeCount'], { type: 'query' }],
      placementsCount
    );
  } catch (error) {
    console.error('Prefetch recruiting dashboard error:', error);
  }

  return dehydrate(queryClient);
}
