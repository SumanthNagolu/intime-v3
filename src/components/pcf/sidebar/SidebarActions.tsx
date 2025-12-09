'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SidebarActionConfig } from './types'

interface SidebarActionsProps {
  actions: SidebarActionConfig[]
  entityId: string
  entityStatus: string
  onAction?: (action: SidebarActionConfig) => void
  className?: string
}

export function SidebarActions({
  actions,
  entityId,
  entityStatus,
  onAction,
  className,
}: SidebarActionsProps) {
  // Filter actions based on status visibility
  const visibleActions = actions.filter((action) => {
    if (action.visibleStatuses && !action.visibleStatuses.includes(entityStatus)) {
      return false
    }
    if (action.hiddenStatuses && action.hiddenStatuses.includes(entityStatus)) {
      return false
    }
    return true
  })

  if (visibleActions.length === 0) return null

  const handleAction = (action: SidebarActionConfig) => {
    if (action.actionType === 'dialog' || action.actionType === 'mutation') {
      onAction?.(action)
    }
  }

  const resolveHref = (href: string) => {
    return href.replace(':id', entityId)
  }

  return (
    <div className={cn('p-3 border-t border-charcoal-100', className)}>
      <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
        Actions
      </div>
      <div className="space-y-1.5">
        {visibleActions.slice(0, 5).map((action) => {
          const Icon = action.icon

          // Navigation actions use Link
          if (action.actionType === 'navigate' && action.href) {
            return (
              <Button
                key={action.id}
                variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
                size="sm"
                className={cn(
                  'w-full justify-start gap-2 h-9',
                  action.variant !== 'destructive' &&
                    'text-charcoal-600 hover:text-charcoal-800 hover:bg-charcoal-50'
                )}
                asChild
              >
                <Link href={resolveHref(action.href)}>
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Link>
              </Button>
            )
          }

          // Dialog and mutation actions use buttons
          return (
            <Button
              key={action.id}
              variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
              size="sm"
              className={cn(
                'w-full justify-start gap-2 h-9',
                action.variant !== 'destructive' &&
                  'text-charcoal-600 hover:text-charcoal-800 hover:bg-charcoal-50'
              )}
              onClick={() => handleAction(action)}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

