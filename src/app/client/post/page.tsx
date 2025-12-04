/**
 * Client Job Post Page
 *
 * Form for clients to submit new job requests.
 * @see src/screens/portals/client/client-job-post.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { clientJobPostScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
      <div className="h-12 bg-stone-200 rounded w-1/3" />
      <div className="h-8 bg-stone-200 rounded w-1/2" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ClientJobPostPage() {
  return (
    <AppLayout showMentor={false}>
      <Suspense fallback={<FormSkeleton />}>
        <ScreenRenderer definition={clientJobPostScreen} />
      </Suspense>
    </AppLayout>
  );
}
