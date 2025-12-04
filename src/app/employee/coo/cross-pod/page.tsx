/**
 * COO Cross-Pod Coordination Page
 *
 * Uses metadata-driven ScreenRenderer for the cross-pod coordination UI.
 * @see src/screens/operations/cross-pod.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { crossPodScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function CrossPodSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function COOCrossPodPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CrossPodSkeleton />}>
        <ScreenRenderer definition={crossPodScreen} />
      </Suspense>
    </AppLayout>
  );
}
