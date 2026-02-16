'use client'

import { memo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from 'date-fns'

// ============================================
// Types
// ============================================

export interface InboxItemData {
  id: string
  itemType: 'task' | 'follow_up' | 'approval' | 'alert' | 'mention' | 'assignment'
  entityType: string
  entityId: string
  title: string
  subtitle?: string | null
  description?: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueAt?: string | null
  snoozedUntil?: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed' | 'snoozed'
  startedAt?: string | null
  completedAt?: string | null
  availableActions?: Array<{ id: string; label: string; type?: string }>
  metadata?: Record<string, unknown>
  context?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  isOverdue?: boolean
  isSnoozed?: boolean
}

interface InboxItemProps {
  item: InboxItemData
  isSelected?: boolean
  isCompact?: boolean
  onSelect?: () => void
  onClick?: () => void
  onComplete?: () => void
  onDismiss?: () => void
  onSnooze?: (until: Date) => void
  onAction?: (actionId: string) => void
}

// ============================================
// Helper Components
// ============================================

const TypeIcon = memo(function TypeIcon({
  type,
  className,
}: {
  type: InboxItemData['itemType']
  className?: string
}) {
  const iconProps = { className: cn('w-4 h-4', className) }

  switch (type) {
    case 'task':
      return <CheckCircle2 {...iconProps} />
    case 'follow_up':
      return <Phone {...iconProps} />
    case 'approval':
      return <AlertCircle {...iconProps} />
    case 'alert':
      return <Bell {...iconProps} />
    case 'mention':
      return <MessageSquare {...iconProps} />
    case 'assignment':
      return <User {...iconProps} />
    default:
      return <CheckCircle2 {...iconProps} />
  }
})

const PriorityDot = memo(function PriorityDot({
  priority,
  className,
}: {
  priority: InboxItemData['priority']
  className?: string
}) {
  const colorClasses = {
    urgent: 'bg-error-500',
    high: 'bg-amber-500',
    normal: 'bg-charcoal-400',
    low: 'bg-charcoal-300',
  }

  return (
    <span
      className={cn(
        'w-2 h-2 rounded-full flex-shrink-0',
        colorClasses[priority],
        className
      )}
    />
  )
})

const DueDateBadge = memo(function DueDateBadge({
  dueAt,
  isOverdue,
  className,
}: {
  dueAt: string
  isOverdue?: boolean
  className?: string
}) {
  const dueDate = new Date(dueAt)

  let label: string
  let colorClass: string

  if (isOverdue || isPast(dueDate)) {
    label = formatDistanceToNow(dueDate, { addSuffix: true })
    colorClass = 'text-error-600 bg-error-50 border-error-200'
  } else if (isToday(dueDate)) {
    label = `Today ${format(dueDate, 'h:mm a')}`
    colorClass = 'text-amber-600 bg-amber-50 border-amber-200'
  } else if (isTomorrow(dueDate)) {
    label = `Tomorrow ${format(dueDate, 'h:mm a')}`
    colorClass = 'text-blue-600 bg-blue-50 border-blue-200'
  } else {
    label = format(dueDate, 'MMM d')
    colorClass = 'text-charcoal-600 bg-charcoal-50 border-charcoal-200'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border',
        colorClass,
        className
      )}
    >
      <Clock className="w-3 h-3" />
      {label}
    </span>
  )
})

const EntityBadge = memo(function EntityBadge({
  entityType,
  className,
}: {
  entityType: string
  className?: string
}) {
  const label = entityType.replace(/_/g, ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        'text-charcoal-500 bg-charcoal-100 rounded',
        className
      )}
    >
      {label}
    </span>
  )
})

// ============================================
// Main Component
// ============================================

export const InboxItem = memo(function InboxItem({
  item,
  isSelected = false,
  isCompact = false,
  onSelect,
  onClick,
  onComplete,
  onDismiss,
  onSnooze,
  onAction,
}: InboxItemProps) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    } else {
      // Navigate to entity
      const basePath = getEntityBasePath(item.entityType)
      if (basePath) {
        router.push(`${basePath}/${item.entityId}`)
      }
    }
    onSelect?.()
  }, [onClick, onSelect, router, item.entityType, item.entityId])

  const handleActionClick = useCallback(
    (e: React.MouseEvent, actionId: string) => {
      e.stopPropagation()
      onAction?.(actionId)
    },
    [onAction]
  )

  const handleComplete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onComplete?.()
    },
    [onComplete]
  )

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDismiss?.()
    },
    [onDismiss]
  )

  const isCompleted = item.status === 'completed'
  const isDismissed = item.status === 'dismissed'
  const isInactive = isCompleted || isDismissed

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3',
        'border-b border-charcoal-100 last:border-b-0',
        'cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-gold-50/50'
          : 'hover:bg-charcoal-50',
        isInactive && 'opacity-60',
        isCompact && 'py-2'
      )}
    >
      {/* Type Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          'bg-charcoal-100 group-hover:bg-charcoal-200 transition-colors',
          item.priority === 'urgent' && 'bg-error-100',
          item.priority === 'high' && 'bg-amber-100'
        )}
      >
        <TypeIcon
          type={item.itemType}
          className={cn(
            'text-charcoal-500',
            item.priority === 'urgent' && 'text-error-600',
            item.priority === 'high' && 'text-amber-600'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-0.5">
          <PriorityDot priority={item.priority} />
          <h3
            className={cn(
              'text-sm font-medium text-charcoal-900 truncate',
              isInactive && 'line-through'
            )}
          >
            {item.title}
          </h3>
        </div>

        {/* Subtitle / Description */}
        {!isCompact && item.subtitle && (
          <p className="text-sm text-charcoal-600 truncate mb-1.5">
            {item.subtitle}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <EntityBadge entityType={item.entityType} />
          {item.dueAt && (
            <DueDateBadge dueAt={item.dueAt} isOverdue={item.isOverdue} />
          )}
          {item.isSnoozed && item.snoozedUntil && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded">
              <Clock className="w-3 h-3" />
              Snoozed until {format(new Date(item.snoozedUntil), 'MMM d')}
            </span>
          )}
        </div>

        {/* Quick Actions (shown on hover or when selected) */}
        {!isCompact && item.availableActions && item.availableActions.length > 0 && (
          <div
            className={cn(
              'flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
              isSelected && 'opacity-100'
            )}
          >
            {item.availableActions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                onClick={(e) => handleActionClick(e, action.id)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors',
                  action.type === 'primary'
                    ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                    : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                )}
              >
                {action.id === 'call' && <Phone className="w-3 h-3" />}
                {action.id === 'email' && <Mail className="w-3 h-3" />}
                {action.id === 'schedule' && <Calendar className="w-3 h-3" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Complete button */}
        {onComplete && !isInactive && (
          <button
            onClick={handleComplete}
            className={cn(
              'p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all',
              'text-charcoal-400 hover:text-success-600 hover:bg-success-50'
            )}
            title="Mark complete"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}

        {/* More menu */}
        <button
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all',
            'text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100'
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Chevron */}
        <ChevronRight
          className={cn(
            'w-4 h-4 text-charcoal-300 opacity-0 group-hover:opacity-100 transition-all',
            'group-hover:translate-x-0.5'
          )}
        />
      </div>
    </div>
  )
})

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

export default InboxItem
