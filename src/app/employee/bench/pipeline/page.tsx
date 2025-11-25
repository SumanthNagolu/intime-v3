import { PipelineView } from '@/components/recruiting/PipelineView';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <BenchLayout>
      <PipelineView />
      </BenchLayout>
    </AppLayout>
  );
}
