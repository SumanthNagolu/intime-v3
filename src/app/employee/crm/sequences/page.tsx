'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { sequencesListConfig, type Sequence } from '@/configs/entities/sequences.config'

function SequencesListContent() {
  return <EntityListView<Sequence> config={sequencesListConfig} />
}

export default function SequencesPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <SequencesListContent />
    </Suspense>
  )
}
