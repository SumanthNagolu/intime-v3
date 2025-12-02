/**
 * Workflow Editor Page
 *
 * Visual workflow editor for configuring stages and transitions.
 * @see src/screens/admin/workflow-editor.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { workflowEditorScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function WorkflowEditorSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="h-96 bg-stone-200 rounded-lg" />
    </div>
  );
}

export default function WorkflowEditorPage() {
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
