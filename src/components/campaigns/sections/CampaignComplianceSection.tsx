'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Shield, AlertTriangle, Mail, PhoneOff, Database } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
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
            <p className="text-sm text-charcoal-500 mt-1">
              Enable compliance with applicable regulations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="GDPR Compliant"
              type="switch"
              value={data.gdpr}
              onChange={(v) => handleChange('gdpr', v)}
              editable={isEditable}
              helpText="General Data Protection Regulation (EU)"
            />
            <UnifiedField
              label="CAN-SPAM Compliant"
              type="switch"
              value={data.canSpam}
              onChange={(v) => handleChange('canSpam', v)}
              editable={isEditable}
              helpText="Controlling the Assault of Non-Solicited Pornography And Marketing Act (US)"
            />
            <UnifiedField
              label="CASL Compliant"
              type="switch"
              value={data.casl}
              onChange={(v) => handleChange('casl', v)}
              editable={isEditable}
              helpText="Canada's Anti-Spam Legislation"
            />
            <UnifiedField
              label="CCPA Compliant"
              type="switch"
              value={data.ccpa}
              onChange={(v) => handleChange('ccpa', v)}
              editable={isEditable}
              helpText="California Consumer Privacy Act"
            />
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
            <p className="text-sm text-charcoal-500 mt-1">
              Required elements for marketing emails
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Include Unsubscribe Link"
              type="switch"
              value={data.includeUnsubscribe}
              onChange={(v) => handleChange('includeUnsubscribe', v)}
              editable={isEditable}
              helpText="Required: Include an unsubscribe link in all marketing emails"
            />
            {!data.includeUnsubscribe && (
              <p className="text-xs text-error-600 -mt-2">
                Unsubscribe links are legally required for marketing emails
              </p>
            )}
            <UnifiedField
              label="Include Physical Address"
              type="switch"
              value={data.includePhysicalAddress}
              onChange={(v) => handleChange('includePhysicalAddress', v)}
              editable={isEditable}
              helpText="Include your company's physical mailing address (required by CAN-SPAM)"
            />
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
            <p className="text-sm text-charcoal-500 mt-1">
              Respect contact preferences and opt-outs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Respect Internal DNC List"
              type="switch"
              value={data.respectDncList}
              onChange={(v) => handleChange('respectDncList', v)}
              editable={isEditable}
              helpText="Exclude contacts on your internal do-not-contact list"
            />
            <UnifiedField
              label="Respect Previous Opt-Outs"
              type="switch"
              value={data.respectPreviousOptOuts}
              onChange={(v) => handleChange('respectPreviousOptOuts', v)}
              editable={isEditable}
              helpText="Exclude contacts who have previously unsubscribed from communications"
            />
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
            <p className="text-sm text-charcoal-500 mt-1">
              Consent and data retention settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Collect Consent"
              type="switch"
              value={data.collectConsent}
              onChange={(v) => handleChange('collectConsent', v)}
              editable={isEditable}
              helpText="Collect explicit consent before adding to marketing lists"
            />
            <UnifiedField
              label="Data Retention Period (days)"
              type="number"
              value={String(data.dataRetentionDays)}
              onChange={(v) => handleChange('dataRetentionDays', parseInt(String(v), 10) || 365)}
              editable={isEditable}
              min={30}
              max={3650}
              helpText="How long to retain campaign data (default: 365 days)"
            />
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
