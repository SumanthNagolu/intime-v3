/**
 * Academy Portal Courses Catalog Page
 *
 * Browse all available courses with filters and categories.
 * @see src/screens/portals/academy/academy-courses-catalog.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyCoursesCatalogScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function CoursesCatalogSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4">
        <div className="h-10 bg-stone-200 rounded w-64" />
        <div className="h-10 bg-stone-200 rounded w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AcademyCoursesCatalogPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CoursesCatalogSkeleton />}>
        <ScreenRenderer definition={academyCoursesCatalogScreen} />
      </Suspense>
    </AppLayout>
  );
}
