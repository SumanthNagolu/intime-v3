'use client'

import { memo } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useInboxStore,
  type InboxItemType,
  type InboxPriority,
  type InboxDueFilter,
} from '@/stores/inbox-store'

// ============================================
// Types
// ============================================

interface InboxFiltersProps {
  className?: string
}

// ============================================
// Filter Chip Components
// ============================================

const TypeFilterChip = memo(function TypeFilterChip({
  type,
  isActive,
  onClick,
}: {
  type: InboxItemType
  isActive: boolean
  onClick: () => void
}) {
  const config: Record<InboxItemType, { icon: typeof CheckCircle2; label: string }> = {
    task: { icon: CheckCircle2, label: 'Tasks' },
    follow_up: { icon: Phone, label: 'Follow-ups' },
    approval: { icon: AlertCircle, label: 'Approvals' },
    alert: { icon: Bell, label: 'Alerts' },
    mention: { icon: MessageSquare, label: 'Mentions' },
    assignment: { icon: User, label: 'Assignments' },
  }

  const { icon: Icon, label } = config[type]

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
        isActive
          ? 'bg-charcoal-900 text-white'
          : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  )
})

const PriorityFilterChip = memo(function PriorityFilterChip({
  priority,
  isActive,
  onClick,
}: {
  priority: InboxPriority
  isActive: boolean
  onClick: () => void
}) {
  const config: Record<InboxPriority, { color: string; label: string }> = {
    urgent: { color: 'bg-error-500', label: 'Urgent' },
    high: { color: 'bg-amber-500', label: 'High' },
    normal: { color: 'bg-charcoal-400', label: 'Normal' },
    low: { color: 'bg-charcoal-300', label: 'Low' },
  }

  const { color, label } = config[priority]

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
        isActive
          ? 'bg-charcoal-900 text-white'
          : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-white' : color)} />
      {label}
    </button>
  )
})

const DueFilterChip = memo(function DueFilterChip({
  filter,
  isActive,
  onClick,
  count,
}: {
  filter: InboxDueFilter
  isActive: boolean
  onClick: () => void
  count?: number
}) {
  const labels: Record<InboxDueFilter, string> = {
    overdue: 'Overdue',
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    all: 'All',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
        isActive
          ? 'bg-charcoal-900 text-white'
          : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200',
        filter === 'overdue' && count && count > 0 && !isActive && 'bg-error-100 text-error-700 hover:bg-error-200'
      )}
    >
      <Clock className="w-3 h-3" />
      {labels[filter]}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'ml-0.5 px-1.5 py-0 text-[10px] rounded-full',
            isActive ? 'bg-white/20' : 'bg-charcoal-200'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
})

// ============================================
// Main Component
// ============================================

export const InboxFilters = memo(function InboxFilters({ className }: InboxFiltersProps) {
  const {
    filters,
    toggleTypeFilter,
    togglePriorityFilter,
    setFilter,
    clearFilters,
  } = useInboxStore()

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.priorities.length > 0 ||
    filters.dueBy !== 'all'

  const allTypes: InboxItemType[] = ['task', 'follow_up', 'approval', 'alert', 'mention', 'assignment']
  const allPriorities: InboxPriority[] = ['urgent', 'high', 'normal', 'low']
  const allDueFilters: InboxDueFilter[] = ['overdue', 'today', 'this_week', 'this_month', 'all']

  return (
    <div
      className={cn(
        'bg-charcoal-50/50 border-b border-charcoal-100 px-4 py-3',
        className
      )}
    >
      {/* Filter sections */}
      <div className="space-y-3">
        {/* Due date filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider w-16">
            Due
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allDueFilters.map((filter) => (
              <DueFilterChip
                key={filter}
                filter={filter}
                isActive={filters.dueBy === filter}
                onClick={() => setFilter('dueBy', filter)}
              />
            ))}
          </div>
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider w-16">
            Type
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allTypes.map((type) => (
              <TypeFilterChip
                key={type}
                type={type}
                isActive={filters.types.includes(type)}
                onClick={() => toggleTypeFilter(type)}
              />
            ))}
          </div>
        </div>

        {/* Priority filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider w-16">
            Priority
          </span>
          <div className="flex flex-wrap gap-1.5">
            {allPriorities.map((priority) => (
              <PriorityFilterChip
                key={priority}
                priority={priority}
                isActive={filters.priorities.includes(priority)}
                onClick={() => togglePriorityFilter(priority)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="mt-3 pt-2 border-t border-charcoal-200">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
})

// ============================================
// Compact Filter Bar (inline)
// ============================================

export const InboxFilterBar = memo(function InboxFilterBar({
  className,
  counts,
}: {
  className?: string
  counts?: { overdue?: number; dueToday?: number; urgent?: number }
}) {
  const { filters, filtersOpen, toggleFiltersOpen, setFilter } = useInboxStore()

  const activeFilterCount =
    filters.types.length +
    filters.priorities.length +
    (filters.dueBy !== 'all' ? 1 : 0)

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 border-b border-charcoal-100',
        className
      )}
    >
      {/* Filter toggle button */}
      <button
        onClick={toggleFiltersOpen}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
          filtersOpen
            ? 'bg-charcoal-900 text-white'
            : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
        )}
      >
        <Filter className="w-3.5 h-3.5" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Quick due date filters */}
      <div className="flex items-center gap-1.5 ml-2">
        {counts?.overdue && counts.overdue > 0 && (
          <button
            onClick={() => setFilter('dueBy', filters.dueBy === 'overdue' ? 'all' : 'overdue')}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              filters.dueBy === 'overdue'
                ? 'bg-error-600 text-white'
                : 'bg-error-50 text-error-700 hover:bg-error-100'
            )}
          >
            <AlertCircle className="w-3 h-3" />
            {counts.overdue} Overdue
          </button>
        )}
        {counts?.dueToday && counts.dueToday > 0 && (
          <button
            onClick={() => setFilter('dueBy', filters.dueBy === 'today' ? 'all' : 'today')}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              filters.dueBy === 'today'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            )}
          >
            <Clock className="w-3 h-3" />
            {counts.dueToday} Today
          </button>
        )}
        {counts?.urgent && counts.urgent > 0 && (
          <button
            onClick={() => {
              if (filters.priorities.includes('urgent')) {
                setFilter('priorities', filters.priorities.filter((p) => p !== 'urgent'))
              } else {
                setFilter('priorities', [...filters.priorities, 'urgent'])
              }
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors',
              filters.priorities.includes('urgent')
                ? 'bg-error-600 text-white'
                : 'bg-error-50 text-error-700 hover:bg-error-100'
            )}
          >
            <Bell className="w-3 h-3" />
            {counts.urgent} Urgent
          </button>
        )}
      </div>
    </div>
  )
})

export default InboxFilters
