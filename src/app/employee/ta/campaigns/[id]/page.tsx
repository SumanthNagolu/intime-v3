/**
 * TA Campaign Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the campaign detail UI.
 * @see src/screens/ta/campaign-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { campaignDetailScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded" />
      <div className="h-64 bg-stone-200 rounded" />
      <div className="h-48 bg-stone-200 rounded" />
    </div>
  );
}

export default async function TACampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={campaignDetailScreen}
          context={{ params: { id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
