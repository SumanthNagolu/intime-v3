export const dynamic = "force-dynamic";

import { AccountWorkspace } from '@/components/recruiting/AccountWorkspace';
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
        <AccountWorkspace accountId={id} />
      </RecruitingLayout>
    </AppLayout>
  );
}
