import { SubmissionBuilder } from '@/components/recruiting/SubmissionBuilder';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={true}>
      <RecruitingLayout>
      <SubmissionBuilder />
      </RecruitingLayout>
    </AppLayout>
  );
}
