/**
 * Talent Portal Offer Detail Page
 *
 * Offer letter details with accept/decline actions.
 * @see src/screens/portals/talent/talent-offer-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentOfferDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function OfferDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="h-96 bg-stone-200 rounded" />
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

export default async function TalentOfferDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<OfferDetailSkeleton />}>
        <ScreenRenderer
          definition={talentOfferDetailScreen}
          context={{ params: { offerId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
