'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Video,
  Users,
  User,
  Star,
  ChevronRight,
  Plus,
  MapPin,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

interface InterviewProgressPanelProps {
  submissionId: string
  onScheduleNext?: () => void
  onViewInterview?: (interviewId: string) => void
  className?: string
}

interface Interview {
  id: string
  round_number: number
  interview_type: string
  status: string
  scheduled_at: string | null
  rating: number | null
  recommendation: string | null
  feedback: string | null
  interviewers?: string | null
  prep_completed_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  proposed: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Calendar },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const INTERVIEW_TYPE_ICONS: Record<string, React.ElementType> = {
  phone_screen: Phone,
  video_call: Video,
  in_person: MapPin,
  panel: Users,
  technical: User,
  behavioral: User,
  final_round: Star,
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_yes: 'bg-green-600',
  yes: 'bg-green-500',
  maybe: 'bg-amber-500',
  no: 'bg-red-400',
  strong_no: 'bg-red-600',
}

export function InterviewProgressPanel({
  submissionId,
  onScheduleNext,
  onViewInterview,
  className,
}: InterviewProgressPanelProps) {
  const interviewsQuery = trpc.ats.interviews.list.useQuery({
    submissionId,
    limit: 20,
  })

  const interviews = (interviewsQuery.data?.items ?? []) as Interview[]
  const sortedInterviews = [...interviews].sort((a, b) => a.round_number - b.round_number)

  const completedCount = interviews.filter((i) => i.status === 'completed').length
  const totalRounds = interviews.length
  const hasUpcoming = interviews.some((i) => ['proposed', 'scheduled', 'confirmed'].includes(i.status))
  const hasCancelled = interviews.some((i) => i.status === 'cancelled')

  const latestRound = sortedInterviews[sortedInterviews.length - 1]
  const canScheduleNext = latestRound?.status === 'completed' && latestRound?.recommendation !== 'no' && latestRound?.recommendation !== 'strong_no'

  if (interviewsQuery.isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Interview Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (interviews.length === 0) {
    return (
      <Card className={cn('bg-white', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-charcoal-400" />
            Interview Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 mx-auto text-charcoal-300 mb-2" />
            <p className="text-sm text-charcoal-500 mb-4">No interviews scheduled yet</p>
            {onScheduleNext && (
              <Button onClick={onScheduleNext} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-charcoal-400" />
            Interview Progress
          </CardTitle>
          <Badge variant="outline">
            {completedCount}/{totalRounds} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="flex items-center gap-2">
          {sortedInterviews.map((interview, idx) => {
            const isCompleted = interview.status === 'completed'
            const isCancelled = interview.status === 'cancelled'
            const isActive = ['proposed', 'scheduled', 'confirmed'].includes(interview.status)

            return (
              <div key={interview.id} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted && 'bg-green-100 text-green-800',
                    isCancelled && 'bg-red-100 text-red-800',
                    isActive && 'bg-blue-100 text-blue-800 ring-2 ring-blue-300',
                    !isCompleted && !isCancelled && !isActive && 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {interview.round_number}
                </div>
                {idx < sortedInterviews.length - 1 && (
                  <div
                    className={cn(
                      'w-4 h-0.5 mx-1',
                      isCompleted ? 'bg-green-300' : 'bg-charcoal-200'
                    )}
                  />
                )}
              </div>
            )
          })}
          {canScheduleNext && onScheduleNext && (
            <>
              <div className="w-4 h-0.5 bg-charcoal-200 mx-1" />
              <button
                onClick={onScheduleNext}
                className="w-8 h-8 rounded-full border-2 border-dashed border-charcoal-300 flex items-center justify-center text-charcoal-400 hover:border-hublot-900 hover:text-hublot-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Interview Timeline */}
        <div className="space-y-3">
          {sortedInterviews.map((interview) => {
            const statusConfig = STATUS_CONFIG[interview.status] || STATUS_CONFIG.proposed
            const StatusIcon = statusConfig.icon
            const TypeIcon = INTERVIEW_TYPE_ICONS[interview.interview_type] || Calendar

            return (
              <div
                key={interview.id}
                onClick={() => onViewInterview?.(interview.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all',
                  onViewInterview && 'cursor-pointer hover:border-charcoal-300 hover:bg-cream',
                  interview.status === 'cancelled' && 'opacity-60'
                )}
              >
                {/* Round indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      interview.status === 'completed'
                        ? 'bg-green-100'
                        : interview.status === 'cancelled'
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    )}
                  >
                    <TypeIcon
                      className={cn(
                        'w-5 h-5',
                        interview.status === 'completed'
                          ? 'text-green-600'
                          : interview.status === 'cancelled'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      )}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-charcoal-900">
                      Round {interview.round_number}
                    </span>
                    <span className="text-charcoal-500">·</span>
                    <span className="text-sm text-charcoal-600">
                      {interview.interview_type.replace(/_/g, ' ')}
                    </span>
                    <Badge className={cn('text-xs ml-auto', statusConfig.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Date & Time */}
                  {interview.scheduled_at && (
                    <div className="flex items-center gap-1 text-sm text-charcoal-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(interview.scheduled_at), 'MMM d, yyyy')}
                      <span className="mx-1">at</span>
                      {format(new Date(interview.scheduled_at), 'h:mm a')}
                    </div>
                  )}

                  {/* Interviewers */}
                  {interview.interviewers && (
                    <div className="flex items-center gap-1 text-sm text-charcoal-500 mb-1">
                      <User className="w-3 h-3" />
                      {interview.interviewers}
                    </div>
                  )}

                  {/* Prep Status */}
                  {interview.prep_completed_at && interview.status !== 'cancelled' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                      <CheckCircle className="w-3 h-3" />
                      Prep completed
                    </div>
                  )}

                  {/* Feedback Summary */}
                  {interview.status === 'completed' && (
                    <div className="flex items-center gap-3 mt-2">
                      {interview.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'w-3 h-3',
                                star <= interview.rating!
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-charcoal-200'
                              )}
                            />
                          ))}
                        </div>
                      )}
                      {interview.recommendation && (
                        <Badge
                          className={cn(
                            'text-xs text-white',
                            RECOMMENDATION_COLORS[interview.recommendation]
                          )}
                        >
                          {interview.recommendation.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Needs Feedback Warning */}
                  {interview.status !== 'cancelled' &&
                    interview.status !== 'completed' &&
                    interview.scheduled_at &&
                    new Date(interview.scheduled_at) < new Date() &&
                    !interview.feedback && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                        <AlertTriangle className="w-3 h-3" />
                        Feedback needed
                      </div>
                    )}
                </div>

                {onViewInterview && (
                  <ChevronRight className="w-5 h-5 text-charcoal-300 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Schedule Next Round */}
        {canScheduleNext && onScheduleNext && (
          <Button onClick={onScheduleNext} className="w-full" variant="outline">
            <ArrowRight className="w-4 h-4 mr-2" />
            Schedule Round {(latestRound?.round_number || 0) + 1}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
