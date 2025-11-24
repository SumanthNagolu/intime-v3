export const dynamic = "force-dynamic";
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <ClientDashboard />
    </AppLayout>
  );
}
