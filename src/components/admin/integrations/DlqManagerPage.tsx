'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

export function DlqManagerPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [clearingId, setClearingId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)

  const utils = trpc.useUtils()

  const dlqQuery = trpc.integrations.getDlqItems.useQuery({
    limit: 100,
  })

  const retryMutation = trpc.integrations.retryDlqItem.useMutation({
    onSuccess: () => {
      toast.success('Item queued for retry')
      setRetryingId(null)
      utils.integrations.getDlqItems.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry item')
      setRetryingId(null)
    },
  })

  const clearMutation = trpc.integrations.clearDlqItem.useMutation({
    onSuccess: () => {
      toast.success('Item removed from DLQ')
      setClearingId(null)
      utils.integrations.getDlqItems.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clear item')
      setClearingId(null)
    },
  })

  const clearAllMutation = trpc.integrations.clearAllDlqItems.useMutation({
    onSuccess: (data) => {
      toast.success(`Cleared ${data.cleared} items from DLQ`)
      setIsClearingAll(false)
      utils.integrations.getDlqItems.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clear DLQ')
      setIsClearingAll(false)
    },
  })

  const handleRetry = (id: string) => {
    setRetryingId(id)
    retryMutation.mutate({ itemId: id })
  }

  const handleClear = (id: string) => {
    setClearingId(id)
    clearMutation.mutate({ itemId: id })
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all items from the DLQ? This cannot be undone.')) {
      setIsClearingAll(true)
      clearAllMutation.mutate()
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Dead Letter Queue' },
  ]

  const items = dlqQuery.data?.items || []
  const totalCount = dlqQuery.data?.total || 0

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
          </div>
        }
      />
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-charcoal-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-charcoal-500 text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Items in DLQ
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {totalCount}
          </div>
        </div>
        <div className="bg-white border border-charcoal-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-charcoal-500 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Oldest Item
          </div>
          <div className="text-sm text-charcoal-900">
            {items.length > 0
              ? formatDistanceToNow(new Date(items[items.length - 1].created_at), { addSuffix: true })
              : 'N/A'}
          </div>
        </div>
        <div className="bg-white border border-charcoal-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-charcoal-500 text-sm mb-1">
            <XCircle className="w-4 h-4" />
            Unique Webhooks
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {new Set(items.map((i: any) => i.webhook_id)).size}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => utils.integrations.getDlqItems.invalidate()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Link href="/employee/admin/integrations/retry-config">
            <Button variant="outline" size="sm">
              Retry Settings
            </Button>
          </Link>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={isClearingAll}
            className="text-red-600 hover:text-red-700"
          >
            {isClearingAll ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            Clear All
          </Button>
        )}
      </div>

      {/* DLQ Items */}
      <DashboardSection title="Failed Deliveries">
        {dlqQuery.isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Items in DLQ
            </h3>
            <p className="text-charcoal-500 max-w-md mx-auto">
              When webhook deliveries fail after all retry attempts, they will appear here for manual review and retry.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => (
              <DlqItem
                key={item.id}
                item={item}
                expanded={expandedItem === item.id}
                onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                onRetry={() => handleRetry(item.id)}
                onClear={() => handleClear(item.id)}
                isRetrying={retryingId === item.id}
                isClearing={clearingId === item.id}
              />
            ))}
          </div>
        )}
      </DashboardSection>
    </AdminPageContent>
  )
}

function DlqItem({
  item,
  expanded,
  onToggle,
  onRetry,
  onClear,
  isRetrying,
  isClearing,
}: {
  item: any
  expanded: boolean
  onToggle: () => void
  onRetry: () => void
  onClear: () => void
  isRetrying: boolean
  isClearing: boolean
}) {
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
          <div>
            <span className="text-sm font-medium text-charcoal-900">
              {item.webhook_name || 'Unknown Webhook'}
            </span>
            <span className="mx-2 text-charcoal-300">·</span>
            <Badge variant="secondary" className="text-xs">
              {item.event_type}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          <span>{item.attempt_number} attempts</span>
          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-charcoal-100 p-4 bg-charcoal-50 space-y-4">
          {/* Error Details */}
          <div>
            <span className="text-sm font-medium text-charcoal-700 mb-2 block">Error</span>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {item.error_message || 'Unknown error'}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Delivery ID</span>
              <p className="font-mono text-xs">{item.id}</p>
            </div>
            <div>
              <span className="text-charcoal-500">Webhook ID</span>
              <p className="font-mono text-xs">{item.webhook_id}</p>
            </div>
            <div>
              <span className="text-charcoal-500">First Attempt</span>
              <p>{format(new Date(item.created_at), 'PPpp')}</p>
            </div>
            <div>
              <span className="text-charcoal-500">Last Attempt</span>
              <p>{format(new Date(item.updated_at || item.created_at), 'PPpp')}</p>
            </div>
            {item.response_status && (
              <div>
                <span className="text-charcoal-500">Last Response</span>
                <p className="text-red-600">HTTP {item.response_status}</p>
              </div>
            )}
            {item.duration_ms && (
              <div>
                <span className="text-charcoal-500">Last Duration</span>
                <p>{item.duration_ms}ms</p>
              </div>
            )}
          </div>

          {/* Request Body */}
          <div>
            <span className="text-sm font-medium text-charcoal-700 mb-2 block">Request Payload</span>
            <div className="bg-white rounded border border-charcoal-200 p-3">
              <div className="font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                {item.request_body}
              </div>
            </div>
          </div>

          {/* Response Body */}
          {item.response_body && (
            <div>
              <span className="text-sm font-medium text-charcoal-700 mb-2 block">Response</span>
              <div className="bg-white rounded border border-charcoal-200 p-3">
                <div className="font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto text-red-600">
                  {item.response_body}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Retry Delivery
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={isClearing}
              className="text-red-600 hover:text-red-700"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Remove
            </Button>
            <Link href={`/employee/admin/integrations/webhooks/${item.webhook_id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Webhook
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
