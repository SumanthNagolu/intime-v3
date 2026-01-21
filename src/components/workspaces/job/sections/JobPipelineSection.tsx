'use client'

import * as React from 'react'
import { Users, Send, Calendar, Gift, CheckCircle, ArrowRight, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FullJob, SubmissionItem } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface JobPipelineSectionProps {
  job: FullJob
  onNavigate: (section: string) => void
}

const STAGE_CONFIG: Record<string, { label: string; icon: typeof Send; color: string; bg: string }> = {
  sourced: { label: 'Sourced', icon: Users, color: 'text-charcoal-600', bg: 'bg-charcoal-100' },
  screening: { label: 'Screening', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  submission_ready: { label: 'Ready', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50' },
  submitted_to_client: { label: 'Submitted', icon: Send, color: 'text-purple-600', bg: 'bg-purple-50' },
  client_review: { label: 'In Review', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  client_interview: { label: 'Interviewing', icon: Calendar, color: 'text-forest-600', bg: 'bg-forest-50' },
  offer_stage: { label: 'Offer', icon: Gift, color: 'text-gold-600', bg: 'bg-gold-50' },
  placed: { label: 'Placed', icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50' },
  rejected: { label: 'Rejected', icon: Users, color: 'text-error-600', bg: 'bg-error-50' },
  withdrawn: { label: 'Withdrawn', icon: Users, color: 'text-charcoal-400', bg: 'bg-charcoal-50' },
}

const PIPELINE_STAGES = ['sourced', 'screening', 'submitted_to_client', 'client_review', 'client_interview', 'offer_stage', 'placed']

/**
 * JobPipelineSection - Visual pipeline view of all candidates
 */
export function JobPipelineSection({ job, onNavigate }: JobPipelineSectionProps) {
  const submissions = job.sections?.submissions?.items || []
  const submissionsByStatus = job.sections?.submissions?.byStatus || {}

  // Group submissions by stage
  const submissionsByStage = React.useMemo(() => {
    const grouped: Record<string, SubmissionItem[]> = {}
    PIPELINE_STAGES.forEach(stage => {
      grouped[stage] = submissions.filter(s => s.status === stage)
    })
    // Also track combined "submitted" stage
    grouped['submitted_to_client'] = submissions.filter(s =>
      s.status === 'submitted_to_client' || s.status === 'submission_ready'
    )
    return grouped
  }, [submissions])

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Pipeline Overview</h3>
                <p className="text-xs text-charcoal-500">{submissions.length} total candidates</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('submissions')}
            >
              View All Submissions
            </Button>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="p-6">
          <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const config = STAGE_CONFIG[stage] || STAGE_CONFIG.sourced
              const Icon = config.icon
              const count = submissionsByStage[stage]?.length || 0

              return (
                <React.Fragment key={stage}>
                  <div className={cn(
                    "flex-1 min-w-[140px] rounded-lg p-4 border transition-all duration-200",
                    count > 0 ? "border-charcoal-200 bg-white hover:shadow-elevation-sm cursor-pointer" : "border-charcoal-100 bg-charcoal-50/50"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center", config.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <span className="text-xs font-medium text-charcoal-600 uppercase tracking-wider">
                        {config.label}
                      </span>
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      count > 0 ? "text-charcoal-900" : "text-charcoal-300"
                    )}>
                      {count}
                    </p>
                  </div>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <div className="flex items-center px-1">
                      <ArrowRight className="h-4 w-4 text-charcoal-300" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active Candidates by Stage */}
      <div className="grid grid-cols-2 gap-6">
        {PIPELINE_STAGES.slice(1, -1).map(stage => {
          const config = STAGE_CONFIG[stage] || STAGE_CONFIG.sourced
          const Icon = config.icon
          const stageSubmissions = submissionsByStage[stage] || []

          if (stageSubmissions.length === 0) return null

          return (
            <div key={stage} className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">{config.label}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {stageSubmissions.length}
                  </Badge>
                </div>
              </div>
              <div className="divide-y divide-charcoal-100">
                {stageSubmissions.slice(0, 5).map(submission => (
                  <Link
                    key={submission.id}
                    href={`/employee/recruiting/submissions/${submission.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-charcoal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {submission.candidate?.first_name} {submission.candidate?.last_name}
                      </p>
                      <p className="text-xs text-charcoal-500">
                        {formatDistanceToNow(new Date(submission.stage_changed_at || submission.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {submission.ai_match_score && (
                      <Badge variant="secondary" className="text-xs">
                        {submission.ai_match_score}% match
                      </Badge>
                    )}
                  </Link>
                ))}
                {stageSubmissions.length > 5 && (
                  <div className="px-5 py-2 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">
                      +{stageSubmissions.length - 5} more
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default JobPipelineSection
