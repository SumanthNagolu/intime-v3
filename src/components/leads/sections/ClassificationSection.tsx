'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Tag,
  Target,
  Building2,
  Handshake,
  Flame,
  AlertCircle,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  LEAD_TYPES,
  LEAD_CATEGORIES,
  OPPORTUNITY_TYPES,
  BUSINESS_MODELS,
  ENGAGEMENT_TYPES,
  RELATIONSHIP_TYPES,
  PRIORITY_LEVELS,
  TEMPERATURE_LEVELS,
} from '@/lib/leads/constants'
import type { SectionMode, ClassificationSectionData } from '@/lib/leads/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface ClassificationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: ClassificationSectionData
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
 * ClassificationSection - Lead Classification (Type, Opportunity, Business Model)
 *
 * Staffing-specific classification covering:
 * - Lead type (client, bench marketing, vendor partnership, etc.)
 * - Opportunity type (contract, direct hire, SOW, etc.)
 * - Business model and engagement type
 * - Relationship classification
 * - Priority and temperature
 */
export function ClassificationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: ClassificationSectionProps) {
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
  const leadTypeOptions = LEAD_TYPES.map(t => ({ value: t.value, label: `${t.icon} ${t.label}` }))
  const leadCategoryOptions = LEAD_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
  const opportunityTypeOptions = OPPORTUNITY_TYPES.map(o => ({ value: o.value, label: o.label }))
  const businessModelOptions = BUSINESS_MODELS.map(b => ({ value: b.value, label: b.label }))
  const engagementTypeOptions = ENGAGEMENT_TYPES.map(e => ({ value: e.value, label: e.label }))
  const relationshipTypeOptions = RELATIONSHIP_TYPES.map(r => ({ value: r.value, label: r.label }))
  const priorityOptions = PRIORITY_LEVELS.map(p => ({ value: p.value, label: p.label }))
  const temperatureOptions = TEMPERATURE_LEVELS.map(t => ({ value: t.value, label: t.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Lead Classification"
          subtitle="Categorize the lead type and opportunity"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Type Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Tag className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Lead Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Lead Type"
              value={data.leadType}
              onChange={(v) => handleChange('leadType', v)}
              editable={isEditable}
              type="select"
              options={leadTypeOptions}
              required
              error={errors?.leadType}
              placeholder="Select lead type"
            />
            <UnifiedField
              label="Lead Category"
              value={data.leadCategory}
              onChange={(v) => handleChange('leadCategory', v)}
              editable={isEditable}
              type="select"
              options={leadCategoryOptions}
              placeholder="Select category"
            />
          </CardContent>
        </Card>

        {/* Opportunity Type Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Target className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Opportunity Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Opportunity Type"
              value={data.opportunityType}
              onChange={(v) => handleChange('opportunityType', v)}
              editable={isEditable}
              type="select"
              options={opportunityTypeOptions}
              placeholder="Select opportunity type"
            />
          </CardContent>
        </Card>

        {/* Business Model Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Building2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Business Model</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Business Model"
              value={data.businessModel}
              onChange={(v) => handleChange('businessModel', v)}
              editable={isEditable}
              type="select"
              options={businessModelOptions}
              placeholder="Select business model"
            />
            <UnifiedField
              label="Engagement Type"
              value={data.engagementType}
              onChange={(v) => handleChange('engagementType', v)}
              editable={isEditable}
              type="select"
              options={engagementTypeOptions}
              placeholder="Select engagement type"
            />
          </CardContent>
        </Card>

        {/* Relationship Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Handshake className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Relationship</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Relationship Type"
              value={data.relationshipType}
              onChange={(v) => handleChange('relationshipType', v)}
              editable={isEditable}
              type="select"
              options={relationshipTypeOptions}
              placeholder="Select relationship type"
            />
            <UnifiedField
              label="Existing Relationship"
              value={data.existingRelationship}
              onChange={(v) => handleChange('existingRelationship', v)}
              editable={isEditable}
              type="switch"
            />
            {data.existingRelationship && (
              <UnifiedField
                label="Previous Engagement Notes"
                value={data.previousEngagementNotes}
                onChange={(v) => handleChange('previousEngagementNotes', v)}
                editable={isEditable}
                type="textarea"
                placeholder="Describe previous engagements..."
              />
            )}
          </CardContent>
        </Card>

        {/* Priority & Temperature Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Flame className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Priority & Temperature</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedField
                label="Priority"
                value={data.priority}
                onChange={(v) => handleChange('priority', v)}
                editable={isEditable}
                type="select"
                options={priorityOptions}
                placeholder="Select priority"
              />
              <UnifiedField
                label="Temperature"
                value={data.temperature}
                onChange={(v) => handleChange('temperature', v)}
                editable={isEditable}
                type="select"
                options={temperatureOptions}
                placeholder="Select temperature"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClassificationSection
