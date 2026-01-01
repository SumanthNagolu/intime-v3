'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { placementsDetailConfig, Placement } from '@/configs/entities/placements.config'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import type { FullPlacement } from '@/types/placement'

export default function PlacementDetailPage() {
  const params = useParams()
  const placementId = params.id as string

  // ONE DB CALL pattern: Get data from server-side context
  const entityData = useEntityData<FullPlacement>()
  const placement = entityData?.data

  return (
    <EntityDetailView<Placement>
      config={placementsDetailConfig}
      entityId={placementId}
      entity={placement as Placement | undefined}
    />
  )
}
