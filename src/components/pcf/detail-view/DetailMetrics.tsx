'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MetricConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailMetricsProps<T> {
  entity: T
  metrics: MetricConfig[]
  progressBar?: {
    label: string
    getValue: (entity: T) => number
    getMax: (entity: T) => number
  }
}

export function DetailMetrics<T>({
  entity,
  metrics,
  progressBar,
}: DetailMetricsProps<T>) {
  if (metrics.length === 0) return null

  const progress = progressBar
    ? Math.min(
        Math.round(
          (progressBar.getValue(entity) / progressBar.getMax(entity)) * 100
        ),
        100
      )
    : null

  return (
    <div className="px-6 py-4 bg-gradient-to-r from-charcoal-50/80 via-white/60 to-charcoal-50/80 border-t border-charcoal-100/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-8">
        {/* Metrics */}
        <div className="flex items-center gap-1">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const value = metric.getValue(entity)
            const total = metric.getTotal?.(entity)
            const tooltip =
              typeof metric.tooltip === 'function'
                ? metric.tooltip(entity)
                : metric.tooltip

            return (
              <div key={metric.key} className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="group flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200 cursor-help">
                        <div className={cn(
                          'p-2.5 rounded-xl shadow-sm ring-1 ring-black/[0.03] transition-transform duration-200 group-hover:scale-105',
                          metric.iconBg || 'bg-charcoal-100'
                        )}>
                          <Icon className={cn('w-4 h-4', metric.iconColor || 'text-charcoal-600')} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
                            {metric.label}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-semibold tabular-nums text-charcoal-900">
                              {value}
                            </span>
                            {total !== undefined && (
                              <span className="text-sm text-charcoal-400 font-normal">
                                / {total}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {tooltip && (
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-sm">{tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Subtle Divider */}
                {index < metrics.length - 1 && (
                  <div className="h-10 w-px bg-gradient-to-b from-transparent via-charcoal-200 to-transparent mx-1" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        {progressBar && progress !== null && (
          <div className="flex items-center gap-4 min-w-[240px] px-4 py-2 bg-white/60 rounded-xl border border-charcoal-100/50">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
                  {progressBar.label}
                </span>
                <span className={cn(
                  'text-sm font-semibold tabular-nums',
                  progress >= 100 ? 'text-emerald-600' :
                  progress >= 75 ? 'text-blue-600' :
                  progress >= 50 ? 'text-amber-600' : 'text-charcoal-600'
                )}>
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={cn(
                    'h-full transition-all duration-700 ease-out rounded-full',
                    progress >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : progress >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                        : progress >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-charcoal-400 to-charcoal-300'
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
