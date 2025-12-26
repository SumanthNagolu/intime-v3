'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Send, Users, Loader2, Plus, Clock, Star, X, ExternalLink, User, Calendar, DollarSign, ArrowRight, MessageSquare } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { InlinePanel, InlinePanelContent } from '@/components/ui/inline-panel'

interface JobSubmissionsSectionProps {
  jobId: string
}

const statusColors: Record<string, string> = {
  // Pipeline statuses
  sourced: 'bg-charcoal-100 text-charcoal-700',
  screening: 'bg-blue-100 text-blue-700',
  submission_ready: 'bg-indigo-100 text-indigo-700',
  submitted_to_client: 'bg-purple-100 text-purple-700',
  client_review: 'bg-purple-100 text-purple-700',
  client_interview: 'bg-amber-100 text-amber-700',
  offer_stage: 'bg-orange-100 text-orange-700',
  placed: 'bg-green-200 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-charcoal-200 text-charcoal-600',
  // Legacy statuses
  draft: 'bg-charcoal-100 text-charcoal-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  interview_scheduled: 'bg-indigo-100 text-indigo-700',
  interviewing: 'bg-cyan-100 text-cyan-700',
  offer_pending: 'bg-orange-100 text-orange-700',
  offer_extended: 'bg-green-100 text-green-700',
}

// Statuses that represent client-facing submissions (post-submission to client)
const CLIENT_SUBMISSION_STATUSES = [
  'submitted_to_client',
  'client_review',
  'client_interview',
]

export function JobSubmissionsSection({ jobId }: JobSubmissionsSectionProps) {
  const router = useRouter()
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)

  // Query submissions for this job
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId, limit: 100 })
  const allSubmissions = submissionsQuery.data?.items || []
  
  // Filter to only show client-facing submissions (not sourced/screening which are in Pipeline)
  const submissions = allSubmissions.filter(s => 
    CLIENT_SUBMISSION_STATUSES.includes(s.status) || 
    ['rejected', 'withdrawn'].includes(s.status)
  )

  // Get selected submission details
  const selectedSubmission = selectedSubmissionId 
    ? submissions.find(s => s.id === selectedSubmissionId) 
    : null

  const handleSubmissionClick = (submissionId: string) => {
    // Open inline panel instead of navigating away
    setSelectedSubmissionId(submissionId)
  }

  const handleClosePanel = () => {
    setSelectedSubmissionId(null)
  }

  const handleOpenFullPage = () => {
    if (selectedSubmissionId) {
      router.push(`/employee/recruiting/submissions/${selectedSubmissionId}`)
    }
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
    <div className="flex gap-4">
      {/* Submissions List */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        selectedSubmissionId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
      )}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Client Submissions
              </CardTitle>
              <CardDescription>
                {submissions.length} submitted to client, {activeSubmissions.length} under review
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
                <p className="text-charcoal-500 font-medium">No candidates submitted to client yet</p>
                <p className="text-charcoal-400 text-sm mt-1">
                  Use the Pipeline tab to source and screen candidates, then submit them to the client
                </p>
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
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSubmissionClick(submission.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSubmissionClick(submission.id)
                            }
                          }}
                          className={cn(
                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                            selectedSubmissionId === submission.id 
                              ? "border-gold-500 bg-gold-50" 
                              : "hover:border-hublot-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
                          )}
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
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSubmissionClick(submission.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSubmissionClick(submission.id)
                            }
                          }}
                          className={cn(
                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors opacity-70",
                            selectedSubmissionId === submission.id 
                              ? "border-gold-500 bg-gold-50 opacity-100" 
                              : "hover:border-charcoal-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
                          )}
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
      </div>

      {/* Inline Panel for Submission Details */}
      <InlinePanel 
        isOpen={!!selectedSubmission}
        onClose={handleClosePanel}
        title={selectedSubmission ? `${selectedSubmission.candidate?.first_name || ''} ${selectedSubmission.candidate?.last_name || ''}`.trim() || 'Submission Details' : 'Submission Details'}
        description={selectedSubmission?.status.replace(/_/g, ' ')}
        headerActions={
          <Button variant="outline" size="sm" onClick={handleOpenFullPage}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Page
          </Button>
        }
        width="lg"
      >
        {selectedSubmission && (
          <InlinePanelContent>
            <div className="space-y-6">
              {/* Candidate Info */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Candidate
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-hublot-700">
                      {selectedSubmission.candidate?.first_name?.[0]}
                      {selectedSubmission.candidate?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {selectedSubmission.candidate?.first_name} {selectedSubmission.candidate?.last_name}
                    </p>
                    {selectedSubmission.candidate?.email && (
                      <p className="text-sm text-charcoal-500">{selectedSubmission.candidate.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/employee/recruiting/candidates/${selectedSubmission.candidate_id}`}
                    className="text-sm text-gold-600 hover:text-gold-700 font-medium inline-flex items-center gap-1"
                  >
                    View Full Profile
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Rates */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rate Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Bill Rate</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {selectedSubmission.negotiated_bill_rate 
                        ? `$${selectedSubmission.negotiated_bill_rate}/hr` 
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Pay Rate</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {selectedSubmission.negotiated_pay_rate 
                        ? `$${selectedSubmission.negotiated_pay_rate}/hr` 
                        : '—'}
                    </p>
                  </div>
                </div>
                {selectedSubmission.ai_match_score && (
                  <div className="mt-3 p-3 bg-gold-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Match Score</p>
                    <p className="text-lg font-semibold text-gold-700">
                      {selectedSubmission.ai_match_score}%
                    </p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Added to Pipeline</span>
                    <span className="text-charcoal-900">
                      {formatDistanceToNow(new Date(selectedSubmission.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {selectedSubmission.submitted_to_client_at && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Submitted to Client</span>
                      <span className="text-charcoal-900">
                        {format(new Date(selectedSubmission.submitted_to_client_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedSubmission.submission_notes && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Submission Notes
                  </h4>
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap bg-charcoal-50 p-3 rounded-lg">
                    {selectedSubmission.submission_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-charcoal-100 space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleOpenFullPage}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Full Submission Details
                </Button>
              </div>
            </div>
          </InlinePanelContent>
        )}
      </InlinePanel>
    </div>
  )
}
