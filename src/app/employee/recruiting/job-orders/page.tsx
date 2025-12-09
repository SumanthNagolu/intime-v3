'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { jobOrdersListConfig, type JobOrder } from '@/configs/entities/job-orders.config'

function JobOrdersListContent() {
  return <EntityListView<JobOrder> config={jobOrdersListConfig} />
}

export default function JobOrdersPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <JobOrdersListContent />
    </Suspense>
  )
}
