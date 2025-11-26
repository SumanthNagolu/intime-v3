export const dynamic = "force-dynamic";
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AppLayout } from '@/components/AppLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function Page() {
  return (
    <AppLayout>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AppLayout>
  );
}
