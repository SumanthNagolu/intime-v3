/**
 * Academy Portal Lesson View Page
 *
 * Individual lesson content with video, quiz, and navigation.
 * @see src/screens/portals/academy/academy-lesson-view.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyLessonViewScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function LessonViewSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="h-96 bg-stone-200 rounded" />
        </div>
        <div className="col-span-3 space-y-4">
          <div className="h-64 bg-stone-200 rounded" />
          <div className="h-24 bg-stone-200 rounded" />
          <div className="h-32 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function AcademyLessonViewPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;

  return (
    <AppLayout>
      <Suspense fallback={<LessonViewSkeleton />}>
        <ScreenRenderer
          definition={academyLessonViewScreen}
          context={{ params: { courseId, lessonId } }}
        />
      </Suspense>
    </AppLayout>
  );
}
