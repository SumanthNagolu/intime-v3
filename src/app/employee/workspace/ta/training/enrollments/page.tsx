/**
 * Training Enrollments Page
 *
 * Uses metadata-driven ScreenRenderer for active enrollments tracker.
 * @see src/screens/ta/training-enrollments.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { trainingEnrollmentsScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function EnrollmentsListSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function TrainingEnrollmentsPage() {
  return (
    <Suspense fallback={<EnrollmentsListSkeleton />}>
      <ScreenRenderer definition={trainingEnrollmentsScreen} />
    </Suspense>
  );
}
