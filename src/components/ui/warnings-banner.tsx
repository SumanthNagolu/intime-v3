'use client'

import * as React from 'react'
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { WorkspaceWarning } from '@/types/workspace'

interface WarningsBannerProps {
  warnings: WorkspaceWarning[]
  onWarningClick?: (warning: WorkspaceWarning) => void
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

/**
 * WarningsBanner - Guidewire-style warnings banner
 *
 * Displays warnings/errors at the top of a workspace with severity icons.
 * Clicking a warning can navigate to the relevant section or field.
 *
 * Features:
 * - Grouped by severity (error > warning > info)
 * - Collapsible when many warnings
 * - Click to navigate to field/section
 * - Dismissible (optional)
 */
export function WarningsBanner({
  warnings,
  onWarningClick,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: WarningsBannerProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())

  // Filter out dismissed warnings
  const visibleWarnings = warnings.filter((w) => !dismissed.has(w.id))

  if (visibleWarnings.length === 0) {
    return null
  }

  // Sort by severity: error first, then warning, then info
  const sortedWarnings = [...visibleWarnings].sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  // Group by severity for display
  const errorCount = sortedWarnings.filter((w) => w.severity === 'error').length
  const warningCount = sortedWarnings.filter((w) => w.severity === 'warning').length
  const infoCount = sortedWarnings.filter((w) => w.severity === 'info').length

  // Determine banner background based on highest severity
  const hasCritical = errorCount > 0
  const hasWarning = warningCount > 0
  const bannerBg = hasCritical
    ? 'bg-red-50 border-red-200'
    : hasWarning
      ? 'bg-amber-50 border-amber-200'
      : 'bg-blue-50 border-blue-200'

  const displayedWarnings = isCollapsed ? sortedWarnings.slice(0, 2) : sortedWarnings
  const hasMore = collapsible && sortedWarnings.length > 2

  return (
    <div
      className={cn(
        'rounded-lg border p-3 mb-4 transition-all duration-300',
        bannerBg,
        className
      )}
    >
      {/* Header with summary */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-sm font-medium">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-700">
              <AlertCircle className="h-4 w-4" />
              {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-blue-700">
              <Info className="h-4 w-4" />
              {infoCount} {infoCount === 1 ? 'Notice' : 'Notices'}
            </span>
          )}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 px-2 text-charcoal-600 hover:text-charcoal-900"
          >
            {isCollapsed ? (
              <>
                Show All
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                Show Less
                <ChevronUp className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Warning list */}
      <div className="space-y-1.5">
        {displayedWarnings.map((warning) => (
          <WarningItem
            key={warning.id}
            warning={warning}
            onClick={() => onWarningClick?.(warning)}
            onDismiss={() => setDismissed((prev) => new Set(prev).add(warning.id))}
          />
        ))}
        {isCollapsed && hasMore && (
          <p className="text-xs text-charcoal-500 pl-6">
            + {sortedWarnings.length - 2} more issues
          </p>
        )}
      </div>
    </div>
  )
}

interface WarningItemProps {
  warning: WorkspaceWarning
  onClick?: () => void
  onDismiss?: () => void
}

function WarningItem({ warning, onClick, onDismiss }: WarningItemProps) {
  const Icon =
    warning.severity === 'error'
      ? AlertCircle
      : warning.severity === 'warning'
        ? AlertTriangle
        : Info

  const iconColor =
    warning.severity === 'error'
      ? 'text-red-500'
      : warning.severity === 'warning'
        ? 'text-amber-500'
        : 'text-blue-500'

  const textColor =
    warning.severity === 'error'
      ? 'text-red-800'
      : warning.severity === 'warning'
        ? 'text-amber-800'
        : 'text-blue-800'

  return (
    <div className="flex items-center gap-2 group">
      <Icon className={cn('h-4 w-4 flex-shrink-0', iconColor)} />
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'flex-1 text-left text-sm transition-colors',
          textColor,
          onClick && 'hover:underline cursor-pointer'
        )}
      >
        {warning.message}
        {warning.section && (
          <span className="text-xs opacity-70 ml-1">({warning.section})</span>
        )}
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/50 rounded"
          aria-label="Dismiss warning"
        >
          <X className="h-3 w-3 text-charcoal-500" />
        </button>
      )}
    </div>
  )
}

export default WarningsBanner
