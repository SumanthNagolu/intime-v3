'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Save,
  Loader2,
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

const RETRY_STRATEGIES = [
  { value: 'exponential', label: 'Exponential Backoff', description: 'Delay doubles after each attempt (recommended)' },
  { value: 'linear', label: 'Linear Backoff', description: 'Delay increases by base amount each attempt' },
  { value: 'fixed', label: 'Fixed Delay', description: 'Same delay between all attempts' },
]

export function RetryConfigPage() {
  const [maxRetries, setMaxRetries] = useState(3)
  const [retryStrategy, setRetryStrategy] = useState('exponential')
  const [baseDelaySeconds, setBaseDelaySeconds] = useState(5)
  const [maxDelaySeconds, setMaxDelaySeconds] = useState(300)
  const [enableJitter, setEnableJitter] = useState(true)
  const [enableDlq, setEnableDlq] = useState(true)
  const [dlqRetentionDays, setDlqRetentionDays] = useState(30)
  const [isSaving, setIsSaving] = useState(false)

  const configQuery = trpc.integrations.getRetryConfig.useQuery()

  const updateMutation = trpc.integrations.updateRetryConfig.useMutation({
    onSuccess: () => {
      toast.success('Retry configuration saved')
      setIsSaving(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save configuration')
      setIsSaving(false)
    },
  })

  // Load current config
  useEffect(() => {
    if (configQuery.data) {
      setMaxRetries(configQuery.data.maxRetries)
      setRetryStrategy(configQuery.data.retryStrategy)
      setBaseDelaySeconds(configQuery.data.baseDelaySeconds)
      setMaxDelaySeconds(configQuery.data.maxDelaySeconds)
      setEnableJitter(configQuery.data.enableJitter)
      setEnableDlq(configQuery.data.enableDlq)
      setDlqRetentionDays(configQuery.data.dlqRetentionDays)
    }
  }, [configQuery.data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    updateMutation.mutate({
      maxRetries,
      retryStrategy: retryStrategy as 'exponential' | 'linear' | 'fixed',
      baseDelaySeconds,
      maxDelaySeconds,
      enableJitter,
      enableDlq,
      dlqRetentionDays,
    })
  }

  // Calculate retry preview
  const calculateRetryDelays = () => {
    const delays = []
    for (let i = 1; i <= maxRetries; i++) {
      let delay: number
      switch (retryStrategy) {
        case 'exponential':
          delay = Math.min(baseDelaySeconds * Math.pow(2, i - 1), maxDelaySeconds)
          break
        case 'linear':
          delay = Math.min(baseDelaySeconds * i, maxDelaySeconds)
          break
        case 'fixed':
        default:
          delay = baseDelaySeconds
          break
      }
      delays.push(delay)
    }
    return delays
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Retry Configuration' },
  ]

  return (
    <DashboardShell
      title="Retry Configuration"
      description="Configure retry behavior for failed webhook deliveries"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/integrations">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Integrations
          </Button>
        </Link>
      }
    >
      {configQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Retry Settings */}
              <DashboardSection title="Retry Settings">
                <div className="space-y-6">
                  {/* Strategy Selection */}
                  <div>
                    <Label>Retry Strategy</Label>
                    <div className="mt-2 space-y-2">
                      {RETRY_STRATEGIES.map((strategy) => (
                        <label
                          key={strategy.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            retryStrategy === strategy.value
                              ? 'border-hublot-900 bg-hublot-50'
                              : 'border-charcoal-200 hover:border-charcoal-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="strategy"
                            value={strategy.value}
                            checked={retryStrategy === strategy.value}
                            onChange={(e) => setRetryStrategy(e.target.value)}
                            className="mt-1"
                          />
                          <div>
                            <span className="font-medium text-charcoal-900">{strategy.label}</span>
                            <p className="text-sm text-charcoal-500">{strategy.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxRetries">Maximum Retries</Label>
                      <Input
                        id="maxRetries"
                        type="number"
                        min={1}
                        max={10}
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                      />
                      <p className="text-xs text-charcoal-500 mt-1">1-10 attempts after initial failure</p>
                    </div>
                    <div>
                      <Label htmlFor="baseDelay">Base Delay (seconds)</Label>
                      <Input
                        id="baseDelay"
                        type="number"
                        min={1}
                        max={60}
                        value={baseDelaySeconds}
                        onChange={(e) => setBaseDelaySeconds(parseInt(e.target.value) || 5)}
                      />
                      <p className="text-xs text-charcoal-500 mt-1">Initial delay between retries</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxDelay">Maximum Delay (seconds)</Label>
                    <Input
                      id="maxDelay"
                      type="number"
                      min={1}
                      max={3600}
                      value={maxDelaySeconds}
                      onChange={(e) => setMaxDelaySeconds(parseInt(e.target.value) || 300)}
                    />
                    <p className="text-xs text-charcoal-500 mt-1">Delay will never exceed this value</p>
                  </div>

                  {/* Jitter */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableJitter}
                        onChange={(e) => setEnableJitter(e.target.checked)}
                        className="rounded border-charcoal-300"
                      />
                      <span className="font-medium text-charcoal-900">Enable Jitter</span>
                    </label>
                    <p className="text-sm text-charcoal-500 mt-1 ml-6">
                      Add random variance to delays to prevent thundering herd
                    </p>
                  </div>
                </div>
              </DashboardSection>

              {/* Dead Letter Queue */}
              <DashboardSection title="Dead Letter Queue (DLQ)">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableDlq}
                        onChange={(e) => setEnableDlq(e.target.checked)}
                        className="rounded border-charcoal-300"
                      />
                      <span className="font-medium text-charcoal-900">Enable Dead Letter Queue</span>
                    </label>
                    <p className="text-sm text-charcoal-500 mt-1 ml-6">
                      Store failed deliveries for manual review and retry
                    </p>
                  </div>

                  {enableDlq && (
                    <div>
                      <Label htmlFor="dlqRetention">DLQ Retention (days)</Label>
                      <Input
                        id="dlqRetention"
                        type="number"
                        min={1}
                        max={90}
                        value={dlqRetentionDays}
                        onChange={(e) => setDlqRetentionDays(parseInt(e.target.value) || 30)}
                      />
                      <p className="text-xs text-charcoal-500 mt-1">
                        Items older than this will be automatically removed
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-charcoal-50 rounded-lg">
                    <Info className="w-4 h-4 text-charcoal-500 mt-0.5" />
                    <div className="text-sm text-charcoal-600">
                      <p>When DLQ is enabled, failed deliveries are stored for manual retry.</p>
                      <Link
                        href="/employee/admin/integrations/dlq"
                        className="text-hublot-600 hover:underline"
                      >
                        Manage DLQ
                      </Link>
                    </div>
                  </div>
                </div>
              </DashboardSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Retry Preview */}
              <DashboardSection title="Retry Preview">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
                    <Clock className="w-4 h-4" />
                    Estimated retry delays
                  </div>
                  {calculateRetryDelays().map((delay, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-charcoal-50 rounded">
                      <span className="text-sm">Retry {i + 1}</span>
                      <span className="text-sm font-medium">
                        {delay >= 60 ? `${Math.floor(delay / 60)}m ${delay % 60}s` : `${delay}s`}
                        {enableJitter && ' ± jitter'}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-charcoal-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-500">Total max duration</span>
                      <span className="font-medium">
                        {(() => {
                          const total = calculateRetryDelays().reduce((a, b) => a + b, 0)
                          if (total >= 3600) return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`
                          if (total >= 60) return `${Math.floor(total / 60)}m ${total % 60}s`
                          return `${total}s`
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardSection>

              {/* What happens */}
              <DashboardSection title="Retry Behavior">
                <div className="space-y-3 text-sm text-charcoal-600">
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-charcoal-400 mt-0.5" />
                    <span>Server errors (5xx) and timeouts are retried</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-charcoal-400 mt-0.5" />
                    <span>Client errors (4xx except 429) are not retried</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-charcoal-400 mt-0.5" />
                    <span>Rate limits (429) are retried with backoff</span>
                  </div>
                </div>
              </DashboardSection>

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </div>
        </form>
      )}
    </DashboardShell>
  )
}
