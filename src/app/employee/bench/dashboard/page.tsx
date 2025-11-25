export const dynamic = "force-dynamic";
import { BenchDashboard } from '@/components/bench/BenchDashboard';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
      <BenchDashboard />
            </BenchLayout>
    </AppLayout>
  );
}
