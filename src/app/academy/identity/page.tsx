export const dynamic = "force-dynamic";
import { PersonaView } from '@/components/PersonaView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <PersonaView />
    </AppLayout>
  );
}
