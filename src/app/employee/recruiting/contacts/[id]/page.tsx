import { Suspense } from 'react';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { contactDetailScreen } from '@/screens/recruiting';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

function LoadingSkeleton() {
  return <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />;
}

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSkeleton />}>
        <ScreenRenderer definition={contactDetailScreen} context={{ params: { id } }} />
      </Suspense>
    </AppLayout>
  );
}
