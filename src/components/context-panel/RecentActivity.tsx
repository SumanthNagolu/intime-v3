'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

// ============================================
// Types
// ============================================

export interface ActivityEntry {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'status_change' | 'document'
  title: string
  description?: string
  timestamp: string
  user?: {
    id: string
    name: string
    avatarUrl?: string
  }
  metadata?: Record<string, unknown>
}

interface RecentActivityProps {
  activities: ActivityEntry[]
  entityId?: string
  entityType?: string
  isLoading?: boolean
  maxItems?: number
  className?: string
}

// ============================================
// Helper Components
// ============================================

const ActivityIcon = memo(function ActivityIcon({
  type,
  className,
}: {
  type: ActivityEntry['type']
  className?: string
}) {
  const iconProps = { className: cn('w-4 h-4', className) }

  switch (type) {
    case 'email':
      return <Mail {...iconProps} />
    case 'call':
      return <Phone {...iconProps} />
    case 'meeting':
      return <Calendar {...iconProps} />
    case 'note':
      return <MessageSquare {...iconProps} />
    case 'task':
      return <CheckCircle2 {...iconProps} />
    case 'status_change':
      return <Activity {...iconProps} />
    case 'document':
      return <FileText {...iconProps} />
    default:
      return <Activity {...iconProps} />
  }
})

const activityTypeColors: Record<ActivityEntry['type'], string> = {
  email: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  note: 'bg-amber-100 text-amber-600',
  task: 'bg-charcoal-100 text-charcoal-600',
  status_change: 'bg-pink-100 text-pink-600',
  document: 'bg-orange-100 text-orange-600',
}

const ActivityItem = memo(function ActivityItem({
  activity,
  isLast,
}: {
  activity: ActivityEntry
  isLast: boolean
}) {
  return (
    <div className="relative flex gap-3">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-px bg-charcoal-200" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          activityTypeColors[activity.type]
        )}
      >
        <ActivityIcon type={activity.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal-900 line-clamp-1">
              {activity.title}
            </p>
            {activity.description && (
              <p className="text-xs text-charcoal-500 line-clamp-2 mt-0.5">
                {activity.description}
              </p>
            )}
          </div>
          <span className="text-[10px] text-charcoal-400 whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>

        {/* User */}
        {activity.user && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-4 h-4 rounded-full bg-charcoal-200 flex items-center justify-center">
              {activity.user.avatarUrl ? (
                <img
                  src={activity.user.avatarUrl}
                  alt={activity.user.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="text-[8px] font-medium text-charcoal-600">
                  {activity.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-charcoal-500">{activity.user.name}</span>
          </div>
        )}
      </div>
    </div>
  )
})

// ============================================
// Main Component
// ============================================

export const RecentActivity = memo(function RecentActivity({
  activities,
  entityId,
  entityType,
  isLoading = false,
  maxItems = 5,
  className,
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems)
  const hasMore = activities.length > maxItems

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="px-4">
          <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
            Recent Activity
          </h4>
        </div>
        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-charcoal-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-charcoal-200 rounded w-3/4" />
                <div className="h-3 bg-charcoal-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="px-4">
          <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
            Recent Activity
          </h4>
        </div>
        <div className="px-4 py-6 text-center">
          <Activity className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="px-4">
        <h4 className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
          Recent Activity
        </h4>
      </div>

      <div className="px-4">
        {displayedActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            isLast={index === displayedActivities.length - 1}
          />
        ))}
      </div>

      {/* View all link */}
      {hasMore && entityId && entityType && (
        <div className="px-4 pb-2">
          <Link
            href={`${getEntityBasePath(entityType)}/${entityId}?section=history`}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              'text-charcoal-500 hover:text-charcoal-700 transition-colors'
            )}
          >
            View all activity
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
})

// ============================================
// Helper Functions
// ============================================

function getEntityBasePath(entityType: string): string {
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

  return paths[entityType] ?? '/employee'
}

export default RecentActivity
