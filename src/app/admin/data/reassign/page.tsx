/**
 * Bulk Reassign Page
 *
 * Wizard for bulk ownership transfer.
 * @see src/screens/admin/bulk-reassign.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { bulkReassignScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function BulkReassignSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
      <div className="h-8 bg-stone-200 rounded w-1/2" />
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-2 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function BulkReassignPage() {
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
