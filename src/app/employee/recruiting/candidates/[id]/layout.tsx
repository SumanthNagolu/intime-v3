import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'

export const dynamic = 'force-dynamic'

interface CandidateLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function CandidateDetailLayout({ children, params }: CandidateLayoutProps) {
  const { id: candidateId } = await params
  const caller = await getServerCaller()

  const candidate = await caller.ats.candidates.getById({ id: candidateId }).catch(() => null)

  if (!candidate) {
    notFound()
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
      initialData={candidate}
    >
      {children}
    </EntityContextProvider>
  )
}
