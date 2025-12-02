/**
 * Academy Portal Course Detail Page
 *
 * Course overview with lessons list and enrollment.
 * @see src/screens/portals/academy/academy-course-detail.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyCourseDetailScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function CourseDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-48 bg-stone-200 rounded" />
          <div className="h-64 bg-stone-200 rounded" />
        </div>
        <div className="col-span-1 space-y-4">
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function AcademyCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<CourseDetailSkeleton />}>
        <ScreenRenderer
          definition={academyCourseDetailScreen}
          context={{ params: { courseId } }}
        />
      </Suspense>
    </AppLayout>
  );
}
