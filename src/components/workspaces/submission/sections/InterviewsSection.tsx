'use client'

import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Link as LinkIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FullSubmission, Interview } from '@/types/submission'

interface InterviewsSectionProps {
  submission: FullSubmission
  onScheduleInterview?: () => void
}

const INTERVIEW_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-600 text-white', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-700', icon: Clock },
  proposed: { label: 'Proposed', color: 'bg-purple-100 text-purple-700', icon: Clock },
}

const INTERVIEW_TYPE_CONFIG: Record<string, { label: string; icon: typeof Video }> = {
  phone_screen: { label: 'Phone Screen', icon: User },
  video_call: { label: 'Video Call', icon: Video },
  in_person: { label: 'In Person', icon: MapPin },
  panel: { label: 'Panel', icon: User },
  technical: { label: 'Technical', icon: User },
  behavioral: { label: 'Behavioral', icon: User },
  final_round: { label: 'Final Round', icon: CheckCircle },
}

export function InterviewsSection({ submission, onScheduleInterview }: InterviewsSectionProps) {
  const interviews = submission.sections?.interviews?.items || []

  // Sort interviews by date (upcoming first)
  const sortedInterviews = [...interviews].sort((a, b) => {
    if (!a.scheduled_at) return 1
    if (!b.scheduled_at) return -1
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  })

  const upcomingInterviews = sortedInterviews.filter(
    (i) => i.scheduled_at && new Date(i.scheduled_at) >= new Date() && i.status !== 'cancelled'
  )
  const pastInterviews = sortedInterviews.filter(
    (i) => !i.scheduled_at || new Date(i.scheduled_at) < new Date() || i.status === 'completed'
  )

  if (interviews.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No Interviews Scheduled</h3>
            <p className="text-charcoal-500 mb-6">
              Schedule an interview to move this submission forward.
            </p>
            <Button onClick={onScheduleInterview}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Interviews ({interviews.length})
        </h2>
        <Button variant="outline" size="sm" onClick={onScheduleInterview}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-charcoal-500 uppercase tracking-wide mb-3">
            Past
          </h3>
          <div className="space-y-3">
            {pastInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InterviewCard({
  interview,
  isUpcoming,
}: {
  interview: Interview
  isUpcoming?: boolean
}) {
  const status = interview.status || 'scheduled'
  const statusConfig = INTERVIEW_STATUS_CONFIG[status] || INTERVIEW_STATUS_CONFIG.scheduled
  const typeConfig = INTERVIEW_TYPE_CONFIG[interview.interview_type || 'phone_screen'] ||
    INTERVIEW_TYPE_CONFIG.phone_screen

  const StatusIcon = statusConfig.icon
  const TypeIcon = typeConfig.icon

  return (
    <Card className={cn(isUpcoming && 'border-gold-200 bg-gold-50/30')}>
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Date/Time Badge */}
          <div className={cn(
            'w-16 text-center rounded-lg py-2 px-3',
            isUpcoming ? 'bg-gold-100' : 'bg-charcoal-100'
          )}>
            {interview.scheduled_at ? (
              <>
                <p className="text-xs text-charcoal-500 uppercase">
                  {new Date(interview.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                </p>
                <p className="text-xl font-bold text-charcoal-900">
                  {new Date(interview.scheduled_at).getDate()}
                </p>
                <p className="text-xs text-charcoal-500">
                  {new Date(interview.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-charcoal-500">TBD</p>
            )}
          </div>

          {/* Interview Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <TypeIcon className="h-4 w-4 text-charcoal-400" />
              <span className="font-medium text-charcoal-900">{typeConfig.label}</span>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>

            {/* Duration & Location */}
            <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-2">
              {interview.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {interview.duration_minutes} min
                </span>
              )}
              {interview.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {interview.location}
                </span>
              )}
              {interview.meeting_link && (
                <a
                  href={interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Join Meeting
                </a>
              )}
            </div>

            {/* Interviewer */}
            {interview.interviewer && (
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={interview.interviewer.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {interview.interviewer.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-charcoal-600">{interview.interviewer.full_name}</span>
              </div>
            )}

            {/* Feedback */}
            {interview.feedback && (
              <div className="mt-3 p-3 bg-charcoal-50 rounded-lg">
                <p className="text-sm text-charcoal-600">{interview.feedback}</p>
                {interview.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={cn(
                          'text-lg',
                          star <= interview.rating! ? 'text-amber-400' : 'text-charcoal-200'
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
