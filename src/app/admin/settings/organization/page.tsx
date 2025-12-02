/**
 * Organization Settings Page
 *
 * Organization profile, branding, and localization settings.
 * @see src/screens/admin/org-settings.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { orgSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function OrgSettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-stone-200 rounded-lg" />
        <div className="h-64 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
}

export default function OrgSettingsPage() {
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
