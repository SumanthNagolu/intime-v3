'use client'

import { use, Suspense } from 'react'
import { EntityDetailView } from '@/components/pcf/detail-view'
import { EntityDetailViewSkeleton } from '@/components/pcf/shared'
import { jobOrdersDetailConfig, type JobOrder } from '@/configs/entities/job-orders.config'

function JobOrderDetailContent({ id }: { id: string }) {
  return <EntityDetailView<JobOrder> config={jobOrdersDetailConfig} entityId={id} />
}

export default function JobOrderDetailRoute({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={<EntityDetailViewSkeleton />}>
      <JobOrderDetailContent id={id} />
    </Suspense>
  )
}
