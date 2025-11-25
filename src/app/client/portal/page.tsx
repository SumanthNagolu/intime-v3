import { ClientPortal } from '@/components/client/ClientPortal';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <ClientPortal />
    </AppLayout>
  );
}
