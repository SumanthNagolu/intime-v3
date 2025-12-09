'use client'

/**
 * PCF-Compatible Section Adapters for Submissions
 */

import { Submission } from '../submissions.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { formatDistanceToNow, format } from 'date-fns'
import { User, Briefcase, Building2, DollarSign, Calendar, FileText, MessageSquare, Activity, Star } from 'lucide-react'
import Link from 'next/link'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 */
export function SubmissionOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const submission = entity as Submission | undefined

  if (!submission) return null

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Candidate Info Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.candidate ? (
              <div className="flex items-center justify-between">
                <div>
                  <Link 
                    href={`/employee/recruiting/candidates/${submission.candidate_id}`}
                    className="text-lg font-medium text-hublot-900 hover:underline"
                  >
                    {submission.candidate.first_name} {submission.candidate.last_name}
                  </Link>
                  {submission.candidate.email && (
                    <p className="text-sm text-charcoal-500">{submission.candidate.email}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/recruiting/candidates/${submission.candidate_id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-charcoal-500">No candidate information available</p>
            )}
          </CardContent>
        </Card>

        {/* Job Info Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.job ? (
              <div className="flex items-center justify-between">
                <div>
                  <Link 
                    href={`/employee/recruiting/jobs/${submission.job_id}`}
                    className="text-lg font-medium text-hublot-900 hover:underline"
                  >
                    {submission.job.title}
                  </Link>
                  {submission.job.account && (
                    <p className="text-sm text-charcoal-500 flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {submission.job.account.name}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/recruiting/jobs/${submission.job_id}`}>
                    View Job
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-charcoal-500">No job information available</p>
            )}
          </CardContent>
        </Card>

        {/* Client Feedback */}
        {submission.client_feedback && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Client Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{submission.client_feedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Internal Notes */}
        {submission.internal_notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{submission.internal_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Details */}
      <div className="space-y-6">
        {/* Rates Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Rate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Bill Rate</span>
              <span className="font-medium">{submission.rate ? `$${submission.rate}/hr` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Pay Rate</span>
              <span className="font-medium">{submission.pay_rate ? `$${submission.pay_rate}/hr` : '—'}</span>
            </div>
            {submission.match_score !== null && submission.match_score !== undefined && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Match Score</span>
                <Badge variant="outline">{submission.match_score}%</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Submitted</span>
              <span className="font-medium">
                {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
              </span>
            </div>
            {submission.client_viewed_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Client Viewed</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(submission.client_viewed_at), { addSuffix: true })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Submitted By */}
        {submission.submitted_by_user && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Submitted By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{submission.submitted_by_user.full_name}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

/**
 * Activities Section Adapter
 */
export function SubmissionActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

