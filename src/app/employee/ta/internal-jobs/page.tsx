/**
 * TA Internal Jobs Page
 *
 * Uses metadata-driven ScreenRenderer for the internal jobs UI.
 * @see src/screens/ta/internal-jobs.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { internalJobsScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function TAInternalJobsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ListSkeleton />}>
        <ScreenRenderer definition={internalJobsScreen} />
      </Suspense>
    </AppLayout>
  );
}
