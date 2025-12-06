import { Suspense } from 'react'
import { WorkflowHistoryPage } from '@/components/admin/workflows/WorkflowHistoryPage'

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded" />
      <div className="h-12 w-full bg-charcoal-100 animate-pulse rounded" />
      <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
    </div>
  )
}

export default async function WorkflowHistoryRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<LoadingState />}>
      <WorkflowHistoryPage workflowId={id} />
    </Suspense>
  )
}
