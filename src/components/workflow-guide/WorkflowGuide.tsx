'use client'

import { memo } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  HelpCircle,
  Lightbulb,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import type { StageStatus, WorkflowAction } from '@/lib/workflows/workflow-guide-definitions'

// ============================================
// Types
// ============================================

interface WorkflowGuideProps {
  entityType: string
  entityId: string
  variant?: 'full' | 'compact' | 'minimal'
  className?: string
  onAction?: (actionId: string) => void
}

interface StageData {
  id: string
  name: string
  description: string
  guidance?: string
  status: StageStatus
  isComplete: boolean
  actions: WorkflowAction[]
  sla?: {
    hours: number
    warningThreshold: number
  }
}

// ============================================
// Sub-components
// ============================================

const StageIcon = memo(function StageIcon({
  status,
  className,
}: {
  status: StageStatus
  className?: string
}) {
  const iconProps = { className: cn('w-5 h-5', className) }

  switch (status) {
    case 'completed':
      return <CheckCircle2 {...iconProps} className={cn(iconProps.className, 'text-success-500')} />
    case 'current':
      return <Circle {...iconProps} className={cn(iconProps.className, 'text-gold-500 fill-gold-500')} />
    case 'blocked':
      return <Lock {...iconProps} className={cn(iconProps.className, 'text-error-500')} />
    case 'skipped':
      return <Circle {...iconProps} className={cn(iconProps.className, 'text-charcoal-300 fill-charcoal-300')} />
    default:
      return <Circle {...iconProps} className={cn(iconProps.className, 'text-charcoal-300')} />
  }
})

const StageConnector = memo(function StageConnector({
  isComplete,
  isLast,
}: {
  isComplete: boolean
  isLast: boolean
}) {
  if (isLast) return null

  return (
    <div
      className={cn(
        'flex-1 h-0.5 mx-1',
        isComplete ? 'bg-success-500' : 'bg-charcoal-200'
      )}
    />
  )
})

const StageProgress = memo(function StageProgress({
  stages,
}: {
  stages: StageData[]
}) {
  return (
    <div className="flex items-center justify-between px-2">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center flex-1">
          {/* Stage indicator */}
          <div className="flex flex-col items-center">
            <StageIcon status={stage.status} />
            <span
              className={cn(
                'mt-1 text-[10px] font-medium truncate max-w-[60px]',
                stage.status === 'current'
                  ? 'text-gold-600'
                  : stage.status === 'completed'
                    ? 'text-success-600'
                    : 'text-charcoal-400'
              )}
            >
              {stage.name}
            </span>
          </div>

          {/* Connector */}
          <StageConnector isComplete={stage.isComplete} isLast={index === stages.length - 1} />
        </div>
      ))}
    </div>
  )
})

const CurrentStageCard = memo(function CurrentStageCard({
  stage,
  slaStatus,
  onAction,
}: {
  stage: StageData
  slaStatus: {
    hasDeadline: boolean
    hoursRemaining?: number
    isWarning?: boolean
    isOverdue?: boolean
  } | null
  onAction?: (actionId: string) => void
}) {
  return (
    <div className="bg-charcoal-50 rounded-lg p-4 mt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gold-500" />
          <span className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
            {stage.name}
          </span>
        </div>
        {slaStatus?.hasDeadline && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
              slaStatus.isOverdue
                ? 'bg-error-100 text-error-700'
                : slaStatus.isWarning
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-charcoal-100 text-charcoal-600'
            )}
          >
            <Clock className="w-3 h-3" />
            {slaStatus.isOverdue
              ? 'Overdue'
              : `${slaStatus.hoursRemaining}h remaining`}
          </div>
        )}
      </div>

      {/* Guidance */}
      {stage.guidance && (
        <p className="text-sm text-charcoal-700 mb-4">{stage.guidance}</p>
      )}

      {/* Actions */}
      {stage.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stage.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction?.(action.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                action.isPrimary
                  ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                  : 'bg-white text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-50'
              )}
            >
              {action.label}
              {action.isPrimary && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

const SlaWarning = memo(function SlaWarning({
  slaStatus,
}: {
  slaStatus: {
    hasDeadline: boolean
    hoursRemaining?: number
    isWarning?: boolean
    isOverdue?: boolean
    deadline?: string
  }
}) {
  if (!slaStatus.hasDeadline || (!slaStatus.isWarning && !slaStatus.isOverdue)) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg mt-4',
        slaStatus.isOverdue
          ? 'bg-error-50 border border-error-200'
          : 'bg-amber-50 border border-amber-200'
      )}
    >
      <AlertCircle
        className={cn(
          'w-4 h-4 flex-shrink-0',
          slaStatus.isOverdue ? 'text-error-600' : 'text-amber-600'
        )}
      />
      <span
        className={cn(
          'text-sm font-medium',
          slaStatus.isOverdue ? 'text-error-700' : 'text-amber-700'
        )}
      >
        {slaStatus.isOverdue
          ? 'SLA breached'
          : `SLA: ${slaStatus.hoursRemaining} hours remaining`}
      </span>
    </div>
  )
})

