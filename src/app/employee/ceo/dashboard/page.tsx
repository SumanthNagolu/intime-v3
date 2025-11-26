export const dynamic = "force-dynamic";
import { CEODashboard } from '@/components/executive/CEODashboard';
import { AppLayout } from '@/components/AppLayout';
import { CEOLayout } from '@/components/layouts/CEOLayout';

export default function Page() {
  return (
    <AppLayout>
      <CEOLayout>
        <CEODashboard />
      </CEOLayout>
    </AppLayout>
  );
}
