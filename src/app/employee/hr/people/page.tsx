export const dynamic = "force-dynamic";
import { PeopleDirectory } from '@/components/hr/PeopleDirectory';
import { AppLayout } from '@/components/AppLayout';
import { HRLayout } from '@/components/layouts/HRLayout';

export default function Page() {
  return (
    <AppLayout>
      <HRLayout>
        <PeopleDirectory />
      </HRLayout>
    </AppLayout>
  );
}
