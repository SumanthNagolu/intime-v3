/**
 * Admin Bulk Reassign Page
 *
 * Bulk reassign records to different users or pods.
 * @see src/screens/admin/bulk-reassign.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { bulkReassignScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function BulkReassignSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AdminBulkReassignPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<BulkReassignSkeleton />}>
          <ScreenRenderer definition={bulkReassignScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
