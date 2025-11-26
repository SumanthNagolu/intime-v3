export const dynamic = "force-dynamic";
import { SubmissionBuilder } from '@/components/recruiting/SubmissionBuilder';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export default function Page() {
  return (
    <AppLayout>
      <RecruitingLayout>
      <SubmissionBuilder />
      </RecruitingLayout>
    </AppLayout>
  );
}
