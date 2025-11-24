export const dynamic = "force-dynamic";
import { ModulesList } from '@/components/ModulesList';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <ModulesList />
    </AppLayout>
  );
}
