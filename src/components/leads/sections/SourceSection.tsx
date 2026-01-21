'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Target,
  Megaphone,
  Users,
  Link2,
  Globe,
  Mail,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  LEAD_SOURCES,
  REFERRAL_TYPES,
} from '@/lib/leads/constants'
import type { SectionMode, SourceSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface SourceSectionProps {
  mode: SectionMode
  data: SourceSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

/**
 * SourceSection - Lead Source and Attribution
 */
export function SourceSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: SourceSectionProps) {
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

  const sourceOptions = LEAD_SOURCES.map(s => ({ value: s.value, label: `${s.icon} ${s.label}` }))
  const referralOptions = REFERRAL_TYPES.map(r => ({ value: r.value, label: r.label }))

  // Show referral fields only when source is 'referral'
  const showReferralFields = data.source === 'referral'
  // Show campaign fields when source is 'campaign'
  const showCampaignFields = data.source === 'campaign' || data.source === 'email'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Lead Source"
          subtitle="How this lead was acquired and attribution details"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Source Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Target className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Primary Source</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Lead Source"
              value={data.source}
              onChange={(v) => handleChange('source', v)}
              editable={isEditable}
              type="select"
              options={sourceOptions}
              required
              error={errors?.source}
            />
            <UnifiedField
              label="Source Details"
              value={data.sourceDetails}
              onChange={(v) => handleChange('sourceDetails', v)}
              editable={isEditable}
              type="textarea"
              placeholder="Additional details about the source..."
            />
          </CardContent>
        </Card>

        {/* Referral Info Card - Conditional */}
        {(showReferralFields || isEditable) && (
          <Card className={cn(
            "shadow-elevation-sm hover:shadow-elevation-md transition-shadow",
            !showReferralFields && isEditable && "opacity-50"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Users className="w-4 h-4 text-charcoal-600" />
                </div>
                <CardTitle className="text-base font-heading">Referral Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnifiedField
                label="Referred By"
                value={data.referredBy}
                onChange={(v) => handleChange('referredBy', v)}
                editable={isEditable && showReferralFields}
                placeholder="Name of referrer"
              />
              <UnifiedField
                label="Referral Type"
                value={data.referralType}
                onChange={(v) => handleChange('referralType', v)}
                editable={isEditable && showReferralFields}
                type="select"
                options={referralOptions}
                placeholder="Select type"
              />
            </CardContent>
          </Card>
        )}

        {/* Campaign Info Card - Conditional */}
        {(showCampaignFields || isEditable) && (
          <Card className={cn(
            "shadow-elevation-sm hover:shadow-elevation-md transition-shadow",
            !showCampaignFields && isEditable && "opacity-50"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Megaphone className="w-4 h-4 text-charcoal-600" />
                </div>
                <CardTitle className="text-base font-heading">Campaign Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnifiedField
                label="Campaign Name"
                value={data.campaignName}
                onChange={(v) => handleChange('campaignName', v)}
                editable={isEditable && showCampaignFields}
                placeholder="Marketing campaign name"
              />
            </CardContent>
          </Card>
        )}

        {/* Marketing Attribution Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Link2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Marketing Attribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <UnifiedField
                label="UTM Source"
                value={data.utmSource}
                onChange={(v) => handleChange('utmSource', v)}
                editable={isEditable}
                placeholder="e.g., google"
              />
              <UnifiedField
                label="UTM Medium"
                value={data.utmMedium}
                onChange={(v) => handleChange('utmMedium', v)}
                editable={isEditable}
                placeholder="e.g., cpc"
              />
              <UnifiedField
                label="UTM Campaign"
                value={data.utmCampaign}
                onChange={(v) => handleChange('utmCampaign', v)}
                editable={isEditable}
                placeholder="e.g., spring_2024"
              />
            </div>
            <UnifiedField
              label="Landing Page"
              value={data.landingPage}
              onChange={(v) => handleChange('landingPage', v)}
              editable={isEditable}
              type="url"
              placeholder="https://example.com/landing-page"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SourceSection
