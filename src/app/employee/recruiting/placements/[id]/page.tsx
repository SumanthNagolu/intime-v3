import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { placementDetailScreen } from '@/screens/recruiting';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function LoadingSkeleton() {
  return <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSkeleton />}>
        <ScreenRenderer definition={placementDetailScreen} context={{ params: { id } }} />
      </Suspense>
    </AppLayout>
  );
}
