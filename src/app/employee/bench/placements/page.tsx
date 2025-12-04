/**
 * Bench Placements List Page
 *
 * Uses metadata-driven ScreenRenderer for the placements list UI.
 * @see src/screens/bench-sales/bench-placements-list.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { benchPlacementsListScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function PlacementsListPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={benchPlacementsListScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
