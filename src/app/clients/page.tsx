export const dynamic = "force-dynamic";
import { ClientLanding } from '@/components/ClientLanding';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <ClientLanding />
    </AppLayout>
  );
}
