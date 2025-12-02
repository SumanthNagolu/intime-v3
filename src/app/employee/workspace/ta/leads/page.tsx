/**
 * TA Leads List Page
 *
 * Uses metadata-driven ScreenRenderer for the Leads kanban/list UI.
 * @see src/screens/ta/ta-leads.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { taLeadsScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function LeadsListSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-72 h-96 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function TALeadsPage() {
  return (
    <Suspense fallback={<LeadsListSkeleton />}>
      <ScreenRenderer definition={taLeadsScreen} />
    </Suspense>
  );
}
