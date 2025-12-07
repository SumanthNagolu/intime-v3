import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { PlacementsListClient, PlacementsListSkeleton } from '@/components/recruiting/placements'

export const dynamic = 'force-dynamic'

async function PlacementsListServer() {
  const caller = await getServerCaller()

  const placementsData = await caller.ats.placements.list({
    limit: 50,
  })

  return (
    <PlacementsListClient
      initialPlacements={placementsData.items}
    />
  )
}

export default async function PlacementsPage() {
  return (
    <Suspense fallback={<PlacementsListSkeleton />}>
      <PlacementsListServer />
    </Suspense>
  )
}
