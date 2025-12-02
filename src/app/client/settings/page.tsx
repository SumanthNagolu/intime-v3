/**
 * Client Portal Settings Page
 *
 * Account settings, team management, and preferences.
 * @see src/screens/portals/client/client-settings.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientSettingsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-stone-200 rounded" />
        <div className="h-32 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

export default function ClientSettingsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SettingsSkeleton />}>
        <ScreenRenderer definition={clientSettingsScreen} />
      </Suspense>
    </AppLayout>
  );
}
