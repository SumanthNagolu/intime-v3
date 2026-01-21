'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Briefcase, Building2 } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import type { SectionMode, EmploymentSectionData } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface EmploymentSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: EmploymentSectionData
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
  /** Handler for company search/selection (optional) */
  onCompanySearch?: (query: string) => void
  /** Company suggestions from search */
  companySuggestions?: Array<{ id: string; name: string }>
}

/**
 * EmploymentSection - Employment information for Person contacts
 *
 * Shows current job title, department, and company information.
 * Only applicable for Person category contacts.
 */
export function EmploymentSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: EmploymentSectionProps) {
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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Employment"
          subtitle="Current job and company information"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Position Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Current Position</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Job Title"
              value={data.currentTitle}
              onChange={(v) => handleChange('currentTitle', v)}
              editable={isEditable}
              placeholder="e.g., Senior Software Engineer"
              error={errors?.currentTitle}
            />
            <UnifiedField
              label="Department"
              value={data.currentDepartment}
              onChange={(v) => handleChange('currentDepartment', v)}
              editable={isEditable}
              placeholder="e.g., Engineering"
            />
          </CardContent>
        </Card>

        {/* Company Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Current Company</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Company Name"
              value={data.currentCompanyName}
              onChange={(v) => handleChange('currentCompanyName', v)}
              editable={isEditable}
              placeholder="e.g., Acme Corporation"
            />
            {/* In a full implementation, this would be a company picker with search */}
            {data.currentCompanyId && !isEditable && (
              <p className="text-xs text-charcoal-400">
                Linked to account: {data.currentCompanyId.slice(0, 8)}...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmploymentSection
