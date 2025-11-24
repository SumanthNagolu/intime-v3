export const dynamic = "force-dynamic";
import { RecruiterAnalytics } from '@/components/recruiting/RecruiterAnalytics';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruiterAnalytics />
    </AppLayout>
  );
}
