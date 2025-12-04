/**
 * Bench Immigration Dashboard Page
 *
 * Uses metadata-driven ScreenRenderer for the immigration dashboard UI.
 * @see src/screens/bench-sales/immigration-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { immigrationDashboardScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-20 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function ImmigrationDashboardPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <ScreenRenderer definition={immigrationDashboardScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
