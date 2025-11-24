export const dynamic = "force-dynamic";
import { CEODashboard } from '@/components/executive/CEODashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <CEODashboard />
    </AppLayout>
  );
}
