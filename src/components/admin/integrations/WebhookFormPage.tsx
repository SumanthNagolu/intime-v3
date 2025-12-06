'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Send,
  Key,
  Copy,
  RefreshCw,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// Event types available for webhooks
const EVENT_CATEGORIES = {
  'Jobs': ['job.created', 'job.updated', 'job.closed', 'job.published'],
  'Candidates': ['candidate.created', 'candidate.updated', 'candidate.status_changed'],
  'Submissions': ['submission.created', 'submission.status_changed', 'submission.placed'],
  'Interviews': ['interview.scheduled', 'interview.completed', 'interview.cancelled'],
  'Users': ['user.created', 'user.updated', 'user.deactivated'],
  'Placements': ['placement.created', 'placement.started', 'placement.ended'],
}

interface WebhookFormPageProps {
  paramsPromise?: Promise<{ id: string }>
}

export function WebhookFormPage({ paramsPromise }: WebhookFormPageProps) {
  const params = paramsPromise ? use(paramsPromise) : undefined
  const webhookId = params?.id
  const isEdit = !!webhookId
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([])
  const [secret, setSecret] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const utils = trpc.useUtils()

  const webhookQuery = trpc.integrations.getWebhookById.useQuery(
    { id: webhookId! },
    { enabled: isEdit }
  )

  const createMutation = trpc.integrations.createWebhook.useMutation({
    onSuccess: () => {
      toast.success('Webhook created successfully')
      router.push('/employee/admin/integrations/webhooks')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create webhook')
      setIsSaving(false)
    },
  })

  const updateMutation = trpc.integrations.updateWebhook.useMutation({
    onSuccess: () => {
      toast.success('Webhook updated successfully')
      router.push('/employee/admin/integrations/webhooks')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update webhook')
      setIsSaving(false)
    },
  })

  const regenerateSecretMutation = trpc.integrations.regenerateWebhookSecret.useMutation({
    onSuccess: (data) => {
      setSecret(data.secret)
      toast.success('Secret regenerated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to regenerate secret')
    },
  })

  const testMutation = trpc.integrations.testWebhook.useMutation({
    onSuccess: (data) => {
      toast.success('Test webhook sent! Check delivery history.')
      setIsTesting(false)
      utils.integrations.getDeliveryHistory.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send test webhook')
      setIsTesting(false)
    },
  })

  // Load webhook data for edit
  useEffect(() => {
    if (webhookQuery.data) {
      setName(webhookQuery.data.name)
      setDescription(webhookQuery.data.description || '')
      setUrl(webhookQuery.data.url)
      setSelectedEvents(webhookQuery.data.events || [])
      setSecret(webhookQuery.data.secret)
      const headers = webhookQuery.data.headers || {}
      setCustomHeaders(
        Object.entries(headers).map(([key, value]) => ({ key, value: value as string }))
      )
    }
  }, [webhookQuery.data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Convert custom headers array to object
    const headers: Record<string, string> = {}
    customHeaders.forEach(({ key, value }) => {
      if (key.trim()) {
        headers[key.trim()] = value
      }
    })

    const payload = {
      name,
      description: description || undefined,
      url,
      events: selectedEvents,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    }

    if (isEdit) {
      updateMutation.mutate({ id: webhookId!, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const selectAllInCategory = (events: string[]) => {
    setSelectedEvents((prev) => {
      const newEvents = new Set(prev)
      events.forEach((e) => newEvents.add(e))
      return Array.from(newEvents)
    })
  }

  const deselectAllInCategory = (events: string[]) => {
    setSelectedEvents((prev) => prev.filter((e) => !events.includes(e)))
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast.success('Secret copied to clipboard')
  }

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }])
  }

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index))
  }

  const updateCustomHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders]
    updated[index][field] = value
    setCustomHeaders(updated)
  }

  const handleTest = () => {
    if (!webhookId || selectedEvents.length === 0) return
    setIsTesting(true)
    testMutation.mutate({
      id: webhookId,
      eventType: selectedEvents[0],
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Webhooks', href: '/employee/admin/integrations/webhooks' },
    { label: isEdit ? 'Edit' : 'New' },
  ]

  if (isEdit && webhookQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title={isEdit ? 'Edit Webhook' : 'Create Webhook'}
      description={isEdit ? 'Update webhook configuration' : 'Configure a new webhook endpoint'}
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/integrations/webhooks">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Webhooks
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <DashboardSection title="Basic Information">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Webhook Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Zapier Job Notifications"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this webhook is used for..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="url">Webhook URL * (HTTPS required)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://hooks.example.com/webhook/123"
                    required
                  />
                </div>
              </div>
            </DashboardSection>

            {/* Event Selection */}
            <DashboardSection title="Events to Subscribe">
              <p className="text-sm text-charcoal-500 mb-4">
                Select which events should trigger this webhook
              </p>
              <div className="space-y-4">
                {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
                  <div key={category} className="border border-charcoal-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-charcoal-900">{category}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => selectAllInCategory(events)}
                          className="text-xs text-hublot-600 hover:underline"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectAllInCategory(events)}
                          className="text-xs text-charcoal-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {events.map((event) => (
                        <button
                          key={event}
                          type="button"
                          onClick={() => toggleEvent(event)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            selectedEvents.includes(event)
                              ? 'bg-hublot-900 text-white border-hublot-900'
                              : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
                          }`}
                        >
                          {selectedEvents.includes(event) && (
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {event}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedEvents.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">Please select at least one event</p>
              )}
            </DashboardSection>

            {/* Custom Headers */}
            <DashboardSection title="Custom Headers (Optional)">
              <p className="text-sm text-charcoal-500 mb-4">
                Add custom HTTP headers to include with each webhook request
              </p>
              <div className="space-y-2">
                {customHeaders.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCustomHeader(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addCustomHeader}>
                  Add Header
                </Button>
              </div>
            </DashboardSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Secret Key */}
            {isEdit && (
              <DashboardSection title="Signing Secret">
                <p className="text-sm text-charcoal-500 mb-3">
                  Use this secret to verify webhook signatures
                </p>
                <div className="bg-charcoal-50 rounded-lg p-3 font-mono text-xs break-all mb-3">
                  {secret ? `${secret.slice(0, 8)}...${secret.slice(-8)}` : 'Loading...'}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copySecret}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure? Existing integrations will need the new secret.')) {
                        regenerateSecretMutation.mutate({ id: webhookId! })
                      }
                    }}
                    disabled={regenerateSecretMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${regenerateSecretMutation.isPending ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
              </DashboardSection>
            )}

            {/* Test Webhook */}
            {isEdit && (
              <DashboardSection title="Test Webhook">
                <p className="text-sm text-charcoal-500 mb-3">
                  Send a test payload to verify your endpoint
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || selectedEvents.length === 0}
                  className="w-full"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Test Webhook
                </Button>
                <Link
                  href={`/employee/admin/integrations/webhooks/${webhookId}`}
                  className="block text-center text-sm text-hublot-600 hover:underline mt-2"
                >
                  View Delivery History
                </Link>
              </DashboardSection>
            )}

            {/* Selected Events Summary */}
            <DashboardSection title="Selected Events">
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-charcoal-500">No events selected</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selectedEvents.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              )}
            </DashboardSection>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
                disabled={isSaving || selectedEvents.length === 0}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEdit ? 'Save Changes' : 'Create Webhook'}
              </Button>
              <Link href="/employee/admin/integrations/webhooks" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}
