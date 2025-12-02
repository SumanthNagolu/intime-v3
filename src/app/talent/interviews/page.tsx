/**
 * Talent Portal Interviews Page
 *
 * Upcoming and past interviews with calendar view.
 * @see src/screens/portals/talent/talent-interviews.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentInterviewsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function InterviewsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TalentInterviewsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<InterviewsSkeleton />}>
        <ScreenRenderer definition={talentInterviewsScreen} />
      </Suspense>
    </AppLayout>
  );
}
