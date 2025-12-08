'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Send, Users, Loader2, Plus, Clock, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface JobSubmissionsSectionProps {
  jobId: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  client_review: 'bg-purple-100 text-purple-700',
  interview_scheduled: 'bg-indigo-100 text-indigo-700',
  interviewing: 'bg-cyan-100 text-cyan-700',
  offer_pending: 'bg-orange-100 text-orange-700',
  offer_extended: 'bg-green-100 text-green-700',
  placed: 'bg-green-200 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-charcoal-200 text-charcoal-600',
}

export function JobSubmissionsSection({ jobId }: JobSubmissionsSectionProps) {
  const router = useRouter()
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)

  // Query submissions for this job
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId, limit: 100 })
  const submissions = submissionsQuery.data?.items || []

  const handleSubmissionClick = (submissionId: string) => {
    router.push(`/employee/recruiting/submissions/${submissionId}`)
  }

  const handleAddCandidate = () => {
    router.push(`/employee/recruiting/jobs/${jobId}/add-candidate`)
  }

  // Group submissions by status
  const activeSubmissions = submissions.filter(
    (s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)
  )
  const completedSubmissions = submissions.filter(
    (s) => ['placed', 'rejected', 'withdrawn'].includes(s.status)
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Submissions
          </CardTitle>
          <CardDescription>
            {submissions.length} total submissions, {activeSubmissions.length} active
          </CardDescription>
        </div>
        <Button onClick={handleAddCandidate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </CardHeader>
      <CardContent>
        {submissionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No submissions yet</p>
            <Button className="mt-4" onClick={handleAddCandidate}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Candidate
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Submissions */}
            {activeSubmissions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3">Active ({activeSubmissions.length})</h4>
                <div className="space-y-3">
                  {activeSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => handleSubmissionClick(submission.id)}
                      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-hublot-300 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-hublot-700">
                          {submission.candidate?.first_name?.[0]}
                          {submission.candidate?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900 truncate">
                            {submission.candidate?.first_name} {submission.candidate?.last_name}
                          </p>
                          {submission.ai_match_score && submission.ai_match_score >= 80 && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn('capitalize', statusColors[submission.status] || 'bg-charcoal-100')}>
                            {submission.status.replace(/_/g, ' ')}
                          </Badge>
                          {submission.ai_match_score && (
                            <span className="text-xs text-charcoal-500">
                              {submission.ai_match_score}% match
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {submission.submitted_rate && (
                          <p className="text-sm font-medium">${submission.submitted_rate}/hr</p>
                        )}
                        <p className="text-xs text-charcoal-500">
                          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Submissions */}
            {completedSubmissions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3">Completed ({completedSubmissions.length})</h4>
                <div className="space-y-3">
                  {completedSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => handleSubmissionClick(submission.id)}
                      className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-charcoal-300 transition-colors opacity-70"
                    >
                      <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-charcoal-600">
                          {submission.candidate?.first_name?.[0]}
                          {submission.candidate?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-700 truncate">
                          {submission.candidate?.first_name} {submission.candidate?.last_name}
                        </p>
                        <Badge className={cn('capitalize mt-1', statusColors[submission.status] || 'bg-charcoal-100')}>
                          {submission.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-charcoal-500">
                        {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
