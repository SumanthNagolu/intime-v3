'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Award,
  Star,
  Flame,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  CANDIDATE_STATUSES,
  VISA_TYPES,
  AVAILABILITY_OPTIONS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_STATUSES,
  getCandidateStatusBadgeVariant,
} from '@/lib/contacts/constants'
import type { SectionMode, CandidateSectionData } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CandidateSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: CandidateSectionData
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
 * CandidateSection - Candidate-specific information
 *
 * Handles resume, skills, compensation, availability, and recruiter ratings.
 * Only applicable for contacts with 'candidate' type.
 */
export function CandidateSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CandidateSectionProps) {
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
  const statusOptions = CANDIDATE_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const visaOptions = VISA_TYPES.map(v => ({ value: v.value, label: v.label }))
  const availabilityOptions = AVAILABILITY_OPTIONS.map(a => ({ value: a.value, label: a.label }))
  const employmentTypeOptions = EMPLOYMENT_TYPES.map(e => ({ value: e.value, label: e.label }))
  const employmentStatusOptions = EMPLOYMENT_STATUSES.map(e => ({ value: e.value, label: e.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Candidate Information"
          subtitle="Resume, skills, compensation, and availability"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status & Resume Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Status & Resume</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Candidate Status"
              type="select"
              options={statusOptions}
              value={data.candidateStatus}
              onChange={(v) => handleChange('candidateStatus', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getCandidateStatusBadgeVariant(data.candidateStatus)}
            />
            <UnifiedField
              label="Resume URL"
              type="url"
              value={data.candidateResumeUrl}
              onChange={(v) => handleChange('candidateResumeUrl', v)}
              editable={isEditable}
              placeholder="https://..."
            />
            <UnifiedField
              label="Years of Experience"
              type="number"
              value={data.candidateExperienceYears ? String(data.candidateExperienceYears) : ''}
              onChange={(v) => handleChange('candidateExperienceYears', v ? parseInt(v as string) : null)}
              editable={isEditable}
              min={0}
              max={50}
              placeholder="e.g., 5"
            />
          </CardContent>
        </Card>

        {/* Work Authorization Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Work Authorization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Visa Status"
              type="select"
              options={visaOptions}
              value={data.candidateCurrentVisa}
              onChange={(v) => handleChange('candidateCurrentVisa', v)}
              editable={isEditable}
              placeholder="Select visa type"
            />
            <UnifiedField
              label="Visa Expiry Date"
              type="date"
              value={data.candidateVisaExpiry}
              onChange={(v) => handleChange('candidateVisaExpiry', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Compensation Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Compensation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Desired Hourly Rate"
                type="currency"
                value={data.candidateHourlyRate}
                onChange={(v) => handleChange('candidateHourlyRate', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Minimum Hourly Rate"
                type="currency"
                value={data.candidateMinimumHourlyRate}
                onChange={(v) => handleChange('candidateMinimumHourlyRate', v)}
                editable={isEditable}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Desired Annual Salary"
                type="currency"
                value={data.candidateDesiredSalaryAnnual}
                onChange={(v) => handleChange('candidateDesiredSalaryAnnual', v)}
                editable={isEditable}
              />
              <UnifiedField
                label="Minimum Annual Salary"
                type="currency"
                value={data.candidateMinimumAnnualSalary}
                onChange={(v) => handleChange('candidateMinimumAnnualSalary', v)}
                editable={isEditable}
              />
            </div>
            <UnifiedField
              label="Compensation Notes"
              type="textarea"
              value={data.candidateCompensationNotes}
              onChange={(v) => handleChange('candidateCompensationNotes', v)}
              editable={isEditable}
              placeholder="Any additional compensation requirements..."
            />
          </CardContent>
        </Card>

        {/* Availability Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Availability</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Current Employment Status"
              type="select"
              options={employmentStatusOptions}
              value={data.candidateCurrentEmploymentStatus}
              onChange={(v) => handleChange('candidateCurrentEmploymentStatus', v)}
              editable={isEditable}
              placeholder="Select status"
            />
            <UnifiedField
              label="Availability"
              type="select"
              options={availabilityOptions}
              value={data.candidateAvailability}
              onChange={(v) => handleChange('candidateAvailability', v)}
              editable={isEditable}
              placeholder="Select availability"
            />
            <UnifiedField
              label="Notice Period (Days)"
              type="number"
              value={data.candidateNoticePeriodDays ? String(data.candidateNoticePeriodDays) : ''}
              onChange={(v) => handleChange('candidateNoticePeriodDays', v ? parseInt(v as string) : null)}
              editable={isEditable}
              min={0}
              placeholder="e.g., 14"
            />
            <UnifiedField
              label="Earliest Start Date"
              type="date"
              value={data.candidateEarliestStartDate}
              onChange={(v) => handleChange('candidateEarliestStartDate', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Work Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Willing to Relocate"
              type="switch"
              value={data.candidateWillingToRelocate}
              onChange={(v) => handleChange('candidateWillingToRelocate', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Preferred Employment Types"
              type="multiSelect"
              options={employmentTypeOptions}
              value={data.candidatePreferredEmploymentType}
              onChange={(v) => handleChange('candidatePreferredEmploymentType', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Recruiter Assessment Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Star className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Recruiter Assessment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Recruiter Rating"
              type="number"
              value={data.candidateRecruiterRating ? String(data.candidateRecruiterRating) : ''}
              onChange={(v) => handleChange('candidateRecruiterRating', v ? parseInt(v as string) : null)}
              editable={isEditable}
              min={1}
              max={5}
              placeholder="1-5"
            />
            <UnifiedField
              label="Rating Notes"
              type="textarea"
              value={data.candidateRecruiterRatingNotes}
              onChange={(v) => handleChange('candidateRecruiterRatingNotes', v)}
              editable={isEditable}
              placeholder="Notes on candidate quality..."
            />
          </CardContent>
        </Card>

        {/* Hotlist Card - full width */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-base font-heading">Hotlist Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedField
                label="On Hotlist"
                type="switch"
                value={data.candidateIsOnHotlist}
                onChange={(v) => handleChange('candidateIsOnHotlist', v)}
                editable={isEditable}
                helpText="High-priority candidate for active placement"
              />
              {data.candidateIsOnHotlist && (
                <UnifiedField
                  label="Hotlist Notes"
                  type="textarea"
                  value={data.candidateHotlistNotes}
                  onChange={(v) => handleChange('candidateHotlistNotes', v)}
                  editable={isEditable}
                  placeholder="Why is this candidate on the hotlist?"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CandidateSection
