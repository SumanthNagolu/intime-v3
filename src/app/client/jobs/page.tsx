import { ClientJobsList } from '@/components/client/ClientJobsList';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <ClientJobsList />
    </AppLayout>
  );
}
