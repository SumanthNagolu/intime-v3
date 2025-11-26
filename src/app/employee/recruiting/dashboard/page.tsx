export const dynamic = "force-dynamic";
import { RecruiterDashboard } from '@/components/recruiting/RecruiterDashboard';
import { EmployeeLayout } from '@/components/layouts/EmployeeLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <EmployeeLayout>
      <RecruitingLayout>
        <RecruiterDashboard />
      </RecruitingLayout>
    </EmployeeLayout>
  );
}
