/**
 * Campaign Builder Page
 *
 * Uses metadata-driven ScreenRenderer for multi-step campaign wizard.
 * @see src/screens/ta/campaign-builder.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { campaignBuilderScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function WizardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-8 h-8 bg-stone-200 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function CampaignBuilderPage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <ScreenRenderer definition={campaignBuilderScreen} />
    </Suspense>
  );
}
