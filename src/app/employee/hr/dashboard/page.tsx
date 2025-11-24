export const dynamic = "force-dynamic";
import { HRDashboard } from '@/components/hr/HRDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRDashboard />
    </AppLayout>
  );
}
