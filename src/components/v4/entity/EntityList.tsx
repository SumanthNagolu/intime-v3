'use client'

/**
 * EntityList - Unified entity list view component
 *
 * This is the single component that renders list views for ALL entity types.
 * It uses the entity schema to determine columns, filters, and actions.
 */

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EntitySchema, EntityData, ColumnDefinition } from '@/lib/entity/schema'
import { getStatusConfig } from '@/lib/entity/schema'

// ============================================
// Types
// ============================================

interface EntityListProps {
  schema: EntitySchema
  entities: EntityData[]
  isLoading?: boolean
  className?: string
  onCreateNew?: () => void
}

interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

interface FilterState {
  [key: string]: string | string[] | boolean | undefined
}

// ============================================
// Sub-components
// ============================================

function ListHeader({
  schema,
  searchQuery,
  onSearchChange,
  filtersOpen,
  onToggleFilters,
  onCreateNew,
}: {
  schema: EntitySchema
  searchQuery: string
  onSearchChange: (query: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  onCreateNew?: () => void
}) {
  const Icon = schema.icon

  return (
    <header className="sticky top-0 z-10 bg-[var(--linear-bg)] border-b border-[var(--linear-border-subtle)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--linear-surface-hover)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--linear-text-secondary)]" />
          </div>
          <h1 className="text-lg font-semibold text-[var(--linear-text-primary)]">
            {schema.label.plural}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--linear-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${schema.label.plural.toLowerCase()}...`}
              className="linear-input pl-9 pr-4 w-64"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={onToggleFilters}
            className={cn(
              'linear-btn linear-btn-ghost',
              filtersOpen && 'bg-[var(--linear-accent-muted)] text-[var(--linear-accent)]'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {/* Create new */}
          {onCreateNew && (
            <button onClick={onCreateNew} className="linear-btn linear-btn-primary">
              <Plus className="w-4 h-4" />
              <span>New {schema.label.singular}</span>
              <kbd className="linear-kbd ml-2">C</kbd>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="px-4 pb-2 flex items-center gap-4 text-xs text-[var(--linear-text-muted)]">
        <span>
          <kbd className="linear-kbd">J</kbd> / <kbd className="linear-kbd">K</kbd> Navigate
        </span>
        <span>
          <kbd className="linear-kbd">Enter</kbd> Open
        </span>
        <span>
          <kbd className="linear-kbd">Cmd+K</kbd> Command palette
        </span>
      </div>
    </header>
  )
}

function FilterBar({
  schema,
  filters,
  onFilterChange,
  onClearFilters,
}: {
  schema: EntitySchema
  filters: FilterState
  onFilterChange: (key: string, value: string | string[] | boolean | undefined) => void
  onClearFilters: () => void
}) {
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  )

  return (
    <div className="px-4 py-3 bg-[var(--linear-bg-secondary)] border-b border-[var(--linear-border-subtle)]">
      <div className="flex flex-wrap items-center gap-3">
        {schema.list.filters.map((filter) => {
          if (filter.type === 'select' || filter.type === 'multiselect') {
            return (
              <div key={filter.key} className="flex items-center gap-2">
                <label className="text-xs text-[var(--linear-text-muted)]">
                  {filter.label}
                </label>
                <select
                  value={(filters[filter.key] as string) || ''}
                  onChange={(e) =>
                    onFilterChange(
                      filter.key,
                      e.target.value || undefined
                    )
                  }
                  className="linear-input py-1.5 px-2 text-sm min-w-[120px]"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }
          return null
        })}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

function TableHeader({
  columns,
  sort,
  onSort,
}: {
  columns: ColumnDefinition[]
  sort: SortState | null
  onSort: (key: string) => void
}) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={cn(
              'text-left px-4 py-3 text-xs font-medium text-[var(--linear-text-muted)] border-b border-[var(--linear-border)]',
              column.sortable && 'cursor-pointer hover:text-[var(--linear-text-primary)] select-none'
            )}
            style={{ width: column.width }}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="flex items-center gap-1">
              {column.header}
              {column.sortable && sort?.key === column.key && (
                sort.direction === 'asc' ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

function TableRow({
  entity,
  columns,
  schema,
  isSelected,
  onSelect,
  onClick,
}: {
  entity: EntityData
  columns: ColumnDefinition[]
  schema: EntitySchema
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
}) {
  return (
    <tr
      className={cn(
        'cursor-pointer transition-colors',
        isSelected
          ? 'bg-[var(--linear-accent-muted)]'
          : 'hover:bg-[var(--linear-surface-hover)]'
      )}
      onClick={onClick}
    >
      {columns.map((column) => {
        // Get value (support nested keys)
        const keys = column.key.split('.')
        let value: unknown = entity
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key]
        }

        // Format based on column type
        let displayValue: React.ReactNode = '—'
        if (value !== null && value !== undefined) {
          switch (column.format) {
            case 'status': {
              const statusConfig = getStatusConfig(schema, value as string)
              if (statusConfig) {
                displayValue = (
                  <span className={cn('linear-badge', `linear-badge-${statusConfig.color}`)}>
                    <span className="linear-badge-dot" />
                    {statusConfig.label}
                  </span>
                )
              } else {
                displayValue = String(value)
              }
              break
            }
            case 'currency':
              displayValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(Number(value))
              break
            case 'date':
              displayValue = new Date(value as string).toLocaleDateString()
              break
            case 'avatar':
              displayValue = (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--linear-surface-hover)] flex items-center justify-center text-xs font-medium text-[var(--linear-text-secondary)]">
                    {String(value).charAt(0).toUpperCase()}
                  </div>
                  <span>{String(value)}</span>
                </div>
              )
              break
            default:
              displayValue = String(value)
          }
        }

        // Custom render function takes precedence
        if (column.render) {
          displayValue = column.render(value, entity)
        }

        return (
          <td
            key={column.key}
            className="px-4 py-3 text-sm text-[var(--linear-text-primary)] border-b border-[var(--linear-border-subtle)]"
          >
            {displayValue}
          </td>
        )
      })}
    </tr>
  )
}

function EmptyState({
  schema,
  hasFilters,
  onCreateNew,
}: {
  schema: EntitySchema
  hasFilters: boolean
  onCreateNew?: () => void
}) {
  const Icon = schema.icon

  return (
    <div className="linear-empty-state py-16">
      <div className="w-12 h-12 rounded-full bg-[var(--linear-surface-hover)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--linear-text-muted)]" />
      </div>
      <div className="title">
        {hasFilters ? `No ${schema.label.plural.toLowerCase()} found` : `No ${schema.label.plural.toLowerCase()} yet`}
      </div>
      <div className="description">
        {hasFilters
          ? 'Try adjusting your filters or search terms.'
          : `Create your first ${schema.label.singular.toLowerCase()} to get started.`}
      </div>
      {!hasFilters && onCreateNew && (
        <button onClick={onCreateNew} className="linear-btn linear-btn-primary mt-4">
          <Plus className="w-4 h-4" />
          <span>New {schema.label.singular}</span>
        </button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-[var(--linear-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EntityList({
  schema,
  entities,
  isLoading = false,
  className,
  onCreateNew,
}: EntityListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState<SortState | null>(
    schema.list.defaultSort || null
  )
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  // Filter and sort entities
  const filteredEntities = useMemo(() => {
    let result = [...entities]

    // Apply search
    if (searchQuery && schema.list.searchableFields) {
      const query = searchQuery.toLowerCase()
      result = result.filter((entity) =>
        schema.list.searchableFields!.some((field) => {
          const keys = field.split('.')
          let value: unknown = entity
          for (const key of keys) {
            value = (value as Record<string, unknown>)?.[key]
          }
          return value && String(value).toLowerCase().includes(query)
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue === undefined || filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return
      }
      result = result.filter((entity) => {
        const keys = key.split('.')
        let value: unknown = entity
        for (const k of keys) {
          value = (value as Record<string, unknown>)?.[k]
        }
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value as string)
        }
        return value === filterValue
      })
    })

    // Apply sort
    if (sort) {
      result.sort((a, b) => {
        const keys = sort.key.split('.')
        let aVal: unknown = a
        let bVal: unknown = b
        for (const key of keys) {
          aVal = (aVal as Record<string, unknown>)?.[key]
          bVal = (bVal as Record<string, unknown>)?.[key]
        }
        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        const comparison = aVal < bVal ? -1 : 1
        return sort.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [entities, searchQuery, filters, sort, schema.list.searchableFields])

  const handleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | boolean | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const handleRowClick = useCallback(
    (entity: EntityData) => {
      router.push(`${schema.basePath}/${entity.id}`)
    },
    [router, schema.basePath]
  )

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  )

  return (
    <div className={cn('linear-page flex flex-col h-full', className)}>
      <ListHeader
        schema={schema}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        onCreateNew={onCreateNew}
      />

      {filtersOpen && (
        <FilterBar
          schema={schema}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <main className="flex-1 overflow-auto linear-scrollbar">
        {isLoading ? (
          <LoadingState />
        ) : filteredEntities.length === 0 ? (
          <EmptyState
            schema={schema}
            hasFilters={hasActiveFilters || !!searchQuery}
            onCreateNew={onCreateNew}
          />
        ) : (
          <table className="linear-table">
            <TableHeader
              columns={schema.list.columns}
              sort={sort}
              onSort={handleSort}
            />
            <tbody>
              {filteredEntities.map((entity, index) => (
                <TableRow
                  key={entity.id}
                  entity={entity}
                  columns={schema.list.columns}
                  schema={schema}
                  isSelected={selectedIndex === index}
                  onSelect={() => setSelectedIndex(index)}
                  onClick={() => handleRowClick(entity)}
                />
              ))}
            </tbody>
          </table>
        )}
      </main>

      {/* Footer with count */}
      <footer className="px-4 py-2 border-t border-[var(--linear-border-subtle)] text-xs text-[var(--linear-text-muted)]">
        {filteredEntities.length} of {entities.length} {schema.label.plural.toLowerCase()}
        {(hasActiveFilters || searchQuery) && ' (filtered)'}
      </footer>
    </div>
  )
}

export default EntityList
