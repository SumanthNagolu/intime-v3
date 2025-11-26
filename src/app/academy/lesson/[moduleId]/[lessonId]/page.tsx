export const dynamic = "force-dynamic";
import { LessonView } from '@/components/LessonView';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <LessonView />
    </AcademyLayout>
  );
}
