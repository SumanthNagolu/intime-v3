'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Send,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-charcoal-100', text: 'text-charcoal-700', icon: <Clock className="w-3 h-3" /> },
  success: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
  failed: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3 h-3" /> },
  retrying: { bg: 'bg-amber-100', text: 'text-amber-800', icon: <RefreshCw className="w-3 h-3" /> },
  dlq: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle className="w-3 h-3" /> },
}

// Event types for testing
const TEST_EVENTS = [
  'job.created',
  'candidate.created',
  'submission.created',
  'interview.scheduled',
  'user.created',
]

interface WebhookDebugPageProps {
  paramsPromise: Promise<{ id: string }>
}

export function WebhookDebugPage({ paramsPromise }: WebhookDebugPageProps) {
  const params = use(paramsPromise)
  const webhookId = params.id

  const [selectedTestEvent, setSelectedTestEvent] = useState(TEST_EVENTS[0])
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const utils = trpc.useUtils()

  const webhookQuery = trpc.integrations.getWebhookById.useQuery({ id: webhookId })
  const deliveryHistoryQuery = trpc.integrations.getDeliveryHistory.useQuery({
    webhookId,
    limit: 50,
  })

  const testMutation = trpc.integrations.testWebhook.useMutation({
    onSuccess: () => {
      toast.success('Test webhook sent!')
      setIsTesting(false)
      // Refresh delivery history
      utils.integrations.getDeliveryHistory.invalidate({ webhookId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send test webhook')
      setIsTesting(false)
    },
  })

  const replayMutation = trpc.integrations.replayDelivery.useMutation({
    onSuccess: () => {
      toast.success('Delivery replayed!')
      utils.integrations.getDeliveryHistory.invalidate({ webhookId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to replay delivery')
    },
  })

  const copySecret = () => {
    if (webhookQuery.data?.secret) {
      navigator.clipboard.writeText(webhookQuery.data.secret)
      toast.success('Secret copied to clipboard')
    }
  }

  const handleTest = () => {
    setIsTesting(true)
    testMutation.mutate({
      id: webhookId,
      eventType: selectedTestEvent,
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Webhooks', href: '/employee/admin/integrations/webhooks' },
    { label: webhookQuery.data?.name || 'Debug' },
  ]

  const webhook = webhookQuery.data

  if (webhookQuery.isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </AdminPageContent>
    )
  }

  if (webhookQuery.error || !webhook) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-red-600">Webhook not found</p>
          <Link href="/employee/admin/integrations/webhooks">
            <Button variant="outline" className="mt-4">
              Back to Webhooks
            </Button>
          </Link>
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/employee/admin/integrations/webhooks">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/employee/admin/integrations/webhooks/${webhookId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Webhook Info */}
          <DashboardSection title="Webhook Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">URL</span>
                <p className="font-mono text-sm truncate" title={webhook.url}>
                  {webhook.url}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Status</span>
                <p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    webhook.status === 'active' ? 'bg-green-100 text-green-800' :
                    webhook.status === 'disabled' ? 'bg-red-100 text-red-800' :
                    'bg-charcoal-100 text-charcoal-700'
                  }`}>
                    {webhook.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Last Success</span>
                <p className="text-sm">
                  {webhook.last_success_at
                    ? formatDistanceToNow(new Date(webhook.last_success_at), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Consecutive Failures</span>
                <p className={`text-sm ${webhook.consecutive_failures > 0 ? 'text-red-600 font-medium' : ''}`}>
                  {webhook.consecutive_failures}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-charcoal-500">Subscribed Events</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {webhook.events.map((event: string) => (
                  <Badge key={event} variant="secondary" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
          </DashboardSection>

          {/* Delivery History */}
          <DashboardSection
            title="Delivery History"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => utils.integrations.getDeliveryHistory.invalidate({ webhookId })}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            }
          >
            {deliveryHistoryQuery.isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
              </div>
            ) : deliveryHistoryQuery.data?.items.length === 0 ? (
              <div className="py-8 text-center text-charcoal-500">
                No deliveries yet. Send a test webhook to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {deliveryHistoryQuery.data?.items.map((delivery: any) => (
                  <DeliveryItem
                    key={delivery.id}
                    delivery={delivery}
                    expanded={expandedDelivery === delivery.id}
                    onToggle={() => setExpandedDelivery(
                      expandedDelivery === delivery.id ? null : delivery.id
                    )}
                    onReplay={() => replayMutation.mutate({ deliveryId: delivery.id })}
                    isReplaying={replayMutation.isPending}
                  />
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Webhook */}
          <DashboardSection title="Test Webhook">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-charcoal-500 mb-1 block">Event Type</label>
                <select
                  value={selectedTestEvent}
                  onChange={(e) => setSelectedTestEvent(e.target.value)}
                  className="w-full border border-charcoal-200 rounded-lg px-3 py-2 text-sm"
                >
                  {TEST_EVENTS.map((event) => (
                    <option key={event} value={event}>
                      {event}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleTest}
                disabled={isTesting || webhook.status !== 'active'}
                className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Test Webhook
              </Button>
              {webhook.status !== 'active' && (
                <p className="text-xs text-amber-600">
                  Webhook must be active to send tests
                </p>
              )}
            </div>
          </DashboardSection>

          {/* Signing Secret */}
          <DashboardSection title="Signing Secret">
            <p className="text-sm text-charcoal-500 mb-2">
              Use this to verify webhook signatures
            </p>
            <div className="bg-charcoal-50 rounded-lg p-3 font-mono text-xs break-all mb-3">
              {webhook.secret.slice(0, 12)}...{webhook.secret.slice(-12)}
            </div>
            <Button variant="outline" size="sm" onClick={copySecret} className="w-full">
              <Copy className="w-4 h-4 mr-1" />
              Copy Full Secret
            </Button>
          </DashboardSection>

          {/* Signature Verification */}
          <DashboardSection title="Signature Verification">
            <p className="text-sm text-charcoal-500 mb-3">
              Verify webhooks using HMAC-SHA256
            </p>
            <div className="bg-charcoal-900 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
              <code>
                {`const signature = crypto
  .createHmac('sha256', secret)
  .update(timestamp + '.' + body)
  .digest('hex');

// Compare with X-InTime-Signature`}
              </code>
            </div>
          </DashboardSection>
        </div>
      </div>
    </AdminPageContent>
  )
}

function DeliveryItem({
  delivery,
  expanded,
  onToggle,
  onReplay,
  isReplaying,
}: {
  delivery: any
  expanded: boolean
  onToggle: () => void
  onReplay: () => void
  isReplaying: boolean
}) {
  const status = STATUS_COLORS[delivery.status] || STATUS_COLORS.pending

  return (
    <div className="border border-charcoal-100 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-charcoal-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-charcoal-400" />
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            {status.icon}
            {delivery.status}
          </span>
          <span className="text-sm font-medium text-charcoal-900">
            {delivery.event_type}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          {delivery.response_status && (
            <span className={delivery.response_status >= 200 && delivery.response_status < 300 ? 'text-green-600' : 'text-red-600'}>
              HTTP {delivery.response_status}
            </span>
          )}
          {delivery.duration_ms && (
            <span>{delivery.duration_ms}ms</span>
          )}
          <span>{formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-charcoal-100 p-4 bg-charcoal-50 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Delivery ID</span>
              <p className="font-mono text-xs">{delivery.id}</p>
            </div>
            <div>
              <span className="text-charcoal-500">Timestamp</span>
              <p>{format(new Date(delivery.created_at), 'PPpp')}</p>
            </div>
            <div>
              <span className="text-charcoal-500">Attempt</span>
              <p>{delivery.attempt_number} / {delivery.max_attempts}</p>
            </div>
            {delivery.error_message && (
              <div className="col-span-2">
                <span className="text-charcoal-500">Error</span>
                <p className="text-red-600">{delivery.error_message}</p>
              </div>
            )}
          </div>

          {/* Request */}
          <div>
            <span className="text-sm font-medium text-charcoal-700 mb-2 block">Request</span>
            <div className="bg-white rounded border border-charcoal-200 p-3">
              <div className="text-xs text-charcoal-500 mb-2">
                POST {delivery.request_url}
              </div>
              <div className="font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                {delivery.request_body}
              </div>
            </div>
          </div>

          {/* Response */}
          {delivery.response_body && (
            <div>
              <span className="text-sm font-medium text-charcoal-700 mb-2 block">Response</span>
              <div className="bg-white rounded border border-charcoal-200 p-3">
                <div className={`text-xs mb-2 ${delivery.response_status >= 200 && delivery.response_status < 300 ? 'text-green-600' : 'text-red-600'}`}>
                  {delivery.response_status}
                </div>
                <div className="font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {delivery.response_body}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReplay}
              disabled={isReplaying}
            >
              {isReplaying ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Replay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
