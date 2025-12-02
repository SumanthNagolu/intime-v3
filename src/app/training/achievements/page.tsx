/**
 * Academy Portal Achievements Page
 *
 * Badges, achievements, and streak history.
 * @see src/screens/portals/academy/academy-achievements.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyAchievementsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function AchievementsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded" />
        ))}
      </div>
      <div className="h-64 bg-stone-200 rounded" />
    </div>
  );
}

export default function AcademyAchievementsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<AchievementsSkeleton />}>
        <ScreenRenderer definition={academyAchievementsScreen} />
      </Suspense>
    </AppLayout>
  );
}
