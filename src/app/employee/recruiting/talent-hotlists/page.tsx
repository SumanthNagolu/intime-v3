'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { hotlistsListConfig, type Hotlist } from '@/configs/entities/hotlists.config'

function HotlistsListContent() {
  return <EntityListView<Hotlist> config={hotlistsListConfig} />
}

export default function TalentHotlistsPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <HotlistsListContent />
    </Suspense>
  )
}
