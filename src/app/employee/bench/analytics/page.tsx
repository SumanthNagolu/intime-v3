export const dynamic = "force-dynamic";
import { BenchAnalytics } from '@/components/bench/BenchAnalytics';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchAnalytics />
    </AppLayout>
  );
}
