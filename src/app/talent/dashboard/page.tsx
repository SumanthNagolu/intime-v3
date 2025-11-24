export const dynamic = "force-dynamic";
import { TalentDashboard } from '@/components/talent/TalentDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <TalentDashboard />
    </AppLayout>
  );
}
