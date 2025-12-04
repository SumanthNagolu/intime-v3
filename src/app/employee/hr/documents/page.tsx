/**
 * HR Documents Page
 *
 * Uses metadata-driven ScreenRenderer for document management.
 * @see src/screens/hr/documents.screen.ts
 */

export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { documentsScreen } from '@/screens/hr/documents.screen';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="flex gap-6">
        <div className="w-48 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-stone-200 rounded" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-stone-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <AppLayout>
      <HRLayout>
        <Suspense fallback={<ListSkeleton />}>
          <ScreenRenderer definition={documentsScreen} />
        </Suspense>
      </HRLayout>
    </AppLayout>
  );
}
