/**
 * Client Portal Reports Page
 *
 * Analytics and reports for hiring activity.
 * @see src/screens/portals/client/client-reports.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientReportsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function ReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ClientReportsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ReportsSkeleton />}>
        <ScreenRenderer definition={clientReportsScreen} />
      </Suspense>
    </AppLayout>
  );
}
