/**
 * Client Portal Submission Detail Page
 *
 * Detailed view of a candidate submission with skills match and resume.
 * @see src/screens/portals/client/client-submission-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientSubmissionDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function SubmissionDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
        <div className="col-span-2 h-96 bg-stone-200 rounded" />
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientSubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<SubmissionDetailSkeleton />}>
        <ScreenRenderer
          definition={clientSubmissionDetailScreen}
          context={{ params: { submissionId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
