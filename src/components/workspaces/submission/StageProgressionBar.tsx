'use client'

import { Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Stage definitions for submission pipeline
export const SUBMISSION_STAGES = [
  {
    id: 'submitted',
    label: 'Submitted',
    description: 'Candidate sourced and submitted to internal review',
    statuses: ['sourced', 'screening', 'submission_ready', 'submitted', 'submitted_to_client'],
  },
  {
    id: 'review',
    label: 'Client Review',
    description: 'Awaiting client feedback on submission',
    statuses: ['client_review'],
  },
  {
    id: 'interview',
    label: 'Interview',
    description: 'Interview scheduled or in progress',
    statuses: ['interview_scheduled', 'client_interview', 'interviewed'],
  },
  {
    id: 'offer',
    label: 'Offer',
    description: 'Offer extended or negotiation in progress',
    statuses: ['offer_stage'],
  },
  {
    id: 'placed',
    label: 'Placed',
    description: 'Candidate successfully placed',
    statuses: ['placed'],
  },
] as const

interface StageProgressionBarProps {
  currentStatus: string
  statusChangedAt?: string | null
  className?: string
}

export function StageProgressionBar({
  currentStatus,
  statusChangedAt,
  className,
}: StageProgressionBarProps) {
  const isRejected = currentStatus === 'rejected'
  const isWithdrawn = currentStatus === 'withdrawn'
  const isTerminal = isRejected || isWithdrawn

  // Determine current stage index
  const getCurrentStageIndex = () => {
    for (let i = SUBMISSION_STAGES.length - 1; i >= 0; i--) {
      if ((SUBMISSION_STAGES[i].statuses as readonly string[]).includes(currentStatus)) {
        return i
      }
    }
    return 0
  }

  const currentStageIndex = getCurrentStageIndex()

  // Calculate time in current stage
  const daysInStage = (() => {
    if (!statusChangedAt) return null
    const changed = new Date(statusChangedAt)
    const now = new Date()
    return Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24))
  })()

  return (
    <TooltipProvider>
      <div className={cn('px-6 py-4 bg-white', className)}>
        <div className="flex items-center justify-center">
          {SUBMISSION_STAGES.map((stage, index) => {
            const isCompleted = !isTerminal && index < currentStageIndex
            const isCurrent = !isTerminal && index === currentStageIndex
            const isFuture = !isTerminal && index > currentStageIndex

            // For terminal states, show which stage it was rejected/withdrawn at
            const isRejectedStage = isTerminal && index === currentStageIndex

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center cursor-help">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                          // Completed state
                          isCompleted && 'bg-green-500 text-white shadow-sm',
                          // Current state
                          isCurrent && 'bg-gold-500 text-white ring-4 ring-gold-100 shadow-md',
                          // Future state
                          isFuture && 'bg-charcoal-100 text-charcoal-400',
                          // Rejected at this stage
                          isRejectedStage && isRejected && 'bg-red-500 text-white ring-4 ring-red-100',
                          isRejectedStage && isWithdrawn && 'bg-charcoal-400 text-white ring-4 ring-charcoal-100'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : isRejectedStage && isRejected ? (
                          <X className="h-5 w-5" />
                        ) : isRejectedStage && isWithdrawn ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Stage Label */}
                      <span
                        className={cn(
                          'mt-2 text-xs font-medium transition-colors',
                          isCompleted && 'text-green-600',
                          isCurrent && 'text-gold-600',
                          isFuture && 'text-charcoal-400',
                          isRejectedStage && isRejected && 'text-red-600',
                          isRejectedStage && isWithdrawn && 'text-charcoal-500'
                        )}
                      >
                        {stage.label}
                      </span>

                      {/* Time indicator for current stage */}
                      {isCurrent && daysInStage !== null && (
                        <span
                          className={cn(
                            'mt-0.5 text-[10px]',
                            daysInStage > 7 ? 'text-red-500' : daysInStage > 3 ? 'text-amber-500' : 'text-charcoal-400'
                          )}
                        >
                          {daysInStage === 0 ? 'Today' : daysInStage === 1 ? '1 day' : `${daysInStage} days`}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">{stage.label}</p>
                    <p className="text-xs text-charcoal-500 mt-1">{stage.description}</p>
                    {isCurrent && daysInStage !== null && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">{daysInStage}</span> {daysInStage === 1 ? 'day' : 'days'} in this stage
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>

                {/* Connector Line */}
                {index < SUBMISSION_STAGES.length - 1 && (
                  <div
                    className={cn(
                      'w-16 h-1 mx-2 rounded-full transition-colors',
                      index < currentStageIndex && !isTerminal
                        ? 'bg-green-500'
                        : isTerminal && index < currentStageIndex
                        ? 'bg-green-300'
                        : 'bg-charcoal-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Terminal state message */}
        {isTerminal && (
          <div
            className={cn(
              'text-center mt-3 text-xs font-medium py-1.5 px-3 rounded-full inline-flex items-center gap-1.5 mx-auto',
              isRejected ? 'bg-red-50 text-red-700' : 'bg-charcoal-100 text-charcoal-600'
            )}
            style={{ display: 'table', margin: '12px auto 0' }}
          >
            {isRejected ? (
              <>
                <X className="h-3.5 w-3.5" />
                Submission was rejected
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                Submission was withdrawn
              </>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
