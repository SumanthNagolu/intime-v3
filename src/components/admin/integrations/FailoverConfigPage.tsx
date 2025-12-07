'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Info,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

const INTEGRATION_TYPES = [
  { value: 'email', label: 'Email Service' },
  { value: 'sms', label: 'SMS Service' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'video', label: 'Video Conferencing' },
  { value: 'storage', label: 'Storage' },
]

interface FailoverConfig {
  id?: string
  integrationType: string
  primaryIntegrationId: string | null
  backupIntegrationId: string | null
  autoFailover: boolean
  failoverThreshold: number
  recoveryCheckIntervalMinutes: number
  currentActive: 'primary' | 'backup'
  lastFailoverAt: string | null
}

export function FailoverConfigPage() {
  const [configs, setConfigs] = useState<FailoverConfig[]>([])
  const [editingType, setEditingType] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const integrationsQuery = trpc.integrations.list.useQuery({})
  const failoverQuery = trpc.integrations.getFailoverConfigs.useQuery()

  const updateMutation = trpc.integrations.updateFailoverConfig.useMutation({
    onSuccess: () => {
      toast.success('Failover configuration saved')
      setIsSaving(false)
      setEditingType(null)
      failoverQuery.refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save configuration')
      setIsSaving(false)
    },
  })

  const triggerFailoverMutation = trpc.integrations.triggerFailover.useMutation({
    onSuccess: () => {
      toast.success('Failover triggered successfully')
      failoverQuery.refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to trigger failover')
    },
  })

  // Load configs
  useEffect(() => {
    if (failoverQuery.data) {
      // Initialize with existing configs or create empty ones for each type
      const existingConfigs = failoverQuery.data.configs || []
      const configMap = new Map(existingConfigs.map((c: any) => [c.integration_type, c]))

      const allConfigs: FailoverConfig[] = INTEGRATION_TYPES.map(type => {
        const existing = configMap.get(type.value)
        return {
          id: existing?.id,
          integrationType: type.value,
          primaryIntegrationId: existing?.primary_integration_id || null,
          backupIntegrationId: existing?.backup_integration_id || null,
          autoFailover: existing?.auto_failover ?? true,
          failoverThreshold: existing?.failover_threshold ?? 3,
          recoveryCheckIntervalMinutes: existing?.recovery_check_interval_minutes ?? 30,
          currentActive: existing?.current_active || 'primary',
          lastFailoverAt: existing?.last_failover_at || null,
        }
      })

      setConfigs(allConfigs)
    }
  }, [failoverQuery.data])

  const handleSave = (config: FailoverConfig) => {
    setIsSaving(true)
    updateMutation.mutate({
      integrationType: config.integrationType,
      primaryIntegrationId: config.primaryIntegrationId,
      backupIntegrationId: config.backupIntegrationId,
      autoFailover: config.autoFailover,
      failoverThreshold: config.failoverThreshold,
      recoveryCheckIntervalMinutes: config.recoveryCheckIntervalMinutes,
    })
  }

  const handleTriggerFailover = (integrationType: string, currentActive: 'primary' | 'backup') => {
    const targetActive = currentActive === 'primary' ? 'backup' : 'primary'
    const targetName = targetActive === 'primary' ? 'primary' : 'backup'
    if (confirm(`Are you sure you want to manually trigger failover? This will switch to the ${targetName} integration.`)) {
      triggerFailoverMutation.mutate({ integrationType, targetActive })
    }
  }

  const getIntegrationsByType = (type: string) => {
    return (integrationsQuery.data?.items || []).filter(
      (i: any) => i.type === type && i.status !== 'error'
    )
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Integrations', href: '/employee/admin/integrations' },
    { label: 'Failover Configuration' },
  ]

  if (failoverQuery.isLoading || integrationsQuery.isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="flex justify-center py-12">
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
              Back to Integrations
            </Button>
          </Link>
        }
      />
      {/* Info Banner */}
      <div className="bg-charcoal-50 border border-charcoal-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-charcoal-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-charcoal-900 mb-1">Automatic Failover</h3>
            <p className="text-sm text-charcoal-600">
              Configure primary and backup integrations for each service type. When enabled, the system
              will automatically switch to the backup integration if the primary fails repeatedly.
            </p>
          </div>
        </div>
      </div>

      {/* Failover Configs by Type */}
      <div className="space-y-4">
        {configs.map((config) => {
          const typeInfo = INTEGRATION_TYPES.find(t => t.value === config.integrationType)
          const integrations = getIntegrationsByType(config.integrationType)
          const isEditing = editingType === config.integrationType
          const primaryIntegration = integrationsQuery.data?.items.find(
            (i: any) => i.id === config.primaryIntegrationId
          )
          const backupIntegration = integrationsQuery.data?.items.find(
            (i: any) => i.id === config.backupIntegrationId
          )

          return (
            <DashboardSection
              key={config.integrationType}
              title={typeInfo?.label || config.integrationType}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Integration</Label>
                      <select
                        value={config.primaryIntegrationId || ''}
                        onChange={(e) => {
                          const newConfigs = configs.map(c =>
                            c.integrationType === config.integrationType
                              ? { ...c, primaryIntegrationId: e.target.value || null }
                              : c
                          )
                          setConfigs(newConfigs)
                        }}
                        className="w-full mt-1 border border-charcoal-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select primary...</option>
                        {integrations
                          .filter((i: any) => i.id !== config.backupIntegrationId)
                          .map((integration: any) => (
                            <option key={integration.id} value={integration.id}>
                              {integration.name} ({integration.provider})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <Label>Backup Integration</Label>
                      <select
                        value={config.backupIntegrationId || ''}
                        onChange={(e) => {
                          const newConfigs = configs.map(c =>
                            c.integrationType === config.integrationType
                              ? { ...c, backupIntegrationId: e.target.value || null }
                              : c
                          )
                          setConfigs(newConfigs)
                        }}
                        className="w-full mt-1 border border-charcoal-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select backup...</option>
                        {integrations
                          .filter((i: any) => i.id !== config.primaryIntegrationId)
                          .map((integration: any) => (
                            <option key={integration.id} value={integration.id}>
                              {integration.name} ({integration.provider})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="threshold">Failure Threshold</Label>
                      <Input
                        id="threshold"
                        type="number"
                        min={1}
                        max={10}
                        value={config.failoverThreshold}
                        onChange={(e) => {
                          const newConfigs = configs.map(c =>
                            c.integrationType === config.integrationType
                              ? { ...c, failoverThreshold: parseInt(e.target.value) || 3 }
                              : c
                          )
                          setConfigs(newConfigs)
                        }}
                      />
                      <p className="text-xs text-charcoal-500 mt-1">Failures before switching</p>
                    </div>
                    <div>
                      <Label htmlFor="recoveryInterval">Recovery Check (minutes)</Label>
                      <Input
                        id="recoveryInterval"
                        type="number"
                        min={5}
                        max={1440}
                        value={config.recoveryCheckIntervalMinutes}
                        onChange={(e) => {
                          const newConfigs = configs.map(c =>
                            c.integrationType === config.integrationType
                              ? { ...c, recoveryCheckIntervalMinutes: parseInt(e.target.value) || 30 }
                              : c
                          )
                          setConfigs(newConfigs)
                        }}
                      />
                      <p className="text-xs text-charcoal-500 mt-1">Interval to check primary recovery</p>
                    </div>
                    <div>
                      <Label>&nbsp;</Label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.autoFailover}
                          onChange={(e) => {
                            const newConfigs = configs.map(c =>
                              c.integrationType === config.integrationType
                                ? { ...c, autoFailover: e.target.checked }
                                : c
                            )
                            setConfigs(newConfigs)
                          }}
                          className="rounded border-charcoal-300"
                        />
                        <span className="text-sm font-medium text-charcoal-900">Auto-failover</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={() => handleSave(config)}
                      disabled={isSaving}
                      className="bg-hublot-900 hover:bg-hublot-800 text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingType(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {!config.primaryIntegrationId && !config.backupIntegrationId ? (
                    <div className="text-center py-6">
                      <p className="text-charcoal-500 mb-3">No failover configured for this service type.</p>
                      {integrations.length >= 2 ? (
                        <Button
                          variant="outline"
                          onClick={() => setEditingType(config.integrationType)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Configure Failover
                        </Button>
                      ) : (
                        <p className="text-sm text-charcoal-400">
                          Add at least 2 {typeInfo?.label.toLowerCase()} integrations to enable failover.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Current Status */}
                      <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {config.currentActive === 'primary' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          )}
                          <span className="font-medium text-charcoal-900">
                            Currently Active: {config.currentActive === 'primary' ? 'Primary' : 'Backup'}
                          </span>
                        </div>
                        {config.autoFailover && (
                          <Badge variant="secondary">Auto-failover enabled</Badge>
                        )}
                      </div>

                      {/* Primary/Backup Display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${
                          config.currentActive === 'primary'
                            ? 'border-green-200 bg-green-50'
                            : 'border-charcoal-200 bg-white'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Primary</span>
                            {config.currentActive === 'primary' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            )}
                          </div>
                          {primaryIntegration ? (
                            <div>
                              <p className="font-medium text-charcoal-900">{primaryIntegration.name}</p>
                              <p className="text-sm text-charcoal-500">{primaryIntegration.provider}</p>
                            </div>
                          ) : (
                            <p className="text-charcoal-400">Not configured</p>
                          )}
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          config.currentActive === 'backup'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-charcoal-200 bg-white'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Backup</span>
                            {config.currentActive === 'backup' && (
                              <Badge className="bg-amber-100 text-amber-800 text-xs">Active</Badge>
                            )}
                          </div>
                          {backupIntegration ? (
                            <div>
                              <p className="font-medium text-charcoal-900">{backupIntegration.name}</p>
                              <p className="text-sm text-charcoal-500">{backupIntegration.provider}</p>
                            </div>
                          ) : (
                            <p className="text-charcoal-400">Not configured</p>
                          )}
                        </div>
                      </div>

                      {/* Settings Summary */}
                      <div className="flex items-center gap-6 text-sm text-charcoal-500">
                        <span>Threshold: {config.failoverThreshold} failures</span>
                        <span>Recovery check: {config.recoveryCheckIntervalMinutes} min</span>
                        {config.lastFailoverAt && (
                          <span>Last failover: {new Date(config.lastFailoverAt).toLocaleString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingType(config.integrationType)}
                        >
                          Edit
                        </Button>
                        {config.backupIntegrationId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTriggerFailover(config.integrationType, config.currentActive)}
                            disabled={triggerFailoverMutation.isPending}
                          >
                            {triggerFailoverMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <ArrowRightLeft className="w-4 h-4 mr-1" />
                            )}
                            Switch to {config.currentActive === 'primary' ? 'Backup' : 'Primary'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DashboardSection>
          )
        })}
      </div>
    </AdminPageContent>
  )
}
