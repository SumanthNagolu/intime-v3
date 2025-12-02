/**
 * Client Portal Placements Page
 *
 * List of active and historical placements.
 * @see src/screens/portals/client/client-placements.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientPlacementsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function PlacementsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ClientPlacementsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<PlacementsSkeleton />}>
        <ScreenRenderer definition={clientPlacementsScreen} />
      </Suspense>
    </AppLayout>
  );
}
