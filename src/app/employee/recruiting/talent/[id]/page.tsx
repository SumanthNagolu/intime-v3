export const dynamic = "force-dynamic";
import { TalentWorkspace } from '@/components/recruiting/TalentWorkspace';
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
        <TalentWorkspace talentId={id} />
      </RecruitingLayout>
    </AppLayout>
  );
}
