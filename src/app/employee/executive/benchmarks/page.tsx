/**
 * Executive Benchmarking Page
 *
 * Uses metadata-driven ScreenRenderer for benchmarking UI.
 * @see src/screens/operations/benchmarking.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { benchmarkingScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded w-full" />
      <div className="h-64 bg-stone-200 rounded" />
      <div className="h-64 bg-stone-200 rounded" />
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function ExecutiveBenchmarksPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={benchmarkingScreen} />
      </Suspense>
    </AppLayout>
  );
}
