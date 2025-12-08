'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface InlinePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  headerActions?: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const widthClasses = {
  sm: 'w-80',   // 320px
  md: 'w-96',   // 384px
  lg: 'w-[480px]',
  xl: 'w-[560px]',
}

/**
 * InlinePanel - A side panel that slides in from the right
 *
 * Used for displaying detail views inline alongside a list,
 * following the Guidewire pattern of side-by-side views.
 *
 * Features:
 * - Slides in from right with animation
 * - Close button in header
 * - Optional header actions (e.g., Edit button)
 * - Footer actions slot
 * - Configurable width
 */
export function InlinePanel({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  headerActions,
  width = 'md',
  className,
}: InlinePanelProps) {
  // Handle escape key to close panel
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        'border-l border-charcoal-200 bg-white flex flex-col',
        'animate-in slide-in-from-right duration-300',
        widthClasses[width],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-charcoal-200 flex-shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-charcoal-900 truncate">{title}</h3>
          {description && (
            <p className="text-sm text-charcoal-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerActions}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>

      {/* Footer actions */}
      {actions && (
        <div className="flex items-center justify-end gap-2 p-4 border-t border-charcoal-200 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

interface InlinePanelHeaderProps {
  children: React.ReactNode
  className?: string
}

export function InlinePanelHeader({ children, className }: InlinePanelHeaderProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
    </div>
  )
}

interface InlinePanelContentProps {
  children: React.ReactNode
  className?: string
}

export function InlinePanelContent({ children, className }: InlinePanelContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

interface InlinePanelSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function InlinePanelSection({ title, children, className }: InlinePanelSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {title && (
        <h4 className="font-medium text-charcoal-700 text-sm">{title}</h4>
      )}
      {children}
    </div>
  )
}

export { type InlinePanelProps }
