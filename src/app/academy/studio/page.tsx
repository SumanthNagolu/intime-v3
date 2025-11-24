export const dynamic = "force-dynamic";
import { MediaStudio } from '@/components/MediaStudio';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <MediaStudio />
    </AppLayout>
  );
}
