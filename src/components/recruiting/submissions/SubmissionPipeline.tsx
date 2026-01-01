'use client'

import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Users,
  Search,
  FileText,
  Eye,
  MessageSquare,
  Gift,
  CheckCircle,
  User,
  Mail,
  Calendar,
  ChevronRight,
  MoreVertical,
  Send,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  GripVertical,
  Phone,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SubmitToClientDialog } from './SubmitToClientDialog'
import { RecordFeedbackDialog } from './RecordFeedbackDialog'
import { ScheduleInterviewDialog } from '../interviews/ScheduleInterviewDialog'

// Pipeline stages - ends at submission (client-facing stages handled in Submissions tab)
export const PIPELINE_STAGES = [
  { id: 'sourced', label: 'Sourced', icon: Search, color: 'bg-charcoal-100', actions: ['screen', 'withdraw'] },
  { id: 'screening', label: 'Screening', icon: FileText, color: 'bg-blue-100', actions: ['submit', 'reject', 'withdraw'] },
  { id: 'submission_ready', label: 'Ready to Submit', icon: Eye, color: 'bg-indigo-100', actions: ['submit', 'withdraw'] },
  { id: 'submitted_to_client', label: 'Submitted', icon: ExternalLink, color: 'bg-purple-200', actions: [] },
] as const

type PipelineStage = (typeof PIPELINE_STAGES)[number]['id']

interface Candidate {
  id: string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  candidate_skills?: string[]
}

// Helper to get display name from candidate
function getCandidateDisplayName(candidate?: Candidate): string {
  if (!candidate) return 'Unknown'
  if (candidate.full_name) return candidate.full_name
  if (candidate.first_name && candidate.last_name) {
    return `${candidate.first_name} ${candidate.last_name}`
  }
  return candidate.first_name || candidate.last_name || 'Unknown'
}

interface Job {
  id: string
  title: string
  account?: {
    id: string
    name: string
  } | null
  rate_min?: number
  rate_max?: number
}

interface Submission {
  id: string
  status: string
  created_at: string
  submitted_at?: string
  candidate?: Candidate
  job?: Job
  ai_match_score?: number
  recruiter_match_score?: number
  submitted_rate?: number
}

interface SubmissionPipelineProps {
  submissions: Submission[]
  job: Job
  onCandidateClick?: (submissionId: string) => void
  onAddCandidate?: () => void
  onRefresh?: () => void
  isCompact?: boolean
}

// Map various status values to pipeline stages (Pipeline ends at submitted_to_client)
function getStageFromStatus(status: string): PipelineStage {
  const statusMap: Record<string, PipelineStage> = {
    sourced: 'sourced',
    screening: 'screening',
    submission_ready: 'submission_ready',
    // All post-submission statuses map to submitted_to_client in Pipeline view
    submitted: 'submitted_to_client',
    submitted_to_client: 'submitted_to_client',
    client_review: 'submitted_to_client',
    client_accepted: 'submitted_to_client',
    client_interview: 'submitted_to_client',
    interviewing: 'submitted_to_client',
    offer_stage: 'submitted_to_client',
    offered: 'submitted_to_client',
    placed: 'submitted_to_client',
  }
  return statusMap[status] || 'sourced'
}

