export const dynamic = "force-dynamic";
import { ClientOutreach } from '@/components/bench/ClientOutreach';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <ClientOutreach />
    </AppLayout>
  );
}
