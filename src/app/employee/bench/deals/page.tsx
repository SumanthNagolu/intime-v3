export const dynamic = "force-dynamic";
import { DealsPipeline } from '@/components/recruiting/DealsPipeline';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <DealsPipeline />
      </BenchLayout>
    </AppLayout>
  );
}
