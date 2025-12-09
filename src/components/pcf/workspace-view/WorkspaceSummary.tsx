'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { WorkspaceSummaryConfig } from './types'

interface WorkspaceSummaryProps {
  summary: WorkspaceSummaryConfig[]
  columns?: 2 | 3 | 4 | 5 | 6
  isLoading?: boolean
  className?: string
}

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

export function WorkspaceSummary({
  summary,
  columns = 4,
  isLoading,
  className,
}: WorkspaceSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-3', columnClasses[columns], className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('grid gap-3', columnClasses[columns], className)}>
        {summary.map((item) => {
          const value = item.getValue()
          const Icon = item.icon

          const content = (
            <Card
              className={cn(
                'p-3 transition-all duration-200',
                item.href && 'hover:shadow-md hover:border-gold-200 cursor-pointer'
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <div
                    className={cn(
                      'p-2.5 rounded-lg flex-shrink-0',
                      item.iconBg || 'bg-charcoal-100'
                    )}
                  >
                    <Icon
                      className={cn('w-5 h-5', item.iconColor || 'text-charcoal-600')}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs text-charcoal-500 truncate">{item.label}</p>
                  <p className="text-xl font-semibold text-charcoal-900 tabular-nums">
                    {value ?? '—'}
                  </p>
                </div>
              </div>
            </Card>
          )

          const wrappedContent = item.tooltip ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent>{item.tooltip}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.id}>{content}</div>
          )

          if (item.href) {
            return (
              <Link key={item.id} href={item.href}>
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

