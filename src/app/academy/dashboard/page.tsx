export const dynamic = "force-dynamic";
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <AcademyDashboard />
    </AppLayout>
  );
}
