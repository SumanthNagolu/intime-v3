export const dynamic = "force-dynamic";
import { TADashboard } from '@/components/sales/TADashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <TADashboard />
    </AppLayout>
  );
}
