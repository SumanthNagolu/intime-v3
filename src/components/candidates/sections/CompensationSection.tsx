'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  Briefcase,
  Building2,
  Laptop,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, CompensationSectionData } from '@/lib/candidates/types'
import { RATE_TYPES, EMPLOYMENT_TYPES, WORK_MODES } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CompensationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: CompensationSectionData
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

// Currency options
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'INR', label: 'INR (₹)' },
] as const

/**
 * CompensationSection - Unified component for Candidate Compensation (Section 5)
 *
 * Fields:
 * - Rate info: type, desired rate, minimum rate, currency
 * - Employment preferences: employment types, work modes
 */
export function CompensationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CompensationSectionProps) {
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

  const rateTypeOptions = RATE_TYPES.map(r => ({ value: r.value, label: r.label }))
  const currencyOptions = CURRENCIES.map(c => ({ value: c.value, label: c.label }))
  const employmentTypeOptions = EMPLOYMENT_TYPES.map(e => ({ value: e.value, label: e.label }))
  const workModeOptions = WORK_MODES.map(w => ({ value: w.value, label: w.label }))

  const isHourly = data.rateType === 'hourly'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Compensation"
          subtitle="Rate preferences and employment types"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Rate Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Rate Type"
                type="select"
                options={rateTypeOptions}
                value={data.rateType}
                onChange={(v) => handleChange('rateType', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Currency"
                type="select"
                options={currencyOptions}
                value={data.rateCurrency}
                onChange={(v) => handleChange('rateCurrency', v)}
                editable={isEditable}
              />
            </div>
            
            {isHourly ? (
              <div className="grid grid-cols-2 gap-4">
                <UnifiedField
                  label="Desired Rate"
                  type="currency"
                  value={data.desiredRate}
                  onChange={(v) => handleChange('desiredRate', v)}
                  editable={isEditable}
                  placeholder="0.00"
                  helpText="Per hour"
                />
                <UnifiedField
                  label="Minimum Rate"
                  type="currency"
                  value={data.minimumRate}
                  onChange={(v) => handleChange('minimumRate', v)}
                  editable={isEditable}
                  placeholder="0.00"
                  helpText="Will not go below this"
                />
              </div>
            ) : (
              <UnifiedField
                label="Desired Salary"
                type="currency"
                value={data.desiredSalary}
                onChange={(v) => handleChange('desiredSalary', v)}
                editable={isEditable}
                placeholder="0.00"
                helpText="Annual salary"
              />
            )}

            <UnifiedField
              label="Rate Negotiable"
              type="switch"
              value={data.isNegotiable}
              onChange={(v) => handleChange('isNegotiable', v)}
              editable={isEditable}
              helpText="Candidate is flexible on compensation"
            />

            <UnifiedField
              label="Compensation Notes"
              type="textarea"
              value={data.compensationNotes}
              onChange={(v) => handleChange('compensationNotes', v)}
              editable={isEditable}
              placeholder="Any additional notes about compensation expectations..."
              maxLength={500}
            />
          </CardContent>
        </Card>

        {/* Employment Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Employment Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Employment Types"
              type="multiSelect"
              options={employmentTypeOptions}
              value={data.employmentTypes}
              onChange={(v) => handleChange('employmentTypes', v)}
              editable={isEditable}
              helpText="Select all types candidate is open to"
            />

            <UnifiedField
              label="Work Modes"
              type="multiSelect"
              options={workModeOptions}
              value={data.workModes}
              onChange={(v) => handleChange('workModes', v)}
              editable={isEditable}
              helpText="Select preferred work arrangements"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CompensationSection
