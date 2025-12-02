/**
 * COO Dashboard Page
 * 
 * Uses metadata-driven ScreenRenderer for the COO operations dashboard UI.
 * @see src/screens/operations/coo-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { cooDashboardScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function COODashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={cooDashboardScreen} />
      </Suspense>
    </AppLayout>
  );
}



