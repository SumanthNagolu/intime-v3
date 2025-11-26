export const dynamic = "force-dynamic";
import { InterviewDojo } from '@/components/academy/InterviewDojo';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <InterviewDojo />
    </AcademyLayout>
  );
}
