/**
 * Manager Activities Page
 *
 * Uses metadata-driven ScreenRenderer for the manager activities UI.
 * @see src/screens/operations/manager-activities.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { managerActivitiesScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function ActivitiesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ManagerActivitiesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ActivitiesSkeleton />}>
        <ScreenRenderer definition={managerActivitiesScreen} />
      </Suspense>
    </AppLayout>
  );
}
