export const dynamic = "force-dynamic";
import { EmployeePortal } from '@/components/employee/EmployeePortal';
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout';

export const metadata = {
  title: 'InTime OS - Employee Portal | InTime',
  description: 'Internal operations hub for InTime employees',
};

export default function Page() {
  return (
    <EmployeeLayout>
      <EmployeePortal />
    </EmployeeLayout>
  );
}
