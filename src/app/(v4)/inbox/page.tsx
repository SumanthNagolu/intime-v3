'use client'

/**
 * Inbox Page - Work Queue
 *
 * Not a dashboard with charts. A prioritized list of things needing attention.
 * Connected to real tRPC data with full keyboard navigation.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Inbox,
  Loader2,
  MoreHorizontal,
  Send,
  User,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Inbox, type V4InboxItem } from '@/lib/v4/hooks/useV4Data'
import { useV4ActivityMutations } from '@/lib/v4/hooks/useV4Mutations'

// ============================================
// Components
// ============================================

function PriorityBadge({ priority }: { priority: V4InboxItem['priority'] }) {
  const colors = {
    urgent: 'bg-red-500/15 text-red-400',
    high: 'bg-orange-500/15 text-orange-400',
    medium: 'bg-amber-500/15 text-amber-400',
    low: 'bg-neutral-500/15 text-neutral-400',
  }

  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', colors[priority])}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

function TypeIcon({ type }: { type: V4InboxItem['type'] }) {
  const icons = {
    activity: Clock,
    submission: Send,
    interview: Calendar,
    follow_up: Clock,
    approval: AlertCircle,
  }
  const Icon = icons[type] || Clock
  return <Icon className="w-4 h-4" />
}

function WorkItemCard({
  item,
  isSelected,
  onSelect,
  onComplete,
  isCompleting,
}: {
  item: V4InboxItem
  isSelected: boolean
  onSelect: () => void
  onComplete: () => void
  isCompleting: boolean
}) {
  const router = useRouter()

  const getEntityHref = () => {
    switch (item.entityType) {
      case 'job':
        return `/jobs?id=${item.entityId}`
      case 'candidate':
        return `/candidates?id=${item.entityId}`
      case 'account':
        return `/accounts?id=${item.entityId}`
      case 'submission':
        return `/jobs?submissionId=${item.entityId}`
      default:
        return '#'
    }
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex items-start gap-4 px-4 py-4 rounded-lg cursor-pointer',
        'border border-transparent transition-all duration-150',
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/30'
          : 'hover:bg-neutral-800/50 hover:border-neutral-700',
        item.isCompleted && 'opacity-60'
      )}
    >
      {/* Checkbox / Status */}
      <div className="pt-0.5">
        {item.isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onComplete()
            }}
            disabled={isCompleting}
            className={cn(
              'w-5 h-5 rounded border-2 border-neutral-600 hover:border-indigo-500 transition-colors',
              isCompleting && 'opacity-50'
            )}
          >
            {isCompleting && <Loader2 className="w-3 h-3 animate-spin mx-auto" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <TypeIcon type={item.type} />
          <span className="text-xs font-medium text-neutral-500 uppercase">
            {item.type.replace('_', ' ')}
          </span>
          {item.dueDate && (
            <span
              className={cn(
                'text-xs font-medium',
                item.isOverdue ? 'text-red-400' : 'text-neutral-500'
              )}
            >
              Due {item.dueDate}
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-neutral-100 mb-0.5">
          {item.title}
        </h3>
        <p className="text-sm text-neutral-400 mb-2">
          {item.description}
        </p>

        {/* Entity link */}
        <Link
          href={getEntityHref()}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:underline"
        >
          <User className="w-3.5 h-3.5" />
          {item.entityName}
        </Link>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={item.priority} />
        </div>
        <span className="text-xs text-neutral-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  count,
  isCollapsible = false,
  isOpen = true,
  onToggle,
}: {
  title: string
  count?: number
  isCollapsible?: boolean
  isOpen?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 px-4 py-3 w-full text-left',
        isCollapsible && 'hover:bg-neutral-800/50 rounded-lg'
      )}
      onClick={isCollapsible ? onToggle : undefined}
      disabled={!isCollapsible}
    >
      {isCollapsible && (
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-500 transition-transform',
            !isOpen && '-rotate-90'
          )}
        />
      )}
      <span className="text-sm font-semibold text-neutral-100">{title}</span>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
          {count}
        </span>
      )}
    </button>
  )
}

// ============================================
// Main Component
// ============================================

