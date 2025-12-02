/**
 * Onboarding Queue Page
 *
 * Uses metadata-driven ScreenRenderer for the onboarding list UI.
 * @see src/screens/hr/onboarding-list.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { onboardingListScreen } from '@/screens/hr';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function OnboardingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<OnboardingSkeleton />}>
          <ScreenRenderer definition={onboardingListScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
