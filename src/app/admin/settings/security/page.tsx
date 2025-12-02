/**
 * Security Settings Page
 *
 * Password policies, session management, 2FA, and login security.
 * @see src/screens/admin/security-settings.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { securitySettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function SecuritySettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-stone-200 rounded-lg" />
        <div className="h-48 bg-stone-200 rounded-lg" />
      </div>
      <div className="h-64 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function SecuritySettingsPage() {
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
