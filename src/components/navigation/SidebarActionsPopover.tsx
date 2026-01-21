'use client'

import * as React from 'react'
import { ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface ActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  separator?: boolean
}

interface SidebarActionsPopoverProps {
  actions: ActionItem[]
  onAction: (actionId: string) => void
  className?: string
  isCollapsed?: boolean
}

/**
 * SidebarActionsPopover - Guidewire-style Actions pattern
 *
 * Displays a compact "Actions" button in the sidebar. On click,
 * opens a popover panel to the right (in the screen area) containing
 * action buttons in a clean grid layout.
 *
 * This saves sidebar space while keeping actions easily accessible.
 */
export function SidebarActionsPopover({
  actions,
  onAction,
  className,
  isCollapsed = false,
}: SidebarActionsPopoverProps) {
  const [open, setOpen] = React.useState(false)

  const handleAction = (actionId: string) => {
    onAction(actionId)
    setOpen(false)
  }

  // Group actions by separator
  const actionGroups = React.useMemo(() => {
    const groups: ActionItem[][] = [[]]
    actions.forEach((action) => {
      if (action.separator) {
        groups.push([])
      }
      groups[groups.length - 1].push(action)
    })
    return groups.filter(g => g.length > 0)
  }, [actions])

  if (actions.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md',
            'border transition-all duration-200',
            open
              ? 'bg-gold-50 text-gold-700 border-gold-200'
              : 'text-charcoal-600 border-charcoal-200 hover:bg-charcoal-50 hover:border-charcoal-300',
            className
          )}
        >
          <Zap className={cn(
            'w-3.5 h-3.5 flex-shrink-0',
            open ? 'text-gold-600' : 'text-charcoal-500'
          )} />
          {!isCollapsed && (
            <>
              <span className="font-medium">Actions</span>
              <ChevronRight className={cn(
                'w-3.5 h-3.5 transition-transform',
                open && 'rotate-90'
              )} />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-80 p-0 shadow-elevation-lg"
      >
        <div className="px-4 py-3 border-b border-charcoal-100">
          <h3 className="text-sm font-semibold text-charcoal-900">Quick Actions</h3>
          <p className="text-xs text-charcoal-500 mt-0.5">Select an action to perform</p>
        </div>
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {actionGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <div className="my-2 border-t border-charcoal-100" />
              )}
              <div className="space-y-1">
                {group.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'text-left transition-all duration-150',
                        action.variant === 'destructive'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-charcoal-700 hover:bg-gold-50 hover:text-gold-800'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
                        action.variant === 'destructive'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-charcoal-100 text-charcoal-600 group-hover:bg-gold-100 group-hover:text-gold-700'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">
                          {action.label}
                        </span>
                        {action.description && (
                          <span className="block text-xs text-charcoal-500 truncate">
                            {action.description}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default SidebarActionsPopover
