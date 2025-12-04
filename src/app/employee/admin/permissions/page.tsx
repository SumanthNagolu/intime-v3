/**
 * Admin Permissions Matrix Page
 *
 * Displays the full permissions matrix by role.
 * @see src/screens/admin/permissions-matrix.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { permissionsMatrixScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PermissionsMatrixSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="overflow-x-auto">
        <div className="h-96 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AdminPermissionsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<PermissionsMatrixSkeleton />}>
          <ScreenRenderer definition={permissionsMatrixScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
