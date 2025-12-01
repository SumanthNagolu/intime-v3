/**
 * Leads List Page
 * 
 * Uses metadata-driven ScreenRenderer for the leads list UI.
 * @see src/screens/crm/lead-list.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { leadListScreen } from '@/screens/crm';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="h-12 bg-stone-200 rounded" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-stone-200 rounded" />
      ))}
    </div>
  );
}

export default function LeadsListPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ListSkeleton />}>
        <ScreenRenderer definition={leadListScreen} />
      </Suspense>
    </AppLayout>
  );
}
