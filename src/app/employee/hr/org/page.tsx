import { OrgChart } from '@/components/hr/OrgChart';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <OrgChart />
          </HRLayout>
    </AppLayout>
  );
}
