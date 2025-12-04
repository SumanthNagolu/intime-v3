/**
 * Bench Sales Dashboard Page
 *
 * Uses metadata-driven BenchDashboardRenderer for the bench sales dashboard UI.
 * Fetches all required tRPC data and passes it to widget components.
 * @see src/screens/bench-sales/bench-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { benchDashboardScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';
import { BenchDashboardRenderer } from '@/components/bench/BenchDashboardRenderer';

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function BenchDashboardPage() {
  return (
    <AppLayout>
      <BenchLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <BenchDashboardRenderer definition={benchDashboardScreen} />
        </Suspense>
      </BenchLayout>
    </AppLayout>
  );
}