export default function InboxPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Data fetching
  const { items, isLoading, error, refetch } = useV4Inbox()
  const { completeActivity } = useV4ActivityMutations()

  // Filter items
  const pendingItems = useMemo(() => items.filter(item => !item.isCompleted), [items])
  const completedItems = useMemo(() => items.filter(item => item.isCompleted), [items])

  // Group by priority
  const highPriority = useMemo(() =>
    pendingItems.filter(item => item.priority === 'urgent' || item.priority === 'high'),
    [pendingItems]
  )
  const mediumPriority = useMemo(() =>
    pendingItems.filter(item => item.priority === 'medium'),
    [pendingItems]
  )
  const lowPriority = useMemo(() =>
    pendingItems.filter(item => item.priority === 'low'),
    [pendingItems]
  )

  // All visible items for navigation
  const visibleItems = useMemo(() => {
    if (filter === 'completed') return completedItems
    if (filter === 'pending') return pendingItems
    return [...pendingItems, ...(showCompleted ? completedItems : [])]
  }, [filter, pendingItems, completedItems, showCompleted])

  // Handle complete
  const handleComplete = useCallback(async (item: V4InboxItem) => {
    if (item.type !== 'activity') return // Only activities can be completed via this
    setCompletingId(item.id)
    try {
      await completeActivity({ id: item.id })
      refetch()
    } finally {
      setCompletingId(null)
    }
  }, [completeActivity, refetch])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, visibleItems.length - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Escape':
          setSelectedIndex(-1)
          break
        case ' ':
          e.preventDefault()
          const selectedItem = visibleItems[selectedIndex]
          if (selectedItem && !selectedItem.isCompleted) {
            handleComplete(selectedItem)
          }
          break
        case 'Enter':
          e.preventDefault()
          const item = visibleItems[selectedIndex]
          if (item) {
            // Navigate to entity
            switch (item.entityType) {
              case 'job':
                router.push(`/jobs?id=${item.entityId}`)
                break
              case 'candidate':
                router.push(`/candidates?id=${item.entityId}`)
                break
              case 'account':
                router.push(`/accounts?id=${item.entityId}`)
                break
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visibleItems, selectedIndex, handleComplete, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-950">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white font-medium">Error loading inbox</p>
        <p className="text-sm text-neutral-500 mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-neutral-800">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-neutral-400" />
            </div>
            <h1 className="text-lg font-semibold text-white">Inbox</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
              {pendingItems.length} pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 px-6 pb-3">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === f
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-white'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="py-2">
          {/* High Priority */}
          {(filter === 'all' || filter === 'pending') && highPriority.length > 0 && (
            <section className="mb-4">
              <SectionHeader title="High Priority" count={highPriority.length} />
              <div className="px-2 space-y-1">
                {highPriority.map((item, index) => {
                  const globalIndex = visibleItems.indexOf(item)
                  return (
                    <WorkItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === globalIndex}
                      onSelect={() => setSelectedIndex(globalIndex)}
                      onComplete={() => handleComplete(item)}
                      isCompleting={completingId === item.id}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* Medium Priority */}
          {(filter === 'all' || filter === 'pending') && mediumPriority.length > 0 && (
            <section className="mb-4">
              <SectionHeader title="Medium Priority" count={mediumPriority.length} />
              <div className="px-2 space-y-1">
                {mediumPriority.map((item) => {
                  const globalIndex = visibleItems.indexOf(item)
                  return (
                    <WorkItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === globalIndex}
                      onSelect={() => setSelectedIndex(globalIndex)}
                      onComplete={() => handleComplete(item)}
                      isCompleting={completingId === item.id}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* Low Priority */}
          {(filter === 'all' || filter === 'pending') && lowPriority.length > 0 && (
            <section className="mb-4">
              <SectionHeader title="Low Priority" count={lowPriority.length} />
              <div className="px-2 space-y-1">
                {lowPriority.map((item) => {
                  const globalIndex = visibleItems.indexOf(item)
                  return (
                    <WorkItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === globalIndex}
                      onSelect={() => setSelectedIndex(globalIndex)}
                      onComplete={() => handleComplete(item)}
                      isCompleting={completingId === item.id}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {(filter === 'all' || filter === 'completed') && completedItems.length > 0 && (
            <section className="mb-4">
              <SectionHeader
                title="Completed"
                count={completedItems.length}
                isCollapsible={filter === 'all'}
                isOpen={showCompleted}
                onToggle={() => setShowCompleted(!showCompleted)}
              />
              {(filter === 'completed' || showCompleted) && (
                <div className="px-2 space-y-1">
                  {completedItems.map((item) => {
                    const globalIndex = visibleItems.indexOf(item)
                    return (
                      <WorkItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedIndex === globalIndex}
                        onSelect={() => setSelectedIndex(globalIndex)}
                        onComplete={() => {}}
                        isCompleting={false}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Empty state */}
          {pendingItems.length === 0 && filter !== 'completed' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">
                All caught up!
              </h3>
              <p className="text-sm text-neutral-500">
                No pending items. Great work!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer with keyboard hints */}
      <footer className="flex-shrink-0 px-6 py-2 border-t border-neutral-800">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">J</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">K</kbd> Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Enter</kbd> Open
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Space</kbd> Mark complete
          </span>
        </div>
      </footer>
    </div>
  )
}
