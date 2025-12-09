'use client'

import { useState, useMemo } from 'react'
import { LibraryHeader } from './LibraryHeader'
import { LibraryGrid } from './LibraryGrid'
import { LibraryCard } from './LibraryCard'
import { LibraryPreview } from './LibraryPreview'
import { LibraryViewSkeleton } from './LibraryViewSkeleton'
import { cn } from '@/lib/utils'
import type { LibraryViewConfig, LibraryItemConfig } from './types'

interface LibraryViewProps<T extends LibraryItemConfig> {
  config: LibraryViewConfig<T>
  className?: string
}

export function LibraryView<T extends LibraryItemConfig>({
  config,
  className,
}: LibraryViewProps<T>) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({})
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(config.displayMode || 'grid')
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  // Query with filters
  const filters = useMemo(
    () => ({ search, ...filterValues }),
    [search, filterValues]
  )
  const { data, isLoading, error } = config.useQuery(filters)

  // Normalize data
  const items = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if ('items' in data) return data.items
    return []
  }, [data])

  const handleFilterChange = (filterId: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }))
  }

  if (isLoading) {
    return <LibraryViewSkeleton columns={config.gridColumns} />
  }

  return (
    <div className={cn('min-h-full bg-cream', className)}>
      <div className="flex">
        {/* Main Content */}
        <div className={cn('flex-1 p-6 space-y-6', config.enablePreview && selectedItem && 'mr-96')}>
          <LibraryHeader
            title={config.title}
            description={config.description}
            breadcrumbs={config.breadcrumbs}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={config.searchPlaceholder}
            filters={config.filters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            createAction={config.createAction}
          />

          {/* Items Grid/List */}
          {items.length === 0 && config.emptyState ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {config.emptyState.icon && (
                <div className="p-4 bg-charcoal-100 rounded-full mb-4">
                  <config.emptyState.icon className="w-8 h-8 text-charcoal-400" />
                </div>
              )}
              <h3 className="text-lg font-medium text-charcoal-900">
                {config.emptyState.title}
              </h3>
              {config.emptyState.description && (
                <p className="text-sm text-charcoal-500 mt-1 max-w-sm">
                  {config.emptyState.description}
                </p>
              )}
            </div>
          ) : (
            <LibraryGrid columns={config.gridColumns}>
              {items.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  showThumbnail={config.showThumbnails}
                  onClick={() => {
                    if (config.enablePreview) {
                      setSelectedItem(item)
                    }
                    config.onSelect?.(item)
                  }}
                  onUse={() => config.onUse?.(item)}
                  onEdit={() => config.onEdit?.(item)}
                  onDelete={() => config.onDelete?.(item)}
                  onDuplicate={() => config.onDuplicate?.(item)}
                  onFavorite={(isFav) => config.onFavorite?.(item, isFav)}
                />
              ))}
            </LibraryGrid>
          )}
        </div>

        {/* Preview Panel */}
        {config.enablePreview && selectedItem && (
          <LibraryPreview
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUse={() => config.onUse?.(selectedItem)}
            onEdit={() => config.onEdit?.(selectedItem)}
            onDelete={() => config.onDelete?.(selectedItem)}
            onDuplicate={() => config.onDuplicate?.(selectedItem)}
            renderContent={config.renderPreview as any}
            className="fixed right-0 top-0 h-full z-40"
          />
        )}
      </div>
    </div>
  )
}

export { LibraryHeader } from './LibraryHeader'
export { LibraryGrid } from './LibraryGrid'
export { LibraryCard } from './LibraryCard'
export { LibraryPreview } from './LibraryPreview'

