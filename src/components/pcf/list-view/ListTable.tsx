'use client'

import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
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
}

export function ListTable<T extends Record<string, unknown>>({
  items,
  columns,
  idField = 'id' as keyof T,
  baseRoute,
  statusField: _statusField, // Available for row-level status styling
  statusConfig,
  onRowClick,
}: ListTableProps<T>) {
  const router = useRouter()

  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item)
    } else {
      router.push(`${baseRoute}/${item[idField]}`)
    }
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
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(
                column.width,
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
            >
              {column.header}
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
