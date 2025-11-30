export const dynamic = "force-dynamic";
import { SubmissionWorkspace } from '@/components/recruiting/SubmissionWorkspace';
import { AppLayout } from '@/components/AppLayout';
import { RecruitingLayout } from '@/components/layouts/RecruitingLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <RecruitingLayout>
        <SubmissionWorkspace submissionId={id} />
      </RecruitingLayout>
    </AppLayout>
  );
}
