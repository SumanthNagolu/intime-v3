'use client'

import { ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { EntityContextProvider, EntityContentSkeleton, EntityContentError } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'

export default function CandidateDetailLayout({ children }: { children: ReactNode }) {
  const params = useParams()
  const candidateId = params.id as string

  // Fetch candidate data for layout context
  const { data: candidate, isLoading, error } = trpc.ats.candidates.getById.useQuery(
    { id: candidateId },
    { enabled: !!candidateId }
  )

  // Loading state
  if (isLoading) {
    return <EntityContentSkeleton />
  }

  // Error state
  if (error || !candidate) {
    return (
      <EntityContentError
        title="Candidate not found"
        message="The candidate you're looking for doesn't exist or you don't have access to it."
        backHref="/employee/recruiting/candidates"
        backLabel="Back to Candidates"
      />
    )
  }

  // Build subtitle with headline or visa status
  const subtitle = candidate.headline || (candidate.visa_status ? `${candidate.visa_status.replace(/_/g, ' ').toUpperCase()}` : undefined)

  return (
    <EntityContextProvider
      entityType="candidate"
      entityId={candidateId}
      entityName={`${candidate.first_name} ${candidate.last_name}`}
      entitySubtitle={subtitle}
      entityStatus={candidate.status}
    >
      {children}
    </EntityContextProvider>
  )
}
