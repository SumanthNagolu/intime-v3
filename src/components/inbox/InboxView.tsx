'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Inbox,
  LayoutList,
  MoreHorizontal,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useInboxStore } from '@/stores/inbox-store'
import { InboxItem, type InboxItemData } from './InboxItem'
import { InboxFilters, InboxFilterBar } from './InboxFilters'
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns'

// ============================================
// Types
// ============================================

interface InboxViewProps {
  className?: string
}

type GroupedItems = {
  label: string
  items: InboxItemData[]
  isOverdue?: boolean
}[]

// ============================================
// Helper Functions
// ============================================

function groupItemsByDueDate(items: InboxItemData[]): GroupedItems {
  const groups: Record<string, InboxItemData[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    later: [],
    no_date: [],
  }

  const today = startOfDay(new Date())

  items.forEach((item) => {
    if (!item.dueAt) {
      groups.no_date.push(item)
    } else {
      const dueDate = new Date(item.dueAt)
      if (isPast(dueDate) && !isToday(dueDate)) {
        groups.overdue.push(item)
      } else if (isToday(dueDate)) {
        groups.today.push(item)
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.push(item)
      } else {
        groups.later.push(item)
      }
    }
  })

  const result: GroupedItems = []

  if (groups.overdue.length > 0) {
    result.push({ label: 'Overdue', items: groups.overdue, isOverdue: true })
  }
  if (groups.today.length > 0) {
    result.push({ label: 'Today', items: groups.today })
  }
  if (groups.tomorrow.length > 0) {
    result.push({ label: 'Tomorrow', items: groups.tomorrow })
  }
  if (groups.later.length > 0) {
    result.push({ label: 'Later', items: groups.later })
  }
  if (groups.no_date.length > 0) {
    result.push({ label: 'No Due Date', items: groups.no_date })
  }

  return result
}

function groupItemsByType(items: InboxItemData[]): GroupedItems {
  const groups: Record<string, InboxItemData[]> = {}

  items.forEach((item) => {
    const type = item.itemType
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(item)
  })

  const typeLabels: Record<string, string> = {
    task: 'Tasks',
    follow_up: 'Follow-ups',
    approval: 'Approvals',
    alert: 'Alerts',
    mention: 'Mentions',
    assignment: 'Assignments',
  }

  return Object.entries(groups).map(([type, items]) => ({
    label: typeLabels[type] || type,
    items,
  }))
}

function groupItemsByPriority(items: InboxItemData[]): GroupedItems {
  const groups: Record<string, InboxItemData[]> = {
    urgent: [],
    high: [],
    normal: [],
    low: [],
  }

  items.forEach((item) => {
    groups[item.priority].push(item)
  })

  const result: GroupedItems = []

  if (groups.urgent.length > 0) {
    result.push({ label: 'Urgent', items: groups.urgent })
  }
  if (groups.high.length > 0) {
    result.push({ label: 'High Priority', items: groups.high })
  }
  if (groups.normal.length > 0) {
    result.push({ label: 'Normal', items: groups.normal })
  }
  if (groups.low.length > 0) {
    result.push({ label: 'Low Priority', items: groups.low })
  }

  return result
}

// ============================================
// Sub-components
// ============================================

