/**
 * Talent Portal Saved Jobs Page
 *
 * List of saved/bookmarked jobs.
 * @see src/screens/portals/talent/talent-saved-jobs.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentSavedJobsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function SavedJobsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TalentSavedJobsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<SavedJobsSkeleton />}>
        <ScreenRenderer definition={talentSavedJobsScreen} />
      </Suspense>
    </AppLayout>
  );
}
