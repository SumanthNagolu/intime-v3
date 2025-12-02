/**
 * Data Export Page
 *
 * Export configuration with entity selection and format options.
 * @see src/screens/admin/data-export.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { dataExportScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DataExportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-48 bg-stone-200 rounded-lg" />
          <div className="h-48 bg-stone-200 rounded-lg" />
        </div>
        <div className="h-96 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function DataExportPage() {
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
