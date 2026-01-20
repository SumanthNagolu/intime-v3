'use client'

import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Section icon */
  icon?: LucideIcon
  /** Section title */
  title: string
  /** Section subtitle/description */
  subtitle?: string
  /** Rendering variant */
  variant?: 'wizard' | 'panel' | 'card'
  /** Additional class name */
  className?: string
  /** Child content */
  children?: React.ReactNode
}

/**
 * SectionHeader - Consistent header for section groups
 *
 * Used in both wizard steps and detail view cards.
 * Renders icon, title, and optional subtitle.
 */
export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  variant = 'wizard',
  className,
  children,
}: SectionHeaderProps) {
  if (variant === 'card') {
    // Compact card header style (for detail view cards)
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {Icon && (
          <div className="p-2 bg-gold-50 rounded-lg">
            <Icon className="w-4 h-4 text-gold-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-heading font-semibold text-charcoal-900">{title}</h3>
          {subtitle && <p className="text-xs text-charcoal-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    )
  }

  // Wizard/panel header style (larger, more prominent)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-amber-100 flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-gold-600" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

interface SectionWrapperProps {
  /** Section icon */
  icon?: LucideIcon
  /** Section title */
  title: string
  /** Section subtitle/description */
  subtitle?: string
  /** Rendering variant */
  variant?: 'wizard' | 'panel' | 'card'
  /** Additional class name */
  className?: string
  /** Child content */
  children: React.ReactNode
}

/**
 * SectionWrapper - Wrapper component with header and content
 *
 * Combines SectionHeader with children in a consistent layout.
 */
export function SectionWrapper({
  icon,
  title,
  subtitle,
  variant = 'wizard',
  className,
  children,
}: SectionWrapperProps) {
  return (
    <div className={cn('space-y-5', className)}>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} variant={variant} />
      {children}
    </div>
  )
}

export default SectionHeader
