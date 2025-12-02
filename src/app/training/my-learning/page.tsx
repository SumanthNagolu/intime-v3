/**
 * Academy Portal My Learning Page
 *
 * User's enrolled courses with progress tracking.
 * @see src/screens/portals/academy/academy-my-learning.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyMyLearningScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function MyLearningSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AcademyMyLearningPage() {
  return (
    <AppLayout>
      <Suspense fallback={<MyLearningSkeleton />}>
        <ScreenRenderer definition={academyMyLearningScreen} />
      </Suspense>
    </AppLayout>
  );
}
