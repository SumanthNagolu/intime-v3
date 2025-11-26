export const dynamic = "force-dynamic";
import { StudentInstructorView } from '@/components/academy/StudentInstructorView';
import { AppLayout } from '@/components/AppLayout';
import { AcademyLayout } from '@/components/layouts/AcademyLayout';

export default function Page() {
  return (
    <AppLayout>
      <AcademyLayout>
        <StudentInstructorView />
      </AcademyLayout>
    </AppLayout>
  );
}
