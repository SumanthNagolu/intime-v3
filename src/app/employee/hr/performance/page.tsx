import { PerformanceReviews } from '@/components/hr/PerformanceReviews';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <PerformanceReviews />
          </HRLayout>
    </AppLayout>
  );
}
