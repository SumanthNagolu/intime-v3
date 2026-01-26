'use client'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrendingDown, ArrowDown } from 'lucide-react'

/**
 * FunnelStage - Represents a single stage in the funnel
 */
export interface FunnelStage {
  id: string
  label: string
  count: number
  color?: string
  icon?: React.ReactNode
}

/**
 * FunnelChartProps - Configuration for the funnel chart
 */
interface FunnelChartProps {
  stages: FunnelStage[]
  showDropOff?: boolean
  showInsights?: boolean
  variant?: 'horizontal' | 'trapezoid'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onStageClick?: (stage: FunnelStage) => void
}

/**
 * FunnelChart - Enterprise-grade funnel visualization
 *
 * Features:
 * - Animated bar widths based on conversion
 * - Drop-off indicators between stages
 * - Hover tooltips with detailed metrics
 * - Click handlers for drill-down
 * - Responsive sizing
 */
export function FunnelChart({
  stages,
  showDropOff = true,
  showInsights = false,
  variant = 'horizontal',
  size = 'md',
  className,
  onStageClick,
}: FunnelChartProps) {
  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-charcoal-400">
        <TrendingDown className="w-8 h-8 mr-2" />
        <span>No funnel data available</span>
      </div>
    )
  }

  // Calculate percentages and drop-offs
  const maxCount = stages[0]?.count || 1
  const stagesWithMetrics = stages.map((stage, index) => {
    const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
    const prevStage = index > 0 ? stages[index - 1] : null
    const dropOff = prevStage && prevStage.count > 0
      ? ((prevStage.count - stage.count) / prevStage.count) * 100
      : 0
    const conversionFromPrev = prevStage && prevStage.count > 0
      ? (stage.count / prevStage.count) * 100
      : 100

    return {
      ...stage,
      percentage,
      dropOff,
      conversionFromPrev,
      widthPercent: Math.max(percentage, 5), // Minimum 5% width for visibility
    }
  })

  // Size configurations
  const sizeConfig = {
    sm: { barHeight: 'h-8', fontSize: 'text-xs', gap: 'gap-2', padding: 'py-1 px-2' },
    md: { barHeight: 'h-10', fontSize: 'text-sm', gap: 'gap-3', padding: 'py-1.5 px-3' },
    lg: { barHeight: 'h-12', fontSize: 'text-base', gap: 'gap-4', padding: 'py-2 px-4' },
  }

  const { barHeight, fontSize, gap, padding } = sizeConfig[size]

  // Default color palette (gradient from cool to warm)
  const defaultColors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-gold-500',
  ]

  // Calculate insights
  const insights = showInsights ? generateInsights(stagesWithMetrics) : []

  return (
    <TooltipProvider>
      <div className={cn('space-y-1', className)}>
        {stagesWithMetrics.map((stage, index) => {
          const color = stage.color || defaultColors[index % defaultColors.length]
          const isFirst = index === 0
          const isLast = index === stagesWithMetrics.length - 1

          return (
            <div key={stage.id} className={cn('relative', gap)}>
              {/* Drop-off indicator */}
              {showDropOff && !isFirst && stage.dropOff > 0 && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-1 text-xs text-charcoal-400">
                    <ArrowDown className="w-3 h-3" />
                    <span className="font-medium">
                      {stage.dropOff.toFixed(1)}% drop-off
                    </span>
                    <span className="text-charcoal-300">•</span>
                    <span>
                      {stage.conversionFromPrev.toFixed(1)}% converted
                    </span>
                  </div>
                </div>
              )}

              {/* Funnel bar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'relative flex items-center gap-3 transition-all duration-300 cursor-pointer group',
                      onStageClick && 'hover:opacity-90'
                    )}
                    onClick={() => onStageClick?.(stage)}
                  >
                    {/* Bar container - always full width for layout */}
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-lg flex-shrink-0',
                        barHeight
                      )}
                      style={{ width: `${stage.widthPercent}%`, minWidth: stage.widthPercent < 25 ? '60px' : undefined }}
                    >
                      {/* Background bar */}
                      <div className={cn('absolute inset-0', color)} />

                      {/* Content inside bar - only show if wide enough */}
                      {stage.widthPercent >= 25 && (
                        <div
                          className={cn(
                            'relative h-full flex items-center justify-between text-white',
                            padding
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {stage.icon}
                            <span className={cn('font-medium truncate', fontSize)}>{stage.label}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={cn('font-bold', fontSize)}>
                              {stage.count.toLocaleString()}
                            </span>
                            <span className={cn('opacity-80', fontSize === 'text-xs' ? 'text-[10px]' : 'text-xs')}>
                              ({stage.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Minimal content for narrow bars */}
                      {stage.widthPercent < 25 && (
                        <div
                          className={cn(
                            'relative h-full flex items-center justify-center text-white',
                            padding
                          )}
                        >
                          <span className={cn('font-bold', fontSize)}>
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>

                    {/* Label outside bar for narrow bars */}
                    {stage.widthPercent < 25 && (
                      <div className="flex items-center gap-2 text-charcoal-700">
                        {stage.icon}
                        <span className={cn('font-medium', fontSize)}>{stage.label}</span>
                        <span className={cn('text-charcoal-400', fontSize === 'text-xs' ? 'text-[10px]' : 'text-xs')}>
                          ({stage.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">{stage.label}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-charcoal-400">Count</p>
                        <p className="font-medium">{stage.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-400">Of Total</p>
                        <p className="font-medium">{stage.percentage.toFixed(1)}%</p>
                      </div>
                      {!isFirst && (
                        <>
                          <div>
                            <p className="text-charcoal-400">Drop-off</p>
                            <p className="font-medium text-red-500">-{stage.dropOff.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-charcoal-400">Conversion</p>
                            <p className="font-medium text-green-500">{stage.conversionFromPrev.toFixed(1)}%</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}

        {/* Insights Section */}
        {showInsights && insights.length > 0 && (
          <div className="mt-6 p-4 bg-charcoal-50 rounded-lg">
            <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Funnel Insights</h4>
            <ul className="space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-charcoal-600">
                  <span className="text-charcoal-400">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Generate insights from funnel metrics
 */
function generateInsights(stages: Array<FunnelStage & { dropOff: number; conversionFromPrev: number; percentage: number }>): string[] {
  const insights: string[] = []

  // Find highest drop-off
  const highestDropOff = stages.slice(1).reduce((max, stage) =>
    stage.dropOff > max.dropOff ? stage : max
  , stages[1])

  if (highestDropOff && highestDropOff.dropOff > 30) {
    const prevIndex = stages.findIndex(s => s.id === highestDropOff.id) - 1
    const prevStage = stages[prevIndex]
    insights.push(`Highest drop-off: ${prevStage?.label} → ${highestDropOff.label} (${highestDropOff.dropOff.toFixed(1)}%)`)
  }

  // Overall conversion rate
  if (stages.length >= 2) {
    const firstStage = stages[0]
    const lastStage = stages[stages.length - 1]
    const overallConversion = firstStage.count > 0
      ? (lastStage.count / firstStage.count) * 100
      : 0
    insights.push(`Overall conversion: ${overallConversion.toFixed(2)}%`)
  }

  // Stages with good conversion (> 50%)
  const goodConversions = stages.filter(s => s.conversionFromPrev > 50 && s.conversionFromPrev < 100)
  if (goodConversions.length > 0) {
    insights.push(`Strong stages: ${goodConversions.map(s => s.label).join(', ')}`)
  }

  return insights
}

/**
 * FunnelChartCompact - Compact version for dashboard widgets
 */
interface FunnelChartCompactProps {
  stages: FunnelStage[]
  className?: string
}

export function FunnelChartCompact({ stages, className }: FunnelChartCompactProps) {
  if (stages.length === 0) return null

  const maxCount = stages[0]?.count || 1

  return (
    <div className={cn('flex items-end gap-1 h-16', className)}>
      {stages.map((stage, index) => {
        const heightPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0

        return (
          <TooltipProvider key={stage.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex-1 bg-gradient-to-t from-gold-500 to-gold-400 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{stage.label}</p>
                <p className="text-sm text-charcoal-400">{stage.count.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

export default FunnelChart
