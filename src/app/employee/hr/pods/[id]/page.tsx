/**
 * Pod Detail Page
 *
 * Uses metadata-driven ScreenRenderer for individual pod/team UI.
 * @see src/screens/hr/pod-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { podDetailScreen } from '@/screens/hr/pod-detail.screen';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

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

export default async function PodDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<DetailSkeleton />}>
          <ScreenRenderer
            definition={podDetailScreen}
            context={{ params: { id } }}
          />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
