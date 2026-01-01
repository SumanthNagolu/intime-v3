'use client'

import { format } from 'date-fns'
import { CheckCircle, Circle, ArrowRight, Target, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CampaignProspect } from '@/types/campaign'

interface ProspectQualificationTabProps {
  prospect: CampaignProspect
  onConvertToLead?: () => void
}

/**
 * ProspectQualificationTab - Qualification status for a campaign prospect
 *
 * Displays:
 * - Stage progress (Enrolled -> Contacted -> Engaged -> Responded)
 * - Sequence status (current step, next step date)
 * - Qualification status banner
 * - "Convert to Lead" button
 */
export function ProspectQualificationTab({
  prospect,
  onConvertToLead,
}: ProspectQualificationTabProps) {
  // Define stages with completion logic
  const stages = [
    {
      id: 'enrolled',
      label: 'Enrolled',
      isCompleted: true, // Always completed if in campaign
      completedAt: prospect.enrolledAt,
    },
    {
      id: 'contacted',
      label: 'Contacted',
      isCompleted: !!prospect.firstContactedAt,
      completedAt: prospect.firstContactedAt,
    },
    {
      id: 'engaged',
      label: 'Engaged',
      isCompleted: !!prospect.openedAt || !!prospect.clickedAt,
      completedAt: prospect.openedAt || prospect.clickedAt,
    },
    {
      id: 'responded',
      label: 'Responded',
      isCompleted: !!prospect.respondedAt,
      completedAt: prospect.respondedAt,
    },
  ]

  // Find last completed stage index (ES2022-compatible)
  const currentStageIndex = stages.reduce(
    (lastIndex: number, stage, index) => (stage.isCompleted ? index : lastIndex),
    -1
  )
  const isQualified = prospect.status === 'responded' || !!prospect.respondedAt
  const isConverted = prospect.status === 'converted' || !!prospect.convertedLeadId

  return (
    <div className="py-4 space-y-6">
      {/* Stage Progress */}
      <div>
        <p className="text-sm font-medium text-charcoal-700 mb-3">Stage Progress</p>
        <div className="flex items-center gap-2">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    stage.isCompleted
                      ? 'bg-green-500 text-white'
                      : index === currentStageIndex + 1
                        ? 'bg-gold-100 text-gold-600 border-2 border-gold-500'
                        : 'bg-charcoal-100 text-charcoal-400'
                  )}
                >
                  {stage.isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 text-center',
                    stage.isCompleted ? 'text-green-600' : 'text-charcoal-500'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    stages[index + 1].isCompleted ? 'text-green-400' : 'text-charcoal-300'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sequence Status */}
      <div className="bg-charcoal-50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-charcoal-700">Sequence Status</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-900">
              Step {prospect.currentStep || 1}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                prospect.sequenceStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : prospect.sequenceStatus === 'paused'
                    ? 'bg-amber-100 text-amber-700'
                    : prospect.sequenceStatus === 'completed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-charcoal-100 text-charcoal-600'
              )}
            >
              {prospect.sequenceStatus || 'Pending'}
            </span>
          </div>
          {prospect.nextStepAt && (
            <div className="flex items-center gap-1 text-sm text-charcoal-500">
              <Calendar className="w-4 h-4" />
              <span>
                Next: {format(new Date(prospect.nextStepAt), 'MMM d, h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Qualification Status Banner */}
      {isConverted ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Converted to Lead</span>
          </div>
          <p className="text-sm text-purple-600 mt-1">
            This prospect has been converted to a lead
            {prospect.convertedAt
              ? ` on ${format(new Date(prospect.convertedAt), 'MMM d, yyyy')}`
              : ''}
          </p>
        </div>
      ) : isQualified ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Ready for Qualification</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            This prospect has responded and may be ready to convert to a lead.
          </p>
        </div>
      ) : (
        <div className="bg-charcoal-50 border border-charcoal-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-charcoal-700">
            <Circle className="w-5 h-5" />
            <span className="font-medium">In Progress</span>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Continue engaging this prospect through the sequence.
          </p>
        </div>
      )}

      {/* Convert to Lead Button */}
      {!isConverted && (
        <Button
          onClick={onConvertToLead}
          className="w-full"
          variant={isQualified ? 'default' : 'outline'}
          disabled={!isQualified}
        >
          <Target className="w-4 h-4 mr-2" />
          Convert to Lead
        </Button>
      )}
    </div>
  )
}
