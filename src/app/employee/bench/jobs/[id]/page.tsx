export const dynamic = "force-dynamic";
import { JobHuntRoom } from '@/components/bench/JobHuntRoom';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
      <JobHuntRoom />
      </BenchLayout>
    </AppLayout>
  );
}
