'use client'

import { use, Suspense } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view'
import { EntityDetailViewSkeleton } from '@/components/pcf/shared'
import { hotlistsDetailConfig, type Hotlist } from '@/configs/entities/hotlists.config'

function HotlistDetailContent({ id }: { id: string }) {
  return <EntityDetailView<Hotlist> config={hotlistsDetailConfig} entityId={id} />
}

export default function TalentHotlistDetailRoute({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={<EntityDetailViewSkeleton />}>
      <HotlistDetailContent id={id} />
    </Suspense>
  )
}
