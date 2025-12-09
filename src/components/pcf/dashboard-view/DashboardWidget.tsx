'use client'

import Link from 'next/link'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { DashboardWidgetConfig } from './types'

interface DashboardWidgetProps {
  config: DashboardWidgetConfig
  isLoading?: boolean
  data?: unknown
  className?: string
}

export function DashboardWidget({
  config,
  isLoading,
  data,
  className,
}: DashboardWidgetProps) {
  const Icon = config.icon
  const Component = config.component
  const isEmpty = !data || (Array.isArray(data) && data.length === 0)

  // Span classes for grid
  const spanClasses = cn(
    config.colSpan === 2 && 'lg:col-span-2',
    config.colSpan === 3 && 'lg:col-span-3',
    config.colSpan === 4 && 'lg:col-span-4',
    config.rowSpan === 2 && 'row-span-2'
  )

  return (
    <Card className={cn('flex flex-col', spanClasses, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        </div>

        {/* Header Action */}
        {config.headerAction && (
          config.headerAction.href ? (
            <Link href={config.headerAction.href}>
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                {config.headerAction.label}
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={config.headerAction.onClick}
              className="gap-1.5 h-7 text-xs"
            >
              {config.headerAction.icon && (
                <config.headerAction.icon className="w-3 h-3" />
              )}
              {config.headerAction.label}
            </Button>
          )
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {isLoading ? (
          <DashboardWidgetSkeleton />
        ) : isEmpty && config.emptyState ? (
          <DashboardWidgetEmpty
            icon={config.emptyState.icon}
            title={config.emptyState.title}
            description={config.emptyState.description}
          />
        ) : Component ? (
          <Component data={data} />
        ) : (
          <div className="text-sm text-charcoal-500">No content configured</div>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardWidgetSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

function DashboardWidgetEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      {Icon && (
        <div className="p-3 bg-charcoal-100 rounded-full mb-3">
          <Icon className="w-5 h-5 text-charcoal-400" />
        </div>
      )}
      <p className="text-sm font-medium text-charcoal-600">{title}</p>
      {description && (
        <p className="text-xs text-charcoal-400 mt-1 max-w-[200px]">{description}</p>
      )}
    </div>
  )
}

// Standalone widget wrapper for custom content
interface WidgetWrapperProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  children: React.ReactNode
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2
  className?: string
}

export function WidgetWrapper({
  title,
  icon: Icon,
  action,
  children,
  colSpan,
  rowSpan,
  className,
}: WidgetWrapperProps) {
  const spanClasses = cn(
    colSpan === 2 && 'lg:col-span-2',
    colSpan === 3 && 'lg:col-span-3',
    colSpan === 4 && 'lg:col-span-4',
    rowSpan === 2 && 'row-span-2'
  )

  return (
    <Card className={cn('flex flex-col', spanClasses, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

