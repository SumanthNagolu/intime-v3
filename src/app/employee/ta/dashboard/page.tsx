export const dynamic = "force-dynamic";
import { TADashboard } from '@/components/sales/TADashboard';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
      <TADashboard />
          </TALayout>
    </AppLayout>
  );
}
