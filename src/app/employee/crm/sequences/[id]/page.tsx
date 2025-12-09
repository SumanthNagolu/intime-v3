'use client'

import { use, Suspense } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view'
import { EntityDetailViewSkeleton } from '@/components/pcf/shared'
import { sequencesDetailConfig, type Sequence } from '@/configs/entities/sequences.config'

function SequenceDetailContent({ id }: { id: string }) {
  return <EntityDetailView<Sequence> config={sequencesDetailConfig} entityId={id} />
}

export default function SequenceDetailPageRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={<EntityDetailViewSkeleton />}>
      <SequenceDetailContent id={id} />
    </Suspense>
  )
}
