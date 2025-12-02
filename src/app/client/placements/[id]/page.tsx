/**
 * Client Portal Placement Detail Page
 *
 * Placement details with consultant info, timeline, and actions.
 * @see src/screens/portals/client/client-placement-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientPlacementDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function PlacementDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-200 rounded" />
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientPlacementDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<PlacementDetailSkeleton />}>
        <ScreenRenderer
          definition={clientPlacementDetailScreen}
          context={{ params: { placementId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
