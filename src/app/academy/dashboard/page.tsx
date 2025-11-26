export const dynamic = "force-dynamic";
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <AcademyDashboard />
    </AcademyLayout>
  );
}
