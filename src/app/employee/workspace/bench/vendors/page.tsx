import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { vendorListScreen } from '@/screens/bench-sales';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function LoadingSkeleton() {
  return <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />;
}

export default async function Page() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSkeleton />}>
        <ScreenRenderer definition={vendorListScreen} />
      </Suspense>
    </AppLayout>
  );
}
