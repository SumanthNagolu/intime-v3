/**
 * API Settings Page
 *
 * API keys management, webhooks configuration, and rate limits.
 * @see src/screens/admin/api-settings.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { apiSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function ApiSettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="h-48 bg-stone-200 rounded-lg" />
      <div className="h-48 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function ApiSettingsPage() {
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
