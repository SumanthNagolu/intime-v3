export const dynamic = "force-dynamic";
import { SalesAnalytics } from '@/components/sales/SalesAnalytics';
import { AppLayout } from '@/components/AppLayout';
import { TALayout } from '@/components/layouts/TALayout';

export default function Page() {
  return (
    <AppLayout>
      <TALayout>
        <SalesAnalytics />
      </TALayout>
    </AppLayout>
  );
}
