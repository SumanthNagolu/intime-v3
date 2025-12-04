/**
 * Admin Activity Patterns Page
 *
 * Configure activity pattern rules.
 * @see src/screens/admin/activity-patterns.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { activityPatternsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ActivityPatternsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminActivityPatternsPage() {
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
