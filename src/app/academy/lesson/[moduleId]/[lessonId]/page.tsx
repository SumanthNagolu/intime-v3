export const dynamic = "force-dynamic";
import { Suspense } from 'react';
import { SynthesizedLessonView } from '@/components/academy/lesson/synthesized/SynthesizedLessonView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout immersive>
      <Suspense>
        <SynthesizedLessonView />
      </Suspense>
    </AppLayout>
  );
}
