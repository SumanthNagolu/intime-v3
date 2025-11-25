import { StudentInstructorView } from '@/components/academy/StudentInstructorView';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <AcademyLayout>
      <StudentInstructorView />
          </AcademyLayout>
    </AppLayout>
  );
}
