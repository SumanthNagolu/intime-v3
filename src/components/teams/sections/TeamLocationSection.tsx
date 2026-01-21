'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MapPin, Globe } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { US_STATES, COUNTRIES } from '@/components/addresses'
import type { SectionMode, TeamLocationSectionData } from '@/lib/teams/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface TeamLocationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: TeamLocationSectionData
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

/**
 * TeamLocationSection - Unified component for Team Location
 */
export function TeamLocationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: TeamLocationSectionProps) {
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

  // Convert to options
  const stateOptions = US_STATES?.map(s => ({ value: s.value, label: s.label })) ?? []
  const countryOptions = COUNTRIES?.map(c => ({ value: c.value, label: c.label })) ?? [{ value: 'US', label: 'United States' }]

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Location"
          subtitle="Team address and regional assignments"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address Card */}
        <Card className="shadow-elevation-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <MapPin className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <UnifiedField
                  label="Address Line 1"
                  value={data.addressLine1}
                  onChange={(v) => handleChange('addressLine1', v)}
                  editable={isEditable}
                  error={errors.addressLine1}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="md:col-span-2">
                <UnifiedField
                  label="Address Line 2"
                  value={data.addressLine2}
                  onChange={(v) => handleChange('addressLine2', v)}
                  editable={isEditable}
                  error={errors.addressLine2}
                  placeholder="Suite 100"
                />
              </div>
              <UnifiedField
                label="City"
                value={data.city}
                onChange={(v) => handleChange('city', v)}
                editable={isEditable}
                error={errors.city}
                placeholder="New York"
              />
              <UnifiedField
                label="State"
                value={data.state}
                onChange={(v) => handleChange('state', v)}
                editable={isEditable}
                type="select"
                options={stateOptions}
                error={errors.state}
              />
              <UnifiedField
                label="Postal Code"
                value={data.postalCode}
                onChange={(v) => handleChange('postalCode', v)}
                editable={isEditable}
                error={errors.postalCode}
                placeholder="10001"
              />
              <UnifiedField
                label="Country"
                value={data.country}
                onChange={(v) => handleChange('country', v)}
                editable={isEditable}
                type="select"
                options={countryOptions}
                error={errors.country}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regions Card */}
        {data.regions && data.regions.length > 0 && (
          <Card className="shadow-elevation-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Globe className="w-4 h-4 text-charcoal-600" />
                </div>
                <CardTitle className="text-base font-heading">Assigned Regions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.regions.map((region) => (
                  <div
                    key={region.id}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm',
                      region.isPrimary
                        ? 'bg-gold-50 text-gold-700 border border-gold-200'
                        : 'bg-charcoal-100 text-charcoal-700'
                    )}
                  >
                    {region.name}
                    {region.code && <span className="text-charcoal-400 ml-1">({region.code})</span>}
                    {region.isPrimary && <span className="ml-2 text-xs">Primary</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TeamLocationSection
