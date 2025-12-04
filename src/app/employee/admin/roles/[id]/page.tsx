/**
 * Admin Role Detail Page
 *
 * Shows role details with permissions editor.
 * @see src/screens/admin/role-detail.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { roleDetailScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function RoleDetailSkeleton() {
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

export default function AdminRoleDetailPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<RoleDetailSkeleton />}>
          <ScreenRenderer definition={roleDetailScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
