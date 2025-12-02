/**
 * Time Off Management Page
 *
 * Uses metadata-driven ScreenRenderer for the time off list UI.
 * @see src/screens/hr/timeoff-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { timeoffListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function TimeOffSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function TimeOffPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<TimeOffSkeleton />}>
          <ScreenRenderer definition={timeoffListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
