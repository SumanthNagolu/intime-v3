export const dynamic = "force-dynamic";
import { HRDashboard } from '@/components/hr/HRDashboard';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <HRDashboard />
      </HRLayout>
    </AppLayout>
  );
}
