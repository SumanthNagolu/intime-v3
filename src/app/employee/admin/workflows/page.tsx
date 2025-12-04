/**
 * Admin Workflows Hub Page
 *
 * Manage workflow configurations.
 * @see src/screens/admin/workflows-hub.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { workflowsHubScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function WorkflowsHubSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminWorkflowsPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<WorkflowsHubSkeleton />}>
          <ScreenRenderer definition={workflowsHubScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
