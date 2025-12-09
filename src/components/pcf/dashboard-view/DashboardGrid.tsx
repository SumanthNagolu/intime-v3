'use client'

import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

const columnClasses = {
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
}

export function DashboardGrid({
  children,
  columns = 3,
  className,
}: DashboardGridProps) {
  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {children}
    </div>
  )
}

// Section component for grouping widgets
interface DashboardSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function DashboardSection({
  children,
  title,
  description,
  action,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-heading font-semibold text-charcoal-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

