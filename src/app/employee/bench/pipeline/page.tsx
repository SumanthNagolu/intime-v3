export const dynamic = "force-dynamic";
import { PipelineView } from '@/components/recruiting/PipelineView';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <PipelineView />
      </BenchLayout>
    </AppLayout>
  );
}
