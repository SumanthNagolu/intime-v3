export const dynamic = "force-dynamic";
import { ClientOutreach } from '@/components/bench/ClientOutreach';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export default function Page() {
  return (
    <AppLayout>
      <BenchLayout>
      <ClientOutreach />
            </BenchLayout>
    </AppLayout>
  );
}
