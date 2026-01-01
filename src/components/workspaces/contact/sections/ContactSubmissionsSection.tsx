'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, ExternalLink } from 'lucide-react'
import type { ContactSubmission } from '@/types/workspace'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ContactSubmissionsSectionProps {
  submissions: ContactSubmission[]
  contactId: string
}

const STAGE_STYLES: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700',
  screening: 'bg-purple-100 text-purple-700',
  interview: 'bg-amber-100 text-amber-700',
  offer: 'bg-gold-100 text-gold-700',
  placed: 'bg-success-100 text-success-700',
  rejected: 'bg-error-100 text-error-700',
  withdrawn: 'bg-charcoal-100 text-charcoal-600',
}

/**
 * ContactSubmissionsSection - Shows submissions for candidates
 */
export function ContactSubmissionsSection({ submissions, contactId }: ContactSubmissionsSectionProps) {
  // Group submissions by role (candidate vs hiring manager)
  const candidateSubmissions = submissions.filter(s => s.role === 'candidate')
  const pocSubmissions = submissions.filter(s => s.role === 'hiring_manager')

  return (
    <div className="space-y-6">
      {/* As Candidate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submissions as Candidate ({candidateSubmissions.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </CardHeader>
        <CardContent>
          {candidateSubmissions.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No submissions yet</p>
              <p className="text-sm mt-1">Submit this candidate to a job to track progress.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {candidateSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* As Hiring Manager/POC */}
      {pocSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submissions as Hiring Manager ({pocSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-charcoal-100">
              {pocSubmissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} showCandidate />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SubmissionRow({
  submission,
  showCandidate = false,
}: {
  submission: ContactSubmission
  showCandidate?: boolean
}) {
  const stageStyle = STAGE_STYLES[submission.stage] || 'bg-charcoal-100 text-charcoal-600'

  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <div className="font-medium text-charcoal-900">{submission.jobTitle}</div>
        <div className="text-sm text-charcoal-500">
          {submission.accountName}
          {showCandidate && submission.candidateName && ` \u2022 ${submission.candidateName}`}
          {' \u2022 '}
          {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded capitalize ${stageStyle}`}>
          {submission.stage}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/employee/recruiting/submissions/${submission.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ContactSubmissionsSection
