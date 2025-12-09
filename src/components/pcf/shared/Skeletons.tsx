'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  compact?: boolean
}

/**
 * Skeleton for EntityListView
 * Shows: Header, Stats cards, Filters, List items
 */
export function EntityListViewSkeleton({ className, compact }: SkeletonProps) {
  return (
    <div className={cn('p-6', compact && 'p-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats cards skeleton */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-white">
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters skeleton */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-white">
            <CardContent className={cn('py-4', compact && 'py-3')}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for EntityDetailView
 * Shows: Breadcrumbs, Header, Metrics bar, Content area
 */
export function EntityDetailViewSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('', className)}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 px-6 pt-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 px-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Metrics bar */}
      <div className="px-6 py-3 bg-charcoal-50/50 border-t border-charcoal-100">
        <div className="flex items-center gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div className="px-6 border-b border-charcoal-200">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-24" />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-6 bg-charcoal-50/30">
        <Card className="bg-white">
          <CardContent className="py-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Skeleton for EntityWizard
 * Shows: Progress indicator, Step content, Navigation
 */
export function EntityWizardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            {i < 5 && <Skeleton className="h-1 w-16 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="bg-white mb-6">
        <CardContent className="py-6">
          {/* Step header */}
          <div className="mb-6">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for EntityForm
 * Shows: Form sections with fields
 */
export function EntityFormSkeleton({ className, compact }: SkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Form section */}
      <div className="space-y-4">
        <div className="border-b border-charcoal-100 pb-2">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-2')}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Another section */}
      <div className="space-y-4">
        <div className="border-b border-charcoal-100 pb-2">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className={cn('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-2')}>
          {[1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
