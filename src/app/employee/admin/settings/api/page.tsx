/**
 * Admin API Settings Page
 *
 * API keys and configuration.
 * @see src/screens/admin/api-settings.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { apiSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ApiSettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-4">
        <div className="h-32 bg-stone-200 rounded" />
        <div className="h-48 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function AdminApiSettingsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<ApiSettingsSkeleton />}>
          <ScreenRenderer definition={apiSettingsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