function InboxHeader({
  total,
  isLoading,
  onRefresh,
}: {
  total: number
  isLoading: boolean
  onRefresh: () => void
}) {
  const { filters, setSearch } = useInboxStore()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-charcoal-100">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-charcoal-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-charcoal-900">Inbox</h1>
            <p className="text-xs text-charcoal-500">{total} items</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inbox..."
              className={cn(
                'h-9 pl-9 pr-8 w-56 rounded-lg border border-charcoal-200',
                'text-sm placeholder:text-charcoal-400',
                'focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500',
                'transition-all duration-200'
              )}
            />
            {filters.search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors',
              isLoading && 'animate-spin'
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* More options */}
          <button className="p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

function InboxGroupHeader({
  label,
  count,
  isOverdue,
}: {
  label: string
  count: number
  isOverdue?: boolean
}) {
  return (
    <div
      className={cn(
        'sticky top-14 z-[5] flex items-center gap-2 px-4 py-2 bg-charcoal-50 border-b border-charcoal-100',
        isOverdue && 'bg-error-50'
      )}
    >
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-wider',
          isOverdue ? 'text-error-700' : 'text-charcoal-600'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'px-1.5 py-0.5 text-xs font-medium rounded',
          isOverdue ? 'bg-error-200 text-error-800' : 'bg-charcoal-200 text-charcoal-700'
        )}
      >
        {count}
      </span>
    </div>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const { clearFilters } = useInboxStore()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-charcoal-400" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-1">
        {hasFilters ? 'No matching items' : 'All caught up!'}
      </h3>
      <p className="text-sm text-charcoal-500 text-center max-w-xs mb-4">
        {hasFilters
          ? 'Try adjusting your filters to see more items.'
          : 'You have no pending items in your inbox. Nice work!'}
      </p>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          Clear filters
        </button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-600 rounded-full animate-spin" />
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function InboxView({ className }: InboxViewProps) {
  const router = useRouter()
  const {
    filters,
    preferences,
    selection,
    filtersOpen,
    selectItem,
    clearSelection,
  } = useInboxStore()

  // Build query input from filters
  const queryInput = useMemo(
    () => ({
      status: filters.status,
      type: filters.types.length > 0 ? filters.types : undefined,
      priority: filters.priorities.length > 0 ? filters.priorities : undefined,
      dueBy: filters.dueBy,
      search: filters.search || undefined,
      sortBy: preferences.sortBy,
      sortOrder: preferences.sortOrder,
      limit: 100,
    }),
    [filters, preferences.sortBy, preferences.sortOrder]
  )

  // Fetch inbox items
  const {
    data: inboxData,
    isLoading,
    refetch,
  } = trpc.inbox.list.useQuery(queryInput, {
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch counts for badges
  const { data: countsData } = trpc.inbox.counts.useQuery()

  // Mutations
  const completeMutation = trpc.inbox.complete.useMutation({
    onSuccess: () => refetch(),
  })

  const dismissMutation = trpc.inbox.dismiss.useMutation({
    onSuccess: () => refetch(),
  })

  // Group items based on preference
  const groupedItems = useMemo(() => {
    const items = (inboxData?.items ?? []) as InboxItemData[]

    if (preferences.groupBy === 'none') {
      return [{ label: 'All Items', items }]
    }

    switch (preferences.groupBy) {
      case 'due_date':
        return groupItemsByDueDate(items)
      case 'type':
        return groupItemsByType(items)
      case 'priority':
        return groupItemsByPriority(items)
      default:
        return [{ label: 'All Items', items }]
    }
  }, [inboxData?.items, preferences.groupBy])

  // Check if we have active filters
  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.priorities.length > 0 ||
    filters.dueBy !== 'all' ||
    filters.search !== ''

  // Handle complete
  const handleComplete = useCallback(
    (id: string) => {
      completeMutation.mutate({ id })
    },
    [completeMutation]
  )

  // Handle dismiss
  const handleDismiss = useCallback(
    (id: string) => {
      dismissMutation.mutate({ id })
    },
    [dismissMutation]
  )

  // Handle item click
  const handleItemClick = useCallback(
    (item: InboxItemData) => {
      selectItem(item.id)
    },
    [selectItem]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!inboxData?.items) return

      const items = inboxData.items as InboxItemData[]
      const currentIndex = items.findIndex((i) => i.id === selection.selectedId)

      switch (e.key) {
        case 'j':
          // Move down
          e.preventDefault()
          if (currentIndex < items.length - 1) {
            selectItem(items[currentIndex + 1].id)
          } else if (currentIndex === -1 && items.length > 0) {
            selectItem(items[0].id)
          }
          break
        case 'k':
          // Move up
          e.preventDefault()
          if (currentIndex > 0) {
            selectItem(items[currentIndex - 1].id)
          }
          break
        case 'Enter':
          // Open selected item
          if (selection.selectedId) {
            const item = items.find((i) => i.id === selection.selectedId)
            if (item) {
              const basePath = getEntityBasePath(item.entityType)
              if (basePath) {
                router.push(`${basePath}/${item.entityId}`)
              }
            }
          }
          break
        case 'c':
          // Complete selected item
          if (selection.selectedId && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            handleComplete(selection.selectedId)
          }
          break
        case 'Escape':
          clearSelection()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inboxData?.items, selection.selectedId, selectItem, clearSelection, handleComplete, router])

  return (
    <div className={cn('flex flex-col h-full bg-cream', className)}>
      {/* Header */}
      <InboxHeader
        total={inboxData?.total ?? 0}
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />

      {/* Filter bar */}
      <InboxFilterBar
        counts={{
          overdue: countsData?.overdue,
          dueToday: countsData?.dueToday,
          urgent: countsData?.urgent,
        }}
      />

      {/* Expanded filters */}
      {filtersOpen && <InboxFilters />}

      {/* Items list */}
      <main className="flex-1 overflow-auto">
        {isLoading ? (
          <LoadingState />
        ) : inboxData?.items.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="pb-8">
            {groupedItems.map((group) => (
              <div key={group.label}>
                <InboxGroupHeader
                  label={group.label}
                  count={group.items.length}
                  isOverdue={group.isOverdue}
                />
                {group.items.map((item) => (
                  <InboxItem
                    key={item.id}
                    item={item}
                    isSelected={selection.selectedId === item.id}
                    isCompact={preferences.compactMode}
                    onSelect={() => handleItemClick(item)}
                    onComplete={() => handleComplete(item.id)}
                    onDismiss={() => handleDismiss(item.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with keyboard hints */}
      <footer className="flex-shrink-0 px-4 py-2 bg-white border-t border-charcoal-100 flex items-center gap-4 text-xs text-charcoal-500">
        <span>
          <kbd className="px-1.5 py-0.5 bg-charcoal-100 rounded text-[10px] font-mono">j</kbd>
          <span className="mx-1">/</span>
          <kbd className="px-1.5 py-0.5 bg-charcoal-100 rounded text-[10px] font-mono">k</kbd>
          <span className="ml-1.5">navigate</span>
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-charcoal-100 rounded text-[10px] font-mono">Enter</kbd>
          <span className="ml-1.5">open</span>
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-charcoal-100 rounded text-[10px] font-mono">c</kbd>
          <span className="ml-1.5">complete</span>
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-charcoal-100 rounded text-[10px] font-mono">⌘K</kbd>
          <span className="ml-1.5">commands</span>
        </span>
      </footer>
    </div>
  )
}

// ============================================
// Helper Functions
// ============================================

function getEntityBasePath(entityType: string): string | null {
  const paths: Record<string, string> = {
    job: '/employee/ats/jobs',
    candidate: '/employee/ats/candidates',
    submission: '/employee/ats/submissions',
    interview: '/employee/ats/interviews',
    placement: '/employee/ats/placements',
    account: '/employee/crm/accounts',
    contact: '/employee/crm/contacts',
    deal: '/employee/crm/deals',
    lead: '/employee/crm/leads',
    campaign: '/employee/crm/campaigns',
    activity: '/employee/activities',
  }

  return paths[entityType] ?? null
}

export default InboxView
