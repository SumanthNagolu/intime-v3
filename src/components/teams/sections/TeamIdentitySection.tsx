'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users, Building2, Phone, Mail, Settings } from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { GROUP_TYPES, SECURITY_ZONES } from '@/lib/teams/constants'
import type { SectionMode, TeamIdentitySectionData } from '@/lib/teams/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface TeamIdentitySectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: TeamIdentitySectionData
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
  /** Parent groups for dropdown (optional) */
  parentGroups?: Array<{ id: string; name: string; groupType: string }>
}

/**
 * TeamIdentitySection - Unified component for Team Identity & Configuration
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
 */
export function TeamIdentitySection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  parentGroups = [],
}: TeamIdentitySectionProps) {
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

  // Convert constants to option format for UnifiedField
  const groupTypeOptions = GROUP_TYPES.map(t => ({ value: t.value, label: t.label, description: t.description }))
  const securityZoneOptions = SECURITY_ZONES.map(s => ({ value: s.value, label: s.label, description: s.description }))
  const parentGroupOptions = parentGroups.map(g => ({ value: g.id, label: `${g.name} (${g.groupType.replace(/_/g, ' ')})` }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Team Identity"
          subtitle="Core team information and configuration"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Identity Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Users className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Core Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Team Name"
              value={data.name}
              onChange={(v) => handleChange('name', v)}
              editable={isEditable}
              required
              error={errors.name}
              placeholder="e.g., Northeast Sales Team"
            />
            <UnifiedField
              label="Team Code"
              value={data.code}
              onChange={(v) => handleChange('code', v)}
              editable={isEditable}
              error={errors.code}
              placeholder="e.g., NE-SALES"
              helpText="Unique identifier for reporting"
            />
            <UnifiedField
              label="Description"
              value={data.description}
              onChange={(v) => handleChange('description', v)}
              editable={isEditable}
              type="textarea"
              error={errors.description}
              placeholder="Describe the team's purpose and responsibilities..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Classification Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Building2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Classification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Group Type"
              value={data.groupType}
              onChange={(v) => handleChange('groupType', v)}
              editable={isEditable}
              type="select"
              options={groupTypeOptions}
              required
              error={errors.groupType}
            />
            <UnifiedField
              label="Parent Group"
              value={data.parentGroupId}
              onChange={(v) => handleChange('parentGroupId', v)}
              editable={isEditable}
              type="select"
              options={[{ value: '', label: 'None (Top Level)' }, ...parentGroupOptions]}
              error={errors.parentGroupId}
              helpText={data.parentGroupName ? `Current: ${data.parentGroupName}` : undefined}
            />
            <UnifiedField
              label="Active Status"
              value={data.isActive}
              onChange={(v) => handleChange('isActive', v)}
              editable={isEditable}
              type="switch"
              error={errors.isActive}
            />
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Phone className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Email"
              value={data.email}
              onChange={(v) => handleChange('email', v)}
              editable={isEditable}
              type="email"
              error={errors.email}
              placeholder="team@company.com"
            />
            <UnifiedField
              label="Phone"
              value={data.phone}
              onChange={(v) => handleChange('phone', v)}
              editable={isEditable}
              type="phone"
              error={errors.phone}
            />
            <UnifiedField
              label="Fax"
              value={data.fax}
              onChange={(v) => handleChange('fax', v)}
              editable={isEditable}
              type="text"
              error={errors.fax}
              placeholder="(555) 123-4567"
            />
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Settings className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Security Zone"
              value={data.securityZone}
              onChange={(v) => handleChange('securityZone', v)}
              editable={isEditable}
              type="select"
              options={securityZoneOptions}
              error={errors.securityZone}
              helpText="Controls data access permissions"
            />
            <UnifiedField
              label="Load Factor"
              value={data.loadFactor}
              onChange={(v) => handleChange('loadFactor', v)}
              editable={isEditable}
              type="percentage"
              min={0}
              max={200}
              error={errors.loadFactor}
              helpText="Team capacity multiplier (100% = normal)"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamIdentitySection
