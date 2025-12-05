'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Puzzle,
  MoreHorizontal,
  Edit,
  Eye,
  RefreshCw,
  Power,
  PowerOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
  error: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  error: 'Error',
}

const HEALTH_ICONS: Record<string, React.ReactNode> = {
  healthy: <CheckCircle className="w-4 h-4 text-green-600" />,
  degraded: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  unhealthy: <XCircle className="w-4 h-4 text-red-600" />,
  unknown: <Clock className="w-4 h-4 text-charcoal-400" />,
}

const TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  calendar: 'Calendar',
  video: 'Video',
  storage: 'Storage',
  hris: 'HRIS',
  payroll: 'Payroll',
  background_check: 'Background Check',
  job_board: 'Job Board',
  crm: 'CRM',
}

type Integration = {
  id: string
  name: string
  type: string
  provider: string
  status: string
  health_status: string
  is_primary: boolean
  last_health_check: string | null
  last_sync: string | null
  error_message: string | null
  error_count: number
  created_at: string
}

export function IntegrationsDashboard() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.integrations.getStats.useQuery()
  const alertsQuery = trpc.integrations.getCriticalAlerts.useQuery()
  const integrationsQuery = trpc.integrations.list.useQuery({
    search: search || undefined,
    type: typeFilter && typeFilter !== 'all' ? typeFilter as 'email' | 'sms' | 'calendar' | 'video' | 'storage' | 'hris' | 'payroll' | 'background_check' | 'job_board' | 'crm' : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' | 'error' : undefined,
    page,
    pageSize: 20,
  })

  const toggleStatusMutation = trpc.integrations.toggleStatus.useMutation({
    onSuccess: () => {
      utils.integrations.list.invalidate()
      utils.integrations.getStats.invalidate()
      utils.integrations.getCriticalAlerts.invalidate()
      toast.success('Integration status updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const runHealthCheckMutation = trpc.integrations.runHealthCheck.useMutation({
    onSuccess: (result) => {
      utils.integrations.list.invalidate()
      utils.integrations.getStats.invalidate()
      utils.integrations.getCriticalAlerts.invalidate()
      if (result.success) {
        toast.success(`Health check passed (${result.responseTimeMs}ms)`)
      } else {
        toast.error(`Health check failed: ${result.message}`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Health check failed')
    },
  })

  const deleteMutation = trpc.integrations.delete.useMutation({
    onSuccess: () => {
      utils.integrations.list.invalidate()
      utils.integrations.getStats.invalidate()
      toast.success('Integration deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete integration')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations' },
  ]

  const stats = statsQuery.data

  return (
    <DashboardShell
      title="Integrations"
      description="Configure and monitor external service integrations"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/integrations/new">
          <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </Link>
      }
    >
      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={<Puzzle className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          percentage={stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard
          label="Errors"
          value={stats?.error ?? 0}
          percentage={stats?.total ? Math.round((stats.error / stats.total) * 100) : 0}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="red"
        />
        <StatCard
          label="Inactive"
          value={stats?.inactive ?? 0}
          percentage={stats?.total ? Math.round((stats.inactive / stats.total) * 100) : 0}
          icon={<PowerOff className="w-5 h-5 text-charcoal-400" />}
        />
      </div>

      {/* Critical Alerts */}
      {alertsQuery.data && alertsQuery.data.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Critical Alerts
          </h3>
          <div className="space-y-2">
            {alertsQuery.data.map((alert) => (
              <div
                key={alert.id}
                className="bg-white rounded-lg p-3 border border-red-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal-900">
                    {alert.name} ({TYPE_LABELS[alert.type] ?? alert.type})
                  </p>
                  <p className="text-xs text-red-600">{alert.error_message}</p>
                  <p className="text-xs text-charcoal-500">
                    {alert.last_health_check
                      ? formatDistanceToNow(new Date(alert.last_health_check), { addSuffix: true })
                      : 'Never checked'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runHealthCheckMutation.mutate({ id: alert.id })}
                    disabled={runHealthCheckMutation.isPending}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${runHealthCheckMutation.isPending ? 'animate-spin' : ''}`} />
                    Reconnect
                  </Button>
                  <Link href={`/employee/admin/integrations/${alert.id}`}>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {integrationsQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : integrationsQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load integrations. Please try again.
            </div>
          ) : integrationsQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Puzzle className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No integrations found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || typeFilter || statusFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first integration'}
              </p>
              {!search && !typeFilter && !statusFilter && (
                <Link href="/employee/admin/integrations/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Integration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Health</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Last Check</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {integrationsQuery.data?.items.map((integration: Integration) => (
                  <tr key={integration.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                          <Puzzle className="w-5 h-5 text-charcoal-600" />
                        </div>
                        <div>
                          <Link
                            href={`/employee/admin/integrations/${integration.id}`}
                            className="font-medium text-charcoal-900 hover:text-hublot-600 flex items-center gap-2"
                          >
                            {integration.name}
                            {integration.is_primary && (
                              <span className="text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded">
                                PRIMARY
                              </span>
                            )}
                          </Link>
                          <p className="text-sm text-charcoal-500 capitalize">{integration.provider}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {TYPE_LABELS[integration.type] ?? integration.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[integration.status] ?? 'bg-charcoal-100 text-charcoal-600'}`}>
                        {STATUS_LABELS[integration.status] ?? integration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {HEALTH_ICONS[integration.health_status] ?? HEALTH_ICONS.unknown}
                        <span className="text-sm text-charcoal-600 capitalize">
                          {integration.health_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-500">
                      {integration.last_health_check
                        ? formatDistanceToNow(new Date(integration.last_health_check), { addSuffix: true })
                        : <span className="text-charcoal-400">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === integration.id ? null : integration.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === integration.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/integrations/${integration.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/employee/admin/integrations/${integration.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  runHealthCheckMutation.mutate({ id: integration.id })
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                <Activity className="w-4 h-4" />
                                Run Health Check
                              </button>
                              <button
                                onClick={() => {
                                  toggleStatusMutation.mutate({
                                    id: integration.id,
                                    status: integration.status === 'active' ? 'inactive' : 'active',
                                  })
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                {integration.status === 'active' ? (
                                  <>
                                    <PowerOff className="w-4 h-4" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-4 h-4" />
                                    Enable
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this integration?')) {
                                    deleteMutation.mutate({ id: integration.id })
                                  }
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {integrationsQuery.data && integrationsQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, integrationsQuery.data.pagination.total)} of {integrationsQuery.data.pagination.total} integrations
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= integrationsQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  percentage,
  icon,
  color,
}: {
  label: string
  value: number
  percentage?: number
  icon: React.ReactNode
  color?: 'green' | 'red'
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-charcoal-500">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-charcoal-900">{value}</span>
        {percentage !== undefined && (
          <span className={`text-sm ${
            color === 'green' ? 'text-green-600' :
            color === 'red' ? 'text-red-600' :
            'text-charcoal-500'
          }`}>
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  )
}
