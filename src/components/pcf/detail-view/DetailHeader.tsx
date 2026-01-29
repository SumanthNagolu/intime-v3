'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusConfig, QuickActionConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface SubtitleField<T> {
  key: keyof T
  icon?: React.ComponentType<{ className?: string }>
  format?: (value: unknown, entity?: unknown) => string
}

interface DropdownAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: (entity: T) => void
  href?: string
  separator?: boolean
  variant?: 'default' | 'destructive'
  isVisible?: (entity: T) => boolean
}

interface DetailHeaderProps<T> {
  entity: T
  titleField: keyof T
  subtitleFields?: SubtitleField<T>[]
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  breadcrumbs?: Array<{ label: string; href: string }>
  quickActions?: QuickActionConfig[]
  dropdownActions?: DropdownAction<T>[]
  isLoading?: boolean
}

export function DetailHeader<T extends Record<string, unknown>>({
  entity,
  titleField,
  subtitleFields = [],
  statusField,
  statusConfig,
  breadcrumbs = [],
  quickActions = [],
  dropdownActions = [],
  isLoading = false,
}: DetailHeaderProps<T>) {
  const title = entity[titleField] as string
  const status = statusField ? (entity[statusField] as string) : undefined
  const statusInfo = status && statusConfig ? statusConfig[status] : undefined

  const visibleActions = quickActions.filter(
    (action) => !action.isVisible || action.isVisible(entity)
  )

  return (
    <div className="px-6 py-5 bg-white">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs removed - sidebar provides navigation context */}
          {false && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-3">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1.5">
                  <Link
                    href={crumb.href}
                    className="text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-charcoal-300">/</span>
                  )}
                </div>
              ))}
              <span className="text-charcoal-300">/</span>
              <span className="text-sm text-charcoal-700 font-medium truncate max-w-[250px]">
                {title}
              </span>
            </nav>
          )}

          {/* Title + Status Badge */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-heading font-bold text-charcoal-900 tracking-tight leading-tight">
              {title}
            </h1>
            {statusInfo && (
              <Badge
                className={cn(
                  'gap-1.5 font-semibold text-xs px-3 py-1 rounded-full shadow-sm',
                  statusInfo.bgColor || statusInfo.color
                )}
              >
                {statusInfo.icon && <statusInfo.icon className="w-3.5 h-3.5" />}
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Meta Info Row */}
          {subtitleFields.length > 0 && (
            <div className="flex items-center gap-5 mt-3 flex-wrap">
              {subtitleFields.map((field) => {
                const value = entity[field.key]
                if (!value) return null

                const Icon = field.icon
                const displayValue = field.format
                  ? field.format(value, entity)
                  : value instanceof Date
                    ? format(value, 'MMM d, yyyy')
                    : String(value)

                return (
                  <span
                    key={String(field.key)}
                    className="flex items-center gap-2 text-sm text-charcoal-600"
                  >
                    {Icon && (
                      <span className="p-1 bg-charcoal-100 rounded">
                        <Icon className="w-3.5 h-3.5 text-charcoal-500" />
                      </span>
                    )}
                    <span className="font-medium">{displayValue}</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {visibleActions.map((action) => {
            const Icon = action.icon
            const disabled = action.isDisabled?.(entity) || isLoading
            const isPrimary = action.variant === 'default'

            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                onClick={() => action.onClick(entity)}
                disabled={disabled}
                className={cn(
                  'font-medium shadow-sm',
                  isPrimary && 'shadow-md hover:shadow-lg transition-shadow'
                )}
              >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            )
          })}

          {/* Dropdown Menu */}
          {dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 shadow-lg">
                {dropdownActions.map((action, index) => {
                  // Filter by isVisible
                  if (action.isVisible && !action.isVisible(entity)) {
                    return null
                  }

                  if (action.separator) {
                    return <DropdownMenuSeparator key={`sep-${index}`} />
                  }

                  const Icon = action.icon
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={() => action.onClick?.(entity)}
                      className={cn(
                        'font-medium cursor-pointer',
                        action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                      )}
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
      </div>
    </div>
  )
}
