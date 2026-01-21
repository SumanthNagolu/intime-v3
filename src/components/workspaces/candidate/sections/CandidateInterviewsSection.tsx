'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  ArrowRight,
  Briefcase,
  Video,
  MapPin,
  Users,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateInterviewRecord } from '@/types/candidate-workspace'
import { format, formatDistanceToNow, isFuture, isPast, isToday } from 'date-fns'

interface CandidateInterviewsSectionProps {
  interviews: CandidateInterviewRecord[]
  candidateId: string
}

/**
 * CandidateInterviewsSection - Displays all interviews for a candidate
 *
 * Shows interview history with status, feedback, and ratings.
 */
export function CandidateInterviewsSection({
  interviews,
  candidateId,
}: CandidateInterviewsSectionProps) {
  // Group by status/timing
  const upcomingInterviews = interviews.filter(
    (i) => i.scheduledAt && isFuture(new Date(i.scheduledAt)) && !['cancelled', 'no_show'].includes(i.status)
  )
  const completedInterviews = interviews.filter(
    (i) => i.status === 'completed' || (i.scheduledAt && isPast(new Date(i.scheduledAt)) && !['cancelled', 'no_show'].includes(i.status))
  )
  const cancelledInterviews = interviews.filter(
    (i) => ['cancelled', 'no_show'].includes(i.status)
  )

  // Calculate stats
  const avgRating = interviews
    .filter(i => i.rating !== null)
    .reduce((sum, i, _, arr) => sum + (i.rating || 0) / arr.length, 0)

  const passRate = interviews.length > 0
    ? (interviews.filter(i => i.recommendation === 'hire').length / interviews.filter(i => i.recommendation !== null).length) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Interviews</h2>
          <p className="text-sm text-charcoal-500">
            {interviews.length} total interview{interviews.length !== 1 ? 's' : ''}
            {upcomingInterviews.length > 0 && ` · ${upcomingInterviews.length} upcoming`}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="Upcoming"
          value={upcomingInterviews.length}
          icon={<Calendar className="h-5 w-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          label="Completed"
          value={completedInterviews.length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-success-100 text-success-600"
        />
        <StatsCard
          label="Avg Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : '-'}
          icon={<Star className="h-5 w-5" />}
          color="bg-gold-100 text-gold-600"
        />
        <StatsCard
          label="Pass Rate"
          value={passRate > 0 ? `${passRate.toFixed(0)}%` : '-'}
          icon={<ThumbsUp className="h-5 w-5" />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Upcoming Interviews ({upcomingInterviews.length})
          </h3>
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Interviews */}
      {completedInterviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Completed ({completedInterviews.length})
          </h3>
          <div className="space-y-3">
            {completedInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Interviews */}
      {cancelledInterviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Cancelled / No Show ({cancelledInterviews.length})
          </h3>
          <div className="space-y-3">
            {cancelledInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} variant="muted" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {interviews.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Interviews Yet
            </h3>
            <p className="text-sm text-charcoal-500 max-w-md mx-auto">
              When interviews are scheduled for this candidate, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Stats Card
function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-semibold text-charcoal-900">{value}</div>
            <div className="text-sm text-charcoal-500">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Interview Card
function InterviewCard({
  interview,
  variant = 'default',
}: {
  interview: CandidateInterviewRecord
  variant?: 'default' | 'muted'
}) {
  const isMuted = variant === 'muted'

  // Get interview type config
  const getTypeConfig = () => {
    switch (interview.interviewType) {
      case 'technical':
        return { label: 'Technical', bg: 'bg-blue-100', text: 'text-blue-700' }
      case 'behavioral':
        return { label: 'Behavioral', bg: 'bg-purple-100', text: 'text-purple-700' }
      case 'cultural':
        return { label: 'Cultural', bg: 'bg-green-100', text: 'text-green-700' }
      case 'hr':
        return { label: 'HR', bg: 'bg-amber-100', text: 'text-amber-700' }
      case 'panel':
        return { label: 'Panel', bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
      default:
        return { label: interview.interviewType, bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
    }
  }

  // Get status config
  const getStatusConfig = () => {
    switch (interview.status) {
      case 'scheduled':
        return { label: 'Scheduled', bg: 'bg-blue-100', text: 'text-blue-700' }
      case 'confirmed':
        return { label: 'Confirmed', bg: 'bg-success-100', text: 'text-success-700' }
      case 'completed':
        return { label: 'Completed', bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-error-100', text: 'text-error-700' }
      case 'no_show':
        return { label: 'No Show', bg: 'bg-error-100', text: 'text-error-700' }
      case 'proposed':
        return { label: 'Proposed', bg: 'bg-amber-100', text: 'text-amber-700' }
      default:
        return { label: interview.status, bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
    }
  }

  // Get recommendation config
  const getRecommendationConfig = () => {
    switch (interview.recommendation) {
      case 'hire':
        return { label: 'Hire', icon: ThumbsUp, bg: 'bg-success-100', text: 'text-success-700' }
      case 'no_hire':
        return { label: 'No Hire', icon: ThumbsDown, bg: 'bg-error-100', text: 'text-error-700' }
      case 'consider':
        return { label: 'Consider', icon: AlertCircle, bg: 'bg-amber-100', text: 'text-amber-700' }
      default:
        return null
    }
  }

  const typeConfig = getTypeConfig()
  const statusConfig = getStatusConfig()
  const recommendationConfig = getRecommendationConfig()

  // Format scheduled time
  const formatSchedule = () => {
    if (!interview.scheduledAt) return null
    const date = new Date(interview.scheduledAt)
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    }
    return format(date, 'MMM d, yyyy h:mm a')
  }

  // Check if interview is today
  const isInterviewToday = interview.scheduledAt && isToday(new Date(interview.scheduledAt))

  return (
    <Card className={cn(
      isMuted && 'opacity-75',
      isInterviewToday && 'border-blue-300 bg-blue-50/30'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Job and Schedule Info */}
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isInterviewToday ? 'bg-blue-100' : typeConfig.bg
            )}>
              <Calendar className={cn(
                'h-5 w-5',
                isInterviewToday ? 'text-blue-600' : typeConfig.text
              )} />
            </div>
            <div>
              <h4 className="font-medium text-charcoal-900 flex items-center gap-2">
                Round {interview.roundNumber}: {typeConfig.label} Interview
                {isInterviewToday && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                    Today
                  </Badge>
                )}
              </h4>
              <div className="flex items-center gap-3 text-sm text-charcoal-500 mt-1">
                {interview.job && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {interview.job.title}
                  </span>
                )}
                {interview.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatSchedule()}
                    {interview.durationMinutes && ` (${interview.durationMinutes} min)`}
                  </span>
                )}
              </div>

              {/* Location/Meeting Info */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {interview.meetingLink && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Video className="h-3.5 w-3.5" />
                    Video Call
                  </span>
                )}
                {interview.meetingLocation && (
                  <span className="flex items-center gap-1 text-charcoal-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {interview.meetingLocation}
                  </span>
                )}
                {interview.interviewerNames && interview.interviewerNames.length > 0 && (
                  <span className="flex items-center gap-1 text-charcoal-500">
                    <Users className="h-3.5 w-3.5" />
                    {interview.interviewerNames.length === 1
                      ? interview.interviewerNames[0]
                      : `${interview.interviewerNames.length} interviewers`
                    }
                  </span>
                )}
              </div>

              {/* Feedback Preview */}
              {interview.feedback && (
                <div className="mt-2 text-sm text-charcoal-600 line-clamp-2">
                  <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 text-charcoal-400" />
                  {interview.feedback}
                </div>
              )}
            </div>
          </div>

          {/* Right: Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Rating */}
            {interview.rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gold-100">
                <Star className="h-4 w-4 text-gold-600 fill-gold-500" />
                <span className="text-sm font-medium text-gold-700">{interview.rating}/5</span>
              </div>
            )}

            {/* Recommendation */}
            {recommendationConfig && (
              <Badge className={cn('capitalize whitespace-nowrap', recommendationConfig.bg, recommendationConfig.text)}>
                <recommendationConfig.icon className="h-3 w-3 mr-1" />
                {recommendationConfig.label}
              </Badge>
            )}

            {/* Status Badge */}
            <Badge className={cn('capitalize whitespace-nowrap', statusConfig.bg, statusConfig.text)}>
              {statusConfig.label}
            </Badge>

            {/* View Link */}
            {interview.submission && (
              <Link
                href={`/employee/recruiting/submissions/${interview.submission.id}?section=interviews`}
                className="flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700"
              >
                View <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CandidateInterviewsSection
