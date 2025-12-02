/**
 * Lead Detail Page
 *
 * Uses metadata-driven ScreenRenderer for Lead detail with BANT qualification.
 * @see src/screens/ta/lead-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { leadDetailScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex gap-6">
        <div className="w-80 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-200 rounded" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-stone-200 rounded" />
          <div className="h-64 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ScreenRenderer definition={leadDetailScreen} context={{ params: { id } }} />
    </Suspense>
  );
}
