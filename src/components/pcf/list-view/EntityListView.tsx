'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListViewConfig, ListViewVariant } from '@/configs/entities/types'
import { ListHeader } from './ListHeader'
import { ListStats } from './ListStats'
import { ListFilters } from './ListFilters'
import { ListTable } from './ListTable'
import { ListCards } from './ListCards'
import { ListPagination } from './ListPagination'
import { DraftsSection } from './DraftsSection'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { cn } from '@/lib/utils'
import type { WizardState } from '@/hooks/use-entity-draft'

interface EntityListViewProps<T> {
  config: ListViewConfig<T>
  initialData?: { items: T[]; total: number }
  variant?: ListViewVariant
  className?: string
}

export function EntityListView<T extends Record<string, unknown>>({
  config,
  initialData,
  variant,
  className,
}: EntityListViewProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [_isPending, startTransition] = useTransition()

  // Apply variant overrides
  const effectiveTitle = variant?.title ?? config.title
  const effectiveDescription = variant?.description ?? config.description
  const effectivePageSize = variant?.pageSize ?? config.pageSize ?? 50
  const showStats = !variant?.hideStats && config.statsCards && config.statsCards.length > 0
  const showHeader = !variant?.hideHeader
  const showPrimaryAction = !variant?.hidePrimaryAction
  const compact = variant?.compact

  // Filter out hidden filters
  const effectiveFilters = variant?.hideFilters
    ? config.filters?.filter(f => !variant.hideFilters?.includes(f.key))
    : config.filters

  // Parse URL params for filters (including preset filters from variant)
  const getFilterValues = useCallback(() => {
    const values: Record<string, unknown> = {
      ...variant?.presetFilters,
    }
    config.filters?.forEach((filter) => {
      const paramValue = searchParams.get(filter.key)
      if (paramValue !== null) {
        if (filter.type === 'toggle') {
          values[filter.key] = paramValue === 'true'
        } else {
          values[filter.key] = paramValue
        }
      }
    })
    return values
  }, [config.filters, searchParams, variant?.presetFilters])

  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(getFilterValues)

  // Current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1')

  // Sort params from URL
  const sortBy = searchParams.get('sortBy') || undefined
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  // Update URL when filters change
  const updateFilters = useCallback((key: string, value: unknown) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === undefined || value === '' || value === 'all' || value === false) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }

      // Reset to page 1 when filters change
      params.delete('page')

      router.replace(`?${params.toString()}`)
    })

    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }, [router, searchParams])

  // Data fetching via config hook (ONE database call pattern)
  // Stats are now included in the listQuery response
  const listQuery = config.useListQuery({
    ...filterValues,
    limit: effectivePageSize,
    offset: (currentPage - 1) * effectivePageSize,
    sortBy,
    sortOrder,
  })

  // Use stats from combined query, fallback to separate statsQuery for backwards compatibility
  const statsQuery = config.useStatsQuery?.()
  const statsData = listQuery.data?.stats ?? statsQuery?.data
  const statsLoading = statsQuery ? statsQuery.isLoading : listQuery.isLoading

  // Drafts query (if drafts are enabled in config)
  const draftsQuery = config.drafts?.enabled ? config.drafts.useGetMyDraftsQuery() : null
  const deleteDraftMutation = config.drafts?.useDeleteDraftMutation?.()

  const handleDeleteDraft = useCallback(async (id: string) => {
    if (deleteDraftMutation) {
      await deleteDraftMutation.mutateAsync({ id })
    }
  }, [deleteDraftMutation])

  // Calculate pagination
  const items = listQuery.data?.items || initialData?.items || []
  const total = listQuery.data?.total || initialData?.total || 0
  const totalPages = Math.ceil(total / effectivePageSize)
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1
  const showingTo = Math.min(currentPage * effectivePageSize, total)

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className={cn('p-6', compact && 'p-4', className)}>
      {/* Header */}
      {showHeader && (
        <ListHeader
          title={effectiveTitle}
          description={effectiveDescription}
          icon={config.icon}
          primaryAction={showPrimaryAction ? config.primaryAction : undefined}
        />
      )}

      {/* Stats */}
      {showStats && (
        <ListStats
          stats={config.statsCards!}
          data={statsData}
          isLoading={statsLoading}
          gridCols={config.statsCards!.length <= 4 ? 4 : 5}
        />
      )}

      {/* Drafts Section - shown above filters when user has drafts */}
      {config.drafts?.enabled && draftsQuery && (
        <DraftsSection
          drafts={(draftsQuery.data ?? []) as Array<{ id: string; wizard_state?: WizardState | null; updated_at?: string; created_at?: string } & Record<string, unknown>>}
          isLoading={draftsQuery.isLoading}
          wizardRoute={config.drafts.wizardRoute}
          getDisplayName={(draft) => String(draft[config.drafts!.displayNameField as string] || 'Untitled')}
          onDelete={deleteDraftMutation ? handleDeleteDraft : undefined}
        />
      )}

      {/* Filters */}
      {effectiveFilters && effectiveFilters.length > 0 && (
        <ListFilters
          filters={effectiveFilters}
          values={filterValues}
          onChange={updateFilters}
        />
      )}

      {/* Content */}
      {listQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState config={config.emptyState} filters={filterValues} />
      ) : config.renderMode === 'table' && config.columns ? (
        <ListTable
          items={items}
          columns={config.columns}
          baseRoute={config.baseRoute}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
        />
      ) : (
        <ListCards
          items={items}
          baseRoute={config.baseRoute}
          titleField={config.columns?.[0]?.key as keyof T || 'name' as keyof T}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
          cardRenderer={config.cardRenderer}
        />
      )}

      {/* Pagination */}
      {!listQuery.isLoading && items.length > 0 && (
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={effectivePageSize}
          onPageChange={handlePageChange}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />
      )}
    </div>
  )
}
