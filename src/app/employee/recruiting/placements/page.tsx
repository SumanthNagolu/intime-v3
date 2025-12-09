'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { placementsListConfig, Placement } from '@/configs/entities/placements.config'

export default function PlacementsPage() {
  return <EntityListView<Placement> config={placementsListConfig} />
}
