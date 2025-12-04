/**
 * Admin Settings Hub Page
 *
 * Central hub for all system settings.
 * @see src/screens/admin/settings-hub.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { settingsHubScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SettingsHubSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<SettingsHubSkeleton />}>
          <ScreenRenderer definition={settingsHubScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
