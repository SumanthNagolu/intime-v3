export const dynamic = "force-dynamic";
import { AcademyPortal } from '@/components/academy/AcademyPortal';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <AcademyPortal />
    </AcademyLayout>
  );
}
