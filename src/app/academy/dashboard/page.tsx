export const dynamic = "force-dynamic";
import { CandidateDashboard } from '@/components/academy/CandidateDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <CandidateDashboard />
    </AppLayout>
  );
}
