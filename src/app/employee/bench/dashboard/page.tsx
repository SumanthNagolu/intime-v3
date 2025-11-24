export const dynamic = "force-dynamic";
import { BenchDashboard } from '@/components/bench/BenchDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchDashboard />
    </AppLayout>
  );
}
