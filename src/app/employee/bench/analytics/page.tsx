export const dynamic = "force-dynamic";
import { BenchAnalytics } from '@/components/bench/BenchAnalytics';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
        <BenchAnalytics />
      </BenchLayout>
    </AppLayout>
  );
}
