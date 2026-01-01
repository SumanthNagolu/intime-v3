import { ReactNode } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { EntityContextProvider } from '@/components/layouts/EntityContextProvider'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

interface OfferLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function OfferDetailLayout({ children, params }: OfferLayoutProps) {
  const { id: offerId } = await params
  const caller = await getServerCaller()

  let offer = null
  try {
    // ONE database call - fetch everything
    offer = await caller.ats.offers.getFullOffer({ id: offerId })
  } catch (error) {
    console.error('[OfferDetailLayout] Error:', error)
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
        redirect(`/login?redirect=/employee/recruiting/offers/${offerId}`)
      }
      if (error.code === 'NOT_FOUND') {
        notFound()
      }
    }
    notFound()
  }

  if (!offer) {
    notFound()
  }

  // Build display names
  const candidate = offer.submission?.candidate
  const job = offer.submission?.job || offer.job
  const account = offer.account

  const candidateName = candidate
    ? `${candidate.first_name} ${candidate.last_name}`.trim()
    : 'Unknown Candidate'
  const jobTitle = job?.title || 'Unknown Job'

  return (
    <EntityContextProvider
      entityType="offer"
      entityId={offerId}
      entityName={`${candidateName} - ${jobTitle}`}
      entitySubtitle={account?.name || 'Unknown Account'}
      entityStatus={offer.status as string}
      initialData={offer}
    >
      {children}
    </EntityContextProvider>
  )
}
