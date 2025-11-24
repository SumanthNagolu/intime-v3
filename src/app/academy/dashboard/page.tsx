export const dynamic = "force-dynamic";
import { Dashboard } from '@/components/Dashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <Dashboard />
    </AppLayout>
  );
}
