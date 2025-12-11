'use client'

import { trpc } from '@/lib/trpc/client'
import {
  DashboardGrid,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ActivityFeedWidget } from '@/components/dashboard/ActivityFeedWidget'
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget'
import { SystemHealthSkeleton } from './SystemHealthSkeleton'
import { AlertsSection } from './AlertsSection'
import {
  Users,
  Plug,
  Clock,
  HardDrive,
  CheckCircle,
  UserPlus,
  FolderPlus,
  FileText,
  Settings,
  AlertTriangle,
  LogIn,
} from 'lucide-react'
import Link from 'next/link'

// Types for initial data from server
interface SystemHealth {
  activeUsers: number
  activeIntegrations: number
  totalIntegrations: number
  pendingApprovals: number
  uptime: number
  storageUsed: number
  storageTotal: number
}

interface CriticalAlert {
  id: string
  title: string
  message: string | null
  type: string
  severity: 'critical' | 'warning'
  createdAt: string
}

interface RecentActivity {
  id: string
  action: string
  entity: string
  actor: string | null
  timestamp: string
  details: unknown
}

export interface AdminDashboardInitialData {
  systemHealth?: SystemHealth
  criticalAlerts?: CriticalAlert[]
  recentActivity?: RecentActivity[]
}

interface AdminDashboardProps {
  initialData?: AdminDashboardInitialData
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const healthQuery = trpc.admin.getSystemHealth.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: false, // Don't retry on auth errors
    initialData: initialData?.systemHealth,
    enabled: !initialData?.systemHealth,
  })

  const alertsQuery = trpc.admin.getCriticalAlerts.useQuery(undefined, {
    retry: false,
    initialData: initialData?.criticalAlerts,
    enabled: !initialData?.criticalAlerts,
  })

  const activityQuery = trpc.admin.getRecentActivity.useQuery(undefined, {
    retry: false,
    initialData: initialData?.recentActivity,
    enabled: !initialData?.recentActivity,
  })

  // Check for auth errors
  const isAuthError = healthQuery.error?.message?.includes('logged in') ||
    healthQuery.error?.message?.includes('UNAUTHORIZED') ||
    healthQuery.error?.message?.includes('organization') ||
    healthQuery.error?.message?.includes('FORBIDDEN')

  // Show login prompt if not authenticated
  if (isAuthError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-3">
            Authentication Required
          </h2>
          <p className="text-charcoal-600 mb-6">
            You need to be signed in to access the Admin Dashboard. Please sign in to continue.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-hublot-900 text-white rounded-lg font-semibold hover:bg-hublot-800 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Dashboard' },
  ]

  const quickActions = [
    {
      id: 'add-user',
      label: 'Add User',
      description: 'Create a new user account',
      href: '/employee/admin/users/new',
      icon: UserPlus,
      variant: 'primary' as const,
    },
    {
      id: 'create-pod',
      label: 'Create Pod',
      description: 'Create a new team pod',
      href: '/employee/admin/pods/new',
      icon: FolderPlus,
    },
    {
      id: 'audit-logs',
      label: 'View Audit Logs',
      description: 'Review system audit trail',
      href: '/employee/admin/audit',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'System Settings',
      description: 'Configure system settings',
      href: '/employee/admin/settings',
      icon: Settings,
    },
  ]

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor system health and manage platform settings"
        breadcrumbs={breadcrumbs}
      />
      {/* System Health Metrics */}
      <DashboardSection title="System Health">
        {healthQuery.isLoading ? (
          <SystemHealthSkeleton />
        ) : healthQuery.error ? (
          <div className="card-premium p-6 text-center text-red-600">
            Failed to load system health data. Please try again.
          </div>
        ) : (
          <DashboardGrid columns={4}>
            <StatsCard
              title="Active Users"
              value={healthQuery.data?.activeUsers ?? 0}
              icon={Users}
            />
            <StatsCard
              title="Integrations"
              value={`${healthQuery.data?.activeIntegrations ?? 0}/${healthQuery.data?.totalIntegrations ?? 0}`}
              changeLabel="active"
              icon={Plug}
              variant={
                (healthQuery.data?.activeIntegrations ?? 0) < (healthQuery.data?.totalIntegrations ?? 0)
                  ? 'warning'
                  : 'success'
              }
            />
            <StatsCard
              title="Pending Approvals"
              value={healthQuery.data?.pendingApprovals ?? 0}
              icon={CheckCircle}
              variant={
                (healthQuery.data?.pendingApprovals ?? 0) > 10
                  ? 'warning'
                  : 'default'
              }
            />
            <StatsCard
              title="Uptime"
              value={`${healthQuery.data?.uptime ?? 0}%`}
              icon={Clock}
              variant="success"
            />
            <StatsCard
              title="Storage Used"
              value={`${healthQuery.data?.storageUsed ?? 0}%`}
              changeLabel="of total"
              icon={HardDrive}
              variant={
                (healthQuery.data?.storageUsed ?? 0) > 80
                  ? 'warning'
                  : 'default'
              }
            />
          </DashboardGrid>
        )}
      </DashboardSection>

      {/* Critical Alerts */}
      <AlertsSection
        alerts={alertsQuery.data ?? []}
        isLoading={alertsQuery.isLoading}
      />

      {/* Quick Actions */}
      <DashboardSection title="Quick Actions">
        <QuickActionsWidget actions={quickActions} columns={4} title="" />
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        title="Recent Activity"
        action={
          <a
            href="/employee/admin/audit"
            className="text-sm text-gold-600 hover:text-gold-700"
          >
            View All
          </a>
        }
      >
        {activityQuery.isLoading ? (
          <div className="bg-white rounded-xl border border-charcoal-100 p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : (
          <ActivityFeedWidget
            title=""
            activities={activityQuery.data?.map(a => ({
              id: a.id,
              title: `${a.action} ${a.entity}`,
              description: a.actor ?? 'System',
              timestamp: new Date(a.timestamp),
              icon: FileText,
            })) ?? []}
            maxItems={10}
            showViewAll={false}
          />
        )}
      </DashboardSection>
    </AdminPageContent>
  )
}
