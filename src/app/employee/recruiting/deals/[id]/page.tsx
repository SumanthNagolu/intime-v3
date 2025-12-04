/**
 * Deal Detail Page (Recruiting Module)
 *
 * Uses metadata-driven ScreenRenderer for the deal detail UI.
 * @see src/screens/recruiting/deal-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { dealDetailScreen } from '@/screens/recruiting/deal-detail.screen';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-64 bg-stone-200 rounded-xl" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <div className="h-48 bg-stone-200 rounded-xl" />
          <div className="h-64 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <RecruitingLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer
            definition={dealDetailScreen}
            context={{ params: { id } }}
          />
        </Suspense>
      </RecruitingLayout>
    </AppLayout>
  );
}
