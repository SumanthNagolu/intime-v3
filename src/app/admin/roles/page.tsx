/**
 * Roles List Page
 *
 * Roles management with system and custom roles.
 * @see src/screens/admin/roles-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { rolesListScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function RolesListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 bg-stone-200 rounded-lg" />
      <div className="h-48 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function RolesListPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<RolesListSkeleton />}>
          <ScreenRenderer definition={rolesListScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
