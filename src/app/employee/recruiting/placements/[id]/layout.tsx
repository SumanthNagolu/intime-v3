import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

interface PlacementLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function PlacementDetailLayout({ children, params }: PlacementLayoutProps) {
  const { id: placementId } = await params
  const caller = await getServerCaller()

  let placement = null
  try {
    // ONE database call - fetch everything
    placement = await caller.ats.placements.getFullPlacement({ id: placementId })
  } catch (error) {
    console.error('[PlacementDetailLayout] Error:', error)
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
        redirect(`/login?redirect=/employee/recruiting/placements/${placementId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
    }
    notFound()
  }

  if (!placement) {
    notFound()
  }

  // Build display names
  const candidate = placement.candidate
  const job = placement.job
  const account = placement.account || placement.job?.account

  const candidateName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown Consultant'
  const jobTitle = job?.title || 'Unknown Job'
  const accountName = account?.name || 'Unknown Account'

  return (
    <EntityContextProvider
      entityType="placement"
      entityId={placementId}
      entityName={`${candidateName} @ ${jobTitle}`}
      entitySubtitle={accountName}
      entityStatus={placement.status}
      initialData={placement}
    >
      {children}
    </EntityContextProvider>
  )
}
