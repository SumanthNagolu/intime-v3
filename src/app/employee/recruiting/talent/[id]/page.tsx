'use client'

import { use, Suspense } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view'
import { EntityDetailViewSkeleton } from '@/components/pcf/shared'
import { candidatesDetailConfig, type Candidate } from '@/configs/entities/candidates.config'

function TalentDetailContent({ id }: { id: string }) {
  return <EntityDetailView<Candidate> config={candidatesDetailConfig} entityId={id} />
}

// Talent is a Candidate with specific filters/context
export default function TalentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return (
    <Suspense fallback={<EntityDetailViewSkeleton />}>
      <TalentDetailContent id={resolvedParams.id} />
    </Suspense>
  )
}
