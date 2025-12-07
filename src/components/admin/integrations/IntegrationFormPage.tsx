'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Zap } from 'lucide-react'
import Link from 'next/link'

// Provider configurations for different types
type ConfigField = {
  key: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'select'
  required: boolean
  placeholder?: string
  options?: string[]
}

const PROVIDER_CONFIGS: Record<string, Record<string, { label: string; fields: ConfigField[] }>> = {
  email: {
    smtp: {
      label: 'SMTP',
      fields: [
        { key: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.example.com' },
        { key: 'port', label: 'SMTP Port', type: 'number', required: true, placeholder: '587' },
        { key: 'username', label: 'Username', type: 'text', required: false },
        { key: 'password', label: 'Password', type: 'password', required: false },
        { key: 'from_email', label: 'From Email', type: 'email', required: true, placeholder: 'noreply@company.com' },
        { key: 'from_name', label: 'From Name', type: 'text', required: false, placeholder: 'Company Name' },
        { key: 'encryption', label: 'Encryption', type: 'select', options: ['tls', 'ssl', 'none'], required: true },
      ],
    },
    sendgrid: {
      label: 'SendGrid',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'from_email', label: 'From Email', type: 'email', required: true },
        { key: 'from_name', label: 'From Name', type: 'text', required: false },
      ],
    },
    resend: {
      label: 'Resend',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'from_email', label: 'From Email', type: 'email', required: true },
        { key: 'from_name', label: 'From Name', type: 'text', required: false },
      ],
    },
    ses: {
      label: 'Amazon SES',
      fields: [
        { key: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
        { key: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
        { key: 'from_email', label: 'From Email', type: 'email', required: true },
      ],
    },
    mailgun: {
      label: 'Mailgun',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.example.com' },
        { key: 'from_email', label: 'From Email', type: 'email', required: true },
      ],
    },
  },
  sms: {
    twilio: {
      label: 'Twilio',
      fields: [
        { key: 'account_sid', label: 'Account SID', type: 'text', required: true },
        { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
        { key: 'from_number', label: 'From Number', type: 'tel', required: true, placeholder: '+1234567890' },
      ],
    },
    vonage: {
      label: 'Vonage (Nexmo)',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'text', required: true },
        { key: 'api_secret', label: 'API Secret', type: 'password', required: true },
        { key: 'from_number', label: 'From Number', type: 'tel', required: true },
      ],
    },
    plivo: {
      label: 'Plivo',
      fields: [
        { key: 'auth_id', label: 'Auth ID', type: 'text', required: true },
        { key: 'auth_token', label: 'Auth Token', type: 'password', required: true },
        { key: 'from_number', label: 'From Number', type: 'tel', required: true },
      ],
    },
  },
  calendar: {
    google: {
      label: 'Google Calendar',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    microsoft: {
      label: 'Microsoft Outlook',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
        { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
      ],
    },
    caldav: {
      label: 'CalDAV',
      fields: [
        { key: 'url', label: 'CalDAV URL', type: 'text', required: true },
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
  },
  video: {
    zoom: {
      label: 'Zoom',
      fields: [
        { key: 'account_id', label: 'Account ID', type: 'text', required: true },
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    teams: {
      label: 'Microsoft Teams',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
        { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
      ],
    },
    google_meet: {
      label: 'Google Meet',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
  },
  storage: {
    s3: {
      label: 'Amazon S3',
      fields: [
        { key: 'region', label: 'AWS Region', type: 'text', required: true },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { key: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
      ],
    },
    gcs: {
      label: 'Google Cloud Storage',
      fields: [
        { key: 'project_id', label: 'Project ID', type: 'text', required: true },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { key: 'service_account_json', label: 'Service Account JSON', type: 'password', required: true },
      ],
    },
    azure_blob: {
      label: 'Azure Blob Storage',
      fields: [
        { key: 'account_name', label: 'Account Name', type: 'text', required: true },
        { key: 'account_key', label: 'Account Key', type: 'password', required: true },
        { key: 'container', label: 'Container Name', type: 'text', required: true },
      ],
    },
    supabase: {
      label: 'Supabase Storage',
      fields: [
        { key: 'url', label: 'Supabase URL', type: 'text', required: true },
        { key: 'service_key', label: 'Service Key', type: 'password', required: true },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      ],
    },
  },
  hris: {
    bamboohr: {
      label: 'BambooHR',
      fields: [
        { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'company' },
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
    workday: {
      label: 'Workday',
      fields: [
        { key: 'tenant', label: 'Tenant Name', type: 'text', required: true },
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
    adp: {
      label: 'ADP',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    gusto: {
      label: 'Gusto',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
  },
  payroll: {
    adp: {
      label: 'ADP',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    gusto: {
      label: 'Gusto',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    paylocity: {
      label: 'Paylocity',
      fields: [
        { key: 'company_id', label: 'Company ID', type: 'text', required: true },
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
  },
  background_check: {
    checkr: {
      label: 'Checkr',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
    sterling: {
      label: 'Sterling',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'account_id', label: 'Account ID', type: 'text', required: true },
      ],
    },
    goodhire: {
      label: 'GoodHire',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
  },
  job_board: {
    indeed: {
      label: 'Indeed',
      fields: [
        { key: 'employer_id', label: 'Employer ID', type: 'text', required: true },
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
    linkedin: {
      label: 'LinkedIn',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
    ziprecruiter: {
      label: 'ZipRecruiter',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
  },
  crm: {
    salesforce: {
      label: 'Salesforce',
      fields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
        { key: 'instance_url', label: 'Instance URL', type: 'text', required: true },
      ],
    },
    hubspot: {
      label: 'HubSpot',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
    pipedrive: {
      label: 'Pipedrive',
      fields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
      ],
    },
  },
}

const TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'video', label: 'Video Conferencing' },
  { value: 'storage', label: 'File Storage' },
  { value: 'hris', label: 'HRIS' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'job_board', label: 'Job Boards' },
  { value: 'crm', label: 'CRM' },
]

interface IntegrationFormPageProps {
  paramsPromise?: Promise<{ id: string }>
}

export function IntegrationFormPage({ paramsPromise }: IntegrationFormPageProps) {
  const params = paramsPromise ? use(paramsPromise) : null
  const integrationId = params?.id
  const isEdit = !!integrationId

  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [provider, setProvider] = useState('')
  const [config, setConfig] = useState<Record<string, string | number>>({})
  const [isPrimary, setIsPrimary] = useState(false)

  // Test connection state
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  // Load existing integration for edit
  const { data: integration, isLoading: isLoadingIntegration } = trpc.integrations.getById.useQuery(
    { id: integrationId! },
    { enabled: isEdit }
  )

  // Populate form when editing
  useEffect(() => {
    if (integration) {
      setName(integration.name)
      setDescription(integration.description || '')
      setType(integration.type)
      setProvider(integration.provider)
      setConfig(integration.config as Record<string, string | number>)
      setIsPrimary(integration.is_primary)
    }
  }, [integration])

  // Mutations
  const createMutation = trpc.integrations.create.useMutation({
    onSuccess: (data) => {
      utils.integrations.list.invalidate()
      utils.integrations.getStats.invalidate()
      toast.success('Integration created successfully')
      router.push(`/employee/admin/integrations/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create integration')
    },
  })

  const updateMutation = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.list.invalidate()
      utils.integrations.getById.invalidate({ id: integrationId })
      toast.success('Integration updated successfully')
      router.push(`/employee/admin/integrations/${integrationId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update integration')
    },
  })

  const testConnectionMutation = trpc.integrations.testConnection.useMutation({
    onSuccess: (result) => {
      setTestStatus(result.success ? 'success' : 'error')
      setTestMessage(result.message)
    },
    onError: (error) => {
      setTestStatus('error')
      setTestMessage(error.message || 'Test failed')
    },
  })

  const handleTestConnection = () => {
    if (!type || !provider) {
      toast.error('Please select a type and provider first')
      return
    }
    setTestStatus('testing')
    testConnectionMutation.mutate({
      id: isEdit ? integrationId : undefined,
      type: type as 'email' | 'sms' | 'calendar' | 'video' | 'storage' | 'hris' | 'payroll' | 'background_check' | 'job_board' | 'crm',
      provider,
      config,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!type) {
      toast.error('Type is required')
      return
    }
    if (!provider) {
      toast.error('Provider is required')
      return
    }

    // Validate required fields
    const providerConfig = PROVIDER_CONFIGS[type]?.[provider]
    if (providerConfig) {
      const missingFields = providerConfig.fields
        .filter(f => f.required && !config[f.key])
        .map(f => f.label)

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`)
        return
      }
    }

    if (isEdit) {
      updateMutation.mutate({
        id: integrationId!,
        name,
        description: description || null,
        config,
        isPrimary,
      })
    } else {
      createMutation.mutate({
        type: type as 'email' | 'sms' | 'calendar' | 'video' | 'storage' | 'hris' | 'payroll' | 'background_check' | 'job_board' | 'crm',
        provider,
        name,
        description,
        config,
        isPrimary,
      })
    }
  }

  const getProviderOptions = () => {
    if (!type) return []
    const providers = PROVIDER_CONFIGS[type]
    if (!providers) return []
    return Object.entries(providers).map(([value, { label }]) => ({ value, label }))
  }

  const getConfigFields = (): ConfigField[] => {
    if (!type || !provider) return []
    return PROVIDER_CONFIGS[type]?.[provider]?.fields ?? []
  }

  const updateConfigField = (key: string, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setTestStatus('idle')
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: isEdit ? 'Edit' : 'New Integration' },
  ]

  if (isEdit && isLoadingIntegration) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
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
          <Link href="/employee/admin/integrations">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit}>
        <DashboardSection>
          <div className="max-w-2xl space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-charcoal-900">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Email Integration"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description for this integration"
                  rows={3}
                />
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={type} onValueChange={(v) => { setType(v); setProvider(''); setConfig({}) }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select integration type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider *</Label>
                    <Select
                      value={provider}
                      onValueChange={(v) => { setProvider(v); setConfig({}) }}
                      disabled={!type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {getProviderOptions().map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <Switch
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                />
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Set as primary integration for this type
                </Label>
              </div>
            </div>

            {/* Provider Configuration */}
            {getConfigFields().length > 0 && (
              <div className="space-y-4 pt-6 border-t border-charcoal-100">
                <h3 className="text-lg font-semibold text-charcoal-900">
                  {PROVIDER_CONFIGS[type]?.[provider]?.label} Configuration
                </h3>

                {getConfigFields().map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label} {field.required && '*'}
                    </Label>
                    {field.type === 'select' ? (
                      <Select
                        value={String(config[field.key] || '')}
                        onValueChange={(v) => updateConfigField(field.key, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map(opt => (
                            <SelectItem key={opt} value={opt}>
                              {opt.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={String(config[field.key] || '')}
                        onChange={(e) => updateConfigField(
                          field.key,
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}

                {/* Test Connection */}
                <div className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testConnectionMutation.isPending}
                  >
                    {testConnectionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>

                  {testStatus !== 'idle' && (
                    <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                      testStatus === 'success' ? 'bg-green-50 text-green-700' :
                      testStatus === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-charcoal-50 text-charcoal-600'
                    }`}>
                      {testStatus === 'success' && <CheckCircle className="w-4 h-4" />}
                      {testStatus === 'error' && <XCircle className="w-4 h-4" />}
                      {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span className="text-sm">{testMessage || 'Testing connection...'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-charcoal-100">
              <Button
                type="submit"
                className="bg-hublot-900 hover:bg-hublot-800 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEdit ? 'Save Changes' : 'Create Integration'}
              </Button>
              <Link href="/employee/admin/integrations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </DashboardSection>
      </form>
    </AdminPageContent>
  )
}
