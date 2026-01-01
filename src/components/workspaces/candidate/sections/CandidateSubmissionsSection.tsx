'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Plus,
  Eye,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateSubmission } from '@/types/candidate-workspace'
import { PIPELINE_STAGES, getStageFromStatus } from '@/lib/pipeline/stages'
import { formatDistanceToNow, format } from 'date-fns'

interface CandidateSubmissionsSectionProps {
  submissions: CandidateSubmission[]
  candidateId: string
  onSubmitToJob?: () => void
}

/**
 * CandidateSubmissionsSection - Displays all submissions for a candidate
 *
 * Shows pipeline progress for each submission with quick access to details.
 */
export function CandidateSubmissionsSection({
  submissions,
  candidateId,
  onSubmitToJob,
}: CandidateSubmissionsSectionProps) {
  // Group by status
  const activeSubmissions = submissions.filter(
    (s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)
  )
  const placedSubmissions = submissions.filter((s) => s.status === 'placed')
  const closedSubmissions = submissions.filter(
    (s) => ['rejected', 'withdrawn'].includes(s.status)
  )

  const handleSubmitToJob = () => {
    if (onSubmitToJob) {
      onSubmitToJob()
    } else {
      window.dispatchEvent(
        new CustomEvent('openCandidateDialog', {
          detail: { dialogId: 'submitToJob', candidateId },
        })
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Submissions</h2>
          <p className="text-sm text-charcoal-500">
            {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
            {activeSubmissions.length > 0 && ` · ${activeSubmissions.length} active`}
          </p>
        </div>
        <Button onClick={handleSubmitToJob}>
          <Plus className="h-4 w-4 mr-2" />
          Submit to Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          label="Active"
          value={activeSubmissions.length}
          icon={<Send className="h-5 w-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          label="Placed"
          value={placedSubmissions.length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-success-100 text-success-600"
        />
        <StatsCard
          label="Closed"
          value={closedSubmissions.length}
          icon={<XCircle className="h-5 w-5" />}
          color="bg-charcoal-100 text-charcoal-600"
        />
      </div>

      {/* Active Submissions */}
      {activeSubmissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Active Submissions ({activeSubmissions.length})
          </h3>
          <div className="space-y-3">
            {activeSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        </div>
      )}

      {/* Placed Submissions */}
      {placedSubmissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Placed ({placedSubmissions.length})
          </h3>
          <div className="space-y-3">
            {placedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Submissions */}
      {closedSubmissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Closed ({closedSubmissions.length})
          </h3>
          <div className="space-y-3">
            {closedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} variant="muted" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {submissions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Send className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-sm text-charcoal-500 mb-4 max-w-md mx-auto">
              Submit this candidate to open jobs to start tracking their progress in the pipeline.
            </p>
            <Button onClick={handleSubmitToJob}>
              <Plus className="h-4 w-4 mr-2" />
              Submit to First Job
            </Button>
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
  value: number
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

// Submission Card
function SubmissionCard({
  submission,
  variant = 'default',
}: {
  submission: CandidateSubmission
  variant?: 'default' | 'muted'
}) {
  const stage = PIPELINE_STAGES.find((s) => s.id === getStageFromStatus(submission.status))
  const isMuted = variant === 'muted'

  return (
    <Card className={cn(isMuted && 'opacity-75')}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Job and Account Info */}
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              stage?.bgColor || 'bg-charcoal-100'
            )}>
              <Briefcase className={cn(
                'h-5 w-5',
                stage?.textColor || 'text-charcoal-600'
              )} />
            </div>
            <div>
              <h4 className="font-medium text-charcoal-900">
                {submission.job?.title || 'Unknown Job'}
              </h4>
              <div className="flex items-center gap-3 text-sm text-charcoal-500 mt-1">
                {submission.account && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {submission.account.name}
                  </span>
                )}
                {submission.submittedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                  </span>
                )}
              </div>

              {/* Pipeline Stage Progress */}
              <div className="flex items-center gap-1.5 mt-3">
                {PIPELINE_STAGES.slice(0, 6).map((s, idx) => {
                  const currentStageIdx = PIPELINE_STAGES.findIndex(
                    (ps) => ps.id === getStageFromStatus(submission.status)
                  )
                  const isCompleted = idx < currentStageIdx
                  const isCurrent = s.id === getStageFromStatus(submission.status)

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        isCompleted ? 'bg-success-500' :
                        isCurrent ? s.color.replace('100', '500') :
                        'bg-charcoal-200'
                      )}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Stage Badge */}
            {stage && (
              <Badge className={cn(
                'capitalize whitespace-nowrap',
                stage.bgColor,
                stage.textColor
              )}>
                {stage.label}
              </Badge>
            )}

            {/* Indicators */}
            <div className="flex items-center gap-2">
              {submission.interviewCount > 0 && (
                <div className="p-1.5 rounded-lg bg-purple-100" title={`${submission.interviewCount} interview${submission.interviewCount !== 1 ? 's' : ''}`}>
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              )}
              {submission.feedbackCount > 0 && (
                <div className="p-1.5 rounded-lg bg-blue-100" title={`${submission.feedbackCount} feedback`}>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
              )}
            </div>

            {/* View Link */}
            <Link
              href={`/employee/recruiting/submissions/${submission.id}`}
              className="flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700"
            >
              View <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CandidateSubmissionsSection
