/**
 * TA Campaigns List Page
 *
 * Uses metadata-driven ScreenRenderer for Campaign management.
 * @see src/screens/ta/ta-campaigns.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { taCampaignsScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function CampaignsListSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function TACampaignsPage() {
  return (
    <Suspense fallback={<CampaignsListSkeleton />}>
      <ScreenRenderer definition={taCampaignsScreen} />
    </Suspense>
  );
}
