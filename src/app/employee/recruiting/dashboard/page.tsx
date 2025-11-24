export const dynamic = "force-dynamic";
import { RecruiterDashboard } from '@/components/recruiting/RecruiterDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruiterDashboard />
    </AppLayout>
  );
}
