/**
 * TA Lead Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the lead detail UI.
 * @see src/screens/ta/lead-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { leadDetailScreen } from '@/screens/ta';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="h-12 bg-stone-200 rounded" />
          <div className="h-64 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function TALeadDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={leadDetailScreen}
          context={{ params: { id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
