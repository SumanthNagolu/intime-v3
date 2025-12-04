"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { LucideIcon } from "lucide-react"

interface ActivityItem {
  id: string
  icon: LucideIcon
  iconColor?: string
  title: string
  description?: string
  timestamp: Date
  link?: string
}

interface ActivityFeedWidgetProps {
  title?: string
  activities: ActivityItem[]
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

export function ActivityFeedWidget({
  title = "Recent Activity",
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className,
}: ActivityFeedWidgetProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div className={cn(
      "bg-white rounded-xl border border-charcoal-100 shadow-elevation-sm",
      className
    )}>
      <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
        <h3 className="text-h4 text-charcoal-900">{title}</h3>
        {showViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-forest-600 hover:text-forest-700 font-medium transition-colors"
          >
            View all
          </button>
        )}
      </div>

      <div className="divide-y divide-charcoal-50">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 hover:bg-charcoal-50/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                activity.iconColor || "bg-forest-50"
              )}>
                <activity.icon className={cn(
                  "h-4 w-4",
                  activity.iconColor ? "text-white" : "text-forest-600"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-900 truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-charcoal-500 truncate mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-charcoal-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-charcoal-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
