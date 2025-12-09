'use client'

import { Card, CardContent } from '@/components/ui/card'
import { StatCardConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ListStatsProps {
  stats: StatCardConfig[]
  data?: Record<string, number | string>
  isLoading?: boolean
  gridCols?: 4 | 5 | 6
}

export function ListStats({
  stats,
  data,
  isLoading = false,
  gridCols = 5,
}: ListStatsProps) {
  const gridClasses = {
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-6',
  }

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 mb-8', gridClasses[gridCols])}>
        {stats.map((stat) => (
          <Card key={stat.key} className="bg-white">
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 mb-8', gridClasses[gridCols])}>
      {stats.map((stat) => {
        const Icon = stat.icon
        const value = data?.[stat.key]

        // Format value based on type
        let displayValue: string
        if (value === undefined || value === null) {
          displayValue = '—'
        } else if (stat.format === 'currency') {
          displayValue = `$${Number(value).toLocaleString()}`
        } else if (stat.format === 'percent') {
          displayValue = `${value}%`
        } else {
          displayValue = String(value)
        }

        return (
          <Card key={stat.key} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-charcoal-900 tabular-nums">
                    {displayValue}
                  </div>
                  <p className="text-sm text-charcoal-500">{stat.label}</p>
                </div>
                {Icon && (
                  <div className={cn('p-2 rounded-lg', stat.color || 'bg-charcoal-100')}>
                    <Icon className="w-5 h-5 text-charcoal-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
