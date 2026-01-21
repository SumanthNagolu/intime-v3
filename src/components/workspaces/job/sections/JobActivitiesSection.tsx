'use client'

import * as React from 'react'
import { Activity, Phone, Mail, Calendar, MessageSquare, FileText, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FullJob, ActivityItem } from '@/types/job'
import { formatDistanceToNow, format } from 'date-fns'

interface JobActivitiesSectionProps {
  job: FullJob
  onRefresh?: () => void
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
  document: FileText,
}

/**
 * JobActivitiesSection - Activity timeline for the job
 */
export function JobActivitiesSection({ job, onRefresh }: JobActivitiesSectionProps) {
  const activities = job.sections?.activities?.items || []

  // Group activities by date
  const groupedActivities = React.useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {}
    activities.forEach(activity => {
      const date = format(new Date(activity.created_at), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = []
      groups[date].push(activity)
    })
    return groups
  }, [activities])

  const sortedDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Activities</h3>
                <p className="text-xs text-charcoal-500">{activities.length} total activities</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Log Activity
            </Button>
          </div>
        </div>

        <div className="p-6">
          {activities.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No activities recorded</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(date => (
                <div key={date}>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-4">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <div className="space-y-4 relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-charcoal-200" />

                    {groupedActivities[date].map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.activity_type] || Activity

                      return (
                        <div key={activity.id} className="flex gap-4 relative">
                          <div className="w-8 h-8 rounded-full bg-charcoal-100 border-2 border-white flex items-center justify-center z-10">
                            <Icon className="h-4 w-4 text-charcoal-500" />
                          </div>
                          <div className="flex-1 min-w-0 pb-4">
                            <div className="rounded-lg border border-charcoal-200/60 bg-white p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-charcoal-900">
                                    {activity.subject || activity.activity_type?.replace(/_/g, ' ')}
                                  </p>
                                  {activity.description && (
                                    <p className="text-sm text-charcoal-600 mt-1 whitespace-pre-wrap">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary" className="flex-shrink-0 capitalize">
                                  {activity.activity_type?.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-3 text-xs text-charcoal-500">
                                {activity.creator && (
                                  <>
                                    <User className="h-3 w-3" />
                                    <span>{activity.creator.full_name}</span>
                                    <span>·</span>
                                  </>
                                )}
                                <span>{format(new Date(activity.created_at), 'h:mm a')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobActivitiesSection
