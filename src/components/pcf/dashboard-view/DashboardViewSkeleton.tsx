'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardViewSkeletonProps {
  metricsCount?: number
  widgetCount?: number
  className?: string
}

export function DashboardViewSkeleton({
  metricsCount = 4,
  widgetCount = 6,
  className,
}: DashboardViewSkeletonProps) {
  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: metricsCount }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </Card>
        ))}
      </div>

      {/* Widgets Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: widgetCount }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

