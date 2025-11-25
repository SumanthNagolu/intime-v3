import { PeopleDirectory } from '@/components/hr/PeopleDirectory';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <HRLayout>
      <PeopleDirectory />
          </HRLayout>
    </AppLayout>
  );
}