// ============================================
// Loading State
// ============================================

function LoadingState({ variant }: { variant: string }) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-20 h-4 bg-charcoal-200 rounded" />
        <div className="flex-1 h-1 bg-charcoal-200 rounded" />
      </div>
    )
  }

  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="w-6 h-6 bg-charcoal-200 rounded-full" />
            {i < 5 && <div className="flex-1 h-1 mx-2 bg-charcoal-200 rounded" />}
          </div>
        ))}
      </div>
      <div className="bg-charcoal-100 rounded-lg p-4">
        <div className="h-4 bg-charcoal-200 rounded w-1/4 mb-3" />
        <div className="h-3 bg-charcoal-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-charcoal-200 rounded w-1/2" />
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export const WorkflowGuide = memo(function WorkflowGuide({
  entityType,
  entityId,
  variant = 'full',
  className,
  onAction,
}: WorkflowGuideProps) {
  const { data, isLoading, error } = trpc.workflowProgress.get.useQuery(
    { entityType, entityId },
    { enabled: Boolean(entityType && entityId) }
  )

  if (isLoading) {
    return <LoadingState variant={variant} />
  }

  if (error || !data) {
    return null // Silently fail if no workflow defined
  }

  const currentStage = data.stages.find((s) => s.status === 'current')

  // Minimal variant - just progress bar
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span className="text-xs font-medium text-charcoal-500 whitespace-nowrap">
          {currentStage?.name ?? 'Complete'}
        </span>
        <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-success-500 rounded-full transition-all duration-500"
            style={{ width: `${data.progress.percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-charcoal-500">
          {data.progress.percentage}%
        </span>
      </div>
    )
  }

  // Compact variant - progress with stage names
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-charcoal-900">
            {data.workflowName}
          </span>
          <span className="text-xs text-charcoal-500">
            {data.progress.completedStages}/{data.progress.totalStages} stages
          </span>
        </div>
        <StageProgress stages={data.stages as StageData[]} />
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn('space-y-1', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-900">
            {data.workflowName}
          </h3>
          <p className="text-xs text-charcoal-500">
            {data.progress.completedStages} of {data.progress.totalStages} stages complete
          </p>
        </div>
        <button className="p-1 rounded text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Progress visualization */}
      <StageProgress stages={data.stages as StageData[]} />

      {/* Current stage card */}
      {currentStage && (
        <CurrentStageCard
          stage={currentStage as StageData}
          slaStatus={data.slaStatus}
          onAction={onAction}
        />
      )}

      {/* SLA warning */}
      {data.slaStatus && <SlaWarning slaStatus={data.slaStatus} />}

      {/* Blockers */}
      {data.blockers && data.blockers.length > 0 && (
        <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-error-600" />
            <span className="text-sm font-medium text-error-700">Blocked</span>
          </div>
          <ul className="text-sm text-error-600 list-disc list-inside">
            {data.blockers.map((blocker, i) => (
              <li key={i}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

export default WorkflowGuide
