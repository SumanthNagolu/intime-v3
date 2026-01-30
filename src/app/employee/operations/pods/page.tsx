'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { podsListConfig, Pod } from '@/configs/entities/pods.config'

export default function PodsPage() {
  return <EntityListView<Pod> config={podsListConfig} />
}
