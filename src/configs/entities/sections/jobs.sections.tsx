'use client'

/**
 * PCF-Compatible Section Adapters for Jobs
 *
 * These wrapper components adapt the existing Job section components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Job } from '../jobs.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { SubmissionPipeline } from '@/components/recruiting/submissions'
import { InlinePanel, InlinePanelContent } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import { User, DollarSign, Calendar, MessageSquare, ArrowRight, ExternalLink } from 'lucide-react'
import {
  JobOverviewSection,
  JobRequirementsSection,
  JobLocationSection,
  JobSubmissionsSection,
  JobInterviewsSection,
  JobOffersSection,
  JobActivitiesSection,
  JobDocumentsSection,
  JobNotesSection,
  JobHiringTeamSection,
  JobClientDetailsSection,
  JobHistorySection,
} from '@/components/recruiting/jobs/sections'

/**
 * Dispatch a dialog open event for the Job entity
 * The detail page listens for this and manages dialog state
 */
function _dispatchJobDialog(dialogId: string, jobId: string) {
  window.dispatchEvent(
    new CustomEvent('openJobDialog', {
      detail: { dialogId, jobId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section Adapter
 */
export function JobOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const job = entity as Job | undefined

  if (!job) return null

  return (
    <JobOverviewSection
      job={job as unknown as React.ComponentProps<typeof JobOverviewSection>['job']}
      jobId={entityId}
    />
  )
}

/**
 * Requirements Section Adapter
 */
export function JobRequirementsSectionPCF({ entityId }: PCFSectionProps) {
  return <JobRequirementsSection jobId={entityId} />
}

/**
 * Pipeline Section Adapter - Shows submission kanban/pipeline with inline panel
 */
export function JobPipelineSectionPCF({ entityId, entity }: PCFSectionProps) {
  const router = useRouter()
  const job = entity as Job | undefined
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId: entityId, limit: 100 })
  const submissions = submissionsQuery.data?.items || []
  
  // State for inline panel
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
  
  // Find selected submission
  const selectedSubmission = selectedSubmissionId 
    ? submissions.find((s: any) => s.id === selectedSubmissionId)
    : null

  const handleClosePanel = () => {
    setSelectedSubmissionId(null)
  }

  const handleOpenFullPage = () => {
    if (selectedSubmissionId) {
      router.push(`/employee/recruiting/submissions/${selectedSubmissionId}`)
    }
  }

  if (!job) return null

  const statusColors: Record<string, string> = {
    sourced: 'bg-charcoal-100 text-charcoal-700',
    screening: 'bg-blue-100 text-blue-700',
    submission_ready: 'bg-indigo-100 text-indigo-700',
    submitted_to_client: 'bg-purple-100 text-purple-700',
    client_review: 'bg-purple-100 text-purple-700',
    client_interview: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    withdrawn: 'bg-charcoal-200 text-charcoal-600',
  }

  return (
    <div className="flex gap-4">
      {/* Pipeline Kanban */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        selectedSubmissionId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
      )}>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Candidate Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionPipeline
              submissions={submissions as any}
              job={{
                id: entityId,
                title: job.title,
                account: job.account as { id: string; name: string } | null,
                rate_min: (job as any).rate_min,
                rate_max: (job as any).rate_max,
              }}
              onCandidateClick={(submissionId) => {
                // Open inline panel instead of navigating away
                setSelectedSubmissionId(submissionId)
              }}
              onAddCandidate={() => {
                router.push(`/employee/recruiting/jobs/${entityId}/add-candidate`)
              }}
              onRefresh={() => {
                submissionsQuery.refetch()
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Inline Panel for Submission Details */}
      <InlinePanel 
        isOpen={!!selectedSubmission}
        onClose={handleClosePanel}
        title={selectedSubmission ? `${(selectedSubmission as any).candidate?.first_name || ''} ${(selectedSubmission as any).candidate?.last_name || ''}`.trim() || 'Submission Details' : 'Submission Details'}
        description={selectedSubmission ? (selectedSubmission as any).status?.replace(/_/g, ' ') : undefined}
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
              {/* Status Badge */}
              <div>
                <Badge className={cn('capitalize', statusColors[(selectedSubmission as any).status] || 'bg-charcoal-100')}>
                  {(selectedSubmission as any).status?.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Candidate Info */}
              <div>
                <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Candidate
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-hublot-700">
                      {(selectedSubmission as any).candidate?.first_name?.[0]}
                      {(selectedSubmission as any).candidate?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {(selectedSubmission as any).candidate?.first_name} {(selectedSubmission as any).candidate?.last_name}
                    </p>
                    {(selectedSubmission as any).candidate?.email && (
                      <p className="text-sm text-charcoal-500">{(selectedSubmission as any).candidate.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/employee/recruiting/candidates/${(selectedSubmission as any).candidate_id}`}
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
                      {(selectedSubmission as any).negotiated_bill_rate 
                        ? `$${(selectedSubmission as any).negotiated_bill_rate}/hr` 
                        : (selectedSubmission as any).submitted_rate
                          ? `$${(selectedSubmission as any).submitted_rate}/hr`
                          : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Pay Rate</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {(selectedSubmission as any).negotiated_pay_rate 
                        ? `$${(selectedSubmission as any).negotiated_pay_rate}/hr` 
                        : '—'}
                    </p>
                  </div>
                </div>
                {(selectedSubmission as any).ai_match_score && (
                  <div className="mt-3 p-3 bg-gold-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Match Score</p>
                    <p className="text-lg font-semibold text-gold-700">
                      {(selectedSubmission as any).ai_match_score}%
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
                      {formatDistanceToNow(new Date((selectedSubmission as any).created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {(selectedSubmission as any).submitted_to_client_at && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Submitted to Client</span>
                      <span className="text-charcoal-900">
                        {format(new Date((selectedSubmission as any).submitted_to_client_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {(selectedSubmission as any).submission_notes && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-500 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Submission Notes
                  </h4>
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap bg-charcoal-50 p-3 rounded-lg">
                    {(selectedSubmission as any).submission_notes}
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

/**
 * Submissions Section Adapter
 */
export function JobSubmissionsSectionPCF({ entityId }: PCFSectionProps) {
  return <JobSubmissionsSection jobId={entityId} />
}

/**
 * Interviews Section Adapter
 */
export function JobInterviewsSectionPCF({ entityId }: PCFSectionProps) {
  return <JobInterviewsSection jobId={entityId} />
}

/**
 * Offers Section Adapter
 */
export function JobOffersSectionPCF({ entityId }: PCFSectionProps) {
  return <JobOffersSection jobId={entityId} />
}

/**
 * Activities Section Adapter
 */
export function JobActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <JobActivitiesSection
      jobId={entityId}
    />
  )
}

/**
 * Documents Section Adapter
 */
export function JobDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <JobDocumentsSection
      jobId={entityId}
    />
  )
}

/**
 * Notes Section Adapter
 */
export function JobNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <JobNotesSection
      jobId={entityId}
    />
  )
}

/**
 * Addresses Section Adapter - Shows job location/addresses with inline editing
 */
export function JobAddressesSectionPCF({ entityId }: PCFSectionProps) {
  // Use the new inline JobLocationSection component
  return <JobLocationSection jobId={entityId} />
}

/**
 * Hiring Team Section Adapter - Shows recruiters, hiring manager, HR contacts
 */
export function JobHiringTeamSectionPCF({ entityId }: PCFSectionProps) {
  return <JobHiringTeamSection jobId={entityId} />
}

/**
 * Client Details Section Adapter - Shows client/vendor info, fee structure
 */
export function JobClientDetailsSectionPCF({ entityId }: PCFSectionProps) {
  return <JobClientDetailsSection jobId={entityId} />
}

/**
 * History Section Adapter - Shows audit trail of all changes
 */
export function JobHistorySectionPCF({ entityId }: PCFSectionProps) {
  return <JobHistorySection jobId={entityId} />
}




