'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuickActionConfig } from '@/configs/entities/types'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionBarProps<T> {
  entity: T
  quickActions?: QuickActionConfig[]
  dropdownActions?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick?: (entity: T) => void
    href?: string
    separator?: boolean
    variant?: 'default' | 'destructive'
  }>
  isLoading?: boolean
}

export function QuickActionBar<T>({
  entity,
  quickActions = [],
  dropdownActions = [],
  isLoading = false,
}: QuickActionBarProps<T>) {
  const visibleActions = quickActions.filter(
    (action) => !action.isVisible || action.isVisible(entity)
  )

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action) => {
        const Icon = action.icon
        const disabled = action.isDisabled?.(entity) || isLoading

        return (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            onClick={() => action.onClick(entity)}
            disabled={disabled}
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )
      })}

      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {dropdownActions.map((action, index) => {
              if (action.separator) {
                return <DropdownMenuSeparator key={`sep-${index}`} />
              }

              const Icon = action.icon
              return (
                <DropdownMenuItem
                  key={action.label}
                  onClick={() => action.onClick?.(entity)}
                  className={cn(action.variant === 'destructive' && 'text-red-600')}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
