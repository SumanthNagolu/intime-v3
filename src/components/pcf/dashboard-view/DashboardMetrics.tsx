'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DashboardMetricConfig } from './types'

interface DashboardMetricsProps {
  metrics: DashboardMetricConfig[]
  columns?: 2 | 3 | 4 | 5 | 6
  isLoading?: boolean
  className?: string
}

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

export function DashboardMetrics({
  metrics,
  columns = 4,
  isLoading,
  className,
}: DashboardMetricsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4', columnClasses[columns], className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('grid gap-4', columnClasses[columns], className)}>
        {metrics.map((metric) => {
          const value = metric.getValue()
          const change = metric.getChange?.()
          const Icon = metric.icon

          // Format value
          let displayValue: string
          if (value === undefined || value === null) {
            displayValue = '—'
          } else if (typeof metric.format === 'function') {
            displayValue = metric.format(value)
          } else if (metric.format === 'currency') {
            displayValue = `$${Number(value).toLocaleString()}`
          } else if (metric.format === 'percent') {
            displayValue = `${value}%`
          } else {
            displayValue = Number(value).toLocaleString()
          }

          const content = (
            <Card
              className={cn(
                'p-4 transition-all duration-200',
                metric.href && 'hover:shadow-md hover:border-gold-200 cursor-pointer'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-semibold text-charcoal-900 tabular-nums">
                    {displayValue}
                  </p>

                  {/* Change indicator */}
                  {change && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs font-medium',
                        change.trend === 'up' && 'text-green-600',
                        change.trend === 'down' && 'text-red-600',
                        change.trend === 'neutral' && 'text-charcoal-500'
                      )}
                    >
                      {change.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                      {change.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      {change.trend === 'neutral' && <Minus className="w-3 h-3" />}
                      <span>
                        {change.value > 0 ? '+' : ''}
                        {change.value}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Icon */}
                {Icon && (
                  <div
                    className={cn(
                      'p-2.5 rounded-lg',
                      metric.iconBg || 'bg-charcoal-100'
                    )}
                  >
                    <Icon
                      className={cn('w-5 h-5', metric.iconColor || 'text-charcoal-600')}
                    />
                  </div>
                )}
              </div>
            </Card>
          )

          // Wrap with tooltip if present
          const wrappedContent = metric.tooltip ? (
            <Tooltip key={metric.id}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent>{metric.tooltip}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={metric.id}>{content}</div>
          )

          // Wrap with link if present
          if (metric.href) {
            return (
              <Link key={metric.id} href={metric.href}>
                {wrappedContent}
              </Link>
            )
          }

          return wrappedContent
        })}
      </div>
    </TooltipProvider>
  )
}

