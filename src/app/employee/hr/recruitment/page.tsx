import { Recruitment } from '@/components/hr/Recruitment';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <Recruitment />
          </HRLayout>
    </AppLayout>
  );
}
