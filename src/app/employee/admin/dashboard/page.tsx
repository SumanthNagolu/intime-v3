import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { AdminDashboard, AdminDashboardSkeleton, type AdminDashboardInitialData } from '@/components/admin'

export const dynamic = 'force-dynamic'

async function AdminDashboardServer() {
  const caller = await getServerCaller()

  // Fetch all admin dashboard data in parallel on the server
  const [systemHealth, criticalAlerts, recentActivity] = await Promise.all([
    caller.admin.getSystemHealth().catch(() => undefined),
    caller.admin.getCriticalAlerts().catch(() => undefined),
    caller.admin.getRecentActivity().catch(() => undefined),
  ])

  const initialData: AdminDashboardInitialData = {
    systemHealth,
    criticalAlerts,
    recentActivity,
  }

  return <AdminDashboard initialData={initialData} />
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardServer />
    </Suspense>
  )
}
