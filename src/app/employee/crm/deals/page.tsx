'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { dealsListConfig, Deal } from '@/configs/entities/deals.config'

export default function DealsPage() {
  return <EntityListView<Deal> config={dealsListConfig} />
}
