'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Webhook,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
  disabled: 'bg-red-100 text-red-800',
}

export function WebhooksListPage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.integrations.getWebhookStats.useQuery()
  const webhooksQuery = trpc.integrations.listWebhooks.useQuery({ pageSize: 100 })

  const updateMutation = trpc.integrations.updateWebhook.useMutation({
    onSuccess: () => {
      utils.integrations.listWebhooks.invalidate()
      utils.integrations.getWebhookStats.invalidate()
      toast.success('Webhook updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update webhook')
    },
  })

  const deleteMutation = trpc.integrations.deleteWebhook.useMutation({
    onSuccess: () => {
      utils.integrations.listWebhooks.invalidate()
      utils.integrations.getWebhookStats.invalidate()
      toast.success('Webhook deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete webhook')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Webhooks' },
  ]

  const stats = statsQuery.data

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/employee/admin/integrations">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
            <Link href="/employee/admin/integrations/webhooks/new">
              <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </Link>
          </div>
        }
      />
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Webhooks"
          value={stats?.totalWebhooks ?? 0}
          icon={<Webhook className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.activeWebhooks ?? 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="Successful Deliveries"
          value={stats?.successfulDeliveries ?? 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label="In DLQ"
          value={stats?.dlqCount ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          showWarning={stats?.dlqCount ? stats.dlqCount > 0 : false}
          linkTo="/employee/admin/integrations/dlq"
        />
      </div>

      <DashboardSection>
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {webhooksQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : webhooksQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Webhook className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No webhooks configured</h3>
              <p className="text-charcoal-500 mb-4">
                Create a webhook to receive event notifications
              </p>
              <Link href="/employee/admin/integrations/webhooks/new">
                <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Webhook</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Last Triggered</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {webhooksQuery.data?.items.map((webhook: any) => (
                  <tr key={webhook.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/employee/admin/integrations/webhooks/${webhook.id}`}
                          className="font-medium text-charcoal-900 hover:text-hublot-600"
                        >
                          {webhook.name}
                        </Link>
                        <p className="text-sm text-charcoal-500 truncate max-w-[300px]">
                          {webhook.url}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {webhook.events.slice(0, 3).map((event: string) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[webhook.status]}`}>
                          {webhook.status}
                        </span>
                        {webhook.consecutive_failures > 0 && (
                          <span className="text-xs text-red-600">
                            {webhook.consecutive_failures} failures
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-500">
                      {webhook.last_triggered_at
                        ? formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })
                        : <span className="text-charcoal-400">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === webhook.id ? null : webhook.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === webhook.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/integrations/webhooks/${webhook.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View & Debug
                              </Link>
                              <Link
                                href={`/employee/admin/integrations/webhooks/${webhook.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  updateMutation.mutate({
                                    id: webhook.id,
                                    status: webhook.status === 'active' ? 'inactive' : 'active',
                                  })
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                {webhook.status === 'active' ? (
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
                                  if (confirm('Are you sure you want to delete this webhook?')) {
                                    deleteMutation.mutate({ id: webhook.id })
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
      </DashboardSection>
    </AdminPageContent>
  )
}

function StatCard({
  label,
  value,
  icon,
  showWarning,
  linkTo,
}: {
  label: string
  value: number
  icon: React.ReactNode
  showWarning?: boolean
  linkTo?: string
}) {
  const content = (
    <div className={`bg-white rounded-lg border p-4 ${showWarning ? 'border-amber-200' : 'border-charcoal-100'} ${linkTo ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-charcoal-500">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-semibold text-charcoal-900">{value}</span>
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }

  return content
}
