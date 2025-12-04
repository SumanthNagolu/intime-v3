/**
 * Admin Pod Detail Page
 *
 * Shows pod details with member management.
 * @see src/screens/admin/pod-detail.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { podDetailScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PodDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-stone-200 rounded" />
        <div className="md:col-span-2 h-64 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AdminPodDetailPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<PodDetailSkeleton />}>
          <ScreenRenderer definition={podDetailScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
