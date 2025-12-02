/**
 * Email Settings Page
 *
 * Email provider configuration, SMTP settings, and templates.
 * @see src/screens/admin/email-settings.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { emailSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function EmailSettingsSkeleton() {
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

export default function EmailSettingsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<EmailSettingsSkeleton />}>
          <ScreenRenderer definition={emailSettingsScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
