import * as React from 'react'
import { cn } from '@/lib/utils'

interface AdminPageContentProps {
  children: React.ReactNode
  /** Set to true when page is inside HorizontalTabsLayout (padding comes from layout) */
  insideTabLayout?: boolean
  className?: string
}

/**
 * Standard wrapper for admin page content.
 * Provides consistent padding and background color.
 */
export function AdminPageContent({
  children,
  insideTabLayout = false,
  className,
}: AdminPageContentProps) {
  // When inside tab layout, the layout provides padding - we just add spacing
  if (insideTabLayout) {
    return (
      <div className={cn('space-y-6', className)}>
        {children}
      </div>
    )
  }

  // Standalone pages need padding and background
  return (
    <div className={cn('p-6 lg:p-8 bg-cream min-h-full', className)}>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
