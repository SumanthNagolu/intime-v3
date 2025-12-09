'use client'

import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ColumnConfig, RowAction, EmptyStateConfig } from '@/configs/entities/types'

interface WorkspaceTableProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  rowActions?: RowAction<T>[]
  onRowClick?: (item: T) => void
  getRowHref?: (item: T) => string
  emptyState?: EmptyStateConfig
  isLoading?: boolean
  className?: string
}

export function WorkspaceTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowActions,
  onRowClick,
  getRowHref,
  emptyState,
  isLoading,
  className,
}: WorkspaceTableProps<T>) {
  if (isLoading) {
    return <WorkspaceTableSkeleton columns={columns.length} />
  }

  if (data.length === 0 && emptyState) {
    const EmptyIcon = emptyState.icon
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {EmptyIcon && (
          <div className="p-3 bg-charcoal-100 rounded-full mb-3">
            <EmptyIcon className="w-6 h-6 text-charcoal-400" />
          </div>
        )}
        <h3 className="text-sm font-medium text-charcoal-900">{emptyState.title}</h3>
        <p className="text-sm text-charcoal-500 mt-1 max-w-sm">
          {typeof emptyState.description === 'function'
            ? emptyState.description({})
            : emptyState.description}
        </p>
        {emptyState.action && (
          <Button
            variant="outline"
            size="sm"
            onClick={emptyState.action.onClick}
            className="mt-4"
          >
            {emptyState.action.label}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-charcoal-200 overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-charcoal-50/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'text-xs font-medium text-charcoal-600 uppercase tracking-wider',
                  col.width && `w-[${col.width}]`,
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header || col.label || col.key}
              </TableHead>
            ))}
            {rowActions && rowActions.length > 0 && (
              <TableHead className="w-[50px]" />
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => {
            const rowContent = (
              <>
                {columns.map((col) => {
                  const value = item[col.key]
                  let displayValue: React.ReactNode

                  if (col.render) {
                    displayValue = col.render(value, item)
                  } else if (col.format === 'date' && value) {
                    displayValue = format(new Date(value as string), 'MMM d, yyyy')
                  } else if (col.format === 'relative-date' && value) {
                    displayValue = formatDistanceToNow(new Date(value as string), {
                      addSuffix: true,
                    })
                  } else if (col.format === 'currency' && value !== undefined) {
                    displayValue = `$${Number(value).toLocaleString()}`
                  } else if (col.format === 'number' && value !== undefined) {
                    displayValue = Number(value).toLocaleString()
                  } else {
                    displayValue = value as React.ReactNode
                  }

                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        'text-sm',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {displayValue ?? '—'}
                    </TableCell>
                  )
                })}
                {rowActions && rowActions.length > 0 && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {rowActions
                          .filter((action) => !action.condition || action.condition(item))
                          .map((action) => {
                            const ActionIcon = action.icon
                            return (
                              <DropdownMenuItem
                                key={action.key}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick(item)
                                }}
                                className={cn(
                                  action.variant === 'destructive' && 'text-red-600'
                                )}
                              >
                                {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                                {action.label}
                              </DropdownMenuItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </>
            )

            const href = getRowHref?.(item)

            if (href) {
              return (
                <TableRow
                  key={rowIndex}
                  className="cursor-pointer hover:bg-charcoal-50/50 transition-colors"
                >
                  <Link href={href} className="contents">
                    {rowContent}
                  </Link>
                </TableRow>
              )
            }

            return (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-charcoal-50/50'
                )}
              >
                {rowContent}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function WorkspaceTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="rounded-lg border border-charcoal-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-charcoal-50/50">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

