export const dynamic = "force-dynamic";
import { HotlistBuilder } from '@/components/bench/HotlistBuilder';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <HotlistBuilder />
      </BenchLayout>
    </AppLayout>
  );
}
