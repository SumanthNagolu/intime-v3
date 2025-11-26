export const dynamic = "force-dynamic";
import { JobCollector } from '@/components/bench/JobCollector';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <JobCollector />
      </BenchLayout>
    </AppLayout>
  );
}
