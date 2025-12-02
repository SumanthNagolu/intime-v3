/**
 * Talent Portal Job Search Page
 *
 * Job search with filters and recommended jobs.
 * @see src/screens/portals/talent/talent-job-search.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentJobSearchScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function JobSearchSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-stone-200 rounded" />
          ))}
        </div>
        <div className="col-span-3 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-stone-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TalentJobSearchPage() {
  return (
    <AppLayout>
      <Suspense fallback={<JobSearchSkeleton />}>
        <ScreenRenderer definition={talentJobSearchScreen} />
      </Suspense>
    </AppLayout>
  );
}
