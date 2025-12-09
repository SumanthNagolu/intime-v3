'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Mail,
  Linkedin,
  Phone,
  MessageSquare,
  CheckCircle,
  Circle,
  Clock,
  Play,
  Pause,
  Edit,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'

/**
 * SequenceStep - A single step in an outreach sequence
 */
export interface SequenceStep {
  id: string
  stepNumber: number
  channel: 'email' | 'linkedin' | 'phone' | 'sms'
  subject?: string
  templateName: string
  delay: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
  }
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  stats?: {
    sent?: number
    delivered?: number
    opened?: number
    clicked?: number
    replied?: number
    bounced?: number
  }
  scheduledAt?: string
  completedAt?: string
}

/**
 * SequenceTimelineProps
 */
interface SequenceTimelineProps {
  steps: SequenceStep[]
  currentStep?: number
  isRunning?: boolean
  onStepClick?: (step: SequenceStep) => void
  onEditStep?: (step: SequenceStep) => void
  onPauseResume?: () => void
  className?: string
  compact?: boolean
}

/**
 * SequenceTimeline - Vertical timeline for outreach sequences
 *
 * Features:
 * - Channel icons (Email, LinkedIn, Phone, SMS)
 * - Status indicators (Pending, In Progress, Completed, Failed)
 * - Delay indicators between steps
 * - Expandable stats per step
 * - Click handlers for editing
 */
