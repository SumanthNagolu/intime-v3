/**
 * Admin Email Settings Page
 *
 * Email configuration and templates.
 * @see src/screens/admin/email-settings.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { emailSettingsScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function EmailSettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminEmailSettingsPage() {
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
