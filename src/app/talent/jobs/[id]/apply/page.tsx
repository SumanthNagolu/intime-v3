/**
 * Talent Portal Application Flow Page
 *
 * Multi-step application wizard.
 * @see src/screens/portals/talent/talent-application-flow.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentApplicationFlowScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function ApplicationFlowSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-stone-200 rounded flex-1" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded" />
      <div className="flex justify-between">
        <div className="h-10 bg-stone-200 rounded w-24" />
        <div className="h-10 bg-stone-200 rounded w-24" />
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TalentApplicationFlowPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<ApplicationFlowSkeleton />}>
        <ScreenRenderer
          definition={talentApplicationFlowScreen}
          context={{ params: { jobId: id } }}
        />
      </Suspense>
    </AppLayout>
  );
}
