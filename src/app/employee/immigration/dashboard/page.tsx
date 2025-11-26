export const dynamic = "force-dynamic";
import { CrossBorderDashboard } from '@/components/immigration/CrossBorderDashboard';
import { AppLayout } from '@/components/AppLayout';
import { ImmigrationLayout } from '@/components/layouts/ImmigrationLayout';

export default function Page() {
  return (
    <AppLayout>
      <ImmigrationLayout>
        <CrossBorderDashboard />
      </ImmigrationLayout>
    </AppLayout>
  );
}
