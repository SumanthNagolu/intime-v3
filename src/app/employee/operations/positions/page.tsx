'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { positionsListConfig, Position } from '@/configs/entities/positions.config'

export default function PositionsPage() {
  return <EntityListView<Position> config={positionsListConfig} />
}
