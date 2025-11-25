import { ClientPipeline } from '@/components/client/ClientPipeline';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <ClientPipeline />
    </AppLayout>
  );
}
