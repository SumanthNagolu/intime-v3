/**
 * Duplicate Detection Page
 *
 * Duplicate scanning and merging with configurable match methods.
 * @see src/screens/admin/duplicate-detection.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { duplicateDetectionScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DuplicateDetectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-stone-200 rounded-lg" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function DuplicateDetectionPage() {
  return (
    <AppLayout>
      <AdminLayout>
        <Suspense fallback={<DuplicateDetectionSkeleton />}>
          <ScreenRenderer definition={duplicateDetectionScreen} />
        </Suspense>
      </AdminLayout>
    </AppLayout>
  );
}
