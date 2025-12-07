'use client'

import { useParams } from 'next/navigation'
import { PlacementDetailPage } from '@/components/recruiting/placements'

export default function PlacementDetailRoute() {
  const params = useParams()
  const placementId = params.id as string

  return <PlacementDetailPage placementId={placementId} />
}
