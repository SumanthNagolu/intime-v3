'use client'

import * as React from 'react'
import { Send, User, Calendar, Gift, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FullJob, SubmissionItem } from '@/types/job'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface JobSubmissionsSectionProps {
  job: FullJob
  onRefresh?: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  sourced: { label: 'Sourced', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  screening: { label: 'Screening', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  submission_ready: { label: 'Ready', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  submitted_to_client: { label: 'Submitted', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  client_review: { label: 'In Review', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  client_interview: { label: 'Interviewing', bg: 'bg-forest-50', text: 'text-forest-700', dot: 'bg-forest-500' },
  offer_stage: { label: 'Offer', bg: 'bg-gold-50', text: 'text-gold-700', dot: 'bg-gold-500' },
  placed: { label: 'Placed', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  rejected: { label: 'Rejected', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  withdrawn: { label: 'Withdrawn', bg: 'bg-charcoal-100', text: 'text-charcoal-500', dot: 'bg-charcoal-400' },
}

/**
 * JobSubmissionsSection - List of all submissions for this job
 */
export function JobSubmissionsSection({ job, onRefresh }: JobSubmissionsSectionProps) {
  const submissions = job.sections?.submissions?.items || []
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)

  // Filter submissions
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter(s => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const candidateName = `${s.candidate?.first_name || ''} ${s.candidate?.last_name || ''}`.toLowerCase()
        if (!candidateName.includes(searchLower)) return false
      }
      // Status filter
      if (statusFilter && s.status !== statusFilter) return false
      return true
    })
  }, [submissions, search, statusFilter])

  // Get status counts
  const statusCounts = job.sections?.submissions?.byStatus || {}

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Submissions</h3>
                <p className="text-xs text-charcoal-500">{submissions.length} total submissions</p>
              </div>
            </div>
            <Link href={`/employee/recruiting/jobs/${job.id}/submissions/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Submission
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-charcoal-100 bg-charcoal-50/50">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs h-9"
            />
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === null ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                All ({submissions.length})
              </Button>
              {Object.entries(statusCounts).slice(0, 4).map(([status, count]) => {
                const config = STATUS_CONFIG[status] || STATUS_CONFIG.sourced
                return (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {config.label} ({count})
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Submissions list */}
        <div className="divide-y divide-charcoal-100">
          {filteredSubmissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Send className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">
                {search || statusFilter ? 'No submissions match your filters' : 'No submissions yet'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.sourced

              return (
                <Link
                  key={submission.id}
                  href={`/employee/recruiting/submissions/${submission.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-charcoal-500" />
                  </div>

                  {/* Candidate info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {submission.candidate?.first_name} {submission.candidate?.last_name}
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
                      Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      {submission.submittedBy && ` by ${submission.submittedBy.full_name}`}
                    </p>
                  </div>

                  {/* Match score */}
                  {submission.ai_match_score && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-charcoal-900">{submission.ai_match_score}%</p>
                      <p className="text-xs text-charcoal-500">Match</p>
                    </div>
                  )}

                  <ArrowRight className="h-4 w-4 text-charcoal-400 flex-shrink-0" />
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default JobSubmissionsSection
