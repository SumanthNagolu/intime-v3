'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface BuilderViewSkeletonProps {
  className?: string
}

export function BuilderViewSkeleton({ className }: BuilderViewSkeletonProps) {
  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-charcoal-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-charcoal-200 p-3 space-y-4">
          <Skeleton className="h-9 w-full rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        </div>

        {/* Canvas Skeleton */}
        <div className="flex-1 bg-charcoal-50 p-8">
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-32 w-48 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

