import { Suspense } from 'react'
import { getServerCaller } from '@/server/trpc/server-caller'
import { DealsPipelineClient, DealsPipelineSkeleton } from '@/components/crm/deals'

export const dynamic = 'force-dynamic'

async function DealsPipelineServer() {
  const caller = await getServerCaller()

  const pipelineData = await caller.crm.deals.pipeline({
    showAll: false,
  })

  return (
    <DealsPipelineClient
      initialPipeline={pipelineData.pipeline}
      initialSummary={pipelineData.summary}
    />
  )
}

export default async function DealsPage() {
  return (
    <Suspense fallback={<DealsPipelineSkeleton />}>
      <DealsPipelineServer />
    </Suspense>
  )
}
