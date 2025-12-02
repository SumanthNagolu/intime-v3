/**
 * Academy Portal Certificates Page
 *
 * View and download earned certificates.
 * @see src/screens/portals/academy/academy-certificates.screen.ts
 */

import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { academyCertificatesScreen } from '@/screens/portals';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = 'force-dynamic';

function CertificatesSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-stone-200 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-stone-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AcademyCertificatesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CertificatesSkeleton />}>
        <ScreenRenderer definition={academyCertificatesScreen} />
      </Suspense>
    </AppLayout>
  );
}
