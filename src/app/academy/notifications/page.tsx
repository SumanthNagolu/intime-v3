export const dynamic = "force-dynamic";
import { NotificationsView } from '@/components/NotificationsView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout showMentor>
      <NotificationsView />
    </AppLayout>
  );
}
