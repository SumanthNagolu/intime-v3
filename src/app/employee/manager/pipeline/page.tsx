/**
 * Manager Pipeline Page
 *
 * Uses metadata-driven ScreenRenderer for the pod pipeline overview UI.
 * @see src/screens/operations/pod-overview.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { podOverviewScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function PipelineSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-32 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function ManagerPipelinePage() {
  return (
    <AppLayout>
      <Suspense fallback={<PipelineSkeleton />}>
        <ScreenRenderer definition={podOverviewScreen} />
      </Suspense>
    </AppLayout>
  );
}
