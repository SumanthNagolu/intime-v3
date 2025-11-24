export const dynamic = "force-dynamic";
import { LessonView } from '@/components/LessonView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <LessonView />
    </AppLayout>
  );
}
