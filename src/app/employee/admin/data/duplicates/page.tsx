/**
 * Admin Duplicate Detection Page
 *
 * Detect and merge duplicate records across entities.
 * @see src/screens/admin/duplicate-detection.screen.ts
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { duplicateDetectionScreen } from '@/screens/admin';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';

function DuplicateDetectionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-48" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AdminDuplicatesPage() {
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
