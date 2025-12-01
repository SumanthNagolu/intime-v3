/**
 * Pod Metrics Page
 * 
 * Uses metadata-driven ScreenRenderer for the pod metrics UI.
 * @see src/screens/operations/pod-metrics.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { podMetricsScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function MetricsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function PodMetricsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<MetricsSkeleton />}>
        <ScreenRenderer definition={podMetricsScreen} />
      </Suspense>
    </AppLayout>
  );
}

