export const dynamic = "force-dynamic";
import { PayrollDashboard } from '@/components/hr/PayrollDashboard';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <PayrollDashboard />
      </HRLayout>
    </AppLayout>
  );
}
