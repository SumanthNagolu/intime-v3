export const dynamic = "force-dynamic";
import { JobCollector } from '@/components/bench/JobCollector';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <JobCollector />
    </AppLayout>
  );
}
