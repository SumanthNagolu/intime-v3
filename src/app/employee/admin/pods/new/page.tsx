/**
 * Admin Pod Create Page
 *
 * Form to create a new pod/team.
 * @see src/screens/admin/pod-create.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { podCreateScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PodCreateSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="max-w-2xl space-y-4">
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded" />
        <div className="h-32 bg-stone-200 rounded" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
    </div>
  );
}

export default function AdminPodCreatePage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<PodCreateSkeleton />}>
          <ScreenRenderer definition={podCreateScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
