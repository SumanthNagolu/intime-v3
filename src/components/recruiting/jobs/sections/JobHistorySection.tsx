'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  History,
  Loader2,
  FileEdit,
  UserPlus,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Send,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

// Helper to safely parse and validate dates
function safeParseDate(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue) return null
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue
  return isValid(date) ? date : null
}

// Helper to safely format dates
function safeFormatDate(dateValue: string | Date | null | undefined, formatStr: string): string {
  const date = safeParseDate(dateValue)
  if (!date) return 'Unknown date'
  return format(date, formatStr)
}

function safeFormatDistanceToNow(dateValue: string | Date | null | undefined): string {
  const date = safeParseDate(dateValue)
  if (!date) return 'Unknown time'
  return formatDistanceToNow(date, { addSuffix: true })
}

interface JobHistorySectionProps {
  jobId: string
}

// Map activity types to icons and colors
const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  status_change: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  created: { icon: FileEdit, color: 'text-green-600', bg: 'bg-green-100' },
  updated: { icon: FileEdit, color: 'text-amber-600', bg: 'bg-amber-100' },
  published: { icon: Send, color: 'text-purple-600', bg: 'bg-purple-100' },
  closed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  filled: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  on_hold: { icon: Pause, color: 'text-amber-600', bg: 'bg-amber-100' },
  reopened: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-100' },
  team_added: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
  interview_scheduled: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  offer_extended: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  default: { icon: History, color: 'text-charcoal-600', bg: 'bg-charcoal-100' },
}

export function JobHistorySection({ jobId }: JobHistorySectionProps) {
  // Query activities for this job
  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
    limit: 50,
  })

  // Get job data for additional history context
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  const activities = activitiesQuery.data?.items || []

  // Build history entries from activities and job data
  const historyEntries = [
    // Add creation event if we have job data
    ...(job?.created_at
      ? [
          {
            id: 'created',
            type: 'created',
            description: 'Job requisition created',
            timestamp: job.created_at,
            user: job.owner || null,
          },
        ]
      : []),
    // Add published event if job was published
    ...(job?.published_at
      ? [
          {
            id: 'published',
            type: 'published',
            description: 'Job published and opened for sourcing',
            timestamp: job.published_at,
            user: null,
          },
        ]
      : []),
    // Add closed event if job was closed
    ...(job?.closed_at
      ? [
          {
            id: 'closed',
            type: job.status === 'filled' ? 'filled' : 'closed',
            description:
              job.status === 'filled'
                ? `Job filled - ${job.closure_reason || 'All positions filled'}`
                : `Job closed - ${job.closure_reason || 'No reason provided'}`,
            timestamp: job.closed_at,
            user: null,
            note: job.closure_note,
          },
        ]
      : []),
    // Map activities to history entries
    ...activities.map((activity: any) => ({
      id: activity.id,
      type: activity.activity_type || 'default',
      description: activity.subject || activity.description || 'Activity logged',
      timestamp: activity.created_at,
      user: activity.creator || null,
      note: activity.description,
    })),
  ]
    .filter((entry) => safeParseDate(entry.timestamp) !== null)
    .sort((a, b) => {
      const dateA = safeParseDate(a.timestamp)
      const dateB = safeParseDate(b.timestamp)
      if (!dateA || !dateB) return 0
      return dateB.getTime() - dateA.getTime()
    })

  const getConfig = (type: string) => activityConfig[type] || activityConfig.default

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          History
        </CardTitle>
        <CardDescription>
          Complete audit trail of all changes and activities for this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activitiesQuery.isLoading || jobQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : historyEntries.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No history entries yet</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Changes and activities will appear here
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-charcoal-200" />

            <div className="space-y-6">
              {historyEntries.map((entry, index) => {
                const config = getConfig(entry.type)
                const Icon = config.icon

                return (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                        config.bg
                      )}
                    >
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-charcoal-900">
                            {entry.description}
                          </p>
                          {entry.note && (
                            <p className="text-sm text-charcoal-600 mt-1">{entry.note}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {entry.user && (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={entry.user.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {entry.user.full_name?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-charcoal-500">
                                  {entry.user.full_name}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-charcoal-400">
                              {safeFormatDistanceToNow(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {safeFormatDate(entry.timestamp, 'MMM d, yyyy')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

