/**
 * Approval Detail Page
 *
 * Uses metadata-driven ScreenRenderer for the approval detail UI.
 * @see src/screens/operations/approval-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { approvalDetailScreen } from '@/screens/operations';
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
        <div className="md:col-span-2 space-y-4">
          <div className="h-24 bg-stone-200 rounded" />
          <div className="h-40 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-48 bg-stone-200 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-36 bg-stone-200 rounded" />
          <div className="h-28 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function ApprovalDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={approvalDetailScreen}
          context={{ params: { id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
