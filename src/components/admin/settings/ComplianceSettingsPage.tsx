'use client'

import * as React from 'react'
import { ShieldCheck, Database, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsSection } from './SettingsSection'

const retentionPeriods = [
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '5', label: '5 years' },
  { value: '7', label: '7 years' },
  { value: '10', label: '10 years' },
  { value: 'indefinite', label: 'Indefinite' },
]

export function ComplianceSettingsPage() {
  const utils = trpc.useUtils()

  // Fetch settings
  const { data: orgSettings, isLoading } = trpc.settings.getOrgSettings.useQuery({ category: 'compliance' })

  // Form state - Data retention
  const [dataRetentionPeriod, setDataRetentionPeriod] = React.useState('7')
  const [auditLogRetention, setAuditLogRetention] = React.useState('7')
  const [autoDeleteInactive, setAutoDeleteInactive] = React.useState(false)
  const [inactiveThreshold, setInactiveThreshold] = React.useState('365')

  // Form state - GDPR
  const [gdprEnabled, setGdprEnabled] = React.useState(false)
  const [allowDataExport, setAllowDataExport] = React.useState(true)
  const [allowDataDeletion, setAllowDataDeletion] = React.useState(true)
  const [requireConsent, setRequireConsent] = React.useState(true)

  // Update form when data loads
  React.useEffect(() => {
    if (orgSettings) {
      const settingsMap = Object.fromEntries(
        orgSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.data_retention_period) setDataRetentionPeriod(String(settingsMap.data_retention_period))
      if (settingsMap.audit_log_retention) setAuditLogRetention(String(settingsMap.audit_log_retention))
      if (typeof settingsMap.auto_delete_inactive === 'boolean') setAutoDeleteInactive(settingsMap.auto_delete_inactive)
      if (settingsMap.inactive_threshold) setInactiveThreshold(String(settingsMap.inactive_threshold))
      if (typeof settingsMap.gdpr_enabled === 'boolean') setGdprEnabled(settingsMap.gdpr_enabled)
      if (typeof settingsMap.allow_data_export === 'boolean') setAllowDataExport(settingsMap.allow_data_export)
      if (typeof settingsMap.allow_data_deletion === 'boolean') setAllowDataDeletion(settingsMap.allow_data_deletion)
      if (typeof settingsMap.require_consent === 'boolean') setRequireConsent(settingsMap.require_consent)
    }
  }, [orgSettings])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      toast.success('Compliance settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    updateSettings.mutate({
      settings: [
        { key: 'data_retention_period', value: dataRetentionPeriod, category: 'compliance' },
        { key: 'audit_log_retention', value: auditLogRetention, category: 'compliance' },
        { key: 'auto_delete_inactive', value: autoDeleteInactive, category: 'compliance' },
        { key: 'inactive_threshold', value: parseInt(inactiveThreshold) || 365, category: 'compliance' },
        { key: 'gdpr_enabled', value: gdprEnabled, category: 'compliance' },
        { key: 'allow_data_export', value: allowDataExport, category: 'compliance' },
        { key: 'allow_data_deletion', value: allowDataDeletion, category: 'compliance' },
        { key: 'require_consent', value: requireConsent, category: 'compliance' },
      ],
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Compliance' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
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
          <Button
            onClick={handleSave}
            loading={updateSettings.isPending}
            disabled={updateSettings.isPending}
          >
            Save Changes
          </Button>
        }
      />
      <div className="space-y-8">
        {/* Data Retention */}
        <SettingsSection
          title="Data Retention"
          description="Configure how long data is kept"
          icon={Database}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dataRetention">Data Retention Period</Label>
                <Select value={dataRetentionPeriod} onValueChange={setDataRetentionPeriod}>
                  <SelectTrigger id="dataRetention">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {retentionPeriods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-charcoal-500">
                  How long to retain candidate and job data
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditRetention">Audit Log Retention</Label>
                <Select value={auditLogRetention} onValueChange={setAuditLogRetention}>
                  <SelectTrigger id="auditRetention">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {retentionPeriods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-charcoal-500">
                  How long to retain audit logs
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Auto-Delete Inactive Records</Label>
                <p className="text-sm text-charcoal-500">
                  Automatically delete records after inactivity period
                </p>
              </div>
              <Switch
                checked={autoDeleteInactive}
                onCheckedChange={setAutoDeleteInactive}
              />
            </div>

            {autoDeleteInactive && (
              <div className="space-y-2">
                <Label htmlFor="inactiveThreshold">Inactive Threshold (days)</Label>
                <Input
                  id="inactiveThreshold"
                  type="number"
                  value={inactiveThreshold}
                  onChange={(e) => setInactiveThreshold(e.target.value)}
                  placeholder="365"
                  min="30"
                />
              </div>
            )}
          </div>
        </SettingsSection>

        {/* GDPR */}
        <SettingsSection
          title="GDPR Compliance"
          description="Enable GDPR compliance features"
          icon={ShieldCheck}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Enable GDPR Features</Label>
                <p className="text-sm text-charcoal-500">
                  Enable GDPR-compliant data handling and consent management
                </p>
              </div>
              <Switch
                checked={gdprEnabled}
                onCheckedChange={setGdprEnabled}
              />
            </div>

            {gdprEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-charcoal-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Data Export</Label>
                    <p className="text-sm text-charcoal-500">
                      Allow users to export their personal data
                    </p>
                  </div>
                  <Switch
                    checked={allowDataExport}
                    onCheckedChange={setAllowDataExport}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Data Deletion Requests</Label>
                    <p className="text-sm text-charcoal-500">
                      Allow users to request deletion of their data
                    </p>
                  </div>
                  <Switch
                    checked={allowDataDeletion}
                    onCheckedChange={setAllowDataDeletion}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Consent for Data Processing</Label>
                    <p className="text-sm text-charcoal-500">
                      Require explicit consent before processing data
                    </p>
                  </div>
                  <Switch
                    checked={requireConsent}
                    onCheckedChange={setRequireConsent}
                  />
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Data Export */}
        <SettingsSection
          title="Data Export"
          description="Export organization data"
          icon={Download}
        >
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div className="space-y-0.5">
              <p className="font-medium text-charcoal-900">Export All Data</p>
              <p className="text-sm text-charcoal-500">
                Download a complete export of your organization&apos;s data
              </p>
            </div>
            <Button variant="outline" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Request Export
            </Button>
          </div>
          <p className="text-xs text-charcoal-500 mt-2">
            Data exports are processed within 24-48 hours. You will receive an email when ready.
          </p>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
