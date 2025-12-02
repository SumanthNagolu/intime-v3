/**
 * Talent Portal Offers Page
 *
 * Pending and past job offers.
 * @see src/screens/portals/talent/talent-offers.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentOffersScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function OffersSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TalentOffersPage() {
  return (
    <AppLayout>
      <Suspense fallback={<OffersSkeleton />}>
        <ScreenRenderer definition={talentOffersScreen} />
      </Suspense>
    </AppLayout>
  );
}
