import * as React from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

interface DashboardShellProps {
  children: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

export function DashboardShell({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-8", className)} data-testid="page-content">
      {/* Header */}
      <div>
        {/* Breadcrumbs removed - sidebar provides navigation context */}

        <div className="flex items-start justify-between">
          <div>
            {typeof title === 'string' ? (
              <h1 className="text-h1 text-charcoal-900">{title}</h1>
            ) : (
              title
            )}
            {description && (
              <div className="text-body-lg text-charcoal-600 mt-2">{description}</div>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

// Grid helpers for dashboard layouts
export function DashboardGrid({
  children,
  columns = 4,
  className
}: {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  )
}

export function DashboardSection({
  children,
  title,
  action,
  className,
}: {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-h3 text-charcoal-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
