/**
 * Admin Security Settings Page
 *
 * Security-related configuration settings.
 * @see src/screens/admin/security-settings.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { securitySettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SecuritySettingsSkeleton() {
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

export default function AdminSecuritySettingsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<SecuritySettingsSkeleton />}>
          <ScreenRenderer definition={securitySettingsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
