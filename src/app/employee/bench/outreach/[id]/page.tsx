import { ClientOutreach } from '@/components/bench/ClientOutreach';
import { AppLayout } from '@/components/AppLayout';
import { BenchLayout } from '@/components/layouts/BenchLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <BenchLayout>
      <ClientOutreach />
      </BenchLayout>
    </AppLayout>
  );
}
