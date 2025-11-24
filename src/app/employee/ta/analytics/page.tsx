export const dynamic = "force-dynamic";
import { SalesAnalytics } from '@/components/sales/SalesAnalytics';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <SalesAnalytics />
    </AppLayout>
  );
}
