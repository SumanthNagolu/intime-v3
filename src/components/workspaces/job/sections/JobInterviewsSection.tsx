'use client'

import * as React from 'react'
import { Calendar, User, Video, MapPin, Clock, ArrowRight, Plus, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FullJob, InterviewItem } from '@/types/job'
import { formatDistanceToNow, format, isPast, isFuture, isToday } from 'date-fns'
import Link from 'next/link'

interface JobInterviewsSectionProps {
  job: FullJob
  onRefresh?: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-forest-50', text: 'text-forest-700', dot: 'bg-forest-500' },
  completed: { label: 'Completed', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  no_show: { label: 'No Show', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  rescheduled: { label: 'Rescheduled', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
}

/**
 * JobInterviewsSection - List of all interviews for this job
 */
export function JobInterviewsSection({ job, onRefresh }: JobInterviewsSectionProps) {
  const interviews = job.sections?.interviews?.items || []
  const upcomingCount = job.sections?.interviews?.upcoming || 0

  // Separate upcoming and past interviews
  const { upcoming, past } = React.useMemo(() => {
    const now = new Date()
    const upcoming = interviews.filter(i => i.scheduled_at && new Date(i.scheduled_at) >= now)
    const past = interviews.filter(i => !i.scheduled_at || new Date(i.scheduled_at) < now)
    return { upcoming, past }
  }, [interviews])

  return (
    <div className="space-y-6">
      {/* Upcoming Interviews */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Upcoming Interviews</h3>
                <p className="text-xs text-charcoal-500">{upcomingCount} scheduled</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Schedule Interview
            </Button>
          </div>
        </div>

        <div className="divide-y divide-charcoal-100">
          {upcoming.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No upcoming interviews</p>
            </div>
          ) : (
            upcoming.map((interview) => (
              <InterviewRow key={interview.id} interview={interview} />
            ))
          )}
        </div>
      </div>

      {/* Past Interviews */}
      {past.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Past Interviews</h3>
                <p className="text-xs text-charcoal-500">{past.length} completed</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-charcoal-100">
            {past.slice(0, 10).map((interview) => (
              <InterviewRow key={interview.id} interview={interview} />
            ))}
            {past.length > 10 && (
              <div className="px-6 py-3 text-center">
                <Button variant="ghost" size="sm">
                  Show {past.length - 10} more
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InterviewRow({ interview }: { interview: InterviewItem }) {
  const statusConfig = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled
  const scheduledDate = interview.scheduled_at ? new Date(interview.scheduled_at) : null

  const timeLabel = React.useMemo(() => {
    if (!scheduledDate) return null
    if (isToday(scheduledDate)) return 'Today'
    if (isFuture(scheduledDate)) return format(scheduledDate, 'MMM d')
    return format(scheduledDate, 'MMM d')
  }, [scheduledDate])

  return (
    <Link
      href={`/employee/recruiting/interviews/${interview.id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
    >
      {/* Time */}
      <div className="w-16 text-center flex-shrink-0">
        {scheduledDate ? (
          <>
            <p className="text-sm font-semibold text-charcoal-900">
              {format(scheduledDate, 'h:mm a')}
            </p>
            <p className="text-xs text-charcoal-500">{timeLabel}</p>
          </>
        ) : (
          <p className="text-xs text-charcoal-400">TBD</p>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-charcoal-900">
            Round {Number(interview.round_number) || 1}
          </p>
          <Badge className={cn(
            'capitalize text-xs px-2 py-0.5',
            statusConfig.bg,
            statusConfig.text
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dot)} />
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-charcoal-500 mt-0.5">
          {interview.interviewer?.full_name || 'Interviewer TBD'}
        </p>
      </div>

      {/* Rating/Feedback indicator */}
      {typeof interview.rating === 'number' && interview.rating > 0 && (
        <div className="text-right">
          <p className="text-sm font-semibold text-charcoal-900">{interview.rating}/5</p>
          <p className="text-xs text-charcoal-500">Rating</p>
        </div>
      )}

      <ArrowRight className="h-4 w-4 text-charcoal-400 flex-shrink-0" />
    </Link>
  )
}

export default JobInterviewsSection
