export const dynamic = "force-dynamic";
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AppLayout } from '@/components/AppLayout';

export default function Page() {
  return (
    <AppLayout>
      <AdminDashboard />
    </AppLayout>
  );
}
