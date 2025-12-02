/**
 * Client Portal Jobs List Page
 *
 * List of all jobs for the client with filtering and search.
 * @see src/screens/portals/client/client-jobs-list.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientJobsListScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function JobsListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4">
        <div className="h-10 bg-stone-200 rounded w-64" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ClientJobsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<JobsListSkeleton />}>
        <ScreenRenderer definition={clientJobsListScreen} />
      </Suspense>
    </AppLayout>
  );
}
