import { DealsPipeline } from '@/components/recruiting/DealsPipeline';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <BenchLayout>
      <DealsPipeline />
      </BenchLayout>
    </AppLayout>
  );
}
