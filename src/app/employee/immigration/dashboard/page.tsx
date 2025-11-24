export const dynamic = "force-dynamic";
import { CrossBorderDashboard } from '@/components/immigration/CrossBorderDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <CrossBorderDashboard />
    </AppLayout>
  );
}
