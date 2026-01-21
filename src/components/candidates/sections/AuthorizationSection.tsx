'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Clock,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Home,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, AuthorizationSectionData } from '@/lib/candidates/types'
import { VISA_STATUSES, AVAILABILITY_OPTIONS } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface AuthorizationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: AuthorizationSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

// Clearance levels
const CLEARANCE_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'public_trust', label: 'Public Trust' },
  { value: 'secret', label: 'Secret' },
  { value: 'top_secret', label: 'Top Secret' },
  { value: 'ts_sci', label: 'TS/SCI' },
] as const

/**
 * AuthorizationSection - Unified component for Candidate Authorization (Section 4)
 *
 * Fields:
 * - Work authorization: visa status, expiry, sponsorship
 * - Availability: start date, notice period
 * - Location preferences: relocation, remote work
 */
export function AuthorizationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: AuthorizationSectionProps) {
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

  const visaOptions = VISA_STATUSES.map(v => ({ value: v.value, label: v.label }))
  const availabilityOptions = AVAILABILITY_OPTIONS.map(a => ({ value: a.value, label: a.label }))
  const clearanceOptions = CLEARANCE_LEVELS.map(c => ({ value: c.value, label: c.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Authorization"
          subtitle="Work authorization, visa status, and availability"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Authorization Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Work Authorization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Visa Status"
              type="select"
              options={visaOptions}
              value={data.visaStatus}
              onChange={(v) => handleChange('visaStatus', v)}
              editable={isEditable}
              error={errors?.visaStatus}
            />
            <UnifiedField
              label="Visa Expiry Date"
              type="date"
              value={data.visaExpiryDate}
              onChange={(v) => handleChange('visaExpiryDate', v)}
              editable={isEditable}
              error={errors?.visaExpiryDate}
            />
            <UnifiedField
              label="Requires Sponsorship"
              type="switch"
              value={data.requiresSponsorship}
              onChange={(v) => handleChange('requiresSponsorship', v)}
              editable={isEditable}
              helpText="Does this candidate need visa sponsorship?"
            />
            {data.requiresSponsorship && (
              <>
                <UnifiedField
                  label="Current Sponsor"
                  value={data.currentSponsor}
                  onChange={(v) => handleChange('currentSponsor', v)}
                  editable={isEditable}
                  placeholder="Current sponsoring company"
                />
                <UnifiedField
                  label="Sponsorship Transferable"
                  type="switch"
                  value={data.isTransferable}
                  onChange={(v) => handleChange('isTransferable', v)}
                  editable={isEditable}
                  helpText="Can the visa sponsorship be transferred?"
                />
              </>
            )}
            <UnifiedField
              label="Security Clearance"
              type="select"
              options={clearanceOptions}
              value={data.clearanceLevel}
              onChange={(v) => handleChange('clearanceLevel', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Availability Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Availability</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Availability"
              type="select"
              options={availabilityOptions}
              value={data.availability}
              onChange={(v) => handleChange('availability', v)}
              editable={isEditable}
            />
            {data.availability === 'specific_date' && (
              <UnifiedField
                label="Available From"
                type="date"
                value={data.availableFrom}
                onChange={(v) => handleChange('availableFrom', v)}
                editable={isEditable}
              />
            )}
            <UnifiedField
              label="Notice Period"
              value={data.noticePeriod}
              onChange={(v) => handleChange('noticePeriod', v)}
              editable={isEditable}
              placeholder="e.g., 2 weeks"
            />
            <UnifiedField
              label="Notice Period (Days)"
              type="number"
              value={data.noticePeriodDays}
              onChange={(v) => handleChange('noticePeriodDays', v)}
              editable={isEditable}
              min={0}
              max={180}
            />
          </CardContent>
        </Card>

        {/* Location Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Location Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UnifiedField
                label="Open to Remote Work"
                type="switch"
                value={data.isRemoteOk}
                onChange={(v) => handleChange('isRemoteOk', v)}
                editable={isEditable}
                helpText="Candidate is open to remote positions"
              />
              <UnifiedField
                label="Willing to Relocate"
                type="switch"
                value={data.willingToRelocate}
                onChange={(v) => handleChange('willingToRelocate', v)}
                editable={isEditable}
                helpText="Candidate is open to relocation"
              />
              <div className="md:col-span-1">
                {data.willingToRelocate && (
                  <UnifiedField
                    label="Relocation Preferences"
                    type="textarea"
                    value={data.relocationPreferences}
                    onChange={(v) => handleChange('relocationPreferences', v)}
                    editable={isEditable}
                    placeholder="Preferred cities, states, or regions..."
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthorizationSection
