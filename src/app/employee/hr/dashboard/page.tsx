/**
 * HR Dashboard Page
 *
 * Uses metadata-driven ScreenRenderer for the HR dashboard UI.
 * @see src/screens/hr/hr-dashboard.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { hrDashboardScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-xl" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function HRDashboardPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <ScreenRenderer definition={hrDashboardScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
