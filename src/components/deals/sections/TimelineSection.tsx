'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, TimelineSectionData } from '@/lib/deals/types'
import { cn } from '@/lib/utils'
import { format, isPast } from 'date-fns'

// ============ PROPS ============

interface TimelineSectionProps {
  mode: SectionMode
  data: TimelineSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
  /** Current stage - needed for conditional display */
  currentStage?: string
}

/**
 * TimelineSection - Unified component for Deal Timeline
 */
export function TimelineSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  currentStage,
}: TimelineSectionProps) {
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
  const isClosed = currentStage === 'closed_won' || currentStage === 'closed_lost'

  // Check if next step is overdue
  const isNextStepOverdue = data.nextStepDate && isPast(new Date(data.nextStepDate))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Timeline"
          subtitle="Key dates, milestones, and next steps"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Steps Card */}
        <Card className={cn(
          "shadow-elevation-sm",
          isNextStepOverdue && !isEditable && "border-error-200"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                isNextStepOverdue && !isEditable ? "bg-error-50" : "bg-blue-50"
              )}>
                <Zap className={cn(
                  "w-4 h-4",
                  isNextStepOverdue && !isEditable ? "text-error-600" : "text-blue-600"
                )} />
              </div>
              <CardTitle className="text-base font-heading">Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Next Action"
              type="textarea"
              value={data.nextStep}
              onChange={(v) => handleChange('nextStep', v)}
              editable={isEditable}
              placeholder="What needs to happen next to move this deal forward?"
              maxLength={500}
            />
            <UnifiedField
              label="Due Date"
              type="date"
              value={data.nextStepDate}
              onChange={(v) => handleChange('nextStepDate', v)}
              editable={isEditable}
              error={isNextStepOverdue && !isEditable ? 'Overdue' : undefined}
            />
          </CardContent>
        </Card>

        {/* Key Dates Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Key Dates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Expected Close Date"
              type="date"
              value={data.expectedCloseDate}
              onChange={(v) => handleChange('expectedCloseDate', v)}
              editable={isEditable}
            />
            {isClosed && (
              <UnifiedField
                label="Actual Close Date"
                type="date"
                value={data.actualCloseDate}
                onChange={(v) => handleChange('actualCloseDate', v)}
                editable={isEditable}
              />
            )}
          </CardContent>
        </Card>

        {/* Contract Dates Card - Only show when closed won */}
        {(currentStage === 'closed_won' || isCreateMode) && (
          <Card className="shadow-elevation-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-heading">Contract Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <UnifiedField
                  label="Contract Signed Date"
                  type="date"
                  value={data.contractSignedDate}
                  onChange={(v) => handleChange('contractSignedDate', v)}
                  editable={isEditable}
                />
                <UnifiedField
                  label="Contract Start Date"
                  type="date"
                  value={data.contractStartDate}
                  onChange={(v) => handleChange('contractStartDate', v)}
                  editable={isEditable}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Mode - Summary Display */}
      {!isEditable && data.nextStep && (
        <Card className={cn(
          "shadow-elevation-sm",
          isNextStepOverdue ? "bg-error-50/50 border-error-200" : "bg-charcoal-50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                isNextStepOverdue ? "bg-error-100" : "bg-charcoal-100"
              )}>
                {isNextStepOverdue ? (
                  <AlertTriangle className="h-6 w-6 text-error-600" />
                ) : (
                  <ArrowRight className="h-6 w-6 text-charcoal-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal-900">{data.nextStep}</p>
                {data.nextStepDate && (
                  <p className={cn(
                    "text-xs mt-1",
                    isNextStepOverdue ? "text-error-600 font-medium" : "text-charcoal-500"
                  )}>
                    {isNextStepOverdue
                      ? `Overdue - was due ${format(new Date(data.nextStepDate), 'MMM d, yyyy')}`
                      : `Due ${format(new Date(data.nextStepDate), 'MMM d, yyyy')}`}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TimelineSection
