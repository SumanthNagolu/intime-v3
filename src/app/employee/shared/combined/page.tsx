import { CombinedView } from '@/components/shared/CombinedView';
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout';
import { SharedLayout } from '@/components/layouts/SharedLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <EmployeeLayout>
      <SharedLayout>
        <CombinedView />
      </SharedLayout>
    </EmployeeLayout>
  );
}
