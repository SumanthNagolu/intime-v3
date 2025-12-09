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

import { useRouter } from 'next/navigation'
import { Job } from '../jobs.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { SubmissionPipeline } from '@/components/recruiting/submissions'
import {
  JobOverviewSection,
  JobRequirementsSection,
  JobSubmissionsSection,
  JobInterviewsSection,
  JobOffersSection,
  JobActivitiesSection,
  JobDocumentsSection,
  JobNotesSection,
} from '@/components/recruiting/jobs/sections'

/**
 * Dispatch a dialog open event for the Job entity
 * The detail page listens for this and manages dialog state
 */
function dispatchJobDialog(dialogId: string, jobId: string) {
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
      job={job as any}
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
 * Pipeline Section Adapter - Shows submission kanban/pipeline
 */
export function JobPipelineSectionPCF({ entityId, entity }: PCFSectionProps) {
  const router = useRouter()
  const job = entity as Job | undefined
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId: entityId, limit: 100 })
  const submissions = submissionsQuery.data?.items || []

  if (!job) return null

  return (
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
            router.push(`/employee/recruiting/submissions/${submissionId}`)
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

