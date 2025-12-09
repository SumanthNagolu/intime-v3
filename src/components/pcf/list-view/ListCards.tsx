'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { StatusConfig } from '@/configs/entities/types'
import { StatusBadge } from '@/components/pcf/shared/StatusBadge'
// Keeping cn import for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from '@/lib/utils'

interface ListCardsProps<T> {
  items: T[]
  idField?: keyof T
  baseRoute: string
  titleField: keyof T
  subtitleField?: keyof T
  statusField?: keyof T
  statusConfig?: Record<string, StatusConfig>
  metaFields?: Array<{
    key: keyof T
    icon?: React.ComponentType<{ className?: string }>
    format?: 'date' | 'relative-date' | 'currency' | 'number'
  }>
  cardRenderer?: (item: T, onClick: () => void) => React.ReactNode
  onItemClick?: (item: T) => void
}

export function ListCards<T extends Record<string, unknown>>({
  items,
  idField = 'id' as keyof T,
  baseRoute,
  titleField,
  subtitleField,
  statusField,
  statusConfig,
  metaFields = [],
  cardRenderer,
  onItemClick,
}: ListCardsProps<T>) {
  const router = useRouter()

  const handleClick = (item: T) => {
    if (onItemClick) {
      onItemClick(item)
    } else {
      router.push(`${baseRoute}/${item[idField]}`)
    }
  }

  const formatMetaValue = (value: unknown, format?: string) => {
    if (value === null || value === undefined) return null

    switch (format) {
      case 'date':
        try {
          return new Date(String(value)).toLocaleDateString()
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
      default:
        return String(value)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        // Use custom renderer if provided
        if (cardRenderer) {
          return (
            <div key={String(item[idField])}>
              {cardRenderer(item, () => handleClick(item))}
            </div>
          )
        }

        // Default card rendering
        const status = statusField ? String(item[statusField]) : undefined

        return (
          <Card
            key={String(item[idField])}
            className="bg-white cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => handleClick(item)}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-charcoal-900 truncate">
                      {String(item[titleField] || '')}
                    </h3>
                    {status && statusConfig && (
                      <StatusBadge status={status} config={statusConfig} size="sm" />
                    )}
                  </div>

                  {/* Subtitle */}
                  {subtitleField && item[subtitleField] && (
                    <p className="text-sm text-charcoal-600 mb-2">
                      {String(item[subtitleField])}
                    </p>
                  )}

                  {/* Meta fields */}
                  {metaFields.length > 0 && (
                    <div className="flex items-center gap-4 text-sm text-charcoal-500">
                      {metaFields.map((meta, index) => {
                        const value = item[meta.key]
                        const formattedValue = formatMetaValue(value, meta.format)
                        if (!formattedValue) return null

                        const Icon = meta.icon
                        return (
                          <span key={index} className="flex items-center gap-1">
                            {Icon && <Icon className="w-4 h-4" />}
                            {formattedValue}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
