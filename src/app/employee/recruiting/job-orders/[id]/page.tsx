'use client'

import { use } from 'react'
import { JobOrderDetailPage } from '@/components/recruiting/job-orders'

export default function JobOrderDetailRoute({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <JobOrderDetailPage jobOrderId={id} />
}
