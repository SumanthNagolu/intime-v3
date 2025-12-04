/**
 * Client Candidate Detail Page
 *
 * View candidate profile from client perspective.
 * @see src/screens/portals/client/client-candidate-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientCandidateDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-6">
        <div className="w-64">
          <div className="h-32 bg-stone-200 rounded-full mx-auto mb-4" />
          <div className="h-8 bg-stone-200 rounded" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-stone-200 rounded" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function ClientCandidateDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout showMentor={false}>
      <Suspense fallback={<DetailSkeleton />}>
        <ScreenRenderer
          definition={clientCandidateDetailScreen}
          context={{ params: { candidateId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
