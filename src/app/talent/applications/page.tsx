/**
 * Talent Portal Applications List Page
 *
 * List of all job applications with status tracking.
 * @see src/screens/portals/talent/talent-applications.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentApplicationsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function ApplicationsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TalentApplicationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ApplicationsSkeleton />}>
        <ScreenRenderer definition={talentApplicationsScreen} />
      </Suspense>
    </AppLayout>
  );
}
