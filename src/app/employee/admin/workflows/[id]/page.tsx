/**
 * Admin Workflow Editor Page
 *
 * Visual workflow editor with state transitions and actions.
 * @see src/screens/admin/workflow-editor.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { workflowEditorScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function WorkflowEditorSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function AdminWorkflowEditorPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<WorkflowEditorSkeleton />}>
          <ScreenRenderer definition={workflowEditorScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
