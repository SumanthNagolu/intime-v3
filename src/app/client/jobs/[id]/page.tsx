import { ClientJobDetail } from '@/components/client/ClientJobDetail';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <ClientJobDetail />
    </AppLayout>
  );
}
