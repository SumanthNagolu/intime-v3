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
    <div className="px-6 py-3 bg-charcoal-50/50 border-t border-charcoal-100">
      <div className="flex items-center justify-between gap-6">
        {/* Metrics */}
        <div className="flex items-center gap-6 flex-wrap">
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
                      <div className="flex items-center gap-2 cursor-help">
                        <div className={cn('p-1.5 rounded-md', metric.iconBg)}>
                          <Icon className={cn('w-4 h-4', metric.iconColor)} />
                        </div>
                        <div>
                          <div className="text-xs text-charcoal-500">
                            {metric.label}
                          </div>
                          <div className="text-sm font-semibold tabular-nums">
                            {value}
                            {total !== undefined && (
                              <span className="text-charcoal-400 font-normal ml-1">
                                / {total}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {tooltip && (
                      <TooltipContent side="bottom">
                        <p className="text-sm">{tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Divider */}
                {index < metrics.length - 1 && (
                  <div className="h-8 w-px bg-charcoal-200 ml-6" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        {progressBar && progress !== null && (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-charcoal-500">{progressBar.label}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    progress >= 100
                      ? 'bg-emerald-500'
                      : progress >= 75
                        ? 'bg-blue-500'
                        : progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-charcoal-400'
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
