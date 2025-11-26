export const dynamic = "force-dynamic";
import { MediaStudio } from '@/components/MediaStudio';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <MediaStudio />
    </AcademyLayout>
  );
}
