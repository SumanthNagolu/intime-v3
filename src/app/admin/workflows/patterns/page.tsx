/**
 * Activity Patterns Page
 *
 * Configure auto-created activity rules triggered by system events.
 * @see src/screens/admin/activity-patterns.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { activityPatternsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ActivityPatternsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function ActivityPatternsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<ActivityPatternsSkeleton />}>
          <ScreenRenderer definition={activityPatternsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
