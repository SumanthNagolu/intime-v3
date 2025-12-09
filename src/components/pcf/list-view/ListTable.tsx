'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ColumnConfig, StatusConfig } from '@/configs/entities/types'
import { StatusBadge } from '@/components/pcf/shared/StatusBadge'
import { cn } from '@/lib/utils'

interface ListTableProps<T> {
  items: T[]
  columns: ColumnConfig<T>[]
  idField?: keyof T
  baseRoute: string
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  onRowClick?: (item: T) => void
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function ListTable<T extends Record<string, unknown>>({
  items,
  columns,
  idField = 'id' as keyof T,
  baseRoute,
  statusField: _statusField, // Available for row-level status styling
  statusConfig,
  onRowClick,
  onSort,
}: ListTableProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current sort state from URL
  const currentSortBy = searchParams.get('sortBy') || ''
  const currentSortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item)
    } else {
      router.push(`${baseRoute}/${item[idField]}`)
    }
  }

  const handleSort = (columnKey: string) => {
    if (onSort) {
      // Toggle sort order if same column, otherwise default to desc
      const newOrder = currentSortBy === columnKey && currentSortOrder === 'desc' ? 'asc' : 'desc'
      onSort(columnKey, newOrder)
    } else {
      // Update URL params directly
      const params = new URLSearchParams(searchParams.toString())
      const newOrder = currentSortBy === columnKey && currentSortOrder === 'desc' ? 'asc' : 'desc'
      params.set('sortBy', columnKey)
      params.set('sortOrder', newOrder)
      params.delete('page') // Reset to page 1 when sorting
      router.replace(`?${params.toString()}`)
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (currentSortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-charcoal-400" />
    }
    return currentSortOrder === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-gold-600" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-gold-600" />
  }

  const formatCellValue = (item: T, column: ColumnConfig<T>) => {
    // Get nested value (e.g., "account.name")
    const keys = column.key.split('.')
    let value: unknown = item
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }

    // Custom render function takes priority
    if (column.render) {
      return column.render(value, item)
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-charcoal-400">—</span>
    }

    // Format based on column type
    switch (column.format) {
      case 'date':
        try {
          return format(new Date(String(value)), 'MMM d, yyyy')
        } catch {
          return String(value)
        }

      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }

      case 'currency':
        return `$${Number(value).toLocaleString()}`

      case 'number':
        return Number(value).toLocaleString()

      case 'status':
        if (statusConfig) {
          return <StatusBadge status={String(value)} config={statusConfig} size="sm" />
        }
        return String(value)

      default:
        return String(value)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                'font-semibold text-charcoal-700 text-xs uppercase tracking-wider',
                column.width,
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer select-none hover:bg-charcoal-100 transition-colors'
              )}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
            >
              <span className="flex items-center">
                {column.header || column.label}
                {column.sortable && getSortIcon(column.key)}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={String(item[idField])}
            className="cursor-pointer hover:bg-charcoal-50 transition-colors"
            onClick={() => handleRowClick(item)}
          >
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {formatCellValue(item, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
