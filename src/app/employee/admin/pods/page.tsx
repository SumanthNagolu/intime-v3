/**
 * Admin Pods List Page
 *
 * Lists all pods/teams with member assignments.
 * @see src/screens/admin/pods-list.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { podsListScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PodsListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="h-8 bg-stone-200 rounded w-32" />
        <div className="h-10 bg-stone-200 rounded w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminPodsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<PodsListSkeleton />}>
          <ScreenRenderer definition={podsListScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
