import { PayrollDashboard } from '@/components/hr/PayrollDashboard';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <PayrollDashboard />
          </HRLayout>
    </AppLayout>
  );
}
