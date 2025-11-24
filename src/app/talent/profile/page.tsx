export const dynamic = "force-dynamic";
import { ProfileView } from '@/components/ProfileView';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <ProfileView />
    </AppLayout>
  );
}
