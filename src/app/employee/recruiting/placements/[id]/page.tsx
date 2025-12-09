'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { placementsDetailConfig, Placement } from '@/configs/entities/placements.config'

export default function PlacementDetailPage() {
  const params = useParams()
  const placementId = params.id as string

  return (
    <EntityDetailView<Placement>
      config={placementsDetailConfig}
      entityId={placementId}
    />
  )
}
