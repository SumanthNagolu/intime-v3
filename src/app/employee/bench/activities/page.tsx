/**
 * Bench Activities Page
 *
 * Uses BenchActivitiesRenderer for real-time activity data fetching.
 * @see src/screens/bench-sales/bench-activities.screen.ts
 */

import { Suspense } from 'react';
import { BenchActivitiesRenderer } from '@/components/bench';
import { benchActivitiesScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-4 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-8 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function BenchActivitiesPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <BenchActivitiesRenderer definition={benchActivitiesScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
