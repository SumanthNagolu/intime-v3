/**
 * HR Activities Page
 *
 * Uses metadata-driven ScreenRenderer for the HR activities UI.
 * @see src/screens/hr/hr-activities.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { hrActivitiesScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function HRActivitiesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-40 bg-stone-200 rounded-lg" />
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
        <div className="h-10 w-48 bg-stone-200 rounded-lg ml-auto" />
      </div>
      <div className="h-96 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default function HRActivitiesPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<HRActivitiesSkeleton />}>
          <ScreenRenderer definition={hrActivitiesScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
