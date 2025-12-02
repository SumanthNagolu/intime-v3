/**
 * Workflows Hub Page
 *
 * Central hub for configuring workflows and process automation.
 * @see src/screens/admin/workflows-hub.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { workflowsHubScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function WorkflowsHubSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function WorkflowsHubPage() {
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
