import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import {
  DashboardGrid,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'

const breadcrumbs = [
  { label: 'Admin', href: '/employee/admin' },
  { label: 'Dashboard' },
]

export function AdminDashboardSkeleton() {
  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor system health and manage platform settings"
        breadcrumbs={breadcrumbs}
      />

      {/* System Health Metrics Skeleton */}
      <DashboardSection title="System Health">
        <DashboardGrid columns={4}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-white" data-testid="loading-skeleton">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Critical Alerts Skeleton */}
      <DashboardSection title="Critical Alerts">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Quick Actions Skeleton */}
      <DashboardSection title="Quick Actions">
        <DashboardGrid columns={4}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Recent Activity Skeleton */}
      <DashboardSection
        title="Recent Activity"
        action={<Skeleton className="h-4 w-16" />}
      >
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </AdminPageContent>
  )
}
