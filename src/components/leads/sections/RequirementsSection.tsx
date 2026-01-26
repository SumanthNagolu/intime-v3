'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  FileText,
  DollarSign,
  Clock,
  Briefcase,
  Shield,
  Wrench,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import { TagInput } from '@/components/ui/tag-input'
import {
  CONTRACT_TYPES,
  POSITION_URGENCY,
  ESTIMATED_DURATIONS,
  REMOTE_POLICIES,
  EXPERIENCE_LEVELS,
  SECURITY_CLEARANCE_LEVELS,
  CURRENCIES,
} from '@/lib/leads/constants'
import type { SectionMode, RequirementsSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface RequirementsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: RequirementsSectionData
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
 * RequirementsSection - Staffing Requirements (Contracts, Rates, Skills, Compliance)
 *
 * Comprehensive staffing-specific requirements:
 * - Contract types accepted
 * - Rate information (bill rate range, markup)
 * - Position details (count, urgency, duration, remote policy)
 * - Skills and certifications
 * - Security clearance and compliance
 */
export function RequirementsSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: RequirementsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert constants to option format
  const contractTypeOptions = CONTRACT_TYPES.map(c => ({ value: c.value, label: c.label }))
  const urgencyOptions = POSITION_URGENCY.map(u => ({ value: u.value, label: u.label }))
  const durationOptions = ESTIMATED_DURATIONS.map(d => ({ value: d.value, label: d.label }))
  const remotePolicyOptions = REMOTE_POLICIES.map(r => ({ value: r.value, label: `${r.icon} ${r.label}` }))
  const experienceOptions = EXPERIENCE_LEVELS.map(e => ({ value: e.value, label: e.label }))
  const clearanceOptions = SECURITY_CLEARANCE_LEVELS.map(c => ({ value: c.value, label: c.label }))
  const currencyOptions = CURRENCIES.map(c => ({ value: c.value, label: c.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Staffing Requirements"
          subtitle="Contract types, rates, and position details"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Types Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <FileText className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Contract Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Accepted Contract Types"
              value={data.contractTypes}
              onChange={(v) => handleChange('contractTypes', v)}
              editable={isEditable}
              type="multiSelect"
              options={contractTypeOptions}
              placeholder="Select accepted types"
            />
            <UnifiedField
              label="Primary Contract Type"
              value={data.primaryContractType}
              onChange={(v) => handleChange('primaryContractType', v)}
              editable={isEditable}
              type="select"
              options={contractTypeOptions}
              placeholder="Select primary type"
            />
          </CardContent>
        </Card>

        {/* Rate Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Rate Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Currency"
              value={data.billRateCurrency}
              onChange={(v) => handleChange('billRateCurrency', v)}
              editable={isEditable}
              type="select"
              options={currencyOptions}
            />
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Bill Rate Min ($/hr)"
                value={data.billRateMin}
                onChange={(v) => handleChange('billRateMin', v)}
                editable={isEditable}
                type="number"
                placeholder="e.g., 75"
              />
              <UnifiedField
                label="Bill Rate Max ($/hr)"
                value={data.billRateMax}
                onChange={(v) => handleChange('billRateMax', v)}
                editable={isEditable}
                type="number"
                placeholder="e.g., 125"
              />
            </div>
            <UnifiedField
              label="Target Markup %"
              value={data.targetMarkupPercentage}
              onChange={(v) => handleChange('targetMarkupPercentage', v)}
              editable={isEditable}
              type="number"
              placeholder="e.g., 35"
            />
          </CardContent>
        </Card>

        {/* Position Details Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Clock className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Position Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Number of Positions"
              value={data.positionsCount}
              onChange={(v) => handleChange('positionsCount', v)}
              editable={isEditable}
              type="number"
              placeholder="e.g., 1"
            />
            <UnifiedField
              label="Position Urgency"
              value={data.positionsUrgency}
              onChange={(v) => handleChange('positionsUrgency', v)}
              editable={isEditable}
              type="select"
              options={urgencyOptions}
              placeholder="Select urgency"
            />
            <UnifiedField
              label="Estimated Duration"
              value={data.estimatedDuration}
              onChange={(v) => handleChange('estimatedDuration', v)}
              editable={isEditable}
              type="select"
              options={durationOptions}
              placeholder="Select duration"
            />
            <UnifiedField
              label="Remote Policy"
              value={data.remotePolicy}
              onChange={(v) => handleChange('remotePolicy', v)}
              editable={isEditable}
              type="select"
              options={remotePolicyOptions}
              placeholder="Select remote policy"
            />
          </CardContent>
        </Card>

        {/* Skills & Experience Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Briefcase className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Skills & Experience</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable ? (
              <TagInput
                label="Primary Skills"
                value={data.primarySkills}
                onChange={(v) => handleChange('primarySkills', v)}
                placeholder="Type skill and press Enter..."
                helperText="Add required technical skills"
              />
            ) : (
              <UnifiedField
                label="Primary Skills"
                value={data.primarySkills.join(', ')}
                editable={false}
                type="text"
              />
            )}
            {isEditable ? (
              <TagInput
                label="Secondary Skills"
                value={data.secondarySkills}
                onChange={(v) => handleChange('secondarySkills', v)}
                placeholder="Type skill and press Enter..."
                helperText="Add nice-to-have skills"
              />
            ) : (
              <UnifiedField
                label="Secondary Skills"
                value={data.secondarySkills.join(', ')}
                editable={false}
                type="text"
              />
            )}
            <UnifiedField
              label="Experience Level"
              value={data.experienceLevel}
              onChange={(v) => handleChange('experienceLevel', v)}
              editable={isEditable}
              type="select"
              options={experienceOptions}
              placeholder="Select level"
            />
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Min Years Experience"
                value={data.yearsExperienceMin}
                onChange={(v) => handleChange('yearsExperienceMin', v)}
                editable={isEditable}
                type="number"
                placeholder="e.g., 3"
              />
              <UnifiedField
                label="Max Years Experience"
                value={data.yearsExperienceMax}
                onChange={(v) => handleChange('yearsExperienceMax', v)}
                editable={isEditable}
                type="number"
                placeholder="e.g., 8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Shield className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Security & Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Security Clearance Required"
              value={data.securityClearanceRequired}
              onChange={(v) => handleChange('securityClearanceRequired', v)}
              editable={isEditable}
              type="switch"
            />
            {data.securityClearanceRequired && (
              <UnifiedField
                label="Clearance Level"
                value={data.securityClearanceLevel}
                onChange={(v) => handleChange('securityClearanceLevel', v)}
                editable={isEditable}
                type="select"
                options={clearanceOptions}
                placeholder="Select clearance level"
              />
            )}
            <UnifiedField
              label="Background Check Required"
              value={data.backgroundCheckRequired}
              onChange={(v) => handleChange('backgroundCheckRequired', v)}
              editable={isEditable}
              type="switch"
            />
            <UnifiedField
              label="Drug Test Required"
              value={data.drugTestRequired}
              onChange={(v) => handleChange('drugTestRequired', v)}
              editable={isEditable}
              type="switch"
            />
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Wrench className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Additional Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Technical Notes"
              value={data.technicalNotes}
              onChange={(v) => handleChange('technicalNotes', v)}
              editable={isEditable}
              type="textarea"
              placeholder="Technical requirements, stack details..."
            />
            <UnifiedField
              label="Hiring Manager Preferences"
              value={data.hiringManagerPreferences}
              onChange={(v) => handleChange('hiringManagerPreferences', v)}
              editable={isEditable}
              type="textarea"
              placeholder="Interview process, preferences..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequirementsSection
