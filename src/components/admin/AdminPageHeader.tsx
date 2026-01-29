import * as React from 'react'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  /** Page title - only shown for standalone pages, not inside tab layouts */
  title?: string
  /** Description - only shown for standalone pages */
  description?: React.ReactNode
  /** Breadcrumbs - always shown */
  breadcrumbs?: BreadcrumbItem[]
  /** Action buttons - always shown */
  actions?: React.ReactNode
  /** Set to true when inside HorizontalTabsLayout (hides title/description) */
  insideTabLayout?: boolean
  className?: string
}

/**
 * Standard header for admin pages.
 * When inside a tab layout, only shows breadcrumbs and actions (title is in layout).
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  insideTabLayout = false,
  className,
}: AdminPageHeaderProps) {
  const showTitle = !insideTabLayout && title

  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumbs removed - sidebar already provides navigation context */}

      {(showTitle || actions) && (
        <div className="flex items-start justify-between">
          {showTitle && (
            <div>
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-charcoal-600">{description}</p>
              )}
            </div>
          )}
          {!showTitle && <div />}
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      )}
    </div>
  )
}
