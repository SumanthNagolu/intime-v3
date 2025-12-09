'use client'

import { cn } from '@/lib/utils'

/**
 * ProgressRingProps
 */
interface ProgressRingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  color?: 'default' | 'gold' | 'green' | 'blue' | 'red'
  showValue?: boolean
  showPercentage?: boolean
  label?: string
  sublabel?: string
  className?: string
  animated?: boolean
}

/**
 * ProgressRing - Tesla-style circular progress indicator
 *
 * Features:
 * - Smooth animated transitions
 * - Multiple size options
 * - Custom colors
 * - Optional percentage display
 * - Label support
 */
export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  strokeWidth,
  color = 'default',
  showValue = true,
  showPercentage = true,
  label,
  sublabel,
  className,
  animated = true,
}: ProgressRingProps) {
  // Calculate percentage
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0

  // Size configurations
  const sizeConfig = {
    sm: { diameter: 64, stroke: 4, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    md: { diameter: 96, stroke: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
    lg: { diameter: 128, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-sm' },
    xl: { diameter: 160, stroke: 10, fontSize: 'text-3xl', labelSize: 'text-base' },
  }

  const { diameter, stroke: defaultStroke, fontSize, labelSize } = sizeConfig[size]
  const actualStroke = strokeWidth || defaultStroke
  const radius = (diameter - actualStroke) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Color configurations
  const colorConfig = {
    default: {
      bg: 'stroke-charcoal-100',
      fg: 'stroke-charcoal-900',
      text: 'text-charcoal-900',
    },
    gold: {
      bg: 'stroke-gold-100',
      fg: 'stroke-gold-500',
      text: 'text-gold-600',
    },
    green: {
      bg: 'stroke-green-100',
      fg: 'stroke-green-500',
      text: 'text-green-600',
    },
    blue: {
      bg: 'stroke-blue-100',
      fg: 'stroke-blue-500',
      text: 'text-blue-600',
    },
    red: {
      bg: 'stroke-red-100',
      fg: 'stroke-red-500',
      text: 'text-red-600',
    },
  }

  const colors = colorConfig[color]

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: diameter, height: diameter }}>
        <svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={actualStroke}
            className={colors.bg}
          />

          {/* Progress circle */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={actualStroke}
            strokeLinecap="round"
            className={cn(colors.fg, animated && 'transition-all duration-700 ease-out')}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn('font-bold', fontSize, colors.text)}>
              {showPercentage ? `${Math.round(percentage)}%` : value.toLocaleString()}
            </span>
          )}
          {sublabel && (
            <span className={cn('text-charcoal-400', labelSize)}>{sublabel}</span>
          )}
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className={cn('mt-2 font-medium text-charcoal-700', labelSize)}>
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * ProgressRingWithTarget - Progress ring with target indicator
 */
interface ProgressRingWithTargetProps extends Omit<ProgressRingProps, 'showPercentage'> {
  target?: number
}

export function ProgressRingWithTarget({
  value,
  max = 100,
  target,
  ...props
}: ProgressRingWithTargetProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const targetPercentage = target && max > 0 ? (target / max) * 100 : undefined
  const isOnTarget = target ? value >= target : true

  return (
    <div className="flex flex-col items-center">
      <ProgressRing
        value={value}
        max={max}
        color={isOnTarget ? 'green' : percentage > 50 ? 'gold' : 'red'}
        showPercentage={false}
        {...props}
      />
      {target && (
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-charcoal-700">
            {value.toLocaleString()} / {target.toLocaleString()}
          </span>
          <p className={cn(
            'text-xs',
            isOnTarget ? 'text-green-600' : 'text-charcoal-500'
          )}>
            {isOnTarget ? 'Target reached!' : `${Math.round((value / target) * 100)}% of target`}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * ProgressRingGroup - Multiple progress rings in a row
 */
interface ProgressRingGroupProps {
  items: Array<{
    value: number
    max?: number
    label: string
    color?: ProgressRingProps['color']
  }>
  size?: ProgressRingProps['size']
  className?: string
}

export function ProgressRingGroup({ items, size = 'sm', className }: ProgressRingGroupProps) {
  return (
    <div className={cn('flex items-center justify-around gap-4', className)}>
      {items.map((item, index) => (
        <ProgressRing
          key={index}
          value={item.value}
          max={item.max || 100}
          label={item.label}
          color={item.color || 'default'}
          size={size}
        />
      ))}
    </div>
  )
}

/**
 * CampaignHealthRing - Campaign-specific health indicator
 */
interface CampaignHealthRingProps {
  metrics: {
    leadsGenerated: number
    targetLeads: number
    meetingsBooked: number
    targetMeetings: number
    responseRate: number
    conversionRate: number
  }
  size?: 'md' | 'lg'
  className?: string
}

export function CampaignHealthRing({ metrics, size = 'lg', className }: CampaignHealthRingProps) {
  // Calculate overall health score (0-100)
  const leadProgress = metrics.targetLeads > 0
    ? Math.min((metrics.leadsGenerated / metrics.targetLeads) * 100, 100)
    : 0
  const meetingProgress = metrics.targetMeetings > 0
    ? Math.min((metrics.meetingsBooked / metrics.targetMeetings) * 100, 100)
    : 0

  // Health score is weighted average
  const healthScore = Math.round(
    (leadProgress * 0.4) +
    (meetingProgress * 0.3) +
    (metrics.responseRate * 0.15) +
    (metrics.conversionRate * 10 * 0.15) // Multiply conversion by 10 to scale to 100
  )

  // Determine color based on health
  const healthColor = healthScore >= 70 ? 'green' : healthScore >= 40 ? 'gold' : 'red'
  const healthLabel = healthScore >= 70 ? 'On Track' : healthScore >= 40 ? 'Needs Attention' : 'At Risk'

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <ProgressRing
        value={healthScore}
        max={100}
        size={size}
        color={healthColor}
        showPercentage={false}
        sublabel="Health"
      />
      <div className="mt-2 text-center">
        <span className={cn(
          'text-sm font-semibold',
          healthColor === 'green' && 'text-green-600',
          healthColor === 'gold' && 'text-gold-600',
          healthColor === 'red' && 'text-red-600'
        )}>
          {healthLabel}
        </span>
        <p className="text-xs text-charcoal-500 mt-1">
          {healthScore}/100 Score
        </p>
      </div>
    </div>
  )
}

export default ProgressRing
