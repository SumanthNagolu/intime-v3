import { PostJobOrder } from '@/components/recruiting/PostJobOrder';
import { AppLayout } from '@/components/AppLayout';

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AppLayout showMentor={false}>
      <PostJobOrder />
    </AppLayout>
  );
}
