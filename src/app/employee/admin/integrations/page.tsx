/**
 * Admin Integrations Hub Page
 *
 * Manage third-party integrations.
 * @see src/screens/admin/integrations-hub.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { integrationsHubScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function IntegrationsHubSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<IntegrationsHubSkeleton />}>
          <ScreenRenderer definition={integrationsHubScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
