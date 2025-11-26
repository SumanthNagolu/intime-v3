export const dynamic = "force-dynamic";
import { NotificationsView } from '@/components/NotificationsView';
import { AcademyLayout } from '@/components/AcademyLayout';

export default function Page() {
  return (
    <AcademyLayout showMentor>
      <NotificationsView />
    </AcademyLayout>
  );
}
