/**
 * Training Placements Tracker Page
 *
 * Uses metadata-driven ScreenRenderer for 90-day placement tracking.
 * @see src/screens/ta/training-placement-tracker.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { trainingPlacementTrackerScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function PlacementsTrackerSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-48 bg-stone-200 rounded" />
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function TrainingPlacementsPage() {
  return (
    <Suspense fallback={<PlacementsTrackerSkeleton />}>
      <ScreenRenderer definition={trainingPlacementTrackerScreen} />
    </Suspense>
  );
}
