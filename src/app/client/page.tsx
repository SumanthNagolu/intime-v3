/**
 * Client Portal Root Page
 *
 * Main dashboard for external clients showing job statistics,
 * pending actions, and recent activity.
 * @see src/screens/portals/client/client-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientDashboardScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function ClientPortalPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={clientDashboardScreen} />
      </Suspense>
    </AppLayout>
  );
}
