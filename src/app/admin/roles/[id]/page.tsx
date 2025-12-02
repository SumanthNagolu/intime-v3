/**
 * Role Detail Page
 *
 * Role configuration with permissions matrix and user assignment.
 * @see src/screens/admin/role-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { roleDetailScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function RoleDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-6">
        <div className="w-80 space-y-4">
          <div className="h-32 bg-stone-200 rounded-xl" />
          <div className="h-48 bg-stone-200 rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-stone-200 rounded-lg" />
          <div className="h-64 bg-stone-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function RoleDetailPage() {
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
