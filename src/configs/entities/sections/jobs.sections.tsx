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
import type { FullJob, SubmissionItem } from '@/types/job'

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

// Extended Job type that includes sections from getFullJob
interface JobWithSections extends Job {
  sections?: {
    submissions?: {
      items: SubmissionItem[]
      total: number
    }
  }
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
 * Pipeline Section Adapter - Shows submission kanban/pipeline with view toggle
 * Uses ONE Database Call pattern: gets submissions from entity context
 */
export function JobPipelineSectionPCF({ entityId, entity }: PCFSectionProps) {
  const job = entity as JobWithSections | undefined

  // Get submissions from context data (ONE Database Call pattern)
  const submissions = job?.sections?.submissions?.items || []

  // Import the new JobPipelineSection component
  const { JobPipelineSection } = require('@/components/recruiting/jobs/pipeline')

  return (
    <JobPipelineSection
      jobId={entityId}
      submissions={submissions}
      onRefresh={() => {
        // Trigger context refresh via window event
        window.dispatchEvent(new CustomEvent('refreshJobData', { detail: { jobId: entityId } }))
      }}
    />
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
