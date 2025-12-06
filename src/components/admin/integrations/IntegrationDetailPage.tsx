'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Settings,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS/Text',
  calendar: 'Calendar',
  video: 'Video Conferencing',
  storage: 'File Storage',
  hris: 'HRIS',
  payroll: 'Payroll',
  background_check: 'Background Check',
  job_board: 'Job Boards',
  crm: 'CRM',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
  error: 'bg-red-100 text-red-800',
}

const HEALTH_STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  healthy: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200'
  },
  degraded: {
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200'
  },
  unhealthy: {
    icon: <XCircle className="w-5 h-5" />,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200'
  },
  unknown: {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-charcoal-400',
    bg: 'bg-charcoal-50 border-charcoal-200'
  },
}

interface IntegrationDetailPageProps {
  paramsPromise: Promise<{ id: string }>
}

export function IntegrationDetailPage({ paramsPromise }: IntegrationDetailPageProps) {
  const params = use(paramsPromise)
  const integrationId = params.id

  const router = useRouter()
  const utils = trpc.useUtils()

  const { data: integration, isLoading, error } = trpc.integrations.getById.useQuery({ id: integrationId })
  const { data: healthLogs, isLoading: isLoadingLogs } = trpc.integrations.getHealthLogs.useQuery(
    { integrationId, limit: 50 },
    { enabled: !!integrationId }
  )
  const { data: oauthStatus, isLoading: isLoadingOAuth } = trpc.integrations.getOAuthStatus.useQuery(
    { integrationId },
    { enabled: !!integrationId }
  )

  const toggleStatusMutation = trpc.integrations.toggleStatus.useMutation({
    onSuccess: () => {
      utils.integrations.getById.invalidate({ id: integrationId })
      utils.integrations.list.invalidate()
      toast.success('Status updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const runHealthCheckMutation = trpc.integrations.runHealthCheck.useMutation({
    onSuccess: (result) => {
      utils.integrations.getById.invalidate({ id: integrationId })
      utils.integrations.getHealthLogs.invalidate({ integrationId })
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
      toast.success('Integration deleted')
      router.push('/employee/admin/integrations')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete')
    },
  })

  const initiateOAuthMutation = trpc.integrations.initiateOAuth.useMutation({
    onSuccess: (data) => {
      // Redirect to OAuth provider
      window.location.href = data.authUrl
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to initiate OAuth')
    },
  })

  const disconnectOAuthMutation = trpc.integrations.disconnectOAuth.useMutation({
    onSuccess: () => {
      toast.success('OAuth disconnected')
      utils.integrations.getOAuthStatus.invalidate({ integrationId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disconnect OAuth')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: integration?.name || 'Details' },
  ]

  if (isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !integration) {
    return (
      <DashboardShell title="Error" breadcrumbs={breadcrumbs}>
        <div className="text-center p-12">
          <p className="text-red-600 mb-4">Integration not found</p>
          <Link href="/employee/admin/integrations">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Integrations
            </Button>
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const healthConfig = HEALTH_STATUS_CONFIG[integration.health_status] || HEALTH_STATUS_CONFIG.unknown

  return (
    <DashboardShell
      title={integration.name}
      description={integration.description || `${TYPE_LABELS[integration.type]} integration via ${integration.provider}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Link href="/employee/admin/integrations">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Link href={`/employee/admin/integrations/${integrationId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Status Card */}
          <div className={`rounded-lg border p-6 ${healthConfig.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={healthConfig.color}>{healthConfig.icon}</div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 capitalize">
                    {integration.health_status}
                  </h3>
                  <p className="text-sm text-charcoal-500">
                    {integration.last_health_check
                      ? `Last checked ${formatDistanceToNow(new Date(integration.last_health_check), { addSuffix: true })}`
                      : 'Never checked'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => runHealthCheckMutation.mutate({ id: integrationId })}
                disabled={runHealthCheckMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${runHealthCheckMutation.isPending ? 'animate-spin' : ''}`} />
                Run Health Check
              </Button>
            </div>
            {integration.error_message && (
              <div className="mt-4 p-3 bg-white/50 rounded border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {integration.error_message}
                </p>
                {integration.error_count > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Failed {integration.error_count} time(s)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Health Logs */}
          <DashboardSection>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-charcoal-400" />
                Health Check History
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              {isLoadingLogs ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-charcoal-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : !healthLogs || healthLogs.length === 0 ? (
                <div className="p-8 text-center text-charcoal-500">
                  No health check history yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Response Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {healthLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-charcoal-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : log.status === 'timeout' ? (
                              <Clock className="w-4 h-4 text-amber-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm capitalize ${
                              log.status === 'success' ? 'text-green-600' :
                              log.status === 'timeout' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-600 capitalize">
                          {log.check_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-600">
                          {log.response_time_ms ? `${log.response_time_ms}ms` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-500">
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-500 max-w-[200px] truncate">
                          {log.error_message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DashboardSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <div className="bg-white rounded-lg border border-charcoal-100 p-6">
            <h3 className="font-semibold text-charcoal-900 mb-4">Status & Actions</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Status</span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[integration.status]}`}>
                  {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Primary</span>
                <span className="text-sm font-medium text-charcoal-900">
                  {integration.is_primary ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="pt-4 border-t border-charcoal-100 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => toggleStatusMutation.mutate({
                    id: integrationId,
                    status: integration.status === 'active' ? 'inactive' : 'active',
                  })}
                  disabled={toggleStatusMutation.isPending}
                >
                  {integration.status === 'active' ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2" />
                      Disable Integration
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Enable Integration
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this integration?')) {
                      deleteMutation.mutate({ id: integrationId })
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Integration
                </Button>
              </div>
            </div>
          </div>

          {/* OAuth Connection */}
          {['calendar', 'email', 'video'].includes(integration.type) && (
            <div className="bg-white rounded-lg border border-charcoal-100 p-6">
              <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-charcoal-400" />
                OAuth Connection
              </h3>

              {isLoadingOAuth ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
                </div>
              ) : oauthStatus?.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>

                  <div className="bg-charcoal-50 rounded-lg p-3 text-sm">
                    <div className="text-charcoal-500 mb-1">Account</div>
                    <div className="font-medium text-charcoal-900">
                      {oauthStatus.token?.accountEmail || 'Unknown'}
                    </div>
                  </div>

                  {oauthStatus.token?.expiresAt && (
                    <div className="text-xs text-charcoal-500">
                      Token expires {formatDistanceToNow(new Date(oauthStatus.token.expiresAt), { addSuffix: true })}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to disconnect OAuth? This may affect the integration functionality.')) {
                        disconnectOAuthMutation.mutate({ integrationId })
                      }
                    }}
                    disabled={disconnectOAuthMutation.isPending}
                  >
                    {disconnectOAuthMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Unlink className="w-4 h-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-charcoal-500">
                    Connect your {integration.provider} account to enable full functionality.
                  </p>

                  <Button
                    className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
                    onClick={() => initiateOAuthMutation.mutate({
                      integrationId,
                      provider: integration.provider,
                    })}
                    disabled={initiateOAuthMutation.isPending}
                  >
                    {initiateOAuthMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Connect {integration.provider.charAt(0).toUpperCase() + integration.provider.slice(1)}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-lg border border-charcoal-100 p-6">
            <h3 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-charcoal-400" />
              Details
            </h3>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-charcoal-500">Type</dt>
                <dd className="font-medium text-charcoal-900">{TYPE_LABELS[integration.type]}</dd>
              </div>
              <div>
                <dt className="text-charcoal-500">Provider</dt>
                <dd className="font-medium text-charcoal-900 capitalize">{integration.provider}</dd>
              </div>
              <div>
                <dt className="text-charcoal-500">Created</dt>
                <dd className="font-medium text-charcoal-900">
                  {format(new Date(integration.created_at), 'MMM d, yyyy')}
                </dd>
              </div>
              {integration.last_sync && (
                <div>
                  <dt className="text-charcoal-500">Last Sync</dt>
                  <dd className="font-medium text-charcoal-900">
                    {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
