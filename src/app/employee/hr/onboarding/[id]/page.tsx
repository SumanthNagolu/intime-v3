/**
 * Onboarding Detail Page
 *
 * Uses metadata-driven ScreenRenderer for individual onboarding UI.
 * @see src/screens/hr/onboarding-detail.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { onboardingDetailScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

interface PageProps {
  params: Promise<{ id: string }>;
}

function OnboardingDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-6">
        <div className="w-80 space-y-4">
          <div className="h-48 bg-stone-200 rounded-xl" />
          <div className="h-24 bg-stone-200 rounded-xl" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-stone-200 rounded-lg w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function OnboardingDetailPage({ params }: PageProps) {
  // params consumed by ScreenRenderer via useParams hook
  await params;

  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<OnboardingDetailSkeleton />}>
          <ScreenRenderer definition={onboardingDetailScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
