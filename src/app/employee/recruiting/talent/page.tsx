'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { candidatesListConfig, type Candidate } from '@/configs/entities/candidates.config'

function TalentListContent() {
  return <EntityListView<Candidate> config={candidatesListConfig} />
}

// Talent uses the candidates list config - talent is a subset of candidates
export default function TalentPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <TalentListContent />
    </Suspense>
  )
}
