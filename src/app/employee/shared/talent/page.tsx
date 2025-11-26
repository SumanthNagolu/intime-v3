import { SharedTalentPool } from '@/components/shared/SharedTalentPool';
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout';
import { SharedLayout } from '@/components/layouts/SharedLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <EmployeeLayout>
      <SharedLayout>
      <SharedTalentPool />
          </SharedLayout>
    </EmployeeLayout>
  );
}
