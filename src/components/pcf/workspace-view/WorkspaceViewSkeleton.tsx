'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WorkspaceViewSkeletonProps {
  summaryCount?: number
  className?: string
}

export function WorkspaceViewSkeleton({
  summaryCount = 4,
  className,
}: WorkspaceViewSkeletonProps) {
  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Header Skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: summaryCount }).map((_, i) => (
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

      {/* Tabs Skeleton */}
      <div className="border-b border-charcoal-200">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-charcoal-200 overflow-hidden">
        <div className="bg-charcoal-50/50 px-4 py-3">
          <div className="flex gap-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-4 py-3">
              <div className="flex gap-8">
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

