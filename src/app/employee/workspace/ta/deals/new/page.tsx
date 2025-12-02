/**
 * Create Deal Page
 *
 * Uses metadata-driven ScreenRenderer for Deal creation.
 * @see src/screens/ta/deal-form.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers/ScreenRenderer';
import { dealCreateScreen } from '@/screens/ta';

export const dynamic = 'force-dynamic';

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6 max-w-4xl mx-auto">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function CreateDealPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ScreenRenderer definition={dealCreateScreen} />
    </Suspense>
  );
}