export function SubmissionPipeline({
  submissions,
  job,
  onCandidateClick,
  onAddCandidate,
  onRefresh,
  isCompact = false,
}: SubmissionPipelineProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [draggedSubmission, setDraggedSubmission] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null)

  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // Mutations
  const updateStatusMutation = trpc.ats.submissions.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: 'Status updated', description: 'Submission status has been updated' })
      onRefresh?.()
      utils.ats.submissions.list.invalidate()
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'error' })
    },
  })

  // Group submissions by pipeline stage (excluding rejected/withdrawn)
  const groupedSubmissions: Record<PipelineStage, Submission[]> = {
    sourced: [],
    screening: [],
    submission_ready: [],
    submitted_to_client: [],
  }

  const rejectedSubmissions: Submission[] = []
  const withdrawnSubmissions: Submission[] = []

  submissions.forEach((submission) => {
    if (submission.status === 'rejected') {
      rejectedSubmissions.push(submission)
    } else if (submission.status === 'withdrawn') {
      withdrawnSubmissions.push(submission)
    } else {
      const stage = getStageFromStatus(submission.status)
      groupedSubmissions[stage].push(submission)
    }
  })

  // Calculate totals
  const totalActive = submissions.length - rejectedSubmissions.length - withdrawnSubmissions.length

  // Drag handlers
  const handleDragStart = useCallback((submissionId: string) => {
    setDraggedSubmission(submissionId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedSubmission(null)
    setDragOverStage(null)
  }, [])

  const handleDragOver = useCallback((stage: PipelineStage) => {
    if (draggedSubmission) {
      setDragOverStage(stage)
    }
  }, [draggedSubmission])

  const handleDrop = useCallback((targetStage: PipelineStage) => {
    if (!draggedSubmission) return

    const submission = submissions.find(s => s.id === draggedSubmission)
    if (!submission) return

    const currentStage = getStageFromStatus(submission.status)
    if (currentStage === targetStage) return

    // Determine the actual status to set
    const stageToStatus: Record<PipelineStage, string> = {
      sourced: 'sourced',
      screening: 'screening',
      submission_ready: 'submission_ready',
      submitted_to_client: 'submitted_to_client',
    }

    // If dragging to submitted_to_client, open submit dialog instead
    if (targetStage === 'submitted_to_client' && ['sourced', 'screening', 'submission_ready'].includes(currentStage)) {
      setSelectedSubmission(submission)
      setSubmitDialogOpen(true)
    } else {
      updateStatusMutation.mutate({
        id: draggedSubmission,
        status: stageToStatus[targetStage] as 'sourced' | 'screening' | 'submission_ready' | 'submitted_to_client' | 'client_review' | 'client_interview' | 'offer_stage' | 'placed' | 'rejected' | 'withdrawn',
      })
    }

    setDraggedSubmission(null)
    setDragOverStage(null)
  }, [draggedSubmission, submissions, updateStatusMutation])

  // Action handlers
  const handleSubmitToClient = (submission: Submission) => {
    setSelectedSubmission(submission)
    setSubmitDialogOpen(true)
  }

  const handleRecordFeedback = (submission: Submission) => {
    setSelectedSubmission(submission)
    setFeedbackDialogOpen(true)
  }

  const handleScheduleInterview = (submission: Submission) => {
    setSelectedSubmission(submission)
    setScheduleDialogOpen(true)
  }

  const handleMoveToScreening = (submissionId: string) => {
    updateStatusMutation.mutate({ id: submissionId, status: 'screening' })
  }

  const handleReject = (submissionId: string) => {
    updateStatusMutation.mutate({ id: submissionId, status: 'rejected', reason: 'Not a fit' })
  }

  const handleWithdraw = (submissionId: string) => {
    updateStatusMutation.mutate({ id: submissionId, status: 'withdrawn', reason: 'Withdrawn from consideration' })
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
        <h3 className="text-lg font-medium text-charcoal-900 mb-2">No candidates in pipeline</h3>
        <p className="text-charcoal-500 mb-4">
          Source and screen candidates here, then submit them to the client for review.
        </p>
        {onAddCandidate && (
          <Button onClick={onAddCandidate}>
            <Users className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        )}
      </div>
    )
  }

  if (isCompact) {
    // Compact view - just show stage counts
    return (
      <div className="grid grid-cols-4 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = groupedSubmissions[stage.id].length
          const Icon = stage.icon
          return (
            <div
              key={stage.id}
              className={cn('text-center p-3 rounded-lg', stage.color)}
            >
              <Icon className="w-5 h-5 mx-auto text-charcoal-600 mb-1" />
              <div className="text-2xl font-bold text-charcoal-900">{count}</div>
              <div className="text-xs text-charcoal-600">{stage.label}</div>
            </div>
          )
        })}
      </div>
    )
  }

  // Full Kanban view with drag-drop
  return (
    <div className="space-y-4">
      {/* Stage Headers - Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-min">
          {PIPELINE_STAGES.map((stage) => {
            const stageSubmissions = groupedSubmissions[stage.id]
            const count = stageSubmissions.length
            const Icon = stage.icon
            const isDragOver = dragOverStage === stage.id

            return (
              <div
                key={stage.id}
                className="w-72 flex-shrink-0"
                onDragOver={(e) => {
                  e.preventDefault()
                  handleDragOver(stage.id)
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(stage.id)
                }}
              >
                {/* Stage Header */}
                <div className={cn('flex items-center gap-2 p-3 rounded-t-lg', stage.color)}>
                  <Icon className="w-4 h-4 text-charcoal-600" />
                  <span className="font-medium text-charcoal-900">{stage.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {count}
                  </Badge>
                </div>

                {/* Stage Content */}
                <div
                  className={cn(
                    'bg-white border border-t-0 rounded-b-lg min-h-[300px] p-2 space-y-2 transition-colors',
                    isDragOver && 'bg-blue-50 border-blue-300'
                  )}
                >
                  {stageSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-400 text-sm">
                      {isDragOver ? 'Drop here' : 'No candidates'}
                    </div>
                  ) : (
                    stageSubmissions.map((submission) => (
                      <SubmissionCard
                        key={submission.id}
                        submission={submission}
                        stage={stage}
                        isDragging={draggedSubmission === submission.id}
                        onClick={() => onCandidateClick?.(submission.id)}
                        onDragStart={() => handleDragStart(submission.id)}
                        onDragEnd={handleDragEnd}
                        onSubmitToClient={() => handleSubmitToClient(submission)}
                        onRecordFeedback={() => handleRecordFeedback(submission)}
                        onScheduleInterview={() => handleScheduleInterview(submission)}
                        onMoveToScreening={() => handleMoveToScreening(submission.id)}
                        onReject={() => handleReject(submission.id)}
                        onWithdraw={() => handleWithdraw(submission.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rejected/Withdrawn Summary */}
      {(rejectedSubmissions.length > 0 || withdrawnSubmissions.length > 0) && (
        <div className="flex gap-4">
          {rejectedSubmissions.length > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              <ThumbsDown className="w-3 h-3 mr-1" />
              {rejectedSubmissions.length} Rejected
            </Badge>
          )}
          {withdrawnSubmissions.length > 0 && (
            <Badge variant="outline" className="text-charcoal-600 border-charcoal-200">
              <XCircle className="w-3 h-3 mr-1" />
              {withdrawnSubmissions.length} Withdrawn
            </Badge>
          )}
        </div>
      )}

      {/* Add Candidate Button */}
      {onAddCandidate && (
        <div className="flex justify-end">
          <Button onClick={onAddCandidate} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      )}

      {/* Submit to Client Dialog */}
      {selectedSubmission && (
        <SubmitToClientDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          submissionId={selectedSubmission.id}
          candidateName={getCandidateDisplayName(selectedSubmission.candidate)}
          jobTitle={job.title}
          accountName={job.account?.name || 'Client'}
          jobRateMin={job.rate_min}
          jobRateMax={job.rate_max}
          onSuccess={() => {
            onRefresh?.()
            utils.ats.submissions.list.invalidate()
          }}
        />
      )}

      {/* Record Feedback Dialog */}
      {selectedSubmission && (
        <RecordFeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          submissionId={selectedSubmission.id}
          candidateName={getCandidateDisplayName(selectedSubmission.candidate)}
          jobTitle={job.title}
          accountName={job.account?.name || 'Client'}
          currentStatus={selectedSubmission.status}
          daysPending={
            selectedSubmission.submitted_at
              ? Math.floor(
                  (Date.now() - new Date(selectedSubmission.submitted_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0
          }
          onSuccess={() => {
            onRefresh?.()
            utils.ats.submissions.list.invalidate()
          }}
        />
      )}

      {/* Schedule Interview Dialog */}
      {selectedSubmission && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          submissionId={selectedSubmission.id}
          candidateName={getCandidateDisplayName(selectedSubmission.candidate)}
          candidateEmail={selectedSubmission.candidate?.email}
          jobTitle={job.title}
          accountName={job.account?.name || 'Client'}
          onSuccess={() => {
            onRefresh?.()
            utils.ats.submissions.list.invalidate()
            utils.ats.interviews.list.invalidate()
          }}
        />
      )}
    </div>
  )
}

// Submission Card Component
interface SubmissionCardProps {
  submission: Submission
  stage: (typeof PIPELINE_STAGES)[number]
  isDragging: boolean
  onClick?: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onSubmitToClient: () => void
  onRecordFeedback: () => void
  onScheduleInterview: () => void
  onMoveToScreening: () => void
  onReject: () => void
  onWithdraw: () => void
}

function SubmissionCard({
  submission,
  stage,
  isDragging,
  onClick,
  onDragStart,
  onDragEnd,
  onSubmitToClient,
  onRecordFeedback,
  onScheduleInterview,
  onMoveToScreening,
  onReject,
  onWithdraw,
}: SubmissionCardProps) {
  const candidate = submission.candidate

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'bg-cream hover:bg-white cursor-grab transition-all duration-200',
        'hover:shadow-elevation-sm',
        isDragging && 'opacity-50 rotate-2 shadow-elevation-md'
      )}
    >
      <CardContent className="p-3">
        {/* Drag Handle + Candidate Name */}
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="w-4 h-4 text-charcoal-300 cursor-grab" />
          <div
            className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center cursor-pointer"
            onClick={onClick}
          >
            <User className="w-4 h-4 text-hublot-900" />
          </div>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <p className="font-medium text-charcoal-900 truncate">
              {getCandidateDisplayName(candidate)}
            </p>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>

              {/* Stage-specific actions */}
              {stage.id === 'sourced' && (
                <DropdownMenuItem onClick={onMoveToScreening}>
                  <FileText className="w-4 h-4 mr-2" />
                  Start Screening
                </DropdownMenuItem>
              )}

              {['sourced', 'screening'].includes(stage.id) && (
                <DropdownMenuItem onClick={onSubmitToClient}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit to Client
                </DropdownMenuItem>
              )}

              {['submitted_to_client', 'client_review', 'client_interview', 'offer_stage'].includes(stage.id) && (
                <DropdownMenuItem onClick={onRecordFeedback}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Record Feedback
                </DropdownMenuItem>
              )}

              {(stage.id as string) === 'client_interview' && (
                <DropdownMenuItem onClick={onScheduleInterview}>
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Interview
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {(stage.id as string) !== 'placed' && (
                <>
                  <DropdownMenuItem onClick={onReject} className="text-red-600">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onWithdraw} className="text-charcoal-600">
                    <XCircle className="w-4 h-4 mr-2" />
                    Withdraw
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Email */}
        {candidate?.email && (
          <div className="flex items-center gap-1 text-xs text-charcoal-500 mb-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{candidate.email}</span>
          </div>
        )}

        {/* Match Score & Rate */}
        <div className="flex items-center gap-2 flex-wrap">
          {submission.ai_match_score && (
            <Badge variant="outline" className="text-xs">
              {submission.ai_match_score}% match
            </Badge>
          )}
          {submission.submitted_rate && (
            <Badge variant="secondary" className="text-xs">
              ${submission.submitted_rate}/hr
            </Badge>
          )}
        </div>

        {/* Date Added */}
        <div className="flex items-center gap-1 text-xs text-charcoal-400 mt-2">
          <Calendar className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
