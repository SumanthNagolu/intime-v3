/**
 * HR Analytics Page
 *
 * Uses metadata-driven ScreenRenderer for analytics dashboard.
 * @see src/screens/hr/analytics.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { analyticsScreen } from '@/screens/hr/analytics.screen';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded-xl" />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <ScreenRenderer definition={analyticsScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
