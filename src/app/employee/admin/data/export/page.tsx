/**
 * Admin Data Export Page
 *
 * Export data to various formats.
 * @see src/screens/admin/data-export.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { dataExportScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DataExportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
    </div>
  );
}

export default function AdminDataExportPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<DataExportSkeleton />}>
          <ScreenRenderer definition={dataExportScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
