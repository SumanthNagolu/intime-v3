'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Shield, AlertTriangle, Mail, PhoneOff, Database } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, CampaignComplianceSectionData } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignComplianceSectionProps {
  mode: SectionMode
  data: CampaignComplianceSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

/**
 * CampaignComplianceSection - Unified component for Compliance settings
 *
 * Comprehensive compliance management including:
 * - Regulatory compliance (GDPR, CAN-SPAM, CASL, CCPA)
 * - Email requirements (unsubscribe, physical address)
 * - DNC handling (do not contact list, opt-outs)
 * - Data handling (consent collection, retention)
 */
export function CampaignComplianceSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CampaignComplianceSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Check for compliance warnings
  const hasWarning = !data.includeUnsubscribe

  // Count enabled regulations
  const enabledRegulations = [
    data.gdpr && 'GDPR',
    data.canSpam && 'CAN-SPAM',
    data.casl && 'CASL',
    data.ccpa && 'CCPA',
  ].filter((reg): reg is string => Boolean(reg))

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Compliance"
          subtitle="Email marketing regulations and compliance settings"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Warning Banner */}
      {hasWarning && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Compliance Warning</p>
            <p className="text-sm text-amber-700 mt-1">
              Unsubscribe links are required by law for marketing emails. Please enable this option.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regulatory Compliance Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Regulatory Compliance</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Enable compliance with applicable regulations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* GDPR */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">GDPR</Label>
                <p className="text-xs text-charcoal-500">EU data protection</p>
              </div>
              <Switch
                checked={data.gdpr}
                onCheckedChange={(v) => handleChange('gdpr', v)}
                disabled={!isEditable}
              />
            </div>

            {/* CAN-SPAM */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">CAN-SPAM</Label>
                <p className="text-xs text-charcoal-500">US email marketing</p>
              </div>
              <Switch
                checked={data.canSpam}
                onCheckedChange={(v) => handleChange('canSpam', v)}
                disabled={!isEditable}
              />
            </div>

            {/* CASL */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">CASL</Label>
                <p className="text-xs text-charcoal-500">Canada anti-spam</p>
              </div>
              <Switch
                checked={data.casl}
                onCheckedChange={(v) => handleChange('casl', v)}
                disabled={!isEditable}
              />
            </div>

            {/* CCPA */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">CCPA</Label>
                <p className="text-xs text-charcoal-500">California privacy</p>
              </div>
              <Switch
                checked={data.ccpa}
                onCheckedChange={(v) => handleChange('ccpa', v)}
                disabled={!isEditable}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Requirements Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Email Requirements</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Required elements for marketing emails
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unsubscribe Link */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">Unsubscribe Link</Label>
                <p className="text-xs text-charcoal-500">Required for marketing emails</p>
              </div>
              <Switch
                checked={data.includeUnsubscribe}
                onCheckedChange={(v) => handleChange('includeUnsubscribe', v)}
                disabled={!isEditable}
              />
            </div>
            {!data.includeUnsubscribe && (
              <p className="text-xs text-error-600 bg-red-50 px-3 py-2 rounded-lg">
                ⚠️ Unsubscribe links are legally required for marketing emails
              </p>
            )}

            {/* Physical Address */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">Physical Address</Label>
                <p className="text-xs text-charcoal-500">Required by CAN-SPAM</p>
              </div>
              <Switch
                checked={data.includePhysicalAddress}
                onCheckedChange={(v) => handleChange('includePhysicalAddress', v)}
                disabled={!isEditable}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Do Not Contact Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <PhoneOff className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-base font-heading">Do Not Contact (DNC)</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Respect contact preferences and opt-outs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Respect DNC List */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">Internal DNC List</Label>
                <p className="text-xs text-charcoal-500">Exclude do-not-contact entries</p>
              </div>
              <Switch
                checked={data.respectDncList}
                onCheckedChange={(v) => handleChange('respectDncList', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Respect Previous Opt-Outs */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">Previous Opt-Outs</Label>
                <p className="text-xs text-charcoal-500">Exclude unsubscribed contacts</p>
              </div>
              <Switch
                checked={data.respectPreviousOptOuts}
                onCheckedChange={(v) => handleChange('respectPreviousOptOuts', v)}
                disabled={!isEditable}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Handling Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Database className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Data Handling</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Consent and data retention settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Collect Consent */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">Collect Consent</Label>
                <p className="text-xs text-charcoal-500">Require explicit consent</p>
              </div>
              <Switch
                checked={data.collectConsent}
                onCheckedChange={(v) => handleChange('collectConsent', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Data Retention */}
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Retention Period
                </Label>
                <p className="text-xs text-charcoal-500">
                  How long to keep data
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditable ? (
                  <>
                    <Input
                      type="number"
                      value={data.dataRetentionDays}
                      onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value, 10) || 365)}
                      min={30}
                      max={3650}
                      className="h-9 w-20 text-center tabular-nums"
                    />
                    <span className="text-sm text-charcoal-500">days</span>
                  </>
                ) : (
                  <p className="text-charcoal-900">{data.dataRetentionDays} days</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Summary - View mode only */}
      {!isCreateMode && !isEditing && (
        <Card className="shadow-elevation-sm bg-charcoal-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  hasWarning ? 'bg-amber-100' : 'bg-green-100'
                )}>
                  <Shield className={cn(
                    'w-5 h-5',
                    hasWarning ? 'text-amber-600' : 'text-green-600'
                  )} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">
                    {hasWarning ? 'Action Required' : 'Fully Compliant'}
                  </p>
                  <p className="text-xs text-charcoal-500">
                    {hasWarning
                      ? 'Please address the compliance warning above'
                      : `${enabledRegulations.length} regulation${enabledRegulations.length !== 1 ? 's' : ''} enabled`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {enabledRegulations.map((reg) => (
                  <span
                    key={reg}
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded"
                  >
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CampaignComplianceSection
