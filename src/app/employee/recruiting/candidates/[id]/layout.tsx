import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { CandidateWorkspaceProvider } from '@/components/workspaces/candidate/CandidateWorkspaceProvider'
import { getFullCandidate } from '@/server/actions/candidates'

export const dynamic = 'force-dynamic'

interface CandidateLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function CandidateDetailLayout({ children, params }: CandidateLayoutProps) {
  const { id: candidateId } = await params

  // ONE DATABASE CALL - fetches ALL workspace data
  const data = await getFullCandidate(candidateId)

  if (!data) {
    notFound()
  }

  // Build subtitle with headline or visa status
  const subtitle = data.candidate.headline ||
    (data.candidate.visaStatus ? `${data.candidate.visaStatus.replace(/_/g, ' ').toUpperCase()}` : undefined)

  return (
    <EntityContextProvider
      entityType="candidate"
      entityId={candidateId}
      entityName={data.candidate.fullName}
      entitySubtitle={subtitle}
      entityStatus={data.candidate.status}
      initialData={data}
    >
      <CandidateWorkspaceProvider initialData={data}>
        {children}
      </CandidateWorkspaceProvider>
    </EntityContextProvider>
  )
}
