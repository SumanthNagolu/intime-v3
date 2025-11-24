export const dynamic = "force-dynamic";
import { ClientWelcome } from '@/components/ClientWelcome';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <ClientWelcome />
    </AppLayout>
  );
}
