/**
 * Admin Organization Settings Page
 *
 * Organization-level configuration settings.
 * @see src/screens/admin/org-settings.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { orgSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function OrgSettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminOrgSettingsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<OrgSettingsSkeleton />}>
          <ScreenRenderer definition={orgSettingsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
