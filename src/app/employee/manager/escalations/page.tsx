/**
 * Escalations Queue Page
 * 
 * Uses metadata-driven ScreenRenderer for the escalations queue UI.
 * @see src/screens/operations/escalations.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { escalationsScreen } from '@/screens/operations';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function QueueSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function EscalationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<QueueSkeleton />}>
        <ScreenRenderer definition={escalationsScreen} />
      </Suspense>
    </AppLayout>
  );
}

