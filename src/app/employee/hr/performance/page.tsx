export const dynamic = "force-dynamic";
import { PerformanceReviews } from '@/components/hr/PerformanceReviews';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <PerformanceReviews />
      </HRLayout>
    </AppLayout>
  );
}
