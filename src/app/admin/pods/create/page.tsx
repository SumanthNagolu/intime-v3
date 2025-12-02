/**
 * Pod Create Page
 *
 * Multi-step wizard for creating new pods/teams.
 * @see src/screens/admin/pod-create.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { podCreateScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function PodCreateSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
      <div className="h-8 bg-stone-200 rounded w-1/2" />
      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-2 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PodCreatePage() {
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
