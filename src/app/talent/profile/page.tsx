/**
 * Talent Portal Profile Page
 *
 * Candidate profile editor with experience, skills, and documents.
 * @see src/screens/portals/talent/talent-profile.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { talentProfileScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="h-64 bg-stone-200 rounded" />
        </div>
        <div className="col-span-2 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TalentProfilePage() {
  return (
    <AppLayout>
      <Suspense fallback={<ProfileSkeleton />}>
        <ScreenRenderer definition={talentProfileScreen} />
      </Suspense>
    </AppLayout>
  );
}
