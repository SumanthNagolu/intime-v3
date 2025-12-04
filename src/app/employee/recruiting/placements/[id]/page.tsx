/**
 * Placement Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the placement detail UI.
 * @see src/screens/recruiting/placement-screens.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { placementDetailScreen } from '@/screens/recruiting';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
        <div className="space-y-4">
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

export default async function PlacementDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer definition={placementDetailScreen} context={{ params: { id } }} />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
