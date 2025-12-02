/**
 * Client Portal Interviews Page
 *
 * Calendar and list view of all scheduled interviews.
 * @see src/screens/portals/client/client-interviews.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientInterviewsScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function InterviewsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="flex gap-4 border-b pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-stone-200 rounded w-24" />
        ))}
      </div>
      <div className="h-96 bg-stone-200 rounded" />
    </div>
  );
}

export default function ClientInterviewsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<InterviewsSkeleton />}>
        <ScreenRenderer definition={clientInterviewsScreen} />
      </Suspense>
    </AppLayout>
  );
}
