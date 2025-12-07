'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { entityJourneys, getVisibleQuickActions } from '@/lib/navigation/entity-journeys'
import { EntityType, EntityQuickAction, ENTITY_BASE_PATHS, resolveHref } from '@/lib/navigation/entity-navigation.types'
import { Button } from '@/components/ui/button'

interface EntityJourneySidebarProps {
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  onQuickAction?: (action: EntityQuickAction) => void
  className?: string
}

export function EntityJourneySidebar({
  entityType,
  entityId,
  entityName,
  entitySubtitle,
  entityStatus,
  onQuickAction,
  className,
}: EntityJourneySidebarProps) {
  const journeyConfig = entityJourneys[entityType]

  // Determine current and completed steps based on entity status
  const { currentStepIndex, steps } = useMemo(() => {
    const stepsWithState = journeyConfig.steps.map((step, index) => {
      const isCompleted = step.completedStatuses.includes(entityStatus)
      const isActive = step.activeStatuses.includes(entityStatus)
      return { ...step, isCompleted, isActive, index }
    })

    // Find current step (first active, or last completed)
    const activeIndex = stepsWithState.findIndex(s => s.isActive)
    let currentIdx = activeIndex >= 0 ? activeIndex : 0

    // If no active step found, find the last completed
    if (activeIndex < 0) {
      for (let i = stepsWithState.length - 1; i >= 0; i--) {
        if (stepsWithState[i].isCompleted) {
          currentIdx = i
          break
        }
      }
    }

    return { currentStepIndex: currentIdx, steps: stepsWithState }
  }, [journeyConfig, entityStatus])

  // Get visible quick actions based on current status
  const visibleQuickActions = useMemo(() => {
    return getVisibleQuickActions(entityType, entityStatus)
  }, [entityType, entityStatus])

  // Build step href
  const buildStepHref = (stepId: string) => {
    const basePath = ENTITY_BASE_PATHS[entityType]
    return `${basePath}/${entityId}?step=${stepId}`
  }

  // Handle quick action click
  const handleQuickAction = (action: EntityQuickAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <aside className={cn('w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0', className)}>
      {/* Entity Header */}
      <div className="p-4 border-b border-charcoal-100">
        <h2 className="font-heading font-semibold text-charcoal-900 truncate text-base">
          {entityName}
        </h2>
        {entitySubtitle && (
          <p className="text-sm text-charcoal-500 truncate mt-0.5">
            {entitySubtitle}
          </p>
        )}
        <div className="mt-2">
          <StatusBadge status={entityStatus} />
        </div>
      </div>

      {/* Journey Steps */}
      <nav className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
          Journey
        </h3>
        <ul className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCurrent = index === currentStepIndex
            const isPast = step.isCompleted || index < currentStepIndex
            const isFuture = !isPast && !isCurrent

            return (
              <li key={step.id}>
                <Link
                  href={buildStepHref(step.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isCurrent && 'bg-gold-50 text-gold-700 font-medium',
                    isPast && 'text-charcoal-600 hover:bg-charcoal-50',
                    isFuture && 'text-charcoal-400 hover:bg-charcoal-50'
                  )}
                >
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0',
                      isPast && 'bg-green-500 text-white',
                      isCurrent && 'bg-gold-500 text-white',
                      isFuture && 'bg-charcoal-200 text-charcoal-500'
                    )}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm truncate block',
                      isCurrent && 'font-medium'
                    )}>
                      {step.label}
                    </span>
                    {step.description && isCurrent && (
                      <span className="text-xs text-charcoal-500 truncate block">
                        {step.description}
                      </span>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {isCurrent && (
                    <ChevronRight className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  )}
                </Link>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="ml-6 pl-[11px] py-1">
                    <div
                      className={cn(
                        'w-0.5 h-4',
                        isPast ? 'bg-green-500' : 'bg-charcoal-200'
                      )}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      {visibleQuickActions.length > 0 && (
        <div className="p-4 border-t border-charcoal-100">
          <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {visibleQuickActions.map((action) => {
              const ActionIcon = action.icon

              // Handle navigation actions with links
              if (action.actionType === 'navigate' && action.href) {
                return (
                  <Button
                    key={action.id}
                    variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                    size="sm"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href={resolveHref(action.href, entityId)}>
                      <ActionIcon className="w-4 h-4" />
                      {action.label}
                    </Link>
                  </Button>
                )
              }

              // Handle dialog and mutation actions with buttons
              return (
                <Button
                  key={action.id}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleQuickAction(action)}
                >
                  <ActionIcon className="w-4 h-4" />
                  {action.label}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}

// Simple status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    // Job statuses
    draft: 'bg-charcoal-100 text-charcoal-700',
    open: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    on_hold: 'bg-amber-100 text-amber-700',
    filled: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
    // Candidate statuses
    sourced: 'bg-amber-100 text-amber-700',
    new: 'bg-blue-100 text-blue-700',
    screening: 'bg-blue-100 text-blue-700',
    bench: 'bg-purple-100 text-purple-700',
    placed: 'bg-indigo-100 text-indigo-700',
    inactive: 'bg-charcoal-100 text-charcoal-600',
    // Account statuses
    prospect: 'bg-amber-100 text-amber-700',
    churned: 'bg-red-100 text-red-700',
    // Lead statuses
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-green-100 text-green-700',
    converted: 'bg-purple-100 text-purple-700',
    lost: 'bg-red-100 text-red-700',
    // Deal statuses
    discovery: 'bg-blue-100 text-blue-700',
    qualification: 'bg-cyan-100 text-cyan-700',
    proposal: 'bg-amber-100 text-amber-700',
    negotiation: 'bg-orange-100 text-orange-700',
    verbal_commit: 'bg-purple-100 text-purple-700',
    closed_won: 'bg-green-100 text-green-700',
    closed_lost: 'bg-red-100 text-red-700',
    // Submission statuses
    submission_ready: 'bg-blue-100 text-blue-700',
    submitted_to_client: 'bg-cyan-100 text-cyan-700',
    client_review: 'bg-amber-100 text-amber-700',
    client_interview: 'bg-orange-100 text-orange-700',
    offer_stage: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-charcoal-100 text-charcoal-600',
    // Placement statuses
    pending_start: 'bg-amber-100 text-amber-700',
    extended: 'bg-blue-100 text-blue-700',
    ended: 'bg-charcoal-100 text-charcoal-600',
    // Default
    default: 'bg-charcoal-100 text-charcoal-700',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
      colors[status] || colors.default
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export { StatusBadge }
