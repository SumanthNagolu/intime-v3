'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Users,
  MapPin,
  MoreVertical,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  Play,
  AlertTriangle,
  Link2,
  User,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture, isToday } from 'date-fns'
import { InterviewFeedbackDialog } from './InterviewFeedbackDialog'

interface Submission {
  id: string
  submitted_by: string
  job: {
    id: string
    title: string
    account: { id: string; name: string } | null
  } | null
  candidate: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  } | null
}

interface Interview {
  id: string
  scheduled_at: string
  interview_type: string
  round_number: number
  duration_minutes: number
  status: string
  location?: string
  meeting_link?: string
  submission?: Submission
  rating?: number
  recommendation?: string
}

interface InterviewsListProps {
  interviews: Interview[]
  isLoading?: boolean
  onRefresh?: () => void
  showSubmissionInfo?: boolean
}

const INTERVIEW_TYPE_ICONS: Record<string, React.ElementType> = {
  phone_screen: Phone,
  video_call: Video,
  in_person: MapPin,
  panel: Users,
  technical: Users,
  behavioral: Users,
  final_round: Users,
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  proposed: { label: 'Proposed', color: 'bg-blue-100 text-blue-800', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'bg-amber-100 text-amber-800', icon: Calendar },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

export function InterviewsList({
  interviews,
  isLoading = false,
  onRefresh,
  showSubmissionInfo = true,
}: InterviewsListProps) {
  const { toast } = useToast()
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

  const cancelMutation = trpc.ats.interviews.cancel.useMutation({
    onSuccess: () => {
      toast({ title: 'Interview cancelled' })
      onRefresh?.()
    },
    onError: (error) => {
      toast({ title: 'Failed to cancel', description: error.message, variant: 'error' })
    },
  })

  const handleOpenFeedback = (interview: Interview) => {
    setSelectedInterview(interview)
    setFeedbackDialogOpen(true)
  }

  const handleCancel = (interviewId: string) => {
    cancelMutation.mutate({
      interviewId,
      reason: 'other',
      notes: 'Cancelled by recruiter',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white">
            <CardContent className="py-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (interviews.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900 mb-2">No interviews</h3>
          <p className="text-charcoal-500">No interviews scheduled at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {interviews.map((interview) => {
          const scheduledAt = new Date(interview.scheduled_at)
          const isUpcoming = isFuture(scheduledAt)
          const isInterviewToday = isToday(scheduledAt)
          const isInterviewPast = isPast(scheduledAt)
          const needsFeedback =
            isInterviewPast &&
            !['completed', 'cancelled', 'no_show'].includes(interview.status) &&
            !interview.rating

          const TypeIcon = INTERVIEW_TYPE_ICONS[interview.interview_type] || Calendar
          const statusConfig = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled
          const StatusIcon = statusConfig.icon

          const candidate = interview.submission?.candidate
          const job = interview.submission?.job

          return (
            <Card
              key={interview.id}
              className={cn(
                'bg-white transition-all hover:shadow-elevation-sm',
                needsFeedback && 'border-amber-200 bg-amber-50'
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Interview Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        isInterviewToday ? 'bg-gold-100' : 'bg-charcoal-100'
                      )}
                    >
                      <TypeIcon
                        className={cn(
                          'w-5 h-5',
                          isInterviewToday ? 'text-gold-600' : 'text-charcoal-600'
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Type and Round */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-charcoal-900">
                          Round {interview.round_number} -{' '}
                          {interview.interview_type.replace(/_/g, ' ')}
                        </span>
                        <Badge className={cn('text-xs', statusConfig.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {/* Candidate & Job */}
                      {showSubmissionInfo && candidate && (
                        <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-1">
                          <User className="w-3 h-3" />
                          <span>
                            {candidate.first_name} {candidate.last_name}
                          </span>
                          {job && (
                            <>
                              <span className="text-charcoal-400">for</span>
                              <span className="font-medium">{job.title}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-sm text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(scheduledAt, 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(scheduledAt, 'h:mm a')} ({interview.duration_minutes} min)
                        </span>
                        {interview.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {interview.location}
                          </span>
                        )}
                        {interview.meeting_link && (
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Link2 className="w-3 h-3" />
                            Join Meeting
                          </a>
                        )}
                      </div>

                      {/* Time Status */}
                      <div className="mt-2">
                        {isInterviewToday && (
                          <Badge variant="outline" className="text-xs bg-gold-50 text-gold-700">
                            Today at {format(scheduledAt, 'h:mm a')}
                          </Badge>
                        )}
                        {isUpcoming && !isInterviewToday && (
                          <Badge variant="outline" className="text-xs">
                            {formatDistanceToNow(scheduledAt, { addSuffix: true })}
                          </Badge>
                        )}
                        {needsFeedback && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50 text-amber-700 border-amber-300"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Feedback needed
                          </Badge>
                        )}
                        {interview.rating && (
                          <Badge variant="outline" className="text-xs">
                            {interview.rating}/5 - {interview.recommendation?.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {needsFeedback && (
                        <DropdownMenuItem onClick={() => handleOpenFeedback(interview)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Add Feedback
                        </DropdownMenuItem>
                      )}

                      {isUpcoming && (
                        <>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleCancel(interview.id)}
                            className="text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Interview
                          </DropdownMenuItem>
                        </>
                      )}

                      {interview.meeting_link && (
                        <DropdownMenuItem asChild>
                          <a
                            href={interview.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Join Meeting
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feedback Dialog */}
      {selectedInterview && (
        <InterviewFeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          interviewId={selectedInterview.id}
          candidateName={
            selectedInterview.submission?.candidate
              ? `${selectedInterview.submission.candidate.first_name} ${selectedInterview.submission.candidate.last_name}`
              : 'Unknown'
          }
          jobTitle={selectedInterview.submission?.job?.title || 'Unknown Position'}
          interviewType={selectedInterview.interview_type}
          roundNumber={selectedInterview.round_number}
          scheduledDate={selectedInterview.scheduled_at}
          daysSinceInterview={Math.floor(
            (Date.now() - new Date(selectedInterview.scheduled_at).getTime()) /
              (1000 * 60 * 60 * 24)
          )}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
