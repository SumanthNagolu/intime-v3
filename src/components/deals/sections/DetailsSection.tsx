'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Calendar,
  Users,
  Percent,
  Clock,
  Target,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import {
  DEAL_STAGES,
  ACTIVE_STAGES,
  VALUE_BASIS_OPTIONS,
  CURRENCY_OPTIONS,
  SERVICES_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  getDefaultProbability,
  getStageBadgeVariant,
  getHealthBadgeVariant,
} from '@/lib/deals/constants'
import type { SectionMode, DetailsSectionData } from '@/lib/deals/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface DetailsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: DetailsSectionData
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
 * DetailsSection - Unified component for Deal Details
 *
 * Guidewire PCF Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
 */
export function DetailsSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: DetailsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)

    // Auto-update probability when stage changes
    if (field === 'stage' && typeof value === 'string') {
      const newProbability = getDefaultProbability(value)
      onChange?.('probability', newProbability)
    }
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
  const stageOptions = (isCreateMode ? ACTIVE_STAGES : DEAL_STAGES).map((s) => ({
    value: s.value,
    label: s.label,
  }))
  const valueBasisOptions = VALUE_BASIS_OPTIONS.map((v) => ({ value: v.value, label: v.label }))
  const currencyOptions = CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))
  const servicesOptions = SERVICES_OPTIONS.map((s) => ({ value: s.value, label: s.label, icon: s.icon }))
  const healthOptions = HEALTH_STATUS_OPTIONS.map((h) => ({ value: h.value, label: h.label, icon: h.icon }))

  // Calculate weighted value
  const weightedValue = Math.round(data.value * (data.probability / 100))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Deal Details"
          subtitle="Core deal information, value, and pipeline status"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Identity Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Deal Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Deal Title"
              value={data.title}
              onChange={(v) => handleChange('title', v)}
              editable={isEditable}
              required
              error={errors?.title}
              placeholder="e.g., Acme Corp - Q1 Staffing"
            />
            <UnifiedField
              label="Description"
              type="textarea"
              value={data.description}
              onChange={(v) => handleChange('description', v)}
              editable={isEditable}
              placeholder="Brief description of the deal opportunity..."
              maxLength={500}
            />
          </CardContent>
        </Card>

        {/* Value & Revenue Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Value & Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Deal Value"
                type="currency"
                value={data.value}
                onChange={(v) => handleChange('value', Number(v) || 0)}
                editable={isEditable}
                required
                error={errors?.value}
                placeholder="0"
              />
              <UnifiedField
                label="Currency"
                type="select"
                options={currencyOptions}
                value={data.currency}
                onChange={(v) => handleChange('currency', v)}
                editable={isEditable}
              />
            </div>
            <UnifiedField
              label="Value Basis"
              type="select"
              options={valueBasisOptions}
              value={data.valueBasis}
              onChange={(v) => handleChange('valueBasis', v)}
              editable={isEditable}
            />
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Probability"
                type="percentage"
                value={data.probability}
                onChange={(v) => handleChange('probability', Number(v) || 0)}
                editable={isEditable}
                min={0}
                max={100}
              />
              {/* Weighted Value (computed, read-only) */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Weighted Value
                </p>
                <p className="text-lg font-semibold text-charcoal-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: data.currency || 'USD',
                    minimumFractionDigits: 0,
                  }).format(weightedValue)}
                </p>
                <p className="text-xs text-charcoal-400">
                  {data.probability}% of {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: data.currency || 'USD',
                    minimumFractionDigits: 0,
                  }).format(data.value)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Status Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Pipeline Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Stage"
              type="select"
              options={stageOptions}
              value={data.stage}
              onChange={(v) => handleChange('stage', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getStageBadgeVariant(data.stage)}
            />
            <UnifiedField
              label="Expected Close Date"
              type="date"
              value={data.expectedCloseDate}
              onChange={(v) => handleChange('expectedCloseDate', v)}
              editable={isEditable}
              placeholder="Select date"
            />
            <UnifiedField
              label="Health Status"
              type="select"
              options={healthOptions}
              value={data.healthStatus}
              onChange={(v) => handleChange('healthStatus', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getHealthBadgeVariant(data.healthStatus)}
            />
          </CardContent>
        </Card>

        {/* Staffing Details Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Staffing Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Est. Placements"
                type="number"
                value={data.estimatedPlacements}
                onChange={(v) => handleChange('estimatedPlacements', v ? Number(v) : null)}
                editable={isEditable}
                placeholder="0"
                min={0}
              />
              <UnifiedField
                label="Avg Bill Rate"
                type="currency"
                value={data.avgBillRate}
                onChange={(v) => handleChange('avgBillRate', v ? Number(v) : null)}
                editable={isEditable}
                placeholder="0"
              />
            </div>
            <UnifiedField
              label="Contract Length (months)"
              type="number"
              value={data.contractLengthMonths}
              onChange={(v) => handleChange('contractLengthMonths', v ? Number(v) : null)}
              editable={isEditable}
              placeholder="e.g., 6"
              min={1}
              max={60}
            />
            <UnifiedField
              label="Hiring Needs"
              type="textarea"
              value={data.hiringNeeds}
              onChange={(v) => handleChange('hiringNeeds', v)}
              editable={isEditable}
              placeholder="Describe the roles and skills needed..."
              maxLength={1000}
            />
          </CardContent>
        </Card>
      </div>

      {/* Services Required - Full Width */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-heading">Services Required</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedField
            label=""
            type="multiSelect"
            options={servicesOptions}
            value={data.servicesRequired}
            onChange={(v) => handleChange('servicesRequired', v)}
            editable={isEditable}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default DetailsSection
