/**
 * Bench Commission Dashboard Page
 *
 * Uses metadata-driven ScreenRenderer for the commission dashboard UI.
 * @see src/screens/bench-sales/commission-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { commissionDashboardScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = 'force-dynamic';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function CommissionDashboardPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <ScreenRenderer definition={commissionDashboardScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
