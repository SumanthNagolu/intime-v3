/**
 * Organization Chart Page
 *
 * Uses metadata-driven ScreenRenderer for the org chart UI.
 * @see src/screens/hr/org-chart.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { orgChartScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function OrgChartSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="flex justify-center items-center h-96">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="h-24 bg-stone-200 rounded-xl mx-auto w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone-200 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<OrgChartSkeleton />}>
          <ScreenRenderer definition={orgChartScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
