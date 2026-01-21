'use client'

import * as React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface QuickActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  variant?: 'default' | 'destructive'
  separator?: boolean
}

interface QuickActionsPanelProps {
  actions: QuickActionItem[]
  onAction: (actionId: string) => void
  className?: string
  isCollapsed?: boolean
}

/**
 * QuickActionsPanel - Hublot-inspired always-visible actions panel
 *
 * Displays actions directly in the sidebar (no popover).
 * Features:
 * - Gold accent header
 * - Hover effects with left border accent
 * - Separated primary and secondary actions
 * - Collapsed mode with icon-only buttons + tooltips
 */
export function QuickActionsPanel({
  actions,
  onAction,
  className,
  isCollapsed = false,
}: QuickActionsPanelProps) {
  // Group actions by separator
  const actionGroups = React.useMemo(() => {
    const groups: QuickActionItem[][] = [[]]
    actions.forEach((action, index) => {
      if (action.separator && index > 0) {
        groups.push([])
      }
      groups[groups.length - 1].push(action)
    })
    return groups.filter(g => g.length > 0)
  }, [actions])

  if (actions.length === 0) return null

  // Collapsed mode: Show icon-only buttons with tooltips
  if (isCollapsed) {
    return (
      <div className={cn('py-3 px-2 space-y-1', className)}>
        {actions.slice(0, 4).map((action) => {
          const Icon = action.icon
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
                    action.variant === 'destructive'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-charcoal-600 hover:bg-gold-50 hover:text-gold-700'
                  )}
                  onClick={() => onAction(action.id)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-charcoal-900 text-white">
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    )
  }

  // Expanded mode: Show full action buttons
  return (
    <div className={cn('py-3 px-3', className)}>
      {/* Panel Container */}
      <div className="rounded-lg bg-gradient-to-b from-cream to-charcoal-50/50 border border-charcoal-200/60 overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 flex items-center gap-2 border-b border-charcoal-200/60">
          <Zap className="w-3.5 h-3.5 text-gold-600" />
          <span className="text-[10px] font-semibold text-gold-700 uppercase tracking-widest">
            Quick Actions
          </span>
        </div>

        {/* Actions */}
        <div className="p-1.5">
          {actionGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <div className="my-1.5 mx-2 border-t border-charcoal-200/60" />
              )}
              <div className="space-y-0.5">
                {group.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => onAction(action.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md',
                        'text-left transition-all duration-200 group',
                        'border-l-2 border-transparent',
                        action.variant === 'destructive'
                          ? 'text-red-600 hover:bg-red-50/80 hover:border-l-red-500'
                          : 'text-charcoal-700 hover:bg-white hover:border-l-gold-500 hover:shadow-sm'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                          action.variant === 'destructive'
                            ? 'bg-red-100/80 text-red-600 group-hover:bg-red-100'
                            : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-gold-100 group-hover:text-gold-700'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-medium">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickActionsPanel
