'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Pipeline stages as defined in the spec
const PIPELINE_STAGES = [
  { id: 'sourced', label: 'Sourced', icon: Search, color: 'bg-charcoal-100' },
  { id: 'screening', label: 'Screening', icon: FileText, color: 'bg-blue-100' },
  { id: 'submitted', label: 'Submitted', icon: ExternalLink, color: 'bg-indigo-100' },
  { id: 'client_review', label: 'Client Review', icon: Eye, color: 'bg-purple-100' },
  { id: 'interview', label: 'Interview', icon: MessageSquare, color: 'bg-amber-100' },
  { id: 'offer', label: 'Offer', icon: Gift, color: 'bg-green-100' },
  { id: 'placed', label: 'Placed', icon: CheckCircle, color: 'bg-gold-100' },
] as const

type PipelineStage = (typeof PIPELINE_STAGES)[number]['id']

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email?: string
}

interface Submission {
  id: string
  status: string
  created_at: string
  candidate?: Candidate
  ai_match_score?: number
  recruiter_match_score?: number
  submitted_rate?: number
}

interface PipelineViewProps {
  submissions: Submission[]
  jobId: string
  onCandidateClick?: (submissionId: string) => void
  onAddCandidate?: () => void
  isCompact?: boolean
}

// Map various status values to pipeline stages
function getStageFromStatus(status: string): PipelineStage {
  const statusMap: Record<string, PipelineStage> = {
    sourced: 'sourced',
    screening: 'screening',
    submission_ready: 'submitted',
    submitted: 'submitted',
    submitted_to_client: 'submitted',
    client_review: 'client_review',
    client_accepted: 'client_review',
    client_interview: 'interview',
    interviewing: 'interview',
    offer_stage: 'offer',
    offered: 'offer',
    placed: 'placed',
    rejected: 'sourced', // Show rejected in sourced for visibility
  }
  return statusMap[status] || 'sourced'
}

export function PipelineView({
  submissions,
  jobId,
  onCandidateClick,
  onAddCandidate,
  isCompact = false,
}: PipelineViewProps) {
  // Group submissions by pipeline stage
  const groupedSubmissions: Record<PipelineStage, Submission[]> = {
    sourced: [],
    screening: [],
    submitted: [],
    client_review: [],
    interview: [],
    offer: [],
    placed: [],
  }

  submissions.forEach((submission) => {
    const stage = getStageFromStatus(submission.status)
    groupedSubmissions[stage].push(submission)
  })

  // Calculate total for header
  const totalSubmissions = submissions.length

  if (totalSubmissions === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
        <h3 className="text-lg font-medium text-charcoal-900 mb-2">No candidates in pipeline</h3>
        <p className="text-charcoal-500 mb-4">
          Start sourcing candidates to build your pipeline for this position.
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
      <div className="grid grid-cols-7 gap-2">
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

  // Full Kanban view
  return (
    <div className="space-y-4">
      {/* Stage Headers */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-min">
          {PIPELINE_STAGES.map((stage) => {
            const stageSubmissions = groupedSubmissions[stage.id]
            const count = stageSubmissions.length
            const Icon = stage.icon

            return (
              <div
                key={stage.id}
                className="w-64 flex-shrink-0"
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
                <div className="bg-white border border-t-0 rounded-b-lg min-h-[200px] p-2 space-y-2">
                  {stageSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-400 text-sm">
                      No candidates
                    </div>
                  ) : (
                    stageSubmissions.map((submission) => (
                      <CandidateCard
                        key={submission.id}
                        submission={submission}
                        onClick={() => onCandidateClick?.(submission.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Candidate Button */}
      {onAddCandidate && (
        <div className="flex justify-end">
          <Button onClick={onAddCandidate} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      )}
    </div>
  )
}

interface CandidateCardProps {
  submission: Submission
  onClick?: () => void
}

function CandidateCard({ submission, onClick }: CandidateCardProps) {
  const candidate = submission.candidate

  return (
    <Card
      className={cn(
        'bg-cream hover:bg-white cursor-pointer transition-colors duration-200',
        'hover:shadow-elevation-sm'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Candidate Name */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center">
            <User className="w-4 h-4 text-hublot-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900 truncate">
              {candidate?.first_name} {candidate?.last_name}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
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

// Export stage configuration for use in other components
export { PIPELINE_STAGES, type PipelineStage }