export function SequenceTimeline({
  steps,
  currentStep,
  isRunning = false,
  onStepClick,
  onEditStep,
  onPauseResume,
  className,
  compact = false,
}: SequenceTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-charcoal-400">
        <Mail className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No sequence steps configured</p>
        <Button variant="outline" size="sm" className="mt-4">
          Add First Step
        </Button>
      </div>
    )
  }

  const toggleExpand = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  // Channel icon mapping
  const channelIcons: Record<string, typeof Mail> = {
    email: Mail,
    linkedin: Linkedin,
    phone: Phone,
    sms: MessageSquare,
  }

  // Channel colors
  const channelColors: Record<string, string> = {
    email: 'bg-blue-500',
    linkedin: 'bg-[#0A66C2]',
    phone: 'bg-green-500',
    sms: 'bg-purple-500',
  }

  // Status config
  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    completed: { icon: CheckCircle, color: 'text-green-500', label: 'Completed' },
    in_progress: { icon: Play, color: 'text-gold-500', label: 'In Progress' },
    pending: { icon: Circle, color: 'text-charcoal-400', label: 'Pending' },
    failed: { icon: AlertCircle, color: 'text-red-500', label: 'Failed' },
    skipped: { icon: Circle, color: 'text-charcoal-300', label: 'Skipped' },
  }

  // Calculate totals
  const totalStats = steps.reduce(
    (acc, step) => {
      if (step.stats) {
        acc.sent += step.stats.sent || 0
        acc.delivered += step.stats.delivered || 0
        acc.opened += step.stats.opened || 0
        acc.clicked += step.stats.clicked || 0
        acc.replied += step.stats.replied || 0
      }
      return acc
    },
    { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0 }
  )

  return (
    <TooltipProvider>
      <div className={cn('relative', className)}>
        {/* Summary Header */}
        {!compact && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-100">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-charcoal-900">
                {steps.length} Step{steps.length !== 1 ? 's' : ''}
              </h3>
              <div className="flex items-center gap-1 text-sm text-charcoal-500">
                <span className={cn('w-2 h-2 rounded-full', isRunning ? 'bg-green-500 animate-pulse' : 'bg-charcoal-300')} />
                {isRunning ? 'Running' : 'Paused'}
              </div>
            </div>
            {onPauseResume && (
              <Button variant="outline" size="sm" onClick={onPauseResume}>
                {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isRunning ? 'Pause' : 'Resume'}
              </Button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {!compact && totalStats.sent > 0 && (
          <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-charcoal-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-900">{totalStats.sent.toLocaleString()}</p>
              <p className="text-xs text-charcoal-500">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-900">{totalStats.delivered.toLocaleString()}</p>
              <p className="text-xs text-charcoal-500">Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {totalStats.delivered > 0 ? ((totalStats.opened / totalStats.delivered) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-charcoal-500">Open Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
                {totalStats.opened > 0 ? ((totalStats.clicked / totalStats.opened) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-charcoal-500">Click Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {totalStats.sent > 0 ? ((totalStats.replied / totalStats.sent) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-charcoal-500">Reply Rate</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-charcoal-200" />

          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const ChannelIcon = channelIcons[step.channel]
              const status = statusConfig[step.status]
              const StatusIcon = status.icon
              const isExpanded = expandedSteps.has(step.id)
              const isCurrent = currentStep === index
              const isLast = index === steps.length - 1

              return (
                <div key={step.id}>
                  {/* Step Card */}
                  <div
                    className={cn(
                      'relative flex gap-4 p-4 rounded-lg transition-all duration-200',
                      isCurrent && 'bg-gold-50 ring-1 ring-gold-200',
                      !isCurrent && 'hover:bg-charcoal-50',
                      onStepClick && 'cursor-pointer'
                    )}
                    onClick={() => onStepClick?.(step)}
                  >
                    {/* Channel Icon */}
                    <div
                      className={cn(
                        'relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0',
                        channelColors[step.channel],
                        step.status === 'completed' && 'opacity-60',
                        step.status === 'skipped' && 'opacity-30'
                      )}
                    >
                      <ChannelIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-charcoal-500 uppercase">
                              Step {step.stepNumber}
                            </span>
                            <span className="text-xs text-charcoal-400 capitalize">
                              {step.channel}
                            </span>
                            <StatusIcon className={cn('w-4 h-4', status.color)} />
                          </div>
                          <h4 className="font-medium text-charcoal-900 mt-1 truncate">
                            {step.subject || step.templateName}
                          </h4>
                          {step.subject && (
                            <p className="text-sm text-charcoal-500 truncate">
                              {step.templateName}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {onEditStep && step.status !== 'completed' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditStep(step)
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit step</TooltipContent>
                            </Tooltip>
                          )}
                          {step.stats && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(step.id)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Stats */}
                      {isExpanded && step.stats && (
                        <div className="mt-4 pt-4 border-t border-charcoal-100">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatItem
                              label="Sent"
                              value={step.stats.sent || 0}
                            />
                            <StatItem
                              label="Opened"
                              value={step.stats.opened || 0}
                              percentage={step.stats.delivered ? ((step.stats.opened || 0) / step.stats.delivered) * 100 : undefined}
                            />
                            <StatItem
                              label="Clicked"
                              value={step.stats.clicked || 0}
                              percentage={step.stats.opened ? ((step.stats.clicked || 0) / step.stats.opened) * 100 : undefined}
                            />
                            <StatItem
                              label="Replied"
                              value={step.stats.replied || 0}
                              percentage={step.stats.sent ? ((step.stats.replied || 0) / step.stats.sent) * 100 : undefined}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delay Indicator */}
                  {!isLast && (
                    <div className="flex items-center gap-3 py-2 pl-5">
                      <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Wait {steps[index + 1]?.delay.value} {steps[index + 1]?.delay.unit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * StatItem - Individual stat display
 */
function StatItem({
  label,
  value,
  percentage,
}: {
  label: string
  value: number
  percentage?: number
}) {
  return (
    <div>
      <p className="text-xs text-charcoal-500">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium text-charcoal-900">
          {value.toLocaleString()}
        </span>
        {percentage !== undefined && (
          <span className="text-xs text-charcoal-400">
            ({percentage.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * SequenceTimelineCompact - Compact horizontal version
 */
interface SequenceTimelineCompactProps {
  steps: SequenceStep[]
  currentStep?: number
  className?: string
}

export function SequenceTimelineCompact({
  steps,
  currentStep,
  className,
}: SequenceTimelineCompactProps) {
  const channelIcons: Record<string, typeof Mail> = {
    email: Mail,
    linkedin: Linkedin,
    phone: Phone,
    sms: MessageSquare,
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const ChannelIcon = channelIcons[step.channel]
        const isCompleted = step.status === 'completed'
        const isCurrent = currentStep === index
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                    isCompleted && 'bg-green-100 text-green-600',
                    isCurrent && 'bg-gold-100 text-gold-600 ring-2 ring-gold-300',
                    !isCompleted && !isCurrent && 'bg-charcoal-100 text-charcoal-400'
                  )}
                >
                  <ChannelIcon className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Step {step.stepNumber}</p>
                <p className="text-xs text-charcoal-400">{step.templateName}</p>
              </TooltipContent>
            </Tooltip>

            {!isLast && (
              <div
                className={cn(
                  'w-8 h-0.5',
                  isCompleted ? 'bg-green-300' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SequenceTimeline
