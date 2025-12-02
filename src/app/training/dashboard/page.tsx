/**
 * Academy Portal Dashboard Page
 *
 * Main training dashboard with progress, streaks, and active courses.
 * @see src/screens/portals/academy/academy-dashboard.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyDashboardScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 bg-stone-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AcademyDashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={academyDashboardScreen} />
      </Suspense>
    </AppLayout>
  );
}
