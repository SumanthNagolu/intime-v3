/**
 * HR Recruitment Page
 *
 * Uses metadata-driven ScreenRenderer for talent acquisition.
 * @see src/screens/hr/recruitment.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { recruitmentScreen } from '@/screens/hr/recruitment.screen';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="flex gap-6">
        {['Requisitions', 'Candidates', 'Screening', 'Onboarding'].map((tab) => (
          <div key={tab} className="h-10 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function RecruitmentPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<DashboardSkeleton />}>
          <ScreenRenderer definition={recruitmentScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
