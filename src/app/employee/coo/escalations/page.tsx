/**
 * COO Escalations Overview Page
 *
 * Uses metadata-driven ScreenRenderer for org-wide escalations UI.
 * @see src/screens/operations/coo-escalations.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { cooEscalationsScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded w-full" />
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function COOEscalationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <ScreenRenderer definition={cooEscalationsScreen} />
      </Suspense>
    </AppLayout>
  );
}
