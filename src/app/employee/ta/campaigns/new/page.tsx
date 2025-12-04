/**
 * TA Campaign Builder Page
 *
 * Uses metadata-driven ScreenRenderer for the campaign builder UI.
 * @see src/screens/ta/campaign-builder.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { campaignBuilderScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function BuilderSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-6">
        <div className="w-64 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-stone-200 rounded" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TACampaignBuilderPage() {
  return (
    <AppLayout>
      <Suspense fallback={<BuilderSkeleton />}>
        <ScreenRenderer definition={campaignBuilderScreen} />
      </Suspense>
    </AppLayout>
  );
}
