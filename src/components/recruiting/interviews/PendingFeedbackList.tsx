'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  Calendar,
  Clock,
  MessageSquare,
  User,
  Briefcase,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { InterviewFeedbackDialog } from './InterviewFeedbackDialog'

interface PendingFeedbackListProps {
  limit?: number
  showTitle?: boolean
  className?: string
}

interface PendingInterview {
  id: string
  scheduled_at: string
  interview_type: string
  round_number: number
  status: string
  daysSinceInterview: number
  isOverdue: boolean
  submission: {
    id: string
    submitted_by: string
    job: {
      id: string
      title: string
      account: {
        id: string
        name: string
      } | null
    } | null
    candidate: {
      id: string
      first_name: string
      last_name: string
    } | null
  } | null
}

export function PendingFeedbackList({
  limit = 10,
  showTitle = true,
  className,
}: PendingFeedbackListProps) {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<PendingInterview | null>(null)

  const pendingQuery = trpc.ats.interviews.getPendingFeedback.useQuery({ limit })
  const utils = trpc.useUtils()

  const interviews = pendingQuery.data as PendingInterview[] | undefined

  const handleOpenFeedback = (interview: PendingInterview) => {
    setSelectedInterview(interview)
    setFeedbackDialogOpen(true)
  }

  const handleFeedbackSuccess = () => {
    pendingQuery.refetch()
    utils.ats.interviews.list.invalidate()
  }

  const getSlaStatus = (daysSince: number) => {
    if (daysSince > 5) return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' }
    if (daysSince > 2) return { label: 'Overdue', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    return { label: 'Due', color: 'bg-green-100 text-green-800 border-green-200' }
  }

  if (pendingQuery.isLoading) {
    return (
      <Card className={cn('bg-white', className)}>
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!interviews || interviews.length === 0) {
    return (
      <Card className={cn('bg-white', className)}>
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-charcoal-400" />
              Pending Feedback
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto text-charcoal-300 mb-2" />
            <p className="text-sm text-charcoal-500">No interviews awaiting feedback</p>
            <p className="text-xs text-charcoal-400 mt-1">All caught up!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overdueCount = interviews.filter((i) => i.isOverdue).length

  return (
    <>
      <Card className={cn('bg-white', className)}>
        {showTitle && (
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-charcoal-400" />
                Pending Feedback
              </CardTitle>
              <div className="flex items-center gap-2">
                {overdueCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {overdueCount} overdue
                  </Badge>
                )}
                <Badge variant="outline">{interviews.length} pending</Badge>
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Round</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => {
                const candidate = interview.submission?.candidate
                const job = interview.submission?.job
                const account = job?.account
                const slaStatus = getSlaStatus(interview.daysSinceInterview)

                return (
                  <TableRow
                    key={interview.id}
                    className="cursor-pointer hover:bg-cream"
                    onClick={() => handleOpenFeedback(interview)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-hublot-900" />
                        </div>
                        <span className="font-medium text-charcoal-900">
                          {candidate
                            ? `${candidate.first_name} ${candidate.last_name}`
                            : 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-charcoal-900">
                          {job?.title || 'Unknown'}
                        </span>
                        {account && (
                          <span className="text-xs text-charcoal-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {account.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        Round {interview.round_number}
                      </Badge>
                      <div className="text-xs text-charcoal-500 mt-1">
                        {interview.interview_type.replace(/_/g, ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-charcoal-900">
                          {format(new Date(interview.scheduled_at), 'MMM d')}
                        </span>
                        <span className="text-xs text-charcoal-500">
                          {formatDistanceToNow(new Date(interview.scheduled_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-xs border', slaStatus.color)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {interview.daysSinceInterview}d - {slaStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenFeedback(interview)
                        }}
                      >
                        Add Feedback
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
          jobTitle={selectedInterview.submission?.job?.title || 'Unknown'}
          interviewType={selectedInterview.interview_type}
          roundNumber={selectedInterview.round_number}
          scheduledDate={format(new Date(selectedInterview.scheduled_at), 'MMM d, yyyy')}
          daysSinceInterview={selectedInterview.daysSinceInterview}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  )
}
