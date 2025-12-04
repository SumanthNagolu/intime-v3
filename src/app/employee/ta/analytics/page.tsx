/**
 * TA Analytics Page
 *
 * Uses metadata-driven ScreenRenderer for the TA analytics UI.
 * @see src/screens/ta/ta-analytics.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { taAnalyticsScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded" />
      </div>
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function TAAnalyticsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <ScreenRenderer definition={taAnalyticsScreen} />
      </Suspense>
    </AppLayout>
  );
}
