export const dynamic = "force-dynamic";
import { InterviewStudio } from '@/components/InterviewStudio';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <InterviewStudio />
    </AppLayout>
  );
}
