/**
 * Permissions Matrix Page
 *
 * Full org-wide permissions view with role comparison.
 * @see src/screens/admin/permissions-matrix.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { permissionsMatrixScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PermissionsMatrixSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="h-96 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function PermissionsMatrixPage() {
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
