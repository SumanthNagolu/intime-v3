/**
 * Team Management Page
 *
 * Uses metadata-driven ScreenRenderer for the team management UI.
 * @see src/screens/operations/team-management.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { teamManagementScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function TeamSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TeamManagementPage() {
  return (
    <AppLayout>
      <Suspense fallback={<TeamSkeleton />}>
        <ScreenRenderer definition={teamManagementScreen} />
      </Suspense>
    </AppLayout>
  );
}
