/**
 * Admin Data Import Page
 *
 * Import data from external sources.
 * @see src/screens/admin/data-import.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { dataImportScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DataImportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        <div className="h-48 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AdminDataImportPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<DataImportSkeleton />}>
          <ScreenRenderer definition={dataImportScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
