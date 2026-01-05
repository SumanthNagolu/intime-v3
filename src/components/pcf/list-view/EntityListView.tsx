'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ListViewConfig, ListViewVariant, ListTabConfig } from '@/configs/entities/types'
import { ListHeader } from './ListHeader'
import { ListStats } from './ListStats'
import { ListFilters } from './ListFilters'
import { ListTable } from './ListTable'
import { ListCards } from './ListCards'
import { ListPagination } from './ListPagination'
import { DraftsSection } from './DraftsSection'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { WizardState } from '@/hooks/use-entity-draft'

interface EntityListViewProps<T> {
  config: ListViewConfig<T>
  initialData?: { items: T[]; total: number }
  variant?: ListViewVariant
  className?: string
}

/**
 * TabContent - Renders content for a single tab
 */
function TabContent<T extends Record<string, unknown>>({
  tab,
  config,
  filterValues,
  currentPage,
  pageSize,
  sortBy,
  sortOrder,
  onPageChange,
  effectiveFilters,
  updateFilters,
}: {
  tab: ListTabConfig<T>
  config: ListViewConfig<T>
  filterValues: Record<string, unknown>
  currentPage: number
  pageSize: number
  sortBy: string | undefined
  sortOrder: 'asc' | 'desc'
  onPageChange: (page: number) => void
  effectiveFilters: typeof config.filters
  updateFilters: (key: string, value: unknown) => void
}) {
  // Use tab's query hook
  const tabQuery = tab.useQuery({
    ...filterValues,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    sortBy,
    sortOrder,
  })

  const items = tabQuery.data?.items || []
  const total = tabQuery.data?.total || 0
  const totalPages = Math.ceil(total / pageSize)
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = Math.min(currentPage * pageSize, total)

  // Use tab's columns/cardRenderer or fall back to config's
  const columns = tab.columns ?? config.columns
  const cardRenderer = tab.cardRenderer ?? config.cardRenderer
  const emptyState = tab.emptyState ?? config.emptyState
  const showFilters = tab.showFilters !== false

  // If tab has a custom component, render it
  if (tab.customComponent) {
    const CustomComponent = tab.customComponent
    return (
      <CustomComponent
        items={items}
        isLoading={tabQuery.isLoading}
        filters={filterValues}
      />
    )
  }

  return (
    <>
      {/* Filters (if enabled for this tab) */}
      {showFilters && effectiveFilters && effectiveFilters.length > 0 && (
        <ListFilters
          filters={effectiveFilters}
          values={filterValues}
          onChange={updateFilters}
        />
      )}

      {/* Content */}
      {tabQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState config={emptyState} filters={filterValues} />
      ) : config.renderMode === 'table' && columns ? (
        <ListTable
          items={items}
          columns={columns}
          baseRoute={config.baseRoute}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
        />
      ) : (
        <ListCards
          items={items}
          baseRoute={config.baseRoute}
          titleField={columns?.[0]?.key as keyof T || 'name' as keyof T}
          statusField={config.statusField as keyof T}
          statusConfig={config.statusConfig}
          cardRenderer={cardRenderer}
        />
      )}

      {/* Pagination */}
      {!tabQuery.isLoading && items.length > 0 && (
        <ListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />
      )}
    </>
  )
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

  // Tab from URL (when using tabs mode)
  const activeTab = searchParams.get('tab') || config.defaultTab || config.tabs?.[0]?.id || ''

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

  // Handle tab change
  const handleTabChange = useCallback((tabId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (tabId === config.tabs?.[0]?.id) {
        params.delete('tab')
      } else {
        params.set('tab', tabId)
      }
      // Reset to page 1 when tab changes
      params.delete('page')
      router.replace(`?${params.toString()}`)
    })
  }, [router, searchParams, config.tabs])

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      router.replace(`?${params.toString()}`)
    })
  }, [router, searchParams])

  // Data fetching via config hook (ONE database call pattern)
  // Only used when NOT in tabs mode
  const listQuery = config.tabs ? { data: undefined, isLoading: false } : config.useListQuery({
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

  // Drafts query (if drafts are enabled in config AND not using tabs)
  const draftsQuery = config.drafts?.enabled && !config.tabs ? config.drafts.useGetMyDraftsQuery() : null
  const deleteDraftMutation = config.drafts?.useDeleteDraftMutation?.()

  const handleDeleteDraft = useCallback(async (id: string) => {
    if (deleteDraftMutation) {
      await deleteDraftMutation.mutateAsync({ id })
    }
  }, [deleteDraftMutation])

  // Calculate pagination (for non-tabs mode)
  const items = listQuery.data?.items || initialData?.items || []
  const total = listQuery.data?.total || initialData?.total || 0
  const totalPages = Math.ceil(total / effectivePageSize)
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1
  const showingTo = Math.min(currentPage * effectivePageSize, total)

  // ============================================
  // TABS MODE RENDERING
  // ============================================
  if (config.tabs && config.tabs.length > 0) {
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="mb-4">
            {config.tabs.map((tab) => {
              const count = tab.getCount?.()
              return (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                  {count !== undefined && (
                    <span className="ml-1.5 text-xs bg-charcoal-200 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {config.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <TabContent
                tab={tab}
                config={config}
                filterValues={filterValues}
                currentPage={currentPage}
                pageSize={effectivePageSize}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onPageChange={handlePageChange}
                effectiveFilters={effectiveFilters}
                updateFilters={updateFilters}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  // ============================================
  // STANDARD MODE RENDERING (no tabs)
  // ============================================
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
