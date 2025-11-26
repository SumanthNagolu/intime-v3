export const dynamic = "force-dynamic";
import { ProfileView } from '@/components/ProfileView';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <ProfileView />
    </AcademyLayout>
  );
}
