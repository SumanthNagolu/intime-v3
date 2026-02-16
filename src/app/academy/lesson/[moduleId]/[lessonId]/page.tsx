export const dynamic = "force-dynamic";
import { Suspense } from 'react';
import { LessonPresentationView } from '@/components/academy/lesson/LessonPresentationView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout immersive>
      <Suspense>
        <LessonPresentationView />
      </Suspense>
    </AppLayout>
  );
}
