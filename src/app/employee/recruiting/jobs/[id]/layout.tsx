'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityContextProvider, EntityContentSkeleton, EntityContentError } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

export default function JobDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const jobId = params.id as string

  // Fetch job data for layout context
  const { data: job, isLoading, error } = trpc.ats.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId }
  )

  // Loading state
  if (isLoading) {
    return <EntityContentSkeleton />
  }

  // Error state
  if (error || !job) {
    return (
      <EntityContentError
        title="Job not found"
        message="The job you're looking for doesn't exist or you don't have access to it."
        backHref="/employee/recruiting/jobs"
        backLabel="Back to Jobs"
      />
    )
  }

  // Get account name for subtitle
  const accountName = job.account
    ? (job.account as { name: string }).name
    : undefined

  return (
    <EntityContextProvider
      entityType="job"
      entityId={jobId}
      entityName={job.title}
      entitySubtitle={accountName}
      entityStatus={job.status}
    >
      {children}
    </EntityContextProvider>
  )
}
